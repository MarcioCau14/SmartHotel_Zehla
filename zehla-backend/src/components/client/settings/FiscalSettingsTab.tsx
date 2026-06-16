'use client';

import React, { useState, useEffect } from 'react';
import { useTaxProfile } from '@/hooks/useTaxProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, ShieldCheck, HelpCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

interface FiscalSettingsTabProps {
  propertyId: string;
}

export function FiscalSettingsTab({ propertyId }: FiscalSettingsTabProps) {
  const { profile, loading, saving, error, saveProfile } = useTaxProfile(propertyId);

  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState('');
  const [taxRegime, setTaxRegime] = useState('SIMPLES_NACIONAL');
  const [environment, setEnvironment] = useState('Sandbox');
  const [encryptedKeys, setEncryptedKeys] = useState('');

  useEffect(() => {
    if (profile) {
      setCnpj(profile.cnpj || '');
      setRazaoSocial(profile.razaoSocial || '');
      setInscricaoEstadual(profile.inscricaoEstadual || '');
      setInscricaoMunicipal(profile.inscricaoMunicipal || '');
      setTaxRegime(profile.taxRegime || 'SIMPLES_NACIONAL');
      setEnvironment(profile.environment || 'Sandbox');
      setEncryptedKeys(profile.encryptedKeys || '');
    } else {
      setCnpj('');
      setRazaoSocial('');
      setInscricaoEstadual('');
      setInscricaoMunicipal('');
      setTaxRegime('SIMPLES_NACIONAL');
      setEnvironment('Sandbox');
      setEncryptedKeys('');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnpj || !razaoSocial || !taxRegime || !environment) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    const result = await saveProfile({
      cnpj,
      razaoSocial,
      inscricaoEstadual: inscricaoEstadual || null,
      inscricaoMunicipal: inscricaoMunicipal || null,
      taxRegime,
      environment,
      encryptedKeys: encryptedKeys || null,
    });

    if (result.success) {
      toast.success('Perfil fiscal atualizado com sucesso!');
    } else {
      toast.error(result.error || 'Erro ao atualizar dados fiscais.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
        <span className="ml-3 text-sm text-zinc-400">Carregando dados fiscais...</span>
      </div>
    );
  }

  return (
    <Card className="bg-[#0A0A0A] border-zinc-800 text-zinc-200">
      <CardHeader className="border-b border-zinc-800/50 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F97316]" /> Configuração Fiscal (Tax Profile)
            </CardTitle>
            <CardDescription className="text-zinc-500 mt-1">
              Gerencie os perfis tributários e credenciais para emissão autônoma de notas e faturamento.
            </CardDescription>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
            Compliance ZDR
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                CNPJ *
              </label>
              <Input
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="bg-[#111] border-zinc-800 focus:border-[#F97316] text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Razão Social *
              </label>
              <Input
                placeholder="Ex: Pousada do Sol LTDA"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="bg-[#111] border-zinc-800 focus:border-[#F97316] text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Inscrição Estadual
              </label>
              <Input
                placeholder="Isento ou Número"
                value={inscricaoEstadual}
                onChange={(e) => setInscricaoEstadual(e.target.value)}
                className="bg-[#111] border-zinc-800 focus:border-[#F97316] text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Inscrição Municipal
              </label>
              <Input
                placeholder="Número da inscrição"
                value={inscricaoMunicipal}
                onChange={(e) => setInscricaoMunicipal(e.target.value)}
                className="bg-[#111] border-zinc-800 focus:border-[#F97316] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Regime Tributário *
              </label>
              <Select value={taxRegime} onValueChange={setTaxRegime}>
                <SelectTrigger className="bg-[#111] border-zinc-800 focus:border-[#F97316] text-white">
                  <SelectValue placeholder="Selecione o regime" />
                </SelectTrigger>
                <SelectContent className="bg-[#0E0E0E] border-zinc-800 text-white">
                  <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
                  <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
                  <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Ambiente de Integração *
              </label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger className="bg-[#111] border-zinc-800 focus:border-[#F97316] text-white">
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent className="bg-[#0E0E0E] border-zinc-800 text-white">
                  <SelectItem value="Sandbox">Homologação (Sandbox)</SelectItem>
                  <SelectItem value="Production">Produção (Live)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                Chaves de API Criptografadas (SEFAZ / Prefeitura)
              </label>
              <HelpCircle className="w-3.5 h-3.5 text-zinc-500 cursor-help" />
            </div>
            <Input
              type="password"
              placeholder="••••••••••••••••••••••••••••••••"
              value={encryptedKeys}
              onChange={(e) => setEncryptedKeys(e.target.value)}
              className="bg-[#111] border-zinc-800 focus:border-[#F97316] text-white"
            />
            <p className="text-[10px] text-zinc-500">
              As credenciais fiscais são armazenadas utilizando criptografia AES-256 no banco e isoladas logicamente por tenant.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-800/50">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-orange-500 to-[#F97316] hover:opacity-90 text-white font-bold px-6 flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Salvar Perfil Fiscal
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
