import * as fs from "fs";
import * as path from "path";

import { PousadaFactory } from "./pousada-factory";
import { GuestSimulator } from "./guest-simulator";
import { MessageGenerator } from "./message-generator";
import { LoadInjector } from "./load-injector";
import { MetricsCollector } from "./metrics-collector";
import { VulnerabilityScanner } from "./vulnerability-scanner";
import { CalibrationEngine } from "./calibration-engine";
import {
  TestRun, TestScenario, XtressConfig, GeneratedMessage,
  TestRunStatus, PRE_DEFINED_SCENARIOS, LoadProfile
} from "./types";
import { Provisioner } from "./provisioner";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// ============================================================
// DEFAULT CONFIGURATION
// ============================================================

const DEFAULT_CONFIG: XtressConfig = {
  zehlaBaseUrl: process.env.ZEHLA_BASE_URL || "http://localhost:3000",
  zehlaApiKey: process.env.ZEHLA_API_KEY || "xtress_test_key",
  zmgEndpoint: "/api/zmg",
  webhookCallbackUrl: "http://localhost:9999/webhooks",
  dbPath: "./xtress_data.db",
  reportOutputDir: "./xtress_reports",
  defaultTimeout: 10000,
  maxConcurrent: 100,
  logLevel: "info",
};

// ============================================================
// XTRESS TEST RUNNER — Main CLI
// ============================================================

export class XtressRunner {
  private config: XtressConfig;
  private currentTestRun: TestRun | null = null;

  constructor(config?: Partial<XtressConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    // Ensure output directory exists
    if (!fs.existsSync(this.config.reportOutputDir)) {
      fs.mkdirSync(this.config.reportOutputDir, { recursive: true });
    }
  }

  /**
   * Run a pre-defined scenario by ID or name
   */
  async runScenario(scenarioId: string): Promise<TestRun> {
    const scenario = PRE_DEFINED_SCENARIOS.find(
      s => s.id === scenarioId || s.name.toLowerCase() === scenarioId.toLowerCase()
    );

    if (!scenario) {
      throw new Error(
        `Scenario "${scenarioId}" not found.\n` +
        `Available: ${PRE_DEFINED_SCENARIOS.map(s => s.id).join(", ")}`
      );
    }

    return this.run(scenario);
  }

  /**
   * Run a custom scenario
   */
  async run(scenario: TestScenario): Promise<TestRun> {
    this.printBanner();
    this.printScenarioInfo(scenario);

    // Initialize test run
    const testRun: TestRun = {
      id: generateId(),
      name: scenario.name,
      scenario: scenario.id,
      status: "pending",
      config: scenario.loadConfig,
      totalMessages: 0,
      totalErrors: 0,
      totalFallbacks: 0,
      avgResponseMs: 0,
      p95ResponseMs: 0,
      p99ResponseMs: 0,
      deliveryRate: 0.95,
      readRate: 0,
      errorRate: 0,
      throughputPeak: 0,
      throughputAvg: 0,
      memoryGrowthMB: 0,
      cpuAvg: 0,
      vulnerabilities: [],
      calibrations: [],
      createdAt: new Date(),
    };

    this.currentTestRun = testRun;
    testRun.status = "running";
    testRun.startedAt = new Date();

    try {
      // STEP 1: Generate virtual pousadas
      console.log("\n[1/6] Gerando pousadas virtuais...");
      const pousadaFactory = new PousadaFactory(testRun.id);
      const pousadas = pousadaFactory.generate(scenario.pousadaCount);
      console.log(`  + ${pousadas.length} pousadas criadas`);

      // STEP 1.1: Provision Pousadas in Real DB (SO THE BRAIN RECOGNIZES THEM)
      await Provisioner.provision(pousadas);

      // STEP 2: Generate virtual guests
      console.log("\n[2/6] Gerando hospedes sinteticos...");
      const guestSimulator = new GuestSimulator(testRun.id);
      const guests = guestSimulator.generateForPousadas(pousadas, scenario.guestMultiplier);
      console.log(`  + ${guests.length} hospedes criados`);

      // STEP 3: Generate messages
      console.log("\n[3/6] Gerando mensagens WhatsApp...");
      const messageGenerator = new MessageGenerator();
      const messages = this.generateMessages(
        pousadas, guests, messageGenerator, scenario
      );
      testRun.totalMessages = messages.length;
      console.log(`  + ${messages.length} mensagens geradas`);

      // STEP 4: Initialize metrics collector
      console.log("\n[4/6] Iniciando injecao de carga...");
      const metricsCollector = new MetricsCollector(testRun.id);

      // STEP 5: Start load injection
      const loadInjector = new LoadInjector(scenario.loadConfig, this.config, testRun);

      // Start live metrics display
      const metricsInterval = setInterval(() => {
        const stats = metricsCollector.getStats();
        process.stdout.write(`\r  ${metricsCollector.getStatusLine(testRun)}`);
      }, 2000);

      await loadInjector.start(messages);

      // Stop live display
      clearInterval(metricsInterval);
      console.log("\n");

      // STEP 6: Analyze results
      console.log("[5/6] Analisando resultados...");

      // Apply metrics to test run
      metricsCollector.applyToTestRun(testRun);

      // Record events
      for (const event of loadInjector.getEvents()) {
        metricsCollector.recordInjection(event);
      }

      // Final metrics application
      metricsCollector.applyToTestRun(testRun);

      // Vulnerability scan
      const vulnScanner = new VulnerabilityScanner(
        testRun,
        loadInjector.getEvents(),
        metricsCollector.exportMetrics()
      );
      const vulnerabilities = vulnScanner.scan();
      testRun.vulnerabilities = vulnerabilities;

      // Calibration
      console.log("[6/6] Gerando plano de calibragem...");
      const calibrationEngine = new CalibrationEngine(testRun, vulnerabilities);
      const calibrations = calibrationEngine.generate();
      testRun.calibrations = calibrations;

      // Save reports
      this.saveResults(testRun, metricsCollector, calibrationEngine);

      // Print summary
      this.printSummary(testRun, vulnerabilities);

      testRun.status = testRun.errorRate < scenario.successCriteria.maxErrorRate ? "completed" : "failed";
      testRun.completedAt = new Date();

    } catch (error) {
      testRun.status = "failed";
      testRun.completedAt = new Date();
      console.error(`\n[FATAL] Test failed:`, error);
    }

    return testRun;
  }

  /**
   * Run a quick smoke test (low load, fast)
   */
  async smokeTest(): Promise<TestRun> {
    const quickScenario: TestScenario = {
      id: "smoke-test",
      name: "Smoke Test Rapido",
      description: "Teste rapido de sanidade - 50 pousadas, 500 mensagens",
      pousadaCount: 50,
      guestMultiplier: 5,
      messageMultiplier: 2,
      loadConfig: {
        profile: "baseline",
        maxConcurrent: 10,
        requestsPerSecond: 5,
        rampUpDuration: 10,
        sustainedDuration: 30,
        rampDownDuration: 10,
        timeoutPerRequest: 5000,
        retryOnFailure: true,
        maxRetries: 1,
        batchSize: 5,
        delayBetweenBatches: 200,
        chaosEnabled: true,
        chaosProbability: 0.2, // 20% de chance de erro/caos
      },
      durationMinutes: 2,
      successCriteria: {
        maxP95Ms: 5000,
        maxErrorRate: 0.20,
        minDeliveryRate: 0.80,
        maxMemoryGrowthMB: 100,
        maxCpuAvg: 0.90,
        maxDegradationPercent: 0.40,
      },
      tags: ["smoke", "rapido", "sanidade"],
    };

    return this.run(quickScenario);
  }

  /**
   * List available scenarios
   */
  listScenarios(): void {
    console.log("\n" + "=".repeat(60));
    console.log("  XTRESS_TEST — CENARIOS DISPONIVEIS");
    console.log("=".repeat(60));
    console.log("");

    for (const scenario of PRE_DEFINED_SCENARIOS) {
      console.log(`  ID: ${scenario.id}`);
      console.log(`  Nome: ${scenario.name}`);
      console.log(`  Descricao: ${scenario.description}`);
      console.log(`  Pousadas: ${scenario.pousadaCount} | Hospedes/Pousada: ${scenario.guestMultiplier}x`);
      console.log(`  Pico: ${scenario.loadConfig.requestsPerSecond} msgs/s | Duracao: ${scenario.durationMinutes}min`);
      console.log(`  Chaos: ${scenario.loadConfig.chaosEnabled ? "ON" : "OFF"}`);
      console.log(`  Tags: ${scenario.tags.join(", ")}`);
      console.log("");
    }

    console.log("  COMANDO: npm run xtress -- run <id-do-cenario>");
    console.log("  EXEMPLO: npm run xtress -- run domingo-a-noite");
    console.log("  SMOKE:   npm run xtress -- smoke");
    console.log("");
  }

  // ---- PRIVATE METHODS ----

  private generateMessages(
    pousadas: ReturnType<PousadaFactory["generate"]>,
    guests: ReturnType<GuestSimulator["generate"]>,
    generator: MessageGenerator,
    scenario: TestScenario
  ): GeneratedMessage[] {
    const messages: GeneratedMessage[] = [];
    const totalMessages = pousadas.length * scenario.guestMultiplier * scenario.messageMultiplier;

    // Distribute messages across pousadas and their guests
    for (const pousada of pousadas) {
      const pousadaGuests = guests.filter(g => g.pousadaId === pousada.id);
      if (pousadaGuests.length === 0) continue;

      const messagesForPousada = Math.ceil(
        totalMessages / pousadas.length * (0.5 + Math.random())
      );

      const batch = generator.generateBatch(pousada, pousadaGuests, messagesForPousada);
      messages.push(...batch);
    }

    return messages;
  }

  private saveResults(
    testRun: TestRun,
    collector: MetricsCollector,
    calibrator: CalibrationEngine
  ): void {
    const outputDir = this.config.reportOutputDir;
    const testDir = path.join(outputDir, `run_${testRun.id}`);
    
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Save test run summary
    fs.writeFileSync(
      path.join(testDir, "test_run.json"),
      JSON.stringify(testRun, null, 2),
      "utf-8"
    );

    // Save raw metrics
    fs.writeFileSync(
      path.join(testDir, "metrics.json"),
      JSON.stringify(collector.exportMetrics(), null, 2),
      "utf-8"
    );

    // Save snapshots
    fs.writeFileSync(
      path.join(testDir, "snapshots.json"),
      JSON.stringify(collector.exportSnapshots(), null, 2),
      "utf-8"
    );

    // Save calibration report
    calibrator.generateReport(testDir);

    console.log(`\n  Resultados salvos em: ${testDir}`);
  }

  private printBanner(): void {
    console.log("");
    console.log("  ██████╗ ███████╗ ██████╗     ██████╗ ██████╗  █████╗ ██████╗ ████████╗");
    console.log(" ██╔════╝ ██╔════╝██╔═══██╗    ██╔══██╗██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝");
    console.log(" ██║  ███╗█████╗  ██║   ██║    ██████╔╝██████╔╝███████║██████╔╝   ██║   ");
    console.log(" ██║   ██║██╔══╝  ██║   ██║    ██╔═══╝ ██╔══██╗██╔══██║██╔══██╗   ██║   ");
    console.log(" ╚██████╔╝███████╗╚██████╔╝    ██║     ██║  ██║██║  ██║██║  ██║   ██║   ");
    console.log("  ╚═════╝ ╚══════╝ ╚═════╝     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ");
    console.log("                        T E S T    E C O S Y S T E M");
    console.log("");
    console.log(`  Alvo:  ${this.config.zehlaBaseUrl}`);
    console.log(`  Data:  ${new Date().toISOString()}`);
    console.log("");
  }

  private printScenarioInfo(scenario: TestScenario): void {
    console.log("  " + "─".repeat(55));
    console.log(`  CENARIO: ${scenario.name}`);
    console.log(`  ${scenario.description}`);
    console.log("  " + "─".repeat(55));
    console.log(`  Pousadas:       ${scenario.pousadaCount}`);
    console.log(`  Hospedes/Pous:  ${scenario.guestMultiplier}x`);
    console.log(`  Msgs/Hospede:   ${scenario.messageMultiplier}x`);
    console.log(`  Pico (msgs/s):  ${scenario.loadConfig.requestsPerSecond}`);
    console.log(`  Ramp-up:        ${this.fmtDur(scenario.loadConfig.rampUpDuration)}`);
    console.log(`  Sustained:      ${this.fmtDur(scenario.loadConfig.sustainedDuration)}`);
    console.log(`  Ramp-down:      ${this.fmtDur(scenario.loadConfig.rampDownDuration)}`);
    console.log(`  Chaos:          ${scenario.loadConfig.chaosEnabled ? "ATIVADO (" + (scenario.loadConfig.chaosProbability * 100) + "%)" : "DESATIVADO"}`);
    console.log("  " + "─".repeat(55));
  }

  private printSummary(testRun: TestRun, vulnerabilities: typeof testRun.vulnerabilities): void {
    console.log("");
    console.log("  " + "=".repeat(55));
    console.log("  RESULTADO FINAL");
    console.log("  " + "=".repeat(55));
    console.log("");
    console.log(`  Status:         ${testRun.status === "completed" ? "SUCESSO" : "FALHOU"}`);
    console.log(`  Mensagens:      ${testRun.totalMessages}`);
    console.log(`  Erros:          ${testRun.totalErrors} (${(testRun.errorRate * 100).toFixed(1)}%)`);
    console.log(`  Tempo Medio:    ${testRun.avgResponseMs.toFixed(0)}ms`);
    console.log(`  P95:            ${testRun.p95ResponseMs.toFixed(0)}ms`);
    console.log(`  P99:            ${testRun.p99ResponseMs.toFixed(0)}ms`);
    console.log(`  Throughput Avg: ${testRun.throughputAvg.toFixed(1)} msgs/s`);
    console.log(`  Throughput Pico:${testRun.throughputPeak.toFixed(1)} msgs/s`);

    if (vulnerabilities.length > 0) {
      console.log("");
      console.log(`  VULNERABILIDADES: ${vulnerabilities.length}`);
      for (const v of vulnerabilities) {
        console.log(`    [${v.severity.toUpperCase()}] ${v.component}: ${v.description}`);
      }
    } else {
      console.log("");
      console.log("  Nenhuma vulnerabilidade encontrada!");
    }

    const critCount = vulnerabilities.filter(v => v.severity === "critica").length;
    const medCount = vulnerabilities.filter(v => v.severity === "media").length;

    console.log("");
    console.log(`  Calibracoes sugeridas: ${testRun.calibrations.length}`);
    console.log(`    Fase 1 (Imediato):    ${testRun.calibrations.filter(c => c.phase === 1).length}`);
    console.log(`    Fase 2 (Curto Prazo): ${testRun.calibrations.filter(c => c.phase === 2).length}`);
    console.log(`    Fase 3 (Medio Prazo): ${testRun.calibrations.filter(c => c.phase === 3).length}`);
    console.log("");
    console.log("  " + "=".repeat(55));
  }

  private fmtDur(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m${s > 0 ? `${s}s` : ""}`;
  }
}

// ============================================================
// CLI ENTRY POINT
// ============================================================

function printHelp(): void {
  console.log(`
XTRESS_TEST — Ecosystema de Teste de Estresse para ZEHLA SMARTHOTEL

USO:
  npx ts-node src/cli.ts <comando> [opcoes]

COMANDOS:
  run <cenario>     Executa um cenario de teste
  smoke             Executa um smoke test rapido (50 pousadas, 500 msgs)
  list              Lista todos os cenarios disponiveis
  dry-run <cenario> Gera dados mas NAO envia mensagens (modo simulacao)
  help              Mostra esta ajuda

CENARIOS DISPONIVEIS:
  domingo-a-noite   Pico de reservas de domingo a noite (200 pousadas)
  feriado-bomba     Corpus Christi com demanda explosiva (500 pousadas)
  crush-test        Encontra o limite absoluto do sistema (500 pousadas)
  chaos-monkey      Testa resiliencia com falhas aleatorias (200 pousadas)
  maratona-24h      Teste de resistencia prolongada (300 pousadas, 24h)
  zero-to-hero      De 10 para 500 pousadas em 1 hora (500 pousadas)

OPCOES:
  --url <url>         URL base do ZEHLA (default: http://localhost:3000)
  --key <api_key>     API Key do ZEHLA
  --output <dir>      Diretorio de saida dos relatorios (default: ./xtress_reports)
  --timeout <ms>      Timeout por request (default: 10000)
  --concurrent <n>    Max requests simultaneos (default: 100)

VARIÁVEIS DE AMBIENTE:
  ZEHLA_BASE_URL      URL base do ZEHLA
  ZEHLA_API_KEY       API Key do ZEHLA

EXEMPLOS:
  npx ts-node src/cli.ts smoke
  npx ts-node src/cli.ts run feriado-bomba
  npx ts-node src/cli.ts run crush-test --url https://zehla.example.com
  npx ts-node src/cli.ts list
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  // Parse options
  const options: Partial<XtressConfig> = {};
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case "--url":
        options.zehlaBaseUrl = args[++i];
        break;
      case "--key":
        options.zehlaApiKey = args[++i];
        break;
      case "--output":
        options.reportOutputDir = args[++i];
        break;
      case "--timeout":
        options.defaultTimeout = parseInt(args[++i], 10);
        break;
      case "--concurrent":
        options.maxConcurrent = parseInt(args[++i], 10);
        break;
    }
  }

  // Load config from file if exists
  let fileConfig = {};
  const configPath = path.join(process.cwd(), "xtress.config.json");
  if (fs.existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      console.log(`  [Config] Arquivo xtress.config.json carregado.`);
    } catch (e) {
      console.warn(`  [Config] Erro ao ler xtress.config.json, usando defaults.`);
    }
  }

  const runner = new XtressRunner({ ...fileConfig, ...options });

  switch (command) {
    case "list": {
      runner.listScenarios();
      break;
    }

    case "smoke": {
      console.log("  Iniciando SMOKE TEST...");
      await runner.smokeTest();
      break;
    }

    case "run": {
      const scenarioId = args[1];
      if (!scenarioId) {
        console.error("  ERRO: Especifique um cenario. Use 'npx ts-node src/cli.ts list' para ver os disponiveis.");
        process.exit(1);
      }
      await runner.runScenario(scenarioId);
      break;
    }

    case "dry-run": {
      const scenarioId = args[1];
      if (!scenarioId) {
        console.error("  ERRO: Especifique um cenario.");
        process.exit(1);
      }
      // Dry run: generate data but use a mock URL that will fail
      const dryRunner = new XtressRunner({
        ...options,
        zehlaBaseUrl: "http://localhost:1", // Will fail immediately
        zmgEndpoint: "/api/zmg",
        zehlaApiKey: "dry_run",
      });
      console.log("  [DRY-RUN] Modo simulacao ativo — mensagens SERAO geradas mas NAO serao enviadas.");
      await dryRunner.runScenario(scenarioId);
      break;
    }

    default: {
      console.error(`  Comando desconhecido: "${command}"`);
      console.error('  Use "npx ts-node src/cli.ts help" para ver os comandos disponiveis.');
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

// Final do arquivo CLI
