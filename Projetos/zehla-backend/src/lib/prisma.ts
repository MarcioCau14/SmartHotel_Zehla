import { PrismaClient, Prisma } from '@prisma/client'
import { detectCanary } from './security/canary-detector'
import { getTenantId } from './security/tenant-context'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const basePrisma = globalForPrisma.prisma || new PrismaClient()

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const tenantId = await getTenantId()
        const isWhereOp = ['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy',
          'update', 'updateMany', 'delete', 'deleteMany', 'upsert'].includes(operation);

        // --- CAMADA 1: ISOLAMENTO MILITARIZADO (MULTI-TENANT DINÂMICO) ---
        if (tenantId && isWhereOp) {
          (args as any).where = { ...((args as any).where || {}), propertyId: tenantId };
        }

        // Proteção Extra: Criar sempre com tenant
        if (tenantId && (operation === 'create' || operation === 'createMany')) {
          const createArgs = args as any;
          if (Array.isArray(createArgs.data)) {
            createArgs.data = createArgs.data.map((item: any) => ({ ...item, propertyId: tenantId }));
          } else {
            createArgs.data = { ...createArgs.data, propertyId: tenantId };
          }
        }

        // --- CAMADA 2: BUNKER FINANCEIRO (WORM - Write Once Read Many) ---
        const immutableModels = ['FinancialAudit', 'PaymentAudit'];
        if (immutableModels.includes(model) && ['update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
          throw new Error(`🚨 [ZEHLA FORTRESS] Tentativa de alteração em registro imutável: ${model}. Operação bloqueada.`);
        }

        // --- CAMADA 3: LEAD CANARY (HONEYPOT) ---
        if (model === 'Lead' && ['findMany', 'findFirst'].includes(operation)) {
           const findArgs = args as any;
           if (!findArgs.where?.isCanary) {
             findArgs.where = { ...findArgs.where, isCanary: false };
           }
        }

        try {
          const result = await query(args);
          
          // --- CAMADA 4: AUDITORIA DE CANÁRIO ---
          if (['findUnique', 'findFirst', 'findMany'].includes(operation)) {
            detectCanary(result, model, operation);
          }
          
          return result;
        } catch (e) {
          // Se o model não tiver propertyId, remove e tenta de novo
          if (tenantId && isWhereOp && e instanceof Prisma.PrismaClientValidationError &&
              e.message.includes('propertyId')) {
            delete (args as any).where.propertyId;
            const result = await query(args);
            if (['findUnique', 'findFirst', 'findMany'].includes(operation)) {
              detectCanary(result, model, operation);
            }
            return result;
          }
          throw e;
        }
      },
    },
  },
})

globalForPrisma.prisma = basePrisma
