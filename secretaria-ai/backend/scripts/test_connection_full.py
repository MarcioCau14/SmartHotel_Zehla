import asyncio
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.join(os.getcwd(), 'LESSIE_AI'))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator

async def main():
    # 1. Configuration: Candidate 1 (Engineering Manager @ Stripe)
    target_query = "Identify and connect with 1 Engineering Manager at Stripe"
    
    context = Context(
        raw_query=target_query,
        parameters=AgentParameters(
            target_titles=["Engineering Manager"],
            target_domains=["stripe.com"],
            count_limit=1
        )
    )

    # 2. Initialize Orchestrator
    orchestrator = Orchestrator(sandbox_mode=True)

    # 3. Run the FULL SOP (5 Steps)
    print("🚀 INICIANDO TESTE DE INTEGRAÇÃO DO AGENTE DE CONEXÃO...")
    final_context = await orchestrator.run_sop(context)

    # 4. Final Display
    print("\n" + "="*60)
    print("💌 RASCUNHO DE E-MAIL GERADO (OUTBOX)")
    print("="*60)
    
    if final_context.candidates:
        candidate = final_context.candidates[0]
        draft = candidate.metadata.get("outreach_draft", "Nenhum rascunho gerado.")
        print(draft)
        
        print("\n" + "-"*60)
        print(f"✅ Rascunho salvo em: LESSIE_AI/outbox/{candidate.name.replace(' ', '_').lower()}_draft.txt")
        print("-" * 60)
    else:
        print("❌ Nenhum candidato encontrado para gerar o rascunho.")

if __name__ == "__main__":
    asyncio.run(main())
