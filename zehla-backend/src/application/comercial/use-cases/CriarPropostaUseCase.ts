import { IPropostaPort } from '../../../application/comercial/ports/IPropostaPort'
import { ILeadPort } from '../../../application/comercial/ports/ILeadPort'
import { IPacotePort } from '../../../application/comercial/ports/IPacotePort'
import { Result } from '../../../shared/Result'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Lead } from '../../../domain/comercial/entities/Lead'
import { Pacote } from '../../../domain/comercial/entities/Pacote'

export class CriarPropostaUseCase {
  constructor(
    private readonly propostaPort: IPropostaPort,
    private readonly leadPort: ILeadPort,
    private readonly pacotePort: IPacotePort
  ) {}

  async execute(dados: {
    leadId: string
    propriedadeId: string
    pacoteId: string
    dataCheckIn: Date
    dataCheckOut: Date
    quantidadeHospedes: number
    observacoes?: string
  }): Promise<Result<Proposta, Error>> {
    try {
      // 1. Validar lead existe e está qualificado
      const leadResult = await this.leadPort.buscarLeadPorId(dados.leadId, dados.propriedadeId)
      if (leadResult.isFail) {
        return Result.fail(leadResult.error)
      }
      
      const lead = leadResult.value
      if (!lead) {
        return Result.fail(new Error('Lead not found'))
      }
      
      if (!lead.ehQualificado) {
        return Result.fail(new Error('Proposal can only be created for qualified leads'))
      }
      
      // 2. Validar pacote existe e está ativo
      const pacoteResult = await this.pacotePort.buscarPacotePorId(dados.pacoteId, dados.propriedadeId)
      if (pacoteResult.isFail) {
        return Result.fail(pacoteResult.error)
      }
      
      const pacote = pacoteResult.value
      if (!pacote) {
        return Result.fail(new Error('Package not found'))
      }
      
      if (!pacote.ehAtivo) {
        return Result.fail(new Error('Proposal can only be created for active packages'))
      }
      
      // 3. Validar capacidade do pacote
      if (pacote.capacidadeMaxima !== undefined && dados.quantidadeHospedes > pacote.capacidadeMaxima) {
        return Result.fail(new Error('Number of guests exceeds package capacity'))
      }
      
      // 4. Executar validação de domínio da proposta via Proposta.create
      const propsValidation = Proposta.create({
        id: 'validation-id', // temporário para validar invariantes
        leadId: dados.leadId,
        propriedadeId: dados.propriedadeId,
        pacoteId: dados.pacoteId,
        dataCriacao: new Date(),
        dataCheckIn: dados.dataCheckIn,
        dataCheckOut: dados.dataCheckOut,
        quantidadeHospedes: dados.quantidadeHospedes,
        observacoes: dados.observacoes
      })
      
      if (propsValidation.isFail) {
        return Result.fail(propsValidation.error)
      }
      
      // 5. Criar proposta via port
      const propostaResult = await this.propostaPort.criarProposta({
        leadId: dados.leadId,
        propriedadeId: dados.propriedadeId,
        pacoteId: dados.pacoteId,
        dataCheckIn: dados.dataCheckIn,
        dataCheckOut: dados.dataCheckOut,
        quantidadeHospedes: dados.quantidadeHospedes,
        observacoes: dados.observacoes
      })
      
      if (propostaResult.isFail) {
        return Result.fail(propostaResult.error)
      }

      const propostaCriada = propostaResult.value

      // 6. Transitar status do Lead para negotiation se ele estiver qualificado
      if (lead.status === 'qualified') {
        const trialResult = lead.iniciarTrial()
        if (trialResult.isFail) {
          return Result.fail(new Error('TRANSICAO_FSM_INVALIDA'))
        }
        const leadPropostadoResult = trialResult.value.negociar()
        if (leadPropostadoResult.isOk) {
          const leadPropostado = leadPropostadoResult.value
          const leadUpdateResult = await this.leadPort.atualizarLead(
            leadPropostado.id, 
            leadPropostado.propriedadeId, 
            {
              status: leadPropostado.status
            }
          )
          if (leadUpdateResult.isFail) {
            return Result.fail(leadUpdateResult.error)
          }
        } else {
          return Result.fail(new Error('TRANSICAO_FSM_INVALIDA'))
        }
      }
      
      return Result.ok(propostaCriada)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating proposal'))
    }
  }
}