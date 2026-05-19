import { Redis } from 'ioredis';
import { createServer } from 'http';

import { guardianMetrics, register } from '../lib/metrics/guardian-metrics';
import { prisma } from '../lib/prisma';


// src/workers/guardian-agent.ts

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type Action = 'LOG' | 'ALERT' | 'CHALLENGE' | 'BLOCK' | 'ISOLATE';

interface GuardianRule {
  alertType: string;
  severity: Severity;
  threshold: number;      // eventos por janela
  windowSeconds: number;  // janela de tempo
  actions: Action[];
  cooldownSeconds: number;
}

const RULES: GuardianRule[] = [
  {
    alertType: 'CANARY_TOUCHED',
    severity: 'CRITICAL',
    threshold: 1,           // 1 toque = imediato
    windowSeconds: 60,
    actions: ['ALERT', 'BLOCK', 'ISOLATE'],
    cooldownSeconds: 3600,
  },
  {
    alertType: 'HMAC_FAIL',
    severity: 'HIGH',
    threshold: 3,           // 3 falhas em 5 min
    windowSeconds: 300,
    actions: ['ALERT', 'BLOCK'],
    cooldownSeconds: 1800,
  },
  {
    alertType: 'BRUTE_FORCE',
    severity: 'HIGH',
    threshold: 5,
    windowSeconds: 300,
    actions: ['CHALLENGE', 'ALERT'],
    cooldownSeconds: 900,
  },
  {
    alertType: 'SUSPICIOUS_PATTERN',
    severity: 'MEDIUM',
    threshold: 10,
    windowSeconds: 600,
    actions: ['LOG', 'ALERT'],
    cooldownSeconds: 3600,
  },
];

const state = new Map<string, { count: number; firstSeen: number; lastAction: number }>();

class GuardianAgent {
  private redis: Redis;
  private isRunning = false;
  private metricsServer: ReturnType<typeof createServer> | null = null;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    guardianMetrics.workerUp.set(1);
    this.startMetricsServer();
  }

  private startMetricsServer() {
    this.metricsServer = createServer(async (req, res) => {
      if (req.url === '/metrics') {
        res.setHeader('Content-Type', register.contentType);
        res.end(await register.metrics());
      } else {
        res.statusCode = 404;
        res.end();
      }
    }).listen(9091, () => {
      
    });
  }

  async start() {
    
    this.isRunning = true;

    while (this.isRunning) {
      try {
        // Lê do stream Redis (bloqueante por 5s)
        const messages = await this.redis.xread(
          'BLOCK', 5000,
          'STREAMS', 'guardian:alerts', '$'
        );

        if (!messages) continue;

        for (const [, entries] of messages) {
          for (const [, fields] of entries) {
            const payloadIndex = fields.indexOf('payload');
            if (payloadIndex !== -1 && fields[payloadIndex + 1]) {
              const payload = JSON.parse(fields[payloadIndex + 1]);
              await this.processAlert(payload);
            }
          }
        }
      } catch (error) {
        console.error('[Guardian] Stream error:', error);
        await this.sleep(1000);
      }
    }
  }

  private async processAlert(alert: unknown) {
    const { alertType, tenantId, metadata } = alert;
    const rule = RULES.find(r => r.alertType === alertType);
      
    if (!rule) {
      console.warn(`[Guardian] No rule for ${alertType}`);
      return;
    }

    const endTimer = guardianMetrics.alertLatency.startTimer({ severity: rule.severity });

    // Incrementa contador de alertas
    guardianMetrics.alertsTotal.inc({
      severity: rule.severity,
      alert_type: alertType,
      tenant_id: tenantId || 'global',
    });

    const key = `${alertType}:${tenantId || 'global'}:${metadata?.ip || 'unknown'}`;
    const now = Date.now();

    let record = state.get(key);
    if (!record || (now - record.firstSeen) > rule.windowSeconds * 1000) {
      record = { count: 0, firstSeen: now, lastAction: 0 };
    }

    record.count++;
    state.set(key, record);

    if (record.count >= rule.threshold) {
      if (now - record.lastAction < rule.cooldownSeconds * 1000) {
        endTimer();
        return;
      }

      record.lastAction = now;
      await this.executeActions(rule, alert);
      
      guardianMetrics.actionsExecuted.inc({ 
        action: rule.actions.join(','), 
        result: 'triggered' 
      });
    }

    void this.persistAlert(alert, rule);
    endTimer();
  }

  private async executeActions(rule: GuardianRule, alert: unknown) {
    const { tenantId, metadata } = alert;
      
    for (const action of rule.actions) {
      switch (action) {
        case 'LOG':
          
          break;

        case 'ALERT':
          
          break;

        case 'CHALLENGE':
          if (metadata?.ip) {
            await this.challengeUser(metadata.ip);
          }
          break;

        case 'BLOCK':
          if (metadata?.ip) {
            await this.blockIP(metadata.ip, rule.cooldownSeconds);
          }
          break;

        case 'ISOLATE':
          if (tenantId) {
            await this.isolateTenant(tenantId);
          }
          break;  
      }
    }
  }

  private async blockIP(ip: string, durationSeconds: number) {
    await this.redis.setex(`block:ip:${ip}`, durationSeconds, '1');
    
  }

  private async isolateTenant(tenantId: string) {
    await this.redis.setex(`isolate:tenant:${tenantId}`, 3600, '1');
    await this.updateIsolatedGauge();
      
    try {
      await prisma.securityIncident.create({
        data: {
          tenantId,
          type: 'TENANT_ISOLATED',
          reason: 'Canary touched — possible breach',
        },
      });
    } catch (e) {
      console.error('[Guardian] Failed to persist incident:', e);
    }

    
  }

  private async updateIsolatedGauge() {
    const keys = await this.redis.keys('isolate:tenant:*');
    guardianMetrics.tenantsIsolated.set(keys.length);
  }

  private async challengeUser(ip: string) {
    await this.redis.setex(`challenge:ip:${ip}`, 900, JSON.stringify({
      required: 'MFA',
      expiresAt: Date.now() + 900000,
    }));
     imposto ao IP ${ip}`);
  }

  private async persistAlert(alert: unknown, rule: GuardianRule) {
    try {
      await prisma.securityAlert.create({
        data: {
          tenantId: alert.tenantId || 'global',
          alertType: alert.alertType,
          severity: rule.severity,
          metadata: JSON.stringify(alert.metadata || {}),
        },
      });
    } catch (e) {
      console.error('[Guardian] Failed to persist alert:', e);
    }
  }

  private sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }

  stop() {
    this.isRunning = false;
    guardianMetrics.workerUp.set(0);
    this.metricsServer?.close();
    this.redis.disconnect();
  }  
}

const guardian = new GuardianAgent();
guardian.start();

process.on('SIGTERM', () => guardian.stop());
process.on('SIGINT', () => guardian.stop());

export { GuardianAgent };
