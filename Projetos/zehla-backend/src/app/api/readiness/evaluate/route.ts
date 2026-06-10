import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity } from '@/lib/server/with-api-security';
import { authenticateRequest } from '@/infrastructure/http/auth/jwtAuth';
import { PrismaCRMRepository } from '@/infrastructure/persistence/crm/PrismaCRMRepository';
import { EvaluateReadinessUseCase } from '@/application/readiness/use-cases/EvaluateReadinessUseCase';

async function _POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth.isFail) {
      return NextResponse.json({ error: auth.error.message }, { status: 401 });
    }

    const propertyId = auth.value.pousadaId;
    if (!propertyId) {
      return NextResponse.json({ error: 'ID da pousada inválido no token de autenticação' }, { status: 400 });
    }

    const body = await req.json();
    const { answers, roiInput } = body;

    if (!answers || !roiInput) {
      return NextResponse.json({ error: 'answers e roiInput são obrigatórios' }, { status: 400 });
    }

    const repo = new PrismaCRMRepository();
    const useCase = new EvaluateReadinessUseCase(repo);

    const result = await useCase.execute({
      propertyId,
      answers,
      roiInput,
    });

    if (result.isFail) {
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const POST = withApiSecurity(_POST, { rateLimit: { limit: 30, windowSeconds: 60 } });
