/**
 * ZEHLA SMARTHOTEL — QualityProxy Domain Service
 * Módulo: src/domain/decision/services/QualityProxy.ts
 */

import { TranscriptQualityScore, TESE7_WEIGHTS } from '../../crm/models/TranscriptQualityScore'

export interface QualityAssessment {
  readonly schemaScore: number;
  readonly formatScore: number;
  readonly sentimentScore: number;
  readonly keywordsScore: number;
  readonly hallucinationScore: number;
  readonly lengthScore: number;
  readonly finalScore: number;
}

export class QualityProxy {
  /**
   * Avalia uma resposta produzida em um determinado bucket semântico
   * utilizando 6 heurísticas estritas (<1ms, sem chamadas de rede/LLM).
   */
  assess(
    bucketId: string,
    responseText: string,
    inputText: string
  ): QualityAssessment {
    const schemaScore = this.evaluateSchema(bucketId, responseText);
    const formatScore = this.evaluateFormat(responseText);
    const sentimentScore = this.evaluateSentiment(bucketId, responseText, inputText);
    const keywordsScore = this.evaluateKeywords(bucketId, responseText);
    const hallucinationScore = this.evaluateHallucination(responseText);
    const lengthScore = this.evaluateLength(bucketId, responseText);

    // Pesos heurísticos ponderados por categoria
    let weights = {
      schema: 0.20,
      format: 0.15,
      sentiment: 0.15,
      keywords: 0.20,
      hallucination: 0.20,
      length: 0.10,
    };

    // Ajustes de pesos dinâmicos baseados no tipo do bucket
    // Buckets transacionais (como reservas, cobranças, reviews) que necessitam de JSON estruturado
    const isJsonBucket = ['09', '10', '11', '18', '25', '26'].includes(bucketId);
    if (isJsonBucket) {
      weights = {
        schema: 0.40,
        format: 0.10,
        sentiment: 0.10,
        keywords: 0.15,
        hallucination: 0.20,
        length: 0.05,
      };
    }

    const finalScore =
      schemaScore * weights.schema +
      formatScore * weights.format +
      sentimentScore * weights.sentiment +
      keywordsScore * weights.keywords +
      hallucinationScore * weights.hallucination +
      lengthScore * weights.length;

    return {
      schemaScore: Math.round(schemaScore * 100) / 100,
      formatScore: Math.round(formatScore * 100) / 100,
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      keywordsScore: Math.round(keywordsScore * 100) / 100,
      hallucinationScore: Math.round(hallucinationScore * 100) / 100,
      lengthScore: Math.round(lengthScore * 100) / 100,
      finalScore: Math.round(finalScore * 100) / 100,
    };
  }

  // 1. SCHEMA: Valida se a resposta atende à estrutura esperada.
  // Se for um bucket JSON, valida se o texto é um JSON sintaticamente válido.
  // Se vazar PII (CPF, telefone, email), schemaScore = 0 (dogma).
  private evaluateSchema(bucketId: string, text: string): number {
    const hasPII = this._detectPII(text);
    if (hasPII) return 0.0;

    const isJsonBucket = ['09', '10', '11', '18', '25', '26'].includes(bucketId);
    if (!isJsonBucket) {
      const clean = text.trim();
      if (clean.length < 5) return 0.0;
      return 1.0;
    }

    try {
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
      }
      JSON.parse(cleanedText);
      return 1.0;
    } catch (e) {
      return 0.0;
    }
  }

  // 2. FORMAT: Formatação WhatsApp amigável (ausência de cabeçalhos markdown h1/h2/h3 como "###",
  // uso correto de negritos e itálicos, ausência de bullet points brutos do markdown "- " se puder usar emojis, etc.).
  // Se vazar PII (CPF, telefone, email), formatScore = 0 (dogma).
  private evaluateFormat(text: string): number {
    const hasPII = this._detectPII(text);
    if (hasPII) return 0.0;

    let score = 1.0;

    // Detectar H1, H2, H3 markdown (###, ##, #)
    if (/(^|\n)(#{1,3}\s+)/.test(text)) {
      score -= 0.3;
    }

    // Detectar blocos de código markdown desnecessários (```) em texto normal
    if (text.includes('```') && !text.includes('{')) {
      score -= 0.2;
    }

    // Detectar bullet points brutos do markdown (ex: "* " ou "- ")
    if (/(^|\n)([\*\-]\s+)/.test(text)) {
      score -= 0.1;
    }

    // WhatsApp negritos devem fechar: e.g. *negrito*
    const boldCount = (text.match(/\*/g) || []).length;
    if (boldCount % 2 !== 0) {
      score -= 0.1;
    }

    const italicCount = (text.match(/_/g) || []).length;
    if (italicCount % 2 !== 0) {
      score -= 0.1;
    }

    return Math.max(0.0, score);
  }

  // 3. SENTIMENT: Empatia e adequação de tom em reclamações
  private evaluateSentiment(bucketId: string, text: string, inputText: string): number {
    const isComplaintBucket = ['13', '14', '15', '16', '17', '18', '19'].includes(bucketId);
    const isNegativeInput = /sujo|barulho|quebrado|ruim|pessimo|horrivel|decepcionado|atraso|cobranca/i.test(inputText);

    if (isComplaintBucket || isNegativeInput) {
      let score = 0.5;

      // Palavras de empatia obrigatórias em reclamações
      const empathyWords = ['desculpa', 'perdão', 'compreendo', 'sentimos', 'lamentamos', 'resolver', 'ajudar', 'suporte', 'entendo'];
      const empathyMatches = empathyWords.filter(word => text.toLowerCase().includes(word));
      score += empathyMatches.length * 0.15;

      // Termos defensivos ou rudes que diminuem a nota drasticamente
      const defensiveWords = ['erro seu', 'culpa', 'não podemos fazer nada', 'não é nossa responsabilidade', 'regulamento', 'infelizmente não'];
      const defensiveMatches = defensiveWords.filter(word => {
        if (word === 'culpa') {
          // Evitar falsos-positivos detectando "culpa" dentro de "desculpa" / "desculpas"
          return text.toLowerCase().includes('culpa') && !text.toLowerCase().includes('desculpa');
        }
        return text.toLowerCase().includes(word);
      });
      score -= defensiveMatches.length * 0.25;

      return Math.min(1.0, Math.max(0.0, score));
    }

    return 1.0;
  }

  // 4. KEYWORDS: Palavras-chave obrigatórias ou relevantes para o bucket semântico
  private evaluateKeywords(bucketId: string, text: string): number {
    const lowerText = text.toLowerCase();

    switch (bucketId) {
      case '00': // Horários
        return /horario|check-in|checkin|checkout|funcionamento|recepcao/i.test(lowerText) ? 1.0 : 0.4;
      case '01': // Localização
        return /endereco|localizacao|chegar|fica|onde|rua|estacionamento/i.test(lowerText) ? 1.0 : 0.4;
      case '05': // Preços
      case '08': // Negociação
        return /r\$|diaria|diarias|preco|valor|pix|cartao|orcamento/i.test(lowerText) ? 1.0 : 0.4;
      case '09': // Reserva nova
      case '10': // Modificação
        return /reserva|quarto|suite|confirmado|agendado|check-in/i.test(lowerText) ? 1.0 : 0.4;
      case '30': // Emergência médica
        return /medico|hospital|ajuda|socorro|emergencia|ambulancia/i.test(lowerText) ? 1.0 : 0.5;
      case '31': // Emergência segurança
        return /policia|seguranca|incendio|fogo|perigo|socorro/i.test(lowerText) ? 1.0 : 0.5;
      default:
        return 1.0;
    }
  }

  // 5. HALLUCINATION: Detecção de placeholders não preenchidos (ex: "[Nome do Hóspede]", "{{GuestName}}", "[insira aqui]")
  private evaluateHallucination(text: string): number {
    let score = 1.0;

    if (/\[[^\]]+\]/.test(text)) {
      score -= 0.4;
    }
    if (/\{\{[^\}]+\}\}/.test(text)) {
      score -= 0.4;
    }
    if (/\b(insira aqui|preencher|placeholder|exemplo)\b/i.test(text)) {
      score -= 0.2;
    }

    return Math.max(0.0, score);
  }

  // 6. LENGTH: Penaliza respostas fora do tamanho ideal do bucket
  private evaluateLength(bucketId: string, text: string): number {
    const len = text.length;

    if (['30', '31'].includes(bucketId)) {
      if (len > 300) return 0.5;
      if (len < 10) return 0.2;
      return 1.0;
    }

    if (['00', '01', '02', '03', '04', '12'].includes(bucketId)) {
      if (len > 800) return 0.4;
      if (len < 20) return 0.3;
      return 1.0;
    }

    if (['08', '13', '14', '15', '16', '17', '18', '19', '20'].includes(bucketId)) {
      if (len < 60) return 0.4;
      if (len > 2500) return 0.6;
      return 1.0;
    }

    return 1.0;
  }

  transcriptAssess(responseText: string): TranscriptQualityScore {
    const schemaScore = this.evaluateSchema('00', responseText);
    const formatScore = this.evaluateFormat(responseText);
    const sentimentScore = this.evaluateSentiment('00', responseText, '');
    const keywordsScore = this.evaluateKeywords('00', responseText);
    const hallucinationScore = this.evaluateHallucination(responseText);
    const lengthScore = this.evaluateLength('00', responseText);

    const result = TranscriptQualityScore.create({
      schemaScore, formatScore, sentimentScore, keywordsScore, hallucinationScore, lengthScore,
    });

    return result.isOk ? result.value : TranscriptQualityScore.create({
      schemaScore: 0, formatScore: 0, sentimentScore: 0, keywordsScore: 0, hallucinationScore: 0, lengthScore: 0,
    }).value! as TranscriptQualityScore;
  }

  private _detectPII(text: string): boolean {
    const cpfPattern = /\d{3}\.\d{3}\.\d{3}-\d{2}/;
    const phonePattern = /\(\d{2}\)\s*\d{4,5}-\d{4}/;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    return cpfPattern.test(text) || phonePattern.test(text) || emailPattern.test(text);
  }
}
