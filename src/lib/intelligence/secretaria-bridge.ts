import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface SecretariaLead {
  name: string;
  title: string;
  match_explanation?: string;
  personalized_message?: string;
  metadata?: any;
  validationScore: number;
  isValidated: boolean;
}

export class SecretariaBridge {
  private static backendPath = path.join(process.cwd(), 'backend');
  private static scriptPath = path.join(this.backendPath, 'main.py');

  static async searchLeads(query: string, limit: number = 5): Promise<SecretariaLead[]> {
    try {
      console.log(`🔍 [SECRETARIA] Verificando cache local para: "${query}"...`);
      const env = { ...process.env, PYTHONPATH: `${this.backendPath}:${process.env.PYTHONPATH || ''}` };
      const command = `python3 ${this.scriptPath} "${query}" --target-count ${limit}`;
      const { stdout, stderr } = await execAsync(command, { env });
      if (stderr && !stdout) throw new Error(`Secretaria-IA Error: ${stderr}`);
      const rawLeads = this.parseOutput(stdout);
      return rawLeads.map(lead => {
        const explanationLength = lead.match_explanation?.length || 0;
        const score = explanationLength > 50 ? 95 : 40;
        return { ...lead, validationScore: score, isValidated: score > 70 };
      });
    } catch (error) {
      console.error('[SECRETARIA-BRIDGE] Search failed:', error);
      throw error;
    }
  }

  static async qualifyLead(leadId: string): Promise<any> {
    try {
      console.log(`🧠 [SECRETARIA-IA] Iniciando Raio-X para lead: ${leadId}`);
      const searchQuery = `lead_${leadId}`;
      const candidates = await this.searchLeads(searchQuery, 1);
      if (candidates.length > 0) {
        const topCandidate = candidates[0];
        return { leadId, qualification: topCandidate.match_explanation || 'Perfil validado via busca profunda.', validationScore: topCandidate.validationScore, status: topCandidate.validationScore > 70 ? 'QUALIFIED' : 'REVIEW_NEEDED' };
      }
      return { leadId, qualification: 'Nenhum sinal social claro encontrado.', validationScore: 30, status: 'UNQUALIFIED' };
    } catch (error) {
      console.error(`[SECRETARIA-IA] Erro na qualificação do lead ${leadId}:`, error);
      throw error;
    }
  }

  private static parseOutput(output: string): SecretariaLead[] {
    const leads: SecretariaLead[] = [];
    const lines = output.split('\n');
    let currentLead: Partial<SecretariaLead> | null = null;
    for (const line of lines) {
      const match = line.match(/^\[\d+\]\s+(.+)\s+\((.+)\)$/);
      if (match) {
        if (currentLead) leads.push(currentLead as SecretariaLead);
        currentLead = { name: match[1], title: match[2] };
      } else if (currentLead && line.includes('Match Explanation:')) {
        currentLead.match_explanation = line.split('Match Explanation:')[1].trim();
      } else if (currentLead && line.includes('Outreach Preview:')) {
        currentLead.personalized_message = '';
      }
    }
    if (currentLead) leads.push(currentLead as SecretariaLead);
    return leads;
  }
}
