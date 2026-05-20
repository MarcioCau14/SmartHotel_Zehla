# ZEHLA — Modelo de Dados

## Visão Geral

O banco de dados utiliza **PostgreSQL** gerenciado via **Prisma ORM** com 36 modelos e 18 enums. O schema está em `prisma/schema.prisma` (911 linhas).

## Domínios e Modelos

### Auth (4 modelos)

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `User` | `users` | Usuários do sistema (CLIENT, ADMIN, SUPER_ADMIN, TEAM). Controle granular via `permissions[]`. |
| `Account` | `accounts` | Contas OAuth vinculadas (NextAuth). |
| `Session` | `sessions` | Sessões de autenticação. |
| `VerificationToken` | `verification_tokens` | Tokens de verificação de email. |

### Core Business (6 modelos)

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `Property` | `properties` | Entidade central do multi-tenancy. Cada pousada/hotel. Planos: LITE, PRO, MAX. |
| `Room` | `rooms` | Apartamentos/quartos por propriedade. |
| `Service` | `services` | Serviços oferecidos (café da manhã, estacionamento, etc.). |
| `Reservation` | `reservations` | Reservas com check-in/out, valores, status. |
| `Payment` | `payments` | Pagamentos vinculados a reservas (PIX, cartão, etc.). |
| `PricingRule` | `pricing_rules` | Regras de precificação sazonal (multiplier/fixedAmount). |

### Marketing (2 modelos)

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `Lead` | `leads` | Leads captados via SECRETARIA_AI, com enriquecimento MiroFish (redes sociais, OTA, etc.). |
| `EmailTracking` | `email_tracking` | Rastreamento de abertura de emails por lead. |

### Finance (3 modelos)

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `PousadaFinance` | `pousada_finance` | Diário financeiro: receita bruta/líquida, ocupação, ADR, RevPAR. Insight de IA por dia. |
| `FinanceTransaction` | `finance_transactions` | Transações individuais (receitas/despesas) por categoria. |
| `FinanceAlert` | `finance_alerts` | Alertas financeiros gerados por agentes (Jony, Maria, Tedd). |

### Security (2 modelos)

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `SecurityAlert` | `security_alerts` | Alertas de segurança do Guardian (CANARY_TOUCHED, HMAC_FAIL). |
| `SecurityIncident` | `security_incidents` | Incidentes registrados com resolução. |

### CRM (5 modelos)

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `CrmPipeline` | `crm_pipelines` | Pipelines de vendas com stages customizáveis. |
| `CrmContact` | `crm_contacts` | Contatos com tags, campos customizados, soft-delete. |
| `CrmInteraction` | `crm_interactions` | Interações (NOTE, CALL, EMAIL, WHATSAPP, MEETING). |
| `CrmDeal` | `crm_deals` | Negócios em pipeline, com valor, probabilidade, estágio. |
| `CrmTask` | `crm_tasks` | Tarefas com prioridade (LOW→URGENT), tipo e atribuição. |

### Connect (6 modelos)

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `ConnectProfile` | `connect_profiles` | Perfil público Link-in-Bio por propriedade. |
| `ConnectLink` | `connect_links` | Links do perfil (WhatsApp, Instagram, site). |
| `ConnectTheme` | `connect_themes` | Tema visual (cores, fonte, layout, botão). |
| `ConnectAnalytics` | `connect_analytics` | Analytics diário (views, clicks, geo, device, source). |
| `ConnectReview` | `connect_reviews` | Avaliações exibidas no perfil público. |
| `ConnectMedia` | `connect_media` | Mídia (imagens) da galeria do perfil. |

### Outros (8 modelos)

| Modelo | Tabela | Descrição |
|--------|--------|-----------|
| `AgentLog` | `agent_logs` | Logs de execução dos agentes de IA (tokens, custo, duração). |
| `Message` | `messages` | Mensagens de WhatsApp/texto por propriedade. |
| `SystemLog` | `system_logs` | Logs de sistema com nível, componente e metadados. |
| `ZeladorAction` | `zelador_actions` | Ações do agente Zelador (auto-recuperação). |
| `PixTransaction` | `pix_transactions` | Transações PIX com endToEndId. |
| `TrialBlacklist` | `trial_blacklist` | Blacklist de trials por email/telefone. |
| `Invoice` | `invoices` | Faturas mensais por propriedade. |
| `InvoiceItem` | `invoice_items` | Itens de fatura (PACKAGE_FEE, BOOKING_COMMISSION). |

## Relacionamentos Chave

```
User (1) ──< Property (N)
Property (1) ──< Room (N)
Property (1) ──< Reservation (N)
Property (1) ──< Lead (N)
Room (1) ──< Reservation (N)
Reservation (1) ── Payment (1)
Property (1) ── ConnectProfile (1)
ConnectProfile (1) ──< ConnectLink/Theme/Analytics/Review/Media (N)
Property (1) ──< CrmPipeline/Contact/Deal/Task (N)
Lead (1) ──< EmailTracking (N)
Invoice (1) ──< InvoiceItem (N)
Property (1) ──< PousadaFinance/FinanceTransaction/FinanceAlert (N)
```

## Fluxo de Dados Principal

```
Lead (captura) → Trial → Property (ativação) → Room (config) → Reservation → Payment
                                                    ↓
                                        Agent (IA) → Message / AgentLog
                                                    ↓
                                        Finance (PousadaFinance, Transaction)
                                                    ↓
                                        Invoice (mensal)
```

## Imutabilidade Financeira

Os modelos financeiros utilizam **encadeamento de hash (SHA-256 HMAC)** para garantir integridade WORM (Write Once Read Many). Qualquer tentativa de alteração em registros financeiros é bloqueada pelo middleware Prisma (`src/lib/prisma.ts:48-52`).

## Canários (Honeypots)

Os modelos `Property`, `Room`, `Reservation` e `Lead` possuem o campo `isCanary`. Registros marcados como canários funcionam como honeypots: qualquer consulta a eles dispara alerta CRÍTICO no Guardian (`src/lib/security/canary-detector.ts`).
