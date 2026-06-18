from agents.base import BaseAgent
from schema.models import Context, State, Organization
from skills.stubs import enrich_organization

class OrgValidationAgent(BaseAgent):
    """
    Validates corporate domains before allowing people search.
    Enforces the SOP (Standard Operating Procedure).
    """
    async def process(self, context: Context) -> Context:
        context.log("OrgValidationAgent: Validating corporate domains.")
        
        if not context.parameters or not context.parameters.target_domains:
            context.log("OrgValidationAgent: No domains to validate. Skipping.")
            context.current_state = State.PEOPLE_SEARCH
            return context
            
        for domain in context.parameters.target_domains:
            context.log(f"OrgValidationAgent: Checking domain '{domain}'")
            # Call the skill stub
            org_data = await enrich_organization(domain)
            
            organization = Organization(
                domain=org_data["domain"],
                validated=org_data["validated"],
                metadata=org_data
            )
            context.organizations.append(organization)
            
        context.log(f"OrgValidationAgent: Validated {len(context.organizations)} organizations.")
        context.current_state = State.PEOPLE_SEARCH
        return context
