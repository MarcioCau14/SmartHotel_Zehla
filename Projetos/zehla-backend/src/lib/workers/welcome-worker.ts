import { Worker, Job } from 'bullmq';
import { redisWorker } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

const welcomeMessages = {
  email: (ownerName: string, propertyName: string, trialEndsAt: string) => ({
    subject: `🎉 Bem-vindo ao ZEHLA, ${ownerName}!`,
    body: `Olá, ${ownerName}!

Sua pousada "${propertyName}" está configurada e pronta para operar com o cérebro ZEHLA.

📅 Seu trial de 7 dias expira em: ${new Date(trialEndsAt).toLocaleDateString('pt-BR')}

O que já está ativo:
✅ Agente de WhatsApp respondendo hóspedes 24/7
✅ Dashboard de reservas e financeiro
✅ Precificação inteligente
✅ CRM integrado

Acesse seu painel: https://app.zehla.com.br/dashboard

Qualquer dúvida, estamos à disposição.

— Equipe ZEHLA Technologies`,
  }),
  whatsapp: (ownerName: string, propertyName: string) => 
    `Olá ${ownerName}! 🧠 Seu ZEHLA está ativo para "${propertyName}". O agente já está pronto para atender seus hóspedes. Acesse o painel: app.zehla.com.br/dashboard`,
};

async function sendWelcomeEmail(email: string, subject: string, body: string) {
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'ZEHLA <onboarding@zehla.com.br>',
      to: email,
      subject,
      text: body,
    });
  } else {
    console.log(`[WELCOME-EMAIL] (mock) To: ${email} | Subject: ${subject}`);
  }
}

async function sendWelcomeWhatsApp(whatsapp: string, message: string) {
  if (process.env.EVOLUTION_API_URL) {
    await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: whatsapp.replace(/\D/g, ''),
        text: message,
      }),
    });
  } else {
    console.log(`[WELCOME-WHATSAPP] (mock) To: ${whatsapp} | Message: ${message}`);
  }
}

export function startWelcomeWorker() {
  const worker = new Worker(
    'zehla-welcome',
    async (job: Job) => {
      const { userId, propertyName, ownerName, email, whatsapp, trialEndsAt, utmCampaign } = job.data;

      console.log(`🎉 [WELCOME] Processando boas-vindas para ${ownerName} (${propertyName})`);

      const emailContent = welcomeMessages.email(ownerName, propertyName, trialEndsAt);
      const whatsappMessage = welcomeMessages.whatsapp(ownerName, propertyName);

      await Promise.allSettled([
        sendWelcomeEmail(email, emailContent.subject, emailContent.body),
        sendWelcomeWhatsApp(whatsapp, whatsappMessage),
      ]);

      await prisma.agentLog.create({
        data: {
          propertyId: userId,
          type: 'WELCOME_SENT',
          details: {
            ownerName,
            propertyName,
            email,
            whatsapp,
            utmCampaign: utmCampaign || null,
            sentAt: new Date().toISOString(),
          },
        },
      });

      console.log(`✅ [WELCOME] Boas-vindas enviadas para ${ownerName} (${email}, ${whatsapp})`);
    },
    {
      connection: redisWorker,
      concurrency: 2,
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ [WELCOME] Job ${job.id} concluído`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ [WELCOME] Job ${job?.id} falhou:`, err.message);
  });

  return worker;
}
