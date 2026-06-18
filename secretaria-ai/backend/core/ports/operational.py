# -*- coding: utf-8 -*-
from abc import ABC, abstractmethod

class IOperationalContextPort(ABC):
    """
    Porta de comunicação para o Bounded Context Operacional.
    Abstrai o controle de checklists de limpeza, SLAs, manutenções e logs operacionais.
    """
    @abstractmethod
    def create_maintenance_task(self, tenant_id: str, room_id: str, description: str) -> str:
        """Cria e agenda uma ordem de serviço/manutenção para um quarto."""
        pass

    @abstractmethod
    def get_task_status(self, tenant_id: str, task_id: str) -> dict:
        """Obtém o status de execução de uma tarefa de staff ou infraestrutura."""
        pass
