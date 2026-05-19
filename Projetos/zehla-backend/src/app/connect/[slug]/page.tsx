import Image from 'next/image';
import { notFound } from 'next/navigation';

import { ConnectTracker } from '@/components/connect/ConnectTracker';

import type { Metadata } from 'next';

const API = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

interface ConnectLink {
  id: string;
  label: string;
  url: string;
  icon: string;
  type: string;
  order: number;
}

interface ConnectReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  source: string;
  createdAt: string;
}

interface ConnectMedia {
  id: string;
  type: string;
  url: string;
  alt: string;
  order: number;
}

interface ConnectTheme {
  layout: string;
  fontFamily: string;
  colors: Record<string, string>;
  buttonStyle: string;
  galleryLayout: string;
}

interface ConnectProfile {
  id: string;
  slug: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  whatsappNumber: string | null;
  isVerified: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  links: ConnectLink[];
  theme: ConnectTheme | null;
  reviews: ConnectReview[];
  media: ConnectMedia[];
  property: {
    name: string;
    city: string;
    state: string;
    latitude: number | null;
    longitude: number | null;
    whatsapp: string | null;
  } | null;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  whatsapp: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  booking: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
    </svg>
  ),
  airbnb: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.79-.42 1.05-.69 1.08-.59.05-1.04-.39-1.61-.76-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.41-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.58 4.61-1.86 5.12-1.87.11 0 .36.03.52.17.18.16.23.37.25.5.02.14.03.36.01.56z" />
    </svg>
  ),
  instagram: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  website: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 00-1.38-3.56A8.03 8.03 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 015.08 16zm2.95-8H5.08a7.987 7.987 0 014.33-3.56A15.65 15.65 0 008.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 01-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
    </svg>
  ),
};

function LinkIcon({ icon }: { icon: string }) {
  const key = icon.toLowerCase();
  const LucideIcon = ICON_MAP[key];
  if (LucideIcon) return <LucideIcon />;
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

async function getProfile(slug: string): Promise<ConnectProfile | null> {
  try {
    const res = await fetch(`${API}/api/connect/profile/${slug}`, { cache: 'force-cache' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) return { title: 'Perfil não encontrado — ZEHLA Connect' };

  return {
    title: profile.seoTitle || `${profile.property?.name || 'Perfil'} — ZEHLA Connect`,
    description: profile.seoDescription || profile.bio?.slice(0, 160) || 'Conecte-se com esta propriedade',
    openGraph: {
      title: profile.seoTitle || `${profile.property?.name || 'Perfil'} — ZEHLA Connect`,
      description: profile.seoDescription || profile.bio?.slice(0, 160),
      images: profile.coverUrl ? [{ url: profile.coverUrl }] : [],
    },
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-slate-600'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default async function ConnectProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();

  const whatsapp = profile.whatsappNumber || profile.property?.whatsapp;
  const waUrl = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null;

  return (
    <ConnectTracker slug={slug}>
      <div className="min-h-screen bg-slate-900 text-slate-200">
        {/* Cover */}
        <div className="relative h-48 sm:h-64 md:h-80 w-full bg-slate-800 overflow-hidden">
          {profile.coverUrl ? (
            <Image
              src={profile.coverUrl}
              alt={`${profile.property?.name || 'Cover'} cover`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        </div>

        {/* Avatar */}
        <div className="relative px-4 max-w-2xl mx-auto">
          <div className="flex flex-col items-center -mt-16 sm:-mt-20">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-700 shadow-xl">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.property?.name || 'Avatar'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-500">
                  {(profile.property?.name || '?')[0]}
                </div>
              )}
            </div>
            {profile.isVerified && (
              <span className="mt-1 text-xs text-emerald-400 font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                Verificado
              </span>
            )}
          </div>

          {/* Property name & location */}
          {profile.property && (
            <div className="text-center mt-4">
              <h1 className="text-2xl font-bold text-white">{profile.property.name}</h1>
              <p className="text-sm text-slate-400 mt-1">
                {profile.property.city}, {profile.property.state}
              </p>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-center text-slate-300 mt-4 max-w-lg mx-auto leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Links */}
          {profile.links.length > 0 && (
            <div className="mt-8 space-y-3">
              {profile.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full px-5 py-3.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-750 transition-all text-slate-200 font-medium group"
                >
                  <span className="flex items-center gap-3">
                    <LinkIcon icon={link.icon} />
                    {link.label}
                  </span>
                  <svg
                    className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ))}
            </div>
          )}

          {/* Reviews */}
          {profile.reviews.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-white mb-4">Avaliações</h2>
              <div className="space-y-4">
                {profile.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-white">{review.authorName}</span>
                      <Stars rating={review.rating} />
                    </div>
                    {review.text && (
                      <p className="text-sm text-slate-400 leading-relaxed">{review.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {profile.media.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-white mb-4">Galeria</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {profile.media.map((m) => (
                  <a
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-800 group"
                  >
                    <Image
                      src={m.url}
                      alt={m.alt || 'Gallery image'}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Location map placeholder */}
          {profile.property?.latitude && profile.property?.longitude && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-white mb-4">Localização</h2>
              <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/50">
                <iframe
                  title="Mapa da propriedade"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${profile.property.longitude - 0.01}%2C${profile.property.latitude - 0.01}%2C${profile.property.longitude + 0.01}%2C${profile.property.latitude + 0.01}&layer=mapnik&marker=${profile.property.latitude}%2C${profile.property.longitude}`}
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Footer spacer for floating button */}
          <div className="h-28" />
        </div>

        {/* Floating WhatsApp CTA */}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Fale conosco
          </a>
        )}
      </div>
    </ConnectTracker>
  );
}
