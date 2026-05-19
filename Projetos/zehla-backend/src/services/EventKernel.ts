import { PrismaClient } from '@prisma/client'
import { Queue } from 'bullmq'
import { Redis } from 'ioredis'


const prisma = new PrismaClient()

// Configuração de conexão do Redis
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
const redis = new Redis(redisUrl)

// Fila BullMQ conectada ao Python (Slow Loop / LangGraph)
const slowLoopQueue = new Queue('zehla-slow-loop', {
  connection: redis,
})

export interface EventSignal {
  type: string
  payload: unknown
  propertyId: string
  correlationId: string
  contactPhone?: string
}

export class EventKernel {
  /**
   * Ponto de entrada central. Processa eventos de forma determinística
   * na Zona Operacional (Node.js) ou escala para a Zona Cognitiva (Python).
   * Alvo de latência no Fast Loop: < 100ms
   */
  static async processIncomingSignal(signal: EventSignal) {
    const startTime = Date.now()
    
    try {
      

      // 1. Checa a existência de regras estáticas (Menu Fixo, Automação I/O) no Cache
      const cacheKey = `fastloop:rule:${signal.propertyId}:${signal.type}`
      const cachedRule = await redis.get(cacheKey)

      if (cachedRule) {
        const ruleData = JSON.parse(cachedRule)
        await this.executeFastAction(signal, ruleData)
        
        const latency = Date.now() - startTime
        
        
        return { success: true, loop: 'FAST_LOOP', latencyMs: latency }
      }

      // 2. Caso não exista regra no Fast Loop, o evento necessita análise semântica (SDE / NLP)
      // Dispara job assíncrono para o Enxame Python.
      await slowLoopQueue.add(
        'process-cognitive-event',
        {
          ...signal,
          dispatchedAt: Date.now(),
        },
        {
          jobId: signal.correlationId, // Garantia de idempotência via ID no BullMQ
          removeOnComplete: true,
        }
      )

      const latency = Date.now() - startTime
      
      return { success: true, loop: 'SLOW_LOOP', latencyMs: latency }

    } catch (error) {
      console.error(`[EventKernel] Falha catastrófica no processamento:`, error)
      throw error
    }
  }

  /**
   * Executa a ação da Zona Transacional / Operacional
   */
  private static async executeFastAction(signal: EventSignal, ruleData: unknown) {
    // Ex: Disparar webhooks, atuar em hardware IoT, responder menu pre-configurado
    
    // Opcionalmente podemos registrar o Log do agente
  }
}
