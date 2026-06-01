import { Cluster } from '../../../domain/lead/LeadStatus'

export interface IClusterActionService {
  getActionsForTransition(from: Cluster, to: Cluster): string[]
  executeActions(leadId: string, actions: string[]): Promise<void>
}
