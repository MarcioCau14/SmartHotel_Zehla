// =============================================================================
// ZÉLLA — Message Bundler (Anti-Tarifa WhatsApp Meta 2026)
// =============================================================================
// Buffer inteligente que agrupa múltiplas mensagens em uma janela de 3 segundos,
// resultando em apenas 1 tarifa da Meta (US$ 0,0068) em vez de N tarifas.
//
// Regra Meta (outubro 2026): US$ 0,0068 por interação iniciada ou continuada.
// O bundler aguarda 3s após a primeira mensagem de um tenant antes de registrar
// o custo — se mais mensagens chegarem na mesma janela, apenas 1 tarifa é cobrada.
//
// Complementa o One-Shot Resolution: a IA responde com saudação + preço + PIX +
// regras de uma só vez, reduzindo a necessidade de múltiplas interações.
// =============================================================================

// ── Constants ──────────────────────────────────────────────────────────────────

export const COST_PER_MESSAGE_USD = 0.0068;
export const COST_PER_MESSAGE_BRL = 0.035;
export const BUNDLE_WINDOW_MS = 3000; // 3 seconds

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BundledMessage {
  tenantId: string;
  messageCount: number;       // How many messages were bundled
  costUsd: number;            // Total cost (1 tariff × N messages = 1 × $0.0068)
  costBrl: number;
  savedCostUsd: number;       // Money saved by bundling (would have been N × $0.0068)
  savedCostBrl: number;
  bundleWindowMs: number;
  isOneShot: boolean;         // Whether the response used One-Shot Resolution
  intent?: string;
  direction: 'inbound' | 'outbound';
  timestamp: Date;
}

interface BundleMessageEntry {
  direction: 'inbound' | 'outbound';
  intent?: string;
  timestamp: Date;
  oneShot?: boolean;
}

interface PendingBundle {
  tenantId: string;
  messages: BundleMessageEntry[];
  timer: ReturnType<typeof setTimeout>;
  resolve: (result: BundledMessage) => void;
}

// ── Bundler State ──────────────────────────────────────────────────────────────

const pendingBundles = new Map<string, PendingBundle>();

// ── Statistics ─────────────────────────────────────────────────────────────────

interface BundlerStats {
  totalBundlesProcessed: number;
  totalMessagesProcessed: number;
  totalCostUsd: number;
  totalSavedUsd: number;
  totalOneShots: number;
  avgMessagesPerBundle: number;
  oneShotRate: number;
  savingsRate: number; // % saved vs unbundled
}

let stats = {
  totalBundlesProcessed: 0,
  totalMessagesProcessed: 0,
  totalCostUsd: 0,
  totalSavedUsd: 0,
  totalOneShots: 0,
};

/** Get current bundler statistics */
export function getBundlerStats(): BundlerStats {
  const avgMsg = stats.totalBundlesProcessed > 0
    ? stats.totalMessagesProcessed / stats.totalBundlesProcessed
    : 0;
  const oneShotRate = stats.totalBundlesProcessed > 0
    ? (stats.totalOneShots / stats.totalBundlesProcessed) * 100
    : 0;
  const totalUnbundledCost = stats.totalMessagesProcessed * COST_PER_MESSAGE_USD;
  const savingsRate = totalUnbundledCost > 0
    ? (stats.totalSavedUsd / totalUnbundledCost) * 100
    : 0;

  return {
    totalBundlesProcessed: stats.totalBundlesProcessed,
    totalMessagesProcessed: stats.totalMessagesProcessed,
    totalCostUsd: Math.round(stats.totalCostUsd * 10000) / 10000,
    totalSavedUsd: Math.round(stats.totalSavedUsd * 10000) / 10000,
    totalOneShots: stats.totalOneShots,
    avgMessagesPerBundle: Math.round(avgMsg * 100) / 100,
    oneShotRate: Math.round(oneShotRate * 100) / 100,
    savingsRate: Math.round(savingsRate * 100) / 100,
  };
}

/** Reset bundler statistics (for testing) */
export function resetBundlerStats(): void {
  stats = {
    totalBundlesProcessed: 0,
    totalMessagesProcessed: 0,
    totalCostUsd: 0,
    totalSavedUsd: 0,
    totalOneShots: 0,
  };
  // Clear any pending bundles
  for (const [, bundle] of pendingBundles) {
    clearTimeout(bundle.timer);
  }
  pendingBundles.clear();
}

// ── Core Bundling Function ─────────────────────────────────────────────────────

/**
 * Add a message to the bundler for a given tenant.
 * Returns a Promise that resolves when the bundle window closes.
 *
 * If a bundle is already pending for this tenant, the message is added to it
 * and the timer is NOT reset (first message wins the window start).
 *
 * If no bundle is pending, a new 3-second window starts.
 *
 * @param tenantId - The tenant identifier
 * @param direction - Message direction (inbound/outbound)
 * @param options - Optional: intent, oneShot flag
 * @returns Promise<BundledMessage> - Resolves after bundle window closes
 */
export function addMessageToBundle(
  tenantId: string,
  direction: 'inbound' | 'outbound',
  options?: { intent?: string; oneShot?: boolean }
): Promise<BundledMessage> {
  return new Promise((resolve) => {
    const existing = pendingBundles.get(tenantId);

    if (existing) {
      // Add message to existing bundle (don't reset timer!)
      existing.messages.push({
        direction,
        intent: options?.intent,
        timestamp: new Date(),
        oneShot: options?.oneShot,
      });

      // Replace resolve so the last caller also gets the result
      const oldResolve = existing.resolve;
      existing.resolve = (result) => {
        oldResolve(result);
        resolve(result);
      };
    } else {
      // Create new bundle with 3-second window
      const messages: BundleMessageEntry[] = [{
        direction,
        intent: options?.intent,
        timestamp: new Date(),
        oneShot: options?.oneShot,
      }];

      const timer = setTimeout(() => {
        const bundle = pendingBundles.get(tenantId);
        if (!bundle) return;

        // Remove from pending
        pendingBundles.delete(tenantId);

        // Calculate costs
        const messageCount = bundle.messages.length;
        const hasOutbound = bundle.messages.some(m => m.direction === 'outbound');
        const isOneShot = bundle.messages.some(m => m.oneShot);

        // Only outbound messages incur Meta tariff
        const costUsd = hasOutbound ? COST_PER_MESSAGE_USD : 0;
        const costBrl = hasOutbound ? COST_PER_MESSAGE_USD * 5.15 : 0;

        // Without bundling, each outbound message would cost $0.0068
        const outboundCount = bundle.messages.filter(m => m.direction === 'outbound').length;
        const unbundledCost = outboundCount * COST_PER_MESSAGE_USD;
        const savedCostUsd = unbundledCost - costUsd;
        const savedCostBrl = savedCostUsd * 5.15;

        // Update stats
        stats.totalBundlesProcessed++;
        stats.totalMessagesProcessed += messageCount;
        stats.totalCostUsd += costUsd;
        stats.totalSavedUsd += savedCostUsd;
        if (isOneShot) stats.totalOneShots++;

        const result: BundledMessage = {
          tenantId,
          messageCount,
          costUsd: Math.round(costUsd * 10000) / 10000,
          costBrl: Math.round(costBrl * 10000) / 10000,
          savedCostUsd: Math.round(savedCostUsd * 10000) / 10000,
          savedCostBrl: Math.round(savedCostBrl * 10000) / 10000,
          bundleWindowMs: BUNDLE_WINDOW_MS,
          isOneShot,
          intent: bundle.messages[0]?.intent,
          direction: hasOutbound ? 'outbound' : 'inbound',
          timestamp: new Date(),
        };

        bundle.resolve(result);
      }, BUNDLE_WINDOW_MS);

      pendingBundles.set(tenantId, {
        tenantId,
        messages,
        timer,
        resolve,
      });
    }
  });
}

/**
 * Force-flush all pending bundles immediately (for testing or shutdown).
 */
export function flushAllBundles(): BundledMessage[] {
  const results: BundledMessage[] = [];

  for (const [tenantId, bundle] of pendingBundles) {
    clearTimeout(bundle.timer);
    pendingBundles.delete(tenantId);

    const messageCount = bundle.messages.length;
    const hasOutbound = bundle.messages.some(m => m.direction === 'outbound');
    const isOneShot = bundle.messages.some(m => m.oneShot);

    const costUsd = hasOutbound ? COST_PER_MESSAGE_USD : 0;
    const costBrl = hasOutbound ? COST_PER_MESSAGE_USD * 5.15 : 0;
    const outboundCount = bundle.messages.filter(m => m.direction === 'outbound').length;
    const unbundledCost = outboundCount * COST_PER_MESSAGE_USD;
    const savedCostUsd = unbundledCost - costUsd;
    const savedCostBrl = savedCostUsd * 5.15;

    stats.totalBundlesProcessed++;
    stats.totalMessagesProcessed += messageCount;
    stats.totalCostUsd += costUsd;
    stats.totalSavedUsd += savedCostUsd;
    if (isOneShot) stats.totalOneShots++;

    results.push({
      tenantId,
      messageCount,
      costUsd: Math.round(costUsd * 10000) / 10000,
      costBrl: Math.round(costBrl * 10000) / 10000,
      savedCostUsd: Math.round(savedCostUsd * 10000) / 10000,
      savedCostBrl: Math.round(savedCostBrl * 10000) / 10000,
      bundleWindowMs: BUNDLE_WINDOW_MS,
      isOneShot,
      intent: bundle.messages[0]?.intent,
      direction: hasOutbound ? 'outbound' : 'inbound',
      timestamp: new Date(),
    });
  }

  return results;
}

// =============================================================================
// Compatibility Wrapper — bufferMessage (REAL BATCHING)
// =============================================================================
// Used by /api/webhooks/whatsapp/route.ts and /api/webhook-whatsapp/route.ts
// Buffers incoming messages per guest, waits for the bundle window,
// then processes ALL buffered messages as ONE concatenated payload.
// This makes the bundler actually save Meta tariffs by generating
// ONE AI response instead of N.
// =============================================================================

interface BufferMessagePayload {
  tenantId: string;
  guestPhone: string;
  guestName?: string;
  messageContent: string;
  messageFrom: string;
}

type MessageProcessor = (payload: BufferMessagePayload) => Promise<unknown>;

// Per-guest pending buffers (keyed by tenantId:guestPhone)
interface GuestPendingBuffer {
  messages: BufferMessagePayload[];
  timer: ReturnType<typeof setTimeout>;
  processor: MessageProcessor;
}

const guestBuffers = new Map<string, GuestPendingBuffer>();

/**
 * Force-flush all pending guest buffers (for testing or shutdown).
 */
export function flushAllGuestBuffers(): void {
  for (const [key, buffer] of guestBuffers) {
    clearTimeout(buffer.timer);
    guestBuffers.delete(key);
  }
}

/**
 * Buffer a message for the bundler. When multiple messages arrive from the
 * same guest within the bundle window (3s), they are concatenated into a
 * single payload and processed ONCE by the AI.
 *
 * This is the REAL batching — the AI sees all the guest's rapid-fire messages
 * as ONE input and generates ONE comprehensive response (One-Shot Resolution).
 */
export async function bufferMessage(
  payload: BufferMessagePayload,
  processor: MessageProcessor
): Promise<BundledMessage> {
  const bufferKey = `${payload.tenantId}:${payload.guestPhone}`;

  const existing = guestBuffers.get(bufferKey);

  if (existing) {
    // Same guest sent another message within 3s — add to buffer
    existing.messages.push(payload);

    // Also record in the cost-tracking bundler
    const costResult = await addMessageToBundle(payload.tenantId, 'inbound', {
      intent: payload.messageContent?.slice(0, 50),
    });

    return costResult;
  }

  // First message from this guest — start 3s window
  const messages: BufferMessagePayload[] = [payload];

  const timer = setTimeout(async () => {
    const buffer = guestBuffers.get(bufferKey);
    if (!buffer) return;

    guestBuffers.delete(bufferKey);

    // Concatenate all buffered messages into one
    const allMessages = buffer.messages;
    const concatenatedContent = allMessages
      .map(m => m.messageContent)
      .join('\n');

    // Use the first message's metadata, but with concatenated content
    const batchPayload: BufferMessagePayload = {
      ...allMessages[0],
      messageContent: concatenatedContent,
    };

    try {
      await buffer.processor(batchPayload);
    } catch (err) {
      console.error('[MessageBundler] Error processing batched message:', err);
    }
  }, BUNDLE_WINDOW_MS);

  guestBuffers.set(bufferKey, { messages, timer, processor });

  // Also record in the cost-tracking bundler
  const costResult = await addMessageToBundle(payload.tenantId, 'inbound', {
    intent: payload.messageContent?.slice(0, 50),
  });

  return costResult;
}
