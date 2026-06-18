import asyncio
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.join(os.getcwd(), 'LESSIE_AI'))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator

async def main():
    # 1. Configuration as per User Request
    target_query = "Identify, validate, and evaluate 20 Engineering Managers at Stripe"
    
    context = Context(
        raw_query=target_query,
        parameters=AgentParameters(
            target_titles=["Engineering Manager"],
            target_domains=["stripe.com"], # We provide the likely domain for Step 1 validation
            count_limit=20
        )
    )

    # 2. Initialize Orchestrator (Sandbox Mode)
    orchestrator = Orchestrator(sandbox_mode=True)

    # 3. Run the SOP Full Test
    print("🚀 INICIANDO TESTE DE PONTA A PONTA (SOP FULL)...")
    final_context = await orchestrator.run_sop(context)

    # 4. Final Verification
    print("\n" + "="*50)
    print("📋 RESUMO DA EXECUÇÃO")
    print("="*50)
    print(f"Status Final: {final_context.current_state}")
    print(f"Candidatos Encontrados: {len(final_context.candidates)}")
    
    print("\n🔍 LOGS DE TRANSIÇÃO DE ESTADO:")
    for entry in final_context.history:
        print(f"  [STATE LOG] {entry}")

    if final_context.candidates:
        print("\n🏆 EVIDÊNCIA DO MOTOR CGV (Exemplo):")
        sample = final_context.candidates[0]
        print(f"Nome: {sample.name}")
        print(f"Scores: R:{sample.relevance_score:.2f} | E:{sample.engagement_score:.2f} | C:{sample.commercial_fit_score:.2f}")
        print("-" * 30)
        print(sample.match_explanation)
        print("-" * 30)

    if final_context.errors:
        print("\n❌ ERROS ENCONTRADOS:")
        for err in final_context.errors:
            print(f"  [ERROR] {err}")

if __name__ == "__main__":
    asyncio.run(main())
