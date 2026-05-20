# ZEHLA BRAIN: Aprendizado de Lógica & Matemática (2026)

Este documento registra os princípios matemáticos e lógicas de negócio que regem o ecossistema ZEHLA, servindo de base para o treinamento de Machine Learning e orquestração de agentes.

## 1. Lógica de Classificação de Leads (Purchasing Power)
O motor de IA classifica cada pousada no momento da ingestão seguindo a seguinte hierarquia matemática:

| Plano ZEHLA | Valor Mensal | Critérios de IA |
| :--- | :--- | :--- |
| **MAX** | R$ 798,00 | > 20 quartos OU Score Qual. > 90 OU Tag "Luxo/Premium" |
| **PRO** | R$ 498,00 | 10 a 20 quartos OU Score Qual. > 70 |
| **LITE** | R$ 248,00 | < 10 quartos |

## 2. Motor de Precificação (SaaS Pricing)
As tabelas de preços são imutáveis e servem para o cálculo do MRR (Monthly Recurring Revenue) no ZCC:
- **LITE:** Foco em micro-empreendedores (R$ 248).
- **PRO:** Foco em pousadas profissionais (R$ 498).
- **MAX:** Foco em hotéis de alto valor e escala (R$ 798).

## 3. Protocolo de Dados (18 Colunas)
O cérebro deve exigir e validar as seguintes 18 colunas em todos os Webhooks e planilhas de marketing:
`Pousada, E-mail, Whatsapp, Qtd Quartos, Local/Praia, Cidade, UF, Valores Estimados, Qualificação, Validação, Comportamento de Compra, Sinais de Intenção, Redes Sociais, LATITUDE, LONGITUDE, Score Qual., Score Valid.`

## 4. Estratégia de Conversão (Neuro-Vendas)
- **Gancho:** Dor da comissão (Trauma de OTAs).
- **Solução:** G-Solis (Gestão de Ocupação e Lucro Invisível).
- **Pipeline:** Capture -> Validate -> Enrich -> Classify -> Act (BullMQ).

---
*Aprendizado registrado em 07/05/2026. Este conhecimento é persistente e guia todas as ações futuras do ecossistema ZEHLA.*
