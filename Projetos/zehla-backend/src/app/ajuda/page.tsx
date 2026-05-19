import {
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';


'use client';

  Brain,
  ArrowLeft,
  Search,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Zap,
  CreditCard,
  MessageCircle,
  Shield,
  Terminal,
  Cpu,
} from 'lucide-react';

const faqItems = [
  {
    icon: Zap,
    question: 'Como funciona o trial de 7 dias?',
    answer:
      'Ao se cadastrar no ZEHLA, você recebe acesso automático e gratuito a todas as funcionalidades da plataforma por 7 dias corridos. Não é necessário cartão de crédito. Após concluir o onboarding (configuração inicial), seu período de teste começa imediatamente. Durante o trial, você tem acesso ao WhatsApp inteligente 24/7, dashboard financeiro, gestão de reservas, terminal de mensagens e todas as demais funcionalidades na versão completa. Ao final dos 7 dias, você pode optar pela assinatura de R$ 297/mês para continuar usando o ZEHLA.',
  },
  {
    icon: MessageCircle,
    question: 'Como configurar meu WhatsApp?',
    answer:
      'O ZEHLA se integra ao seu WhatsApp Business de forma simples. No processo de onboarding, você informa o número de WhatsApp do seu estabelecimento (canal de atendimento) e o número do proprietário. O ZEHLA utiliza a WhatsApp Business API para gerenciar as mensagens automaticamente. Você configura modelos de resposta automática, horários de funcionamento e regras de atendimento. Quando um hóspede envia uma mensagem, o cérebro ZEHLA classifica a intenção e responde automaticamente — questões complexas são encaminhadas para você. Tudo via painel web, sem necessidade de instalar nada.',
  },
  {
    icon: CreditCard,
    question: 'Quais formas de pagamento são aceitas?',
    answer:
      'Aceitamos PIX, cartões de crédito (Visa, Mastercard, Elo, American Express) e boleto bancário. O processamento é feito por provedores certificados pelo Banco Central, garantindo total segurança. A assinatura de R$ 297/mês é cobrada mensalmente com renovação automática. Você pode cancelar a qualquer momento sem multa ou fidelidade. Em caso de falha no pagamento, você tem 3 dias de carência para regularizar.',
  },
  {
    icon: MessageSquare,
    question: 'Como o ZEHLA atende meus hóspedes?',
    answer:
      'O ZEHLA atua como um assistente virtual inteligente integrado ao WhatsApp do seu estabelecimento. Quando um hóspede envia uma mensagem, o cérebro ZEHLA analisa o texto, classifica a intenção (informações sobre Wi-Fi, piscina, check-in, reservas, reclamações, etc.) e gera uma resposta contextualizada automaticamente. O sistema utiliza modelos avançados de linguagem (LLMs) para entender o contexto da conversa e oferecer respostas precisas e naturais. Mensagens que exigem intervenção humana são sinalizadas e encaminhadas para a equipe. Tudo acontece 24 horas por dia, 7 dias por semana.',
  },
  {
    icon: HelpCircle,
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim! Não há fidelidade, multa ou taxa de cancelamento. Você pode cancelar sua assinatura a qualquer momento diretamente pelas configurações da plataforma ou entrando em contato com nosso suporte. Após o cancelamento, seu acesso permanece ativo até o final do período já pago. Você tem 30 dias para exportar todos os seus dados. Sem pegadinhas, sem burocracia.',
  },
  {
    icon: Shield,
    question: 'Meus dados estão seguros?',
    answer:
      'Absolutamente. A ZEHLA segue rigorosos padrões de segurança e está em total conformidade com a LGPD (Lei nº 13.709/2018). Utilizamos criptografia TLS 1.3 em todas as comunicações, criptografia AES-256 para dados em repouso, autenticação multifator e monitoramento contínuo contra ameaças. Nossos servidores estão hospedados em data centers certificados ISO 27001 no Brasil. Realizamos backups diários e temos um plano robusto de resposta a incidentes. Consulte nossa Política de Privacidade para mais detalhes.',
  },
  {
    icon: Terminal,
    question: 'Como funciona o terminal de mensagens?',
    answer:
      'O Terminal de Mensagens é o hub centralizado de comunicação do ZEHLA. Ele reúne todas as mensagens de hóspedes, colaboradores e fornecedores em uma interface intuitiva em tempo real. Cada tipo de mensagem recebe uma cor diferenciada: verde para hóspedes, azul para colaboradores, amarelo para fornecedores e vermelho para alertas. O cérebro ZEHLA processa automaticamente todas as mensagens, classificando intenções e gerando respostas. Você acompanha tudo em tempo real com um indicador "AO VIVO" que mostra a atividade do sistema.',
  },
  {
    icon: Cpu,
    question: 'Quais LLMs são usadas pelo ZEHLA?',
    answer:
      'O ZEHLA utiliza modelos avançados de linguagem (Large Language Models) de última geração para processar e responder às mensagens dos hóspedes. Nosso sistema de IA classifica as intenções das mensagens em mais de 12 categorias distintas, utiliza cache de borda para respostas rápidas a perguntas frequentes e inference via LLM para respostas contextualizadas. A arquitetura cognitiva do ZEHLA combina múltiplos agentes que trabalham em conjunto para fornecer respostas precisas, naturais e úteis — tudo processado em tempo real com latência mínima.',
  },
];

export default function AjudaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const filteredFaqs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/help/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      });

      const data = await response.json();
      if (data.answer) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Desculpe, não consegui processar sua pergunta. Tente novamente ou entre em contato com nosso suporte.' },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro de conexão. Verifique sua internet e tente novamente.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-neutral-200 transition-all text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-orange-400" />
            </div>
            <span className="font-bold text-neutral-100 text-sm">ZEHLA</span>
            <span className="text-[10px] text-neutral-500">SmartHotel</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm text-orange-400 font-semibold mb-6">
              <HelpCircle className="w-3.5 h-3.5" />
              Suporte
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100 mb-3">
              Central de{' '}
              <span className="gradient-text">Ajuda</span>
            </h1>
            <p className="text-neutral-400 text-sm max-w-lg mx-auto">
              Encontre respostas rápidas ou converse com nosso assistente inteligente.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mb-12"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar nas perguntas frequentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all text-sm"
            />
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-12"
          >
            <h2 className="text-lg font-semibold text-neutral-100 mb-6">
              Perguntas Frequentes
            </h2>
            {filteredFaqs.length > 0 ? (
              <div className="space-y-3">
                {filteredFaqs.map((item, i) => {
                  const Icon = item.icon;
                  const isExpanded = expandedFaq === i;
                  return (
                    <div
                      key={i}
                      className="glass-card overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : i)}
                        className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-neutral-200">
                          {item.question}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-5 pb-5"
                        >
                          <div className="pl-14">
                            <p className="text-sm text-neutral-400 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-card p-8 text-center">
                <Search className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">
                  Nenhum resultado encontrado para &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </motion.div>

          {/* AI Chat Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-neutral-100 mb-2">
              Converse com o{' '}
              <span className="gradient-text">Assistente ZEHLA</span>
            </h2>
            <p className="text-neutral-500 text-sm mb-6">
              Tire suas dúvidas diretamente com nossa IA. Respostas instantâneas sobre qualquer funcionalidade.
            </p>

            <div className="glass-card overflow-hidden">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 sm:p-6 space-y-4 zehla-scroll">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-orange-400" />
                    </div>
                    <h3 className="text-neutral-200 font-semibold mb-1">
                      Assistente ZEHLA
                    </h3>
                    <p className="text-neutral-500 text-sm max-w-sm">
                      Olá! Sou o assistente virtual do ZEHLA. Digite sua pergunta abaixo e eu ajudarei você.
                    </p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-orange-500/20 text-orange-100 border border-orange-500/20 rounded-br-md'
                          : 'bg-white/5 text-neutral-300 border border-white/5 rounded-bl-md'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3 h-3 text-orange-400" />
                          <span className="text-xs text-orange-400 font-medium">Assistente ZEHLA</span>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                        <span className="text-sm text-neutral-500">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-white/5 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Digite sua pergunta..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all text-sm disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !chatInput.trim()}
                    className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-orange-400" />
            <span className="font-bold text-neutral-100 text-sm">ZEHLA</span>
            <span className="text-xs text-neutral-500">SmartHotel</span>
          </div>
          <p className="text-xs text-neutral-600">
            © 2026 SMARTHOTEL / ZEHLA Technologies. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
