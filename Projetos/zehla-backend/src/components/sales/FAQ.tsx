'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const questions = [
  {
    q: 'Preciso ter site para usar o ZEHLA?',
    a: 'Não! O ZEHLA foi criado justamente para quem não tem site ou não quer depender dele. Seu perfil público funciona como uma vitrine completa — com fotos, WhatsApp, Instagram e botão de reserva — que você compartilha no link da bio. Em 2 minutos sua pousada está online sem precisar de técnico, domínio ou hospedagem.',
  },
  {
    q: 'Como funciona a taxa zero?',
    a: 'Nos planos Lite, PRO e MAX, você paga apenas a assinatura mensal fixa — R$ 248, R$ 448 ou R$ 798. Todas as reservas que chegarem pelo ZEHLA são 100% suas. Zero comissão por reserva, zero taxa sobre Pix, zero porcentagem para a plataforma. O dinheiro cai direto na sua conta. No plano Grátis, há uma taxa de 5% sobre reservas para cobrir custos operacionais.',
  },
  {
    q: 'Posso migrar de plano depois?',
    a: 'Sim, a qualquer momento. Você pode começar no Grátis, migrar para o Lite quando sentir necessidade, e subir para o PRO ou MAX conforme sua pousada cresce. A migração é instantânea e sem custo adicional — você paga apenas a diferença proporcional do mês.',
  },
  {
    q: 'O ZEHLA é compatível com meu PMS atual?',
    a: 'O ZEHLA funciona de forma independente como sua plataforma de vendas diretas e atendimento. Não substitui seu PMS — ele atua na ponta de captação e conversão de hóspedes. Para planos PRO e MAX, oferecemos integrações com os principais PMS do mercado brasileiro. Consulte nossa equipe para verificar a compatibilidade com o seu sistema.',
  },
  {
    q: 'E se eu não gostar? Tem garantia?',
    a: 'Sim! Todos os planos têm 7 dias grátis sem cadastro de cartão de crédito. E mais: se em 30 dias de plano pago o ZEHLA não recuperar o valor da sua assinatura através de reservas diretas, nós devolvemos 100% do seu dinheiro. Sem burocracia, sem perguntas. O risco é todo nosso.',
  },
  {
    q: 'Como funciona o Perfil da Pousada?',
    a: 'O Perfil da Pousada é uma página pública e personalizada que funciona como um linktree turbinado. Você adiciona o nome, fotos, descrição, WhatsApp, Instagram e número de quartos. Depois é só colocar o link (ex: zehla.com.br/pousada/sua-pousada) na bio do Instagram. Quando alguém clica, vê sua pousada com fotos, avaliações e já pode chamar no WhatsApp com um clique.',
  },
  {
    q: 'Preciso de cartão de crédito para começar?',
    a: 'Não. O plano Grátis e os 7 dias de trial não exigem cartão de crédito. Você só cadastra forma de pagamento quando decidir assinar um plano pago. E pode cancelar quando quiser, sem multa.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Dúvidas frequentes
          </h2>
          <p className="text-neutral-500 text-lg">
            Tudo que você precisa saber antes de começar.
          </p>
        </div>

        <div className="space-y-3">
          {questions.map((item, i) => (
            <div
              key={i}
              className={`glass-strong border border-white/5 rounded-2xl overflow-hidden transition-all ${
                openIndex === i ? 'border-orange-500/20' : ''
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
              >
                <span className="text-sm font-semibold text-neutral-200 flex-1">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 transition-transform flex-shrink-0 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="text-sm text-neutral-500 leading-relaxed">{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
