/**
 * ZMG — ZEHLA MESSAGING GATEWAY
 * Unified Types for Messaging Intents, Routing and Tracking
 */

export type ZMGChannel = 'whatsapp' | 'sms' | 'email' | 'instagram';

export type ZMGMessageType = 'marketing' | 'transactional' | 'service' | 'alert';

export type ZMGObjective = 
  | 'confirm_booking' 
  | 'campaign' 
  | 'follow_up' 
  | 'check_in' 
  | 'review_request' 
  | 'payment_reminder' 
  | 'trending_alert';

export type ZMGStatus = 
  | 'QUEUED' 
  | 'ROUTED' 
  | 'SENT' 
  | 'DELIVERED' 
  | 'READ' 
  | 'FAILED';

export interface MessagingIntent {
  agentId: string;              // "ZCC-WPP", "ZCC-MKT", etc.
  propertyId: string;           // pousada que esta enviando
  recipientPhone?: string;      // +5511999999999
  recipientEmail?: string;      // hospede@email.com
  recipientInstagram?: string;  // @hospede
  recipientName?: string;
  messageType: ZMGMessageType;
  objective: ZMGObjective;
  context: {
    leadId?: string;
    reservationId?: string;
    trendSignalId?: string;     // Se alimentado pelo ZCC-TRENDS
    swipeTemplateId?: string;   // Se alimentado pelo Swipe
    customVariables: Record<string, string>;
  };
}

export interface RoutingDecision {
  channel: ZMGChannel;
  provider: string;
  estimatedCost: number;
  estimatedDeliveryRate: number;
  reason: string;
}

export interface ChannelDetection {
  phone: string;
  whatsapp: boolean;
  sms: boolean;
  email: boolean;
  instagram: boolean;
  carrier?: string | null;
  lineType?: string | null;
}
