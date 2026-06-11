'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceDNA } from '@/hooks/useVoiceDNA';
import { VoiceRecorder } from './VoiceRecorder';
import { DNAMapper } from './DNAMapper';
import { 
  Sparkles, 
  Mic, 
  Settings, 
  Save, 
  Volume2, 
  TrendingUp, 
  ShieldCheck, 
  BadgeAlert,
  BadgeCheck, 
  Info, 
  Play, 
  CircleDot,
  CheckCircle,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

export function VoiceStudioV2() {
  const { toast } = useToast();
  const { data, isLoading, isSaving, error, saveDNA, uploadVoiceSample } = useVoiceDNA();

  // Estados locais das 5 variáveis acústicas
  const [formality, setFormality] = useState(50);
  const [energy, setEnergy] = useState(70);
  const [warmth, setWarmth] = useState(80);
  const [authority, setAuthority] = useState(50);
  const [speed, setSpeed] = useState(60);

  // Estados locais de arquétipo e outras chaves
  const [toneArchetype, setToneArchetype] = useState(3);
  const [proactivity, setProactivity] = useState('HYBRID');
  const [emojiLevel, setEmojiLevel] = useState('MODERATE');

  // Controle de amostras de voz gravadas
  const [voiceSamples, setVoiceSamples] = useState({
    s1: '',
    s2: '',
    s3: ''
  });

  // Atualizar estados locais quando os dados carregarem do backend
  useEffect(() => {
    if (data?.tone) {
      const tone = data.tone;
      setToneArchetype(tone.tonePosition ?? 3);
      setProactivity(tone.toneProactivity ?? 'HYBRID');
      setEmojiLevel(tone.toneEmojiLevel ?? 'MODERATE');
      setFormality(parseInt(tone.toneFormality) || 50);

      // Restaurar amostras de áudio salvas
      setVoiceSamples({
        s1: tone.voiceSample1 || '',
        s2: tone.voiceSample2 || '',
        s3: tone.voiceSample3 || ''
      });
    }
  }, [data]);

  const handleUploadComplete = (url: string) => {
    // Adiciona o áudio na primeira vaga vazia (s1, s2 ou s3)
    setVoiceSamples((prev) => {
      if (!prev.s1) return { ...prev, s1: url };
      if (!prev.s2) return { ...prev, s2: url };
      return { ...prev, s3: url };
    });

    toast({
      title: 'Amostra de voz recebida',
      description: 'Áudio gravado e processado com sucesso pelo ZEHLA Brain.',
    });
  };

  const handleSave = async () => {
    const payload = {
      tone: toneArchetype,
      proactivity,
      emojiLevel,
      formality: formality.toString(),
      voiceSamples: {
        s1: voiceSamples.s1,
        s2: voiceSamples.s2,
        s3: voiceSamples.s3
      },
      // Preservar chaves e dores vazias ou do estado
      discounts: data?.keys.reduce((acc: any, k: any) => ({ ...acc, [k.type]: k.maxPercent * 100 }), {}) || {},
      pains: data?.pains.map((p: any) => p.score) || []
    };

    const res = await saveDNA(payload);
    if (res.isOk) {
      toast({
        title: 'DNA Vocal Salvo',
        description: 'Parâmetros e amostras gravados no banco de dados.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Falha ao salvar',
        description: res.error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#FF5500] animate-spin" />
          <span className="text-xs text-neutral-500 font-mono tracking-widest">CARREGANDO RADAR NEURAL...</span>
        </div>
      </div>
    );
  }

  const vocalParams = { formality, energy, warmth, authority, speed };

  return (
    <div className="space-y-6">
      {/* Top Warning/Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400">
          Erro ao sincronizar com o servidor: {error}
        </div>
      )}

      {/* Main Grid split: Visualizer/Controls and Recorder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Radar Visualizer & Equalizer Controls (8 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Radar visualization & sliders */}
          <div className="glass-card p-6 border border-white/5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5500]/5 rounded-full blur-3xl" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="font-bold text-[#fafafa] flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-[#FF5500]" />
                  Ajuste Fino do DNA Acústico
                </h3>
                <p className="text-xs text-[#898989] mt-0.5">Mapeamento de 5 eixos de comportamento fonético</p>
              </div>
              <BadgeCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Radar view */}
              <div className="bg-neutral-950/40 p-4 rounded-2xl border border-white/[0.02] flex items-center justify-center">
                <DNAMapper parameters={vocalParams} />
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                {/* Formality Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#898989]">Formalidade</span>
                    <span className="text-[#FF5500] font-mono font-bold">{formality}%</span>
                  </div>
                  <Slider 
                    value={[formality]} 
                    onValueChange={(v) => setFormality(v[0])} 
                    max={100} 
                    step={1} 
                    className="accent-[#FF5500]"
                  />
                </div>

                {/* Energy Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#898989]">Energia / Entusiasmo</span>
                    <span className="text-[#FF5500] font-mono font-bold">{energy}%</span>
                  </div>
                  <Slider 
                    value={[energy]} 
                    onValueChange={(v) => setEnergy(v[0])} 
                    max={100} 
                    step={1} 
                  />
                </div>

                {/* Warmth Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#898989]">Calor / Empatia</span>
                    <span className="text-[#FF5500] font-mono font-bold">{warmth}%</span>
                  </div>
                  <Slider 
                    value={[warmth]} 
                    onValueChange={(v) => setWarmth(v[0])} 
                    max={100} 
                    step={1} 
                  />
                </div>

                {/* Authority Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#898989]">Autoridade / Firmeza</span>
                    <span className="text-[#FF5500] font-mono font-bold">{authority}%</span>
                  </div>
                  <Slider 
                    value={[authority]} 
                    onValueChange={(v) => setAuthority(v[0])} 
                    max={100} 
                    step={1} 
                  />
                </div>

                {/* Speed Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#898989]">Velocidade Vocálica</span>
                    <span className="text-[#FF5500] font-mono font-bold">{speed}%</span>
                  </div>
                  <Slider 
                    value={[speed]} 
                    onValueChange={(v) => setSpeed(v[0])} 
                    max={100} 
                    step={1} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Voice Samples Player */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold text-[#fafafa] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#FF5500]" />
              Amostras do Dono Carregadas (Voice Prints)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 's1', label: 'Amostra Principal (s1)' },
                { key: 's2', label: 'Variação Explicativa (s2)' },
                { key: 's3', label: 'Gatilho de Desconto (s3)' }
              ].map((sample, idx) => {
                const url = voiceSamples[sample.key as 's1' | 's2' | 's3'];
                return (
                  <div key={idx} className="bg-neutral-950/60 p-3.5 rounded-xl border border-white/5 flex flex-col justify-between min-h-[90px]">
                    <div className="text-[10px] font-bold text-[#898989] uppercase tracking-wider">{sample.label}</div>
                    {url ? (
                      <div className="mt-2 space-y-2">
                        <audio src={url} controls className="w-full h-8 scale-90 origin-left accent-[#FF5500]" />
                        <button 
                          onClick={() => setVoiceSamples(prev => ({ ...prev, [sample.key]: '' }))}
                          className="text-[9px] text-red-400 hover:text-red-300 transition-colors uppercase font-bold"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#4d4d4d] italic mt-4 block">Nenhum áudio</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Audio Capture & Plan Stats (5 cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Audio Capturer */}
          <div className="flex-1 flex justify-center items-stretch">
            <VoiceRecorder 
              userPlan="PRO" 
              onUploadComplete={handleUploadComplete} 
              uploadVoiceSample={uploadVoiceSample} 
            />
          </div>

          {/* FinOps Voice Budget Stats */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#898989]">Orçamento do Voice Studio</h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded-md border border-emerald-400/10">ATIVO</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-[#fafafa] font-mono">15.240</div>
                  <div className="text-[10px] text-[#4d4d4d]">Tokens de síntese usados este mês</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-[#898989] font-mono">100.000 limit</div>
                  <div className="text-[10px] text-[#4d4d4d]">Quota total do plano PRO</div>
                </div>
              </div>

              <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: '15.2%' }} />
              </div>
              
              <div className="flex items-start gap-2 text-[10px] text-[#898989] bg-white/[0.01] p-3 rounded-lg border border-white/5 mt-2">
                <Info className="w-4 h-4 text-[#FF5500] shrink-0" />
                <span>O ZEHLA monitora ativamente o seu consumo de créditos de voz. O FinOps Circuit Breaker protege você rebaixando temporariamente a resposta para texto caso o consumo diário suba repentinamente.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button floating panel */}
      <div className="flex justify-end pt-4 border-t border-white/5">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-[#FF5500] hover:bg-[#E04400] text-white font-bold py-5 px-8 rounded-xl flex items-center gap-2 text-xs shadow-lg shadow-[#FF5500]/10"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gravando DNA...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Assinatura Digital
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
