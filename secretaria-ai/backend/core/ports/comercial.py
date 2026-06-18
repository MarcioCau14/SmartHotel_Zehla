# -*- coding: utf-8 -*-
from abc import ABC, abstractmethod

class IComercialContextPort(ABC):
    """
    Porta de comunicação para o Bounded Context Comercial.
    Abstrai o acesso a leads, trials, planos e faturamento.
    """
    @abstractmethod
    def get_lead_metrics(self, tenant_id: str, lead_id: str) -> dict:
        """Busca métricas e score agregados de um lead específico."""
        pass

    @abstractmethod
    def validate_trial_status(self, tenant_id: str) -> bool:
        """Verifica se o período de teste grátis (trial) da pousada ainda está válido."""
        pass
