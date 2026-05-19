'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Plus,
  Trash2,
  Save,
  Eye,
  ImageIcon,
  Loader2,
  Link2,
  BarChart3,
  Palette,
  User,
  ExternalLink,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface ConnectLink {
  id: string;
  label: string;
  url: string;
  icon: string;
  type: string;
  order: number;
  clickCount: number;
  isActive: boolean;
}

interface AnalyticsData {
  analytics: Array<{ date: string; views: number; clicks: number; ctr: number }>;
  totals: { views: number; clicks: number; ctr: number };
  profile: { totalViews: number; totalClicks: number };
}

function SortableLinkItem({
  link,
  onEdit,
  onDelete,
}: {
  link: ConnectLink;
  onEdit: (link: ConnectLink) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50',
        isDragging && 'opacity-50 ring-2 ring-orange-500/30',
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 transition-colors">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{link.label}</p>
        <p className="text-xs text-slate-400 truncate">{link.url}</p>
      </div>
      <Badge variant="outline" className="border-slate-600 text-slate-400 text-[10px]">
        {link.clickCount} cliques
      </Badge>
      <button
        onClick={() => onEdit(link)}
        className="p-1.5 text-slate-400 hover:text-white transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onDelete(link.id)}
        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function LinkForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: ConnectLink;
  onSave: (data: Partial<ConnectLink>) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label || '');
  const [url, setUrl] = useState(initial?.url || '');
  const [icon, setIcon] = useState(initial?.icon || 'link');

  return (
    <div className="space-y-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">Label</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="WhatsApp"
            className="bg-slate-900 border-slate-700 text-white h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-400">URL</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://wa.me/..."
            className="bg-slate-900 border-slate-700 text-white h-9"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-1.5 flex-1 max-w-[200px]">
          <Label className="text-xs text-slate-400">Ícone</Label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm px-3"
          >
            <option value="link">Link</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="booking">Booking</option>
            <option value="airbnb">Airbnb</option>
            <option value="website">Website</option>
          </select>
        </div>
        <div className="flex gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-400">
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() => onSave({ label, url, icon })}
            disabled={!label || !url}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/connect/analytics?days=${days}`);
      if (res.ok) setData(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Analytics</h3>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="h-8 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs px-2"
        >
          <option value={7}>7 dias</option>
          <option value={30}>30 dias</option>
          <option value={90}>90 dias</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
              <p className="text-2xl font-bold text-white">{data.totals.views}</p>
              <p className="text-xs text-slate-400 mt-1">Visualizações</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
              <p className="text-2xl font-bold text-white">{data.totals.clicks}</p>
              <p className="text-xs text-slate-400 mt-1">Cliques</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
              <p className="text-2xl font-bold text-emerald-400">
                {data.totals.ctr.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-400 mt-1">CTR</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Histórico</h4>
            <div className="space-y-1">
              {data.analytics.slice(0, 14).map((day) => (
                <div
                  key={day.date}
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/20 text-xs"
                >
                  <span className="w-24 text-slate-400 font-mono">
                    {new Date(day.date).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300">{day.views}</span>
                      <span className="text-slate-500">views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300">{day.clicks}</span>
                      <span className="text-slate-500">cliques</span>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all"
                        style={{ width: `${Math.min(day.ctr * 2, 100)}%` }}
                      />
                    </div>
                    <span className="text-slate-400 w-12 text-right">{day.ctr.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-slate-500 py-8">Nenhum dado de analytics disponível.</p>
      )}
    </div>
  );
}

export function ConnectEditor() {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{
    id: string;
    slug: string;
    bio: string;
    avatarUrl: string | null;
    coverUrl: string | null;
    whatsappNumber: string | null;
    status: string;
    seoTitle: string | null;
    seoDescription: string | null;
  } | null>(null);
  const [links, setLinks] = useState<ConnectLink[]>([]);
  const [editingLink, setEditingLink] = useState<ConnectLink | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [bio, setBio] = useState('');
  const [slug, setSlug] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/connect/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setBio(data.bio || '');
        setSlug(data.slug || '');
        setWhatsappNumber(data.whatsappNumber || '');
        setSeoTitle(data.seoTitle || '');
        setSeoDescription(data.seoDescription || '');
      }
    } catch {
      // silent
    }
  }, []);

  const loadLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/connect/links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadLinks();
  }, [loadProfile, loadLinks]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await fetch('/api/connect/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          bio,
          whatsappNumber,
          seoTitle,
          seoDescription,
          status: profile?.status || 'draft',
        }),
      });
      await loadProfile();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const saveLink = async (data: Partial<ConnectLink>) => {
    try {
      if (editingLink) {
        await fetch(`/api/connect/links/${editingLink.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch('/api/connect/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      setEditingLink(null);
      setShowForm(false);
      await loadLinks();
    } catch {
      // silent
    }
  };

  const deleteLink = async (id: string) => {
    try {
      await fetch(`/api/connect/links/${id}`, { method: 'DELETE' });
      await loadLinks();
    } catch {
      // silent
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex);

    setLinks(reordered);

    for (const [index, link] of reordered.entries()) {
      if (link.order !== index) {
        await fetch(`/api/connect/links/${link.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: index }),
        });
      }
    }
  };

  const getProfileUrl = () => {
    if (!profile?.slug) return null;
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/connect/${profile.slug}`;
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="bg-slate-800/50 border border-slate-700/50">
        <TabsTrigger value="profile" className="data-[state=active]:bg-slate-700">
          <User className="w-4 h-4 mr-1.5" />
          Perfil
        </TabsTrigger>
        <TabsTrigger value="links" className="data-[state=active]:bg-slate-700">
          <Link2 className="w-4 h-4 mr-1.5" />
          Links
        </TabsTrigger>
        <TabsTrigger value="theme" className="data-[state=active]:bg-slate-700">
          <Palette className="w-4 h-4 mr-1.5" />
          Tema
        </TabsTrigger>
        <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
          <BarChart3 className="w-4 h-4 mr-1.5" />
          Analytics
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="mt-6 space-y-6">
        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-300">Slug do perfil</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">/connect/</span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="meu-perfil"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-300">WhatsApp</Label>
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="+5548999999999"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-slate-300">Bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
                placeholder="Descreva sua propriedade..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-300">SEO Title</Label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="Título para SEO"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-300">SEO Description</Label>
                <Input
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="Descrição para SEO"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-400 text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                Salvar Perfil
              </Button>
              {getProfileUrl() && (
                <a
                  href={getProfileUrl()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Visualizar
                </a>
              )}
            </div>
          </div>

          {/* Avatar / Cover upload placeholders */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/50">
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Avatar</Label>
              <div className="relative aspect-square rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Sem avatar</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-300">Cover</Label>
              <div className="relative aspect-video rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center">
                {profile?.coverUrl ? (
                  <img
                    src={profile.coverUrl}
                    alt="Cover"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Sem cover</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>

      {/* Links Tab */}
      <TabsContent value="links" className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Links</h3>
          <Button
            size="sm"
            onClick={() => {
              setEditingLink(null);
              setShowForm(true);
            }}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo Link
          </Button>
        </div>

        {showForm && (
          <LinkForm
            initial={editingLink || undefined}
            onSave={saveLink}
            onCancel={() => {
              setShowForm(false);
              setEditingLink(null);
            }}
          />
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {links.map((link) => (
                <SortableLinkItem
                  key={link.id}
                  link={link}
                  onEdit={(link) => {
                    setEditingLink(link);
                    setShowForm(true);
                  }}
                  onDelete={deleteLink}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {links.length === 0 && !showForm && (
          <p className="text-center text-slate-500 py-8">
            Nenhum link ainda. Clique em "Novo Link" para começar.
          </p>
        )}
      </TabsContent>

      {/* Theme Tab */}
      <TabsContent value="theme" className="mt-6">
        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-300">Layout</Label>
                <select className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm px-3">
                  <option value="centered">Centralizado</option>
                  <option value="compact">Compacto</option>
                  <option value="cards">Cards</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-300">Fonte</Label>
                <select className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm px-3">
                  <option value="inter">Inter</option>
                  <option value="geist">Geist</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Mono</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-300">Botões</Label>
                <select className="w-full h-10 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm px-3">
                  <option value="rounded">Arredondado</option>
                  <option value="pill">Pill</option>
                  <option value="square">Quadrado</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-slate-300">Cores</Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {['primary', 'secondary', 'accent', 'background', 'text'].map((color) => (
                  <div key={color} className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-slate-500">
                      {color}
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        defaultValue={
                          { primary: '#10B981', secondary: '#0F172A', accent: '#F59E0B', background: '#FFFFFF', text: '#1F2937' }[color]
                        }
                      />
                      <Input
                        className="bg-slate-900 border-slate-700 text-white font-mono text-xs h-8"
                        defaultValue={
                          { primary: '#10B981', secondary: '#0F172A', accent: '#F59E0B', background: '#FFFFFF', text: '#1F2937' }[color]
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button className="bg-orange-500 hover:bg-orange-400 text-white">
              <Save className="w-4 h-4 mr-1.5" />
              Salvar Tema
            </Button>
          </div>
        </Card>
      </TabsContent>

      {/* Analytics Tab */}
      <TabsContent value="analytics" className="mt-6">
        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <AnalyticsSection />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
