import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createError } from '@/lib/error-handler';

const ALLOWED_EXTENSIONS: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
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
