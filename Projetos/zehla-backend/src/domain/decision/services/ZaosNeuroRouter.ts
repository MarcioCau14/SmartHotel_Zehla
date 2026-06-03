/**
 * ZEHLA SMARTHOTEL — ZaosNeuroRouter Domain Service (Aggregate Root)
 * Módulo: src/domain/decision/services/ZaosNeuroRouter.ts
 */

import { Result } from '../../shared/Result';
import { IRouterStatePort } from '../ports/IRouterStatePort';
import { ProviderCapabilityProfile } from '../models/ProviderCapabilityProfile';
import { RoutingContext } from '../models/RoutingContext';
import { RoutingDecision } from '../models/RoutingDecision';
import { BudgetSnapshot } from '../models/BudgetGuard';
import { ContextDiscretizer } from './ContextDiscretizer';
import { BudgetCircuitBreaker } from './BudgetCircuitBreaker';
import { ProviderCircuitBreaker } from './ProviderCircuitBreaker';
import { ParetoMultiObjectiveSelector, IParetoCandidate } from './ParetoMultiObjectiveSelector';
import { BetaBinomialPosterior } from '../models/BetaBinomialPosterior';

export class ZaosNeuroRouter {
  constructor(
    private readonly statePort: IRouterStatePort,
    private readonly discretizer: ContextDiscretizer,
    private readonly budgetCb: BudgetCircuitBreaker,
    private readonly providerCb: ProviderCircuitBreaker,
    private readonly paretoSelector: ParetoMultiObjectiveSelector,
    private readonly providers: ReadonlyArray<ProviderCapabilityProfile>
  ) {}

  async route(
    context: RoutingContext,
    budgetSnapshot: BudgetSnapshot,
    prng: () => number = Math.random
  ): Promise<Result<RoutingDecision, Error>> {
    // 1. Extrair o bucketId (de 00 a 34) usando o ContextDiscretizer
    const discretizeResult = this.discretizer.classify(context);
    if (discretizeResult.isFail) {
      return Result.fail(discretizeResult.error);
    }
    const bucket = discretizeResult.value;
    const bucketId = bucket.id;

    // 2. Consultar o BudgetCircuitBreaker para obter a lista de provedores permitidos
    const allowedProviderNames = this.budgetCb.filterAllowedProviders(this.providers, budgetSnapshot);
    const budgetFilteredProviders = this.providers.filter(p => allowedProviderNames.includes(p.name));

    // 3. Filtrar provedores inativos consultando o ProviderCircuitBreaker
    const activeProviders: ProviderCapabilityProfile[] = [];
    for (const p of budgetFilteredProviders) {
      const ok = await this.providerCb.canRoute(bucketId, p.name);
      if (ok) {
        activeProviders.push(p);
      }
    }

    // Se nenhum provedor estiver ativo, acionar emergencyFallback imediatamente
    if (activeProviders.length === 0) {
      return Result.ok(RoutingDecision.emergencyFallback(bucketId));
    }

    // 4. Carregar as BetaBinomialPosterior do bucket atual via IRouterStatePort
    const posteriors = this.statePort.loadAllPosteriors();

    const candidates: IParetoCandidate[] = [];
    const sampledThetas = new Map<string, number>();
    const adjustedCosts = new Map<string, number>();

    // 5. Thompson Sampling: Extrair a amostragem de utilidade (posterior.sample())
    for (const p of activeProviders) {
      const key = `${bucketId}__${p.name}`;
      const rawPost = posteriors.get(key);

      const posterior = rawPost
        ? BetaBinomialPosterior.create(rawPost.alpha, rawPost.beta, rawPost.nObservations, rawPost.lastUpdateAt)
        : BetaBinomialPosterior.fromBenchmarkPriors(p.capabilityScore);

      const theta = posterior.sample(prng);
      sampledThetas.set(p.name, theta);

      // Custo padrão estimado usando 10k tokens de entrada e 5k de saída
      const realCost = p.estimateCost(10_000, 5_000);
      const adjustedCost = this.budgetCb.getAdjustedCost(realCost, p.tier, budgetSnapshot);
      adjustedCosts.set(p.name, adjustedCost);

      // Qualidade amostrada combinando a baseline e a posterior temporal (Thompson)
      const quality = p.capabilityScore * theta;

      candidates.push({
        name: p.name,
        quality,
        adjustedCost,
        latencyMs: p.slaLatencyMs,
      });
    }

    // 6. Submeter a lista de utilidades amostradas ao ParetoMultiObjectiveSelector
    const paretoResult = this.paretoSelector.selectRank0(candidates, bucket.minQuality);
    if (paretoResult.isFail) {
      // Se a qualidade amostrada decaiu a ponto de violar minQuality de todos, vai para emergencyFallback
      return Result.ok(RoutingDecision.emergencyFallback(bucketId));
    }

    const frontier = paretoResult.value;

    // Selecionar o melhor provedor da fronteira de Pareto com base na eficiência (utilidade ajustada pelo custo)
    const candidatesWithUtility = frontier.map(c => ({
      candidate: c,
      utility: c.quality / (c.adjustedCost + 0.01)
    }));

    candidatesWithUtility.sort((a, b) => b.utility - a.utility);
    const selectedCandidate = candidatesWithUtility[0].candidate;

    // 7. Retornar um VO RoutingDecision seguro
    const decision = RoutingDecision.create({
      bucketId,
      selectedProviderName: selectedCandidate.name,
      isEmergencyFallback: false,
      isStickinessApplied: false,
      expectedUtility: selectedCandidate.quality,
      sampledThetas,
      adjustedCosts,
    });

    return Result.ok(decision);
  }
}
