import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResendEmailGateway } from '../../../src/infrastructure/email/ResendEmailGateway';

// Mock de redis
vi.mock('../../../src/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  }
}));

// Mock de rate-limiter-flexible
const mockConsume = vi.fn();
vi.mock('rate-limiter-flexible', () => {
  return {
    RateLimiterRedis: class {
      consume = mockConsume;
    }
  };
});

// Mock de resend
const mockSend = vi.fn();
vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: mockSend
      };
    }
  };
});

describe('ResendEmailGateway', () => {
  let gateway: ResendEmailGateway;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = new ResendEmailGateway();
  });

  it('deve enviar e-mail com sucesso quando dentro do limite', async () => {
    mockConsume.mockResolvedValue({ remainingPoints: 99 });
    mockSend.mockResolvedValue({
      data: { id: 'email-123' },
      error: null
    });

    const result = await gateway.sendEmail('teste@pousada.com', 'Assunto Teste', 'Corpo do e-mail');

    expect(result.isOk).toBe(true);
    expect(result.value.messageId).toBe('email-123');
    expect(mockConsume).toHaveBeenCalledWith('global_resend_counter', 1);
  });

  it('deve falhar se o rate limit diário for excedido', async () => {
    mockConsume.mockRejectedValue(new Error('Rate limit exceeded'));

    const result = await gateway.sendEmail('teste@pousada.com', 'Assunto Teste', 'Corpo do e-mail');

    expect(result.isFail).toBe(true);
    expect(result.error.message).toContain('Rate limit excedido');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('deve falhar se a API do Resend retornar erro', async () => {
    mockConsume.mockResolvedValue({ remainingPoints: 99 });
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'API Error' }
    });

    const result = await gateway.sendEmail('teste@pousada.com', 'Assunto Teste', 'Corpo do e-mail');

    expect(result.isFail).toBe(true);
    expect(result.error.message).toContain('API Error');
  });
});
