# Task: Create Comprehensive Dashboard TypeScript Interfaces

## Task ID
`dashboard-types-001`

## Agent
Types Architect

## Summary
Created `/home/z/my-project/src/types/dashboard.ts` with 6 comprehensive interfaces and utility types for the DDC (Dashboard do Cliente) that integrate with the existing codebase.

## What Was Done

### Analysis
- Reviewed existing types in `src/types/ddc.ts` (Guest, Booking, Conversation, KnowledgeEntry, TrainingPrompt, Notification, RevenueMetrics, DashboardState, etc.)
- Reviewed existing types in `src/types/index.ts` (AgentRequest, AgentResponse, WhatsAppWebhookPayload, RoomAvailability, PricingSuggestion)
- Reviewed Prisma schema models: Tenant, Property, AirBProperty, AirBScrapingJob, AirBSubscription, AirBConversation, AirBMessage, AirBRegionalKnowledge, AirBTransaction
- Reviewed `src/types/linkinbio.ts` for plan tier patterns

### File Created
`/home/z/my-project/src/types/dashboard.ts` — 6 interfaces + 5 utility types + 5 helper functions

### Interfaces Created
1. **TenantProfile** — Unified tenant profile extending Prisma Tenant model with:
   - Personal data (aligned with Tenant fields: name, email, phone, phoneAlt, role, plan, status)
   - Financial control (pixKey, pixKeyType, defaultPaymentMethod, billingHistory with BillingHistoryEntry)
   - WhatsApp delegation authorization (WhatsAppDelegationStatus, WhatsAppPermissionScope[], consentLog with ConsentLogEntry)
   - Onboarding state tracking (completedOnboardingSteps, onboardingStepTimestamps — persisted in DB, not localStorage)

2. **PropertyOnboarding** — Airbnb URL → Scrape → Review flow:
   - Auto-filled fields from scraping (title, description, propertyType, pricePerNight, maxGuests, bedrooms, bathrooms, houseRules, checkinTime, checkoutTime, amenities, photos, city, state, neighborhood, address, lat/lng) — all wrapped in FieldWithConfidence<T>
   - Fields owner MUST review manually (wifiName/Password, lockProvider/Code, hostKnowledge, neighborhoodTips, emergencyContacts, checkinInstructions, customHouseRules, pixKeyOverride)
   - Onboarding step tracker (status, currentStep, completedSteps with timestamps)
   - Scraping retry logic (scrapingRetryCount, scrapingMaxRetries)

3. **ClosingNotification** — Owner notification payload when Zélla closes a reservation:
   - Property context (NotificationPropertyContext)
   - Guest info and conversation summary (NotificationGuestInfo, NotificationConversationSummary)
   - Reservation details (NotificationReservationDetails with dates, guests, total, payment status)
   - Formatted WhatsApp message text
   - Owner response tracking (confirmed/rejected/needs_review)

4. **TrainingClosingScenario** — Cérebro Zélla dataset schema:
   - Property context (type, location, vibe, priceRange, maxGuests)
   - Conversation summary (initialInquiry, objections, closingPath, decisionMoment)
   - Notification payload reference
   - Intent classification tags (14 GuestIntentTag values)
   - Success metadata (confidence, ClosingTechnique enum with 10 techniques, EscalationPoint[])

5. **OnboardingWizardState** — Multi-step onboarding flow tracking:
   - Current step and progress
   - Completed steps with timestamps
   - Validation status per step (StepValidation with errors/warnings)
   - AirB subscription check (AirBSubscriptionCheck)
   - UI state (isProcessing, hasError)

6. **ScraperResult** — Structured output from Airbnb scraping:
   - Success/partial/failure status
   - Auto-filled fields with confidence scores (same fields as PropertyOnboarding auto-filled)
   - Fields requiring manual review (FieldRequiringReview<T>)
   - Source attribution (ScrapingSource)
   - Raw data preservation (RawScrapedData)
   - Error tracking with recovery flags

### Utility Types
- `ScrapingSource` — 'airbnb_api' | 'ai_extractor' | 'manual' | 'demo'
- `OnboardingStep` — 6-step union type for wizard steps
- `OnboardingStatus` — 9-value union for onboarding lifecycle
- `FieldWithConfidence<T>` — Generic wrapper with value, confidence (0-1), source, reviewed flag
- Supporting types: AirBPropertyType, PaymentMethod, TenantPlan, GuestIntentTag, ClosingTechnique, etc.

### Helper Functions
- `getNextStep()` / `getPreviousStep()` — Navigate wizard steps
- `calculateOnboardingProgress()` — Compute completion percentage
- `createFieldWithConfidence()` — Initialize typed fields
- `createEmptyStepValidations()` / `createEmptyCompletedSteps()` — Initialize wizard state

## Alignment with Existing Codebase
- All interfaces reference the same field names as Prisma models (tenantId, propertyId, airbnbUrl, airbnbId, etc.)
- ScrapingSource values match AirBScrapingJob.scrapingSource enum values
- PaymentMethod aligns with AirBSubscription.paymentMethod
- TenantPlan includes both general plans and AirB-specific plans (airb_pro, airb_max)
- Uses JSDoc comments in Portuguese as requested
- No lint errors introduced (verified with tsc --noEmit)
