import { Badge } from "@/components/ui/badge";
import { Bot, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";


'use client';


interface FinanceHeroProps {
  summary: {
    profit: number;
    profitMargin: number;
    avgOccupancy: number;
    totalRevenue: number;
  };
  aiInsight: string;
  healthScore: number;
  alertCount: number;
  agentName: string;
}

/**
 * FinanceHero: Componente estilo "Pierre Finance" focado em conversação e insights.
 */
export function FinanceHero(: void { summary, aiInsight, healthScore, alertCount, agentName }: FinanceHeroProps) {
  try {
  const healthColor = healthScore >= 70 ? 'border-emerald-500' : healthScore >= 40 ? 'border-yellow-500' : 'border-red-500';
  const healthLabel = healthScore >= 70 ? 'Saudável' : healthScore >= 40 ? 'Atenção' : 'Crítico';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Insight da IA (Conversacional) */}
      <Card className={`lg:col-span-2 border-l-4 ${healthColor}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  ZEHLA Finance Agent: {agentName}
                </span>
              </div>
              <p className="text-lg font-medium leading-relaxed italic text-foreground/90">
                "{aiInsight}"
              </p>
            </div>
            <Badge variant={healthScore >= 70 ? 'default' : 'destructive'} className="shrink-0">
              {healthLabel} ({healthScore}/100)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* KPI Card Rápido */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Receita do Período</span>
            <span className="text-2xl font-bold text-emerald-500">
              R$ {summary.totalRevenue.toLocaleString('pt-BR')}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Lucro</span>
            <div className="text-right">
              <div className={`text-lg font-semibold ${summary.profit >= 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-1`}>
                {summary.profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                R$ {summary.profit.toLocaleString('pt-BR')}
              </div>
              <span className="text-xs text-muted-foreground">Margem: {summary.profitMargin.toFixed(1)}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">Ocupação Média</span>
            <span className="text-lg font-semibold">{summary.avgOccupancy.toFixed(1)}%</span>
          </div>

          {alertCount > 0 && (
            <div className="flex items-center gap-2 text-yellow-500 text-sm font-medium pt-2 border-t bg-yellow-500/5 p-2 rounded">
              <AlertTriangle className="w-4 h-4" />
              <span>{alertCount} alerta{alertCount > 1 ? 's' : ''} pendente{alertCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
