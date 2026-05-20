/**
 * ZEHLA Voice Profile Registry
 * 
 * Define os perfis vocais base e as variações permitidas para cada plano.
 */

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  baseParams: {
    rate: number;
    pitch: number;
    style: string;
    emotiveness: number;
  };
}

export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  CONCIERGE_DEFAULT: {
    id: 'concierge_default',
    name: 'ZEHLA Concierge',
    description: 'Voz padrão equilibrada, profissional e acolhedora.',
    baseParams: {
      rate: 1.0,
      pitch: 0,
      style: 'concierge',
      emotiveness: 0.5
    }
  },
  EXECUTIVE_PREMIUM: {
    id: 'executive_premium',
    name: 'ZEHLA Executive',
    description: 'Voz direta, confiante e com ritmo ligeiramente acelerado. Ideal para prospecção B2B.',
    baseParams: {
      rate: 1.15,
      pitch: 0,
      style: 'executive',
      emotiveness: 0.3
    }
  },
  FRIENDLY_WAVE: {
    id: 'friendly_wave',
    name: 'ZEHLA Friendly',
    description: 'Voz calorosa, com variações de pitch e alta emotividade. Ideal para pousadas de lazer.',
    baseParams: {
      rate: 1.0,
      pitch: 1,
      style: 'friendly',
      emotiveness: 0.8
    }
  },
  URGENT_ALERT: {
    id: 'urgent_alert',
    name: 'ZEHLA Urgent',
    description: 'Voz rápida e focada, utilizada em situações de suporte crítico ou reservas de última hora.',
    baseParams: {
      rate: 1.3,
      pitch: 1.5,
      style: 'urgent',
      emotiveness: 0.6
    }
  }
};

/**
 * Matriz de Mapeamento de Segmentos (MAX Tier)
 */
export const SEGMENT_VOICE_MAPPING = {
  EXECUTIVE: 'EXECUTIVE_PREMIUM',
  FAMILY: 'FRIENDLY_WAVE',
  SENIOR: 'CONCIERGE_DEFAULT',
  DIGITAL_NOMAD: 'FRIENDLY_WAVE',
  ADVENTURE: 'URGENT_ALERT'
};
