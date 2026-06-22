import { db } from '@/lib/db';
import { ZaosNeuroRouter, RouterProviderState } from './zaos-neuro-router';
import { BudgetGuard } from './budget-guard';

/**
 * Salva o estado do BudgetGuard no banco SQLite.
 */
export async function persistBudgetGuard(budgetGuard: BudgetGuard): Promise<void> {
  try {
    const snapshot = budgetGuard.getSnapshot();
    const today = new Date().toISOString().split('T')[0];

    await db.budgetGuardState.upsert({
      where: { date: today },
      update: {
        dailySpendUsd: snapshot.dailySpendUsd,
        dailyBudgetUsd: snapshot.dailyBudgetUsd,
        monthlySpendUsd: snapshot.monthlySpendUsd,
        monthlyBudgetUsd: snapshot.monthlyBudgetUsd,
        criticalLevel: snapshot.level,
      },
      create: {
        date: today,
        dailySpendUsd: snapshot.dailySpendUsd,
        dailyBudgetUsd: snapshot.dailyBudgetUsd,
        monthlySpendUsd: snapshot.monthlySpendUsd,
        monthlyBudgetUsd: snapshot.monthlyBudgetUsd,
        criticalLevel: snapshot.level,
      },
    });
  } catch (error) {
    console.error('[brain-persistence] Erro ao persistir BudgetGuardState:', error);
  }
}

/**
 * Carrega o estado do BudgetGuard do banco SQLite para o dia atual.
 */
export async function loadBudgetGuard(budgetGuard: BudgetGuard): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const state = await db.budgetGuardState.findUnique({
      where: { date: today },
    });

    if (state) {
      budgetGuard.setSpend(state.dailySpendUsd, state.monthlySpendUsd);
    }
  } catch (error) {
    console.error('[brain-persistence] Erro ao carregar BudgetGuardState:', error);
  }
}

/**
 * Salva as estatísticas e posteriors (alpha, beta) de Thompson Sampling dos provedores no DB.
 */
export async function persistRouterState(providers: RouterProviderState[]): Promise<void> {
  try {
    for (const p of providers) {
      const reg = p.registration;
      const circuit = p.circuitBreaker.getSnapshot();

      await db.routerProvider.upsert({
        where: { provider: reg.id },
        update: {
          alpha: p.alpha,
          beta: p.beta,
          circuitStatus: circuit.state,
          failureCount: circuit.consecutiveFailures,
          avgLatencyMs: Math.round(p.totalRequests > 0 ? p.totalLatencyMs / p.totalRequests : reg.expectedLatencyMs),
        },
        create: {
          provider: reg.id,
          modelName: reg.name,
          tier: String(reg.tier),
          alpha: p.alpha,
          beta: p.beta,
          circuitStatus: circuit.state,
          failureCount: circuit.consecutiveFailures,
          avgLatencyMs: reg.expectedLatencyMs,
          costPer1kInput: reg.costPer1kInput,
          costPer1kOutput: reg.costPer1kOutput,
          supportsJson: reg.supportsJson,
          supportsTools: reg.supportsTools,
          maxContextTokens: reg.maxContextTokens,
        },
      });
    }
  } catch (error) {
    console.error('[brain-persistence] Erro ao persistir RouterProvider state:', error);
  }
}

/**
 * Carrega as estatísticas dos provedores do DB para o ZaosNeuroRouter.
 */
export async function loadRouterState(router: ZaosNeuroRouter): Promise<void> {
  try {
    const savedProviders = await db.routerProvider.findMany();
    
    for (const saved of savedProviders) {
      const provider = router.getProvider(saved.provider);
      if (provider) {
        provider.alpha = saved.alpha;
        provider.beta = saved.beta;
        
        // Restaurar estado do circuit breaker
        if (saved.circuitStatus === 'open') {
          // Trip breaker
          provider.circuitBreaker.recordFailure();
          provider.circuitBreaker.recordFailure();
          provider.circuitBreaker.recordFailure();
        }
      }
    }
  } catch (error) {
    console.error('[brain-persistence] Erro ao carregar RouterProvider state:', error);
  }
}
