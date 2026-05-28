// Porta de comunicação WhatsApp
// Contrato do domínio — a infraestrutura implementa

export interface SendTextInput {
  to: string;
  content: string;
  instanceName?: string;
  delay?: number;
}

export interface DeleteMessageInput {
  instanceName: string;
  messageId: string;
}

export interface NumberStatusInput {
  number: string;
  instanceName?: string;
}

export interface WhatsAppResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

export interface NumberStatusResult {
  exists: boolean;
}

export interface ConnectionStateResult {
  connected: boolean;
  qrCode?: string;
}

export interface WAContact {
  id: string;
  name?: string;
  pushName?: string;
  number: string;
  profilePicUrl?: string;
}

export interface WAGroup {
  id: string;
  subject: string;
  size: number;
}

export interface IWhatsAppPort {
  sendText(input: SendTextInput): Promise<WhatsAppResult>;
  checkNumberStatus(input: NumberStatusInput): Promise<NumberStatusResult>;
  getConnectionState(instanceName: string): Promise<ConnectionStateResult>;
  deleteMessage(input: DeleteMessageInput): Promise<void>;
  fetchContacts(instanceName: string): Promise<WAContact[]>;
  fetchContactAbout(instanceName: string, number: string): Promise<string>;
  fetchGroups(instanceName: string): Promise<WAGroup[]>;
  fetchGroupParticipants(instanceName: string, groupJid: string): Promise<WAContact[]>;
  fetchInstances(): Promise<unknown>;
}
