import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { adsProposalCleanupWorker } from '../../workers/AdsProposalCleanupWorker'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adsChangeProposal: {
      deleteMany: vi.fn(),
    },
  },
}))

describe('Google Ads Proposal Cleanup Worker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve chamar deleteMany com filtro de data limite de 7 dias e status PENDING', async () => {
    const mockDeleteResult = { count: 3 };
    (prisma.adsChangeProposal.deleteMany as any).mockResolvedValue(mockDeleteResult)

    // Acessa a função de processamento registrada no Worker do BullMQ
    const workerHandler = (adsProposalCleanupWorker as any).processFn
    const mockJob: any = { id: 'job-123', data: {} }

    const result = await workerHandler(mockJob)

    expect(prisma.adsChangeProposal.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PENDING',
          createdAt: expect.objectContaining({
            lt: expect.any(Date),
          }),
        }),
      })
    )

    const deleteManyCall = (prisma.adsChangeProposal.deleteMany as any).mock.calls[0][0]
    const thresholdDate = deleteManyCall.where.createdAt.lt
    const expectedThreshold = new Date()
    expectedThreshold.setDate(expectedThreshold.getDate() - 7)

    expect(Math.abs(thresholdDate.getTime() - expectedThreshold.getTime())).toBeLessThan(2000)
    expect(result).toEqual({ deletedCount: 3 })
  })
})
