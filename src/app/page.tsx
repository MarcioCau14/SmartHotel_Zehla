'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Home, Building2, MessageSquare, BarChart3, Settings, Plus, Search,
  Wifi, Key, MapPin, Star, Users, BedDouble, Bath, ChevronRight,
  ArrowLeft, Loader2, CheckCircle2, AlertCircle, Sparkles, Trash2,
  Bot, User, Phone, Clock, TrendingUp, DollarSign, Zap, Shield, Globe, X,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ModeSelectionScreen } from '@/components/ddc/ModeSelectionScreen'
import { OnboardingScreen } from '@/components/ddc/OnboardingScreen'

// ── Types ──────────────────────────────────────────────────────────────────

export type DDCView = 'dashboard' | 'properties' | 'property-new' | 'property-detail' | 'conversations' | 'conversation-detail' | 'analytics' | 'settings'

interface TenantInfo {
  id: string
  name: string
  mode: 'pousada' | 'airbnb'
  planSlug: 'pro' | 'max'
  onboardingComplete: boolean
}

export interface PropertyInfo {
  id: string
  airbnbId: string
  listingUrl: string | null
  name: string
  propertyType: string | null
  accommodates: number | null
  bedrooms: number | null
  beds: number | null
  bathrooms: number | null
  neighborhood: string | null
  city: string | null
  state: string | null
  rating: number | null
  reviewCount: number | null
  basePrice: number | null
  currency: string
  amenities: string | null
  photoCount: number | null
  highlights: string | null
  aiSummary: string | null
  scrapingStatus: string
  lastScrapedAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Private fields
  description?: string | null
  wifiName?: string | null
  wifiPassword?: string | null
  lockboxCode?: string | null
  lockboxLocation?: string | null
  accessInstructions?: string | null
  emergencyContact?: string | null
  maintenanceContact?: string | null
  alarmCode?: string | null
  gateCode?: string | null
  parkingSpot?: string | null
  personalLocalTips?: string | null
  favoriteRestaurants?: string | null
  supermarketLocation?: string | null
  additionalRules?: string | null
  quietHoursStart?: string | null
  quietHoursEnd?: string | null
  customCheckInInstructions?: string | null
  customCheckOutInstructions?: string | null
  internalNotes?: string | null
  hostIsSuperhost?: boolean
  hostName?: string | null
  hostResponseRate?: number | null
  hostResponseTime?: string | null
  sellingPoints?: string | null
  targetAudience?: string | null
  localTipsFromReviews?: string | null
  reviewSentiment?: string | null
  keywords?: string | null
}

interface ConversationInfo {
  id: string
  guestName: string | null
  guestPhone: string | null
  conversationMode: string
  status: string
  property: { name: string; city: string | null; id?: string } | null
  messages: Array<{ content: string; direction: string; intent: string | null; isAiGenerated: boolean; createdAt: string }>
  updatedAt: string
}

interface DashboardStats {
  tenant: { id: string; name: string; mode: string; onboardingComplete: boolean }
  plan: { slug: string; name: string; priceFormatted: string; maxProperties: number; currentProperties: number; usagePercent: number } | null
  properties: { total: number; complete: number; pending: number }
  conversations: { total: number; active: number; preBooking: number; postBooking: number; avgMessagesPerConversation: number }
  messages: { total: number; aiGenerated: number; humanGenerated: number }
  costs: { estimatedWhatsappCost: number; estimatedLLMCost: number; totalEstimated: number }
  recentConversations: Array<{
    id: string; guestName: string | null; mode: string; status: string
    property: string; lastMessage: string; updatedAt: string
  }>
}

// ── Shared Helpers ─────────────────────────────────────────────────────────

function parseJsonField(field: string | null | undefined): string[] {
  if (!field) return []
  try {
    return typeof field === 'string' ? JSON.parse(field) : []
  } catch {
    return []
  }
}

// ── NavItem Component ──────────────────────────────────────────────────────

function NavItem({ icon: Icon, label, active, collapsed, onClick, badge }: {
  icon: React.ComponentType<{ className?: string }>; label: string; active: boolean
  collapsed: boolean; onClick: () => void; badge?: string
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50'
      }`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          {badge && <Badge variant="secondary" className="text-[9px] h-4">{badge}</Badge>}
        </>
      )}
    </button>
  )
}

// ── StatsCard Component ────────────────────────────────────────────────────

function StatsCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string; value: string | number; subtitle: string
  icon: React.ComponentType<{ className?: string }>; trend?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">{subtitle}</span>
          {trend && (
            <span className="text-xs text-primary flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── PropertyPreviewCard ────────────────────────────────────────────────────

function PropertyPreviewCard({ data, enriched }: { data: Record<string, unknown>; enriched: Record<string, unknown> | null }) {
  const highlights = enriched?.highlights
    ? (Array.isArray(enriched.highlights) ? enriched.highlights as string[] : [])
    : []
  const amenities = data.amenities
    ? (Array.isArray(data.amenities) ? data.amenities as string[] : [])
    : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tipo', value: data.propertyType === 'entire_home' ? 'Imóvel inteiro' : data.propertyType ?? '-' },
          { label: 'Hóspedes', value: data.accommodates ?? '-' },
          { label: 'Quartos', value: data.bedrooms ?? '-' },
          { label: 'Banheiros', value: data.bathrooms ?? '-' },
        ].map(item => (
          <div key={item.label} className="text-center p-2 rounded bg-muted/50">
            <div className="text-lg font-semibold">{String(item.value)}</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Localização:</span>{' '}
          <span className="font-medium">{[data.neighborhood, data.city, data.state].filter(Boolean).join(', ')}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Avaliação:</span>{' '}
          <span className="font-medium flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" /> {String(data.rating)} ({String(data.reviewCount)} reviews)
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Preço base:</span>{' '}
          <span className="font-medium">R$ {String(data.basePrice)}/noite</span>
        </div>
        <div>
          <span className="text-muted-foreground">Anfitrião:</span>{' '}
          <span className="font-medium flex items-center gap-1">
            {String(data.hostName ?? '-')}
            {data.hostIsSuperhost && <Shield className="h-3 w-3 text-primary" />}
          </span>
        </div>
      </div>

      {highlights.length > 0 && (
        <div>
          <span className="text-xs text-muted-foreground">Destaques (AI):</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {highlights.map((h, i) => (
              <Badge key={i} variant="outline" className="text-xs">{h}</Badge>
            ))}
          </div>
        </div>
      )}

      {amenities.length > 0 && (
        <div>
          <span className="text-xs text-muted-foreground">Amenidades ({amenities.length}):</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {amenities.slice(0, 8).map((a, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">{a}</Badge>
            ))}
            {amenities.length > 8 && (
              <Badge variant="secondary" className="text-[10px]">+{amenities.length - 8} mais</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Dashboard View ─────────────────────────────────────────────────────────

function DashboardView({ stats, conversations, onNavigate }: {
  stats: DashboardStats | null
  conversations: ConversationInfo[]
  onNavigate: (view: DDCView, data?: unknown) => void
}) {
  if (!stats) return <div className="p-8 text-muted-foreground">Carregando...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{stats.tenant.name} — {stats.tenant.mode === 'airbnb' ? 'Imóveis Airbnb' : 'Pousadas'}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {stats.plan?.name} — {stats.plan?.priceFormatted}/mês
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Imóveis" value={stats.properties.total} subtitle={`${stats.properties.complete} completos, ${stats.properties.pending} pendentes`} icon={Building2} trend={`${stats.plan?.currentProperties}/${stats.plan?.maxProperties}`} />
        <StatsCard title="Conversas" value={stats.conversations.total} subtitle={`${stats.conversations.active} ativas`} icon={MessageSquare} trend={`${stats.conversations.preBooking} vendas`} />
        <StatsCard title="Mensagens IA" value={stats.messages.aiGenerated} subtitle={`de ${stats.messages.total} total`} icon={Bot} trend="One-Shot" />
        <StatsCard title="Custo Estimado" value={`R$ ${stats.costs.totalEstimated.toFixed(2)}`} subtitle={`WhatsApp R$${stats.costs.estimatedWhatsappCost.toFixed(2)}`} icon={DollarSign} trend="Este mês" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pré-Reserva (Vendas)</CardTitle>
            <CardDescription>Hóspedes interessados — modo argumentação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">{stats.conversations.preBooking}</div>
              <div className="text-sm text-muted-foreground">conversas ativas<br />com potencial de reserva</div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              {stats.recentConversations.filter(c => c.mode === 'pre_booking').slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{c.guestName?.charAt(0) ?? '?'}</AvatarFallback></Avatar>
                    <span>{c.guestName ?? 'Hóspede'}</span>
                  </div>
                  <span className="text-muted-foreground truncate max-w-[120px]">{c.property}</span>
                </div>
              ))}
              {stats.recentConversations.filter(c => c.mode === 'pre_booking').length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhuma conversa de vendas</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pós-Reserva (Suporte)</CardTitle>
            <CardDescription>Hóspedes hospedados — modo anfitrião</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">{stats.conversations.postBooking}</div>
              <div className="text-sm text-muted-foreground">conversas ativas<br />com hóspedes hospedados</div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              {stats.recentConversations.filter(c => c.mode === 'post_booking').slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{c.guestName?.charAt(0) ?? '?'}</AvatarFallback></Avatar>
                    <span>{c.guestName ?? 'Hóspede'}</span>
                  </div>
                  <span className="text-muted-foreground truncate max-w-[120px]">{c.property}</span>
                </div>
              ))}
              {stats.recentConversations.filter(c => c.mode === 'post_booking').length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhuma conversa de suporte</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Conversas Recentes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onNavigate('conversations')}>
              Ver todas <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.recentConversations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma conversa ainda.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentConversations.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => {
                    const conv = conversations.find(conv => conv.id === c.id)
                    if (conv) onNavigate('conversation-detail', conv)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback>{c.guestName?.charAt(0) ?? '?'}</AvatarFallback></Avatar>
                    <div>
                      <div className="font-medium text-sm">{c.guestName ?? 'Hóspede'}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{c.lastMessage}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.mode === 'pre_booking' ? 'default' : 'secondary'} className="text-[10px]">
                      {c.mode === 'pre_booking' ? 'Vendas' : 'Suporte'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Properties View ────────────────────────────────────────────────────────

function PropertiesView({ onNavigate }: { onNavigate: (view: DDCView, data?: unknown) => void }) {
  const [properties, setProperties] = useState<PropertyInfo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [propStats, setPropStats] = useState<{ count: number; maxProperties: number; canAddMore: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/properties')
      if (res.ok) {
        const data = await res.json()
        setProperties(data.properties ?? [])
        setPropStats({ count: data.count, maxProperties: data.maxProperties, canAddMore: data.canAddMore })
      }
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.airbnbId.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Imóveis</h1>
          <p className="text-muted-foreground">
            {propStats ? `${propStats.count}/${propStats.maxProperties} imóveis cadastrados` : 'Carregando...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar imóvel..." className="pl-9 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Button onClick={() => onNavigate('property-new')} disabled={propStats !== null && !propStats.canAddMore}>
            <Plus className="h-4 w-4 mr-2" /> Novo Imóvel
          </Button>
        </div>
      </div>

      {propStats !== null && !propStats.canAddMore && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Limite de imóveis atingido</p>
              <p className="text-xs text-amber-600">Faça upgrade para o plano MAX para cadastrar mais imóveis.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">Nenhum imóvel cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cadastre seu primeiro imóvel usando o Magic Onboarding — cole o link do Airbnb e pronto!
            </p>
            <Button onClick={() => onNavigate('property-new')}>
              <Sparkles className="h-4 w-4 mr-2" /> Cadastrar Imóvel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map(property => (
            <Card
              key={property.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/properties/${property.id}`)
                  if (res.ok) {
                    const data = await res.json()
                    onNavigate('property-detail', data.property)
                  }
                } catch (error) {
                  console.error('Error loading property:', error)
                }
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">{property.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {property.neighborhood && `${property.neighborhood}, `}{property.city}
                    </CardDescription>
                  </div>
                  <Badge variant={property.scrapingStatus === 'complete' ? 'default' : 'secondary'} className="text-[10px] ml-2 flex-shrink-0">
                    {property.scrapingStatus === 'complete' ? 'Completo' : 'Pendente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {property.bedrooms && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {property.bedrooms} quartos</span>}
                  {property.accommodates && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {property.accommodates} hóspedes</span>}
                  {property.rating && <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> {property.rating}</span>}
                  {property.basePrice && <span>R${property.basePrice}/noite</span>}
                </div>
                {property.highlights && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {parseJsonField(property.highlights).slice(0, 3).map((h, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{h}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Property New (Magic Onboarding) ────────────────────────────────────────

function PropertyNewView({ onNavigate }: { onNavigate: (view: DDCView, data?: unknown) => void }) {
  const [scrapingInput, setScrapingInput] = useState('')
  const [scraping, setScraping] = useState(false)
  const [scrapingResult, setScrapingResult] = useState<{ success: boolean; propertyCode: string; publicData: Record<string, unknown> | null; enrichedData: Record<string, unknown> | null; error?: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleScrape = async () => {
    if (!scrapingInput.trim()) return
    setScraping(true)
    setScrapingResult(null)
    try {
      const res = await fetch('/api/scraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: scrapingInput }),
      })
      const data = await res.json()
      setScrapingResult(data)
      if (data.success) {
        toast({ title: 'Imóvel encontrado!', description: `Dados de ${data.publicData?.name ?? 'imóvel'} carregados.` })
      } else {
        toast({ title: 'Imóvel não encontrado', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao raspar dados do imóvel.', variant: 'destructive' })
    } finally {
      setScraping(false)
    }
  }

  const handleSave = async () => {
    if (!scrapingResult?.publicData) return
    setSaving(true)
    try {
      const publicData = scrapingResult.publicData
      const enrichedData = scrapingResult.enrichedData

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...publicData, ...enrichedData, scrapingStatus: 'complete' }),
      })

      if (res.ok) {
        toast({ title: 'Imóvel salvo!', description: 'O imóvel foi cadastrado com sucesso.' })
        onNavigate('properties')
      } else {
        const errorData = await res.json()
        toast({ title: 'Erro ao salvar', description: errorData.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar o imóvel.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('properties')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Imóvel</h1>
          <p className="text-muted-foreground">Magic Onboarding — Cole o link do Airbnb e pronto!</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Passo 1: Cole o link do seu anúncio
          </CardTitle>
          <CardDescription>
            Cole a URL completa do Airbnb ou apenas o código do imóvel. O sistema vai preencher tudo automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.airbnb.com/rooms/18584298"
              value={scrapingInput}
              onChange={(e) => setScrapingInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
              className="flex-1"
            />
            <Button onClick={handleScrape} disabled={scraping || !scrapingInput.trim()}>
              {scraping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Rastrear
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Dica: Experimente com o código <code className="bg-muted px-1 rounded">18584298</code>, <code className="bg-muted px-1 rounded">9283741</code> ou <code className="bg-muted px-1 rounded">51928403</code>
          </p>
        </CardContent>
      </Card>

      {scrapingResult?.success && scrapingResult.publicData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Passo 2: Confirme os dados
            </CardTitle>
            <CardDescription>Dados pré-preenchidos automaticamente (~78% dos campos). Complete os dados privados depois.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PropertyPreviewCard data={scrapingResult.publicData} enriched={scrapingResult.enrichedData} />
            <Separator />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <Key className="h-4 w-4 inline mr-1" />
                Dados privados (WiFi, lockbox, etc.) podem ser preenchidos depois
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Salvar Imóvel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Property Detail View ───────────────────────────────────────────────────

function PropertyDetailView({ property, onNavigate }: { property: PropertyInfo; onNavigate: (view: DDCView) => void }) {
  const [editPrivate, setEditPrivate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const { toast } = useToast()

  useEffect(() => {
    setFormData({ ...property })
  }, [property])

  const highlights = parseJsonField(property.highlights)
  const amenities = parseJsonField(property.amenities)
  const sellingPoints = parseJsonField(property.sellingPoints)

  const handleSavePrivate = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast({ title: 'Dados salvos!', description: 'Dados privados atualizados com sucesso.' })
        setEditPrivate(false)
      }
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar dados.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('properties')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Imóveis
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{property.name}</h1>
          <p className="text-sm text-muted-foreground">{[property.neighborhood, property.city, property.state].filter(Boolean).join(', ')}</p>
        </div>
        <Badge variant={property.scrapingStatus === 'complete' ? 'default' : 'secondary'}>
          {property.scrapingStatus === 'complete' ? 'Completo' : 'Pendente'}
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="private">Dados Privados</TabsTrigger>
          <TabsTrigger value="ai">AI Enriquecimento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Hóspedes', value: property.accommodates, icon: Users },
              { label: 'Quartos', value: property.bedrooms, icon: BedDouble },
              { label: 'Camas', value: property.beds, icon: BedDouble },
              { label: 'Banheiros', value: property.bathrooms, icon: Bath },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-lg font-semibold">{String(stat.value ?? '-')}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {property.rating && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="h-5 w-5 text-amber-500" />
                <div>
                  <span className="text-lg font-semibold">{property.rating}</span>
                  <span className="text-sm text-muted-foreground ml-2">({property.reviewCount} avaliações)</span>
                </div>
                {property.hostIsSuperhost && <Badge className="ml-4"><Shield className="h-3 w-3 mr-1" /> Superhost</Badge>}
              </CardContent>
            </Card>
          )}

          {highlights.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Destaques</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {highlights.map((h, i) => <Badge key={i} variant="outline">{h}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}

          {amenities.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Amenidades</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a, i) => <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>)}
                </div>
              </CardContent>
            </Card>
          )}

          {property.description && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Descrição</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{property.description}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="private" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Dados Privados (Camada 3)</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setEditPrivate(!editPrivate)}>
                  {editPrivate ? 'Cancelar' : 'Editar'}
                </Button>
              </div>
              <CardDescription>Informações que só o anfitrião conhece.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Wifi className="h-3 w-3" /> WiFi Nome</Label>
                  <Input value={String(formData.wifiName ?? '')} disabled={!editPrivate} onChange={(e) => setFormData({ ...formData, wifiName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Wifi className="h-3 w-3" /> WiFi Senha</Label>
                  <Input value={String(formData.wifiPassword ?? '')} disabled={!editPrivate} onChange={(e) => setFormData({ ...formData, wifiPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Key className="h-3 w-3" /> Lockbox Código</Label>
                  <Input value={String(formData.lockboxCode ?? '')} disabled={!editPrivate} onChange={(e) => setFormData({ ...formData, lockboxCode: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Key className="h-3 w-3" /> Lockbox Local</Label>
                  <Input value={String(formData.lockboxLocation ?? '')} disabled={!editPrivate} onChange={(e) => setFormData({ ...formData, lockboxLocation: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instruções de Acesso</Label>
                <Textarea value={String(formData.accessInstructions ?? '')} disabled={!editPrivate} onChange={(e) => setFormData({ ...formData, accessInstructions: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Contato de Emergência</Label>
                <Input value={String(formData.emergencyContact ?? '')} disabled={!editPrivate} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Regras Adicionais</Label>
                <Textarea value={String(formData.additionalRules ?? '')} disabled={!editPrivate} onChange={(e) => setFormData({ ...formData, additionalRules: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Dicas Pessoais</Label>
                <Textarea value={String(formData.personalLocalTips ?? '')} disabled={!editPrivate} onChange={(e) => setFormData({ ...formData, personalLocalTips: e.target.value })} rows={2} />
              </div>
              {editPrivate && (
                <Button onClick={handleSavePrivate} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Salvar Dados Privados
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Enriquecimento (Camada 2)</CardTitle>
              <CardDescription>Dados extraídos por IA para melhorar o atendimento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.aiSummary && (
                <div><Label className="text-xs text-muted-foreground">Resumo AI</Label><p className="text-sm mt-1">{property.aiSummary}</p></div>
              )}
              {highlights.length > 0 && (
                <div><Label className="text-xs text-muted-foreground">Highlights</Label>
                  <div className="flex flex-wrap gap-1 mt-1">{highlights.map((h, i) => <Badge key={i} variant="outline">{h}</Badge>)}</div>
                </div>
              )}
              {sellingPoints.length > 0 && (
                <div><Label className="text-xs text-muted-foreground">Pontos de Venda</Label>
                  <div className="flex flex-wrap gap-1 mt-1">{sellingPoints.map((s, i) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}</div>
                </div>
              )}
              {property.reviewSentiment && (
                <div><Label className="text-xs text-muted-foreground">Sentimento das Reviews</Label>
                  <Badge className="mt-1 ml-2" variant={property.reviewSentiment === 'excellent' ? 'default' : 'secondary'}>{property.reviewSentiment}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Conversations View ─────────────────────────────────────────────────────

function ConversationsView({ onNavigate }: { onNavigate: (view: DDCView, data?: unknown) => void }) {
  const [conversations, setConversations] = useState<ConversationInfo[]>([])
  const [filter, setFilter] = useState<'all' | 'pre_booking' | 'post_booking'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [filter])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?mode=${filter}` : ''
      const res = await fetch(`/api/conversations${params}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations ?? [])
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conversas</h1>
          <p className="text-muted-foreground">{conversations.length} conversas</p>
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pre_booking">Vendas</TabsTrigger>
            <TabsTrigger value="post_booking">Suporte</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">Nenhuma conversa</h3>
            <p className="text-sm text-muted-foreground">As conversas com hóspedes aparecerão aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Card key={conv.id} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate('conversation-detail', conv)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback>{conv.guestName?.charAt(0) ?? '?'}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-medium text-sm">{conv.guestName ?? 'Hóspede'}</div>
                    <div className="text-xs text-muted-foreground">{conv.property?.name ?? 'Sem imóvel'} • {conv.property?.city}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={conv.conversationMode === 'pre_booking' ? 'default' : 'secondary'} className="text-xs">
                    {conv.conversationMode === 'pre_booking' ? 'Vendas' : 'Suporte'}
                  </Badge>
                  <Badge variant={conv.status === 'active' ? 'default' : 'outline'} className="text-xs">
                    {conv.status === 'active' ? 'Ativa' : conv.status === 'resolved' ? 'Resolvida' : 'Escalada'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(conv.updatedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Conversation Detail View ───────────────────────────────────────────────

function ConversationDetailView({ conversation, onNavigate }: { conversation: ConversationInfo; onNavigate: (view: DDCView) => void }) {
  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('conversations')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Conversas
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{conversation.guestName ?? 'Hóspede'}</h1>
          <p className="text-sm text-muted-foreground">
            {conversation.property?.name} •{' '}
            <Badge variant={conversation.conversationMode === 'pre_booking' ? 'default' : 'secondary'} className="text-[10px]">
              {conversation.conversationMode === 'pre_booking' ? 'Pré-reserva (Vendas)' : 'Pós-reserva (Suporte)'}
            </Badge>
          </p>
        </div>
      </div>

      <ScrollArea className="h-[500px] rounded-lg border p-4">
        {!conversation.messages || conversation.messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem nesta conversa.</p>
        ) : (
          <div className="space-y-4">
            {conversation.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.direction === 'inbound' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.direction === 'inbound' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.direction === 'inbound' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    <span className="text-[10px] opacity-70">{msg.direction === 'inbound' ? 'Hóspede' : msg.isAiGenerated ? 'Zélla AI' : 'Anfitrião'}</span>
                    {msg.intent && <Badge variant="outline" className="text-[8px] h-4">{msg.intent}</Badge>}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[10px] opacity-50 mt-1 block">{new Date(msg.createdAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// ── Analytics View ─────────────────────────────────────────────────────────

function AnalyticsView({ stats, planSlug, onUpgrade }: {
  stats: DashboardStats | null; planSlug: string; onUpgrade: () => void
}) {
  if (planSlug !== 'max') {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">Analytics é exclusivo do plano MAX</h3>
            <p className="text-sm text-muted-foreground mb-4">Faça upgrade para acessar analytics avançado, relatórios semanais e mais.</p>
            <Button onClick={onUpgrade}><Zap className="h-4 w-4 mr-2" /> Upgrade para MAX</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Taxa de Conversão</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversations.total > 0 ? Math.round((stats.conversations.postBooking / stats.conversations.total) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground">pré-reserva → pós-reserva</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Média de Mensagens</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversations.avgMessagesPerConversation}</div>
            <p className="text-xs text-muted-foreground">por conversa (One-Shot)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Custo por Conversa</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.conversations.total > 0 ? (stats.costs.totalEstimated / stats.conversations.total).toFixed(2) : '0.00'}</div>
            <p className="text-xs text-muted-foreground">WhatsApp + LLM</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Resumo de Custos</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" /> WhatsApp (R$0.035/msg)</span><span className="font-medium">R$ {stats.costs.estimatedWhatsappCost.toFixed(2)}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm flex items-center gap-2"><Bot className="h-4 w-4" /> LLM (GPT-4o-mini)</span><span className="font-medium">R$ {stats.costs.estimatedLLMCost.toFixed(2)}</span></div>
            <Separator />
            <div className="flex items-center justify-between"><span className="text-sm font-medium">Total Estimado</span><span className="font-bold">R$ {stats.costs.totalEstimated.toFixed(2)}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Settings View ──────────────────────────────────────────────────────────

function SettingsView({ stats, planSlug, onUpgrade }: {
  stats: DashboardStats | null; planSlug: string; onUpgrade: () => void
}) {
  if (!stats) return <div className="p-8">Carregando...</div>

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <Card>
        <CardHeader><CardTitle className="text-sm">Conta</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{stats.tenant.name}</div>
              <div className="text-sm text-muted-foreground">Modo: {stats.tenant.mode === 'airbnb' ? 'Imóveis Airbnb' : 'Pousadas'}</div>
            </div>
            <Badge>Ativo</Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Plano</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{stats.plan?.name}</div>
              <div className="text-sm text-muted-foreground">{stats.plan?.priceFormatted}/mês</div>
            </div>
            {planSlug === 'pro' && (
              <Button variant="outline" size="sm" onClick={onUpgrade}><Zap className="h-4 w-4 mr-1" /> Upgrade MAX</Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Imóveis:</span> <span className="font-medium">{stats.plan?.currentProperties}/{stats.plan?.maxProperties}</span></div>
            <div><span className="text-muted-foreground">WhatsApp:</span> <span className="font-medium">{planSlug === 'max' ? 'Até 3 números' : '1 número'}</span></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">WhatsApp</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Número Conectado</div>
              <div className="text-sm text-muted-foreground">Nenhum número conectado ainda</div>
            </div>
            <Button variant="outline" size="sm">Conectar WhatsApp</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main App (Orchestrator) ────────────────────────────────────────────────

export default function ZellaDDC() {
  const [appState, setAppState] = useState<'mode-selection' | 'onboarding' | 'ddc'>('mode-selection')
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [currentView, setCurrentView] = useState<DDCView>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [conversations, setConversations] = useState<ConversationInfo[]>([])
  const [selectedProperty, setSelectedProperty] = useState<PropertyInfo | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<ConversationInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { toast } = useToast()

  // Check if tenant exists on mount
  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/onboarding')
      if (res.ok) {
        const data = await res.json()
        if (data.onboardingComplete) {
          setTenant({ id: '', name: data.name, mode: data.mode, planSlug: data.planSlug, onboardingComplete: true })
          setAppState('ddc')
          setCurrentView('dashboard')
          loadDashboardData()
        }
      }
    } catch {
      // No tenant yet, show mode selection
    }
  }

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [dashRes, convsRes] = await Promise.all([fetch('/api/dashboard'), fetch('/api/conversations')])
      if (dashRes.ok) setStats(await dashRes.json())
      if (convsRes.ok) {
        const convsData = await convsRes.json()
        setConversations(convsData.conversations ?? [])
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleNavigate = useCallback((view: DDCView, data?: unknown) => {
    setCurrentView(view)
    if (view === 'property-detail' && data) setSelectedProperty(data as PropertyInfo)
    if (view === 'conversation-detail' && data) setSelectedConversation(data as ConversationInfo)
    if (view === 'dashboard' || view === 'properties') loadDashboardData()
  }, [loadDashboardData])

  const handleUpgrade = useCallback(() => {
    setTenant(prev => prev ? { ...prev, planSlug: 'max' } : null)
    toast({ title: 'Upgrade para MAX!', description: 'Em produção, isso iria para o checkout.' })
  }, [toast])

  // ── Mode Selection ───────────────────────────────────────────────────────

  if (appState === 'mode-selection') {
    return <ModeSelectionScreen onSelect={(mode) => {
      setTenant({ id: '', name: '', mode, planSlug: 'pro', onboardingComplete: false })
      setAppState('onboarding')
    }} />
  }

  // ── Onboarding ───────────────────────────────────────────────────────────

  if (appState === 'onboarding') {
    return <OnboardingScreen
      initialMode={tenant?.mode ?? 'airbnb'}
      onComplete={async (data) => {
        try {
          const res = await fetch('/api/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (res.ok) {
            const result = await res.json()
            setTenant({ id: result.tenant?.id ?? '', name: data.name, mode: data.mode, planSlug: data.planSlug, onboardingComplete: true })
            setAppState('ddc')
            setCurrentView('dashboard')
            loadDashboardData()
            toast({ title: 'Onboarding completado!', description: 'Bem-vindo ao Zélla!' })
          }
        } catch {
          toast({ title: 'Erro', description: 'Falha ao completar onboarding.', variant: 'destructive' })
        }
      }}
    />
  }

  // ── DDC Layout ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} border-r bg-card transition-all duration-200 flex flex-col`}>
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">Z</div>
          {sidebarOpen && (
            <div>
              <h2 className="font-semibold text-sm">Zélla AirB</h2>
              <p className="text-[10px] text-muted-foreground">Zelador Digital</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <NavItem icon={Home} label="Dashboard" active={currentView === 'dashboard'} collapsed={!sidebarOpen} onClick={() => handleNavigate('dashboard')} />
          <NavItem icon={Building2} label="Imóveis" active={currentView === 'properties' || currentView === 'property-new' || currentView === 'property-detail'} collapsed={!sidebarOpen} onClick={() => setCurrentView('properties')} />
          <NavItem icon={MessageSquare} label="Conversas" active={currentView === 'conversations' || currentView === 'conversation-detail'} collapsed={!sidebarOpen} onClick={() => setCurrentView('conversations')} />
          <NavItem icon={BarChart3} label="Analytics" active={currentView === 'analytics'} collapsed={!sidebarOpen} onClick={() => setCurrentView('analytics')} badge={tenant?.planSlug === 'max' ? undefined : 'MAX'} />
          <NavItem icon={Settings} label="Configurações" active={currentView === 'settings'} collapsed={!sidebarOpen} onClick={() => setCurrentView('settings')} />
        </nav>

        {sidebarOpen && stats?.plan && (
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground mb-1">
              Plano {stats.plan.name} • {stats.plan.currentProperties}/{stats.plan.maxProperties} imóveis
            </div>
            <Progress value={stats.plan.usagePercent} className="h-1.5 mb-2" />
            {tenant?.planSlug === 'pro' && (
              <Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={handleUpgrade}>
                <Zap className="h-3 w-3 mr-1" /> Upgrade MAX
              </Button>
            )}
          </div>
        )}

        <button className="p-3 border-t hover:bg-accent transition-colors text-muted-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <ChevronRight className="h-4 w-4 rotate-180" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {loading && currentView === 'dashboard' ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}</div>
          </div>
        ) : (
          renderCurrentView()
        )}
      </main>
    </div>
  )

  function renderCurrentView() {
    switch (currentView) {
      case 'dashboard': return <DashboardView stats={stats} conversations={conversations} onNavigate={handleNavigate} />
      case 'properties': return <PropertiesView onNavigate={handleNavigate} />
      case 'property-new': return <PropertyNewView onNavigate={handleNavigate} />
      case 'property-detail': return selectedProperty ? <PropertyDetailView property={selectedProperty} onNavigate={handleNavigate} /> : <PropertiesView onNavigate={handleNavigate} />
      case 'conversations': return <ConversationsView onNavigate={handleNavigate} />
      case 'conversation-detail': return selectedConversation ? <ConversationDetailView conversation={selectedConversation} onNavigate={handleNavigate} /> : <ConversationsView onNavigate={handleNavigate} />
      case 'analytics': return <AnalyticsView stats={stats} planSlug={tenant?.planSlug ?? 'pro'} onUpgrade={handleUpgrade} />
      case 'settings': return <SettingsView stats={stats} planSlug={tenant?.planSlug ?? 'pro'} onUpgrade={handleUpgrade} />
      default: return <DashboardView stats={stats} conversations={conversations} onNavigate={handleNavigate} />
    }
  }
}
