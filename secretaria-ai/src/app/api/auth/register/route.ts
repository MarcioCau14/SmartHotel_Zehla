import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
  pousadaName: z.string().min(2, 'Nome da pousada é obrigatório'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingTenant = await db.tenant.findUnique({
      where: { email: data.email },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    // Executamos todo o onboarding em uma única transação garantindo integridade
    const result = await db.$transaction(async (tx) => {
      // 1. Criar o Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          phone: data.phone,
          plan: 'trial',
          status: 'active',
          trialStart: new Date(),
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          property: {
            create: {
              name: data.pousadaName,
            },
          },
          agentConfigs: {
            create: {
              agentId: 'agent-1',
              agentName: 'Recepcionista ZÉLLA',
              systemPrompt: 'Você é a recepcionista virtual da pousada. Seja simpática, profissional e use emojis moderados. Responda em português brasileiro.',
              temperature: 0.7,
              isActive: true,
            },
          },
          apiConfigs: {
            create: {
              provider: 'groq',
              model: 'llama-3.3-70b-versatile',
              isActive: true,
              notes: 'Configuração padrão mock. Altere para provedor real quando disponível.',
            },
          },
          subscriptions: {
            create: {
              planType: 'gratuito',
              status: 'active',
              amount: 0,
              paymentMethod: 'pix',
              trialStart: new Date(),
              trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          },
        },
      });

      // 2. Criar os 8 KnowledgeEntry padrão de FAQ para o Tenant
      const faqs = [
        {
          question: 'Qual é a senha do Wi-Fi?',
          answer: 'A rede Wi-Fi da pousada é "Pousada_Zehla_Guest" e a senha de acesso é "zehla2026".',
          category: 'geral',
        },
        {
          question: 'Qual o horário de check-in e check-out?',
          answer: 'O check-in inicia a partir das 14:00 e o check-out deve ser efetuado até as 12:00.',
          category: 'politicas',
        },
        {
          question: 'Qual o horário do café da manhã?',
          answer: 'O café da manhã é servido diariamente em nosso salão principal das 07:30 às 10:00.',
          category: 'servicos',
        },
        {
          question: 'A pousada possui estacionamento?',
          answer: 'Sim, dispomos de estacionamento privativo e gratuito para nossos hóspedes, sem necessidade de reserva prévia.',
          category: 'geral',
        },
        {
          question: 'A pousada aceita animais de estimação?',
          answer: 'Aceitamos pets de pequeno porte mediante aviso prévio e taxa de higienização de R$ 50 por estadia.',
          category: 'politicas',
        },
        {
          question: 'Qual a política de cancelamento?',
          answer: 'O cancelamento é gratuito e integral se realizado em até 7 dias antes da data de check-in programada.',
          category: 'politicas',
        },
        {
          question: 'Quais as formas de pagamento aceitas?',
          answer: 'Aceitamos pagamentos via PIX, cartões de crédito e débito (bandeiras Visa, Mastercard, Elo).',
          category: 'financeiro',
        },
        {
          question: 'Qual a voltagem das tomadas?',
          answer: 'A voltagem padrão em todas as tomadas e chalés da pousada é 220V.',
          category: 'geral',
        },
      ];

      await tx.knowledgeEntry.createMany({
        data: faqs.map((faq) => ({
          tenantId: tenant.id,
          category: faq.category,
          question: faq.question,
          answer: faq.answer,
        })),
      });

      return { tenant };
    });

    return NextResponse.json({
      success: true,
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        email: result.tenant.email,
        plan: result.tenant.plan,
        trialEnd: result.tenant.trialEnd,
      },
      userId: result.tenant.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
