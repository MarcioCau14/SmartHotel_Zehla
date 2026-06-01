import { IDuplicateDetectionService } from '../../../application/lead/ports/IDuplicateDetectionService'
import { ILeadRepository } from '../../../application/lead/ports/ILeadRepository'

export class FakeDuplicateDetectionService implements IDuplicateDetectionService {
  constructor(private leadRepo: ILeadRepository) {}

  async findByEmail(email: string): Promise<{ id: string } | null> {
    if (!email) return null
    const lead = await this.leadRepo.findByEmail(email)
    return lead ? { id: lead.id } : null
  }

  async findByPhone(phone: string): Promise<{ id: string } | null> {
    if (!phone) return null
    const lead = await this.leadRepo.findByPhone(phone)
    return lead ? { id: lead.id } : null
  }

  async isDuplicate(email?: string, phone?: string): Promise<boolean> {
    if (email) {
      const byEmail = await this.findByEmail(email)
      if (byEmail) return true
    }
    if (phone) {
      const byPhone = await this.findByPhone(phone)
      if (byPhone) return true
    }
    return false
  }
}
