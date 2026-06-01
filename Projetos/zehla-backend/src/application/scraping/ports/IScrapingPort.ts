export interface ScrapingRequest {
  url: string
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
}

export interface ScrapingResponse {
  statusCode: number
  body: string
  headers: Record<string, string>
  proxyUsed: string
  delayMs: number
}

export interface ScrapingConfig {
  minDelayMs: number
  maxDelayMs: number
  proxyList: string[]
}

export interface IScrapingPort {
  fetch(request: ScrapingRequest): Promise<Result<ScrapingResponse, Error>>
  getConfig(): ScrapingConfig
}
