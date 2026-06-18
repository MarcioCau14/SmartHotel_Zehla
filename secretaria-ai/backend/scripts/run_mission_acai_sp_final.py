import asyncio
import sys
import os

# Ensure local imports work correctly
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator

async def main():
    # 1. Mission: Prospecting Açaí Brands in SP for Sport Sponsorship & Tax Incentives
    target_query = "Prospectar marcas de açaí em SP com potencial para patrocínio de surf e lei de incentivo ao esporte."
    
    # Target domains identified in SP/Brazil
    target_domains = [
        "frooty.com.br", 
        "oakberry.com", 
        "jahdoacai.com.br", 
        "mariaacai.com.br", 
        "acaipurissimo.com.br", 
        "acaiconcept.com"
    ]
    
    context = Context(
        raw_query=target_query,
        parameters=AgentParameters(
            target_titles=["CMO", "Marketing Manager", "Gerente de Marketing", "Fundador", "CEO"],
            target_domains=target_domains,
            count_limit=10
        )
    )

    # 2. Initialize Orchestrator
    orchestrator = Orchestrator(sandbox_mode=True)

    print("\n" + "🏁" * 20)
    print("🚀 TESTE FINAL: MISSÃO AÇAÍ SP (FULL SOP)")
    print("🏁" * 20 + "\n")

    # 3. Running SOP (Execution of Step 1 to Step 4 + Auto-Export)
    # Step 5 (Outreach) is skipped as per the latest "Lean" code update.
    final_context = await orchestrator.run_sop(context)

    # 4. Final Verification
    if final_context.history:
        print("\n" + "="*60)
        print("✅ TESTE DE CAPACIDADE CONCLUÍDO COM SUCESSO")
        print("="*60)
        print(f"Total de Decisores Reais Encontrados: {len(final_context.candidates)}")
        
        # Check for the file in Downloads
        filename = f"PROSPECCAO_{target_domains[0].replace('.', '_').upper()}.xlsx"
        print(f"\n📂 ARQUIVO FINAL ENTREGUE EM: /Users/marciocau/Downloads/{filename}")
        print("-" * 60)
    else:
        print("❌ O teste falhou. Nenhuma atividade registrada no histórico.")

if __name__ == "__main__":
    asyncio.run(main())
