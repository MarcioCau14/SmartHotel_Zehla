# -*- coding: utf-8 -*-
import asyncio
import unittest
from fastapi import HTTPException
from backend.core.security.budget_circuit_breaker import enforce_budget_and_rls

# Mock da Conexão e Transação de Banco de Dados PostgreSQL
class MockTransaction:
    def __init__(self, conn):
        self.conn = conn

    async def __aenter__(self):
        # Entra na transação e adquire o lock para simular "FOR UPDATE"
        await self.conn.pool.acquire_row_lock(self.conn.current_property_id)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # Libera o lock ao sair da transação
        self.conn.pool.release_row_lock(self.conn.current_property_id)

class MockConnection:
    def __init__(self, pool):
        self.pool = pool
        self.current_property_id = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

    def transaction(self):
        return MockTransaction(self)

    async def execute(self, query, *args):
        if "SET LOCAL app.current_property_id" in query:
            self.current_property_id = args[0]
        elif "UPDATE tenant_budgets" in query:
            cost, prop_id = args
            self.pool.db_data[prop_id]["daily_spend"] += cost

    async def fetchrow(self, query, *args):
        prop_id = args[0]
        # Simula atraso na consulta para expor condições de corrida caso o lock não funcione
        await asyncio.sleep(0.01)
        data = self.pool.db_data.get(prop_id)
        if data:
            return {"daily_spend": data["daily_spend"], "daily_limit": data["daily_limit"]}
        return None

class MockDBPool:
    def __init__(self, db_data):
        self.db_data = db_data
        self.row_locks = {prop_id: asyncio.Lock() for prop_id in db_data.keys()}

    def acquire(self):
        return MockConnection(self)

    async def acquire_row_lock(self, prop_id):
        if prop_id in self.row_locks:
            await self.row_locks[prop_id].acquire()

    def release_row_lock(self, prop_id):
        if prop_id in self.row_locks and self.row_locks[prop_id].locked():
            self.row_locks[prop_id].release()

# ==================== SUITE DE TESTES ====================

class TestBudgetCircuitBreaker(unittest.IsolatedAsyncioTestCase):
    async def test_budget_circuit_breaker_success(self):
        """Testa que uma verificação de budget válida reduz o saldo diário corretamente."""
        db_data = {
            "pousada_1": {"daily_spend": 0.0, "daily_limit": 50.0}
        }
        pool = MockDBPool(db_data)
        
        async with enforce_budget_and_rls(pool, "pousada_1", 10.0):
            # A transação foi executada
            pass
            
        self.assertEqual(db_data["pousada_1"]["daily_spend"], 10.0)

    async def test_budget_circuit_breaker_exhausted(self):
        """Testa que ultrapassar o limite diário causa a suspensão imediata com HTTP 429."""
        db_data = {
            "pousada_1": {"daily_spend": 45.0, "daily_limit": 50.0}
        }
        pool = MockDBPool(db_data)
        
        with self.assertRaises(HTTPException) as context:
            async with enforce_budget_and_rls(pool, "pousada_1", 10.0):
                pass
                
        self.assertEqual(context.exception.status_code, 429)
        self.assertEqual(context.exception.detail, "AI Budget Exhausted.")
        # O saldo gasto não deve ter sido incrementado
        self.assertEqual(db_data["pousada_1"]["daily_spend"], 45.0)

    async def test_budget_circuit_breaker_anti_toctou_concurrency(self):
        """
        Testa a proteção anti-TOCTOU sob concorrência intensa.
        Múltiplas requisições assíncronas paralelas tentam consumir o budget concorrentemente.
        O lock bloqueante FOR UPDATE (simulado via lock de linha) deve impedir estouros de cota.
        """
        db_data = {
            "pousada_1": {"daily_spend": 0.0, "daily_limit": 50.0}
        }
        pool = MockDBPool(db_data)
        
        # 6 requisições simultâneas de R$ 10,00 cada. O limite é R$ 50,00.
        # Apenas 5 requisições devem passar. A 6ª deve falhar com HTTP 429.
        
        async def make_request():
            try:
                async with enforce_budget_and_rls(pool, "pousada_1", 10.0):
                    return "SUCCESS"
            except HTTPException as e:
                return f"FAIL_{e.status_code}"

        results = await asyncio.gather(*(make_request() for _ in range(6)) if hasattr(asyncio, 'gather') else [make_request() for _ in range(6)])
        
        # Validações de concorrência
        success_count = results.count("SUCCESS")
        fail_429_count = results.count("FAIL_429")
        
        self.assertEqual(success_count, 5)
        self.assertEqual(fail_429_count, 1)
        self.assertEqual(db_data["pousada_1"]["daily_spend"], 50.0)

if __name__ == '__main__':
    unittest.main()
