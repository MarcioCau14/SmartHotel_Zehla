import { 


  VirtualPousada, PlanoZehla, ZCCAgent, PousadaTipo, PousadaSituacao, 
  DDD_BY_STATE, AMENITIES_POOL, PLANO_DISTRIBUTION, Destination, RegiaoBrasil 
} from "./types";

// 50 Brazilian tourist destinations
const DESTINATIONS: Destination[] = [
  // Sudeste
  { nome: "Paraty", estado: "RJ", regiao: "sudeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","fevereiro","julho"], demandaMedia: 9, precoMedio: 350, ddd: "24" },
  { nome: "Tiradentes", estado: "MG", regiao: "sudeste", tipo: "historico", clima: "tropical", altaTemporada: ["junho","julho","agosto"], demandaMedia: 8, precoMedio: 300, ddd: "32" },
  { nome: "Campos do Jordao", estado: "SP", regiao: "sudeste", tipo: "serra", clima: "temperado", altaTemporada: ["junho","julho","dezembro","janeiro"], demandaMedia: 10, precoMedio: 500, ddd: "12" },
  { nome: "Buzios", estado: "RJ", regiao: "sudeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","carnaval"], demandaMedia: 9, precoMedio: 450, ddd: "22" },
  { nome: "Petropolis", estado: "RJ", regiao: "sudeste", tipo: "serra", clima: "temperado", altaTemporada: ["julho","dezembro","janeiro"], demandaMedia: 7, precoMedio: 250, ddd: "24" },
  { nome: "Ouro Preto", estado: "MG", regiao: "sudeste", tipo: "historico", clima: "tropical", altaTemporada: ["semana_santa","junho","julho"], demandaMedia: 8, precoMedio: 280, ddd: "31" },
  { nome: "Monte Verde", estado: "MG", regiao: "sudeste", tipo: "serra", clima: "temperado", altaTemporada: ["junho","julho","dezembro"], demandaMedia: 8, precoMedio: 350, ddd: "35" },
  { nome: "Ilha Grande", estado: "RJ", regiao: "sudeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","carnaval"], demandaMedia: 9, precoMedio: 300, ddd: "24" },
  { nome: "Ilhabela", estado: "SP", regiao: "sudeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","ferias"], demandaMedia: 7, precoMedio: 380, ddd: "12" },
  { nome: "Ubatuba", estado: "SP", regiao: "sudeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","carnaval"], demandaMedia: 7, precoMedio: 250, ddd: "12" },
  { nome: "Arraial do Cabo", estado: "RJ", regiao: "sudeste", tipo: "litoral", clima: "tropical", altaTemporada: ["verao","reveillon","carnaval"], demandaMedia: 8, precoMedio: 220, ddd: "22" },
  { nome: "Sao Joao del Rei", estado: "MG", regiao: "sudeste", tipo: "historico", clima: "tropical", altaTemporada: ["junho","julho"], demandaMedia: 6, precoMedio: 200, ddd: "32" },
  { nome: "Cabo Frio", estado: "RJ", regiao: "sudeste", tipo: "litoral", clima: "tropical", altaTemporada: ["verao","reveillon"], demandaMedia: 7, precoMedio: 200, ddd: "22" },
  // Nordeste
  { nome: "Porto Seguro", estado: "BA", regiao: "nordeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","carnaval","ferias"], demandaMedia: 9, precoMedio: 320, ddd: "73" },
  { nome: "Trancoso", estado: "BA", regiao: "nordeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","ferias"], demandaMedia: 9, precoMedio: 500, ddd: "73" },
  { nome: "Itacare", estado: "BA", regiao: "nordeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","junho","julho"], demandaMedia: 7, precoMedio: 280, ddd: "73" },
  { nome: "Jericoacoara", estado: "CE", regiao: "nordeste", tipo: "litoral", clima: "seco", altaTemporada: ["julho","dezembro","janeiro"], demandaMedia: 8, precoMedio: 300, ddd: "88" },
  { nome: "Maragogi", estado: "AL", regiao: "nordeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","junho","julho"], demandaMedia: 7, precoMedio: 250, ddd: "82" },
  { nome: "Pipa", estado: "RN", regiao: "nordeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","ferias"], demandaMedia: 8, precoMedio: 280, ddd: "84" },
  { nome: "Fernando de Noronha", estado: "PE", regiao: "nordeste", tipo: "natureza", clima: "tropical", altaTemporada: ["agosto","dezembro","janeiro"], demandaMedia: 10, precoMedio: 800, ddd: "81" },
  { nome: "Porto de Galinhas", estado: "PE", regiao: "nordeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","junho","julho"], demandaMedia: 9, precoMedio: 350, ddd: "81" },
  { nome: "Canoa Quebrada", estado: "CE", regiao: "nordeste", tipo: "litoral", clima: "seco", altaTemporada: ["julho","dezembro","janeiro"], demandaMedia: 6, precoMedio: 200, ddd: "88" },
  { nome: "Sao Miguel dos Milagres", estado: "AL", regiao: "nordeste", tipo: "litoral", clima: "tropical", altaTemporada: ["setembro","dezembro","janeiro"], demandaMedia: 7, precoMedio: 300, ddd: "82" },
  { nome: "Morro de Sao Paulo", estado: "BA", regiao: "nordeste", tipo: "litoral", clima: "tropical", altaTemporada: ["dezembro","janeiro","carnaval","ferias"], demandaMedia: 8, precoMedio: 280, ddd: "75" },
  { nome: "Lençois Maranhenses", estado: "MA", regiao: "nordeste", tipo: "natureza", clima: "tropical", altaTemporada: ["junho","julho","agosto","dezembro"], demandaMedia: 8, precoMedio: 350, ddd: "98" },
  // Sul
  { nome: "Florianopolis", estado: "SC", regiao: "sul", tipo: "litoral", clima: "subtropical", altaTemporada: ["dezembro","janeiro","fevereiro","carnaval"], demandaMedia: 10, precoMedio: 400, ddd: "48" },
  { nome: "Gramado", estado: "RS", regiao: "sul", tipo: "serra", clima: "temperado", altaTemporada: ["junho","julho","dezembro","natal_luz"], demandaMedia: 10, precoMedio: 400, ddd: "54" },
  { nome: "Canela", estado: "RS", regiao: "sul", tipo: "serra", clima: "temperado", altaTemporada: ["junho","julho","dezembro"], demandaMedia: 8, precoMedio: 350, ddd: "54" },
  { nome: "Blumenau", estado: "SC", regiao: "sul", tipo: "urbano", clima: "subtropical", altaTemporada: ["outubro","dezembro"], demandaMedia: 7, precoMedio: 250, ddd: "47" },
  { nome: "Bombinhas", estado: "SC", regiao: "sul", tipo: "litoral", clima: "subtropical", altaTemporada: ["dezembro","janeiro","fevereiro"], demandaMedia: 7, precoMedio: 280, ddd: "47" },
  { nome: "Balneario Camboriu", estado: "SC", regiao: "sul", tipo: "litoral", clima: "subtropical", altaTemporada: ["verao","reveillon","carnaval"], demandaMedia: 8, precoMedio: 350, ddd: "47" },
  // Norte / Centro-Oeste
  { nome: "Bonito MS", estado: "MS", regiao: "centro_oeste", tipo: "natureza", clima: "tropical", altaTemporada: ["maio","junho","julho","agosto","dezembro","janeiro"], demandaMedia: 9, precoMedio: 450, ddd: "67" },
  { nome: "Pirenopolis", estado: "GO", regiao: "centro_oeste", tipo: "historico", clima: "tropical", altaTemporada: ["junho","julho","festivais"], demandaMedia: 7, precoMedio: 280, ddd: "62" },
  { nome: "Chapada dos Veadeiros", estado: "GO", regiao: "centro_oeste", tipo: "natureza", clima: "tropical", altaTemporada: ["maio","junho","julho","agosto"], demandaMedia: 7, precoMedio: 300, ddd: "62" },
  { nome: "Caldas Novas", estado: "GO", regiao: "centro_oeste", tipo: "natureza", clima: "tropical", altaTemporada: ["julho","junho","ferias","fim_de_ano"], demandaMedia: 8, precoMedio: 300, ddd: "64" },
  { nome: "Diamantina", estado: "MG", regiao: "sudeste", tipo: "historico", clima: "tropical", altaTemporada: ["junho","julho","semana_santa"], demandaMedia: 6, precoMedio: 200, ddd: "38" },
];

// Name parts for generating pousada names
const POUSADA_PREFIXES = [
  "Pousada", "Chale", "Hotel", "Estalagem", "Casa", "Vila", "Refugio",
  "Retiro", "Solar", "Fazenda", "Sitio", "Recanto", "Cantinho", "Mirante"
];

const POUSADA_SUFIXES = [
  "do Sol", "da Lua", "do Mar", "da Serra", "das Flores", "da Praia",
  "do Lago", "da Montanha", "do Vale", "da Mata", "da Pedra", "do Rio",
  "da Colina", "do Ceu", "das Estrelas", "do Horizonte", "da Aurora",
  "da Brisa", "do Vento", "da Paz", "do Campo", "da Cachoeira",
  "Bela Vista", "Paraíso", "Encanto", "Sereno", "Harmonia", "Perfeito"
];

const POUSADA_TIPOS: PousadaTipo[] = ["familia", "romantico", "eco", "pet_friendly", "luxo", "historico"];
const POUSADA_SITUACOES: PousadaSituacao[] = ["nova", "consolidada", "alta_temporada", "baixa_temporada", "com_problemas"];
const POUSADA_TIPO_DISTRIBUTION: { tipo: PousadaTipo; prob: number }[] = [
  { tipo: "familia", prob: 0.35 },
  { tipo: "romantico", prob: 0.25 },
  { tipo: "eco", prob: 0.15 },
  { tipo: "pet_friendly", prob: 0.10 },
  { tipo: "luxo", prob: 0.08 },
  { tipo: "historico", prob: 0.07 },
];

function randomInt(min: number, max: number): number {
  try {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  try {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandom<T extends { prob: number }>(items: T[]): T {
  const r = Math.random();
  let cumulative = 0;
  for (const item of items) {
    cumulative += item.prob;
    if (r <= cumulative) return item;
  }
  return items[items.length - 1];
}

function generateId(): string {
  try {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function generatePhone(ddd: string): string {
  try {
  const number = randomInt(900000000, 999999999);
  return `+55${ddd}${number}`;
}

export class PousadaFactory {
  private scenarioId: string;

  constructor(scenarioId: string) {
    this.scenarioId = scenarioId;
  }

  /**
   * Generate N virtual pousadas with realistic profiles
   */
  generate(count: number): VirtualPousada[] {
    const pousadas: VirtualPousada[] = [];
    
    for (let i = 0; i < count; i++) {
      const destination = randomItem(DESTINATIONS);
      const tipo = weightedRandom(POUSADA_TIPO_DISTRIBUTION).tipo;
      const plano = weightedRandom(PLANO_DISTRIBUTION).plano;
      const situacao = randomItem(POUSADA_SITUACOES);
      
      // Generate rooms and pricing based on type
      const { quartos, preco } = this.generateRoomProfile(tipo);
      
      // Generate amenities based on type
      const amenities = this.generateAmenities(tipo);
      
      // Generate active agents based on plan
      const agentesAtivos = this.generateActiveAgents(plano);
      
      // Generate trends keywords based on destination
      const trendsKeywords = this.generateTrendsKeywords(destination);
      
      // Generate operational metrics based on situation
      const { reservas, avaliacao, mesesAtivo, ocupacao } = this.generateOperationalMetrics(situacao, quartos);
      
      pousadas.push({
        id: generateId(),
        propertyId: `prop_${generateId()}`,
        nome: `${randomItem(POUSADA_PREFIXES)} ${randomItem(POUSADA_SUFIXES)}`,
        destino: destination.nome,
        estado: destination.estado,
        regiao: `${destination.regiao}_${destination.tipo}`,
        totalQuartos: quartos,
        quartosDisponiveis: Math.max(0, Math.round(quartos * (1 - ocupacao))),
        ocupacaoMedia: ocupacao,
        precoMedioDiaria: preco,
        plano,
        tipo,
        situacao,
        amenities,
        whatsapp: generatePhone(destination.ddd),
        email: `contato@pousada${i + 1}.com.br`,
        agentesAtivos,
        trendsKeywords,
        reservasMes: reservas,
        avaliacaoMedia: avaliacao,
        mesesAtivo: mesesAtivo,
        createdAt: new Date(),
        scenarioId: this.scenarioId,
      });
    }
    
    return pousadas;
  }

  private generateRoomProfile(tipo: PousadaTipo): { quartos: number; preco: number } {
    switch (tipo) {
      case "familia":
        return { quartos: randomInt(8, 20), preco: randomInt(200, 400) };
      case "romantico":
        return { quartos: randomInt(4, 12), preco: randomInt(350, 600) };
      case "eco":
        return { quartos: randomInt(6, 15), preco: randomInt(180, 350) };
      case "pet_friendly":
        return { quartos: randomInt(5, 10), preco: randomInt(200, 400) };
      case "luxo":
        return { quartos: randomInt(8, 25), preco: randomInt(500, 800) };
      case "historico":
        return { quartos: randomInt(6, 18), preco: randomInt(250, 450) };
      default:
        return { quartos: randomInt(6, 15), preco: randomInt(250, 400) };
    }
  }

  private generateAmenities(tipo: PousadaTipo): string[] {
    const allAmenities = [...AMENITIES_POOL];
    let count: number;
    let required: string[] = [];
    
    switch (tipo) {
      case "familia":
        count = randomInt(6, 12);
        required = ["piscina", "cafe_colonial", "estacionamento", "wifi"];
        break;
      case "romantico":
        count = randomInt(5, 10);
        required = ["wifi", "lareira", "vista_montanha", "jacuzzi"];
        break;
      case "eco":
        count = randomInt(4, 8);
        required = ["trilhas", "wifi", "jardim"];
        break;
      case "pet_friendly":
        count = randomInt(5, 9);
        required = ["pet_friendly", "estacionamento", "area_de_grande", "wifi"];
        break;
      case "luxo":
        count = randomInt(10, 16);
        required = ["piscina", "spa", "wifi", "servico_quarto", "roupa_cama_premium"];
        break;
      case "historico":
        count = randomInt(5, 10);
        required = ["wifi", "cafe_colonial", "estacionamento"];
        break;
      default:
        count = randomInt(5, 10);
        required = ["wifi"];
    }
    
    // Remove required items from pool, add them, then fill remainder
    const filtered = allAmenities.filter(a => !required.includes(a));
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const extra = shuffled.slice(0, count - required.length);
    
    return [...required, ...extra];
  }

  private generateActiveAgents(plano: PlanoZehla): ZCCAgent[] {
    const base: ZCCAgent[] = ["ZCC-WPP", "ZCC-RES", "ZCC-FIN"];
    
    switch (plano) {
      case "LITE":
        return base;
      case "PRO":
        return [...base, "ZCC-REV", "ZCC-MKT", "ZCC-ANA", "ZCC-SEC", "ZCC-HRD"];
      case "MAX":
        return ["ZCC-REV", "ZCC-MKT", "ZCC-WPP", "ZCC-ANA", "ZCC-FIN", "ZCC-RES", "ZCC-SEC", "ZCC-OPN", "ZCC-SWP", "ZCC-HRD"];
      default:
        return base;
    }
  }

  private generateTrendsKeywords(destination: Destination): string[] {
    const base = [`pousada em ${destination.nome}`];
    const extras: string[] = [];
    
    if (destination.tipo === "litoral") extras.push("praia", "mar");
    if (destination.tipo === "serra") extras.push("serra", "frio");
    if (destination.tipo === "historico") extras.push("historico", "cultura");
    if (destination.tipo === "natureza") extras.push("natureza", "aventura");
    
    const stateKeywords: Record<string, string> = {
      "RJ": "Rio de Janeiro", "SP": "Sao Paulo", "MG": "Minas Gerais",
      "BA": "Bahia", "CE": "Ceara", "SC": "Santa Catarina", "RS": "Rio Grande do Sul",
      "PE": "Pernambuco", "AL": "Alagoas", "RN": "Rio Grande do Norte",
      "MS": "Mato Grosso do Sul", "GO": "Goias", "MA": "Maranhao",
      "PA": "Para", "AM": "Amazonas", "ES": "Espirito Santo",
      "PR": "Parana", "MT": "Mato Grosso", "PB": "Paraiba",
      "PI": "Piaui", "SE": "Sergipe", "TO": "Tocantins",
      "RO": "Rondonia", "AC": "Acre", "AP": "Amapa", "RR": "Roraima", "DF": "Distrito Federal"
    };
    
    extras.push(stateKeywords[destination.estado] || destination.estado);
    extras.push("pousada feriado");
    extras.push("pousada fim de semana");
    
    return [...base, ...extras.filter((_, i) => Math.random() > 0.3)];
  }

  private generateOperationalMetrics(
    situacao: PousadaSituacao, 
    quartos: number
  ): { reservas: number; avaliacao: number; mesesAtivo: number; ocupacao: number } {
    switch (situacao) {
      case "nova":
        return { reservas: randomInt(5, 20), avaliacao: randomFloat(4.0, 5.0), mesesAtivo: randomInt(1, 3), ocupacao: randomFloat(0.20, 0.45) };
      case "consolidada":
        return { reservas: randomInt(50, 200), avaliacao: randomFloat(4.2, 4.9), mesesAtivo: randomInt(12, 48), ocupacao: randomFloat(0.55, 0.80) };
      case "alta_temporada":
        return { reservas: randomInt(100, 250), avaliacao: randomFloat(4.0, 4.8), mesesAtivo: randomInt(6, 36), ocupacao: randomFloat(0.85, 0.98) };
      case "baixa_temporada":
        return { reservas: randomInt(10, 40), avaliacao: randomFloat(3.8, 4.5), mesesAtivo: randomInt(6, 24), ocupacao: randomFloat(0.15, 0.35) };
      case "com_problemas":
        return { reservas: randomInt(15, 60), avaliacao: randomFloat(2.5, 3.8), mesesAtivo: randomInt(4, 18), ocupacao: randomFloat(0.25, 0.50) };
      default:
        return { reservas: randomInt(20, 80), avaliacao: randomFloat(3.5, 4.5), mesesAtivo: randomInt(3, 12), ocupacao: randomFloat(0.40, 0.65) };
    }
  }
}

export default PousadaFactory;
