import { Result } from '../../shared/Result'
import { createHash } from 'crypto'
import { prisma as globalPrisma } from '@/lib/prisma'

export class ZdrPrivacyModule {
  private prisma: any

  constructor(prismaInstance?: any) {
    this.prisma = prismaInstance || globalPrisma
  }

  public generateHash(email: string): string {
    return createHash('sha256')
      .update(email.toLowerCase().trim())
      .digest('hex')
  }

  public async expunge(leadId: string, email?: string | null): Promise<Result<void, Error>> {
    try {
      await this.prisma.$transaction(async (tx: any) => {
        // 1. Se o email foi fornecido, gera o hash e salva na lista de supressão (tabela Blacklist)
        if (email) {
          const emailHash = this.generateHash(email)
          await tx.blacklist.upsert({
            where: { emailHash },
            update: {},
            create: { emailHash },
          })
        }

        // 2. Ofusca os dados PII do Lead no banco de dados
        const shortId = leadId.slice(-6).toUpperCase()
        await tx.lead.update({
          where: { id: leadId },
          data: {
            name: `EXPUNGED_LEAD_${shortId}`,
            email: null,
            phone: null,
            whatsapp: null,
            phoneSecondary: null,
            status: 'BLACKLISTED',
            notes: 'Dados sensíveis expurgados em conformidade com LGPD.',
          },
        })
      })

      return Result.ok<void, Error>(undefined)
    } catch (error: any) {
      return Result.fail<void, Error>(error)
    }
  }

  public async isBlacklisted(email: string): Promise<boolean> {
    try {
      const emailHash = this.generateHash(email)
      const record = await this.prisma.blacklist.findUnique({
        where: { emailHash },
      })
      return !!record
    } catch {
      return false
    }
  }
}
