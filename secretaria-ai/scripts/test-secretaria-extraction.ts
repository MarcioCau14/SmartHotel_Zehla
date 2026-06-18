import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

async function testSecretariaExtraction() {
  const targetNumber = '13 98166-7069';
  const downloadPath = '/Users/marciocau/Downloads';
  const csvFileName = 'contatos_whatsapp_secretaria.csv';
  const csvPath = join(downloadPath, csvFileName);

  const mockContacts = [
    { nome: 'Pousada Solar', telefone: '13 99765-4321', categoria: 'pousada', status: 'QUALIFIED' },
    { nome: 'Residencial Rosa', telefone: '13 99122-3344', categoria: 'hostel', status: 'PROSPECT' },
    { nome: 'Hotel Center', telefone: '13 98877-6655', categoria: 'hotel', status: 'NEW' },
    { nome: 'Chale Eco', telefone: '13 99988-7766', categoria: 'pousada', status: 'QUALIFIED' },
  ];

  const mockHistory = [
    "Ola! Seja muito bem-vindo a nossa pousada. Como posso te ajudar hoje?",
    "Temos disponibilidade para o proximo final de semana sim! O valor da diaria na Suite Luxo e R$ 450,00.",
    "Aproveite o paraiso da Praia do Rosa! Qualquer duvida estamos a disposicao.",
    "Ficamos felizes com seu interesse. Gostaria de confirmar a reserva?",
    "Bom dia! O cafe da manha e servido das 8h as 10h30. Te esperamos!"
  ];

  const persona = {
    tone: 'Caloroso, acolhedor e focado em hospitalidade premium.',
    commonExpressions: ['Seja muito bem-vindo!', 'Aproveite o paraiso!', 'Qualquer duvida estamos a disposicao.'],
    style: 'Respostas rapidas, informativas e sempre terminando com um gancho de ajuda.',
    rules: ['Sempre saudar o hospede com entusiasmo.', 'Focar na experiencia do local.', 'Manter profissionalismo em informacoes de valores.']
  };

  const csvContent = ['Nome,Telefone,Categoria,Status', ...mockContacts.map(c => `${c.nome},${c.telefone},${c.categoria},${c.status}`)].join('\n');

  try {
    if (!existsSync(downloadPath)) mkdirSync(downloadPath, { recursive: true });
    writeFileSync(csvPath, csvContent);
    console.log(`✅ CSV salvo em: ${csvPath}`);
    console.log(`📋 Persona extraida: ${persona.tone}`);
    console.log(`📊 ${mockContacts.length} contatos processados`);
  } catch (err) {
    console.error(`❌ Erro ao salvar CSV:`, err);
  }
}

testSecretariaExtraction().catch(console.error);
