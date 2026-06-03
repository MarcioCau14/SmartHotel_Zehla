import type { ICRMRepositoryPort } from '../ports/ICRMRepositoryPort'
import { CRMContextEnvelope } from '../models/CRMContextEnvelope'

export interface CRMContextResult {
  readonly envelope: CRMContextEnvelope | null
  readonly leadExists: boolean
  readonly loadedInMs: number
}

export class CRMContextProvider {
  constructor(private readonly crmPort: ICRMRepositoryPort) {}

  async enrichContext(phoneOrLeadId: string): Promise<CRMContextResult> {
    const start = Date.now()

    const leadResult = await this.crmPort.buscarLeadPorId(phoneOrLeadId)
    if (leadResult.isFail) {
      return { envelope: null, leadExists: false, loadedInMs: Date.now() - start }
    }

    let profile = leadResult.value
    if (!profile) {
      const telefoneLimpo = phoneOrLeadId.replace(/[^0-9]/g, '')
      const phoneResult = await this.crmPort.buscarLeadPorTelefone(telefoneLimpo)
      if (phoneResult.isOk) {
        profile = phoneResult.value
      }
    }

    if (!profile) {
      return { envelope: null, leadExists: false, loadedInMs: Date.now() - start }
    }

    return {
      envelope: CRMContextEnvelope.fromProfile(profile),
      leadExists: true,
      loadedInMs: Date.now() - start,
    }
  }
}
