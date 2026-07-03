'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster, toast } from 'sonner';
import {
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Loader2,
  Zap,
  CheckCircle2,
  Activity,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0d] p-4 text-white">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            <span className="text-zinc-400 text-sm">Carregando...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Password reveal states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    pousadaName: '',
    cnpjOrCpf: '',
  });

  const [agreedTerms, setAgreedTerms] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error('Credenciais inválidas. Verifique seu email e senha.');
      } else {
        toast.success('Login realizado com sucesso!');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!agreedTerms) {
      toast.error('Você deve concordar com os Termos de Uso e a Política de Privacidade.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          phone: registerData.phone,
          pousadaName: registerData.pousadaName,
          cnpjOrCpf: registerData.cnpjOrCpf,
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success('Conta criada com sucesso! Acessando...');
        const result = await signIn('credentials', {
          email: registerData.email,
          password: registerData.password,
          redirect: false,
        });
        if (result?.ok) {
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        toast.error(data.error || 'Erro ao criar conta.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0a0a0d] text-white select-none">
      <Toaster position="top-center" richColors />

      {/* COLUNA ESQUERDA: PAINEL DE DESTAQUE (Exatamente 50% largura no desktop) */}
      <div className="hidden lg:flex bg-[#121216] border-r border-white/[0.04] p-8 sm:p-16 lg:p-20 flex-col justify-between relative">
        {/* Header da Marca */}
        <div className="flex items-center gap-3">
          <div>
            <span className="font-extrabold text-white text-xl block leading-none tracking-tight">
              Seu Zélla
            </span>
            <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider block mt-1">
              Cognitive OS for Hospitality
            </span>
          </div>
        </div>

        {/* Copy Principal */}
        <div className="my-auto space-y-8 max-w-md">
          <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight font-serif">
            Tudo o que você precisa para colocar o assistente da sua pousada no ar.
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#1a1a24] border border-white/[0.06] flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">IA ativa no WhatsApp em minutos</h4>
                <p className="text-zinc-500 text-xs mt-1">
                  Sem burocracia ou processos complexos de homologação. Comece a responder imediatamente.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#1a1a24] border border-white/[0.06] flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">FAQs e Calendário iCal nativos</h4>
                <p className="text-zinc-500 text-xs mt-1">
                  Importe as regras de hospedagem e sincronize com Booking e Airbnb em segundos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#1a1a24] border border-white/[0.06] flex items-center justify-center text-emerald-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Diário de Conversas & Handover</h4>
                <p className="text-zinc-500 text-xs mt-1">
                  Veja tudo em tempo real e assuma o controle do chat sempre que julgar necessário.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Esquerdo */}
        <p className="text-zinc-600 text-xs">
          © 2026 Seu Zélla. Todos os direitos reservados.
        </p>
      </div>

      {/* COLUNA DIREITA: FORMULÁRIO COMPACTO DE ALTA DENSIDADE (Exatamente 50% largura no desktop) */}
      <div className="flex flex-col justify-center p-8 sm:p-16 lg:p-20 overflow-y-auto min-h-screen bg-[#0a0a0d]">
        <div className="w-full max-w-xl mx-auto">
          
          {mode === 'login' ? (
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Acesse sua conta
                </h3>
                <p className="text-zinc-400 text-sm mt-2">
                  Gerencie as reservas e acompanhe a IA da sua pousada
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-zinc-300 text-xs font-semibold">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 bg-[#121216] border-white/[0.06] focus:border-emerald-500/50 focus:ring-emerald-500/20 text-white placeholder:text-zinc-500 rounded-xl"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-zinc-300 text-xs font-semibold">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="--------"
                      className="pl-10 pr-10 bg-[#121216] border-white/[0.06] focus:border-emerald-500/50 focus:ring-emerald-500/20 text-white placeholder:text-zinc-500 rounded-xl"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl mt-6 cursor-pointer active:scale-[0.98] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Acessando...</>
                  ) : (
                    'Entrar no Painel'
                  )}
                </Button>
              </form>

              <p className="text-center text-zinc-500 text-sm mt-8">
                Não possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setShowPassword(false);
                  }}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Criar conta
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Crie sua pousada
                </h3>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* GRID DE CAMPOS: DENSIDADE MÁXIMA DE INFORMAÇÃO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  
                  {/* Nome Completo */}
                  <div className="space-y-1.5 col-span-1">
                    <Label htmlFor="reg-name" className="text-zinc-300 text-xs font-semibold">Nome completo *</Label>
                    <Input
                      id="reg-name"
                      placeholder="Seu nome completo"
                      className="bg-[#121216] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-lg py-2"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1.5 col-span-1">
                    <Label htmlFor="reg-email" className="text-zinc-300 text-xs font-semibold">E-mail *</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="bg-[#121216] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-lg py-2"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>

                  {/* Senha */}
                  <div className="space-y-1.5 col-span-1">
                    <Label htmlFor="reg-password" className="text-zinc-300 text-xs font-semibold">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        className="bg-[#121216] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-lg py-2 pr-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Senha */}
                  <div className="space-y-1.5 col-span-1">
                    <Label htmlFor="reg-confirm-password" className="text-zinc-300 text-xs font-semibold">Confirmar senha *</Label>
                    <div className="relative">
                      <Input
                        id="reg-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repita a senha"
                        className="bg-[#121216] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-lg py-2 pr-10"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Separador de Seção "SUA POUSADA" */}
                  <div className="col-span-2 pt-1">
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-white/[0.06]"></div>
                      <span className="flex-shrink mx-4 text-[9px] text-zinc-500 font-bold tracking-widest uppercase">
                        Sua Pousada
                      </span>
                      <div className="flex-grow border-t border-white/[0.06]"></div>
                    </div>
                  </div>

                  {/* Nome da Pousada (Largura total/col-span 2) */}
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="reg-pousada" className="text-zinc-300 text-xs font-semibold">Nome da sua pousada *</Label>
                    <Input
                      id="reg-pousada"
                      placeholder="Minha Pousada Premium"
                      className="bg-[#121216] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-lg py-2 w-full"
                      value={registerData.pousadaName}
                      onChange={(e) => setRegisterData({ ...registerData, pousadaName: e.target.value })}
                      required
                    />
                  </div>

                  {/* CNPJ ou CPF */}
                  <div className="space-y-1.5 col-span-1">
                    <Label htmlFor="reg-cnpj" className="text-zinc-300 text-xs font-semibold">CNPJ ou CPF *</Label>
                    <Input
                      id="reg-cnpj"
                      placeholder="CNPJ ou CPF"
                      className="bg-[#121216] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-lg py-2"
                      value={registerData.cnpjOrCpf}
                      onChange={(e) => setRegisterData({ ...registerData, cnpjOrCpf: e.target.value })}
                      required
                    />
                  </div>

                  {/* WhatsApp ou Telefone */}
                  <div className="space-y-1.5 col-span-1">
                    <Label htmlFor="reg-phone" className="text-zinc-300 text-xs font-semibold">WhatsApp ou Telefone *</Label>
                    <Input
                      id="reg-phone"
                      placeholder="(11) 99999-9999"
                      className="bg-[#121216] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-lg py-2"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      required
                    />
                  </div>

                  {/* Explicador de Dados (Largura Inteira) */}
                  <p className="text-[11px] text-zinc-500 leading-normal col-span-2">
                    Seu nome, e-mail e telefone são usados para criar e proteger o acesso à sua conta — não usamos esses dados para outra finalidade sem te avisar.
                  </p>

                  {/* Checkbox Termos de Uso (Col-span 1 no desktop) */}
                  <div className="flex items-start gap-3 mt-1.5 col-span-1">
                    <input
                      id="terms-checkbox"
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="w-4.5 h-4.5 mt-0.5 rounded border-white/[0.08] bg-[#121216] text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <Label htmlFor="terms-checkbox" className="text-zinc-400 text-[11px] leading-snug font-normal cursor-pointer select-none">
                      Concordo com os <a href="#" className="text-emerald-400 hover:underline">Termos de Uso</a> e a <a href="#" className="text-emerald-400 hover:underline">Política de Privacidade</a>.
                    </Label>
                  </div>

                  {/* Cloudflare Turnstile Mock (Col-span 1 no desktop - Lado a lado com os termos) */}
                  <div className="bg-[#121216]/60 border border-white/[0.06] rounded-lg p-2.5 flex items-center justify-between col-span-1 text-[10px] text-zinc-400 font-medium h-fit shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 rounded-full shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>Sucesso!</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-70">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="font-mono text-[8px] text-zinc-500">Turnstile</span>
                    </div>
                  </div>

                  {/* Botão de Envio (Largura Inteira) */}
                  <div className="col-span-2 pt-1">
                    <Button
                      type="submit"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-lg cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando sua pousada...</>
                      ) : (
                        <>
                          <Sparkles className="w-4.5 h-4.5" />
                          Criar minha pousada
                        </>
                      )}
                    </Button>
                  </div>

                </div>
              </form>

              <p className="text-center text-zinc-500 text-sm mt-5">
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setShowPassword(false);
                  }}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Fazer login
                </button>
              </p>
            </div>
          )}

          {/* Rodapé Final */}
          <div className="border-t border-white/[0.04] pt-4 mt-6 text-center">
            <p className="text-zinc-600 text-[10px]">
              © 2026 SEU ZÉLLA — O zelador da sua pousada.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
