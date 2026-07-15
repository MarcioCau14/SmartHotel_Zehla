'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type PlanTier, PLAN_DISPLAY } from '@/lib/plan-features';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Home,
  Plus,
  Search,
  ExternalLink,
  MapPin,
  BedDouble,
  Bath,
  Users,
  Wifi,
  Key,
  Star,
  Loader2,
  Sparkles,
  Trash2,
  Eye,
  MessageSquare,
  ChevronRight,
  Clock,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AirBPropertyData {
  id: string;
  airbnbId: string | null;
  airbnbUrl: string | null;
  name: string;
  description: string;
  propertyType: string;
  city: string;
  state: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string;
  houseRules: string;
  checkinTime: string;
  checkoutTime: string;
  wifiName: string | null;
  wifiPassword: string | null;
  lockProvider: string | null;
  lockCode: string | null;
  imageUrl: string | null;
  pricePerNight: number | null;
  status: string;
  scrapedAt: string | null;
  scrapingSource: string | null;
  _count?: { conversations: number };
  createdAt: string;
}

interface AirBConversationData {
  id: string;
  guestName: string;
  guestPhone: string | null;
  mode: string;
  status: string;
  lastIntent: string | null;
  lastMessageAt: string | null;
  messageCount: number;
  property: { name: string };
  createdAt: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const PROPERTY_TYPES: Record<string, string> = {
  apartment: 'Apartamento',
  house: 'Casa',
  loft: 'Loft',
  studio: 'Studio',
  chalet: 'Chalé',
  villa: 'Villa',
};

const MAX_PROPERTIES: Record<string, number> = { pro: 4, max: 12 };

const DEMO_PROPERTIES = [
  { airbnbId: '18584298', name: 'Apartamento Vista Mar - Jurerê Internacional', city: 'Florianópolis', state: 'SC', propertyType: 'apartment', bedrooms: 2, bathrooms: 1, maxGuests: 4, pricePerNight: 350, neighborhood: 'Jurerê Internacional', imageUrl: '' },
  { airbnbId: '9283741', name: 'Studio Moderno - Copacabana', city: 'Rio de Janeiro', state: 'RJ', propertyType: 'studio', bedrooms: 1, bathrooms: 1, maxGuests: 2, pricePerNight: 220, neighborhood: 'Copacabana', imageUrl: '' },
  { airbnbId: '51928403', name: 'Casa com Piscina - Campos do Jordão', city: 'Campos do Jordão', state: 'SP', propertyType: 'house', bedrooms: 3, bathrooms: 2, maxGuests: 6, pricePerNight: 580, neighborhood: 'Alto do Capivari', imageUrl: '' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function PropertyCard({ property, onDelete }: { property: AirBPropertyData; onDelete: (id: string) => void }) {
  const amenities = JSON.parse(property.amenities || '[]');
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121216]/80 border border-white/[0.06] rounded-xl overflow-hidden hover:border-emerald-500/20 transition-all group"
    >
      {/* Image placeholder */}
      <div className="h-32 bg-gradient-to-br from-emerald-900/30 to-teal-900/20 flex items-center justify-center relative">
        <Home className="w-10 h-10 text-emerald-500/30" />
        {property.airbnbId && (
          <a
            href={property.airbnbUrl || `https://www.airbnb.com.br/rooms/${property.airbnbId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 p-1.5 rounded-md bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 text-[#FF5A5F] hover:bg-[#FF5A5F]/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        {property.scrapedAt && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-bold text-emerald-400 uppercase">Auto-filled</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-white truncate">{property.name}</h4>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
            <span className="text-[11px] text-zinc-400 truncate">{property.neighborhood}{property.neighborhood && ', '}{property.city}/{property.state}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{property.bedrooms}</div>
          <div className="flex items-center gap-1"><Bath className="w-3 h-3" />{property.bathrooms}</div>
          <div className="flex items-center gap-1"><Users className="w-3 h-3" />{property.maxGuests}</div>
          {property.wifiName && <div className="flex items-center gap-1"><Wifi className="w-3 h-3 text-emerald-400" /></div>}
          {property.lockCode && <div className="flex items-center gap-1"><Key className="w-3 h-3 text-amber-400" /></div>}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div>
            {property.pricePerNight && (
              <span className="text-sm font-bold text-white">R${property.pricePerNight}</span>
            )}
            {property.pricePerNight && <span className="text-[10px] text-zinc-500">/noite</span>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              {PROPERTY_TYPES[property.propertyType] || property.propertyType}
            </Badge>
            <button
              onClick={() => onDelete(property.id)}
              className="p-1 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {property._count && property._count.conversations > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            <MessageSquare className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-bold">{property._count.conversations} conversa{property._count.conversations > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ConversationRow({ conversation }: { conversation: AirBConversationData }) {
  const modeLabel = conversation.mode === 'pre_booking' ? 'Pré-reserva' : 'Pós-reserva';
  const modeColor = conversation.mode === 'pre_booking' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  const statusColor = conversation.status === 'active' ? 'text-emerald-400' : conversation.status === 'escalated' ? 'text-amber-400' : 'text-zinc-400';

  return (
    <div className="flex items-center gap-4 py-3 px-4 bg-[#121216]/40 border border-white/[0.03] rounded-lg hover:border-white/[0.06] transition-colors">
      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-emerald-400">{conversation.guestName.charAt(0)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">{conversation.guestName}</span>
          <Badge variant="outline" className={`text-[8px] px-1 py-0 ${modeColor}`}>{modeLabel}</Badge>
        </div>
        <span className="text-[10px] text-zinc-500 block">{conversation.property.name}</span>
      </div>
      <div className="text-right shrink-0">
        <span className={`text-[10px] font-bold ${statusColor}`}>{conversation.status}</span>
        <span className="text-[10px] text-zinc-600 block">{conversation.messageCount} msgs</span>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface ZellaAirBTabProps {
  currentPlan: PlanTier;
  onUpgrade: () => void;
}

export function ZellaAirBTab({ currentPlan, onUpgrade }: ZellaAirBTabProps) {
  // State
  const [properties, setProperties] = useState<AirBPropertyData[]>([]);
  const [conversations, setConversations] = useState<AirBConversationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'properties' | 'conversations' | 'onboarding'>('onboarding');
  const [newProperty, setNewProperty] = useState({
    name: '', airbnbId: '', airbnbUrl: '', city: '', state: '', propertyType: 'apartment',
    bedrooms: '1', bathrooms: '1', maxGuests: '2', checkinTime: '15:00', checkoutTime: '11:00',
    wifiName: '', wifiPassword: '', lockProvider: '', lockCode: '', pricePerNight: '',
  });

  // Data loading
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [propRes, convRes] = await Promise.all([
        fetch('/api/ddc/airb/properties'),
        fetch('/api/ddc/airb/conversations'),
      ]);
      if (propRes.ok) {
        const propData = await propRes.json();
        setProperties(propData.data || []);
      }
      if (convRes.ok) {
        const convData = await convRes.json();
        setConversations(convData.data || []);
      }
    } catch (err) {
      console.error('Error loading AirB data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Magic Onboarding — Scrape Airbnb listing
  async function handleScrape() {
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    try {
      const res = await fetch('/api/ddc/airb/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        // Pre-fill the form with scraped data
        const scraped = data.data;
        setNewProperty({
          name: scraped.name || '',
          airbnbId: scraped.airbnbId || '',
          airbnbUrl: scraped.airbnbUrl || scrapeUrl,
          city: scraped.city || '',
          state: scraped.state || '',
          propertyType: scraped.propertyType || 'apartment',
          bedrooms: String(scraped.bedrooms || 1),
          bathrooms: String(scraped.bathrooms || 1),
          maxGuests: String(scraped.maxGuests || 2),
          checkinTime: scraped.checkinTime || '15:00',
          checkoutTime: scraped.checkoutTime || '11:00',
          wifiName: '', wifiPassword: '', lockProvider: '', lockCode: '',
          pricePerNight: scraped.pricePerNight ? String(scraped.pricePerNight) : '',
        });
        setShowAddForm(true);
        setActiveSubTab('properties');
        toast.success('Dados do Airbnb capturados! Revise e confirme o cadastro.');
      } else {
        toast.error(data.error || 'Não foi possível raspar os dados do Airbnb.');
      }
    } catch {
      toast.error('Erro ao conectar com o serviço de scraping.');
    } finally {
      setScraping(false);
    }
  }

  // Create property
  async function handleCreateProperty() {
    try {
      const res = await fetch('/api/ddc/airb/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProperty,
          bedrooms: Number(newProperty.bedrooms),
          bathrooms: Number(newProperty.bathrooms),
          maxGuests: Number(newProperty.maxGuests),
          pricePerNight: newProperty.pricePerNight ? Number(newProperty.pricePerNight) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Imóvel Airbnb cadastrado com sucesso!');
        setShowAddForm(false);
        setNewProperty({ name: '', airbnbId: '', airbnbUrl: '', city: '', state: '', propertyType: 'apartment', bedrooms: '1', bathrooms: '1', maxGuests: '2', checkinTime: '15:00', checkoutTime: '11:00', wifiName: '', wifiPassword: '', lockProvider: '', lockCode: '', pricePerNight: '' });
        setScrapeUrl('');
        loadData();
      } else {
        toast.error(data.error || 'Erro ao cadastrar imóvel.');
      }
    } catch {
      toast.error('Erro ao cadastrar imóvel.');
    }
  }

  // Delete property
  async function handleDeleteProperty(id: string) {
    if (!confirm('Tem certeza que deseja remover este imóvel?')) return;
    try {
      const res = await fetch(`/api/ddc/airb/properties?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Imóvel removido.');
        loadData();
      }
    } catch {
      toast.error('Erro ao remover imóvel.');
    }
  }

  // Plan limits
  const maxProps = MAX_PROPERTIES[currentPlan] || 4;
  const canAdd = properties.length < maxProps;
  const planLabel = PLAN_DISPLAY[currentPlan]?.label || currentPlan.toUpperCase();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF5A5F]/10 flex items-center justify-center border border-[#FF5A5F]/20">
              <Home className="w-4 h-4 text-[#FF5A5F]" />
            </div>
            <h2 className="text-lg font-bold text-white">Zélla AirB</h2>
            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              {planLabel}
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Seu zelador digital para imóveis Airbnb — responda como o dono que sabe tudo.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-zinc-500 block">{properties.length}/{maxProps} imóveis</span>
            <span className="text-[10px] text-emerald-400 font-mono">{conversations.filter(c => c.status === 'active').length} conversas ativas</span>
          </div>
          <Button
            onClick={() => { setShowAddForm(true); setActiveSubTab('properties'); }}
            disabled={!canAdd}
            size="sm"
            className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/80 text-white gap-1.5 text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Imóvel
          </Button>
        </div>
      </div>

      {/* Magic Onboarding — Scrape Section */}
      <div className="bg-gradient-to-r from-[#FF5A5F]/5 to-transparent border border-[#FF5A5F]/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#FF5A5F]" />
          <span className="text-xs font-bold text-white">Magic Onboarding</span>
          <span className="text-[9px] bg-[#FF5A5F]/10 text-[#FF5A5F] border border-[#FF5A5F]/20 px-1.5 py-0.5 rounded font-bold uppercase">Novo</span>
        </div>
        <p className="text-[11px] text-zinc-400 mb-3">Cole o link do Airbnb ou o código do imóvel e preenchemos o cadastro automaticamente.</p>
        <div className="flex gap-2">
          <Input
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            placeholder="https://www.airbnb.com.br/rooms/18584298 ou código"
            className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs placeholder:text-zinc-600 flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
          />
          <Button
            onClick={handleScrape}
            disabled={scraping || !scrapeUrl.trim()}
            size="sm"
            className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/80 text-white gap-1.5 text-xs font-bold shrink-0"
          >
            {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {scraping ? 'Raspando...' : 'Raspar Dados'}
          </Button>
        </div>

        {/* Demo property suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Testar:</span>
          {DEMO_PROPERTIES.map((demo) => (
            <button
              key={demo.airbnbId}
              onClick={() => setScrapeUrl(`https://www.airbnb.com.br/rooms/${demo.airbnbId}`)}
              className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.05] text-zinc-400 hover:text-white hover:border-white/[0.1] transition-colors cursor-pointer"
            >
              {demo.airbnbId} — {demo.name.split(' - ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.04] pb-1">
        <button
          onClick={() => setActiveSubTab('onboarding')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'onboarding'
              ? 'text-white bg-white/[0.04] border-b-2 border-[#FF5A5F]'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Visão Geral
        </button>
        <button
          onClick={() => setActiveSubTab('properties')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'properties'
              ? 'text-white bg-white/[0.04] border-b-2 border-[#FF5A5F]'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          Imóveis ({properties.length})
        </button>
        <button
          onClick={() => setActiveSubTab('conversations')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs font-bold transition-colors cursor-pointer ${
            activeSubTab === 'conversations'
              ? 'text-white bg-white/[0.04] border-b-2 border-[#FF5A5F]'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Conversas ({conversations.length})
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ── ONBOARDING / OVERVIEW ─────────────────────────────── */}
        {activeSubTab === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#121216]/60 border border-white/[0.04] rounded-xl p-4">
                <Home className="w-4 h-4 text-[#FF5A5F] mb-2" />
                <span className="text-xl font-bold text-white block">{properties.filter(p => p.status === 'active').length}</span>
                <span className="text-[10px] text-zinc-500">Imóveis Ativos</span>
              </div>
              <div className="bg-[#121216]/60 border border-white/[0.04] rounded-xl p-4">
                <MessageSquare className="w-4 h-4 text-emerald-400 mb-2" />
                <span className="text-xl font-bold text-white block">{conversations.filter(c => c.status === 'active').length}</span>
                <span className="text-[10px] text-zinc-500">Conversas Ativas</span>
              </div>
              <div className="bg-[#121216]/60 border border-white/[0.04] rounded-xl p-4">
                <Search className="w-4 h-4 text-blue-400 mb-2" />
                <span className="text-xl font-bold text-white block">{conversations.filter(c => c.mode === 'pre_booking').length}</span>
                <span className="text-[10px] text-zinc-500">Pré-reserva</span>
              </div>
              <div className="bg-[#121216]/60 border border-white/[0.04] rounded-xl p-4">
                <Shield className="w-4 h-4 text-amber-400 mb-2" />
                <span className="text-xl font-bold text-white block">{conversations.filter(c => c.mode === 'post_booking').length}</span>
                <span className="text-[10px] text-zinc-500">Pós-reserva</span>
              </div>
            </div>

            {/* What Zélla AirB Does */}
            <div className="bg-[#121216]/60 border border-white/[0.04] rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF5A5F]" />
                O que o Zélla AirB faz por você
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Responde no WhatsApp</span>
                    <span className="text-[10px] text-zinc-500">Como o dono que sabe tudo — tom pessoal, íntimo</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <Eye className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Detecta pré/pós-reserva</span>
                    <span className="text-[10px] text-zinc-500">Automaticamente muda o comportamento da IA</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Magic Onboarding</span>
                    <span className="text-[10px] text-zinc-500">Cole o link do Airbnb e preenchemos ~78% do cadastro</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">One-Shot Resolution</span>
                    <span className="text-[10px] text-zinc-500">Resposta densa e completa para minimizar custos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Info */}
            <div className="bg-[#121216]/60 border border-white/[0.04] rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Seu Plano Zélla AirB
              </h3>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${currentPlan === 'max' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {planLabel}
                </div>
                <div className="text-xs text-zinc-400">
                  <span className="text-white font-bold">{properties.length}/{maxProps}</span> imóveis • <span className="text-white font-bold">1</span> WhatsApp{currentPlan === 'max' ? ' (até 3)' : ''}
                </div>
                {currentPlan === 'pro' && (
                  <Button variant="outline" size="sm" onClick={onUpgrade} className="text-[10px] ml-auto border-amber-500/20 text-amber-400 hover:bg-amber-500/10">
                    Upgrade MAX →
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PROPERTIES ─────────────────────────────────────── */}
        {activeSubTab === 'properties' && (
          <motion.div key="properties" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Add Property Form */}
            {showAddForm && (
              <div className="bg-[#121216]/80 border border-[#FF5A5F]/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#FF5A5F]" />
                    Cadastrar Imóvel Airbnb
                  </h3>
                  <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-white/[0.04] rounded text-zinc-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Nome do Imóvel</Label>
                    <Input value={newProperty.name} onChange={(e) => setNewProperty(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Apartamento Vista Mar" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">ID Airbnb</Label>
                    <Input value={newProperty.airbnbId} onChange={(e) => setNewProperty(p => ({ ...p, airbnbId: e.target.value }))} placeholder="18584298" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">URL Airbnb</Label>
                    <Input value={newProperty.airbnbUrl} onChange={(e) => setNewProperty(p => ({ ...p, airbnbUrl: e.target.value }))} placeholder="https://www.airbnb.com.br/rooms/..." className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Cidade</Label>
                    <Input value={newProperty.city} onChange={(e) => setNewProperty(p => ({ ...p, city: e.target.value }))} placeholder="Florianópolis" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Estado</Label>
                    <Input value={newProperty.state} onChange={(e) => setNewProperty(p => ({ ...p, state: e.target.value }))} placeholder="SC" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Tipo</Label>
                    <select value={newProperty.propertyType} onChange={(e) => setNewProperty(p => ({ ...p, propertyType: e.target.value }))} className="w-full h-9 px-3 rounded-md bg-[#0a0a0f] border border-white/[0.06] text-white text-xs">
                      {Object.entries(PROPERTY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Quartos</Label>
                    <Input type="number" value={newProperty.bedrooms} onChange={(e) => setNewProperty(p => ({ ...p, bedrooms: e.target.value }))} className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Banheiros</Label>
                    <Input type="number" value={newProperty.bathrooms} onChange={(e) => setNewProperty(p => ({ ...p, bathrooms: e.target.value }))} className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Hóspedes Máx.</Label>
                    <Input type="number" value={newProperty.maxGuests} onChange={(e) => setNewProperty(p => ({ ...p, maxGuests: e.target.value }))} className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Preço/Noite (R$)</Label>
                    <Input type="number" value={newProperty.pricePerNight} onChange={(e) => setNewProperty(p => ({ ...p, pricePerNight: e.target.value }))} placeholder="350" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">WiFi Nome</Label>
                    <Input value={newProperty.wifiName} onChange={(e) => setNewProperty(p => ({ ...p, wifiName: e.target.value }))} placeholder="MinhaRede_5G" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">WiFi Senha</Label>
                    <Input value={newProperty.wifiPassword} onChange={(e) => setNewProperty(p => ({ ...p, wifiPassword: e.target.value }))} placeholder="senha123" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Check-in</Label>
                    <Input value={newProperty.checkinTime} onChange={(e) => setNewProperty(p => ({ ...p, checkinTime: e.target.value }))} placeholder="15:00" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Check-out</Label>
                    <Input value={newProperty.checkoutTime} onChange={(e) => setNewProperty(p => ({ ...p, checkoutTime: e.target.value }))} placeholder="11:00" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Fechadura Inteligente</Label>
                    <Input value={newProperty.lockProvider} onChange={(e) => setNewProperty(p => ({ ...p, lockProvider: e.target.value }))} placeholder="Igloohome / Nuki" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-400 mb-1 block">Código da Fechadura</Label>
                    <Input value={newProperty.lockCode} onChange={(e) => setNewProperty(p => ({ ...p, lockCode: e.target.value }))} placeholder="1234#" className="bg-[#0a0a0f] border-white/[0.06] text-white text-xs" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.04]">
                  <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)} className="text-xs border-white/[0.08] text-zinc-400">
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleCreateProperty} disabled={!newProperty.name.trim()} className="bg-[#FF5A5F] hover:bg-[#FF5A5F]/80 text-white text-xs font-bold gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cadastrar Imóvel
                  </Button>
                </div>
              </div>
            )}

            {/* Properties Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 bg-[#121216]/40 border border-white/[0.03] rounded-xl">
                <Home className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400 font-bold">Nenhum imóvel Airbnb cadastrado</p>
                <p className="text-xs text-zinc-600 mt-1">Use o Magic Onboarding acima para cadastrar seu primeiro imóvel.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} onDelete={handleDeleteProperty} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── CONVERSATIONS ──────────────────────────────────── */}
        {activeSubTab === 'conversations' && (
          <motion.div key="conversations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 bg-[#121216]/40 border border-white/[0.03] rounded-xl">
                <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400 font-bold">Nenhuma conversa ainda</p>
                <p className="text-xs text-zinc-600 mt-1">Quando hóspedes enviarem mensagens no WhatsApp, aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                {conversations.map((conv) => (
                  <ConversationRow key={conv.id} conversation={conv} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
