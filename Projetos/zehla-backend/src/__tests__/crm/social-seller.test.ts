import { describe, it, expect } from 'vitest'
import { SocialInteraction } from '../../domain/crm/models/SocialInteraction'
import { AnalyzeSocialIntentSignature } from '../../domain/crm/cognitive/AnalyzeSocialIntentSignature'
import { SocialSellerService } from '../../domain/crm/services/SocialSellerService'
import { CRMPipelineStage } from '../../domain/crm/models/CRMPipelineStage'

describe('SocialInteraction', () => {
  it('deve criar interação válida', () => {
    const result = SocialInteraction.create({
      platform: 'INSTAGRAM',
      username: '@maria_viajante',
      content: 'Qual o preço da diária?',
      timestamp: 1000,
      isDirectMessage: false,
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.data.platform).toBe('INSTAGRAM')
      expect(result.value.data.content).toBe('Qual o preço da diária?')
      expect(result.value.data.isDirectMessage).toBe(false)
    }
  })

  it('deve rejeitar plataforma inválida', () => {
    const result = SocialInteraction.create({
      platform: 'TIKTOK' as any,
      username: '@maria',
      content: 'Olá',
      timestamp: 1000,
      isDirectMessage: false,
    })
    expect(result.isOk).toBe(false)
  })

  it('deve rejeitar username vazio', () => {
    const result = SocialInteraction.create({
      platform: 'FACEBOOK',
      username: '',
      content: 'Olá',
      timestamp: 1000,
      isDirectMessage: true,
    })
    expect(result.isOk).toBe(false)
  })

  it('deve rejeitar conteúdo vazio', () => {
    const result = SocialInteraction.create({
      platform: 'INSTAGRAM',
      username: '@joao',
      content: '',
      timestamp: 1000,
      isDirectMessage: false,
    })
    expect(result.isOk).toBe(false)
  })

  it('deve congelar a instância (imutável)', () => {
    const result = SocialInteraction.create({
      platform: 'INSTAGRAM',
      username: '@maria',
      content: 'Olá',
      timestamp: 1000,
      isDirectMessage: false,
    })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(Object.isFrozen(result.value)).toBe(true)
    }
  })
})

describe('AnalyzeSocialIntentSignature', () => {
  describe('classifyIntent (classificador baseado em regras)', () => {
    it('deve detectar intenção de compra em pergunta de preço', () => {
      const result = AnalyzeSocialIntentSignature.classifyIntent('Qual o preço da diária para casal?')
      expect(result.hasBuyingIntent).toBe(true)
    })

    it('deve detectar intenção de compra em "quanto custa"', () => {
      const result = AnalyzeSocialIntentSignature.classifyIntent('Quanto custa a suíte luxo?')
      expect(result.hasBuyingIntent).toBe(true)
    })

    it('deve detectar intenção de compra em "quero reservar"', () => {
      const result = AnalyzeSocialIntentSignature.classifyIntent('Quero reservar para o fim de semana')
      expect(result.hasBuyingIntent).toBe(true)
    })

    it('NÃO deve detectar intenção em comentário neutro', () => {
      const result = AnalyzeSocialIntentSignature.classifyIntent('Que foto linda!')
      expect(result.hasBuyingIntent).toBe(false)
    })

    it('NÃO deve detectar intenção em comentário genérico', () => {
      const result = AnalyzeSocialIntentSignature.classifyIntent('Amei! 😍')
      expect(result.hasBuyingIntent).toBe(false)
    })

    it('deve classificar urgência HIGH quando menciona "hoje"', () => {
      const result = AnalyzeSocialIntentSignature.classifyIntent('Preciso de um quarto hoje!')
      expect(result.urgencyLevel).toBe('HIGH')
    })

    it('deve classificar urgência MEDIUM quando menciona "essa semana"', () => {
      const result = AnalyzeSocialIntentSignature.classifyIntent('Quero ir essa semana')
      expect(result.urgencyLevel).toBe('MEDIUM')
    })

    it('deve extrair telefone quando presente', () => {
      const result = AnalyzeSocialIntentSignature.classifyIntent('Quero reservar, meu whats é 11999999999')
      expect(result.extractedPhone).toBe('11999999999')
    })

    it('deve retornar null para extractedPhone quando não há telefone', () => {
      const result = AnalyzeSocialIntentSignature.classifyIntent('Qual o valor?')
      expect(result.extractedPhone).toBeNull()
    })
  })

  describe('buildFullPrompt', () => {
    it('deve construir prompt com sistema e usuário', () => {
      const sig = new AnalyzeSocialIntentSignature({
        content: 'Quanto custa?',
        platform: 'INSTAGRAM',
        isDirectMessage: false,
      })
      const prompt = sig.buildFullPrompt()
      expect(prompt.systemPrompt).toContain('Analisador de intenção de compra')
      expect(prompt.userPrompt).toContain('Quanto custa?')
      expect(prompt.userPrompt).toContain('INSTAGRAM')
    })

    it('deve rejeitar content vazio no construtor', () => {
      expect(() => new AnalyzeSocialIntentSignature({
        content: '',
        platform: 'INSTAGRAM',
        isDirectMessage: false,
      })).toThrow('content é obrigatório')
    })
  })
})

describe('SocialSellerService', () => {
  it('deve criar CRMLeadProfile para interação com intenção de compra (INSTAGRAM)', () => {
    const interaction = SocialInteraction.create({
      platform: 'INSTAGRAM',
      username: '@maria_viajante',
      content: 'Qual o preço da diária?',
      timestamp: 1000,
      isDirectMessage: false,
    })
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    const service = new SocialSellerService(AnalyzeSocialIntentSignature.classifyIntent)
    const result = service.execute(interaction.value)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.canalOrigem).toBe('INSTAGRAM')
      expect(result.value.stage).toBe(CRMPipelineStage.ENTRADA)
      expect(result.value.ltvScore).toBe(15)
    }
  })

  it('deve criar CRMLeadProfile para interação via FACEBOOK DM', () => {
    const interaction = SocialInteraction.create({
      platform: 'FACEBOOK',
      username: 'João Silva',
      content: 'Quero reservar um quarto para o feriado',
      timestamp: 2000,
      isDirectMessage: true,
    })
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    const service = new SocialSellerService(AnalyzeSocialIntentSignature.classifyIntent)
    const result = service.execute(interaction.value)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.canalOrigem).toBe('FACEBOOK')
      expect(result.value.stage).toBe(CRMPipelineStage.ENTRADA)
    }
  })

  it('deve retornar erro para interação SEM intenção de compra', () => {
    const interaction = SocialInteraction.create({
      platform: 'INSTAGRAM',
      username: '@fotografia_arte',
      content: 'Que foto linda!',
      timestamp: 3000,
      isDirectMessage: false,
    })
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    const service = new SocialSellerService(AnalyzeSocialIntentSignature.classifyIntent)
    const result = service.execute(interaction.value)
    expect(result.isOk).toBe(false)
    if (result.isFail) {
      expect(result.error.message).toBe('Sem intenção comercial detectada')
    }
  })

  it('deve retornar erro para comentário genérico sem intenção', () => {
    const interaction = SocialInteraction.create({
      platform: 'INSTAGRAM',
      username: '@curtidor',
      content: 'Amei! 😍',
      timestamp: 4000,
      isDirectMessage: false,
    })
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    const service = new SocialSellerService(AnalyzeSocialIntentSignature.classifyIntent)
    const result = service.execute(interaction.value)
    expect(result.isOk).toBe(false)
  })

  it('deve extrair telefone e definir ltvScore baseado na urgência HIGH', () => {
    const interaction = SocialInteraction.create({
      platform: 'INSTAGRAM',
      username: '@urgente',
      content: 'Preciso de um quarto hoje, meu whats 11988887777',
      timestamp: 5000,
      isDirectMessage: true,
    })
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    const service = new SocialSellerService(AnalyzeSocialIntentSignature.classifyIntent)
    const result = service.execute(interaction.value)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.telefone).toBe('11988887777')
      expect(result.value.ltvScore).toBe(60)
    }
  })

  it('deve mapear lead para estágio ENTRADA', () => {
    const interaction = SocialInteraction.create({
      platform: 'INSTAGRAM',
      username: '@lead_novo',
      content: 'Quanto custa?',
      timestamp: 6000,
      isDirectMessage: false,
    })
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    const service = new SocialSellerService(AnalyzeSocialIntentSignature.classifyIntent)
    const result = service.execute(interaction.value)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.stage).toBe(CRMPipelineStage.ENTRADA)
      expect(result.value.tags).toContain('social')
      expect(result.value.tags).toContain('platform_INSTAGRAM')
    }
  })

  it('deve retornar erro se o serviço receber interação sem intenção via WHATSAPP_STATUS', () => {
    const interaction = SocialInteraction.create({
      platform: 'WHATSAPP_STATUS',
      username: '@status_viewer',
      content: 'Bom dia!',
      timestamp: 7000,
      isDirectMessage: false,
    })
    expect(interaction.isOk).toBe(true)
    if (!interaction.isOk) return

    const service = new SocialSellerService(AnalyzeSocialIntentSignature.classifyIntent)
    const result = service.execute(interaction.value)
    expect(result.isOk).toBe(false)
  })
})
