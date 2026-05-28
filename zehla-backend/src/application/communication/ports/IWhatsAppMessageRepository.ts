export interface CreateMessageInput {
  propertyId: string;
  phone: string;
  content: string;
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  agentHandled?: string;
  messageId?: string;
}

export interface MarkMessageReadInput {
  messageId: string;
}

export interface CreateSecurityAlertInput {
  tenantId: string;
  alertType: string;
  severity: string;
  metadata: Record<string, unknown>;
}

export interface IWhatsAppMessageRepository {
  createMessage(input: CreateMessageInput): Promise<{ id: string }>;
  markAsRead(input: MarkMessageReadInput): Promise<void>;
  createSecurityAlert(input: CreateSecurityAlertInput): Promise<void>;
}
