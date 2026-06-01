'use client'

import { useState, useEffect } from 'react'
import { useRoomsGrid } from '../../../hooks/useRoomsGrid'
import { RoomsGridUI } from '../../../components/zcc/RoomsGridUI'

export default function ZCCOperacionalPage() {
  const [propertyId, setPropertyId] = useState('default-prop')

  const {
    rooms,
    isLoading,
    error,
    alterarStatusQuarto,
    refresh,
  } = useRoomsGrid(propertyId)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zehla_pousada_id')
      if (stored) setPropertyId(stored)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-500">Operação Hoteleira</h1>
          <p className="text-sm text-slate-400">Mapa de quartos e tarefas</p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded transition-colors"
        >
          Atualizar
        </button>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-slate-300 mb-4">🏨 Mapa de Quartos</h2>
        <RoomsGridUI
          rooms={rooms}
          isLoading={isLoading}
          error={error}
          onStatusChange={(roomId, novoStatus) => alterarStatusQuarto(roomId, novoStatus)}
        />
      </section>
    </div>
  )
}
