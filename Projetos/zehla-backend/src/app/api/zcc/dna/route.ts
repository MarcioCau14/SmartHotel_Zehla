import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/security/tenant-context';

export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { tone, proactivity, emojiLevel, formality, discounts, pains, voiceSamples } = body;

    // 1. Atualizar Perfil de Tom
    await prisma.toneProfile.upsert({
      where: { propertyId: tenantId },
      update: {
        tonePosition: tone,
        toneProactivity: proactivity,
        toneEmojiLevel: emojiLevel,
        toneFormality: formality,
        voiceSample1: voiceSamples.s1,
        voiceSample2: voiceSamples.s2,
        voiceSample3: voiceSamples.s3,
      },
      create: {
        propertyId: tenantId,
        tonePosition: tone,
        toneProactivity: proactivity,
        toneEmojiLevel: emojiLevel,
        toneFormality: formality,
        voiceSample1: voiceSamples.s1,
        voiceSample2: voiceSamples.s2,
        voiceSample3: voiceSamples.s3,
      }
    });

    // 2. Atualizar Chaves de Desconto
    // Primeiro remove as antigas para este tenant
    await prisma.discountKey.deleteMany({
      where: { propertyId: tenantId }
    });

    // Insere as novas
    const discountData = Object.entries(discounts).map(([type, value]) => ({
      propertyId: tenantId,
      type,
      maxPercent: (value as number) / 100,
    }));

    await prisma.discountKey.createMany({
      data: discountData
    });

    // 3. Atualizar Dores Operacionais
    await prisma.operationalPain.deleteMany({
      where: { propertyId: tenantId }
    });

    const painData = pains.map((score: number, idx: number) => ({
      propertyId: tenantId,
      questionId: idx + 1,
      score,
      priority: score >= 4
    }));

    await prisma.operationalPain.createMany({
      data: painData
    });

    return NextResponse.json({ success: true, message: 'DNA mapeado com sucesso!' });
  } catch (error) {
    console.error('[DNA_SAVE_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao salvar configurações de DNA' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const [tone, keys, pains] = await Promise.all([
      prisma.toneProfile.findUnique({ where: { propertyId: tenantId } }),
      prisma.discountKey.findMany({ where: { propertyId: tenantId } }),
      prisma.operationalPain.findMany({ where: { propertyId: tenantId } })
    ]);

    return NextResponse.json({ tone, keys, pains });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados de DNA' }, { status: 500 });
  }
}
