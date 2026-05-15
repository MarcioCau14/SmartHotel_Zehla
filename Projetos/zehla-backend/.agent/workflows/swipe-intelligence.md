# Workflow: Swipe Intelligence Operationalization

Workflow para finalizar a camada de inteligência de conversão (Swipes).

## Passos

1. **Refatoração do Matcher (src/lib/swipe/matcher.ts)**:
    - Implementar limites baseados em Tier (LITE: 3, PRO: 7, MAX: Ilimitado).
    - Refinar matching 4D (Similarity, Conversion, Recency, Pain Match).
    - Validar tipos de dor (Commission, Management, Occupancy).

2. **Desenvolvimento do Generator (src/lib/swipe/swipe-generator.ts)**:
    - Integrar com Kimi 2.6 (ou similar via Brain API).
    - Implementar síntese de templates baseada no DNA da pousada.
    - Foco exclusivo no Tier MAX.

3. **Finalização da API (src/app/api/zcc/swipes/)**:
    - Endpoint `/api/zcc/swipes/match`: Retorna sugestões para um lead.
    - Endpoint `/api/zcc/swipes/track`: Registra uso e conversão (feedback loop).

4. **Seed de Templates**:
    - Deploy dos 30 templates universais validados.

5. **Integração ZCC**:
    - Exibir sugestões de swipes no Radar Neural e no Swarm Overview.
