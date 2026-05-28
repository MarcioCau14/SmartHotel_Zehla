import { Result } from '../../domain/shared/Result'

export interface EgressRule {
  hostname: string
  port: number
  protocol: 'https' | 'wss'
  allowed: boolean
}

export interface EgressViolation {
  destination: string
  port: number
  protocol: string
  timestamp: Date
  reason: string
}

export class EgressFirewall {
  private readonly whitelist: EgressRule[] = [
    { hostname: 'api.groq.com', port: 443, protocol: 'https', allowed: true },
    { hostname: 'api.openai.com', port: 443, protocol: 'https', allowed: true },
    { hostname: 'api.anthropic.com', port: 443, protocol: 'https', allowed: true },
    { hostname: 'api.nvidia.com', port: 443, protocol: 'https', allowed: true },
  ]

  private readonly blockedPorts: number[] = [
    22, 23, 80, 445, 3389, 5900, 8080, 8443,
    4444, 5555, 6666, 7777, 8888, 9999,
    1337, 31337, 44444, 54321,
  ]

  private violations: EgressViolation[] = []
  private blockedCount = 0
  private enabled = true

  checkConnection(destination: string, port: number, protocol: string): Result<{ allowed: boolean }> {
    if (!this.enabled) return Result.ok({ allowed: true })

    if (port !== 443) {
      const isBlockedPort = this.blockedPorts.includes(port)
      const reason = isBlockedPort
        ? `Port ${port} is in blocked list (commonly used for reverse shells)`
        : `Non-whitelisted port: ${port}. Only port 443 is allowed.`
      this.recordViolation(destination, port, protocol, reason)
      return Result.ok({ allowed: false })
    }

    const allowed = this.whitelist.some(
      rule =>
        rule.allowed &&
        rule.port === port &&
        rule.protocol === protocol &&
        destination.includes(rule.hostname)
    )

    if (!allowed) {
      this.recordViolation(
        destination,
        port,
        protocol,
        `Destination ${destination} is not in whitelist`
      )
      return Result.ok({ allowed: false })
    }

    return Result.ok({ allowed: true })
  }

  addToWhitelist(rule: EgressRule): void {
    const existing = this.whitelist.findIndex(
      r => r.hostname === rule.hostname && r.port === rule.port
    )
    if (existing >= 0) {
      this.whitelist[existing] = rule
    } else {
      this.whitelist.push(rule)
    }
  }

  removeFromWhitelist(hostname: string, port: number): boolean {
    const index = this.whitelist.findIndex(
      r => r.hostname === hostname && r.port === port
    )
    if (index >= 0) {
      this.whitelist.splice(index, 1)
      return true
    }
    return false
  }

  getWhitelist(): EgressRule[] {
    return [...this.whitelist]
  }

  getViolations(): EgressViolation[] {
    return [...this.violations]
  }

  getBlockedCount(): number {
    return this.blockedCount
  }

  enable(): void {
    this.enabled = true
  }

  disable(): void {
    this.enabled = false
  }

  isEnabled(): boolean {
    return this.enabled
  }

  resetStats(): void {
    this.violations = []
    this.blockedCount = 0
  }

  private recordViolation(
    destination: string,
    port: number,
    protocol: string,
    reason: string
  ): void {
    this.violations.push({
      destination,
      port,
      protocol,
      timestamp: new Date(),
      reason,
    })
    this.blockedCount++
  }
}
