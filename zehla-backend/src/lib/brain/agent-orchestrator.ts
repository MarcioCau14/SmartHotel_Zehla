import { hasFeature } from './feature-guard'
import { ReceiptExtractor } from './receipt-extractor'
import { calculateFees } from '@/lib/finance/fee-calculator'

export class AgentOrchestrator {
  async process(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now()
    const { propertyId, message = '', context = {} } = request

    // HARDENING: Sanitização contra Prompt Injections
    const sanitizedInput = sanitizePrompt(message)
    const hasInjectionAttempt = sanitizedInput.includes('[REDACTED_ATTEMPT]')

    if (hasInjectionAttempt) {
      await prisma.securityAlert.create({
        data: {
          tenantId: propertyId,
          alertType: 'PROMPT_INJECTION',
          severity: 'HIGH',
          metadata: JSON.stringify({
            originalMessage: message,
            context
          })
        }
      })

      return {
        success: false,
        agent: 'SYSTEM',
        intent: 'UNKNOWN',
        confidence: 0,
        response: 'Desculpe, ocorreu uma violação das políticas de segurança na sua mensagem.',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime
      }
    }

    // HARDENING: Mascaramento de PII (ZDR 2.0)
    const piiResult = scanAndMaskPII(sanitizedInput)
    const safeMessage = piiResult.masked

    // 1. Classificar intent
    const classified = await classifyIntent(safeMessage)
    const intent = classified.intent


    // 2. Buscar contexto da propriedade e validar Trial
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { rooms: true, reservations: { where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } } } }
    })

    if (!property) {
      return this.buildError('Property not found', startTime)
    }

    // TRAVA DE SEGURANÇA: Validação de Trial de 7 Dias
    const isTrialExpired = property.isTrial && property.trialEndsAt && property.trialEndsAt < new Date();
    if (isTrialExpired || property.status === 'TRIAL_EXPIRED') {
      if (property.status !== 'TRIAL_EXPIRED') {
        await prisma.property.update({
          where: { id: propertyId },
          data: { status: 'TRIAL_EXPIRED' }
        });
      }

      return {
        success: false,
        agent: 'SYSTEM',
        intent: 'UNKNOWN',
        confidence: 0,
        response: '[ZEHLA OFFLINE]: O período de teste da pousada expirou. O atendimento automático está suspenso até a ativação do plano pelo proprietário.',
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime
      };
    }

    // 3. Aprendizado de Tom de Voz (Machine Learning) para planos compatíveis
    let learnedPersonaPrompt = ''
    if (hasFeature(property.plan, 'WHATSAPP_LEARNING')) {
      const persona = await WhatsappPersonaLearner.getPersona(propertyId)
      learnedPersonaPrompt = `\n\n[ESTILO DE ATENDIMENTO APRENDIDO POR MACHINE LEARNING]:
- Tom de Voz: ${persona.tone}
- Expressões e Emojis Comuns: ${persona.commonExpressions.join(', ')}
- Regras de Comportamento do Cliente:
${persona.rules.map(r => `  * ${r}`).join('\n')}

IMPORTANTE: Você DEVE adotar esse estilo de atendimento rigorosamente para preservar o padrão do hotel.`
    } else {
      learnedPersonaPrompt = `\n\n[ATENDIMENTO BÁSICO]: Utilize um tom de voz neutro, educado e profissional. Não utilize gírias ou expressões personalizadas.`
    }

    // 4. Tratamento de Fornecedores (Regra de Negócio Crítica)
    if (intent === 'SUPPLIER_INQUIRY' && property.whatsappChannelType === 'GUESTS_ONLY') {
      const supplierMessage = property.supplierContact 
        ? `Olá! Este canal de WhatsApp é exclusivo para atendimento a hóspedes e reservas da ${property.name}. Para assuntos comerciais ou fornecedores, por favor entre em contato pelo número: ${property.supplierContact}. Obrigado pela compreensão!`
        : `Olá! Este canal de WhatsApp é exclusivo para atendimento a hóspedes e reservas da ${property.name}. No momento, não tratamos de assuntos de fornecedores por este canal. Obrigado pela compreensão!`;

      return {
        success: true,
        agent: 'SYSTEM',
        intent: 'SUPPLIER_INQUIRY',
        confidence: classified.confidence,
        response: supplierMessage,
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime
      };
    }

    // 5. Motor de Extração de Comprovantes (O Pulo do Gato)
    const receiptData = await ReceiptExtractor.extract(message);
    if (receiptData) {
      // REGRA ZEHLA: Hóspede pagou Valor Bruto via PIX direto para o Dono.
      // DÉBITO IMEDIATO: Processamos a comissão agora mesmo no cartão do dono.
      const fees = calculateFees(receiptData.amount, property.plan);

      await prisma.payment.create({
        data: {
          amount: receiptData.amount, // Valor Total Bruto (PIX Direto)
          status: 'PAID',
          externalId: receiptData.transactionId,
          propertyId,
          reservationId: context.reservationId || 'UNKNOWN',
          metadata: JSON.stringify({
            ...receiptData,
            immediatePlatformDebit: fees.platformFee, // Débito automático processado agora
            plan: property.plan
          })
        }
      });

      return {
        success: true,
        agent: 'FINANCIAL',
        intent: 'PAYMENT_CONFIRMATION',
        confidence: 1.0,
        response: `Recebi seu comprovante no valor total de R$ ${receiptData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}! 🎉 Já registrei o recebimento integral para a ${property.name}. Tudo certo com sua reserva!`,
        tokensUsed: 0,
        cost: 0,
        duration: Date.now() - startTime
      };
    }

    // 6. Gerar resposta contextualizada
    let systemPrompt = this.buildSystemPrompt(property, intent)
    if (learnedPersonaPrompt) {
      systemPrompt += learnedPersonaPrompt
    }

    const userPrompt = this.buildUserPrompt(message, classified, property, context)


    const llmResponse = await llmRouter.generate({
      model: intent === 'PRICE_INQUIRY' || intent === 'RESERVATION_CREATE' ? 'reasoning' : 'general',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 2048
    })

    // 4. Log da interação
    await prisma.agentLog.create({
      data: {
        agentName: this.getAgentName(intent),
        action: 'RESPOND',
        intent,
        confidence: classified.confidence,
        input: message,
        output: llmResponse.content,
        tokensUsed: llmResponse.tokensUsed,
        cost: llmResponse.cost,
        duration: Date.now() - startTime,
        status: 'SUCCESS',
        propertyId
      }
    })

    return {
      success: true,
      agent: this.getAgentName(intent),
      intent,
      confidence: classified.confidence,
      response: llmResponse.content,
      data: { entities: classified.entities },
      tokensUsed: llmResponse.tokensUsed,
      cost: llmResponse.cost,
      duration: Date.now() - startTime,
      fallback: llmResponse.model.includes('kimi')
    }
  }

  private buildSystemPrompt(property: any, intent: Intent): string {
    const basePrompt = `Você é o assistente virtual da ${property.name}, uma pousada na Praia do Rosa, Imbituba/SC.
Você atende hóspedes pelo WhatsApp de forma calorosa, profissional e eficiente.

INFORMAÇÕES DA POUSADA:
- Nome: ${property.name}
- Capacidade: ${property.capacity} quartos
- Endereço: ${property.address}, ${property.city}/${property.state}
- Telefone: ${property.phone || 'Não informado'}
- WhatsApp: ${property.whatsapp || 'Não informado'}

QUARTOS DISPONÍVEIS:
${property.rooms.map((r: any) => `- ${r.name || r.number}: ${r.type}, ${r.capacity} hóspedes, R$ ${r.basePrice}/${r.pricingType === 'PER_PERSON' ? 'pessoa' : 'quarto'}`).join('\n')}

LÓGICA DE PREÇO:
- Se o quarto for "Por Quarto": O valor é fixo por noite, independente de quantas pessoas (dentro da capacidade).
- Se o quarto for "Por Pessoa": Você DEVE multiplicar o valor base pelo número de hóspedes. Ex: Se são 3 hóspedes em um quarto de R$ 100/pessoa, o total é R$ 300.

REGRAS:
- Sempre seja gentil e acolhedor
- Use emojis com moderação
- [REGRA DE OURO]: Você NÃO tem poder para negociar preços, dar descontos ou fazer acordos financeiros.
- [REGRA DE OURO]: Você NÃO pode realizar transferências de dinheiro ou estornos.
- Se o hóspede pedir desconto, negociação ou algo fora da tabela, diga: "Apenas o proprietário tem autonomia para negociações especiais. Vou deixar seu pedido registrado para que ele entre em contato com você."
- Para reservas, utilize APENAS os valores catalogados abaixo (considerando a sazonalidade se aplicável).
- Para pagamentos, sua função é APENAS confirmar o recebimento via sistema e notificar o financeiro.`

    const intentSpecific: Record<string, string> = {
      RESERVATION_CREATE: '\n\nVocê está ajudando o hóspede a FAZER uma reserva. Colete: datas, número de hóspedes, tipo de quarto preferido.',
      RESERVATION_MODIFY: '\n\nVocê está ajudando o hóspede a ALTERAR uma reserva existente. Peça o código da reserva.',
      RESERVATION_CANCEL: '\n\nVocê está processando um CANCELAMENTO. Seja empático e explique a política de cancelamento.',
      PRICE_INQUIRY: '\n\nVocê está respondendo sobre PREÇOS. Mencione os valores base e que há variação sazonal.',
      LOCAL_INFO: '\n\nVocê está dando dicas sobre a PRAIA DO ROSA. Seja entusiasta e mencione: surf, trilhas, restaurantes locais, pôr do sol.',
      HOUSEKEEPING_REQUEST: '\n\nVocê está registrando uma solicitação de LIMPEZA/MANUTENÇÃO. Confirme o quarto e a urgência.'
    }

    return basePrompt + (intentSpecific[intent] || '')
  }

  private buildUserPrompt(message: string, classified: any, property: any, context: any): string {
    return `Mensagem do hóspede: "${message}"

Intent detectado: ${classified.intent} (confiança: ${(classified.confidence * 100).toFixed(1)}%)
Entidades extraídas: ${JSON.stringify(classified.entities)}
Contexto anterior: ${JSON.stringify(context)}

Responda como o assistente virtual da pousada.`
  }

  private getAgentName(intent: Intent): string {
    const map: Record<string, string> = {
      RESERVATION_CREATE: 'RECEPTIONIST',
      RESERVATION_MODIFY: 'RECEPTIONIST',
      RESERVATION_CANCEL: 'RECEPTIONIST',
      ROOM_AVAILABILITY: 'RECEPTIONIST',
      PRICE_INQUIRY: 'RECEPTIONIST',
      CHECK_IN: 'RESERVATIONS',
      CHECK_OUT: 'RESERVATIONS',
      HOUSEKEEPING_REQUEST: 'HOUSEKEEPING',
      AMENITIES_INQUIRY: 'CONCIERGE',
      LOCAL_INFO: 'CONCIERGE',
      PAYMENT_STATUS: 'FINANCIAL',
      CANCELATION_POLICY: 'FINANCIAL',
      GREETING: 'RECEPTIONIST',
      FAREWELL: 'RECEPTIONIST',
      SUPPLIER_INQUIRY: 'SYSTEM',
      UNKNOWN: 'RECEPTIONIST'
    }
    return map[intent] || 'RECEPTIONIST'
  }

  private buildError(message: string, startTime: number): AgentResponse {
    return {
      success: false,
      agent: 'SYSTEM',
      intent: 'UNKNOWN',
      confidence: 0,
      response: `Desculpe, ocorreu um erro: ${message}. Por favor, tente novamente ou fale com nossa equipe.`,
      tokensUsed: 0,
      cost: 0,
      duration: Date.now() - startTime
    }
  }
}

export const orchestrator = new AgentOrchestrator()
