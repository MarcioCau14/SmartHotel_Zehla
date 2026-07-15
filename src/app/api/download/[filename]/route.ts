import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createError } from '@/lib/error-handler';
import { apiRatelimit } from '@/lib/rate-limit';

const ALLOWED_EXTENSIONS: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  // Manual rate limiting (withSecurity can't be used on dynamic routes — params would be lost)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const pathname = new URL(request.url).pathname;
  try {
    const rl = await apiRatelimit.limit(`api:${clientIp}:${pathname}`);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'RATE_LIMITED', message: 'Muitas requisições. Tente novamente em breve.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } },
      );
    }
  } catch {
    // Fail-open for availability
  }

  try {
    const { filename } = await params;

    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return createError(400, 'INVALID_FILENAME', 'Nome de arquivo inválido');
    }

    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS[ext]) {
      return createError(400, 'BLOCKED_EXTENSION', `Extensão .${ext} não permitida`);
    }

    const filePath = path.join(DOWNLOADS_DIR, filename);

    if (!filePath.startsWith(DOWNLOADS_DIR)) {
      return createError(400, 'PATH_TRAVERSAL', 'Path traversal detectado');
    }

    let buffer: Buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch {
      return createError(404, 'FILE_NOT_FOUND', 'Arquivo não encontrado');
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': ALLOWED_EXTENSIONS[ext],
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return createError(500, 'DOWNLOAD_ERROR', 'Erro ao processar download', error instanceof Error ? error.message : undefined);
  }
}