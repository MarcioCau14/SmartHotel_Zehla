/**
 * ZEHLA EMAIL SERVICE
 * Conexão oficial com a API do Listmonk.
 */

const LISTMONK_URL = process.env.LISTMONK_URL || 'http://localhost:9000/api';
const LISTMONK_USERNAME = process.env.LISTMONK_USERNAME || 'listmonk';
const LISTMONK_PASSWORD = process.env.LISTMONK_PASSWORD || 'listmonk_pass';

const authHeader = `Basic ${Buffer.from(`${LISTMONK_USERNAME}:${LISTMONK_PASSWORD}`).toString('base64')}`;

export interface EmailSubscriber {
  email: string;
  name: string;
  status: 'enabled' | 'disabled';
  lists: number[];
  attribs: Record<string, any>;
}

export class EmailService {
  /**
   * Sincronização REAL de lead com o Listmonk via API
   */
  static async syncLead(lead: unknown) {
    try {
      const payload: EmailSubscriber = {
        email: lead.email,
        name: lead.name,
        status: 'enabled',
        lists: [1], // Lista mestre de Leads
        attribs: {
          city: lead.city,
          score: lead.score,
          rooms: lead.roomsCount,
          pain: lead.painPoints,
          tenant: lead.propertyId
        }
      };

      const response = await fetch(`${LISTMONK_URL}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Listmonk API Error: ${JSON.stringify(error)}`);
      }

      
      return await response.json();
    } catch (err: unknown) {
      console.error(`❌ [EMAIL-SERVICE] Falha ao sincronizar lead: ${err.message}`);
      throw err;
    }
  }

  /**
   * Dispara transacional via API
   */
  static async sendTransactional(to: string, templateId: number, data: unknown) {
    try {
      const response = await fetch(`${LISTMONK_URL}/tx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          subscriber_email: to,
          template_id: templateId,
          data: data,
        }),
      });

      return await response.json();
    } catch (err: unknown) {
      console.error(`❌ [EMAIL-SERVICE] Falha no transacional: ${err.message}`);
    }
  }

  /**
   * Dispara um Swipe específico via Listmonk
   */
  static async sendSwipeEmail(lead: unknown, swipe: unknown) {
    try {
      // Sincroniza o lead primeiro para garantir que os atributos estejam atualizados
      await this.syncLead(lead);

      // Dispara o transacional
      const templateId = swipe.listmonkTemplateId || 1; // Fallback
      
      return await this.sendTransactional(lead.email, templateId, {
        pousada: lead.property || lead.name,
        swipe_content: swipe.content,
        tier: swipe.tier,
        justificativa: lead.aiJustification || ""
      });
    } catch (err: unknown) {
      console.error(`❌ [EMAIL-SERVICE] Falha ao enviar Swipe Email: ${err.message}`);
    }
  }
}
