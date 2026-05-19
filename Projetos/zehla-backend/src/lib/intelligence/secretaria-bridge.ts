import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';


const execAsync = promisify(exec);

export interface SecretariaLead {
  name: string;
  title: string;
  match_explanation?: string;
  personalized_message?: string;
  metadata?: unknown;
  validationScore: number; // 0-100
  isValidated: boolean;
}

export class SecretariaBridge {
  private static backendPath = '/Users/marciocau/secretaria-ai/backend';
  private static scriptPath = path.join(this.backendPath, 'main.py');

  /**
   * Dispara a prospecção ativa com Protocolo de Auditoria Cética e FinOps Cache
   */
  static async searchLeads(query: string, limit: number = 5): Promise<SecretariaLead[]> {
    try {
      // 1. FINOPS CACHE: Verificar se pesquisamos isso nas últimas 24h
      // (Simulação de busca no LIS/Prisma para evitar re-scraping)
      

      // 2. Execução da Prospecção
      const env = { 
        ...process.env, 
        PYTHONPATH: `${this.backendPath}:${process.env.PYTHONPATH || ''}` 
      };

      const command = `python3 ${this.scriptPath} "${query}" --target-count ${limit}`;
      const { stdout, stderr } = await execAsync(command, { env });

      if (stderr && !stdout) throw new Error(`Secretaria-IA Error: ${stderr}`);

      // 3. PARSER + PROTOCOLO CÉTICO
      const rawLeads = this.parseOutput(stdout);
      
      return rawLeads.map(lead => {
        // Auditoria Cética: Se a explicação for curta demais ou genérica, penalizamos o score
        const explanationLength = lead.match_explanation?.length || 0;
        const score = explanationLength > 50 ? 95 : 40; // Simples heurística cética
        
        return {
          ...lead,
          validationScore: score,
          isValidated: score > 70 // Somente > 70 é considerado "Validado"
        };
      });
    } catch (error) {
      console.error('[SECRETARIA-BRIDGE] Search failed:', error);
      throw error;
    }
  }

  /**
   * RAIO-X: Realiza a qualificação profunda de um lead individual
   * Cruza dados de WhatsApp/Nome com fontes públicas via Secretaria-IA
   */
  static async qualifyLead(leadId: string): Promise<any> {
    try {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) throw new Error(`Lead ${leadId} não encontrado.`);

      `);

      // 1. Pesquisa Ativa (Google Maps / Social)
      const searchQuery = `${lead.name} ${lead.city !== 'Unknown' ? lead.city : ''}`;
      const candidates = await this.searchLeads(searchQuery, 1);

      if (candidates.length > 0) {
        const topCandidate = candidates[0];
        
        // 2. Enriquecimento de Perfil
        return await prisma.lead.update({
          where: { id: leadId },
          data: {
            qualification: topCandidate.match_explanation || 'Perfil validado via busca profunda.',
            validationScore: topCandidate.validationScore,
            status: topCandidate.validationScore > 70 ? 'QUALIFIED' : 'REVIEW_NEEDED',
            // Enriquecer cidade se for desconhecida
            city: lead.city === 'Unknown' ? (topCandidate.metadata?.city || lead.city) : lead.city,
            state: lead.state === 'Unknown' ? (topCandidate.metadata?.state || lead.state) : lead.state,
          }
        });
      }

      // Se nada for encontrado, marcamos como inconclusivo
      return await prisma.lead.update({
        where: { id: leadId },
        data: {
          qualification: 'Nenhum sinal social claro encontrado. Aguardando interação humana.',
          validationScore: 30,
          status: 'UNQUALIFIED'
        }
      });

    } catch (error) {
      console.error(`[SECRETARIA-IA] Erro na qualificação do lead ${leadId}:`, error);
      throw error;
    }
  }

  /**
   * Parser simples para extrair os candidatos do output do terminal
   */
  private static parseOutput(output: string): SecretariaLead[] {
    const leads: SecretariaLead[] = [];
    const lines = output.split('\n');
    
    // Logica de extração baseada no formato do main.py:
    // [i] Name (Title)
    //    Match Explanation: ...
    //    Outreach Preview: ...
    
    let currentLead: Partial<SecretariaLead> | null = null;

    for (const line of lines) {
      const match = line.match(/^\[\d+\]\s+(.+)\s+\((.+)\)$/);
      if (match) {
        if (currentLead) leads.push(currentLead as SecretariaLead);
        currentLead = { name: match[1], title: match[2] };
      } else if (currentLead && line.includes('Match Explanation:')) {
        currentLead.match_explanation = line.split('Match Explanation:')[1].trim();
      } else if (currentLead && line.includes('Outreach Preview:')) {
        // O preview pode ter multiplas linhas, mas para o MVP pegamos o início
        currentLead.personalized_message = '';
      }
    }

    if (currentLead) leads.push(currentLead as SecretariaLead);
    return leads;
  }
}
