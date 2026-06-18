# -*- coding: utf-8 -*-
"""
Circuit Breaker Financeiro Atômico (Anti-TOCTOU)
Asfixia Race Conditions financeiras através de bloqueio bloqueante com FOR UPDATE no PostgreSQL.
"""
from contextlib import asynccontextmanager
import logging
from fastapi import HTTPException

logger = logging.getLogger("SECMESH_GUARDIAN_BUDGET")

@asynccontextmanager
async def enforce_budget_and_rls(db_pool, property_id: str, estimated_cost: float):
    """
    Asfixia Race Conditions financeiras através de FOR UPDATE em transação atômica.
    Garante que a verificação de saldo e o débito sejam atômicos e imunes a ataques temporais (TOCTOU).
    """
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            # 1. Rígido RLS Dogma
            await conn.execute("SET LOCAL app.current_property_id = $1;", property_id)
            
            # 2. Bloqueio físico da linha do Locatário
            record = await conn.fetchrow(
                "SELECT daily_spend, daily_limit FROM tenant_budgets WHERE id = $1 FOR UPDATE;", 
                property_id
            )
            
            if not record:
                logger.error(f"🛑 CIRCUIT BREAKER: Locatário não encontrado no banco de dados para {property_id}.")
                raise HTTPException(status_code=404, detail="Tenant Budget Context Not Found.")
                
            if record['daily_spend'] + estimated_cost > record['daily_limit']:
                logger.error(f"🛑 CIRCUIT BREAKER: Limite financeiro diário excedido para {property_id}.")
                raise HTTPException(status_code=429, detail="AI Budget Exhausted.")
                
            # 3. Deduz o saldo antes de ceder a conexão
            await conn.execute(
                "UPDATE tenant_budgets SET daily_spend = daily_spend + $1 WHERE id = $2;",
                estimated_cost, property_id
            )
            
            yield conn
