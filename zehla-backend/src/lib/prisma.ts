import { PrismaClient } from '@prisma/client'
import { detectCanary } from './security/canary-detector'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const basePrisma = globalForPrisma.prisma || new PrismaClient()

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const result = await query(args)
        
        // Detecção de Canary (Honeypot)
        if (['findUnique', 'findFirst', 'findMany'].includes(operation)) {
          detectCanary(result, model, operation)
        }
        
        return result
      },
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma
