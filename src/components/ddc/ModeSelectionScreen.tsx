'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Home, Building2 } from 'lucide-react'

interface ModeSelectionScreenProps {
  onSelect: (mode: 'pousada' | 'airbnb') => void
}

export function ModeSelectionScreen({ onSelect }: ModeSelectionScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto">
            Z
          </div>
          <h1 className="text-3xl font-bold">Zélla</h1>
          <p className="text-muted-foreground">Zelador Digital — Como você quer usar o Zélla?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 group"
            onClick={() => onSelect('pousada')}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
                <Building2 className="h-8 w-8 text-secondary-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="text-xl">Pousadas</CardTitle>
              <CardDescription>Zélla Pousada — Secretária hospitaleira</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>✓ Secretaria virtual hospitaleira</li>
                <li>✓ Foco em vendas de acomodações</li>
                <li>✓ Atendimento ao hóspede</li>
                <li>✓ Sugerir acomodações e incentivar reserva</li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 group border-2 border-primary/30"
            onClick={() => onSelect('airbnb')}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Imóveis Airbnb</CardTitle>
              <CardDescription>Zélla AirB — Anfitrião Digital</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>✓ Anfitrião digital que conhece o imóvel</li>
                <li>✓ Vendas + suporte no mesmo assistente</li>
                <li>✓ Raspagem automática de dados</li>
                <li>✓ Magic Onboarding — cadastro em segundos</li>
              </ul>
              <Badge className="mt-3">Recomendado</Badge>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Após escolher, você não poderá mudar de modo.
        </p>
      </div>
    </div>
  )
}
