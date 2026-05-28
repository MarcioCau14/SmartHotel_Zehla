# MEMORY.md — ZEHLA PRIME Global Memory
# Last updated: {{LAST_UPDATED}}
# Version: 1.0.0-prime
# Updated by: {{CYCLE_ID}}

## Market Intelligence

### Brazil Hospitality Market
- Total pousadas estimated: ~45,000 (SEBRAE + booking data)
- Digital adoption rate: 35% (have website + any OTA)
- Average daily rate: R$ 185 (varies by region)
- Average occupancy: 52% national, 72% high season
- Top regions by pousada density: BA, SC, RJ, MG, PE, GO

### Seasonality Patterns (learned)
- **Northeast (BA, PE, CE):** High: Dec-Mar, Shoulder: Apr-Jun/Jul-Aug, Low: Sep-Nov
- **South (SC, RS, PR):** High: Dec-Feb (summer) + Jul (winter holiday), Shoulder: Mar-May, Low: Jun/Aug-Sep
- **Southeast (RJ, SP, MG):** Year-round with peaks: Carnaval (Feb), Holy Week (Apr), Winter Jul, Year-end Dec
- **Midwest (GO, MT, MS):** High: Jun-Aug (dry season + national holidays)

### Conversion Patterns (learned)
- Best conversion channel: WhatsApp direct (12.3% conversion)
- Email sequence optimal: 3 emails in 14 days, then pause 7 days
- Best time to contact: Tuesday-Thursday 9h-11h (local time)
- Price objection frequency: 67% of lost deals mention price
- Starter → Professional upgrade average: 4.2 months after signup

### Revenue Management Insights (learned)
- Pousadas that adjust prices weekly have 15% higher RevPAR
- Last-minute pricing (48h before check-in) increases occupancy by 8%
- Bundling (room + breakfast + activity) increases ADR by 22%
- Review score correlation: each 0.1 increase in review = 3% more bookings

## Operational Knowledge

### Common Issues
- Booking.com API rate limits: solution is caching + 429 handling
- WhatsApp Business API: template approval takes 24-48h
- Instagram scraping: rotate proxies every 500 requests
- HNSW rebuild needed when memory grows > 100K vectors

### Feature Preferences by Segment
- Small pousadas (< 5 rooms): prefer simplicity, WhatsApp-first
- Medium (5-15 rooms): want revenue management + reviews
- Large (15+ rooms): need full automation + multi-property

## Performance Baselines
- Pipeline HOSPI avg execution: 850ms (P95: 2100ms)
- HNSW retrieval avg: 45ms for 10K vectors
- Lead Watcher full scan: 3.2s for 10K leads
- Agent dispatch avg: 120ms
- End-to-end event processing: 1.8s (P95: 4.5s)
