# -*- coding: utf-8 -*-
from abc import ABC, abstractmethod

class ISecurityContextPort(ABC):
    """
    Porta de comunicação para o Bounded Context de Segurança (SecMesh).
    Abstrai tokenização PII (ZDR), validação HMAC, Honey-Nodes, JWT e audit logs.
    """
    @abstractmethod
    def tokenize_pii(self, tenant_id: str, raw_pii: str) -> bytes:
        """Criptografa e tokeniza dados PII confidenciais."""
        pass

    @abstractmethod
    def log_threat_event(self, tenant_id: str, event_type: str, severity: str, details: str) -> None:
        """Registra um incidente de segurança ou tentativa de intrusão no SecMesh Guard."""
        pass

    @abstractmethod
    def trigger_honey_node_alert(self, tenant_id: str, resource_accessed: str) -> None:
        """Inicia contramedidas de mitigação ativa ao detectar acesso a um Honey-Node (canário)."""
        pass
