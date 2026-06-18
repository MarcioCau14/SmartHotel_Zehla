import asyncio
import os
import sys

# Add current dir to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator

async def run_test():
    orchestrator = Orchestrator(sandbox_mode=True)
    
    # Contexto da Missão CIMED
    context = Context(
        raw_query="Encontrar João Adibe, Karla Marques e diretoria de Marketing da CIMED com contatos validados",
        parameters=AgentParameters(
            target_titles=["Presidente", "CEO", "Vice-Presidente", "CMO", "Marketing Director", "Diretor de Marketing", "Diretora de Marketing"],
            target_domains=["cimed.com.br"],
            count_limit=10
        )
    )
    
    print("\n" + "="*60)
    print("🚀 INICIANDO MISSÃO ESTRATÉGICA: GRUPO CIMED")
    print("OBJETIVO: Identificar C-Level e Marketing com contatos VALIDADOS")
    print("="*60 + "\n")
    
    # Executa o SOP Completo
    result_context = await orchestrator.run_sop(context)
    
    print("\n" + "="*60)
    print("✅ MISSÃO CIMED FINALIZADA COM SUCESSO")
    print("="*60)
    
    print(f"\nRESUMO DOS LEADS ENCONTRADOS ({len(result_context.candidates)}):")
    for i, c in enumerate(result_context.candidates):
        status_icon = "🛡️" if c.validation_score > 0.8 else "⏳"
        print(f"\n[{i+1}] {status_icon} {c.name}")
        print(f"    - Cargo: {c.title}")
        print(f"    - E-mail: {c.email} (Verificado: {c.email_validated})")
        print(f"    - WhatsApp: {c.metadata.get('whatsapp')}")
        print(f"    - OSINT Score: {int(c.validation_score * 100)}%")
        print(f"    - LinkedIn: {c.social_footprint.get('linkedin')}")
        print(f"    - Notas OSINT: {c.social_footprint.get('resolution_notes')}")

    print("\n" + "-"*60)
    print(f"📂 ARQUIVO DE ENTREGA GERADO: PROSPECCAO_CIMED_COM_BR.xlsx")
    print(f"📍 LOCALIZAÇÃO: /Users/marciocau/Downloads/PROSPECCAO_CIMED_COM_BR.xlsx")
    print("-"*60 + "\n")

if __name__ == "__main__":
    asyncio.run(run_test())
