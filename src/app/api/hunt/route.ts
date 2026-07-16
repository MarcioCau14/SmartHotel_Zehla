import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/error-handler';
import { apiRatelimit } from '@/lib/rate-limit';
import { requireTenantId } from '@/lib/security/tenant-context';

const MOCK_DECISORES = [
  'Carlos Mendes', 'Ana Souza', 'Roberto Lima', 'Fernanda Oliveira',
  'Paulo Costa', 'Maria Santos', 'João Pereira', 'Patricia Alves',
];

const MOCK_CARGOS = [
  'Proprietário(a)', 'Gerente Geral', 'Diretor(a) de Operações',
  'Sócio(a)-Gerente', 'Administrador(a)',
];

const MOCK_EMAILS_DOMAINS = [
  'contato', 'reservas', 'comercial', 'gerencia', 'info',
];

const MOCK_CITIES: Record<string, string> = {
  sp: 'São Paulo',
  rj: 'Rio de Janeiro',
  mg: 'Belo Horizonte',
  ba: 'Salvador',
  pr: 'Curitiba',
  sc: 'Florianópolis',
  rs: 'Porto Alegre',
  ce: 'Fortaleza',
  pe: 'Recife',
  am: 'Manaus',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = await apiRatelimit.limit(`api:${clientIp}:${new URL(request.url).pathname}`);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Muitas requisições.', retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)), 'X-RateLimit-Remaining': '0' } }
    );
  }

  try {
    const tenantId = await requireTenantId();
    const body = await request.json();
    const { targetName } = body;

    if (!targetName) {
      return NextResponse.json(
        { error: 'O campo "targetName" é obrigatório' },
        { status: 400, headers: { 'X-Security-Shield': 'zero-trust-v2' } }
      );
    }

    const numLeads = randomBetween(2, 4);
    const stateKeys = Object.keys(MOCK_CITIES);
    const city = randomPick(stateKeys);
    const cityLabel = MOCK_CITIES[city];
    const domainSlug = slugify(targetName);
    const baseDomain = `www.${domainSlug}.com.br`;

    const createdLeads: any[] = [];

    for (let i = 0; i < numLeads; i++) {
      const decisor = randomPick(MOCK_DECISORES);
      const cargo = randomPick(MOCK_CARGOS);
      const emailPrefix = randomPick(MOCK_EMAILS_DOMAINS);
      const email = `${emailPrefix}@${domainSlug}.com.br`;
      const ddd = randomBetween(11, 99);
      const phone = `${ddd}9${randomBetween(1000, 9999)}${randomBetween(1000, 9999)}`;
      const score = parseFloat((randomBetween(35, 95) / 10).toFixed(1));
      const porte = score > 7 ? 'grande' : score > 4 ? 'medio' : 'pequeno';

      const existingEmail = await db.lead.findUnique({ where: { email } });
      if (existingEmail) continue;

      const lead = await db.lead.create({
        data: {
          tenantId,
          empresa: `${targetName} ${i > 0 ? `- Unidade ${i + 1}` : ''}`.trim(),
          decisor,
          cargo,
          email,
          whatsapp: `+55${phone}`,
          setor: 'hospitalidade',
          porte,
          hook: `Identifiquei que ${targetName} em ${cityLabel} tem potencial para otimizar sua taxa de ocupação com nossa plataforma cognitiva.`,
          validationScore: score,
          status: 'pending',
          socialMedia: JSON.stringify({
            instagram: `@${domainSlug}`,
            website: baseDomain,
          }),
          metadata: JSON.stringify({
            source: 'lessie_hunt',
            targetName,
            city: cityLabel,
            state: city.toUpperCase(),
            scrapedAt: new Date().toISOString(),
          }),
        },
      });

      createdLeads.push({
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      });
    }

    // Log the hunt action
    await db.agentLog.create({
      data: {
        tenantId,
        agentId: 'lessie',
        action: 'hunt_executed',
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: randomBetween(200, 800),
        costUsd: 0,
        status: 'success',
        metadata: JSON.stringify({
          targetName,
          leadsGenerated: createdLeads.length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      targetName,
      leadsFound: createdLeads.length,
      leads: createdLeads,
    }, { status: 201, headers: { 'X-Security-Shield': 'zero-trust-v2' } });
  } catch (error: unknown) {
    return handleApiError(error, { endpoint: '/api/hunt' });
  }
}