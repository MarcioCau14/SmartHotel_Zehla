/**
 * ZEHLA SMARTHOTEL — PosteriorRepository (Infrastructure Adapter)
 * Módulo: src/domain/decision/infrastructure/PosteriorRepository.ts
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { IRouterStatePort } from '../ports/IRouterStatePort';

export class PosteriorRepository implements IRouterStatePort {
  private readonly db: Database.Database;
  private readonly dbPath: string;
  private readonly snapshotDir: string;

  // Buffers in-memory
  private posteriorBuffer: Map<string, {
    bucketId: string;
    providerName: string;
    alpha: number;
    beta: number;
    nObservations: number;
    lastUpdateAt: number;
  }> = new Map();

  private cbBuffer: Map<string, {
    state: string;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    lastFailureAt: number;
    openedAt: number;
    halfOpenAttempts: number;
  }> = new Map();

  private drainInterval: NodeJS.Timeout | null = null;

  constructor(
    dbPath = './zehla_data/router_state/router_state.db',
    snapshotDir = './zehla_data/router_state/snapshots'
  ) {
    this.dbPath = path.resolve(dbPath);
    this.snapshotDir = path.resolve(snapshotDir);

    // Garantir caminhos de diretórios
    fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    fs.mkdirSync(this.snapshotDir, { recursive: true });

    // Iniciar banco SQLite
    this.db = new Database(this.dbPath);

    // Pragmas dogmáticos para ultra performance
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('busy_timeout = 5000');

    // Inicializar tabelas
    this._initializeSchema();

    // Iniciar timer de drenagem a cada 500ms
    this._startDrainInterval();

    // Hooks de Shutdown gracioso para evitar perda de dados
    this._setupGracefulShutdown();
  }

  private _initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS posteriors (
        bucket_id TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        alpha REAL NOT NULL,
        beta REAL NOT NULL,
        n_observations INTEGER NOT NULL,
        last_update_at INTEGER NOT NULL,
        PRIMARY KEY (bucket_id, provider_name)
      );

      CREATE TABLE IF NOT EXISTS circuit_breakers (
        key TEXT PRIMARY KEY,
        state TEXT NOT NULL,
        consecutive_failures INTEGER NOT NULL,
        consecutive_successes INTEGER NOT NULL,
        last_failure_at INTEGER NOT NULL,
        opened_at INTEGER NOT NULL,
        half_open_attempts INTEGER NOT NULL
      );
    `);
  }

  private _startDrainInterval(): void {
    this.drainInterval = setInterval(() => {
      this.drain();
    }, 500);
  }

  private _setupGracefulShutdown(): void {
    const handleShutdown = (signal: string) => {
      // Dreno síncrono emergencial antes do encerramento
      this.drain();
      this.db.close();
      if (this.drainInterval) {
        clearInterval(this.drainInterval);
      }
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  }

  /**
   * Força a gravação de todos os dados do buffer em uma única transação atômica síncrona
   */
  public drain(): void {
    if (this.posteriorBuffer.size === 0 && this.cbBuffer.size === 0) {
      return;
    }

    const posteriorsToSave = Array.from(this.posteriorBuffer.values());
    const cbToSave = Array.from(this.cbBuffer.entries());

    // Limpar buffers antes de rodar a transação
    this.posteriorBuffer.clear();
    this.cbBuffer.clear();

    const insertPosterior = this.db.prepare(`
      INSERT INTO posteriors (bucket_id, provider_name, alpha, beta, n_observations, last_update_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(bucket_id, provider_name) DO UPDATE SET
        alpha = excluded.alpha,
        beta = excluded.beta,
        n_observations = excluded.n_observations,
        last_update_at = excluded.last_update_at
    `);

    const insertCb = this.db.prepare(`
      INSERT INTO circuit_breakers (key, state, consecutive_failures, consecutive_successes, last_failure_at, opened_at, half_open_attempts)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        state = excluded.state,
        consecutive_failures = excluded.consecutive_failures,
        consecutive_successes = excluded.consecutive_successes,
        last_failure_at = excluded.last_failure_at,
        opened_at = excluded.opened_at,
        half_open_attempts = excluded.half_open_attempts
    `);

    const transaction = this.db.transaction(() => {
      for (const p of posteriorsToSave) {
        insertPosterior.run(p.bucketId, p.providerName, p.alpha, p.beta, p.nObservations, p.lastUpdateAt);
      }
      for (const [key, cb] of cbToSave) {
        insertCb.run(key, cb.state, cb.consecutiveFailures, cb.consecutiveSuccesses, cb.lastFailureAt, cb.openedAt, cb.halfOpenAttempts);
      }
    });

    transaction();
  }

  // ── IRouterStatePort Implementation ──

  loadAllPosteriors(): ReadonlyMap<string, {
    alpha: number;
    beta: number;
    nObservations: number;
    lastUpdateAt: number;
  }> {
    // 1. Ler do SQLite
    const rows = this.db.prepare('SELECT * FROM posteriors').all() as Array<{
      bucket_id: string;
      provider_name: string;
      alpha: number;
      beta: number;
      n_observations: number;
      last_update_at: number;
    }>;

    const map = new Map<string, {
      alpha: number;
      beta: number;
      nObservations: number;
      lastUpdateAt: number;
    }>();

    for (const r of rows) {
      const key = `${r.bucket_id}__${r.provider_name}`;
      map.set(key, {
        alpha: r.alpha,
        beta: r.beta,
        nObservations: r.n_observations,
        lastUpdateAt: r.last_update_at,
      });
    }

    // 2. Sobrepor dados que estão pendentes no buffer em memória
    for (const [key, p] of this.posteriorBuffer) {
      map.set(key, {
        alpha: p.alpha,
        beta: p.beta,
        nObservations: p.nObservations,
        lastUpdateAt: p.lastUpdateAt,
      });
    }

    return map;
  }

  async savePosteriorBatch(
    updates: ReadonlyArray<{
      bucketId: string;
      providerName: string;
      alpha: number;
      beta: number;
      nObservations: number;
      lastUpdateAt: number;
    }>
  ): Promise<void> {
    // Gravações vão primeiramente para o buffer circular em memória
    for (const u of updates) {
      const key = `${u.bucketId}__${u.providerName}`;
      this.posteriorBuffer.set(key, { ...u });
    }
  }

  loadCircuitBreakerStates(): ReadonlyMap<string, {
    state: string;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    lastFailureAt: number;
    openedAt: number;
    halfOpenAttempts: number;
  }> {
    const rows = this.db.prepare('SELECT * FROM circuit_breakers').all() as Array<{
      key: string;
      state: string;
      consecutive_failures: number;
      consecutive_successes: number;
      last_failure_at: number;
      opened_at: number;
      half_open_attempts: number;
    }>;

    const map = new Map<string, {
      state: string;
      consecutiveFailures: number;
      consecutiveSuccesses: number;
      lastFailureAt: number;
      openedAt: number;
      halfOpenAttempts: number;
    }>();

    for (const r of rows) {
      map.set(r.key, {
        state: r.state,
        consecutiveFailures: r.consecutive_failures,
        consecutiveSuccesses: r.consecutive_successes,
        lastFailureAt: r.last_failure_at,
        openedAt: r.opened_at,
        halfOpenAttempts: r.half_open_attempts,
      });
    }

    // Sobrepor dados pendentes no buffer
    for (const [key, cb] of this.cbBuffer) {
      map.set(key, { ...cb });
    }

    return map;
  }

  async saveCircuitBreakerStates(
    states: ReadonlyMap<string, {
      state: string;
      consecutiveFailures: number;
      consecutiveSuccesses: number;
      lastFailureAt: number;
      openedAt: number;
      halfOpenAttempts: number;
    }>
  ): Promise<void> {
    for (const [key, cb] of states) {
      this.cbBuffer.set(key, { ...cb });
    }
  }

  // ── Snapshot Feature ──

  public createDailySnapshot(): string {
    const posteriors = this.loadAllPosteriors();
    const cbs = this.loadCircuitBreakerStates();

    const snapshot = {
      timestamp: Date.now(),
      posteriors: Array.from(posteriors.entries()).map(([key, data]) => {
        const [bucketId, providerName] = key.split('__');
        return { bucketId, providerName, ...data };
      }),
      circuitBreakers: Array.from(cbs.entries()).map(([key, data]) => ({
        key,
        ...data,
      })),
    };

    const fileName = `snapshot_${Date.now()}.json`;
    const filePath = path.join(this.snapshotDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');
    return filePath;
  }

  public getBufferSizes(): { posteriors: number; cbs: number } {
    return {
      posteriors: this.posteriorBuffer.size,
      cbs: this.cbBuffer.size,
    };
  }

  public close(): void {
    this.drain();
    this.db.close();
    if (this.drainInterval) {
      clearInterval(this.drainInterval);
    }
  }
}
