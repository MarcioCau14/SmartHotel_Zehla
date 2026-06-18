# Skill: OSINT Enrichment

Correlate fragmented data (emails, names, phones) to find digital footprints across social platforms and verify entity identities.

## Description
This skill is triggered during the prospecção flow to perform deep background checks on potential leads. It uses a combination of web scraping simulations and LLM-based entity resolution to build a comprehensive "Social Footprint" for each candidate.

## Contextual Requirements
- Candidate Email (found in PEOPLE_SEARCH or ENRICHMENT steps)
- Candidate Name and Organization
- Goal: Verify if the person is active on LinkedIn, Instagram, or X (Twitter) and extract relevant "hooks".

## Instructions
1. **Data Correlation:** Take the available email/phone and search for matching profiles on social platforms.
2. **Entity Resolution:** Use the LLM to compare data from multiple sources (e.g., a LinkedIn profile and an Instagram account) to ensure they belong to the same person.
3. **Scoring:** Assign a `validation_score` (0.0 to 1.0) based on the certainty of the match.
4. **Footprint Extraction:** Save found handles and brief bio/recent activity in the `social_footprint` dictionary.

## Example Output
```json
{
  "social_footprint": {
    "linkedin": "linkedin.com/in/johndoe",
    "instagram": "@johndoe_surf",
    "recent_activity": "Posted about PIE-SP tax incentives last week."
  },
  "validation_score": 0.95
}
```
