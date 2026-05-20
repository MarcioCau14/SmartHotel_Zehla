// src/lib/events/actions.ts
import { prisma } from '@/lib/prisma';

export const CLUSTER_ACTIONS: Record<string, string[]> = {
  'COLD->WARM': ['send_nurture_email_1', 'add_to_newsletter'],
  'WARM->HOT': ['send_sales_alert_urgent', 'sugerir_swipe_zcc', 'activate_whatsapp_sequence'],
  'COLD->HOT': ['send_sales_alert_urgent', 'sugerir_swipe_zcc', 'send_trial_invitation'],
};

export async function executeAction(actionType: string, payload: any) {
  switch (actionType) {
    case 'sugerir_swipe_zcc':
      console.log(`[Action] Sugerindo swipe para lead ${payload.leadId}`);
      // Lógica de alerta para o ZCC
      return { status: 'success', action: actionType };
    default:
      return { status: 'ignored', action: actionType };
  }
}
