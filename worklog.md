---
Task ID: copy-rewrite
Agent: Copy Rewrite Agent
Task: Remove all technical/IA jargon from Seu Zélla landing page copy. Rewrite for pousada owners and Airbnb hosts — simple, clear, benefit-focused language.

Work Log:

## File 1: src/app/layout.tsx — Metadata & JSON-LD rewrite
- **Title**: "IA para Pousadas e Hotéis" → "Assistente Inteligente para Pousadas"
- **Description**: Removed "IA", "revenue management", "link-in-bio" → Added "preços inteligentes", "Booking.com sincronizado"
- **Keywords**: Removed 'escudo anti-taxas Meta 2026', 'Message Bundler', 'cognitive OS hospitality', 'IA para pousadas', 'IA para hotéis', 'WhatsApp IA 24 horas', 'revenue management pousada' → Replaced with 'assistente inteligente pousada', 'assistente inteligente hotel', 'WhatsApp atendimento 24 horas', 'preços inteligentes pousada', 'economia WhatsApp', 'reservas Booking.com', 'atendimento inteligente pousada'
- **og:title**: "IA para Pousadas" → "Assistente Inteligente para Pousadas"
- **og:description**: Removed "IA", "link-in-bio", "revenue management" → Added "assistente inteligente", "preços inteligentes", "Booking.com sincronizado"
- **og:image alt**: "Plataforma Cognitiva para Hospitalidade" → "Assistente Inteligente para Pousadas"
- **twitter:title**: "IA para Pousadas" → "Assistente Inteligente para Pousadas"
- **twitter:description**: Removed "IA", "link-in-bio" → Added "assistente inteligente", "preços inteligentes"
- **JSON-LD SoftwareApplication description**: Removed "com IA" → "Assistente inteligente de automação..."
- **JSON-LD Organization description**: Removed "Cognitive OS for Hospitality" → "Plataforma inteligente para pousadas e hotéis brasileiros — organiza, ajuda a lucrar mais e gastar menos."
- **JSON-LD Offer descriptions**: "WhatsApp IA 24/7" → "WhatsApp assistente inteligente 24/7"; "sem Zélla IA" → "sem assistente inteligente"
- **JSON-LD FAQ Q1 answer**: "plataforma de IA" → "assistente inteligente"
- **JSON-LD WebPage name**: "IA para Pousadas e Hotéis" → "Assistente Inteligente para Pousadas e Hotéis"

## File 2: src/components/landing/HeroSection.tsx — Hero headline & subtitle rewrite
- **Removed rotating mechanism entirely**: Deleted rotatingPhrases array, phraseIdx state, interval useEffect, AnimatePresence import and usage
- **H1 changed to static 2-line headline**: 
  - Line 1: "Organize e lucre mais"
  - Line 2: "gaste menos no WhatsApp." (emerald-500, bold)
- **Subtitle rewritten for all 3 variants**:
  - SSR/fallback: "O Zélla organiza sua pousada E ajuda a lucrar mais com preços inteligentes — e gastar menos no WhatsApp..."
  - Pousada: Same as fallback, ending with "Sincroniza Booking.com e entrega Guia Digital automático."
  - Airbnb: "...organiza seu imóvel... Conecta Airbnb e Booking.com e entrega Guia Digital automático."
- **Cleaned imports**: Removed AnimatePresence from framer-motion import

## File 3: src/data/niche-content.ts — All content rewrite
- **Pousada subheadline**: Removed "precificação dinâmica", "Escudo Meta 2026" → "preços inteligentes", "gastar menos no WhatsApp (80% economia)"
- **Airbnb subheadline**: Same pattern → "preços inteligentes", "gastar menos no WhatsApp (80% economia)"
- **heroStat labels (both niches)**: "receita com precificação dinâmica" → "mais receita com preços inteligentes"
- **Pain card "Message Bundling"**: Title → "Mensagens agrupadas", Desc → simple benefit language
- **Pain card "One-Shot Resolution"**: Title → "Responde tudo de uma vez", Desc → "Uma resposta densa que resolve todas as perguntas do hóspede — sem vai-e-volta de mensagens."
- **Pain card "Escudo Meta 2026"**: Title → "Economia no WhatsApp", Desc → "A Meta vai cobrar por mensagem em 2026. O Zélla já agrupa mensagens e responde tudo de uma vez para reduzir esse custo em até 80%..."
- **Pain card "A IA do Zélla" → "O assistente inteligente do Zélla"**
- **Step "A IA atende por você" → "O assistente atende por você"**
- **Step desc**: Removed "pela IA" → "O assistente inteligente..."
- **Feature desc**: "One-Shot Resolution: resposta densa" → "Resposta densa que resolve tudo de uma vez."
- **Dashboard pains**: "1-Click Handover" → "Assuma quando Quiser"; Removed "IA" references → "pause o assistente"
- **Dashboard stats**: "Atendimento IA" → "Atendimento inteligente"
- **Dashboard footerLeft**: "Convertido pela IA" → "Convertido pelo assistente"
- **Testimonials**: "a IA atende" → "o assistente atende"; "que é IA" → "que é automático"
- **Pricing focusDesc**: "a IA atende" → "o assistente atende"
- **FAQ "Escudo Meta 2026" → "O WhatsApp vai ficar mais caro?"**: Simple answer about Meta charging per message, Zélla grouping to save 80%
- **FAQ "Posso intervir"**: "pausa a IA" → "pausa o assistente"
- **Airbnb pain card**: "PIX Gatekeeper" → "Proteção contra banimento no Airbnb"
- **Airbnb step subtitle**: "Inbox Sync Airbnb" → "Sincroniza Airbnb"
- **Airbnb step desc**: "Lifecycle Hooks automáticos" → "Mensagens automáticas na hora certa"
- **Airbnb highlights**: "Lifecycle Hooks automáticos" → "Mensagens automáticas na hora certa"
- **Airbnb step 03 subtitle**: "Precificação dinâmica + Booking sync + Guia Digital" → "Preços inteligentes + Booking.com + Guia Digital"
- **Airbnb step 03 desc**: Removed "seasonality", "Channel Manager", "Escudo Meta 2026" → "Economia no WhatsApp reduz 80% dos custos"
- **Airbnb highlights**: "Precificação Dinâmica automática" → "Preços inteligentes automáticos"; "Escudo Meta 2026 (80% economia)" → "Economia no WhatsApp (80% menos custo)"
- **Airbnb pain card "Precificação Dinâmica" → "Preços Inteligentes"**: desc simplified (removed "seasonality")
- **Airbnb pain card stat**: "receita com precificação inteligente" → "mais receita com preços inteligentes"
- **Airbnb feature subtitle**: "base de conhecimento da IA" → "base de conhecimento do assistente"
- **Airbnb feature bottomLine**: "A IA aprende" → "O assistente aprende"
- **Airbnb dashboard stats**: "Atendimento IA" → "Atendimento inteligente"; "Do anúncio para a IA" → "Do anúncio para o assistente"
- **Airbnb FAQ "PIX Gatekeeper" → "Como o Zélla me protege de banimento no Airbnb?"**
- **Airbnb FAQ "Lifecycle Hooks" → "O Zélla envia mensagens automáticas na hora certa?"**
- **Airbnb pain card "Channel Manager" desc**: Simplified to just "Sincronize reservas de Airbnb e Booking.com automaticamente"

## Verification
- `bun run lint`: 0 errors, 488 warnings (all pre-existing, none from our changes)
- All "IA", "Escudo Meta", "precificação dinâmica", "Message Bundling", "One-Shot Resolution", "Cognitive OS", "revenue management", "Channel Manager", "seasonality", "Inbox Sync", "Lifecycle Hooks", "PIX Gatekeeper", "Review Engine" references removed from visible copy (only remaining in code comments which are not user-facing)
- Hero headline is now exactly 2 lines, static, no rotating mechanism

Summary: Successfully rewrote ALL landing page copy to speak the language of pousada owners and Airbnb hosts. No technical terms, no "IA", simple benefit-focused language throughout. Hero is clean 2-line static headline. Lint passes with 0 errors.
