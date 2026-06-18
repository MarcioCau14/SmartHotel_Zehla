# 🚀 COMANDO FULL STACK AGENT — PÁGINAS DE VENDAS ZEHLA
## Instruções para reconstruir as páginas /vendas/lite, /vendas/pro, /vendas/max

---

## 📋 ANTES DE COMEÇAR, VASCULHE O PROJETO:

1. Leia `prisma/schema.prisma` — modelos `Lead`, `Property`, `ConnectProfile`
2. Leia `src/lib/sales/recommend-plan.ts` — motor de recomendação
3. Leia `src/components/sales/` — componentes existentes
4. Leia `src/components/landing/` — componentes de landing page
5. Leia `src/app/api/` — endpoints existentes (especialmente `/api/track/`, `/api/mkt/`)
6. Leia `src/lib/brain/` — sistemas de IA e classificação
7. Leia `src/lib/swipe/` — sistema de templates de mensagens
8. Leia `src/app/connect/` — se existir, sistema de perfil/linktree

---

## 🎯 O QUE CONSTRUIR

### 1. Tabela Comparativa de Preços (OBRIGATÓRIO)
**Local:** `src/components/sales/PricingTable.tsx`

Componente que exibe os 3 planos lado a lado + FREE (Grátis). Deve aparecer em TODAS as 3 páginas de vendas.

```
| CARACTERÍSTICA          | GRÁTIS         | LITE          | PRO           | MAX           |
|------------------------|---------------|--------------|--------------|--------------|
| Preço                  | R$ 0          | R$ 248/mês   | R$ 448/mês   | R$ 798/mês   |
| Taxa por reserva       | 5%            | TAXA ZERO    | TAXA ZERO    | TAXA ZERO    |
| Atendente IA 24h       | 50 msg/mês    | Ilimitado    | Ilimitado    | Ilimitado    |
| Perfil da Pousada      | Sim           | Sim          | Sim          | Sim          |
| Linktree ZEHLA         | Sim           | Sim          | Sim          | Sim          |
| Link Instagram         | Sim           | Sim          | Sim          | Sim          |
| Agenda de Reservas     | —             | Celular      | Completa     | Completa     |
| Recebimento Pix        | —             | Direto       | Direto       | Direto       |
| Preços Inteligentes    | —             | —            | Sim          | Sim          |
| Recuperação de Vendas  | —             | —            | Sim          | Sim          |
| Promoções por IA       | —             | —            | Sim          | Sim          |
| Suporte                | Comunidade    | Email        | WhatsApp VIP | Engenharia   |
| Multi-Hotel            | —             | —            | —            | Sim          |
| Relatórios             | Básico        | Básico       | Avançado     | Profissional |
```

**Design:** Fundo escuro (black), glass cards com bordas neon. O plano FREE deve ter destaque menor, o PRO deve ter badge "MAIS ESCOLHIDO" com gradiente laranja-dourado, o MAX com badge "MELHOR CUSTO-BENEFÍCIO" verde esmeralda.

**CTA por linha:**
- FREE: "Começar Grátis" → `/teste-gratis?plan=free`
- LITE: "Quero Lite" → `/teste-gratis?plan=lite`
- PRO: "Ativar PRO" → `/teste-gratis?plan=pro`
- MAX: "Falar com Consultor" → abre `ExclusiveWaitlistForm`

**Copy da linha FREE:**
> "Teste o ZEHLA sem compromisso. 50 atendimentos IA grátis por mês. Conheça o perfil da sua pousada e compartilhe seu linktree no Instagram. Quando quiser mais, escolha seu plano."

---

### 2. Plano GRÁTIS (FREE) — Nova Página
**Local:** `src/app/vendas/free/page.tsx`

Página de vendas do plano gratuito. Deve ser a porta de entrada para novos usuários que nunca ouviram falar do ZEHLA.

**Hero Copy:**
> "Sua pousada merece ser encontrada. Crie seu perfil grátis em 2 minutos."

**Subcopy:**
> "O ZEHLA FREE é seu cartão de visitas digital. Um perfil completo da sua pousada com link direto para WhatsApp e Instagram. Compartilhe no Instagram, receba reservas. Sem taxa, sem risco, sem cartão de crédito."

**Features destacadas:**
- Perfil da Pousada com fotos e descrição
- Linktree ZEHLA (link na bio do Instagram)
- Atendente IA (até 50 respostas/mês)
- Link direto para WhatsApp
- Estatísticas básicas de visitas

**CTA:** "Criar Perfil Grátis" → `/teste-gratis?plan=free`

**Upsell:** Componente PremiumUpsell FREE → LITE com copy:
> "Quando seu volume crescer, migre para o LITE com Taxa Zero e atendimento ilimitado."

**Redirecionamento:** A página inicial `/vendas` deve redirecionar para `/vendas/free` (não mais para PRO). O FREE é a porta de entrada.

---

### 3. Perfil da Pousada + Linktree (FEATURE ESTRELAR)
**Local:** `src/app/pousada/[slug]/page.tsx`
**Componente:** `src/components/pousada/PousadaProfile.tsx`

Esta é a funcionalidade mais importante para aquisição. Cada pousada ganha um perfil público bonito.

**O que o perfil tem:**
- Fotos da pousada (carrossel)
- Nome, descrição, localização
- Número de quartos e comodidades
- Link direto para WhatsApp do dono
- Link para Instagram da pousada
- Botão "Reservar via WhatsApp"
- Avaliações de hóspedes (futuro)
- Botão "Compartilhar Perfil"

**Como o dono cria:**
1. Faz cadastro gratuito
2. Preenche nome da pousada, WhatsApp, Instagram, fotos
3. Recebe link: `zehla.com.br/pousada/minha-pousada`
4. Coloca esse link na bio do Instagram
5. Pronto — qualquer pessoa que clicar vê o perfil e pode reservar via WhatsApp

**Linktree style:** O perfil funciona como um linktree melhorado — uma página única e bonita que consolida TODOS os links da pousada (WhatsApp, Instagram, reservas).

**Design:** Mobile-first, pensado para ser compartilhado no Instagram. Fundo com foto da pousada como background blur. Cards de informações translúcidos (glassmorphism).

**Exemplo de slug:** `/pousada/pousada-do-sol` ou `/pousada/vila-dos-orixas`

**Endpoint API:** `POST /api/pousada/create` — cria perfil público. `GET /api/pousada/[slug]` — retorna dados do perfil.

**Integração com vendas:** Na página de vendas, a seção "Perfil da Pousada" deve mostrar um mockup do perfil + explicação.

---

### 4. Copy Persuasiva por Página

#### /vendas/free — "Sua pousada na vitrine"
**Hero:** "Sua pousada merece ser encontrada. Crie seu perfil grátis."
**Sub:** "Um link na bio do Instagram que vende por você. Perfil completo com fotos, WhatsApp, Instagram e reserva direta. 2 minutos de setup. Zero custo."
**Gatilhos:** Gratuidade, facilidade, descoberta, instagramável
**CTA:** "Criar Perfil Grátis →"

#### /vendas/lite — "Pare de pagar 15% para plataforma"
**Hero:** "Pare de sustentar plataformas e recupere seu lucro agora."
**Sub:** "O Plano Lite elimina a demora no WhatsApp e a dependência de sites que levam 15% do seu faturamento. Atendimento inteligente 24h, taxa zero, Pix direto."
**Gatilhos:** Economia imediata, autonomia, simplicidade
**CTA:** "Quero o Plano Lite →"

#### /vendas/pro — "O mais escolhido"
**Hero:** "Escala e Lucro Invisível."
**Sub:** "O Plano PRO é seu Diretor de Estratégia Digital. Nossa IA ajusta preços em milissegundos conforme a demanda e busca clientes que não fecharam."
**Gatilhos:** Autoridade, inteligência, recuperação de vendas
**CTA:** "Ativar Plano PRO →"

#### /vendas/max — "Custo variável ZERO"
**Hero:** "Domine o mercado com Custo Variável ZERO."
**Sub:** "O Plano MAX é para quem parou de dar dinheiro para plataformas e decidiu investir no próprio império. Multi-hotel, engenharia dedicada, inteligência de mercado."
**Gatilhos:** Poder, controle, império, exclusividade
**CTA:** "Ativar Plano MAX →"

---

### 5. Testemunhais Fictícios (substituir por reais depois)
**Local:** `src/components/sales/SocialProof.tsx` (já existe, melhorar)

```typescript
const TESTIMONIALS = [
  {
    name: 'Marina & Ricardo',
    pousada: 'Pousada Caminho do Rei',
    city: 'Paraty, RJ',
    quote: 'Em 30 dias o ZEHLA já tinha pago o ano inteiro de assinatura. As reservas diretas pelo WhatsApp quintuplicaram.',
    impact: '+420% reservas diretas',
    avatar: 'MR',
    instagram: '@pousadacaminhodorei',
  },
  {
    name: 'Carla Santoro',
    pousada: 'Vila dos Orixás',
    city: 'Morro de São Paulo, BA',
    quote: 'Deixamos de pagar R$ 12.000/mês em comissões de OTA. O ZEHLA nos devolveu o controle do nosso negócio.',
    impact: 'R$ 12.000/mês economizados',
    avatar: 'CS',
    instagram: '@viladosorixas',
  },
  {
    name: 'Thiago Almeida',
    pousada: 'Pousada do Bosque',
    city: 'Campos do Jordão, SP',
    quote: 'O atendente IA fecha reservas enquanto durmo. Acordo com o Pix na conta e o café passado. Parece mágica.',
    impact: '+35% reservas noturnas',
    avatar: 'TA',
    instagram: '@pousadadobosque',
  },
  {
    name: 'Ana Paula Macedo',
    pousada: 'Pousada Recanto das Águas',
    city: 'Caldas Novas, GO',
    quote: 'Meu perfil no ZEHLA virou meu principal canal de vendas. Todo mundo que chega no Instagram já reserva direto pelo link.',
    impact: 'Perfil com 5.000+ visitas',
    avatar: 'AP',
    instagram: '@recantodasaguas',
  },
  {
    name: 'Fernando Luz',
    pousada: 'Pousada Serra Verde',
    city: 'Monte Verde, MG',
    quote: 'O linktree do ZEHLA substituiu 3 ferramentas que eu pagava. Agora é um link só: WhatsApp, Instagram, reservas, tudo organizado.',
    impact: '1 ferramenta = 3 substituídas',
    avatar: 'FL',
    instagram: '@serraverde_pousada',
  },
];
```

**Design:** Grid de cards com glass effect, hover com brilho neon (laranja para LITE/PRO, esmeralda para MAX). Cada card com foto inicial, nome, pousada, cidade, quote em itálico, badge de impacto, e link do Instagram (ícone).

**Métricas (barra superior):**
- "94% dos leads convertem em até 7 dias"
- "R$ 18.000+ de MRR médio por pousada ativa"
- "10.000+ pousadas na base ZEHLA"
- "Nota 4.9/5 de satisfação"

---

### 6. Seção "Como funciona" (passo a passo)
**Local:** `src/components/sales/HowItWorks.tsx`

```typescript
const STEPS = [
  {
    step: 1,
    title: 'Crie seu perfil',
    description: 'Cadastre sua pousada em 2 minutos. Adicione fotos, WhatsApp, Instagram e valor da diária.',
    icon: 'UserPlus',
  },
  {
    step: 2,
    title: 'Compartilhe seu link',
    description: 'Cole o link ZEHLA na bio do Instagram. Pronto — seus seguidores veem seu perfil completo e reservam direto.',
    icon: 'Share2',
  },
  {
    step: 3,
    title: 'Receba reservas',
    description: 'O hóspede clica, vê sua pousada, escolhe a data e já chama no WhatsApp. Você recebe o Pix. Sem taxa, sem burocracia.',
    icon: 'Wallet',
  },
  {
    step: 4,
    title: 'Cresça com IA',
    description: 'Quando quiser mais, ative o plano PRO ou MAX. Precificação inteligente, recuperação de vendas e atendente IA 24h.',
    icon: 'TrendingUp',
  },
];
```

**Design:** Timeline vertical em desktop, horizontal em mobile com conectores luminosos entre os steps.

---

### 7. Ajustes Finais Obrigatórios

1. **Redirecionamento:** `/vendas` deve redirecionar para `/vendas/free` (plano grátis é porta de entrada)

2. **Navbar consistente:** Todas as 4 páginas (free, lite, pro, max) devem ter a mesma navegação com links para os outros planos + "Entrar" + "Criar Perfil Grátis"

3. **MainFooter:** Já foi atualizado, manter com links para todos os 4 planos + termos + privacidade

4. **LandingTracker:** Já existe e funciona — manter. Garantir que está presente em TODAS as 4 páginas

5. **PremiumUpsell:** Já foi corrigido. Manter e garantir que aparece em todas as páginas:
   - FREE → LITE: "Quer atendimento ilimitado?"
   - LITE → PRO: "Quer precificação inteligente?"
   - PRO → MAX: "Quer taxa zero em todas as reservas?"
   - MAX → EXCLUSIVE: "Precisa de solução sob medida?" (com onTargetClick)

6. **PricingTable:** Deve aparecer em TODAS as 4 páginas, na seção "Compare os Planos"

7. **SocialProof:** Deve aparecer em TODAS as 4 páginas

8. **FAQ:** Deve aparecer em TODAS as 4 páginas

9. **HowItWorks:** Deve aparecer nas páginas FREE e LITE (para novos usuários)

---

## ✅ CHECKLIST FINAL

- [ ] `/vendas/free/page.tsx` — página do plano grátis com perfil + linktree como hero
- [ ] `/vendas/lite/page.tsx` — atualizada com PricingTable + SocialProof + FAQ + HowItWorks
- [ ] `/vendas/pro/page.tsx` — atualizada com PricingTable + SocialProof + FAQ
- [ ] `/vendas/max/page.tsx` — atualizada com PricingTable + SocialProof + FAQ
- [ ] `/vendas/page.tsx` — redirecionar para `/vendas/free`
- [ ] `src/components/sales/PricingTable.tsx` — tabela comparativa 4 colunas (FREE/LITE/PRO/MAX)
- [ ] `src/components/sales/SocialProof.tsx` — 5 testemunhais + métricas
- [ ] `src/components/sales/HowItWorks.tsx` — 4 passos do perfil à IA
- [ ] `src/components/sales/FAQ.tsx` — 6+ perguntas frequentes
- [ ] `src/components/sales/PremiumUpsell.tsx` — manter funcional
- [ ] `src/components/sales/LandingTracker.tsx` — manter funcional
- [ ] `src/components/pousada/PousadaProfile.tsx` — perfil público da pousada
- [ ] `src/app/pousada/[slug]/page.tsx` — rota do perfil público
- [ ] `src/app/api/pousada/create/route.ts` — criar perfil
- [ ] `src/app/api/pousada/[slug]/route.ts` — buscar perfil

---

## ⚠️ REGRAS DE OURO

1. **NUNCA remova funcionalidades existentes** — apenas adicione e melhore
2. **NUNCA quebre o PremiumUpsell** ou LandingTracker — eles já estão corrigidos
3. **NUNCA remova o Taxa Zero** — é o pilar comercial
4. **SEMPRE mantenha o padrão huashu-design** (fundo preto, glass, neon, gradientes)
5. **SEMPRE use Server Components** onde possível, `'use client'` só quando necessário (interatividade)
6. **NUNCA use `<img>` — sempre use `<Image>` do Next.js**
7. **SEMPRE envolva `LandingTracker` em `<Suspense fallback={null}>`**
8. **Testemunhais são fictícios** — use nomes, pousadas e cidades reais do Brasil (consultar `Base_Conhecimento` se disponível)

---

## 📦 ENTREGÁVEIS

Ao final, o agente deve:
1. Criar/modificar todos os arquivos listados no checklist
2. Verificar que `npm run build` compila sem erros
3. Verificar que `http://localhost:3000/vendas` redireciona para `/vendas/free`
4. Verificar que as 4 páginas carregam com todos os componentes
5. Fazer `git add . && git commit -m "feat(sales): versão completa com free plan, pricing table, perfil pousada, linktree, testemunhais"` e `git push origin main`

---

**IMPORTANTE:** Este documento é o comando mestre. O FULL STACK AGENT deve ler CADA SEÇÃO, entender o contexto do projeto (vasculhar os arquivos listados no topo) e implementar TUDO. Qualquer dúvida sobre design ou copy, manter o padrão huashu-design (carbon black, neon orange/emerald, glass borders, blur glows).
