import { ZehlaTestAgent, TestDiscoveryResult, TestPlan } from './test-agent';

export class PlanGenerator {
  private agent: ZehlaTestAgent;

  constructor(agent: ZehlaTestAgent) {
    this.agent = agent;
  }

  async generatePlan(discovery: TestDiscoveryResult): Promise<TestPlan> {
    return this.agent.generatePlan(discovery);
  }

  prioritizeTests(plan: TestPlan): TestPlan {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    plan.testCases.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    plan.frontendTests.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    plan.backendTests.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    return plan;
  }

  estimateCoverage(plan: TestPlan): number {
    const totalFeatures = plan.coverage.pages + plan.coverage.apiRoutes + plan.coverage.components;
    if (totalFeatures === 0) return 0;
    const testsPerFeature = plan.coverage.totalTests / totalFeatures;
    return Math.min(Math.round((testsPerFeature / 2) * 100), 100);
  }
}
