import asyncio
from typing import List, Dict, Any
from schema.models import Candidate
from skills.phone_validation.scripts.phone_resolver import resolve_phone_deep_osint

async def osint_enrichment_task(candidates: List[Candidate]) -> List[Candidate]:
    """
    Simulates deep OSINT enrichment for a list of candidates.
    In a real scenario, this would call APIs like OSINT Industries, FullContact, or perform direct scraping.
    """
    enriched_candidates = []
    
    for candidate in candidates:
        print(f"[OSINT] Enriching footprint for {candidate.name} ({candidate.email or 'no email'})...")
        
        # Simulated OSINT Logic
        footprint = {}
        validation_score = 0.5 # Default
        
        if candidate.email:
            # Simulate finding social accounts by email
            username = candidate.email.split('@')[0]
            footprint["linkedin"] = f"https://linkedin.com/in/{username}"
            footprint["instagram"] = f"https://instagram.com/{username}"
            footprint["x"] = f"https://x.com/{username}"
            
            # Entity Resolution Simulation (LLM-style logic)
            import unicodedata
            def normalize(text):
                return "".join(c for c in unicodedata.normalize('NFD', text.lower()) if unicodedata.category(c) != 'Mn')
            
            clean_name = normalize(candidate.name).replace(" ", "").replace(".", "")
            clean_username = normalize(username).replace(".", "").replace("_", "")
            
            if clean_username in clean_name:
                validation_score = 0.9
                footprint["resolution_notes"] = "High certainty: Username correlates with candidate name."
            else:
                validation_score = 0.7
                footprint["resolution_notes"] = "Medium certainty: Email domain matches organization."
        
        candidate.social_footprint = footprint
        candidate.validation_score = validation_score
        
        if "linkedin" in footprint:
            candidate.social_links["linkedin"] = footprint["linkedin"]
        
        # --- NEW: Advanced Phone Resolution ---
        phone_data = await resolve_phone_deep_osint(candidate.name, candidate.metadata.get("source_domain", ""))
        if phone_data["confidence"] > 0.8:
            candidate.metadata["whatsapp"] = phone_data["phone"]
            candidate.metadata["phone_validated"] = True
            candidate.metadata["phone_source"] = phone_data["validation_notes"]
            # Boost validation score if phone is high confidence
            candidate.validation_score = min(0.98, candidate.validation_score + 0.1)
            
        enriched_candidates.append(candidate)
        await asyncio.sleep(0.5) # Simulate latency
        
    return enriched_candidates

async def validate_realtime(candidate: Candidate) -> Candidate:
    """
    Sherlocker-inspired real-time validation of a single candidate.
    """
    print(f"[SHERLOCKER] Validating {candidate.name} in real-time...")
    # Simulated validation logic
    if candidate.email and "@" in candidate.email:
        candidate.email_validated = True
        candidate.validation_score = max(candidate.validation_score, 0.8)
        
    return candidate
