import asyncio
import sys
import os

# Ensure local imports work correctly
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator

async def main():
    # 1. Mission: Reach Vans Brasil Marketing decision makers
    target_query = "Identificar e gerar contatos de marketing da Vans Brasil para patrocínio de surf professional"
    
    context = Context(
        raw_query=target_query,
        parameters=AgentParameters(
            target_titles=["Brand Director", "Head of Marketing", "Marketing Manager"],
            target_domains=["vans.com.br"],
            count_limit=5
        )
    )

    # 2. Initialize Orchestrator
    orchestrator = Orchestrator(sandbox_mode=True)

    print("\n" + "🛹" * 20)
    print("🚀 MISSÃO VANS BRASIL: DADOS REAIS ATIVADOS")
    print("🛹" * 20 + "\n")

    # 3. Running SOP (Execution of Step 1 to Step 4 + Auto-Export)
    final_context = await orchestrator.run_sop(context)

    # 4. Final Status
    if final_context.candidates:
        print("\n" + "="*60)
        print("✅ MISSÃO VANS CONCLUÍDA")
        print("="*60)
        print(f"Líderes Encontrados: {len(final_context.candidates)}")
        
        filename = f"PROSPECCAO_VANS_COM_BR.xlsx"
        print(f"\n📂 ARQUIVO FINAL ENTREGUE EM: /Users/marciocau/Downloads/{filename}")
        print("-" * 60)

if __name__ == "__main__":
    asyncio.run(main())
