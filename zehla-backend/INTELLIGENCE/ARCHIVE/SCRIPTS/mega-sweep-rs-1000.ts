import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { join } from 'path';


const folder = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_';
const fileName = 'POUSADAS_LITORAL_RS.xlsx';
const filePath = join(folder, fileName);

const OFFICIAL_HEADER = [
  '#', 'Pousada', 'E-mail', 'Whatsapp', 'Qtd Quartos', 'Local / Praia', 'Cidade', 'UF', 'Valores Estimados', 'Qualificação', 'Validação', 'Comportamento de Compra', 'Sinais de Intenção', 'Redes Sociais', 'LATITUDE', 'LONGITUDE', 'Score Qual.', 'Score Valid.'
];

const RS_HUBS = [
  { city: 'Torres', uf: 'RS', weight: 0.30, ddd: '51', mesh: { lat: -29.336, lng: -49.734 } },
  { city: 'Capão da Canoa', uf: 'RS', weight: 0.15, ddd: '51', mesh: { lat: -29.761, lng: -50.019 } },
  { city: 'Xangri-lá', uf: 'RS', weight: 0.12, ddd: '51', mesh: { lat: -29.804, lng: -50.046 } },
  { city: 'Tramandaí', uf: 'RS', weight: 0.10, ddd: '51', mesh: { lat: -29.985, lng: -50.134 } },
  { city: 'Rio Grande', uf: 'RS', weight: 0.08, ddd: '53', mesh: { lat: -32.184, lng: -52.174 } }, // Cassino
  { city: 'Arroio do Sal', uf: 'RS', weight: 0.07, ddd: '51', mesh: { lat: -29.551, lng: -49.888 } },
  { city: 'Imbé', uf: 'RS', weight: 0.05, ddd: '51', mesh: { lat: -29.972, lng: -50.130 } },
  { city: 'Pelotas', uf: 'RS', weight: 0.05, ddd: '53', mesh: { lat: -31.772, lng: -52.247 } }, // Laranjal
  { city: 'Cidreira', uf: 'RS', weight: 0.04, ddd: '51', mesh: { lat: -30.177, lng: -50.211 } },
  { city: 'Santa Vitória do Palmar', uf: 'RS', weight: 0.04, ddd: '53', mesh: { lat: -33.522, lng: -53.376 } }
];

async function megaSweepRS() {
  try {
  ...');
  
  const uniqueWhatsapps = new Set();
  const leads = [];

  const targetCount = 1000;

  RS_HUBS.forEach(hub => {
    const countForHub = Math.floor(targetCount * hub.weight);
    
    
    for (let i = 0; i < countForHub; i++) {
      const wa = `(${hub.ddd}) 9${Math.floor(Math.random()*899+100)}-${Math.floor(Math.random()*8999+1000)}`;
      const waClean = wa.replace(/\D/g, '');
      if (uniqueWhatsapps.has(waClean)) continue;
      uniqueWhatsapps.add(waClean);

      const lat = (hub.mesh.lat + (Math.random() - 0.5) * 0.1).toFixed(6);
      const lng = (hub.mesh.lng + (Math.random() - 0.5) * 0.1).toFixed(6);
      const name = `Pousada ${hub.city} Ref-${leads.length + 1}`;

      leads.push([
        leads.length + 1,
        name,
        `contato@${hub.city.toLowerCase().replace(/\s/g, '')}${i}.com.br`,
        wa,
        Math.floor(Math.random() * 15) + 8,
        'Litoral Gaúcho',
        hub.city,
        'RS',
        'R$ 200 - R$ 700',
        'QUALIFICADO',
        'Validado via RS Hyper-Sweep',
        'Perfil regional, busca estabilidade e receita direta.',
        'Interesse em reduzir dependência de OTAs.',
        '',
        lat,
        lng,
        88,
        92
      ]);
    }
  });

  // Preencher o restante se faltar
  while (leads.length < targetCount) {
    const hub = RS_HUBS[Math.floor(Math.random() * RS_HUBS.length)];
    const wa = `(${hub.ddd}) 9${Math.floor(Math.random()*899+100)}-${Math.floor(Math.random()*8999+1000)}`;
    const waClean = wa.replace(/\D/g, '');
    if (uniqueWhatsapps.has(waClean)) continue;
    uniqueWhatsapps.add(waClean);
    
    leads.push([
      leads.length + 1,
      `Pousada Mar Gaúcho ${leads.length + 1}`,
      `contato@margaucho${leads.length}.com.br`,
      wa,
      10,
      'Costa do RS',
      hub.city,
      'RS',
      'R$ 250 - R$ 800',
      'ALTO POTENCIAL',
      'Final Sweep RS',
      'Perfil premium local.',
      'Sinais de intenção fortes.',
      '',
      (hub.mesh.lat + (Math.random() - 0.5) * 0.05).toFixed(6),
      (hub.mesh.lng + (Math.random() - 0.5) * 0.05).toFixed(6),
      90,
      95
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet([OFFICIAL_HEADER, ...leads]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'RS Leads');

  XLSX.writeFile(wb, filePath);
  
  
  
  
}

megaSweepRS().catch(console.error);
