# ZEHLA SMARTHOTEL — PLANEJAMENTO ESTRATÉGICO COMPLETO
# Cognitive Hospitality Operating System v2.5
**Data:** Abril 2026  
**Versão:** 1.0  
**Status:** Aprovado para desenvolvimento

---

## 1. VISÃO GERAL

SaaS multi-agente de IA para automação de pousadas e pequenos hotéis (5-35 quartos).  
**Público-alvo inicial:** Praia do Rosa (Imbituba/SC) — 150 pousadas.  
**Diferencial:** 8 agentes de IA operando 24/7, custo 5-10x menor que concorrentes.

---

## 2. ARQUITETURA HÍBRIDA

| Entidade | Domínio | Onde Roda | Por Quê |
|:---|:---|:---|:---|
| **Landing Page** | `zehla.com.br` | Vercel (gratuito) | CDN global, 99.9% uptime |
| **App Cliente** | `app.zehla.com.br` | Mac Mini M4 32GB | Controle total, baixo custo |
| **App Admin (ZCC)** | `admin.zehla.com.br` | Mac Mini M4 32GB | Separação de segurança |
| **API Backend** | `api.zehla.com.br` | Mac Mini M4 32GB | Latência zero para Ollama |
| **Banco de Dados** | PostgreSQL 16 | NVMe 4TB (Mac Mini) | Persistência real |
| **Cache/Filas** | Redis 7 | NVMe 4TB (Mac Mini) | Performance |

### Por que separado e não tudo junto:
- **Segurança:** admin não vê dados de cliente, cliente não acessa ferramentas admin
- **Escalabilidade:** cada app escala independentemente
- **Venda futura:** pode vender só o produto, não o painel admin
- **Resiliência:** se uma parte cai, as outras continuam

---

## 3. IDENTIDADE VISUAL

| Cor | Hex | Uso |
|:---|:---|:---|
| **Deep Ocean Blue** | `#0F172A` | Fundos, header, sidebar |
| **Coral Warmth** | `#F97316` | CTAs, botões, badges |
| **AI Cyan Glow** | `#06B6D4` | Indicadores de IA, status online |
| **Sandstone** | `#F5F5F4` | Cards, áreas de leitura |
| **Emerald** | `#10B981` | Sucesso, check-ins, pagamentos |
| **Rose** | `#F43F5E` | Perigo, cancelamentos, alertas |

- **Dark mode default** (hoteleiros trabalham à noite)
- **Glass-morphism** em cards e modais
- **Framer Motion** para animações suaves
- **Inter** (corpo) + **JetBrains Mono** (dados/terminal)
- **Ícones:** Lucide React

---

## 4. PACOTES DE PREÇOS (Praia do Rosa)

| Pacote | Preço | Quartos | Msg Inclusas | Extra | Margem |
|:---|---:|---:|---:|---:|---:|
| **Rosa Lite** | R$ 147/mês | 5-10 | 400 | R$ 0,31 | 71,7% |
| **Rosa Pro** | R$ 297/mês | 11-20 | 700 | R$ 0,26 | 85,9% |
| **Rosa Max** | R$ 497/mês | 21-35 | 1.500 | R$ 0,15 | 91,5% |

**Custo real de API por cliente:** R$ 0,30-0,88/mês (irrisório, imbuído no preço)  
**Cliente não vê "taxa de API"** — vê um pacote com créditos inclusos

---

## 5. LANDING PAGE — COPY

### Hero Section
- **Headline:** *"Sua pousada merece um zelador que não dorme"*
- **Subheadline:** *"O ZEHLA responde seus hóspedes no WhatsApp, gerencia reservas, ajusta preços e cuida da sua pousada — enquanto você cuida da vida."*
- **CTA Primário:** "Testar grátis por 7 dias" (coral #F97316)
- **CTA Secundário:** "Ver como funciona" (outline cyan #06B6D4)
- **Background:** Vídeo loop de drone da Praia do Rosa

### Pain Points Section
- "Você responde WhatsApp até às 23h → E perde reservas porque demorou 4h"
- "Você usa caderno para controle → E overbook acontece"
- "Você chuta o preço na alta temporada → E deixa dinheiro na mesa"

### Testimonials
- "Antes eu passava 4h no WhatsApp. Agora passo 20 minutos." — Maria, Pousada do Sol
- "O ZEHLA ajustou meus preços no réveillon e eu faturei 40% a mais." — João, Rosa Mar
- "Minha filha perguntou por que eu tava mais em casa. Eu disse: 'Conhece o ZEHLA?'" — Ana, Cantinho da Rosa

### CTA Final
- "A Praia do Rosa espera. E você?"
- "7 dias grátis. Sem cartão de crédito. Sem compromisso."

---

## 6. DASHBOARD CLIENTE — 8 ABAS

1. **🏠 Painel** — KPIs (ocupação, receita, reservas ativas, hóspedes)
2. **💻 Terminal** — Logs em tempo real (color coding)
3. **🛏️ Quartos** — Mapa visual com cores (verde/disponível, vermelho/ocupado, amarelo/limpeza)
4. **📅 Reservas** — Calendário + CRUD completo + check-in/out QR
5. **💰 Financeiro** — PIX, relatórios, histórico de transações
6. **📊 Planilhas** — Dados exportáveis (CSV, PDF)
7. **🎯 Promoções** — Ofertas especiais, pacotes sazonais
8. **⚙️ Configurações** — Perfil, notificações, integrações

---

## 7. DASHBOARD ADMIN (ZCC) — 10 ABAS + ZELADOR

1. **📊 Overview** — Métricas globais (MRR, churn, clientes ativos)
2. **🧠 Cognitivo** — Fleet ML, padrões aprendidos, evolução da IA
3. **💻 Terminal** — Logs de todos os agentes em tempo real
4. **🤖 Agentes** — MAL (Malha de Aprendizado), treinamento, métricas
5. **🏨 Propriedades** — Lista de clientes, status, ações
6. **📈 Marketing** — Leads capturados, campanhas, conversão
7. **💵 Financeiro** — MRR, projeções, inadimplência
8. **💬 WhatsApp** — Status das conexões, volume de mensagens
9. **🔌 APIs** — Endpoints, health checks, documentação
10. **🔒 Segurança** — Guardian Agent, ameaças, bloqueios
11. **🛡️ Zelador** — Saúde do sistema, ações automáticas, alertas ← NOVO

---

## 8. AGENTE ZELADOR (ZEHLA-Z)

```
SENSORES → CÉREBRO ML → ATUADORES
─────────   ───────────   ──────────
CPU/RAM     Classificador  Restart container
Logs        Priorizador    Kill process
Network     Preditor       Block IP
WhatsApp    Recomendador   Switch model
LLM quality              Alert human
```

- **Sensores:** Prometheus + Node Exporter + Loki
- **Cérebro:** Mistral 7B local (classifica problemas)
- **Atuadores:** Docker commands, iptables, ollama CLI
- **Dashboard:** Aba "Zelador" no ZCC
- **Aprendizado:** Fleet ML + RLHF (jornada 12-24 meses)

---

## 9. CRONOGRAMA — 16 SEMANAS (4 MESES)

### Fase 1: Fundação (Semanas 1-4)
- Semana 1: Setup Mac Mini, Docker, Ollama, modelos locais
- Semana 2: PostgreSQL, Redis, Prisma schema, NextAuth.js
- Semana 3: OpenClaw, 8 agentes (stubs), intents, Guardian
- Semana 4: Evolution API (WhatsApp), Pagarme (PIX), Cloudflare Tunnel

### Fase 2: Cliente (Semanas 5-8)
- Semana 5: Landing page no Vercel (7 seções)
- Semana 6: Onboarding wizard (6 passos)
- Semana 7: Dashboard cliente — Painel, Terminal, Quartos
- Semana 8: Dashboard cliente — Reservas, Financeiro, Trial

### Fase 3: Admin + Zelador (Semanas 9-12)
- Semana 9: ZCC Login, Overview, Cognitivo
- Semana 10: ZCC Agentes, Terminal, Propriedades
- Semana 11: ZCC Marketing, Financeiro, WhatsApp, APIs, Segurança
- Semana 12: Agente Zelador (sensores + ML + atuadores)

### Fase 4: Polimento (Semanas 13-16)
- Semana 13: Precificação dinâmica v1
- Semana 14: PWA (offline, push notifications)
- Semana 15: Testes E2E, performance, segurança
- Semana 16: Go-live + disparo 150 contatos Praia do Rosa

---

## 10. ESTRUTURA DE DIRETÓRIOS (MONOREPO)

```
zehla-smart-hotel/
├── apps/
│   ├── landing/          ← zehla.com.br (Vercel)
│   ├── client/           ← app.zehla.com.br (Mac Mini)
│   └── admin/            ← admin.zehla.com.br (Mac Mini)
├── packages/
│   ├── shared-ui/        ← Componentes compartilhados
│   ├── shared-types/     ← Tipos TypeScript
│   └── database/         ← Prisma schema + migrations
├── brain/
│   ├── engine/v2.5/      ← Motor cognitivo
│   ├── engine/zelador/   ← Agente Zelador ← NOVO
│   ├── ai-hub/           ← Ollama + Kimi router
│   ├── agents/           ← 8 agentes
│   └── security/         ← Guardian
└── infra/                ← Docker + scripts
```

---

## 11. CUSTOS

### Investimento Inicial (CAPEX)
| Item | USD | BRL |
|:---|---:|---:|
| Mac Mini M4 32GB/1TB | $1.399 | R$ 7.205 |
| Hub NVMe + SSD 4TB | $480 | R$ 2.472 |
| Acessórios | $164 | R$ 844 |
| **TOTAL** | **$2.043** | **R$ 10.521** |

### Custo Operacional Ano 1 (OPEX)
| Item | Ano 1 |
|:---|---:|
| Kimi K2.6 API (estratégico) | R$ 6.180 |
| VPS + domínio + eletricidade | R$ 1.440 |
| Outras APIs | R$ 620 |
| Internet backup (4G) | R$ 960 |
| **TOTAL OPEX** | **R$ 9.200** |

**TOTAL ANO 1: R$ 19.721** (CAPEX + OPEX)  
**vs Cloud 100%: R$ 98.880**  
**ECONOMIA: R$ 79.159**

---

## 12. PROJEÇÃO COM 150 POUSADAS

| Métrica | Valor |
|:---|---:|
| Receita mensal | R$ 34.051 |
| Lucro mensal | R$ 27.194 |
| Margem | 79,8% |
| Break-even | 3 clientes |
| Lucro anual | R$ 326.328 |

---

## 13. FLUXO DE TRABALHO — GOOGLE IDX + KIMI

### Backend (Google IDX)
- Criar workspace no IDX (`zehla-backend`)
- Subir PostgreSQL + Redis via Docker
- Desenvolver API REST (Next.js API routes)
- Testar endpoints com Postman/Thunder Client
- Commitar no GitHub/GitLab

### Frontend (Kimi + iMac/Mac Mini)
- Gerar código de componentes React aqui no Kimi
- Copiar para o projeto local no iMac/Mac Mini
- Testar visualmente no navegador
- Fazer commit e push

### Sincronização
- Backend no IDX → exposto via Cloudflare Tunnel
- Frontend no iMac → consome API do backend
- Quando Mac Mini chegar → migra backend do IDX para o Mac Mini
- IDX continua como ambiente de desenvolvimento/backup

---

## 14. PRÓXIMO PASSO IMEDIATO

1. **Criar workspace no Google IDX** (`zehla-backend`)
2. **Inicializar projeto Next.js 16** com App Router
3. **Configurar Docker** (PostgreSQL + Redis)
4. **Instalar dependências** (Prisma, NextAuth, BullMQ, etc.)
5. **Criar schema Prisma** (User, Property, Room, Reservation, etc.)
6. **Subir banco de dados** e rodar primeira migration

**Assim que o Mac Mini chegar:**
- Exportar projeto do IDX
- Importar no Mac Mini
- Subir Docker containers
- Configurar Ollama
- Apontar domínios para o Mac Mini

---

*Documento gerado em Abril 2026. Revisar após Semana 4.*
