# SPEC — Domínio de Revenue & Analytics (Zé-Analyst)

> **Cérebro Financeiro do ZEHLA.**  
> O Zé-Analyst é o Lobo Frontal do sistema — inteligência de dados focada em Revenue Management, precificação dinâmica, yield optimization e forecast de demanda. Aqui o dinheiro é maximizado ou perdido. Não há margem para achismo.

---

## 0. Escopo e Responsabilidade

### Zé-Analyst PODE:
- Calcular tarifa dinâmica do dia seguinte baseada em ocupação, sazonalidade e histórico
- Alterar tarifa flutuante (não promocional) se ocupação ≥ 80% (aumento) ou ≤ 40% (redução controlada)
- Recomendar descontos estratégicos para o Zé-Sales em leads parados na negociação
- Gerar forecasts de demanda (7, 30, 90 dias)
- Calcular métricas de Revenue: ADR, RevPAR, GOPPAR, Break-even, Taxa de Ocupação
- Analisar sensibilidade a preço por canal (Direto, Booking, Airbnb, Expedia)
- Sugerir rebalanceamento de tarifas por canal baseado em elasticidade
- Emitir relatórios de performance para o Zé-Host (Human Overwatch)

### Zé-Analyst NÃO PODE:
- ❌ Alterar pacotes de Réveillon, Carnaval ou feriados nacionais sem assinatura do Zé-Host
- ❌ Reduzir tarifa abaixo do Break-even Point (custo operacional base), independentemente da ociosidade
- ❌ Interagir diretamente com o cliente (hóspede ou lead) — isso é papel do Zé-Sales ou Zé-Concierge
- ❌ Cancelar ou modificar reservas existentes — isso é domínio da Hospitalidade
- ❌ Acessar dados financeiros brutos de outros tenants (RLS inviolável)
- ❌ Alterar regras de pricing de pacotes promocionais sem validação do Zé-Marketer
- ❌ Definir descontos sem justificativa matemática documentada (ratio desconto/ocupação)
- ❌ **Cross-Context é Read-Only:** O Zé-Analyst tem acesso SOMENTE LEITURA às portas de outros contextos (`IReservaPort`, `IPacotePort`, `IPropostaPort`). Sob nenhuma hipótese seus casos de uso podem invocar métodos de escrita (criar, cancelar, editar, deletar) em entidades de outros Bounded Contexts. Toda ação inter-contexto deve ser mediada via ZCP (Zehla Command Protocol) — Zé-Analyst recomenda, o agente dono do contexto executa.

### Gatilhos que Acordam o Zé-Analyst:
| Gatilho | Fonte | Ação |
|---------|-------|------|
| Ocupação diária ≥ 80% | Reserva (Hospitalidade) | Sugerir aumento de tarifa dinâmica |
| Ocupação diária ≤ 40% | Reserva (Hospitalidade) | Sugerir redução controlada com piso |
| Lead parado 7+ dias | Proposta (Comercial) | Sugerir desconto gradual ao Zé-Sales |
| Início de mês | Time-scheduler | Gerar forecast mensal |
| Feriado detectado | Calendário | Ajuste sazonal automático |
| Preço concorrente detectado | Ze-Pricing (Swarm) | Ajuste competitivo |

---

## 1. Entidades de Domínio Rico

### 1.1 RegraTarifaria

**Propósito:** Define uma regra de precificação para um período/tipo de quarto/canal. É o coração do yield management.

**Invariantes Matemáticas Dogmáticas:**

> R1. **Break-even Inviolável:** `valorDiaria >= breakEvenPoint`. Nenhuma tarifa pode ser precificada abaixo do custo operacional base, mesmo com ocupação 0%. Violar esta regra quebra a pousada.

> R2. **Delta Máximo Diário:** `|valorDiaria - valorDiariaAnterior| / valorDiariaAnterior <= 0.20`. A tarifa não pode variar mais que 20% para cima ou para baixo em um único dia. Impede histerese de precificação.

> R3. **Preço Mínimo por Canal:** `valorPorCanal >= valorDiaria * 0.85`. Nenhum canal pode praticar preço inferior a 85% da tarifa base (proteção de marca).

> R4. **Promocional vs Dinâmica:** Uma `RegraTarifaria` com `tipo = 'promocional'` NÃO PODE ser alterada pelo Zé-Analyst sem aprovação do Zé-Host. Apenas tarifas `tipo = 'dinamica'` estão no escopo do Zé-Analyst.

> R5. **Âncora de Feriado:** Se `dataFim` está dentro de um período de feriado nacional, `tipo` deve ser `'promocional'`. Feriados nunca são tarifa dinâmica.

> R6. **Paridade Tarifária (Rate Parity):** `|valorCanalDireto - valorMenorOTA| / valorMenorOTA <= 0.10`. A tarifa do canal direto não pode ser mais que 10% mais barata que a menor tarifa praticada nas OTAs (Booking, Airbnb, Expedia). Violar a paridade contratual sujeita a pousada a punições algorítmicas e perda de ranqueamento nas OTAs. Esta regra é obrigatória no `CalcularTarifaDinamicaUseCase` e `RebalancearTarifasPorCanalUseCase`.

**Props:**
- `id: string`
- `propriedadeId: string`
- `tipoQuarto: TipoQuarto` (suite | standard | luxo | familiar)
- `tipo: 'dinamica' | 'promocional' | 'convenio'`
- `valorDiaria: Money` — valor base da diária
- `breakEvenPoint: Money` — custo operacional base (imutável após definido)
- `canal: 'direto' | 'booking' | 'airbnb' | 'expedia'`
- `dataInicio: Date`
- `dataFim: Date`
- `valorAnterior: Money | null` — para cálculo de delta
- `regraReajuste: 'percentual' | 'manual'` — como a precificação dinâmica opera
- `parametrosReajuste: { percentualMax: number; gatilhoOcupacao: number }` — ex: aumentar 10% se ocupação > 80%
- `dataCriacao: Date`

**Eventos:**
- `TarifaAtualizadaEvent` — emitido quando tarifa dinâmica é alterada
- `TarifaPromocionalCriadaEvent` — emitido quando pacote promocional é registrado
- `BreakEvenAtingidoEvent` — emitido quando tarifa se aproxima do break-even (> 90%)

---

### 1.2 Ocupacao

**Propósito:** Registro imutável da ocupação de um período. Fonte da verdade para decisões de yield.

**Invariantes:**

> O1. **Ocupação Máxima:** `totalQuartosOcupados <= totalQuartosDisponiveis`. A ocupação nunca excede a capacidade total da propriedade.

> O2. **Monotônica no período:** Para uma mesma propriedade e mesmo tipo de quarto, ocupação é um atributo temporal. O snapshot de hoje é imutável depois de registrado (não se reescreve o passado).

> O3. **Ocupação Projetada vs Real:** Ocupação tem duas naturezas — `'realizada'` (dado consolidado) e `'projetada'` (baseada em reservas). Projeções têm prazo de validade de 7 dias.

**Props:**
- `id: string`
- `propriedadeId: string`
- `data: Date` — dia da medição
- `tipo: 'realizada' | 'projetada'`
- `totalQuartosDisponiveis: number`
- `totalQuartosOcupados: number`
- `totalReservasConfirmadas: number`
- `totalReservasPendentes: number`
- `taxaOcupacao: Percentual` — calculado: `(ocupados / disponiveis) * 100`
- `receitaEstimada: Money`
- `dataCriacao: Date`

---

### 1.3 Sazonalidade

**Propósito:** Padrão sazonal que influencia a precificação. Uma entidade de conhecimento, não de transação.

**Invariantes:**

> S1. **Sazonalidade Conhecida:** `tipo ∈ { 'alta', 'media', 'baixa', 'feriado', 'evento' }`. Não existe sazonalidade "desconhecida".

> S2. **Multiplicador Mínimo:** `multiplicadorPreco >= 0.7`. Um período de baixa temporada pode reduzir o preço em no máximo 30%. Abaixo disso quebra o break-even.

> S3. **Feriados são Exclusivos:** Se um período é `'feriado'`, ele não pode ser simultaneamente `'alta'` ou `'baixa'`. Feriado sobrepõe qualquer outra classificação.

**Props:**
- `id: string`
- `propriedadeId: string`
- `nome: string` — ex: "Réveillon 2026", "Baixa Temporada Março"
- `tipo: 'alta' | 'media' | 'baixa' | 'feriado' | 'evento'`
- `multiplicadorPreco: number` — ex: 1.5 para alta, 0.8 para baixa
- `dataInicio: Date`
- `dataFim: Date`
- `recorrente: boolean` — se repete todo ano
- `diasMinimosEstadia?: number` — exigência de estadia mínima
- `regrasEspeciais?: string[]` — ex: ["nao_cancelavel", "nao_reembolsavel"]

---

### 1.4 Forecast

**Propósito:** Projeção de demanda, ocupação e receita para um horizonte temporal.

**Invariantes:**

> F1. **Horizonte Fixo:** `horizonte ∈ { 7, 30, 90 }` dias. Não existem forecasts de 15 ou 45 dias.

> F2. **Confiança Decrescente:** `confiancaMedia <= 0.95` para horizonte 7d, `<= 0.85` para 30d, `<= 0.70` para 90d. O modelo não pode reportar confiança acima do limite do horizonte.

> F3. **Forecast Nunca é Fatura:** Um forecast NÃO PODE ser usado como valor contábil. É apenas projeção. Qualquer uso contábil deve ser sinalizado como violação.

**Props:**
- `id: string`
- `propriedadeId: string`
- `dataGeracao: Date`
- `horizonte: 7 | 30 | 90` — dias à frente
- `previsaoOcupacao: Percentual[]` — array com a previsão dia a dia
- `previsaoReceita: Money[]` — receita estimada por dia
- `previsaoADR: Money[]` — Average Daily Rate projetado
- `previsaoRevPAR: Money[]` — Revenue per Available Room projetado
- `confiancaMedia: number` — 0 a 1, decai com horizonte
- `variancia: number` — desvio padrão da projeção
- `dadosHistoricoUsados: { dataInicio: Date; dataFim: Date }` — período de treino
- `assinaturaModelo: string` — identificador da versão do modelo que gerou

---

## 2. Value Objects

### 2.1 Money
Reutilizar o `Money` existente do domínio Comercial (`src/domain/comercial/value-objects/Money.ts`).

### 2.2 Percentual
- `valor: number` — 0 a 100
- Invariante: `0 <= valor <= 100`
- Métodos: `aplicar(base: Money): Money`, `toString(): string`

### 2.3 BreakEvenPoint
- `valor: Money`
- Invariante: `valor > Money.zero()` — custo operacional nunca é zero
- Invariante: `BreakEvenPoint.tipoCusto ∈ { 'operacional', 'total' }`
- Métodos: `estaCobertoPor(valorDiaria: Money): boolean`, `margemSobre(valorDiaria: Money): Percentual`

### 2.4 ElasticidadePreco
- `valor: number` — coeficiente de elasticidade
- Invariante: `valor <= 0` — demanda sempre cai quando preço sobe (bem normal)
- Métodos: `calcularVariacaoDemanda(variacaoPreco: Percentual): Percentual`
- Significado: se `elasticidade = -1.5`, aumento de 10% no preço → queda de 15% na demanda

---

## 3. Portas Segregadas (Interfaces)

Nada de God Interface. Cada porta tem responsabilidade única.

### 3.1 ITarifaPort
```typescript
interface ITarifaPort {
  criarRegra(dados: {
    propriedadeId: string; tipoQuarto: string; tipo: string
    valorDiaria: Money; breakEvenPoint: Money; canal: string
    dataInicio: Date; dataFim: Date
  }): Promise<Result<RegraTarifaria, Error>>

  buscarPorId(id: string, propriedadeId: string): Promise<Result<RegraTarifaria | null, Error>>

  listarAtivas(propriedadeId: string, data: Date): Promise<Result<RegraTarifaria[], Error>>

  listarPorTipoQuarto(propriedadeId: string, tipoQuarto: string, data: Date): Promise<Result<RegraTarifaria[], Error>>

  atualizarValorDiaria(id: string, propriedadeId: string, novoValor: Money): Promise<Result<RegraTarifaria, Error>>

  listarHistoricoReajustes(regraId: string, propriedadeId: string): Promise<Result<Array<{ data: Date; valorAnterior: Money; valorNovo: Money; justificativa: string }>, Error>>
}
```

### 3.2 IOcupacaoPort
```typescript
interface IOcupacaoPort {
  registrarSnapshot(dados: {
    propriedadeId: string; data: Date; tipo: 'realizada' | 'projetada'
    totalQuartosDisponiveis: number; totalQuartosOcupados: number
    totalReservasConfirmadas: number; totalReservasPendentes: number
    receitaEstimada: Money
  }): Promise<Result<Ocupacao, Error>>

  buscarPorData(propriedadeId: string, data: Date): Promise<Result<Ocupacao | null, Error>>

  listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Ocupacao[], Error>>

  mediaOcupacaoPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Percentual, Error>>
}
```

### 3.3 ISazonalidadePort
```typescript
interface ISazonalidadePort {
  criarRegraSazonal(dados: {
    propriedadeId: string; nome: string; tipo: string
    multiplicadorPreco: number; dataInicio: Date; dataFim: Date
    recorrente?: boolean; diasMinimosEstadia?: number; regrasEspeciais?: string[]
  }): Promise<Result<Sazonalidade, Error>>

  buscarPorData(propriedadeId: string, data: Date): Promise<Result<Sazonalidade | null, Error>>

  listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Sazonalidade[], Error>>

  listarProximosFeriados(propriedadeId: string, dias: number): Promise<Result<Sazonalidade[], Error>>
}
```

### 3.4 IForecastPort
```typescript
interface IForecastPort {
  gerarForecast(dados: {
    propriedadeId: string; horizonte: 7 | 30 | 90
    dadosHistoricoInicio: Date; dadosHistoricoFim: Date
  }): Promise<Result<Forecast, Error>>

  buscarUltimoForecast(propriedadeId: string, horizonte: 7 | 30 | 90): Promise<Result<Forecast | null, Error>>

  listarHistoricoForecasts(propriedadeId: string, limite?: number): Promise<Result<Forecast[], Error>>
}
```

### 3.5 Portas Cross-Context (APENAS Leitura)
O Zé-Analyst consome dados de outros contextos **somente leitura**:

```typescript
// Hospitalidade — para calcular ocupação real
interface IReservaPort {
  listarReservasAtivas(propriedadeId: string, data: Date): Promise<Result<Reserva[], Error>>
  contarReservasPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<number, Error>>
  // APENAS leitura — Zé-Analyst não cria/cancela reservas
}

// Comercial — para validar pacotes antes de recomendar desconto
interface IPacotePort {
  listarPacotesPorPropriedade(propriedadeId: string, filtros?: { status?: string[]; tipoQuarto?: string }): Promise<Result<Pacote[], Error>>
  // APENAS leitura — Zé-Analyst não cria/edita pacotes
}
```

---

## 4. Casos de Uso (Orquestradores)

### 4.1 CalcularTarifaDinamicaUseCase
- **Input:** `propriedadeId, tipoQuarto, data`
- **Fluxo:**
  1. Busca ocupação do período via `IOcupacaoPort`
  2. Busca sazonalidade via `ISazonalidadePort`
  3. Busca tarifa ativa via `ITarifaPort`
  4. Se ocupação ≥ 80% → aplicar multiplicador de alta demanda (respeitando delta max 20%)
  5. Se ocupação ≤ 40% → aplicar redução controlada (nunca abaixo do break-even)
  6. Se sazonalidade `'feriado'` → tarifa é promocional, abortar (Zé-Analyst não mexe)
  7. Retorna `{ valorSugerido, justificativa, deltaPercentual, violaBreakEven: boolean }`
- **Invariante:** Se `violaBreakEven === true`, o caso de uso retorna erro — Zé-Analyst não pode executar.

### 4.2 SugerirDescontoEstrategicoUseCase
- **Input:** `propriedadeId, propostaId, leadId`
- **Fluxo:**
  1. Busca proposta via `IPropostaPort` (Comercial, leitura)
  2. Busca ocupação atual via `IOcupacaoPort`
  3. Busca elasticidade histórica por canal
  4. Se ocupação < 30% → sugere desconto de até 20% (com justificativa matemática)
  5. Se lead parado 7+ dias → sugere desconto gradual (5% + 2% por dia adicional)
  6. Se proposta já tem desconto aplicado → calcula desconto incremental
  7. Retorna `{ descontoSugerido, justificativa, riscoReceita, impactoOcupacao }`
- **Nota:** A decisão final de aplicar o desconto é do Zé-Sales. Zé-Analyst apenas recomenda.

### 4.3 GerarForecastDemandaUseCase
- **Input:** `propriedadeId, horizonte: 7|30|90`
- **Fluxo:**
  1. Busca histórico de ocupação dos últimos 90 dias (ou 365 para forecast 90d)
  2. Busca sazonalidade do período
  3. Busca reservas futuras (para projetar demanda)
  4. Calcula projeção dia a dia (ocupação, receita, ADR, RevPAR)
  5. Aplica limites de confiança por horizonte
  6. Persiste forecast via `IForecastPort`
  7. Retorna `Forecast`
- **Invariante:** Se horizonte = 90, `confiancaMedia <= 0.70`

### 4.4 CalcularMetricasRevenueUseCase
- **Input:** `propriedadeId, dataInicio, dataFim`
- **Fluxo:**
  1. Busca ocupação do período
  2. Busca receita do período
  3. Calcula: ADR = receita / quartosOcupados
  4. Calcula: RevPAR = receita / quartosDisponiveis
  5. Calcula: GOPPAR = (receita - custosOperacionais) / quartosDisponiveis
  6. Calcula: TaxaOcupacaoMedia = media ocupação no período
  7. Calcula: Break-even Ratio = custoTotal / receitaTotal
  8. Retorna métricas calculadas

### 4.5 ValidarViolacaoBreakEvenUseCase
- **Input:** `propriedadeId, regraTarifariaId, valorPretendido: Money`
- **Fluxo:**
  1. Busca regra tarifária
  2. `if (valorPretendido < regra.breakEvenPoint) → return FAIL`
  3. Se valor está entre break-even e 110% do break-even → emitir `BreakEvenAtingidoEvent`
  4. `return OK`
- **Uso:** Chamado antes de qualquer alteração de tarifa. É o guardião do piso.

### 4.6 RebalancearTarifasPorCanalUseCase
- **Input:** `propriedadeId, data`
- **Fluxo:**
  1. Lista tarifas ativas por canal
  2. Busca elasticidade histórica por canal
  3. Se um canal tem elasticidade mais alta (demanda mais sensível a preço), sugere redução
  4. Se um canal tem elasticidade mais baixa (demanda inelástica), sugere aumento
  5. Respeita: `valorPorCanal >= valorDiaria * 0.85` (invariante R3)
  6. Retorna `{ ajustes: Array<{ canal, valorAtual, valorSugerido, justificativa }> }`

---

## 5. Use Cases Obrigatórios (Mínimo Viável)

Para a SB14, os seguintes casos de uso DEVEM ser implementados:

| # | Caso de Uso | Depende de | Prioridade |
|---|---|---|---|
| 1 | `CalcularTarifaDinamicaUseCase` | ITarifaPort, IOcupacaoPort, ISazonalidadePort | 🔴 Crítica |
| 2 | `ValidarViolacaoBreakEvenUseCase` | ITarifaPort | 🔴 Crítica |
| 3 | `SugerirDescontoEstrategicoUseCase` | IOcupacaoPort, IPropostaPort (leitura) | 🟡 Alta |
| 4 | `GerarForecastDemandaUseCase` | IOcupacaoPort, ISazonalidadePort | 🟡 Alta |
| 5 | `CalcularMetricasRevenueUseCase` | IOcupacaoPort | 🟢 Média |
| 6 | `RebalancearTarifasPorCanalUseCase` | ITarifaPort | 🟢 Média |

---

## 6. Eventos de Domínio

| Evento | Origem | Consumidores | Ação |
|---|---|---|---|
| `TarifaAtualizadaEvent` | Zé-Analyst | Zé-Host | Notificar mudança de precificação |
| `BreakEvenAtingidoEvent` | Zé-Analyst | Zé-Host (alerta) | Revisar custos operacionais |
| `ForecastGeradoEvent` | Zé-Analyst | Jony, Maria, Tedd | Atualizar projeções financeiras |
| `OcupacaoCriticaEvent` (≥90%) | Zé-Analyst | Zé-Host, Zé-Concierge | Ativar overbooking prevention |
| `DescontoRecomendadoEvent` | Zé-Analyst | Zé-Sales | Notificar oportunidade de desconto |
| `ViolacaoBreakEvenBlockedEvent` | Zé-Analyst | Zé-Host | Auditoria: tentativa de precificar abaixo do custo |

---

## 7. Fronteira do Zé-Analyst (Resumo)

```
┌─────────────────────────────────────────────────────────┐
│                     ZÉ-ANALYST                          │
│                                                         │
│  ┌─────────────────┐  ┌──────────────────┐             │
│  │ Leitura Cross-   │  │ Revenue & Yield  │             │
│  │ Context:         │  │ Management:      │             │
│  │ • Reservas       │  │ • CalcularTarifa │             │
│  │ • Pacotes        │  │ • SugerirDesconto│             │
│  │ • Leads/Propostas│  │ • Rebalancear    │             │
│  └─────────────────┘  └──────────────────┘             │
│                                                         │
│  ┌─────────────────┐  ┌──────────────────┐             │
│  │ Forecast &       │  │ Métricas:        │             │
│  │ Projeção:        │  │ • ADR / RevPAR   │             │
│  │ • 7/30/90 dias   │  │ • GOPPAR         │             │
│  │ • Confiança      │  │ • Break-even     │             │
│  │   decrescente    │  │ • Ocupação       │             │
│  └─────────────────┘  └──────────────────┘             │
│                                                         │
│  🛡️ Guardiões:                                           │
│  • ValidarViolacaoBreakEvenUseCase (piso absoluto)      │
│  • deltaMaximo 20% (histerese)                          │
│  • Feriados são promocionais (fora do escopo)           │
└─────────────────────────────────────────────────────────┘
        │                    │
        ▼                    ▼
   Zé-Host (Human      Zé-Sales (recomendação
   Overwatch para      de desconto, decisão
   feriados e          final do vendedor)
   break-even)
```

---

## 8. Invariantes de Negócio (Resumo)

| # | Invariante | Onde é validada |
|---|---|---|
| 1 | `valorDiaria >= breakEvenPoint` | `RegraTarifaria.create()` + `ValidarViolacaoBreakEvenUseCase` |
| 2 | `|valorDiaria - valorAnterior| / valorAnterior <= 0.20` | `RegraTarifaria.create()` |
| 3 | `valorPorCanal >= valorDiaria * 0.85` | `RegraTarifaria.create()` |
| 4 | Tarifa promocional NÃO é alterada pelo Zé-Analyst | `CalcularTarifaDinamicaUseCase` |
| 5 | Feriado → tarifa promocional obrigatória | `CalcularTarifaDinamicaUseCase` |
| 6 | `|valorCanalDireto - valorMenorOTA| / valorMenorOTA <= 0.10` (Paridade Tarifária) | `CalcularTarifaDinamicaUseCase` + `RebalancearTarifasPorCanalUseCase` |
| 6 | Ocupação `realizada` é imutável após registro | `Ocupacao.create()` |
| 7 | Confiança decresce com horizonte (7d: ≤95%, 30d: ≤85%, 90d: ≤70%) | `Forecast.create()` |
| 8 | `elasticidade <= 0` | `ElasticidadePreco.create()` |
| 9 | RLS: dado financeiro pertence a UMA propriedade | Todas as portas |
| 10 | Zé-Analyst nunca interage com cliente | `Zé-Analyst Fronteira` |

---

## 9. Erros de Domínio

| Código | Mensagem | Contexto |
|---|---|---|
| `TARIFA_NOT_FOUND` | Regra tarifária não encontrada | ITarifaPort |
| `TARIFA_BREAK_EVEN_VIOLATION` | Valor proposto viola o break-even point | ValidarViolacaoBreakEvenUseCase |
| `TARIFA_DELTA_EXCEEDED` | Variação máxima de 20% excedida | RegraTarifaria |
| `TARIFA_FERIADO_BLOCKED` | Tarifa de feriado não pode ser alterada pelo Zé-Analyst | CalcularTarifaDinamicaUseCase |
| `TARIFA_PROMOCIONAL_BLOCKED` | Tarifa promocional requer aprovação do Zé-Host | CalcularTarifaDinamicaUseCase |
| `OCUPACAO_NOT_FOUND` | Ocupação não encontrada para a data | IOcupacaoPort |
| `OCUPACAO_INVALIDA` | Ocupação não pode exceder capacidade | Ocupacao.create() |
| `SAZONALIDADE_NOT_FOUND` | Sazonalidade não encontrada | ISazonalidadePort |
| `FORECAST_HORIZONTE_INVALIDO` | Horizonte deve ser 7, 30 ou 90 dias | Forecast.create() |
| `FORECAST_CONFIANCA_EXCEDIDA` | Confiança excede o limite do horizonte | Forecast.create() |
| `RATE_PARITY_VIOLATION` | Tarifa do canal direto viola paridade contratual com OTAs | CalcularTarifaDinamicaUseCase |
| `CANAL_INVALIDO` | Canal deve ser direto, booking, airbnb ou expedia | RegraTarifaria |
| `PROPERTY_ID_REQUIRED` | Identificador da propriedade é obrigatório | Todas |

---

## 10. Swarm Lite — Zé-Analyst no Mapa

| Aspecto | Detalhe |
|---|---|
| **Agente** | Zé-Analyst |
| **Contexto** | Revenue & Analytics |
| **Domínio** | `src/domain/revenue/` |
| **Aplicação** | `src/application/revenue/` |
| **Portas Próprias** | `ITarifaPort`, `IOcupacaoPort`, `ISazonalidadePort`, `IForecastPort` |
| **Portas Cross-Context (leitura)** | `IReservaPort` (Hospitalidade), `IPacotePort` (Comercial) |
| **Casos de Uso** | 6 (CalcularTarifaDinamica, ValidarViolacaoBreakEven, SugerirDescontoEstrategico, GerarForecastDemanda, CalcularMetricasRevenue, RebalancearTarifasPorCanal) |
| **Gatilhos** | Ocupação ≥80%, Ocupação ≤40%, Lead parado 7d+, Início do mês, Feriado detectado, Preço concorrente |
| **Handoff** | Zé-Host (para feriados, break-even, promocionais) |
| **Subagentes Swarm** | Ze-Pricing (scrape de concorrentes) |

---

> **Esta especificação entra em vigor imediatamente.**  
> Nenhuma linha de TypeScript será escrita até que este documento seja homologado.  
> Código é descartável. Regras de precificação mal especificadas quebram empresas.
