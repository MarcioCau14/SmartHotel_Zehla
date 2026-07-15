import { Metadata } from 'next';
import { LinkInBioPage } from '@/components/linkinbio/LinkInBioPage';
import { MOCK_LINKINBIO_PROFILE, MOCK_LINKINBIO_LITE, MOCK_LINKINBIO_BETA } from '@/lib/linkinbio/mock-data';

export const metadata: Metadata = {
  title: 'Link-in-Bio Demo — Zélla SmartHotel',
  description: 'Preview profissional do Link-in-Bio Zélla',
  robots: { index: false, follow: false },
};

// Lista de demos disponíveis para testar
const DEMOS = [
  { slug: 'pro', label: 'Plano PRO', profile: MOCK_LINKINBIO_PROFILE },
  { slug: 'lite', label: 'Plano LITE (com expiração)', profile: MOCK_LINKINBIO_LITE },
  { slug: 'beta', label: 'Parceiro Beta (com selo)', profile: MOCK_LINKINBIO_BETA },
] as const;

export default async function DemoLinkInBioPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const selected = DEMOS.find((d) => d.slug === plan) || DEMOS[0];

  return (
    <div className="min-h-screen bg-black">
      {/* Barra de navegação entre demos */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-emerald-400 text-xs font-bold tracking-wider uppercase">
            Demo Link-in-Bio
          </span>
          <div className="flex gap-1.5">
            {DEMOS.map((d) => (
              <a
                key={d.slug}
                href={`/demo/link-in-bio?plan=${d.slug}`}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  d.slug === selected.slug
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {d.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Renderiza o Link-in-Bio real com padding-top para a barra */}
      <div className="pt-14">
        <LinkInBioPage profile={selected.profile} />
      </div>
    </div>
  );
}