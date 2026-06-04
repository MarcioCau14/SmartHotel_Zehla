'use client'

import { useFarmerCandidates, useReactivateLead } from '@/hooks/use-farmer-candidates'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorMessage } from '@/components/ui/error-message'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function FarmerDashboardPage() {
  const { candidates, isLoading, error, refresh } = useFarmerCandidates()
  const reactivate = useReactivateLead()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Farmer IA — Reativação</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Farmer IA — Reativação</h1>
        <ErrorMessage message={error} onRetry={refresh} />
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Farmer IA — Reativação</h1>
        <p className="text-muted-foreground">Nenhum candidato a reativação no momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Farmer IA — Reativação</h1>
        <Badge variant="outline" className="text-sm">
          {candidates.length} candidatos
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <Card key={candidate.leadId} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{candidate.guestName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {candidate.daysSinceCheckout} dias inativo
              </p>
              <p className="text-sm font-medium">
                Valor esperado: US$ {candidate.expectedValueUsd.toFixed(2)}
              </p>
              <Button
                className="w-full"
                onClick={() => reactivate.mutate(candidate.leadId)}
                disabled={reactivate.isPending}
              >
                {reactivate.isPending ? 'Reativando...' : 'Acionar Retarget'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
