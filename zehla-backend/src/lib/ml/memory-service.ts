import { prisma } from '../prisma';
import { Plan } from '@prisma/client';
import { ZRouter } from '../zmg/z-router';
import { CognitiveTerminal } from '../observability/cognitive-terminal';

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
    if (ZRouter.hasFeature(property.plan as any, 'memory_tree')) {
      await this.buildMemoryTree(input.tenantId, input.guestId, canonicalContent, property.plan as any);
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
   * Nota: Modelo guest_profile ainda não foi migrado para o schema.
   * Usando raw query como bridge até migração oficial.
   */
  private static async updateGuestProfile(tenantId: string, guestId: string, content: string) {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO guest_profiles (tenant_id, external_id, preferences, visit_count, updated_at)
         VALUES ($1, $2, '{}'::jsonb, 0, NOW())
         ON CONFLICT (tenant_id, external_id)
         DO UPDATE SET updated_at = NOW()`,
        tenantId, guestId
      );
    } catch {
      console.warn(`[ML-BRAIN] guest_profiles table not available yet for ${guestId}`);
    }
  }

  /**
   * Constrói a hierarquia de nós na Árvore de Memória
   * Nota: Modelo memory_node ainda não foi migrado para o schema.
   * Usando raw query como bridge até migração oficial.
   */
  private static async buildMemoryTree(tenantId: string, guestId: string, content: string, plan: Plan) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const summaryTitle = `Sumário Hóspede ${guestId} - ${today.toLocaleDateString()}`;

      // Tenta criar nó de sumário (raw)
      await prisma.$executeRawUnsafe(
        `INSERT INTO memory_nodes (tenant_id, level, title, content, source, created_at)
         VALUES ($1, 2, $2, 'Processando sumário inicial...', 'ml-brain', NOW())
         ON CONFLICT DO NOTHING`,
        tenantId, summaryTitle
      );

      // Nó de detalhe
      await prisma.$executeRawUnsafe(
        `INSERT INTO memory_nodes (tenant_id, level, title, content, source, parent_id, created_at)
         VALUES ($1, 3, $2, $3, 'whatsapp',
           (SELECT id FROM memory_nodes WHERE tenant_id = $1 AND title = $4 LIMIT 1),
           NOW())`,
        tenantId,
        `Interação ${new Date().toLocaleTimeString()}`,
        content,
        summaryTitle
      );

      CognitiveTerminal.success(`[ML-BRAIN] Árvore de Memória atualizada (${plan})`, tenantId);
    } catch {
      console.warn(`[ML-BRAIN] memory_nodes table not available yet for ${guestId}`);
    }
  }
}
