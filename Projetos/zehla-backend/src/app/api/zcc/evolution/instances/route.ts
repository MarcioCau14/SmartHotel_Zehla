import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/infrastructure/http/auth/jwtAuth';
import { getWhatsAppPort } from '@/infrastructure/external/evolution';
import { WhatsAppSession } from '@/domain/operacional/entities/WhatsAppSession';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 });
    }
    const propertyId = auth.value.pousadaId;
    const instanceName = `zehla-instance-${propertyId}`;

    const waPort = getWhatsAppPort();
    
    let stateValue = 'DISCONNECTED';
    let qrCode: string | undefined = undefined;

    try {
      const conn = await waPort.getConnectionState(instanceName);
      if (conn.connected) {
        stateValue = 'CONNECTED';
      } else if (conn.qrCode) {
        stateValue = 'AWAITING_QR';
        qrCode = conn.qrCode;
      }
    } catch (e) {
      stateValue = 'FAILED';
    }

    const sessionRes = WhatsAppSession.create(propertyId, stateValue, qrCode);
    if (sessionRes.isFail) {
      return NextResponse.json({ error: sessionRes.error.message }, { status: 400 });
    }

    const session = sessionRes.value;
    return NextResponse.json({
      state: session.state.value,
      qrCode: session.qrCode,
      instanceName,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao obter status do WhatsApp' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 });
    }
    const propertyId = auth.value.pousadaId;
    const instanceName = `zehla-instance-${propertyId}`;

    // Simulando transição FSM para AWAITING_QR (forçando conexão/QR Code)
    const sessionRes = WhatsAppSession.create(propertyId, 'DISCONNECTED');
    if (sessionRes.isFail) {
      return NextResponse.json({ error: sessionRes.error.message }, { status: 400 });
    }

    const transitionRes = sessionRes.value.startConnection('mock-new-qr-code');
    if (transitionRes.isFail) {
      return NextResponse.json({ error: transitionRes.error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      state: transitionRes.value.state.value,
      qrCode: transitionRes.value.qrCode,
      instanceName,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao inicializar conexão' }, { status: 500 });
  }
}
