'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Signal,
  QrCode,
  Unplug,
  ShieldCheck,
  ChevronRight,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Info,
  Zap,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { NicheType } from '@/contexts/NicheContext';

// ═══════════════════════════════════════════════════════════════
// WHATSAPP DEVICE MANAGER — Connection Center
// Painel corporativo de gerenciamento do dispositivo
// WhatsApp Business API oficial da propriedade.
// ═══════════════════════════════════════════════════════════════

// ── Types ──────────────────────────────────────────────────────

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface DeviceInfo {
  phoneNumber: string;
  formattedPhone: string;
  businessName: string;
  batteryLevel: number;
  isCharging: boolean;
  signalQuality: 'excellent' | 'good' | 'fair' | 'poor';
  connectedAt: Date;
  lastHeartbeat: Date;
  messagesProcessed: number;
  wabaId: string; // WhatsApp Business Account ID
}

interface WhatsAppDeviceManagerProps {
  niche: NicheType;
  propertyName?: string;
}

// ── Niche Theme Config ────────────────────────────────────────

const DEVICE_THEME = {
  pousada: {
    accent: 'emerald',
    accentBg: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/25',
    accentText: 'text-emerald-400',
    accentGlow: 'shadow-emerald-500/20',
    accentGradient: 'from-emerald-500 to-teal-500',
    accentDot: 'bg-emerald-500',
    accentRing: 'ring-emerald-500/30',
    accentBtnBg: 'bg-emerald-600 hover:bg-emerald-500',
    connectedBg: 'bg-emerald-500/10 border-emerald-500/25',
    connectedText: 'text-emerald-300',
    connectedGlow: 'shadow-emerald-500/15',
    qrAccent: 'text-emerald-400',
    headerGradient: 'from-emerald-500/10 via-transparent to-teal-500/5',
  },
  airbnb: {
    accent: 'blue',
    accentBg: 'bg-blue-500/15',
    accentBorder: 'border-blue-500/25',
    accentText: 'text-blue-400',
    accentGlow: 'shadow-blue-500/20',
    accentGradient: 'from-blue-500 to-indigo-500',
    accentDot: 'bg-blue-500',
    accentRing: 'ring-blue-500/30',
    accentBtnBg: 'bg-blue-600 hover:bg-blue-500',
    connectedBg: 'bg-blue-500/10 border-blue-500/25',
    connectedText: 'text-blue-300',
    connectedGlow: 'shadow-blue-500/15',
    qrAccent: 'text-blue-400',
    headerGradient: 'from-blue-500/10 via-transparent to-indigo-500/5',
  },
};

// ── Mock Connected Device (para demonstração) ────────────────

const MOCK_CONNECTED_DEVICE: DeviceInfo = {
  phoneNumber: '+5521999998888',
  formattedPhone: '+55 21 99999-8888',
  businessName: 'Pousada Paraíso',
  batteryLevel: 87,
  isCharging: true,
  signalQuality: 'excellent',
  connectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  lastHeartbeat: new Date(Date.now() - 15 * 1000), // 15 seconds ago
  messagesProcessed: 1247,
  wabaId: 'WABA_8f3a2b1c4d',
};

// ── Signal Quality Display ────────────────────────────────────

function SignalIndicator({ quality }: { quality: DeviceInfo['signalQuality'] }) {
  const bars = { excellent: 4, good: 3, fair: 2, poor: 1 }[quality];
  const color = { excellent: 'text-emerald-400', good: 'text-green-400', fair: 'text-yellow-400', poor: 'text-red-400' }[quality];
  const label = { excellent: 'Excelente', good: 'Boa', fair: 'Regular', poor: 'Fraca' }[quality];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-end gap-0.5 h-4">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-1 rounded-full transition-all duration-300 ${
              level <= bars ? `${color} bg-current` : 'bg-zinc-700'
            }`}
            style={{ height: `${level * 25}%` }}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  );
}

// ── Battery Indicator ─────────────────────────────────────────

function BatteryIndicator({ level, isCharging }: { level: number; isCharging: boolean }) {
  const color =
    level > 60 ? 'text-emerald-400' : level > 25 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex items-center gap-2">
      {isCharging ? (
        <BatteryCharging className={`w-4 h-4 ${color}`} />
      ) : (
        <Battery className={`w-4 h-4 ${color}`} />
      )}
      <span className={`text-xs font-medium ${color}`}>{level}%</span>
      {isCharging && (
        <span className="text-[10px] text-emerald-400/70 font-mono">⚡ Carregando</span>
      )}
    </div>
  );
}

// ── QR Code Skeleton ──────────────────────────────────────────

function QRCodeSkeleton({ theme }: { theme: typeof DEVICE_THEME.pousada }) {
  return (
    <div className="relative">
      <motion.div
        className="w-52 h-52 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 flex items-center justify-center relative overflow-hidden"
        animate={{ borderColor: ['rgba(113,113,122,0.5)', 'rgba(113,113,122,0.8)', 'rgba(113,113,122,0.5)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Grid pattern simulation */}
        <div className="grid grid-cols-7 gap-[3px] p-4 opacity-30">
          {Array.from({ length: 49 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-4 h-4 rounded-sm ${theme.accentDot}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0.1] }}
              transition={{ duration: 1.5, delay: i * 0.03, repeat: Infinity, repeatDelay: 2 }}
            />
          ))}
        </div>

        {/* Center logo overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${theme.accentGradient} flex items-center justify-center shadow-lg`}>
            <QrCode className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Scanning line animation */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-40"
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  );
}

// ── Connection Steps ──────────────────────────────────────────

function ConnectionSteps({ theme }: { theme: typeof DEVICE_THEME.pousada }) {
  const steps = [
    { num: '01', title: 'Acesse o Meta Business Suite', desc: 'Crie ou acesse sua conta no Business Manager da Meta' },
    { num: '02', title: 'Registre seu número comercial', desc: 'Vincule o número WhatsApp da propriedade ao Business API' },
    { num: '03', title: 'Configure o Webhook', desc: 'Aponte o callback URL para seu endpoint Zélla' },
    { num: '04', title: 'Escaneie o QR Code', desc: 'Autentique o dispositivo e comece a receber mensagens' },
  ];

  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <motion.div
          key={step.num}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
          className="flex items-start gap-3"
        >
          <div className={`flex-shrink-0 w-7 h-7 rounded-lg ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center`}>
            <span className={`text-[10px] font-bold font-mono ${theme.accentText}`}>{step.num}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200">{step.title}</p>
            <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="w-3 h-3 text-zinc-600 flex-shrink-0 mt-1.5" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT — WhatsAppDeviceManager
// ═══════════════════════════════════════════════════════════════

export function WhatsAppDeviceManager({ niche, propertyName = 'Propriedade' }: WhatsAppDeviceManagerProps) {
  const theme = DEVICE_THEME[niche];
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // ── Simulated Connect ─────────────────────────────────────
  const handleConnect = useCallback(async () => {
    setIsToggling(true);
    setConnectionStatus('connecting');

    // Simula o processo de conexão (3 segundos)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setDeviceInfo({
      ...MOCK_CONNECTED_DEVICE,
      businessName: propertyName,
    });
    setConnectionStatus('connected');
    setIsToggling(false);
  }, [propertyName]);

  // ── Disconnect ────────────────────────────────────────────
  const handleDisconnect = useCallback(() => {
    setIsToggling(true);
    // Simula desconexão
    setTimeout(() => {
      setDeviceInfo(null);
      setConnectionStatus('disconnected');
      setShowDisconnectDialog(false);
      setIsToggling(false);
    }, 800);
  }, []);

  // ── Time formatting ──────────────────────────────────────
  const formatUptime = (since: Date) => {
    const diff = Date.now() - since.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const formatLastHeartbeat = (last: Date) => {
    const diff = Date.now() - last.getTime();
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 300000) return `${Math.floor(diff / 60000)} min atrás`;
    return `${Math.floor(diff / 60000)} min atrás`;
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER: Disconnected State
  // ═══════════════════════════════════════════════════════════
  const renderDisconnected = () => (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-[#0d0d14] border-white/[0.06] overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${theme.accentGradient} opacity-50`} />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center`}>
                <WifiOff className={`w-6 h-6 ${theme.accentText}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white">WhatsApp Business API</h3>
                <p className="text-sm text-zinc-400 mt-0.5">
                  Conecte o número oficial da sua propriedade para receber e responder mensagens automaticamente via Zélla IA.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-red-500/30 text-red-400 bg-red-500/10 font-mono">
                    DESCONECTADO
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-zinc-600 text-zinc-400 bg-zinc-800/50 font-mono">
                    API OFICIAL META
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content: QR + Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-[#0d0d14] border-white/[0.06] h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-zinc-400" />
                Autenticação de Dispositivo
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Escaneie o QR Code com seu WhatsApp Business para autenticar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pb-6">
              <QRCodeSkeleton theme={theme} />

              <div className="text-center space-y-2 w-full">
                <Button
                  onClick={handleConnect}
                  disabled={isToggling}
                  className={`w-full ${theme.accentBtnBg} text-white font-semibold shadow-lg ${theme.accentGlow} transition-all duration-300`}
                  size="lg"
                >
                  {isToggling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Conectar WhatsApp Oficial
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-zinc-600 leading-relaxed">
                  Ao conectar, você autoriza a Zélla a receber e processar mensagens
                  em nome do número vinculado, conforme a{' '}
                  <span className="text-zinc-500 underline">Política de Privacidade</span> e{' '}
                  <span className="text-zinc-500 underline">Termos da Meta</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Steps Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-[#0d0d14] border-white/[0.06] h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-zinc-400" />
                Como Funciona a Conexão
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Passo a passo para ativar o WhatsApp Business API
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <ConnectionSteps theme={theme} />

              <Separator className="my-4 bg-white/[0.04]" />

              {/* Security Notice */}
              <div className={`rounded-xl ${theme.accentBg} border ${theme.accentBorder} p-3`}>
                <div className="flex items-start gap-2">
                  <ShieldCheck className={`w-4 h-4 ${theme.accentText} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`text-xs font-semibold ${theme.accentText}`}>
                      Segurança de Nível Corporativo
                    </p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">
                      Criptografia ponta-a-ponta, isolamento multi-tenant e conformidade LGPD.
                      Cada mensagem é roteada exclusivamente para o tenant proprietário do número.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Info */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-zinc-900/50 border border-white/[0.04] p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] text-zinc-500 font-medium">Latência</span>
                  </div>
                  <p className="text-sm font-bold text-white">&lt;2s</p>
                </div>
                <div className="rounded-lg bg-zinc-900/50 border border-white/[0.04] p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Globe className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] text-zinc-500 font-medium">Uptime SLA</span>
                  </div>
                  <p className="text-sm font-bold text-white">99.9%</p>
                </div>
                <div className="rounded-lg bg-zinc-900/50 border border-white/[0.04] p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] text-zinc-500 font-medium">Criptografia</span>
                  </div>
                  <p className="text-sm font-bold text-white">E2E</p>
                </div>
                <div className="rounded-lg bg-zinc-900/50 border border-white/[0.04] p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Smartphone className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] text-zinc-500 font-medium">API</span>
                  </div>
                  <p className="text-sm font-bold text-white">Official</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: Connecting State
  // ═══════════════════════════════════════════════════════════
  const renderConnecting = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-[#0d0d14] border-white/[0.06] overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${theme.accentGradient} animate-pulse`} />
          <CardContent className="p-8 flex flex-col items-center gap-6">
            <motion.div
              className={`w-20 h-20 rounded-2xl ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center`}
              animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Loader2 className={`w-10 h-10 ${theme.accentText} animate-spin`} />
            </motion.div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Estabelecendo Conexão Segura</h3>
              <p className="text-sm text-zinc-400">
                Verificando credenciais com a Meta Cloud API...
              </p>
            </div>

            {/* Progress Steps */}
            <div className="w-full max-w-sm space-y-3">
              {[
                { label: 'Verificando token de acesso', done: true },
                { label: 'Registrando webhook endpoint', done: true },
                { label: 'Autenticando número comercial', done: false },
                { label: 'Sincronizando estado do dispositivo', done: false },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex items-center gap-3"
                >
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-zinc-500 animate-spin flex-shrink-0" />
                  )}
                  <span className={`text-xs ${step.done ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: Connected State
  // ═══════════════════════════════════════════════════════════
  const renderConnected = () => {
    if (!deviceInfo) return null;

    return (
      <div className="space-y-6">
        {/* Green Glowing Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`bg-[#0d0d14] border-emerald-500/20 shadow-lg ${theme.connectedGlow} overflow-hidden relative`}>
            {/* Animated glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500" />
            {/* Subtle pulsing background */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Connected device icon */}
                  <motion.div
                    className="w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0"
                    animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0)', '0 0 20px 4px rgba(16,185,129,0.15)', '0 0 0 0 rgba(16,185,129,0)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Smartphone className="w-7 h-7 text-emerald-400" />
                  </motion.div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">WhatsApp Conectado</h3>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-emerald-500"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <p className="text-sm text-emerald-300/80 mt-0.5 font-medium">
                      {deviceInfo.formattedPhone}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/15 text-emerald-400 border-emerald-500/25 border font-mono">
                        ONLINE
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-zinc-600 text-zinc-400 bg-zinc-800/50 font-mono">
                        WABA: {deviceInfo.wabaId}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Disconnect button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisconnectDialog(true)}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition-all"
                >
                  <Unplug className="w-3.5 h-3.5 mr-1.5" />
                  Desconectar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Device Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phone Number */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[#0d0d14] border-white/[0.06]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Número</span>
                </div>
                <p className="text-sm font-bold text-white">{deviceInfo.formattedPhone}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{deviceInfo.businessName}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Battery */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-[#0d0d14] border-white/[0.06]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Battery className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Bateria</span>
                  </div>
                  <BatteryIndicator level={deviceInfo.batteryLevel} isCharging={deviceInfo.isCharging} />
                </div>
                <Progress value={deviceInfo.batteryLevel} className="h-1.5 bg-zinc-800" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Signal Quality */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[#0d0d14] border-white/[0.06]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Signal className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Conexão</span>
                </div>
                <SignalIndicator quality={deviceInfo.signalQuality} />
                <p className="text-[10px] text-zinc-600 mt-1.5">
                  Último heartbeat: {formatLastHeartbeat(deviceInfo.lastHeartbeat)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Uptime / Messages */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-[#0d0d14] border-white/[0.06]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Uptime</span>
                </div>
                <p className="text-sm font-bold text-white">{formatUptime(deviceInfo.connectedAt)}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {deviceInfo.messagesProcessed.toLocaleString('pt-BR')} mensagens processadas
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-[#0d0d14] border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-zinc-400" />
                Detalhes Técnicos da Conexão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Business Account ID', value: deviceInfo.wabaId },
                  { label: 'Phone Number ID', value: 'PNID_a1b2c3d4e5' },
                  { label: 'Webhook Status', value: 'Ativo', isGreen: true },
                  { label: 'Certificado SSL', value: 'Válido', isGreen: true },
                ].map((detail) => (
                  <div key={detail.label} className="space-y-1">
                    <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">{detail.label}</p>
                    <p className={`text-xs font-mono ${detail.isGreen ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Webhook Configuration Info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-[#0d0d14] border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-400" />
                Configuração do Webhook
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500">
                Endpoints configurados para receber eventos da Meta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { method: 'GET', path: '/api/webhooks/whatsapp', purpose: 'Verificação do Webhook (Meta)' },
                  { method: 'POST', path: '/api/webhooks/whatsapp', purpose: 'Recepção de mensagens' },
                ].map((endpoint) => (
                  <div key={endpoint.method + endpoint.path} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-zinc-900/50 border border-white/[0.03]">
                    <Badge className={`text-[9px] px-1.5 py-0 h-4 font-mono font-bold ${
                      endpoint.method === 'GET'
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                        : 'bg-green-500/15 text-green-400 border-green-500/25'
                    }`}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-xs text-zinc-300 font-mono flex-1">{endpoint.path}</code>
                    <span className="text-[10px] text-zinc-600">{endpoint.purpose}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER: Error State
  // ═══════════════════════════════════════════════════════════
  const renderError = () => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-[#0d0d14] border-red-500/20">
        <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Erro na Conexão</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Não foi possível estabelecer a conexão com a Meta Cloud API.
              Verifique suas credenciais e tente novamente.
            </p>
          </div>
          <Button
            onClick={handleConnect}
            className={`${theme.accentBtnBg} text-white font-semibold`}
          >
            <Wifi className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: Disconnect Confirmation Dialog
  // ═══════════════════════════════════════════════════════════
  const renderDisconnectDialog = () => (
    <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
      <DialogContent className="bg-[#0d0d14] border-white/[0.06] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Confirmar Desconexão
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Esta ação irá desconectar o WhatsApp Business API da sua propriedade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-xs text-red-300 font-medium">⚠️ Atenção: Impactos da Desconexão</p>
            <ul className="text-[11px] text-zinc-400 mt-1.5 space-y-1 list-disc list-inside">
              <li>Todas as mensagens recebidas deixarão de ser processadas</li>
              <li>Respostas automáticas da Zélla IA serão suspensas</li>
              <li>Hóspedes em atendimento ativo não receberão resposta</li>
              <li>Reconexão requererá nova autenticação via QR Code</li>
            </ul>
          </div>

          {deviceInfo && (
            <div className="rounded-xl bg-zinc-900/50 border border-white/[0.04] p-3 flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-white">{deviceInfo.formattedPhone}</p>
                <p className="text-[10px] text-zinc-500">{deviceInfo.businessName}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDisconnectDialog(false)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDisconnect}
            disabled={isToggling}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold"
          >
            {isToggling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Desconectando...
              </>
            ) : (
              <>
                <Unplug className="w-4 h-4 mr-2" />
                Desconectar WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ═══════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-0">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${theme.accentBg} border ${theme.accentBorder} flex items-center justify-center`}>
            <Smartphone className={`w-5 h-5 ${theme.accentText}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Connection Center</h2>
            <p className="text-xs text-zinc-500">
              Gerencie a conexão do WhatsApp Business API da sua propriedade
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content based on status */}
      <AnimatePresence mode="wait">
        {connectionStatus === 'disconnected' && (
          <motion.div key="disconnected" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {renderDisconnected()}
          </motion.div>
        )}
        {connectionStatus === 'connecting' && (
          <motion.div key="connecting" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {renderConnecting()}
          </motion.div>
        )}
        {connectionStatus === 'connected' && (
          <motion.div key="connected" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {renderConnected()}
          </motion.div>
        )}
        {connectionStatus === 'error' && (
          <motion.div key="error" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {renderError()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disconnect Dialog */}
      {renderDisconnectDialog()}
    </div>
  );
}
