// ============================================================================
// ZÉLLA — Next.js Instrumentation Hook
// ============================================================================
// Este arquivo é carregado UMA vez quando o servidor Next.js inicia (tanto
// em dev quanto em produção na Vercel). É o ponto correto para:
//  - Inicializar singletons (LogSink interceptação, caches, etc)
//  - Registrar handlers de processo (unhandledRejection, uncaughtException)
//  - Iniciar tarefas em background
//
// Documentação: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
// ============================================================================

export async function register(): Promise<void> {
  // Só executa no server (Node.js runtime)
  if (typeof window !== 'undefined') return;

  // ── 1. Inicializa LogSink (intercepta console.error/warn globalmente) ──
  // Em modo mock: apenas console + ring buffer in-memory
  // Em modo live: console + ring buffer + Redis Stream
  try {
    const { logSink } = await import('./lib/cerebro/log-sink');
    logSink.interceptConsole();
    // Log de boot confirma que interceptação está ativa
    const { getCerebroMode } = await import('./lib/cerebro/types');
    console.log(`[Instrumentation] Cérebro mode: ${getCerebroMode()}`);
  } catch (error) {
    // Nunca deixa o boot falhar por causa de telemetria
    console.error('[Instrumentation] Falha ao inicializar LogSink (non-fatal):', error);
  }

  // ── 2. Handlers de processo (apenas em Node.js runtime, não Edge) ──
  if (process.env.NEXT_RUNTIME === 'nodejs' || !process.env.NEXT_RUNTIME) {
    process.on('unhandledRejection', (reason) => {
      // Captura promises rejeitadas sem .catch()
      // LogSink já está interceptando console.error, mas garantimos captura aqui
      const msg = reason instanceof Error ? reason.message : String(reason);
      console.error(`[Process] Unhandled rejection: ${msg}`);
    });

    process.on('uncaughtException', (error) => {
      // Captura exceptions síncronas não tratadas
      // NÃO chamamos process.exit() — deixamos o Next.js decidir
      console.error(`[Process] Uncaught exception: ${error.message}`, error);
    });
  }

  // ── 3. Log de boot com info do ambiente ──
  const bootInfo = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    region: process.env.VERCEL_REGION,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
    gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8),
    runtime: process.env.NEXT_RUNTIME || 'nodejs',
  };
  console.log('[Instrumentation] Boot info:', JSON.stringify(bootInfo));
}
