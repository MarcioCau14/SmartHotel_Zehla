# Guia de Arquitetura & Diagramas do Seu Zélla

Esta pasta contém o diagrama de arquitetura interativo do ecossistema Seu Zélla gerado via **Archify**.

## Diagramas Disponíveis

*   **[Diagrama de Arquitetura Interativo](file:///Users/marciocau/SeuZella_project/docs/diagrams/seuzella-architecture.html)**
    *   *Como visualizar:* Clique no link acima ou abra o arquivo diretamente no seu navegador.
    *   *Atalhos úteis no navegador:*
        *   Pressione `T` no teclado para alternar entre os temas **Claro (Light)** e **Escuro (Dark)**.
        *   Pressione `E` no teclado para abrir o menu de exportação rápida (onde você pode baixar em formato PNG, JPEG, WebP, SVG ou copiar o PNG em alta resolução para a área de transferência).

---

## Entendendo a Arquitetura do Seu Zélla

O sistema é dividido em quatro pilares fundamentais, representados no diagrama:

### 1. Ingress & Roteamento (Esquerda)
*   **SaaS Dashboard:** A interface web administrativa (desenvolvida em Next.js e TailwindCSS) utilizada pelos hoteleiros para monitorar hóspedes, métricas e configurar robôs. Os acessos passam pela **Vercel Edge** para carregamento ultrarrápido.
*   **WhatsApp & Airbnb Guests:** Os canais de contato por onde os hóspedes enviam mensagens. 
    *   O WhatsApp envia webhooks que batem no **Caddy/Nginx (VPS)** e são encaminhados para a API local.
    *   O Airbnb entra diretamente nas pipelines de IA protegidas.

### 2. Filtros & Segurança (Centro)
*   **Next.js Guard:** Camada que gerencia autenticação (NextAuth JWT) e segurança anti-brute-force (Rate Limiting).
*   **tenant-extension (Prisma):** Uma extensão customizada do banco de dados que intercepta toda e qualquer query SQL/SQLite. Ela injeta automaticamente o filtro de `tenantId` correspondente da sessão ativa, garantindo **isolamento multi-tenant absoluto** (comprovado com 0 vazamentos no teste de estresse).
*   **PIX Gatekeeper:** Validador e sanitizador de mensagens. Caso a resposta venha do Airbnb, ele bloqueia e remove chaves Pix para evitar banimentos na plataforma de terceiros.

### 3. Agentes Inteligentes (Swarm Core - Direita)
*   **Pousadas Swarm:** Robôs atuando via WhatsApp (Chain of Handlers) divididos por áreas:
    *   `RECEPTIONIST` / `CONCIERGE`: Lidam com check-in, wifi, regras e dúvidas comuns.
    *   `RESERVAS`: Realiza a cotação e negociação de reservas diretas.
*   **Airbnb Swarm:** Robôs dedicados à plataforma externa (com prompt de anfitrião amigável e RAG regional).
*   **Finance Swarm:** Agentes específicos (`JONY`, `MARIA`, `TEDD`) focados em monitoramento e conciliação de faturamento e PIX.

### 4. Bancos de Dados & Gateways (Extrema Direita)
*   **PostgreSQL:** Utilizado no Docker para gerenciar credenciais e sessões globais.
*   **SQLite (custom.db):** Banco de dados local ultrarrápido utilizado para logs de agentes e chats.
*   **Redis:** Cache rápido utilizado para guardar contextos regionais e rate limits.
*   **Evolution API:** Container Docker que gerencia o gateway de conexão com a API do WhatsApp.
