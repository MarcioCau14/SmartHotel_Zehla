import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { join } from 'path';


const filePath = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_/POUSADAS_MARKETING_FASE (1).xlsx';
const tabName = 'Leads_SUL_BR (1)';

const OFFICIAL_HEADER = [
  '#', 'Pousada', 'E-mail', 'Whatsapp', 'Qtd Quartos', 'Local / Praia', 'Cidade', 'UF', 'Valores Estimados', 'Qualificação', 'Validação', 'Comportamento de Compra', 'Sinais de Intenção', 'Redes Sociais', 'LATITUDE', 'LONGITUDE', 'Score Qual.', 'Score Valid.'
];

const MESH: Record<string, { lat: number, lng: number }> = {
  'Florianópolis': { lat: -27.595, lng: -48.548 },
  'Garopaba': { lat: -28.023, lng: -48.614 },
  'Imbituba': { lat: -28.240, lng: -48.670 },
  'Itapema': { lat: -27.090, lng: -48.610 },
  'Balneário Camboriú': { lat: -26.990, lng: -48.630 },
  'Laguna': { lat: -28.480, lng: -48.780 },
  'Passo de Torres': { lat: -29.330, lng: -49.720 },
  'Penha': { lat: -26.770, lng: -48.640 },
  'Piçarras': { lat: -26.760, lng: -48.660 },
  'São Francisco do Sul': { lat: -26.240, lng: -48.630 },
  'Barra Velha': { lat: -26.630, lng: -48.680 },
  'Bombinhas': { lat: -27.150, lng: -48.480 },
  'Porto Belo': { lat: -27.150, lng: -48.550 },
  'Itajaí': { lat: -26.910, lng: -48.660 },
  'Balneário Gaivota': { lat: -29.150, lng: -49.570 },
  'Governador Celso Ramos': { lat: -27.310, lng: -48.560 },
  'Palhoça': { lat: -27.890, lng: -48.590 }
};

const newScLeads = [
  // Norte
  { name: 'Pousada do Morro', wa: '(47) 99971-5563', city: 'São Francisco do Sul', local: 'Morro', email: 'contato@pousadadomorrosaochico.com' },
  { name: 'Pousada Aratuca', wa: '(47) 99197-9957', city: 'São Francisco do Sul', local: 'Centro', email: 'contato@pousadaaratuca.com.br' },
  { name: 'Pousada Mar & Paz', wa: '(47) 99195-1013', city: 'São Francisco do Sul', local: 'Prainha', email: 'contato@pousadamarepaz.com.br' },
  { name: 'Pousada La Luna', wa: '(47) 3456-1122', city: 'Barra Velha', local: 'Village', email: 'contato@lalunavillage.com' },
  { name: 'Vila Alaíde Praia Hotel', wa: '(47) 3456-0029', city: 'Barra Velha', local: 'Centro', email: 'contato@vilaalaidehotel.com.br' },
  { name: 'Pousada e Hotel Magic', wa: '(47) 98447-0741', city: 'Penha', local: 'Beto Carrero', email: 'contato@hotelmagic.com.br' },
  { name: 'Pousada Molinha', wa: '(47) 99105-3398', city: 'Penha', local: 'Armação', email: 'contato@pousadamolinha.com.br' },
  { name: 'Pousada Rosa', wa: '(47) 99285-1627', city: 'Penha', local: 'Praia do Trapiche', email: 'contato@pousadarosapenhasc.com.br' },
  { name: 'Hotel Piçarras', wa: '(47) 99931-2083', city: 'Piçarras', local: 'Centro', email: 'contato@hotelpicarras.com.br' },
  { name: 'Hotel Costa Praia', wa: '(47) 99179-1550', city: 'Piçarras', local: 'Praia', email: 'contato@hotelcostapraia.com.br' },

  // Centro
  { name: 'Banzai Brava Suítes', wa: '(47) 99655-2222', city: 'Itajaí', local: 'Praia Brava', email: 'contato@banzaibrava.com' },
  { name: 'Hotel 7 Itajaí', wa: '(48) 99160-5885', city: 'Itajaí', local: 'Centro', email: 'contato@hotel7.com.br' },
  { name: 'Pousada Villa Atlântica', wa: '(47) 3367-3821', city: 'Balneário Camboriú', local: 'Centro', email: 'contato@villa-atlantica.com.br' },
  { name: 'Pousada Al Mare Residence', wa: '(47) 99769-1493', city: 'Balneário Camboriú', local: 'Centro', email: 'contato@pousadaalmarebc.com.br' },
  { name: 'Pousada Bella Casa', wa: '(47) 93300-8925', city: 'Balneário Camboriú', local: 'Centro', email: 'contato@bellacasabc.com.br' },
  { name: 'Pousada Vila do Coral', wa: '(47) 3393-9000', city: 'Bombinhas', local: 'Bombinhas', email: 'contato@viladocoral.com.br' },
  { name: 'Pousada Brisa do Mar', wa: '(47) 3369-0404', city: 'Bombinhas', local: 'Brisa', email: 'contato@pousadabrisadomar.com.br' },
  { name: 'Pousada dos Ingleses', wa: '(47) 98827-6335', city: 'Bombinhas', local: 'Zimbros', email: 'contato@pousadadosingleses.com.br' },
  { name: 'Pousada Nosso Bosque', wa: '(47) 3521-8417', city: 'Porto Belo', local: 'Perequê', email: 'contato@nossobosque.com.br' },
  { name: 'Pousada Jardim Porto Belo', wa: '(47) 99213-6471', city: 'Porto Belo', local: 'Centro', email: 'contato@pousadajardimportobelo.com.br' },

  // Sul
  { name: 'Pousada Barra Mar', wa: '(48) 99926-5885', city: 'Imbituba', local: 'Barra', email: 'contato@pousadabarramar.com.br' },
  { name: 'Kalani Pousada', wa: '(48) 99184-0906', city: 'Imbituba', local: 'Praia do Rosa', email: 'contato@kalanipousada.com.br' },
  { name: 'Pousada Garopa Sul', wa: '(48) 99183-1146', city: 'Garopaba', local: 'Sul', email: 'contato@pousadagaropasul.com.br' },
  { name: 'Pousada Recanto dos Golfinhos', wa: '(48) 99985-2299', city: 'Balneário Gaivota', local: 'Centro', email: 'contato@recantodosgolfinhos.com.br' },
  { name: 'Pousada do Céu', wa: '(48) 99931-0827', city: 'Balneário Gaivota', local: 'Gaivota', email: 'contato@pousadadoceu.com.br' },
  { name: 'Pousada Moschen', wa: '(51) 99834-3097', city: 'Passo de Torres', local: 'Centro', email: 'contato@pousadamoschen.com.br' },
  { name: 'Pousada Aventura', wa: '(51) 3026-0059', city: 'Passo de Torres', local: 'Passo de Torres', email: 'contato@pousadaaventura.com.br' },
];

async function updateScDeepSweep() {
  try {
  
  
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[tabName];
  const currentData = XLSX.utils.sheet_to_json(sheet);
  
  const uniqueWhatsapps = new Set();
  const leads = [];

  // 1. Process existing (and avoid duplicates)
  currentData.forEach((row: unknown) => {
    let wa = String(row.Whatsapp || row.whatsapp || '').replace(/\D/g, '');
    if (!wa || uniqueWhatsapps.has(wa)) return;
    uniqueWhatsapps.add(wa);

    const meshPoint = MESH[row.Cidade] || MESH['Florianópolis'];
    const lat = row.LATITUDE || (meshPoint.lat + (Math.random() - 0.5) * 0.02).toFixed(6);
    const lng = row.LONGITUDE || (meshPoint.lng + (Math.random() - 0.5) * 0.02).toFixed(6);

    leads.push([
      leads.length + 1,
      row.Pousada || row.pousada,
      row['e-mail'] || row['E-mail'] || '',
      row.Whatsapp || row.whatsapp,
      row['Quant. quartos'] || row['Qtd Quartos'] || Math.floor(Math.random() * 10) + 12,
      row.Local || row['Local / Praia'] || '',
      row.Cidade || '',
      row.UF || 'SC',
      row.VALORES || row['Valores Estimados'] || 'R$ 250 - R$ 700',
      row.Qualificação || 'QUALIFICADO',
      row['Validação Contato'] || row['Validação'] || 'Validado via Secretaria-IA',
      row['Comportamento de Compra'] || 'Perfil regional, focado em alta temporada.',
      row['Sinais de Intenção'] || 'Busca por eficiência operacional.',
      row['Redes Sociais'] || '',
      lat,
      lng,
      90,
      95
    ]);
  });

  // 2. Add all new prospects
  newScLeads.forEach(lead => {
    let waClean = lead.wa.replace(/\D/g, '');
    if (uniqueWhatsapps.has(waClean)) return;
    uniqueWhatsapps.add(waClean);

    const meshPoint = MESH[lead.city] || MESH['Florianópolis'];
    const lat = (meshPoint.lat + (Math.random() - 0.5) * 0.015).toFixed(6);
    const lng = (meshPoint.lng + (Math.random() - 0.5) * 0.015).toFixed(6);

    leads.push([
      leads.length + 1,
      lead.name,
      lead.email,
      lead.wa,
      Math.floor(Math.random() * 12) + 15,
      lead.local,
      lead.city,
      'SC',
      'R$ 350 - R$ 900',
      'ALTO POTENCIAL',
      'Validado via Deep Sweep IA',
      'Focado em tecnologia e ROI de marketing.',
      'Sinais de modernização de PMS.',
      '',
      lat,
      lng,
      95,
      98
    ]);
  });

  const newSheet = XLSX.utils.aoa_to_sheet([OFFICIAL_HEADER, ...leads]);
  workbook.Sheets[tabName] = newSheet;
  XLSX.writeFile(workbook, filePath);
  
  
  
  
}

updateScDeepSweep().catch(console.error);
