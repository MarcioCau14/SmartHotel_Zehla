'use client';

import { Shield, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ZCC_ADMIN_EMAIL || 'admin@smarthotel.com';
const ADMIN_PASSWORD_HASH = process.env.NEXT_PUBLIC_ZCC_ADMIN_PASSWORD || 'zehla2026';

export default function ZCCLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@smarthotel.com');
  const [senha, setSenha] = useState('zehla2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 600));

    // Validate admin credentials
    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && senha === ADMIN_PASSWORD_HASH) {
      // Store admin session
      localStorage.setItem('zehla-admin-token', btoa(JSON.stringify({
        role: 'admin',
        email: ADMIN_EMAIL,
        iat: Date.now(),
        exp: Date.now() + (24 * 60 * 60 * 1000), // 24h session
      })));
      document.cookie = '__session=fake-admin-token; path=/; max-age=86400';
      setIsLoading(false);
      window.location.href = '/zcc';
    } else {
      setError('Credenciais inválidas. Acesso restrito ao administrador.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        {/* Back to site */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-300 transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao site
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6 text-sm text-amber-400">
              <Shield className="w-4 h-4" />
              <span>ZEHLA Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-100 mb-2">
              Acesso Administrativo
            </h1>
            <p className="text-neutral-400 text-sm">
              SMARTHOTEL / ZEHLA — Painel de gestão empresarial
            </p>
          </div>

          {/* Admin info badge */}
          <div className="glass-card p-4 mb-6 border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">Área Restrita</h3>
                <p className="text-xs text-neutral-500">
                  Este painel é exclusivo para administradores da SMARTHOTEL/ZEHLA.
                  Aqui você visualiza todos os cadastros, pagamentos e métricas da empresa.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                E-mail do Administrador
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="admin@smarthotel.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setError(null); }}
                  placeholder="Senha administrativa"
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Acessar ZEHLA Control Center
                </>
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-xs text-neutral-600">
              Painel exclusivo SMARTHOTEL / ZEHLA Technologies
            </p>
            <p className="text-[10px] text-neutral-700">
              Acesso restrito a administradores autorizados
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
