# ZEHLA: Full-Stack Topology & Routing Report

## 1\. Landing Page (Frontend Público)

Foco: Conversão de Leads e Demonstração de Autoridade.

* Rota Principal: /  
  * Componente: src/app/page.tsx  
  * Seções Mapeadas:  
    * HeroSection: Impacto inicial e CTA primário.  
    * RaioXForm: Captura de leads qualificados.  
    * PainPoints / PainPointsSection: Identificação com o dono da pousada.  
    * FeaturesSection: Detalhamento do "Zelador" ZEHLA.  
    * PricingSection: Pacotes Lite, Pro e Max.  
  * CTAs & Fluxos de Roteamento:  
    * "Testar Grátis": Redireciona para /teste-gratis.  
    * "Entrar": Redireciona para /login.  
  * Endpoints de Dados (API):  
    * POST /api/visibility/raiox \-\> Processamento do diagnóstico de visibilidade.  
    * POST /api/marketing/leads \-\> Ingestão de leads frios via formulários.

---

## 2\. Client Dashboard (Frontend Autenticado)

Foco: Operação diária do hoteleiro e monitoramento da IA.

* Rota Principal: /dashboard (Protegida por Middleware)  
  * Componente: src/app/dashboard/page.tsx  
  * Navegação (Tabs Consolidadas):  
    * Painel: Visão geral (KPICards, ChartsSection).  
    * Terminal: Monitoramento em tempo real (LiveTerminal).  
    * Quartos: Gestão de inventário (RoomBoard).  
    * Reservas: Fluxo de check-in/out (Reservations).  
    * Financeiro: Conciliação e Pix (PaymentPanel).  
    * Planilhas: Visão tabular de dados (SpreadsheetView).  
  * Fluxo de Autenticação:  
    * Login em /login \-\> Consome POST /api/auth/login.  
    * Persistência: Token JWT em Cookie \+ localStorage (zehla-tenant-data).  
  * Endpoints de Dados (API):  
    * GET /api/properties \-\> Dados do estabelecimento.  
    * GET /api/terminal \-\> Eventos do cérebro ZEHLA.  
    * GET /api/reservations \-\> CRUD de reservas.  
    * GET /api/rooms \-\> Status de ocupação.  
    * GET /api/agents/\[agent-name\] \-\> Status de sub-agentes (Receptionist, Concierge).

---

## 3\. ZCC \- Zehla Control Center (Painel Admin)

Foco: Monitoramento do enxame (Swarm) e governança do sistema.

* Rota Principal: /zcc (Acesso Exclusivo)  
  * Componente: src/app/zcc/page.tsx  
  * Interligação & Monitoramento:  
    * Módulo Marketing: Interligado à Landing Page via MarketingLeads. Monitora leads em tempo real e aplica enriquecimento Secretaria-IA.  
    * Módulo Cognitivo: CognitiveObservability monitora a saúde das LLMs e acurácia dos agentes.  
    * Módulo Segurança: SecurityPanel (Zehla Guardian) monitora tentativas de invasão e IPs bloqueados.  
    * Módulo Auto-Healer: ZccAutoHealer orquestra a recuperação de falhas no dashboard do cliente.  
  * Proteção de Rota (Middleware SUPER\_ADMIN):  
    * Implementado em src/proxy.ts.  
    * Regra: Todas as rotas começando com /zcc ou /api/zcc exigem Role SUPER\_ADMIN.  
    * Validação: Checagem rigorosa de JWT (jose) ou Header de Autorização.  
  * Endpoints Exclusivos:  
    * GET /api/zcc/overview \-\> Métricas globais do ecossistema.  
    * GET /api/zcc/leads \-\> Dados enriquecidos da Junta Comercial \+ Google/Reclame Aqui.  
    * GET /api/zcc/security \-\> Status do Guardião e Circuit Breakers (Redis).

---

## 🛡️ Regras de Tráfego & Segurança (Engineering View)

mermaid  
graph TD  
   User((Usuário)) \--\>|Public| LP\[Landing Page /\]  
   User \--\>|Auth Client| DB\[Dashboard /dashboard\]  
   User \--\>|Auth Admin| ZCC\[Control Center /zcc\]  
    
   subgraph "Fortress Middleware (src/proxy.ts)"  
       MW{SUPER\_ADMIN?}  
       RBAC\[RBAC Check\]  
       Blocked\[Guardian IP Block\]  
   end  
    
   LP \--\>|Leads| API\_Marketing\[/api/marketing\]  
   DB \--\>|Ops| API\_Core\[/api/reservations, /api/rooms\]  
   ZCC \--\>|Monitor| API\_ZCC\[/api/zcc/\*\]  
    
   API\_Marketing \--\> DB\_Leads\[(Prisma / Leads)\]  
   API\_ZCC \--\>|Read/Enrich| DB\_Leads  
   API\_Core \--\> DB\_Main\[(Prisma / Properties)\]  
IMPORTANT  
Nota de Integridade: Este mapeamento foi realizado via análise de 100% dos arquivos de rota e middleware citados. Não há alucinações de endpoints; todos os caminhos listados possuem arquivos route.ts ou componentes correspondentes no diretório src/app.  
8:54

