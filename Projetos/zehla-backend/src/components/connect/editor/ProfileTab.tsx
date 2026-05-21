'use client';

import { Save, Eye, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ConnectProfile } from './types';

interface Props {
  profile: ConnectProfile | null;
  slug: string;
  bio: string;
  whatsappNumber: string;
  seoTitle: string;
  seoDescription: string;
  saving: boolean;
  onSlugChange: (v: string) => void;
  onBioChange: (v: string) => void;
  onWhatsappChange: (v: string) => void;
  onSeoTitleChange: (v: string) => void;
  onSeoDescriptionChange: (v: string) => void;
  onSave: () => void;
  profileUrl: string | null;
}

export function ProfileTab({
  profile, slug, bio, whatsappNumber, seoTitle, seoDescription, saving,
  onSlugChange, onBioChange, onWhatsappChange, onSeoTitleChange, onSeoDescriptionChange,
  onSave, profileUrl
}: Props) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/30 border-slate-700/50 p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-300">Slug do perfil</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">/connect/</span>
                <Input value={slug} onChange={(e) => onSlugChange(e.target.value)} className="bg-slate-900 border-slate-700 text-white" placeholder="meu-perfil" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-300">WhatsApp</Label>
              <Input value={whatsappNumber} onChange={(e) => onWhatsappChange(e.target.value)} className="bg-slate-900 border-slate-700 text-white" placeholder="+5548999999999" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-slate-300">Bio</Label>
            <Textarea value={bio} onChange={(e) => onBioChange(e.target.value)} className="bg-slate-900 border-slate-700 text-white min-h-[100px]" placeholder="Descreva sua propriedade..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-300">SEO Title</Label>
              <Input value={seoTitle} onChange={(e) => onSeoTitleChange(e.target.value)} className="bg-slate-900 border-slate-700 text-white" placeholder="Título para SEO" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-300">SEO Description</Label>
              <Input value={seoDescription} onChange={(e) => onSeoDescriptionChange(e.target.value)} className="bg-slate-900 border-slate-700 text-white" placeholder="Descrição para SEO" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={onSave} disabled={saving} className="bg-orange-500 hover:bg-orange-400 text-white">
              {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
              Salvar Perfil
            </Button>
            {profileUrl && (
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                <Eye className="w-4 h-4" />
                Visualizar
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/50">
          <div className="space-y-2">
            <Label className="text-sm text-slate-300">Avatar</Label>
            <div className="relative aspect-square rounded-xl bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
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
                <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover rounded-xl" />
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
    </div>
  );
}
