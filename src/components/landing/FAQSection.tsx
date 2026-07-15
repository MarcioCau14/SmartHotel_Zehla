'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'O que muda no WhatsApp da minha pousada a partir de 2026?',
    a: 'A Meta está ajustando as regras de uso da API do WhatsApp Business. A partir de outubro de 2026, cada mensagem enviada pela API terá um custo por envio. O Zélla já está preparado para essa mudança — ele otimiza as respostas para enviar menos mensagens com mais conteúdo, mantendo o atendimento completo e os custos baixos para sua pousada.',
  },
  {
    q: 'Quanto custa usar a API do WhatsApp sem otimização?',
    a: 'Depende do volume da sua pousada. Uma pousada média com 40 conversas por dia e 4 mensagens por conversa teria 4.800 mensagens/mês. Com a tarifa de R$ 0,035 por mensagem, isso seria cerca de R$ 168/mês. Use a Simulador de Economia acima para ver o número da sua pousada.',
  },
  {
    q: 'Como o Zélla otimiza as mensagens do meu WhatsApp?',
    a: 'O Zélla usa tecnologia de agrupamento inteligente: quando o hóspede manda várias perguntas rápidas (ex: "Oi", "Tem vaga?", "Preço?"), o Zélla entende o contexto e responde tudo de uma vez. Além disso, ele compacta saudação, preço e PIX em um único balão. Juntos, esses recursos otimizam o uso da API e mantêm seus custos baixos.',
  },
  {
    q: 'E se as regras do WhatsApp mudarem no futuro?',
    a: 'O Zélla se adapta automaticamente às mudanças. O controle de custo é configurável em tempo real pelo painel — quando a tarifa da API muda, você ajusta o valor no sistema e o Zélla recalcula tudo automaticamente. Sua pousada sempre opera com eficiência.',
  },
  {
    q: 'Preciso de conhecimento técnico para usar o ZÉLLA?',
    a: 'Nenhum. O ZÉLLA foi projetado para donos de pousada que não sabem programar nem configurar sistemas complexos. O cadastro leva 5 minutos, a IA já vem calibrada e tudo funciona pelo WhatsApp que você já usa. Se você sabe enviar mensagem no WhatsApp, sabe usar o ZÉLLA.',
  },
  {
    q: 'Como funciona o período de teste grátis?',
    a: 'Você cria sua conta e recebe 7 dias de acesso completo ao plano LITE sem pagar nada. Sem cartão de crédito, sem compromisso. Durante o trial, você pode cadastrar sua pousada, configurar a IA, testar o atendimento automático e ver resultados reais. Se não gostar, simplesmente não assina. Sem multa, sem burocracia.',
  },
  {
    q: 'A inteligência do ZÉLLA pode inventar informações ou errar preços?',
    a: 'Não. O ZÉLLA segue estritamente a sua tabela de preços e as regras da sua pousada cadastradas no painel. Ele nunca inventa dados ou passa informações incorretas para os hóspedes.',
  },
  {
    q: 'Posso cancelar a assinatura a qualquer momento?',
    a: 'Sim. Todos os planos são mensais e sem fidelidade. Você pode cancelar quando quiser, sem multa e sem burocracia. Ao cancelar, seu acesso continua até o final do período já pago. Seus dados ficam salvos por 90 dias caso queira voltar.',
  },
  {
    q: 'O que é o Mercado Pago e por que usam esse gateway?',
    a: 'Mercado Pago é o gateway de pagamento oficial do ZÉLLA. Escolhemos por ter a menor taxa do mercado para PIX (0,99%) e suporte nativo a split de pagamentos. Isso significa que quando um hóspede paga, o dinheiro vai direto para sua conta, sem intermediários. Para cartões internacionais, mantemos o Stripe como alternativa futura.',
  },
  {
    q: 'O que é o Programa Beta e como posso participar?',
    a: 'O Programa Beta é uma condição exclusiva para as primeiras 100 pousadas parceiras. Você paga R$ 0 no primeiro mês, recebe onboarding personalizado e, após o período de validação, sua mensalidade é de R$ 297/mês com acesso a funcionalidades do plano PRO por 24 meses (enquanto sua assinatura estiver ativa). É a condição mais vantajosa que já oferecemos.',
  },
  {
    q: 'Os dados da minha pousada e dos meus hóspedes estão seguros?',
    a: 'Totalmente. Seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD) para garantir a sua privacidade e a dos seus clientes. Suas informações de reservas e contatos ficam salvas em servidores seguros e protegidos, e nós nunca compartilhamos ou vendemos seus dados para terceiros.',
  },
  {
    q: 'Quanto tempo leva para ver resultados?',
    a: 'A maioria dos pousadeiros vê as primeiras reservas via IA nas primeiras 48 horas. Em 1 semana, o sistema já está calibrado com o perfil da sua pousada e os resultados aceleram. Em 30 dias, nossos clientes reportam em média 35% de aumento em receita e 90% de redução no tempo gasto respondendo WhatsApp.',
  },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/[0.04] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="text-white text-sm font-medium pr-4 group-hover:text-emerald-400 transition-colors">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-neutral-400 text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section ref={ref} id="faq" className="py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 text-xs font-medium">Dúvidas Frequentes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-neutral-400 text-lg">
            Tudo que você precisa saber antes de começar.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl bg-white/[0.02] border border-white/[0.06] px-6"
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
