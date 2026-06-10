import { CampaignOutboundWorker } from '../infrastructure/workers/CampaignOutboundWorker'
import { EvolutionApiMessagingGateway } from '../infrastructure/messaging/EvolutionApiMessagingGateway'

const gateway = new EvolutionApiMessagingGateway()
const instance = new CampaignOutboundWorker(gateway)

export const campaignOutboundWorker = instance.getWorker()
