import { describe, it, expect } from 'vitest'
import { SubagentProfile } from '../../domain/swarm/entities/SubagentProfile'
import { Subagent } from '../../domain/swarm/entities/Subagent'
import { ConsensusEngine, SubagentVote } from '../../domain/swarm/services/ConsensusEngine'
import { DogmaticEvaluator } from '../../domain/swarm/services/DogmaticEvaluator'
import { RalphLoop } from '../../domain/swarm/services/RalphLoop'
import { SwarmCoordinator } from '../../domain/swarm/services/SwarmCoordinator'

describe('SubagentProfile', () => {
  it('deve criar perfil a partir de role conhecida', () => {
    const profile = SubagentProfile.fromRole('pricing')
    expect(profile.isOk).toBe(true)
    expect(profile.value.name).toBe('Zé-Pricing')
    expect(profile.value.capabilities).toContain('scrape_prices')
  })

  it('deve falhar ao criar perfil de role desconhecida', () => {
    const profile = SubagentProfile.fromRole('unknown' as never)
    expect(profile.isFail).toBe(true)
  })

  it('deve criar perfil customizado', () => {
    const profile = SubagentProfile.custom({
      role: 'analyst',
      name: 'Zé-Custom',
      description: 'Custom analyst',
      capabilities: ['custom_analysis'],
    })
    expect(profile.name).toBe('Zé-Custom')
    expect(profile.hasCapability('custom_analysis')).toBe(true)
    expect(profile.hasCapability('scrape_prices')).toBe(false)
  })

  it('deve listar todos os roles do catalogo', () => {
    const profiles = SubagentProfile.listRoles()
    expect(profiles.length).toBe(4)
    const roles = profiles.map(p => p.role)
    expect(roles).toContain('pricing')
    expect(roles).toContain('reviews')
    expect(roles).toContain('concierge')
    expect(roles).toContain('analyst')
  })

  it('deve verificar capacidades', () => {
    const profile = SubagentProfile.fromRole('reviews').value
    expect(profile.hasCapability('sentiment_analysis')).toBe(true)
    expect(profile.hasCapability('scrape_prices')).toBe(false)
  })
})

describe('Subagent', () => {
  it('deve criar subagent com dados validos', () => {
    const profile = SubagentProfile.fromRole('pricing').value
    const result = Subagent.create({
      id: 'agent-1',
      profile,
      goalId: 'goal-1',
      taskDescription: 'Analisar precos',
    })
    expect(result.isOk).toBe(true)
    expect(result.value.status).toBe('idle')
    expect(result.value.profile.name).toBe('Zé-Pricing')
  })

  it('deve falhar ao criar sem task description', () => {
    const profile = SubagentProfile.fromRole('pricing').value
    const result = Subagent.create({
      id: 'agent-2',
      profile,
      goalId: 'goal-1',
      taskDescription: '',
    })
    expect(result.isFail).toBe(true)
  })

  it('deve iniciar subagent corretamente', () => {
    const profile = SubagentProfile.fromRole('pricing').value
    const agent = Subagent.create({
      id: 'agent-3', profile, goalId: 'g-1', taskDescription: 'Task',
    }).value
    expect(agent.start().isOk).toBe(true)
    expect(agent.status).toBe('working')
    expect(agent.startedAt).not.toBeNull()
  })

  it('deve falhar ao iniciar subagent ja em andamento', () => {
    const profile = SubagentProfile.fromRole('pricing').value
    const agent = Subagent.create({
      id: 'agent-4', profile, goalId: 'g-1', taskDescription: 'Task',
    }).value
    agent.start()
    expect(agent.start().isFail).toBe(true)
  })

  it('deve completar subagent com resultado', () => {
    const profile = SubagentProfile.fromRole('pricing').value
    const agent = Subagent.create({
      id: 'agent-5', profile, goalId: 'g-1', taskDescription: 'Task',
    }).value
    agent.start()
    const result = agent.complete({
      taskId: 't-1',
      data: { approved: true },
      evidence: 'Precos analisados com sucesso',
      completedAt: new Date(),
    })
    expect(result.isOk).toBe(true)
    expect(agent.status).toBe('done')
    expect(agent.result).not.toBeNull()
    expect(agent.isFinished()).toBe(true)
  })

  it('deve falhar subagent com motivo', () => {
    const profile = SubagentProfile.fromRole('pricing').value
    const agent = Subagent.create({
      id: 'agent-6', profile, goalId: 'g-1', taskDescription: 'Task',
    }).value
    agent.start()
    expect(agent.fail('Erro na analise').isOk).toBe(true)
    expect(agent.status).toBe('failed')
    expect(agent.failureReason).toBe('Erro na analise')
    expect(agent.isFinished()).toBe(true)
  })

  it('deve falhar ao completar subagent sem iniciar', () => {
    const profile = SubagentProfile.fromRole('pricing').value
    const agent = Subagent.create({
      id: 'agent-7', profile, goalId: 'g-1', taskDescription: 'Task',
    }).value
    const result = agent.complete({
      taskId: 't-1', data: {}, evidence: 'x', completedAt: new Date(),
    })
    expect(result.isFail).toBe(true)
  })
})

describe('ConsensusEngine', () => {
  const engine = new ConsensusEngine()

  it('deve aprovar com maioria simples (>50%)', () => {
    const votes: SubagentVote[] = [
      { subagentId: 'a1', value: 'yes', rationale: 'Aprovo' },
      { subagentId: 'a2', value: 'yes', rationale: 'Aprovo' },
      { subagentId: 'a3', value: 'no', rationale: 'Discordo' },
    ]
    const result = engine.reachConsensus(votes)
    expect(result.isOk).toBe(true)
    expect(result.value.approved).toBe(true)
    expect(result.value.decision).toBe('yes')
    expect(result.value.total).toBe(3)
  })

  it('deve rejeitar quando maioria discorda', () => {
    const votes: SubagentVote[] = [
      { subagentId: 'a1', value: 'no', rationale: 'Discordo' },
      { subagentId: 'a2', value: 'no', rationale: 'Discordo' },
      { subagentId: 'a3', value: 'yes', rationale: 'Aprovo' },
    ]
    const result = engine.reachConsensus(votes)
    expect(result.isOk).toBe(true)
    expect(result.value.approved).toBe(false)
    expect(result.value.decision).toBe('no')
  })

  it('deve ignorar abstencao no calculo da maioria', () => {
    const votes: SubagentVote[] = [
      { subagentId: 'a1', value: 'yes', rationale: 'Aprovo' },
      { subagentId: 'a2', value: 'abstain', rationale: 'Prefiro nao opinar' },
      { subagentId: 'a3', value: 'abstain', rationale: 'Prefiro nao opinar' },
    ]
    const result = engine.reachConsensus(votes)
    expect(result.isOk).toBe(true)
    expect(result.value.approved).toBe(true)
    expect(result.value.decision).toBe('yes')
  })

  it('deve falhar com zero votos', () => {
    const result = engine.reachConsensus([])
    expect(result.isFail).toBe(true)
  })

  it('deve reportar agreement corretamente', () => {
    const votes: SubagentVote[] = [
      { subagentId: 'a1', value: 'yes', rationale: '' },
      { subagentId: 'a2', value: 'yes', rationale: '' },
      { subagentId: 'a3', value: 'yes', rationale: '' },
      { subagentId: 'a4', value: 'no', rationale: '' },
    ]
    const result = engine.reachConsensus(votes)
    expect(result.isOk).toBe(true)
    expect(result.value.agreement).toBeCloseTo(0.75)
    expect(result.value.options).toHaveLength(2)
  })
})

describe('DogmaticEvaluator', () => {
  it('deve aprovar goal com evidencias suficientes e consenso', () => {
    const profile = SubagentProfile.fromRole('pricing').value
    const agent = Subagent.create({
      id: 'a1', profile, goalId: 'g-1', taskDescription: 'Analisar',
    }).value
    agent.start()
    agent.complete({
      taskId: 't-1',
      data: { approved: true },
      evidence: 'Analise de precos concluida com dados suficientes para decisao',
      completedAt: new Date(),
    })

    const evaluator = new DogmaticEvaluator()
    const result = evaluator.evaluate('Analisar precos', [agent])
    expect(result.isOk).toBe(true)
    expect(result.value.approved).toBe(true)
    expect(result.value.score).toBeGreaterThan(0)
  })

  it('deve rejeitar goal sem evidencias', () => {
    const profile = SubagentProfile.fromRole('analyst').value
    const agent = Subagent.create({
      id: 'a2', profile, goalId: 'g-1', taskDescription: 'Analisar',
    }).value
    agent.start()
    agent.complete({
      taskId: 't-1', data: { approved: true }, evidence: 'curta', completedAt: new Date(),
    })

    const evaluator = new DogmaticEvaluator(undefined, { minEvidenceLength: 50 })
    const result = evaluator.evaluate('Analisar dados', [agent])
    expect(result.isOk).toBe(true)
    expect(result.value.approved).toBe(false)
    expect(result.value.rejections.length).toBeGreaterThan(0)
    expect(result.value.rejections[0]).toContain('Insufficient evidence')
  })

  it('deve rejeitar goal com subagentes incompletos', () => {
    const profile = SubagentProfile.fromRole('pricing').value
    const agent = Subagent.create({
      id: 'a3', profile, goalId: 'g-1', taskDescription: 'Task',
    }).value

    const evaluator = new DogmaticEvaluator()
    const result = evaluator.evaluate('Meta', [agent])
    expect(result.isOk).toBe(true)
    expect(result.value.approved).toBe(false)
    expect(result.value.score).toBe(0)
  })

  it('deve calcular score composto corretamente', () => {
    const profile = SubagentProfile.fromRole('pricing').value
    const agent = Subagent.create({
      id: 'a4', profile, goalId: 'g-1', taskDescription: 'Task',
    }).value
    agent.start()
    agent.complete({
      taskId: 't-1',
      data: { approved: true },
      evidence: 'Evidencia detalhada com informacao suficiente para a meta',
      completedAt: new Date(),
    })

    const evaluator = new DogmaticEvaluator()
    const result = evaluator.evaluate('Meta', [agent])
    expect(result.isOk).toBe(true)
    expect(result.value.score).toBeGreaterThan(0)
    expect(result.value.evidenceCount).toBe(1)
  })
})

describe('SwarmCoordinator', () => {
  it('deve spawnar subagent', () => {
    const coordinator = new SwarmCoordinator()
    const profile = SubagentProfile.fromRole('pricing').value
    const result = coordinator.spawnSubagent(profile, 'goal-1', 'Analisar precos')
    expect(result.isOk).toBe(true)
    expect(result.value.profile.role).toBe('pricing')
  })

  it('deve coletar subagentes ativos', () => {
    const coordinator = new SwarmCoordinator()
    coordinator.spawnSubagent(SubagentProfile.fromRole('pricing').value, 'g-1', 'T1')
    coordinator.spawnSubagent(SubagentProfile.fromRole('reviews').value, 'g-1', 'T2')
    expect(coordinator.getActiveSubagents()).toHaveLength(2)
  })

  it('deve atribuir tarefa e completar subagent', () => {
    const coordinator = new SwarmCoordinator()
    const spawnResult = coordinator.spawnSubagent(
      SubagentProfile.fromRole('analyst').value, 'g-1', 'Analisar'
    )
    const agentId = spawnResult.value.id

    const assignResult = coordinator.assignTask(agentId, {
      taskId: 't-1',
      data: { approved: true },
      evidence: 'Tarefa concluida com sucesso',
      completedAt: new Date(),
    })
    expect(assignResult.isOk).toBe(true)
    expect(coordinator.getSubagent(agentId)?.status).toBe('done')
  })

  it('deve falhar subagent', () => {
    const coordinator = new SwarmCoordinator()
    const spawnResult = coordinator.spawnSubagent(
      SubagentProfile.fromRole('analyst').value, 'g-1', 'Task'
    )
    const agentId = spawnResult.value.id

    const failResult = coordinator.failSubagent(agentId, 'Erro critico ao iniciar')
    expect(failResult.isFail).toBe(true)
    expect(failResult.error).toContain('Cannot fail subagent from status idle')

    const agent = coordinator.getSubagent(agentId)
    const startResult = agent?.start()
    expect(startResult?.isOk).toBe(true)

    const failResult2 = coordinator.failSubagent(agentId, 'Erro critico durante execucao')
    expect(failResult2.isOk).toBe(true)
    expect(coordinator.getSubagent(agentId)?.status).toBe('failed')
  })

  it('deve reportar status do enxame', () => {
    const coordinator = new SwarmCoordinator()
    const p1 = coordinator.spawnSubagent(SubagentProfile.fromRole('pricing').value, 'g-1', 'T1')
    coordinator.assignTask(p1.value.id, {
      taskId: 't-1', data: { approved: true }, evidence: 'x', completedAt: new Date(),
    })

    coordinator.spawnSubagent(SubagentProfile.fromRole('reviews').value, 'g-1', 'T2')

    const status = coordinator.getStatus()
    expect(status.totalSubagents).toBe(2)
    expect(status.done).toBe(1)
    expect(status.idle).toBe(1)
  })

  it('deve filtrar por goal', () => {
    const coordinator = new SwarmCoordinator()
    coordinator.spawnSubagent(SubagentProfile.fromRole('pricing').value, 'g-1', 'T1')
    coordinator.spawnSubagent(SubagentProfile.fromRole('reviews').value, 'g-2', 'T2')
    expect(coordinator.getSubagentsByGoal('g-1')).toHaveLength(1)
    expect(coordinator.getSubagentsByGoal('g-2')).toHaveLength(1)
  })

  it('deve limpar enxame', () => {
    const coordinator = new SwarmCoordinator()
    coordinator.spawnSubagent(SubagentProfile.fromRole('pricing').value, 'g-1', 'T1')
    coordinator.clear()
    expect(coordinator.getActiveSubagents()).toHaveLength(0)
  })

  it('deve calcular metricas', () => {
    const coordinator = new SwarmCoordinator()
    const a = coordinator.spawnSubagent(SubagentProfile.fromRole('pricing').value, 'g-1', 'T1')
    coordinator.assignTask(a.value.id, {
      taskId: 't-1', data: { approved: true }, evidence: 'x', completedAt: new Date(),
    })
    const metrics = coordinator.getMetrics()
    expect(metrics.total).toBe(1)
    expect(metrics.successRate).toBe(1)
  })
})

describe('RalphLoop', () => {
  it('deve iniciar o loop com /goal', () => {
    const loop = new RalphLoop('loop-1', 'Analisar precos de concorrentes', 'tenant-1')
    const result = loop.initiate()
    expect(result.isOk).toBe(true)
    expect(loop.currentPhase).toBe('observing')
  })

  it('deve falhar ao iniciar com goal curto', () => {
    const loop = new RalphLoop('loop-2', 'Oi', 'tenant-1')
    expect(loop.initiate().isFail).toBe(true)
  })

  it('deve executar ciclo completo OODA ate completar', () => {
    const loop = new RalphLoop('loop-3', 'Analisar precos de concorrentes e gerar relatorio', 'tenant-1')

    expect(loop.initiate().isOk).toBe(true)
    expect(loop.currentPhase).toBe('observing')

    const observeResult = loop.observe()
    expect(observeResult.isOk).toBe(true)
    expect(observeResult.value.context).toContain('Analisar precos')
    expect(loop.currentPhase).toBe('planning')

    const planResult = loop.plan()
    expect(planResult.isOk).toBe(true)
    expect(planResult.value.length).toBeGreaterThan(0)
    expect(loop.currentPhase).toBe('acting')

    const actResult = loop.act()
    expect(actResult.isOk).toBe(true)
    expect(actResult.value.length).toBeGreaterThan(0)
    expect(loop.currentPhase).toBe('learning')

    const learnResult = loop.learn()
    expect(learnResult.isOk).toBe(true)
    expect(loop.currentPhase).toBe('completed')
    expect(loop.currentEvaluation?.approved).toBe(true)
  })

  it('deve executar goal generico com fallback analyst', () => {
    const loop = new RalphLoop('loop-4', 'Preciso de um resumo geral do mes', 'tenant-1')
    loop.initiate()
    loop.observe()
    const plan = loop.plan()
    expect(plan.isOk).toBe(true)
    expect(plan.value[0].requiredRoles).toContain('analyst')
  })

  it('deve retornar snapshot com estado completo', () => {
    const loop = new RalphLoop('loop-5', 'Analisar reviews', 'tenant-1')
    loop.initiate()
    loop.observe()
    loop.plan()

    const snapshot = loop.getSnapshot()
    expect(snapshot.id).toBe('loop-5')
    expect(snapshot.goal).toBe('Analisar reviews')
    expect(snapshot.tenantId).toBe('tenant-1')
    expect(snapshot.phase).toBe('acting')
    expect(snapshot.attempt).toBe(1)
  })

  it('deve respeitar maxAttempts no ciclo', () => {
    const loop = new RalphLoop(
      'loop-6',
      'Meta com evidencia insuficiente',
      'tenant-1',
      undefined,
      new DogmaticEvaluator(undefined, { minEvidenceLength: 9999 })
    )

    loop.initiate()
    loop.observe()

    for (let i = 0; i < 3; i++) {
      const plan = loop.plan()
      if (plan.isFail) {
        expect(plan.error).toContain('Max attempts')
        return
      }
      loop.act()
      loop.learn()
    }
  })

  it('deve integrar SwarmCoordinator no act()', () => {
    const loop = new RalphLoop('loop-7', 'Precificacao e analise de concorrentes', 'tenant-1')
    loop.initiate()
    loop.observe()
    loop.plan()
    loop.act()
    loop.learn()

    const coordinator = loop.swarmCoordinator
    const agents = coordinator.getActiveSubagents()
    expect(agents.length).toBeGreaterThan(0)
    const roles = agents.map(a => a.profile.role)
    expect(roles).toContain('pricing')
  })
})

describe('Integracao: SwarmCoordinator + ConsensusEngine + DogmaticEvaluator', () => {
  it('deve coordenar enxame, alcancar consenso e ser aprovado pelo avaliador', () => {
    const coordinator = new SwarmCoordinator()
    const engine = new ConsensusEngine()

    const p1 = coordinator.spawnSubagent(SubagentProfile.fromRole('pricing').value, 'g-1', 'Analisar precos')
    const p2 = coordinator.spawnSubagent(SubagentProfile.fromRole('analyst').value, 'g-1', 'Validar dados')

    coordinator.assignTask(p1.value.id, {
      taskId: 't-1', data: { approved: true },
      evidence: 'Precos dos concorrentes analisados: media R$ 350,00',
      completedAt: new Date(),
    })
    coordinator.assignTask(p2.value.id, {
      taskId: 't-2', data: { approved: true },
      evidence: 'Dados validados com fontes oficiais',
      completedAt: new Date(),
    })

    const agents = coordinator.getActiveSubagents()
    expect(agents.every(a => a.status === 'done')).toBe(true)

    const consensus = engine.evaluateSubagentResults(agents)
    expect(consensus.isOk).toBe(true)
    expect(consensus.value.approved).toBe(true)

    const evaluator = new DogmaticEvaluator()
    const evaluation = evaluator.evaluate('Analisar concorrentes', agents)
    expect(evaluation.isOk).toBe(true)
    expect(evaluation.value.approved).toBe(true)
    expect(evaluation.value.score).toBeGreaterThanOrEqual(0.5)
  })

  it('deve rejeitar quando subagentes discordam', () => {
    const coordinator = new SwarmCoordinator()
    const engine = new ConsensusEngine()

    const yes = coordinator.spawnSubagent(SubagentProfile.fromRole('pricing').value, 'g-1', 'Aprovar')
    const no = coordinator.spawnSubagent(SubagentProfile.fromRole('reviews').value, 'g-1', 'Rejeitar')

    coordinator.assignTask(yes.value.id, {
      taskId: 't-1', data: { approved: true },
      evidence: 'Concordo com a estrategia',
      completedAt: new Date(),
    })
    coordinator.assignTask(no.value.id, {
      taskId: 't-2', data: { approved: false },
      evidence: 'Discordo, dados insuficientes',
      completedAt: new Date(),
    })

    const agents = coordinator.getActiveSubagents()
    const consensus = engine.evaluateSubagentResults(agents)
    expect(consensus.isOk).toBe(true)
    expect(consensus.value.approved).toBe(false)
  })
})
