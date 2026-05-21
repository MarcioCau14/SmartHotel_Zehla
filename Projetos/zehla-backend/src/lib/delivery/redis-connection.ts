import IORedis from 'ioredis';

const BASE_REDIS_URL = process.env.REDIS_URL;
const isDev = process.env.NODE_ENV === 'development';

export let redisConfig: Record<string, unknown>;

if (BASE_REDIS_URL) {
  const parsed = new URL(BASE_REDIS_URL);
  redisConfig = {
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379'),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    tls: parsed.protocol === 'rediss:' ? {} as Record<string, unknown> : undefined,
  };
} else {
  redisConfig = { host: 'localhost', port: 6379 };
}

const connectionConfig = {
  ...redisConfig,
  maxRetriesPerRequest: isDev ? 0 : null,
  retryStrategy(times: number) {
    if (isDev) return null;
    return Math.min(times * 50, 2000);
  },
};

let redis: any;

try {
  const realRedis = new IORedis(connectionConfig);

  if (isDev) {
    const silentHandler = {
      get: (target: any, prop: string) => {
        const value = target[prop];
        if (typeof value === 'function') {
          return (...args: any[]) => {
            return value.apply(target, args).catch((err: any) => {
              if (err.code === 'ECONNREFUSED' || err.message.includes('max retries')) {
                return null;
              }
              throw err;
            });
          };
        }
        return value;
      }
    };
    redis = new Proxy(realRedis, silentHandler);
  } else {
    redis = realRedis;
  }

  redis.on('error', (err: any) => {
    if (isDev) {
      // Silencioso em dev — módulo delivery não é crítico para desenvolvimento
    } else {
      console.error('❌ [REDIS-DELIVERY] Erro:', err.message);
    }
  });

} catch (e) {
  redis = {
    on: () => {},
    get: async () => null,
    set: async () => 'OK',
    quit: async () => 'OK',
    disconnect: () => {},
  };
}

export { redis };
