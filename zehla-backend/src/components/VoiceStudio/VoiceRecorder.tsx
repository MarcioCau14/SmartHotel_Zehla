'use client'

import React, { useState, useEffect } from 'react';
import { Mic, Lock, Zap, CheckCircle } from 'lucide-react';

export interface VoiceRecorderProps {
  userPlan?: 'LITE' | 'PRO' | 'MAX';
  status: 'IDLE' | 'RECORDING' | 'UPLOADING' | 'TRAINING' | 'READY';
  onStatusChange: (status: 'IDLE' | 'RECORDING' | 'UPLOADING' | 'TRAINING' | 'READY') => void;
  onUpload: (mockedAudioBase64: string) => Promise<boolean>;
}

export const VoiceRecorder = ({
  userPlan = 'PRO',
  status,
  onStatusChange,
  onUpload
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  const isLocked = userPlan === 'LITE';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'RECORDING') {
      setIsRecording(true);
      interval = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= 90) { 
            clearInterval(interval);
            handleStopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setIsRecording(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const handleStartRecording = () => {
    setRecordTime(0);
    onStatusChange('RECORDING');
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    onStatusChange('UPLOADING');
    
    // Simula uma string Base64 curta para o upload
    const mockAudioBase64 = "UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    
    const success = await onUpload(mockAudioBase64);
    if (success) {
      onStatusChange('TRAINING');
      setTimeout(() => {
        onStatusChange('READY');
      }, 3000);
    } else {
      onStatusChange('IDLE');
    }
  };

  const progress = (recordTime / 90) * 100;

  if (isLocked) {
    return (
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
          <Lock className="w-8 h-8 text-zinc-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Voice Studio</h2>
        <p className="text-sm text-zinc-400 mb-6">A IA que fecha vendas com a sua voz.</p>
        
        <div className="bg-[#111111] p-4 rounded-xl border border-zinc-800 text-left mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300">Responda dúvidas de hóspedes em milissegundos usando mensagens de áudio idênticas à sua voz real.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300">Humanize o atendimento 100% automatizado, aumentando a taxa de conversão do seu WhatsApp.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#F97316] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300">Treinamento em apenas 11 minutos. Basta ler um texto de 1m 30s.</p>
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-orange-500 to-[#F97316] hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" />
          Fazer Upgrade para PRO / MAX
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-md w-full text-zinc-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">ZEHLA Voice Studio</h2>
          <p className="text-xs text-zinc-500 mt-1">Gere sua Voice Print via IA Neural</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-[#F97316]">
          <Mic className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-[#111111] p-3 rounded-lg border border-orange-500/20 text-xs text-zinc-300 mb-6">
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-[#F97316] font-semibold">Plano PRO:</span> Clone sua voz e automatize áudios no WhatsApp.
          </div>
          <div className="pt-2 border-t border-white/5">
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Plano MAX (Absolute):
            </span> 
            A IA não apenas fala com sua voz, mas adapta o tom, a velocidade e a emoção de acordo com o DNA de cada hóspede.
          </div>
        </div>
      </div>

      {status === 'IDLE' && (
        <div className="text-center py-2">
          <p className="text-sm text-zinc-400 mb-4">Leia o texto abaixo em um ambiente silencioso para capturarmos sua <b>Voice Print</b>.</p>
          <div className="bg-[#111111] p-4 rounded-lg border border-zinc-800 text-sm italic text-zinc-300 mb-6 text-left shadow-inner">
            "Olá! Aqui é da administração da pousada. Gostaríamos de confirmar a sua reserva para o próximo final de semana. Se precisar de dicas sobre as praias ou restaurantes locais, é só me chamar por aqui. Estamos ansiosos para receber você!"
          </div>
          <button 
            onClick={handleStartRecording}
            className="w-full bg-[#F97316] hover:bg-orange-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)]"
          >
            Iniciar Gravação (1m 30s)
          </button>
        </div>
      )}

      {status === 'RECORDING' && (
        <div className="text-center py-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-rose-500/20 rounded-full animate-ping absolute"></div>
              <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                <span className="text-white font-mono font-bold text-lg">{Math.floor(recordTime / 60)}:{(recordTime % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2 mb-6 overflow-hidden">
            <div className="bg-rose-500 h-2 transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
          </div>
          <button 
            onClick={handleStopRecording}
            className="w-full bg-zinc-800 hover:bg-rose-500 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-zinc-700"
          >
            Finalizar Captação
          </button>
        </div>
      )}

      {(status === 'UPLOADING' || status === 'TRAINING') && (
        <div className="text-center py-10 space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-[#F97316]/30 border-t-[#F97316] rounded-full animate-spin"></div>
          <h3 className="text-lg font-medium text-white">
            {status === 'UPLOADING' ? 'Processando Áudio e Ruído...' : 'Injetando LoRA no Modelo...'}
          </h3>
          <p className="text-xs text-zinc-500">
            {status === 'UPLOADING' ? 'Extraindo vetores acusticos de 6 dimensões.' : 'Realizando fine-tuning few-shot no ZEHLA Brain.'}
          </p>
        </div>
      )}

      {status === 'READY' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Voice Print Ativa!</h3>
          <p className="text-sm text-zinc-400 mb-6">O ZEHLA agora pode responder os hóspedes usando a sua voz exata e os protocolos do DNA Wizard.</p>
          <button 
            onClick={() => {onStatusChange('IDLE'); setRecordTime(0);}}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-zinc-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
