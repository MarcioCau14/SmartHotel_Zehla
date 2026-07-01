// ==============================================================================  
// ZEHLA SmartHotel — Monitoring Utilities (Fase 5)  
// ==============================================================================

interface MetricCounter { name: string; value: number; labels: Record<string, string>; }  
interface MetricTimer { name: string; count: number; totalMs: number; minMs: number; maxMs: number; lastMs: number; }  
interface HealthCheck { name: string; status: 'healthy' | 'degraded' | 'unhealthy'; latencyMs: number; message?: string; lastCheck: string; }

const counters: Map<string, MetricCounter> = new Map();  
const timers: Map<string, MetricTimer> = new Map();  
const healthChecks: HealthCheck[] = [];  
const PROCESS_START = Date.now();  
const requestCounts: Map<string, { total: number; errors: number; lastErrorAt?: string }> = new Map();

export function incrementCounter(name: string, labels: Record<string, string> = {}, amount: number = 1): void {  
  const key = `${name}:${JSON.stringify(labels)}`;  
  const existing = counters.get(key);  
  if (existing) { existing.value += amount; } else { counters.set(key, { name, value: amount, labels }); }  
}

export function getCounters(): MetricCounter[] { return Array.from(counters.values()); }

export function recordTimer(name: string, durationMs: number, labels: Record<string, string> = {}): void {  
  const key = `${name}:${JSON.stringify(labels)}`;  
  const existing = timers.get(key);  
  if (existing) {  
    existing.count += 1; existing.totalMs += durationMs;  
    existing.minMs = Math.min(existing.minMs, durationMs);  
    existing.maxMs = Math.max(existing.maxMs, durationMs);  
    existing.lastMs = durationMs;  
  } else {  
    timers.set(key, { name, count: 1, totalMs: durationMs, minMs: durationMs, maxMs: durationMs, lastMs: durationMs });  
  }  
}

export function getTimers(): (MetricTimer & { avgMs: number })[] {  
  return Array.from(timers.values()).map((t) => ({ ...t, avgMs: t.count > 0 ? Math.round(t.totalMs / t.count) : 0 }));  
}

export function trackRequest(path: string, method: string, statusCode: number, durationMs: number): void {  
  const key = `${method} ${path}`;  
  const existing = requestCounts.get(key);  
  if (existing) {  
    existing.total += 1;  
    if (statusCode >= 400) { existing.errors += 1; existing.lastErrorAt = new Date().toISOString(); }  
  } else {  
    requestCounts.set(key, { total: 1, errors: statusCode >= 400 ? 1 : 0, ...(statusCode >= 400 ? { lastErrorAt: new Date().toISOString() } : {}) });  
  }  
  recordTimer('request.duration', durationMs, { path, method, status: String(statusCode) });  
  incrementCounter('request.total', { path, method, status: String(statusCode) });  
  if (statusCode >= 400) incrementCounter('request.errors', { path, method, status: String(statusCode) });  
}

export function getRequestStats(): Array<{ path: string; total: number; errors: number; errorRate: number; lastErrorAt?: string }> {  
  return Array.from(requestCounts.entries()).map(([key, stats]) => ({  
    path: key, ...stats,  
    errorRate: stats.total > 0 ? Math.round((stats.errors / stats.total) * 10000) / 100 : 0,  
  }));  
}

export function recordHealthCheck(name: string, status: 'healthy' | 'degraded' | 'unhealthy', latencyMs: number, message?: string): void {  
  const check: HealthCheck = { name, status, latencyMs, message, lastCheck: new Date().toISOString() };  
  const idx = healthChecks.findIndex((h) => h.name === name);  
  if (idx >= 0) { healthChecks[idx] = check; } else { healthChecks.push(check); }  
}

export function getHealthChecks(): HealthCheck[] { return [...healthChecks]; }

export function getSystemMetrics() {  
  const uptime = Date.now() - PROCESS_START;  
  const hours = Math.floor(uptime / 3600000);  
  const minutes = Math.floor((uptime % 3600000) / 60000);  
  const seconds = Math.floor((uptime % 60000) / 1000);  
  const mem = process.memoryUsage();  
  return {  
    uptime, uptimeHuman: `${hours}h ${minutes}m ${seconds}s`,  
    memory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, external: mem.external },  
    nodeVersion: process.version, platform: process.platform,  
    environment: process.env.NODE_ENV || 'development',  
  };  
}

export function resetMetrics(): void { counters.clear(); timers.clear(); requestCounts.clear(); healthChecks.length = 0; }  
