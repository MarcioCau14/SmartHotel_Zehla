'use client';

import React, { useState, useEffect } from 'react';
import { useVoiceDNA } from '@/hooks/useVoiceDNA';
import { VoiceRecorder } from './VoiceRecorder';
import { DNAMapper } from './DNAMapper';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ShieldAlert, Sliders, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceStudioV2Props {
  propertyId: string;
  userPlan?: 'LITE' | 'PRO' | 'MAX';
}

export function VoiceStudioV2({ propertyId, userPlan = 'PRO' }: VoiceStudioV2Props) {
  const { voiceDna, loading, uploading, error, uploadAudio, refresh } = useVoiceDNA(propertyId);

  const [status, setStatus] = useState<'IDLE' | 'RECORDING' | 'UPLOADING' | 'TRAINING' | 'READY'>('IDLE');
  
  // Custom DNA Sliders (e.g. for Manual calibration adjustments)
  const [formality, setFormality] = useState(50);
  const [energy, setEnergy] = useState(50);
  const [warmth, setWarmth] = useState(50);
  const [authority, setAuthority] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [savingCustom, setSavingCustom] = useState(false);

  useEffect(() => {
    if (voiceDna && voiceDna.acousticWeights) {
      setFormality(voiceDna.acousticWeights.formality);
      setEnergy(voiceDna.acousticWeights.energy);
      setWarmth(voiceDna.acousticWeights.warmth);
      setAuthority(voiceDna.acousticWeights.authority);
      setSpeed(voiceDna.acousticWeights.speed);
      setStatus('READY');
    }
  }, [voiceDna]);

  const handleUpload = async (mockAudioBase64: string): Promise<boolean> => {
    const result = await uploadAudio(mockAudioBase64);
    if (result.success) {
      toast.success('Captação de voz enviada para processamento neural!');
      return true;
    } else {
      toast.error(result.error || 'Erro ao fazer upload da captação.');
      return false;
    }
  };

  const handleSaveCustomWeights = async () => {
    setSavingCustom(true);
    try {
      // Sending a specific dummy Base64 which triggers generation from custom sliders rather than mock seed
      const saveResponse = await fetch('/api/zcc/voice/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          audioBase64: `SLIDERS_${formality}_${energy}_${warmth}_${authority}_${speed}`,
        }),
      });
      
      const result = await saveResponse.json();
      if (saveResponse.ok) {
        toast.success('Ajustes acústicos salvos com sucesso!');
        refresh();
      } else {
        throw new Error(result.error || 'Erro ao salvar no banco');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar ajustes.');
    } finally {
      setSavingCustom(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
        <span className="ml-3 text-sm text-zinc-400">Carregando Voice Studio...</span>
      </div>
    );
  }

  const parameters = { formality, energy, warmth, authority, speed };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-zinc-200">
      {/* Esquerda: Voice Recorder */}
      <div className="flex justify-center items-start">
        <VoiceRecorder
          userPlan={userPlan}
          status={status}
          onStatusChange={setStatus}
          onUpload={handleUpload}
        />
      </div>

      {/* Direita: DNA Visualizer & Sliders */}
      <div className="space-y-6">
        <Card className="bg-[#0A0A0A] border-zinc-800">
          <CardHeader className="border-b border-zinc-800/50">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#F97316]" /> Radar Espectral de DNA Vocal
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Visualização da teia de tom e frequência da IA
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            {voiceDna ? (
              <DNAMapper parameters={parameters} />
            ) : (
              <div className="py-12 text-center text-zinc-500 max-w-xs space-y-2">
                <ShieldAlert className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="text-xs">Nenhum DNA de voz calibrado. Complete a gravação ao lado para inicializar.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {voiceDna && (
          <Card className="bg-[#0A0A0A] border-zinc-800">
            <CardHeader className="border-b border-zinc-800/50">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#F97316]" /> Ajuste Fino Acústico
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Calibre manualmente as nuances do modelo TTS
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Formalidade</span>
                    <span className="font-bold text-white">{formality}%</span>
                  </div>
                  <Slider 
                    value={[formality]} 
                    onValueChange={(val) => setFormality(val[0])} 
                    max={100} 
                    step={1}
                    className="[&_[role=slider]]:bg-[#F97316]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Energia</span>
                    <span className="font-bold text-white">{energy}%</span>
                  </div>
                  <Slider 
                    value={[energy]} 
                    onValueChange={(val) => setEnergy(val[0])} 
                    max={100} 
                    step={1}
                    className="[&_[role=slider]]:bg-[#F97316]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Calor (Warmth)</span>
                    <span className="font-bold text-white">{warmth}%</span>
                  </div>
                  <Slider 
                    value={[warmth]} 
                    onValueChange={(val) => setWarmth(val[0])} 
                    max={100} 
                    step={1}
                    className="[&_[role=slider]]:bg-[#F97316]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Autoridade</span>
                    <span className="font-bold text-white">{authority}%</span>
                  </div>
                  <Slider 
                    value={[authority]} 
                    onValueChange={(val) => setAuthority(val[0])} 
                    max={100} 
                    step={1}
                    className="[&_[role=slider]]:bg-[#F97316]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Velocidade</span>
                    <span className="font-bold text-white">{speed}%</span>
                  </div>
                  <Slider 
                    value={[speed]} 
                    onValueChange={(val) => setSpeed(val[0])} 
                    max={100} 
                    step={1}
                    className="[&_[role=slider]]:bg-[#F97316]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-800/50">
                <Button 
                  onClick={handleSaveCustomWeights}
                  disabled={savingCustom}
                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-semibold flex items-center gap-2"
                >
                  {savingCustom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#F97316]" /> Salvar Ajustes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
