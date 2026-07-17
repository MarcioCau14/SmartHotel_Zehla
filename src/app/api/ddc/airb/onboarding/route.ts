import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';
import { checkEntitlement } from '@/lib/airb/gatekeeper';
import type {
  OnboardingWizardState,
  OnboardingStep,
  OnboardingStatus,
} from '@/types/dashboard';
import {
  ONBOARDING_STEP_ORDER,
  calculateOnboardingProgress,
} from '@/types/dashboard';

// ═══════════════════════════════════════════════════════════════
// GET /api/ddc/airb/onboarding — Retrieve onboarding state for a property
// Query params: ?propertyId=xxx
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbAvailable = await isDatabaseAvailable();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'propertyId é obrigatório' }, { status: 400 });
    }

    if (!dbAvailable) {
      const defaultState: OnboardingWizardState = {
        propertyId,
        currentStep: 'url_entry',
        completedSteps: {} as Record<OnboardingStep, string | null>,
        stepValidations: { url_entry: { valid: false, errors: [], warnings: [] } },
        status: 'pending',
        progress: 0,
        subscriptionCheck: { allowed: true, currentCount: 0, maxAllowed: 4 },
        scrapingJobId: null,
        scrapedData: null,
        manualData: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: defaultState });
    }

    const property = await db.airBProperty.findFirst({
      where: { id: propertyId, tenantId },
      include: { _count: { select: { conversations: true, regionalKnowledge: true } } },
    });

    if (!property) {
      return NextResponse.json({ success: false, error: 'Propriedade não encontrada' }, { status: 404 });
    }

    const status: OnboardingStatus = (property.status as OnboardingStatus) || 'active';
    const currentStep = determineCurrentStep(property);
    const completedSteps = determineCompletedSteps(property);
    const progress = calculateOnboardingProgress(completedSteps);

    const latestScrapeJob = await db.airBScrapingJob.findFirst({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
    });

    const state: OnboardingWizardState = {
      propertyId: property.id,
      currentStep,
      completedSteps,
      stepValidations: {},
      status,
      progress,
      subscriptionCheck: { allowed: true, currentCount: 0, maxAllowed: 4 },
      scrapingJobId: latestScrapeJob?.id || null,
      scrapedData: latestScrapeJob?.result ? JSON.parse(latestScrapeJob.result as string) : null,
      manualData: null,
      createdAt: property.createdAt.toISOString(),
      updatedAt: property.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    console.error('[ONBOARDING] Error fetching state:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar estado do onboarding' }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════════════
// POST /api/ddc/airb/onboarding — Create/update onboarding state
// Body: { action: 'advance_step' | 'save_manual_data' | 'activate', propertyId, step?, data? }
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const dbAvailable = await isDatabaseAvailable();
    const body = await request.json();
    const { action, propertyId, step, data } = body;

    if (!action || !propertyId) {
      return NextResponse.json({ success: false, error: 'action e propertyId são obrigatórios' }, { status: 400 });
    }

    const entitlement = await checkEntitlement(tenantId, 'CREATE_PROPERTY');
    if (!entitlement.allowed) {
      return NextResponse.json({
        success: false,
        error: `Limite atingido: ${entitlement.reason}`,
        data: { currentCount: entitlement.currentCount, maxAllowed: entitlement.maxAllowed },
      }, { status: 403 });
    }

    if (!dbAvailable) {
      return NextResponse.json({
        success: true,
        data: { propertyId, step: step || 'url_entry', status: 'pending', message: 'Demo mode — alterações não persistidas' },
      });
    }

    switch (action) {
      case 'advance_step': {
        if (!step) {
          return NextResponse.json({ success: false, error: 'step é obrigatório para advance_step' }, { status: 400 });
        }

        const nextStep = getNextOnboardingStep(step as OnboardingStep);
        const statusMap: Record<string, OnboardingStatus> = {
          url_entry: 'in_progress',
          scraping: 'scraping',
          review_auto: 'reviewing',
          customize_manual: 'customizing',
          subscription_check: 'activating',
          activate: 'active',
        };

        const newStatus = statusMap[step] || 'in_progress';
        await db.airBProperty.update({
          where: { id: propertyId },
          data: { status: step === 'activate' ? 'active' : newStatus },
        });

        return NextResponse.json({
          success: true,
          data: { propertyId, previousStep: step, currentStep: nextStep, status: newStatus },
        });
      }

      case 'save_manual_data': {
        if (!data) {
          return NextResponse.json({ success: false, error: 'data é obrigatório para save_manual_data' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (data.wifiName !== undefined) updateData.wifiName = data.wifiName;
        if (data.wifiPassword !== undefined) updateData.wifiPassword = data.wifiPassword;
        if (data.lockProvider !== undefined) updateData.lockProvider = data.lockProvider;
        if (data.lockCode !== undefined) updateData.lockCode = data.lockCode;
        if (data.hostKnowledge !== undefined) updateData.hostKnowledge = data.hostKnowledge;
        if (data.neighborhoodTips !== undefined) updateData.neighborhoodTips = data.neighborhoodTips;
        if (data.emergencyContacts !== undefined) updateData.emergencyContacts = data.emergencyContacts;
        if (data.checkinInstructions !== undefined) updateData.checkinInstructions = data.checkinInstructions;
        if (data.houseRules !== undefined) updateData.houseRules = data.houseRules;
        if (data.pixKey !== undefined) updateData.pixKey = data.pixKey;

        await db.airBProperty.update({
          where: { id: propertyId },
          data: updateData,
        });

        return NextResponse.json({
          success: true,
          data: { propertyId, updatedFields: Object.keys(updateData) },
        });
      }

      case 'activate': {
        const property = await db.airBProperty.findFirst({
          where: { id: propertyId, tenantId },
        });

        if (!property) {
          return NextResponse.json({ success: false, error: 'Propriedade não encontrada' }, { status: 404 });
        }

        const missingFields: string[] = [];
        if (!property.wifiName) missingFields.push('wifiName');
        if (!property.lockCode) missingFields.push('lockCode');
        if (!property.hostKnowledge || (Array.isArray(property.hostKnowledge) && property.hostKnowledge.length === 0)) {
          missingFields.push('hostKnowledge');
        }

        if (missingFields.length > 0) {
          return NextResponse.json({
            success: false,
            error: `Campos obrigatórios pendentes: ${missingFields.join(', ')}`,
            data: { missingFields },
          }, { status: 400 });
        }

        await db.airBProperty.update({
          where: { id: propertyId },
          data: { status: 'active' },
        });

        return NextResponse.json({
          success: true,
          data: { propertyId, status: 'active', message: 'Propriedade ativada com sucesso! O Zélla AirB já pode atender hóspedes.' },
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Ação desconhecida: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[ONBOARDING] Error updating state:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar estado do onboarding' }, { status: 500 });
  }
}

// ── Helpers ──────────────────────────────────────────────────

function determineCurrentStep(property: Record<string, unknown>): OnboardingStep {
  if (property.status === 'active') return 'activate';
  if (!property.wifiName && !property.lockCode) return 'customize_manual';
  if (!property.name) return 'review_auto';
  return 'customize_manual';
}

function determineCompletedSteps(property: Record<string, unknown>): Record<OnboardingStep, string | null> {
  const completed: Record<OnboardingStep, string | null> = {
    url_entry: property.airbnbUrl ? new Date().toISOString() : null,
    scraping: property.scrapedAt ? new Date(property.scrapedAt as string).toISOString() : null,
    review_auto: property.name ? new Date().toISOString() : null,
    customize_manual: (property.wifiName && property.lockCode) ? new Date().toISOString() : null,
    subscription_check: null,
    activate: property.status === 'active' ? new Date().toISOString() : null,
  };
  return completed;
}

function getNextOnboardingStep(current: OnboardingStep): OnboardingStep | null {
  const idx = ONBOARDING_STEP_ORDER.indexOf(current);
  if (idx === -1 || idx >= ONBOARDING_STEP_ORDER.length - 1) return null;
  return ONBOARDING_STEP_ORDER[idx + 1];
}
