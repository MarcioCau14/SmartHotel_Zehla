import { describe, it, expect } from 'vitest'
import { AESGCMEncryptor } from '../../infrastructure/security/AESGCMEncryptor'
import { InMemoryZaosMemoryAdapter } from '../../infrastructure/persistence/memory/InMemoryZaosMemoryAdapter'

describe('AESGCMEncryptor', () => {
  const VALID_KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
  const encryptor = new AESGCMEncryptor(VALID_KEY)

  it('deve criptografar e descriptografar texto simples', () => {
    const plaintext = 'maria@pousadadosol.com.br'

    const encryptedResult = encryptor.encrypt(plaintext)
    expect(encryptedResult.isOk).toBe(true)

    const encrypted = encryptedResult.value
    expect(encrypted.iv).toBeTruthy()
    expect(encrypted.ciphertext).toBeTruthy()
    expect(encrypted.tag).toBeTruthy()
    expect(encrypted.iv.length).toBe(32)
    expect(encrypted.tag.length).toBe(32)

    const decryptedResult = encryptor.decrypt(encrypted)
    expect(decryptedResult.isOk).toBe(true)
    expect(decryptedResult.value).toBe(plaintext)
  })

  it('deve rejeitar chave inválida', () => {
    expect(() => new AESGCMEncryptor('short-key')).toThrow('AES-256-GCM key must be 64 hex characters')
  })

  it('deve produzir ciphertext diferente para mesmo plaintext (IV unique)', () => {
    const plaintext = '+5511999999999'

    const result1 = encryptor.encrypt(plaintext)
    const result2 = encryptor.encrypt(plaintext)

    expect(result1.isOk).toBe(true)
    expect(result2.isOk).toBe(true)

    expect(result1.value.ciphertext).not.toBe(result2.value.ciphertext)
    expect(result1.value.iv).not.toBe(result2.value.iv)
  })

  it('deve falhar ao descriptografar com tag inválida', () => {
    const result = encryptor.decrypt({
      iv: '00000000000000000000000000000000',
      ciphertext: '00000000000000000000000000000000',
      tag: '00',
    })

    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('Invalid authentication tag')
  })

  it('deve falhar ao descriptografar dados corrompidos', () => {
    const plaintext = 'CPF: 123.456.789-00'

    const encryptedResult = encryptor.encrypt(plaintext)
    expect(encryptedResult.isOk).toBe(true)

    const corrupted = {
      ...encryptedResult.value,
      ciphertext: encryptedResult.value.ciphertext.slice(0, -2) + '00',
    }

    const decryptedResult = encryptor.decrypt(corrupted)
    expect(decryptedResult.isFail).toBe(true)
  })

  it('deve criptografar PII de reserva (CPF, email, WhatsApp)', () => {
    const piiFields = {
      cpf: '123.456.789-00',
      email: 'hospede@exemplo.com',
      whatsapp: '+5511988887777',
      nome: 'João Silva',
    }

    for (const [field, value] of Object.entries(piiFields)) {
      const encrypted = encryptor.encrypt(value)
      expect(encrypted.isOk).toBe(true)

      const decrypted = encryptor.decrypt(encrypted.value)
      expect(decrypted.isOk).toBe(true)
      expect(decrypted.value).toBe(value)
    }
  })
})

describe('InMemoryZaosMemoryAdapter', () => {
  const adapter = new InMemoryZaosMemoryAdapter()

  it('deve armazenar e recuperar entrada de memória', async () => {
    const embedding = new Array(384).fill(0.1)

    const result = await adapter.store({
      id: 'mem-001',
      tenantId: 'tenant-praia-do-rosa',
      pousadaId: 'pou-sc-flor-0147',
      content: 'Proprietário prefere WhatsApp para comunicação',
      embedding,
      metadata: { source: 'interaction', category: 'preference' },
    })

    expect(result.isOk).toBe(true)
    expect(result.value.id).toBe('mem-001')
    expect(result.value.createdAt).toBeInstanceOf(Date)

    const getResult = await adapter.getById('mem-001', 'tenant-praia-do-rosa')
    expect(getResult.isOk).toBe(true)
    expect(getResult.value.content).toBe('Proprietário prefere WhatsApp para comunicação')
  })

  it('deve aplicar RLS: isolar por tenantId', async () => {
    const embedding = new Array(384).fill(0.2)

    await adapter.store({
      id: 'mem-tenant-a',
      tenantId: 'tenant-A',
      pousadaId: 'pou-a-001',
      content: 'Dado do tenant A',
      embedding,
      metadata: {},
    })

    await adapter.store({
      id: 'mem-tenant-b',
      tenantId: 'tenant-B',
      pousadaId: 'pou-b-001',
      content: 'Dado do tenant B',
      embedding,
      metadata: {},
    })

    const searchA = await adapter.search({
      embedding,
      tenantId: 'tenant-A',
      limit: 10,
      minScore: 0.0,
    })

    expect(searchA.isOk).toBe(true)
    const resultsA = searchA.value
    expect(resultsA.length).toBe(1)
    expect(resultsA[0].entry.content).toBe('Dado do tenant A')
  })

  it('deve buscar por similaridade cosseno', async () => {
    const baseEmbedding = new Array(384).fill(0.0)
    const similarEmbedding = [...baseEmbedding]
    similarEmbedding[0] = 1.0

    const differentEmbedding = [...baseEmbedding]
    differentEmbedding[0] = -1.0

    await adapter.store({
      id: 'mem-sim-1',
      tenantId: 'tenant-sim',
      pousadaId: 'pou-sim-001',
      content: 'Similar',
      embedding: similarEmbedding,
      metadata: {},
    })

    await adapter.store({
      id: 'mem-sim-2',
      tenantId: 'tenant-sim',
      pousadaId: 'pou-sim-001',
      content: 'Diferente',
      embedding: differentEmbedding,
      metadata: {},
    })

    const results = await adapter.search({
      embedding: similarEmbedding,
      tenantId: 'tenant-sim',
      limit: 10,
      minScore: -1.0,
    })

    expect(results.isOk).toBe(true)
    expect(results.value.length).toBeGreaterThanOrEqual(2)

    const first = results.value[0]
    expect(first.entry.content).toBe('Similar')
    expect(first.score).toBeGreaterThan(0.9)
  })

  it('deve falhar getById para tenant diferente', async () => {
    const result = await adapter.getById('mem-tenant-a', 'tenant-errado')
    expect(result.isFail).toBe(true)
  })

  it('deve filtrar por pousadaId na busca', async () => {
    const embedding = new Array(384).fill(0.3)

    await adapter.store({
      id: 'mem-pou-1',
      tenantId: 'tenant-multi',
      pousadaId: 'pou-alpha',
      content: 'Alpha data',
      embedding,
      metadata: {},
    })

    await adapter.store({
      id: 'mem-pou-2',
      tenantId: 'tenant-multi',
      pousadaId: 'pou-beta',
      content: 'Beta data',
      embedding,
      metadata: {},
    })

    const alphaOnly = await adapter.search({
      embedding,
      tenantId: 'tenant-multi',
      pousadaId: 'pou-alpha',
      limit: 10,
    })

    expect(alphaOnly.isOk).toBe(true)
    expect(alphaOnly.value.length).toBe(1)
    expect(alphaOnly.value[0].entry.pousadaId).toBe('pou-alpha')
  })
})
