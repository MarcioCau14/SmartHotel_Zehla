'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'Preciso cancelar meu PMS atual para usar o ZEHLA?',
    a: 'Não. O ZEHLA funciona como um ecossistema complementar. Você pode manter seu PMS atual e usar o ZEHLA para WhatsApp IA, CRM, link-in-bio e revenue management. Quando estiver pronto, migramos seu PMS em 5 minutos sem perder nenhum dado.',
  },
  {
    q: 'O ZEHLA funciona para pousadas de apenas 5 quartos?',
    a: 'Sim. O plano LITE foi desenhado exatamente para pousadas de 5 a 10 quartos. Você tem acesso ao atendente IA 24h, controle de reservas no celular e recebimento via Pix — tudo que precisa para começar a vender direto sem depender de OTA.',
  },
  {
    q: 'Como funciona a migração dos dados?',
    a: 'Setup em 10 minutos. Você cadastra sua pousada, conecta o WhatsApp e começa a vender. Não precisa importar planilhas, não precisa de suporte técnico. Se tiver dúvida, nosso suporte via WhatsApp responde em segundos.',
  },
  {
    q: 'E se eu não gostar? Tem garantia?',
    a: 'Sim. Oferecemos 7 dias grátis sem necessidade de cartão de crédito. E no plano Lite, temos a Garantia ZEHLA ROI: se em 30 dias o sistema não recuperar o valor da assinatura através de reservas diretas, devolvemos seu dinheiro. Risco zero.',
  },
  {
    q: 'Preciso ter site ou plataforma de reservas?',
    a: 'Não. O ZEHLA inclui um link-in-bio profissional que vira sua página de vendas. Compartilhe no WhatsApp, Instagram ou Google e comece a receber reservas com Pix direto. Sem site, sem taxa, sem complicação.',
  },
  {
    q: 'O ZEHLA substitui o Booking.com e Airbnb?',
    a: 'Complementa, não substitui. O ZEHLA ajuda você a vender MAIS reservas diretas (sem comissão), mas sua página nas OTAs continua ativa. Conforme suas reservas diretas crescem, você reduz a dependência de OTAs naturalmente — sem perder faturamento.',
  },
];

function FAQAccordion({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-white/5 last:border-b-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-sm md:text-base font-medium text-neutral-200 group-hover:text-white transition-colors pr-4">
          {item.q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-neutral-500 leading-relaxed pb-6 -mt-2">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black tracking-[0.2em] text-neutral-400 uppercase mb-5">
          <HelpCircle className="w-3.5 h-3.5" />
          DÚVIDAS FREQUENTES
        </div>
        <h2 className="text-3xl font-bold">
          Tudo que você precisa saber <span className="text-orange-500">antes de começar</span>
        </h2>
      </div>

      <div className="glass-strong border border-white/5 rounded-[2rem] p-6 md:p-10">
        {FAQS.map((item, i) => (
          <FAQAccordion key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
