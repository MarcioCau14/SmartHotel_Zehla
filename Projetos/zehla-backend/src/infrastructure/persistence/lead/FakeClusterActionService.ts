import { Cluster } from '../../../domain/lead/LeadStatus'
import { IClusterActionService } from '../../../application/lead/ports/IClusterActionService'

const CLUSTER_ACTIONS: Record<string, string[]> = {
  'COLD->HOT': ['send_sales_alert', 'suggest_premium_swipe'],
  'COLD->WARM': ['send_nurture_email'],
  'WARM->HOT': ['suggest_swipe', 'send_whatsapp_personalized'],
  'HOT->WARM': ['send_reactivation_email'],
  'HOT->COLD': ['send_reactivation_email'],
  'WARM->COLD': ['add_to_dormant_list'],
}

export class FakeClusterActionService implements IClusterActionService {
  public executedActions: Array<{ leadId: string; actions: string[] }> = []

  getActionsForTransition(from: Cluster, to: Cluster): string[] {
    const key = `${from}->${to}`
    return CLUSTER_ACTIONS[key] ?? []
  }

  async executeActions(leadId: string, actions: string[]): Promise<void> {
    this.executedActions.push({ leadId, actions })
  }

  clear(): void {
    this.executedActions = []
  }
}
