import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '../../../infrastructure/http/auth/jwtAuth'
import { CriarGuiaDigitalUseCase } from '../../../application/guidebook/use-cases/CriarGuiaDigitalUseCase'
import { PrismaDigitalGuideRepository } from '../../../infrastructure/persistence/guidebook/PrismaDigitalGuideRepository'
import { getBasePrisma } from '../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const session = authResult.value
    const propertyId = session.pousadaId

    const body = await request.json()
    const { id, sections } = body || {}

    if (!id || !sections || !Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json({ error: 'id e sections são obrigatórios' }, { status: 400 })
    }

    const prisma = getBasePrisma()
    const repo = new PrismaDigitalGuideRepository(prisma)
    const useCase = new CriarGuiaDigitalUseCase(repo)

    const result = await useCase.execute({
      id,
      propertyId,
      sections: sections.map((s: any, i: number) => ({
        id: s.id || `sec_${i}_${Date.now()}`,
        sectionType: s.sectionType,
        icon: s.icon,
        order: s.order ?? i,
        content: s.content,
      })),
    })

    if (result.isFail) {
      const status = result.error.message === 'GUIA_JA_EXISTE' ? 409 : 400
      return NextResponse.json({ error: result.error.message }, { status })
    }

    return NextResponse.json(result.value, { status: 201 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.isFail) {
      return NextResponse.json({ error: authResult.error.message }, { status: 401 })
    }

    const session = authResult.value
    const propertyId = session.pousadaId

    const prisma = getBasePrisma()
    const repo = new PrismaDigitalGuideRepository(prisma)
    const result = await repo.findByPropertyId(propertyId)

    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    if (!result.value) {
      return NextResponse.json({ error: 'Guia digital não encontrado' }, { status: 404 })
    }

    const guide = result.value
    return NextResponse.json({
      id: guide.id,
      propertyId: guide.propertyId,
      status: guide.status,
      version: guide.version,
      sections: guide.sections.map(s => ({
        id: s.id,
        sectionType: s.sectionType,
        icon: s.icon,
        order: s.order,
        content: s.content,
      })),
      createdAt: guide.createdAt instanceof Date ? guide.createdAt.toISOString() : String(guide.createdAt),
      updatedAt: guide.updatedAt instanceof Date ? guide.updatedAt.toISOString() : String(guide.updatedAt),
    }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
