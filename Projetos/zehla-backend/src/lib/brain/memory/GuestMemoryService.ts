import { prisma } from '@/lib/prisma';
import { generate as callLLM } from '@/lib/brain/llm-router';

/**
 * GuestMemoryService — O Subconsciente do ZEHLA
 * 
 * Arquitetura de Memória de Longo Prazo:
 * 1. Extrai preferências do hóspede das conversas via LLM
 * 2. Armazena como JSON estruturado + tags + embedding simplificado
 * 3. Injeta preferências no prompt do agente na próxima interação
 * 
 * Exemplo de preferências extraídas:
 * - "gosto de quarto silencioso" → { roomPreference: "quiet", floorPreference: "upper" }
 * - "sou alérgico a pena" → { allergies: ["feather"], bedType: "synthetic" }
 * - "venho a trabalho" → { travelType: "business", needsWifi: true }
 * 
 * Princípios:
 * - LGPD: hóspede pode solicitar exclusão completa da memória
 * - TTL: memórias inativas por 2 anos são arquivadas
 * - Transparência: hóspede pode ver quais preferências foram armazenadas
 */

export interface GuestPreferences {
  roomPreference?: string; // "quiet", "view", "ground_floor", "upper_floor"
  bedType?: string; // "king", "twin", "single"
  temperature?: string; // "cool", "warm"
  allergies?: string[];
  dietaryRestrictions?: string[];
  travelType?: string; // "business", "leisure", "romantic", "family"
  specialOccasions?: string[]; // "anniversary", "honeymoon", "birthday"
  communicationStyle?: string; // "formal", "casual", "brief"
  needsWifi?: boolean;
  earlyCheckIn?: boolean;
  lateCheckOut?: boolean;
  [key: string]: any;
}

export interface ExtractedMemory {
  preferences: GuestPreferences;
  tags: string[];
  notes?: string;
  confidence: number;
}

export class GuestMemoryService {
  /**
   * Extrai preferências do hóspede de uma mensagem via LLM
   */
  async extractPreferences(
    propertyId: string,
    guestPhone: string,
    message: string,
    guestName?: string
  ): Promise<ExtractedMemory | null> {
    const systemPrompt = `Você é um extrator de preferências de hóspedes para um sistema hoteleiro.
Analise a mensagem do hóspede e extraia preferências, gostos e necessidades.

Retorne APENAS um JSON no formato:
{
  "preferences": {
    "roomPreference": "quiet|view|ground_floor|upper_floor|null",
    "bedType": "king|twin|single|null",
    "travelType": "business|leisure|romantic|family|null",
    "allergies": [],
    "dietaryRestrictions": [],
    "specialOccasions": [],
    "communicationStyle": "formal|casual|brief|null",
    "needsWifi": true|false,
    "earlyCheckIn": true|false,
    "lateCheckOut": true|false
  },
  "tags": ["tag1", "tag2"],
  "notes": "Observação livre sobre o hóspede",
  "confidence": 0.0-1.0
}

Regras:
- Só extraia preferências EXPLÍCITAS ou fortemente implícitas
- Não invente preferências
- Se não houver preferências, retorne confidence: 0.0
- Tags devem ser em inglês (padronizadas): "business_traveler", "wine_lover", "early_riser", etc.`;

    try {
      const response = await callLLM({
        model: 'general',
        messages: [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: `Mensagem do hóspede: "${message}"` },
        ],
        maxTokens: 300,
        temperature: 0.1,
      });

      const content = response.content?.trim();
      if (!content) return null;

      // Extrair JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const extracted = JSON.parse(jsonMatch[0]) as ExtractedMemory;

      // Só salvar se confiança > 0.5
      if (extracted.confidence < 0.5) return null;

      // Salvar/atualizar memória do hóspede
      await this.upsertMemory(propertyId, guestPhone, {
        guestName,
        preferences: extracted.preferences,
        tags: extracted.tags,
        notes: extracted.notes,
      });

      return extracted;

    } catch (error) {
      console.error('❌ [MEMÓRIA] Erro ao extrair preferências:', error);
      return null;
    }
  }

  /**
   * Salva ou atualiza memória do hóspede
   */
  async upsertMemory(
    propertyId: string,
    guestPhone: string,
    data: {
      guestName?: string;
      preferences?: GuestPreferences;
      tags?: string[];
      notes?: string;
    }
  ) {
    const existing = await prisma.guestMemory.findUnique({
      where: { propertyId_guestPhone: { propertyId, guestPhone } },
    });

    if (existing) {
      // Mesclar preferências existentes com novas
      const mergedPreferences = {
        ...(existing.preferences as any),
        ...data.preferences,
      };

      // Mesclar tags (sem duplicatas)
      const existingTags = existing.tags || [];
      const newTags = data.tags || [];
      const mergedTags = [...new Set([...existingTags, ...newTags])];

      await prisma.guestMemory.update({
        where: { propertyId_guestPhone: { propertyId, guestPhone } },
        data: {
          ...(data.guestName && { guestName: data.guestName }),
          preferences: mergedPreferences,
          tags: mergedTags,
          ...(data.notes && { notes: data.notes }),
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.guestMemory.create({
        data: {
          propertyId,
          guestPhone,
          guestName: data.guestName,
          preferences: data.preferences || {},
          tags: data.tags || [],
          notes: data.notes,
          visitCount: 1,
        },
      });
    }
  }

  /**
   * Busca memória do hóspede para injetar no prompt
   */
  async getMemory(propertyId: string, guestPhone: string): Promise<{
    preferences: GuestPreferences;
    tags: string[];
    notes?: string;
    visitCount: number;
    totalSpent: number;
    lastVisitAt?: Date;
  } | null> {
    const memory = await prisma.guestMemory.findUnique({
      where: { propertyId_guestPhone: { propertyId, guestPhone } },
    });

    if (!memory || !memory.isActive) return null;

    return {
      preferences: (memory.preferences as GuestPreferences) || {},
      tags: memory.tags || [],
      notes: memory.notes || undefined,
      visitCount: memory.visitCount,
      totalSpent: memory.totalSpent,
      lastVisitAt: memory.lastVisitAt || undefined,
    };
  }

  /**
   * Gera bloco de contexto de memória para injetar no prompt do agente
   */
  async buildMemoryContext(propertyId: string, guestPhone: string): Promise<string> {
    const memory = await this.getMemory(propertyId, guestPhone);
    if (!memory) return '';

    const parts: string[] = [];

    // Informações de visitas
    if (memory.visitCount > 1) {
      parts.push(`\n📋 HÓSPEDE RECURRENTE: ${memory.visitCount} visitas, total gasto: R$${memory.totalSpent.toFixed(2)}`);
      if (memory.lastVisitAt) {
        parts.push(`Última visita: ${memory.lastVisitAt.toLocaleDateString('pt-BR')}`);
      }
    }

    // Preferências
    const prefs = memory.preferences;
    const prefParts: string[] = [];
    if (prefs.roomPreference) prefParts.push(`Prefere quarto ${prefs.roomPreference}`);
    if (prefs.bedType) prefParts.push(`Tipo de cama: ${prefs.bedType}`);
    if (prefs.travelType) prefParts.push(`Tipo de viagem: ${prefs.travelType}`);
    if (prefs.allergies?.length) prefParts.push(`Alergias: ${prefs.allergies.join(', ')}`);
    if (prefs.dietaryRestrictions?.length) prefParts.push(`Restrições alimentares: ${prefs.dietaryRestrictions.join(', ')}`);
    if (prefs.specialOccasions?.length) prefParts.push(`Ocasião especial: ${prefs.specialOccasions.join(', ')}`);
    if (prefs.communicationStyle) prefParts.push(`Estilo de comunicação: ${prefs.communicationStyle}`);
    if (prefs.needsWifi) prefParts.push('Precisa de Wi-Fi');
    if (prefs.earlyCheckIn) prefParts.push('Prefere check-in antecipado');
    if (prefs.lateCheckOut) prefParts.push('Prefere check-out tardio');

    if (prefParts.length > 0) {
      parts.push(`\n🎯 PREFERÊNCIAS DO HÓSPEDE:\n${prefParts.map(p => `- ${p}`).join('\n')}`);
    }

    // Tags
    if (memory.tags.length > 0) {
      parts.push(`\n🏷️ TAGS: ${memory.tags.join(', ')}`);
    }

    // Notas
    if (memory.notes) {
      parts.push(`\n📝 NOTAS: ${memory.notes}`);
    }

    return parts.join('\n');
  }

  /**
   * Incrementa contador de visitas
   */
  async recordVisit(propertyId: string, guestPhone: string, amount: number = 0) {
    await prisma.guestMemory.update({
      where: { propertyId_guestPhone: { propertyId, guestPhone } },
      data: {
        visitCount: { increment: 1 },
        totalSpent: { increment: amount },
        lastVisitAt: new Date(),
      },
    });
  }

  /**
   * LGPD: Exclui toda a memória do hóspede
   */
  async deleteMemory(propertyId: string, guestPhone: string) {
    await prisma.guestMemory.delete({
      where: { propertyId_guestPhone: { propertyId, guestPhone } },
    });
  }

  /**
   * Lista hóspedes com memória para uma propriedade
   */
  async listMemories(propertyId: string, limit: number = 50) {
    return prisma.guestMemory.findMany({
      where: { propertyId, isActive: true },
      orderBy: { visitCount: 'desc' },
      take: limit,
      select: {
        guestPhone: true,
        guestName: true,
        visitCount: true,
        totalSpent: true,
        tags: true,
        lastVisitAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Busca hóspedes similares por tags (similaridade simplificada)
   */
  async findSimilarGuests(propertyId: string, tags: string[], limit: number = 10) {
    return prisma.guestMemory.findMany({
      where: {
        propertyId,
        isActive: true,
        tags: { hasSome: tags },
      },
      orderBy: { visitCount: 'desc' },
      take: limit,
    });
  }
}

export const guestMemoryService = new GuestMemoryService();
