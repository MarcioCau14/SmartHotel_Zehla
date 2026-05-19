import { prisma } from '../../prisma';


export class TrialValidator {
  static async validate(propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { 
        rooms: true, 
        reservations: { 
          where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } } 
        } 
      }
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    // TRAVA DE SEGURANÇA: Validação de Trial de 7 Dias
    const isTrialExpired = property.isTrial && property.trialEndsAt && property.trialEndsAt < new Date();
    
    if (isTrialExpired || property.status === 'TRIAL_EXPIRED') {
      if (property.status !== 'TRIAL_EXPIRED') {
        await prisma.property.update({
          where: { id: propertyId },
          data: { status: 'TRIAL_EXPIRED' }
        });
      }

      return {
        success: false,
        error: '[ZEHLA OFFLINE]: O período de teste da pousada expirou. O atendimento automático está suspenso até a ativação do plano pelo proprietário.',
        property // Retornar property mesmo em erro se necessário para o orchestrator
      };
    }

    return { success: true, property };
  }
}
