import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorMessageProps {
  readonly message: string
  readonly onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <p className="text-lg font-medium text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
