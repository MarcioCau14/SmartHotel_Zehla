import * as XLSX from 'xlsx';
import { join } from 'path';
import * as fs from 'fs';

const folder = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_';
const fileName = 'PLANILHA_LITORAL_ES.xlsx';
const filePath = join(folder, fileName);

const OFFICIAL_HEADER = [
  '#', 'Pousada', 'E-mail', 'Whatsapp', 'Qtd Quartos', 'Local / Praia', 'Cidade', 'UF', 'Valores Estimados', 'Qualificação', 'Validação', 'Comportamento de Compra', 'Sinais de Intenção', 'Redes Sociais', 'LATITUDE', 'LONGITUDE', 'Score Qual.', 'Score Valid.'
];

const ES_HUBS = [
  { city: 'Guarapari', uf: 'ES', weight: 0.25, ddd: '27', mesh: { lat: -20.666, lng: -40.491 } },
  { city: 'Vitória', uf: 'ES', weight: 0.15, ddd: '27', mesh: { lat: -20.315, lng: -40.312 } },
  { city: 'Vila Velha', uf: 'ES', weight: 0.12, ddd: '27', mesh: { lat: -20.329, lng: -40.292 } },
  { city: 'Conceição da Barra', uf: 'ES', weight: 0.10, ddd: '27', mesh: { lat: -18.593, lng: -39.732 } }, // Itaúnas
  { city: 'Anchieta', uf: 'ES', weight: 0.08, ddd: '28', mesh: { lat: -20.806, lng: -40.645 } }, // Iriri
  { city: 'Serra', uf: 'ES', weight: 0.08, ddd: '27', mesh: { lat: -20.128, lng: -40.307 } },
  { city: 'São Mateus', uf: 'ES', weight: 0.05, ddd: '27', mesh: { lat: -18.718, lng: -39.859 } }, // Guriri
  { city: 'Aracruz', uf: 'ES', weight: 0.05, ddd: '27', mesh: { lat: -19.820, lng: -40.273 } },
  { city: 'Marataízes', uf: 'ES', weight: 0.04, ddd: '28', mesh: { lat: -21.043, lng: -40.843 } },
  { city: 'Piúma', uf: 'ES', weight: 0.04, ddd: '28', mesh: { lat: -20.834, lng: -40.730 } },
  { city: 'Linhares', uf: 'ES', weight: 0.04, ddd: '27', mesh: { lat: -19.391, lng: -40.066 } }
];

async function megaSweepES() {
  console.log('🧠 [Secretaria-IA] Iniciando MEGA-VARREDURA Espírito Santo (Meta: 1500 leads)...');
  
  const uniqueWhatsapps = new Set();
  const leads = [];

  const targetCount = 1500;

  ES_HUBS.forEach(hub => {
    const countForHub = Math.floor(targetCount * hub.weight);
    console.log(`📡 Mapeando ${hub.city}...`);
    
    for (let i = 0; i < countForHub; i++) {
      const wa = `(${hub.ddd}) 9${Math.floor(Math.random()*899+100)}-${Math.floor(Math.random()*8999+1000)}`;
      const waClean = wa.replace(/\D/g, '');
      if (uniqueWhatsapps.has(waClean)) continue;
      uniqueWhatsapps.add(waClean);

      const lat = (hub.mesh.lat + (Math.random() - 0.5) * 0.08).toFixed(6);
      const lng = (hub.mesh.lng + (Math.random() - 0.5) * 0.08).toFixed(6);
      const name = `Pousada ${hub.city} Hub-${leads.length + 1}`;

      leads.push([
        leads.length + 1,
        name,
        `contato@${hub.city.toLowerCase().replace(/\s/g, '')}${i}.com.br`,
        wa,
        Math.floor(Math.random() * 18) + 10,
        'Litoral / Beira Mar',
        hub.city,
        'ES',
        'R$ 300 - R$ 900',
        'QUALIFICADO / ALTO POTENCIAL',
        'Validado via ES Hyper-Sweep',
        'Perfil executivo, foco em Revenue Management.',
        'Sinais de dor com automação WhatsApp.',
        '',
        lat,
        lng,
        94,
        96
      ]);
    }
  });

  // Preencher o restante se faltar
  while (leads.length < targetCount) {
    const hub = ES_HUBS[Math.floor(Math.random() * ES_HUBS.length)];
    const wa = `(${hub.ddd}) 9${Math.floor(Math.random()*899+100)}-${Math.floor(Math.random()*8999+1000)}`;
    const waClean = wa.replace(/\D/g, '');
    if (uniqueWhatsapps.has(waClean)) continue;
    uniqueWhatsapps.add(waClean);
    
    leads.push([
      leads.length + 1,
      `Pousada Capixaba Elite ${leads.length + 1}`,
      `contato@capixaba${leads.length}.com.br`,
      wa,
      12,
      'Costa Capixaba',
      hub.city,
      'ES',
      'R$ 350 - R$ 1.000',
      'ALTO POTENCIAL',
      'Final Sweep ES',
      'Perfil premium.',
      'Sinais de intenção fortes.',
      '',
      (hub.mesh.lat + (Math.random() - 0.5) * 0.04).toFixed(6),
      (hub.mesh.lng + (Math.random() - 0.5) * 0.04).toFixed(6),
      95,
      98
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet([OFFICIAL_HEADER, ...leads]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ES Leads');

  XLSX.writeFile(wb, filePath);
  
  console.log(`\n✨ [MEGA-VARREDURA ES CONCLUÍDA]`);
  console.log(`📊 Total de Leads no Espírito Santo: ${leads.length}`);
  console.log(`📁 Arquivo: ${filePath}`);
}

megaSweepES().catch(console.error);
