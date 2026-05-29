import { FinancialAuditEntry, IFinancialAuditRepository } from '../../../application/financeiro/ports/IFinancialAuditRepository'

export class InMemoryFinancialAuditRepository implements IFinancialAuditRepository {
  private entries = new Map<string, FinancialAuditEntry>()

  async save(entry: FinancialAuditEntry): Promise<FinancialAuditEntry> {
    this.entries.set(entry.id, entry)
    return entry
  }

  async findByProperty(propertyId: string, filters?: { limit?: number; offset?: number }): Promise<FinancialAuditEntry[]> {
    let result = Array.from(this.entries.values()).filter((e) => e.propertyId === propertyId)
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    if (filters) {
      if (filters.offset !== undefined) result = result.slice(filters.offset)
      if (filters.limit !== undefined) result = result.slice(0, filters.limit)
    }

    return result
  }

  async findByDateRange(propertyId: string, startDate: Date, endDate: Date): Promise<FinancialAuditEntry[]> {
    return Array.from(this.entries.values()).filter((e) => {
      if (e.propertyId !== propertyId) return false
      return e.createdAt >= startDate && e.createdAt <= endDate
    })
  }

  clear(): void {
    this.entries.clear()
  }
}
