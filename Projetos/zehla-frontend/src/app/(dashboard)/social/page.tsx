'use client'

import { useSocialCapture, useConvertToLead } from '@/hooks/use-social-capture'
import { SocialInteractionList } from '@/components/features/social/SocialInteractionList'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorMessage } from '@/components/ui/error-message'

export default function SocialPage() {
  const { interactions, isLoading, error, refresh } = useSocialCapture()
  const convertMutation = useConvertToLead()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Social Capture</h1>
        <p className="text-sm text-muted-foreground">
          Leads capturados via Instagram, Facebook e WhatsApp Status
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Social Capture</h1>
        <p className="text-sm text-muted-foreground">
          Leads capturados via Instagram, Facebook e WhatsApp Status
        </p>
        <ErrorMessage message={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Social Capture</h1>
          <p className="text-sm text-muted-foreground">
            Leads capturados via Instagram, Facebook e WhatsApp Status
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          onClick={() => refresh()}
        >
          Atualizar
        </button>
      </div>

      <SocialInteractionList
        interactions={interactions}
        onConvertToLead={(id) => convertMutation.mutate(id)}
        isConverting={convertMutation.isPending}
      />
    </div>
  )
}
