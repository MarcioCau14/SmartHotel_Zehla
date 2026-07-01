interface PIIEntity {
  type: 'nome' | 'telefone' | 'email' | 'cpf' | 'cnpj' | 'cartao' | 'endereco' | 'pix';
  value: string;
  start: number;
  end: number;
}

const BRAZILIAN_NAMES = new Set([
  'joão', 'maria', 'josé', 'ana', 'carlos', 'francisco', 'antônio', 'pedro',
  'paulo', 'lucas', 'rafael', 'gabriel', 'marcos', 'felipe', 'bruno',
  'eduardo', 'rodrigo', 'andre', 'marcelo', 'thiago', 'silva', 'santos',
  'oliveira', 'souza', 'lima', 'pereira', 'costa', 'ferreira', 'almeida',
  'rodrigues', 'nascimento', 'araujo', 'ribeiro', 'carvalho', 'gomes',
]);

const patterns: Array<{ type: PIIEntity['type']; regex: RegExp }> = [
  { type: 'telefone', regex: /(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/g },
  { type: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { type: 'cpf', regex: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g },
  { type: 'cnpj', regex: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g },
  { type: 'cartao', regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
];

const LABELS: Record<PIIEntity['type'], string> = {
  nome: '[NOME]',
  telefone: '[TELEFONE]',
  email: '[EMAIL]',
  cpf: '[CPF]',
  cnpj: '[CNPJ]',
  cartao: '[CARTAO]',
  endereco: '[ENDERECO]',
  pix: '[PIX]',
};

function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  const calc = (slice: number, factor: number) => {
    let sum = 0;
    for (let i = 0; i < slice; i++) sum += parseInt(digits[i]) * (factor - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9, 10) === parseInt(digits[9]) && calc(10, 11) === parseInt(digits[10]);
}

function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const calc = (slice: number, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < slice; i++) sum += parseInt(digits[i]) * weights[i];
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  return calc(12, w1) === parseInt(digits[12]) && calc(13, w2) === parseInt(digits[13]);
}

function isValidLuhn(card: string): boolean {
  const digits = card.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectNames(text: string): PIIEntity[] {
  const entities: PIIEntity[] = [];
  const words = text.split(/\s+/);
  let offset = 0;
  for (const word of words) {
    const clean = word.replace(/[^a-záéíóúãõâêîôûçàèìòùäëïöüñA-ZÁÉÍÓÚÃÕÂÊÎÔÛÇÀÈÌÒÙÄËÏÖÜÑ]/g, '').toLowerCase();
    if (clean.length >= 2 && BRAZILIAN_NAMES.has(clean)) {
      const start = text.indexOf(word, offset);
      if (start !== -1) {
        entities.push({ type: 'nome', value: word, start, end: start + word.length });
      }
    }
    offset += word.length + 1;
  }
  return entities;
}

export const piiGuard = {
  detect(text: string): PIIEntity[] {
    const entities: PIIEntity[] = [];

    for (const { type, regex } of patterns) {
      let match: RegExpExecArray | null;
      const r = new RegExp(regex.source, 'g');
      while ((match = r.exec(text)) !== null) {
        let valid = true;
        if (type === 'cpf' && !isValidCPF(match[0])) valid = false;
        if (type === 'cnpj' && !isValidCNPJ(match[0])) valid = false;
        if (type === 'cartao' && !isValidLuhn(match[0])) valid = false;
        if (valid) {
          entities.push({ type, value: match[0], start: match.index, end: match.index + match[0].length });
        }
      }
    }

    entities.push(...detectNames(text));
    entities.sort((a, b) => a.start - b.start);
    return entities;
  },

  redact(text: string): string {
    const entities = this.detect(text);
    if (entities.length === 0) return text;

    let result = '';
    let last = 0;
    for (const entity of entities) {
      if (entity.start < last) continue;
      result += text.slice(last, entity.start);
      result += LABELS[entity.type];
      last = entity.end;
    }
    result += text.slice(last);
    return result;
  },

  restore(redacted: string, entities: PIIEntity[]): string {
    let result = redacted;
    for (const entity of entities) {
      result = result.replace(LABELS[entity.type], entity.value);
    }
    return result;
  },
};
