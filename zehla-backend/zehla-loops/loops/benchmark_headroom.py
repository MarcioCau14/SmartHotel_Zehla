# ═══════════════════════════════════════════════════════════
# ARQUIVO: loops/benchmark_headroom.py
# Comparação empírica: custo COM vs SEM Headroom por loop
# Uso: python benchmark_headroom.py --loop pricing --iterations 3
# ═══════════════════════════════════════════════════════════

import json
import time
import httpx
import asyncio
import argparse
from pathlib import Path
from datetime import datetime
import os

BENCHMARK_CONFIGS = {
    "pricing": {
        "system_prompt": "Você é o agente de precificação do ZEHLA. Analise dados de mercado e ajuste preços.",
        "user_prompt": "Analise os preços dos concorrentes e sugira ajustes para as suítes do hotel. Dados: Pousada do Ouro: R$289-589. Hotel Litoral: R$245-520. Pousada Mar e Sol: R$199-398. Ocupação atual: 68%. Meta: 85%.",
        "expected_tokens_input": 12000,
    },
    "akashic": {
        "system_prompt": "Você é o agente de cristalização do Campo Akáshico. Processe episódios e extraia padrões.",
        "user_prompt": "Processe os seguintes 50 episódios de atendimento e extraia padrões de comportamento dos hóspedes, anomalias e insights acionáveis. " + ("Episódio: Hóspede perguntou sobre checkout. Resolvido. " * 50),
        "expected_tokens_input": 25000,
    },
    "competitor": {
        "system_prompt": "Você é o agente de monitoramento de concorrentes. Extraia preços de HTML scraping.",
        "user_prompt": "Extraia os preços de diárias do seguinte HTML de 5 sites de concorrentes: " + ("<!DOCTYPE html><html><body><div class='room-price'>R$ 289,00</div><div class='room-name'>Standard</div><p>Descrição longa do quarto com amenities inclusas café da manhã piscina Wi-Fi estacionamento etc etc etc</p>" * 100),
        "expected_tokens_input": 78000,
    },
    "review": {
        "system_prompt": "Você é o agente de análise de reviews. Analise sentimento e extraia insights.",
        "user_prompt": "Analise as seguintes reviews de hóspedes: " + ("Review: 'O quarto estava limpo mas o café da manhã poderia ser melhor. Atendimento ok.' Rating: 3/5. " * 30),
        "expected_tokens_input": 20000,
    },
    "marketing": {
        "system_prompt": "Você é o agente de marketing do ZEHLA. Gere conteúdo para redes sociais.",
        "user_prompt": "Gere 3 opções de caption para Instagram da pousada, considerando: inverno em Paraty, festival de gastronomia nächste semana, pacote romântico disponível. Sazonalidade: baixa temporada. Público: casais 30-50 anos.",
        "expected_tokens_input": 12000,
    },
    "audit": {
        "system_prompt": "Você é o agente de auditoria do ZEHLA. Verifique conformidade e segurança.",
        "user_prompt": "Execute os 5 passos de auditoria: 1) Funcionalidades, 2) Segurança LGPD, 3) Performance, 4) Código, 5) Conformidade. Logs do sistema: " + ("[2026-06-17 10:00:00] INFO - Request processed in 45ms. [2026-06-17 10:00:01] INFO - User login successful. " * 100),
        "expected_tokens_input": 18000,
    },
}

async def run_single_request(
    api_url: str,
    api_key: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    label: str
) -> dict:
    """Executa uma única requisição e retorna métricas."""
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    
    start = time.time()
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{api_url}/chat/completions",
            json={
                "model": model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2048,
            },
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
        )
        elapsed_ms = int((time.time() - start) * 1000)
        
    result = response.json()
    usage = result.get("usage", {})
    
    return {
        "label": label,
        "status_code": response.status_code,
        "elapsed_ms": elapsed_ms,
        "tokens_input": usage.get("prompt_tokens", 0),
        "tokens_output": usage.get("completion_tokens", 0),
        "tokens_total": usage.get("total_tokens", 0),
        "headroom_meta": result.get("headroom", {}),
        "model": model,
    }

async def benchmark_loop(
    loop_name: str,
    api_key: str,
    headroom_url: str,
    direct_url: str,
    model: str,
    iterations: int = 3,
) -> dict:
    """
    Compara custo COM Headroom vs SEM Headroom para um loop.
    
    Executa N iterações em cada modo e compara:
    - Tokens consumidos (input + output)
    - Latência média
    - Custo estimado
    """
    config = BENCHMARK_CONFIGS.get(loop_name)
    if not config:
        print(f"[ERRO] Loop '{loop_name}' não encontrado. Disponíveis: {list(BENCHMARK_CONFIGS.keys())}")
        return {}
    
    print(f"\n{'='*60}")
    print(f"BENCHMARK: {loop_name.upper()}")
    print(f"Iterações: {iterations} | Modelo: {model}")
    print(f"{'='*60}\n")
    
    results = {"with_headroom": [], "without_headroom": []}
    
    # Fase 1: COM Headroom
    print(f"--- FASE 1: COM Headroom ({headroom_url}) ---")
    for i in range(iterations):
        r = await run_single_request(
            headroom_url, api_key, model,
            config["system_prompt"], config["user_prompt"],
            f"headroom_iter_{i+1}"
        )
        results["with_headroom"].append(r)
        print(
            f"  Iter {i+1}: {r['tokens_input']} in + {r['tokens_output']} out = "
            f"{r['tokens_total']} total | {r['elapsed_ms']}ms | "
            f"HR meta: {json.dumps(r.get('headroom_meta', {}))[:100]}"
        )
        await asyncio.sleep(2)  # Rate limit avoidance
    
    # Fase 2: SEM Headroom (chamada direta ao OpenRouter)
    print(f"\n--- FASE 2: SEM Headroom ({direct_url}) ---")
    for i in range(iterations):
        r = await run_single_request(
            direct_url, api_key, model,
            config["system_prompt"], config["user_prompt"],
            f"direct_iter_{i+1}"
        )
        results["without_headroom"].append(r)
        print(
            f"  Iter {i+1}: {r['tokens_input']} in + {r['tokens_output']} out = "
            f"{r['tokens_total']} total | {r['elapsed_ms']}ms"
        )
        await asyncio.sleep(2)
    
    # Cálculos
    avg_hr = sum(r["tokens_total"] for r in results["with_headroom"]) / len(results["with_headroom"])
    avg_direct = sum(r["tokens_total"] for r in results["without_headroom"]) / len(results["without_headroom"])
    avg_latency_hr = sum(r["elapsed_ms"] for r in results["with_headroom"]) / len(results["with_headroom"])
    avg_latency_direct = sum(r["elapsed_ms"] for r in results["without_headroom"]) / len(results["without_headroom"])
    
    savings_tokens = avg_direct - avg_hr
    savings_percent = (savings_tokens / avg_direct * 100) if avg_direct > 0 else 0
    
    cost_per_1k = 0.000015  # ~$0.015/1K tokens (Sonnet)
    cost_hr = avg_hr * cost_per_1k
    cost_direct = avg_direct * cost_per_1k
    cost_savings = cost_direct - cost_hr
    monthly_savings = cost_savings * 30  # 1 execução/dia
    
    summary = {
        "loop": loop_name,
        "iterations": iterations,
        "model": model,
        "timestamp": datetime.now().isoformat(),
        "avg_tokens_with_headroom": round(avg_hr),
        "avg_tokens_without_headroom": round(avg_direct),
        "tokens_saved_per_execution": round(savings_tokens),
        "savings_percent": round(savings_percent, 1),
        "avg_latency_ms_with_headroom": round(avg_latency_hr),
        "avg_latency_ms_without_headroom": round(avg_latency_direct),
        "cost_per_execution_with_headroom": round(cost_hr, 6),
        "cost_per_execution_without_headroom": round(cost_direct, 6),
        "cost_savings_per_execution": round(cost_savings, 6),
        "estimated_monthly_savings": round(monthly_savings, 2),
        "raw_results": results,
    }
    
    print(f"\n{'='*60}")
    print(f"RESULTADO — {loop_name.upper()}")
    print(f"{'='*60}")
    print(f"  Tokens médios COM Headroom:    {avg_hr:,.0f}")
    print(f"  Tokens médios SEM Headroom:    {avg_direct:,.0f}")
    print(f"  Tokens economizados:          {savings_tokens:,.0f} ({savings_percent:.1f}%)")
    print(f"  Latência média COM Headroom:  {avg_latency_hr}ms")
    print(f"  Latência média SEM Headroom:  {avg_latency_direct}ms")
    print(f"  Custo/exec COM Headroom:       ${cost_hr:.4f}")
    print(f"  Custo/exec SEM Headroom:       ${cost_direct:.4f}")
    print(f"  Economia/exec:                  ${cost_savings:.4f}")
    print(f"  Economia estimada/mês (30d):   ${monthly_savings:.2f}")
    print(f"{'='*60}\n")
    
    # Salva resultado
    output_dir = Path("output/benchmarks")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"benchmark_{loop_name}_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
    output_file.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    print(f"Resultado salvo em: {output_file}")
    
    return summary

async def main():
    parser = argparse.ArgumentParser(description="Benchmark Headroom ZEHLA")
    parser.add_argument("--loop", type=str, default="pricing", help="Loop para testar")
    parser.add_argument("--iterations", type=int, default=3, help="Iterações por modo")
    parser.add_argument("--all", action="store_true", help="Testar todos os loops")
    parser.add_argument("--headroom-url", type=str, default="http://localhost:8787/v1")
    parser.add_argument("--direct-url", type=str, default="https://openrouter.ai/api/v1")
    parser.add_argument("--model", type=str, default="anthropic/claude-haiku-3.5")
    args = parser.parse_args()
    
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        print("[ERRO] OPENROUTER_API_KEY não definida")
        return
    
    loops_to_test = list(BENCHMARK_CONFIGS.keys()) if args.all else [args.loop]
    
    all_summaries = []
    for loop in loops_to_test:
        summary = await benchmark_loop(
            loop, api_key,
            args.headroom_url, args.direct_url,
            args.model, args.iterations
        )
        all_summaries.append(summary)
    
    # Resumo consolidado
    if len(all_summaries) > 1:
        total_savings = sum(s.get("estimated_monthly_savings", 0) for s in all_summaries)
        avg_savings_pct = sum(s.get("savings_percent", 0) for s in all_summaries) / len(all_summaries)
        print(f"\n{'='*60}")
        print(f"RESUMO CONSOLIDADO — {len(all_summaries)} loops")
        print(f"  Economia média: {avg_savings_pct:.1f}%")
        print(f"  Economia mensal estimada: ${total_savings:.2f}")
        print(f"{'='*60}")

if __name__ == "__main__":
    asyncio.run(main())
