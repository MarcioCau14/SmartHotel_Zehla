import { Result } from '../../../domain/shared/Result'
import {
  type MemoryEntry,
  type MemorySearchQuery,
  type MemorySearchResult,
  type IZaosMemoryPort,
} from '../../../domain/memory/IZaosMemoryPort'
import { randomUUID } from 'node:crypto'

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB)
  return magnitude === 0 ? 0 : dotProduct / magnitude
}

export class InMemoryZaosMemoryAdapter implements IZaosMemoryPort {
  private entries: Map<string, MemoryEntry> = new Map()

  async store(entry: Omit<MemoryEntry, 'createdAt' | 'updatedAt'>): Promise<Result<MemoryEntry>> {
    try {
      const now = new Date()
      const newEntry: MemoryEntry = {
        ...entry,
        id: entry.id || randomUUID(),
        createdAt: now,
        updatedAt: now,
      }

      this.entries.set(newEntry.id, newEntry)
      return Result.ok(newEntry)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to store memory'))
    }
  }

  async search(query: MemorySearchQuery): Promise<Result<MemorySearchResult[]>> {
    try {
      const { embedding, tenantId, pousadaId, limit = 10, minScore = 0.0 } = query

      const candidates: MemorySearchResult[] = []

      for (const entry of Array.from(this.entries.values())) {
        if (entry.tenantId !== tenantId) continue
        if (pousadaId && entry.pousadaId !== pousadaId) continue

        const score = cosineSimilarity(embedding, entry.embedding)
        if (score < minScore) continue

        candidates.push({ entry, score })
      }

      candidates.sort((a, b) => b.score - a.score)
      const top = candidates.slice(0, limit)

      return Result.ok(top)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Search failed'))
    }
  }

  async getById(id: string, tenantId: string): Promise<Result<MemoryEntry>> {
    const entry = this.entries.get(id)
    if (!entry || entry.tenantId !== tenantId) {
      return Result.fail(new Error('Memory entry not found'))
    }
    return Result.ok(entry)
  }

  async deleteById(id: string, tenantId: string): Promise<Result<void>> {
    const entry = this.entries.get(id)
    if (!entry || entry.tenantId !== tenantId) {
      return Result.fail(new Error('Memory entry not found'))
    }
    this.entries.delete(id)
    return Result.ok(undefined)
  }

  async getByTenant(tenantId: string): Promise<Result<MemoryEntry[]>> {
    const tenantEntries: MemoryEntry[] = []
    for (const entry of Array.from(this.entries.values())) {
      if (entry.tenantId === tenantId) {
        tenantEntries.push(entry)
      }
    }
    return Result.ok(tenantEntries)
  }

  async deleteByLeadId(leadId: string, tenantId: string): Promise<Result<void>> {
    try {
      for (const [id, entry] of Array.from(this.entries.entries())) {
        if (entry.tenantId === tenantId && entry.metadata?.leadId === leadId) {
          this.entries.delete(id)
        }
      }
      return Result.ok(undefined)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to delete by leadId'))
    }
  }
}
