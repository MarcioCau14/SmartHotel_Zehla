import { prisma } from '../prisma';
import { Plan } from '@prisma/client';
import { ZRouter } from '@/lib/zmg/z-router';
import { CognitiveTerminal } from '@/lib/observability/cognitive-terminal';

export interface MemoryInput {
  tenantId: string;
  guestId: string;
  content: string;
  source: 'whatsapp' | 'booking' | 'pms';
}

/**
 * MemoryIngestionService — O "Estômago" do Cérebro ZEHLA
 * Digere interações brutas e as transforma em Árvore de Memória baseada no plano.
 */
export class MemoryIngestionService {
  
  /**
   * Processa uma nova interação para a Árvore de Memória
   */
  static async ingest(input: MemoryInput) {
    const property = await prisma.property.findUnique({
      where: { id: input.tenantId },
      select: { plan: true, name: true }
    });

    if (!property) return;

    // 1. TokenJuice — Compressão e Limpeza
    const canonicalContent = this.tokenJuice(input.content);
    
    // 2. Guest Profile Update (Persistência de Longo Prazo)
    await this.updateGuestProfile(input.tenantId, input.guestId, canonicalContent);

    // 3. Tiered Memory Logic
    if (ZRouter.hasFeature(property.plan, 'memory_tree')) {
      await this.buildMemoryTree(input.tenantId, input.guestId, canonicalContent, property.plan);
    } else {
      CognitiveTerminal.insight(`[ML-BRAIN] Memória LITE (Sem Árvore) para ${property.name}`, input.tenantId);
    }
  }

  /**
   * TokenJuice — Limpa ruído, remove HTML e encurta URLs para economizar tokens
   */
  private static tokenJuice(content: string): string {
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/https?:\/\/\S+/g, '[link]') // Ofusca links
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();
  }

  /**
   * Atualiza ou cria o perfil persistente do hóspede
   */
  private static async updateGuestProfile(tenantId: string, guestId: string, content: string) {
    await prisma.guestProfile.upsert({
      where: { tenantId_externalId: { tenantId, externalId: guestId } },
      update: { 
        visitCount: { increment: 0 }, // Lógica real incrementaria em check-in
        updatedAt: new Date()
      },
      create: {
        tenantId,
        externalId: guestId,
        preferences: {}
      }
    });
  }

  /**
   * Constrói a hierarquia de nós na Árvore de Memória
   */
  private static async buildMemoryTree(tenantId: string, guestId: string, content: string, plan: Plan) {
    // Busca o nó raiz de sumário do hóspede para hoje
    const today = new Date();
    today.setHours(0,0,0,0);

    const summaryTitle = `Sumário Hóspede ${guestId} - ${today.toLocaleDateString()}`;

    // Busca ou cria o nó de sumário (Level 2)
    let summaryNode = await prisma.memoryNode.findFirst({
      where: {
        tenantId,
        level: 2,
        title: summaryTitle
      }
    });

    if (!summaryNode) {
      summaryNode = await prisma.memoryNode.create({
        data: {
          tenantId,
          level: 2,
          title: summaryTitle,
          content: 'Processando sumário inicial...',
          source: 'ml-brain'
        }
      });
    }

    // Cria o nó de detalhe (Level 3)
    await prisma.memoryNode.create({
      data: {
        tenantId,
        parentId: summaryNode.id,
        level: 3,
        title: `Interação ${new Date().toLocaleTimeString()}`,
        content,
        source: 'whatsapp'
      }
    });

    CognitiveTerminal.success(`[ML-BRAIN] Árvore de Memória atualizada (${plan})`, tenantId);
  }
}
