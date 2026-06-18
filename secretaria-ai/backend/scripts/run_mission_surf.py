import asyncio
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.join(os.getcwd(), 'LESSIE_AI'))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator

async def main():
    # 1. Mission Parameters (User Request: Surf Sponsorship + Tax Incentives)
    target_query = "Encontrar CMOs de empresas de médio/grande porte em SP para patrocínio de surf via Lei de Incentivo ao Esporte e PIE-SP"
    
    context = Context(
        raw_query=target_query,
        parameters=AgentParameters(
            target_titles=["CMO", "Diretor de Marketing", "Head of Sponsorship"],
            target_domains=["natura.com.br", "maispura.com.br", "probiotica.com.br"], # Mocking targets for the sectors
            count_limit=5
        )
    )

    # 2. Initialize Orchestrator
    # We use Sandbox Mode to simulate the full ecosystem capabilities
    orchestrator = Orchestrator(sandbox_mode=True)

    print("\n" + "🏄" * 20)
    print("🚀 INICIANDO MISSÃO: PATROCÍNIO SURF & INCENTIVO FISCAL")
    print("🏄" * 20 + "\n")

    # 3. Execute SOP Full
    final_context = await orchestrator.run_sop(context)

    # 4. Mission Report
    print("\n" + "="*60)
    print("📋 RELATÓRIO DA MISSÃO")
    print("="*60)
    print(f"Status Final: {final_context.current_state}")
    print(f"Empresas Alvos: {len(final_context.organizations)}")
    print(f"Contatos Auditados (CGV): {len(final_context.candidates)}")
    
    if final_context.candidates:
        print("\n🏆 LEAD QUALIFICADO (Exemplo):")
        lead = final_context.candidates[0]
        print(f"Nome: {lead.name}")
        print(f"Cargo: {lead.title}")
        print(f"Email: {lead.email} | Social: {lead.social_links.get('linkedin')}")
        
        print("\n📈 AUDITORIA CGV (Match Explanation):")
        print("-" * 40)
        print(lead.match_explanation)
        print("-" * 40)

        print("\n📩 PROPÓSITA DE ABORDAGEM PERSONALIZADA (Draft):")
        print("-" * 40)
        # Display the drafted email from metadata
        print(lead.metadata.get("outreach_draft", "Nenhum rascunho gerado."))
        print("-" * 40)

    print("\n✅ Missão concluída. Todos os rascunhos foram salvos em 'LESSIE_AI/outbox/'.")

if __name__ == "__main__":
    asyncio.run(main())
