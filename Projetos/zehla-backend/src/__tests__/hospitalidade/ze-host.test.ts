import { describe, it, expect, beforeEach } from 'vitest'
import { ZeHostUseCase } from '../../application/hospitalidade/ze-host/ZeHostUseCase'
import { HMACValidator } from '../../infrastructure/hardening/HMACValidator'
import { SwarmCoordinator } from '../../domain/swarm/services/SwarmCoordinator'
import type { EscalacaoPackage } from '../../application/hospitalidade/ze-concierge/ZeConciergeTypes'

const ZCP_SECRET = 'ze-host-test-secret-key'

function makeValidPackage(overrides: Partial<EscalacaoPackage> = {}): EscalacaoPackage {
  const hmac = new HMACValidator()
  const base: Omit<EscalacaoPackage, 'zcpSignature' | 'zcpSignedAt'> = {
    packageId: 'zcp-esc-test-001',
    timestamp: new Date().toISOString(),
    origem: 'ze-concierge',
    destino: 'ze-host',
    bookingId: 'bk-test-001',
    guestId: 'guest-test-001',
    notaGeral: 2,
    comentarioSanitizado: 'Cama desconfortável e barulho à noite',
    piiTokenizado: false,
    padroesBloqueados: [],
    violacoesDogmaticas: [],
    piiEncontrado: 0,
    threatDetected: false,
    canaryTriggersFound: [],
  }
  const merged = { ...base, ...overrides }
  const signature = hmac.sign(JSON.stringify(merged), ZCP_SECRET)
  return {
    ...merged,
    zcpSignature: overrides.zcpSignature ?? signature,
    zcpSignedAt: overrides.zcpSignedAt ?? new Date().toISOString(),
  }
}

function makeTamperedPackage(sobreescrever: Partial<EscalacaoPackage>): EscalacaoPackage {
  const pkg = makeValidPackage()
  return { ...pkg, ...sobreescrever }
}

describe('ZeHostUseCase — Córtex Executivo (Zero-Trust Reception + Swarm Delegation)', () => {
  let zeHost: ZeHostUseCase
  let hmac: HMACValidator
  let swarm: SwarmCoordinator

  beforeEach(() => {
    hmac = new HMACValidator()
    swarm = new SwarmCoordinator()
    zeHost = new ZeHostUseCase(hmac, ZCP_SECRET, swarm)
  })

  it('deve REJEITAR pacote com assinatura HMAC ausente', () => {
    const pkg = makeTamperedPackage({ zcpSignature: '' })
    const result = zeHost.execute(pkg)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('ZCP_HMAC_INVALID')
  })

  it('deve REJEITAR pacote com assinatura HMAC adulterada', () => {
    const pkg = makeTamperedPackage({ zcpSignature: '0000000000000000000000000000000000000000000000000000000000000000' })
    const result = zeHost.execute(pkg)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('ZCP_HMAC_INVALID')
  })

  it('deve REJEITAR pacote com payload adulterado (bookingId trocado)', () => {
    const pkg = makeTamperedPackage({ bookingId: 'bk-ROUBADO' })
    const result = zeHost.execute(pkg)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('ZCP_HMAC_INVALID')
  })

  it('deve REJEITAR pacote com guestId adulterado', () => {
    const pkg = makeTamperedPackage({ guestId: 'guest-invasor' })
    const result = zeHost.execute(pkg)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('ZCP_HMAC_INVALID')
  })

  it('deve REJEITAR pacote com notaGeral adulterada', () => {
    const pkg = makeTamperedPackage({ notaGeral: 10 })
    const result = zeHost.execute(pkg)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toContain('ZCP_HMAC_INVALID')
  })

  it('deve ACEITAR pacote valido e executar ciclo OODA completo', () => {
    const pkg = makeValidPackage()
    const result = zeHost.execute(pkg)
    expect(result.isOk).toBe(true)
    const output = result.value
    expect(output.loopId).toContain('rl-')
    expect(output.packageId).toBe(pkg.packageId)
    expect(output.phase).toBe('completed')
    expect(output.goal).toBeTruthy()
    expect(output.goal).toContain(pkg.guestId)
    expect(output.evaluation).not.toBeNull()
    expect(output.subagents.length).toBeGreaterThan(0)
  })

  it('deve delegar para Zé-Analyst quando feedback menciona preco', () => {
    const pkg = makeValidPackage({ comentarioSanitizado: 'O preço da diária está muito alto, precisa de desconto para voltar' })
    const result = zeHost.execute(pkg)
    expect(result.isOk).toBe(true)
    const subagentRoles = result.value.subagents.map(s => s.role)
    expect(subagentRoles).toContain('pricing')
    expect(subagentRoles).toContain('analyst')
    expect(result.value.goal).toContain('precificação')
  })

  it('deve delegar para Zé-Ops quando feedback menciona limpeza', () => {
    const pkg = makeValidPackage({ comentarioSanitizado: 'O quarto estava sujo e o chuveiro quebrado' })
    const result = zeHost.execute(pkg)
    expect(result.isOk).toBe(true)
    const subagentRoles = result.value.subagents.map(s => s.role)
    expect(subagentRoles).toContain('concierge')
    expect(result.value.goal).toContain('limpeza')
  })

  it('deve delegar para Zé-Ops quando feedback menciona manutencao', () => {
    const pkg = makeValidPackage({ comentarioSanitizado: 'Precisa de reparo no ar condicionado, nao funciona' })
    const result = zeHost.execute(pkg)
    expect(result.isOk).toBe(true)
    const subagentRoles = result.value.subagents.map(s => s.role)
    expect(subagentRoles).toContain('concierge')
    expect(result.value.goal).toContain('manutenção')
  })

  it('deve repassar threatEscalation=true quando pacote tem canary trigger', () => {
    const pkg = makeValidPackage({
      threatDetected: true,
      canaryTriggersFound: ['admin_token_bypass'],
      comentarioSanitizado: 'Hotel horrível',
    })
    const result = zeHost.execute(pkg)
    expect(result.isOk).toBe(true)
    expect(result.value.threatEscalation).toBe(true)
  })

  it('deve incluir feedback sanitizado no output', () => {
    const pkg = makeValidPackage({ comentarioSanitizado: 'Quarto muito pequeno' })
    const result = zeHost.execute(pkg)
    expect(result.isOk).toBe(true)
    expect(result.value.sanitizedFeedback).toBe('Quarto muito pequeno')
  })

  it('deve completar loop com subagentes em fase completed', () => {
    const pkg = makeValidPackage({ comentarioSanitizado: 'Café da manhã frio' })
    const result = zeHost.execute(pkg)
    expect(result.isOk).toBe(true)
    expect(result.value.phase).toBe('completed')
    for (const agent of result.value.subagents) {
      expect(agent.id).toBeTruthy()
      expect(agent.role).toBeTruthy()
      expect(agent.status).toBeTruthy()
    }
  })
})
