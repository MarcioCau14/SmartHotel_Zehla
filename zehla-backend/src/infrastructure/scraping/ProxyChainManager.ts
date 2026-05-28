export interface ProxyEntry {
  address: string
  failed: boolean
  failCount: number
}

export class ProxyChainManager {
  private readonly proxies: ProxyEntry[]
  private currentIndex = 0

  constructor(proxyList: string[]) {
    if (proxyList.length === 0) {
      throw new Error('Proxy list must not be empty')
    }
    this.proxies = proxyList.map(address => ({
      address,
      failed: false,
      failCount: 0,
    }))
  }

  getNextProxy(): ProxyEntry {
    const available = this.proxies.filter(p => !p.failed)
    if (available.length === 0) {
      throw new Error('All proxies are failed')
    }
    const proxy = available[this.currentIndex % available.length]
    this.currentIndex = (this.currentIndex + 1) % available.length
    return proxy
  }

  markFailed(address: string): void {
    const entry = this.proxies.find(p => p.address === address)
    if (entry) {
      entry.failed = true
      entry.failCount++
    }
  }

  markRecovered(address: string): void {
    const entry = this.proxies.find(p => p.address === address)
    if (entry) {
      entry.failed = false
    }
  }

  getProxyList(): ProxyEntry[] {
    return this.proxies.map(p => ({ ...p }))
  }

  getAvailableCount(): number {
    return this.proxies.filter(p => !p.failed).length
  }

  getTotalCount(): number {
    return this.proxies.length
  }

  resetFailed(): void {
    for (const proxy of this.proxies) {
      proxy.failed = false
    }
  }

  resetAll(): void {
    this.currentIndex = 0
    this.resetFailed()
  }
}
