# -*- coding: utf-8 -*-
from abc import ABC, abstractmethod

class IMarketingContextPort(ABC):
    """
    Porta de comunicação para o Bounded Context de Marketing.
    Abstrai a geração de copys, envio de campanhas de outreach, análise de sentimentos e resposta de reviews.
    """
    @abstractmethod
    def log_review_feedback(self, tenant_id: str, guest_id: str, score: float, comment: str) -> None:
        """Armazena o feedback de reviews do Google/Booking para alimentar o cérebro cognitivo."""
        pass

    @abstractmethod
    def queue_outreach_campaign(self, tenant_id: str, campaign_data: dict) -> str:
        """Agenda uma nova campanha de email/WhatsApp no pipeline adaptativo."""
        pass
