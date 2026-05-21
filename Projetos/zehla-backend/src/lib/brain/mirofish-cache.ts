import { redisAI } from '@/lib/redis';
import crypto from 'crypto';

/**
 * MIROFISH — Semantic Cache for WhatsApp AI Responses
 *
 * Architecture:
 * 1. Normalize + hash incoming message → Redis key
 * 2. Check for exact match first (O(1))
 * 3. Check for similar matches via tag-based grouping
 * 4. TTL: 7 days for FAQ, 24h for contextual responses
 *
 * Phase 1: Hash-based exact match + keyword similarity
 * Phase 2: Vector embeddings (when Redis Stack is available)
 *
 * Scale: Designed for 100K+ messages/day across 100+ tenants
 */

interface CacheEntry {
  content: string;
  tenantId: string;
  intent: string;
  confidence: number;
  tokenCount: number;
  createdAt: number;
  hitCount: number;
}

interface CacheResult {
  content: string;
  confidence: number;
  source: 'EXACT' | 'SIMILAR' | 'MISS';
}

const CACHE_TTL_FAQ = 7 * 24 * 60 * 60; // 7 days
const CACHE_TTL_CONTEXTUAL = 24 * 60 * 60; // 24 hours
const CACHE_KEY_PREFIX = 'mirofish:';
const CACHE_INDEX_PREFIX = 'mirofish_idx:';

/**
 * Normalize message for consistent hashing
 */
function normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .trim()
    .replace(/[^\w\sàáâãéêíóôõúüç]/gi, '')
    .replace(/\s+/g, ' ')
    .slice(0, 500);
}

/**
 * Generate deterministic hash for a message
 */
function hashMessage(message: string): string {
  const normalized = normalizeMessage(message);
  return crypto.createHash('md5').update(normalized).digest('hex');
}

/**
 * Extract keywords for similarity matching
 */
function extractKeywords(message: string): string[] {
  const normalized = normalizeMessage(message);
  const stopWords = new Set([
    'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem',
    'que', 'e', 'ou', 'se', 'mas', 'como', 'nao', 'não', 'sim',
    'qual', 'quais', 'quando', 'onde', 'quanto', 'tem', 'ter',
    'eu', 'tu', 'ele', 'ela', 'nos', 'voces', 'me', 'te', 'se',
    'é', 'foi', 'ser', 'estar', 'ter', 'haver', 'fazer', 'ir',
    'bom', 'dia', 'boa', 'noite', 'tarde', 'oi', 'ola', 'obrigado',
  ]);

  return normalized
    .split(' ')
    .filter(w => w.length > 2 && !stopWords.has(w));
}

/**
 * Search for cached response
 * First tries exact match, then falls back to keyword similarity
 */
export async function searchSimilar(tenantId: string, message: string): Promise<CacheResult | null> {
  try {
    // 1. Exact match (O(1))
    const hash = hashMessage(message);
    const key = `${CACHE_KEY_PREFIX}${tenantId}:${hash}`;
    const cached = await redisAI.get(key);

    if (cached) {
      const entry: CacheEntry = JSON.parse(cached);
      // Increment hit count for popularity tracking
      await redisAI.hincrby(`${CACHE_INDEX_PREFIX}${tenantId}:hits`, hash, 1);
      return {
        content: entry.content,
        confidence: 1.0,
        source: 'EXACT',
      };
    }

    // 2. Keyword-based similarity (Phase 1)
    const keywords = extractKeywords(message);
    if (keywords.length >= 2) {
      const indexKey = `${CACHE_INDEX_PREFIX}${tenantId}:keywords`;
      const indexData = await redisAI.hgetall(indexKey);

      let bestMatch: { hash: string; score: number } | null = null;

      for (const [keywordHash, keywordEntry] of Object.entries(indexData)) {
        const entry: { keywords: string[]; messageHash: string } = JSON.parse(keywordEntry);
        const matchCount = keywords.filter(k => entry.keywords.includes(k)).length;
        const similarity = matchCount / Math.max(keywords.length, entry.keywords.length);

        if (similarity > 0.7 && (!bestMatch || similarity > bestMatch.score)) {
          bestMatch = { hash: entry.messageHash, score: similarity };
        }
      }

      if (bestMatch && bestMatch.score > 0.7) {
        const contentKey = `${CACHE_KEY_PREFIX}${tenantId}:${bestMatch.hash}`;
        const contentCached = await redisAI.get(contentKey);
        if (contentCached) {
          const entry: CacheEntry = JSON.parse(contentCached);
          return {
            content: entry.content,
            confidence: bestMatch.score * 0.95,
            source: 'SIMILAR',
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[MiroFish] Search error:', error);
    return null;
  }
}

/**
 * Save response to cache
 */
export async function save(
  tenantId: string,
  message: string,
  response: string,
  intent: string = 'UNKNOWN',
  tokenCount: number = 0
): Promise<void> {
  try {
    const hash = hashMessage(message);
    const key = `${CACHE_KEY_PREFIX}${tenantId}:${hash}`;
    const keywords = extractKeywords(message);

    const isFaq = ['check_in', 'check_out', 'amenities', 'local_info', 'cancellation_policy', 'payment_methods'].includes(intent);
    const ttl = isFaq ? CACHE_TTL_FAQ : CACHE_TTL_CONTEXTUAL;

    const entry: CacheEntry = {
      content: response,
      tenantId,
      intent,
      confidence: 1.0,
      tokenCount,
      createdAt: Date.now(),
      hitCount: 0,
    };

    await redisAI.set(key, JSON.stringify(entry), 'EX', ttl);

    // Index by keywords for similarity search
    if (keywords.length >= 2) {
      const indexKey = `${CACHE_INDEX_PREFIX}${tenantId}:keywords`;
      await redisAI.hset(indexKey, hash, JSON.stringify({ keywords, messageHash: hash }));
      await redisAI.expire(indexKey, ttl);
    }

    // Track in tenant index
    await redisAI.sadd(`${CACHE_INDEX_PREFIX}${tenantId}:entries`, hash);
    await redisAI.expire(`${CACHE_INDEX_PREFIX}${tenantId}:entries`, ttl);
  } catch (error) {
    console.error('[MiroFish] Save error:', error);
  }
}

/**
 * Clear all cache for a tenant (invalidation on settings change)
 */
export async function clearTenantCache(tenantId: string): Promise<void> {
  try {
    const entriesKey = `${CACHE_INDEX_PREFIX}${tenantId}:entries`;
    const entries = await redisAI.smembers(entriesKey);

    const keysToDelete = entries.map(hash => `${CACHE_KEY_PREFIX}${tenantId}:${hash}`);
    if (keysToDelete.length > 0) {
      await redisAI.del(...keysToDelete);
    }

    await redisAI.del(
      entriesKey,
      `${CACHE_INDEX_PREFIX}${tenantId}:keywords`,
      `${CACHE_INDEX_PREFIX}${tenantId}:hits`
    );

    console.log(`[MiroFish] Cache cleared for tenant ${tenantId} (${entries.length} entries removed)`);
  } catch (error) {
    console.error('[MiroFish] Clear error:', error);
  }
}

/**
 * Get cache statistics for a tenant
 */
export async function getStats(tenantId: string): Promise<{
  totalEntries: number;
  totalHits: number;
  hitRate: number;
  topEntries: Array<{ hash: string; hits: number; intent: string }>;
}> {
  try {
    const entriesKey = `${CACHE_INDEX_PREFIX}${tenantId}:entries`;
    const hitsKey = `${CACHE_INDEX_PREFIX}${tenantId}:hits`;

    const entries = await redisAI.smembers(entriesKey);
    const hits = await redisAI.hgetall(hitsKey);

    const totalHits = Object.values(hits).reduce((sum, h) => sum + parseInt(h || '0'), 0);
    const totalRequests = entries.length + totalHits;
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;

    const topEntries = entries
      .map(hash => ({
        hash,
        hits: parseInt(hits[hash] || '0'),
      }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    return {
      totalEntries: entries.length,
      totalHits,
      hitRate,
      topEntries: topEntries.map(e => ({ ...e, intent: 'UNKNOWN' })),
    };
  } catch (error) {
    console.error('[MiroFish] Stats error:', error);
    return { totalEntries: 0, totalHits: 0, hitRate: 0, topEntries: [] };
  }
}
