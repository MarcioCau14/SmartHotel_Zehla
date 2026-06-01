/**
 * ZEHLA SMARTHOTEL — ZaosNeuroRouter Lote 4 Test Suite
 * Módulo: src/__tests__/decision/ZaosNeuroRouterLote4.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { PosteriorRepository } from '../../domain/decision/infrastructure/PosteriorRepository';
import { FallbackChainExecutor } from '../../domain/decision/services/FallbackChainExecutor';
import { ProviderHealthMonitor } from '../../domain/decision/services/ProviderHealthMonitor';
import { ShadowModeManager, ShadowExecutionMetrics } from '../../domain/decision/services/ShadowModeManager';
import { CircuitState } from '../../domain/decision/models/CircuitBreakerState';

const TEST_DB_PATH = './zehla_data/router_state/test_router_state.db';
const TEST_SNAPSHOT_DIR = './zehla_data/router_state/test_snapshots';

describe('ZaosNeuroRouter Lote 4 Test Suite — Persistência e Resiliência de Rede', () => {

  // Limpar os bancos de dados de teste antes e depois
  const cleanFiles = () => {
    const dbResolved = path.resolve(TEST_DB_PATH);
    const snapResolved = path.resolve(TEST_SNAPSHOT_DIR);

    // SQLite gera arquivos extras como -wal e -shm em modo WAL
    const filesToDelete = [
      dbResolved,
      `${dbResolved}-wal`,
      `${dbResolved}-shm`,
    ];

    for (const file of filesToDelete) {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (e) {
          // Ignorar erros de deleção
        }
      }
    }

    if (fs.existsSync(snapResolved)) {
      try {
        fs.rmSync(snapResolved, { recursive: true, force: true });
      } catch (e) {
        // Ignorar
      }
    }
  };

  beforeEach(() => {
    cleanFiles();
  });

  afterEach(() => {
    cleanFiles();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Persistência de Alta Performance (SQLite WAL & PosteriorWriteBuffer)
  // ──────────────────────────────────────────────────────────────────────────

  it('4.1. PosteriorWriteBuffer — Acumula 100 writes concorrentes e os consolida em batch no banco apenas após 500ms', async () => {
    const repo = new PosteriorRepository(TEST_DB_PATH, TEST_SNAPSHOT_DIR);

    const updates: any[] = [];
    for (let i = 0; i < 100; i++) {
      updates.push({
        bucketId: `05`,
        providerName: `provider_${i}`,
        alpha: 1.0 + i,
        beta: 1.0,
        nObservations: 1,
        lastUpdateAt: Date.now(),
      });
    }

    // Gravar concorrentemente no repositório (vai para o buffer em memória)
    await repo.savePosteriorBatch(updates);

    // Provamos que o buffer em memória acumulou os 100 registros
    const bufferSizes = repo.getBufferSizes();
    expect(bufferSizes.posteriors).toBe(100);

    // Como o timer de 500ms ainda não disparou (estamos imediatamente após), 
    // se consultarmos o banco diretamente sem carregar o buffer, deve estar vazio.
    // loadAllPosteriors() sobrepõe o buffer in-memory, então para testar a gravação física
    // podemos ver as tabelas do banco diretamente fazendo query SQLite.
    // Vamos verificar o tamanho do buffer antes.
    expect(repo.getBufferSizes().posteriors).toBe(100);

    // Aguardar 600ms para permitir o tick do setInterval drenar
    await new Promise((resolve) => setTimeout(resolve, 600));

    // O buffer deve ter sido zerado (drenado)
    expect(repo.getBufferSizes().posteriors).toBe(0);

    // E os registros foram carregados com sucesso (carregados do SQLite agora)
    const posteriors = repo.loadAllPosteriors();
    expect(posteriors.size).toBe(100);
    expect(posteriors.get('05__provider_50')?.alpha).toBe(51.0);

    repo.close();
  });

  it('4.2. Shutdown Gracioso — SIGTERM força o dreno síncrono emergencial total do buffer in-memory para o SQLite antes de fechar', async () => {
    const repo = new PosteriorRepository(TEST_DB_PATH, TEST_SNAPSHOT_DIR);

    // Inserir registro no buffer
    await repo.savePosteriorBatch([{
      bucketId: '09',
      providerName: 'claude-3.5-sonnet',
      alpha: 10.0,
      beta: 2.0,
      nObservations: 12,
      lastUpdateAt: Date.now(),
    }]);

    expect(repo.getBufferSizes().posteriors).toBe(1);

    // Emitir SIGTERM simulado
    process.emit('SIGTERM');

    // Após o SIGTERM, a conexão com o banco de dados é fechada e o buffer é drenado de forma síncrona.
    // Vamos reabrir o repositório para provar que os dados foram gravados fisicamente no SQLite
    const repo2 = new PosteriorRepository(TEST_DB_PATH, TEST_SNAPSHOT_DIR);
    const data = repo2.loadAllPosteriors();

    expect(data.has('09__claude-3.5-sonnet')).toBe(true);
    expect(data.get('09__claude-3.5-sonnet')?.alpha).toBe(10.0);

    repo2.close();
  });

  it('4.3. Snapshots Diários — Cria snapshots formatados como .json no diretório correto', () => {
    const repo = new PosteriorRepository(TEST_DB_PATH, TEST_SNAPSHOT_DIR);

    // Criar alguma coisa no banco
    repo.savePosteriorBatch([{
      bucketId: '01',
      providerName: 'gpt-4o-mini',
      alpha: 5.0,
      beta: 1.0,
      nObservations: 6,
      lastUpdateAt: Date.now(),
    }]);

    // Forçar dreno
    repo.drain();

    const snapshotPath = repo.createDailySnapshot();

    expect(fs.existsSync(snapshotPath)).toBe(true);
    expect(snapshotPath).toContain(path.resolve(TEST_SNAPSHOT_DIR));

    const content = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    expect(content.posteriors.length).toBe(1);
    expect(content.posteriors[0].providerName).toBe('gpt-4o-mini');

    repo.close();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Gerenciadores de Resiliência de Rede
  // ──────────────────────────────────────────────────────────────────────────

  it('4.4. FallbackChainExecutor — Aborta e tenta próximo provedor se a latência exceder 5s, respeitando teto de 8s', async () => {
    const executor = new FallbackChainExecutor();
    const providers = ['unstable-provider', 'stable-provider'];

    const mockLLMCall = async (provider: string, signal: AbortSignal): Promise<string> => {
      if (provider === 'unstable-provider') {
        // Simular chamada demorada (>5.0s) que deve ser cancelada pelo sinal de abort
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve('unstable-success');
          }, 10000);

          signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error('AbortError: Attempt timeout exceeded'));
          });
        });
      }

      if (provider === 'stable-provider') {
        // Simular chamada rápida e bem-sucedida
        return 'stable-success';
      }

      throw new Error('Unknown provider');
    };

    const startTime = Date.now();
    const result = await executor.execute(providers, mockLLMCall);
    const duration = Date.now() - startTime;

    expect(result.isOk).toBe(true);
    expect(result.value).toBe('stable-success');
    // Deve levar aproximadamente 5.0s (o tempo de timeout do primeiro provedor antes de passar para o estável)
    expect(duration).toBeGreaterThanOrEqual(4500);
    expect(duration).toBeLessThan(8000);
  });

  it('4.5. FallbackChainExecutor — Respeita o teto global de 8.0s interrompendo a cadeia completamente', async () => {
    const executor = new FallbackChainExecutor();
    // Dois provedores instáveis lentos. Cada um demorará > 5s.
    const providers = ['unstable-1', 'unstable-2'];

    const mockLLMCall = async (provider: string, signal: AbortSignal): Promise<string> => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve('success');
        }, 10000);

        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('AbortError'));
        });
      });
    };

    const startTime = Date.now();
    const result = await executor.execute(providers, mockLLMCall);
    const duration = Date.now() - startTime;

    expect(result.isFail).toBe(true);
    expect(result.error.message).toContain('Global execution timeout of 8.0s exceeded');
    expect(duration).toBeGreaterThanOrEqual(7500);
    expect(duration).toBeLessThan(9000); // Garante que foi cortado próximo a 8s
  });

  it('4.6. FallbackChainExecutor — Executa até 2 retries em caso de erro transiente antes de pular para o próximo', async () => {
    const executor = new FallbackChainExecutor();
    const providers = ['flaky-provider', 'backup-provider'];

    let flakyAttempts = 0;

    const mockLLMCall = async (provider: string, signal: AbortSignal): Promise<string> => {
      if (provider === 'flaky-provider') {
        flakyAttempts++;
        throw new Error('Transient error');
      }
      return 'backup-success';
    };

    const isTransient = (err: any) => err.message === 'Transient error';

    const result = await executor.execute(providers, mockLLMCall, isTransient);

    expect(result.isOk).toBe(true);
    expect(result.value).toBe('backup-success');
    // 1 tentativa original + 2 retries = 3 tentativas no total para flaky-provider antes de pular
    expect(flakyAttempts).toBe(3);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ProviderHealthMonitor & ShadowModeManager
  // ──────────────────────────────────────────────────────────────────────────

  it('4.7. ProviderHealthMonitor — Probes sintéticas a cada 60s identificam falhas e abrem o CB preventivamente após 2 falhas', async () => {
    const repo = new PosteriorRepository(TEST_DB_PATH, TEST_SNAPSHOT_DIR);

    let healthStatus = true;
    const probeFn = async (provider: string) => healthStatus;

    // Criar monitor com intervalo curto para teste rápido (10ms)
    const monitor = new ProviderHealthMonitor(['gpt-4o-mini'], repo, probeFn, 10);

    // 1. Executar probe com sucesso
    await monitor.runProbes();
    expect(monitor.getConsecutiveFailures('gpt-4o-mini')).toBe(0);

    // 2. Alterar status para falha
    healthStatus = false;
    await monitor.runProbes();
    expect(monitor.getConsecutiveFailures('gpt-4o-mini')).toBe(1);

    // Circuit breaker ainda não deve estar aberto (ex: bucket 05)
    let cbState = repo.loadCircuitBreakerStates().get('05__gpt-4o-mini');
    expect(cbState).toBeUndefined();

    // 3. Segunda falha consecutiva
    await monitor.runProbes();
    expect(monitor.getConsecutiveFailures('gpt-4o-mini')).toBe(2);

    // Circuit breaker deve estar preventivamente aberto para todos os 32 buckets
    cbState = repo.loadCircuitBreakerStates().get('05__gpt-4o-mini');
    expect(cbState).toBeDefined();
    expect(cbState?.state).toBe(CircuitState.OPEN);
    expect(cbState?.consecutiveFailures).toBe(2);

    const cbStateBucket31 = repo.loadCircuitBreakerStates().get('31__gpt-4o-mini');
    expect(cbStateBucket31?.state).toBe(CircuitState.OPEN);

    repo.close();
  });

  it('4.8. ShadowModeManager — Rollout invisível dispara chamadas em background não-bloqueantes assíncronas', async () => {
    let shadowCalled = false;
    let loggedMetrics: ShadowExecutionMetrics | null = null;

    const executeFn = async (provider: string) => {
      shadowCalled = true;
      return 'shadow-response';
    };

    const metricsLogger = (metrics: ShadowExecutionMetrics) => {
      loggedMetrics = metrics;
    };

    const shadowManager = new ShadowModeManager(
      ['claude-3.5-sonnet'],
      executeFn,
      metricsLogger
    );

    // Executa fireAndForget
    shadowManager.fireAndForget();

    // Verificamos que a chamada é assíncrona. Imediatamente pode não ter concluído, 
    // mas em ambiente de teste aguardamos alguns milissegundos para verificar o background execution.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(shadowCalled).toBe(true);
    expect(loggedMetrics).toBeDefined();
    expect(loggedMetrics?.providerName).toBe('claude-3.5-sonnet');
    expect(loggedMetrics?.success).toBe(true);
    expect(loggedMetrics?.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
