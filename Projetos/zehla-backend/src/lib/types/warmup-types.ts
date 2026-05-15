export interface ValidatedLead {
  id: string;
  pousadaName: string;
  decisionMaker?: string;
  whatsapp: string;
  isValidWA: boolean;
  painType: "financeiro" | "operacional" | "desconhecido";
  qualificationScore: number;
}

export interface ZMGPayload {
  leadId: string;
  whatsapp: string;
  templateId: string;
  messageContent: string;
  containsOptOut: boolean;
}

