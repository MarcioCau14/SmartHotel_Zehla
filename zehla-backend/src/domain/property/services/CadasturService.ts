import { Result } from '../../shared/Result'
import { Property } from '../entities/Property'
import { CadasturInfo } from '../value-objects/CadasturInfo'
import { CadasturStatus } from '../enums'

export class CadasturService {
  validate(number: string, expiryDate: Date): Result<CadasturInfo, string> {
    const diffDays = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    let status = CadasturStatus.VALID
    if (diffDays < 0) {
      status = CadasturStatus.EXPIRED
    } else if (diffDays <= 30) {
      status = CadasturStatus.EXPIRING
    }

    return CadasturInfo.create({ number, status, expiryDate })
  }

  checkExpiry(info: CadasturInfo, referenceDate?: Date): CadasturInfo {
    return info.checkExpiry(referenceDate)
  }

  notifyRenewal(info: CadasturInfo): boolean {
    return info.isExpiringSoon(30) || info.status === CadasturStatus.EXPIRED
  }

  findExpiringCadastur(
    repo: { findCadasturExpiring: (days?: number) => Promise<Property[]> },
    days?: number
  ): Promise<Property[]> {
    return repo.findCadasturExpiring(days)
  }

  findExpiredCadastur(
    repo: { findCadasturExpired: () => Promise<Property[]> }
  ): Promise<Property[]> {
    return repo.findCadasturExpired()
  }
}
