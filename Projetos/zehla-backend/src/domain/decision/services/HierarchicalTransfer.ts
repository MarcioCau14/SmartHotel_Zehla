/**
 * ZEHLA SMARTHOTEL — HierarchicalTransfer Domain Service
 * Módulo: src/domain/decision/services/HierarchicalTransfer.ts
 */

import { BetaBinomialPosterior } from '../models/BetaBinomialPosterior';

export interface IBucketTags {
  readonly id: string;
  readonly tags: ReadonlyArray<string>;
}

// Definição das tags semânticas ricas para cálculo de similaridade de Jaccard dos 32 buckets
export const BUCKET_TAGS: ReadonlyArray<IBucketTags> = [
  { id: '00', tags: ['faq', 'guest_info', 'simple_reply', 'fast_sla', 'reception'] },
  { id: '01', tags: ['faq', 'guest_info', 'simple_reply', 'fast_sla', 'location', 'access'] },
  { id: '02', tags: ['faq', 'guest_info', 'simple_reply', 'fast_sla', 'amenities', 'services'] },
  { id: '03', tags: ['faq', 'guest_info', 'simple_reply', 'fast_sla', 'policies', 'rules'] },
  { id: '04', tags: ['faq', 'guest_info', 'simple_reply', 'fast_sla', 'general_misc'] },
  { id: '05', tags: ['pricing', 'money', 'sales', 'medium_sla', 'diaria'] },
  { id: '06', tags: ['pricing', 'money', 'sales', 'medium_sla', 'comparison', 'rooms'] },
  { id: '07', tags: ['pricing', 'money', 'sales', 'medium_sla', 'promo', 'holidays'] },
  { id: '08', tags: ['pricing', 'money', 'sales', 'long_sla', 'negotiation', 'discount', 'complex_reasoning'] },
  { id: '09', tags: ['booking', 'dates', 'transactional', 'system_action', 'medium_sla', 'new_request'] },
  { id: '10', tags: ['booking', 'dates', 'transactional', 'system_action', 'medium_sla', 'modification'] },
  { id: '11', tags: ['booking', 'dates', 'transactional', 'system_action', 'medium_sla', 'cancellation'] },
  { id: '12', tags: ['booking', 'dates', 'transactional', 'system_action', 'fast_sla', 'checkin_confirm'] },
  { id: '13', tags: ['complaint', 'negative_sentiment', 'empathy_required', 'resolution', 'ops', 'cleanliness', 'long_sla'] },
  { id: '14', tags: ['complaint', 'negative_sentiment', 'empathy_required', 'resolution', 'ops', 'noise', 'long_sla'] },
  { id: '15', tags: ['complaint', 'negative_sentiment', 'empathy_required', 'resolution', 'ops', 'service_staff', 'long_sla'] },
  { id: '16', tags: ['complaint', 'negative_sentiment', 'empathy_required', 'resolution', 'ops', 'maintenance', 'long_sla'] },
  { id: '17', tags: ['complaint', 'negative_sentiment', 'empathy_required', 'resolution', 'ops', 'food_beverage', 'long_sla'] },
  { id: '18', tags: ['complaint', 'negative_sentiment', 'empathy_required', 'resolution', 'ops', 'billing_charge', 'long_sla'] },
  { id: '19', tags: ['semantic', 'analysis', 'negative_sentiment', 'sentiment_analysis', 'long_sla', 'complex_reasoning'] },
  { id: '20', tags: ['semantic', 'analysis', 'comparison', 'long_sla', 'complex_reasoning'] },
  { id: '21', tags: ['semantic', 'analysis', 'recommendation', 'medium_sla'] },
  { id: '22', tags: ['content', 'creative', 'long_sla', 'marketing', 'social_media'] },
  { id: '23', tags: ['content', 'creative', 'long_sla', 'marketing', 'email'] },
  { id: '24', tags: ['content', 'creative', 'long_sla', 'marketing', 'listing'] },
  { id: '25', tags: ['review', 'analysis', 'reputation', 'google', 'long_sla'] },
  { id: '26', tags: ['review', 'analysis', 'reputation', 'booking', 'long_sla'] },
  { id: '27', tags: ['translation', 'multilingual', 'i18n', 'english', 'medium_sla'] },
  { id: '28', tags: ['translation', 'multilingual', 'i18n', 'spanish', 'medium_sla'] },
  { id: '29', tags: ['translation', 'multilingual', 'i18n', 'other_languages', 'medium_sla'] },
  { id: '30', tags: ['emergency', 'critical', 'safety', 'medical', 'immediate_sla'] },
  { id: '31', tags: ['emergency', 'critical', 'safety', 'security', 'immediate_sla'] },
];

export class HierarchicalTransfer {
  private readonly localConfidenceThreshold: number;
  private readonly baseTransferWeight: number;

  constructor(localConfidenceThreshold = 5, baseTransferWeight = 0.5) {
    this.localConfidenceThreshold = localConfidenceThreshold;
    this.baseTransferWeight = baseTransferWeight;
  }

  /**
   * Calcula a similaridade de Jaccard entre dois buckets
   */
  public calculateJaccard(bucketAId: string, bucketBId: string): number {
    const tagsA = BUCKET_TAGS.find(b => b.id === bucketAId)?.tags || [];
    const tagsB = BUCKET_TAGS.find(b => b.id === bucketBId)?.tags || [];

    if (tagsA.length === 0 || tagsB.length === 0) return 0.0;

    const setA = new Set(tagsA);
    const setB = new Set(tagsB);

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
  }

  /**
   * Retorna a posterior ajustada pelo compartilhamento bayesiano hierárquico (Tese 6).
   * Se o bucket local já atingiu a maturidade (observações >= threshold), retorna a local.
   * Caso contrário, mescla observações adicionais de buckets correlacionados baseados em Jaccard.
   */
  public transfer(
    targetBucketId: string,
    providerName: string,
    allPosteriors: ReadonlyMap<string, {
      alpha: number;
      beta: number;
      nObservations: number;
      lastUpdateAt: number;
    }>,
    benchmarkScore: number
  ): BetaBinomialPosterior {
    const targetKey = `${targetBucketId}__${providerName}`;
    const targetRaw = allPosteriors.get(targetKey);

    const localPosterior = targetRaw
      ? BetaBinomialPosterior.create(targetRaw.alpha, targetRaw.beta, targetRaw.nObservations, targetRaw.lastUpdateAt)
      : BetaBinomialPosterior.fromBenchmarkPriors(benchmarkScore);

    const localObs = localPosterior.nObservations;

    // Se o bucket de destino já possui observações suficientes locais, não necessita de transferência
    if (localObs >= this.localConfidenceThreshold) {
      return localPosterior;
    }

    // Calcula o peso de atenuação baseado no número de observações locais
    const attenuation = this.baseTransferWeight * Math.max(0, 1 - localObs / this.localConfidenceThreshold);

    if (attenuation <= 0) {
      return localPosterior;
    }

    let accumulatedAlpha = 0.0;
    let accumulatedBeta = 0.0;

    // Compartilhamento bayesiano dos counts acumulados em outros buckets similares
    for (const sourceBucket of BUCKET_TAGS) {
      if (sourceBucket.id === targetBucketId) continue;

      const similarity = this.calculateJaccard(targetBucketId, sourceBucket.id);
      if (similarity <= 0) continue;

      const sourceKey = `${sourceBucket.id}__${providerName}`;
      const sourceRaw = allPosteriors.get(sourceKey);

      if (sourceRaw) {
        // Subtraímos 1.0 (o prior base) para transferir estritamente as observações reais acumuladas
        const observedSuccesses = Math.max(0, sourceRaw.alpha - 1.0);
        const observedFailures = Math.max(0, sourceRaw.beta - 1.0);

        accumulatedAlpha += similarity * observedSuccesses;
        accumulatedBeta += similarity * observedFailures;
      }
    }

    // Ajusta a posterior local adicionando a fração atenuada de observações acumuladas
    const finalAlpha = localPosterior.alpha + accumulatedAlpha * attenuation;
    const finalBeta = localPosterior.beta + accumulatedBeta * attenuation;
    
    // Retorna a nova posterior imutável calibrada com as observações herdadas
    return BetaBinomialPosterior.create(
      finalAlpha,
      finalBeta,
      localObs, // Mantém nObservations local para controle de confiança
      localPosterior.lastUpdateAt
    );
  }
}
