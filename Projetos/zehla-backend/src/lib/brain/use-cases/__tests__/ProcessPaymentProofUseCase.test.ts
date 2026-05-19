import { db as prisma } from '@/lib/db';

import { ProcessPaymentProofUseCase } from '../ProcessPaymentProofUseCase';


// Mock do Prisma
jest.mock('@/lib/db', () => ({
  db: {
    reservation: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(prisma)),
  },
}));

describe('ProcessPaymentProofUseCase', () => {
  const mockReceipt = { amount: 1500, transactionId: 'TX_123' };
  const mockPhone = '5511999999999';
  const mockPropertyId = 'prop_1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Deve processar o pagamento quando o reservationId estiver no contexto', async () => {
    const mockReservationId = 'res_123';
    
    (prisma.payment.create as jest.Mock).mockResolvedValue({ id: 'pay_1' });
    (prisma.reservation.update as jest.Mock).mockResolvedValue({ id: mockReservationId });

    const result = await ProcessPaymentProofUseCase.execute(
      mockPhone,
      mockPropertyId,
      mockReceipt,
      mockReservationId
    );

    expect(result.success).toBe(true);
    expect(result.reservationId).toBe(mockReservationId);
    expect(prisma.payment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ reservationId: mockReservationId })
    }));
    // Não deve chamar findFirst pois o ID já veio no contexto
    expect(prisma.reservation.findFirst).not.toHaveBeenCalled();
  });

  it('2. Deve fazer o fallback para o banco (Veda-Fraude) se o contexto for UNKNOWN', async () => {
    const mockReservationId = 'res_found_in_db';
    
    (prisma.reservation.findFirst as jest.Mock).mockResolvedValue({ id: mockReservationId });
    (prisma.payment.create as jest.Mock).mockResolvedValue({ id: 'pay_1' });
    (prisma.reservation.update as jest.Mock).mockResolvedValue({ id: mockReservationId });

    const result = await ProcessPaymentProofUseCase.execute(
      mockPhone,
      mockPropertyId,
      mockReceipt,
      'UNKNOWN'
    );

    expect(result.success).toBe(true);
    expect(result.reservationId).toBe(mockReservationId);
    expect(prisma.reservation.findFirst).toHaveBeenCalled();
    expect(prisma.reservation.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: mockReservationId }
    }));
  });

  it('3. Deve bloquear e emitir alerta se o contexto for UNKNOWN e não houver reserva pendente no banco', async () => {
    (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await ProcessPaymentProofUseCase.execute(
      mockPhone,
      mockPropertyId,
      mockReceipt,
      'UNKNOWN'
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('Reserva não encontrada para este número.');
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });
});
