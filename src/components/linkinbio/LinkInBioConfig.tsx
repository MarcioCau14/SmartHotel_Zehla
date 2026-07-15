'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { PlanTier } from '@/lib/plan-features';
import type { LinkInBioLink } from '@/types/linkinbio';
import { LITE_LINKINBIO_DAYS, BETA_PARTNERSHIP_MONTHS, getDaysUntilExpiry } from '@/types/linkinbio';
import { PLAN_DISPLAY } from '@/lib/plan-features';
import { LinkInBioPage } from './LinkInBioPage';
import type { LinkInBioProfile } from '@/types/linkinbio';
import {
  Save, Loader2, Plus, Trash2, GripVertical, Star, ShieldCheck,
  Eye, Copy, Clock, AlertTriangle, CheckCircle2, ImageIcon,
  Link2, Palette, Settings2, Info, X, ChevronDown, ChevronUp,
  Upload, MessageCircle, Instagram, Sparkles, LogOut, ArrowRight,
  Smartphone, Pencil,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────────

const LITE_MAX_LINKS = 3;
const LITE_ONLY_PRESETS = true;
const LINKINBIO_STANDALONE_PRICE = 47;

const EMOJI_OPTIONS = [
  '🏡', '📸', '⭐', '📍', '💬', '📱', '🌙', '🌊', '🍳', '🏊',
  '🌿', '🎫', '🎁', '📞', '💳', '🗓️', '🌅', '🍔', '📖', '❤️', '🎵',
];

const ACCENT_PRESETS = [
  '#10b981', '#0ea5e9', '#a855f7', '#ec4899',
  '#f97316', '#ef4444', '#eab308', '#e4e4e7',
];

const DEFAULT_LINKS: Omit<LinkInBioLink, 'id'>[] = [
  { label: 'Reservar Agora', url: '', icon: '🏡', isHighlight: true, order: 0, isActive: true },
  { label: 'Galeria de Fotos', url: '#', icon: '📸', isHighlight: false, order: 1, isActive: true },
  { label: 'Nossas Avaliações', url: '#', icon: '⭐', isHighlight: false, order: 2, isActive: true },
  { label: 'Como Chegar', url: '#', icon: '📍', isHighlight: false, order: 3, isActive: true },
  { label: 'Conversar no WhatsApp', url: '', icon: '💬', isHighlight: false, order: 4, isActive: true },
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface LinkInBioConfigProps {
  currentPlan: PlanTier;
  isBetaPartner: boolean;
  propertyName: string;
  slug: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

function buildWhatsAppUrl(number?: string, message?: string): string {
  if (!number) return '';
  const clean = number.replace(/\D/g, '');
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function LinkInBioConfig({ currentPlan, isBetaPartner, propertyName, slug }: LinkInBioConfigProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subtitle, setSubtitle] = useState('');
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [links, setLinks] = useState<LinkInBioLink[]>(
    DEFAULT_LINKS.map((l, i) => ({ ...l, id: `link-${i + 1}` }))
  );
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dbSlug, setDbSlug] = useState(slug);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ── Plan Logic ────────────────────────────────────────────────────────────
  const isLite = currentPlan === 'lite';
  const isPro = currentPlan === 'pro';
  const isMax = currentPlan === 'max';
  const isTrial = currentPlan === 'trial';
  const hasFullAccess = isPro || isMax || isTrial;
  const hasLiteAccess = isLite; // LITE gets 60 days

  // LITE limitations
  const canAddMoreLinks = hasFullAccess || isMax || (isLite && links.length < LITE_MAX_LINKS);
  const canCustomizeColor = hasFullAccess || isMax;
  const canChangeBackground = isPro || isMax;
  const canEditSlug = isPro || isMax;
  const canUseAllIcons = hasFullAccess || isMax;

  // Mock dates for demo
  const mockStartDate = new Date();
  mockStartDate.setDate(mockStartDate.getDate() - 45);
  const mockExpiry = new Date(mockStartDate.getTime() + LITE_LINKINBIO_DAYS * 24 * 60 * 60 * 1000);
  const daysLeft = isLite ? getDaysUntilExpiry(mockExpiry) : null;
  const linkInBioUrl = `seuzella.com/${dbSlug || generateSlug(propertyName) || 'sua-pousada'}`;

  // ── Load config from backend ──────────────────────────────────────────────
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/ddc/linkinbio');
        if (res.ok) {
          const data = await res.json();
          if (data.subtitle) setSubtitle(data.subtitle);
          if (data.backgroundImageUrl) setBgImageUrl(data.backgroundImageUrl);
          if (data.accentColor) setAccentColor(data.accentColor);
          if (data.slug) setDbSlug(data.slug);
          if (data.instagramHandle) setInstagramHandle(data.instagramHandle);
          if (data.rating) setRating(data.rating);
          if (data.reviewCount) setReviewCount(data.reviewCount);
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
  const addLink = () => {
    if (!canAddMoreLinks && isLite) {
      toast.error(`Plano LITE: máximo de ${LITE_MAX_LINKS} links. Faça upgrade para PRO!`);
      return;
    }
    const newLink: LinkInBioLink = {
      id: `link-new-${Date.now()}`,
      label: 'Novo Link',
      url: 'https://',
      icon: '🔗',
      isHighlight: false,
      order: links.length,
      isActive: true,
    };
    setLinks((prev) => [...prev, newLink]);
    setEditingLink(newLink.id);
  };

  const updateLink = (id: string, updates: Partial<LinkInBioLink>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i })));
    if (editingLink === id) setEditingLink(null);
  };

  const moveLink = (id: string, direction: 'up' | 'down') => {
    setLinks((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
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
  };

  const setHighlight = (id: string) => {
    setLinks((prev) => prev.map((l) => ({ ...l, isHighlight: l.id === id ? !l.isHighlight : false })));
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/ddc/linkinbio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtitle,
          backgroundImageUrl: bgImageUrl,
          accentColor,
          instagramHandle,
          rating,
          reviewCount,
          links: links.map((l, i) => ({ ...l, order: i })),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.slug) setDbSlug(data.slug);
      toast.success('Link-in-Bio salvo com sucesso!');
    } catch {
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${linkInBioUrl}`);
    toast.success('Link copiado!');
  };

  // ── Live Preview Profile ──────────────────────────────────────────────────
  const liveProfile: LinkInBioProfile = useMemo(() => ({
    id: 'ddc-preview',
    slug: dbSlug || generateSlug(propertyName) || 'sua-pousada',
    propertyName: propertyName || 'Nome da Pousada',
    subtitle: subtitle || 'Sua descrição aqui',
    avatarUrl: '',
    backgroundImageUrl: bgImageUrl,
    accentColor,
    rating: rating || undefined,
    reviewCount: reviewCount || undefined,
    whatsappNumber: whatsappNumber || undefined,
    instagramHandle: instagramHandle || undefined,
    links: links.filter((l) => l.isActive),
    isActive: true,
    plan: currentPlan,
    isBetaPartner,
    createdAt: new Date(),
    updatedAt: new Date(),
  }), [propertyName, subtitle, bgImageUrl, accentColor, rating, reviewCount, whatsappNumber, instagramHandle, links, dbSlug, currentPlan, isBetaPartner]);

  // ── LITE Lock Banner ─────────────────────────────────────────────────────
  const LiteLockBadge = ({ feature }: { feature: string }) => (
    <span className="inline-flex items-center gap-1 text-[9px] text-amber-400/70 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded ml-2">
      PRO+
    </span>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-emerald-400" />
            Link-in-Bio Profissional
            {isBetaPartner && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Beta
              </span>
            )}
          </h3>
          <p className="text-zinc-500 text-[11px] mt-0.5">{linkInBioUrl}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status */}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border w-fit flex items-center gap-1.5 ${
            (hasFullAccess || hasLiteAccess)
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-zinc-800 border-white/[0.06] text-zinc-500'
          }`}>
            {(hasFullAccess || hasLiteAccess) ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                {isLite && daysLeft !== null ? `${daysLeft} dias restantes` : 'Ativo'}
              </>
            ) : 'Inativo'}
          </span>

          <button onClick={copyLink} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all text-[10px] font-bold cursor-pointer">
            <Copy className="w-3 h-3" /> Copiar Link
          </button>

          <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all text-[10px] font-bold cursor-pointer">
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>
      </div>

      {/* ── LITE: Expiry Banner ─────────────────────────────────────────────── */}
      {isLite && (
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-blue-300">Plano LITE — Teste de {LITE_LINKINBIO_DAYS} dias</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                Seu Link-in-Bio está ativo por <strong className="text-white">{LITE_LINKINBIO_DAYS} dias</strong>. 
                Limitado a <strong className="text-white">{LITE_MAX_LINKS} links</strong>. 
                Faça upgrade para <strong className="text-emerald-400">PRO</strong> e libere tudo sem limites.
              </p>
              {daysLeft !== null && daysLeft <= 5 && (
                <div className="flex items-center gap-1.5 mt-2 text-amber-400 text-[11px] font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {daysLeft <= 0 ? 'Expirou hoje!' : `Expira em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}!`}
                </div>
              )}
              {daysLeft !== null && daysLeft > 5 && (
                <div className="flex items-center gap-1.5 mt-2 text-zinc-500 text-[11px]">
                  <Clock className="w-3 h-3" /> Restam {daysLeft} dias
                </div>
              )}
            </div>
          </div>
          <div className="ml-6.5 grid grid-cols-3 gap-2 text-[9px]">
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-center">
              <div className="text-zinc-500">Links</div>
              <div className="text-white font-bold">{links.length}/{LITE_MAX_LINKS}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-center">
              <div className="text-zinc-500">Cor</div>
              <div className="text-amber-400 font-bold">Fixa</div>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-center">
              <div className="text-zinc-500">Fundo</div>
              <div className="text-amber-400 font-bold">Bloq.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── BETA: Seal Banner ──────────────────────────────────────────────── */}
      {isBetaPartner && (
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">Selo de Parceiro Especial — Programa Beta</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                Como parceiro do Programa Beta (1 de 100), seu perfil exibe o <strong className="text-amber-300">selo exclusivo</strong> que transmite confiança no Instagram da sua pousada. O selo aparece tanto na edição quanto no perfil público.
              </p>
              {/* Mini seal preview */}
              <div className="mt-3 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-amber-500/80">Selo de Parceiro Especial</div>
                  <div className="text-[10px] font-extrabold text-amber-300">seuzella.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAN GATE: No access (trial without linkinbio) ─────────────────── */}
      {!hasFullAccess && !hasLiteAccess && (
        <div className="bg-[#121216] border border-white/[0.04] rounded-xl p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/[0.06] flex items-center justify-center text-zinc-400 shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Link-in-Bio Profissional</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed mt-1">
                Centralize seus canais e converta acessos do Instagram em reservas diretas sem comissão.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
              <div className="text-zinc-500 font-bold uppercase tracking-wider">LITE</div>
              <div className="text-white font-bold mt-1">{LITE_LINKINBIO_DAYS} dias</div>
              <div className="text-zinc-500 mt-0.5">{LITE_MAX_LINKS} links, cor fixa</div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
              <div className="text-emerald-500/70 font-bold uppercase tracking-wider">PRO / MAX</div>
              <div className="text-white font-bold mt-1">Ilimitado</div>
              <div className="text-zinc-500 mt-0.5">Links, cores, fundo, slug</div>
            </div>
          </div>
          <button className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]">
            Fazer Upgrade para LITE
          </button>
        </div>
      )}

      {/* ── CONFIG SECTIONS ────────────────────────────────────────────────── */}
      {(hasFullAccess || hasLiteAccess) && (
        <div className="space-y-3">

          {/* ── Dados do Perfil ────────────────────────────────────────────── */}
          <div className="bg-[#121216] border border-white/[0.04] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-zinc-400" /> Dados do Perfil
            </h4>

            {/* Nome (read-only, synced) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-zinc-300">Nome da Pousada</label>
              <input type="text" defaultValue={propertyName} readOnly
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg p-2.5 text-xs text-white/60" />
              <p className="text-[10px] text-zinc-600">Sincronizado com as Configurações Gerais.</p>
            </div>

            {/* Slug (PRO/MAX only editable) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-zinc-300 flex items-center gap-2">
                Seu link personalizado
                {!canEditSlug && <LiteLockBadge feature="slug" />}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500 whitespace-nowrap">seuzella.com/</span>
                <input type="text" defaultValue={dbSlug || generateSlug(propertyName) || 'sua-pousada'}
                  readOnly={!canEditSlug}
                  className={`flex-1 bg-zinc-900 border border-white/[0.08] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/30 ${!canEditSlug ? 'text-white/50' : ''}`} />
              </div>
              {!canEditSlug && <p className="text-[10px] text-zinc-600">Disponível nos planos PRO e MAX.</p>}
            </div>

            {/* Subtitle */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-zinc-300">Subtítulo</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Seu refúgio paradisíaco em Paraty, RJ" maxLength={80}
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
            </div>
          </div>

          {/* ── Contato ────────────────────────────────────────────────────── */}
          <div className="bg-[#121216] border border-white/[0.04] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-zinc-400" /> Contato
            </h4>

            {/* WhatsApp */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-zinc-300">
                <MessageCircle className="w-3 h-3 inline mr-1" /> Número do WhatsApp
              </label>
              <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="5524999999999"
                className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
              {whatsappNumber && (
                <p className="text-[10px] text-emerald-500/70">wa.me/{whatsappNumber}</p>
              )}
              <p className="text-[10px] text-zinc-600">Com DDD. Ex: 5524999999999. Usado no botão &quot;Conversar no WhatsApp&quot;.</p>
            </div>

            {/* Instagram */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-zinc-300">
                <Instagram className="w-3 h-3 inline mr-1" /> @ do Instagram
              </label>
              <div className="flex items-center">
                <span className="text-xs text-zinc-500">@</span>
                <input type="text" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value.replace('@', '').replace(/\s/g, ''))}
                  placeholder="pousadaserenity"
                  className="flex-1 bg-zinc-900 border border-white/[0.08] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 ml-1" />
              </div>
            </div>
          </div>

          {/* ── Aparência ─────────────────────────────────────────────────── */}
          <div className="bg-[#121216] border border-white/[0.04] rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-zinc-400" /> Aparência
            </h4>

            {/* Accent Color */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-300 flex items-center gap-2">
                Cor de destaque
                {!canCustomizeColor && <LiteLockBadge feature="cor" />}
              </label>
              <div className="flex gap-2 flex-wrap">
                {(isLite ? ['#10b981'] : ACCENT_PRESETS).map((c) => (
                  <button key={c} onClick={() => canCustomizeColor && setAccentColor(c)}
                    disabled={!canCustomizeColor}
                    className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer ${accentColor === c ? 'border-white scale-110' : 'border-transparent'} ${!canCustomizeColor ? 'opacity-60 cursor-not-allowed' : 'hover:border-white/30'}`}
                    style={{ backgroundColor: c }} />
                ))}
                {canCustomizeColor && (
                  <label className="w-7 h-7 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 relative overflow-hidden">
                    <span className="text-[10px] text-zinc-500">+</span>
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                )}
              </div>
              {!canCustomizeColor && <p className="text-[10px] text-zinc-600">Cor personalizada disponível no plano PRO.</p>}
            </div>

            {/* Background (PRO/MAX only) */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-zinc-300 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Imagem de Fundo
                {!canChangeBackground && <LiteLockBadge feature="fundo" />}
              </label>
              {canChangeBackground ? (
                <>
                  <div className="flex gap-2">
                    <input type="text" value={bgImageUrl} onChange={(e) => setBgImageUrl(e.target.value)}
                      placeholder="https://exemplo.com/fundo.jpg"
                      className="flex-1 bg-zinc-900 border border-white/[0.08] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
                    <button className="px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all text-[10px] font-bold cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-600">Aparece com 20% de opacidade. Recomendado: 1080x1920px.</p>
                </>
              ) : (
                <div className="bg-zinc-900/50 border border-dashed border-white/[0.06] rounded-lg p-4 text-center">
                  <ImageIcon className="w-5 h-5 text-zinc-700 mx-auto mb-1" />
                  <p className="text-[10px] text-zinc-600">Disponível nos planos PRO e MAX</p>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-zinc-300">
                <Star className="w-3 h-3 inline mr-1" /> Avaliação (Google/Booking)
              </label>
              <div className="flex items-center gap-2">
                <input type="number" step="0.1" min="0" max="5" value={rating || ''} onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                  placeholder="4.9" className="w-16 bg-zinc-900 border border-white/[0.08] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
                <input type="number" min="0" value={reviewCount || ''} onChange={(e) => setReviewCount(parseInt(e.target.value) || 0)}
                  placeholder="128" className="w-20 bg-zinc-900 border border-white/[0.08] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
                <span className="text-[10px] text-zinc-500">avaliações</span>
              </div>
            </div>
          </div>

          {/* ── Links ──────────────────────────────────────────────────────── */}
          <div className="bg-[#121216] border border-white/[0.04] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-zinc-400" /> Links
                <span className="text-[10px] text-zinc-500 font-normal">({links.filter((l) => l.isActive).length}{isLite ? `/${LITE_MAX_LINKS}` : ''} ativos)</span>
              </h4>
              {isLite && links.length >= LITE_MAX_LINKS && (
                <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  Máx. {LITE_MAX_LINKS} no LITE
                </span>
              )}
            </div>

            {/* Link list */}
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={link.id} className="group">
                  {editingLink !== link.id ? (
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
                      link.isHighlight ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/[0.02]'
                    }`}>
                      <GripVertical className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      <span className="text-sm">{link.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">{link.label}</div>
                        <div className="text-[9px] text-zinc-600 truncate">{link.url || 'Sem URL'}</div>
                      </div>
                      {link.isHighlight && <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 shrink-0" />}
                      <button onClick={() => moveLink(link.id, 'up')} disabled={idx === 0}
                        className="p-1 text-zinc-600 hover:text-white disabled:opacity-20 cursor-pointer transition-colors">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveLink(link.id, 'down')} disabled={idx === links.length - 1}
                        className="p-1 text-zinc-600 hover:text-white disabled:opacity-20 cursor-pointer transition-colors">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setHighlight(link.id)}
                        className={`p-1 cursor-pointer transition-colors ${link.isHighlight ? 'text-emerald-400' : 'text-zinc-600 hover:text-amber-400'}`}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingLink(link.id)} className="p-1 text-zinc-600 hover:text-white cursor-pointer transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeLink(link.id)} className="p-1 text-zinc-600 hover:text-red-400 cursor-pointer transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Expanded editing */
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-bold">Editando Link</span>
                        <button onClick={() => setEditingLink(null)} className="text-zinc-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      {/* Icon picker */}
                      <div className="flex flex-wrap gap-1.5 relative">
                        <button onClick={() => setShowIconPicker(!showIconPicker)}
                          className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-lg hover:bg-white/[0.1] transition-colors cursor-pointer">
                          {link.icon || '🔗'}
                        </button>
                        {showIconPicker && (
                          <div className="absolute z-20 top-9 left-0 bg-zinc-900 border border-white/10 rounded-xl p-2 grid grid-cols-7 gap-1 shadow-2xl">
                            {(canUseAllIcons ? EMOJI_OPTIONS : EMOJI_OPTIONS.slice(0, 8)).map((emoji) => (
                              <button key={emoji} onClick={() => { updateLink(link.id, { icon: emoji }); setShowIconPicker(false); }}
                                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-base transition-colors cursor-pointer">
                                {emoji}
                              </button>
                            ))}
                            {!canUseAllIcons && <span className="col-span-7 text-[8px] text-zinc-600 text-center py-1">+icons no PRO</span>}
                          </div>
                        )}
                      </div>
                      <input type="text" value={link.label} onChange={(e) => updateLink(link.id, { label: e.target.value })}
                        placeholder="Texto do botão"
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
                      <input type="url" value={link.url} onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        placeholder="https://wa.me/5524999999999?text=Olá"
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
                      {/* WhatsApp auto-fill */}
                      {whatsappNumber && (
                        <button onClick={() => updateLink(link.id, { url: buildWhatsAppUrl(whatsappNumber, 'Olá! Gostaria de fazer uma reserva.') })}
                          className="flex items-center gap-1 text-[10px] text-emerald-500/60 hover:text-emerald-400 transition-colors cursor-pointer">
                          <MessageCircle className="w-3 h-3" /> Auto-preencher WhatsApp
                        </button>
                      )}
                      <button onClick={() => setEditingLink(null)}
                        className="w-full py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/20 transition-all cursor-pointer">
                        Concluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add link */}
            <button onClick={addLink} disabled={!canAddMoreLinks}
              className={`w-full py-2.5 border-2 border-dashed rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                canAddMoreLinks
                  ? 'border-white/10 text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-400'
                  : 'border-white/[0.04] text-zinc-700 cursor-not-allowed'
              }`}>
              <Plus className="w-4 h-4" />
              {canAddMoreLinks ? 'Adicionar Link' : `Máximo de ${LITE_MAX_LINKS} links (upgrade PRO)`}
            </button>
          </div>

          {/* ── Save + Actions ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button onClick={handleSave} disabled={isSaving}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50">
              {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : <><Save className="w-3.5 h-3.5" /> Salvar Alterações</>}
            </button>

            {/* Cancel Account / Downgrade to Link-in-Bio only */}
            <button onClick={() => setShowCancelModal(true)}
              className="px-3 py-2.5 bg-transparent border border-red-500/15 text-red-400/70 hover:text-red-400 hover:border-red-500/30 font-bold text-[10px] rounded-lg flex items-center gap-1.5 cursor-pointer transition-all">
              <LogOut className="w-3.5 h-3.5" /> Cancelar Plano
            </button>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[400px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowPreview(false)}
                className="absolute -top-10 right-0 text-zinc-400 hover:text-white cursor-pointer flex items-center gap-1.5 text-xs">
                <X className="w-4 h-4" /> Fechar
              </button>
              <div className="rounded-[2rem] border-[5px] border-zinc-800 overflow-hidden shadow-2xl">
                <LinkInBioPage profile={liveProfile} isPreview={false} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CANCEL MODAL — Offer R$47 Link-in-Bio Standalone ──────────────── */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0f] border border-white/[0.08] rounded-2xl p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button onClick={() => setShowCancelModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>

              {/* Warning icon */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Cancelar plano SeuZélla?</h3>
                  <p className="text-zinc-400 text-[11px] leading-relaxed mt-1">
                    Ao cancelar, seu Link-in-Bio, o Cérebro Zélla (IA no WhatsApp), e todas as funcionalidades do DDC serão <strong className="text-red-400">desativados</strong>.
                  </p>
                </div>
              </div>

              {/* What happens */}
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-2">
                <p className="text-[11px] font-bold text-red-300 uppercase tracking-wider">O que acontece ao cancelar:</p>
                <ul className="space-y-1.5 text-[11px] text-zinc-400">
                  <li className="flex items-start gap-2">
                    <X className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                    <span>O <strong className="text-white">Cérebro Zélla</strong> para de responder seu WhatsApp automaticamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                    <span>Seu <strong className="text-white">Link-in-Bio</strong> ficará inacessível</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                    <span>Dashboard, métricas e histórico serão <strong className="text-white">apagados</strong></span>
                  </li>
                </ul>
              </div>

              {/* R$47 Offer */}
              <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs font-extrabold text-emerald-300">Mas temos uma oferta para você:</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-white">R$ {LINKINBIO_STANDALONE_PRICE},00</span>
                  <span className="text-xs text-zinc-400">/mês</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Mantenha apenas o seu <strong className="text-white">Link-in-Bio Profissional</strong> ativo no Instagram da sua pousada. Perfil completo com todos os links, aparência personalizada e o selo de confiança.
                </p>

                {/* IMPORTANT WARNING */}
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                  <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> Atenção
                  </p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">
                    Neste plano, <strong className="text-white">você é quem responde o WhatsApp</strong> da sua pousada. O Cérebro Zélla (IA) será desligado e não responderá mais seus hóspedes automaticamente.
                  </p>
                </div>

                {/* What's included */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Link-in-Bio ativo
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Links ilimitados
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Cores personalizadas
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Preview ao vivo
                  </div>
                  {isBetaPartner && (
                    <div className="flex items-center gap-1.5 text-amber-400 col-span-2">
                      <ShieldCheck className="w-3 h-3" /> Selo de Parceiro Especial mantido
                    </div>
                  )}
                </div>

                {/* What's NOT included */}
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5 text-red-400/70">
                    <X className="w-3 h-3" /> Sem Cérebro Zélla (IA desligada)
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400/70">
                    <X className="w-3 h-3" /> Sem Dashboard DDC
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400/70">
                    <X className="w-3 h-3" /> Sem PIX automático
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400/70">
                    <X className="w-3 h-3" /> Você responde o WhatsApp
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    toast.success('Oferta Link-in-Bio ativada! Você será redirecionado para o pagamento.');
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  Manter Link-in-Bio por R$ {LINKINBIO_STANDALONE_PRICE},00/mês
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    toast.error('Seu perfil será desativado após o período atual.');
                  }}
                  className="w-full py-2.5 bg-transparent border border-red-500/15 text-red-400/70 hover:text-red-400 hover:border-red-500/30 font-bold text-[10px] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  Cancelar tudo (desativar perfil)
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="w-full py-2 text-zinc-600 hover:text-zinc-300 text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Voltar ao SeuZélla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}