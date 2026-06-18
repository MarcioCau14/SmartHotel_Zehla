import asyncio
import os
import sys

# Add backend dir to path
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator
from utils.exporter import export_to_excel

async def run_master_consolidation():
    orchestrator = Orchestrator(sandbox_mode=True)
    
    missions = [
        {"name": "Natura", "query": "Decisores de Marketing e Board da Natura", "domains": ["natura.com.br"]},
        {"name": "iFood", "query": "CMO e Diretores de Marketing da iFood", "domains": ["ifood.com.br"]},
        {"name": "CIMED", "query": "João Adibe, Karla Marques e CMOs da CIMED", "domains": ["cimed.com.br"]},
        {"name": "SUPER", "query": "Decisores da marca SUPER (Grupo Cimed)", "domains": ["super.com.br"]}
    ]
    
    all_candidates = []
    consolidated_context = Context(raw_query="MISSÃO CONSOLIDADA: Natura, iFood, CIMED, SUPER")
    
    print("\n" + "="*70)
    print("🚀 INICIANDO MASTER CONSOLIDATION: RELATÓRIO GERAL DE HOJE")
    print("OBJETIVO: Re-validar TODOS os contatos com a nova Skill Phone OSINT")
    print("="*70 + "\n")
    
    for mission in missions:
        print(f"\n📡 Executando Missão: {mission['name']}...")
        context = Context(
            raw_query=mission['query'],
            parameters=AgentParameters(
                target_titles=["CEO", "Presidente", "Vice-Presidente", "CMO", "Diretor de Marketing", "Head of Brand", "Chairman", "Board"],
                target_domains=mission['domains'],
                count_limit=5
            )
        )
        
        result = await orchestrator.run_sop(context)
        
        # Merge candidates and organizations
        all_candidates.extend(result.candidates)
        if result.organizations:
            consolidated_context.organizations.extend(result.organizations)
            
    consolidated_context.candidates = all_candidates
    
    print("\n" + "="*70)
    print(f"📊 CONSOLIDADO FINALIZADO: {len(all_candidates)} Leads Validados")
    print("="*70)
    
    # Exportar para um arquivo único
    filename = "CONSOLIDADO_MISSOES_HOJE.xlsx"
    path = export_to_excel(consolidated_context, filename=filename)
    
    print(f"\n📂 ARQUIVO MESTRE GERADO: {filename}")
    print(f"📍 LOCALIZAÇÃO: {path}")
    print("="*70 + "\n")

if __name__ == "__main__":
    asyncio.run(run_master_consolidation())
