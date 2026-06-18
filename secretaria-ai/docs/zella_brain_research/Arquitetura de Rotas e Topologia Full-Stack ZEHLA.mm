<map version="1.0.1">
<!-- FreeMind 格式导出 by NotebookLM Export Tool -->
<node TEXT="ZEHLA: Full-Stack Topology &amp; Routing, 4 filhos">
<node TEXT="Landing Page (Frontend Público), 3 filhos" POSITION="right">
<node TEXT="Rota Principal: /" />
<node TEXT="Seções, 5 filhos">
<node TEXT="HeroSection" POSITION="right" />
<node TEXT="RaioXForm" POSITION="left" />
<node TEXT="PainPoints" POSITION="right" />
<node TEXT="FeaturesSection" POSITION="left" />
<node TEXT="PricingSection" POSITION="right" />
</node>
<node TEXT="Endpoints API, 2 filhos">
<node TEXT="POST /api/visibility/raiox" POSITION="right" />
<node TEXT="POST /api/marketing/leads" POSITION="left" />
</node>
</node>
<node TEXT="Client Dashboard (Autenticado), 3 filhos" POSITION="left">
<node TEXT="Rota Principal: /dashboard" />
<node TEXT="Navegação, 6 filhos">
<node TEXT="Painel (KPIs)" POSITION="right" />
<node TEXT="Terminal (Real-time)" POSITION="left" />
<node TEXT="Gestão de Quartos" POSITION="right" />
<node TEXT="Reservas (Check-in/out)" POSITION="left" />
<node TEXT="Financeiro (Pix)" POSITION="right" />
<node TEXT="Planilhas (Dados)" POSITION="left" />
</node>
<node TEXT="Segurança e Dados, 3 filhos">
<node TEXT="Auth JWT (Cookie/LocalStorage)" POSITION="right" />
<node TEXT="GET /api/properties" POSITION="left" />
<node TEXT="GET /api/agents" POSITION="right" />
</node>
</node>
<node TEXT="ZCC - Zehla Control Center, 3 filhos" POSITION="right">
<node TEXT="Rota Principal: /zcc (Admin)" />
<node TEXT="Módulos de Gestão, 4 filhos">
<node TEXT="Marketing (Enriquecimento)" POSITION="right" />
<node TEXT="Cognitivo (LLM Health)" POSITION="left" />
<node TEXT="Segurança (Zehla Guardian)" POSITION="right" />
<node TEXT="Auto-Healer (Recuperação)" POSITION="left" />
</node>
<node TEXT="Governança, 3 filhos">
<node TEXT="Middleware SUPER_ADMIN" POSITION="right" />
<node TEXT="GET /api/zcc/overview" POSITION="left" />
<node TEXT="Circuit Breakers (Redis)" POSITION="right" />
</node>
</node>
<node TEXT="Infraestrutura &amp; Segurança, 4 filhos" POSITION="left">
<node TEXT="Middleware src/proxy.ts" />
<node TEXT="RBAC Check" />
<node TEXT="Guardian IP Block" />
<node TEXT="Persistência Prisma DB" />
</node>
</node>
</map>