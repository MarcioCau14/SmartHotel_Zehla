import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ZEHLA SmartHotel — IA Cognitiva para Pousadas e Hotéis',
  description:
    'Plataforma SaaS B2B com IA autônoma que responde hóspedes 24/7, converte leads em reservas, otimiza ocupação e reduz custos operacionais. Comece grátis por 14 dias.',
  keywords: [
    'ZEHLA', 'SmartHotel', 'IA para pousadas', 'IA para hotéis',
    'chatbot hotelaria', 'automação hoteleira', 'reservas IA',
    'cognitive OS', 'hospitalidade inteligente', 'DDC command center',
    'pousada Brasil',
  ],
  authors: [{ name: 'ZEHLA SmartHotel', url: 'https://zehla.com.br' }],
  creator: 'ZEHLA SmartHotel',
  metadataBase: new URL('https://zehla.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://zehla.com.br',
    siteName: 'ZEHLA SmartHotel',
    title: 'ZEHLA SmartHotel — IA Cognitiva para Pousadas e Hotéis',
    description: 'IA autônoma que responde hóspedes 24/7, converte leads em reservas e otimiza sua ocupação. Comece grátis.',
    images: [{ url: '/og-image.png', width: 1344, height: 768, alt: 'ZEHLA SmartHotel — Plataforma Cognitiva para Hospitalidade' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZEHLA SmartHotel — IA Cognitiva para Pousadas',
    description: 'Responda hóspedes 24/7 com IA. Converte leads, otimiza ocupação. 14 dias grátis.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
