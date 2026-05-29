import { NextRequest } from 'next/server'

export function buildGet(url: string, headers?: Record<string, string>): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export function buildPost(url: string, body: unknown, headers?: Record<string, string>): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

export async function parseResponse(res: Response): Promise<{ status: number; body: any }> {
  const text = await res.text()
  try {
    return { status: res.status, body: JSON.parse(text) }
  } catch {
    return { status: res.status, body: text }
  }
}
