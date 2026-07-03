/**
 * ZEHLA SmartHotel — Flow Validation Script
 * 
 * Valida os 5 fluxos principais end-to-end:
 * 1. Brain Connect (NeuroRouter health)
 * 2. NextAuth Register (criação de tenant)
 * 3. Checkout PIX (criação de assinatura + QR code)
 * 4. Payment Webhook (confirmação de pagamento)
 * 5. WhatsApp Webhook + AI Response
 * 
 * Uso: npx tsx scripts/validate-flows.ts
 *      BASE_URL=http://localhost:3000 npx tsx scripts/validate-flows.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  durationMs: number;
  detail?: string;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  fn: () => Promise<void>,
): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({
      name,
      status: 'pass',
      durationMs: Date.now() - start,
    });
    console.log(`  ✅ ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    const msg = err?.message || String(err);
    results.push({
      name,
      status: 'fail',
      durationMs: Date.now() - start,
      detail: msg,
    });
    console.log(`  ❌ ${name} — ${msg} (${Date.now() - start}ms)`);
  }
}

// ─── Flow 1: Brain Connect ───────────────────────────────────────────
async function testBrainConnect() {
  const res = await fetch(`${BASE_URL}/api/brain/health`);
  if (res.status !== 200) throw new Error(`status ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error('success=false');
}

// ─── Flow 2: NextAuth Register ───────────────────────────────────────
let testTenantEmail: string;

async function testAuthRegister() {
  testTenantEmail = `flow-test-${Date.now()}@zehla.test`;

  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testTenantEmail,
      name: 'Flow Test User',
      password: 'TestPass123!',
      pousadaName: 'Pousada FlowTest',
      phone: '+5511999999999',
    }),
  });

  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`status ${res.status}`);
  }
}

// ─── Flow 3: Checkout PIX ────────────────────────────────────────────
let subscriptionId: string;

async function testCheckoutCreate() {
  const res = await fetch(`${BASE_URL}/api/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer local_flow_test_token_2026'
    },
    body: JSON.stringify({
      email: testTenantEmail,
      name: 'Flow Test User',
      planType: 'lite',
      paymentMethod: 'pix',
    }),
  });

  if (res.status !== 200) throw new Error(`status ${res.status}`);
  const data = await res.json();
  if (!data.subscriptionId) throw new Error('missing subscriptionId');
  subscriptionId = data.subscriptionId;
}

// ─── Flow 4: Payment Webhook ─────────────────────────────────────────
async function testPaymentWebhook() {
  const res = await fetch(`${BASE_URL}/api/checkout/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'payment.updated',
      type: 'payment',
      data: { id: 'flow-test-mock-payment' },
    }),
  });

  if (res.status !== 200) throw new Error(`status ${res.status}`);
}

// ─── Flow 5: WhatsApp Webhook ────────────────────────────────────────
async function testWhatsAppWebhook() {
  // GET verification
  const verifyRes = await fetch(
    `${BASE_URL}/api/webhook-whatsapp?hub.mode=subscribe&hub.verify_token=zehla_whatsapp_verify_2024&hub.challenge=CHALLENGE_TEST`,
  );
  const verifyBody = await verifyRes.text();
  if (verifyBody !== 'CHALLENGE_TEST') {
    throw new Error(`verify returned "${verifyBody}"`);
  }

  // POST message
  const postRes = await fetch(`${BASE_URL}/api/webhook-whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            metadata: {
              display_phone_number: '+5511999999999'
            },
            messages: [{
              from: '5511999999999',
              id: 'flow-test-msg',
              text: { body: 'Olá, quero reservar um quarto' },
              timestamp: String(Math.floor(Date.now() / 1000)),
              type: 'text',
            }],
          },
        }],
      }],
    }),
  });

  if (postRes.status !== 200) throw new Error(`POST status ${postRes.status}`);
}

// ─── Cleanup ─────────────────────────────────────────────────────────
async function cleanup() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    if (testTenantEmail) {
      const tenant = await prisma.tenant.findUnique({
        where: { email: testTenantEmail },
      });
      if (tenant) {
        const subscriptions = await prisma.subscription.findMany({
          where: { tenantId: tenant.id },
          select: { id: true },
        });
        const subIds = subscriptions.map((s) => s.id);
        if (subIds.length > 0) {
          await prisma.paymentTransaction.deleteMany({
            where: { subscriptionId: { in: subIds } },
          });
        }
        await prisma.subscription.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.tenant.delete({ where: { id: tenant.id } });
      }
    }

    await prisma.$disconnect();
    console.log('\n  🧹 Cleanup concluído.');
  } catch {
    console.log('\n  ⚠️  Cleanup falhou (non-critical).');
  }
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  ZEHLA SmartHotel — Flow Validation         ║');
  console.log(`║  Base URL: ${BASE_URL.padEnd(32)}║`);
  console.log('╚══════════════════════════════════════════════╝\n');

  console.log('▶ Flow 1: Brain Connect');
  await runTest('Brain health check', testBrainConnect);

  console.log('\n▶ Flow 2: NextAuth Register');
  await runTest('Register new tenant', testAuthRegister);

  console.log('\n▶ Flow 3: Checkout PIX');
  await runTest('Create PIX checkout', testCheckoutCreate);

  console.log('\n▶ Flow 4: Payment Webhook');
  await runTest('Process payment webhook', testPaymentWebhook);

  console.log('\n▶ Flow 5: WhatsApp Webhook + AI');
  await runTest('WhatsApp verify + message', testWhatsAppWebhook);

  // Summary
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const totalMs = results.reduce((s, r) => s + r.durationMs, 0);

  console.log('\n═══════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`  Total:   ${totalMs}ms`);
  console.log('═══════════════════════════════════════\n');

  // Cleanup
  await cleanup();

  if (failed > 0) {
    console.log('❌ VALIDATION FAILED\n');
    results
      .filter((r) => r.status === 'fail')
      .forEach((r) => console.log(`  - ${r.name}: ${r.detail}`));
    process.exit(1);
  }

  console.log('✅ ALL FLOWS VALIDATED\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
