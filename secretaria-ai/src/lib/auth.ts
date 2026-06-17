import { auth } from '@clerk/nextjs/server';
import prisma from '../../prisma/db';
import { redirect } from 'next/navigation';

/**
 * Utilitário de segurança Zélla para garantir Isolamento de Tenant (Pousada)
 * Retorna o tenantId do usuário atual ou redireciona se não autorizado.
 */
export async function requireTenant() {
  const { userId, orgId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  if (!orgId) {
    // Se o usuário não pertence a nenhuma organização (Pousada)
    redirect('/organization-selection');
  }

  // Busca o Tenant no banco de dados correspondente à Organização do Clerk
  const tenant = await prisma.tenant.findUnique({
    where: { clerkOrgId: orgId },
  });

  if (!tenant) {
    // Opcional: Criar o tenant automaticamente caso seja o primeiro login da Org
    const newTenant = await prisma.tenant.create({
      data: {
        name: 'Minha Pousada', // Nome placeholder, ideal é pegar via webhook
        clerkOrgId: orgId,
      }
    });
    return newTenant.id;
  }

  return tenant.id;
}

/**
 * Middleware para robôs do Zélla Loop Engine acessarem a API
 * Verifica se a requisição tem o token do robô.
 */
export function verifyRobotToken(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.split(' ')[1];
  return token === process.env.ZEHLA_LOOP_API_KEY;
}
