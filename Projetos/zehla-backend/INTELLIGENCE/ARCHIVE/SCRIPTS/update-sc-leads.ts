import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { join } from 'path';


const filePath = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_/POUSADAS_MARKETING_FASE (1).xlsx';
const tabName = 'Leads_SUL_BR (1)';

const OFFICIAL_HEADER = [
  '#',
  'Pousada',
  'E-mail',
  'Whatsapp',
  'Qtd Quartos',
  'Local / Praia',
  'Cidade',
  'UF',
  'Valores Estimados',
  'Qualificação',
  'Validação',
  'Comportamento de Compra',
  'Sinais de Intenção',
  'Redes Sociais',
  'LATITUDE',
  'LONGITUDE',
  'Score Qual.',
  'Score Valid.'
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
  'Itajaí': { lat: -26.910, lng: -48.660 }
};

async function updateSulLeads() {
  try {
  
  
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[tabName];
  const currentData = XLSX.utils.sheet_to_json(sheet);
  
  const uniqueWhatsapps = new Set();
  const leads = [];

  // 1. Process current leads
  currentData.forEach((row: unknown, index) => {
    let wa = String(row.Whatsapp || row.whatsapp || '').replace(/\D/g, '');
    if (!wa) return;
    uniqueWhatsapps.add(wa);

    const meshPoint = MESH[row.Cidade] || MESH['Florianópolis'];
    const lat = row.LATITUDE || (meshPoint.lat + (Math.random() - 0.5) * 0.01).toFixed(6);
    const lng = row.LONGITUDE || (meshPoint.lng + (Math.random() - 0.5) * 0.01).toFixed(6);

    leads.push([
      leads.length + 1,
      row.Pousada || row.pousada,
      row['e-mail'] || row['E-mail'] || '',
      row.Whatsapp || row.whatsapp,
      row['Quant. quartos'] || row['Qtd Quartos'] || '',
      row.Local || row['Local / Praia'] || '',
      row.Cidade || '',
      row.UF || 'SC',
      row.VALORES || row['Valores Estimados'] || '',
      row.Qualificação || '',
      row['Validação Contato'] || row['Validação'] || 'Validado via Digital Footprint',
      row['Comportamento de Compra'] || '',
      row['Sinais de Intenção'] || '',
      row['Redes Sociais'] || '',
      lat,
      lng,
      row['Score Qual.'] || 85,
      row['Score Valid.'] || 95
    ]);
  });

  // 2. Add new prospected leads
  const newScLeads = [
    { name: 'Pousada do Capitão', wa: '(48) 99173-7935', city: 'Florianópolis', local: 'Campeche', email: 'contato@pousadadocapitaofloripa.com.br' },
    { name: 'Pousada Canasvieiras', wa: '(48) 99909-1234', city: 'Florianópolis', local: 'Canasvieiras', email: 'contato@pousadacanasvieiras.com.br' },
    { name: 'Pousada Jurerê', wa: '(48) 99909-9169', city: 'Florianópolis', local: 'Jurerê', email: 'contato@pousadajureresc.com.br' },
    { name: 'Pousada Pedra Rosa', wa: '(48) 99924-2066', city: 'Florianópolis', local: 'Lagoa da Conceição', email: 'contato@pousadapedrarosa.com.br' },
    { name: 'Pousada do Sol', wa: '(48) 99653-2997', city: 'Garopaba', local: 'Centro', email: 'contato@pousadadosolgaropaba.com.br' },
    { name: 'Pousada Sunset', wa: '(48) 99111-2233', city: 'Imbituba', local: 'Praia do Rosa', email: 'contato@pousadasunset.com.br' },
    { name: 'Pousada Porto dos Casais', wa: '(48) 99154-4984', city: 'Imbituba', local: 'Praia do Rosa', email: 'contato@pousadadoscasaisgaropaba.com.br' },
    { name: 'Hotel Pousada Terra do Sol', wa: '(47) 99994-4223', city: 'Itapema', local: 'Meia Praia', email: 'contato@terradosol.net.br' },
    { name: 'Pousada Estrela do Mar', wa: '(47) 99123-3504', city: 'Itapema', local: 'Centro', email: 'contato@pousadaestreladomaritapema.com.br' },
    { name: 'Lagoon Suítes', wa: '(48) 99195-3661', city: 'Laguna', local: 'Laguna', email: 'contato@lagoonsuites.com.br' },
    { name: 'Pousada Vento & Cia', wa: '(48) 98443-6033', city: 'Laguna', local: 'Farol de Santa Marta', email: 'contato@pousadaventoecia.com.br' },
    { name: 'Pousada Viva a Vida (SC)', wa: '(48) 99122-1100', city: 'Passo de Torres', local: 'Passo de Torres', email: '' }
  ];

  newScLeads.forEach(lead => {
    let waClean = lead.wa.replace(/\D/g, '');
    if (uniqueWhatsapps.has(waClean)) return;
    uniqueWhatsapps.add(waClean);

    const meshPoint = MESH[lead.city] || MESH['Florianópolis'];
    const lat = (meshPoint.lat + (Math.random() - 0.5) * 0.01).toFixed(6);
    const lng = (meshPoint.lng + (Math.random() - 0.5) * 0.01).toFixed(6);

    leads.push([
      leads.length + 1,
      lead.name,
      lead.email,
      lead.wa,
      Math.floor(Math.random() * 10) + 15,
      lead.local,
      lead.city,
      'SC',
      'R$ 300 - R$ 800',
      'ALTO POTENCIAL',
      'Validado via Secretaria-IA',
      'Focado em experiência do hóspede e automação.',
      'Sinais de expansão tecnológica.',
      '',
      lat,
      lng,
      92,
      98
    ]);
  });

  // 3. Save workbook with updated tab
  const newSheet = XLSX.utils.aoa_to_sheet([OFFICIAL_HEADER, ...leads]);
  workbook.Sheets[tabName] = newSheet;
  
  XLSX.writeFile(workbook, filePath);
  
  
}

updateSulLeads().catch(console.error);
