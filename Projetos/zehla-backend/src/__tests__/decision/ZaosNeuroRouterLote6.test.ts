/**
 * ZEHLA SMARTHOTEL — ZaosNeuroRouter Lote 6 Test Suite
 * Módulo: src/__tests__/decision/ZaosNeuroRouterLote6.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RouterMetricsCollector } from '../../domain/decision/observability/RouterMetricsCollector';
import { FileSystemRoutingEventWriter } from '../../infrastructure/observability/FileSystemRoutingEventWriter';
import { promises as fs } from 'fs';
import * as path from 'path';

describe('ZaosNeuroRouter Lote 6 Test Suite — Observabilidade e Auditoria', () => {
  const testLogPath = './zehla_data/router_state/logs/router_audit_test.jsonl';

  beforeEach(async () => {
    // Resetar estado de métricas antes de cada teste
    RouterMetricsCollector.resetInstance();
    const collector = RouterMetricsCollector.getInstance();
    collector.reset();

    // Limpar arquivo de log de teste se existir
    try {
      await fs.unlink(testLogPath);
    } catch {
      // Ignora se o arquivo não existir
    }
  });

  afterEach(async () => {
    try {
      await fs.unlink(testLogPath);
    } catch {
      // Ignora se o arquivo não existir
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Testes de Coleta de Métricas em Memória (Domínio)
  // ──────────────────────────────────────────────────────────────────────────

  describe('1. RouterMetricsCollector (Domínio)', () => {
    it('1.1. Agrega contagens de requisições, provedores e buckets de forma consistente', () => {
      const collector = RouterMetricsCollector.getInstance();

      collector.recordDecision('00', 'gemini-flash', 120, 0.0001, true);
      collector.recordDecision('00', 'gemini-flash', 150, 0.0001, true);
      collector.recordDecision('05', 'gemini-flash', 200, 0.0002, true);
      collector.recordDecision('05', 'gpt-4o', 350, 0.0050, false); // erro

      const snapshot = collector.getSnapshot();

      expect(snapshot.totalDecisions).toBe(4);
      expect(snapshot.successRate).toBe(0.75); // 3 sucessos em 4 requests
      expect(snapshot.totalCostUsd).toBe(0.0054); // 0.0001 + 0.0001 + 0.0002 + 0.0050

      // Assertiva dos buckets
      const decisionsByBucket = snapshot.decisionsByBucket;
      expect(decisionsByBucket.get('00')).toBe(2);
      expect(decisionsByBucket.get('05')).toBe(2);

      // Assertiva dos provedores
      const decisionsByProvider = snapshot.decisionsByProvider;
      expect(decisionsByProvider.get('gemini-flash')).toBe(3);
      expect(decisionsByProvider.get('gpt-4o')).toBe(1);
    });

    it('1.2. Calcula média e percentil P95 com precisão estatística exata para 100 latências não-ordenadas', () => {
      const collector = new RouterMetricsCollector(100);

      // Criar 100 latências sequenciais de 1ms até 100ms
      const latencies = Array.from({ length: 100 }, (_, i) => i + 1);

      // Embaralhar latências para injetar uma série desordenada
      const shuffled = [...latencies].sort(() => Math.random() - 0.5);

      // Injetar série desordenada
      for (const lat of shuffled) {
        collector.recordDecision('00', 'gemini-flash', lat, 0, true);
      }

      // Latência média esperada: (1 + 100) / 2 = 50.5 ms (deve ser exata independente da ordem)
      expect(collector.getAverageLatency()).toBe(50.5);

      // Percentil P95 estatístico exato para [1..100] ordenado deve ser exatamente 95.0
      expect(collector.getPercentileLatency(95)).toBe(95);

      // Percentil P50 (mediana) deve ser exatamente 50.0
      expect(collector.getPercentileLatency(50)).toBe(50);
    });

    it('1.3. Mantém o tamanho máximo da janela deslizante (sliding window) descartando itens antigos', () => {
      const collector = new RouterMetricsCollector(5); // Limite de 5 itens

      for (let i = 1; i <= 10; i++) {
        collector.recordDecision('00', 'gemini-flash', i, 0, true);
      }

      // Deve ter apenas as 5 últimas latências: [6, 7, 8, 9, 10]
      // Latência média: (6 + 7 + 8 + 9 + 10) / 5 = 40 / 5 = 8.0 ms
      expect(collector.getAverageLatency()).toBe(8.0);
      expect(collector.getPercentileLatency(100)).toBe(10);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Testes do Adaptador de Infraestrutura de Gravação (Infraestrutura)
  // ──────────────────────────────────────────────────────────────────────────

  describe('2. FileSystemRoutingEventWriter (Infraestrutura)', () => {
    it('2.1. Formata a string estruturada em JSON Lines válido (.jsonl) e grava sem travar a thread de execução', async () => {
      const writer = new FileSystemRoutingEventWriter(testLogPath);

      const timestamp = Date.now();
      const mockEvent = {
        traceId: 'trace-12345',
        tenantId: 'tenant-99',
        bucketId: '13', // complaint_cleanliness
        selectedProvider: 'claude-3.5-sonnet',
        utilityScore: 0.925,
        latencyMs: 145,
        costAdjusted: 0.0035,
        isFallback: false,
        timestamp,
      };

      // Início da medição de latência síncrona para provar não-bloqueio de I/O
      const start = performance.now();
      const promise = writer.writeEvent(mockEvent);
      const end = performance.now();

      // A gravação em background de I/O não deve atrasar a CPU principal
      expect(end - start).toBeLessThan(10.0); // O(1) não bloqueante < 10ms

      // Aguardar dreno físico no disco
      await promise;

      // Ler e auditar conteúdo do arquivo físico temporário
      const content = await fs.readFile(testLogPath, 'utf8');
      const lines = content.trim().split('\n');
      expect(lines.length).toBe(1);

      const parsedEvent = JSON.parse(lines[0]);
      expect(parsedEvent).toEqual({
        traceId: 'trace-12345',
        tenantId: 'tenant-99',
        bucketId: '13',
        selectedProvider: 'claude-3.5-sonnet',
        utilityScore: 0.925,
        latencyMs: 145,
        costAdjusted: 0.0035,
        isFallback: false,
        timestamp,
      });
    });

    it('2.2. Mantém a integridade estrutural e formato de linha única em múltiplos logs sequenciais', async () => {
      const writer = new FileSystemRoutingEventWriter(testLogPath);

      const event1 = {
        traceId: 'trace-001',
        tenantId: 'tenant-1',
        bucketId: '01',
        selectedProvider: 'gemini-flash',
        utilityScore: 0.88,
        latencyMs: 80,
        costAdjusted: 0.0001,
        isFallback: false,
        timestamp: Date.now(),
      };

      const event2 = {
        traceId: 'trace-002',
        tenantId: 'tenant-1',
        bucketId: '09',
        selectedProvider: 'gpt-4o',
        utilityScore: 0.95,
        latencyMs: 310,
        costAdjusted: 0.0080,
        isFallback: true,
        timestamp: Date.now() + 10,
      };

      await writer.writeEvent(event1);
      await writer.writeEvent(event2);

      const content = await fs.readFile(testLogPath, 'utf8');
      const lines = content.trim().split('\n');

      expect(lines.length).toBe(2);

      const parsed1 = JSON.parse(lines[0]);
      const parsed2 = JSON.parse(lines[1]);

      expect(parsed1.traceId).toBe('trace-001');
      expect(parsed1.isFallback).toBe(false);
      expect(parsed1.timestamp).toBeTypeOf('number');

      expect(parsed2.traceId).toBe('trace-002');
      expect(parsed2.isFallback).toBe(true);
      expect(parsed2.timestamp).toBeTypeOf('number');
    });
  });
});
