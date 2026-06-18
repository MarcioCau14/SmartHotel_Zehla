# 🧠 SUPER DOCUMENTO: MASTER PLAN ZEHLA ZAOS

*Data: 17 de junho de 2026*
*Status: Aprovado para Implementação Direta*

## 1. O Grande Despertar: Do "Doom Prompting" para a Autonomia Computacional
A era de ficar mexendo em *prompts* estáticos acabou. O ZEHLA operará usando **Loop Engineering** ("Hard Loops") e a arquitetura **ZAOS** para orquestrar agentes que monitoram, avaliam e consertam a si mesmos antes de falarem com os hóspedes, eliminando o erro humano e da máquina.

Este Master Plan traduz a colossal pesquisa teórica para o ambiente tangível de produção que construímos (`secretaria-ai` + Node.js + Prisma + Docker).

---

## 2. Pilar 1: Headroom & Router Neuroeconômico (Controle Total de Custo)
Para que o sistema consiga operar autonomamente ("na madrugada inteira") sem falir financeiramente a operação de 50 pousadas, integraremos a tecnologia **Headroom**.

- **O que faremos no código**: A criação de `src/lib/brain/router/llm-router.ts`.
- **Como funciona**: Nenhuma parte do sistema chama o OpenRouter/OpenAI diretamente. Tudo passa pelo `llm-router`. Este roteador decide qual modelo usar (Thompson Sampling) dependendo do nível da tarefa.
- **Compressão Headroom**: Antes do envio da query, o Headroom (via SDK Node.js `headroom-ai`) comprime relatórios longos, histórico gigante do WhatsApp e saídas de banco de dados, reduzindo os tokens em 70% sem perder informações cruciais para a venda ou suporte.

---

## 3. Pilar 2: Loop Engineering ("Hardness")
Nossos agentes não farão apenas ações *One-Shot* inseguras. Eles executarão Loops de Qualidade.

- **O que faremos no código**: A criação de `src/lib/brain/loops/closing-loop.ts`.
- **Como funciona**:
  1. **ACT (Agente Vendedor)**: Lê a intenção do cliente, consulta disponibilidades, e formula uma resposta/proposta usando modelo inteligente (ex: GPT-4o).
  2. **OBSERVE (Grafo)**: Pega a proposta e não envia para o WhatsApp! Passa para o próximo nó.
  3. **REASON (Rubrica & Agente Avaliador)**: Um modelo menor e muito mais barato (ex: GPT-4o-mini ou Haiku) usa a `HospitalityQualityRubric` para avaliar se a proposta obedece todas as regras da Pousada. 
  4. **REPEAT (Hardness)**: Se não passou na rubrica, volta para o passo 1 dizendo onde melhorar. Se passou, envia com segurança absoluta.

---

## 4. Pilar 3: Zettelkasten & Campo Akáshico (O Subconsciente)
Em vez de depender do treinamento original do LLM, o Cérebro ZEHLA constrói seu "Akashic Record".

- **O que faremos no código**: Atualizar `schema.prisma` com vetorização de `AtomNotes` (notas atômicas) e implementar `src/lib/brain/memory/akashic-record.ts`.
- **Como funciona**: Através de `pgvector` e busca semântica, o Cérebro encontra exatamente as regras certas para a conversa atual, usando o **Headroom Context Manager** para comprimir até as memórias mais longas e não estourar o limite de 2000 tokens.

---

## 5. Roteiro Executivo de Implementação no ZEHLA (Fase de Código)

A fundação foi solidificada na infraestrutura da madrugada, limpando o lixo tecnológico. Agora, o caminho é limpo e determinístico:

1. **Ajuste de Esqueleto:** Estruturar as pastas `/brain/router`, `/brain/memory`, e `/brain/loops` dentro de `src/lib/`.
2. **Integração Headroom:** Instalar dependências (`npm install headroom-ai`), montar o roteador seguro `llm-router.ts`.
3. **Escrita da Rubrica:** Implementar a `HospitalityQualityRubric` no código, garantindo que "bom senso hoteleiro" se torne um contrato matemático que o agente deve respeitar.
4. **Montagem do Loop (ClosingEngine):** Conectar os LLMs na topologia Act->Observe->Reason->Repeat usando os BullMQ workers que já planejamos.
5. **Dry-Run & Observabilidade:** Lançar testes na IDE local sem que o usuário final receba a mensagem, analisando o terminal (dev.log) para atestar a redução de custo pelo Headroom e a precisão do Loop.

**Conclusão:** 
O *ZEHLA* está evoluindo de um "chatbot de IA" para um **Operating System Cognitivo Autônomo e Resiliente**. Esta é a ponte definitiva solicitada. O sistema já não apenas reage, ele projeta, avalia e se protege.
