import { getWhatsAppPort } from '@/infrastructure/external/evolution'
import type { WAContact, WAGroup } from '@/application/shared/ports/IWhatsAppPort'

export class WhatsappExtractorService {
  static async listInstances() {
    try {
      const port = getWhatsAppPort()
      return await port.fetchInstances()
    } catch (error) {
      console.error('❌ Error listing WA instances:', error)
      return []
    }
  }

  static async fetchContacts(instanceName: string): Promise<WAContact[]> {
    try {
      const port = getWhatsAppPort()
      return await port.fetchContacts(instanceName)
    } catch (error) {
      console.error(`❌ Error fetching contacts for instance ${instanceName}:`, error)
      return []
    }
  }

  static async fetchContactAbout(instanceName: string, number: string): Promise<string> {
    try {
      const port = getWhatsAppPort()
      return await port.fetchContactAbout(instanceName, number)
    } catch {
      return ''
    }
  }

  static async fetchGroups(instanceName: string): Promise<WAGroup[]> {
    try {
      const port = getWhatsAppPort()
      return await port.fetchGroups(instanceName)
    } catch (error) {
      console.error(`❌ Error fetching groups for instance ${instanceName}:`, error)
      return []
    }
  }

  static async fetchGroupParticipants(instanceName: string, groupJid: string): Promise<WAContact[]> {
    try {
      const port = getWhatsAppPort()
      return await port.fetchGroupParticipants(instanceName, groupJid)
    } catch (error) {
      console.error(`❌ Error fetching participants for group ${groupJid}:`, error)
      return []
    }
  }

  static generateVCard(contacts: WAContact[]): string {
    return contacts.map(c => {
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${c.name || c.number}`,
        `TEL;TYPE=CELL;TYPE=VOICE;TYPE=pref:+${c.number}`,
        'END:VCARD'
      ].join('\n')
    }).join('\n')
  }
}
