import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvolutionWhatsAppGateway } from '../../../src/infrastructure/messaging/EvolutionWhatsAppGateway';

const mockSendText = vi.fn();
vi.mock('../../../src/infrastructure/external/evolution/EvolutionWhatsAppAdapter', () => {
  return {
    EvolutionWhatsAppAdapter: class {
      sendText = mockSendText;
    }
  };
});

describe('EvolutionWhatsAppGateway', () => {
  let gateway: EvolutionWhatsAppGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new EvolutionWhatsAppGateway();
    // Evita esperas reais nos testes unitários mockando o sleep
    vi.spyOn(gateway as any, 'sleep').mockResolvedValue(undefined);
  });

  it('deve enviar mensagem de texto via WhatsApp com sucesso', async () => {
    mockSendText.mockResolvedValue({
      success: true,
      externalId: 'wa-msg-123'
    });

    const result = await gateway.sendText('5511999999999', 'Mensagem de Teste');

    expect(result.isOk).toBe(true);
    expect(result.value.messageId).toBe('wa-msg-123');
    expect(mockSendText).toHaveBeenCalledWith({
      to: '5511999999999',
      content: 'Mensagem de Teste',
      delay: 1200
    });
  });

  it('deve utilizar um atraso gaussiano Box-Muller positivo', () => {
    const delay = (gateway as any).getGaussianDelayMs(2000, 500);
    expect(delay).toBeGreaterThanOrEqual(500);
  });

  it('deve falhar se o adaptador retornar erro', async () => {
    mockSendText.mockResolvedValue({
      success: false,
      error: 'WhatsApp API error'
    });

    const result = await gateway.sendText('5511999999999', 'Mensagem de Teste');

    expect(result.isFail).toBe(true);
    expect(result.error.message).toContain('WhatsApp API error');
  });
});
