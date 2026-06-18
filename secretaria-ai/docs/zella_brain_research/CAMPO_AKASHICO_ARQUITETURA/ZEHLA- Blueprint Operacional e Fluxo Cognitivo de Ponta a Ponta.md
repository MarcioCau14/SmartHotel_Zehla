# ⚙️ ZEHLA: Blueprint Operacional e Fluxo Cognitivo de Ponta a Ponta

Este documento é o guia definitivo de engenharia de fluxos e predições do ecossistema **ZEHLA SmartHotel**. Ele demonstra o comportamento e a integração de todas as camadas do sistema quando estiverem operando na "vida real".

---

## 🔄 1. Diagramas de Fluxo Operacional (Ponta a Ponta)

Para visualizar com clareza o funcionamento sem cruzamento de linhas ou layouts confusos, dividimos a operação do ecossistema ZEHLA em três fluxos lógicos e complementares:

### Fluxo A: Funil de Vendas e Ativação do Dono da Pousada
Este fluxo descreve como o Dono da Pousada assina o plano, realiza a configuração de contas e acessa o dashboard:

```mermaid
flowchart LR
    %% Configuração de Cores & Classes Semânticas
    classDef cliente fill:#eef2f3,stroke:#3a7bd5,stroke-width:2px,color:#333;
    classDef zcc fill:#e3f2fd,stroke:#1e88e5,stroke-width:2px,color:#0d47a1;
    classDef db fill:#f1f8e9,stroke:#7cb342,stroke-width:2px,color:#33691e;
    classDef gateway fill:#fff8e1,stroke:#ffb300,stroke-width:2px,color:#ff6f00;

    A["Dono da Pousada"]:::cliente -->|1. Acessa LP| B["Página de Vendas"]:::cliente
    B -->|2. Escolhe Plano| C{"Gateway ZCC"}:::zcc
    
    C -->|Pacote Lite| C1["ZCC Lite"]:::zcc
    C -->|Pacote Pro| C2["ZCC Pro"]:::zcc
    C -->|Pacote Enterprise| C3["ZCC Enterprise"]:::zcc
    
    C1 & C2 & C3 -->|3. Pagamento| D["Stripe / Mercado Pago"]:::gateway
    D -->|4. Confirmado| E["ZCC Core Engine"]:::zcc
    E -->|5. Cria Tenant RLS| F[("Banco Prisma")]:::db
    E -->|6. Libera Onboarding| G["Dashboard & RoomBoard"]:::cliente
```

### Fluxo B: Pipeline de Aprendizado (ML Brain & RAG)
Este fluxo mostra como o cérebro ZEHLA aprende a partir das conversas históricas das **6 Pousadas Amigas** e calibra o tom de voz:

```mermaid
flowchart TD
    %% Configuração de Cores & Classes Semânticas
    classDef entrada fill:#eceff1,stroke:#607d8b,stroke-width:2px,color:#263238;
    classDef processo fill:#e0f7fa,stroke:#00acc1,stroke-width:2px,color:#006064;
    classDef armazenamento fill:#efebe9,stroke:#8d6e63,stroke-width:2px,color:#4e342e;
    classDef cérebro fill:#ede7f6,stroke:#5e35b1,stroke-width:2px,color:#4a148c;

    subgraph Ingestao ["1. Ingestão & Memória"]
        A["WhatsApp Histórico"]:::entrada --> B["MemoryIngestionService"]:::processo
        B --> C["ZaosMemoryAdapter"]:::processo
        C --> D[("SQLite Vector DB")]:::armazenamento
    end

    subgraph Calibracao ["2. Processamento Noturno & DNA"]
        D --> E["SubconsciousWorker"]:::cérebro
        E --> F["ContactProfile (Tags & Dores)"]:::armazenamento
    end

    subgraph SinteseVoz ["3. Treinamento Vocal"]
        G["Amostra de Voz (Dono)"]:::entrada --> H["Voice Studio V2"]:::cérebro
        H --> I["DNA Vocal Calibrado"]:::cérebro
    end
```

### Fluxo C: Atendimento e Conversão do Hóspede na "Vida Real"
Este diagrama detalha a sequência interativa entre o hóspede, a IA com voz clonada e a conciliação financeira:

```mermaid
sequenceDiagram
    autonumber
    actor H as Hóspede Final
    participant W as Evolution API (WhatsApp)
    participant R as ZMG Router (ZCC)
    participant B as ML Brain (Cérebro ZEHLA)
    participant DB as Banco Prisma / RoomBoard
    participant P as Gateway / PIX Dinâmico

    H->>W: Envia mensagem ("Olá, tem quarto?")
    W->>R: Transmite payload de mensagem
    R->>DB: Consulta disponibilidade (RoomBoard) & Tarifas
    R->>B: Solicita resposta no tom da pousada
    B->>R: Retorna texto + áudio (Clone de voz)
    R->>W: Envia áudio e texto ao WhatsApp
    W->>H: Entrega resposta idêntica ao dono da pousada
    
    H->>W: Solicita reserva & Envia comprovante de pagamento
    W->>R: Detecta comprovante / imagem do PIX
    R->>P: Valida PIX / Conciliação bancária automática
    P->>R: Confirmação de recebimento (100% líquido)
    R->>DB: Atualiza reserva para PAID & Bloqueia quarto no RoomBoard
    R->>W: Envia confirmação e regras de check-in
```

---

## 📁 2. Mapeamento de Fases e Lógica de Operação

### Fase A: Conversão & Ingestão Financeira (Dono da Pousada)
1. **Escolha de Pacotes:** O Dono da Pousada seleciona entre os planos *LITE, PRO ou ENTERPRISE*. Cada plano determina limites de:
   * **Quartos cadastrados** (até 10 quartos no LITE, ilimitado no PRO).
   * **Quota mensal de tokens de voz** para síntese de áudio (Zehla Voice Budget).
   * **Acesso a canais de fallback** (SMS e E-mail integrados no ZMG).
2. **Processamento Financeiro & Contas de Banco:** O ZCC gerencia o recebimento da assinatura do cliente:
   * A assinatura é criada via gateway de pagamento, gerando um `Invoice` e registrando as contas bancárias da pousada.
   * O sistema realiza a conciliação bancária automática via Webhook para registrar depósitos diretos, liberando a chave do tenant imediatamente após a detecção de confirmação.

---

### Fase B: Dashboard & Onboarding Integrado
Uma vez aprovado o pagamento, o Dono da Pousada é direcionado para a bancada digital do ZCC, onde os seguintes dados são configurados e estruturados:

| Aba do Dashboard | Componente Técnico Responsável | Ação Operacional |
| :--- | :--- | :--- |
| **Mapa de Quartos** | [RoomBoard](file:///Users/marciocau/Projetos/zehla-backend/src/components/dashboard/RoomBoard.tsx) | Visualização e manipulação visual das reservas nos quartos. |
| **Onboarding Wizard** | [OnboardingWizard](file:///Users/marciocau/Projetos/zehla-backend/src/components/onboarding/OnboardingWizard.tsx) | Fluxo guiado para configurar dados de endereço, regras locais e tarifas base. |
| **Terminal de Logs** | [LiveTerminal](file:///Users/marciocau/Projetos/zehla-backend/src/components/client/LiveTerminal.tsx) | Tela de monitoramento em tempo real que exibe os pensamentos e decisões tomadas pelos agentes. |
| **Voice Studio** | [VoiceStudioV2](file:///Users/marciocau/Projetos/zehla-backend/src/components/VoiceStudio/VoiceStudioV2.tsx) | Upload e treinamento de amostras de voz para gerar o DNA vocal da pousada. |

---

### Fase C: O Aprendizado Contínuo (ML Brain & RAG)
Para que a IA aja de forma preditiva, ela precisa aprender os comportamentos dos hóspedes específicos de cada pousada. Isso é feito por meio de dois ciclos paralelos:

```
[Fluxo de Aprendizado ZEHLA]
Histórico WhatsApp (6 Pousadas Amigas) 
       ⬇
Ingestão RAG (MemoryIngestionService) ➡️ Criação da Árvore Semântica de Memória
       ⬇
Ciclo Subconsciente (SubconsciousWorker) ➡️ Calibração de Intenções e Modelos Locais
       ⬇
Geração Preditiva (Z-Router) ➡️ Resposta Personalizada e Conversão de Vendas
```

*   **Ingestão de Conversas (RAG):** As mensagens extraídas do WhatsApp são quebradas em trechos semânticos, vetorizadas e gravadas na tabela `ContactProfile` e na memória vetorial local (`ZaosMemoryAdapter`).
*   **Ciclo Subconsciente:** Executado assincronamente pelo [SubconsciousWorker](file:///Users/marciocau/Projetos/zehla-backend/src/lib/ml/subconscious-worker.ts). Ele processa e sumariza interações antigas durante a madrugada, alimentando o perfil do hóspede com tags comportamentais (ex: *Hóspede recorrente, prefere check-in tardio, pede desconto*).

---

## 🔮 3. Inteligência Preditiva e Prevenção de Falhas (Vida Real)

Para operar de forma sustentável e resiliente antes mesmo que problemas ocorram, o ZEHLA implementa os seguintes mecanismos preditivos:

### 1. Detecção Precoce de Gargalos e Cancelamentos (Anomalies & RevPAR)
O cérebro ZEHLA analisa em tempo real os dados financeiros e reservas cadastradas:
*   **Zé-Analyst (Revenue):** Calcula métricas de ocupação futura, ADR (Diária Média) e RevPAR (Receita por Quarto Disponível). Se a taxa de ocupação estimada para o próximo feriado estiver 20% abaixo da média histórica regional, o sistema alerta o Dono da Pousada no painel e sugere automaticamente uma campanha reativa (Sales Farming) com cupons de desconto inteligentes.

### 2. Defesa Ativa e Correção Autônoma (Self-Healing)
Caso algum componente essencial perca a integridade em produção, o sistema executa o protocolo de autocorreção sem interromper a operação:

```mermaid
flowchart TD
    %% Configuração de Cores & Classes Semânticas
    classDef monitor fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef action fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#e65100;
    classDef alarm fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c;

    A["Zelador AI: Monitoramento Ativo"]:::monitor --> B{"Banco de Dados Online?"}
    B -- Não --> B1["Modo Degradado: SQLite Local"]:::action
    B -- Sim --> C{"Evolution API Conectada?"}
    
    C -- Não --> C1["Alternar para Gateway de SMS/E-mail"]:::action
    C -- Sim --> D{"Consumo de Tokens da IA?"}
    
    D -- Crítico (>Budget) --> D1["FinOps Breaker: Bloquear Áudio, Enviar Texto"]:::alarm
    D -- Normal --> E["Operação Segura"]:::monitor
    
    B1 & C1 & D1 --> F["Registrar SystemLog & Alerta no LiveTerminal"]:::monitor
```

*   **Modo Degradado Automático:** Conforme codificado na resiliência do `PosteriorRepository`, caso o banco de dados principal sofra oscilação de conexão, a inteligência degrada automaticamente para o cache SQLite local in-memory. Os dados continuam sendo gravados localmente e são sincronizados de volta assim que a conexão principal é restabelecida.
*   **FinOps Breaker:** Se o consumo de créditos de síntese de voz (áudio) subir exponencialmente acima do budget configurado pelo cliente em menos de 1 hora, o sistema bloqueia temporariamente a geração de áudios e alterna o ZMG para responder em texto, prevenindo faturas de API astronômicas por loops infinitos de mensagens.

---

> [!IMPORTANT]
> **PREPARAÇÃO PARA A VIDA REAL:** O alinhamento perfeito de todas essas camadas garante que o ZEHLA não seja apenas um chatbot passivo, mas um **Sistema Operacional de Hospitalidade**. Ele prevê desistências, recupera faturamento de leads frios e garante resiliência técnica militar contra oscilações de rede locais.
