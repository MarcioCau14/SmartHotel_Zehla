import { 


  GeneratedMessage, MessageCategory, VirtualPousada, VirtualGuest,
  Formalidade, RegiaoBrasil, GuestProfile 
} from "./types";

interface MessageTemplate {
  category: MessageCategory;
  templates: string[];
  urgency: "baixa" | "media" | "alta" | "critica";
  weight: number; // probability weight
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    category: "disponibilidade",
    urgency: "media",
    weight: 18,
    templates: [
      "Oi! Boa tarde {emoji_bom} Tem quarto disponivel pro fim de semana que vem? Somos {perfil_desc}.",
      "Boa tarde. Gostaria de saber se ha disponibilidade para {datas_random}, para {qtd_pessoas} pessoas.",
      "E ai{regiao_termo}! Tem quartos pro feriado? {perfil_desc}",
      "Tem quarto pra {qtd_pessoas} pessoas esse fds? {data_curta}. Me fala rapidao pfv",
      "Oiii boa tarde!! Tem quartos pra {perfil_desc_fem}? {qtd_pessoas} pessoas pro feriado de {feriado_proximo}",
      "Boa noite {emoji_amor} Vocs tem suite com banheira de hidromassagem pra comemorar nosso aniversario de casamento? Seria dia {data_especifica}",
      "Opa, bom dia! Queria saber se tem quarto individual, so pra mim, pra ficar {qtd_noites} noites no inicio de julho. Aceita pix?",
      "OIIII! Preciso de {qtd_quartos} quartos pro fds!! Somos {qtd_pessoas} amigos, sera que vcs conseguem nos acomodar? Tem area de churrasqueira?",
      "Oi de novo! {emoji_feliz} A gente ficou la em {mes_passado} e amou demais! Tem vaga pra gente em {mes_futuro}? Queremos o mesmo quarto se possivel",
      "BOA NOITE!! To precisando MUITO de um quarto pra essa sexta e sabado!! Meu hotel cancelou tudo de ultima hora, ajuda por favor {emoji_chorando}",
      "Bom dia! Tem disponibilidade pra {qtd_noites} noites em {mes_futuro}? Pra {qtd_pessoas} adultos e {qtd_criancas} criancas. Aceita cartao?",
      "Ola! Gostaria de checar disponibilidade de {qtd_quartos} quartos para o periodo de {periodo}. Casamos dia {data_casamento} e queremos comemorar la!",
    ],
  },
  {
    category: "preco",
    urgency: "media",
    weight: 15,
    templates: [
      "Quanto fica a diaria pra {qtd_pessoas} pessoas no fds?",
      "Oi! Quero reservar {qtd_noites} noites ({periodo}) pra {perfil_desc}. Quanto fica o total? Tem cafe da manha?",
      "Boa tarde! Podem me fazer um orcamento pra {qtd_adultos} adultos e {qtd_criancas} crianca de {idade_crianca} anos, {qtd_noites} diarias na alta temporada? Inclui cafe colonial?",
      "Oi! Vi o preco de voces no booking e queria saber se fazem preco melhor reservando direto? Pra {qtd_noites} noites em {mes_futuro}",
      "Quanto fica pra {qtd_pessoas} pessoas em {qtd_quartos} quartos no feriado? Faz algum pacote?",
      "Quanto fica a diaria pra {perfil_desc} com {qtd_pets} cachorro pequeno? Tem alguma taxa extra pra pet?",
      "Bom dia! Quero ficar {qtd_noites} noites em {mes_futuro}. Tem desconto pra semana? Quanto fica?",
      "Ola! Vcs tem alguma promocao de ultima hora pra essa noite? So eu",
      "Quanto fica o fds inteiro? E se for so sabado e domingo? Tem pacote com jantar incluso?",
      "Boa! Quero saber o preco da suite premium pra casal em {mes_futuro}. {qtd_noites} noites. Tem como pagar em ate 3x?",
    ],
  },
  {
    category: "reserva",
    urgency: "alta",
    weight: 12,
    templates: [
      "Quero reservar! Suite {tipo_quarto} {data_curta}. Como faco?",
      "Oi! Gostaria de fazer uma reserva: Suite Premium, {qtd_adultos} adultos, {qtd_noites} noites ({periodo}). Aceita cartao de credito?",
      "Boa! Vou reservar pra {qtd_noites} noites. Faz pix? Manda a chave pfv",
      "E ai! Posso reservar pra esse fds e pagar a vista? Quanto fica com desconto?",
      "Bom dia! Quero reservar pro feriado de {feriado_proximo} ({periodo}). Suite {tipo_quarto}. Pode reservar pra mim? Me confirma pfv",
      "Ola! Gostaria de confirmar minha reserva: {qtd_quartos} quartos, {qtd_pessoas} pessoas, {data_curta}. Vcs ja receberam meu pix?",
    ],
  },
  {
    category: "cancelamento",
    urgency: "critica",
    weight: 5,
    templates: [
      "Oi, infelizmente vou precisar cancelar minha reserva do dia {data_especifica}. Consigo reembolso?",
      "Boa tarde... Nao vou poder ir no fds que vem. Ja tinha reservado suite casal. Pode cancelar pra mim? Vcs devolvem o dinheiro?",
      "Ei, me desculpa mas minha viagem foi cancelada. Preciso cancelar a reserva do {periodo}. Me fala sobre a politica de cancelamento pfv",
      "Boa noite! Tive um imprevisto familiar e nao vou poder viajar mais. Cancela pra mim? Reserva {qtd_noites} noites em {data_especifica}",
    ],
  },
  {
    category: "reclamacao",
    urgency: "alta",
    weight: 5,
    templates: [
      "Boa noite... to na pousada agora e o quarto ao lado ta fazendo MUITO barulho. Ja sao 23h. Podem falar com eles?",
      "Oi, o banheiro do quarto {num_quarto} nao foi limpo direito. Tem cabelo no ralo e a toalha esta suja. Podem mandar alguem?",
      "BOM DIA! O ar condicionado do nosso quarto nao ta funcionando! Ta {temperatura} graus la dentro, impossivel dormir. Me ajudem pfv!",
      "A internet aqui ta pessima!! Nao consigo nem mandar uma mensagem. Falei la na recepcao mas nada mudou. Resolva isso urgente",
      "Cheguei as 14h como combinado e ninguem apareceu na recepcao. Ja esperei 30 minutos. To aqui com minha familia cansada da viagem. ONDE ESTAO VOCES?",
      "O cafe da manha hoje tava frio e faltava muita coisa. No site dizia cafe colonial completo mas so tinha pao e cafe. Muito decepcionado",
    ],
  },
  {
    category: "elogio",
    urgency: "baixa",
    weight: 5,
    templates: [
      "Nossa, que pousada MARAVILHOSA! {emoji_estrela} Tudo perfeito, cafe colonial incrivel, equipe super atenciosa. Voltaremos com certeza!",
      "So pra agradecer a {nome_func} e o {nome_func2} que sao incriveis! Eles fizeram nossa estadia ficar ainda melhor. Nota 10!",
      "O cafe da manha dessa pousada e o MELHOR que ja comi em toda a minha vida! Pao de queijo, bolo de cenoura, frutas frescas... demais!",
      "A vista do quarto e ABSURDA! Acordei com o nascer do sol la de cima e parecia um quadro {emoji_coracao}",
      "Queria agradecer a toda a equipe! Foi a melhor experiencia em pousada que ja tivemos. Vcs sao demais! {emoji_grato}",
    ],
  },
  {
    category: "informacao",
    urgency: "baixa",
    weight: 8,
    templates: [
      "Bom dia! Vcs aceitam cachorro? Quanto custa a taxa? Ele e pequeno, 5kg",
      "Ola! Qual a distancia da pousada ate o centrinho? Tem transfer do aeroporto?",
      "Boa tarde! Vcs tem estacionamento? E gratuito? E wifi funciona bem?",
      "Oi! Vcs fornecem toalhas de praia? Tem guarda-sol? A praia e perto?",
      "Boa! Qual o horario do check-in e check-out? Posso fazer check-in antecipado?",
    ],
  },
  {
    category: "solicitacao_especial",
    urgency: "media",
    weight: 3,
    templates: [
      "Oi! Vou comemorar meu aniversario de casamento la dia {data_especifica}. Tem como preparar algo especial? Flores, champanhe?",
      "Boa tarde! Minha esposa tem alergia grave a gluten e lactose. O cafe da manha tem opcoes sem gluten? Posso levar minha comida?",
      "Boa noite! Preciso saber se a pousada tem acessibilidade total: rampa, quarto adaptado, banheiro com barras de apoio. Meu pai usa cadeira de rodas",
      "Oi! Estamos planejando nosso casamento la em novembro. Vocs aceitam eventos? Teria espaco pra {qtd_pessoas} pessoas?",
      "Boa! Posso pedir um quarto no terreo? Minha mae tem dificuldade de subir escadas. Tem quarto acessivel?",
    ],
  },
  {
    category: "followup",
    urgency: "media",
    weight: 5,
    templates: [
      "Oi! Enviei uma mensagem ontem pedindo reserva mas ninguem respondeu. Ainda tem vaga pro {data_curta}?",
      "Boa tarde! Fiz uma reserva la semana passada pro fds e queria confirmar se ta tudo certo. Suite casal {data_especifica}",
      "Ola! Paguei o pix ontem mas ainda nao recebi confirmacao. Podem verificar pra mim?",
      "Ei! Quero saber sobre minha reserva pra {data_especifica}. Quarto {num_quarto} pra {qtd_pessoas} pessoas. Confirma pfv?",
    ],
  },
  {
    category: "fora_horario",
    urgency: "baixa",
    weight: 4,
    templates: [
      "Opa, boa noite! Sei que e tarde mas queria saber se ainda tem quartos disponiveis pra amanha?",
      "{emoji_oi} Desculpa incomodar nessa hora! Mas to precisando de um quarto urgente, meu voo foi cancelado e preciso de um lugar pra dormir hj",
      "Boa madrugada! So queria confirmar: check-in e as 14h certo? Vou chegar cedo",
    ],
  },
  {
    category: "pet_friendly",
    urgency: "media",
    weight: 2,
    templates: [
      "Vou com meu dog {emoji_dog} aceita? Tem area pra ele? Ele e super tranquilo, nao late",
      "Oi! Tenho 2 gatos que viajam comigo. Vocs aceitam? Tem algum custo extra?",
      "Boa! Meu cachorro e grande (20kg), aceita? Tem area gramada la?",
    ],
  },
  {
    category: "grupo",
    urgency: "alta",
    weight: 2,
    templates: [
      "Preciso de 4 quartos pro fds!! Somos 12 amigos, sera que vcs conseguem nos acomodar? Tem area de churrasqueira?",
      "Ola! Vamos comemorar o aniversario do meu irmao com 15 pessoas. Teria como fechar a pousada inteira? Quanto fica?",
      "E ai! Somos um grupo de motociclistas, 8 pessoas. Vcs tem estacionamento grande? Tem quartos proximos?",
    ],
  },
];

// Edge case messages
const EDGE_CASE_TEMPLATES: MessageTemplate[] = [
  {
    category: "longa",
    urgency: "baixa",
    weight: 1,
    templates: [
      "Oi bom dia! Entao, minha situacao e a seguinte: eu e minha familia queremos viajar em {mes_futuro} mas ainda nao definimos as datas exatas porque meu marido nao conseguiu tirar ferias ainda no trabalho, mas a gente queria saber se vcs tem disponibilidade na primeira ou na segunda semana de {mes_futuro}, e qual seria o preco pra um quarto de casal e um quarto triplo, e se tem cafe colonial incluso, e se aceitam pix com desconto, e se tem estacionamento, e se a piscina e aquecida no inverno, e se fica perto do centrinho a pe, e se tem transfer do aeroporto, e se aceita cartao de credito parcelado em ate 3x sem juros, e se tem algum pacote com jantar incluso, e se a pousada e pet friendly porque podemos levar nosso dog...",
    ],
  },
  {
    category: "multi_idioma",
    urgency: "media",
    weight: 1,
    templates: [
      "Hello! Do you have availability for this weekend? We are a couple from Sao Paulo. English or Spanish preferred.",
      "Hola! Tenemos disponibilidad para este finde? Somos 2 personas.",
      "Bonjour! Avez-vous des chambres disponibles pour ce week-end?",
    ],
  },
  {
    category: "malformada",
    urgency: "baixa",
    weight: 1,
    templates: [
      "O!i qu3r0 r3s3rv4r... @#$%",
      " ",
      "????????",
      "1111111111111111111",
    ],
  },
  {
    category: "spam",
    urgency: "baixa",
    weight: 0.5,
    templates: [
      "CONGRATULATIONS! Voce ganhou um fim de semana GRATIS! Clique aqui: http://premio-fake.com/resgatar",
      "PARCEIRO, faca R$5000 por dia trabalhando de casa! Envie WHATSAPP para 4002-8922",
    ],
  },
];

// Regional expressions
const REGIONAL_EXPRESSIONS: Record<RegiaoBrasil, { termos: string[]; emojis: string[] }> = {
  sudeste: { termos: ["Cara", "Mano", "Top", "Show", "Mermo", "Beleza"], emojis: ["😊", "👍", "🔥", "✨", "💯"] },
  nordeste: { termos: ["Meu amor", "Amor", "Deus me livre", "Nossa Senhora", "Massa", "Arrasou"], emojis: ["💖", "🙏", "🌟", "🌹", "🫶"] },
  sul: { termos: ["Bah", "Tchê", "Legal", "Gostoso", "Bacana", "Nossa"], emojis: ["😊", "👍", "🤩", "✨", "💯"] },
  norte: { termos: ["Velho", "Parceiro", "E o negocio e o seguinte", "Tranquilo", "Pode crer"], emojis: ["😎", "💪", "👍", "👌", "✌️"] },
  centro_oeste: { termos: ["Mermão", "Tranquilo", "Beleza", "Dale", "Show de bola"], emojis: ["😎", "👍", "💪", "✨", "🔥"] },
};

// Fill-in helper data
const FERIADOS = ["Corpus Christi", "Reveillon", "Carnaval", "Semana Santa", "Independencia", "Tiradentes", "Finados", "Natal"];
const MESES = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const FUNCIONARIOS = ["Joana", "Pedro", "Maria", "Carlos", "Ana", "Lucas", "Fernanda", "Rafael", "Camila", "Thiago"];

function generateId(): string {
  try {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function randomInt(min: number, max: number): number {
  try {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class MessageGenerator {
  private allTemplates: MessageTemplate[];

  constructor() {
    this.allTemplates = [...MESSAGE_TEMPLATES, ...EDGE_CASE_TEMPLATES];
  }

  /**
   * Generate a batch of messages for a pousada and its guests
   */
  generateBatch(
    pousada: VirtualPousada,
    guests: VirtualGuest[],
    count: number
  ): GeneratedMessage[] {
    const messages: GeneratedMessage[] = [];

    for (let i = 0; i < count; i++) {
      const guest = randomItem(guests);
      const template = this.selectTemplate();
      const content = this.renderTemplate(template, guest, pousada);

      messages.push({
        id: generateId(),
        content,
        category: template.category,
        pousadaId: pousada.propertyId,
        guestId: guest.id,
        guestPhone: guest.telefone,
        channel: "whatsapp",
        timestamp: this.generateTimestamp(),
        scenarioId: pousada.scenarioId,
        metadata: {
          formalidade: guest.formalidade,
          regiao: guest.regiaoLinguistica,
          usaEmoji: guest.usaEmoji,
          perfilHospede: guest.perfilViagem,
          urgencia: template.urgency,
          tokensEstimados: Math.ceil(content.length / 4),
        },
      });
    }

    return messages;
  }

  /**
   * Generate a single message
   */
  generateOne(pousada: VirtualPousada, guest: VirtualGuest): GeneratedMessage {
    const template = this.selectTemplate();
    const content = this.renderTemplate(template, guest, pousada);

    return {
      id: generateId(),
      content,
      category: template.category,
      pousadaId: pousada.propertyId,
      guestId: guest.id,
      guestPhone: guest.telefone,
      channel: "whatsapp",
      timestamp: this.generateTimestamp(),
      scenarioId: pousada.scenarioId,
      metadata: {
        formalidade: guest.formalidade,
        regiao: guest.regiaoLinguistica,
        usaEmoji: guest.usaEmoji,
        perfilHospede: guest.perfilViagem,
        urgencia: template.urgency,
        tokensEstimados: Math.ceil(content.length / 4),
      },
    };
  }

  private selectTemplate(): MessageTemplate {
    // Weighted random selection
    const totalWeight = this.allTemplates.reduce((sum, t) => sum + t.weight, 0);
    let r = Math.random() * totalWeight;

    for (const template of this.allTemplates) {
      r -= template.weight;
      if (r <= 0) return template;
    }

    return this.allTemplates[0];
  }

  private renderTemplate(template: MessageTemplate, guest: VirtualGuest, pousada: VirtualPousada): string {
    let content = randomItem(template.templates);
    const regiao = REGIONAL_EXPRESSIONS[guest.regiaoLinguistica];
    
    // Add regional expression at the beginning if informal
    if (guest.formalidade !== "formal" && Math.random() > 0.5) {
      content = `${randomItem(regiao.termos)}! ${content}`;
    }
    
    // Add emoji at the end if guest uses emojis
    if (guest.usaEmoji && Math.random() > 0.3) {
      content = `${content} ${randomItem(regiao.emojis)}`;
    }

    // Replace placeholders
    content = content
      .replace(/\{emoji_bom\}/g, randomItem(["😊", "👋", "☀️"]))
      .replace(/\{emoji_amor\}/g, randomItem(["💕", "❤️", "😍"]))
      .replace(/\{emoji_feliz\}/g, randomItem(["😄", "🥰", "🎉"]))
      .replace(/\{emoji_chorando\}/g, randomItem(["😭", "😩", "🥺"]))
      .replace(/\{emoji_estrela\}/g, randomItem(["🌟", "⭐", "✨"]))
      .replace(/\{emoji_coracao\}/g, randomItem(["❤️", "💕", "💖"]))
      .replace(/\{emoji_grato\}/g, randomItem(["🙏", "💕", "🤗"]))
      .replace(/\{emoji_oi\}/g, randomItem(["👋", "😊", "🌙"]))
      .replace(/\{emoji_dog\}/g, "🐕")
      .replace(/\{regiao_termo\}/g, randomItem(regiao.termos))
      .replace(/\{perfil_desc\}/g, this.getProfileDescription(guest.perfilViagem))
      .replace(/\{perfil_desc_fem\}/g, this.getProfileDescriptionFeminine(guest.perfilViagem))
      .replace(/\{qtd_pessoas\}/g, String(randomInt(1, 4)))
      .replace(/\{qtd_quartos\}/g, String(randomInt(1, 5)))
      .replace(/\{qtd_noites\}/g, String(randomInt(1, 7)))
      .replace(/\{qtd_criancas\}/g, String(randomInt(1, 3)))
      .replace(/\{qtd_adultos\}/g, String(randomInt(1, 4)))
      .replace(/\{qtd_pets\}/g, String(randomInt(1, 2)))
      .replace(/\{idade_crianca\}/g, String(randomInt(3, 12)))
      .replace(/\{data_curta\}/g, this.generateShortDate())
      .replace(/\{data_especifica\}/g, this.generateSpecificDate())
      .replace(/\{datas_random\}/g, this.generateDateRange())
      .replace(/\{periodo\}/g, this.generateDateRange())
      .replace(/\{mes_passado\}/g, MESES[(new Date().getMonth() + 11) % 12])
      .replace(/\{mes_futuro\}/g, randomItem(MESES.slice((new Date().getMonth() + 1) % 12, (new Date().getMonth() + 4) % 12 || 12)))
      .replace(/\{feriado_proximo\}/g, randomItem(FERIADOS))
      .replace(/\{tipo_quarto\}/g, randomItem(["casal", "triplo", "premium", "standard", "master", "suite"]))
      .replace(/\{num_quarto\}/g, String(randomInt(1, 30)))
      .replace(/\{nome_func\}/g, randomItem(FUNCIONARIOS))
      .replace(/\{nome_func2\}/g, randomItem(FUNCIONARIOS.filter(f => f !== randomItem(FUNCIONARIOS))))
      .replace(/\{temperatura\}/g, String(randomInt(30, 40)))
      .replace(/\{data_casamento\}/g, this.generateSpecificDate());

    return content;
  }

  private getProfileDescription(profile: GuestProfile): string {
    const descriptions: Record<GuestProfile, string[]> = {
      casal: ["um casal", "nos dois", "eu e minha esposa", "eu e meu marido"],
      familia: ["uma familia com 2 criancas", "eu minha esposa e 2 filhos", "uma familia"],
      solo: ["uma pessoa so", "so eu", "mim"],
      amigos: ["um grupo de amigos", "nos 4", "meus amigos e eu"],
      pet: ["eu e meu cachorro", "nosso casal com nosso pet"],
      business: ["uma pessoa a trabalho", "para reuniao de negocios"],
    };
    return randomItem(descriptions[profile]);
  }

  private getProfileDescriptionFeminine(profile: GuestProfile): string {
    const descriptions: Record<GuestProfile, string[]> = {
      casal: ["um casal"],
      familia: ["uma familia com criancas", "eu e minhas criancas"],
      solo: ["uma mulher sozinha"],
      amigos: ["um grupo de amigas", "nos meninas"],
      pet: ["eu e minha doguinha"],
      business: ["uma mulher a trabalho"],
    };
    return randomItem(descriptions[profile]);
  }

  private generateShortDate(): string {
    const d = new Date(Date.now() + randomInt(3, 45) * 86400000);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  private generateSpecificDate(): string {
    const d = new Date(Date.now() + randomInt(5, 60) * 86400000);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  private generateDateRange(): string {
    const start = new Date(Date.now() + randomInt(5, 30) * 86400000);
    const end = new Date(start.getTime() + randomInt(1, 5) * 86400000);
    return `${start.getDate()}/${start.getMonth() + 1} a ${end.getDate()}/${end.getMonth() + 1}`;
  }

  private generateTimestamp(): Date {
    // Weighted toward business hours (14h-21h) but can be anytime
    const hour = Math.random() < 0.7
      ? randomInt(14, 21)
      : randomInt(6, 23);
    const minute = randomInt(0, 59);
    
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    if (hour < 6) date.setDate(date.getDate() + 1); // after midnight = next day
    
    return date;
  }
}

export default MessageGenerator;
