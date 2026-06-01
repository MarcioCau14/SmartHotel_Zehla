import type { IWhatsAppPort } from '@/application/shared/ports/IWhatsAppPort';
import type { IWhatsAppMessageRepository } from '../ports/IWhatsAppMessageRepository';

export interface InboundMessageInput {
  messageId: string;
  evolutionMessageId?: string;
  propertyId: string;
  phone: string;
  content: string;
  pushName?: string;
  mediaData?: {
    type: string;
    base64?: string;
  };
}

export interface ProcessInboundMessageOutput {
  status: string;
  responseSent: boolean;
  channel?: 'whatsapp' | 'email';
}

export interface OrchestratorResult {
  response: string;
  agent?: string;
}

export interface ReceiptResult {
  amount: number;
  transactionId: string;
  isConfirmed: boolean;
}

export interface PaymentProofResult {
  success: boolean;
  message: string;
  amount?: number;
}

type SendMessageFn = (to: string, content: string) => Promise<void>;

export class ProcessInboundMessageUseCase {
  constructor(
    private readonly whatsAppPort: IWhatsAppPort,
    private readonly messageRepo: IWhatsAppMessageRepository,
    private readonly orchestrator: {
      process(input: { propertyId: string; message: string; context: Record<string, unknown> }): Promise<OrchestratorResult>;
    },
    private readonly receiptExtractor: {
      extract(content: string): Promise<ReceiptResult | null>;
    },
    private readonly processPaymentProof: {
      execute(phone: string, propertyId: string, receipt: ReceiptResult): Promise<PaymentProofResult>;
    },
    private readonly findLead: (phone: string) => Promise<unknown>,
    private readonly sendEmailFallback: (lead: unknown, content: string) => Promise<void>,
    private readonly checkEmailFallback: () => Promise<boolean>,
  ) {}

  async execute(input: InboundMessageInput): Promise<ProcessInboundMessageOutput> {
    const { messageId, propertyId, phone, content, pushName, evolutionMessageId, mediaData } = input;

    // ── Media routing (Vision shield) ──
    if (mediaData && (mediaData.type === 'imageMessage' || mediaData.type === 'documentMessage')) {
      return this.handleMediaMessage(propertyId, phone, content, mediaData.base64 || content, evolutionMessageId);
    }

    // ── Conversational pipeline ──
    const result = await this.orchestrator.process({
      propertyId,
      message: content,
      context: { phone, name: pushName },
    });

    // Persist reply
    await this.messageRepo.createMessage({
      propertyId,
      phone,
      content: result.response,
      direction: 'OUTBOUND',
      status: 'SENT',
      agentHandled: result.agent,
    });

    // Delivery: WhatsApp or email fallback
    const isEmailFallback = await this.checkEmailFallback();
    if (isEmailFallback) {
      const lead = await this.findLead(phone);
      if (lead) {
        await this.sendEmailFallback(lead, result.response);
      }
    }

    await this.whatsAppPort.sendText({ to: phone, content: result.response, instanceName: propertyId });
    await this.messageRepo.markAsRead({ messageId });

    return { status: 'COMPLETED_CONVERSATIONAL', responseSent: true, channel: isEmailFallback ? 'email' : 'whatsapp' };
  }

  private async handleMediaMessage(
    propertyId: string,
    phone: string,
    content: string,
    extractContent: string,
    evolutionMessageId?: string,
  ): Promise<ProcessInboundMessageOutput> {
    const receipt = await this.receiptExtractor.extract(extractContent);

    if (receipt && receipt.isConfirmed) {
      const result = await this.processPaymentProof.execute(phone, propertyId, receipt);

      if (result.success) {
        const msg = `Recebi seu comprovante de R$ ${result.amount?.toLocaleString('pt-BR')}! Sua reserva está confirmada.`;
        await this.whatsAppPort.sendText({ to: phone, content: msg, instanceName: propertyId });
      } else {
        await this.messageRepo.createSecurityAlert({
          tenantId: propertyId,
          alertType: 'PAYMENT_MANUAL_REVIEW_REQUIRED',
          severity: 'HIGH',
          metadata: { phone, receipt, reason: result.message },
        });

        const msg = `Recebi seu comprovante, mas precisei encaminhar para nossa equipe conferir manualmente (ID: ${result.message}). Em breve te aviso!`;
        await this.whatsAppPort.sendText({ to: phone, content: msg, instanceName: propertyId });
      }

      if (evolutionMessageId) {
        await this.whatsAppPort.deleteMessage({ instanceName: propertyId, messageId: evolutionMessageId });
      }
    }

    return { status: 'COMPLETED_FINANCIAL', responseSent: true };
  }
}
