import { Result } from '../shared/Result'

export interface MemoryEntry {
  id: string
  tenantId: string
  pousadaId: string
  content: string
  embedding: number[]
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface MemorySearchQuery {
  embedding: number[]
  tenantId: string
  pousadaId?: string
  limit?: number
  minScore?: number
}

export interface MemorySearchResult {
  entry: MemoryEntry
  score: number
}

export interface IZaosMemoryPort {
  store(entry: Omit<MemoryEntry, 'createdAt' | 'updatedAt'>): Promise<Result<MemoryEntry>>
  search(query: MemorySearchQuery): Promise<Result<MemorySearchResult[]>>
  getById(id: string, tenantId: string): Promise<Result<MemoryEntry>>
  deleteById(id: string, tenantId: string): Promise<Result<void>>
  getByTenant(tenantId: string): Promise<Result<MemoryEntry[]>>
  deleteByLeadId(leadId: string, tenantId: string): Promise<Result<void>>
}
