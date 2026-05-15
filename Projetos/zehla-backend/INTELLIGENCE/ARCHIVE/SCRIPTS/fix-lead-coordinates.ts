import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

// Centroides refinados (Posicionados mais para o interior para evitar o mar)
const LAND_COORDINATES: Record<string, { lat: number, lng: number }> = {
  'Ilhabela': { lat: -23.83, lng: -45.38 },
  'São Sebastião': { lat: -23.76, lng: -45.42 },
  'Bertioga': { lat: -23.84, lng: -46.14 },
  'Guarujá': { lat: -23.98, lng: -46.26 },
  'Ubatuba': { lat: -23.44, lng: -45.08 },
  'Caraguatatuba': { lat: -23.62, lng: -45.43 },
  'Búzios': { lat: -22.76, lng: -41.90 },
  'Armação dos Búzios': { lat: -22.76, lng: -41.90 },
  'Arraial do Cabo': { lat: -22.97, lng: -42.03 },
  'Cabo Frio': { lat: -22.88, lng: -42.03 },
  'Saquarema': { lat: -22.93, lng: -42.49 },
  'Itacaré': { lat: -14.28, lng: -39.00 },
  'Trancoso': { lat: -16.59, lng: -39.10 },
  'Florianópolis': { lat: -27.60, lng: -48.55 },
  'Imbituba': { lat: -28.24, lng: -48.66 },
};

async function fixCoordinates() {
  console.log('🌍 Iniciando Ajuste de Coerência Geográfica (Land-Lock Protocol)...');
  
  const leads = await prisma.lead.findMany({
    select: { id: true, city: true }
  });

  console.log(`📊 Analisando ${leads.length} leads...`);

  let updated = 0;

  for (const lead of leads) {
    const geo = LAND_COORDINATES[lead.city];
    if (geo) {
      // Jitter reduzido para 0.008 (~800 metros) para evitar dispersão no mar
      const jitterLat = geo.lat + (Math.random() - 0.5) * 0.016;
      const jitterLng = geo.lng + (Math.random() - 0.5) * 0.016;

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          latitude: jitterLat,
          longitude: jitterLng
        }
      });
      updated++;
    }
  }

  console.log(`✅ Ajuste concluído! ${updated} leads reposicionados em terra firme.`);
}

fixCoordinates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
