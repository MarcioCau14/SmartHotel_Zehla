import { Result } from '../../shared/Result'

export const CANARY_TRIGGERS = [
  'admin_token_bypass',
  'master_tenant_000',
  'super_user_access',
  'jwt_admin_secret',
  'root_database_dump',
  'internal_api_key',
  'sudo_token_reveal',
]

export interface ThreatReport {
  threatDetected: boolean
  triggersFound: string[]
  details: string[]
}

export class ThreatHunter {
  static scan(text: string): ThreatReport {
    const triggersFound: string[] = []
    const details: string[] = []

    for (const trigger of CANARY_TRIGGERS) {
      const regex = new RegExp(trigger.replace(/_/g, '[\\s_-]?'), 'gi')
      if (regex.test(text)) {
        triggersFound.push(trigger)
        details.push(`Honeypot trigger detected: "${trigger}" — possible path traversal / admin escalation attempt`)
      }
    }

    return {
      threatDetected: triggersFound.length > 0,
      triggersFound,
      details,
    }
  }

  static validate(text: string): Result<ThreatReport> {
    const report = ThreatHunter.scan(text)
    if (report.threatDetected) {
      return Result.fail(
        new Error(`THREAT_DETECTED: ${report.triggersFound.join(', ')}`),
      )
    }
    return Result.ok(report)
  }
}
