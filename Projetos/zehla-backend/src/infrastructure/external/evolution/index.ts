import { EvolutionWhatsAppAdapter } from './EvolutionWhatsAppAdapter';
import { EvolutionMessagingGateway } from './EvolutionMessagingGateway';
import type { IWhatsAppPort } from '@/application/shared/ports/IWhatsAppPort';
import type { IMessagingGateway } from '@/domain/marketing/ports/IMessagingGateway';

let _instance: IWhatsAppPort | undefined;
let _gatewayInstance: IMessagingGateway | undefined;

export function getWhatsAppPort(): IWhatsAppPort {
  if (!_instance) {
    _instance = new EvolutionWhatsAppAdapter({
      baseUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      defaultInstance: process.env.EVOLUTION_INSTANCE || 'zehla',
    });
  }
  return _instance;
}

export function getMessagingGateway(): IMessagingGateway {
  if (!_gatewayInstance) {
    _gatewayInstance = new EvolutionMessagingGateway({
      baseUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      defaultInstance: process.env.EVOLUTION_INSTANCE || 'zehla',
    });
  }
  return _gatewayInstance;
}
