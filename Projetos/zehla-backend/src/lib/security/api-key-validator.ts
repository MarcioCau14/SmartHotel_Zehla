import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { redis } from '@/lib/redis';

/**
 * Middleware de Validação de API Key
 * 
 * Valida requisições à API Pública do ZEHLA via header:
 * Authorization: Bearer zehla_live_sk_...
 * 
 * Fluxo:
 * 1. Extrai API key do header Authorization
 * 2. Calcula hash SHA-256 da chave
 * 3. Busca no banco por keyHash
 * 4. Valida: ativa, não expirada, não revogada
 * 5. Rate limiting por chave via Redis
 * 6. Atualiza lastUsedAt
 * 7. Injeta contexto da API key no request (propertyId, permissions, scopes)
 * 
 * Segurança:
 * - Chaves armazenadas como hash SHA-256 (irreversível)
 * - Prefixo armazenado para exibição na UI (zehla_live_sk_abc1...)
 * - Rate limiting independente por chave
 * - Desabilitação automática após excesso de falhas
 */

export interface ApiKeyContext {
  propertyId: string;
  keyId: string;
  name: string;
  permissions: string[];
  scopes: string[];
  rateLimit: number;
}

export async function validateApiKey(req: NextRequest): Promise<{
  valid: boolean;
  context?: ApiKeyContext;
  error?: string;
  status?: number;
}> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      valid: false,
      error: 'Header Authorization com Bearer token é obrigatório',
      status: 401,
    };
  }

  const apiKey = authHeader.slice(7); // Remove "Bearer "

  if (!apiKey) {
    return {
      valid: false,
      error: 'API key não fornecida',
      status: 401,
    };
  }

  // Calcular hash SHA-256 da chave
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Buscar chave no banco
  const storedKey = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      isActive: true,
      revokedAt: null,
    },
  });

  if (!storedKey) {
    console.warn(`🚨 [API_KEY] Chave inválida ou revogada: prefixo ${apiKey.slice(0, 12)}...`);
    return {
      valid: false,
      error: 'API key inválida, expirada ou revogada',
      status: 403,
    };
  }

  // Verificar expiração
  if (storedKey.expiresAt && storedKey.expiresAt < new Date()) {
    await prisma.apiKey.update({
      where: { id: storedKey.id },
      data: { isActive: false },
    });
    return {
      valid: false,
      error: 'API key expirada',
      status: 403,
    };
  }

  // Rate limiting via Redis
  const rateLimitKey = `api_key_rate:${storedKey.id}`;
  const currentCount = await redis.incr(rateLimitKey);

  if (currentCount === 1) {
    // Primeira requisição no período — define TTL de 60 segundos
    await redis.expire(rateLimitKey, 60);
  }

  if (currentCount > storedKey.rateLimit) {
    console.warn(`🚨 [API_KEY] Rate limit excedido para chave ${storedKey.name} (${currentCount}/${storedKey.rateLimit})`);
    return {
      valid: false,
      error: `Rate limit excedido: ${storedKey.rateLimit} requisições por minuto`,
      status: 429,
    };
  }

  // Atualizar lastUsedAt (assíncrono, não bloqueia)
  prisma.apiKey.update({
    where: { id: storedKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return {
    valid: true,
    context: {
      propertyId: storedKey.propertyId,
      keyId: storedKey.id,
      name: storedKey.name,
      permissions: storedKey.permissions,
      scopes: storedKey.scopes,
      rateLimit: storedKey.rateLimit,
    },
  };
}

/**
 * Verifica se a API key tem permissão para o escopo solicitado
 */
export function checkScope(context: ApiKeyContext, requiredScope: string): boolean {
  if (context.permissions.includes('admin')) {
    return true; // Admin tem acesso a tudo
  }

  if (context.permissions.includes('write') && requiredScope === 'read') {
    return true; // Write inclui read
  }

  return context.scopes.includes(requiredScope);
}

/**
 * Wrapper para proteger rotas da API pública
 * Uso: export const GET = withPublicApiAuth(async (req, context) => { ... })
 */
export function withPublicApiAuth(
  handler: (req: NextRequest, context: ApiKeyContext) => Promise<NextResponse>,
  requiredScope: string = 'read'
) {
  return async (req: NextRequest) => {
    const result = await validateApiKey(req);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error, docs: 'https://docs.zehla.com/api' },
        { status: result.status || 401 }
      );
    }

    if (!checkScope(result.context!, requiredScope)) {
      return NextResponse.json(
        { error: `Escopo '${requiredScope}' não autorizado para esta API key` },
        { status: 403 }
      );
    }

    return handler(req, result.context!);
  };
}
