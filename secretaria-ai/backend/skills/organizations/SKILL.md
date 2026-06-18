---
name: organizations
description: >
  Vertical de Inteligência Corporativa da Lessie AI. 
  OBRIGATÓRIO: Esta vertical DEVE ser consultada SEMPRE que uma empresa for identificada como alvo. 
  O Orchestrator NUNCA deve buscar pessoas sem antes validar o domínio oficial (TLD) através desta skill. 
  Responsável por validar domínios, inferir stacks tecnológicas via vagas e detectar catalisadores temporais (M&A, funding, news).
---

# Vertical de Organizations

Fundação de dados corporativos para o sistema Lessie AI. Segue rigorosamente o SOP de validação antes de prospecção.

## Habilidades Principais

### 1. `enrich_organization`
**[CRÍTICO] FUNDAÇÃO INEGOCIÁVEL.**
- **Gatilho**: Sempre que houver um nome de empresa mas o domínio oficial não estiver validado.
- **Função**: Converte nomes comerciais em domínios legítimos (TLD). 
- **Regra**: O Orchestrator está proibido de avançar para busca de pessoas sem o `validated_domain` retornado por esta função.

### 2. `get_company_job_postings`
- **Gatilho**: Quando for necessário entender o "tech stack" ou o momento de expansão da empresa.
- **Função**: Extrai listagens de vagas e infere tecnologias adotadas e áreas estratégicas de crescimento.

### 3. `search_company_news`
- **Gatilho**: Preparação de pretexto para conexão ou análise de risco/oportunidade.
- **Função**: Identifica M&A, novos aportes, IPOs ou mudanças na C-Suite. 
- **Output**: Dados estruturados para o Agente de Conexão gerar mensagens personalizadas.

### 4. `find_organizations`
- **Gatilho**: Expansão de lista baseada em perfis de sucesso (Ideial Customer Profile).
- **Função**: Busca semântica por empresas "lookalike" com base em setor, região e tamanho.

## Governança e Fluxo
1. **Identificação** -> 2. **Enrichment (TLD)** -> 3. **Intelligence (Jobs/News)** -> 4. **Aprovação de Fluxo de Pessoas**.

