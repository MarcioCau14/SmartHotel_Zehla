# Plano de Implementação: ZEHLA Growth & Google Ads Action AI (Outbound 2.0)

Este plano detalha o design técnico e a especificação de engenharia para o **ZEHLA Growth Engine** (Outbound 2.0 e Action AI para Google Ads), incorporando as diretrizes dogmáticas de segurança, conformidade e resiliência cibernética.

---

## User Review Required

> [!IMPORTANT]
> **DIRETIVAS OBRIGATÓRIAS DE ARQUITETURA E SEGURANÇA:**
> 1. **LGPD Opt-Out Semântico:** Todo e-mail em Plain Text deve conter a instrução de opt-out no rodapé: *"Para não receber mais nossos e-mails, responda com a palavra SAIR"*. Caso o lead responda com a intenção de descadastro, o sistema altera o estado da FSM para `BLACKLISTED` e aciona o módulo de expurgo físico de dados (ZDR).
> 2. **DSPy Signature Copywriting:** A geração de copy não utilizará templates estáticos ou concatenação de strings para evitar assinaturas de spam. O processo é regido por uma **DSPy Signature** declarativa (`GenerateOutboundSignature`), forjando uma variação semântica única baseada no perfil e localização da pousada.
> 3. **Shadow Mode (Google Ads):** Para mitigar riscos de orçamento e alucinação da IA, o adaptador de API do Google Ads operará em **Shadow Mode (Dry-Run)** por 4 semanas. Mutações (POST/DELETE) são proibidas; o agente apenas propõe alterações (DDiff) a serem autorizadas com 1 clique no Zehla Control Center (ZCC).
> 4. **Topologia Virtual Centralizada:** A Evolution API e o servidor MCP do Google Ads serão executados na mesma rede privada virtual do Docker Compose, sem exposição à internet pública (Zero-Trust).

---

## Open Questions

> [!NOTE]
> *Nenhuma questão em aberto. As decisões sobre hospedagem privada (centralização em docker-compose/Fly.io) e limites de entregabilidade (50 envios diários por caixa) foram consolidadas de forma definitiva na arquitetura.*

---

## Proposed Changes

### 1. Bounded Context: Growth & Outbound (`src/domain/growth`)

#### [NEW] [OutboundCampaign.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/growth/entities/OutboundCampaign.ts)
- Entidade rica que controla os limites diários por remetente.
- Distribui as mensagens via Round-Robin utilizando as caixas ativas dos domínios secundários de envio.
- Limita rigorosamente a $50$ disparos diários por inbox.

#### [NEW] [OutboundFSM.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/growth/entities/OutboundFSM.ts)
- Máquina de Estados Finitos para gerenciar o ciclo de vida do Lead:
  - Estados: `ACTIVE` ──(resposta: SAIR)──→ `BLACKLISTED` ──(expurgo)──→ `PURGED`.
  - Estados de Vendas: `CONTACTED` ──(resposta positiva)──→ `INTERESTED` ──(fechamento)──→ `CONVERTED`.

#### [NEW] [ZdrPrivacyModule.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/security/services/ZdrPrivacyModule.ts)
- Módulo de Privacidade Zero Data Retention.
- Ao receber o evento de transição para `BLACKLISTED`, executa o expurgo imediato de dados sensíveis na persistência (Supabase) para conformidade com a LGPD e a ANPD.

#### [NEW] [GenerateOutboundSignature.ts](file:///Users/marciocau/Projetos/zehla-backend/src/domain/growth/signatures/GenerateOutboundSignature.ts)
- Assinatura declarativa (DSPy-style) para o LLM.
- Input: `leadProfile: CRMLeadProfile` (Localização, LTV estimado, dependência detectada de OTAs).
- Output: `subject: string, bodyText: string`.
- Força a variação semântica impedindo e-mails sintaticamente idênticos que acionem hashes de spam.

---

### 2. Bounded Context: Google Ads Action AI (`src/infrastructure/marketing`)

#### [NEW] [GoogleAdsMcpClient.ts](file:///Users/marciocau/Projetos/zehla-backend/src/infrastructure/marketing/google-ads/GoogleAdsMcpClient.ts)
- Adaptador MCP encapsulando todas as respostas na mônada de erro `Result<T, E>`.
- Métodos de escrita interceptam a chamada de mutação e validam se a propriedade `shadowMode` é `true`:
  - Se `shadowMode === true`: Registra a alteração recomendada na base como uma proposta (`AdsChangeProposal`) e aborta a escrita na API.
  - Se `shadowMode === false`: Executa a mutação na API do Google Ads (restrito ao pós-homologação de 4 semanas).

#### [NEW] [ConflictShieldService.ts](file:///Users/marciocau/Projetos/zehla-backend/src/infrastructure/marketing/google-ads/ConflictShieldService.ts)
- Validador síncrono.
- Compara a recomendação de palavras-chave negativas do agente contra os top 100 termos com maior conversão histórica nos últimos 90 dias, retornando `Result.fail("NEGATIVE_KEYWORDS_CONFLICT")` em caso de sobreposição.

---

### 3. Camada de Aplicação e Rotas (`src/app/api`)

#### [NEW] [route.ts (ZCC Ads Proposals)](file:///Users/marciocau/Projetos/zehla-backend/src/app/api/marketing/ads-proposals/route.ts)
- Endpoint para listar e aprovar propostas de alteração de anúncios geradas pelo Shadow Mode.
- O operador humano aprova com 1 clique no ZCC, o que executa o script na conta real.

#### [MODIFY] [route.ts (ZMG Receive Webhook)](file:///Users/marciocau/Projetos/zehla-backend/src/app/api/webhooks/mercadopago/route.ts)
- Atualização para interceptar o fluxo de respostas de e-mail e mensageria.
- Se o payload da resposta contiver a palavra-chave semântica "SAIR":
  1. Classifica a intenção via roteador local.
  2. Transita o lead para `BLACKLISTED` na FSM.
  3. Dispara o expurgo imediato dos dados via `ZdrPrivacyModule`.

---

## Verification Plan

### Automated Tests (Vitest)
- `src/__tests__/growth/OutboundFSM.test.ts` — Validar transição imediata para `BLACKLISTED` ao receber "SAIR" e acionar o ZDR.
- `src/__tests__/growth/GenerateOutboundSignature.test.ts` — Validar que a assinatura do DSPy gera textos semânticos exclusivos com base no input.
- `src/__tests__/marketing/GoogleAdsShadowMode.test.ts` — Validar que nenhuma mutação direta é feita na API do Google Ads quando `shadowMode` está ativo, gravando a proposta no banco de dados.

### Manual Verification
1. **Auditoria de Propostas no ZCC:** Gerar uma recomendação de termo negativo de tráfego, verificar que ela surge no painel do ZCC como "Pendente de Aprovação" e validar que a mutação só ocorre no Google Ads após o clique de autorização.
2. **Teste de Opt-Out Simulado:** Disparar um webhook de resposta contendo "SAIR" para um lead ativo e auditar a tabela do Supabase para confirmar a deleção física de dados e o registro na tabela de exclusão (Blacklist).
