import random
import time
import requests
from typing import Dict, Any

class StealthScraper:
    """
    Motor de busca invisível baseado nos princípios do HABILITY_DESIGN.
    Implementa evasão de anti-bot, rotação de User-Agents e delays orgânicos.
    """
    
    USER_AGENTS = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0"
    ]

    def __init__(self):
        self.session = requests.Session()

    def get_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": random.choice(self.USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0"
        }

    def organic_delay(self):
        """Simula o tempo de pensamento/leitura de um humano."""
        time.sleep(random.uniform(1.5, 4.2))

    def fetch(self, url: str) -> str:
        """Executa a raspagem com proteção total."""
        self.organic_delay()
        try:
            response = self.session.get(url, headers=self.get_headers(), timeout=15)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"⚠️ [STEALTH] Erro ao acessar {url}: {e}")
            return ""

# Singleton para uso global na Secretaria-IA
stealth_hunter = StealthScraper()
