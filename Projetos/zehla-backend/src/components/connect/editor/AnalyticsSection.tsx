'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import type { AnalyticsData } from './types';

export function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/connect/analytics?days=${days}`);
      if (res.ok) setData(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Analytics</h3>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-8 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs px-2">
          <option value={7}>7 dias</option>
          <option value={30}>30 dias</option>
          <option value={90}>90 dias</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
              <p className="text-2xl font-bold text-white">{data.totals.views}</p>
              <p className="text-xs text-slate-400 mt-1">Visualizações</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
              <p className="text-2xl font-bold text-white">{data.totals.clicks}</p>
              <p className="text-xs text-slate-400 mt-1">Cliques</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
              <p className="text-2xl font-bold text-emerald-400">{data.totals.ctr.toFixed(1)}%</p>
              <p className="text-xs text-slate-400 mt-1">CTR</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">Histórico</h4>
            <div className="space-y-1">
              {data.analytics.slice(0, 14).map((day) => (
                <div key={day.date} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/20 text-xs">
                  <span className="w-24 text-slate-400 font-mono">{new Date(day.date).toLocaleDateString('pt-BR')}</span>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300">{day.views}</span>
                      <span className="text-slate-500">views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300">{day.clicks}</span>
                      <span className="text-slate-500">cliques</span>
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${Math.min(day.ctr * 2, 100)}%` }} />
                    </div>
                    <span className="text-slate-400 w-12 text-right">{day.ctr.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-slate-500 py-8">Nenhum dado de analytics disponível.</p>
      )}
    </div>
  );
}
