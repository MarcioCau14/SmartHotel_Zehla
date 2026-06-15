import { Result } from '@/shared/Result'
import { prisma } from '@/lib/prisma'
import { classifyIntent } from '@/lib/brain/intent-classifier'
import { OutboundFSM } from '@/domain/growth/entities/OutboundFSM'
import { LeadBlacklistedEvent } from '@/domain/growth/events/LeadBlacklistedEvent'
import { IEventBus } from '@/application/reservation/ports/IEventBus'

export class ProcessReplyUseCase {
  constructor(private readonly eventBus: IEventBus) {}

  public async execute(
    phone: string,
    messageContent: string
  ): Promise<Result<{ leadId: string; transitionedToBlacklisted: boolean }, Error>> {
    try {
      // 1. Localiza o lead pelo telefone ou WhatsApp
      const lead = await prisma.lead.findFirst({
        where: {
          OR: [
            { phone: phone },
            { whatsapp: phone },
          ],
        },
      })

      if (!lead) {
        return Result.fail(new Error(`Lead não encontrado para o telefone: ${phone}`))
      }

      // 2. Classifica a intenção da resposta semânticamente
      const classified = await classifyIntent(messageContent)

      let transitionedToBlacklisted = false

      // 3. Se for classificado como OPT_OUT, transiciona a FSM e dispara o evento de domínio
      if (classified.intent === 'OPT_OUT') {
        const fsm = OutboundFSM.create(lead.status as any)
        const transitionResult = fsm.transition('OPT_OUT')
        if (transitionResult.isFail) {
          return Result.fail(transitionResult.error)
        }

        // Atualiza o status do lead na base de dados para BLACKLISTED
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: 'BLACKLISTED',
            notes: lead.notes
              ? `${lead.notes}\n[Opt-out detectado semânticamente: "${messageContent}"]`
              : `[Opt-out detectado semânticamente: "${messageContent}"]`,
          },
        })

        // 4. Despacha o evento de domínio LeadBlacklistedEvent para iniciar o expurgo via ZDR
        const event = new LeadBlacklistedEvent(lead.id, {
          leadId: lead.id,
          email: lead.email,
          phone: lead.phone,
          whatsapp: lead.whatsapp,
        })

        await this.eventBus.publish(event)
        transitionedToBlacklisted = true
      }

      return Result.ok({
        leadId: lead.id,
        transitionedToBlacklisted,
      })
    } catch (error: any) {
      return Result.fail(error)
    }
  }
}
