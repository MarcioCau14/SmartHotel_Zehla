# ZEHLA SmartHotel — DESIGN.md
# Cognitive Hospitality Operating System v2.5
# Inspired by: Airbnb (warmth), Linear (precision), Supabase (dark emerald), Stripe (elegance)
# Target: Pousada owners in Praia do Rosa, Brazil — ages 35-65, non-technical

---

## 1. Visual Theme & Atmosphere

### Design Philosophy
ZEHLA is a "digital concierge" — warm, trustworthy, and quietly intelligent. The UI should feel like a premium beachside hotel lobby at dusk: calm, inviting, and effortlessly organized. We serve pousada owners who are overwhelmed by operations; our design must reduce cognitive load, never add to it.

### Mood Keywords
- Warm professionalism
- Coastal serenity
- Invisible intelligence
- Human-first automation

### Density
- **Landing page**: Medium density, generous whitespace, breathing room
- **Dashboard**: High density for data, but with clear visual hierarchy
- **Admin (ZCC)**: Very high density, terminal-native, information-rich

### Surface Philosophy
- Dark-first interface (owners check dashboards at night after guests sleep)
- Glass-morphism for overlays and modals (like ocean mist)
- Rounded corners everywhere (friendly, non-corporate)
- Subtle animations (Framer Motion) — never jarring, always purposeful

---

## 2. Color Palette & Roles

### Primary Palette

| Token | Hex | RGB | Role |
|-------|-----|-----|------|
| `--ocean-deep` | `#0F172A` | 15, 23, 42 | Primary background, sidebar, headers |
| `--coral-warm` | `#F97316` | 249, 115, 22 | CTAs, primary buttons, accents, highlights |
| `--cyan-glow` | `#06B6D4` | 6, 182, 212 | AI indicators, status online, sparklines, hover |
| `--sandstone` | `#F5F5F4` | 245, 245, 244 | Card backgrounds, light surfaces, reading areas |
| `--emerald` | `#10B981` | 16, 185, 129 | Success states, check-ins, payments confirmed |
| `--rose` | `#F43F5E` | 244, 63, 94 | Errors, cancellations, trial expiring, alerts |
| `--amber` | `#F59E0B` | 245, 158, 11 | Warnings, trial ending, high occupancy |

### Neutral Scale

| Token | Hex | Usage |
|-------|-----|-------|
| `--void` | `#020617` | Deepest background (ZCC terminal) |
| `--slate-900` | `#0F172A` | Primary dark background |
| `--slate-800` | `#1E293B` | Card backgrounds, elevated surfaces |
| `--slate-700` | `#334155` | Borders, dividers, inactive elements |
| `--slate-600` | `#475569` | Secondary text, placeholders |
| `--slate-500` | `#64748B` | Tertiary text, timestamps |
| `--slate-400` | `#94A3B8` | Muted labels, disabled states |
| `--slate-300` | `#CBD5E1` | Body text on dark |
| `--slate-200` | `#E2E8F0` | Headings on dark |
| `--slate-100` | `#F1F5F9` | Light mode text |

### Gradient Accents

| Name | Value | Usage |
|------|-------|-------|
| `gradient-hero` | `linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)` | Hero sections, landing page |
| `gradient-coral` | `linear-gradient(135deg, #F97316 0%, #FB923C 100%)` | Primary buttons, CTAs |
| `gradient-cyan` | `linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)` | AI badges, sparklines |
| `gradient-card` | `linear-gradient(180deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.95) 100%)` | Glass cards |

### Semantic Colors

| Context | Color | Example |
|---------|-------|---------|
| Occupied room | `--rose` | Red badge on room map |
| Available room | `--emerald` | Green badge on room map |
| Cleaning room | `--amber` | Yellow badge on room map |
| Maintenance | `--slate-500` | Gray badge |
| AI active | `--cyan-glow` | Pulsing dot |
| Trial active | `--coral-warm` | Countdown banner |
| Trial expired | `--rose` | Blocked screen |

---

## 3. Typography Rules

### Font Families

| Role | Font | Weights | Fallback |
|------|------|---------|----------|
| Display / Headings | `Inter` | 300, 400, 500, 600, 700 | system-ui, sans-serif |
| Body / UI | `Inter` | 400, 500, 600 | system-ui, sans-serif |
| Data / Terminal | `JetBrains Mono` | 400, 500 | monospace |
| Accent / Quotes | `Inter` (italic) | 400 | serif |

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-hero` | 56px / 3.5rem | 700 | 1.1 | -0.02em | Landing hero headline |
| `text-h1` | 40px / 2.5rem | 700 | 1.2 | -0.02em | Page titles |
| `text-h2` | 32px / 2rem | 600 | 1.25 | -0.01em | Section headings |
| `text-h3` | 24px / 1.5rem | 600 | 1.3 | -0.01em | Card titles |
| `text-h4` | 20px / 1.25rem | 500 | 1.4 | 0 | Subsection titles |
| `text-body` | 16px / 1rem | 400 | 1.6 | 0 | Body text |
| `text-small` | 14px / 0.875rem | 400 | 1.5 | 0 | Secondary text |
| `text-xs` | 12px / 0.75rem | 500 | 1.4 | 0.01em | Labels, badges |
| `text-mono` | 14px / 0.875rem | 400 | 1.5 | 0 | Code, data, terminal |

### Typography Rules
- **Headings**: Always `-tracking-tight` (tight letter-spacing)
- **Body**: `leading-relaxed` (1.6 line height) for readability
- **Data/Terminal**: Always `font-mono`, `text-cyan-glow` for live data
- **All caps**: Only for labels and badges, with `tracking-wider`
- **Max line length**: 65ch for body text (optimal reading)

---

## 4. Component Stylings

### Buttons

#### Primary Button (Coral)
```
Background: gradient-coral
Text: white, font-weight 600
Padding: 12px 24px (md), 16px 32px (lg)
Border-radius: 12px
Shadow: 0 4px 20px rgba(249, 115, 22, 0.3)
Hover: scale(1.02), shadow intensifies
Active: scale(0.98)
Transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)
```

#### Secondary Button (Cyan)
```
Background: transparent
Border: 2px solid --cyan-glow
Text: --cyan-glow, font-weight 600
Padding: 12px 24px
Border-radius: 12px
Hover: background --cyan-glow/10, text white
```

#### Ghost Button
```
Background: transparent
Text: --slate-300
Padding: 8px 16px
Border-radius: 8px
Hover: background white/5
```

#### Danger Button
```
Background: --rose
Text: white
Padding: 12px 24px
Border-radius: 12px
Hover: background #E11D48
```

### Cards

#### Standard Card
```
Background: --slate-800
Border: 1px solid --slate-700
Border-radius: 16px
Padding: 24px
Shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
Hover: border-color --slate-600, shadow intensifies
```

#### Glass Card (for overlays/modals)
```
Background: rgba(30, 41, 59, 0.7)
Backdrop-filter: blur(20px)
Border: 1px solid rgba(255, 255, 255, 0.1)
Border-radius: 20px
Padding: 32px
Shadow: 0 25px 50px rgba(0, 0, 0, 0.25)
```

#### Metric Card (Dashboard)
```
Background: --slate-800
Border: 1px solid --slate-700
Border-radius: 16px
Padding: 20px
Top border: 3px solid (color varies by metric)
  - Revenue: --emerald
  - Occupancy: --coral-warm
  - Messages: --cyan-glow
```

### Inputs

#### Text Input
```
Background: --slate-800
Border: 1px solid --slate-700
Border-radius: 12px
Padding: 12px 16px
Text: --slate-200
Placeholder: --slate-500
Focus: border --cyan-glow, shadow 0 0 0 3px rgba(6, 182, 212, 0.2)
Transition: all 200ms
```

### Badges

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Success | `--emerald/20` | `--emerald` | `--emerald/30` |
| Warning | `--amber/20` | `--amber` | `--amber/30` |
| Danger | `--rose/20` | `--rose` | `--rose/30` |
| Info | `--cyan-glow/20` | `--cyan-glow` | `--cyan-glow/30` |
| Neutral | `--slate-700` | `--slate-400` | `--slate-600` |

All badges: `rounded-full`, `px-2.5 py-0.5`, `text-xs font-medium`

### Navigation

#### Sidebar (Client Dashboard)
```
Width: 240px (desktop), 0px collapsed (mobile)
Background: --slate-900
Border-right: 1px solid --slate-800
Logo area: 64px height, centered
Nav items: height 44px, padding 12px 20px
Active item: background --coral-warm/10, text --coral-warm, left border 3px --coral-warm
Inactive item: text --slate-400
Hover: background white/5
Icon: 20px, margin-right 12px
```

#### Top Bar
```
Height: 64px
Background: --slate-900/80
Backdrop-filter: blur(12px)
Border-bottom: 1px solid --slate-800
Position: fixed
Z-index: 40
```

### Room Map (Grid)

```
Grid: 4 columns (desktop), 2 columns (mobile)
Gap: 16px
Room card: 120px height
Status indicator: 8px dot, top-right corner
Room number: text-h4, --slate-200
Room type: text-xs, --slate-500
Price: text-small, --emerald
```

Status colors:
- Available: `--emerald` dot, `--emerald/10` background
- Occupied: `--rose` dot, `--rose/10` background
- Cleaning: `--amber` dot, `--amber/10` background
- Maintenance: `--slate-500` dot, `--slate-700` background


---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps, icon padding |
| `space-2` | 8px | Inline elements, badge padding |
| `space-3` | 12px | Button padding, input padding |
| `space-4` | 16px | Card padding, grid gaps |
| `space-5` | 20px | Section internal spacing |
| `space-6` | 24px | Card padding (large), modal padding |
| `space-8` | 32px | Section separation |
| `space-10` | 40px | Major section breaks |
| `space-12` | 48px | Page padding (horizontal) |
| `space-16` | 64px | Hero spacing |
| `space-20` | 80px | Landing section separation |

### Grid System

- **Desktop**: 12-column grid, max-width 1280px, centered
- **Tablet**: 8-column grid
- **Mobile**: 4-column grid
- **Gutter**: 24px (desktop), 16px (mobile)

### Z-Index Scale

| Layer | Z-Index | Element |
|-------|---------|---------|
| Background | 0 | Page background |
| Content | 10 | Cards, text |
| Sticky | 30 | Sticky headers |
| Overlay | 40 | Backdrop, modals |
| Dropdown | 50 | Select menus, tooltips |
| Toast | 60 | Notifications |
| Modal | 70 | Dialogs |

---

## 6. Depth & Elevation

### Shadow System

| Level | Shadow | Usage |
|-------|--------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.1)` | Buttons, small elements |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.2)` | Modals, popovers |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.25)` | Full-screen overlays |
| `shadow-glow-coral` | `0 0 40px rgba(249,115,22,0.3)` | Primary CTAs, highlights |
| `shadow-glow-cyan` | `0 0 40px rgba(6,182,212,0.3)` | AI indicators |

### Surface Hierarchy

| Layer | Background | Border | Usage |
|-------|-----------|--------|-------|
| Base | `--slate-900` | none | Page background |
| Elevated 1 | `--slate-800` | `--slate-700` | Cards, panels |
| Elevated 2 | `--slate-800` | `--slate-600` | Hover states |
| Elevated 3 | `rgba(30,41,59,0.7)` | `rgba(255,255,255,0.1)` | Glass overlays |
| Floating | `--slate-900` | `--slate-700` | Modals, toasts |

---

## 7. Do's and Don'ts

### Do
- Use dark mode as default (owners work nights)
- Use coral for primary actions (warm, inviting)
- Use cyan for AI-related elements (intelligent, futuristic)
- Use generous whitespace on landing page (breathing room)
- Use rounded corners (16px+ for cards, 12px for buttons)
- Use glass-morphism sparingly (modals, overlays only)
- Use Framer Motion for subtle entrance animations
- Use monospace for data/terminal/logs
- Use Portuguese as primary language (target audience)
- Use icons from Lucide React (consistent, lightweight)

### Don't
- Use sharp corners (too corporate, intimidating)
- Use pure black (`#000000`) — always use `--void` or `--slate-900`
- Use more than 3 colors in a single view
- Use technical jargon in the UI ("LLM", "API", "endpoint")
- Use bright white backgrounds (hurts eyes at night)
- Use tiny touch targets (minimum 44px for mobile)
- Use all-caps for body text (shouting)
- Use generic stock photos (use real Praia do Rosa imagery)

---

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Behavior |
|------|-------|----------|
| `xs` | < 480px | Single column, stacked layout |
| `sm` | 480px | 2-column grids, simplified nav |
| `md` | 768px | Sidebar collapses to bottom nav |
| `lg` | 1024px | Full sidebar, 3-column grids |
| `xl` | 1280px | Max-width container, full layout |
| `2xl` | 1536px | Extra spacing, larger cards |

### Mobile-First Rules
- Sidebar becomes bottom navigation on mobile
- Room map becomes scrollable horizontal list
- Tables become cards
- Modals become full-screen sheets
- Touch targets minimum 44px

### Touch Targets
- Buttons: 48px minimum height
- Nav items: 44px minimum
- Form inputs: 48px minimum
- Cards: Full-width tap on mobile

---

## 9. Agent Prompt Guide

### Quick Color Reference

```
Primary background: #0F172A (slate-900)
Primary action: #F97316 (coral/orange-500)
AI accent: #06B6D4 (cyan-500)
Success: #10B981 (emerald-500)
Warning: #F59E0B (amber-500)
Danger: #F43F5E (rose-500)
Text primary: #F5F5F4 (stone-100)
Text secondary: #94A3B8 (slate-400)
Card background: #1E293B (slate-800)
Border: #334155 (slate-700)
```

### Ready-to-Use Prompts

**Landing Page Hero:**
```
Create a hero section with:
- Full-width gradient background (ocean-deep to slate-800)
- Headline: "Sua pousada merece um zelador que nao dorme" in text-hero, white
- Subheadline in text-h3, slate-300
- CTA button: coral gradient, "Testar gratis por 7 dias"
- Background: subtle animated wave pattern or drone footage overlay
```

**Dashboard KPI Card:**
```
Create a metric card with:
- Background: slate-800, border slate-700
- Top border: 3px solid (color based on metric type)
- Title: text-small, slate-400, uppercase
- Value: text-h2, white
- Change indicator: badge (emerald for positive, rose for negative)
- Sparkline chart in cyan-glow
```

**Room Status Grid:**
```
Create a room grid with:
- 4-column layout on desktop, 2 on mobile
- Each room: card with status-colored dot (top-right)
- Room number: text-h4, white
- Room type: text-xs, slate-500
- Price: text-small, emerald
- Status background tint (10% opacity of status color)
```

**AI Chat Bubble:**
```
Create a chat message bubble:
- Inbound (guest): slate-800 background, left-aligned
- Outbound (agent): coral/10 background, right-aligned
- Agent avatar: cyan-glow circle with robot icon
- Timestamp: text-xs, slate-500
- Typing indicator: 3 bouncing dots in cyan-glow
```

**Trial Countdown Banner:**
```
Create a trial banner:
- Background: amber/10, border amber/30
- Icon: Clock in amber
- Text: "Faltam X dias no seu periodo de teste"
- CTA: "Ativar agora" button in coral
- Progress bar: amber fill on slate-700 track
```

---

## 10. Page Specifications

### Landing Page (zehla.com.br)

**Sections (7 total):**
1. **Hero**: Full-screen video background (Praia do Rosa drone footage), headline, subheadline, 2 CTAs
2. **Pain Points**: 3 cards showing problems (WhatsApp overload, manual booking, price guessing)
3. **Features**: 8 agent cards in 2x4 grid with icons
4. **How It Works**: 3-step timeline (Sign up → Connect WhatsApp → Let ZEHLA work)
5. **Testimonials**: 3 cards with quotes from pousada owners
6. **Pricing**: 3-tier cards (Lite/Pro/Max) with feature lists
7. **CTA**: Final call-to-action with email capture form

### Client Dashboard (app.zehla.com.br)

**Layout:**
- Sidebar (240px): Logo, 8 nav items, user profile
- Top bar: Property selector, notifications, trial countdown
- Content area: Tab-based navigation

**Tabs (8 total):**
1. **Painel**: KPI grid (occupancy, revenue, reservations, guests), sparklines
2. **Terminal**: Live log stream with color-coded entries
3. **Quartos**: Visual room map with drag-and-drop status
4. **Reservas**: Calendar view + list view, CRUD operations
5. **Financeiro**: Revenue charts, payment status, PIX QR codes
6. **Planilhas**: Data export (CSV, PDF)
7. **Promocoes**: Campaign creation, discount codes
8. **Configuracoes**: Profile, notifications, integrations

### Admin Dashboard (admin.zehla.com.br)

**Layout:**
- Sidebar (240px): ZCC logo, 10 nav items
- Top bar: Global metrics, alerts, admin profile
- Content area: Dense information panels

**Tabs (10 + Zelador):**
1. **Overview**: Global KPIs, MRR, churn, active properties
2. **Cognitivo**: Fleet ML visualization, learning patterns
3. **Terminal**: System-wide logs
4. **Agentes**: MAL grid, agent status, training controls
5. **Propriedades**: Property list with status/actions
6. **Marketing**: Lead funnel, campaign performance
7. **Financeiro**: Revenue consolidation, projections
8. **WhatsApp**: Connection status, message volume
9. **APIs**: Endpoint health, documentation
10. **Seguranca**: Guardian dashboard, threat log
11. **Zelador**: System health, automated actions, alerts

---

*DESIGN.md v1.0 — ZEHLA SmartHotel*
*Generated for AI agent consumption*
*Reference: https://github.com/VoltAgent/awesome-design-md*
