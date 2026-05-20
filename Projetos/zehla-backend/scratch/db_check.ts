import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT 1`
    
    process.exit(0)
  } catch (error) {
    console.error('Database connection: FAILED')
    console.error(error)
    process.exit(1)
  }
}

main()
