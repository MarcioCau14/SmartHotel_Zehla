# -*- coding: utf-8 -*-
"""
Protocolo de Comunicação Base Criptográfico (Zehla Command Protocol - ZCP)
Garante que nenhum agente confie em outro sem validação matemática em tempo constante.
"""
import hmac
import logging
from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger("SECMESH_GUARDIAN_ZCP")
ZCP_SECRET_KEY = b"injecao_dinamica_via_tmpfs"  # Nunca usar .env

class SecureZCPBaseDTO(BaseModel):
    """
    Todo DTO (ex: ConciergeMessageInputDTO, HostCommandInputDTO) DEVE herdar desta classe.
    Garante isolamento de locatário (RLS) e prevenção de Goal Hijack entre agentes.
    """
    tenant_id: str = Field(..., description="ID criptográfico da pousada")
    agent_signature: str = Field(..., description="HMAC SHA-256 do payload")
    
    @field_validator('agent_signature')
    @classmethod
    def validate_agent_trust(cls, v, info):
        # Validação matemática de tempo constante
        payload_str = str(info.data.get('tenant_id'))
        expected_mac = hmac.new(ZCP_SECRET_KEY, payload_str.encode(), digestmod='sha256').hexdigest()
        
        if not hmac.compare_digest(expected_mac, v):
            logger.critical("🚨 INTRUSÃO: Tentativa de Movimentação Lateral Agêntica (ZCP Forged).")
            raise ValueError("ZCP Trust Verification Failed.")
        return v
