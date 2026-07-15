import { db } from '@/lib/db';
import type { BudgetGuard } from './budget-guard';

/**
 * brain-persistence.ts — Refatorado para ELIMINAR dependência circular
 * com zaos-neuro-router.ts (GEM Skill Refactoring Pipeline V1).
 *
 * Antes: importava ZaosNeuroRouter e RouterProviderState diretamente.
 * Agora: usa tipagem estrutural (structural typing) para aceitar
 * os objetos do router sem importá-los.
 */

/**
 * Salva o estado do BudgetGuard no banco SQLite.
 */
export async function persistBudgetGuard(budgetGuard: BudgetGuard): Promise<void> {
  try {
    const snap = budgetGuard.getSnapshot() as { dailySpendUsd: number; dailyBudgetUsd: number; monthlySpendUsd: number; monthlyBudgetUsd: number; level: string };
    const today = new Date().toISOString().split('T')[0];

    await db.budgetGuardState.upsert({
      where: { date: today },
      update: {
        dailySpendUsd: snap.dailySpendUsd,
        dailyBudgetUsd: snap.dailyBudgetUsd,
        monthlySpendUsd: snap.monthlySpendUsd,
        monthlyBudgetUsd: snap.monthlyBudgetUsd,
        criticalLevel: snap.level,
      },
      create: {
        date: today,
        dailySpendUsd: snap.dailySpendUsd,
        dailyBudgetUsd: snap.dailyBudgetUsd,
        monthlySpendUsd: snap.monthlySpendUsd,
        monthlyBudgetUsd: snap.monthlyBudgetUsd,
        criticalLevel: snap.level,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[brain-persistence] Erro ao persistir BudgetGuardState:', msg);
  }
}

/**
 * Carrega o estado do BudgetGuard do banco SQLite para o dia atual.
 */
export async function loadBudgetGuard(budgetGuard: BudgetGuard): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const state = await db.budgetGuardState.findUnique({ where: { date: today } });
    if (state) {
      budgetGuard.setSpend(state.dailySpendUsd, state.monthlySpendUsd);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[brain-persistence] Erro ao carregar BudgetGuardState:', msg);
  }
}

/**
 * Salva estatísticas de Thompson Sampling dos provedores no DB.
 * Tipagem estrutural: aceita qualquer objeto com a forma esperada,
 * sem importar ZaosNeuroRouter (quebra circular).
 */
export async function persistRouterState(providers: Array<{
  registration: {
    id: string; name: string; tier: unknown;
    expectedLatencyMs: number; costPer1kInput: number; costPer1kOutput: number;
    supportsJson: boolean; supportsTools: boolean; maxContextTokens: number;
  };
  alpha: number; beta: number;
  circuitBreaker: { getSnapshot(): { state: string; consecutiveFailures: number } };
  totalRequests: number; totalLatencyMs: number;
}>): Promise<void> {
  try {
    for (const p of providers) {
      const reg = p.registration;
      const cs = p.circuitBreaker.getSnapshot();
      const avgLat = Math.round(p.totalRequests > 0 ? p.totalLatencyMs / p.totalRequests : reg.expectedLatencyMs);

      await db.routerProvider.upsert({
        where: { provider: reg.id },
        update: {
          alpha: p.alpha, beta: p.beta,
          circuitStatus: cs.state, failureCount: cs.consecutiveFailures,
          avgLatencyMs: avgLat,
        },
        create: {
          provider: reg.id, modelName: reg.name, tier: String(reg.tier),
          alpha: p.alpha, beta: p.beta,
          circuitStatus: cs.state, failureCount: cs.consecutiveFailures,
          avgLatencyMs: reg.expectedLatencyMs,
          costPer1kInput: reg.costPer1kInput, costPer1kOutput: reg.costPer1kOutput,
          supportsJson: reg.supportsJson, supportsTools: reg.supportsTools,
          maxContextTokens: reg.maxContextTokens,
        },
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[brain-persistence] Erro ao persistir RouterProvider state:', msg);
  }
}

/**
 * Carrega estatísticas dos provedores do DB.
 * Tipagem estrutural: aceita qualquer objeto com getProvider(),
 * sem importar ZaosNeuroRouter (quebra circular).
 */
export async function loadRouterState(router: {
  getProvider(id: string): { alpha: number; beta: number; circuitBreaker: { recordFailure(): void } } | undefined;
}): Promise<void> {
  try {
    const savedProviders = await db.routerProvider.findMany();
    for (const saved of savedProviders) {
      const provider = router.getProvider(saved.provider);
      if (provider) {
        provider.alpha = saved.alpha;
        provider.beta = saved.beta;
        if (saved.circuitStatus === 'open') {
          provider.circuitBreaker.recordFailure();
          provider.circuitBreaker.recordFailure();
          provider.circuitBreaker.recordFailure();
        }
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[brain-persistence] Erro ao carregar RouterProvider state:', msg);
  }
}