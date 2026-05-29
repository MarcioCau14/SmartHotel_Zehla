import { NextRequest, NextResponse } from 'next/server'
import { LeadControllerFactory } from '@/infrastructure/http/lead/LeadControllerFactory'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const useCase = LeadControllerFactory.makeCaptureUseCase()

    const result = await useCase.execute({
      name: 'API_LIST_TRIGGER',
      phone: '00000000000',
      source: 'MANUAL',
    })

    return NextResponse.json({
      success: true,
      message: 'List endpoint disponível via /api/v2/leads',
    })
  } catch (error: any) {
    console.error('[Leads API] Error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, whatsapp, phone, source, propertyId, city, state } = body

    if (!name || (!whatsapp && !phone && !email)) {
      return NextResponse.json({
        error: 'Nome e pelo menos um contato (telefone, WhatsApp ou e-mail) são obrigatórios',
      }, { status: 400 })
    }

    const useCase = LeadControllerFactory.makeCaptureUseCase()
    const result = await useCase.execute({
      name,
      email,
      phone: phone ?? whatsapp,
      whatsapp,
      source: source ?? 'LANDING_PAGE',
      propertyId,
      city,
      state,
    })

    if (result.isFail) {
      return NextResponse.json({ error: result.error }, { status: 422 })
    }

    return NextResponse.json({
      success: true,
      message: result.value.isDuplicate
        ? 'Lead já existente, dados atualizados'
        : 'Lead capturado com sucesso',
      leadId: result.value.id,
      isDuplicate: result.value.isDuplicate,
    }, { status: result.value.isDuplicate ? 200 : 201 })
  } catch (error: any) {
    console.error('[Leads API] POST Error:', error)
    return NextResponse.json({ error: 'Erro interno na captura' }, { status: 500 })
  }
}
