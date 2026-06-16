import { PrismaClient } from '@prisma/client';
import type { IWhatsAppMessageRepository, CreateMessageInput, MarkMessageReadInput, CreateSecurityAlertInput } from '@/application/communication/ports/IWhatsAppMessageRepository';

export class PrismaWhatsAppMessageRepository implements IWhatsAppMessageRepository {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  async createMessage(input: CreateMessageInput): Promise<{ id: string }> {
    return this.prisma.message.create({
      data: {
        propertyId: input.propertyId,
        phone: input.phone,
        content: input.content,
        direction: input.direction,
        status: input.status,
        agentHandled: input.agentHandled,
      },
      select: { id: true },
    });
  }

  async markAsRead(input: MarkMessageReadInput): Promise<void> {
    await this.prisma.message.update({
      where: { id: input.messageId },
      data: { status: 'READ' },
    });
  }

  async createSecurityAlert(input: CreateSecurityAlertInput): Promise<void> {
    await this.prisma.securityAlert.create({
      data: {
        tenantId: input.tenantId,
        alertType: input.alertType,
        severity: input.severity,
        metadata: JSON.stringify(input.metadata),
      },
    });
  }
}
