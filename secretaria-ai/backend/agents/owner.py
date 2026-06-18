from agents.base import BaseAgent
from schema.models import Context, State, AgentParameters

class OwnerAgent(BaseAgent):
    """
    Decomposes natural language queries into structured parameters.
    """
    async def process(self, context: Context) -> Context:
        context.log("OwnerAgent: Decomposing natural language query.")
        
        # In a real scenario, this would call an LLM.
        # Here we simulate structured extraction.
        if "CTO" in context.raw_query.upper():
            titles = ["CTO", "VP Engineering", "Head of Engineering"]
        else:
            titles = ["Founder", "CEO"]
            
        # Simulating domain extraction
        domains = []
        if "at" in context.raw_query:
            words = context.raw_query.split()
            for i, word in enumerate(words):
                if word == "at" and i + 1 < len(words):
                    domains.append(words[i+1].lower())

        context.parameters = AgentParameters(
            target_titles=titles,
            target_domains=domains,
            count_limit=10
        )
        
        context.log(f"OwnerAgent: Extracted parameters: {context.parameters}")
        
        # Transition rule: Must validate domain first if domains are present
        if context.parameters.target_domains:
            context.current_state = State.ORG_VALIDATION
        else:
            context.current_state = State.PEOPLE_SEARCH
            
        return context
