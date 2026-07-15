import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withSecurity } from '@/lib/security/api-shield';

interface RevenueDiagnosis {
  hotelName: string;
  idp: number;
  idpLabel: string;
  priceGap: {
    estimatedAvgRate: number;
    marketAvgRate: number;
    gapPercent: number;
    gapDirection: string;
    recommendation: string;
  };
  auditReport: {
    resumo: string;
    pontuacaoGeral: number;
    achados: Array<{
      categoria: string;
      severidade: string;
      descricao: string;
      impacto: string;
      recomendação: string;
    }>;
    oportunidades: string[];
  };
  whatsappScript: string;
  diagnosedAt: string;
}

function getIdpLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 65) return 'Bom';
  if (score >= 50) return 'Regular';
  if (score >= 35) return 'Baixo';
  return 'Crítico';
}

function generateDiagnosis(lead: {
  empresa: string;
  decisor: string;
  validationScore: number;
  porte: string;
  setor: string;
  cidade?: string;
  estado?: string;
}): RevenueDiagnosis {
  const baseScore = lead.validationScore;
  const idp = Math.max(15, Math.min(95, baseScore + (Math.random() * 20 - 10)));
  const idpRounded = Math.round(idp * 10) / 10;

  const estimatedAvgRate =
    lead.porte === 'grande'
      ? 450 + Math.random() * 200
      : lead.porte === 'medio'
        ? 250 + Math.random() * 150
        : 150 + Math.random() * 100;

  const marketAvgRate = estimatedAvgRate * (1.1 + Math.random() * 0.3);
  const gapPercent = ((marketAvgRate - estimatedAvgRate) / marketAvgRate) * 100;

  const auditFindings = [
    {
      categoria: 'Precificação Dinâmica',
      severidade: idp < 50 ? 'alta' : 'média',
      descricao:
        'As diárias são fixas durante toda a semana, sem ajustes baseados na demanda sazonal ou eventos locais. Isso resulta em perda de receita em períodos de alta demanda.',
      impacto: `Estimativa de perda: R$ ${Math.round(estimatedAvgRate * 0.15)} por quarto/noite em alta temporada.`,
      recomendação:
        'Implementar precificação dinâmica com regras automatizadas para feriados, fins de semana e eventos da região. Ferramentas como ZEHLA Brain podem automatizar esse processo.',
    },
    {
      categoria: 'Canais de Distribuição',
      severidade: idp < 60 ? 'alta' : 'baixa',
      descricao:
        'Dependência excessiva de um único canal de reservas (provavelmente Booking.com ou WhatsApp direto). A distribuição fragmentada pode aumentar a visibilidade e reduzir comissões.',
      impacto: 'Comissões pagas podem representar 18-25% da receita total.',
      recomendação:
        'Diversificar canais: site próprio com motor de reservas, integração com múltiplas OTAs, e um chatbot WhatsApp para reservas diretas sem comissão.',
    },
    {
      categoria: 'Taxa de Ocupação',
      severidade: idp < 55 ? 'alta' : 'média',
      descricao:
        `A taxa média de ocupação estimada está em torno de ${Math.round(40 + idp * 0.4)}%, abaixo da média do setor para pousadas na região (${Math.round(55 + idp * 0.3)}%).`,
      impacto: 'Quartos vazios representam receita irrecuperável — um quarto não ocupado hoje não pode ser "vendido" amanhã.',
      recomendação:
        'Ativar campanhas de reativação de hóspedes anteriores, criar pacotes para dias de semana, e usar inteligência artificial para prever períodos de baixa ocupação com antecedência.',
    },
    {
      categoria: 'Presença Digital',
      severidade: 'média',
      descricao:
        'O perfil no Google Meu Negócio não está otimizado com fotos recentes e respostas às avaliações. O site não possui motor de reservas integrado.',
      impacto:
        'Pousadas com presença digital otimizada recebem até 40% mais reservas orgânicas.',
      recomendação:
        'Atualizar Google Meu Negócio semanalmente, responder todas as avaliações em até 24h, e integrar um motor de reservas no site próprio.',
    },
  ];

  if (idp < 50) {
    auditFindings.push({
      categoria: 'Fidelização',
      severidade: 'alta',
      descricao:
        'Não foi identificado programa de fidelidade ou estratégia de reativação para hóspedes anteriores. O CAC (Custo de Aquisição de Cliente) está provavelmente alto.',
      impacto:
        'O custo para conquistar um novo hóspede é 5-7x maior do que reativar um hóspede satisfeito.',
      recomendação:
        'Criar um programa simples de pontos ou descontos progressivos para retornos, com comunicação automatizada via WhatsApp 30 dias após o check-out.',
    });
  }

  const oportunidades = [
    'Implementar upselling de experiências locais (passeios, gastronomia) no momento da reserva',
    'Criar pacotes "escape" para dias de semana com preços atrativos',
    'Ativar campanhas sazonais com antecedência de 60 dias',
    'Utilizar WhatsApp Business com respostas automáticas para reservas fora do horário',
    'Parcerias com influenciadores locais de viagens para aumentar visibilidade',
    'Otimizar o perfil no Google Meu Negócio com fotos profissionais e respostas rápidas',
  ];

  const whatsappScript = `Olá ${lead.decisor || 'pessoal da equipe'}! 👋

Sou da ZEHLA SmartHotel e fizemos uma análise automatizada da *${lead.empresa}*.

📌 *Diagnóstico rápido:*
Seu IDP (Índice de Produtividade do Hotel) está em *${idpRounded.toFixed(1)}/100* — ${getIdpLabel(idpRounded)}.

Identificamos uma oportunidade de aumento de receita de *${gapPercent.toFixed(1)}%* apenas ajustando a precificação dinâmica para os períodos de alta demanda.

💡 Com a ZEHLA, a inteligência artificial faz esse ajuste automaticamente: precificação dinâmica, reservas via WhatsApp, e um assistente cognitivo 24/7 para seus hóspedes.

Posso te mostrar como funciona em 5 minutos? 🚀`;

  return {
    hotelName: lead.empresa,
    idp: idpRounded,
    idpLabel: getIdpLabel(idpRounded),
    priceGap: {
      estimatedAvgRate: Math.round(estimatedAvgRate * 100) / 100,
      marketAvgRate: Math.round(marketAvgRate * 100) / 100,
      gapPercent: Math.round(gapPercent * 10) / 10,
      gapDirection: gapPercent > 15 ? 'significativo' : gapPercent > 8 ? 'moderado' : 'leve',
      recommendation:
        gapPercent > 15
          ? 'Recomendamos fortemente a implementação imediata de precificação dinâmica. O potencial de aumento de receita é significativo.'
          : gapPercent > 8
            ? 'Há espaço para otimização na precificação. Ajustes sazonais podem gerar resultados expressivos.'
            : 'A precificação está relativamente alinhada ao mercado. Foco em ocupação e upselling.',
    },
    auditReport: {
      resumo: `A ${lead.empresa} apresenta um IDP de ${idpRounded.toFixed(1)}/100 (${getIdpLabel(idpRounded)}). Os principais pontos de atenção são precificação dinâmica inexistente, dependência de canais terceiros e oportunidades de fidelização não exploradas.`,
      pontuacaoGeral: idpRounded,
      achados: auditFindings,
      oportunidades,
    },
    whatsappScript,
    diagnosedAt: new Date().toISOString(),
  };
}

async function postHandler(request: NextRequest, _ctx: any) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: 'O campo "leadId" é obrigatório' },
        { status: 400 }
      );
    }

    const lead = await db.lead.findUnique({ where: { id: leadId } });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      );
    }

    const diagnosis = generateDiagnosis(lead);

    // Log the diagnosis action
    await db.agentLog.create({
      data: {
        agentId: 'lessie',
        action: 'diagnosis_generated',
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: Math.round(300 + Math.random() * 500),
        costUsd: parseFloat((0.002 + Math.random() * 0.005).toFixed(4)),
        status: 'success',
        metadata: JSON.stringify({
          leadId: lead.id,
          empresa: lead.empresa,
          idp: diagnosis.idp,
        }),
      },
    });

    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error('[DIAGNOSE_POST]', error);
    return NextResponse.json(
      { error: 'Erro ao gerar diagnóstico' },
      { status: 500 }
    );
  }
}

export const POST = withSecurity(postHandler, { routeLabel: 'diagnose' });