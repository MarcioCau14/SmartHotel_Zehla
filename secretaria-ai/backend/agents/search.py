from agents.base import BaseAgent
from schema.models import Context, State, Candidate
from skills.stubs import find_people, enrich_people

class SearchAgent(BaseAgent):
    """
    Search agent that indexes and aggregates professional data.
    Agnostic of platform, combines multiple sources.
    """
    async def process(self, context: Context) -> Context:
        context.log("SearchAgent: Starting search and indexing.")
        
        if not context.parameters:
            context.log("SearchAgent: No parameters found. Aborting.")
            context.current_state = State.ERROR
            return context
            
        # Perform search using skill stubs
        # In a real app, this would query LinkedIn, GitHub, etc.
        raw_results = await find_people(
            titles=context.parameters.target_titles,
            domains=context.parameters.target_domains,
            limit=context.parameters.count_limit
        )
        
        # Mocking some results since the stub returns empty
        if not raw_results:
            context.log("SearchAgent: Using mock data for demonstration.")
            raw_results = [
                {"name": "Alice Smith", "title": "CTO", "domain": "example.com"},
                {"name": "Bob Jones", "title": "Head of Engineering", "domain": "example.com"}
            ]
            
        # Enrich profiles
        enriched_results = await enrich_people(raw_results)
        
        # Map to Canonical Candidate Model
        for item in enriched_results:
            candidate = Candidate(
                name=item["name"],
                title=item["title"],
                metadata=item
            )
            context.candidates.append(candidate)
            
        context.log(f"SearchAgent: Found and enriched {len(context.candidates)} candidates.")
        context.current_state = State.EVALUATION_CGV
        return context
