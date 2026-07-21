---
Task ID: 1
Agent: Main Agent
Task: Update Airbnb pricing and redesign package features for "PARA ANFITRIÕES"

Work Log:
- Read PricingSection.tsx, plan-features.ts, niche-content.ts to understand current plan structure
- Found Airbnb PRO was R$397/mês, MAX was R$797/mês - needed to change to R$197/mês and R$397/mês
- Added pricePixAirbnb, priceCartaoAirbnb, priceLabelAirbnb fields to Plan interface
- Added roiAirbnb field for ROI line under price
- Updated PRO plan: R$197/mês for Airbnb, redesigned featuresAirbnb with 13 real-value items
- Updated MAX plan: R$397/mês for Airbnb, redesigned featuresAirbnb with 12 real-value items
- Added ROI value calculator section "Faça a conta: o Zélla se paga sozinho" with 3 metric cards and example calculation
- Updated price rendering logic to use Airbnb-specific prices when niche=airbnb
- Updated handleSubscribe to pass correct Airbnb pricing to checkout
- Fixed IntegrationsSection: removed Link-in-Bio from Airbnb view, added Magic Onboarding Airbnb integration
- Added nicheOnly filter to integrations list
- Verified: Airbnb side has NO LINK-IN-BIO, only PRO + MAX with 7-day trial
- Verified: GRATUITO, LITE, PARCEIRO are pousada-only (niches: ['pousada'])
- Lint passed with no new errors
- Page compiled and rendered successfully in dev mode
- Agent Browser verified: pricing section shows only PRO and MAX in Airbnb mode

Stage Summary:
- Airbnb PRO: R$197/mês with Zélla AirB IA, Magic Onboarding, 4 imóveis, check-in virtual, PIX Gatekeeper, Lifecycle Hooks
- Airbnb MAX: R$397/mês with up to 12 imóveis, Calendar Sync, IA treinada, consultoria mensal
- ROI calculator shows "1 reserva direta/mês já paga o plano" for PRO
- No LINK-IN-BIO anywhere on Airbnb side (pricing, features, integrations all filtered)
