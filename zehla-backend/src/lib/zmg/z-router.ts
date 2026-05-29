import { Plan } from '@prisma/client';

export type ModelHint = 'fast' | 'reasoning' | 'vision' | 'summarize' | 'code';

export interface RouteDecision {
  hint: ModelHint;
  provider: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

/**
 * ZRouter — Orquestrador Cognitivo Baseado em Planos
 * Define qual "músculo" (modelo) usar baseado no plano da pousada e na intenção da mensagem.
 */
export class ZRouter {
  
  /**
   * Resolve o roteamento de modelo baseado no plano e hint
   */
  static getRoute(plan: Plan, hint: ModelHint): RouteDecision {
    // 1. Definição de capacidades por plano
    const capabilities: Record<Plan, any> = {
      [Plan.FREE]: {
        allowedHints: ['fast'],
        defaultModel: { provider: 'zai', model: 'gemma-3-27b-it', maxTokens: 256, temperature: 0.3 }
      },
      [Plan.LITE]: {
        allowedHints: ['fast'],
        defaultModel: { provider: 'zai', model: 'gemma-3-27b-it', maxTokens: 256, temperature: 0.3 }
      },
      [Plan.PRO]: {
        allowedHints: ['fast', 'reasoning', 'summarize'],
        defaultModel: { provider: 'anthropic', model: 'claude-3-haiku-20240307', maxTokens: 512, temperature: 0.5 }
      },
      [Plan.MAX]: {
        allowedHints: ['fast', 'reasoning', 'vision', 'summarize', 'code'],
        defaultModel: { provider: 'anthropic', model: 'claude-3-5-sonnet-20240620', maxTokens: 1024, temperature: 0.7 }
      },
      [Plan.BETA_TESTER]: {
        allowedHints: ['fast', 'reasoning', 'vision', 'summarize', 'code'],
        defaultModel: { provider: 'anthropic', model: 'claude-3-5-sonnet-20240620', maxTokens: 1024, temperature: 0.7 }
      },
      [Plan.EARLY_ADOPTER]: {
        allowedHints: ['fast', 'reasoning', 'vision', 'summarize', 'code'],
        defaultModel: { provider: 'anthropic', model: 'claude-3-5-sonnet-20240620', maxTokens: 1024, temperature: 0.7 }
      }
    };

    const cap = capabilities[plan] || capabilities[Plan.LITE];

    // 2. Lógica de Fallback de Segurança (Downgrade se o plano não permitir o hint)
    let effectiveHint = hint;
    if (!cap.allowedHints.includes(hint)) {
      effectiveHint = 'fast';
    }

    // 3. Mapeamento de Modelos Específicos
    switch (effectiveHint) {
      case 'fast':
        return { 
          hint: 'fast', 
          provider: 'groq', 
          model: 'llama-3.1-70b-versatile', 
          maxTokens: 300, 
          temperature: 0.2 
        };
      
      case 'reasoning':
        return plan === Plan.MAX 
          ? { hint: 'reasoning', provider: 'anthropic', model: 'claude-3-5-sonnet-20240620', maxTokens: 1500, temperature: 0.7 }
          : { hint: 'reasoning', provider: 'anthropic', model: 'claude-3-haiku-20240307', maxTokens: 800, temperature: 0.5 };

      case 'summarize':
        return { 
          hint: 'summarize', 
          provider: 'openai', 
          model: 'gpt-4o-mini', 
          maxTokens: 2000, 
          temperature: 0.3 
        };

      case 'vision':
        return { 
          hint: 'vision', 
          provider: 'openai', 
          model: 'gpt-4o', 
          maxTokens: 1000, 
          temperature: 0.3 
        };

      default:
        return cap.defaultModel as RouteDecision;
    }
  }

  /**
   * Verifica se uma feature está disponível para o plano
   */
  static hasFeature(plan: Plan, feature: 'memory_tree' | 'cross_guest_patterns' | 'proactive_sync'): boolean {
    const featureMap: Record<Plan, any> = {
      [Plan.FREE]: { memory_tree: false, cross_guest_patterns: false, proactive_sync: false },
      [Plan.LITE]: { memory_tree: false, cross_guest_patterns: false, proactive_sync: false },
      [Plan.PRO]: { memory_tree: true, cross_guest_patterns: false, proactive_sync: true },
      [Plan.MAX]: { memory_tree: true, cross_guest_patterns: true, proactive_sync: true },
      [Plan.BETA_TESTER]: { memory_tree: true, cross_guest_patterns: true, proactive_sync: true },
      [Plan.EARLY_ADOPTER]: { memory_tree: true, cross_guest_patterns: true, proactive_sync: true }
    };

    return featureMap[plan][feature];
  }
}
