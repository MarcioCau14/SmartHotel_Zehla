import { hasFeature } from '@/lib/brain/feature-guard';
import type { Plan } from '@prisma/client';
import { WhatsappPersonaLearner } from '@/lib/brain/whatsapp-persona-learner';
import type { ClassifiedIntent } from '@/lib/brain/intent-classifier';

export interface PropertyData {
  id: string;
  name?: string;
  plan?: string;
  capacity?: number;
  address?: string;
  city?: string;
  state?: string;
  [key: string]: unknown;
}

export class PromptBuilder {
  static async build(
    property: PropertyData | undefined,
    intent: string,
    message: string,
    classified: ClassifiedIntent,
    context: Record<string, unknown>
  ): Promise<{ systemPrompt: string; userPrompt: string }> {
    let learnedPersonaPrompt = '';

    if (hasFeature((property?.plan as Plan) || 'LITE', 'WHATSAPP_LEARNING')) {
      const persona = await WhatsappPersonaLearner.getPersona(property?.id || '');
      learnedPersonaPrompt = `\n\n[ESTILO APRENDIDO]:\n- Tom: ${persona.tone}\n- Expressões: ${persona.commonExpressions.join(', ')}\n- Regras:\n${persona.rules.map(r => `  * ${r}`).join('\n')}`;
    } else {
      learnedPersonaPrompt = '\n\n[ATENDIMENTO BÁSICO]: Utilize tom neutro, educado e profissional.';
    }

    const systemPrompt = this.buildSystemPrompt(property, intent) + learnedPersonaPrompt;
    const userPrompt = this.buildUserPrompt(message, classified, context);
    return { systemPrompt, userPrompt };
  }

  private static buildSystemPrompt(property: PropertyData | undefined, intent: string): string {
    const base = `Você é o assistente virtual da ${property?.name || 'Secretaria'}.
Atende pelo WhatsApp de forma calorosa e eficiente.
Nome: ${property?.name || 'Secretaria'}
Capacidade: ${property?.capacity ?? '?'} quartos
Endereço: ${property?.address || 'N/A'}, ${property?.city || ''}/${property?.state || ''}
REGRAS: Sempre gentil, use emojis com moderação, NÃO negocie preços, NÃO faça estornos.`;

    const intentSpecific: Record<string, string> = {
      RESERVATION_CREATE: '\nColete: datas, número de hóspedes, tipo de quarto.',
      PRICE_INQUIRY: '\nMencione valores base e variação sazonal.',
      LOCAL_INFO: '\nSeja entusiasta sobre a região.',
    };

    return base + (intentSpecific[intent] || '');
  }

  private static buildUserPrompt(message: string, classified: ClassifiedIntent, context: Record<string, unknown>): string {
    return `Mensagem: "${message}"\nIntent: ${classified.intent} (${(classified.confidence * 100).toFixed(1)}%)\nEntidades: ${JSON.stringify(classified.entities)}\nContexto: ${JSON.stringify(context)}\nResponda como assistente virtual.`;
  }
}