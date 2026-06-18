// In-memory Redis mock for secretaria-ai standalone (zero external deps)
const store = new Map<string, string>()

function createMockRedis() {
  return {
    get: async (key: string) => store.get(key) || null,
    set: async (key: string, value: string) => { store.set(key, value); return 'OK' },
    setex: async (key: string, _ttl: number, value: string) => { store.set(key, value); return 'OK' },
    incr: async (key: string) => { const v = (parseInt(store.get(key) || '0') + 1); store.set(key, String(v)); return v },
    expire: async (_key: string, _ttl: number) => 1,
    xadd: async () => 'OK',
    xread: async () => null,
    keys: async () => Array.from(store.keys()),
    del: async (key: string) => { store.delete(key); return 1 },
    hget: async () => null,
    hset: async () => 1,
    hgetall: async () => ({}),
    on: () => {},
    disconnect: () => {},
    quit: async () => 'OK',
  }
}

export const redisSession = createMockRedis()
export const redisWorker = createMockRedis()
export const redisAI = createMockRedis()
export const redis = redisSession
