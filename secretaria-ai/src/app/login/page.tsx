'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import { Hotel, Mail, Lock, User, Phone, Building2, Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 text-white">
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
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '', email: '', password: '', phone: '', pousadaName: '',
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: loginData.email, password: loginData.password, redirect: false,
      });
      if (result?.error) {
        toast.error('Credenciais inválidas. Verifique seu email e senha.');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally { setIsLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Conta criada com sucesso! Fazendo login...');
        const result = await signIn('credentials', {
          email: registerData.email, password: registerData.password, redirect: false,
        });
        if (result?.ok) { router.push(callbackUrl); router.refresh(); }
      } else {
        toast.error(data.error || 'Erro ao criar conta.');
      }
    } catch {
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally { setIsLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Hotel className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">ZEHLA</h1>
          </div>
          <p className="text-zinc-400 text-sm">SmartHotel — IA Cognitiva para Pousadas</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
            <TabsTrigger value="login" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Entrar</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Criar Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Bem-vindo de volta</CardTitle>
                <CardDescription className="text-zinc-400">Acesse o painel da sua pousada</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-zinc-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input id="login-email" type="email" placeholder="seu@email.com" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-zinc-300">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input id="login-password" type="password" placeholder="--------" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</>) : 'Entrar'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Criar sua conta</CardTitle>
                <CardDescription className="text-zinc-400">14 dias grátis — sem cartão de crédito</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-zinc-300">Seu Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input id="reg-name" placeholder="Maria Silva" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-pousada" className="text-zinc-300">Nome da Pousada</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input id="reg-pousada" placeholder="Pousada Paraíso" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" value={registerData.pousadaName} onChange={(e) => setRegisterData({ ...registerData, pousadaName: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-zinc-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input id="reg-email" type="email" placeholder="contato@pousada.com" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone" className="text-zinc-300">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input id="reg-phone" placeholder="11999999999" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-zinc-300">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input id="reg-password" type="password" placeholder="Mínimo 6 caracteres" className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required minLength={6} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando conta...</>) : 'Criar Conta Grátis'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-zinc-500 text-xs mt-6">
          © 2025 ZEHLA SmartHotel — Plataforma Cognitiva para Hospitalidade
        </p>
      </div>
    </div>
  );
}
