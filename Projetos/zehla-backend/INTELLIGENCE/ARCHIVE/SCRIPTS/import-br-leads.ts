import * as XLSX from 'xlsx';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { PrismaClient, LeadStatus } from '@prisma/client';


dotenv.config();

const prisma = new PrismaClient();

// Banco de Centroides Neural (Coordenadas Reais dos Picos de Pousadas)
const CITY_COORDINATES: Record<string, { lat: number, lng: number, region: string }> = {
  // SAO PAULO (Litoral Norte)
  'Ilhabela': { lat: -23.83, lng: -45.38, region: 'Sudeste' },
  'São Sebastião': { lat: -23.76, lng: -45.42, region: 'Sudeste' },
  'Bertioga': { lat: -23.84, lng: -46.14, region: 'Sudeste' },
  'Guarujá': { lat: -23.98, lng: -46.26, region: 'Sudeste' },
  'Ubatuba': { lat: -23.44, lng: -45.08, region: 'Sudeste' },
  'Caraguatatuba': { lat: -23.62, lng: -45.43, region: 'Sudeste' },

  // RIO DE JANEIRO (Região dos Lagos)
  'Búzios': { lat: -22.76, lng: -41.90, region: 'Sudeste' },
  'Armação dos Búzios': { lat: -22.76, lng: -41.90, region: 'Sudeste' },
  'Arraial do Cabo': { lat: -22.97, lng: -42.03, region: 'Sudeste' },
  'Cabo Frio': { lat: -22.88, lng: -42.03, region: 'Sudeste' },
  'Rio das Ostras': { lat: -22.5250, lng: -41.9428, region: 'Sudeste' },
  'Saquarema': { lat: -22.93, lng: -42.49, region: 'Sudeste' },
  'Angra dos Reis': { lat: -23.0061, lng: -44.3181, region: 'Sudeste' },
  'Paraty': { lat: -23.2203, lng: -44.7172, region: 'Sudeste' },

  // BAHIA (Litoral Sul / Norte)
  'Itacaré': { lat: -14.28, lng: -39.00, region: 'Nordeste' },
  'Porto Seguro': { lat: -16.4497, lng: -39.0641, region: 'Nordeste' },
  'Arraial d\'Ajuda': { lat: -16.4914, lng: -39.0744, region: 'Nordeste' },
  'Trancoso': { lat: -16.59, lng: -39.10, region: 'Nordeste' },
  'Salvador': { lat: -12.97, lng: -38.51, region: 'Nordeste' },
  'Morro de São Paulo': { lat: -13.3747, lng: -38.9150, region: 'Nordeste' },
  'Maraú': { lat: -14.11, lng: -39.02, region: 'Nordeste' },
  'Imbassaí': { lat: -12.4939, lng: -37.9628, region: 'Nordeste' },
  'Praia do Forte': { lat: -12.5800, lng: -38.0000, region: 'Nordeste' },

  // SANTA CATARINA (Picos Surf/Eco)
  'Imbituba': { lat: -28.24, lng: -48.66, region: 'Sul' },
  'Garopaba': { lat: -28.0264, lng: -48.6133, region: 'Sul' },
  'Florianópolis': { lat: -27.60, lng: -48.55, region: 'Sul' },
  'Bombinhas': { lat: -27.1472, lng: -48.5028, region: 'Sul' },
  'Balneário Camboriú': { lat: -26.9925, lng: -48.6347, region: 'Sul' },
};

const PLANILHAS_PATH = '/Users/marciocau/Downloads/PLANILHAS_MARKETING_BR_';

async function importLeads() {
  
  
  const files = [
    'POUSADA_LITORAL_SP_NORTE.xlsx',
    'POUSADA_LITORAL_BAHIA.xlsx',
    'POUSADAS_LAGOS_RJ.xlsx',
    'POUSADAS_MARKETING_FASE (1).xlsx'
  ];

  let totalImported = 0;
  let totalSkipped = 0;

  for (const fileName of files) {
    const filePath = path.join(PLANILHAS_PATH, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Arquivo não encontrado: ${fileName}`);
      continue;
    }

    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

    

    for (const row of data) {
      const whatsapp = String(row['Whatsapp'] || row['whatsapp'] || '').replace(/\D/g, '');
      if (!whatsapp) {
        totalSkipped++;
        continue;
      }

      // Geocodificação inteligente ou direta
      const cidade = row['Cidade'] || row['cidade'] || '';
      const explicitLat = parseFloat(row['LATITUDE'] || row['latitude']);
      const explicitLng = parseFloat(row['LONGITUDE'] || row['longitude']);
      
      let finalLat: number;
      let finalLng: number;

      if (!isNaN(explicitLat) && !isNaN(explicitLng)) {
        // Coordenadas diretas da planilha
        finalLat = explicitLat;
        finalLng = explicitLng;
      } else {
        // Fallback: Centroide Neural com Land-Lock Protocol
        const geo = CITY_COORDINATES[cidade] || { lat: -14.235, lng: -51.9253, region: 'Brasil' };
        // Jitter de Malha Imaginária (~800m)
        finalLat = geo.lat + (Math.random() - 0.5) * 0.012;
        finalLng = geo.lng + (Math.random() - 0.5) * 0.012;
      }

      try {
        await prisma.lead.upsert({
          where: { whatsapp },
          update: {
            name: row['Pousada'] || row['pousada'] || 'Sem Nome',
            email: row['E-mail'] || row['email'] || null,
            roomsCount: parseInt(row['Qtd Quartos'] || row['roomsCount'] || '0'),
            location: row['Local / Praia'] || row['location'] || '',
            city: cidade,
            state: row['UF'] || row['uf'] || 'SC',
            region: CITY_COORDINATES[cidade]?.region || 'Brasil',
            estimatedValues: row['Valores Estimados'] || row['estimatedValues'] || '',
            qualification: row['Qualificacao'] || row['Qualificação'] || row['qualification'] || '',
            validationStatus: row['Validacao'] || row['Validação'] || row['validationStatus'] || 'pendente',
            buyingBehavior: row['Comportamento de Compra'] || row['buyingBehavior'] || '',
            intentSignals: row['Sinais de Intencao'] || row['Sinais de Intenção'] || row['intentSignals'] || '',
            socialMedia: row['Redes Sociais'] || row['socialMedia'] || '',
            score: parseInt(row['Score Qual.'] || row['score'] || '0'),
            validationScore: parseInt(row['Score Valid.'] || row['validationScore'] || '0'),
            latitude: finalLat,
            longitude: finalLng,
            updatedAt: new Date(),
          },
          create: {
            whatsapp,
            name: row['Pousada'] || row['pousada'] || 'Sem Nome',
            email: row['E-mail'] || row['email'] || null,
            roomsCount: parseInt(row['Qtd Quartos'] || row['roomsCount'] || '0'),
            location: row['Local / Praia'] || row['location'] || '',
            city: cidade,
            state: row['UF'] || row['uf'] || 'SC',
            region: CITY_COORDINATES[cidade]?.region || 'Brasil',
            estimatedValues: row['Valores Estimados'] || row['estimatedValues'] || '',
            qualification: row['Qualificacao'] || row['Qualificação'] || row['qualification'] || '',
            validationStatus: row['Validacao'] || row['Validação'] || row['validationStatus'] || 'pendente',
            buyingBehavior: row['Comportamento de Compra'] || row['buyingBehavior'] || '',
            intentSignals: row['Sinais de Intencao'] || row['Sinais de Intenção'] || row['intentSignals'] || '',
            socialMedia: row['Redes Sociais'] || row['socialMedia'] || '',
            score: parseInt(row['Score Qual.'] || row['score'] || '0'),
            validationScore: parseInt(row['Score Valid.'] || row['validationScore'] || '0'),
            latitude: finalLat,
            longitude: finalLng,
            status: 'PROSPECT',
            source: 'IMPORT_MASSIVA',
          }
        });
        totalImported++;
      } catch (err) {
        console.error(`❌ Erro ao importar lead ${whatsapp}:`, err);
        totalSkipped++;
      }
    }
  }

  
  
  
}

importLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
