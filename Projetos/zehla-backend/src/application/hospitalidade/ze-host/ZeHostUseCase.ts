import { Result } from '../../../domain/shared/Result'
import { RalphLoop } from '../../../domain/swarm/services/RalphLoop'
import { SwarmCoordinator } from '../../../domain/swarm/services/SwarmCoordinator'
import type { IHmacVerifierPort } from '../../hardening/ports/IHmacVerifierPort'
import type { EscalacaoPackage } from '../ze-concierge/ZeConciergeTypes'
import type { ZeHostInput, ZeHostOutput, SubagentDelegado } from './ZeHostTypes'

function normalizarFeedback(texto: string): string {
  const categorias: string[] = []

  const lower = texto.toLowerCase()

  if (lower.includes('limpe') || lower.includes('sujei') || lower.includes('faxina') || lower.includes('arruma') || lower.includes('manuten') || lower.includes('quebr') || lower.includes('conserto') || lower.includes('repar')) {
    categorias.push('limpeza e manutenção')
  }

  if (lower.includes('preco') || lower.includes('preço') || lower.includes('tarifa') || lower.includes('custo') || lower.includes('caro') || lower.includes('barato') || lower.includes('diária') || lower.includes('diaria') || lower.includes('desconto') || lower.includes('conta')) {
    categorias.push('precificação')
  }

  if (lower.includes('cama') || lower.includes('colch') || lower.includes('travesse') || lower.includes('ruido') || lower.includes('barulh') || lower.includes('silênc') || lower.includes('silenc') || lower.includes('quent') || lower.includes('frio') || lower.includes('climatiz') || lower.includes('ar condicion') || lower.includes('tv ') || lower.includes('televis') || lower.includes('wifi') || lower.includes('internet')) {
    categorias.push('conforto do quarto e amenidades')
  }

  if (lower.includes('cafe') || lower.includes('café') || lower.includes('aliment') || lower.includes('comida') || lower.includes('restaur') || lower.includes('bebid') || lower.includes('lanch') || lower.includes('refei')) {
    categorias.push('alimentação')
  }

  if (lower.includes('recepc') || lower.includes('atend') || lower.includes('funcion') || lower.includes('colabor') || lower.includes('equip') || lower.includes('educa') || lower.includes('gross') || lower.includes('mal educ')) {
    categorias.push('atendimento')
  }

  if (categorias.length === 0) {
    categorias.push('experiência geral do hóspede')
  }

  return categorias.join(', ')
}

export class ZeHostUseCase {
  constructor(
    private readonly zcpVerifier: IHmacVerifierPort,
    private readonly zcpSecret: string,
    private readonly swarmCoordinator: SwarmCoordinator,
  ) {}

  execute(pkg: EscalacaoPackage): Result<ZeHostOutput, Error> {
    const { zcpSignature, zcpSignedAt, ...pkgToVerify } = pkg
    const payloadStr = JSON.stringify(pkgToVerify)

    if (!this.zcpVerifier.verify(payloadStr, zcpSignature, this.zcpSecret)) {
      return Result.fail(new Error('ZCP_HMAC_INVALID: Pacote de escalação rejeitado — assinatura ausente, adulterada ou origem forjada.'))
    }

    const categorias = normalizarFeedback(pkg.comentarioSanitizado)

    const goal = `Resolver escalação crítica do hóspede ${pkg.guestId} sobre ${categorias}: ${pkg.comentarioSanitizado}. Nota: ${pkg.notaGeral}/10.`

    const loop = new RalphLoop(
      `rl-${pkg.packageId}`,
      goal,
      pkg.guestId,
      this.swarmCoordinator,
    )

    const initResult = loop.initiate()
    if (initResult.isFail) {
      return Result.fail(new Error(`ZE_HOST_INIT_FAILED: ${initResult.error}`))
    }

    const obsResult = loop.observe()
    if (obsResult.isFail) {
      return Result.fail(new Error(`ZE_HOST_OBSERVE_FAILED: ${obsResult.error}`))
    }

    const planResult = loop.plan()
    if (planResult.isFail) {
      return Result.fail(new Error(`ZE_HOST_PLAN_FAILED: ${planResult.error}`))
    }

    const actResult = loop.act()
    const subagents: SubagentDelegado[] = []
    if (actResult.isOk) {
      for (const agent of actResult.value) {
        subagents.push({
          id: agent.id,
          role: agent.profile.role,
          status: agent.status,
          goalId: agent.goalId,
          taskDescription: agent.taskDescription,
        })
      }
    }

    const learnResult = loop.learn()

    const snapshot = loop.getSnapshot()

    return Result.ok({
      loopId: loop.id,
      packageId: pkg.packageId,
      goal,
      phase: snapshot.phase,
      evaluation: snapshot.evaluation,
      subagents,
      threatEscalation: pkg.threatDetected,
      sanitizedFeedback: pkg.comentarioSanitizado,
    })
  }
}
