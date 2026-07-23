// ==============================================================================
// ZÉLLA — Tenant Resolver by WhatsApp Phone (Multi-Tenant Isolation)
// ==============================================================================
// Ponto único de roteamento multi-tenant no webhook WhatsApp.
//
// CORREÇÃO CRÍTICA v2:
//  - Remove match por `contains` (causava colisão entre pousadas com números
//    sobrepostos, ex: 551198888 vs 5511988887777).
//  - Usa match exato em `whatsappPhoneNumber` (campo com @unique após migração).
//  - Normalização E.164 via phone-utils.ts (single source of truth).
//  - Fail-closed em produção: sem fallback para "primeiro tenant ativo".
// ==============================================================================

import { db } from '@/lib/db';
import { normalizeToE164 } from '@/lib/phone-utils';

export interface TenantLookupResult {
  found: boolean;
  tenantId: string | null;
  tenantName: string | null;
  tenantStatus: string | null;
  tenantPlan: string | null;
  niche: string | null;
  reason?: string;
}

/**
 * Resolve o tenant dono do número WhatsApp que RECEBEU a mensagem.
 *
 * Fluxo:
 *  1. Normaliza o número receptor para E.164
 *  2. Busca exata em Tenant.whatsappPhoneNumber (campo @unique após refatoração)
 *  3. Se falhar, tenta Tenant.whatsappBusinessId (WABA ID) — se fornecido
 *  4. Em produção: retorna null se não encontrar (fail-closed)
 *  5. Em dev/CI: fallback para primeiro tenant ativo (com log WARN)
 *
 * @param recipientPhone Número que recebeu a mensagem (display_phone_number da Meta)
 * @param wabaId WhatsApp Business Account ID (opcional, da Meta payload)
 */
export async function resolveTenantByPhone(
  recipientPhone: string,
  wabaId?: string
): Promise<TenantLookupResult> {
  if (!recipientPhone) {
    return emptyResult('MISSING_RECIPIENT_PHONE: Nenhum número receptor fornecido');
  }

  // ── 1. Normalização E.164 ──
  const normalized = normalizeToE164(recipientPhone);

  if (!normalized) {
    // Não é telefone válido → talvez seja WABA ID ou formato desconhecido
    console.warn('[resolveTenantByPhone] Número não normalizável:', recipientPhone);
    // Tenta como WABA ID se parece alfanumérico, senão falha
    if (wabaId) {
      return await lookupByWabaId(wabaId);
    }
    return emptyResult(`INVALID_PHONE_FORMAT: ${recipientPhone}`);
  }

  try {
    // ── 2. Match exato em whatsappPhoneNumber (com @unique) ──
    const tenant = await db.tenant.findFirst({
      where: { whatsappPhoneNumber: normalized },
      select: {
        id: true,
        name: true,
        status: true,
        plan: true,
        niche: true,
        whatsappPhoneNumber: true,
        whatsappBusinessId: true,
      },
    });

    if (tenant) {
      return {
        found: true,
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantStatus: tenant.status,
        tenantPlan: tenant.plan,
        niche: tenant.niche,
      };
    }

    // ── 3. Fallback por WABA ID, se fornecido ──
    if (wabaId) {
      const wabaResult = await lookupByWabaId(wabaId);
      if (wabaResult.found) return wabaResult;
    }

    // ── 4. Não encontrado ──
    if (process.env.NODE_ENV === 'production') {
      // Fail-closed em produção: nunca fallback para "primeiro tenant"
      console.warn('[resolveTenantByPhone] Tenant não encontrado em produção (fail-closed):', {
        normalized,
        wabaId,
      });
      return emptyResult(`TENANT_NOT_FOUND: ${normalized}`);
    }

    // ── 5. Dev/CI apenas: fallback para primeiro tenant ativo ──
    if (process.env.BYPASS_TENANT_LOOKUP === 'true') {
      console.warn('[resolveTenantByPhone] BYPASS_TENANT_LOOKUP=true — usando primeiro tenant ativo (DEV ONLY)');
      const firstTenant = await db.tenant.findFirst({
        where: { status: 'active' },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          status: true,
          plan: true,
          niche: true,
        },
      });

      if (firstTenant) {
        return {
          found: true,
          tenantId: firstTenant.id,
          tenantName: firstTenant.name,
          tenantStatus: firstTenant.status,
          tenantPlan: firstTenant.plan,
          niche: firstTenant.niche,
          reason: 'DEV_FALLBACK_FIRST_ACTIVE_TENANT',
        };
      }
    }

    return emptyResult(`TENANT_NOT_FOUND: ${normalized} (dev mode, sem BYPASS)`);
  } catch (error) {
    console.error('[resolveTenantByPhone] Erro de DB (fail-closed):', error);
    return emptyResult('DB_ERROR: Falha ao consultar tenant');
  }
}

/**
 * Lookup alternativo por WhatsApp Business Account ID (WABA).
 * Isolamento multi-tenant via WABA é mais robusto que número (não muda em portabilidade).
 */
async function lookupByWabaId(wabaId: string): Promise<TenantLookupResult> {
  if (!wabaId) return emptyResult('MISSING_WABA_ID');

  try {
    const tenant = await db.tenant.findFirst({
      where: { whatsappBusinessId: wabaId },
      select: {
        id: true,
        name: true,
        status: true,
        plan: true,
        niche: true,
      },
    });

    if (tenant) {
      return {
        found: true,
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantStatus: tenant.status,
        tenantPlan: tenant.plan,
        niche: tenant.niche,
      };
    }

    return emptyResult(`TENANT_NOT_FOUND_BY_WABA: ${wabaId}`);
  } catch (error) {
    console.error('[lookupByWabaId] DB error:', error);
    return emptyResult('DB_ERROR: Falha ao consultar WABA');
  }
}

function emptyResult(reason: string): TenantLookupResult {
  return {
    found: false,
    tenantId: null,
    tenantName: null,
    tenantStatus: null,
    tenantPlan: null,
    niche: null,
    reason,
  };
}

/**
 * Versão simplificada para callers que só precisam do tenantId.
 * Mantida para compatibilidade com código legado que fazia `await resolveTenantByPhone(phone)`.
 */
export async function resolveTenantIdByPhone(
  recipientPhone: string,
  wabaId?: string
): Promise<string | null> {
  const result = await resolveTenantByPhone(recipientPhone, wabaId);
  return result.tenantId;
}
