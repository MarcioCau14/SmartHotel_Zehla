import { NextRequest, NextResponse } from 'next/server';
import { getTenantId } from '@/lib/security/tenant-context';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'audio/wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/ogg',
      'audio/x-m4a',
      'audio/m4a',
      'audio/webm',
      'audio/x-wav',
      'application/octet-stream'
    ];
    const fileExtension = path.extname(file.name).toLowerCase();
    const allowedExtensions = ['.wav', '.mp3', '.ogg', '.m4a', '.webm'];

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Formato de arquivo não suportado. Envie um áudio (.wav, .mp3, .ogg, .m4a ou .webm).' },
        { status: 400 }
      );
    }

    // Limite de tamanho: 10MB
    const limit = 10 * 1024 * 1024;
    if (file.size > limit) {
      return NextResponse.json({ error: 'Arquivo muito grande. O limite máximo é 10MB.' }, { status: 400 });
    }

    // Caminho da pasta pública de uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'voice');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    // Garante uma extensão de arquivo padrão se não vier nenhuma
    const ext = fileExtension || '.wav';
    const safeFilename = `voice_sample_${tenantId}_${timestamp}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);

    // Converter buffer do arquivo e gravar em disco
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/voice/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      sizeBytes: file.size,
    });
  } catch (error: any) {
    console.error('❌ [POST /api/zcc/voice/upload] Erro:', error);
    return NextResponse.json({ error: 'Falha ao processar upload do áudio' }, { status: 500 });
  }
}
