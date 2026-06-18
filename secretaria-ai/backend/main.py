import asyncio
import argparse
import json
from schema.models import Context, State
from orchestrator import Orchestrator
from agents.owner import OwnerAgent
from agents.org import OrgValidationAgent
from agents.search import SearchAgent
from agents.evaluation import EvaluationAgent
from agents.connection import ConnectionAgent

async def main():
    parser = argparse.ArgumentParser(description="LESSIE AI - B2B Relationship Operating System")
    parser.add_argument("query", type=str, help="Natural language query (e.g., 'Find CTOs at google.com')")
    parser.add_argument("--target-count", type=int, default=5, help="Strict limit on final candidates")
    args = parser.parse_args()

    # Initialize Context
    context = Context(
        raw_query=args.query,
        current_state=State.OWNER_DECOMPOSITION
    )
    
    # Initialize Orchestrator
    orch = Orchestrator()
    
    # Register Agents
    orch.register_agent(State.OWNER_DECOMPOSITION, OwnerAgent())
    orch.register_agent(State.ORG_VALIDATION, OrgValidationAgent())
    orch.register_agent(State.PEOPLE_SEARCH, SearchAgent())
    orch.register_agent(State.EVALUATION_CGV, EvaluationAgent())
    orch.register_agent(State.CONNECTION_GENERATION, ConnectionAgent())
    
    # Execution
    print(f"\n--- LESSIE AI ENGINE STARTING ---\n")
    final_context = await orch.run(context)
    print(f"\n--- LESSIE AI ENGINE FINISHED ---\n")
    
    # Output Results
    if final_context.current_state == State.COMPLETED:
        print(f"Successfully processed {len(final_context.candidates)} candidates.\n")
        for i, candidate in enumerate(final_context.candidates[:args.target_count], 1):
            print(f"[{i}] {candidate.name} ({candidate.title})")
            print(f"    Match Explanation: {candidate.match_explanation}")
            print(f"    Outreach Preview:\n\"\"\"{candidate.metadata.get('personalized_message', '')}\"\"\"\n")
    else:
        print(f"Engine failed at state: {final_context.current_state}")
        print(f"Errors: {final_context.errors}")

if __name__ == "__main__":
    asyncio.run(main())
