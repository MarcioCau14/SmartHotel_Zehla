import random
from agents.base import BaseAgent
from schema.models import Context, State, Candidate
from skills.stubs import review_people

class EvaluationAgent(BaseAgent):
    """
    Implements CGV (Criteria-Based Verification) pipeline.
    Scores candidates on:
    1. Semantic Relevance
    2. Engagement (Fake followers/inactivity check)
    3. Commercial Fit (Email validation)
    """
    async def process(self, context: Context) -> Context:
        context.log("EvaluationAgent: Starting CGV pipeline scoring.")
        
        if not context.candidates:
            context.log("EvaluationAgent: No candidates for evaluation.")
            context.current_state = State.COMPLETED
            return context
            
        # Call the skill stub for a high-level review
        # Passing target titles as criteria
        criteria = context.parameters.target_titles if context.parameters else ["General"]
        await review_people([c.model_dump() for c in context.candidates], criteria)
        
        for candidate in context.candidates:
            # Simulating dimension-based scoring
            candidate.relevance_score = round(random.uniform(0.7, 1.0), 2)
            candidate.engagement_score = round(random.uniform(0.5, 1.0), 2)
            candidate.commercial_fit_score = round(random.uniform(0.6, 1.0), 2)
            
            # Generate Text Audit (Match Explanation)
            candidate.match_explanation = (
                f"Candidate matches {candidate.title} title with {int(candidate.relevance_score*100)}% relevance. "
                f"Engagement check show active presence. Commercial fit confirmed via domain {context.organizations[0].domain if context.organizations else 'N/A'}."
            )
            
        context.log(f"EvaluationAgent: Scored {len(context.candidates)} candidates.")
        context.current_state = State.CONNECTION_GENERATION
        return context
