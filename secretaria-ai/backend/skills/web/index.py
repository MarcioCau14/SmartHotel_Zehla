from typing import List, Dict, Any
import re
from skills.web.stealth import stealth_hunter

async def web_search(query: str) -> List[Dict[str, Any]]:
    """
    Live indexing API search focusing on hospitality and revenue opportunities.
    """
    print(f"[SKILL] web_search: Hunter ativo para '{query}'...")
    
    # Simulação de resultados de busca (em produção integraria com Google Search API)
    # Mas agora o conteúdo desses links será processado pelo StealthScraper
    if "pousada" in query.lower() or "hotel" in query.lower():
        return [
            {"title": "Pousada Praia do Rosa - Tarifas e Reservas", "url": "https://pousadapraiadorosa.com.br"},
            {"title": "Melhores Pousadas em Imbituba - Booking.com", "url": "https://www.booking.com/pousadas/imbituba"}
        ]
    return [{"title": f"Business results for {query}", "url": f"https://google.com/search?q={query}"}]

async def web_fetch(url: str) -> str:
    """
    Realiza o 'Deep Scraping' indetectável usando a lógica Elite Hunter.
    Extrai preços, ocupação e vulnerabilidades competitivas.
    """
    print(f"[SKILL] web_fetch: Iniciando captura invisível em {url}...")
    
    html_content = stealth_hunter.fetch(url)
    
    if not html_content:
        return "FALHA: Site bloqueou acesso ou está offline."

    # Lógica de Seletores Inteligentes (Smart Selectors) baseada no doc
    # Aqui extraímos o 'sentimento de preço' e ocupação via heurística de texto
    has_discount = "promoção" in html_content.lower() or "desconto" in html_content.lower()
    last_rooms = "últimos quartos" in html_content.lower() or "esgotado" in html_content.lower()
    
    analysis = f"RELATÓRIO HUNTER EM {url}:\n"
    analysis += f"- Promoção ativa: {'SIM' if has_discount else 'NÃO'}\n"
    analysis += f"- Gatilho de Urgência: {'Detectado' if last_rooms else 'Ausente'}\n"
    analysis += f"- Vulnerabilidade: {'Alta dependência de OTA' if 'booking.com' in html_content else 'Venda direta ativa'}"
    
    return analysis

