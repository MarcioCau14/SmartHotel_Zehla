import asyncio
import logging
from brain.zehla_core import run_zehla_core

# Configuração de Logs
logging.basicConfig(level=logging.INFO)

async def test_tool_intelligence():
    print("\n🔍 [TESTE] VALIDANDO INTEGRAÇÃO DE FERRAMENTAS DETERMINÍSTICAS")
    print("============================================================")
    
    # Caso 1: Consulta de Preço (Deve invocar Consultar_Preco_Dinamico)
    print("\nDEMANDA: 'Quanto custa um Loft para o próximo final de semana (10 a 12 de Abril)?'")
    await run_zehla_core("Quanto custa um Loft para o próximo final de semana (10 a 12 de Abril)?")
    
    # Caso 2: Verificação de Estoque (Deve invocar Verificar_Estoque_Operacional)
    print("\nDEMANDA: 'Verifique se temos 20 toalhas extras no estoque para a limpeza de amanhã.'")
    await run_zehla_core("Verifique se temos 20 toalhas extras no estoque para a limpeza de amanhã.")

if __name__ == "__main__":
    asyncio.run(test_tool_intelligence())
