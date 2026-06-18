import asyncio
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.join(os.getcwd(), 'LESSIE_AI'))

from schema.models import Context, AgentParameters
from core.orchestrator import Orchestrator

async def main():
    # 1. Initialize context with a sample query
    context = Context(
        raw_query="Find 20 Engineering Managers at Stripe",
        parameters=AgentParameters(
            target_titles=["Engineering Manager", "VP of Engineering"],
            target_domains=["stripe.com"],
            count_limit=20
        )
    )

    # 2. Initialize Orchestrator (Sandbox Mode active by default)
    orchestrator = Orchestrator(sandbox_mode=True)

    # 3. Run the SOP
    print("🚀 Starting Lessie AI SOP Simulation...")
    final_context = await orchestrator.run_sop(context)

    # 4. Results
    print("\n--- FINAL RESULTS ---")
    print(f"Status: {final_context.current_state}")
    print(f"Candidates Found: {len(final_context.candidates)}")
    
    if final_context.candidates:
        print("\nSample Candidates:")
        for c in final_context.candidates[:3]:
            print(f"- {c.name} ({c.title}) @ {c.email}")
            print(f"  Match Score: {c.relevance_score}")

    print("\nLogs:")
    for entry in final_context.history:
        print(f"  [LOG] {entry}")

    if final_context.errors:
        print("\nErrors:")
        for err in final_context.errors:
            print(f"  [ERROR] {err}")

if __name__ == "__main__":
    asyncio.run(main())
