import { Result } from '../../../shared/Result'
import { IComercialLeadPort } from '../../../application/comercial/ports/IComercialLeadPort'
import { ComercialLead, EstadoLead } from '../../../domain/comercial/entities/ComercialLead'

export class InMemoryComercialLeadAdapter implements IComercialLeadPort {
  private leads = new Map<string, ComercialLead>()

  async buscarPorId(id: string): Promise<Result<ComercialLead | null, Error>> {
    const lead = this.leads.get(id) ?? null
    return Result.ok(lead)
  }

  async salvar(lead: ComercialLead): Promise<Result<ComercialLead, Error>> {
    this.leads.set(lead.id, lead)
    return Result.ok(lead)
  }

  async listarPorEstado(estado: EstadoLead): Promise<Result<ComercialLead[], Error>> {
    const leads = Array.from(this.leads.values()).filter(l => l.estado === estado)
    return Result.ok(leads)
  }

  salvarMock(lead: ComercialLead): void {
    this.leads.set(lead.id, lead)
  }

  limpar(): void {
    this.leads.clear()
  }
}
