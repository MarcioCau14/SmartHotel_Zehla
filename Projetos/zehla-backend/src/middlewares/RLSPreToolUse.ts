import { PrismaClient } from '@prisma/client'


/**
 * Middleware de Segurança (Layer 3 - Hooks): RLS PreToolUse
 * Garante o Dogma 1 do ZAOS: O banco deve operar em contexto isolado (Soberania Multi-Tenant).
 * Injeta "SET LOCAL app.current_property_id = 'UUID'" através de uma transação antes 
 * da execução de queries sensíveis.
 */
export const createRLSClient = (prisma: PrismaClient, propertyId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Encapsula toda a operação em uma transação para garantir 
          // que o SET LOCAL ocorra exatamente na conexão onde a query rodará.
          return prisma.$transaction(async (tx) => {
            // 1. Aplica a variável de sessão PostgreSQL para o RLS desta conexão
            await tx.$executeRawUnsafe(`SET LOCAL app.current_property_id = '${propertyId}';`);
            
            // 2. Executa a query dentro do contexto restrito
            return query(args);
          });
        },
      },
    },
  });
}
