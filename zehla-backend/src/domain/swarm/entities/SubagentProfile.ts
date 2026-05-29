import { Result } from '../../shared/Result'

export type SubagentRole = 'pricing' | 'reviews' | 'concierge' | 'analyst'

export interface SubagentProfileData {
  role: SubagentRole
  name: string
  description: string
  capabilities: string[]
}

const ROLE_CATALOG: Record<SubagentRole, SubagentProfileData> = {
  pricing: {
    role: 'pricing',
    name: 'Zé-Pricing',
    description: 'Analisa precos de concorrentes e sugere otimizacao de tarifas',
    capabilities: ['scrape_prices', 'compare_rates', 'suggest_discounts', 'seasonal_analysis'],
  },
  reviews: {
    role: 'reviews',
    name: 'Zé-Reviews',
    description: 'Analisa sentimentos de avaliacoes e extrai insights',
    capabilities: ['sentiment_analysis', 'keyword_extraction', 'trend_detection'],
  },
  concierge: {
    role: 'concierge',
    name: 'Zé-Concierge',
    description: 'Gerencia reservas, check-in e servicos ao hospede',
    capabilities: ['manage_reservations', 'handle_requests', 'recommend_services'],
  },
  analyst: {
    role: 'analyst',
    name: 'Zé-Analyst',
    description: 'Realiza analises de dados e gera relatorios de performance',
    capabilities: ['data_analysis', 'report_generation', 'performance_metrics', 'forecasting'],
  },
}

export class SubagentProfile {
  private constructor(private readonly data: SubagentProfileData) {}

  static fromRole(role: SubagentRole): Result<SubagentProfile, string> {
    const catalog = ROLE_CATALOG[role]
    if (!catalog) return Result.fail(`Unknown subagent role: ${role}`)
    return Result.ok(new SubagentProfile({ ...catalog }))
  }

  static custom(data: SubagentProfileData): SubagentProfile {
    return new SubagentProfile({ ...data })
  }

  get role(): SubagentRole { return this.data.role }
  get name(): string { return this.data.name }
  get description(): string { return this.data.description }
  get capabilities(): string[] { return [...this.data.capabilities] }

  hasCapability(capability: string): boolean {
    return this.data.capabilities.includes(capability)
  }

  static listRoles(): SubagentProfile[] {
    return (Object.keys(ROLE_CATALOG) as SubagentRole[]).map(role => new SubagentProfile({ ...ROLE_CATALOG[role] }))
  }
}
