import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PousadaProfile } from '@/components/pousada/PousadaProfile';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await prisma.connectProfile.findUnique({
    where: { slug },
    include: { property: { select: { name: true, city: true, state: true } } },
  });

  if (!profile) return { title: 'Pousada não encontrada' };

  return {
    title: `${profile.property?.name || profile.slug} | ZEHLA SmartHotel`,
    description: profile.bio || `Conheça ${profile.property?.name || profile.slug} e reserve direto via WhatsApp.`,
    openGraph: {
      title: `${profile.property?.name || profile.slug} | ZEHLA`,
      description: profile.bio || 'Reserve direto, sem taxa.',
    },
  };
}

export default async function PousadaSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const profile = await prisma.connectProfile.findUnique({
    where: { slug, status: { not: 'draft' } },
    include: {
      property: {
        select: { name: true, city: true, state: true, rooms: true },
      },
      media: { select: { url: true } },
    },
  });

  if (!profile) notFound();

  const fotos = profile.media.map((m) => m.url);

  return (
    <PousadaProfile
      data={{
        nome: profile.property?.name || profile.slug,
        slug: profile.slug,
        descricao: profile.bio,
        cidade: profile.property?.city || '',
        estado: profile.property?.state || '',
        whatsapp: profile.whatsappNumber || '',
        instagram: '',
        quartos: profile.property?.rooms || 0,
        fotos,
        avatarUrl: profile.avatarUrl || undefined,
        coverUrl: profile.coverUrl || undefined,
      }}
    />
  );
}
