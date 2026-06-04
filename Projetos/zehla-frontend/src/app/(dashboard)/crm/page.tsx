'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { ErrorMessage } from '@/components/ui/error-message'
import { useFarmerCandidates } from '@/hooks/use-farmer-candidates'

export default function CRMPage() {
  const { candidates, isLoading, error, refresh } = useFarmerCandidates()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">CRM</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">CRM</h1>
        <ErrorMessage message={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">CRM</h1>
      <p className="text-muted-foreground">{candidates.length} candidatos a reativação</p>
    </div>
  )
}
