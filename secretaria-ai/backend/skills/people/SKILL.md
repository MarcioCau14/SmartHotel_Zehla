---
name: people
description: >
  Vertical de Inteligência de Talentos e Descoberta de Perfis. 
  Responsável por encontrar candidatos (find_people), enriquecer dados de contato em lote (enrich_people) e realizar auditoria CGV (review_people).
  SOP OBRIGATÓRIO: find_people -> enrich_people (batch) -> review_people (CGV Audit).
  Esta vertical é o motor de decisão do Agente de Avaliação.
---

# Vertical de People (Motor CGV)

Esta vertical gerencia o ciclo de vida da descoberta à qualificação auditável de talentos.

## Habilidades Principais

### 1. `find_people`
**Discovery Engine.**
- **Gatilho**: Quando houver necessidade de buscar novos candidatos com base em cargos e domínios de organizações.
- **Função**: Processa matrizes complexas e retorna perfis brutos.
- **Controle**: Encurta a busca baseado no `target_count` para economia de créditos.

### 2. `enrich_people`
**Batch Enrichment.**
- **Gatilho**: Sempre que novos perfis brutos forem encontrados.
- **Função**: Operação em lote para validar emails corporativos e extrair links sociais (LinkedIn, GitHub, X).
- **Regra**: Deve ser chamada com uma lista de perfis para otimização de API.

### 3. `review_people`
**O Motor CGV (Joia da Coroa).**
- **Gatilho**: Antes de qualquer tentativa de conexão.
- **Função**: Realiza a Verificação Baseada em Critérios em 3 dimensões (Relevância, Engajamento, Adequação Comercial).
- **Output**: Gera uma **Match Explanation** obrigatória para justificar a pontuação.

## Fluxo de Governança
Nunca tente conectar-se com um candidato sem o relatório de auditoria CGV gerado pelo `review_people`.
