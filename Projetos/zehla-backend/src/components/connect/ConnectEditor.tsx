'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Link2, Palette, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { arrayMove } from '@dnd-kit/sortable';
import { ProfileTab } from './editor/ProfileTab';
import { LinksTab } from './editor/LinksTab';
import { ThemeTab } from './editor/ThemeTab';
import { AnalyticsSection } from './editor/AnalyticsSection';
import type { ConnectLink, ConnectProfile } from './editor/types';

export function ConnectEditor() {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ConnectProfile | null>(null);
  const [links, setLinks] = useState<ConnectLink[]>([]);
  const [editingLink, setEditingLink] = useState<ConnectLink | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [bio, setBio] = useState('');
  const [slug, setSlug] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

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
    } catch {}
  }, []);

  const loadLinks = useCallback(async () => {
    try {
      const res = await fetch('/api/connect/links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch {}
  }, []);

  useEffect(() => { loadProfile(); loadLinks(); }, [loadProfile, loadLinks]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await fetch('/api/connect/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, bio, whatsappNumber, seoTitle, seoDescription, status: profile?.status || 'draft' }),
      });
      await loadProfile();
    } catch {} finally {
      setSaving(false);
    }
  };

  const saveLink = async (data: Partial<ConnectLink>) => {
    try {
      if (editingLink) {
        await fetch(`/api/connect/links/${editingLink.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      } else {
        await fetch('/api/connect/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      }
      setEditingLink(null);
      setShowForm(false);
      await loadLinks();
    } catch {}
  };

  const deleteLink = async (id: string) => {
    try {
      await fetch(`/api/connect/links/${id}`, { method: 'DELETE' });
      await loadLinks();
    } catch {}
  };

  const handleReorder = async (reordered: ConnectLink[]) => {
    setLinks(reordered);
    for (const [index, link] of reordered.entries()) {
      if (link.order !== index) {
        try {
          await fetch(`/api/connect/links/${link.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: index }) });
        } catch {}
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
        <TabsTrigger value="profile" className="data-[state=active]:bg-slate-700"><User className="w-4 h-4 mr-1.5" />Perfil</TabsTrigger>
        <TabsTrigger value="links" className="data-[state=active]:bg-slate-700"><Link2 className="w-4 h-4 mr-1.5" />Links</TabsTrigger>
        <TabsTrigger value="theme" className="data-[state=active]:bg-slate-700"><Palette className="w-4 h-4 mr-1.5" />Tema</TabsTrigger>
        <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700"><BarChart3 className="w-4 h-4 mr-1.5" />Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab
          profile={profile}
          slug={slug} bio={bio} whatsappNumber={whatsappNumber}
          seoTitle={seoTitle} seoDescription={seoDescription}
          saving={saving}
          onSlugChange={setSlug} onBioChange={setBio}
          onWhatsappChange={setWhatsappNumber}
          onSeoTitleChange={setSeoTitle} onSeoDescriptionChange={setSeoDescription}
          onSave={saveProfile}
          profileUrl={getProfileUrl()}
        />
      </TabsContent>

      <TabsContent value="links">
        <LinksTab
          links={links}
          showForm={showForm}
          editingLink={editingLink}
          onShowForm={setShowForm}
          onSetEditingLink={setEditingLink}
          onSaveLink={saveLink}
          onDeleteLink={deleteLink}
          onReorder={handleReorder}
        />
      </TabsContent>

      <TabsContent value="theme">
        <ThemeTab />
      </TabsContent>

      <TabsContent value="analytics">
        <Card className="bg-slate-800/30 border-slate-700/50 p-6">
          <AnalyticsSection />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
