from abc import ABC, abstractmethod
from schema.models import Context

class BaseAgent(ABC):
    """
    Abstract Base Class for all Cognitive Agents in the LESSIE AI ecosystem.
    """
    @abstractmethod
    async def process(self, context: Context) -> Context:
        """
        Main processing loop for the agent. Receives the current context
        and returns the modified context.
        """
        pass
