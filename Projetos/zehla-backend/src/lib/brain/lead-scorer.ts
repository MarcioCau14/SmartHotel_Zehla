import { llmRouter } from '../ai/llm-router'

export interface LeadScoreResult {
  score: number
  category: string
  painPoints: string[]
  reasoning: string
}

export class LeadScorer {
  static async scoreLead(name: string, about: string): Promise<LeadScoreResult> {
    if (!about) {
      return { score: 50, category: 'pousada', painPoints: [], reasoning: 'Sem informações de perfil.' }
    }

    const prompt = `
      Você é um especialista em prospecção B2B para o ZEHLA SmartHotel.
      Analise o nome e o status/descrição de perfil do WhatsApp abaixo para identificar se é uma Pousada, Hotel ou Hostel e qual o nível de dor (pain points).

      DADOS:
      Nome: ${name}
      Status (About): ${about}

      REGRAS:
      1. Score de 0 a 100 (100 = lead quentíssimo).
      2. Categorias: pousada, hotel, hostel, outro.
      3. Pain Points: identifique se mencionam falta de tempo, dificuldades com reservas, tecnologia antiga, etc.
      4. Retorne apenas JSON no formato:
      {
        "score": number,
        "category": "pousada" | "hotel" | "hostel" | "outro",
        "painPoints": string[],
        "reasoning": "breve explicação"
      }
    `

    try {
      const response = await llmRouter.generate({
        messages: [{ role: 'user', content: prompt }],
        model: 'classification',
        temperature: 0.1
      })

      const result = JSON.parse(response.content.trim().match(/\{.*\}/s)?.[0] || '{}')
      return {
        score: result.score || 50,
        category: result.category || 'pousada',
        painPoints: result.painPoints || [],
        reasoning: result.reasoning || 'Análise básica concluída.'
      }
    } catch (error) {
      console.error('❌ Lead Scoring Error:', error)
      return { score: 50, category: 'pousada', painPoints: [], reasoning: 'Erro na análise da IA.' }
    }
  }
}
