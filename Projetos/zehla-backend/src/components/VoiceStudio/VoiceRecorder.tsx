'use client';

import React, { useState, useRef } from 'react';
import { Mic, Lock, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Result } from '../../shared/Result';

interface VoiceRecorderProps {
  userPlan?: 'LITE' | 'PRO' | 'MAX';
  onUploadComplete: (url: string) => void;
  uploadVoiceSample: (audioBlob: Blob, filename: string) => Promise<Result<string, Error>>;
}

export const VoiceRecorder = ({
  userPlan = 'PRO',
  onUploadComplete,
  uploadVoiceSample
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [status, setStatus] = useState<'IDLE' | 'RECORDING' | 'UPLOADING' | 'TRAINING' | 'READY'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isLocked = userPlan === 'LITE';

  const handleStartRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Parar os tracks do microfone
        stream.getTracks().forEach((track) => track.stop());

        setStatus('UPLOADING');
        const uploadResult = await uploadVoiceSample(audioBlob, `voice_capture_${Date.now()}.wav`);
        
        if (uploadResult.isFail) {
          setErrorMessage(uploadResult.error.message);
          setStatus('IDLE');
          return;
        }

        setStatus('TRAINING');
        // Simulação do processamento few-shot do ZEHLA
        setTimeout(() => {
          setStatus('READY');
          onUploadComplete(uploadResult.value);
        }, 3000);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('RECORDING');
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= 90) { 
            handleStopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Erro ao acessar microfone:', err);
      setErrorMessage('Não foi possível acessar o microfone. Verifique as permissões de gravação.');
      setStatus('IDLE');
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
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
            <CheckCircle className="w-5 h-5 text-[#FF5500] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300">Responda dúvidas de hóspedes em milissegundos usando mensagens de áudio idênticas à sua voz real.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#FF5500] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300">Humanize o atendimento 100% automatizado, aumentando a taxa de conversão do seu WhatsApp.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#FF5500] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300">Treinamento em apenas 11 minutos. Basta ler um texto de 1m 30s.</p>
          </div>
        </div>

        <button className="w-full bg-[#FF5500] hover:bg-[#E04400] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,85,0,0.3)] flex items-center justify-center gap-2">
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
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-[#FF5500]">
          <Mic className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-[#111111] p-3 rounded-lg border border-orange-500/20 text-xs text-zinc-300 mb-6">
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-[#FF5500] font-semibold">Plano PRO:</span> Clone sua voz e automatize áudios no WhatsApp.
          </div>
          <div className="pt-2 border-t border-white/5">
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Plano MAX (Absolute):
            </span> 
            A IA não apenas fala com sua voz, mas adapta o tom, a velocidade e a emoção de acordo com o DNA de cada hóspede.
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {status === 'IDLE' && (
        <div className="text-center py-2">
          <p className="text-sm text-zinc-400 mb-4">Leia o texto abaixo em um ambiente silencioso para capturarmos sua <b>Voice Print</b>.</p>
          <div className="bg-[#111111] p-4 rounded-lg border border-zinc-800 text-sm italic text-zinc-300 mb-6 text-left shadow-inner">
            "Olá! Aqui é da administração da pousada. Gostaríamos de confirmar a sua reserva para o próximo final de semana. Se precisar de dicas sobre as praias ou restaurantes locais, é só me chamar por aqui. Estamos ansiosos para receber você!"
          </div>
          <button 
            onClick={handleStartRecording}
            className="w-full bg-[#FF5500] hover:bg-[#E04400] text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,85,0,0.4)]"
          >
            Iniciar Gravação (90s máximo)
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
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-zinc-700"
          >
            Finalizar Captação
          </button>
        </div>
      )}

      {(status === 'UPLOADING' || status === 'TRAINING') && (
        <div className="text-center py-10 space-y-4">
          <div className="inline-block w-12 h-12 border-4 border-[#FF5500]/30 border-t-[#FF5500] rounded-full animate-spin"></div>
          <h3 className="text-lg font-medium text-white">
            {status === 'UPLOADING' ? 'Processando Áudio e Ruído...' : 'Injetando LoRA no Modelo...'}
          </h3>
          <p className="text-xs text-zinc-500">
            {status === 'UPLOADING' ? 'Enviando fluxo binário de áudio ao servidor.' : 'Realizando fine-tuning few-shot no ZEHLA Brain.'}
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
            onClick={() => {setStatus('IDLE'); setRecordTime(0);}}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-4 rounded-xl transition-all border border-zinc-700"
          >
            Gravar Outra Amostra
          </button>
        </div>
      )}
    </div>
  );
};
