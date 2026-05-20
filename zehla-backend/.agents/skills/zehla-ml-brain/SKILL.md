---
name: zehla-ml-brain
description: Define os protocolos e fluxos de Machine Learning (ML) para o "Zehla Brain". Instruções para os agentes sobre como processar interações do WhatsApp para treinamento (Fine-Tuning) ou enriquecimento de contexto (RAG), garantindo que o agente aprenda continuamente o tom de voz e estratégias de conversão de cada pousada.
---

# 🧠 ZEHLA ML Brain Protocol

O Cérebro Zehla não é um modelo estático. Ele aprende continuamente com o histórico de conversas e as taxas de conversão (reservas bem-sucedidas) de cada pousada. Este documento rege como você, enquanto agente de desenvolvimento, deve lidar com o aprendizado de máquina no código.

## 1. Abordagem Híbrida: RAG + Fine-Tuning

A infraestrutura de Machine Learning do Zehla utiliza uma abordagem em duas camadas:

1. **Camada 1: RAG (Retrieval-Augmented Generation)**
   - Utilizada para aprendizado em tempo real (Long-Term Memory).
   - O histórico de sucesso de um cliente (chats que resultaram em reserva) é vetorizado e salvo. Quando um novo lead chama, o LLM busca os 3 fechamentos de maior sucesso daquela pousada específica para guiar o tom de voz.

2. **Camada 2: Fine-Tuning de Modelos Menores (Llama 3 / GPT-4o-mini)**
   - Utilizada para redução de custos em alta escala.
   - Uma vez por semana, os logs armazenados no banco de dados com tag `success=true` são compilados em `.jsonl` e enviados para a API de Fine-Tuning (OpenAI/Replicate), criando um modelo específico que requer muito menos tokens no prompt.

## 2. Padrões de Implementação

Sempre que modificar `llm-router.ts` ou componentes de IA, respeite os seguintes princípios:

### 2.1. O Loop de Feedback Obrigatório
Nenhuma resposta da IA deve ir para o void. Todo payload retornado ao WhatsApp deve ser pareado com uma webhook de "conversão". Se a reserva fechar, a thread inteira ganha pontuação (+1).

```typescript
// Exemplo de como o Zehla Brain espera o armazenamento do dado de ML
interface MLInteractionLog {
  tenantId: string;
  leadId: string;
  threadHistory: Message[];
  outcome: 'BOOKED' | 'LOST' | 'PENDING';
  confidenceScore: number; 
  vectorsGenerated: boolean;
}
```

### 2.2. Separação de Rotas (Cognitive Observability)
Todo modelo utilizado no enxame deve emitir logs para a interface do ZCC (Zehla Control Center). O `CognitiveObservability.tsx` lê métricas reais:
- **Taxa de Conversão da IA**: Quantas reservas o bot fechou vs Humanos.
- **Tone Alignment Score**: Distância semântica (Cos Similarity) entre a resposta da IA e o histórico real do dono da pousada.
- **Model Drift**: Se a IA começar a alucinar, o sistema aciona o `Zehla Guardian` para cortar o acesso e enviar para atendimento humano.

## 3. Comandos do Agente
Quando o usuário pedir para "Ajustar o Cérebro Zehla" ou "Melhorar o aprendizado de máquina":
1. Leia `src/lib/ai/llm-router.ts` e certifique-se de que a função de feedback loop está implementada.
2. Atualize o `CognitiveObservability.tsx` no ZCC para puxar dados dos embeddings.
3. Se necessário, gere scripts na pasta `scripts/ml-training/` para exportar dados para Fine-Tuning `.jsonl`.
