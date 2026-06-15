import { useState } from 'react';
import { Result } from '@/domain/shared/Result';

export interface SimulatedMessage {
  phone: string;
  content: string;
}

export function useEvolutionSimulator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function simulateIncomingMessage(phone: string, content: string, propertyId: string = 'default-property'): Promise<Result<void, string>> {
    setIsLoading(true);
    setError(null);
    try {
      const evolutionPayload = {
        event: 'messages.upsert',
        instance: `zehla-instance-${propertyId}`,
        data: {
          key: {
            remoteJid: `${phone.trim()}@s.whatsapp.net`,
            fromMe: false,
            id: `wa-msg-simulated-${Date.now()}`
          },
          pushName: 'Hóspede Simulado',
          message: {
            conversation: content
          },
          messageTimestamp: Math.floor(Date.now() / 1000)
        },
        propertyId
      };

      const response = await fetch('/api/webhooks/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WhatsApp-Signature': 'sandbox-mock-bypass-signature'
        },
        body: JSON.stringify(evolutionPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(`Erro HTTP ${response.status}: ${errorText}`);
        return Result.fail(`Erro HTTP ${response.status}: ${errorText}`);
      }

      return Result.ok(undefined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao conectar com o webhook local';
      setError(msg);
      return Result.fail(msg);
    } finally {
      setIsLoading(false);
    }
  }

  async function simulateConnectionStatus(status: 'CONNECTED' | 'AWAITING_QR' | 'FAILED' | 'DISCONNECTED', qrCode?: string, errorMsg?: string, propertyId: string = 'default-property'): Promise<Result<void, string>> {
    setIsLoading(true);
    setError(null);
    try {
      const connectionPayload = {
        event: 'connection.update',
        instance: `zehla-instance-${propertyId}`,
        data: {
          status,
          qrCode: qrCode || null,
          error: errorMsg || null
        },
        propertyId
      };

      // Nota: As conexões do Evolution podem ir para a mesma rota ou uma rota de suporte
      // No nosso caso batemos no webhook geral ou diretamente via chamada mock para simulação
      const response = await fetch('/api/webhooks/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WhatsApp-Signature': 'sandbox-mock-bypass-signature'
        },
        body: JSON.stringify(connectionPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(`Erro HTTP ${response.status}: ${errorText}`);
        return Result.fail(`Erro HTTP ${response.status}: ${errorText}`);
      }

      return Result.ok(undefined);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao simular status de conexão';
      setError(msg);
      return Result.fail(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    simulateIncomingMessage,
    simulateConnectionStatus,
    isLoading,
    error
  };
}
