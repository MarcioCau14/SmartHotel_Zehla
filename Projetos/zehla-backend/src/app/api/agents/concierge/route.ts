import { NextRequest, NextResponse } from 'next/server'

import { llmRouter } from '@/lib/ai/llm-router'

import { withApiSecurity } from '@/lib/server/with-api-security';

const LOCAL_ATTRACTIONS = [
  { name: 'Praia do Rosa', type: 'praia', description: 'Uma das praias mais bonitas do Brasil, famosa pelo surf e pelo pôr do sol.', distance: '0km' },
  { name: 'Lagoa de Ibiraquera', type: 'lagoa', description: 'Perfeita para stand-up paddle e kitesurf. Águas calmas e paisagem incrível.', distance: '2km' },
  { name: 'Praia da Ferrugem', type: 'praia', description: 'Praia badalada com ótima infraestrutura de bares e restaurantes.', distance: '5km' },
  { name: 'Trilha da Guarda do Embaú', type: 'trilha', description: 'Trilha leve com vista panorâmica da região.', distance: '8km' },
  { name: 'Bar do Deca', type: 'restaurante', description: 'Culinária local com frutos do mar frescos. Ambiente rústico e acolhedor.', distance: '1km' },
  { name: 'Restaurante Ostradamus', type: 'restaurante', description: 'Especializado em ostras e frutos do mar. Vista para a lagoa.', distance: '3km' },
  { name: 'Cachoeira do Rosa', type: 'cachoeira', description: 'Cachoeira escondida na mata atlântica. Trilha curta e refrescante.', distance: '4km' },
  { name: 'Mercado de Artesanato', type: 'compras', description: 'Artesanato local, roupas de praia e souvenirs.', distance: '1.5km' }
]

async function _POST(request: NextRequest) : void {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'GET_RECOMMENDATIONS':
        return await getRecommendations(data)
      case 'GET_WEATHER':
        return await getWeather(data)
      case 'ANSWER_QUESTION':
        return await answerQuestion(data)
      default:
        return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Erro em Concierge:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } });


async function getRecommendations(filters: unknown) {
  try {
  let attractions = [...LOCAL_ATTRACTIONS]

  if (filters?.type) {
    attractions = attractions.filter(a => a.type === filters.type)
  }

  if (filters?.maxDistance) {
    attractions = attractions.filter(a => {
      const dist = parseFloat(a.distance)
      return dist <= filters.maxDistance
    })
  }

  // Gerar resposta personalizada com IA
  const systemPrompt = `Você é o concierge da pousada na Praia do Rosa. 
Recomende atrações locais de forma calorosa e personalizada.
Use emojis e seja entusiasta. Mencione distâncias e dicas práticas.`

  const userPrompt = `Hóspede perguntou sobre: ${filters?.query || 'o que fazer na região'}
Atrações disponíveis: ${JSON.stringify(attractions)}
Gere uma resposta amigável recomendando as melhores opções.`

  const llmResponse = await llmRouter.generate({
    model: 'general',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
    maxTokens: 1000
  })

  return NextResponse.json({
    success: true,
    data: {
      attractions,
      personalizedResponse: llmResponse.content,
      tokensUsed: llmResponse.tokensUsed,
      cost: llmResponse.cost
    }
  })
}

async function getWeather(data: unknown) {
  try {
  // Simulação — em produção integrar com API de clima
  const weather = {
    location: 'Praia do Rosa, Imbituba/SC',
    temperature: 26,
    condition: 'Ensolarado',
    humidity: 75,
    windSpeed: 15,
    uvIndex: 8,
    recommendation: 'Dia perfeito para praia! Não esqueça o protetor solar.',
    forecast: [
      { day: 'Hoje', temp: 26, condition: 'Ensolarado' },
      { day: 'Amanhã', temp: 24, condition: 'Parcialmente nublado' },
      { day: 'Depois', temp: 23, condition: 'Chuva leve' }
    ]
  }

  return NextResponse.json({ success: true, data: weather })
}

async function answerQuestion(data: unknown) {
  try {
  const systemPrompt = `Você é o concierge especialista da Praia do Rosa.
Responda perguntas sobre a região de forma completa e acolhedora.
Se não souber algo específico, sugira onde o hóspede pode encontrar a informação.`

  const llmResponse = await llmRouter.generate({
    model: 'general',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: data.question }
    ],
    temperature: 0.7,
    maxTokens: 1500
  })

  return NextResponse.json({
    success: true,
    data: {
      answer: llmResponse.content,
      tokensUsed: llmResponse.tokensUsed,
      cost: llmResponse.cost
    }
  })
}


  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });
async function _GET() : void {
  try {
  return NextResponse.json({
    agent: 'CONCIERGE',
    status: 'online',
    description: 'Dicas locais, atrações e informações turísticas',
    attractions: LOCAL_ATTRACTIONS.length
  })
}
