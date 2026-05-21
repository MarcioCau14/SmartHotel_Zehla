import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { EmitInvoiceUseCase, CancelInvoiceUseCase } from '@/lib/fiscal/EmitInvoiceUseCase';

/**
 * API de Notas Fiscais
 * GET /api/fiscal/invoice?propertyId=xxx — Lista notas fiscais
 * POST /api/fiscal/invoice — Emite nova nota fiscal
 * PATCH /api/fiscal/invoice?id=xxx — Atualiza/cancela nota
 */

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId é obrigatório' }, { status: 400 });
    }

    const where: any = { propertyId };
    if (status) {
      where.status = status;
    }

    const [invoices, total] = await Promise.all([
      prisma.fiscalInvoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.fiscalInvoice.count({ where }),
    ]);

    // Calcular totais
    const totais = {
      totalEmitidas: invoices.filter(i => i.status === 'EMITIDA' || i.status === 'HOMOLOGADA').length,
      totalPendente: invoices.filter(i => i.status === 'PENDENTE' || i.status === 'EMITINDO').length,
      totalErro: invoices.filter(i => i.status === 'ERRO').length,
      valorTotalServicos: invoices.reduce((acc, i) => acc + i.valorServicos, 0),
      valorTotalImpostos: invoices.reduce((acc, i) => acc + i.valorImpostos, 0),
    };

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      totais,
    });

  } catch (error) {
    console.error('❌ [FISCAL] Erro ao listar notas fiscais:', error);
    return NextResponse.json({ error: 'Erro interno ao listar notas fiscais' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, reservationId, tomadorNome, tomadorCpfCnpj, tomadorEmail, valorServicos, descricaoServico } = body;

    if (!propertyId || !tomadorNome || !valorServicos) {
      return NextResponse.json({ error: 'propertyId, tomadorNome e valorServicos são obrigatórios' }, { status: 400 });
    }

    const emitInvoice = new EmitInvoiceUseCase();
    const result = await emitInvoice.execute({
      propertyId,
      reservationId,
      tomadorNome,
      tomadorCpfCnpj,
      tomadorEmail,
      valorServicos: parseFloat(valorServicos),
      descricaoServico: descricaoServico || 'Serviço de hospedagem',
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ [FISCAL] Erro ao emitir nota fiscal:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao emitir nota fiscal',
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('id');

    if (!invoiceId) {
      return NextResponse.json({ error: 'id da nota fiscal é obrigatório' }, { status: 400 });
    }

    const body = await req.json();
    const { action, motivo } = body;

    if (action === 'cancelar') {
      if (!motivo) {
        return NextResponse.json({ error: 'Motivo do cancelamento é obrigatório' }, { status: 400 });
      }

      const cancelInvoice = new CancelInvoiceUseCase();
      await cancelInvoice.execute(invoiceId, motivo);

      return NextResponse.json({ success: true, message: 'Nota fiscal cancelada com sucesso' });
    }

    return NextResponse.json({ error: 'Ação não suportada' }, { status: 400 });

  } catch (error) {
    console.error('❌ [FISCAL] Erro ao atualizar nota fiscal:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao atualizar nota fiscal',
    }, { status: 500 });
  }
}
