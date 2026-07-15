// ==============================================================================
// ZEHLA SmartHotel — Link-in-Bio Expiration Notifications
// ==============================================================================
// Generates notifications for Link-in-Bio expiration based on plan:
//   LITE: 2 days before 60-day expiry (not credit card)
//   PRO/MAX: 2 days before if payment overdue/failed
//   BETA: 2 days before if payment overdue/failed (within 24-month period)
// ==============================================================================

import { useMemo } from 'react';
import type { PlanTier } from '@/lib/plan-features';
import type { Notification } from '@/types/ddc';
import { LITE_LINKINBIO_DAYS, BETA_PARTNERSHIP_MONTHS, getDaysUntilExpiry } from '@/types/linkinbio';

interface ExpirationNotificationInput {
  plan: PlanTier;
  isBetaPartner: boolean;
  planStartDate?: Date;
  planExpiresAt?: Date;
  betaEndDate?: Date;
  isActive: boolean;
  isPaymentOverdue?: boolean;
  paymentMethod?: 'credit_card' | 'pix' | 'boleto';
}

export function useLinkInBioExpirationNotifications(input: ExpirationNotificationInput): Notification[] {
  return useMemo(() => {
    const notifications: Notification[] = [];
    const now = new Date();

    if (!input.isActive) return notifications;

    // ── LITE Plan: 60 days, warn 2 days before ──────────────────────────────
    if (input.plan === 'lite' && input.planExpiresAt) {
      const daysLeft = getDaysUntilExpiry(input.planExpiresAt);

      if (daysLeft !== null && daysLeft <= 2 && daysLeft > 0) {
        notifications.push({
          id: `lib-expiry-lite-${now.getTime()}`,
          type: 'alert',
          title: 'Link-in-Bio expirando em breve',
          message: `Seu Link-in-Bio expira em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}. Faça upgrade para PRO para manter seu link ativo no perfil do Instagram.`,
          priority: daysLeft === 1 ? 'urgent' : 'high',
          status: 'unread',
          createdAt: now,
          metadata: {
            category: 'linkinbio_expiry',
            plan: 'lite',
            daysLeft,
            action: 'upgrade',
          },
        });
      } else if (daysLeft !== null && daysLeft <= 0) {
        notifications.push({
          id: `lib-expired-lite-${now.getTime()}`,
          type: 'alert',
          title: 'Link-in-Bio expirado',
          message: `Seu período de ${LITE_LINKINBIO_DAYS} dias do Link-in-Bio acabou. Seus visitantes verão uma página inativa. Upgrade para PRO e recupere seu link.`,
          priority: 'urgent',
          status: 'unread',
          createdAt: now,
          metadata: {
            category: 'linkinbio_expired',
            plan: 'lite',
            action: 'upgrade',
          },
        });
      } else if (daysLeft !== null && daysLeft <= 7) {
        notifications.push({
          id: `lib-soon-lite-${now.getTime()}`,
          type: 'alert',
          title: 'Lembrete: Link-in-Bio',
          message: `Faltam ${daysLeft} dias para o Link-in-Bio expirar. Considere fazer upgrade para o plano PRO.`,
          priority: 'low',
          status: 'unread',
          createdAt: now,
          metadata: {
            category: 'linkinbio_reminder',
            plan: 'lite',
            daysLeft,
          },
        });
      }
    }

    // ── PRO/MAX: notification if payment overdue ────────────────────────────
    if ((input.plan === 'pro' || input.plan === 'max') && input.isPaymentOverdue) {
      const daysSinceDue = input.planExpiresAt
        ? Math.ceil((now.getTime() - input.planExpiresAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      if (daysSinceDue >= 0 && daysSinceDue <= 2) {
        notifications.push({
          id: `lib-payment-pro-${now.getTime()}`,
          type: 'alert',
          title: 'Pagamento em atraso — Link-in-Bio',
          message: `Detectamos que o pagamento do seu plano ${input.plan.toUpperCase()} está pendente. Seu Link-in-Bio será suspenso em ${2 - daysSinceDue} dia${2 - daysSinceDue > 1 ? 's' : ''} caso o pagamento não seja confirmado.`,
          priority: daysSinceDue >= 2 ? 'urgent' : 'high',
          status: 'unread',
          createdAt: now,
          metadata: {
            category: 'linkinbio_payment_overdue',
            plan: input.plan,
            daysSinceDue,
            action: 'payment',
          },
        });
      } else if (daysSinceDue > 2) {
        notifications.push({
          id: `lib-suspended-pro-${now.getTime()}`,
          type: 'alert',
          title: 'Link-in-Bio suspenso',
          message: `Seu Link-in-Bio foi suspenso por falta de pagamento. Regularize sua assinatura para reativá-lo.`,
          priority: 'urgent',
          status: 'unread',
          createdAt: now,
          metadata: {
            category: 'linkinbio_suspended',
            plan: input.plan,
            action: 'payment',
          },
        });
      }
    }

    // ── BETA Partner: same as PRO but with Beta-specific messaging ───────────
    if (input.isBetaPartner && input.isPaymentOverdue) {
      const daysSinceDue = input.betaEndDate
        ? Math.ceil((now.getTime() - input.betaEndDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      if (daysSinceDue >= 0 && daysSinceDue <= 2) {
        notifications.push({
          id: `lib-payment-beta-${now.getTime()}`,
          type: 'alert',
          title: 'Programa Beta — Pagamento pendente',
          message: `Seu Link-in-Bio com Selo de Parceiro Especial será suspenso em ${2 - daysSinceDue} dia${2 - daysSinceDue > 1 ? 's' : ''}. O selo é exclusivo do Programa Beta e será removido em caso de inadimplência.`,
          priority: daysSinceDue >= 2 ? 'urgent' : 'high',
          status: 'unread',
          createdAt: now,
          metadata: {
            category: 'beta_payment_overdue',
            plan: 'beta',
            daysSinceDue,
            action: 'payment',
          },
        });
      }
    }

    // ── BETA: End of 24-month period warning ────────────────────────────────
    if (input.isBetaPartner && input.betaEndDate) {
      const daysUntilEnd = getDaysUntilExpiry(input.betaEndDate);
      if (daysUntilEnd !== null && daysUntilEnd <= 30 && daysUntilEnd > 2) {
        notifications.push({
          id: `lib-beta-ending-${now.getTime()}`,
          type: 'alert',
          title: 'Programa Beta encerrando',
          message: `Seu Programa Beta encerra em ${daysUntilEnd} dias (${BETA_PARTNERSHIP_MONTHS} meses totais). Após esse período, condições comerciais padrão se aplicam. Entre em contato para renovação.`,
          priority: 'medium',
          status: 'unread',
          createdAt: now,
          metadata: {
            category: 'beta_ending',
            daysUntilEnd,
          },
        });
      }
    }

    return notifications;
  }, [input.plan, input.isBetaPartner, input.planExpiresAt, input.betaEndDate, input.isActive, input.isPaymentOverdue]);
}