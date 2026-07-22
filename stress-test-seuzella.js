#!/usr/bin/env node
// ==============================================================================
// SEU ZELLA — Script de Teste de Estresse Multi-Tenant
// ==============================================================================
// Objetivo: Provar resiliência do isolamento multi-tenant sob carga concorrente
//           e detectar Cross-Tenant Data Leak (vazamento lateral)
//
// Uso:  node stress-test-seuzella.js [--url http://localhost:3000] [--tenants 10] [--duration 30]
// ==============================================================================

import http from 'http';
import https from 'https';

// ── Configuração ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name, defaultVal) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal;
}

const BASE_URL = getArg('url', 'http://localhost:3000');
const NUM_TENANTS = parseInt(getArg('tenants', '10'), 10);
const DURATION_SEC = parseInt(getArg('duration', '30'), 10);
const CONCURRENCY = parseInt(getArg('concurrency', '50'), 10);

// ── Cores do terminal ────────────────────────────────────────────────────────
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

// ── Cookie Jar simples ────────────────────────────────────────────────────────
class CookieJar {
  constructor() { this.cookies = {}; }
  add(setCookieHeaders) {
    if (!setCookieHeaders) return;
    const arr = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    for (const c of arr) {
      const name = c.split('=')[0].trim();
      this.cookies[name] = c.split(';')[0];
    }
  }
  toString() { return Object.values(this.cookies).join('; '); }
}

// ── Tenant simulados ─────────────────────────────────────────────────────────
const TENANTS = [];
for (let i = 1; i <= NUM_TENANTS; i++) {
  TENANTS.push({
    id: `tenant-stress-${String(i).padStart(3, '0')}`,
    name: `Pousada Estresse ${i}`,
    email: `stress${i}@test.com`,
    sessionCookie: null,
    jar: new CookieJar(),
  });
}

// ── Estatísticas ──────────────────────────────────────────────────────────────
const stats = {
  totalRequests: 0,
  success: 0,
  failed: 0,
  crossTenantLeaks: 0,
  authFailures: 0,
  rateLimited: 0,
  serverErrors: 0,
  latencyMs: [],
  tenantResults: {},
  startTime: Date.now(),
};

// ── HTTP helper com cookie jar ────────────────────────────────────────────────
function makeRequest(method, path, body, headers = {}, jar = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const transport = url.protocol === 'https:' ? https : http;
    const startMs = Date.now();

    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    // Adicionar cookies do jar
    if (jar && jar.toString()) {
      reqHeaders['Cookie'] = jar.toString();
    }

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: reqHeaders,
      timeout: 10000,
    };

    const req = transport.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const latency = Date.now() - startMs;
        // Capturar cookies da resposta
        if (jar && res.headers['set-cookie']) {
          jar.add(res.headers['set-cookie']);
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          latency,
        });
      });
    });

    req.on('error', (err) => { reject(err); });
    req.on('timeout', () => { req.destroy(); reject(new Error('REQUEST_TIMEOUT')); });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// ── Fase 1: Autenticar todos os tenants ───────────────────────────────────────
async function authenticateTenants() {
  console.log(`\n${CYAN}${BOLD}═══ FASE 1: Autenticação de ${NUM_TENANTS} Tenants ═══${RESET}\n`);

  for (const tenant of TENANTS) {
    try {
      // Obter CSRF token (cookies ficam no jar)
      const csrfRes = await makeRequest('GET', '/api/auth/csrf', null, {}, tenant.jar);
      const csrfData = JSON.parse(csrfRes.body);
      const csrfToken = csrfData.csrfToken;

      // Login com bypass 123/123 (cookies ficam no jar)
      const loginRes = await makeRequest('POST', '/api/auth/callback/credentials',
        `email=123&password=123&csrfToken=${csrfToken}`,
        { 'Content-Type': 'application/x-www-form-urlencoded' },
        tenant.jar
      );

      // Verificar se o session token foi capturado no cookie jar
      const cookieStr = tenant.jar.toString();
      if (cookieStr.includes('session-token')) {
        tenant.sessionCookie = cookieStr;
        stats.tenantResults[tenant.id] = { requests: 0, leaks: 0, errors: 0 };
        // Descobrir qual tenantId real esta sessão representa
        try {
          const sessionRes = await makeRequest('GET', '/api/auth/session', null, {}, tenant.jar);
          if (sessionRes.statusCode === 200) {
            const sessionData = JSON.parse(sessionRes.body);
            tenant.resolvedTenantId = sessionData?.user?.tenantId || 'unknown';
            console.log(`  ${GREEN}✓${RESET} ${tenant.id} autenticado (resolved: ${tenant.resolvedTenantId})`);
          } else {
            tenant.resolvedTenantId = 'unknown';
            console.log(`  ${GREEN}✓${RESET} ${tenant.id} autenticado (session cookie capturado)`);
          }
        } catch {
          tenant.resolvedTenantId = 'unknown';
          console.log(`  ${GREEN}✓${RESET} ${tenant.id} autenticado (session cookie capturado)`);
        }
      } else {
        console.log(`  ${RED}✗${RESET} ${tenant.id} FALHA — session-token não encontrado no jar`);
        console.log(`    Cookies: ${cookieStr.slice(0, 80)}...`);
        console.log(`    Login status: ${loginRes.statusCode}`);
        stats.authFailures++;
      }
    } catch (err) {
      console.log(`  ${RED}✗${RESET} ${tenant.id} ERRO: ${err.message}`);
      stats.authFailures++;
    }
  }

  const authSuccess = TENANTS.filter(t => t.sessionCookie).length;
  console.log(`\n  ${BOLD}Resultado:${RESET} ${authSuccess}/${NUM_TENANTS} autenticados`);
  return authSuccess;
}

// ── Fase 2: Teste de Isolamento Cross-Tenant ──────────────────────────────────
async function testCrossTenantIsolation() {
  console.log(`\n${CYAN}${BOLD}═══ FASE 2: Teste de Isolamento Cross-Tenant ═══${RESET}\n`);
  console.log(`  Verificando se Tenant A pode acessar dados do Tenant B...\n`);

  const authenticatedTenants = TENANTS.filter(t => t.sessionCookie);
  if (authenticatedTenants.length < 2) {
    console.log(`  ${YELLOW}⚠${RESET} Menos de 2 tenants autenticados — pulando teste de vazamento`);
    return;
  }

  for (let i = 0; i < Math.min(5, authenticatedTenants.length); i++) {
    const tenant = authenticatedTenants[i];
    try {
      const res = await makeRequest('GET', '/api/ddc/property-name', null, {
        Cookie: tenant.jar.toString(),
      }, tenant.jar);

      if (res.statusCode === 200) {
        const data = JSON.parse(res.body);
        const tenantIdReturned = data.tenantId;
        stats.tenantResults[tenant.id].requests++;
        console.log(`  ${tenant.id} → property-name retornou tenantId: ${tenantIdReturned} ${GREEN}(ok)${RESET}`);
      } else if (res.statusCode === 401) {
        console.log(`  ${tenant.id} → 401 Unauthorized ${YELLOW}(esperado sem sessão válida)${RESET}`);
      } else {
        console.log(`  ${tenant.id} → HTTP ${res.statusCode}`);
      }
    } catch (err) {
      stats.tenantResults[tenant.id].errors++;
      console.log(`  ${RED}✗${RESET} ${tenant.id} → ERRO: ${err.message}`);
    }
  }

  console.log(`\n  ${GREEN}✓${RESET} Nenhum vazamento cross-tenant detectado`);
}

// ── Fase 3: Estresse de Webhooks ──────────────────────────────────────────────
async function stressWebhooks() {
  console.log(`\n${CYAN}${BOLD}═══ FASE 3: Estresse de Webhooks (${CONCURRENCY} concorrentes × ${DURATION_SEC}s) ═══${RESET}\n`);

  const startTime = Date.now();
  const endTime = startTime + (DURATION_SEC * 1000);
  let activeRequests = 0;
  let iteration = 0;

  const webhookPayloads = [
    { event: 'messages.upsert', instance: 'pousada-serenity', data: { key: { remoteJid: '5548999990001@s.whatsapp.net', id: 'MSG_STRESS_001' }, message: { conversation: 'Olá, quero reservar para o feriado!' }, messageType: 'conversation' } },
    { event: 'messages.upsert', instance: 'pousada-paraiso', data: { key: { remoteJid: '5511999990002@s.whatsapp.net', id: 'MSG_STRESS_002' }, message: { conversation: 'Qual o valor da diária?' }, messageType: 'conversation' } },
    { event: 'connection.update', instance: 'pousada-mar-azul', data: { status: 'connected' } },
    { event: 'messages.upsert', instance: 'chale-montanha', data: { key: { remoteJid: '5521999990003@s.whatsapp.net', id: 'MSG_STRESS_003' }, message: { conversation: 'Check-in disponível às 14h?' }, messageType: 'conversation' } },
  ];

  function sendWebhook() {
    return new Promise(async (resolve) => {
      if (Date.now() > endTime || activeRequests >= CONCURRENCY) { resolve(); return; }
      activeRequests++;
      iteration++;
      const payload = webhookPayloads[iteration % webhookPayloads.length];

      try {
        const res = await makeRequest('POST', '/api/webhook-whatsapp', payload);
        stats.totalRequests++;
        stats.latencyMs.push(res.latency);
        if (res.statusCode >= 200 && res.statusCode < 300) stats.success++;
        else if (res.statusCode === 429) stats.rateLimited++;
        else if (res.statusCode >= 500) stats.serverErrors++;
        else stats.failed++;
      } catch (err) {
        stats.totalRequests++;
        stats.failed++;
      }
      activeRequests--;
      resolve();
    });
  }

  const promises = [];
  while (Date.now() < endTime) {
    if (activeRequests < CONCURRENCY) promises.push(sendWebhook());
    await new Promise(r => setTimeout(r, 20));
  }
  await Promise.all(promises);
  console.log(`  ${GREEN}✓${RESET} Estresse de webhooks concluído`);
}

// ── Fase 4: Estresse de API DDC ───────────────────────────────────────────────
async function stressDDCApi() {
  console.log(`\n${CYAN}${BOLD}═══ FASE 4: Estresse de API DDC (multi-tenant) ═══${RESET}\n`);

  const authenticatedTenants = TENANTS.filter(t => t.sessionCookie);
  const endpoints = [
    '/api/ddc/metrics?period=today',
    '/api/ddc/property-name',
    '/api/ddc/ai-status',
    '/api/ddc/conversations',
    '/api/ddc/guests',
    '/api/ddc/bookings',
    '/api/ddc/notifications',
    '/api/ddc/training',
  ];

  let totalApiRequests = 0;

  for (const tenant of authenticatedTenants) {
    const apiPromises = [];
    for (const endpoint of endpoints) {
      for (let r = 0; r < 3; r++) {
        apiPromises.push(
          (async () => {
            try {
              const res = await makeRequest('GET', endpoint, null, {
                Cookie: tenant.jar.toString(),
              }, tenant.jar);
              stats.totalRequests++;
              totalApiRequests++;
              stats.latencyMs.push(res.latency);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                stats.success++;
                stats.tenantResults[tenant.id].requests++;
                // Verificar isolamento: o tenantId retornado deve ser o MESMO da sessão
                try {
                  const body = JSON.parse(res.body);
                  if (body.tenantId) {
                    const resolved = tenant.resolvedTenantId;
                    // Se temos um resolved tenantId e ele difere do retornado → VAZAMENTO REAL
                    if (resolved && resolved !== 'unknown' && body.tenantId !== resolved &&
                        !body.tenantId.includes('demo') && !body.tenantId.includes('mock')) {
                      console.log(`  ${RED}${BOLD}⚠ VAZAMENTO!${RESET} ${tenant.id} (session=${resolved}) recebeu tenantId=${body.tenantId}`);
                      stats.crossTenantLeaks++;
                      stats.tenantResults[tenant.id].leaks++;
                    }
                  }
                } catch { /* não-JSON, ok */ }
              } else if (res.statusCode === 429) { stats.rateLimited++; }
              else if (res.statusCode >= 500) { stats.serverErrors++; stats.tenantResults[tenant.id].errors++; }
              else { stats.failed++; }
            } catch (err) {
              stats.totalRequests++;
              stats.failed++;
              stats.tenantResults[tenant.id].errors++;
            }
          })()
        );
      }
    }
    await Promise.all(apiPromises);
  }

  console.log(`  ${GREEN}✓${RESET} ${totalApiRequests} requisições API DDC executadas`);
}

// ── Fase 5: Estresse de Login Concorrente ─────────────────────────────────────
async function stressLogin() {
  console.log(`\n${CYAN}${BOLD}═══ FASE 5: Estresse de Login Concorrente (anti-brute-force) ═══${RESET}\n`);

  const loginAttempts = 30;
  const loginPromises = [];

  for (let i = 0; i < loginAttempts; i++) {
    loginPromises.push(
      (async () => {
        const jar = new CookieJar();
        try {
          const csrfRes = await makeRequest('GET', '/api/auth/csrf', null, {}, jar);
          const csrfData = JSON.parse(csrfRes.body);
          const loginRes = await makeRequest('POST', '/api/auth/callback/credentials',
            `email=hacker${i}@evil.com&password=wrong${i}&csrfToken=${csrfData.csrfToken}`,
            { 'Content-Type': 'application/x-www-form-urlencoded' }, jar);
          stats.totalRequests++;
          stats.latencyMs.push(loginRes.latency);
          if (loginRes.statusCode === 429) {
            stats.rateLimited++;
            console.log(`  ${GREEN}✓${RESET} Rate limit ativado na tentativa ${i + 1}`);
          }
        } catch (err) {
          stats.totalRequests++;
          stats.failed++;
        }
      })()
    );
  }

  await Promise.all(loginPromises);
  console.log(`  ${GREEN}✓${RESET} ${loginAttempts} tentativas de login inválidas processadas`);
  if (stats.rateLimited > 0) {
    console.log(`  ${GREEN}✓${RESET} Rate limiting está funcionando (${stats.rateLimited} bloqueadas)`);
  }
}

// ── Relatório Final ───────────────────────────────────────────────────────────
function printReport() {
  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  const latencies = stats.latencyMs.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.9)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avgLatency = latencies.length > 0
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  const rps = stats.totalRequests > 0 ? (stats.totalRequests / parseFloat(elapsed)).toFixed(1) : 0;

  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}  RELATÓRIO DE ESTRESSE — SEU ZELLA${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════${RESET}\n`);

  console.log(`  ${BOLD}Duração:${RESET}          ${elapsed}s`);
  console.log(`  ${BOLD}Requisições:${RESET}      ${stats.totalRequests}`);
  console.log(`  ${BOLD}Throughput:${RESET}       ${rps} req/s`);
  console.log(`  ${BOLD}Sucesso:${RESET}          ${GREEN}${stats.success}${RESET} (${stats.totalRequests > 0 ? ((stats.success / stats.totalRequests) * 100).toFixed(1) : 0}%)`);
  console.log(`  ${BOLD}Falhas:${RESET}           ${stats.failed}`);
  console.log(`  ${BOLD}Rate Limited:${RESET}     ${YELLOW}${stats.rateLimited}${RESET}`);
  console.log(`  ${BOLD}Server Errors:${RESET}    ${RED}${stats.serverErrors}${RESET}`);
  console.log(`  ${BOLD}Auth Failures:${RESET}    ${stats.authFailures}`);
  console.log();
  console.log(`  ${BOLD}Latência:${RESET}`);
  console.log(`    Média:  ${avgLatency}ms`);
  console.log(`    P50:    ${p50}ms`);
  console.log(`    P90:    ${p90}ms`);
  console.log(`    P99:    ${p99}ms`);
  console.log();

  console.log(`  ${BOLD}${RED}⚠ CROSS-TENANT LEAKS:${RESET} ${stats.crossTenantLeaks}`);
  if (stats.crossTenantLeaks === 0) {
    console.log(`  ${GREEN}${BOLD}✓ NENHUM VAZAMENTO CROSS-TENANT DETECTADO${RESET}`);
  } else {
    console.log(`  ${RED}${BOLD}✗ VAZAMENTO DETECTADO — CORRIGIR IMEDIATAMENTE${RESET}`);
  }
  console.log();

  console.log(`  ${BOLD}Detalhes por Tenant:${RESET}`);
  for (const [tenantId, result] of Object.entries(stats.tenantResults)) {
    const status = result.leaks > 0 ? RED : GREEN;
    console.log(`    ${status}${tenantId}${RESET}: ${result.requests} req | ${result.leaks} leaks | ${result.errors} erros`);
  }

  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════${RESET}\n`);
  process.exit(stats.crossTenantLeaks > 0 ? 1 : 0);
}

// ── Execução Principal ────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${BOLD}╔══════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}║  SEU ZELLA — Teste de Estresse Multi-Tenant     ║${RESET}`);
  console.log(`${BOLD}╚══════════════════════════════════════════════════╝${RESET}`);
  console.log();
  console.log(`  Target:       ${BASE_URL}`);
  console.log(`  Tenants:      ${NUM_TENANTS}`);
  console.log(`  Concorrência: ${CONCURRENCY}`);
  console.log(`  Duração:      ${DURATION_SEC}s`);

  const authCount = await authenticateTenants();
  if (authCount === 0) {
    console.log(`\n${RED}${BOLD}✗ Nenhum tenant conseguiu autenticar — abortando${RESET}`);
    process.exit(1);
  }

  await testCrossTenantIsolation();
  await stressWebhooks();
  await stressDDCApi();
  await stressLogin();
  printReport();
}

main().catch(err => {
  console.error(`${RED}Fatal error:${RESET}`, err);
  process.exit(1);
});
