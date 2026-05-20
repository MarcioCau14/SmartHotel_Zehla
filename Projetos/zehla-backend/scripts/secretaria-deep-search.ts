import * as dotenv from 'dotenv';
import path from 'path';

import { SecretariaBridge, SecretariaLead } from '../src/lib/intelligence/secretaria-bridge';


// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * SECRETARIA-IA: DEEP SEARCH & INTELLIGENCE ROUND
 * Script para ativar as habilidades de prospecção ativa da Secretaria.
 */
async function runSecretariaAction() {
  const query = process.argv[2] || 'Pousadas Premium em Imbituba SC';
  const limit = parseInt(process.argv[3]) || 3;


  try {
    // Tenta rodar a prospecção real. 
    // Em GitHub Actions, se o backend Python não estiver lá, ele vai falhar graciosamente
    // ou podemos mockar para demonstração se for um ambiente de teste.
    
    let results: SecretariaLead[] = [];
    
    if (process.env.NODE_ENV === 'test' || !process.env.PYTHON_AVAILABLE) {
      results = [
        {
          name: 'Pousada do Rosa VIP',
          title: 'Hospedagem de Luxo',
          match_explanation: 'Localizada no topo do morro com vista panorâmica. Alta presença social e avaliações 4.8+.',
          validationScore: 92,
          isValidated: true,
          metadata: { city: 'Imbituba', state: 'SC' }
        },
        {
          name: 'Recanto das Baleias',
          title: 'Pousada Familiar',
          match_explanation: 'Foco em ecoturismo. Site precisando de otimização de conversão. Ponto de dor identificado.',
          validationScore: 78,
          isValidated: true,
          metadata: { city: 'Imbituba', state: 'SC' }
        }
      ];
    } else {
      results = await SecretariaBridge.searchLeads(query, limit);
    }


    results.forEach((lead, index) => {
      const icon = lead.validationScore > 80 ? '⭐' : '📍';
    });


  } catch (error: unknown) {
    console.error(`\n💥 [ERRO] A Secretaria encontrou um obstáculo: ${error.message}`);
    process.exit(1);
  }
}

runSecretariaAction();
