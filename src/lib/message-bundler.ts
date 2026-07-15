/**
 * Message Bundler — consolidates rapid-fire guest messages into a single AI call.
 *
 * When a guest sends multiple messages in quick succession (e.g. "Oi", "Tem vaga?",
 * "Para casal" within 2.5 s), each would normally trigger a separate AI call +
 * Meta API charge ($0.0068). This module buffers those messages and flushes them as
 * one joined request.
 *
 * Serverless-safe: NO setInterval, NO persistent timers that leak across invocations.
 * Uses globalThis to survive warm-starts within the same isolate.
 * Lazy cleanup runs on every `bufferMessage()` call instead of a periodic sweep.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BufferParams {
  tenantId: string;
  guestPhone: string;
  guestName?: string;
  messageContent: string;
  messageFrom?: string;
}

export interface BufferResult {
  conversationId: string;
  aiResponse: string;
  guestId: string;
}

interface BundlerEntry {
  /** Accumulated message fragments. */
  messages: string[];
  /** Shared params from the first message (tenantId, guestPhone, etc.). */
  params: Omit<BufferParams, "messageContent">;
  /** Timer handle — cleared on flush or error. */
  timeout: ReturnType<typeof setTimeout>;
  /** Resolve the shared promise returned to all callers within the window. */
  resolve: (result: BufferResult) => void;
  /** Reject the shared promise on error. */
  reject: (error: unknown) => void;
  /** Timestamp when the entry was created (ms since epoch). */
  createdAt: number;
  /** The shared promise — returned to every caller within the window. */
  promise: Promise<BufferResult>;
}

interface BundlerStats {
  activeBuffers: number;
  totalBundled: number;
  totalSaved: number;
}

// ---------------------------------------------------------------------------
// Global state (serverless-warm-start safe via globalThis)
// ---------------------------------------------------------------------------

const BUNDLER_KEY = Symbol.for("zella.message-bundler");
const STATS_KEY = Symbol.for("zella.message-bundler.stats");

/** Lazily obtain (or create) the buffer map on globalThis. */
function getBufferMap(): Map<string, BundlerEntry> {
  const g = globalThis as Record<symbol, unknown>;
  if (!g[BUNDLER_KEY]) {
    g[BUNDLER_KEY] = new Map<string, BundlerEntry>();
  }
  return g[BUNDLER_KEY] as Map<string, BundlerEntry>;
}

/** Lazily obtain the stats counter on globalThis. */
function getStats(): { totalBundled: number; totalSaved: number } {
  const g = globalThis as Record<symbol, unknown>;
  if (!g[STATS_KEY]) {
    g[STATS_KEY] = { totalBundled: 0, totalSaved: 0 };
  }
  return g[STATS_KEY] as { totalBundled: number; totalSaved: number };
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function getBundleWindowMs(): number {
  const env = process.env.MESSAGE_BUNDLE_WINDOW_MS;
  if (env) {
    const parsed = Number(env);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return 2500;
}

// ---------------------------------------------------------------------------
// Key helper
// ---------------------------------------------------------------------------

function buildKey(tenantId: string, guestPhone: string): string {
  return `tenant:${tenantId}:phone:${guestPhone}`;
}

// ---------------------------------------------------------------------------
// Lazy cleanup — runs on every bufferMessage() call, NO setInterval
// ---------------------------------------------------------------------------

/**
 * Defensive sweep: remove entries that have been sitting far beyond the
 * bundle window (4×) which indicates the timer was lost (e.g. process
 * freeze). Rejects the dangling promise so callers don't hang forever.
 */
function lazyCleanup(buffers: Map<string, BundlerEntry>): void {
  const now = Date.now();
  const staleThreshold = getBundleWindowMs() * 4;

  for (const [key, entry] of buffers) {
    if (now - entry.createdAt > staleThreshold) {
      clearTimeout(entry.timeout);
      entry.reject(
        new Error(`[MESSAGE BUNDLER] Stale buffer cleaned up for ${key}`),
      );
      buffers.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Flush — joins buffered messages and calls processFn ONCE
// ---------------------------------------------------------------------------

function flushEntry(
  buffers: Map<string, BundlerEntry>,
  key: string,
  entry: BundlerEntry,
  processFn: (params: BufferParams) => Promise<BufferResult>,
): void {
  // Remove from map immediately so a future message starts a fresh buffer.
  buffers.delete(key);

  const joinedContent = entry.messages.join(" ");
  const messageCount = entry.messages.length;

  if (messageCount > 1) {
    const stats = getStats();
    stats.totalBundled += messageCount;
    stats.totalSaved += messageCount - 1;
    console.log(`[MESSAGE BUNDLER] Buffered ${messageCount} messages for ${key}`);
  }

  const fullParams: BufferParams = {
    ...entry.params,
    messageContent: joinedContent,
  };

  processFn(fullParams)
    .then((result) => entry.resolve(result))
    .catch((err) => entry.reject(err));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Buffer a guest message and return a single AI response.
 *
 * If multiple messages arrive for the same guest within the bundle window,
 * they are accumulated and only ONE call to `processFn` is made.
 * All callers sharing the same window receive the same `BufferResult`.
 *
 * @param params    - The message metadata and content.
 * @param processFn - The function that actually processes the (joined) message.
 * @returns A promise that resolves with the AI response.
 */
export function bufferMessage(
  params: BufferParams,
  processFn: (params: BufferParams) => Promise<BufferResult>,
): Promise<BufferResult> {
  const buffers = getBufferMap();

  // Lazy cleanup — no setInterval, no background timer.
  lazyCleanup(buffers);

  const key = buildKey(params.tenantId, params.guestPhone);
  const windowMs = getBundleWindowMs();
  const existing = buffers.get(key);

  // ----------------------------------------------------------------
  // Case 1: there is already a pending buffer for this guest.
  //         Append the message and return the SHARED promise.
  // ----------------------------------------------------------------
  if (existing) {
    existing.messages.push(params.messageContent);
    console.log(
      `[MESSAGE BUNDLER] Appended message for ${key} (${existing.messages.length} total, ${Math.max(0, windowMs - (Date.now() - existing.createdAt))}ms remaining)`,
    );
    return existing.promise;
  }

  // ----------------------------------------------------------------
  // Case 2: first message in the window — create a new buffer,
  //         arm a single-shot timer, and return a new promise.
  // ----------------------------------------------------------------
  let resolveRef!: (result: BufferResult) => void;
  let rejectRef!: (error: unknown) => void;

  const promise = new Promise<BufferResult>((resolve, reject) => {
    resolveRef = resolve;
    rejectRef = reject;
  });

  const entry: BundlerEntry = {
    messages: [params.messageContent],
    params: {
      tenantId: params.tenantId,
      guestPhone: params.guestPhone,
      guestName: params.guestName,
      messageFrom: params.messageFrom,
    },
    timeout: setTimeout(() => {
      flushEntry(buffers, key, entry, processFn);
    }, windowMs),
    resolve: resolveRef,
    reject: rejectRef,
    createdAt: Date.now(),
    promise,
  };

  buffers.set(key, entry);

  // Prevent the timer from keeping the serverless process alive.
  if (
    typeof entry.timeout === "object" &&
    entry.timeout !== null &&
    "unref" in entry.timeout
  ) {
    (entry.timeout as NodeJS.Timeout).unref();
  }

  console.log(
    `[MESSAGE BUNDLER] Created new buffer for ${key} (window: ${windowMs}ms)`,
  );

  return promise;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

/**
 * Returns current bundler statistics.
 *
 * - `activeBuffers` — number of guests with messages currently being buffered.
 * - `totalBundled`  — total messages that were part of a multi-message bundle.
 * - `totalSaved`    — number of AI/Meta API calls that were avoided by bundling.
 */
export function getBundlerStats(): BundlerStats {
  const buffers = getBufferMap();
  const stats = getStats();

  // Run a quick cleanup so the active count is accurate.
  lazyCleanup(buffers);

  return {
    activeBuffers: buffers.size,
    totalBundled: stats.totalBundled,
    totalSaved: stats.totalSaved,
  };
}