# -*- coding: utf-8 -*-
"""
Value Objects do Domínio ZEHLA PRIME
Contém objetos de valor ricos, auto-validados e imutáveis.
"""
import re
from pydantic import BaseModel, Field, field_validator

class Prompt(BaseModel):
    """
    Value Object imutável de Prompt.
    Auto-sanitiza strings de entrada para evitar ataques de Prompt Injection e Goal Hijacking.
    """
    text: str = Field(..., description="Conteúdo textual do prompt")

    class Config:
        frozen = True  # Torna o objeto imutável

    @field_validator('text')
    @classmethod
    def sanitize_prompt(cls, v):
        if not v:
            return v
        
        # Padrões suspeitos comuns em Prompt Injection / System Bypass
        patterns = [
            r"(?i)ignore\s+(all\s+)?prior\s+instructions",
            r"(?i)system\s+prompt\s+override",
            r"(?i)you\s+are\s+now\s+a\s+different\s+agent",
            r"(?i)act\s+as\s+admin",
            r"(?i)su\s+root"
        ]
        
        for pattern in patterns:
            if re.search(pattern, v):
                # Sanitiza substituindo trechos maliciosos ou levantando erro de domínio
                raise ValueError("Potencial injeção de prompt detectada e bloqueada pelo SecMesh.")
                
        return v
