'use client';

import React, { useState, useEffect } from 'react';
import { useTaxProfile, type TaxProfileData } from '@/hooks/useTaxProfile';
import { 
  Building2, 
  Save, 
  Info, 
  ShieldCheck, 
  Loader2, 
  CheckCircle,
  FileText,
  BadgeAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const darkInput = 'bg-[#242424] border border-[#363636] rounded-lg px-3 py-2 text-sm text-[#efefef] placeholder:text-[#363636] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors w-full';
const darkSelectTrigger = 'bg-[#242424] border border-[#363636] rounded-lg px-3 py-2 text-sm text-[#efefef] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors w-full';

interface TaxProfileFormUIProps {
  initialData: TaxProfileData | null;
  onSubmit: (data: Partial<TaxProfileData>) => void;
  isPending: boolean;
}

// Dumb Component de Formulário Fiscal
export function TaxProfileFormUI({ initialData, onSubmit, isPending }: TaxProfileFormUIProps) {
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [regimeTributario, setRegimeTributario] = useState('SIMPLES_NACIONAL');
  const [ambienteEmissao, setAmbienteEmissao] = useState('HOMOLOGACAO');
  const [autoEmissaoNF, setAutoEmissaoNF] = useState(false);
  const [provedorNF, setProvedorNF] = useState('FocusNFe');
  const [chaveAPIProvedor, setChaveAPIProvedor] = useState('');

  // Hydrate local states from initial data
  useEffect(() => {
    if (initialData) {
      setCnpj(initialData.cnpj || '');
      setRazaoSocial(initialData.razaoSocial || '');
      setNomeFantasia(initialData.nomeFantasia || '');
      setInscricaoMunicipal(initialData.inscricaoMunicipal || '');
      setInscricaoEstadual(initialData.inscricaoEstadual || '');
      setRegimeTributario(initialData.regimeTributario || 'SIMPLES_NACIONAL');
      setAmbienteEmissao(initialData.ambienteEmissao || 'HOMOLOGACAO');
      setAutoEmissaoNF(initialData.autoEmissaoNF || false);
      setProvedorNF(initialData.provedorNF || 'FocusNFe');
      setChaveAPIProvedor(initialData.chaveAPIProvedor || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      cnpj: cnpj ? cnpj.trim() : null,
      razaoSocial: razaoSocial ? razaoSocial.trim() : null,
      nomeFantasia: nomeFantasia ? nomeFantasia.trim() : null,
      inscricaoMunicipal: inscricaoMunicipal ? inscricaoMunicipal.trim() : null,
      inscricaoEstadual: inscricaoEstadual ? inscricaoEstadual.trim() : null,
      regimeTributario,
      ambienteEmissao,
      autoEmissaoNF,
      provedorNF: provedorNF ? provedorNF.trim() : null,
      chaveAPIProvedor: chaveAPIProvedor ? chaveAPIProvedor.trim() : null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* CNPJ */}
        <div>
          <label className="text-xs text-[#898989] mb-1.5 block uppercase tracking-wider font-bold">CNPJ da Pousada</label>
          <Input
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="Ex: 12.345.678/0001-90"
            className={darkInput}
          />
        </div>

        {/* Razão Social */}
        <div>
          <label className="text-xs text-[#898989] mb-1.5 block uppercase tracking-wider font-bold">Razão Social</label>
          <Input
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            placeholder="Ex: Pousada Rosa Sul Ltda"
            className={darkInput}
          />
        </div>

        {/* Nome Fantasia */}
        <div>
          <label className="text-xs text-[#898989] mb-1.5 block uppercase tracking-wider font-bold">Nome Fantasia</label>
          <Input
            value={nomeFantasia}
            onChange={(e) => setNomeFantasia(e.target.value)}
            placeholder="Ex: Pousada Rosa Sul"
            className={darkInput}
          />
        </div>

        {/* Regime Tributário */}
        <div>
          <label className="text-xs text-[#898989] mb-1.5 block uppercase tracking-wider font-bold">Regime Tributário</label>
          <Select value={regimeTributario} onValueChange={setRegimeTributario}>
            <SelectTrigger className={darkSelectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-[#363636] text-[#efefef]">
              <SelectItem value="SIMPLES_NACIONAL">Simples Nacional</SelectItem>
              <SelectItem value="LUCRO_PRESUMIDO">Lucro Presumido</SelectItem>
              <SelectItem value="LUCRO_REAL">Lucro Real</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Inscrição Municipal */}
        <div>
          <label className="text-xs text-[#898989] mb-1.5 block uppercase tracking-wider font-bold">Inscrição Municipal</label>
          <Input
            value={inscricaoMunicipal}
            onChange={(e) => setInscricaoMunicipal(e.target.value)}
            placeholder="Ex: 123456"
            className={darkInput}
          />
        </div>

        {/* Inscrição Estadual */}
        <div>
          <label className="text-xs text-[#898989] mb-1.5 block uppercase tracking-wider font-bold">Inscrição Estadual</label>
          <Input
            value={inscricaoEstadual}
            onChange={(e) => setInscricaoEstadual(e.target.value)}
            placeholder="Ex: 789012"
            className={darkInput}
          />
        </div>

        {/* Provedor de NFS-e */}
        <div>
          <label className="text-xs text-[#898989] mb-1.5 block uppercase tracking-wider font-bold">Provedor de Notas Fiscais</label>
          <Input
            value={provedorNF}
            onChange={(e) => setProvedorNF(e.target.value)}
            placeholder="Ex: FocusNFe ou e-Notas"
            className={darkInput}
          />
        </div>

        {/* Chave de API do Provedor */}
        <div>
          <label className="text-xs text-[#898989] mb-1.5 block uppercase tracking-wider font-bold">Chave de API do Provedor</label>
          <Input
            type="password"
            value={chaveAPIProvedor}
            onChange={(e) => setChaveAPIProvedor(e.target.value)}
            placeholder="Ex: Token secreto do e-notas"
            className={darkInput}
          />
        </div>

        {/* Ambiente de Emissão */}
        <div>
          <label className="text-xs text-[#898989] mb-1.5 block uppercase tracking-wider font-bold">Ambiente de Emissão</label>
          <Select value={ambienteEmissao} onValueChange={setAmbienteEmissao}>
            <SelectTrigger className={darkSelectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-[#363636] text-[#efefef]">
              <SelectItem value="HOMOLOGACAO">Homologação (Testes Sem Valor Fiscal)</SelectItem>
              <SelectItem value="PRODUCAO">Produção (Validade Jurídica Real)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto Emissão Switch */}
        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-[#2e2e2e] rounded-xl sm:col-span-2">
          <div className="flex items-center gap-3">
            <span className="text-lg">🧾</span>
            <div>
              <div className="text-xs font-bold text-[#efefef]">Emissão Automática de Notas</div>
              <div className="text-[10px] text-[#4d4d4d]">Emitir NFS-e automaticamente na confirmação do pagamento</div>
            </div>
          </div>
          <Switch
            checked={autoEmissaoNF}
            onCheckedChange={setAutoEmissaoNF}
          />
        </div>
      </div>

      {/* Info Warning */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-blue-200">
          <p className="font-bold">Zero-Trust RLS Ativo</p>
          <p className="text-[11px] text-blue-300">
            Estes dados são protegidos por criptografia em repouso e isolados de forma multi-tenant por pousada (RLS). Nenhuma pousada tem permissão de leitura sobre as configurações de outros estabelecimentos.
          </p>
        </div>
      </div>

      {/* Action Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#FF5500] hover:bg-[#E04400] text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 text-xs shadow-lg shadow-[#FF5500]/10"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Dados Fiscais
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Smart Component
export function FiscalSettingsTab() {
  const { toast } = useToast();
  const { profile, isLoading, isSaving, error, saveProfile } = useTaxProfile();

  const handleFormSubmit = async (formData: Partial<TaxProfileData>) => {
    const res = await saveProfile(formData);
    if (res.isOk) {
      toast({
        title: 'Dados fiscais atualizados',
        description: 'Perfil fiscal gravado com sucesso no ecossistema ZEHLA.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Falha ao salvar dados fiscais',
        description: res.error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#FF5500] animate-spin" />
        <span className="text-xs text-neutral-500 font-mono tracking-widest">BUSCANDO CADASTRO FISCAL...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400">
          Erro ao sincronizar dados fiscais: {error}
        </div>
      )}

      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-[#FF5500]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#fafafa]">Dados Fiscais & Emissão de Notas</h3>
          <p className="text-xs text-[#898989] mt-0.5">Configure seu CNPJ e chaves do integrador de NFS-e</p>
        </div>
      </div>

      <TaxProfileFormUI 
        initialData={profile} 
        onSubmit={handleFormSubmit} 
        isPending={isSaving} 
      />
    </div>
  );
}
