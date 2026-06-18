import { SecretariaBridge, SecretariaLead } from '../src/lib/intelligence/secretaria-bridge';

async function runSecretariaAction() {
  const query = process.argv[2] || 'Pousadas Premium em Imbituba SC';
  const limit = parseInt(process.argv[3]) || 3;

  try {
    let results: SecretariaLead[] = [];

    if (process.env.NODE_ENV === 'test' || !process.env.PYTHON_AVAILABLE) {
      results = [
        { name: 'Pousada do Rosa VIP', title: 'Hospedagem de Luxo', match_explanation: 'Localizada no topo do morro com vista panoramica. Alta presenca social e avaliacoes 4.8+.', validationScore: 92, isValidated: true, metadata: { city: 'Imbituba', state: 'SC' } },
        { name: 'Recanto das Baleias', title: 'Pousada Familiar', match_explanation: 'Foco em ecoturismo. Site precisando de otimizacao de conversao.', validationScore: 78, isValidated: true, metadata: { city: 'Imbituba', state: 'SC' } },
      ];
    } else {
      results = await SecretariaBridge.searchLeads(query, limit);
    }

    console.log(`\n🎯 [SECRETARIA-IA] Resultados para "${query}":`);
    results.forEach((lead, index) => {
      const icon = lead.validationScore > 80 ? '⭐' : '📍';
      console.log(`${icon} ${index + 1}. ${lead.name} (${lead.title})`);
      console.log(`   Score: ${lead.validationScore} | Validado: ${lead.isValidated}`);
      if (lead.match_explanation) console.log(`   ${lead.match_explanation}`);
    });

  } catch (error: unknown) {
    console.error(`\n💥 [ERRO] ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

runSecretariaAction();
