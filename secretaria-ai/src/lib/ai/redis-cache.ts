import { CacheEntry, CacheStats } from './semantic-cache';

interface RedisCacheConfig {
  enabled: boolean;
  url: string;
  token: string;
  defaultTtlMs: number;
  localFallbackMaxSize: number;
}

const DEFAULT_CONFIG: RedisCacheConfig = {
  enabled: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  url: process.env.UPSTASH_REDIS_REST_URL ?? '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
  defaultTtlMs: 3_600_000,
  localFallbackMaxSize: 500,
};

export class RedisSemanticCache {
  private config: RedisCacheConfig;
  private localCache: Map<string, CacheEntry>;
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private expirations = 0;

  constructor(config: Partial<RedisCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.localCache = new Map();
  }

  async get<T = string>(key: string): Promise<CacheEntry<T> | null> {
    const now = Date.now();

    if (this.config.enabled) {
      try {
        const entry = await this.redisGet<T>(key);
        if (entry) {
          if (now - entry.createdAt > entry.ttlMs) {
            this.expirations++;
            this.misses++;
            await this.redisDel(key);
            return null;
          }
          this.hits++;
          return entry;
        }
      } catch {
        // Redis unavailable — fall through to local cache
      }
    }

    const local = this.localCache.get(key);
    if (local) {
      if (now - local.createdAt > local.ttlMs) {
        this.localCache.delete(key);
        this.expirations++;
        this.misses++;
        return null;
      }
      this.hits++;
      return local as CacheEntry<T>;
    }

    this.misses++;
    return null;
  }

  async set<T = string>(
    key: string,
    value: T,
    inputTokens: number,
    outputTokens: number,
    provider: string,
    ttlMs?: number,
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      value,
      inputTokens,
      outputTokens,
      createdAt: Date.now(),
      ttlMs: ttlMs ?? this.config.defaultTtlMs,
      provider,
    };

    if (this.config.enabled) {
      try {
        await this.redisSet(key, entry, ttlMs);
      } catch {
        // Redis unavailable — fall through to local cache
      }
    }

    while (this.localCache.size >= this.config.localFallbackMaxSize) {
      this.evictLRU();
    }
    this.localCache.set(key, entry as unknown as CacheEntry);
  }

  async invalidate(key: string): Promise<boolean> {
    const existed = this.localCache.delete(key);
    if (this.config.enabled) {
      try {
        await this.redisDel(key);
      } catch { /* ignore */ }
    }
    return existed;
  }

  async invalidateByPrefix(prefix: string): Promise<number> {
    let count = 0;
    Array.from(this.localCache.keys()).forEach(key => {
      if (key.startsWith(prefix)) {
        this.localCache.delete(key);
        count++;
      }
    });
    if (this.config.enabled) {
      try {
        const keys = await this.redisScan(prefix);
        for (const key of keys) {
          await this.redisDel(key);
          count++;
        }
      } catch { /* ignore */ }
    }
    return count;
  }

  clear(): void {
    this.localCache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.expirations = 0;
  }

  stats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.localCache.size,
      maxSize: this.config.localFallbackMaxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? Math.round((this.hits / total) * 10_000) / 10_000 : 0,
      evictions: this.evictions,
      expirations: this.expirations,
    };
  }

  async purgeExpired(): Promise<number> {
    const now = Date.now();
    let purged = 0;
    Array.from(this.localCache.entries()).forEach(([key, entry]) => {
      if (now - entry.createdAt > entry.ttlMs) {
        this.localCache.delete(key);
        purged++;
        this.expirations++;
      }
    });
    return purged;
  }

  get size(): number {
    return this.localCache.size;
  }

  private async redisGet<T>(key: string): Promise<CacheEntry<T> | null> {
    const response = await fetch(`${this.config.url}/get/${key}`, {
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
    if (!response.ok) return null;
    const data = await response.json() as { result: string | null };
    if (!data.result) return null;
    return JSON.parse(data.result) as CacheEntry<T>;
  }

  private async redisSet(key: string, entry: CacheEntry<any>, ttlMs?: number): Promise<void> {
    const ttl = ttlMs ?? this.config.defaultTtlMs;
    const ttlSeconds = Math.ceil(ttl / 1000);
    await fetch(`${this.config.url}/set/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.token}`,
      },
      body: JSON.stringify(JSON.stringify(entry), null, undefined),
    });
    await fetch(`${this.config.url}/expire/${key}/${ttlSeconds}`, {
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
  }

  private async redisDel(key: string): Promise<void> {
    await fetch(`${this.config.url}/del/${key}`, {
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
  }

  private async redisScan(pattern: string): Promise<string[]> {
    const response = await fetch(`${this.config.url}/keys/${pattern}*`, {
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
    if (!response.ok) return [];
    const data = await response.json() as { result: string[] };
    return data.result ?? [];
  }

  private evictLRU(): void {
    const firstKey = this.localCache.keys().next().value;
    if (firstKey !== undefined) {
      this.localCache.delete(firstKey);
      this.evictions++;
    }
  }
}
