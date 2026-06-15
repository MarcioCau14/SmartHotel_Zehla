---
name: outbound-google-ads-shadow-mode
created: 2026-06-15
tags: [marketing, outbound, google-ads, shadow-mode, lgpd, privacidade]
category: marketing
success_count: 0
failure_count: 0
---

# Outbound 2.0 & Google Ads Shadow Mode

## 1. Growth Outbound (Outbound 2.0)
- **Rotação Round-Robin:** Distribuição de disparos entre as caixas postais ativas para maximizar a entregabilidade.
- **Limite Diário:** Teto rígido de 50 disparos por dia por caixa para evitar bloqueios.
- **Opt-Out Semântico:** Respostas dos leads são classificadas usando a intenção `OPT_OUT` (ex: "Não quero mais receber", "Me tire da lista").
- **FSM Comercial:** Leads que solicitam descadastro transicionam de `ACTIVE` para `BLACKLISTED`.

## 2. Privacidade Zero Data Retention (ZDR)
- **Supressão por Hashing:** Na transição para `BLACKLISTED`, o sistema gera o hash irreversível `SHA-256(email.toLowerCase())` e o grava na tabela `Blacklist`.
- **Expurgo de PII:** Todos os dados pessoais identificáveis (Nome, Telefone, e-mail bruto) do lead são anonimizados ou limpos física do banco de dados (Supabase).
- **Prevenção de Importação:** Futuras importações filtram e rejeitam novos contatos comparando o hash de seu e-mail contra a tabela `Blacklist`.

## 3. Google Ads Action AI (Shadow Mode)
- **Execução em Shadow Mode:** Por padrão (`shadowMode === true`), mutações diretas são bloqueadas e geram propostas na tabela `AdsChangeProposal` para aprovação de 1 clique no ZCC.
- **Conflict Shield Service:** Impede exclusão de termos (palavras-chave negativas) que colidam com os top 100 termos com maior conversão histórica nos últimos 90 dias, retornando `NEGATIVE_KEYWORDS_CONFLICT`.
- **Limpeza de Propostas:** Um cron job semanal no BullMQ limpa propostas pendentes criadas há mais de 7 dias.
