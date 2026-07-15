'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// ── Types ──────────────────────────────────────────────────────────────────────

interface ClassificationTest {
  message: string
  expectedIntent: string
  classifiedIntent: string
  confidence: number
  method: string
  correct: boolean
}

interface ProcessResult {
  success: boolean
  mode: string
  input: string
  classification: { intent: string; confidence: number }
  prompts: { system: string; user: string }
  toolResults: Array<{ tool: string; result: any }>
  readyForLLM: boolean
}

interface TestData {
  mode: string
  shouldIncludeSalesCTA: boolean
  sampleContext: {
    name: string
    type: string
    city: string
    hostKnowledgeCount: number
    neighborhoodTipsCount: number
    equipmentCount: number
  }
  classificationTests: ClassificationTest[]
  accuracy: number
}

// ── Quick Test Messages ────────────────────────────────────────────────────────

const QUICK_MESSAGES = [
  { label: '🔑 Check-in', message: 'Cheguei! Como faço pra entrar?' },
  { label: '📶 WiFi', message: 'Qual a senha do wifi?' },
  { label: '📜 Regras', message: 'Posso ter visita? Posso fumar?' },
  { label: '🔧 Equipamento', message: 'Como liga o ar do quarto?' },
  { label: '🗺️ Bairro', message: 'Tem padaria perto? Onde comer?' },
  { label: '🅿️ Estacionamento', message: 'Onde estaciono meu carro?' },
  { label: '🚨 Emergência', message: 'Vazou água na cozinha!' },
  { label: '👋 Saudação', message: 'Oi! Tudo bem?' },
  { label: '📅 Estender', message: 'Posso ficar mais um dia?' },
  { label: '🧹 Limpeza', message: 'Preciso de toalhas limpas' },
  { label: '🔩 Manutenção', message: 'O chuveiro não esquenta' },
  { label: '⭐ Dicas', message: 'O que fazer por aqui?' },
  { label: '👤 Humano', message: 'Quero falar com o dono' },
  { label: '💰 Preço (desconhecido!)', message: 'Quanto custa a diária?' },
]

// ── Comparison Data ────────────────────────────────────────────────────────────

const COMPARISON = [
  { dim: 'Papel', pousada: 'Secretária recepcionista', airb: 'O dono/anfitrião do imóvel' },
  { dim: 'Objetivo', pousada: 'Vender quartos, fechar reserva', airb: 'Fazer o hóspede se sentir em casa' },
  { dim: 'Tom', pousada: 'Profissional, hospitaleiro', airb: 'Pessoal, íntimo, amigo' },
  { dim: 'CTA', pousada: '"Quer reservar? Mande o PIX!"', airb: '"Qualquer coisa me chama!"' },
  { dim: 'Conhecimento', pousada: 'Tipos de quarto, preços', airb: 'Onde fica a chave, melhor padaria' },
  { dim: 'Intenções', pousada: 'RESERVATION_CREATE, PRICE_INQUIRY', airb: 'CHECK_IN_GUIDE, HOUSE_RULES' },
  { dim: 'Tools', pousada: 'zehla_sugerir_preco', airb: 'airb_get_checkin_guide' },
  { dim: 'Prompt', pousada: '"…da pousada X"', airb: '"Você é o ANFITRIÃO de X"' },
  { dim: 'Venda direta', pousada: 'SIM (PIX, link pagamento)', airb: 'NÃO — hóspede já reservou' },
  { dim: 'Fechadura', pousada: 'Não suportado', airb: 'lockProvider + lockCode' },
  { dim: 'Dicas do bairro', pousada: 'GENÉRICO ("seja entusiasta")', airb: 'ESPECÍFICO (padaria, 3 min)' },
]

// ── Component ──────────────────────────────────────────────────────────────────

export default function Home() {
  const [testData, setTestData] = useState<TestData | null>(null)
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('test')

  const runTests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/airb-test')
      const data = await res.json()
      setTestData(data)
    } catch (err) {
      console.error('Error running tests:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const processMessage = useCallback(async (msg: string) => {
    setLoading(true)
    setMessage(msg)
    try {
      const res = await fetch('/api/airb-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      setProcessResult(data)
    } catch (err) {
      console.error('Error processing message:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
              Z
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Zélla AirB <span className="text-emerald-500">Strategy</span>
              </h1>
              <p className="text-xs text-slate-500">Prova de Conceito — Anfitrião que Sabe Tudo</p>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">
            POC ISOLADA
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="test">🧪 Teste Interativo</TabsTrigger>
            <TabsTrigger value="classification">📊 Classificação</TabsTrigger>
            <TabsTrigger value="compare">⚖️ Comparação</TabsTrigger>
            <TabsTrigger value="architecture">🏗️ Arquitetura</TabsTrigger>
          </TabsList>

          {/* ── Tab: Teste Interativo ── */}
          <TabsContent value="test" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Input Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💬 Simular Mensagem de Hóspede</CardTitle>
                  <CardDescription>
                    Envie uma mensagem como se fosse um hóspede Airbnb e veja como o Zélla AirB processa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick messages */}
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Mensagens rápidas:</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_MESSAGES.map((qm, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => processMessage(qm.message)}
                          disabled={loading}
                        >
                          {qm.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Custom message input */}
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Ou digite sua mensagem:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && message.trim() && processMessage(message)}
                        placeholder="Ex: Qual a senha do wifi?"
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Button
                        onClick={() => processMessage(message)}
                        disabled={loading || !message.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>

                  {/* Imóvel Context */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-xs">
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">📍 Imóvel de Teste:</p>
                    <p className="text-slate-600 dark:text-slate-400">Apartamento Vista Mar — Jurerê Internacional, Florianópolis/SC</p>
                    <p className="text-slate-500 dark:text-slate-500">Lockbox: 4521 | WiFi: VistaMar_5G / jurere2024 | Vaga: 14</p>
                  </div>
                </CardContent>
              </Card>

              {/* Result Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📋 Resultado do Processamento</CardTitle>
                  <CardDescription>
                    Intenção detectada, prompts gerados e tools executados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {processResult ? (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {/* Classification */}
                        <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-3">
                          <p className="font-medium text-emerald-800 dark:text-emerald-300 text-sm">
                            Intenção: {processResult.classification.intent}
                          </p>
                          <p className="text-emerald-600 dark:text-emerald-400 text-xs">
                            Confiança: {(processResult.classification.confidence * 100).toFixed(1)}%
                          </p>
                          <p className="text-emerald-600 dark:text-emerald-400 text-xs">
                            CTA de Venda: {processResult.mode === 'airbnb' ? 'NÃO ❌ (correto!)' : 'SIM'}
                          </p>
                        </div>

                        {/* Tool Results */}
                        {processResult.toolResults.length > 0 && (
                          <div>
                            <p className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">
                              🔧 Tools Executadas ({processResult.toolResults.length}):
                            </p>
                            {processResult.toolResults.map((tr, i) => (
                              <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 mb-2">
                                <p className="font-mono text-xs text-emerald-600">{tr.tool}</p>
                                <pre className="text-xs text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-wrap">
                                  {JSON.stringify(tr.result, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* System Prompt Preview */}
                        <div>
                          <p className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">
                            📝 System Prompt (primeiras 800 chars):
                          </p>
                          <pre className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                            {processResult.prompts.system.slice(0, 800)}...
                          </pre>
                        </div>

                        {/* User Prompt */}
                        <div>
                          <p className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">
                            👤 User Prompt:
                          </p>
                          <pre className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                            {processResult.prompts.user}
                          </pre>
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-[500px] flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <p className="text-4xl mb-3">🏨</p>
                        <p className="text-sm">Envie uma mensagem para ver o resultado</p>
                        <p className="text-xs mt-1">O Zélla AirB vai classificar a intenção e gerar os prompts</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Tab: Classification Tests ── */}
          <TabsContent value="classification" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">📊 Testes de Classificação de Intenção</CardTitle>
                    <CardDescription>
                      Teste automático: 15 mensagens de exemplo classificadas pelo Zélla AirB
                    </CardDescription>
                  </div>
                  <Button onClick={runTests} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                    {loading ? 'Executando...' : '▶ Executar Testes'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {testData ? (
                  <div className="space-y-4">
                    {/* Accuracy */}
                    <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                          {(testData.accuracy * 100).toFixed(0)}%
                        </p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                          Acurácia da classificação heurística
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          CTA de venda: <span className="font-bold text-red-500">{testData.shouldIncludeSalesCTA ? 'SIM' : 'NÃO'}</span>
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Modo: <span className="font-bold text-emerald-600">{testData.mode}</span>
                        </p>
                      </div>
                    </div>

                    {/* Results Table */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                          <tr>
                            <th className="px-3 py-2 text-left">Mensagem</th>
                            <th className="px-3 py-2 text-left">Esperado</th>
                            <th className="px-3 py-2 text-left">Classificado</th>
                            <th className="px-3 py-2 text-center">Confiança</th>
                            <th className="px-3 py-2 text-center">✓</th>
                          </tr>
                        </thead>
                        <tbody>
                          {testData.classificationTests.map((test, i) => (
                            <tr key={i} className={test.correct ? 'bg-green-50/50 dark:bg-green-950/20' : 'bg-red-50/50 dark:bg-red-950/20'}>
                              <td className="px-3 py-2 border-t text-slate-700 dark:text-slate-300">
                                &ldquo;{test.message}&rdquo;
                              </td>
                              <td className="px-3 py-2 border-t">
                                <Badge variant="outline" className="text-xs">{test.expectedIntent}</Badge>
                              </td>
                              <td className="px-3 py-2 border-t">
                                <Badge variant="outline" className={`text-xs ${test.correct ? 'text-emerald-600 border-emerald-300' : 'text-red-600 border-red-300'}`}>
                                  {test.classifiedIntent}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 border-t text-center">
                                {(test.confidence * 100).toFixed(0)}%
                              </td>
                              <td className="px-3 py-2 border-t text-center">
                                {test.correct ? '✅' : '❌'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="h-60 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <p className="text-4xl mb-3">📊</p>
                      <p className="text-sm">Clique em &quot;Executar Testes&quot; para ver os resultados</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Comparison ── */}
          <TabsContent value="compare" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚖️ Zélla Pousada vs Zélla AirB</CardTitle>
                <CardDescription>
                  Comparação direta dos dois modos de operação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Dimensão</th>
                        <th className="px-4 py-3 text-left font-medium text-blue-600 dark:text-blue-400">🏢 Zélla Pousada</th>
                        <th className="px-4 py-3 text-left font-medium text-emerald-600 dark:text-emerald-400">🏠 Zélla AirB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{row.dim}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.pousada}</td>
                          <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300 font-medium">{row.airb}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">⚠️ Pontos Críticos de Separação</p>
                  <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-400">
                    <li>• O PromptBuilder do Zélla Pousada diz &quot;incentivar a reserva direta&quot; — isso é TÓXICO no Airbnb</li>
                    <li>• O intent-router classifica &quot;Quanto custa?&quot; como PRICE_INQUIRY — no AirB isso não existe</li>
                    <li>• As tools do Zélla Pousada são de vendas (sugerir preço, analisar ocupação) — no AirB são de hospitalidade</li>
                    <li>• O persona learner default é &quot;hospitalidade premium&quot; — no AirB precisa ser &quot;amigo que empresta a casa&quot;</li>
                    <li>• O Property.tenantId tem @unique — impede múltiplos imóveis por anfitrião Airbnb</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Architecture ── */}
          <TabsContent value="architecture" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🏗️ Arquitetura da Strategy Pattern</CardTitle>
                <CardDescription>
                  Como o Zélla AirB se encaixa na infraestrutura existente sem tocar no código da pousada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {/* Current Architecture */}
                    <div>
                      <p className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-2">📦 ARQUITETURA ATUAL (Monolítica)</p>
                      <pre className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-xs text-blue-800 dark:text-blue-300 whitespace-pre font-mono">
{`Webhook WhatsApp
    ↓
resolveTenantByPhone()
    ↓
processIncomingMessage()  ← HARDCODED "pousada"
    ↓
classifyIntent()          ← Intents de pousada
    ↓
executeCognitivePipeline()
    ├─ Guardrails
    ├─ Intent Router      ← "classificador de hóspedes de pousada"
    ├─ Tool Calling       ← zehla_sugerir_preco, zehla_analisar_ocupacao
    └─ RAG + LLM          ← Prompt com CTA de venda`}
                      </pre>
                    </div>

                    {/* Proposed Architecture */}
                    <div>
                      <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mb-2">🏗️ ARQUITETURA PROPOSTA (Strategy Pattern)</p>
                      <pre className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 text-xs text-emerald-800 dark:text-emerald-300 whitespace-pre font-mono">
{`Webhook WhatsApp
    ↓
resolveTenantByPhone()
    ↓
getOperatingMode(tenantId)  ← NOVO: consulta Property.type / Tenant.mode
    ↓
    ├── mode === "pousada" → PousadaStrategy
    │     ↓
    │   classifyIntent()        ← Intents de pousada
    │   buildSystemPrompt()     ← "…da pousada X, incentivar reserva direta"
    │   getTools()              ← zehla_sugerir_preco, etc.
    │   shouldIncludeSalesCTA() ← TRUE
    │
    └── mode === "airbnb"  → AirBStrategy
          ↓
        classifyIntent()        ← Intents Airbnb (CHECK_IN_GUIDE, HOUSE_RULES...)
        buildSystemPrompt()     ← "Você é o ANFITRIÃO de X"
        getTools()              ← airb_get_checkin_guide, etc.
        shouldIncludeSalesCTA() ← FALSE

COMPARTILHADO (não muda):
  ✅ Webhook WhatsApp
  ✅ Security Stack (HMAC, PII, Guardrails)
  ✅ LLM Router (ZaosNeuroRouter)
  ✅ Database + Prisma
  ✅ iCal Service
  ✅ Plan Features + Billing
  ✅ Conversation Learner`}
                      </pre>
                    </div>

                    {/* Files to Change */}
                    <div>
                      <p className="font-bold text-sm text-amber-600 dark:text-amber-400 mb-2">📁 ARQUIVOS A MODIFICAR (quando sair da POC)</p>
                      <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 text-xs space-y-2">
                        <div>
                          <span className="font-bold text-amber-800 dark:text-amber-300">1. prisma/schema.prisma</span>
                          <p className="text-amber-700 dark:text-amber-400">
                            — Property.type: adicionar &quot;apartamento|casa|studio|loft&quot;<br/>
                            — Property: adicionar operatingMode, airbnbListingId, lat/lng, checkInInstructions, houseRules, lockProvider, lockCode<br/>
                            — Remover @unique de Property.tenantId (permitir 1:N)
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-amber-800 dark:text-amber-300">2. src/lib/whatsapp-ai-responder.ts</span>
                          <p className="text-amber-700 dark:text-amber-400">
                            — Linha 363: bifurcar prompt por OperatingMode<br/>
                            — Linha 382-393: CTA de venda só para mode === &quot;pousada&quot;
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-amber-800 dark:text-amber-300">3. src/lib/ai/intent-router.ts</span>
                          <p className="text-amber-700 dark:text-amber-400">
                            — Receber OperatingMode e selecionar intents corretos
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-amber-800 dark:text-amber-300">4. src/lib/brain/agent-orchestrator.ts</span>
                          <p className="text-amber-700 dark:text-amber-400">
                            — Receber Strategy no construtor ou no process()
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-amber-800 dark:text-amber-300">5. NOVO: src/lib/strategies/</span>
                          <p className="text-amber-700 dark:text-amber-400">
                            — IZellaStrategy (interface)<br/>
                            — PousadaStrategy (wrappa o código existente)<br/>
                            — AirBStrategy (este arquivo, já validado)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Zélla AirB Strategy — Prova de Conceito Isolada</span>
          <span>Nenhum arquivo do Zélla Pousada foi modificado</span>
        </div>
      </footer>
    </div>
  )
}
