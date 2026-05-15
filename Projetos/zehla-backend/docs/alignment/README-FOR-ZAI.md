# ZEHLA SMARTHOTEL — README PARA CHAT Z.AI
# =============================================================================

## 🎯 O QUE VOCÊ PRECISA SABER

Você está construindo o FRONTEND de um sistema hoteleiro SaaS.
O BACKEND já está pronto e rodando no Google Antigravity.

## 📁 ARQUIVOS QUE VOCÊ RECEBEU

1. **DESIGN.md** → Sistema de design (cores, tipografia, componentes)
2. **BACKEND-STRUCTURE.md** → Estrutura do backend (modelos, endpoints)
3. **API-SPEC.md** → Especificação detalhada da API
4. **FRONTEND-REQUIREMENTS.md** → Requisitos do frontend
5. **BACKEND-FRONTEND-ALIGNMENT.md** → Como alinhar frontend com backend
6. **Este README** → Guia rápido

## 🚀 ORDEM DE CONSTRUÇÃO

Siga esta ordem EXATA:

### FASE 1: Fundação (1-2 dias)
1. `npx create-next-app@latest zehla-frontend`
2. Instalar dependências: tailwind, framer-motion, lucide-react, recharts
3. Configurar globals.css (dark mode)
4. Configurar layout.tsx (fontes)
5. Criar api/client.ts (HTTP client)
6. Criar hooks: useApi, useAuth

### FASE 2: Landing Page (2-3 dias)
7. HeroSection
8. PainPointsSection
9. FeaturesSection
10. HowItWorksSection
11. TestimonialsSection
12. PricingSection
13. CTASection

### FASE 3: Auth (1 dia)
14. Login page
15. Register page
16. ZCC Login page

### FASE 4: Client Dashboard (3-4 dias)
17. Layout (Sidebar + TopBar)
18. Tab: Painel
19. Tab: Terminal
20. Tab: Quartos
21. Tab: Reservas
22. Tab: Financeiro
23. Tab: Planilhas
24. Tab: Promoções
25. Tab: Configurações

### FASE 5: Admin Dashboard (3-4 dias)
26. Layout (ZCCSidebar)
27. Tab: Overview
28. Tab: Cognitivo
29. Tab: Terminal
30. Tab: Agentes
31. Tab: Propriedades
32. Tab: Marketing
33. Tab: Financeiro
34. Tab: WhatsApp
35. Tab: APIs
36. Tab: Segurança
37. Tab: Zelador

### FASE 6: Onboarding (1-2 dias)
38. Wizard (6 passos)

### FASE 7: Polimento (1-2 dias)
39. Animações
40. Responsividade
41. Testes

## 🔌 INTEGRAÇÃO COM BACKEND

### URL Base
```
Desenvolvimento: http://localhost:3000
```

### Como testar integração
```bash
# 1. Inicie o backend (em outro terminal)
cd zehla-backend && pnpm dev

# 2. Inicie o frontend
cd zehla-frontend && pnpm dev

# 3. Teste no navegador
# http://localhost:3001
```

### Endpoints principais
- `GET /api/health` → Health check
- `POST /api/agents/receptionist` → WhatsApp AI
- `POST /api/agents/reservations` → Reservas
- `GET /api/rooms?propertyId=xxx` → Quartos
- `GET /api/properties` → Propriedades

## 🎨 DESIGN SYSTEM

### Cores (use EXATAMENTE)
- Background: `#0F172A`
- Cards: `#1E293B`
- Primary CTA: `#F97316` (coral)
- AI accent: `#06B6D4` (cyan)
- Success: `#10B981`
- Danger: `#F43F5E`

### Fontes
- Body: Inter
- Data/Terminal: JetBrains Mono

### Regras
- Dark mode OBRIGATÓRIO
- Rounded corners generosos
- Glass-morphism em modais
- Animações sutis
- TUDO em português brasileiro

## ⚠️ REGRAS OBRIGATÓRIAS

1. TypeScript em TUDO
2. Tailwind CSS para estilos
3. Componentes funcionais
4. Trate erros com try/catch
5. Use loading states
6. Dark mode default
7. Copy em português
8. Sem jargão técnico
9. Lighthouse > 90
10. Responsivo mobile-first

## 🧪 TESTES

Após cada página, teste:
```javascript
// No console do navegador
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log)
// Deve retornar: { status: "OK" }
```

## 📞 DÚVIDAS?

Se tiver dúvidas durante a construção:
1. Consulte API-SPEC.md
2. Consulte BACKEND-STRUCTURE.md
3. Teste o endpoint diretamente
4. Pergunte ao usuário

---

**Boa sorte na construção! 🚀**
