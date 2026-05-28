import type {
  ConnectionStateResult,
  DeleteMessageInput,
  IWhatsAppPort,
  NumberStatusInput,
  NumberStatusResult,
  SendTextInput,
  WAContact,
  WAGroup,
  WhatsAppResult,
} from '@/application/shared/ports/IWhatsAppPort';

interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  defaultInstance: string;
}

export class EvolutionWhatsAppAdapter implements IWhatsAppPort {
  constructor(private readonly config: EvolutionConfig) {}

  private async request(method: string, path: string, body?: unknown): Promise<unknown> {
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        apikey: this.config.apiKey,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Evolution API ${res.status} on ${method} ${path}: ${text}`);
    }
    if (res.status === 204) return undefined;
    return res.json();
  }

  async sendText(input: SendTextInput): Promise<WhatsAppResult> {
    const instance = input.instanceName || this.config.defaultInstance;
    try {
      const data = await this.request('POST', `/message/sendText/${instance}`, {
        number: input.to,
        options: { delay: input.delay ?? 1200, presence: 'composing' },
        textMessage: { text: input.content },
      }) as { key?: { id?: string }; messageId?: string };
      return {
        success: true,
        externalId: data?.key?.id || data?.messageId || 'sent',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkNumberStatus(input: NumberStatusInput): Promise<NumberStatusResult> {
    const instance = input.instanceName || this.config.defaultInstance;
    try {
      const data = await this.request('POST', `/chat/checkNumberStatus/${instance}`, {
        numbers: [input.number],
      }) as Array<{ exists?: boolean; numberExists?: boolean }>;
      const status = Array.isArray(data) ? data[0] : data;
      return { exists: status?.exists || status?.numberExists || false };
    } catch {
      return { exists: false };
    }
  }

  async getConnectionState(instanceName: string): Promise<ConnectionStateResult> {
    try {
      const data = await this.request('GET', `/instance/connectionState/${instanceName}`) as {
        instance?: { state?: string };
        base64?: string;
      };
      return {
        connected: data?.instance?.state === 'open',
        qrCode: data?.base64,
      };
    } catch {
      return { connected: false };
    }
  }

  async deleteMessage(input: DeleteMessageInput): Promise<void> {
    try {
      await this.request('DELETE', `/chat/deleteMessage/${input.instanceName}`, {
        key: { id: input.messageId },
      });
    } catch {
      // Fail soft — cleanup best effort
    }
  }

  async fetchContacts(instanceName: string): Promise<WAContact[]> {
    try {
      const data = await this.request('GET', `/contact/fetchContacts/${instanceName}`) as Array<{
        id: string; name?: string; pushname?: string; profilePicUrl?: string;
      }>;
      return (data || []).map(c => ({
        id: c.id,
        name: c.name || c.pushname || 'Sem Nome',
        pushName: c.pushname,
        number: c.id.split('@')[0],
        profilePicUrl: c.profilePicUrl,
      }));
    } catch {
      return [];
    }
  }

  async fetchContactAbout(instanceName: string, number: string): Promise<string> {
    try {
      const data = await this.request('GET', `/contact/about/${instanceName}?number=${number}`) as { about?: string };
      return data?.about || '';
    } catch {
      return '';
    }
  }

  async fetchGroups(instanceName: string): Promise<WAGroup[]> {
    try {
      const data = await this.request('GET', `/group/fetchAllGroups/${instanceName}`) as Array<{
        id: string; subject: string; size?: number;
      }>;
      return (data || []).map(g => ({
        id: g.id,
        subject: g.subject,
        size: g.size || 0,
      }));
    } catch {
      return [];
    }
  }

  async fetchGroupParticipants(instanceName: string, groupJid: string): Promise<WAContact[]> {
    try {
      const data = await this.request('GET', `/group/getParticipants/${instanceName}?groupJid=${groupJid}`) as Array<{
        id: string; name?: string; pushname?: string;
      }>;
      return (data || []).map(p => ({
        id: p.id,
        name: p.name || p.pushname || 'Participante',
        number: p.id.split('@')[0],
      }));
    } catch {
      return [];
    }
  }

  async fetchInstances(): Promise<unknown> {
    try {
      return await this.request('GET', '/instance/fetchInstances');
    } catch {
      return [];
    }
  }
}
