'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Home, Building2, ChevronRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

interface OnboardingScreenProps {
  initialMode: 'pousada' | 'airbnb'
  onComplete: (data: { mode: string; planSlug: string; name: string; email: string; password?: string }) => void
}

export function OnboardingScreen({ initialMode, onComplete }: OnboardingScreenProps) {
  const [mode, setMode] = useState(initialMode)
  const [planSlug, setPlanSlug] = useState<'pro' | 'max'>('pro')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    await onComplete({ mode, planSlug, name, email, password })
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full space-y-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Passo {step} de 3</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <Progress value={(step / 3) * 100} />
        </div>

        {/* Step 1: Choose Mode */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Operação</CardTitle>
              <CardDescription>Selecione como você quer usar o Zélla.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    mode === 'airbnb' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setMode('airbnb')}
                >
                  <Home className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Imóveis Airbnb</div>
                  <div className="text-xs text-muted-foreground">Anfitrião Digital</div>
                </button>
                <button
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    mode === 'pousada' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setMode('pousada')}
                >
                  <Building2 className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-medium">Pousadas</div>
                  <div className="text-xs text-muted-foreground">Secretária Virtual</div>
                </button>
              </div>
              <Button className="w-full" onClick={() => setStep(2)}>
                Continuar <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Choose Plan */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Escolha seu Plano</CardTitle>
              <CardDescription>
                {mode === 'airbnb'
                  ? 'Zélla AirB — Anfitrião Digital para seus imóveis Airbnb'
                  : 'Zélla Pousada — Secretária Virtual para sua pousada'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    planSlug === 'pro' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setPlanSlug('pro')}
                >
                  <div className="text-2xl font-bold">PRO</div>
                  <div className="text-lg font-semibold mt-1">R$ 397<span className="text-sm font-normal">/mês</span></div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Até {mode === 'airbnb' ? '4 imóveis' : '4 pousadas'}<br />
                    1 número WhatsApp
                  </div>
                </button>
                <button
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    planSlug === 'max' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setPlanSlug('max')}
                >
                  <div className="text-2xl font-bold">MAX</div>
                  <div className="text-lg font-semibold mt-1">R$ 797<span className="text-sm font-normal">/mês</span></div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Até {mode === 'airbnb' ? '12 imóveis' : '12 pousadas'}<br />
                    Até 3 números WhatsApp<br />
                    Analytics avançado
                  </div>
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Continuar <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Account Info */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Criar Conta</CardTitle>
              <CardDescription>Preencha seus dados para acessar o dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Negócio</Label>
                <Input
                  id="name"
                  placeholder={mode === 'airbnb' ? 'Ex: Apartamentos Vista Mar' : 'Ex: Pousada do Sol'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Summary */}
              <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modo:</span>
                  <span className="font-medium">{mode === 'airbnb' ? 'Imóveis Airbnb' : 'Pousadas'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <span className="font-medium">{planSlug === 'pro' ? 'PRO — R$397/mês' : 'MAX — R$797/mês'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={loading || !name || !email}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Criar Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
