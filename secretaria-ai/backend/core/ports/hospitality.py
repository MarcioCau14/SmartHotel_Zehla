# -*- coding: utf-8 -*-
from abc import ABC, abstractmethod

class IHospitalityContextPort(ABC):
    """
    Porta de comunicação para o Bounded Context de Hospitalidade.
    Abstrai o acesso a FAQs, regras de quartos, reservas e check-ins.
    """
    @abstractmethod
    def get_booking(self, tenant_id: str, booking_id: str) -> dict:
        """Recupera detalhes de uma reserva específica sob isolamento de locatário."""
        pass

    @abstractmethod
    def update_room_service(self, tenant_id: str, room_id: str, service_data: dict) -> None:
        """Atualiza serviços ou status associados a um quarto específico."""
        pass
