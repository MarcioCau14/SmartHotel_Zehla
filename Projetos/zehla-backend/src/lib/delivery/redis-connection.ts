import IORedis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const isDev = process.env.NODE_ENV === 'development';

export const redisConfig = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: isDev ? 0 : null,
  retryStrategy(times: number) {
    if (isDev) return null;
    return Math.min(times * 50, 2000);
  },
};

let redis: any;

try {
  const realRedis = new IORedis(redisConfig);

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
    if (isDev && (err.code === 'ECONNREFUSED' || err.message.includes('max retries'))) {
      // Silencioso em dev
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
