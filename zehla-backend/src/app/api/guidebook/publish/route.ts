import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '../../../../infrastructure/http/auth/jwtAuth'
import { PrismaDigitalGuideRepository } from '../../../../infrastructure/persistence/guidebook/PrismaDigitalGuideRepository'
import { SincronizarGuiaComSmartAIUseCase } from '../../../../application/guidebook/use-cases/SincronizarGuiaComSmartAIUseCase'
import { memoryAdapter } from '../../../../lib/memory'
import { getBasePrisma } from '../../../../lib/prisma'

// POST /api/guidebook/publish
// Publica e sincroniza o guia digital da pousada com a SmartAI (Vector DB in-memory)
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const session = authResult.value
    const propertyId = session.pousadaId

    const prisma = getBasePrisma()
    const repo = new PrismaDigitalGuideRepository(prisma)

    // 1. Carrega o guia digital do banco
    const guideResult = await repo.findByPropertyId(propertyId)
    if (guideResult.isFail) {
      return NextResponse.json({ error: guideResult.error.message }, { status: 500 })
    }

    const guide = guideResult.value
    if (!guide) {
      return NextResponse.json({ error: 'Guia digital não encontrado' }, { status: 404 })
    }

    // 2. Executa a transição de status para 'publicado' e gera os eventos correspondentes
    const publishResult = guide.publish()
    if (publishResult.isFail) {
      return NextResponse.json({ error: publishResult.error.code }, { status: 400 })
    }

    // 3. Salva a alteração de status e nova versão no banco SQL
    const saveResult = await repo.save(publishResult.value)
    if (saveResult.isFail) {
      return NextResponse.json({ error: saveResult.error.message }, { status: 500 })
    }

    // 4. Executa o caso de uso de sincronização atômica com o Vector DB (A-MEM)
    const syncUseCase = new SincronizarGuiaComSmartAIUseCase(repo, memoryAdapter)
    const syncResult = await syncUseCase.execute(propertyId)

    if (syncResult.isFail) {
      return NextResponse.json({ error: syncResult.error.message }, { status: 500 })
    }

    return NextResponse.json(syncResult.value, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
