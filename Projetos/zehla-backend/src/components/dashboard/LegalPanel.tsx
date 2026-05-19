import {
import { motion } from 'framer-motion';
import { useState } from 'react';


'use client';

  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Users,
  Clock,
  FileText,
  Lock,
} from 'lucide-react';

interface LegalPanelProps {
  tenantData: unknown;
}

export function LegalPanel(: void { tenantData }: LegalPanelProps) {
  try {
  const [isSyncing, setIsSyncing] = useState(false);
  const [snrhosConfig, setSnrhosConfig] = useState({
    usuario: 'pousada_sol_api',
    senha: '****************',
    automático: true,
  });

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  // Mock data for guests/FNRH
  const fnrhGuests = [
    { id: 1, name: 'João Silva', room: '101', checkIn: '29/04/2026', status: 'ENVIADO', cpf: '***.452.128-**' },
    { id: 2, name: 'Maria Oliveira', room: '102', checkIn: '29/04/2026', status: 'ENVIADO', cpf: '***.119.308-**' },
    { id: 3, name: 'Pedro Santos', room: '103', checkIn: '29/04/2026', status: 'PENDENTE', cpf: '***.882.418-**' },
    { id: 4, name: 'Ana Costa', room: '104', checkIn: '28/04/2026', status: 'FALHA', cpf: '***.553.218-**' },
  ];

  const statusColors: Record<string, string> = {
    ENVIADO: 'bg-green-500/20 text-green-400 border-green-500/30',
    PENDENTE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    FALHA: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Automação Legal & FNRH
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            O ZEHLA cuida da burocracia para você evitar multas e focar nos seus hóspedes.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Sincronizando...' : 'Sincronizar SNRHos'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Status SNRHos</p>
              <p className="text-sm font-bold text-green-400 mt-0.5">Conectado</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Envios Hoje</p>
              <p className="text-lg font-bold text-neutral-200 mt-0.5">12</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Pendências</p>
              <p className="text-lg font-bold text-amber-400 mt-0.5">2</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Economia de Tempo</p>
              <p className="text-sm font-bold text-purple-400 mt-0.5">~4.5h / mês</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest List / FNRH Status */}
        <div className="lg:col-span-2 glass-card p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              Controle de FNRH (Ficha de Hóspedes)
            </h3>
            <span className="text-[10px] text-neutral-500">Lei 11.771/08</span>
          </div>

          <div className="overflow-x-auto zehla-scroll flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-neutral-500 uppercase tracking-wider">
                  <th className="px-3 py-2">Hóspede</th>
                  <th className="px-3 py-2">Quarto</th>
                  <th className="px-3 py-2">Check-in</th>
                  <th className="px-3 py-2">Status FNRH</th>
                  <th className="px-3 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fnrhGuests.map((guest) => (
                  <tr key={guest.id} className="text-xs hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-3">
                      <p className="font-medium text-neutral-200">{guest.name}</p>
                      <p className="text-[10px] text-neutral-500">{guest.cpf}</p>
                    </td>
                    <td className="px-3 py-3 text-neutral-400">{guest.room}</td>
                    <td className="px-3 py-3 text-neutral-400">{guest.checkIn}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border ${statusColors[guest.status]}`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {guest.status !== 'ENVIADO' && (
                        <button className="text-[10px] text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                          {guest.status === 'FALHA' ? 'Corrigir' : 'Enviar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Config / Compliance */}
        <div className="space-y-6">
          {/* Configuration */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-orange-500" />
              Credenciais SNRHos
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase">Usuário API</label>
                <input
                  type="text"
                  value={snrhosConfig.usuario}
                  onChange={(e) => setSnrhosConfig({ ...snrhosConfig, usuario: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-orange-500/50 mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 uppercase">Senha API</label>
                <input
                  type="password"
                  value={snrhosConfig.senha}
                  onChange={(e) => setSnrhosConfig({ ...snrhosConfig, senha: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-orange-500/50 mt-1 font-mono"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-400">Envio Automático</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={snrhosConfig.automático}
                    onChange={(e) => setSnrhosConfig({ ...snrhosConfig, automático: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Compliance Warning */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-orange-400">Evite Multas</h4>
              <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                A Lei Geral do Turismo exige o preenchimento diário da FNRH. O ZEHLA envia os dados automaticamente no momento do check-in.
              </p>
              <a
                href="https://www.snrhos.turismo.gov.br"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[9px] text-orange-400/80 hover:text-orange-400 font-semibold mt-2 transition-colors"
              >
                Portal SNRHos <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
