import { EvolutionWhatsAppAdapter } from './EvolutionWhatsAppAdapter';
import type { IWhatsAppPort } from '@/application/shared/ports/IWhatsAppPort';

let _instance: IWhatsAppPort | undefined;

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
