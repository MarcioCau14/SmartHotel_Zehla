import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { LinkInBioPage } from '@/components/linkinbio/LinkInBioPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const property = await db.property.findUnique({
    where: { slug: slug.toLowerCase() },
    include: {
      linkinbioLinks: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!property) return { title: 'Pousada não encontrada' };

  return {
    title: `${property.name} — seuzella.com`,
    description: property.linkinbioSubtitle || `Conheça ${property.name}`,
    openGraph: {
      title: property.name,
      description: property.linkinbioSubtitle || `Conheça ${property.name}`,
      images: property.linkinbioAvatarUrl ? [{ url: property.linkinbioAvatarUrl }] : [],
    },
  };
}

export default async function LinkInBioRoute({ params }: PageProps) {
  const { slug } = await params;

  const property = await db.property.findUnique({
    where: { slug: slug.toLowerCase() },
    include: {
      linkinbioLinks: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
      tenant: {
        select: { phone: true },
      },
    },
  });

  if (!property || !property.linkinbioIsActive) notFound();

  const profile = {
    id: property.id,
    slug: property.slug,
    propertyName: property.name,
    subtitle: property.linkinbioSubtitle || '',
    avatarUrl: property.linkinbioAvatarUrl || '',
    backgroundImageUrl: property.linkinbioBackgroundUrl || '',
    accentColor: property.linkinbioAccentColor || '#10b981',
    rating: property.linkinbioRating || undefined,
    reviewCount: property.linkinbioReviewCount || undefined,
    whatsappNumber: property.tenant?.phone || undefined,
    instagramHandle: property.linkinbioInstagram || undefined,
    isActive: property.linkinbioIsActive,
    plan: 'pro' as const,
    isBetaPartner: property.linkinbioIsBetaPartner,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    planExpiresAt: property.linkinbioPlanExpires || undefined,
    betaEndDate: property.linkinbioBetaEnd || undefined,
    links: property.linkinbioLinks.map((l) => ({
      id: l.id,
      label: l.label,
      url: l.url,
      icon: l.icon,
      isHighlight: l.isHighlight,
      order: l.order,
      isActive: l.isActive,
    })),
  };

  return <LinkInBioPage profile={profile} />;
}