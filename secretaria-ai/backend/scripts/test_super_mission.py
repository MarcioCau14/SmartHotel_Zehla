import asyncio
import os
import sys

# Add current dir to path (Backend Root)
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator

async def run_test():
    orchestrator = Orchestrator(sandbox_mode=True)
    
    # Contexto da Missão SUPER (Cimed)
    context = Context(
        raw_query="Encontrar decisores da nova marca SUPER da Cimed, extrair CNPJ, Endereço e Contatos Validados",
        parameters=AgentParameters(
            target_titles=["CEO", "Presidente", "Vice-Presidente", "CMO", "Head of Brand", "Marketing Manager"],
            target_domains=["super.com.br"], # Domain resolved via Org Skill
            count_limit=10
        )
    )
    
    print("\n" + "="*60)
    print("🚀 MISSÃO DEEP RESEARCH: MARCA SUPER (GRUPO CIMED)")
    print("OBJETIVO: Dados Corporativos (CNPJ/Endereço) + Contatos de Elite")
    print("="*60 + "\n")
    
    # Executa o SOP Completo
    result_context = await orchestrator.run_sop(context)
    
    print("\n" + "="*60)
    print("✅ MISSÃO SUPER FINALIZADA COM SUCESSO")
    print("="*60)
    
    if result_context.organizations:
        org = result_context.organizations[0]
        print(f"\n🏢 DADOS CORPORATIVOS ENCONTRADOS:")
        print(f"   - Nome: {org.name}")
        print(f"   - CNPJ: {org.cnpj}")
        print(f"   - Endereço: {org.address}")
        print(f"   - Indústria: {org.industry}")

    print(f"\n👤 RESUMO DOS DECISORES ({len(result_context.candidates)}):")
    for i, c in enumerate(result_context.candidates):
        status_icon = "🛡️" if c.validation_score > 0.8 else "⏳"
        print(f"\n[{i+1}] {status_icon} {c.name}")
        print(f"    - Cargo: {c.title}")
        print(f"    - E-mail: {c.email} (Verificado: {c.email_validated})")
        print(f"    - WhatsApp: {c.metadata.get('whatsapp')}")
        print(f"    - OSINT Score: {int(c.validation_score * 100)}%")

    print("\n" + "-"*60)
    print(f"📂 ARQUIVO DE ENTREGA GERADO: PROSPECCAO_SUPER_COM_BR.xlsx")
    print(f"📍 LOCALIZAÇÃO: /Users/marciocau/Downloads/PROSPECCAO_SUPER_COM_BR.xlsx")
    print("-"*60 + "\n")

if __name__ == "__main__":
    asyncio.run(run_test())
