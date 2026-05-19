
import Redis from 'ioredis'

const redis = new Redis("redis://localhost:6379")

async function main() {
  try {
    const result = await redis.ping()
    console.log('Redis connection: SUCCESS', result)
    process.exit(0)
  } catch (error) {
    console.error('Redis connection: FAILED')
    console.error(error)
    process.exit(1)
  }
}

main()
