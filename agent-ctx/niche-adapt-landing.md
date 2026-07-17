# Task: Adapt Landing Page Components to be Niche-Aware

## Summary
Successfully adapted three landing page components to be niche-aware, changing content dynamically based on whether the user selected "pousadas" or "anfitrioes" in the niche switcher.

## Files Modified

### 1. TestimonialsSection.tsx
- Imported `useNiche` from `@/contexts/NicheContext` and `getNicheContent` from `@/data/niche-content`
- Replaced hardcoded testimonials array with `content.testimonials` from `getNicheContent(niche)`
- Added `AnimatePresence mode="wait"` with `motion.div` keyed by `niche` for smooth transitions
- Updated section header: "O que os pousadeiros dizem" / "O que os anfitriões dizem"
- Updated subtitle text to be niche-aware
- Combined `role` and `location` fields from the Testimonial interface in the author display
- Assigned colors dynamically via `colorKeys` array cycling since niche content doesn't include a color field
- Used impeccable easing curve `cubic-bezier(0.2, 0.8, 0.2, 1)` for all transitions

### 2. PricingSection.tsx
- Imported `useNiche` and `getNicheContent`
- Used `content.pricing` (focusLabel, focusDesc) and displayed it as a focused line below the main description with a Sparkles icon
- Updated section heading: "para sua pousada" / "para seus imóveis"
- Added `descAnfitrioes` to each plan for niche-specific plan descriptions
- Added "Ideal para X imóveis" badge on each plan card (only visible in anfitrioes mode) with Building2 icon and blue styling
- Badge shows: Gratuito=1 imóvel, LITE=1–2 imóveis, PRO=3–5 imóveis, MAX=6+ imóveis
- Added `AnimatePresence mode="wait"` on the pricing focus line with key={niche}
- Removed unused `ArrowRight` import
- All existing pricing logic, toggle, and checkout flow preserved

### 3. FAQSection.tsx
- Imported `useNiche` and `getNicheContent`
- Replaced hardcoded `faqs` array with `content.faqs` from `getNicheContent(niche)`
- FAQ items now use `faq.question` and `faq.answer` (matching FAQItem interface)
- Updated section header: "Perguntas frequentes sobre Pousadas" / "Perguntas frequentes sobre Anfitriões"
- Added `AnimatePresence mode="wait"` with `motion.div` keyed by `niche` wrapping the FAQ list
- Used impeccable easing curve for smooth transitions
- All existing accordion/expand behavior preserved

## Technical Details
- All three components use `AnimatePresence mode="wait"` for smooth niche transitions
- Easing curve: `cubic-bezier(0.2, 0.8, 0.2, 1)` applied consistently
- Components remain `'use client'` as they use hooks
- No breaking changes to existing functionality
- Lint passes (only pre-existing warnings remain)
- Dev server runs without errors
