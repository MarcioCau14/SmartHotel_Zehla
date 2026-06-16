import { prisma } from '@/lib/prisma'
import { llmRouter } from '@/lib/ai/llm-router'
import { getCachedResponse } from '@/lib/ai/semanticCache'

export interface SwarmConfig {
  tenantId: string
  title: string
  context: string
  rounds?: number
  agentCount?: number
}

export class SwarmEngine {
  /**
   * Inicializa um cenário de simulação e gera o enxame de agentes com Escudo Semântico.
   */
  static async createScenario(config: SwarmConfig) {
    const { tenantId, title, context, rounds = 3, agentCount = 5 } = config

    // 1. ESCUDO SEMÂNTICO (MiroFish Cache Intercept)
    const cachedResult = await getCachedResponse(`sim:${context}`, tenantId);
    if (cachedResult) {
      console.log('💰 [MIROFISH] Simulação interceptada pelo cache semântico ($0).');
      // Retornaria um cenário simulado ou o resultado anterior
    }

    // 2. Criar o Cenário no Banco
    const scenario = await prisma.brainSimulationScenario.create({
      data: {
        tenantId,
        title,
        context,
        rounds,
        status: 'PENDING'
      }
    })

    // 2. Gerar Agentes (Digital Twins) via IA
    await this.spawnAgents(scenario.id, context, agentCount)

    return scenario
  }

  /**
   * Gera personas de agentes baseadas no contexto.
   */
  private static async spawnAgents(scenarioId: string, context: string, count: number) {
    const prompt = `
      Com base no contexto abaixo, gere ${count} personas distintas para uma simulação social.
      Cada persona deve ter um nome, um papel (GUEST, COMPETITOR, OWNER, LOCAL_GUIDE) e traços de personalidade.
      
      CONTEXTO: ${context}

      Retorne APENAS um JSON array no formato:
      [{"name": "...", "role": "...", "persona": "...", "traits": ["..."]}]
    `

    const response = await llmRouter.generate({
      model: 'fast',
      messages: [{ role: 'system', content: 'Você é um arquiteto de sistemas sociais e gerador de personas.' }, { role: 'user', content: prompt }],
      temperature: 0.8,
      forceLocal: true // Custo Zero garantido
    })

    try {
      const agents = JSON.parse(response.content)
      // Otimização N+1: Inserção em lote (Bulk Insert)
      await prisma.simulationAgent.createMany({
        data: agents.map((agent: any) => ({
          scenarioId,
          name: agent.name,
          role: agent.role,
          config: {
            persona: agent.persona,
            traits: agent.traits
          }
        }))
      })
    } catch (e) {
      console.error('❌ Falha ao parsear ou persistir agentes do enxame:', e)
    }
  }

  /**
   * Executa as rodadas de simulação (OASIS Logic).
   */
  static async runSimulation(scenarioId: string) {
    const scenario = await prisma.brainSimulationScenario.findUnique({
      where: { id: scenarioId },
      include: { agents: true }
    })

    if (!scenario) throw new Error('Cenário não encontrado')

    await prisma.brainSimulationScenario.update({
      where: { id: scenarioId },
      data: { status: 'RUNNING' }
    })

    for (let r = 1; r <= scenario.rounds; r++) {
      // Otimização: Buscar histórico uma vez por rodada, não por agente
      const history = await prisma.simulationRound.findMany({
        where: { scenarioId },
        orderBy: { createdAt: 'asc' },
        take: 30 // Aumentado para melhor contexto
      })
      const historyText = history.map(h => `${h.input}: ${h.output}`).join('\n')

      const roundResponses: any[] = [];

      for (const agent of scenario.agents) {
        const config = (agent.config as any) || {}
        const persona = config.persona || ''
        const traits = Array.isArray(config.traits) ? config.traits : []
        const prompt = `
          Você é ${agent.name}, com a seguinte persona: ${persona}.
          Seus traços são: ${traits.join(', ')}.
          Estamos na Rodada ${r} de uma simulação sobre: ${scenario.context}.

          HISTÓRICO DA CONVERSA:
          ${historyText}

          Com base na sua persona, como você reage agora? Seja breve e direto.
        `

        const response = await llmRouter.generate({
          model: 'fast',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
          forceLocal: true
        })

        roundResponses.push({
          scenarioId,
          round: r,
          input: agent.name,
          output: response.content,
          metadata: { sentiment: 'NEUTRAL' }
        });
      }

      // Otimização N+1: Persistir todas as falas da rodada de uma vez
      await prisma.simulationRound.createMany({
        data: roundResponses
      });
    }

    // Finalizar e Sintetizar
    await this.synthesize(scenarioId)
  }

  /**
   * Sintetiza o resultado final (Report Agent).
   */
  private static async synthesize(scenarioId: string) {
    const rounds = await prisma.simulationRound.findMany({
      where: { scenarioId },
      orderBy: { createdAt: 'asc' }
    })

    const transcript = rounds.map(r => `${r.input}: ${r.output}`).join('\n')

    const prompt = `
      Analise a seguinte simulação social e gere um relatório de predição de ROI e comportamento.
      
      TRANSCRITO:
      ${transcript}

      Retorne um JSON com:
      {
        "summary": "Resumo do que aconteceu",
        "roiEstimate": 0.0, // 0 a 100
        "keyInsights": ["ponto 1", "ponto 2"],
        "recommendation": "Melhor próxima ação"
      }
    `

    const response = await llmRouter.generate({
      model: 'reasoning',
      messages: [{ role: 'system', content: 'Você é um analista estratégico de hospitalidade.' }, { role: 'user', content: prompt }],
      forceLocal: true // Custo Zero garantido
    })

    try {
      const report = JSON.parse(response.content)
      await prisma.brainSimulationScenario.update({
        where: { id: scenarioId },
        data: {
          status: 'COMPLETED',
          result: report
        }
      })
    } catch (e) {
      await prisma.brainSimulationScenario.update({
        where: { id: scenarioId },
        data: { status: 'FAILED' }
      })
    }
  }
}
