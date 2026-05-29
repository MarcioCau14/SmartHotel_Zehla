export interface FinancialAuditEntry {
  id: string
  propertyId: string
  action: string
  amount: number
  currency: string
  source: string
  externalId?: string
  metadata?: string
  hash: string
  createdAt: Date
}

export interface IFinancialAuditRepository {
  save(entry: FinancialAuditEntry): Promise<FinancialAuditEntry>
  findByProperty(propertyId: string, filters?: { limit?: number; offset?: number }): Promise<FinancialAuditEntry[]>
  findByDateRange(propertyId: string, startDate: Date, endDate: Date): Promise<FinancialAuditEntry[]>
}
