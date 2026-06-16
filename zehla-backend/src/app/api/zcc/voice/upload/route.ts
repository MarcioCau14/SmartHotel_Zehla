import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  let audioBase64: string | null = null;
  try {
    const body = await request.json();
    const { propertyId } = body;
    audioBase64 = body.audioBase64;

    if (!propertyId || !audioBase64) {
      return NextResponse.json(
        { error: 'propertyId e audioBase64 são obrigatórios' },
        { status: 400 }
      );
    }

    // 1. Calcular o hash criptográfico do áudio de referência (ZDR Audit Requirement)
    const hash = crypto.createHash('sha256').update(audioBase64).digest('hex');

    // 2. Simular a calibração espectral ou obter os pesos customizados dos sliders
    let acousticWeights;
    if (audioBase64.startsWith('SLIDERS_')) {
      const parts = audioBase64.split('_');
      acousticWeights = {
        formality: parseInt(parts[1], 10) || 50,
        energy: parseInt(parts[2], 10) || 50,
        warmth: parseInt(parts[3], 10) || 50,
        energy_warmth: Math.round(((parseInt(parts[2], 10) || 50) + (parseInt(parts[3], 10) || 50)) / 2),
        authority: parseInt(parts[4], 10) || 50,
        speed: parseInt(parts[5], 10) || 50,
      };
    } else {
      // O DNA espectral é composto por 5 eixos principais do DNAMapper
      // Geramos pesos baseados em uma semente estável do hash para manter consistência por áudio
      const charCodesSum = hash.split('').slice(0, 10).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const getWeight = (offset: number) => 30 + ((charCodesSum + offset) % 61); // Retorna entre 30 e 90

      acousticWeights = {
        formality: getWeight(10),
        energy: getWeight(20),
        warmth: getWeight(30),
        energy_warmth: getWeight(35),
        authority: getWeight(40),
        speed: getWeight(50),
      };
    }

    // 3. Persistir os dados no banco usando Upsert
    const voiceDna = await prisma.voiceDNA.upsert({
      where: { propertyId },
      update: {
        acousticWeights,
        referenceHash: hash,
      },
      create: {
        propertyId,
        acousticWeights,
        referenceHash: hash,
      },
    });

    // 4. Logar no sistema (Auditoria ZCC)
    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        component: 'VoiceStudio',
        message: `Acoustic DNA calibrated for property ${propertyId}. Hash: ${hash.substring(0, 8)}...`,
        metadata: JSON.stringify({ propertyId, hash: hash.substring(0, 12) }),
      },
    });

    // 5. ZDR: Vaporizar dados brutos de áudio da RAM imediatamente
    audioBase64 = null;
    if (global.gc) {
      global.gc();
    }

    return NextResponse.json({
      success: true,
      data: {
        id: voiceDna.id,
        propertyId: voiceDna.propertyId,
        acousticWeights: voiceDna.acousticWeights,
        referenceHash: voiceDna.referenceHash,
        updatedAt: voiceDna.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    // Forçar limpeza mesmo em caso de erro
    audioBase64 = null;
    if (global.gc) {
      global.gc();
    }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId é obrigatório' }, { status: 400 });
    }

    const voiceDna = await prisma.voiceDNA.findUnique({
      where: { propertyId },
    });

    if (!voiceDna) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: voiceDna.id,
        propertyId: voiceDna.propertyId,
        acousticWeights: voiceDna.acousticWeights,
        referenceHash: voiceDna.referenceHash,
        updatedAt: voiceDna.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
