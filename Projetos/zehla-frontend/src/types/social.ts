export type SocialPlatform = 'INSTAGRAM' | 'FACEBOOK' | 'WHATSAPP_STATUS'

export interface SocialInteractionView {
  readonly id: string
  readonly platform: SocialPlatform
  readonly username: string
  readonly content: string
  readonly timestamp: number
  readonly isDirectMessage: boolean
  readonly hasBuyingIntent: boolean
  readonly urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  readonly convertedToLead: boolean
  readonly leadId?: string
}

export const PLATFORM_META: Record<SocialPlatform, { label: string; cor: string }> = {
  INSTAGRAM: { label: 'Instagram', cor: 'text-pink-600 dark:text-pink-400' },
  FACEBOOK: { label: 'Facebook', cor: 'text-blue-600 dark:text-blue-400' },
  WHATSAPP_STATUS: { label: 'WhatsApp Status', cor: 'text-emerald-600 dark:text-emerald-400' },
}

export const URGENCY_COR: Record<string, string> = {
  HIGH: 'text-red-600 dark:text-red-400',
  MEDIUM: 'text-amber-600 dark:text-amber-400',
  LOW: 'text-slate-500 dark:text-slate-400',
}
