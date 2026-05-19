import { llmRouter } from '../llm-router';


export interface ToneDNAMetrics {
  formality: number;
  enthusiasm: number;
  empathy: number;
  emojiLevel: number;
  slangUsage: number;
  conciseness: number;
  authority: number;
  humor: number;
  technicality: number;
  intimacy: number;
  proactivity: number;
  resilience: number;
  punctuationStyle: string;
  regionalisms: string[];
}

export class DNAClonerService {
  /**
   * Analisa um log de chat do WhatsApp e extrai o DNA de comunicação em 14 dimensões.
   */
  async extractDNA(chatLog: string): Promise<ToneDNAMetrics> {
    const systemPrompt = `
      Você é um especialista em NLP e Psicologia da Comunicação, atuando como o "Agente 09" do ecossistema ZEHLA.
      Sua tarefa é analisar o histórico de conversas de um hoteleiro (pousadeiro) no WhatsApp e extrair o seu "DNA de Comunicação".
      
      Analise o texto e retorne um objeto JSON estritamente com as seguintes 14 dimensões (0 a 100):
      
      1. formality: 0 (totalmente informal) a 100 (ultra-formal).
      2. enthusiasm: 0 (seco/frio) a 100 (empolgado/vibrante).
      3. empathy: 0 (focado apenas em dados) a 100 (muito acolhedor e empático).
      4. emojiLevel: 0 (nenhum emoji) a 100 (uso generoso de emojis).
      5. slangUsage: 0 (linguagem limpa) a 100 (uso constante de gírias).
      6. conciseness: 0 (prolixo/longo) a 100 (direto ao ponto/curto).
      7. authority: 0 (servil/passivo) a 100 (líder/autoridade).
      8. humor: 0 (sério) a 100 (brincalhão/divertido).
      9. technicality: 0 (linguagem simples) a 100 (uso de termos técnicos de hotelaria).
      10. intimacy: 0 (distante) a 100 (trata como amigo, usa nomes).
      11. proactivity: 0 (apenas responde) a 100 (sempre tenta fechar a venda).
      12. resilience: 0 (desiste fácil) a 100 (argumenta bem contra objeções).
      
      Além disso, retorne:
      13. punctuationStyle: uma descrição curta (ex: "Usa muitas exclamações", "Não usa vírgulas").
      14. regionalisms: uma lista de termos regionais detectados (ex: "uai", "tchê", "top").

      RETORNE APENAS O JSON. NÃO EXPLIQUE.
    `;

    const response = await llmRouter.generate({
      model: 'general',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analise este log de chat e extraia o DNA:\n\n${chatLog.substring(0, 5000)}` }
      ],
      temperature: 0.2, // Precisão alta
    });

    try {
      // Tenta extrair o JSON do conteúdo (lidando com possíveis markdown code blocks)
      const jsonContent = response.content.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonContent) as ToneDNAMetrics;
    } catch (error) {
      console.error('❌ Erro ao parsear DNA extraído:', response.content);
      throw new Error('DNA_PARSING_FAILED: O modelo não retornou um JSON válido.');
    }
  }

  /**
   * Sintetiza o DNA extraído em um prompt de sistema para o Agente Manager.
   */
  synthesizeSystemPrompt(metrics: ToneDNAMetrics): string {
    return `
      Seu Tom de Voz é guiado pelo DNA ZEHLA extraído:
      - Nível de Formalidade: ${metrics.formality}/100
      - Entusiasmo: ${metrics.enthusiasm}/100
      - Empatia: ${metrics.empathy}/100
      - Estilo de Pontuação: ${metrics.punctuationStyle}
      - Regionalismos Permitidos: ${metrics.regionalisms.join(', ')}
      
      Instruções Críticas:
      ${metrics.formality > 70 ? '- Use pronomes de tratamento formais (Sr./Sra.).' : '- Seja informal e use "você".'}
      ${metrics.emojiLevel > 50 ? '- Use emojis para suavizar a conversa.' : '- Evite emojis desnecessários.'}
      ${metrics.conciseness > 70 ? '- Seja extremamente breve e direto.' : '- Pode detalhar mais as respostas.'}
    `;
  }
}

export const dnaClonerService = new DNAClonerService();
