import asyncio
import logging
import os
from typing import Optional
from schema.models import Context, State, Organization
from skills.organizations import enrich_organization
from skills.people import find_people, enrich_people, review_people
from skills.osint_enrichment import osint_enrichment_task
from skills.web import web_search, web_fetch
from core.connection_agent import ConnectionAgent
from utils.credits import CreditManager
from utils.exporter import export_to_excel

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Orchestrator")

class Orchestrator:
    """
    The central nervous system of LESSIE AI.
    Implements the Standard Operating Procedure (SOP) with FSM governance.
    """
    def __init__(self, sandbox_mode: bool = True):
        self.credit_manager = CreditManager(sandbox_mode=sandbox_mode)
        self.connection_agent = ConnectionAgent(tone="casual_peer")

    async def request_operator_approval(self, step_name: str, details: str) -> bool:
        """
        Operator Approval Checkpoint.
        """
        print(f"\n--- [APPROVAL REQUIRED] ---")
        print(f"Step: {step_name}")
        print(f"Details: {details}")
        print(f"Continue? (y/n): ", end="", flush=True)
        logger.info(f"Simulating operator approval for {step_name}...")
        return True

    async def run_sop(self, context: Context, log_callback=None) -> Context:
        """
        Executes the Full SOP:
        Org Validation -> People Search -> Enrichment -> CGV Audit -> Outreach Generation
        """
        def emit(message: str, type="info"):
            if log_callback:
                asyncio.create_task(log_callback(message, type))
            logger.info(f"[{type.upper()}] {message}")

        emit(f"Starting FULL SOP for: {context.raw_query}", "loading")
        
        # --- PASSO 1: VALIDAÇÃO DE ORGANIZAÇÃO ---
        context.current_state = State.ORG_VALIDATION
        emit("STEP 1: Organization Validation", "loading")
        
        # If no domains provided, try to extract from raw_query
        search_targets = context.parameters.target_domains
        if not search_targets:
            import re
            # Look for "empresa [Nome]" or "em [Nome]"
            match = re.search(r'(?:empresa|em)\s+([A-Za-z0-9\s]+?)(?:\.|\s|$)', context.raw_query, re.IGNORECASE)
            if match:
                company_guess = match.group(1).strip()
            else:
                # Fallback to last word
                company_guess = context.raw_query.split()[-1].strip(".,! ")
            
            search_targets = [company_guess]
            emit(f"Extracted company name: {company_guess}")

        for domain in search_targets:
            self.credit_manager.consume(1, f"Enriching {domain}")
            org = await enrich_organization(domain)
            context.organizations.append(org)
            emit(f"Organization validated: {org.name or domain}", "success")

        # --- PASSO 2: BUSCA DE PESSOAS ---
        context.current_state = State.PEOPLE_SEARCH
        emit("STEP 2: People Search", "loading")
        self.credit_manager.consume(20, "People Search")
        profiles = await find_people(
            person_titles=context.parameters.target_titles,
            organization_domains=[o.domain for o in context.organizations],
            target_count=context.parameters.count_limit
        )
        context.candidates.extend(profiles)
        emit(f"Found {len(profiles)} candidates", "success")

        # --- PASSO 3: ENRIQUECIMENTO ---
        emit("STEP 3: Batch Enrichment", "loading")
        self.credit_manager.consume(max(1, len(context.candidates)), "Enrichment")
        context.candidates = await enrich_people(context.candidates)
        emit("Enrichment completed", "success")

        # --- PASSO 4: OSINT ENRICHMENT (DEEP SEARCH) ---
        context.current_state = State.OSINT_ENRICHMENT
        emit("STEP 4: Deep OSINT Enrichment & Entity Resolution", "loading")
        self.credit_manager.consume(max(1, len(context.candidates)) * 10, "Deep OSINT")
        context.candidates = await osint_enrichment_task(context.candidates)
        emit(f"Deep enrichment completed for {len(context.candidates)} profiles", "success")

        # --- PASSO 5: AUDITORIA CGV ---
        context.current_state = State.EVALUATION_CGV
        emit("STEP 5: CGV Audit & Scoring", "loading")
        self.credit_manager.consume(max(1, len(context.candidates)) * 5, "CGV Audit")
        for i, candidate in enumerate(context.candidates):
            context.candidates[i] = await review_people(candidate, context.raw_query)
            emit(f"Scored: {candidate.name}", "info")

        # --- PASSO 6: EXPORTAÇÃO AUTOMÁTICA (FINAL) ---
        main_domain = context.organizations[0].domain if context.organizations else "unknown"
        filename = f"PROSPECCAO_{main_domain.replace('.', '_').upper()}.xlsx"
        excel_path = export_to_excel(context, filename=filename)
        
        if excel_path:
            emit(f"Auto-export successful: {filename}", "success")
            
        context.current_state = State.COMPLETED
        emit("FULL SOP completed successfully.", "success")
        return context
