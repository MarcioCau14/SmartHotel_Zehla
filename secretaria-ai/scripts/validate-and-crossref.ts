import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';

const execAsync = promisify(exec);

// ============================================================
// DADOS DE ENTRADA — PROSPEC_VALIDADA_FINAL.csv
// ============================================================
const RAW_CSV = `Empresa;Estado;Decisor;Cargo;E-mail;Status;Validacao_Status;Validacao_Status
XP Inc.;SP;Lisandro Lopez;CMO;lisandro.lopez@xpinc.com.br;Validado 2026;Domínio/MX não encontrado: xpinc.com.br;Domínio/MX não encontrado: xpinc.com.br
BTG Pactual;SP;André Kliousoff;CMO;andre.kliousoff@btgpactual.com;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Porto Seguro;SP;Luiz Arruda;VP Comercial e Marketing;luiz.arruda@portoseguro.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Magalu;SP;Felipe Cohen;CMO;felipe.cohen@magazineluiza.com.br;Validado 2026;E-mail Válido e Ativo;E-mail Válido e Ativo
Lojas Renner;SP;Renata Altenfelder;Diretora de Marketing;renata.altenfelder@lojasrenner.com.br;Validado 2026;Domínio/MX não encontrado: lojasrenner.com.br;Domínio/MX não encontrado: lojasrenner.com.br
BRF;SP/SC;Luiz Franco;Diretor de Marketing;luiz.franco@brf-global.com;Validado 2026;Servidor recusou (Código: 550);Servidor recusou (Código: 550)
BRF (Global);SP;Marcel Sacco;VP Global Marketing;marcel.sacco@brf-global.com;Validado 2026;Servidor recusou (Código: 550);Servidor recusou (Código: 550)
Aurora Coop;SC;Ricardo Chueiri;Diretor Mercado;ricardo.chueiri@auroracoop.com.br;Validado 2026;Servidor recusou (Código: 550);Servidor recusou (Código: 550)
FG Empreendimentos;SC;Alex Brito;Diretor Comercial/Mkt;alex.brito@fgempreendimentos.com.br;Validado 2026;Servidor recusou (Código: 550);Servidor recusou (Código: 550)
Azul Linhas Aéreas;SP;Ricardo Andrez;Diretor de Marketing;ricardo.andrez@voeazul.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Gol Linhas Aéreas;SP;Patrícia Pessoa;Diretora Marketing Grupo;patricia.pessoa@voegol.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Intelbras;SC;Juliana Moser;Diretora de Marketing;juliana.moser@intelbras.com.br;Validado 2026;E-mail Válido e Ativo;E-mail Válido e Ativo
Flormel;SP;Rodolfo Tornesi;Diretor Geral;rodolfo@flormel.com.br;Recuperação 2026;Servidor recusou (Código: 550);Servidor recusou (Código: 550)
Embraed;SC;Leonardo Diniz;CEO / Dir. Executivo;leonardo.diniz@embraed.com.br;Validado 2026;Servidor recusou (Código: 550);Servidor recusou (Código: 550)
Santander Brasil;SP;Guilherme Bernardes;CMO;gbernardes@santander.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Bradesco;SP;Renato Camargo;Diretor de Marketing;renato.camargo@bradesco.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Itaú Unibanco;SP;Juliana Cury;Diretora de Marketing;juliana.cury@itau-unibanco.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Vivara;SP;Marina Kaufman;CMO / Diretora Mkt;marina.kaufman@vivara.com.br;Validado 2026;Servidor recusou (Código: 550);Servidor recusou (Código: 550)
Havan;SC;Jordan Hang;Ex-Head (Consultor);contato@nostco.com.br;Recuperação 2026;E-mail Válido e Ativo;E-mail Válido e Ativo
Arezzo&Co;SC/SP;Luciana Wodzik;Diretora Executiva Marcas;lwodzik@arezzo.com.br;Validado 2026;E-mail Válido e Ativo;E-mail Válido e Ativo
Mercado Livre;SP;César Hiraoka;Diretor de Marketing;chiraoka@mercadolivre.com.br;Validado 2026;E-mail Válido e Ativo;E-mail Válido e Ativo
Pasqualotto&GT;SC;Pamela Oliveira;Marketing Group;pamela.oliveira@pasqualotto.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Embraed Luxury;SC;Nelson Rebelato;Dir. Vendas e Mkt;nelson.rebelato@embraed.com.br;Validado 2026;Servidor recusou (Código: 550);Servidor recusou (Código: 550)
JBS (Friboi);SP;Anne Napoli;Diretora de Marketing;anne.napoli@friboi.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Azul Viagens;SP;Giulliana Mesquita;Gerente de Produtos;giulliana.mesquita@voeazul.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Heineken Brasil;SP;Eduardo Picarelli;Diretor Sênior Brand;epicarelli@heineken.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Ambev (Zé Delivery);SP;Thais Azevedo;CMO;thais.azevedo@ambev.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Sallve;SP;Felipe Vieira;Gerente Comunicação;felipe.vieira@sallve.com.br;Recuperação 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out
Positiv.a;SP;Marcella Zambardino;Co-fundadora/CMO;marcella@positiva.eco.br;Validado 2026;Servidor recusou (Código: 550);Servidor recusou (Código: 550)
Mormaii;SC;Ana Paula Gloss;Head de Marketing;apgloss@mormaii.com.br;Validado 2026;Erro de conexão SMTP: timed out;Erro de conexão SMTP: timed out`;

// ============================================================
// PLATAFORMAS — Base de Conhecimento
// ============================================================
const PLATFORMS = {
  // Brasileiras
  'Silbeck': { type: 'br', category: 'PMS + WhatsApp Auto', priceTier: 'mid', keywords: ['silbeck', 'silbeck.com.br', 'pms whatsapp', 'silbeck hotel'] },
  'SimplesHotel': { type: 'br', category: 'PMS Fácil', priceTier: 'low', keywords: ['simpleshotel', 'simpleshotel.com.br', 'simples hotel'] },
  'Innotel': { type: 'br', category: 'CRM Hóspedes', priceTier: 'mid', keywords: ['innotel', 'innotel.com.br', 'innotel crm'] },
  'QuartoVerde': { type: 'br', category: 'PMS Gratuito', priceTier: 'free', keywords: ['quartoverde', 'quartoverde.com.br', 'quarto verde'] },
  'HMAX': { type: 'br', category: 'Revenue Management', priceTier: 'high', keywords: ['hmax', 'hmax.com.br', 'hmax revenue'] },
  'Stays.net': { type: 'br', category: 'Aluguel Temporada', priceTier: 'mid', keywords: ['stays.net', 'staysnet', 'stays net'] },
  'Hospedin': { type: 'br', category: 'Booking Engine', priceTier: 'low', keywords: ['hospedin', 'hospedin.com.br', 'hospedin booking'] },
  // Globais
  'Cloudbeds': { type: 'global', category: 'All-in-One PMS', priceTier: 'high', keywords: ['cloudbeds', 'cloudbeds.com', 'mycloudbeds'] },
  'Mews': { type: 'global', category: 'PMS Moderno API', priceTier: 'high', keywords: ['mews', 'mews.com', 'mews systems', 'mews hospitality'] },
  'Little Hotelier': { type: 'global', category: 'By SiteMinder', priceTier: 'mid', keywords: ['little hotelier', 'littlehotelier', 'siteMinder', 'siteminder.com'] },
};

// ============================================================
// PERFIS DE EMPRESA — Conhecimento de mercado
// ============================================================
const COMPANY_PROFILES: Record<string, { sector: string; revenue: string; techMaturity: string; hotelRelevance: string; platforms: string[]; notes: string }> = {
  'XP Inc.': { sector: 'Financeiro', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Investimentos em hospitality? Parceria possível.' },
  'BTG Pactual': { sector: 'Financeiro', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Financiamento hotelaria.' },
  'Porto Seguro': { sector: 'Seguros', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Média', platforms: [], notes: 'Seguros para pousadas/hotéis.' },
  'Magalu': { sector: 'Varejo', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'E-commerce marketplace.' },
  'Lojas Renner': { sector: 'Varejo', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Moda/varejo.' },
  'BRF': { sector: 'Alimentos', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Fornecedora food service.' },
  'Aurora Coop': { sector: 'Alimentos', revenue: 'Bilionária', techMaturity: 'Média', hotelRelevance: 'Baixa', platforms: [], notes: 'Cooperativa de alimentos.' },
  'FG Empreendimentos': { sector: 'Imobiliário', revenue: 'Média', techMaturity: 'Média', hotelRelevance: 'Alta', platforms: ['Cloudbeds', 'Mews'], notes: 'Pode ter pousadas/imóveis temporada.' },
  'Azul Linhas Aéreas': { sector: 'Aviação', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Média', platforms: [], notes: 'Parcerias com hotéis.' },
  'Gol Linhas Aéreas': { sector: 'Aviação', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Média', platforms: [], notes: 'Parcerias com hotéis.' },
  'Intelbras': { sector: 'Tecnologia', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Média', platforms: [], notes: 'Câmeras/segurança para hotéis.' },
  'Flormel': { sector: 'Alimentos', revenue: 'Média', techMaturity: 'Média', hotelRelevance: 'Baixa', platforms: [], notes: 'Chocolates.' },
  'Embraed': { sector: 'Imobiliário', revenue: 'Alta', techMaturity: 'Média', hotelRelevance: 'Alta', platforms: ['Cloudbeds', 'Stays.net'], notes: 'Resorts/pousadas de luxo.' },
  'Santander Brasil': { sector: 'Financeiro', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Crédito hotelaria.' },
  'Bradesco': { sector: 'Financeiro', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Crédito hotelaria.' },
  'Itaú Unibanco': { sector: 'Financeiro', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Crédito hotelaria.' },
  'Vivara': { sector: 'Varejo', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Joias.' },
  'Havan': { sector: 'Varejo', revenue: 'Bilionária', techMaturity: 'Média', hotelRelevance: 'Média', platforms: ['SimplesHotel'], notes: 'Pode ter pousadas.' },
  'Arezzo&Co': { sector: 'Varejo', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Calçados.' },
  'Mercado Livre': { sector: 'E-commerce', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Marketplace.' },
  'Pasqualotto&GT': { sector: 'Publicidade', revenue: 'Média', techMaturity: 'Alta', hotelRelevance: 'Alta', platforms: ['Cloudbeds', 'Mews', 'Little Hotelier'], notes: 'Agência — clientes hotelaria.' },
  'Embraed Luxury': { sector: 'Imobiliário', revenue: 'Alta', techMaturity: 'Média', hotelRelevance: 'Alta', platforms: ['Cloudbeds', 'Mews'], notes: 'Resorts de luxo.' },
  'JBS (Friboi)': { sector: 'Alimentos', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Fornecedora food service.' },
  'Azul Viagens': { sector: 'Turismo', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Alta', platforms: ['Cloudbeds', 'Stays.net'], notes: 'Pacotes hotelaria.' },
  'Heineken Brasil': { sector: 'Bebidas', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Média', platforms: [], notes: 'Fornecedora bebidas hotéis.' },
  'Ambev (Zé Delivery)': { sector: 'Bebidas', revenue: 'Bilionária', techMaturity: 'Alta', hotelRelevance: 'Média', platforms: [], notes: 'Fornecedora bebidas.' },
  'Sallve': { sector: 'Cosméticos', revenue: 'Média', techMaturity: 'Alta', hotelRelevance: 'Baixa', platforms: [], notes: 'Skincare.' },
  'Positiv.a': { sector: 'Cosméticos', revenue: 'Pequena', techMaturity: 'Média', hotelRelevance: 'Baixa', platforms: [], notes: 'Cosméticos eco.' },
  'Mormaii': { sector: 'Varejo', revenue: 'Média', techMaturity: 'Média', hotelRelevance: 'Média', platforms: [], notes: 'Esportes/aquático — SC.' },
};

// ============================================================
// PARSER CSV
// ============================================================
interface Lead {
  empresa: string;
  estado: string;
  decisor: string;
  cargo: string;
  email: string;
  status: string;
  validacao: string;
  // Campos enriquecidos
  emailValid: boolean;
  emailDomain: string;
  sector: string;
  revenue: string;
  techMaturity: string;
  hotelRelevance: string;
  purchasingPower: number; // 0-100
  platformsDetected: string[];
  platformsInvesting: string;
  platformType: string;
  recommendedPitch: string;
  priority: 'ELITE' | 'ALTA' | 'MEDIA' | 'BAIXA';
  score: number;
  notes: string;
}

function parseCSV(csv: string): Lead[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(';');

  return lines.slice(1).map(line => {
    const values = line.split(';');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h.trim()] = (values[i] || '').trim(); });

    const empresa = row['Empresa'] || '';
    const profile = COMPANY_PROFILES[empresa] || { sector: 'Desconhecido', revenue: 'Desconhecido', techMaturity: 'Desconhecida', hotelRelevance: 'Desconhecida', platforms: [], notes: '' };

    const validacao = row['Validacao_Status'] || '';
    const emailValid = validacao.includes('Válido e Ativo');
    const emailDomain = row['E-mail']?.split('@')[1] || '';

    // Detectar plataformas
    const platformsDetected: string[] = [];
    for (const [platform, data] of Object.entries(PLATFORMS)) {
      for (const keyword of data.keywords) {
        if (empresa.toLowerCase().includes(keyword.toLowerCase()) || emailDomain.toLowerCase().includes(keyword.toLowerCase())) {
          platformsDetected.push(platform);
        }
      }
    }
    // Adicionar plataformas do perfil
    profile.platforms.forEach(p => { if (!platformsDetected.includes(p)) platformsDetected.push(p); });

    // Calcular poder de compra
    let purchasingPower = 0;
    if (profile.revenue === 'Bilionária') purchasingPower += 40;
    else if (profile.revenue === 'Alta') purchasingPower += 30;
    else if (profile.revenue === 'Média') purchasingPower += 20;
    else purchasingPower += 5;

    if (profile.techMaturity === 'Alta') purchasingPower += 20;
    else if (profile.techMaturity === 'Média') purchasingPower += 10;

    if (emailValid) purchasingPower += 10;
    if (row['Status']?.includes('Validado')) purchasingPower += 10;

    // Relevância hotelaria
    let hotelRelevanceScore = 0;
    if (profile.hotelRelevance === 'Alta') hotelRelevanceScore = 30;
    else if (profile.hotelRelevance === 'Média') hotelRelevanceScore = 15;

    const score = purchasingPower + hotelRelevanceScore;

    // Prioridade
    let priority: Lead['priority'] = 'BAIXA';
    if (score >= 80) priority = 'ELITE';
    else if (score >= 60) priority = 'ALTA';
    else if (score >= 40) priority = 'MEDIA';

    // Plataformas investindo
    const platformsInvesting = platformsDetected.length > 0 ? platformsDetected.join(', ') : 'Não detectado';
    const platformType = platformsDetected.length > 0
      ? (platformsDetected.some(p => PLATFORMS[p as keyof typeof PLATFORMS]?.type === 'global') ? 'Global' : 'Brasileira')
      : 'Nenhuma detectada';

    // Pitch recomendado
    let recommendedPitch = '';
    if (profile.hotelRelevance === 'Alta') {
      if (platformsDetected.includes('Cloudbeds')) recommendedPitch = 'Migrar de Cloudbeds: ZEHLA tem IA nativa + WhatsApp + voz. Economia de 30% vs Cloudbeds.';
      else if (platformsDetected.includes('Mews')) recommendedPitch = 'ZEHLA + Mews API: Integração perfeita com IA brasileira e atendimento WhatsApp 24h.';
      else if (platformsDetected.includes('Little Hotelier')) recommendedPitch = 'Upgrade de Little Hotelier: ZEHLA oferece PMS completo + IA + Revenue Management.';
      else if (platformsDetected.includes('SimplesHotel')) recommendedPitch = 'Evoluir de SimplesHotel: ZEHLA tem IA, WhatsApp, Revenue e Multi-canal.';
      else if (platformsDetected.includes('Stays.net')) recommendedPitch = 'ZEHLA + Stays.net: Integração para reservas diretas com IA.';
      else recommendedPitch = 'ZEHLA SmartHotel: PMS + IA + WhatsApp + Revenue Management. Demo gratuita.';
    } else if (profile.hotelRelevance === 'Média') {
      recommendedPitch = `Parceria estratégica: ${empresa} + ZEHLA para clientes de hotelaria.`;
    } else {
      recommendedPitch = 'Fora do ICP — considerar apenas para parcerias B2B.';
    }

    return {
      empresa,
      estado: row['Estado'] || '',
      decisor: row['Decisor'] || '',
      cargo: row['Cargo'] || '',
      email: row['E-mail'] || '',
      status: row['Status'] || '',
      validacao,
      emailValid,
      emailDomain,
      sector: profile.sector,
      revenue: profile.revenue,
      techMaturity: profile.techMaturity,
      hotelRelevance: profile.hotelRelevance,
      purchasingPower,
      platformsDetected,
      platformsInvesting,
      platformType,
      recommendedPitch,
      priority,
      score,
      notes: profile.notes,
    };
  });
}

// ============================================================
// EXPORTAR PARA EXCEL (CSV compatível Google Sheets)
// ============================================================
function exportToCSV(leads: Lead[]): string {
  const headers = [
    'Prioridade', 'Score', 'Empresa', 'Estado', 'Decisor', 'Cargo', 'E-mail',
    'Email Validado', 'Setor', 'Receita', 'Maturidade Tech', 'Relevância Hotelaria',
    'Poder de Compra (0-100)', 'Plataformas Detectadas', 'Tipo Plataforma',
    'Investindo em', 'Pitch Recomendado', 'Status Original', 'Validacao', 'Notas'
  ];

  const rows = leads.map(l => [
    l.priority,
    l.score.toString(),
    l.empresa,
    l.estado,
    l.decisor,
    l.cargo,
    l.email,
    l.emailValid ? '✅ SIM' : '❌ NÃO',
    l.sector,
    l.revenue,
    l.techMaturity,
    l.hotelRelevance,
    l.purchasingPower.toString(),
    l.platformsDetected.length > 0 ? l.platformsDetected.join(' | ') : 'Nenhuma',
    l.platformType,
    l.platformsInvesting,
    l.recommendedPitch,
    l.status,
    l.validacao,
    l.notes,
  ]);

  return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('🧠 [SECRETARIA-IA] Iniciando validação e cruzamento de dados...');
  console.log(`📊 ${RAW_CSV.split('\n').length - 1} leads para analisar`);
  console.log(`🏨 ${Object.keys(PLATFORMS).length} plataformas para cruzar`);

  const leads = parseCSV(RAW_CSV);

  // Ordenar por score
  leads.sort((a, b) => b.score - a.score);

  // Estatísticas
  const elite = leads.filter(l => l.priority === 'ELITE').length;
  const alta = leads.filter(l => l.priority === 'ALTA').length;
  const media = leads.filter(l => l.priority === 'MEDIA').length;
  const baixa = leads.filter(l => l.priority === 'BAIXA').length;
  const emailValidos = leads.filter(l => l.emailValid).length;
  const comPlataforma = leads.filter(l => l.platformsDetected.length > 0).length;
  const hotelRelevancia = leads.filter(l => l.hotelRelevance === 'Alta' || l.hotelRelevance === 'Média').length;

  console.log('\n📈 RESUMO DA ANÁLISE:');
  console.log(`   ELITE: ${elite} | ALTA: ${alta} | MÉDIA: ${media} | BAIXA: ${baixa}`);
  console.log(`   Emails válidos: ${emailValidos}/${leads.length}`);
  console.log(`   Com plataforma detectada: ${comPlataforma}/${leads.length}`);
  console.log(`   Relevância hotelaria (Alta+Média): ${hotelRelevancia}/${leads.length}`);

  console.log('\n🏆 TOP 10 LEADS POR SCORE:');
  leads.slice(0, 10).forEach((l, i) => {
    console.log(`   ${i + 1}. [${l.priority}] ${l.empresa} (${l.decisor}) — Score: ${l.score} | Plataformas: ${l.platformsInvesting}`);
  });

  console.log('\n🏨 PLATAFORMAS DETECTADAS:');
  const platformCounts: Record<string, number> = {};
  leads.forEach(l => l.platformsDetected.forEach(p => { platformCounts[p] = (platformCounts[p] || 0) + 1; }));
  Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).forEach(([p, c]) => {
    console.log(`   ${p}: ${c} leads`);
  });

  // Exportar
  const csv = exportToCSV(leads);
  const outputPath = './outbox/secretaria_validacao_completa.csv';

  try {
    await mkdir('./outbox', { recursive: true });
    await writeFile(outputPath, csv, 'utf-8');
    console.log(`\n✅ Arquivo exportado: ${outputPath}`);
    console.log(`📋 Abra no Google Sheets: Importar > Separador ";"`);
  } catch (err) {
    console.error('❌ Erro ao salvar:', err);
  }
}

main().catch(console.error);
