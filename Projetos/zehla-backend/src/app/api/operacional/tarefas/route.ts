import { NextRequest, NextResponse } from 'next/server'
import { getBasePrisma } from '../../../../lib/prisma'
import { authenticateRequest } from '../../../../infrastructure/http/auth/jwtAuth'
import { PrismaTarefaRepository } from '../../../../infrastructure/persistence/operacional/PrismaTarefaRepository'
import { PrismaStaffRepository } from '../../../../infrastructure/persistence/operacional/PrismaStaffRepository'
import { PrismaManutencaoRepository } from '../../../../infrastructure/persistence/operacional/PrismaManutencaoRepository'
import { PrismaFornecedorRepository } from '../../../../infrastructure/persistence/operacional/PrismaFornecedorRepository'
import { PrismaSlaRepository } from '../../../../infrastructure/persistence/operacional/PrismaSlaRepository'
import { PrismaChecklistRepository } from '../../../../infrastructure/persistence/operacional/PrismaChecklistRepository'
import { CriarTarefaUseCase } from '../../../../application/operacional/use-cases/CriarTarefaUseCase'
import { IniciarTarefaUseCase } from '../../../../application/operacional/use-cases/IniciarTarefaUseCase'
import { ConcluirTarefaUseCase } from '../../../../application/operacional/use-cases/ConcluirTarefaUseCase'
import { AbrirManutencaoUseCase } from '../../../../application/operacional/use-cases/AbrirManutencaoUseCase'
import { ProcessarWebhookFornecedorUseCase } from '../../../../application/operacional/use-cases/ProcessarWebhookFornecedorUseCase'
import { CalcularMetricasSlaUseCase } from '../../../../application/operacional/use-cases/CalcularMetricasSlaUseCase'
import { ProcessarTarefasAtrasadasUseCase } from '../../../../application/operacional/use-cases/ProcessarTarefasAtrasadasUseCase'
import { ExecutarChecklistUseCase } from '../../../../application/operacional/use-cases/ExecutarChecklistUseCase'
import { ZeOpsCognitiveService } from '../../../../application/operacional/cognitive/ZeOpsCognitiveService'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const session = authResult.value
    const propertyId = session.pousadaId

    const body = await request.json()
    const { intent, messageId, payload } = body || {}

    if (!intent) {
      return NextResponse.json({ error: 'Missing intent parameter' }, { status: 400 })
    }

    // Instanciação manual de dependências com isolamento de tenant usando basePrisma
    const basePrisma = getBasePrisma()
    const tarefaRepo = new PrismaTarefaRepository(basePrisma, propertyId)
    const staffRepo = new PrismaStaffRepository(basePrisma, propertyId)
    const manutencaoRepo = new PrismaManutencaoRepository(basePrisma, propertyId)
    const fornecedorRepo = new PrismaFornecedorRepository(basePrisma, propertyId)
    const slaRepo = new PrismaSlaRepository(basePrisma, propertyId)
    const checklistRepo = new PrismaChecklistRepository(basePrisma, propertyId)

    const criarTarefaUC = new CriarTarefaUseCase(tarefaRepo, staffRepo, slaRepo)
    const iniciarTarefaUC = new IniciarTarefaUseCase(tarefaRepo, staffRepo, manutencaoRepo)
    const concluirTarefaUC = new ConcluirTarefaUseCase(tarefaRepo, staffRepo, manutencaoRepo, checklistRepo)
    const abrirManutencaoUC = new AbrirManutencaoUseCase(tarefaRepo, manutencaoRepo, fornecedorRepo, staffRepo, slaRepo)
    const processarWebhookUC = new ProcessarWebhookFornecedorUseCase(fornecedorRepo, manutencaoRepo)
    const calcularMetricasSlaUC = new CalcularMetricasSlaUseCase(tarefaRepo, slaRepo)
    const processarAtrasadasUC = new ProcessarTarefasAtrasadasUseCase(tarefaRepo)
    const executarChecklistUC = new ExecutarChecklistUseCase(checklistRepo)

    const opsService = new ZeOpsCognitiveService(
      tarefaRepo,
      staffRepo,
      manutencaoRepo,
      fornecedorRepo,
      slaRepo,
      checklistRepo,
      criarTarefaUC,
      iniciarTarefaUC,
      concluirTarefaUC,
      abrirManutencaoUC,
      processarWebhookUC,
      calcularMetricasSlaUC,
      processarAtrasadasUC,
      executarChecklistUC,
      process.env.ZCP_SECRET ?? 'zehla_secret_zcp_2026'
    )

    const output = await opsService.processIntent({
      intent,
      messageId: messageId || `api-${Date.now()}`,
      propriedadeId: propertyId,
      payload: payload || {}
    })

    if (!output.success) {
      return NextResponse.json(output, { status: 400 })
    }

    return NextResponse.json(output, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
