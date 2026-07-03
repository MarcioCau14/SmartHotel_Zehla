import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processIncomingMessage } from '@/lib/whatsapp-ai-responder';

const TEST_MESSAGES = [
  'Olá, tem quarto de casal disponível para amanhã? Qual o valor?',
  'Olá! Vocês aceitam animais de estimação (pets)?',
  'Qual o horário do check-in e check-out de vocês? Tem Wi-Fi?',
  'Boa tarde, queria saber se tem estacionamento incluso e piscina.',
];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.tenantId) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Sessão de autenticação requerida.' },
      { status: 401 },
    );
  }

  const tenantId = session.user.tenantId;

  let body: { message?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Ignore empty body
  }

  // Sorteia uma mensagem se não for especificada
  const messageContent = body.message?.trim() || TEST_MESSAGES[Math.floor(Math.random() * TEST_MESSAGES.length)];
  const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
  const guestPhone = `551199999${randomSuffix}`;
  const guestName = `Hóspede de Teste #${randomSuffix}`;

  try {
    // Dispara a pipeline de processamento do Zélla Brain
    // que salvará as mensagens no banco e notificará o SSE Live Feed
    const result = await processIncomingMessage({
      tenantId,
      guestPhone,
      guestName,
      messageContent,
      messageFrom: 'whatsapp'
    });

    return NextResponse.json({
      success: true,
      data: {
        messageSent: messageContent,
        guestPhone,
        guestName,
        conversationId: result.conversationId,
      }
    });
  } catch (error: any) {
    console.error('[simulate-message error]', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: error.message || 'Erro ao simular mensagem.' },
      { status: 500 },
    );
  }
}
