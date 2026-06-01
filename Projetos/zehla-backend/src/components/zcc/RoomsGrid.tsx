'use client'

import React, { useState, useEffect } from 'react'
import { useReservations } from '../../hooks/useReservations'

interface RoomState {
  id: string
  number: string
  category: string
  status: 'clean' | 'dirty' | 'cleaning'
  cleaningTimeLeft: number // em minutos (máximo 180 min - 3h de higienização)
}

export function RoomsGrid() {
  const { reservations, realizarCheckInMobile } = useReservations()
  const [rooms, setRooms] = useState<RoomState[]>([
    { id: 'rm-101', number: '101', category: 'Suíte Executiva', status: 'dirty', cleaningTimeLeft: 180 },
    { id: 'rm-102', number: '102', category: 'Luxo Vista Mar', status: 'clean', cleaningTimeLeft: 0 },
    { id: 'rm-103', number: '103', category: 'Standard Casal', status: 'cleaning', cleaningTimeLeft: 112 },
    { id: 'rm-104', number: '104', category: 'Suíte Master', status: 'clean', cleaningTimeLeft: 0 },
    { id: 'rm-105', number: '105', category: 'Luxo Duplo', status: 'dirty', cleaningTimeLeft: 180 },
  ])

  // Simula decremento do cronômetro de higienização de 3 horas
  useEffect(() => {
    const timer = setInterval(() => {
      setRooms((prev) =>
        prev.map((r) => {
          if (r.status === 'cleaning' && r.cleaningTimeLeft > 0) {
            return { ...r, cleaningTimeLeft: r.cleaningTimeLeft - 1 }
          }
          if (r.status === 'cleaning' && r.cleaningTimeLeft === 0) {
            return { ...r, status: 'clean' }
          }
          return r
        })
      )
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const iniciarHigienizacao = (id: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cleaning', cleaningTimeLeft: 180 } : r))
    )
  }

  const formatTime = (min: number) => {
    const hrs = Math.floor(min / 60)
    const mins = min % 60
    return `${hrs}h ${mins.toString().padStart(2, '0')}m`
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Rooms Inventory Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {rooms.map((room) => {
          // Busca reserva ativa alocada ao quarto
          const activeRes = reservations.find((res) => res.roomNumber === room.number)

          return (
            <div
              key={room.id}
              className="flex flex-col p-4 bg-slate-900 border border-slate-800 rounded-lg shadow-md justify-between"
            >
              <div>
                {/* Room Info */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold font-mono text-slate-100">Quarto {room.number}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {room.category}
                  </span>
                </div>

                {/* Sanitization / Cleaning Tracker */}
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Higienização (3h):</span>
                    {room.status === 'clean' && <span className="text-emerald-500 font-bold text-[11px]">Liberado</span>}
                    {room.status === 'dirty' && <span className="text-red-500 font-bold text-[11px]">Sujo</span>}
                    {room.status === 'cleaning' && (
                      <span className="text-orange-500 font-bold text-[11px]">Limpando</span>
                    )}
                  </div>

                  {room.status === 'cleaning' && (
                    <div className="w-full space-y-1">
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-orange-500 h-1.5 transition-all duration-500"
                          style={{ width: `${((180 - room.cleaningTimeLeft) / 180) * 100}%` }}
                        />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 text-right">
                        Restam {formatTime(room.cleaningTimeLeft)}
                      </div>
                    </div>
                  )}

                  {room.status === 'dirty' && (
                    <button
                      onClick={() => iniciarHigienizacao(room.id)}
                      className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded border border-slate-700 transition-colors"
                    >
                      Iniciar Higienização
                    </button>
                  )}
                </div>
              </div>

              {/* Occupant / Gov.br check in status */}
              <div className="mt-4 border-t border-slate-800 pt-3">
                {activeRes ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-semibold truncate max-w-[100px]">{activeRes.hospedeNome}</span>
                      {activeRes.govBrVerified ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 text-[9px] font-bold">
                          Gov.br Ok
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-900 text-[9px] font-bold animate-pulse">
                          FNRH pendente
                        </span>
                      )}
                    </div>
                    
                    {!activeRes.govBrVerified && (
                      <button
                        onClick={() => realizarCheckInMobile(activeRes.id, 'qr-fnrh-verified-data')}
                        className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded transition-colors"
                      >
                        Validar FNRH (Gov.br)
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs text-slate-500 font-mono italic">
                    Vago
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
