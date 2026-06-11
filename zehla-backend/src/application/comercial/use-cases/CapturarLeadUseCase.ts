import { ILeadPort } from '../../../application/comercial/ports/ILeadPort'
import { Canal } from '../../../domain/comercial/value-objects/Canal'
import { Email } from '../../../domain/comercial/value-objects/Email'
import { Documento } from '../../../domain/comercial/value-objects/Documento'
import { Result } from '../../../shared/Result'
import { Lead } from '../../../domain/comercial/entities/Lead'

export class CapturarLeadUseCase {
  constructor(private readonly leadPort: ILeadPort) {}

  async execute(dados: {
    canal: string
    propriedadeId: string
    nome?: string
    email?: string
    telefone?: string
    documento?: string
    origemUrl?: string
    tags?: string[]
  }): Promise<Result<Lead, Error>> {
    try {
      // 1. Validar canal
      const canalResult = Canal.criar(dados.canal)
      if (canalResult.isFail) {
        return Result.fail(canalResult.error)
      }

      // 2. Validar email se fornecido
      if (dados.email) {
        const emailResult = Email.criar(dados.email)
        if (emailResult.isFail) {
          return Result.fail(emailResult.error)
        }

        // 3. Verificar duplicidade de e-mail
        const existenteResult = await this.leadPort.buscarLeadPorEmail(dados.email, dados.propriedadeId)
        if (existenteResult.isFail) {
          return Result.fail(existenteResult.error)
        }

        const leadExistente = existenteResult.value
        if (leadExistente) {
          // Se existir e estiver perdido ou inativo, reativa
          if (leadExistente.status === 'churned') {
            const reativadoResult = leadExistente.reativar()
            if (reativadoResult.isFail) {
              return Result.fail(reativadoResult.error)
            }

            const updateResult = await this.leadPort.atualizarLead(leadExistente.id, leadExistente.propriedadeId, {
              status: 'reactivated'
            })
            if (updateResult.isFail) {
              return Result.fail(updateResult.error)
            }
            return Result.ok(updateResult.value)
          }

          // Se estiver ativo em outro status, retorna erro de duplicidade
          return Result.fail(new Error('Lead already exists'))
        }
      }

      // 4. Validar documento se fornecido
      if (dados.documento) {
        const documentoResult = Documento.criar(dados.documento)
        if (documentoResult.isFail) {
          return Result.fail(documentoResult.error)
        }
      }

      // 5. Criar lead via port
      const leadResult = await this.leadPort.criarLead({
        canal: dados.canal,
        propriedadeId: dados.propriedadeId,
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        documento: dados.documento,
        origemUrl: dados.origemUrl,
        tags: dados.tags
      })

      if (leadResult.isFail) {
        return Result.fail(leadResult.error)
      }

      return Result.ok(leadResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error capturing lead'))
    }
  }
}