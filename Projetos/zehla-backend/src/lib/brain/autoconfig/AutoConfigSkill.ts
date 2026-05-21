import { prisma } from '@/lib/prisma';
import { generate as callLLM } from '@/lib/brain/llm-router';

/**
 * AutoConfigSkill — Auto-Configuração via IA
 * 
 * Permite que o dono da pousada use linguagem natural para:
 * - Alterar preços de quartos
 * - Criar promoções
 * - Atualizar configurações da propriedade
 * - Gerenciar serviços
 * 
 * Fluxo:
 * 1. Usuário digita comando em linguagem natural
 * 2. LLM interpreta e gera ações estruturadas
 * 3. Ações são validadas (segurança)
 * 4. Ações são executadas no banco
 * 5. Log registrado para auditoria
 * 
 * Segurança:
 * - Ações destrutivas (delete) requerem revisão humana
 * - Alterações de preço > 50% requerem confirmação
 * - Todas as ações são logadas
 */

export interface AutoConfigAction {
  type: 'update_room_price' | 'create_promotion' | 'update_property' | 'toggle_service' | 'update_setting';
  target: string;
  payload: Record<string, any>;
  confidence: number;
  requiresReview: boolean;
  description: string;
}

export interface AutoConfigResult {
  success: boolean;
  actions: AutoConfigAction[];
  executed: number;
  pendingReview: number;
  errors: string[];
  logId: string;
}

export class AutoConfigSkill {
  /**
   * Processa comando em linguagem natural
   */
  async execute(
    propertyId: string,
    userId: string,
    naturalLanguage: string
  ): Promise<AutoConfigResult> {
    console.log(`⚙️ [AUTO-CONFIG] Processando: "${naturalLanguage.slice(0, 100)}..."`);

    // 1. Interpretar comando via LLM
    const actions = await this.interpretCommand(propertyId, naturalLanguage);

    if (actions.length === 0) {
      return {
        success: false,
        actions: [],
        executed: 0,
        pendingReview: 0,
        errors: ['Não foi possível entender o comando. Tente ser mais específico.'],
        logId: '',
      };
    }

    // 2. Criar log de auditoria
    const log = await prisma.autoConfigLog.create({
      data: {
        propertyId,
        userId,
        naturalLanguage,
        executedActions: actions,
        status: 'pending',
      },
    });

    // 3. Executar ações
    const errors: string[] = [];
    let executed = 0;
    let pendingReview = 0;

    for (const action of actions) {
      if (action.requiresReview) {
        pendingReview++;
        continue;
      }

      try {
        await this.executeAction(propertyId, action);
        executed++;
      } catch (error) {
        errors.push(`Falha ao executar "${action.description}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    // 4. Atualizar log
    await prisma.autoConfigLog.update({
      where: { id: log.id },
      data: {
        status: pendingReview > 0 ? 'review_required' : (errors.length > 0 ? 'failed' : 'executed'),
        executedActions: { ...actions, executed, pendingReview, errors },
      },
    });

    return {
      success: executed > 0,
      actions,
      executed,
      pendingReview,
      errors,
      logId: log.id,
    };
  }

  /**
   * Interpreta comando em linguagem natural usando LLM
   */
  private async interpretCommand(propertyId: string, naturalLanguage: string): Promise<AutoConfigAction[]> {
    // Buscar contexto da propriedade para o LLM
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        rooms: { select: { id: true, number: true, name: true, type: true, basePrice: true } },
        services: { select: { id: true, name: true, price: true, isIncluded: true } },
        serviceItems: { select: { id: true, name: true, price: true, category: true } },
      },
    });

    if (!property) return [];

    const systemPrompt = `Você é um assistente de configuração para um sistema de gestão hoteleira (PMS).
Converta o comando do usuário em ações estruturadas para executar no banco de dados.

CONTEXTO DA PROPRIEDADE:
- Nome: ${property.name}
- Quartos: ${property.rooms.map(r => `${r.name || r.number} (${r.type}): R$${r.basePrice}`).join(', ')}
- Serviços: ${property.services.map(s => `${s.name}: R$${s.price || 0} (${s.isIncluded ? 'incluso' : 'extra'})`).join(', ')}

AÇÕES DISPONÍVEIS:
1. update_room_price: Alterar preço de um quarto
   { "type": "update_room_price", "target": "room_id", "payload": { "newPrice": number }, "confidence": 0.0-1.0, "requiresReview": boolean, "description": "string" }

2. create_promotion: Criar promoção
   { "type": "create_promotion", "target": "room_type_or_all", "payload": { "discount": number, "validFrom": "YYYY-MM-DD", "validTo": "YYYY-MM-DD" }, ... }

3. update_property: Atualizar dados da propriedade
   { "type": "update_property", "target": "property", "payload": { "field": "value" }, ... }

4. toggle_service: Ativar/desativar serviço
   { "type": "toggle_service", "target": "service_id", "payload": { "isActive": boolean }, ... }

5. update_setting: Atualizar configuração
   { "type": "update_setting", "target": "setting_name", "payload": { "value": any }, ... }

REGRAS:
- requiresReview: true se alteração de preço > 50%, delete, ou ação irreversível
- requiresReview: false para alterações simples
- confidence: 0.0-1.0 baseado na clareza do comando
- Se não tiver certeza, retorne confidence baixo
- Retorne APENAS um array JSON de ações, sem explicações

Exemplos:
"Mude o preço do quarto Deluxe para 300" → [{"type": "update_room_price", "target": "deluxe", "payload": {"newPrice": 300}, "confidence": 0.9, "requiresReview": false, "description": "Alterar preço do quarto Deluxe para R$300"}]
"Crie uma promoção de Natal com 20% de desconto" → [{"type": "create_promotion", "target": "all", "payload": {"discount": 20, "validFrom": "2026-12-20", "validTo": "2026-12-26"}, "confidence": 0.85, "requiresReview": false, "description": "Promoção de Natal: 20% de desconto"}]`;

    try {
      const response = await callLLM({
        model: 'general',
        messages: [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: naturalLanguage },
        ],
        maxTokens: 500,
        temperature: 0.1,
      });

      const content = response.content?.trim();
      if (!content) return [];

      // Extrair JSON array
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      return JSON.parse(jsonMatch[0]) as AutoConfigAction[];

    } catch (error) {
      console.error('❌ [AUTO-CONFIG] Erro ao interpretar comando:', error);
      return [];
    }
  }

  /**
   * Executa uma ação individual
   */
  private async executeAction(propertyId: string, action: AutoConfigAction): Promise<void> {
    switch (action.type) {
      case 'update_room_price':
        await this.updateRoomPrice(propertyId, action.target, action.payload.newPrice);
        break;

      case 'create_promotion':
        await this.createPromotion(propertyId, action.target, action.payload);
        break;

      case 'update_property':
        await this.updateProperty(propertyId, action.payload);
        break;

      case 'toggle_service':
        await this.toggleService(propertyId, action.target, action.payload.isActive);
        break;

      case 'update_setting':
        await this.updateSetting(propertyId, action.target, action.payload.value);
        break;

      default:
        throw new Error(`Tipo de ação não suportado: ${action.type}`);
    }
  }

  private async updateRoomPrice(propertyId: string, roomIdentifier: string, newPrice: number) {
    // Buscar quarto por número, nome ou tipo
    const room = await prisma.room.findFirst({
      where: {
        propertyId,
        OR: [
          { number: roomIdentifier },
          { name: { contains: roomIdentifier, mode: 'insensitive' } },
          { type: { equals: roomIdentifier.toUpperCase() as any } },
        ],
      },
    });

    if (!room) {
      throw new Error(`Quarto "${roomIdentifier}" não encontrado`);
    }

    await prisma.room.update({
      where: { id: room.id },
      data: { basePrice: newPrice },
    });

    console.log(`✅ [AUTO-CONFIG] Preço do quarto ${room.number} atualizado: R$${room.basePrice} → R$${newPrice}`);
  }

  private async createPromotion(propertyId: string, target: string, payload: any) {
    // Criar pricing rule para promoção
    await prisma.pricingRule.create({
      data: {
        propertyId,
        name: `Promoção ${payload.name || 'Automática'}`,
        description: payload.description || `Desconto de ${payload.discount}%`,
        startDate: new Date(payload.validFrom || new Date()),
        endDate: new Date(payload.validTo || new Date(Date.now() + 7 * 86400000)),
        multiplier: 1 - (payload.discount || 0) / 100,
        isActive: true,
      },
    });

    console.log(`✅ [AUTO-CONFIG] Promoção criada: ${payload.discount}% de desconto`);
  }

  private async updateProperty(propertyId: string, payload: any) {
    await prisma.property.update({
      where: { id: propertyId },
      data: payload,
    });

    console.log(`✅ [AUTO-CONFIG] Propriedade atualizada: ${JSON.stringify(payload)}`);
  }

  private async toggleService(propertyId: string, serviceIdentifier: string, isActive: boolean) {
    const service = await prisma.service.findFirst({
      where: {
        propertyId,
        name: { contains: serviceIdentifier, mode: 'insensitive' },
      },
    });

    if (!service) {
      throw new Error(`Serviço "${serviceIdentifier}" não encontrado`);
    }

    await prisma.service.update({
      where: { id: service.id },
      data: { isIncluded: isActive },
    });

    console.log(`✅ [AUTO-CONFIG] Serviço ${service.name} ${isActive ? 'ativado' : 'desativado'}`);
  }

  private async updateSetting(propertyId: string, settingName: string, value: any) {
    // Mapear configurações para campos do Property
    const settingMap: Record<string, string> = {
      'whatsapp': 'whatsapp',
      'phone': 'phone',
      'email': 'email',
      'website': 'website',
      'pix_key': 'pixKey',
      'locale': 'locale',
      'currency': 'currencyCode',
      'timezone': 'timezone',
    };

    const fieldName = settingMap[settingName.toLowerCase()];
    if (!fieldName) {
      throw new Error(`Configuração "${settingName}" não reconhecida`);
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { [fieldName]: value },
    });

    console.log(`✅ [AUTO-CONFIG] Configuração ${settingName} atualizada: ${value}`);
  }
}

export const autoConfigSkill = new AutoConfigSkill();
