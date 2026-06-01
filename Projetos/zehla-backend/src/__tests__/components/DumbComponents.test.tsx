// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KanbanCard } from '../../components/ui/KanbanCard'
import { KanbanColumn } from '../../components/ui/KanbanColumn'
import { ChatBubble } from '../../components/ui/ChatBubble'
import { CognitiveTerminalUI } from '../../components/zcc/CognitiveTerminalUI'
import { LeadKanbanUI, montarColunas } from '../../components/zcc/LeadKanbanUI'

describe('KanbanCard', () => {
  const baseProps = {
    leadName: 'João Silva',
    score: 85,
    origem: 'WhatsApp',
    estado: 'entrada' as const,
    grupo: 'topo' as const,
    diasSemInteracao: 0,
    icpFit: 'ideal' as const,
  }

  it('deve renderizar nome e score do lead', () => {
    render(<KanbanCard {...baseProps} />)
    expect(screen.getByText('João Silva')).toBeDefined()
    expect(screen.getByText('85/100')).toBeDefined()
  })

  it('deve renderizar origem e ICP', () => {
    render(<KanbanCard {...baseProps} />)
    expect(screen.getByText('WhatsApp')).toBeDefined()
    expect(screen.getByText('ICP: ideal')).toBeDefined()
  })

  it('deve exibir dias de inatividade quando > 0', () => {
    render(<KanbanCard {...baseProps} diasSemInteracao={5} />)
    expect(screen.getByText('5d inativo')).toBeDefined()
  })

  it('deve exibir botao Qualificar para leads no topo do funil', () => {
    render(<KanbanCard {...baseProps} onQualificar={vi.fn()} />)
    expect(screen.getByText('Qualificar')).toBeDefined()
  })

  it('deve disparar callback ao clicar em Qualificar', () => {
    const onQualificar = vi.fn()
    render(<KanbanCard {...baseProps} onQualificar={onQualificar} />)
    fireEvent.click(screen.getByText('Qualificar'))
    expect(onQualificar).toHaveBeenCalledTimes(1)
  })

  it('deve exibir botao Handoff para leads em agendamento', () => {
    render(
      <KanbanCard
        {...baseProps}
        estado="agendado"
        grupo="agendamento"
        onHandoff={vi.fn()}
      />,
    )
    expect(screen.getByText('Handoff')).toBeDefined()
  })

  it('nao deve exibir botoes de acao para leads fechados', () => {
    render(
      <KanbanCard
        {...baseProps}
        estado="venda_concluida"
        grupo="fechado"
      />,
    )
    expect(screen.queryByText('Qualificar')).toBeNull()
    expect(screen.queryByText('Handoff')).toBeNull()
  })
})

describe('KanbanColumn', () => {
  it('deve renderizar titulo e quantidade de cards', () => {
    render(
      <KanbanColumn
        titulo="Topo de Funil"
        cor="bg-slate-500"
        cards={[
          {
            leadName: 'Ana',
            score: 50,
            origem: 'Site',
            estado: 'entrada',
            grupo: 'topo',
            diasSemInteracao: 0,
            icpFit: 'minimo',
          },
          {
            leadName: 'Carlos',
            score: 30,
            origem: 'Instagram',
            estado: 'entrada',
            grupo: 'topo',
            diasSemInteracao: 0,
            icpFit: 'fora_icp',
          },
        ]}
      />,
    )
    expect(screen.getByText('Topo de Funil')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('Ana')).toBeDefined()
    expect(screen.getByText('Carlos')).toBeDefined()
  })

  it('deve mostrar placeholder quando vazia', () => {
    render(
      <KanbanColumn
        titulo="Fechado"
        cor="bg-emerald-500"
        cards={[]}
      />,
    )
    expect(screen.getByText('Sem leads nesta etapa')).toBeDefined()
  })
})

describe('ChatBubble', () => {
  const baseBubble = {
    messageId: 'evt-1',
    text: 'Olá! Como posso ajudar?',
    timestamp: new Date('2026-01-01T10:00:00'),
    intent: 'saudacao',
    origem: 'ze-concierge',
  }

  it('deve renderizar texto e intent', () => {
    render(<ChatBubble {...baseBubble} />)
    expect(screen.getByText('Olá! Como posso ajudar?')).toBeDefined()
    expect(screen.getByText('saudacao')).toBeDefined()
    expect(screen.getByText('ze-concierge')).toBeDefined()
  })

  it('deve exibir confidence score', () => {
    render(<ChatBubble {...baseBubble} confidenceScore={0.95} />)
    expect(screen.getByText('Confidence: 95%')).toBeDefined()
  })

  it('deve exibir botao de escalada quando needsEscalation=true', () => {
    render(<ChatBubble {...baseBubble} needsEscalation onEscalate={vi.fn()} />)
    expect(screen.getByText('Assumir Conversa')).toBeDefined()
  })

  it('deve disparar callback ao clicar Assumir Conversa', () => {
    const onEscalate = vi.fn()
    render(<ChatBubble {...baseBubble} needsEscalation onEscalate={onEscalate} />)
    fireEvent.click(screen.getByText('Assumir Conversa'))
    expect(onEscalate).toHaveBeenCalledTimes(1)
  })

  it('nao deve exibir botao de escalada quando needsEscalation=false', () => {
    render(<ChatBubble {...baseBubble} />)
    expect(screen.queryByText('Assumir Conversa')).toBeNull()
  })
})

describe('CognitiveTerminalUI', () => {
  it('deve renderizar placeholder quando events estiver vazio', () => {
    render(
      <CognitiveTerminalUI
        events={[]}
        isThinking={false}
        onSendMessage={vi.fn()}
        onEscalateToHuman={vi.fn()}
      />,
    )
    expect(screen.getByText('Aguardando tráfego cognitivo neural...')).toBeDefined()
  })

  it('deve renderizar eventos cognitivos', () => {
    render(
      <CognitiveTerminalUI
        events={[
          {
            messageId: 'evt-1',
            text: 'Resposta da IA',
            timestamp: new Date(),
            intent: 'consulta',
            origem: 'ze-concierge',
            needsEscalation: false,
          },
        ]}
        isThinking={false}
        onSendMessage={vi.fn()}
        onEscalateToHuman={vi.fn()}
      />,
    )
    expect(screen.getByText('Resposta da IA')).toBeDefined()
  })

  it('deve chamar onSendMessage ao submeter formulario', () => {
    const onSendMessage = vi.fn()
    render(
      <CognitiveTerminalUI
        events={[]}
        isThinking={false}
        onSendMessage={onSendMessage}
        onEscalateToHuman={vi.fn()}
      />,
    )

    const input = screen.getByPlaceholderText(
      'Digite uma mensagem para os agentes...',
    )
    fireEvent.change(input, { target: { value: 'Olá IA' } })
    fireEvent.click(screen.getByText('Enviar'))

    expect(onSendMessage).toHaveBeenCalledWith('Olá IA')
  })

  it('deve exibir indicador isThinking', () => {
    render(
      <CognitiveTerminalUI
        events={[]}
        isThinking={true}
        onSendMessage={vi.fn()}
        onEscalateToHuman={vi.fn()}
      />,
    )
    expect(screen.getByText('Thinking...')).toBeDefined()
  })
})

describe('LeadKanbanUI', () => {
  it('deve renderizar colunas com leads', () => {
    const colunas = montarColunas({
      topo: [
        {
          leadName: 'Maria',
          score: 70,
          origem: 'Site',
          estado: 'entrada' as const,
          grupo: 'topo' as const,
          diasSemInteracao: 0,
          icpFit: 'ideal' as const,
        },
      ],
      qualificacao: [],
      agendamento: [],
      negociacao: [],
      fechado: [],
      perdido: [],
      farming: [],
    })

    render(
      <LeadKanbanUI
        colunas={colunas}
        isLoading={false}
        error={null}
        onQualificar={vi.fn()}
        onHandoff={vi.fn()}
        onVerEscada={vi.fn()}
      />,
    )

    expect(screen.getByText('Maria')).toBeDefined()
    expect(screen.getByText('1')).toBeDefined()
  })

  it('deve renderizar loading state', () => {
    const colunas = montarColunas({} as Record<string, never[]>)

    render(
      <LeadKanbanUI
        colunas={colunas}
        isLoading={true}
        error={null}
        onQualificar={vi.fn()}
        onHandoff={vi.fn()}
        onVerEscada={vi.fn()}
      />,
    )

    expect(screen.getByText('Carregando Leads do Zé-Sales...')).toBeDefined()
  })

  it('deve renderizar mensagem de erro', () => {
    const colunas = montarColunas({} as Record<string, never[]>)

    render(
      <LeadKanbanUI
        colunas={colunas}
        isLoading={false}
        error="Erro ao conectar com servidor"
        onQualificar={vi.fn()}
        onHandoff={vi.fn()}
        onVerEscada={vi.fn()}
      />,
    )

    expect(screen.getByText('Erro ao conectar com servidor')).toBeDefined()
  })
})
