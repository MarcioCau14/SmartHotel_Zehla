// scripts/import-leads.ts
// Imports consolidated leads from ZEHLA_FUNNEL_CONSOLIDADO.csv into secretaria-ai

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CsvRow {
  ID: string;
  Pousada: string;
  Email: string;
  WhatsApp: string;
  Qtd_Quartos: string;
  Cidade: string;
  UF: string;
  Latitude: string;
  Longitude: string;
  Tier: string;
  Funnel: string;
  Score_Combinado: string;
  Score_Qualificacao: string;
  Score_Validacao: string;
  Buying_Behavior: string;
  Dor_Principal: string;
  Local_Praia: string;
  Valores_Estimados: string;
  Comportamento_Compra: string;
  Sinais_Intencao: string;
  Redes_Sociais: string;
  Validacao: string;
  Fonte_Arquivo: string;
}

function parseCSV(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length < 2) {
    throw new Error('CSV file is empty or has only header');
  }

  const headers = parseCSVLine(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() || '';
    });

    rows.push(row as unknown as CsvRow);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}

async function main() {
  const csvPath = path.join(process.env.HOME || '', 'Downloads', 'ZEHLA_FUNNEL_CONSOLIDADO.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found at ${csvPath}`);
    process.exit(1);
  }

  console.log('Reading CSV...');
  const rows = parseCSV(csvPath);
  console.log(`Found ${rows.length} rows to import`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    if (!row.Pousada) {
      skipped++;
      continue;
    }

    try {
      const email = row.Email || undefined;
      const whatsapp = row.WhatsApp || undefined;

      const lead = await prisma.lead.upsert({
        where: {
          email: email || `temp_${row.ID}@zeHLA.tmp`,
        },
        create: {
          empresa: row.Pousada,
          name: row.Pousada,
          email: email || `temp_${row.ID}@zeHLA.tmp`,
          whatsapp: whatsapp || null,
          phone: whatsapp || null,
          property: row.Pousada,
          city: row.Cidade || null,
          state: row.UF || null,
          region: row.UF || null,
          score: row.Score_Combinado ? parseInt(row.Score_Combinado) : null,
          source: 'ZEHLA_FUNNEL',
          status: 'PROSPECT',

          latitude: row.Latitude ? parseFloat(row.Latitude) : null,
          longitude: row.Longitude ? parseFloat(row.Longitude) : null,
          scoreValid: row.Score_Validacao ? parseInt(row.Score_Validacao) : 0,
          localPraia: row.Local_Praia || null,
          validationScore: row.Score_Validacao ? parseInt(row.Score_Validacao) : 0,
          validationStatus: row.Validacao || 'pendente',
          funnelStage: row.Funnel || 'COLD',
          cluster: row.Funnel || 'COLD',
          behavioralProfile: row.Comportamento_Compra || null,
          tierConfidence: row.Score_Qualificacao ? parseInt(row.Score_Qualificacao) / 100 : null,
          tierSugerido: row.Tier || null,

          roomsCount: row.Qtd_Quartos ? parseInt(row.Qtd_Quartos) || 0 : 0,
          buyingBehavior: row.Buying_Behavior || null,
          otaDependenceLevel: row.Dor_Principal === 'financeiro' ? 'HIGH' : 'MEDIUM',
          conversionProbability: row.Score_Combinado ? parseInt(row.Score_Combinado) / 100 : 0,
          objectKeywords: row.Dor_Principal || null,
          leadTier: row.Tier || 'LITE',

          estimatedValues: row.Valores_Estimados || null,
          intentSignals: row.Sinais_Intencao || null,
          socialMedia: row.Redes_Sociais || "{}",
          qualification: row.Score_Qualificacao || null,
          observacoes: row.Fonte_Arquivo ? `Imported from: ${row.Fonte_Arquivo}` : null,
        },
        update: {
          name: row.Pousada,
          property: row.Pousada,
          city: row.Cidade || null,
          state: row.UF || null,
          score: row.Score_Combinado ? parseInt(row.Score_Combinado) : null,
          cluster: row.Funnel || 'COLD',
          funnelStage: row.Funnel || 'COLD',
          roomsCount: row.Qtd_Quartos ? parseInt(row.Qtd_Quartos) || 0 : 0,
          buyingBehavior: row.Buying_Behavior || null,
          leadTier: row.Tier || 'LITE',
          tierSugerido: row.Tier || null,
          behavioralProfile: row.Comportamento_Compra || null,
        },
      });

      imported++;

      if (imported % 500 === 0) {
        console.log(`Imported ${imported}/${rows.length}...`);
      }
    } catch (err: any) {
      if (err.code === 'P2002') {
        skipped++;
      } else {
        errors++;
        if (errors <= 5) {
          console.error(`Error importing row ${row.ID}: ${err.message}`);
        }
      }
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Imported: ${imported}`);
  console.log(`Skipped (duplicates): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total processed: ${rows.length}`);

  const stats = await prisma.lead.groupBy({
    by: ['cluster'],
    _count: true,
  });

  console.log('\n=== Cluster Distribution ===');
  for (const s of stats) {
    console.log(`  ${s.cluster}: ${s._count}`);
  }

  const tierStats = await prisma.lead.groupBy({
    by: ['leadTier'],
    _count: true,
  });

  console.log('\n=== Tier Distribution ===');
  for (const s of tierStats) {
    console.log(`  ${s.leadTier}: ${s._count}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
