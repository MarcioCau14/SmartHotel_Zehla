// ==============================================================================
// ZEHLA SmartHotel — Link-in-Bio Mock Data
// ==============================================================================

import type { LinkInBioProfile } from '@/types/linkinbio';
import type { PlanTier } from '@/lib/plan-features';

const now = new Date();
const liteStart = new Date(now);
liteStart.setDate(liteStart.getDate() - 45); // 45 days ago, 15 days left

const betaStart = new Date(now);
betaStart.setMonth(betaStart.getMonth() - 3); // 3 months ago

export const MOCK_LINKINBIO_PROFILE: LinkInBioProfile = {
  id: 'lib-001',
  slug: 'pousadaserenity',
  propertyName: 'Pousada Serenity',
  subtitle: 'Seu refúgio paradisíaco em Paraty, RJ',
  description: 'Chalés com vista mar & piscina infinita',
  avatarUrl: '/avatar-serenity.jpg',
  backgroundImageUrl: '/pousada-vista.jpg',
  accentColor: '#10b981',
  rating: 4.9,
  reviewCount: 128,
  whatsappNumber: '5524999999999',
  instagramHandle: 'pousadaserenity',
  isActive: true,
  plan: 'pro' as PlanTier,
  isBetaPartner: false,
  createdAt: new Date('2025-01-15'),
  updatedAt: now,
  links: [
    {
      id: 'link-1',
      label: 'Reservar Agora (PIX Automático)',
      url: 'https://wa.me/5524999999999?text=Olá! Gostaria de fazer uma reserva.',
      icon: '🏡',
      isHighlight: true,
      order: 1,
      isActive: true,
    },
    {
      id: 'link-2',
      label: 'Galeria de Fotos do Chalé',
      url: '#galeria',
      icon: '📸',
      isHighlight: false,
      order: 2,
      isActive: true,
    },
    {
      id: 'link-3',
      label: 'Nossas Avaliações',
      url: '#avaliacoes',
      icon: '⭐',
      isHighlight: false,
      order: 3,
      isActive: true,
    },
    {
      id: 'link-4',
      label: 'Como Chegar (Mapa)',
      url: '#mapa',
      icon: '📍',
      isHighlight: false,
      order: 4,
      isActive: true,
    },
    {
      id: 'link-5',
      label: 'Conversar no WhatsApp',
      url: 'https://wa.me/5524999999999',
      icon: '💬',
      isHighlight: false,
      order: 5,
      isActive: true,
    },
  ],
};

// Mock profile for LITE plan (with expiration)
export const MOCK_LINKINBIO_LITE: LinkInBioProfile = {
  ...MOCK_LINKINBIO_PROFILE,
  id: 'lib-002',
  slug: 'pousadamirim',
  propertyName: 'Pousada Mirim',
  subtitle: 'Conforto e natureza em Búzios',
  plan: 'lite' as PlanTier,
  isBetaPartner: false,
  planStartDate: liteStart,
  planExpiresAt: new Date(liteStart.getTime() + 60 * 24 * 60 * 60 * 1000),
  links: MOCK_LINKINBIO_PROFILE.links,
};

// Mock profile for Beta partner
export const MOCK_LINKINBIO_BETA: LinkInBioProfile = {
  ...MOCK_LINKINBIO_PROFILE,
  id: 'lib-003',
  slug: 'pousadapraiana',
  propertyName: 'Pousada Praiana',
  subtitle: 'Beleza rústica na costa verde',
  plan: 'pro' as PlanTier, // Beta gets PRO features
  isBetaPartner: true,
  planStartDate: betaStart,
  betaEndDate: new Date(betaStart.getTime() + 24 * 30 * 24 * 60 * 60 * 1000),
  links: MOCK_LINKINBIO_PROFILE.links,
};

// Slug → profile lookup (mock DB)
export const MOCK_PROFILE_DB: Record<string, LinkInBioProfile> = {
  pousadaserenity: MOCK_LINKINBIO_PROFILE,
  pousadamirim: MOCK_LINKINBIO_LITE,
  pousadapraiana: MOCK_LINKINBIO_BETA,
};