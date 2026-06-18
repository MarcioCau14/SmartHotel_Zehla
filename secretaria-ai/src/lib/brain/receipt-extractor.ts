import { llmRouter } from '../ai/llm-router';

export interface ExtractedReceipt {
  amount: number;
  transactionId: string;
  payerName: string;
  timestamp: string;
  isConfirmed: boolean;
}

export class ReceiptExtractor {
  static async extract(messageContent: string): Promise<ExtractedReceipt | null> {
    const systemPrompt = `Você é um especialista em conciliação bancária.
Extraia dados de COMPROVANTES DE PIX de mensagens de texto.
Extraia: 1. Valor (amount) - apenas número 2. ID da Transação (E...) 3. Nome do Pagador 4. Data e Hora
Responda APENAS em JSON: {"amount": 0.0, "transactionId": "...", "payerName": "...", "timestamp": "...", "isConfirmed": true}
Se NÃO for um comprovante, responda: null`;

    try {
      const response = await llmRouter.generate({
        model: 'general',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageContent }
        ],
        temperature: 0.1
      });
      if (response.content.trim() === 'null') return null;
      const parsed = JSON.parse(response.content);
      return {
        amount: parsed.amount || 0,
        transactionId: parsed.transactionId || 'N/A',
        payerName: parsed.payerName || 'Desconhecido',
        timestamp: parsed.timestamp || new Date().toISOString(),
        isConfirmed: parsed.isConfirmed || false
      };
    } catch (error) {
      console.error('[ReceiptExtractor Error]:', error);
      return null;
    }
  }
}
