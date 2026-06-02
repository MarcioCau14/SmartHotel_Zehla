'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { LoginFormUI } from '../../components/auth/LoginFormUI'

export default function LoginPageRoute() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>()

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/zcc')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true)
    setErrorMessage(undefined)

    const result = await login(email, password)

    if (result.isFail) {
      setErrorMessage(result.error.message)
      setIsLoading(false)
      return
    }

    router.push('/zcc')
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 mb-6">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-xs text-slate-400 font-mono">ZEHLA SmartHotel</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2 font-display">
            Bem-vindo de volta
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            Acesse o cérebro ZEHLA da sua pousada
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <LoginFormUI
            onSubmit={handleSubmit}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </div>
  )
}
