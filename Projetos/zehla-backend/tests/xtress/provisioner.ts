import { PrismaClient } from '@prisma/client';
import { VirtualPousada } from './types';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const prisma = new PrismaClient();

/**
 * Provisioner — Sincroniza as Pousadas Virtuais com o Banco de Dados Real
 * Garante que o ZEHLA Brain reconheça os tenantIds durante o teste de estresse.
 */
export class Provisioner {
  
  static async provision(pousadas: VirtualPousada[]) {
    console.log(`  [Provisioner] Sincronizando ${pousadas.length} pousadas com o banco real...`);
    
    // Pegar um ID de usuário real para associar as pousadas
    const user = await prisma.user.findFirst();
    if (!user) throw new Error("Nenhum usuário encontrado no banco real para associar pousadas.");

    for (const p of pousadas) {
      await prisma.property.upsert({
        where: { id: p.propertyId },
        update: {
          plan: p.plano as any,
          status: 'ACTIVE',
          isTrial: true
        },
        create: {
          id: p.propertyId,
          name: p.nome,
          slug: `${p.nome.toLowerCase().replace(/ /g, '-')}-${p.id}`,
          address: `Rua Virtual, ${p.destino}`,
          city: p.destino,
          state: p.estado,
          plan: p.plano as any,
          status: 'ACTIVE',
          userId: user.id,
          isTrial: true
        }
      });
    }
    
    console.log(`  [Provisioner] Sincronização concluída.`);
  }

  static async cleanup(pousadas: VirtualPousada[]) {
    const ids = pousadas.map(p => p.propertyId);
    console.log(`  [Provisioner] Limpando ${ids.length} pousadas do banco real...`);
    // Opcional: Remover ou marcar como inativas
    // await prisma.property.deleteMany({ where: { id: { in: ids } } });
  }
}
