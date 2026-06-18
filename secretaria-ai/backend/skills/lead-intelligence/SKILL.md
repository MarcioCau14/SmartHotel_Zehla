---
name: lead-intelligence
description: Analyzes lead behavior and purchase intent for pousadas/hotels. Triggers when the user provides a CNPJ or name of a pousada for analysis, enrichment, or scoring. Performs OSINT (Booking, TripAdvisor, Google Maps, Cadastur), calculates a Lead Score based on Firmographic and Behavioral data, and generates an AI dossier with "Momento de Compra" insights.
---

# Lead Intelligence Skill

This skill implements a high-performance lead analysis system for the hospitality sector, inspired by OSINT tools like Sherlocker.

## Workflow

1. **Capture Intent**: Identify the target pousada (Name, CNPJ, or Website).
2. **OSINT Enrichment**:
    - **Firmographics**: Size (UHs), location, and corporate structure (via Cadastur/Public Records).
    - **Intent Signals**: Participation in public bids, recent vehicle fleet expansions, or financial health signals.
    - **Digital Activity**: Search for the pousada on Booking.com, TripAdvisor, Airbnb, and Google Maps.
3. **Scoring Engine**:
    - **Lead Fit**: High score for targets that match the Ideal Customer Profile (ICP) (e.g., >10 rooms, premium location).
    - **Engagement**: High score for active digital presence (responses to reviews, frequent updates).
    - **Decay**: Score reduction if the latest digital signal is older than 90 days.
4. **Data Triangulation**: Link social media, WhatsApp, and official records to identify the real owner/decision-maker.
5. **AI Insights**: Analyze review sentiment to identify specific sales opportunities (e.g., complaints about Wi-Fi -> Sell IT/Networking solutions).

## Usage Instructions

### 1. Research & Capture
When a target is identified, use the internal `enrichment.py` script (or browser subagents) to scan:
- **OTAs**: Check current rating, review volume, and response rate.
- **Cadastur**: Verify legal status and official capacity.
- **Google Maps**: Check operational status and recent photos.

### 2. Calculate Score
Use `scoring.py` to process the gathered data into a numerical score (0-100) and a category:
- **HOT**: High fit + High activity.
- **WARM**: High fit + Low activity OR Medium fit + High activity.
- **COLD**: Low fit + Low activity.

### 3. Generate Dossier
Output a structured report including:
- **General Info**: CNPJ, Address, Rooms.
- **Lead Score**: Categorization and rationale.
- **Triangulation Graph**: Connection between owners and other businesses.
- **AI "Momento de Compra"**: Summarized sentiment and recommended sales pitch.

## Example Trigger
"Analise a Pousada Vila Buena Vista na Praia do Rosa e me diga se é um bom lead para vender sistemas de automação."
"Enriqueça o lead CNPJ 12.345.678/0001-99."
