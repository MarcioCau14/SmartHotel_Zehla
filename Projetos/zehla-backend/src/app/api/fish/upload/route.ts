import { NextRequest, NextResponse } from 'next/server';

import { Guardian } from '@/lib/security/guardian';
import { prisma } from '@/lib/prisma';


// Helper to normalize phone to Brazilian DDI standard
function normalizeWhatsapp(phone: unknown): string | null {
  try {
  if (!phone) return null;
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 0) return null;
  
  // Se começou sem 55 e tem DDD válido
  if (cleaned.length <= 11 && !cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
}

export async function POST(req: NextRequest) : void {
  // Rate limiting protection
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const isAllowed = await Guardian.checkRateLimit(ip, 'UPLOAD_FISH_LEADS');
  if (!isAllowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { leads } = await req.json();
    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'Nenhum lead fornecido.' }, { status: 400 });
    }

    let importedCount = 0;
    let skippedCount = 0;

    for (const raw of leads) {
      // Auto-mapeamento semântico baseado nos nomes de cabeçalho mais comuns
      const name = raw.name || raw.nome || raw.pousada || raw.estabelecimento || 'Pousada Sem Nome';
      const email = raw.email || raw.mail || raw.contato_email || null;
      const phoneRaw = raw.phone || raw.telefone || raw.whatsapp || raw.celular || null;
      const whatsapp = normalizeWhatsapp(phoneRaw);
      
      const city = raw.city || raw.cidade || 'Unknown';
      const state = raw.state || raw.estado || raw.uf || 'SC';
      const region = raw.region || raw.regiao || 'OUTROS';
      const scoreStr = raw.score || raw.quartos || raw.rooms || '0';
      const score = parseInt(String(scoreStr).replace(/\D/g, '')) || 10;

      if (!whatsapp) {
        skippedCount++;
        continue;
      }

      // Evita duplicados em massa usando a chave do WhatsApp
      const existing = await prisma.lead.findUnique({
        where: { whatsapp }
      });

      if (existing) {
        // Atualiza campos de metadados se já existe
        await prisma.lead.update({
          where: { id: existing.id },
          data: {
            name,
            email: email || existing.email,
            city,
            state,
            region,
            score: score > 0 ? score : existing.score,
            metadata: JSON.stringify(raw)
          }
        });
      } else {
        await prisma.lead.create({
          data: {
            name,
            email,
            whatsapp,
            phone: whatsapp,
            city,
            state,
            region,
            score,
            source: 'SECRETARIA_AI',
            status: 'PROSPECT',
            metadata: JSON.stringify(raw)
          }
        });
      }
      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      skippedCount,
      message: `${importedCount} leads importados com sucesso! (${skippedCount} ignorados por falta de WhatsApp).`
    });

  } catch (error: unknown) {
    console.error('❌ [FISH-UPLOAD] Ingestion failed:', error);
    return NextResponse.json({ error: 'Erro interno ao processar a importação.', details: error.message }, { status: 500 });
  }
}
