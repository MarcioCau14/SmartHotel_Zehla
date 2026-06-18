from agents.base import BaseAgent
from schema.models import Context, State

class ConnectionAgent(BaseAgent):
    """
    Generates hyper-personalized outreach messages (cold emails/DMs).
    References repos, articles, and company news.
    """
    async def process(self, context: Context) -> Context:
        context.log("ConnectionAgent: Generating personalized outreach.")
        
        for candidate in context.candidates:
            # Mocking data consumption for personalization
            # In a real app, 'metadata' would contain repo URLs, news links, etc.
            name = candidate.name.split()[0]
            personalization_hook = "your recent work in scalable systems"
            
            if "at" in context.raw_query:
                personalization_hook += f" at {context.organizations[0].domain if context.organizations else 'your company'}"
            
            message = (
                f"Hi {name},\n\n"
                f"I was impressed by {personalization_hook}. "
                f"The way you've handled challenges as a {candidate.title} is remarkable. "
                f"Would love to connect and share some insights relative to our Relationship OS.\n\n"
                f"Best regards,\n[Your Name]"
            )
            
            candidate.metadata["personalized_message"] = message
            
        context.log(f"ConnectionAgent: Generated {len(context.candidates)} messages.")
        context.current_state = State.COMPLETED
        return context
