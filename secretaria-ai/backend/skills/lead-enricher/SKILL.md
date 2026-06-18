---
name: lead-enricher
description: Enriches and qualifies leads using OSINT and investigative techniques. Use this skill to validate email/WhatsApp contacts, determine purchase behavior/intent, and qualify leads based on digital footprint and real-time data crossing.
---

# Lead Enricher Skill

This skill implements an investigative prospecting workflow inspired by OSINT Industries and Sherlocker.

## Workflow

1.  **Extraction**: Extract lead information (name, email, WhatsApp) from the source.
2.  **Digital Footprint Analysis (OSINT Simulation)**:
    *   Search for the email/phone across social networks (LinkedIn, Instagram, Facebook, WhatsApp, GitHub).
    *   Identify profiles, activity levels, and public mentions.
3.  **Triangulation & Validation**:
    *   Cross-reference data found to confirm identity.
    *   Validate contact authenticity (is the WhatsApp number active? does the email match a real profile?).
4.  **Intent & Behavior Mapping**:
    *   Analyze textual data (reviews, posts, bios) to identify "Intent Data".
    *   Determine purchase behavior (is the lead looking for solutions? what are their pain points?).
5.  **Qualification**:
    *   Assign a qualification score (Low, Medium, High).
    *   Summarize key findings in a "Dossiê" format.

## Output Format

The skill should provide the following fields for each lead:
- **Qualificação**: (Baixa, Média, Alta)
- **Validação Contato**: (E-mail/WhatsApp validado via digital footprint)
- **Comportamento de Compra**: (Descrição do perfil de consumo e intenção)
- **Sinais de Intenção**: (Sinais específicos detectados, e.g., "Expansão recente", "Busca por automação")

## Tool Usage
- Use Python scripts in the `scripts/` directory to handle data processing and Excel updates.
- Use LLMs to analyze text and simulate the "Entity Resolution" and "Intent Mapping" steps.
