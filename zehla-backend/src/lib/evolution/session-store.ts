import { WhatsAppSession } from '../../domain/operacional/entities/WhatsAppSession'
import { WhatsAppStateType } from '../../domain/operacional/value-objects/WhatsAppState'

const sessions = new Map<string, WhatsAppSession>()

export function getSession(propertyId: string): WhatsAppSession | undefined {
  return sessions.get(propertyId)
}

export function setSession(session: WhatsAppSession): void {
  sessions.set(session.propertyId, session)
}

export function getOrCreateSession(propertyId: string): WhatsAppSession {
  const existing = getSession(propertyId)
  if (existing) return existing
  const created = WhatsAppSession.create(propertyId, 'DISCONNECTED')
  if (created.isOk) {
    setSession(created.value)
    return created.value
  }
  throw new Error(`Falha ao criar sessão para propertyId: ${propertyId}`)
}

export function updateSession(propertyId: string, transition: (session: WhatsAppSession) => WhatsAppSession): WhatsAppSession | null {
  const session = getSession(propertyId)
  if (!session) return null
  const updated = transition(session)
  setSession(updated)
  return updated
}

export function getAllSessions(): WhatsAppSession[] {
  return Array.from(sessions.values())
}

export function removeSession(propertyId: string): void {
  sessions.delete(propertyId)
}
