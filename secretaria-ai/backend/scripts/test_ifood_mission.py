import asyncio
import os
import sys

# Add current dir to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator

async def run_test():
    orchestrator = Orchestrator(sandbox_mode=True)
    
    # Contexto da Missão iFood
    context = Context(
        raw_query="Encontrar CMO e Diretores de Marketing da iFood para parceria",
        parameters=AgentParameters(
            target_titles=["CMO", "Chief Marketing Officer", "Marketing Director", "Diretora de Marketing"],
            target_domains=["ifood.com.br"],
            count_limit=5
        )
    )
    
    print("\n" + "="*60)
    print("🚀 INICIANDO MISSÃO ESTRATÉGICA: iFOOD")
    print("OBJETIVO: Identificar decisores de Marketing com contatos VALIDADOS")
    print("="*60 + "\n")
    
    # Executa o SOP Completo (incluindo o novo passo de OSINT)
    result_context = await orchestrator.run_sop(context)
    
    print("\n" + "="*60)
    print("✅ MISSÃO iFOOD FINALIZADA COM SUCESSO")
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
    print(f"📂 ARQUIVO DE ENTREGA GERADO: PROSPECCAO_IFOOD_COM_BR.xlsx")
    print(f"📍 LOCALIZAÇÃO: /Users/marciocau/Downloads/PROSPECCAO_IFOOD_COM_BR.xlsx")
    print("-"*60 + "\n")

if __name__ == "__main__":
    asyncio.run(run_test())
