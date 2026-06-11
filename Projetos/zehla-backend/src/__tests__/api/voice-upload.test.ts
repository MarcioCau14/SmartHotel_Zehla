import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/zcc/voice/upload/route';
import { NextRequest } from 'next/server';
import { getTenantId } from '@/lib/security/tenant-context';
import fs from 'fs';
import path from 'path';

vi.mock('@/lib/security/tenant-context', () => ({
  getTenantId: vi.fn(async () => 'pousada-test-999'),
}));

describe('Voice Upload API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar requisição sem arquivo', async () => {
    const formData = new FormData();
    const req = new NextRequest('http://localhost/api/zcc/voice/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Nenhum arquivo enviado.');
  });

  it('deve rejeitar arquivo com tipo de mídia não permitido', async () => {
    const file = new File(['dummy-content'], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new NextRequest('http://localhost/api/zcc/voice/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Formato de arquivo não suportado');
  });

  it('deve aceitar arquivo de áudio válido e salvar localmente', async () => {
    const file = new File(['dummy-wav-content'], 'sample.wav', { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new NextRequest('http://localhost/api/zcc/voice/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.url).toContain('/uploads/voice/voice_sample_pousada-test-999_');

    // Limpar arquivo gerado pelo teste
    const filename = data.url.replace('/uploads/voice/', '');
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'voice', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  it('deve rejeitar arquivos que ultrapassem o limite de 10MB', async () => {
    const bigBlob = new Blob([new Uint8Array(11 * 1024 * 1024)]); // 11MB
    const file = new File([bigBlob], 'large.mp3', { type: 'audio/mp3' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new NextRequest('http://localhost/api/zcc/voice/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Arquivo muito grande');
  });
});
