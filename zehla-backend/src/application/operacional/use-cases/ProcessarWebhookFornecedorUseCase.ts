import * as crypto from 'crypto'
import { Result } from '../../../shared/Result'
import { IFornecedorPort } from '../ports/IFornecedorPort'
import { IManutencaoPort } from '../ports/IManutencaoPort'

export type WebhookAcao = 'a_caminho' | 'em_andamento' | 'concluido' | 'cancelado' | 'problema'

export class ProcessarWebhookFornecedorUseCase {
  constructor(
    private readonly fornecedorPort: IFornecedorPort,
    private readonly manutencaoPort: IManutencaoPort,
  ) {}

  async execute(dados: {
    fornecedorId: string
    manutencaoId: string
    propriedadeId: string
    acao: WebhookAcao
    payload: Record<string, unknown>
    signature?: string
    observacoes?: string
  }): Promise<Result<boolean, Error>> {
    try {
      const secretResult = await this.fornecedorPort.obterWebhookSecret(dados.fornecedorId)
      if (secretResult.isFail) return Result.fail(secretResult.error)
      const secret = secretResult.value

      if (!dados.signature) {
        return Result.fail(new Error('Assinatura HMAC ausente. Webhook rejeitado.'))
      }

      if (!secret || secret.trim().length === 0) {
        return Result.fail(new Error('Webhook secret não configurado para este fornecedor'))
      }

      const payloadStr = JSON.stringify(dados.payload)
      const hmacCalculado = crypto
        .createHmac('sha256', secret)
        .update(payloadStr)
        .digest('hex')

      const assinaturaRecebida = dados.signature
      const assinaturaCalculada = hmacCalculado

      if (assinaturaCalculada.length !== assinaturaRecebida.length) {
        return Result.fail(new Error('Assinatura HMAC inválida. Webhook rejeitado.'))
      }

      if (!crypto.timingSafeEqual(Buffer.from(assinaturaCalculada), Buffer.from(assinaturaRecebida))) {
        return Result.fail(new Error('Assinatura HMAC inválida. Webhook rejeitado.'))
      }

      const manutencaoResult = await this.manutencaoPort.buscarManutencaoPorId(dados.manutencaoId, dados.propriedadeId)
      if (manutencaoResult.isFail) return Result.fail(manutencaoResult.error)
      if (!manutencaoResult.value) {
        return Result.fail(new Error('Manutenção não encontrada'))
      }

      const manutencao = manutencaoResult.value
      const acoesValidas: Record<WebhookAcao, { statusNovo: string; descricao?: string }> = {
        a_caminho: { statusNovo: 'agendada' },
        em_andamento: { statusNovo: 'em_andamento' },
        concluido: { statusNovo: 'concluida', descricao: dados.observacoes },
        cancelado: { statusNovo: 'cancelada' },
        problema: { statusNovo: 'aberta', descricao: dados.observacoes },
      }

      const acao = acoesValidas[dados.acao]
      if (!acao) {
        return Result.fail(new Error(`Ação desconhecida: ${dados.acao}`))
      }

      const updateResult = await this.manutencaoPort.atualizarManutencao(dados.manutencaoId, dados.propriedadeId, {
        status: acao.statusNovo as any,
        descricaoSolucao: acao.descricao,
        dataInicio: dados.acao === 'em_andamento' ? new Date() : undefined,
        dataFim: dados.acao === 'concluido' ? new Date() : undefined,
      })
      if (updateResult.isFail) return Result.fail(updateResult.error)

      return Result.ok(true)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao processar webhook'))
    }
  }
}
