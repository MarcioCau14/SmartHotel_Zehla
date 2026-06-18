---
name: competitor-intelligence
description: Specialized in deep corporate OSINT and competitive analysis. Used to dissect competitors, identify their tech stack, pricing models, market reach, and strategic vulnerabilities.
---

# Competitor Intelligence Skill

This skill implements an aggressive investigative framework for corporate analysis, inspired by the "Investigative Prospecting" and "Triangulation" concepts from Sherlocker and OSINT Industries.

## Objectives
- **Structural Analysis**: Map the legal and financial structure of the target (partners, employees, estimated revenue).
- **Tech Stack Profiling**: Identify the tools, IAs, and frameworks used by the competitor.
- **Pricing & Offer Dissection**: Uncover pricing structures and service delivery models.
- **Market Footprint**: Map client clusters and regional dominance.
- **SWOT Deep-Dive**: Identify gaps and opportunities to outperform the competitor.

## Protocolo de Pesquisa (War Room)

Para garantir que toda pesquisa seja profunda e padronizada, siga estes passos:

### 1. Inicialização
- Execute o script `competitor_analyzer.py` para criar a estrutura do relatório.
- Defina o `target_name` e `target_url`.

### 2. Investigação OSINT (Camada 1 - Corporativa)
- **Busca por CNPJ**: Consultar base de dados públicas (Receita, Econodata, etc).
- **Estrutura Societária**: Identificar sócios e suas outras empresas.
- **Tamanho da Equipe**: Usar LinkedIn e Glassdoor para estimar headcount e especialidades.

### 3. Autópsia Técnica (Camada 2 - Produto)
- **Tech Stack**: Analisar headers HTTP e scripts `inspecionar elemento`.
- **Funcionalidades Core**: Mapear o que o produto faz vs o que o **ZEHLA** faz.
- **IAs de Apoio**: Identificar modelos de linguagem ou automação via APIs expostas.

### 4. Análise de Mercado (Camada 3 - Comercial)
- **Preços**: Buscar tabelas, planos ou orçamentos vazados.
- **Regiões**: Mapear onde estão os principais clientes.
- **Vulnerabilidades**: Ler avaliações negativas e reclamações (Reclame Aqui, Google Reviews).

## Ferramentas Disponíveis

### `competitor_analyzer.py`
Este script gerencia o estado da pesquisa e gera o arquivo JSON final.

**Como usar:**
```python
from scripts.competitor_analyzer import CompetitorAnalyzer

# Inicializa
research = CompetitorAnalyzer("Nome da Empresa", "https://site.com")

# Adiciona descobertas durante a pesquisa
research.add_finding("structural", "cnpj", "00.000.000/0001-00")
research.add_finding("tech_stack", "ai_tools", ["ChatGPT", "Custom LLM"])

# Salva o dossiê final
research.save_analysis()
```

## Relatórios
Todos os dossiês são salvos na pasta `/reports` em formato JSON para integração com outros sistemas ou visualização no dashboard.
