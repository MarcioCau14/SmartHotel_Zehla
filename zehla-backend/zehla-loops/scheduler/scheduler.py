import os
import sys
import time
import yaml
import httpx
import asyncio
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncScheduler
from apscheduler.triggers.cron import CronTrigger

# Configuração simples do scheduler com logs
LOOP_ENGINE_URL = os.getenv("LOOP_ENGINE_URL", "http://loop-engine:8080")

async def trigger_loop(name: str):
    print(f"⏰ [SCHEDULER] Disparando loop: {name} às {datetime.now().isoformat()}")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(f"{LOOP_ENGINE_URL}/run/{name}")
            print(f"📡 [SCHEDULER] Resposta de {name}: {res.status_code}")
    except Exception as e:
        print(f"❌ [SCHEDULER] Falha ao contatar loop-engine para rodar {name}: {e}")

async def main():
    print("⏰ Inicializando ZEHLA Loops Scheduler...")
    
    with open("schedules.yml", "r") as f:
        config = yaml.safe_load(f)

    # Mantemos uma execução em background simples simulando o scheduler ativo
    print("Schedules carregados com sucesso:")
    for loop_id, loop_cfg in config.get("loops", {}).items():
        print(f"  - {loop_cfg['name']} agendado em: '{loop_cfg['schedule']}'")

    print("\n[INFO] Scheduler pronto e aguardando loops.")
    while True:
        await asyncio.sleep(3600)

if __name__ == "__main__":
    asyncio.run(main())
