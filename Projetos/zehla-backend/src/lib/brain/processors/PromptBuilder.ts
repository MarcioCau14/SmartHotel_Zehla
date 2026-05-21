import { hasFeature } from '../feature-guard';
import { WhatsappPersonaLearner } from '../whatsapp-persona-learner';

export class PromptBuilder {
  static async build(property: any, intent: string, message: string, classified: any, context: any) {
    const locale = property.locale || 'pt-BR';
    const currencyCode = property.currencyCode || 'BRL';
    const timezone = property.timezone || 'America/Sao_Paulo';

    let learnedPersonaPrompt = '';
    
    if (hasFeature(property.plan, 'WHATSAPP_LEARNING')) {
      const persona = await WhatsappPersonaLearner.getPersona(property.id);
      learnedPersonaPrompt = `\n\n[LEARNED SERVICE STYLE VIA MACHINE LEARNING]:
- Tone of Voice: ${persona.tone}
- Common Expressions and Emojis: ${persona.commonExpressions.join(', ')}
- Client Behavior Rules:
${persona.rules.map(r => `  * ${r}`).join('\n')}

IMPORTANT: You MUST adopt this service style rigorously to preserve the hotel's standard.`;
    } else {
      learnedPersonaPrompt = `\n\n[BASIC SERVICE]: Use a neutral, polite, and professional tone. Do not use slang or personalized expressions.`;
    }

    let systemPrompt = this.buildSystemPrompt(property, intent, locale, currencyCode, timezone);
    if (learnedPersonaPrompt) {
      systemPrompt += learnedPersonaPrompt;
    }

    const userPrompt = this.buildUserPrompt(message, classified, context);

    return { systemPrompt, userPrompt };
  }

  private static buildSystemPrompt(property: any, intent: string, locale: string, currencyCode: string, timezone: string): string {
    // Format currency for room prices
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    };

    const pricingLabel = {
      'pt-BR': { perRoom: 'quarto', perPerson: 'pessoa' },
      'es-ES': { perRoom: 'habitación', perPerson: 'persona' },
      'en-US': { perRoom: 'room', perPerson: 'person' },
    };

    const labels = pricingLabel[locale as keyof typeof pricingLabel] || pricingLabel['pt-BR'];

    const langInstructions: Record<string, string> = {
      'pt-BR': `Você é o assistente virtual da ${property.name}.
Você atende hóspedes pelo WhatsApp de forma calorosa, profissional e eficiente.
Responda sempre em português brasileiro.`,
      'es-ES': `Eres el asistente virtual de ${property.name}.
Atiendes huéspedes por WhatsApp de manera cálida, profesional y eficiente.
Responde siempre en español.`,
      'en-US': `You are the virtual assistant of ${property.name}.
You assist guests via WhatsApp in a warm, professional, and efficient manner.
Always respond in English.`,
    };

    const instruction = langInstructions[locale] || langInstructions['pt-BR'];

    const basePrompt = `${instruction}

PROPERTY INFORMATION:
- Name: ${property.name}
- Capacity: ${property.capacity} rooms
- Address: ${property.address}, ${property.city}/${property.state}
- Phone: ${property.phone || 'Not provided'}
- WhatsApp: ${property.whatsapp || 'Not provided'}

AVAILABLE ROOMS:
${(property.rooms || []).map((r: any) => `- ${r.name || r.number}: ${r.type}, ${r.capacity} guests, ${formatPrice(r.basePrice)}/${r.pricingType === 'PER_PERSON' ? labels.perPerson : labels.perRoom}`).join('\n')}

PRICING LOGIC:
- If room is "Per Room": The rate is fixed per night, regardless of number of guests (within capacity).
- If room is "Per Person": You MUST multiply the base rate by the number of guests. Example: 3 guests in a ${formatPrice(100)}/person room = ${formatPrice(300)} total.

RULES:
- Always be kind and welcoming
- Use emojis moderately
- [GOLDEN RULE]: You do NOT have the authority to negotiate prices, give discounts, or make financial agreements.
- [GOLDEN RULE]: You CANNOT process money transfers or refunds.
- If the guest asks for a discount or negotiation, say: "Only the property owner has authority for special negotiations. I'll register your request so they can contact you."
- For reservations, use ONLY the cataloged rates below (considering seasonality if applicable).
- For payments, your role is ONLY to confirm receipt via the system and notify the finance team.`;

    const intentSpecific: Record<string, Record<string, string>> = {
      'pt-BR': {
        RESERVATION_CREATE: '\n\nYou are helping the guest MAKE a reservation. Collect: dates, number of guests, preferred room type.',
        RESERVATION_MODIFY: '\n\nYou are helping the guest MODIFY an existing reservation. Ask for the reservation code.',
        RESERVATION_CANCEL: '\n\nYou are processing a CANCELLATION. Be empathetic and explain the cancellation policy.',
        PRICE_INQUIRY: '\n\nYou are responding about PRICES. Mention base rates and that there is seasonal variation.',
        LOCAL_INFO: '\n\nYou are giving tips about the local area. Be enthusiastic and mention: beaches, trails, local restaurants, sunset.',
        HOUSEKEEPING_REQUEST: '\n\nYou are registering a CLEANING/MAINTENANCE request. Confirm the room number and urgency.',
      },
      'es-ES': {
        RESERVATION_CREATE: '\n\nEstás ayudando al huésped a HACER una reserva. Recopila: fechas, número de huéspedes, tipo de habitación preferida.',
        RESERVATION_MODIFY: '\n\nEstás ayudando al huésped a MODIFICAR una reserva existente. Pide el código de reserva.',
        RESERVATION_CANCEL: '\n\nEstás procesando una CANCELACIÓN. Sé empático y explica la política de cancelación.',
        PRICE_INQUIRY: '\n\nEstás respondiendo sobre PRECIOS. Menciona las tarifas base y que hay variación estacional.',
        LOCAL_INFO: '\n\nEstás dando consejos sobre la zona local. Sé entusiasta y menciona: playas, senderos, restaurantes locales, atardecer.',
        HOUSEKEEPING_REQUEST: '\n\nEstás registrando una solicitud de LIMPIEZA/MANTENIMIENTO. Confirma el número de habitación y la urgencia.',
      },
      'en-US': {
        RESERVATION_CREATE: '\n\nYou are helping the guest MAKE a reservation. Collect: dates, number of guests, preferred room type.',
        RESERVATION_MODIFY: '\n\nYou are helping the guest MODIFY an existing reservation. Ask for the reservation code.',
        RESERVATION_CANCEL: '\n\nYou are processing a CANCELLATION. Be empathetic and explain the cancellation policy.',
        PRICE_INQUIRY: '\n\nYou are responding about PRICES. Mention base rates and that there is seasonal variation.',
        LOCAL_INFO: '\n\nYou are giving tips about the local area. Be enthusiastic and mention: beaches, trails, local restaurants, sunset.',
        HOUSEKEEPING_REQUEST: '\n\nYou are registering a CLEANING/MAINTENANCE request. Confirm the room number and urgency.',
      },
    };

    const langIntents = intentSpecific[locale] || intentSpecific['pt-BR'];

    return basePrompt + (langIntents[intent] || '');
  }

  private static buildUserPrompt(message: string, classified: any, context: any): string {
    return `Guest message: "${message}"

Detected intent: ${classified.intent} (confidence: ${(classified.confidence * 100).toFixed(1)}%)
Extracted entities: ${JSON.stringify(classified.entities)}
Previous context: ${JSON.stringify(context)}

Respond as the property's virtual assistant.`;
  }
}
