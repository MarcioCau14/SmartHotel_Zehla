'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { LinkInBioPage } from './LinkInBioPage';
import type { LinkInBioProfile, LinkInBioLink } from '@/types/linkinbio';
import type { PlanTier } from '@/lib/plan-features';
import {
  Plus, Trash2, GripVertical, Copy, Check, Eye, Pencil,
  MessageCircle, Star, Instagram, Palette, Link2, ChevronDown, ChevronUp,
  Smartphone, X, Save, Sparkles, ShieldCheck,
  Loader2, Lock, ArrowUpRight, Bot, Zap,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────────

const LITE_MONTHLY_MSGS = 500;

const ACCENT_PRESETS = [
  { label: 'Esmeralda', color: '#10b981' },
  { label: 'Azul Oceano', color: '#0ea5e9' },
  { label: 'Roxo Místico', color: '#a855f7' },
  { label: 'Rosa Pousada', color: '#ec4899' },
  { label: 'Laranja Sol', color: '#f97316' },
  { label: 'Vermelho Paixão', color: '#ef4444' },
  { label: 'Dourado Premium', color: '#eab308' },
  { label: 'Branco Clean', color: '#e4e4e7' },
];

const LINK_ICONS = ['🏡', '📸', '⭐', '📍', '💬', '📞', '💳', '📅', '🌐', '🍔', '🏊', '🌅', '🎫', '🎁', '📖', '❤️', '🎵', '🌙', '🌿', '🍽️'];

const DEFAULT_LINKS: Omit<LinkInBioLink, 'id'>[] = [
  { label: 'Reservar Agora', url: '', icon: '🏡', isHighlight: true, order: 0, isActive: true },
  { label: 'Galeria de Fotos', url: '#', icon: '📸', isHighlight: false, order: 1, isActive: true },
  { label: 'Nossas Avaliações', url: '#', icon: '⭐', isHighlight: false, order: 2, isActive: true },
  { label: 'Como Chegar', url: '#', icon: '📍', isHighlight: false, order: 3, isActive: true },
  { label: 'Conversar no WhatsApp', url: '', icon: '💬', isHighlight: false, order: 4, isActive: true },
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface LinkInBioDDCProps {
  currentPlan: PlanTier;
  isBetaPartner: boolean;
  propertyName: string;
  isLinkInBioOnly?: boolean; // standalone R$47/mês (sem Zélla IA)
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

function formatPhoneDisplay(value: string): string {
  const d = value.replace(/\D/g, '');
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9, 13)}`;
}

// ── BETA PARTNER SEAL ──────────────────────────────────────────────────────────

function BetaPartnerSeal({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const isSmall = size === 'sm';
  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-full ${isSmall ? 'px-2 py-0.5' : 'px-3 py-1'}`}>
      <ShieldCheck className={`text-amber-400 ${isSmall ? 'w-3 h-3' : 'w-4 h-4'}`} />
      <span className={`${isSmall ? 'text-[9px]' : 'text-[10px]'} font-extrabold uppercase tracking-wider text-amber-300`}>
        Beta Partner
      </span>
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function LinkInBioDDC({ currentPlan, isBetaPartner, propertyName, isLinkInBioOnly = false }: LinkInBioDDCProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [showIconPicker, setShowIconPicker] = useState<string | null>(null);

  // Profile state
  const [profileName, setProfileName] = useState(propertyName);
  const [slug, setSlug] = useState(generateSlug(propertyName));
  const [subtitle, setSubtitle] = useState('');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [links, setLinks] = useState<LinkInBioLink[]>(
    DEFAULT_LINKS.map((l, i) => ({ ...l, id: `link-${i + 1}` }))
  );

  // ── Plan Logic ────────────────────────────────────────────────────────────
  const isLite = currentPlan === 'lite';
  const isPro = currentPlan === 'pro';
  const isMax = currentPlan === 'max';
  const isTrial = currentPlan === 'trial';
  const hasFullAccess = isLite || isPro || isMax || isTrial;
  const canAddMoreLinks = hasFullAccess;
  const canCustomColor = hasFullAccess;
  const canEditSlug = hasFullAccess;
  const canUseCustomIcon = hasFullAccess;

  // WhatsApp behavior per plan
  // TRIAL: Zélla IA com limite de mensagens
  // LITE: Zélla IA responde com 500 msgs/mês
  // PRO: Zélla IA responde de forma humanizada, msgs ilimitadas
  // MAX: Zélla IA completa + envio ativo, cobrança Meta a partir de 01/10
  // isLinkInBioOnly (R$47 standalone): WhatsApp direto, sem Zélla IA
  const whatsappMode = isLinkInBioOnly ? 'direct' as const : isLite ? 'ai-limited' as const : isPro ? 'ai-humanized' as const : isMax ? 'ai-full' as const : 'ai-limited' as const;

  // ── Derived ───────────────────────────────────────────────────────────────
  const effectiveSlug = slug || generateSlug(profileName) || 'sua-pousada';
  const publicLink = `seuzella.com/${effectiveSlug}`;

  const liveProfile: LinkInBioProfile = useMemo(() => ({
    id: 'ddc',
    slug: effectiveSlug,
    propertyName: profileName || propertyName,
    subtitle,
    avatarUrl: '',
    backgroundImageUrl: '',
    accentColor,
    whatsappNumber,
    instagramHandle,
    rating,
    reviewCount,
    links: links.sort((a, b) => a.order - b.order),
    isActive: true,
    plan: currentPlan,
    isBetaPartner,
    createdAt: new Date(),
    updatedAt: new Date(),
  }), [effectiveSlug, profileName, propertyName, subtitle, accentColor, whatsappNumber, instagramHandle, rating, reviewCount, links, currentPlan, isBetaPartner]);

  // ── Load from backend ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/ddc/linkinbio');
        if (res.ok) {
          const data = await res.json();
          if (data.subtitle) setSubtitle(data.subtitle);
          if (data.accentColor) setAccentColor(data.accentColor);
          if (data.slug) setSlug(data.slug);
          if (data.instagramHandle) setInstagramHandle(data.instagramHandle);
          if (data.rating) setRating(data.rating);
          if (data.reviewCount) setReviewCount(data.reviewCount);
          if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
          if (Array.isArray(data.links) && data.links.length > 0) {
            setLinks(data.links.map((l: LinkInBioLink) => ({ ...l })));
          }
        }
      } catch {
        // Keep defaults
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  // ── Link Management ───────────────────────────────────────────────────────
  const addLink = useCallback(() => {
    const newLink: LinkInBioLink = {
      id: `link-${Date.now()}`,
      label: 'Novo Link',
      url: 'https://',
      icon: canUseCustomIcon ? '🔗' : LINK_ICONS[0],
      isHighlight: false,
      order: links.length,
      isActive: true,
    };
    setLinks((prev) => [...prev, newLink]);
    setEditingLinkId(newLink.id);
  }, [canAddMoreLinks, canUseCustomIcon, links.length]);

  const removeLink = useCallback((linkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== linkId).map((l, i) => ({ ...l, order: i })));
    if (editingLinkId === linkId) setEditingLinkId(null);
  }, [editingLinkId]);

  const moveLink = useCallback((linkId: string, direction: 'up' | 'down') => {
    setLinks((prev) => {
      const idx = prev.findIndex((l) => l.id === linkId);
      if (direction === 'up' && idx > 0) {
        const arr = [...prev];
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        return arr.map((l, i) => ({ ...l, order: i }));
      }
      if (direction === 'down' && idx < prev.length - 1) {
        const arr = [...prev];
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
        return arr.map((l, i) => ({ ...l, order: i }));
      }
      return prev;
    });
  }, []);

  const updateLinkField = useCallback((linkId: string, field: keyof LinkInBioLink, value: any) => {
    setLinks((prev) => prev.map((l) => (l.id === linkId ? { ...l, [field]: value } : l)));
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/ddc/linkinbio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: effectiveSlug,
          subtitle,
          accentColor,
          instagramHandle,
          rating,
          reviewCount,
          whatsappNumber,
          links: links.map((l, i) => ({ ...l, order: i })),
        }),
      });
      if (res.ok) {
        setSaved(true);
        toast.success('Link-in-Bio salvo com sucesso!');
        setTimeout(() => setSaved(false), 2500);
      } else {
        toast.error('Erro ao salvar. Tente novamente.');
      }
    } catch {
      toast.error('Erro de conexão ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Copy Link ─────────────────────────────────────────────────────────────
  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${publicLink}`);
      setCopied(true);
      toast.success('Link copiado! Cole no Instagram da sua pousada.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-[#121216] border border-white/[0.04] rounded-xl p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        <span className="ml-3 text-sm text-zinc-400">Carregando Link-in-Bio...</span>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#121216] border border-white/[0.04] rounded-xl overflow-hidden">
      {/* ── TOP BAR: Title + Actions ── */}
      <div className="px-5 py-4 border-b border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0">
            <Smartphone className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-white">Link-in-Bio Profissional</h2>
              {isLinkInBioOnly && (
                <span className="text-[9px] font-bold text-zinc-300 bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 rounded-full">R$47/mês</span>
              )}
              {isBetaPartner && <BetaPartnerSeal size="sm" />}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Configure sua vitrine de reservas para o Instagram da pousada
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Public link + copy */}
          <div className="flex items-center gap-1.5 bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-3 py-1.5">
            <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">{publicLink}</span>
            <span className="text-[11px] text-zinc-500 font-mono sm:hidden">seuzella.com/...</span>
            <button
              onClick={copyPublicLink}
              className="text-zinc-500 hover:text-emerald-400 transition-colors"
              title="Copiar link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Toggle preview */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              showPreview
                ? 'bg-emerald-500 text-white'
                : 'bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              saved
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950'
            }`}
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {/* ── PLAN WHATSAPP MODE BANNER ── */}
      <div className={`mx-5 mt-4 p-3 rounded-lg flex items-start gap-3 border ${
        whatsappMode === 'ai-limited'
          ? 'bg-blue-500/[0.06] border-blue-500/15'
          : whatsappMode === 'ai-humanized'
            ? 'bg-emerald-500/[0.06] border-emerald-500/15'
            : whatsappMode === 'ai-full'
              ? 'bg-amber-500/[0.06] border-amber-500/15'
              : 'bg-zinc-500/[0.06] border-zinc-500/15'
      }`}>
        {whatsappMode === 'ai-limited' && (
          <>
            <Bot className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-blue-300 font-bold">
                Zélla IA atende seus hóspedes — {LITE_MONTHLY_MSGS} mensagens/mês
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {isLite
                  ? `Plano LITE: a Zélla IA responde hóspedes que clicam em "Conversar no WhatsApp". Limite de ${LITE_MONTHLY_MSGS} mensagens/mês com recarga disponível. A IA conhece sua pousada e ajuda a fechar reservas.`
                  : 'Trial: a Zélla IA está respondendo seus hóspedes. Faça upgrade para mais mensagens e recursos.'
                }
              </p>
            </div>
          </>
        )}
        {whatsappMode === 'ai-humanized' && (
          <>
            <Bot className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-emerald-300 font-bold">
                Zélla IA atende seus hóspedes — respostas humanizadas
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Plano PRO: a IA Zélla responde de forma natural e personalizada, conhece sua pousada e ajuda a fechar reservas sem ser robótica. Mensagens ilimitadas. Treine a IA no Centro de Treinamento.
              </p>
            </div>
          </>
        )}
        {whatsappMode === 'ai-full' && (
          <>
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-amber-300 font-bold">
                Zélla IA completa — atendimento + envio ativo
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Plano MAX: sem limites. A Zélla IA pode conversar mais, enviar mensagens proativas para hóspedes e personalizar 100% o atendimento. A partir de 01/10, mensagens enviadas pela API serão cobradas pela Meta.
              </p>
            </div>
          </>
        )}
        {whatsappMode === 'direct' && (
          <>
            <MessageCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-zinc-300 font-bold">
                Link-in-Bio — R$47/mês (sem Zélla IA)
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Plano Link-in-Bio: o hóspede que clicar em &quot;Conversar no WhatsApp&quot; fala diretamente com o número configurado acima. Você mesma(o) atende. Sem respostas automáticas da Zélla IA.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── MAIN LAYOUT: Editor + Preview ── */}
      <div className="flex flex-col lg:flex-row">
        {/* ── LEFT: EDITOR ── */}
        <div className={`flex-1 p-5 sm:p-6 overflow-y-auto max-h-[calc(100vh-280px)] lg:max-h-[calc(100vh-220px)] ${showPreview ? 'hidden lg:block' : ''}`}>
          <div className="max-w-xl mx-auto space-y-6">

            {/* ═══ Section: Informações Básicas ═══ */}
            <section>
              <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Pencil className="w-3.5 h-3.5 text-emerald-400" />
                Informações Básicas
              </h3>
              <div className="space-y-4">
                {/* Nome da Pousada */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Nome da Pousada *
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => {
                      setProfileName(e.target.value);
                      if (!slug || slug === generateSlug(propertyName)) {
                        setSlug(generateSlug(e.target.value));
                      }
                    }}
                    placeholder="Ex: Pousada Serenity"
                    className="w-full bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Seu link personalizado
                    {!canEditSlug && (
                      <span className="ml-2 text-amber-500 normal-case tracking-normal">
                        <Lock className="w-2.5 h-2.5 inline" /> PRO+
                      </span>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600 shrink-0">seuzella.com/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => canEditSlug && setSlug(generateSlug(e.target.value))}
                      readOnly={!canEditSlug}
                      placeholder="nome-da-pousada"
                      className={`flex-1 bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all ${!canEditSlug ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-1">
                    {slug ? `Seu link: https://${publicLink}` : 'Preencha o nome para gerar automaticamente'}
                  </p>
                </div>

                {/* Subtítulo */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Subtítulo</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ex: Seu refúgio paradisíaco em Paraty, RJ"
                    maxLength={80}
                    className="w-full bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1 text-right">{subtitle.length}/80</p>
                </div>
              </div>
            </section>

            <div className="border-t border-white/[0.04]" />

            {/* ═══ Section: Contato ═══ */}
            <section>
              <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                Contato
              </h3>
              <div className="space-y-4">
                {/* WhatsApp */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Número do WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="5524999999999"
                    className="w-full bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  {whatsappNumber && (
                    <p className="text-[10px] text-emerald-500/70 mt-1">
                      wa.me/{whatsappNumber} — {formatPhoneDisplay(whatsappNumber)}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-600 mt-0.5">Com DDD + número. Ex: 5524999999999</p>
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    @ do Instagram
                  </label>
                  <div className="flex items-center">
                    <span className="text-sm text-zinc-500">@</span>
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value.replace('@', '').replace(/\s/g, ''))}
                      placeholder="pousadaserenity"
                      className="flex-1 bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all ml-1"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-white/[0.04]" />

            {/* ═══ Section: Aparência ═══ */}
            <section>
              <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                Aparência
                {!canCustomColor && (
                  <span className="ml-2 text-amber-500 normal-case tracking-normal font-bold">
                    <Lock className="w-2.5 h-2.5 inline" /> PRO+
                  </span>
                )}
              </h3>
              <div className="space-y-4">
                {/* Cor de destaque */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Cor de destaque</label>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_PRESETS.map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => setAccentColor(preset.color)}
                        title={preset.label}
                        disabled={!canCustomColor}
                        className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                          accentColor === preset.color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        } ${!canCustomColor && accentColor !== preset.color ? 'opacity-40' : ''}`}
                        style={{ backgroundColor: preset.color }}
                      />
                    ))}
                    {canCustomColor && (
                      <label className="w-8 h-8 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors relative overflow-hidden">
                        <span className="text-[10px] text-zinc-500">+</span>
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Avaliação */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    <Star className="w-2.5 h-2.5 inline mr-1" />
                    Avaliação (Google/Booking)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={rating || ''}
                      onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                      placeholder="4.9"
                      className="w-20 bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />
                    <input
                      type="number"
                      min="0"
                      value={reviewCount || ''}
                      onChange={(e) => setReviewCount(parseInt(e.target.value) || 0)}
                      placeholder="128"
                      className="w-24 bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    />
                    <span className="text-xs text-zinc-500">avaliações</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-white/[0.04]" />

            {/* ═══ Section: Seus Links ═══ */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                  Seus Links
                </h3>
              </div>

              {/* Link list */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {links
                    .sort((a, b) => a.order - b.order)
                    .map((link, idx) => (
                      <motion.div
                        key={link.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#0a0a0f]/60 border border-white/[0.04] rounded-lg overflow-hidden"
                      >
                        {/* Collapsed view */}
                        {editingLinkId !== link.id && (
                          <div className="flex items-center gap-2 px-3 py-2.5">
                            <GripVertical className="w-4 h-4 text-zinc-700 shrink-0" />
                            <button onClick={() => moveLink(link.id, 'up')} disabled={idx === 0} className="text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors">
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => moveLink(link.id, 'down')} disabled={idx === links.length - 1} className="text-zinc-600 hover:text-zinc-300 disabled:opacity-20 transition-colors">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            <span className="text-base">{link.icon || '🔗'}</span>
                            <span className={`flex-1 text-xs truncate ${link.isHighlight ? 'text-emerald-400 font-bold' : 'text-zinc-300'}`}>
                              {link.label || 'Link sem nome'}
                            </span>

                            {link.isHighlight && (
                              <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                Destaque
                              </span>
                            )}

                            <button onClick={() => setEditingLinkId(link.id)} className="text-zinc-500 hover:text-white transition-colors p-1">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => removeLink(link.id)} className="text-zinc-500 hover:text-red-400 transition-colors p-1">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Expanded editing view */}
                        {editingLinkId === link.id && (
                          <div className="p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase">Editando Link</span>
                              <button onClick={() => setEditingLinkId(null)} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Icon picker */}
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">Ícone</label>
                              <div className="flex flex-wrap gap-1.5 relative">
                                <button
                                  onClick={() => setShowIconPicker(showIconPicker === link.id ? null : link.id)}
                                  className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-base hover:bg-white/[0.08] transition-colors"
                                >
                                  {link.icon || '🔗'}
                                </button>
                                {showIconPicker === link.id && (
                                  <div className="absolute z-20 top-10 left-0 bg-[#0a0a0f] border border-white/[0.08] rounded-lg p-2 grid grid-cols-10 gap-1 shadow-2xl">
                                    {LINK_ICONS.map((emoji) => (
                                      <button
                                        key={emoji}
                                        onClick={() => {
                                          updateLinkField(link.id, 'icon', emoji);
                                          setShowIconPicker(null);
                                        }}
                                        className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center text-sm transition-colors"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Label */}
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">Texto do botão</label>
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => updateLinkField(link.id, 'label', e.target.value)}
                                placeholder="Ex: Reservar Agora"
                                className="w-full bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                              />
                            </div>

                            {/* URL */}
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">URL de destino</label>
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) => updateLinkField(link.id, 'url', e.target.value)}
                                placeholder="https://wa.me/5524999999999?text=Olá"
                                className="w-full bg-[#0a0a0f] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                              />
                            </div>

                            {/* Toggle highlight + WhatsApp auto-fill */}
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => updateLinkField(link.id, 'isHighlight', !link.isHighlight)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  link.isHighlight
                                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                    : 'bg-white/[0.03] border border-white/[0.06] text-zinc-500'
                                }`}
                              >
                                <Sparkles className="w-3 h-3" />
                                Destaque
                              </button>

                              {whatsappNumber && (
                                <button
                                  onClick={() => {
                                    const msg = encodeURIComponent('Olá! Gostaria de fazer uma reserva.');
                                    updateLinkField(link.id, 'url', `https://wa.me/${whatsappNumber}?text=${msg}`);
                                    toast.success('URL do WhatsApp preenchida!');
                                  }}
                                  className="flex items-center gap-1 text-[10px] text-emerald-500/60 hover:text-emerald-400 transition-colors"
                                >
                                  <MessageCircle className="w-2.5 h-2.5" />
                                  Auto WhatsApp
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => setEditingLinkId(null)}
                              className="w-full py-2 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/20 transition-all"
                            >
                              Concluir edição
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              {/* Add link button */}
              <button
                onClick={addLink}
                disabled={!canAddMoreLinks}
                className={`mt-3 w-full py-2.5 border-2 border-dashed rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  canAddMoreLinks
                    ? 'border-white/[0.06] text-zinc-500 hover:border-emerald-500/25 hover:text-emerald-400'
                    : 'border-white/[0.03] text-zinc-700 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Link
              </button>

              {/* Quick-start templates */}
              {links.length === 0 && (
                <div className="mt-4 p-3 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-lg">
                  <p className="text-[10px] font-bold text-zinc-400 mb-2">Templates rápidos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Reservar', icon: '🏡', highlight: true },
                      { label: 'Fotos', icon: '📸', highlight: false },
                      { label: 'Avaliações', icon: '⭐', highlight: false },
                      { label: 'Localização', icon: '📍', highlight: false },
                      { label: 'WhatsApp', icon: '💬', highlight: false },
                    ].map((tpl) => (
                      <button
                        key={tpl.label}
                        onClick={() => {
                          const newLink: LinkInBioLink = {
                            id: `link-${Date.now()}-${tpl.label}`,
                            label: tpl.label,
                            url: tpl.label === 'WhatsApp' && whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#',
                            icon: tpl.icon,
                            isHighlight: tpl.highlight,
                            order: links.length,
                            isActive: true,
                          };
                          setLinks((prev) => [...prev, newLink]);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[10px] text-zinc-400 hover:text-white hover:border-white/15 transition-all"
                      >
                        <span>{tpl.icon}</span>
                        {tpl.label}
                        {tpl.highlight && <Sparkles className="w-2.5 h-2.5 text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="border-t border-white/[0.04]" />

            {/* ═══ Section: Como usar ═══ */}
            <section className="pb-6">
              <h3 className="text-xs font-extrabold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Como usar
              </h3>
              <div className="space-y-3 text-xs text-zinc-500">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">1</span>
                  <p>Preencha as informações da sua pousada e adicione seus links.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">2</span>
                  <p>Clique em <strong className="text-zinc-300">Salvar</strong> e depois <strong className="text-zinc-300">Copiar Link</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">3</span>
                  <p>Cole o link no campo <strong className="text-zinc-300">&quot;Editar&quot;</strong> do perfil do Instagram da sua pousada. Pronto!</p>
                </div>
              </div>

              {/* Big copy button for mobile */}
              <button
                onClick={copyPublicLink}
                className={`mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all active:scale-[0.98] ${
                  copied
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Link Copiado!' : `Copiar Link: ${publicLink}`}
              </button>
            </section>

          </div>
        </div>

        {/* ── RIGHT: LIVE PREVIEW ── */}
        <div className={`lg:w-[400px] lg:shrink-0 lg:border-l border-white/[0.04] bg-black/50 ${!showPreview ? 'hidden lg:block' : 'block'}`}>
          <div className="lg:sticky lg:top-0">
            {/* Preview header */}
            <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Preview ao Vivo</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-zinc-600">Atualizando</span>
              </div>
            </div>

            {/* Phone frame */}
            <div className="lg:py-5 lg:px-5 flex justify-center">
              <div className="w-full max-w-[370px] rounded-[2rem] border-[5px] border-zinc-800 overflow-hidden shadow-2xl shadow-black/50">
                <LinkInBioPage profile={liveProfile} isPreview={true} />
              </div>
            </div>

            {/* Mobile close preview */}
            {showPreview && (
              <div className="lg:hidden sticky bottom-0 p-4 bg-[#0a0a0f]/90 backdrop-blur-md border-t border-white/[0.04]">
                <button
                  onClick={() => setShowPreview(false)}
                  className="w-full py-3 bg-white text-zinc-950 rounded-lg text-sm font-bold"
                >
                  <Pencil className="w-4 h-4 inline mr-2" />
                  Voltar para Editar
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}