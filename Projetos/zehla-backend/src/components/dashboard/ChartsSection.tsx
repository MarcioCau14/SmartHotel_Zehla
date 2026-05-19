import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';

import { Skeleton } from '@/components/ui/skeleton';


'use client';


interface KPIs {
  monthly_revenue_trend: { month: string; revenue: number }[];
  weekly_occupancy: { day: string; rate: number }[];
}

export function ChartsSection() : void {
  const [data, setData] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/revenue/kpis')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-4"><Skeleton className="h-48 w-full" /></div>
        <div className="glass-card p-4"><Skeleton className="h-48 w-full" /></div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Revenue Chart */}
      <div className="glass-card p-4">
        <div className="text-sm font-medium text-[#b4b4b4] mb-4">Receita Mensal</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data.monthly_revenue_trend}>
            <XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
              labelStyle={{ color: '#a3a3a3' }}
            />
            <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Occupancy Chart */}
      <div className="glass-card p-4">
        <div className="text-sm font-medium text-[#b4b4b4] mb-4">Ocupação Semanal</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.weekly_occupancy}>
            <XAxis dataKey="day" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 12 }}
              formatter={(value: number) => [`${value}%`, 'Ocupação']}
              labelStyle={{ color: '#a3a3a3' }}
            />
            <defs>
              <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="rate" stroke="#8B5CF6" strokeWidth={2} fill="url(#occupancyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
