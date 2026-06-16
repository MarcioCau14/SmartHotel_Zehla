// src/lib/swipe/seed-swipes.ts
import { prisma } from '@/lib/prisma';

export const SEED_SWIPES = [
  // ── SAUDACAO (5) ──
  {
    title: "Saudacao WhatsApp Padrao",
    content: "Ola {{NOME}}! Sou a IA da {{POUSADA}}. Vi sua mensagem e vou te ajudar agora mesmo! Qual sua duvida sobre nossas suites?",
    channel: "whatsapp",
    category: "saudacao",
    tone: "casual",
    tier: "universal",
    painType: null,
    tags: ["primeiro contato", "boas-vindas", "whatsapp"],
  },
  {
    title: "Saudacao Concierge Premium",
    content: "Bom dia, {{NOME}}. Aqui e a {{POUSADA}}. Fico feliz pelo seu interesse in nos conhecer. Tenho todas as informacoes sobre nossas suites, precos e disponibilidade. Como posso ajudar voce hoje?",
    channel: "whatsapp",
    category: "saudacao",
    tone: "concierge",
    tier: "pro",
    painType: null,
    tags: ["premium", "formal", "primeiro contato"],
  },
  {
    title: "Saudacao por Email - Boas-vindas",
    content: "Ola {{NOME}},\n\nObrigado pelo interesse na {{POUSADA}}!\n\nRecebemos seu contato e ja estamos preparando tudo para te receber. Aqui estao as proximas etapas:\n\n1. Confirme sua data preferida\n2. Escolha a suite ideal\n3. Faca a reserva com 10% de desconto\n\nEstou a disposicao para qualquer duvida.\n\nCom carinho,\nEquipe {{POUSADA}}",
    channel: "email",
    category: "saudacao",
    tone: "concierge",
    tier: "universal",
    painType: null,
    tags: ["email", "boas-vindas", "onboarding"],
  },
  {
    title: "Saudacao Instagram Direct",
    content: "Oi {{NOME}}! Que legal que nos encontrou aqui no Instagram! A {{POUSADA}} tem suites incriveis com vista para o mar. Quer que eu te mande fotos e precos? So responder aqui!",
    channel: "instagram",
    category: "saudacao",
    tone: "casual",
    tier: "lite",
    painType: null,
    tags: ["instagram", "jovem", "informal"],
  },
  {
    title: "Saudacao Voz - ZEHLA Voice",
    content: "Ola, {{NOME}}! Aqui e a {{POUSADA}}. Fico muito feliz que voce nos procurou. Tenho algumas opcoes incriveis de suites para te mostrar. Quer saber mais? So me responder aqui no WhatsApp!",
    channel: "voice",
    category: "saudacao",
    tone: "concierge",
    tier: "pro",
    painType: null,
    tags: ["voz", "audio", "humanizado"],
  },

  // ── PRECO (4) ──
  {
    title: "Resposta a Preco - Suite Simples",
    content: "{{NOME}}, nossas suites variam de R$ {{PRECO_MIN}} a R$ {{PRECO_MAX}} por noite, dependendo da epoca e da suite escolhida. Inclui cafe da manha artesanal! Quer que eu te mande as opcoes com fotos?",
    channel: "whatsapp",
    category: "preco",
    tone: "casual",
    tier: "lite",
    painType: "financeiro",
    tags: ["preco", "valor", "diaria"],
  },
  {
    title: "Resposta a Preco - Com Disconto",
    content: "{{NOME}}, tenho uma otima noticia! Para reservas feitas ate sexta, a {{POUSADA}} esta com 15% de desconto in todas as suites. Suite {{SUITE_NOME}} por apenas R$ {{PRECO_DESCONTO}}/noite (de R$ {{PRECO_ORIGINAL}}). So responder aqui para reservar!",
    channel: "whatsapp",
    category: "preco",
    tone: "urgente",
    tier: "pro",
    painType: "financeiro",
    tags: ["desconto", "urgencia", "promocao", "preco"],
  },
  {
    title: "Resposta a Preco - Comparativo de Valor",
    content: "{{NOME}}, entendo que preco e importante. Mas pense assim: por R$ {{PRECO}}/noite na {{POUSADA}}, voce tem cafe da manha artesanal, piscina privativa, estacionamento gratis e atendimento personalizado 24h. Em um hotel equivalente na regiao, pagaria o dobro sem metade desses beneficios. Quer que eu prepare um orcamento personalizado?",
    channel: "whatsapp",
    category: "preco",
    tone: "executivo",
    tier: "max",
    painType: "financeiro",
    tags: ["valor", "comparativo", "beneficios", "premium"],
  },
  {
    title: "Resposta a Preco - Tabela Completa",
    content: "Aqui estao nossos pacotes, {{NOME}}:\n\nSUITE JARDIM - R$ {{P1}}/noite\n  Ate 2 hospedes, cafe incluso\n\nSUITE MAR - R$ {{P2}}/noite\n  Ate 4 hospedes, vista mar, cafe + jantar\n\nCHALET PREMIUM - R$ {{P3}}/noite\n  Ate 6 hospedes, piscina privativa, all inclusive\n\nQual combina mais com voce?",
    channel: "whatsapp",
    category: "preco",
    tone: "executivo",
    tier: "universal",
    painType: "financeiro",
    tags: ["tabela", "pacotes", "comparativo"],
  },

  // ── DISPONIBILIDADE (3) ──
  {
    title: "Disponibilidade - Temos Vagas!",
    content: "Otima noticia, {{NOME}}! Temos vagas para as datas que voce quer. Suite {{SUITE_NOME}} disponivel de {{DATA_CHECKIN}} a {{DATA_CHECKOUT}} por R$ {{PRECO}}/noite. Quer que eu reserve agora?",
    channel: "whatsapp",
    category: "disponibilidade",
    tone: "casual",
    tier: "universal",
    painType: "ocupacao",
    tags: ["vagas", "disponibilidade", "reserva"],
  },
  {
    title: "Disponibilidade - Lotado, Oferecer Alternativa",
    content: "{{NOME}}, infelizmente estamos completos para essa data. Mas tenho boas opcoes! Consigo te encaixar na {{POUSADA_IRMA}} (mesma regiao, padrao similar) ou verificar a disponibilidade para {{DATA_ALTERNATIVA}}. Qual prefere?",
    channel: "whatsapp",
    category: "disponibilidade",
    tone: "empatico",
    tier: "pro",
    painType: "ocupacao",
    tags: ["lotado", "alternativa", "recuperacao"],
  },
  {
    title: "Disponibilidade - Sazonalidade Inteligente",
    content: "{{NOME}}, para {{MES}} a {{POUSADA}} opera in alta temporada. Os precos sao de R$ {{PRECO_ALTA}}/noite. Mas se voce puder ser flexivel com as datas, em {{MES_OFF}} temos a mesma suite por R$ {{PRECO_BAIXA}}/noite — uma economia de R$ {{ECONOMIA}} na diaria!",
    channel: "whatsapp",
    category: "disponibilidade",
    tone: "executivo",
    tier: "max",
    painType: "ocupacao",
    tags: ["sazonalidade", "alta estacao", "economia"],
  },

  // ── FOLLOW-UP (4) ──
  {
    title: "Follow-up 3 dias - Ainda Interessado?",
    content: "Oi {{NOME}}! Passou rapidinho aqui para saber se voce ainda esta pensando na {{POUSADA}}. Se tiver qualquer duvida, estou aqui! Ah, e lembre-se: temos datas limitadas para o periodo que voce quer. Um abraco!",
    channel: "whatsapp",
    category: "followup",
    tone: "casual",
    tier: "lite",
    painType: null,
    tags: ["followup", "lembrete", "3 dias"],
  },
  {
    title: "Follow-up 7 dias - Urgencia Suave",
    content: "{{NOME}}, so para te avisar que as datas {{DATA_INICIO}} a {{DATA_FIM}} estao sendo muito procuradas na {{POUSADA}}. Restam apenas 3 suites disponiveis para esse periodo. Nao queria que voce perdesse essa oportunidade!",
    channel: "whatsapp",
    category: "followup",
    tone: "urgente",
    tier: "pro",
    painType: "ocupacao",
    tags: ["urgencia", "escassez", "7 dias", "recuperacao"],
  },
  {
    title: "Follow-up por Email - Sequencia",
    content: "Oi {{NOME}},\n\nVi que voce esteve interessado na {{POUSADA}} ha poucos dias.\n\nQueria te contar que essa semana tivemos um hospede que disse: 'Melhor experiencia de viagem do ano!' — e foi exatamente pela suite que voce estava olhando.\n\nAinda tenho vagas para {{DATA}}. Posso reservar para voce?\n\nAbraços,\nEquipe {{POUSADA}}",
    channel: "email",
    category: "followup",
    tone: "concierge",
    tier: "pro",
    painType: null,
    tags: ["email", "followup", "depoimento", "prova social"],
  },
  {
    title: "Follow-up Voz - ZEHLA Voice",
    content: "{{NOME}}, aqui e a {{POUSADA}} de novo. So para te lembrar que as reservas para o feriado estao esgotando. Tenho uma suite com vista mar que combina perfeitamente com o que voce procurou. Me responde aqui se quiser que eu segure essa data para voce!",
    channel: "voice",
    category: "followup",
    tone: "acolhedor",
    tier: "pro",
    painType: "ocupacao",
    tags: ["voz", "audio", "followup", "urgencia"],
  },

  // ── RECUPERACAO (3) ──
  {
    title: "Recuperacao - Reserva Abandonada",
    content: "{{NOME}}, vi que voce comecou a reserva na {{POUSADA}} mas nao finalizou. Posso te ajudar? Se teve alguma dificuldade com o pagamento, posso oferecer um link de PIX mais simples. Ou se preferir, posso reservar manualmente para voce. So me responder!",
    channel: "whatsapp",
    category: "recuperacao",
    tone: "empatico",
    tier: "universal",
    painType: "financeiro",
    tags: ["abandono", "recuperacao", "checkout", "pix"],
  },
  {
    title: "Recuperacao - Ultima Chance",
    content: "{{NOME}}, este e o ultimo aviso: a suite {{SUITE_NOME}} que voce reservou na {{POUSADA}} sera liberada in 2 horas se o pagamento nao for confirmado. O valor e R$ {{PRECO}} via PIX. Posso te enviar o codigo agora?",
    channel: "whatsapp",
    category: "recuperacao",
    tone: "urgente",
    tier: "pro",
    painType: "financeiro",
    tags: ["ultima chance", "pix", "urgencia", "recuperacao"],
  },
  {
    title: "Recuperacao Email - Sequencia de 3 emails",
    content: "Oi {{NOME}},\n\nNotamos que voce visitou nosso site mas nao completou a reserva.\n\nVoce sabia que 87% dos nossos hospedes que reservam online voltam pelo menos 2 vezes?\n\nReserve agora com 10% OFF: {{LINK_RESERVA}}\n\nEste desconto expira in 24h.\n\nEquipe {{POUSADA}}",
    channel: "email",
    category: "recuperacao",
    tone: "executivo",
    tier: "max",
    painType: "ocupacao",
    tags: ["email", "recuperacao", "desconto", "sequencia"],
  },

  // ── UPSELL DE PLANO (3) ──
  {
    title: "Upsell LITE para PRO - Multi-Canal",
    content: "{{NOME}}, vi que voce esta usando o plano LITE. Sabia que com o PRO voce pode atender WhatsApp, Instagram E e-mail na mesma tela? Pousadas que usam multi-canal aumentam 40% as reservas. Quer uma demo de 7 dias gratis?",
    channel: "whatsapp",
    category: "upsell",
    tone: "executivo",
    tier: "pro",
    painType: "operacional",
    tags: ["upsell", "lite-para-pro", "multi-canal", "demo"],
  },
  {
    title: "Upsell PRO para MAX - Voz + Radar",
    content: "{{NOME}}, sua operacao esta crescendo! Com o MAX, voce ganha: mensagens de voz IA que soam como um concierge real, predicao de ocupacao com ML, e um gerente de contas dedicado. Donos de pousada com MAX reportam 60% mais reservas recorrentes. Vamos evoluir?",
    channel: "whatsapp",
    category: "upsell",
    tone: "executivo",
    tier: "max",
    painType: "ocupacao",
    tags: ["upsell", "pro-para-max", "voz", "ml", "radar"],
  },
  {
    title: "Upsell via Email - Case de Sucesso",
    content: "Oi {{NOME}},\n\nA Pousada {{POUSADA_EXEMPLO}} estava na mesma situacao que voce: atende no WhatsApp mas perde clientes no Instagram.\n\nDepois de migrar para o plano PRO, em 30 dias:\n- +47 reservas via Instagram\n- +23% de recuperacao de leads perdidos\n- 12 horas/semana economizadas\n\nQuer os mesmos resultados? Upgrade com 30% OFF: {{LINK_UPGRADE}}\n\nEquipe ZEHLA",
    channel: "email",
    category: "upsell",
    tone: "executivo",
    tier: "pro",
    painType: "operacional",
    tags: ["upsell", "case de sucesso", "metricas", "email"],
  },

  // ── OBJECOES (3) ──
  {
    title: "Objecao - E Muito Caro",
    content: "Entendo {{NOME}}! Vamos pensar juntos: quanto custa NAO ter IA no atendimento? Se voce perde 3 reservas por mes (R$ 800 cada), sao R$ 2.400 perdidos. O ZEHLA PRO custa R$ 297/mes e pode recuperar essas reservas automaticamente. O ROI e de 8x! Posso te mostrar como?",
    channel: "whatsapp",
    category: "objecao",
    tone: "executivo",
    tier: "pro",
    painType: "financeiro",
    tags: ["objecao", "preco", "roi", "custo-beneficio"],
  },
  {
    title: "Objecao - Nao Sei Usar IA",
    content: "{{NOME}}, isso e mais simples do que parece! O ZEHLA funciona assim: voce conecta seu WhatsApp, configura seus precos e horarios, e pronto. A IA responde automaticamente 24h por dia. Setup leva 5 minutos. E se precisar de ajuda, nosso time faz tudo pra voce. Quer testar sem compromisso?",
    channel: "whatsapp",
    category: "objecao",
    tone: "empatico",
    tier: "lite",
    painType: "operacional",
    tags: ["objecao", "complexidade", "facilidade", "setup"],
  },
  {
    title: "Objecao - Ja Uso Outro Sistema",
    content: "Legal, {{NOME}}! Qual sistema voce usa hoje? Posso te mostrar 3 coisas que o ZEHLA faz que provavelmente o seu nao faz: 1) IA que aprende o tom da sua pousada 2) Voz humana automatica 3) Predicao de ocupacao. Quer uma comparacao rapida?",
    channel: "whatsapp",
    category: "objecao",
    tone: "casual",
    tier: "pro",
    painType: "operacional",
    tags: ["objecao", "concorrencia", "diferencial", "comparacao"],
  },

  // ── ONBOARDING (2) ──
  {
    title: "Onboarding Trial - Dia 1",
    content: "Bem-vindo ao ZEHLA, {{NOME}}! Seu trial de 7 dias comecou. Passo 1: Conecte seu WhatsApp Business. Passo 2: Configure os precos das suas suites. Passo 3: Ative a IA. Pronto! Voce ja esta recebendo hospedes automaticamente. Tem alguma duvida? Responda aqui!",
    channel: "whatsapp",
    category: "onboarding",
    tone: "casual",
    tier: "universal",
    painType: "operacional",
    tags: ["onboarding", "trial", "setup", "boas-vindas"],
  },
  {
    title: "Onboarding Trial - Dia 5 (Pre-Conversion)",
    content: "{{NOME}}, seu trial acaba em 2 dias! Vi que a IA ja respondeu {{NUM_RESPOSTAS}} mensagens e {{NUM_LEADS}} leads foram qualificados. Pousadas que assinaram o PRO apos o trial reportaram +35% de reservas no primeiro mes. Quer continuar com essas resultados?",
    channel: "whatsapp",
    category: "onboarding",
    tone: "urgente",
    tier: "pro",
    painType: null,
    tags: ["onboarding", "trial", "pre-conversao", "metricas"],
  },

  // ── PROMOCAO (2) ──
  {
    title: "Promocao Alta Estacao",
    content: "ATENCAO {{NOME}}! A {{POUSADA}} liberou 5 suites com 20% OFF para alta temporada (Dez-Jan). Suite Vista Mar por R$ {{PRECO_PROMO}}/noite. So ate {{DATA_LIMITE}} ou enquanto durarem as vagas. Reserve agora!",
    channel: "whatsapp",
    category: "promocao",
    tone: "urgente",
    tier: "universal",
    painType: "ocupacao",
    tags: ["promocao", "alta estacao", "desconto", "escassez"],
  },
  {
    title: "Promocao Dia das Maes",
    content: "{{NOME}}, o Dia das Maes esta chegando! A {{POUSADA}} preparou um pacote especial: 2 noites + cafe da manha especial + espumante na suite + late de presente = R$ {{PRECO_PACOTE}} para 2 pessoas. Antes: R$ {{PRECO_ORIGINAL}}. Garanta ja!",
    channel: "whatsapp",
    category: "promocao",
    tone: "casual",
    tier: "universal",
    painType: null,
    tags: ["promocao", "feriado", "pacote", "dia das maes"],
  },

  // ── REVIEW (2) ──
  {
    title: "Resposta a Review Positiva",
    content: "Muito obrigado pela avaliacao generosa, {{NOME}}! Ficamos felizes que sua estadia na {{POUSADA}} foi especial. A equipe toda manda um abraco! Esperamos te receber de volta em breve.",
    channel: "whatsapp",
    category: "review",
    tone: "concierge",
    tier: "universal",
    painType: null,
    tags: ["review", "positivo", "agradecimento"],
  },
  {
    title: "Resposta a Review Negativa",
    content: "{{NOME}}, agradecemos seu feedback sincero. Lamento que a experiencia nao atendeu suas expectativas. Ja estamos tomando providencias sobre o que voce mencionou. Gostaria de conversar com voce pessoalmente para entender melhor o que aconteceu? Ligar ou me chamar aqui no WhatsApp?",
    channel: "whatsapp",
    category: "review",
    tone: "empatico",
    tier: "pro",
    painType: "operacional",
    tags: ["review", "negativo", "empatia", "resolucao"],
  },

  // ── RECOMENDACAO (1) ──
  {
    title: "Pedido de Recomendacao",
    content: "{{NOME}}, que bom que voce gostou da {{POUSADA}}! Sabia que indicando amigos voce ganha 1 mes gratis no ZEHLA? So encaminhar esta mensagem: 'Ola! Estou usando o ZEHLA para automatizar minhas reservas e esta sendo incrivel! Teste gratis: {{LINK_REFERRAL}}'. Obrigado pela confianca!",
    channel: "whatsapp",
    category: "recomendacao",
    tone: "casual",
    tier: "universal",
    painType: null,
    tags: ["referral", "indicacao", "mes gratis"],
  },

  // ── ENCERRAMENTO (1) ──
  {
    title: "Pos-Checkout Agradecimento",
    content: "{{NOME}}, sua reserva esta confirmada! Suite: {{SUITE_NOME}} | Check-in: {{DATA_IN}} | Check-out: {{DATA_OUT}} | Valor: R$ {{TOTAL}}. Em breve voce recebera o comprovante por e-mail. Nos vemos em breve na {{POUSADA}}!",
    channel: "whatsapp",
    category: "encerramento",
    tone: "concierge",
    tier: "universal",
    painType: null,
    tags: ["confirmacao", "checkout", "agradecimento", "reserva"],
  },
];

export async function seedSwipes() {
  let criados = 0;
  let ignorados = 0;

  for (const t of SEED_SWIPES) {
    const existe = await prisma.swipeTemplate.findFirst({
      where: { title: t.title }
    });

    if (existe) {
      ignorados++;
      continue;
    }

    const vars = t.content.match(/\{\{(\w+)\}\}/g) || [];
    const variables = JSON.stringify(vars.map(v => v.replace(/\{\{|\}\}/g, "")));

    await prisma.swipeTemplate.create({
      data: {
        title: t.title,
        content: t.content,
        variables,
        channel: t.channel,
        category: t.category,
        tone: t.tone,
        tier: t.tier,
        painType: t.painType,
        tags: t.tags,
        isAiGenerated: false,
        createdBy: "system-seed",
      }
    });

    criados++;
  }

  return {
    criados,
    ignorados,
    total: SEED_SWIPES.length
  };
}
