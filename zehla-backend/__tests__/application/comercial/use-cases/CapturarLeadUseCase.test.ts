import { describe, it, expect } from 'vitest'
import { CapturarLeadUseCase } from '../../../../src/application/comercial/use-cases/CapturarLeadUseCase'
import { FakeLeadRepository } from '../fakes/FakeLeadRepository'
import { Lead } from '../../../../src/domain/comercial/entities/Lead'

describe('CapturarLeadUseCase', () => {
  it('should capture a new lead successfully with minimal data', async () => {
    const leadPort = new FakeLeadRepository()
    const useCase = new CapturarLeadUseCase(leadPort)

    const result = await useCase.execute({
      canal: 'whatsapp',
      propriedadeId: 'prop_123',
      nome: 'João da Silva',
      email: 'joao@example.com',
      telefone: '5511999999999'
    })

    expect(result.isOk).toBe(true)
    const lead = result.value
    expect(lead).toBeDefined()
    expect(lead.id).toBeDefined()
    expect(lead.nome).toBe('João da Silva')
    expect(lead.email?.valor).toBe('joao@example.com')
    expect(lead.status).toBe('prospect')

    // Confirmar persistência no fake repositório
    const leadPersistidoResult = await leadPort.buscarLeadPorId(lead.id, 'prop_123')
    expect(leadPersistidoResult.isOk).toBe(true)
    expect(leadPersistidoResult.value).not.toBeNull()
  })

  it('should re-engage a lost or inactive lead instead of throwing error', async () => {
    const leadPort = new FakeLeadRepository()
    const useCase = new CapturarLeadUseCase(leadPort)

    // Criar um lead perdido previamente
    const leadFakeResult = await leadPort.criarLead({
      canal: 'instagram',
      propriedadeId: 'prop_123',
      nome: 'Maria Souza',
      email: 'maria@example.com'
    })
    expect(leadFakeResult.isOk).toBe(true)
    const leadFake = leadFakeResult.value

    // Forçar status para 'perdido'
    const leadPerdidoResult = await leadPort.atualizarLead(leadFake.id, leadFake.propriedadeId, {
      status: 'churned'
    })
    expect(leadPerdidoResult.isOk).toBe(true)
    expect(leadPerdidoResult.value.status).toBe('churned')

    // Tentar capturar novamente com o mesmo e-mail (deve reativar)
    const reativarResult = await useCase.execute({
      canal: 'instagram',
      propriedadeId: 'prop_123',
      nome: 'Maria Souza Reativada',
      email: 'maria@example.com'
    })

    expect(reativarResult.isOk).toBe(true)
    const leadReativado = reativarResult.value
    expect(leadReativado.id).toBe(leadFake.id)
    expect(leadReativado.status).toBe('reactivated')

    // Verificar se foi persistido como novo no repo
    const checkResult = await leadPort.buscarLeadPorId(leadFake.id, 'prop_123')
    expect(checkResult.isOk).toBe(true)
    expect(checkResult.value?.status).toBe('reactivated')
  })

  it('should return failure if lead already exists and is active', async () => {
    const leadPort = new FakeLeadRepository()
    const useCase = new CapturarLeadUseCase(leadPort)

    // Criar lead ativo ('novo')
    await leadPort.criarLead({
      canal: 'whatsapp',
      propriedadeId: 'prop_123',
      nome: 'Carlos Santos',
      email: 'carlos@example.com'
    })

    // Tentar capturar duplicado
    const result = await useCase.execute({
      canal: 'whatsapp',
      propriedadeId: 'prop_123',
      nome: 'Carlos Santos Duplicado',
      email: 'carlos@example.com'
    })

    expect(result.isFail).toBe(true)
    expect(result.error?.message).toContain('Lead already exists')
  })

  it('should fail with invalid email', async () => {
    const leadPort = new FakeLeadRepository()
    const useCase = new CapturarLeadUseCase(leadPort)

    const result = await useCase.execute({
      canal: 'whatsapp',
      propriedadeId: 'prop_123',
      nome: 'Invalido',
      email: 'email-invalido'
    })

    expect(result.isFail).toBe(true)
  })

  it('should fail with invalid canal', async () => {
    const leadPort = new FakeLeadRepository()
    const useCase = new CapturarLeadUseCase(leadPort)

    const result = await useCase.execute({
      canal: 'canal-invalido',
      propriedadeId: 'prop_123',
      nome: 'Nome'
    })

    expect(result.isFail).toBe(true)
  })
})
