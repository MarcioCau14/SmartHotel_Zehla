import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PlanoPreco, MarketConversionRate, PainVariant } from '@/types/commercial'
import type { EstrategiaRegionalView, LGPDClassificacaoView, BenchmarkConcorrenteView } from '@/hooks/use-strategy-overview'

interface ForecastMetricsBoardProps {
  readonly planos: ReadonlyArray<PlanoPreco>
  readonly conversao: ReadonlyArray<MarketConversionRate>
  readonly estrategiasRegionais: ReadonlyArray<EstrategiaRegionalView>
  readonly lgpd: ReadonlyArray<LGPDClassificacaoView>
  readonly benchmark: ReadonlyArray<BenchmarkConcorrenteView>
  readonly diferencialCompetitivo: ReadonlyArray<string>
}

function PlanCard({ plano }: { plano: PlanoPreco }) {
  const features = [
    { label: 'Limite de Propriedades', value: plano.propriedadesLimite === 999 ? 'Ilimitado' : String(plano.propriedadesLimite) },
    { label: 'Trial', value: `${plano.trialDias} dias` },
    { label: 'WhatsApp Nativo', value: plano.temWhatsAppNativo ? 'Sim' : 'Não' },
    { label: 'Channel Manager', value: plano.temChannelManager ? 'Sim' : 'Não' },
    { label: 'Booking Engine', value: plano.temBookingEngine ? 'Sim' : 'Não' },
    { label: 'PMS Básico', value: plano.temPmsBasico ? 'Sim' : 'Não' },
  ]

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{plano.nome}</CardTitle>
        <p className="text-xs text-muted-foreground">{plano.posicionamento}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">PIX</span>
            <span className="text-2xl font-bold">R$ {plano.valorPix}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Cartão</span>
            <span className="text-lg font-semibold">R$ {plano.valorCartao}</span>
          </div>
        </div>

        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{f.label}</span>
              <span className={f.value === 'Sim' ? 'font-medium text-emerald-600 dark:text-emerald-400' : ''}>
                {f.value}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function PainVariantCard({ variant, index }: { variant: { variant: PainVariant; emailSubject: string; pitchMessage: string; expectedOpenRate: number; expectedClickRate: number }; index: number }) {
  const painLabels: Record<PainVariant, { title: string; cor: string }> = {
    FINANCIAL: { title: 'Financeiro', cor: 'border-l-red-500' },
    OPERATIONAL: { title: 'Operacional', cor: 'border-l-blue-500' },
    OCCUPANCY: { title: 'Ocupação', cor: 'border-l-amber-500' },
  }

  const meta = painLabels[variant.variant]

  return (
    <Card className={`border-l-4 ${meta.cor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{meta.title}</CardTitle>
          <Badge variant="outline">Variant {index + 1}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">{variant.emailSubject}</p>
        <p className="text-sm font-medium italic">"{variant.pitchMessage}"</p>
        <div className="flex gap-3 text-xs">
          <span className="text-muted-foreground">
            Abertura: {(variant.expectedOpenRate * 100).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">
            Clique: {(variant.expectedClickRate * 100).toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ForecastMetricsBoard({
  planos,
  conversao,
  estrategiasRegionais,
  lgpd,
  benchmark,
  diferencialCompetitivo,
}: ForecastMetricsBoardProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Planos de Precificação</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {planos.map((plano) => (
            <PlanCard key={plano.nome} plano={plano} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Taxas de Conversão por Canal</h2>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Canal</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Média</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Ótima</th>
              </tr>
            </thead>
            <tbody>
              {conversao.map((row) => (
                <tr key={row.canal} className="border-b last:border-0">
                  <td className="px-4 py-2 capitalize">{row.canal.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-2 text-right">{(row.conversaoMedia * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right">{(row.conversaoOtima * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Variantes de Dor (Outbound)</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { variant: 'FINANCIAL' as PainVariant, emailSubject: 'Pare de pagar 15% por reserva pro Booking', pitchMessage: 'Pare de pagar 15% por reserva pro Booking', expectedOpenRate: 0.25, expectedClickRate: 0.05 },
            { variant: 'OPERATIONAL' as PainVariant, emailSubject: 'Automatize seu atendimento 24h sem equipe extra', pitchMessage: 'Automatize seu atendimento 24h sem equipe extra', expectedOpenRate: 0.22, expectedClickRate: 0.04 },
            { variant: 'OCCUPANCY' as PainVariant, emailSubject: 'Aumente sua taxa de ocupação em 25% na baixa temporada', pitchMessage: 'Aumente sua taxa de ocupação em 25% na baixa temporada', expectedOpenRate: 0.20, expectedClickRate: 0.03 },
          ].map((v, i) => (
            <PainVariantCard key={v.variant} variant={v} index={i} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Estratégias Regionais</h2>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Região</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Alta Temporada</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Melhor Abordagem</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Dor Principal</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Canal</th>
              </tr>
            </thead>
            <tbody>
              {estrategiasRegionais.map((r) => (
                <tr key={r.regiao} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium capitalize">{r.regiao.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-2">{r.altaTemporada.join(', ')}</td>
                  <td className="px-4 py-2">{r.momentoAbordagem.join(', ')}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.dorPrincipal}</td>
                  <td className="px-4 py-2 capitalize">{r.canalPreferencial.replace(/_/g, ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">LGPD — Classificação de Contato</h2>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tipo</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Base Legal</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Permitido</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Regras</th>
              </tr>
            </thead>
            <tbody>
              {lgpd.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-2">{row.tipoContato}</td>
                  <td className="px-4 py-2 capitalize">{row.baseLegal.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-2">
                    <span className={row.podeDisparar ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                      {row.podeDisparar ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{row.regras}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Benchmark Concorrentes</h2>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Concorrente</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Preço (R$)</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">WhatsApp</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">IA</th>
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Notas</th>
              </tr>
            </thead>
            <tbody>
              {benchmark.map((b) => (
                <tr key={b.nome} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">{b.nome}</td>
                  <td className="px-4 py-2 text-right">R$ {b.precoBrl}</td>
                  <td className="px-4 py-2 text-center">
                    {b.temWhatsAppNativo
                      ? <span className="text-emerald-600 dark:text-emerald-400">Sim</span>
                      : <span className="text-muted-foreground">Não</span>
                    }
                  </td>
                  <td className="px-4 py-2 text-center">
                    {b.temIaNativa
                      ? <span className="text-emerald-600 dark:text-emerald-400">Sim</span>
                      : <span className="text-muted-foreground">Não</span>
                    }
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{b.notas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {diferencialCompetitivo.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Diferencial Competitivo</h2>
          <Card>
            <CardContent className="space-y-2 pt-4">
              {diferencialCompetitivo.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{d}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
