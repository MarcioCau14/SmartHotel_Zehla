/**
 * ZMG — ZEHLA MESSAGING GATEWAY
 * Orquestrador Principal do Pipeline de 7 Estágios
 */

import { prisma } from '@/lib/prisma';
import { MessagingIntent, ZMGStatus } from './types';
import { detectChannels } from './channel-detector';
import { ZMGRouter } from './router';
import { getWhatsAppPort } from '@/infrastructure/external/evolution';
import { SMSProvider } from './providers/sms';
import { EmailProvider } from './providers/email';
import { ZMGContentTransformer } from './content-transformer';
import { ZMGEnricher } from './enricher';
import { CognitiveTerminal } from '@/lib/observability/cognitive-terminal';
import { MLInteractionLogger } from '@/lib/ml/interaction-logger';
import { MemoryIngestionService } from '@/lib/ml/memory-service';

export class ZMG {
  /**
   * Stage 1: RECEIVE
   * Recebe a intenção de qualquer agente e inicia o processamento
   */
  static async receive(intent: MessagingIntent) {
    await CognitiveTerminal.info('ZMG', `Intenção recebida: ${intent.messageType} via ${intent.agentId}`, { intent }, intent.propertyId);
    
    // 0. Validar existência da pousada (Garante integridade e dispara Healing se falhar)
    const propertyExists = await prisma.property.findUnique({ where: { id: intent.propertyId } });
    if (!propertyExists) {
      throw new Error(`Pousada não encontrada: ${intent.propertyId}`);
    }

    // 1. Criar registro inicial na fila (ZMGMessage)
    const message = await prisma.zMGMessage.create({
      data: {
        propertyId: intent.propertyId,
        agentSource: intent.agentId,
        messageType: intent.messageType,
        objective: intent.objective,
        recipientPhone: intent.recipientPhone,
        recipientEmail: intent.recipientEmail,
        recipientName: intent.recipientName,
        status: 'QUEUED',
        primaryChannel: 'whatsapp', // Default inicial
        content: intent.context.customVariables.content || '',
        variables: intent.context.customVariables as any,
        trendSignalId: intent.context.trendSignalId,
        swipeTemplateId: intent.context.swipeTemplateId,
        reservationId: intent.context.reservationId,
      }
    });

    // 2. Processamento assíncrono (em produção usaria BullMQ)
    // Para esta fase inicial, faremos sequencial para validação
    return this.process(message.id);
  }

  /**
   * Pipeline Orchestrator
   */
  private static async process(messageId: string) {
    const startTime = Date.now();
    try {
      await CognitiveTerminal.info('ZMG', `Iniciando processamento da mensagem ${messageId}`);
      // Stage 2: ENRICH (Enriquecer Perfil e Contexto)
      await this.enrich(messageId);

      // Stage 3: TRANSFORM (Adaptar conteúdo por canal)
      await this.transform(messageId);

      // Stage 4: ROUTE (Selecionar canais possíveis)
      const decisions = await this.route(messageId);

      // Stage 5 & 6: SEND & FALLBACK (Tentar canais em sequência)
      let success = false;
      let lastError = '';

      for (const decision of decisions) {
        try {
          await prisma.zMGMessage.update({
            where: { id: messageId },
            data: { 
              sentChannel: decision.channel,
              channelCost: decision.estimatedCost,
              fallbackUsed: success === false && decisions.indexOf(decision) > 0,
              fallbackChannel: decisions.indexOf(decision) > 0 ? decision.channel : null
            }
          });

          await this.send(messageId);
          success = true;
          break; // Sucesso! Sai do loop de fallback
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error';
          console.warn(`[ZMG] Failed to send via ${decision.channel}: ${lastError}. Trying fallback...`);
          
          await prisma.zMGActivity.create({
            data: {
              messageId,
              event: 'FALLBACK_TRIGGERED',
              channel: decision.channel,
              response: lastError,
            }
          });
        }
      }

      if (!success) {
        throw new Error(`All channels failed. Last error: ${lastError}`);
      }

      const duration = Date.now() - startTime;
      await CognitiveTerminal.success('ZMG', `Mensagem ${messageId} processada com sucesso em ${duration}ms`);

      // Stage 7: TRACK & LEARN (ML Brain Hook)
      const finalMsg = await prisma.zMGMessage.findUnique({ 
        where: { id: messageId },
        include: { contact: true }
      });
      
      if (finalMsg) {
        await MLInteractionLogger.logInteraction({
          tenantId: finalMsg.propertyId,
          messageId: finalMsg.id,
          content: finalMsg.content,
          response: finalMsg.renderedContent || '',
          modelUsed: finalMsg.agentSource,
          responseTimeMs: duration,
          toneAlignmentScore: 0.85, // Simulado
          geo: {
            city: finalMsg.contact?.city || undefined,
            state: finalMsg.contact?.state || undefined,
          }
        });

        // NOVO: Ingestão na Árvore de Memória Cognitive
        if (finalMsg.contact?.id) {
          await MemoryIngestionService.ingest({
            tenantId: finalMsg.propertyId,
            guestId: finalMsg.contact.phone || finalMsg.contact.id, // Phone como identificador único
            content: finalMsg.content,
            source: 'whatsapp'
          });
        }
      }

      return { success: true, messageId };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      await CognitiveTerminal.error('ZMG:PIPELINE', `Erro crítico no processamento da mensagem ${messageId}: ${errorMsg}`, { error });
      
      await prisma.zMGMessage.update({
        where: { id: messageId },
        data: { 
          status: 'FAILED',
          failureReason: errorMsg
        }
      });
      return { success: false, messageId, error };
    }
  }



  private static async enrich(messageId: string) {
    const message = await prisma.zMGMessage.findUnique({ where: { id: messageId } });
    if (!message || !message.recipientPhone) return;

    // 1. Verificar se o ContactProfile existe, senão criar
    let contact = await prisma.contactProfile.findUnique({
      where: { phone: message.recipientPhone }
    });

    if (!contact) {
      const detection = await detectChannels(message.recipientPhone);
      contact = await prisma.contactProfile.create({
        data: {
          propertyId: message.propertyId,
          phone: message.recipientPhone,
          name: message.recipientName,
          whatsappAvailable: detection.whatsapp,
          smsAvailable: detection.sms,
          instagramAvailable: detection.instagram,
          lineType: detection.lineType,
          carrierName: detection.carrier,
        }
      });
    }

    // 2. Enriquecer contexto com ZCC-TRENDS e Inteligência Swipe
    const currentVariables = (message.variables as Record<string, string>) || {};
    const enrichedVariables = await ZMGEnricher.enrichContext(contact, currentVariables);

    await prisma.zMGMessage.update({
      where: { id: messageId },
      data: { 
        contactProfileId: contact.id,
        variables: enrichedVariables as any,
        status: 'ROUTED' 
      }
    });
  }



  private static async transform(messageId: string) {
    const message = await prisma.zMGMessage.findUnique({ where: { id: messageId } });
    if (!message) return;

    const variables = (message.variables as Record<string, string>) || {};
    
    // 1. Substituição de variáveis no conteúdo mestre
    const transformedContent = ZMGContentTransformer.transform(message.content, variables);

    await prisma.zMGMessage.update({
      where: { id: messageId },
      data: { 
        renderedContent: transformedContent 
      }
    });
  }

  private static async route(messageId: string) {
    const message = await prisma.zMGMessage.findUnique({ 
      where: { id: messageId },
      include: { contact: true }
    });

    if (!message || !message.contact) {
      throw new Error('Message or Contact not found for routing');
    }

    const decisions = ZMGRouter.route(
      message.contact, 
      message.messageType as any, 
      message.objective || ''
    );

    if (decisions.length === 0) {
      throw new Error('No available channels for this contact');
    }

    return decisions;
  }



  private static async send(messageId: string) {
    const message = await prisma.zMGMessage.findUnique({ where: { id: messageId } });
    if (!message) return;

    // Adapta o conteúdo renderizado para o canal específico que será usado agora
    const finalContent = ZMGContentTransformer.adaptForChannel(
      message.renderedContent || message.content,
      message.sentChannel || 'whatsapp'
    );

    let result;

    switch (message.sentChannel) {
      case 'whatsapp':
        if (!message.recipientPhone) throw new Error('Phone required for WhatsApp');
        result = await getWhatsAppPort().sendText({ to: message.recipientPhone, content: finalContent });
        break;
      
      case 'sms':
        if (!message.recipientPhone) throw new Error('Phone required for SMS');
        result = await SMSProvider.send(message.recipientPhone, finalContent);
        break;

      case 'email':
        if (!message.recipientEmail) throw new Error('Email required for Email channel');
        result = await EmailProvider.send(
          message.recipientEmail, 
          `Novidades do ZEHLA SmartHotel`, // TODO: Assunto dinâmico
          finalContent
        );
        break;

      default:
        throw new Error(`Channel ${message.sentChannel} not implemented`);
    }

    if (result.success) {
      await prisma.zMGMessage.update({
        where: { id: messageId },
        data: { 
          status: 'SENT',
          sentAt: new Date(),
          externalMessageId: result.externalId
        }
      });
      
      // Registrar atividade de sucesso
      await prisma.zMGActivity.create({
        data: {
          messageId,
          event: 'SENT',
          channel: message.sentChannel,
          provider: message.sentChannel === 'whatsapp' ? 'evolution' : (message.sentChannel === 'sms' ? 'zapi' : 'amazon-ses'),
          status: '200',
        }
      });
    } else {
      throw new Error(result.error || `Failed to send via ${message.sentChannel}`);
    }
  }
}
