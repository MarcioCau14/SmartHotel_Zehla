# Plano de Implementação: ZEHLA Growth & Google Ads Action AI (Outbound 2.0)

Este plano descreve o design técnico e arquitetural para implementar o **ZEHLA Growth Engine** no ecossistema SmartHotel. Ele integra duas frentes estratégicas de prospecção e otimização de tráfego pago baseadas nos playbooks corporativos e no ecossistema Google Antigravity:
1.  **Motor de Outbound B2B 2.0:** Prospecção fria automatizada em massa (10.000+ contatos) com auditoria semântica de pousadas independentes, inteligência de copywriting PAS (Problem-Agitate-Solve) em Plain Text e rotação segura de domínios.
2.  **Action AI para Google Ads:** Integração de servidor MCP do Google Ads para execução de consultas GAQL, auditoria de desperdício financeiro, proteção de termos de alta conversão (Negative Conflict Shield) e otimização automática de landing pages direcionada por relatórios do Lighthouse.

---

## User Review Required

> [!IMPORTANT]
> **RESTRIÇÕES ARQUITETURAIS DE PRODUÇÃO (ZERO-SPAM E FINOPS):**
> 1. **Reputação de Domínio:** A prospecção dos 10.000 contatos exige a rotação física de **5 caixas postais** ativas distribuídas em **3 domínios secundários** de segurança para respeitar o limite conservador de 50 disparos diários por remetente. O envio direto do domínio institucional principal `zehla.app` é terminantemente proibido.
> 2. **Semântica de Baixo Atrito:** O primeiro e-mail é estritamente **Plain Text** (sem botões, sem imagens) e **sem links**. O envio do link da landing page ou vídeo demonstrativo ocorre apenas de forma reativa após resposta favorável.
> 3. **Defesa de Palavras-Chave:** O script de geração de termos negativos deve obrigatoriamente rodar a função `ConflictShield` cruzando a lista recomendada com os top 100 termos que converteram nos últimos 90 dias antes de sincronizar na conta de anúncios.

---

## Open Questions

> [!WARNING]
> Para a hospedagem da Evolution API e do servidor Docker MCP de Google Ads (`@lucksigog/google-ads-mcp-coolify`), você prefere criar dois serviços gratuitos independentes no Render.com ou deseja centralizá-los sob um mesmo painel docker-compose?

---

## Proposed Changes

### 1. Bounded Context: Growth & Outbound (`src/domain/growth`)
Implementaremos as regras de negócio de prospecção e a FSM que rege a esteira de atração fria.

#### [NEW] [OutboundCampaign.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/growth/entities/OutboundCampaign.ts)
- Entidade de domínio para controlar a distribuição de envios da lista de pousadas.
- Limita o envio diário ($L_{\text{diário}} \le 50$) e gerencia a rotação do array de domínios cadastrados.

#### [NEW] [PousadaAuditorService.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/growth/services/PousadaAuditorService.ts)
- Serviço que integra com NotebookLM/Search API via MCP.
- Analisa o domínio da pousada e extrai maturidade digital em formato JSON:
  ```json
  {
    "hasActiveSite": boolean,
    "hasDirectBookingEngine": boolean,
    "otaDependence": "high" | "medium" | "low"
  }
  ```

#### [NEW] [EmailGeneratorService.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/growth/services/EmailGeneratorService.ts)
- Aplica o framework de copy PAS (Dor da microgestão / Dependência financeira de OTAs).
- Força formatação de texto plano e valida a exclusão absoluta de links no primeiro contato.

---

### 2. Bounded Context: Google Ads Action AI (`src/infrastructure/marketing`)
Componentes para gerenciar a conexão MCP e automatizar a otimização de termos de busca.

#### [NEW] [GoogleAdsMcpClient.ts](file:///Users/marciocau/Projetos/zehla-backend/src/infrastructure/marketing/google-ads/GoogleAdsMcpClient.ts)
- Adaptador que se comunica com o servidor MCP Coolify/Docker.
- Traduz intenções em queries GAQL e envia atualizações para as listas do Google Ads.

#### [NEW] [ConflictShieldService.ts](file:///Users/marciocau/Projetos/zehla-backend/src/infrastructure/marketing/google-ads/ConflictShieldService.ts)
- Compara a recomendação de palavras-chave negativas com o histórico de conversão da propriedade.
- Bloqueia a exclusão se o termo coincidir com os geradores de lucro consolidados.

---

### 3. Camada de Aplicação e Rotas (`src/app/api`)

#### [NEW] [route.ts (Outbound Dispatch)](file:///Users/marciocau/Projetos/zehla-backend/src/app/api/marketing/outbound/route.ts)
- Endpoint que recebe a lista e enfileira os trabalhos no BullMQ com atrasos gaussianos (Box-Muller).

#### [NEW] [route.ts (Ads Audit)](file:///Users/marciocau/Projetos/zehla-backend/src/app/api/marketing/ads-audit/route.ts)
- Executa a varredura de desperdício em tempo real de termos sem conversões ($Spend \ge \$50.00$) e retorna o script `AdsApp` estruturado.

#### [NEW] [route.ts (Zipper Landing Pages)](file:///Users/marciocau/Projetos/zehla-backend/src/app/api/marketing/landing-pages/route.ts)
- Rota parametrizada para geração sob demanda de páginas de alta velocidade: `/api/marketing/landing-pages?cidade=rosa&servico=reserva`.
- Renderiza HTML sem barras de navegação (sem links de dispersão) e com botões de CTA responsivos ancorados no rodapé mobile.

---

## Verification Plan

### Automated Tests (Vitest)
- `src/__tests__/growth/OutboundCampaign.test.ts` — Validar que a rotação de caixas postais nunca excede o limite diário e que nenhum link é injetado no primeiro e-mail.
- `src/__tests__/marketing/ConflictShield.test.ts` — Testar o bloqueio de exclusão ao tentar negativar um termo que gerou conversão histórica.

### Manual Verification
1. **Simulação de Auditoria MCP:** Enviar domínios de pousadas reais em Praia do Rosa para o `PousadaAuditorService` e verificar a classificação JSON gerada pelo NotebookLM.
2. **Teste de Velocidade (Lighthouse):** Disparar o parser do Lighthouse contra as landing pages geradas pela rota `/api/marketing/landing-pages` e atestar performance $\ge 95$ no modo móvel.
