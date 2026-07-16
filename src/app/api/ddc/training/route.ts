import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { resolveTenantId, mapTraining } from '@/lib/ddc/ddc-mapper';
import { apiRatelimit } from '@/lib/rate-limit';

const demoTrainings = [
  { id: 'demo-t-1', title: 'Saudação Inicial', content: 'Sempre cumprimente o hóspede pelo nome e pergunte como pode ajudar. Ofereça informações sobre check-in, café da manhã e comodidades.', category: 'greeting', version: 1, isActive: true, propertyId: 'demo', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'demo-t-2', title: 'Processo de Reserva', content: 'Ao receber um pedido de reserva, confirme: 1) Datas (check-in/check-out), 2) Número de hóspedes, 3) Tipo de quarto preferido, 4) Forma de pagamento (Pix ou cartão).', category: 'booking', version: 1, isActive: true, testResult: { status: 'passed' as const, score: 92 }, propertyId: 'demo', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'demo-t-3', title: 'Política de Cancelamento', content: 'Cancelamento gratuito até 48h antes do check-in. Após esse prazo, cobramos 1 diária como taxa. No-show é cobrado o valor total.', category: 'policy', version: 1, isActive: true, testResult: { status: 'passed' as const, score: 88 }, propertyId: 'demo', createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'demo-t-4', title: 'Informações sobre Passeios', content: 'Recomende passeios locais: Praia do Centro (5 min a pé), Centro Histórico (10 min), Praia dos Castelhanos (15 min de carro). Ofereça agendar passeios de barco.', category: 'local_info', version: 1, isActive: true, propertyId: 'demo', createdAt: new Date(Date.now() - 345600000).toISOString(), updatedAt: new Date(Date.now() - 345600000).toISOString() },
  { id: 'demo-t-5', title: 'Pet Policy', content: 'Aceitamos animais de pequeno e médio porte (até 15kg). Taxa de higienização: R$ 50,00 por pet. Fornecemos potinhos de água e ração.', category: 'policy', version: 1, isActive: false, propertyId: 'demo', createdAt: new Date(Date.now() - 432000000).toISOString(), updatedAt: new Date(Date.now() - 432000000).toISOString() },
];

export async function GET(request: NextRequest) {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return NextResponse.json({ success: true, data: demoTrainings });
    }

    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { success } = await apiRatelimit.limit(tenantId);
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const trainings = await db.trainingPrompt.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: trainings.map(mapTraining) });
  } catch (error) {
    console.error('[DDC training] Prisma error:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { success } = await apiRatelimit.limit(tenantId);
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await request.json();
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json({ success: false, error: { code: '400', message: 'Missing required fields: title, content, category' } }, { status: 400 });
    }
    const training = await db.trainingPrompt.create({
      data: {
        tenantId,
        name: body.title,
        type: body.category,
        content: body.content,
        isActive: body.isActive !== undefined ? body.isActive : true,
        variables: JSON.stringify(body.variables || []),
      }
    });
    return NextResponse.json({ success: true, data: mapTraining(training) }, { status: 201 });
  } catch (error) {
    console.error('[DDC training POST] Error:', error);
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to create training' } }, { status: 500 });
  }
}