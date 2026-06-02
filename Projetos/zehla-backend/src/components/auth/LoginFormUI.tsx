'use client'

import React, { useState } from 'react'

export interface LoginFormUIProps {
  onSubmit: (email: string, password: string) => void
  isLoading: boolean
  errorMessage?: string
}

export function LoginFormUI({ onSubmit, isLoading, errorMessage }: LoginFormUIProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    onSubmit(email.trim(), password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm font-mono">{errorMessage}</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
          E-MAIL
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          disabled={isLoading}
          required
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all disabled:opacity-50 font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2 font-mono">
          SENHA
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          disabled={isLoading}
          required
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all disabled:opacity-50 font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isLoading ? 'Entrando...' : 'Entrar no ZEHLA'}
      </button>
    </form>
  )
}
