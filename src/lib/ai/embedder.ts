/**  
 * TF-IDF Embedder Local — Geração de Embeddings sem API externa  
 *  
 * Implementação completa de TF-IDF (Term Frequency–Inverse Document Frequency)  
 * para vetores de similaridade semântica, 100% local, sem dependência de  
 * serviços de embedding pagos.  
 *  
 * Funciona assim:  
 * 1. Coleta todo o vocabulário do conhecimento do tenant  
 * 2. Calcula IDF (Inverse Document Frequency) para cada termo  
 * 3. Para cada documento + query, calcula TF-IDF vector  
 * 4. Compara via similaridade de cosseno  
 *  
 * Vantagens:  
 * - Zero custo, zero latência de rede  
 * - Funciona offline  
 * - Adequado para bases de conhecimento pequenas (<500 entradas)  
 * - Captura relevância temática em português  
 */

import { db } from '@/lib/db';

// ── Stopwords em português ───────────────────────────────────────────

const PORTUGUESE_STOPWORDS = new Set([  
  'a', 'o', 'e', 'é', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na',  
  'nos', 'nas', 'um', 'uma', 'uns', 'umas', 'que', 'se', 'por', 'para',  
  'com', 'não', 'não', 'sim', 'ao', 'aos', 'à', 'às', 'ou', 'ser', 'ter',  
  'seu', 'sua', 'seus', 'suas', 'este', 'esta', 'estes', 'estas', 'esse',  
  'essa', 'esses', 'essas', 'isto', 'isso', 'aquilo', 'meu', 'minha',  
  'teu', 'tua', 'nosso', 'nossa', 'dele', 'dela', 'deles', 'delas',  
  'quem', 'onde', 'quando', 'como', 'quanto', 'qual', 'quais', 'porque',  
  'por que', 'também', 'já', 'só', 'muito', 'mais', 'menos', 'bem',  
  'mal', 'aqui', 'ali', 'lá', 'cá', 'então', 'mas', 'porém', 'contudo',  
  'todavia', 'porém', 'ainda', 'assim', 'pois', 'porque', ' portanto',  
  'conforme', 'segundo', 'durante', 'mediante', 'perante', 'sob', 'sobre',  
  'até', 'após', 'ante', 'desde', 'entre', 'sem', 'via', 'ante',  
  'fosse', 'seria', 'pode', 'podem', 'poder', 'dever', 'deve', 'devem',  
  'estar', 'está', 'estão', 'esteve', 'estava', 'havendo', 'haver',  
  'foi', 'foram', 'tive', 'tinha', 'tem', 'têm', 'ter', 'tinha',  
  'fazer', 'faz', 'feito', 'dar', 'dado', 'dizer', 'dito', 'ir',  
  'saber', 'sabe', 'quer', 'quero', 'queremos', 'você', 'eu', 'ele',  
  'ela', 'eles', 'elas', 'nos', 'nós', 'todo', 'toda', 'todos', 'todas',  
  'outro', 'outra', 'outros', 'outras', 'mesmo', 'mesma', 'próprio',  
  'cada', 'qualquer', 'nenhum', 'nenhuma', 'algum', 'alguma', 'pouco',  
  'muita', 'grande', 'pequeno', 'bom', 'boa', 'bem', 'mau', 'ruim',  
  'dia', 'noite', 'hoje', 'agora', 'sempre', 'nunca', 'jamais',  
  'tá', 'pra', 'pro', 'tô', 'vc', 'tb', 'td', 'blz', 'ok',  
  'hey', 'oi', 'olá', 'ola', 'bom', 'dia', 'tarde', 'noite',  
  'obrigado', 'obrigada', 'obg', 'vlw', 'valeu', 'thanks',  
]);

// ── Tokenização ──────────────────────────────────────────────────────

/**  
 * Tokeniza texto em português: lowercase, remove pontuação, stopwords.  
 * Retorna array de termos relevantes.  
 */  
export function tokenize(text: string): string[] {  
  return text  
    .toLowerCase()  
    // Normaliza acentos (mantém, pois TF-IDF usa comparação exata)  
    .replace(/[^\w\sáàâãéèêíïóôõúüçñ]/g, ' ')  
    .split(/\s+/)  
    .filter(word => word.length > 2 && !PORTUGUESE_STOPWORDS.has(word));  
}

// ── TF-IDF Engine ────────────────────────────────────────────────────

/** Vocabulário: termo → índice no vetor */  
type Vocabulary = Map<string, number>;

/** Vetor TF-IDF como array de números */  
export type TfidfVector = number[];

/** Documento tokenizado */  
interface TokenizedDoc {  
  id: string;  
  tokens: string[];  
}

/**  
 * Constrói o vocabulário a partir de uma lista de documentos tokenizados.  
 * Cada termo único recebe um índice sequencial.  
 */  
function buildVocabulary(documents: TokenizedDoc[]): Vocabulary {  
  const vocab = new Map<string, number>();  
  let idx = 0;  
  for (const doc of documents) {  
    for (const token of doc.tokens) {  
      if (!vocab.has(token)) {  
        vocab.set(token, idx++);  
      }  
    }  
  }  
  return vocab;  
}

/**  
 * Calcula IDF para cada termo do vocabulário.  
 * IDF(t) = log(N / df(t)) onde df(t) = número de documentos que contêm t.  
 */  
function computeIDF(documents: TokenizedDoc[], vocab: Vocabulary): Float64Array {  
  const N = documents.length;  
  const idf = new Float64Array(vocab.size);

  // Contar df (document frequency) para cada termo  
  const df = new Float64Array(vocab.size);  
  for (const doc of documents) {  
    const seen = new Set<number>();  
    for (const token of doc.tokens) {  
      const idx = vocab.get(token);  
      if (idx !== undefined && !seen.has(idx)) {  
        df[idx]++;  
        seen.add(idx);  
      }  
    }  
  }

  // Calcular IDF com suavização (+1 no denominador para evitar divisão por zero)  
  for (let i = 0; i < vocab.size; i++) {  
    idf[i] = Math.log((N + 1) / (df[i] + 1)) + 1;  
  }

  return idf;  
}

/**  
 * Calcula o vetor TF-IDF para um documento.  
 */  
function computeTFIDF(tokens: string[], vocab: Vocabulary, idf: Float64Array): TfidfVector {  
  const vector = new Float64Array(vocab.size);

  // Contar term frequency  
  const tf = new Map<string, number>();  
  for (const token of tokens) {  
    tf.set(token, (tf.get(token) || 0) + 1);  
  }

  // Normalizar TF e multiplicar por IDF  
  const maxTf = Math.max(...tf.values(), 1); // normalização max-TF  
  for (const [term, count] of tf) {  
    const idx = vocab.get(term);  
    if (idx !== undefined) {  
      vector[idx] = (0.5 + 0.5 * (count / maxTf)) * idf[idx];  
    }  
  }

  return Array.from(vector);  
}

// ── Similaridade de Cosseno ──────────────────────────────────────────

/**  
 * Calcula similaridade de cosseno entre dois vetores.  
 * Retorna valor entre -1 e 1 (para vetores TF-IDF, sempre 0 a 1).  
 */  
export function cosineSimilarity(vecA: TfidfVector, vecB: TfidfVector): number {  
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;  
  let normA = 0;  
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {  
    dotProduct += vecA[i] * vecB[i];  
    normA += vecA[i] * vecA[i];  
    normB += vecB[i] * vecB[i];  
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);  
  return denom === 0 ? 0 : dotProduct / denom;  
}

// ── API Pública ──────────────────────────────────────────────────────

export interface TfidfEngine {  
  /** Calcula similaridade entre a query e todos os documentos */  
  search(query: string, topK?: number, minScore?: number): Array<{  
    id: string;  
    score: number;  
  }>;  
  /** Gera e retorna o embedding (vetor TF-IDF) para um texto */  
  embed(text: string): TfidfVector;  
  /** Retorna o vocabulário atual */  
  getVocabSize(): number;  
}

/**  
 * Cria uma engine TF-IDF a partir de documentos do banco de conhecimento.  
 *  
 * @param entries - Array de KnowledgeEntry com campo `embeddingJson` preenchido (ou não)  
 */  
export function createTfidfEngine(  
  entries: Array<{ id: string; question: string; answer: string; embeddingJson?: string }>,  
): TfidfEngine {  
  // Combinar question + answer para formar o documento  
  const documents: TokenizedDoc[] = entries.map(entry => ({  
    id: entry.id,  
    tokens: tokenize(`${entry.question} ${entry.answer}`),  
  }));

  const vocab = buildVocabulary(documents);  
  const idf = computeIDF(documents, vocab);

  // Cache de vetores dos documentos  
  const docVectors = new Map<string, TfidfVector>();  
  for (let i = 0; i < documents.length; i++) {  
    const vec = computeTFIDF(documents[i].tokens, vocab, idf);  
    docVectors.set(documents[i].id, vec);  
  }

  return {  
    search(query: string, topK = 5, minScore = 0.1): Array<{ id: string; score: number }> {  
      const queryTokens = tokenize(query);  
      const queryVector = computeTFIDF(queryTokens, vocab, idf);

      if (queryTokens.length === 0) return [];

      // Calcular similaridade com todos os documentos  
      const scored: Array<{ id: string; score: number }> = [];  
      for (const [id, docVec] of docVectors) {  
        const score = cosineSimilarity(queryVector, docVec);  
        if (score >= minScore) {  
          scored.push({ id, score });  
        }  
      }

      // Ordenar por score descendente e retornar top-K  
      return scored  
        .sort((a, b) => b.score - a.score)  
        .slice(0, topK);  
    },

    embed(text: string): TfidfVector {  
      const tokens = tokenize(text);  
      return computeTFIDF(tokens, vocab, idf);  
    },

    getVocabSize(): number {  
      return vocab.size;  
    },  
  };  
}

/**  
 * Gera e persiste embeddings TF-IDF para todas as KnowledgeEntries de um tenant.  
 * Deve ser chamado quando o dono da pousada salva/edita o conhecimento.  
 */  
export async function regenerateEmbeddings(tenantId: string): Promise<number> {  
  const entries = await db.knowledgeEntry.findMany({  
    where: { tenantId },  
    select: { id: true, question: true, answer: true },  
  });

  if (entries.length === 0) return 0;

  // Criar engine TF-IDF  
  const documents = entries.map(e => ({  
    id: e.id,  
    question: e.question,  
    answer: e.answer,  
  }));  
  const engine = createTfidfEngine(documents);

  // Gerar e persistir embeddings  
  let count = 0;  
  for (const entry of entries) {  
    const vector = engine.embed(`${entry.question} ${entry.answer}`);  
    const json = JSON.stringify(vector);  
    await db.knowledgeEntry.update({  
      where: { id: entry.id },  
      data: { embeddingJson: json },  
    });  
    count++;  
  }

  return count;  
}  
