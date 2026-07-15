import crypto from 'node:crypto';

const cache = new Map<string, { value: string; exp: number }>()
const CACHE_TTL = 43200 // 12 hours

function generateKey(input: string, propertyId: string): string {
  const normalized = input.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s{2,}/g, ' ')
  const hash = crypto.createHash('sha256').update(normalized).digest('hex')
  return `cache:intent:${propertyId}:${hash}`
}

export async function getCachedResponse(input: string, propertyId: string): Promise<string | null> {
  try {
    const key = generateKey(input, propertyId)
    const entry = cache.get(key)
    if (entry && entry.exp > Date.now()) return entry.value
    if (entry) cache.delete(key)
    return null
  } catch { return null }
}

export async function setCachedResponse(input: string, propertyId: string, response: string): Promise<void> {
  try {
    const key = generateKey(input, propertyId)
    cache.set(key, { value: response, exp: Date.now() + CACHE_TTL * 1000 })
  } catch {}
}
