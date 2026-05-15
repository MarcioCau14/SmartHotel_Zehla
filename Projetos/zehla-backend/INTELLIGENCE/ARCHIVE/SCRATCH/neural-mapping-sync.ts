import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const TRATADAS_FOLDER = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_/TRATADAS';

// MALHA SUTIL (Neural Mesh) - Coordenadas terrestres seguras com bypass de mar
const NEURAL_MESH: Record<string, { lat: number, lng: number }> = {
  // SC
  'Imbituba': { lat: -28.240, lng: -48.670 },
  'Florianópolis': { lat: -27.595, lng: -48.548 },
  'Garopaba': { lat: -28.020, lng: -48.610 },
  'Bombinhas': { lat: -27.150, lng: -48.480 },
  
  // SP Litoral Norte
  'Ubatuba': { lat: -23.443, lng: -45.070 },
  'Ilhabela': { lat: -23.830, lng: -45.380 },
  'São Sebastião': { lat: -23.760, lng: -45.410 },
  'Caraguatatuba': { lat: -23.620, lng: -45.430 },
  'Bertioga': { lat: -23.840, lng: -46.140 },
  
  // RJ Lagos
  'Búzios': { lat: -22.760, lng: -41.900 },
  'Armação dos Búzios': { lat: -22.760, lng: -41.900 },
  'Cabo Frio': { lat: -22.880, lng: -42.030 },
  'Arraial do Cabo': { lat: -22.970, lng: -42.030 },
  'Saquarema': { lat: -22.930, lng: -42.490 },
  'Rio das Ostras': { lat: -22.520, lng: -41.940 },
  'Macaé': { lat: -22.370, lng: -41.780 },
  
  // Bahia
  'Itacaré': { lat: -14.280, lng: -39.000 },
  'Trancoso': { lat: -16.590, lng: -39.100 },
  'Porto Seguro': { lat: -16.450, lng: -39.060 },
  "Arraial d'Ajuda": { lat: -16.480, lng: -39.070 },
  'Caraíva': { lat: -16.800, lng: -39.150 },
  'Salvador': { lat: -12.970, lng: -38.500 },
  'Praia do Forte': { lat: -12.570, lng: -38.000 },
  'Morro de São Paulo': { lat: -13.380, lng: -38.910 },
  'Ilhéus': { lat: -14.790, lng: -39.030 },
  'Maraú': { lat: -14.100, lng: -39.010 },
  'Barra Grande': { lat: -13.900, lng: -38.950 },
  'Imbassaí': { lat: -12.490, lng: -37.960 },
  'Prado': { lat: -17.340, lng: -39.220 },
  'Mangue Seco': { lat: -11.600, lng: -37.500 },
  'Camaçari': { lat: -12.690, lng: -38.320 },
};

async function syncLeads() {
  console.log('🧠 [Neural Mapping] Iniciando Sincronização de 2.593 Leads...');
  
  const files = fs.readdirSync(TRATADAS_FOLDER).filter(f => f.endsWith('.xlsx'));
  let totalNewLeads = 0;
  let totalSkipped = 0;

  for (const file of files) {
    console.log(`📂 Lendo arquivo: ${file}`);
    const workbook = XLSX.readFile(join(TRATADAS_FOLDER, file));
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    
    for (const row of data as any[]) {
      const wa = String(row.Whatsapp || '').replace(/\D/g, '');
      if (!wa) continue;

      // Deduplicação em tempo real
      const existing = await prisma.lead.findUnique({
        where: { whatsapp: wa }
      });

      if (existing) {
        totalSkipped++;
        continue;
      }

      // Geocodificação via Malha Sutil
      let lat = null;
      let lng = null;
      const city = row.Cidade;
      const meshPoint = NEURAL_MESH[city];

      if (meshPoint) {
        // Land-Lock Jitter: 0.012 deg (~1.2km) para dispersão orgânica terrestre
        lat = meshPoint.lat + (Math.random() - 0.5) * 0.024;
        lng = meshPoint.lng + (Math.random() - 0.5) * 0.024;
      }

      // Upsert Lead
      await prisma.lead.create({
        data: {
          name: row.Pousada || 'Pousada sem Nome',
          email: row['E-mail'] || null,
          whatsapp: wa,
          city: row.Cidade || null,
          state: row.UF || null,
          region: getRegionFromUF(row.UF),
          latitude: lat,
          longitude: lng,
          category: row.Categoria || 'pousada',
          roomsCount: parseInt(row['Qtd Quartos']) || 0,
          location: row['Local / Praia'] || null,
          estimatedValues: row['Valores Estimados'] || null,
          qualification: row['Qualificação'] || null,
          validationStatus: row['Validação'] || null,
          buyingBehavior: row['Comportamento de Compra'] || null,
          intentSignals: row['Sinais de Intenção'] || null,
          socialMedia: row['Redes Sociais'] || null,
          score: parseInt(row['Score Qual.']) || 0,
          validationScore: parseInt(row['Score Valid.']) || 0,
          status: 'PROSPECT',
          source: 'SECRETARIA_AI'
        }
      });
      totalNewLeads++;
    }
  }

  console.log(`\n✨ [SUCESSO] Sincronização concluída!`);
  console.log(`✅ Novos Leads Inseridos: ${totalNewLeads}`);
  console.log(`⏭️ Leads Pulados (Duplicatas): ${totalSkipped}`);
}

function getRegionFromUF(uf: string): string {
  const nordeste = ['BA', 'PE', 'CE', 'RN', 'AL', 'PB', 'SE', 'MA', 'PI'];
  const sudeste = ['SP', 'RJ', 'MG', 'ES'];
  const sul = ['SC', 'PR', 'RS'];
  const norte = ['AM', 'PA', 'RO', 'RR', 'AC', 'TO', 'AP'];
  
  if (nordeste.includes(uf)) return 'Nordeste';
  if (sudeste.includes(uf)) return 'Sudeste';
  if (sul.includes(uf)) return 'Sul';
  if (norte.includes(uf)) return 'Norte';
  return 'Brasil';
}

syncLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
