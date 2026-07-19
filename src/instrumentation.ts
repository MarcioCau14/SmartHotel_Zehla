// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Next.js Instrumentation — Initializes Socket.io server when Next.js starts
// The Pulse Socket.io server runs on a standalone HTTP server on port 3003
// This allows the frontend to connect via the gateway pattern:
//   io("/?XTransformPort=3003")
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initPulseSocketServer } = await import('@/lib/pulse-socket-server');
      initPulseSocketServer();
      console.log('[Instrumentation] ✓ Pulse Socket.io server initialized');
    } catch (err) {
      console.error('[Instrumentation] Failed to init Pulse Socket.io:', err);
    }
  }
}
