// Zélla AirB — Barrel Exports
export { checkEntitlement, isPixAllowed, filterPixFromResponse, PROPERTY_LIMITS, FEATURE_GATES } from './gatekeeper';
export type { AirBPlanType, EntitlementAction, EntitlementResult, PlatformContext } from './gatekeeper';
export { buildAirBSystemPrompt, AIRB_INTENTS, getAgentForIntent } from './system-prompt';
export type { SystemPromptParams, AirBIntent } from './system-prompt';
export { queryRAG, generateDemoRegionalKnowledge } from './rag-pipeline';
export type { RAGResult, RAGContext } from './rag-pipeline';
export { processAirBMessage } from './ai-responder';
export {
  buildClosingNotificationPrompt,
  CLOSING_INTENT_SIGNALS,
  NOTIFICATION_TEMPLATES,
  evaluateClosingIntent,
  formatNotification,
  createEmptyReservationDetails,
  validateReservationDetails,
} from './closing-notification-prompt';
export type {
  NotificationType,
  ClosingConversationStage,
  ClosingIntentSignal,
  ReservationDetails,
  ClosingNotificationParams,
  ClosingIntentEvaluation,
  NotificationFormatData,
} from './closing-notification-prompt';
