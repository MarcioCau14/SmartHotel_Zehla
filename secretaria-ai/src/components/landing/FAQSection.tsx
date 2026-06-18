'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Preciso de conhecimento técnico para usar o ZÉLLA?',
    a: 'Nenhum. O ZÉLLA foi projetado para donos de pousada que não sabem programar nem configurar sistemas complexos. O cadastro leva 5 minutos, a IA já vem calibrada e tudo funciona pelo WhatsApp que você já usa. Se você sabe enviar mensagem no WhatsApp, sabe usar o ZÉLLA.',
  },
  {
    q: 'Como funciona o período de teste grátis?',
    a: 'Você cria sua conta e recebe 7 dias de acesso completo ao plano LITE sem pagar nada. Sem cartão de crédito, sem compromisso. Durante o trial, você pode cadastrar sua pousada, configurar a IA, testar o atendimento automático e ver resultados reais. Se não gostar, simplesmente não assina. Sem multa, sem burocracia.',
  },
  {
    q: 'A IA realmente responde como minha pousada?',
    a: 'Sim. Durante a configuração, você informa o tom de voz, informações da pousada, preços e políticas. A IA usa esse contexto para responder com naturalidade, como se fosse você ou sua equipe. Hóspedes não percebem que estão falando com IA — é tão natural que os depoimentos acima confirmam isso.',
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
    q: 'O que é a Oferta Fundador e como posso participar?',
    a: 'A Oferta Fundador é um programa exclusivo para as primeiras 5 a 10 pousadas parceiras. Você paga R$0 no primeiro mês, recebe onboarding personalizado e, após o período de validação, sua mensalidade congela em R$197/mês (plano LITE) com acesso a funcionalidades do plano PRO — para sempre. É a condição mais vantajosa que o ZÉLLA vai oferecer.',
  },
  {
    q: 'Meus dados estão seguros com o ZÉLLA?',
    a: 'Totalmente. Todos os dados são criptografados em trânsito e em repouso. Somos LGPD compliant, com políticas de privacidade transparentes. A infraestrutura inclui Circuit Breaker (proteção contra falhas), Budget Guard (controle de gastos) e monitoramento 24/7. Seus dados de clientes e reservas estão protegidos com padrão enterprise.',
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
