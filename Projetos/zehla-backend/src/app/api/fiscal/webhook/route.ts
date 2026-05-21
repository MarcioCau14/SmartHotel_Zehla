import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Webhook de Provedor Fiscal (Focus NFe / eNotas)
 * POST /api/fiscal/webhook
 * 
 * Recebe notificações do provedor fiscal quando:
 * - Nota é emitida com sucesso
 * - Nota é cancelada
 * - Ocorre erro na emissão
 * 
 * Atualiza o status da FiscalInvoice no banco
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider') || 'focus_nfe';

    console.log(`📡 [FISCAL WEBHOOK] Recebido webhook do provedor: ${provider}`);

    switch (provider) {
      case 'focus_nfe':
        await processarFocusNFe(body);
        break;
      case 'enotas':
        await processarENotas(body);
        break;
      default:
        console.warn(`⚠️ [FISCAL WEBHOOK] Provedor não suportado: ${provider}`);
    }

    // Sempre retorna 200 para evitar retries do provedor
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ [FISCAL WEBHOOK] Erro ao processar webhook:', error);
    // Retorna 200 mesmo com erro para evitar retry storm
    return NextResponse.json({ received: true, error: 'Erro processado internamente' });
  }
}

/**
 * Processa webhook da Focus NFe
 * Docs: https://focusnfe.com.br/docs/#webhook
 */
async function processarFocusNFe(payload: any) {
  const { referencia, status, numero_nfse, chave_acesso, url_pdf, url_xml } = payload;

  console.log(`📄 [FISCAL WEBHOOK] Focus NFe — ref: ${referencia}, status: ${status}`);

  // Buscar nota fiscal pelo provedorId
  const invoice = await prisma.fiscalInvoice.findFirst({
    where: { provedorId: referencia },
  });

  if (!invoice) {
    console.warn(`⚠️ [FISCAL WEBHOOK] Nota não encontrada para provedorId: ${referencia}`);
    return;
  }

  let newStatus = invoice.status;
  let updateData: any = {
    provedorResponse: payload,
  };

  switch (status) {
    case '1': // Emitida com sucesso
    case '2': // Emitida com sucesso (variação)
      newStatus = 'EMITIDA';
      updateData = {
        ...updateData,
        status: newStatus,
        invoiceNumber: numero_nfse,
        accessKey: chave_acesso,
        pdfUrl: url_pdf,
        xmlUrl: url_xml,
        emitidoEm: new Date(),
      };
      console.log(`✅ [FISCAL WEBHOOK] Nota ${invoice.id} emitida com sucesso: ${numero_nfse}`);
      break;

    case '3': // Erro na emissão
    case '4': // Cancelada
      newStatus = status === '4' ? 'CANCELADA' : 'ERRO';
      updateData = {
        ...updateData,
        status: newStatus,
        error: payload.mensagem || 'Erro na emissão',
      };
      console.log(`❌ [FISCAL WEBHOOK] Nota ${invoice.id} com status: ${newStatus}`);
      break;

    default:
      console.warn(`⚠️ [FISCAL WEBHOOK] Status desconhecido: ${status}`);
      return;
  }

  await prisma.fiscalInvoice.update({
    where: { id: invoice.id },
    data: updateData,
  });
}

/**
 * Processa webhook do eNotas
 * Docs: https://api.enotasgw.com.br/docs/
 */
async function processarENotas(payload: any) {
  const { id, status, numero, chaveAcesso, urlDANFE, urlXML } = payload;

  console.log(`📄 [FISCAL WEBHOOK] eNotas — id: ${id}, status: ${status}`);

  const invoice = await prisma.fiscalInvoice.findFirst({
    where: { provedorId: id },
  });

  if (!invoice) {
    console.warn(`⚠️ [FISCAL WEBHOOK] Nota não encontrada para provedorId: ${id}`);
    return;
  }

  let newStatus = invoice.status;
  let updateData: any = {
    provedorResponse: payload,
  };

  switch (status) {
    case 'Autorizada':
      newStatus = 'EMITIDA';
      updateData = {
        ...updateData,
        status: newStatus,
        invoiceNumber: numero,
        accessKey: chaveAcesso,
        pdfUrl: urlDANFE,
        xmlUrl: urlXML,
        emitidoEm: new Date(),
      };
      console.log(`✅ [FISCAL WEBHOOK] Nota ${invoice.id} autorizada: ${numero}`);
      break;

    case 'Cancelada':
      newStatus = 'CANCELADA';
      updateData = {
        ...updateData,
        status: newStatus,
        canceladoEm: new Date(),
      };
      break;

    case 'Erro':
      newStatus = 'ERRO';
      updateData = {
        ...updateData,
        status: newStatus,
        error: payload.mensagemErro || 'Erro na emissão',
      };
      break;

    default:
      console.warn(`⚠️ [FISCAL WEBHOOK] Status desconhecido: ${status}`);
      return;
  }

  await prisma.fiscalInvoice.update({
    where: { id: invoice.id },
    data: updateData,
  });
}
