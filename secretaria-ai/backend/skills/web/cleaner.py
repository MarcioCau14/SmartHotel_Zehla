import re
from typing import Any

class DataCleaner:
    """
    Pipeline de higienização de dados baseado no Capítulo 6 do HABILITY_DESIGN.
    Garante integridade matemática para cálculos de RM.
    """
    
    @staticmethod
    def clean_currency(value: Any) -> float:
        """Converte strings de preço (R$ 1.200,50) em float (1200.50)."""
        if not value: return 0.0
        if isinstance(value, (int, float)): return float(value)
        
        # Remove R$, símbolos, espaços e separadores de milhar (ponto)
        clean_val = re.sub(r'[^\d,]', '', str(value))
        # Substitui vírgula decimal por ponto
        clean_val = clean_val.replace(',', '.')
        
        try:
            return float(clean_val)
        except ValueError:
            return 0.0

    @staticmethod
    def clean_text(text: str) -> str:
        """Remove espaços extras, tabs e caracteres invisíveis."""
        if not text: return ""
        # Remove zero-width characters e limpa whitespace
        text = re.sub(r'[\u200b\u200c\u200d\u200e\u200f\ufeff]', '', text)
        return " ".join(text.split())

    @staticmethod
    def normalize_idp(idp_raw: Any) -> int:
        """Garante que o IDP esteja entre 0 e 100."""
        try:
            val = int(float(idp_raw))
            return max(0, min(100, val))
        except:
            return 0

# Instância global
cleaner = DataCleaner()
