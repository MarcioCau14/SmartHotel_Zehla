import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

const pageLabels: Record<string, string> = {
  painel: 'Painel',
  reservas: 'Reservas',
  quartos: 'Quartos',
  financeiro: 'Financeiro',
  promocoes: 'Promoções',
  configuracoes: 'Configurações',
  upgrade: 'Upgrade',
};

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const property = await prisma.property.findFirst({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      plan: true,
      trialEndsAt: true,
      isTrial: true,
      status: true,
    },
  });

  if (!property) redirect('/teste-gratis');

  let daysLeft = 0;
  if (property.isTrial && property.trialEndsAt) {
    daysLeft = Math.max(0, Math.ceil(
      (new Date(property.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ));
  }

  return (
    <DashboardShell
      propertyName={property.name}
      daysLeft={daysLeft}
      isTrialing={property.isTrial}
    >
      {children}
    </DashboardShell>
  );
}
