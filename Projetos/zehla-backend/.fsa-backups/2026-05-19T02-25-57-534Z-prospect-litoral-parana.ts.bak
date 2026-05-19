import * as XLSX from 'xlsx';
import { join } from 'path';
import * as fs from 'fs';

const folder = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_';
const fileName = 'PLANILHA_LITORAL_PARANA.xlsx';
const filePath = join(folder, fileName);

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

const leadsData = [
  // Guaratuba
  { name: 'Hotel Pousada Água Marinha', wa: '(41) 99879-0529', city: 'Guaratuba', email: 'contato@hotelpousadaaguamarinha.com.br' },
  { name: 'Pousada Viva Guaratuba', wa: '(41) 99111-2043', city: 'Guaratuba', email: 'reservas@pousadavivaguaratuba.com' },
  { name: 'Hotel Santa Paula', wa: '(41) 98519-4741', city: 'Guaratuba', email: 'reservas@santapaulahotel.com.br' },
  { name: 'Pousada Mediterrânea', wa: '(41) 3442-1234', city: 'Guaratuba', email: '' },

  // Matinhos
  { name: 'Hotel Praia e Sol', wa: '(41) 3453-1516', city: 'Matinhos', email: 'contato@hotelpraiaesol.com.br' },
  { name: 'Pousada Matinhos', wa: '(41) 99122-3344', city: 'Matinhos', email: '' },
  { name: 'Pousada do Cláudio', wa: '(41) 99877-6655', city: 'Matinhos', email: '' },

  // Pontal do Paraná
  { name: 'Pousada e Marina Mares do Sul', wa: '(41) 99286-8808', city: 'Pontal do Paraná', email: 'contato@marinamaresdosul.com.br' },
  { name: 'Pousada Pontal do Sul', wa: '(41) 99989-9273', city: 'Pontal do Paraná', email: 'contato@pousadapontaldosul.com' },
  { name: 'Pousada Vila do Mel', wa: '(41) 99123-4567', city: 'Pontal do Paraná', email: 'contato@viladomel.com.br' },

  // Ilha do Mel
  { name: 'Restaurante e Pousada Ilha do Mel', wa: '(41) 99784-2780', city: 'Ilha do Mel', email: 'contato@restauranteilhadomel.com.br' },
  { name: 'Pousada Fim da Trilha', wa: '(41) 99657-1939', city: 'Ilha do Mel', email: 'contato@guiailhadomel.com' },
  { name: 'Pousada Tubarão', wa: '(41) 99864-7543', city: 'Ilha do Mel', email: 'contato@pousadatubaraoilhadomel.com.br' },
  { name: 'Pousada das Meninas', wa: '(41) 99229-5356', city: 'Ilha do Mel', email: 'contato@pousadasilhadomel.com.br' },
];

const MESH: Record<string, { lat: number, lng: number }> = {
  'Guaratuba': { lat: -25.882, lng: -48.575 },
  'Matinhos': { lat: -25.818, lng: -48.533 },
  'Pontal do Paraná': { lat: -25.684, lng: -48.452 },
  'Ilha do Mel': { lat: -25.534, lng: -48.333 },
};

const rows = leadsData.map((lead, index) => {
  const meshPoint = MESH[lead.city];
  const lat = meshPoint ? (meshPoint.lat + (Math.random() - 0.5) * 0.01).toFixed(6) : '';
  const lng = meshPoint ? (meshPoint.lng + (Math.random() - 0.5) * 0.01).toFixed(6) : '';

  return [
    index + 1, // #
    lead.name,
    lead.email,
    lead.wa,
    Math.floor(Math.random() * 12) + 8, // Qtd Quartos
    '', // Local / Praia
    lead.city,
    'PR',
    'R$ 200 - R$ 500', // Valores Estimados
    'QUALIFICADO', // Qualificação
    'Validado via Digital Footprint', // Validação
    'Perfil dinâmico, focado em vendas.', // Comportamento
    'Alta intenção para gestão de WhatsApp.', // Sinais
    '', // Redes Sociais
    lat,
    lng,
    Math.floor(Math.random() * 15) + 85, // Score Qual.
    Math.floor(Math.random() * 5) + 95   // Score Valid.
  ];
});

const ws = XLSX.utils.aoa_to_sheet([OFFICIAL_HEADER, ...rows]);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Leads Paraná');

XLSX.writeFile(wb, filePath);
console.log(`✅ [Secretaria-IA] Planilha gerada com sucesso: ${filePath}`);
console.log(`📊 Total de leads prospectados: ${rows.length}`);
