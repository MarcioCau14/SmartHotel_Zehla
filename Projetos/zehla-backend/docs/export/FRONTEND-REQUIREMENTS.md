# ZEHLA SmartHotel — Frontend Requirements
# For Chat Z.AI Development

## Architecture
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + custom ZEHLA components
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Fonts**: Inter (body), JetBrains Mono (data)

## Pages to Build

### 1. Landing Page (zehla.com.br)
**Sections (7):**
1. **Hero**: Full-screen gradient, headline, subheadline, 2 CTAs, background video/image
2. **Pain Points**: 3 cards with icons showing problems
3. **Features**: 8 agent cards in grid (2x4 desktop, 1x mobile)
4. **How It Works**: 3-step vertical timeline
5. **Testimonials**: 3 quote cards with avatars
6. **Pricing**: 3-tier cards (Lite R$147, Pro R$297, Max R$497)
7. **CTA**: Email capture form, final call-to-action

**Key Elements:**
- Dark theme default
- Coral (#F97316) primary CTA
- Cyan (#06B6D4) AI indicators
- Glass-morphism cards
- Framer Motion scroll animations
- Responsive: mobile-first

### 2. Client Dashboard (app.zehla.com.br)
**Layout:**
- Sidebar (240px desktop, bottom nav mobile)
- Top bar (fixed, blur backdrop)
- Content area with tabs

**Tabs (8):**
1. **Painel**: 4 KPI cards (occupancy, revenue, reservations, guests), sparkline charts
2. **Terminal**: Live log stream, filters, color-coded entries
3. **Quartos**: Visual grid map, drag-and-drop status, room details modal
4. **Reservas**: Calendar view (month/week/day), list view, CRUD modal
5. **Financeiro**: Revenue area chart, payment list, PIX QR modal
6. **Planilhas**: Data table, export buttons (CSV, PDF)
7. **Promocoes**: Campaign form, promo code generator, analytics
8. **Configuracoes**: Profile form, notification toggles, plan upgrade

**Key Elements:**
- Room status colors: emerald (available), rose (occupied), amber (cleaning)
- Trial countdown banner (amber warning, then rose expired)
- AI typing indicator (cyan pulsing dots)
- Real-time badge updates

### 3. Admin Dashboard (admin.zehla.com.br)
**Layout:**
- Sidebar (240px)
- Top bar with global alerts
- Dense information panels

**Tabs (10 + Zelador):**
1. **Overview**: Global KPIs, MRR chart, property count, churn rate
2. **Cognitivo**: Fleet ML visualization, learning curve chart
3. **Terminal**: System logs with severity filters
4. **Agentes**: Agent status grid, MAL network graph, training controls
5. **Propriedades**: Data table with actions (edit, suspend, delete)
6. **Marketing**: Lead funnel chart, campaign performance
7. **Financeiro**: Revenue consolidation, projections
8. **WhatsApp**: Connection status, message volume chart
9. **APIs**: Endpoint health table, response times
10. **Seguranca**: Guardian dashboard, threat timeline
11. **Zelador**: System health gauges, automated actions log, alerts

**Key Elements:**
- Terminal-style logs (monospace, color-coded)
- Network/graph visualizations for MAL
- Real-time metrics with auto-refresh
- Admin-only routes (protected by role middleware)

### 4. Onboarding Wizard (6 steps)
1. Welcome screen
2. Personal data (name, email, phone, CPF)
3. Property data (name, address, capacity, CNPJ)
4. Room registration (type, capacity, price, amenities)
5. Services offered (checkboxes)
6. Payment setup (PIX key) + confirmation

**Key Elements:**
- Progress stepper (top)
- Form validation (Zod)
- Auto-save to localStorage
- Summary review before submit

### 5. Auth Pages
- **Login** (/login): Email + password, "Esqueci senha" link
- **Register** (/register): Multi-step form
- **ZCC Login** (/zcc-login): Separate admin login, optional 2FA

## API Integration
All frontend pages consume the backend API documented in API-SPEC.md.

Key integration points:
- `apiClient` utility for HTTP requests
- `useApi` hook for loading/error states
- `useAuth` hook for session management
- Polling every 30s for real-time data

## Design System
See DESIGN.md for complete specifications:
- Colors, typography, spacing
- Component styles (buttons, cards, inputs, badges)
- Layout principles, responsive behavior
- Do's and don'ts

## Performance Requirements
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Bundle size < 200KB initial

## Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Reduced motion support
