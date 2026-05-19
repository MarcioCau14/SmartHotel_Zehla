import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';


'use client';


const tokensByTenant = [
  { tenant: 'Maravilha', tokens: 42000 },
  { tenant: 'Vila Floripa', tokens: 31000 },
  { tenant: 'Pousada do Ouro', tokens: 28000 },
  { tenant: 'Chapada', tokens: 15000 },
  { tenant: 'Bela Jeri', tokens: 22000 },
  { tenant: 'Serrana', tokens: 18000 },
];

const responseTimes = [
  { time: '00h', p50: 25, p95: 85, p99: 210 },
  { time: '04h', p50: 22, p95: 78, p99: 195 },
  { time: '08h', p50: 35, p95: 120, p99: 280 },
  { time: '12h', p50: 42, p95: 145, p99: 350 },
  { time: '16h', p50: 38, p95: 130, p99: 310 },
  { time: '20h', p50: 30, p95: 95, p99: 240 },
];

const scaleMetrics = [
  { label: 'Requests/min', value: '127', trend: '+12%', ok: true },
  { label: 'Error Rate', value: '0.3%', trend: '-0.1%', ok: true },
  { label: 'CPU Usage', value: '34%', trend: '+5%', ok: true },
  { label: 'Memory', value: '2.4GB / 8GB', trend: 'stable', ok: true },
  { label: 'Disk I/O', value: '12MB/s', trend: 'stable', ok: true },
  { label: 'Network I/O', value: '45Mbps', trend: '+8%', ok: true },
  { label: 'Active Connections', value: '243', trend: '+15%', ok: true },
  { label: 'Queue Depth', value: '7', trend: '-3', ok: true },
];

export function ScaleMetrics() : void {
  try {
  return (
    <div className="space-y-6">
      {/* Scale overview */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4">Métricas de Escala</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {scaleMetrics.map((m, i) => (
            <div key={i} className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-[#4d4d4d]">{m.label}</div>
              <div className={`text-sm font-mono font-bold ${m.ok ? 'text-[#FF5500]' : 'text-red-400'}`}>
                {m.value}
              </div>
              <div className="text-[10px] text-[#363636]">{m.trend}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tokens by tenant */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4">Tokens por Tenant</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={tokensByTenant}>
            <XAxis dataKey="tenant" tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 }}
              formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Tokens']}
              labelStyle={{ color: '#a3a3a3' }}
            />
            <Bar dataKey="tokens" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Response times */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4">Tempos de Resposta (percentis)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={responseTimes}>
            <XAxis dataKey="time" tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}ms`} />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 11 }}
              formatter={(value: number) => [`${value}ms`]}
              labelStyle={{ color: '#a3a3a3' }}
            />
            <Line type="monotone" dataKey="p50" stroke="#10B981" strokeWidth={2} dot={false} name="P50" />
            <Line type="monotone" dataKey="p95" stroke="#8B5CF6" strokeWidth={2} dot={false} name="P95" />
            <Line type="monotone" dataKey="p99" stroke="#F59E0B" strokeWidth={2} dot={false} name="P99" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5 text-xs text-[#4d4d4d]">
            <div className="w-3 h-0.5 bg-orange-500" /> P50
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#4d4d4d]">
            <div className="w-3 h-0.5 bg-purple-500" /> P95
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#4d4d4d]">
            <div className="w-3 h-0.5 bg-amber-500" /> P99
          </div>
        </div>
      </div>
    </div>
  );
}
