import logging
import os
from typing import Dict, Any
from schema.models import Candidate

logger = logging.getLogger("ConnectionAgent")

class ConnectionAgent:
    """
    Motor de Divulgação da Lessie AI.
    Gera mensagens hiperpersonalizadas baseadas em auditoria CGV e inteligência Web.
    """
    
    def __init__(self, tone: str = "casual_peer"):
        self.tone = tone

    def generate_personalized_outreach(self, candidate: Candidate, web_context: str) -> str:
        """
        Redige um e-mail frio ou DM baseado em evidências.
        Adaptado para missões de parceria e patrocínio.
        """
        logger.info(f"Generating personalized outreach for {candidate.name} (Tone: {self.tone})")
        
        # Extratos de personalização baseados no Motor CGV
        explanation = candidate.match_explanation or ""
        domain = candidate.metadata.get('source_domain', 'sua empresa')
        
        # Lógica de Personalização para Patrocínio/Surf
        is_surf_mission = "surf" in explanation.lower() or "patrocínio" in explanation.lower()
        
        if is_surf_mission:
            subject = f"Patrocínio de Surf / Lei de Incentivo @ {domain}"
            body_intro = f"Acompanhei o posicionamento estratégico da {domain} e vi que vocês {web_context.split('MATCH: ')[-1].split('.')[0] if 'MATCH:' in web_context else 'têm investido em estilo de vida saudável'}."
            body_reason = f"O motivo do meu contato é que estamos com um projeto de surf profissional que se alinha perfeitamente ao seu público. {explanation.split('- [RELEVÂNCIA]: ')[-1].split('.')[0] if '- [RELEVÂNCIA]: ' in explanation else 'Vi uma oportunidade clara de otimização de incentivo fiscal.'}"
            body_cta = "Podemos conversar sobre como utilizar o PIE-SP ou a Lei Federal de Incentivo para viabilizar isso com custo zero de marketing para vocês?"
        else:
            # Fallback para recrutamento/engenharia
            subject = f"Oportunidade @ Lessie AI / Seu trabalho em {domain}"
            body_intro = f"Acompanhei sua trajetória como {candidate.title} e seu envolvimento com {web_context.split('MATCH: ')[-1].split('.')[0] if 'MATCH:' in web_context else 'tecnologias de escala'}."
            body_reason = f"Vi uma correlação forte com os desafios que estamos enfrentando na Lessie AI. {explanation.split('- [RELEVÂNCIA]: ')[-1].split('.')[0] if '- [RELEVÂNCIA]: ' in explanation else 'Seu background é excepcional.'}"
            body_cta = "Gostaria de trocar uma ideia rápida sobre como estamos construindo o futuro do Relationship OS?"

        email_template = f"""
Assunto: {subject}

Olá {candidate.name.split()[0]}, tudo bem?

{body_intro}

{body_reason}

{body_cta}

Abs,
[Time Lessie AI]
"""
        return email_template.strip()

    def save_to_outbox(self, candidate: Candidate, message: str):
        """
        Salva a mensagem para revisão humana.
        """
        os_path = f"LESSIE_AI/outbox"
        if not os.path.exists(os_path):
            os.makedirs(os_path)
            
        filename = f"{os_path}/{candidate.name.replace(' ', '_').lower()}_draft.txt"
        with open(filename, 'w') as f:
            f.write(message)
        logger.info(f"Draft saved to {filename}")
