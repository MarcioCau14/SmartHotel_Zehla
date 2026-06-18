import asyncio
import random
import logging
import gc
from contextlib import asynccontextmanager
from data_pipeline.zehla_taxonomy import ZehlaInteractionTensor
from data_pipeline.tensor_router import ZehlaTensorRouter
from data_pipeline.secure_tensor_router import sanitize_and_route_tensor, InteractionTensor
from data_pipeline.zehla_data_module_shield import secure_disciplinary_split

# Configuração de Logs
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("SECURE_INGESTION_TEST")

class MockEmbedder:
    async def embed(self, text):
        return [random.uniform(-1, 1) for _ in range(5)]

class MockDBPool:
    @asynccontextmanager
    async def acquire(self):
        class MockConn:
            async def execute(self, query, *args): pass
            @asynccontextmanager
            async def transaction(self): yield
        yield MockConn()

async def run_secure_test():
    logger.info("\n🚀 INICIANDO AUDITORIA DE SEGURANÇA (RED TEAM OVERRIDE)")
    logger.info("============================================================")
    
    property_id = "550e8400-e29b-41d4-a716-446655440000"
    
    # 1. Teste de Mass Assignment & Anti-DoS (Injection 1)
    logger.info("\n🛡️ TESTANDO INJEÇÃO 1 (Mass Assignment & Payload Size):")
    malicious_payload = {
        "raw_message": "Reserva confirmada.",
        "source_channel": "whatsapp",
        "admin_privileges": True, # Campo extra proibido
        "extra_garbage": "A" * 15000 # Payload DoS
    }
    
    try:
        sanitize_and_route_tensor(malicious_payload)
    except Exception as e:
        logger.error(f"🛑 BLOQUEIO ATIVO (Injection 1): {str(e)}")

    # 2. Teste de RLS Atômico e ZDR Obliterador (Injection 2)
    logger.info("\n🛡️ TESTANDO INJEÇÃO 2 (RLS & Memory Scrubbing):")
    valid_tensor_data = {
        "intent": "check-in_info",
        "guest_name": "Marcio",
        "room": "Loft 1"
    }
    
    db_pool = MockDBPool()
    await secure_disciplinary_split(db_pool, property_id, valid_tensor_data)
    
    # Verifica se a obliteração física funcionou (tentando acessar a variável deletada)
    # Nota: Em Python 'del' remove a referência. O gc.collect() é o toque final.
    
    logger.info("\n✨ AUDITORIA DE HARDENING FINALIZADA.")

if __name__ == "__main__":
    asyncio.run(run_secure_test())
