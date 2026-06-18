import asyncio
import sys
import os

# Ensure local imports work correctly from the project root
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator

async def main():
    # 1. Mission: Reach Oakberry Marketing decision makers
    target_query = "Identificar e gerar contatos de marketing da Oakberry para patrocínio de surf professional"
    
    context = Context(
        raw_query=target_query,
        parameters=AgentParameters(
            target_titles=["Global Head of Marketing", "Marketing Manager", "Sponsorship Lead"],
            target_domains=["oakberry.com"],
            count_limit=5
        )
    )

    # 2. Initialize Orchestrator
    orchestrator = Orchestrator(sandbox_mode=True)

    print("\n" + "🍓" * 20)
    print("🚀 MISSÃO OAKBERRY: EXPORTAÇÃO AUTOMATIZADA ATIVADA")
    print("🍓" * 20 + "\n")

    # 3. Running SOP (Steps 1 to 5 + Auto Export)
    final_context = await orchestrator.run_sop(context)

    # 4. Success Check
    if final_context.candidates:
        print("\n" + "="*60)
        print("✅ MISSÃO CONCLUÍDA")
        print("="*60)
        print(f"Líderes Encontrados: {len(final_context.candidates)}")
        print(f"Os dados agora estão salvos automaticamente na pasta outbox.")
        
        # Look for the last generated file in outbox
        outbox_files = sorted([f for f in os.listdir("LESSIE_AI/outbox") if f.endswith(".xlsx")])
        if outbox_files:
            last_file = outbox_files[-1]
            print(f"\n📂 ARQUIVO GERADO: LESSIE_AI/outbox/{last_file}")
            print("-" * 60)
    else:
        print("❌ Nenhum dado encontrado.")

if __name__ == "__main__":
    asyncio.run(main())
