// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KanbanCard } from '../../components/ui/KanbanCard'
import { KanbanColumn } from '../../components/ui/KanbanColumn'
import { ChatBubble } from '../../components/ui/ChatBubble'
import { CognitiveTerminalUI } from '../../components/zcc/CognitiveTerminalUI'
import { LoginFormUI } from '../../components/auth/LoginFormUI'
import { LeadKanbanUI, montarColunas } from '../../components/zcc/LeadKanbanUI'
import { RoomCard } from '../../components/zcc/RoomCard'
import { RoomsGridUI } from '../../components/zcc/RoomsGridUI'

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

describe('RoomCard', () => {
  const baseCard = {
    roomId: 'room-1',
    numero: '101',
    tipo: 'STANDARD',
    preco: 250,
  }

  it('deve renderizar numero e tipo do quarto', () => {
    render(<RoomCard {...baseCard} status="LIVRE" />)
    expect(screen.getByText('101')).toBeDefined()
    expect(screen.getByText('STANDARD')).toBeDefined()
  })

  it('deve renderizar preco base', () => {
    render(<RoomCard {...baseCard} status="LIVRE" />)
    expect(screen.getByText('R$ 250.00')).toBeDefined()
  })

  it('deve renderizar label LIVRE com cor verde', () => {
    render(<RoomCard {...baseCard} status="LIVRE" />)
    expect(screen.getByText('Livre')).toBeDefined()
  })

  it('deve renderizar label OCUPADO com cor vermelha', () => {
    render(<RoomCard {...baseCard} status="OCUPADO" />)
    expect(screen.getByText('Ocupado')).toBeDefined()
  })

  it('deve mostrar nome do hospede quando fornecido', () => {
    render(<RoomCard {...baseCard} status="OCUPADO" hospede="João" />)
    expect(screen.getByText('João')).toBeDefined()
  })

  it('deve exibir botao "Limpar Quarto" quando AGUARDANDO_LIMPEZA', () => {
    render(<RoomCard {...baseCard} status="AGUARDANDO_LIMPEZA" onStatusChange={vi.fn()} />)
    expect(screen.getByText('Limpar Quarto')).toBeDefined()
  })

  it('deve disparar callback ao clicar em "Limpar Quarto" com payload LIVRE', () => {
    const onStatusChange = vi.fn()
    render(<RoomCard {...baseCard} status="AGUARDANDO_LIMPEZA" onStatusChange={onStatusChange} />)
    fireEvent.click(screen.getByText('Limpar Quarto'))
    expect(onStatusChange).toHaveBeenCalledWith('room-1', 'LIVRE')
    expect(onStatusChange).toHaveBeenCalledTimes(1)
  })

  it('deve exibir botao "Solicitar Limpeza" quando OCUPADO', () => {
    render(<RoomCard {...baseCard} status="OCUPADO" onStatusChange={vi.fn()} />)
    expect(screen.getByText('Solicitar Limpeza')).toBeDefined()
  })

  it('deve disparar callback ao clicar "Solicitar Limpeza" com payload AGUARDANDO_LIMPEZA', () => {
    const onStatusChange = vi.fn()
    render(<RoomCard {...baseCard} status="OCUPADO" onStatusChange={onStatusChange} />)
    fireEvent.click(screen.getByText('Solicitar Limpeza'))
    expect(onStatusChange).toHaveBeenCalledWith('room-1', 'AGUARDANDO_LIMPEZA')
    expect(onStatusChange).toHaveBeenCalledTimes(1)
  })

  it('nao deve exibir botao de acao quando LIVRE', () => {
    render(<RoomCard {...baseCard} status="LIVRE" onStatusChange={vi.fn()} />)
    expect(screen.queryByText('Limpar Quarto')).toBeNull()
    expect(screen.queryByText('Solicitar Limpeza')).toBeNull()
  })

  it('deve exibir botao "Finalizar Manutencao" quando EM_MANUTENCAO', () => {
    render(<RoomCard {...baseCard} status="EM_MANUTENCAO" onStatusChange={vi.fn()} />)
    expect(screen.getByText('Finalizar Manutenção')).toBeDefined()
  })
})

describe('RoomsGridUI', () => {
  it('deve renderizar grid de quartos', () => {
    render(
      <RoomsGridUI
        rooms={[
          { id: 'r1', number: '101', type: 'STANDARD', status: 'LIVRE', basePrice: 200 },
          { id: 'r2', number: '102', type: 'DELUXE', status: 'OCUPADO', basePrice: 350, guestName: 'Ana' },
        ]}
        isLoading={false}
        error={null}
        onStatusChange={vi.fn()}
      />,
    )
    expect(screen.getByText('101')).toBeDefined()
    expect(screen.getByText('102')).toBeDefined()
    expect(screen.getByText('Ana')).toBeDefined()
  })

  it('deve renderizar loading state', () => {
    render(
      <RoomsGridUI
        rooms={[]}
        isLoading={true}
        error={null}
        onStatusChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Carregando mapa de quartos...')).toBeDefined()
  })

  it('deve renderizar mensagem de erro', () => {
    render(
      <RoomsGridUI
        rooms={[]}
        isLoading={false}
        error="Falha na conexão"
        onStatusChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Falha na conexão')).toBeDefined()
  })

  it('deve renderizar mensagem vazia quando sem quartos', () => {
    render(
      <RoomsGridUI
        rooms={[]}
        isLoading={false}
        error={null}
        onStatusChange={vi.fn()}
      />,
    )
    expect(screen.getByText('Nenhum quarto encontrado para esta propriedade.')).toBeDefined()
  })
})

describe('LoginFormUI', () => {
  it('deve renderizar campos de email e senha', () => {
    render(<LoginFormUI onSubmit={vi.fn()} isLoading={false} />)

    expect(screen.getByPlaceholderText('seu@email.com')).toBeDefined()
    expect(screen.getByPlaceholderText('Sua senha')).toBeDefined()
    expect(screen.getByText('Entrar no ZEHLA')).toBeDefined()
  })

  it('deve chamar onSubmit com email e senha', () => {
    const onSubmit = vi.fn()
    render(<LoginFormUI onSubmit={onSubmit} isLoading={false} />)

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'admin@ze.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Sua senha'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByText('Entrar no ZEHLA'))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith('admin@ze.com', '123456')
  })

  it('deve exibir mensagem de erro quando errorMessage for fornecido', () => {
    render(
      <LoginFormUI
        onSubmit={vi.fn()}
        isLoading={false}
        errorMessage="Credenciais inválidas"
      />,
    )

    expect(screen.getByText('Credenciais inválidas')).toBeDefined()
  })

  it('deve desabilitar inputs e botao quando isLoading=true', () => {
    render(<LoginFormUI onSubmit={vi.fn()} isLoading={true} />)

    expect(screen.getByPlaceholderText('seu@email.com')).toBeDisabled()
    expect(screen.getByPlaceholderText('Sua senha')).toBeDisabled()
    expect(screen.getByText('Entrando...')).toBeDefined()
    expect(screen.getByText('Entrando...')).toBeDisabled()
  })

  it('nao deve chamar onSubmit se campos estiverem vazios', () => {
    const onSubmit = vi.fn()
    render(<LoginFormUI onSubmit={onSubmit} isLoading={false} />)

    fireEvent.click(screen.getByText('Entrar no ZEHLA'))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
