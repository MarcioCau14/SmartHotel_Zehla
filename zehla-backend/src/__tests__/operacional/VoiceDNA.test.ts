import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../../app/api/zcc/voice/upload/route';
import { prisma } from '@/lib/prisma';

// Mock do prisma
vi.mock('@/lib/prisma', () => {
  const mockVoiceDna = {
    id: 'voice_dna_123',
    propertyId: 'prop_sc_flor_001',
    acousticWeights: {
      formality: 50,
      energy: 60,
      warmth: 70,
      energy_warmth: 65,
      authority: 80,
      speed: 90,
    },
    referenceHash: 'sha256-mock-hash',
    updatedAt: new Date(),
  };

  return {
    prisma: {
      voiceDNA: {
        upsert: vi.fn().mockImplementation(({ update, create }) => {
          return Promise.resolve({
            id: 'voice_dna_123',
            propertyId: create.propertyId,
            acousticWeights: update.acousticWeights,
            referenceHash: update.referenceHash,
            updatedAt: new Date(),
          });
        }),
        findUnique: vi.fn().mockResolvedValue(mockVoiceDna),
      },
      systemLog: {
        create: vi.fn().mockResolvedValue({ id: 'log_123' }),
      },
    },
  };
});

describe('Voice Studio V2 — VoiceDNA and API Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process audioBase64 upload, calculate hash/weights, and upsert VoiceDNA (ZDR validation)', async () => {
    const propertyId = 'prop_sc_flor_001';
    const audioBase64 = 'UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

    const req = new Request('http://localhost:3000/api/zcc/voice/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, audioBase64 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.propertyId).toBe(propertyId);
    expect(json.data.referenceHash).toBeDefined();
    expect(json.data.acousticWeights).toBeDefined();

    // Verifies Prisma upsert was triggered
    expect(prisma.voiceDNA.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.systemLog.create).toHaveBeenCalledTimes(1);
  });

  it('should parse manual slider weights if payload starts with SLIDERS_', async () => {
    const propertyId = 'prop_sc_flor_001';
    // Formality=80, Energy=40, Warmth=90, Authority=30, Speed=70
    const audioBase64 = 'SLIDERS_80_40_90_30_70';

    const req = new Request('http://localhost:3000/api/zcc/voice/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, audioBase64 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.acousticWeights.formality).toBe(80);
    expect(json.data.acousticWeights.energy).toBe(40);
    expect(json.data.acousticWeights.warmth).toBe(90);
    expect(json.data.acousticWeights.energy_warmth).toBe(65); // Math.round((40+90)/2)
    expect(json.data.acousticWeights.authority).toBe(30);
    expect(json.data.acousticWeights.speed).toBe(70);
  });

  it('should get VoiceDNA for a specific propertyId', async () => {
    const req = new Request('http://localhost:3000/api/zcc/voice/upload?propertyId=prop_sc_flor_001', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.propertyId).toBe('prop_sc_flor_001');
    expect(prisma.voiceDNA.findUnique).toHaveBeenCalledTimes(1);
  });
});
