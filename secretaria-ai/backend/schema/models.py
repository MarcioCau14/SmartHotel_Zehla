from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class State(str, Enum):
    IDLE = "IDLE"
    OWNER_DECOMPOSITION = "OWNER_DECOMPOSITION"
    ORG_VALIDATION = "ORG_VALIDATION"
    PEOPLE_SEARCH = "PEOPLE_SEARCH"
    OSINT_ENRICHMENT = "OSINT_ENRICHMENT"
    EVALUATION_CGV = "EVALUATION_CGV"
    CONNECTION_GENERATION = "CONNECTION_GENERATION"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"

class Organization(BaseModel):
    domain: str
    name: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    cnpj: Optional[str] = None
    address: Optional[str] = None
    validated: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

class Candidate(BaseModel):
    name: str
    title: str
    location: Optional[str] = None
    social_links: Dict[str, str] = Field(default_factory=dict)
    social_footprint: Dict[str, Any] = Field(default_factory=dict)
    email: Optional[str] = None
    email_validated: bool = False
    validation_score: float = 0.0
    relevance_score: float = 0.0
    engagement_score: float = 0.0
    commercial_fit_score: float = 0.0
    match_explanation: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AgentParameters(BaseModel):
    target_titles: List[str] = Field(default_factory=list)
    target_locations: List[str] = Field(default_factory=list)
    target_domains: List[str] = Field(default_factory=list)
    constraints: List[str] = Field(default_factory=list)
    count_limit: int = 10

class Context(BaseModel):
    raw_query: str
    parameters: Optional[AgentParameters] = None
    organizations: List[Organization] = Field(default_factory=list)
    candidates: List[Candidate] = Field(default_factory=list)
    current_state: State = State.IDLE
    history: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)

    def log(self, message: str):
        self.history.append(message)
