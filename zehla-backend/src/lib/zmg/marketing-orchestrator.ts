/**
 * ZMG Marketing Orchestrator
 * Processa planilhas de leads e dispara campanhas baseadas em tendências (Camada 0)
 */

import { ZMG } from './core';
const XLSX = require('xlsx');
import { prisma } from '@/lib/prisma';

export class ZMGMarketingOrchestrator {
  static async runCampaignFromExcel(filePath: string, tier: string) {
    console.log(`🚀 [ZMG:MKT] Iniciando campanha para tier ${tier} a partir de ${filePath}`);
    
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const leads = XLSX.utils.sheet_to_json(worksheet);

      console.log(`📊 [ZMG:MKT] Encontrados ${leads.length} leads. Processando...`);

      let processed = 0;
      for (const lead of leads) {
        // Mapeamento de colunas (baseado no sample lido anteriormente)
        const name = lead['Pousada'] || lead['name'];
        const phone = lead['Whatsapp'] || lead['phone'];
        const city = lead['Cidade'] || lead['city'];
        const uf = lead['UF'] || lead['state'];

        if (!phone) continue;

        // Limpar telefone para formato E.164 (simplificado)
        let cleanPhone = String(phone).replace(/\D/g, '');
        if (cleanPhone.length === 11 || cleanPhone.length === 10) {
          cleanPhone = '55' + cleanPhone;
        }
        cleanPhone = '+' + cleanPhone;
        
        if (cleanPhone.length < 10) continue;

        // Disparar intenção para o ZMG
        // O estágio de ENRICH do ZMG cuidará de buscar a tendência local
        await ZMG.receive({
          agentId: 'ZCC-MKT-AUTOMATOR',
          propertyId: 'cmou86zq80002u19mz296ly9x', // ID da propriedade ZEHLA central
          recipientPhone: cleanPhone,
          recipientName: name,
          messageType: 'marketing',
          objective: 'campaign',
          context: {
            customVariables: {
              content: 'Olá {{NOME}}! Notamos que a procura por pousadas em {{CIDADE}} ({{UF}}) está explodindo para o próximo feriado. 📈\n\n{{TENDENCIA_DETALHE}}\n\nComo está sua ocupação? O ZEHLA pode te ajudar a converter esse tráfego em reservas diretas sem pagar comissões.',
              cidade: city,
              uf: uf
            }
          }
        });

        processed++;
        // Rate limit para não sobrecarregar a API no teste
        if (processed >= 5) {
            console.log('🛑 [ZMG:MKT] Limite de teste (5) atingido.');
            break;
        }
      }

      console.log(`✅ [ZMG:MKT] Campanha finalizada. ${processed} intenções disparadas.`);
    } catch (error) {
      console.error(`❌ [ZMG:MKT] Erro ao rodar campanha:`, error);
    }
  }
}
