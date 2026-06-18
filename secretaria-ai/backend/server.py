import sys
import os
import asyncio
import json
import pandas as pd
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from schema.models import Context, AgentParameters, State
from core.orchestrator import Orchestrator
from core.database import init_db, save_lead, get_all_leads, get_all_targets

# Initialize DB
init_db()

app = FastAPI(title="LESSIE AI - Relationship OS Backend")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/leads")
async def get_leads():
    """
    Returns the consolidated leads from the SQLite database.
    """
    leads = get_all_leads()
    return {"leads": leads}

@app.get("/targets")
async def get_targets():
    """
    Returns monitored target companies from SQLite.
    """
    targets = get_all_targets()
    return {"targets": targets}

@app.post("/hunt")
async def hunt(request: Request):
    """
    Performs a real-time hunt using the LESSIE AI Orchestrator.
    Streams progress logs via SSE.
    """
    payload = await request.json()
    query = payload.get("company_name", "")
    
    async def event_generator():
        queue = asyncio.Queue()
        
        async def log_callback(message: str, type: str):
            await queue.put({"type": type, "message": message})
            
        orchestrator = Orchestrator(sandbox_mode=True)
        context = Context(
            raw_query=query,
            parameters=AgentParameters(
                target_titles=payload.get("titles", ["CMO", "Marketing Director"]),
                target_domains=payload.get("domains", []),
                count_limit=payload.get("count_limit", 5)
            )
        )
        
        # Start the SOP in a background task
        sop_task = asyncio.create_task(orchestrator.run_sop(context, log_callback=log_callback))
        
        while not sop_task.done() or not queue.empty():
            try:
                # Check for events in the queue
                while not queue.empty():
                    event = await queue.get()
                    yield f"data: {json.dumps(event)}\n\n"
                
                if not sop_task.done():
                    await asyncio.sleep(0.2)
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': f'Stream Error: {str(e)}'})}\n\n"
                break
        
        if sop_task.done() and not sop_task.exception():
            final_context = sop_task.result()
            # Persist leads to SQLite
            for candidate in final_context.candidates:
                save_lead({
                    "empresa": final_context.organizations[0].name if final_context.organizations else "N/A",
                    "decisor": candidate.name,
                    "cargo": candidate.title,
                    "email": candidate.email,
                    "whatsapp": candidate.metadata.get("phone", ""),
                    "setor": final_context.organizations[0].industry if final_context.organizations else "N/A",
                    "social_media": candidate.social_links.get("linkedin", ""),
                    "porte": final_context.organizations[0].size if final_context.organizations else "N/A",
                    "status": "verified" if candidate.validation_score > 0.8 else "pending",
                    "hook": f"Olá {candidate.name.split()[0]}, notei sua atuação como {candidate.title}...",
                    "validation_score": candidate.validation_score,
                    "social_footprint": candidate.social_footprint,
                    "metadata": candidate.metadata
                })
            yield f"data: {json.dumps({'type': 'success', 'message': 'All leads persisted to database'})}\n\n"

        if sop_task.done() and sop_task.exception():
            yield f"data: {json.dumps({'type': 'error', 'message': f'Engine Error: {str(sop_task.exception())}'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/status/prospecting")
async def get_prospecting_status():
    """
    Returns the current status of the prospecting mission.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, "outbox/LEADS_POUSADAS_PRAIA_DO_ROSA.csv")
    
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        count = len(df)
    else:
        count = 0
        
    return {
        "mission": "Pousadas Praia do Rosa",
        "current_leads": count,
        "target_leads": 200,
        "completion_percentage": (count / 200) * 100,
        "last_updated": "2026-04-25T12:30:00Z",
        "status": "paused",
        "next_targets": ["Vila da Mata Hospedagem", "Hotel Praia do Rosa", "Pousada Kauai"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
