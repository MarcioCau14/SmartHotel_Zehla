import {
  LoadConfig, InjectionEvent, GeneratedMessage, TestRun, 
  TestRunStatus, ChaosType, XtressConfig
} from "./types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * LoadInjector — Controls the rate and pattern of message injection
 * 
 * Connects to ZEHLA's ZMG API externally (same as a real pousada would)
 * and injects simulated messages at controlled rates.
 */
export class LoadInjector {
  private config: LoadConfig;
  private xtressConfig: XtressConfig;
  private testRun: TestRun;
  private events: InjectionEvent[] = [];
  private isRunning: boolean = false;
  private abortController: AbortController | null = null;

  constructor(config: LoadConfig, xtressConfig: XtressConfig, testRun: TestRun) {
    this.config = config;
    this.xtressConfig = xtressConfig;
    this.testRun = testRun;
  }

  /**
   * Start the load injection
   */
  async start(messages: GeneratedMessage[]): Promise<void> {
    this.isRunning = true;
    this.abortController = new AbortController();

    const totalDuration = 
      this.config.rampUpDuration + 
      this.config.sustainedDuration + 
      this.config.rampDownDuration;

    const startTime = Date.now();
    let messageIndex = 0;

    console.log(`[LoadInjector] Starting injection: ${messages.length} messages`);
    console.log(`[LoadInjector] Profile: ${this.config.profile}`);
    console.log(`[LoadInjector] Target: ${this.config.requestsPerSecond} msgs/sec`);
    console.log(`[LoadInjector] Duration: ${totalDuration}s (ramp-up: ${this.config.rampUpDuration}s, sustained: ${this.config.sustainedDuration}s, ramp-down: ${this.config.rampDownDuration}s)`);

    try {
      while (this.isRunning && messageIndex < messages.length) {
        if (this.abortController.signal.aborted) break;

        const elapsed = (Date.now() - startTime) / 1000;
        
        // Check if test should end
        if (elapsed > totalDuration) break;

        // Calculate current target rate based on phase (min 1 to avoid Infinity)
        const currentRate = Math.max(1, this.calculateCurrentRate(elapsed, totalDuration));

        // Calculate batch size for this tick
        const batchSize = Math.max(1, Math.floor(currentRate / 10));
        const delayMs = Math.min(1000, Math.max(10, 1000 / (currentRate / batchSize)));

        // Send batch
        const batch = messages.slice(messageIndex, messageIndex + batchSize);
        
        const promises = batch.map((msg, i) => 
          this.injectMessage(msg, i * Math.floor(delayMs / batchSize))
        );

        const results = await Promise.allSettled(promises);
        
        // Process results
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const event = this.createEvent(batch[i], result);
          this.events.push(event);
          this.testRun.totalMessages++;
          
          if (result.status === "rejected" || event.error) {
            this.testRun.totalErrors++;
          }
        }

        messageIndex += batchSize;

        // Update live metrics
        this.updateLiveMetrics();

        // Wait before next batch
        await this.sleep(delayMs);
      }

      console.log(`[LoadInjector] Injection complete: ${messageIndex} messages sent, ${this.testRun.totalErrors} errors`);

    } catch (error) {
      console.error(`[LoadInjector] Fatal error:`, error);
      this.testRun.status = "failed";
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Stop the load injection
   */
  stop(): void {
    this.isRunning = false;
    if (this.abortController) {
      this.abortController.abort();
    }
    console.log("[LoadInjector] Stopped");
  }

  /**
   * Calculate the current target rate based on the phase
   */
  private calculateCurrentRate(elapsed: number, totalDuration: number): number {
    const rampUp = this.config.rampUpDuration;
    const sustained = this.config.sustainedDuration;

    if (elapsed < rampUp) {
      // Ramp-up phase: linear increase from 0 to target
      const progress = elapsed / rampUp;
      return this.config.requestsPerSecond * progress;
    } else if (elapsed < rampUp + sustained) {
      // Sustained phase: full target rate
      return this.config.requestsPerSecond;
    } else {
      // Ramp-down phase: linear decrease from target to 0
      const rampDownElapsed = elapsed - rampUp - sustained;
      const rampDown = this.config.rampDownDuration || totalDuration - rampUp - sustained;
      const progress = Math.max(0, 1 - rampDownElapsed / rampDown);
      return this.config.requestsPerSecond * progress;
    }
  }

  /**
   * Inject a single message into the ZMG API
   */
  private async injectMessage(message: GeneratedMessage, delayMs: number = 0): Promise<void> {
    // Apply chaos engineering if enabled
    if (this.config.chaosEnabled && Math.random() < this.config.chaosProbability) {
      console.log(`[LoadInjector] Applying chaos to message for ${message.pousadaId}`);
      const chaosType = this.applyChaos(message);
      if (chaosType === "skip") return; // Message intentionally not sent
    }

    // Delay if specified (for staggering within batch)
    if (delayMs > 0) await this.sleep(delayMs);

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.xtressConfig.zehlaBaseUrl}${this.xtressConfig.zmgEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.xtressConfig.zehlaApiKey}`,
          "X-Property-Id": message.pousadaId,
          "X-Scenario": "xtress_test",
        },
        body: JSON.stringify({
          agentId: "ZCC-WPP",
          propertyId: message.pousadaId,
          recipientPhone: message.guestPhone,
          recipientName: message.guestPhone,
          messageType: "transactional",
          objective: message.category,
          content: message.content,
          context: {
            customVariables: {
              xtress_test: "true",
              xtress_category: message.category,
              xtress_guest_id: message.guestId,
            },
          },
        }),
        signal: AbortSignal.timeout(this.config.timeoutPerRequest),
      });

      const elapsed = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Record successful injection
      this.testRun.avgResponseMs = 
        (this.testRun.avgResponseMs * (this.testRun.totalMessages - 1) + elapsed) / 
        this.testRun.totalMessages;

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ [LoadInjector] Failed to inject message: ${errorMsg}`);
      throw error; // Re-throw to be caught by Promise.allSettled
    }
  }

  /**
   * Apply chaos engineering to a message
   */
  private applyChaos(message: GeneratedMessage): string | null {
    const chaosTypes: ChaosType[] = [
      "timeout", "duplicate", "malformed", "burst", 
      "silence", "wrong_property", "old_message"
    ];
    const selectedChaos = chaosTypes[Math.floor(Math.random() * chaosTypes.length)];

    switch (selectedChaos) {
      case "timeout":
        // Simulate timeout by setting a very short timeout
        return "timeout";
      case "duplicate":
        // Send duplicate (handled externally)
        return null;
      case "malformed":
        // Modify content to be malformed
        message.content = "@#$% INVALID";
        return null;
      case "silence":
        // Skip this message (simulates network silence)
        return "skip";
      case "wrong_property":
        // Send to wrong property
        message.pousadaId = "prop_invalid_nonexistent";
        return null;
      case "old_message":
        // Set old timestamp
        message.timestamp = new Date(Date.now() - 30 * 86400000);
        return null;
      default:
        return null;
    }
  }

  /**
   * Create an injection event record
   */
  private createEvent(message: GeneratedMessage, result: PromiseSettledResult<void>): InjectionEvent {
    const event: InjectionEvent = {
      id: generateId(),
      messageId: message.id,
      testRunId: this.testRun.id,
      sentAt: message.timestamp,
      retryCount: 0,
    };

    if (result.status === "fulfilled") {
      event.responseReceivedAt = new Date();
      event.statusCode = 200;
      event.responseTime = event.responseReceivedAt.getTime() - message.timestamp.getTime();
    } else {
      event.error = result.reason instanceof Error ? result.reason.message : String(result.reason);
    }

    return event;
  }

  /**
   * Update live metrics (percentiles, rates)
   */
  private updateLiveMetrics(): void {
    const recentEvents = this.events.slice(-1000);
    
    if (recentEvents.length === 0) return;

    // Calculate percentiles from response times
    const responseTimes = recentEvents
      .filter(e => e.responseTime !== undefined)
      .map(e => e.responseTime!)
      .sort((a, b) => a - b);

    if (responseTimes.length > 0) {
      this.testRun.p95ResponseMs = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
      this.testRun.p99ResponseMs = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;
      this.testRun.avgResponseMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }

    // Calculate error rate
    const recentErrors = recentEvents.filter(e => e.error).length;
    this.testRun.errorRate = recentEvents.length > 0 ? recentErrors / recentEvents.length : 0;

    // Calculate throughput
    if (recentEvents.length >= 2) {
      const firstTime = recentEvents[0].sentAt.getTime();
      const lastTime = recentEvents[recentEvents.length - 1].sentAt.getTime();
      const durationSec = (lastTime - firstTime) / 1000;
      if (durationSec > 0) {
        this.testRun.throughputAvg = recentEvents.length / durationSec;
        this.testRun.throughputPeak = Math.max(this.testRun.throughputPeak, this.testRun.throughputAvg);
      }
    }
  }

  getEvents(): InjectionEvent[] {
    return this.events;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default LoadInjector;
