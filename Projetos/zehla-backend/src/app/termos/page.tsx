import { Brain, ArrowLeft, Shield, FileText, Scale, Lock, Server, AlertTriangle, Trash2, RefreshCw, BookOpen, Gavel } from 'lucide-react';
import { motion } from 'framer-motion';


'use client';


const sections = [
  {
    icon: FileText,
    title: '1. Definições',
    content: `Para os fins destes Termos de Uso, aplicam-se as seguintes definições: "ZEHLA", "SMARTHOTEL", "Plataforma" ou "Serviço" referem-se ao sistema de gestão cognitiva para pousadas e hotéis, desenvolvido e operado pela ZEHLA Technologies, incluindo todas as funcionalidades de atendimento automatizado por WhatsApp, dashboard administrativo, gestão de reservas, controle financeiro, terminal de mensagens e quaisquer outros módulos ou recursos disponibilizados, tanto por meio de interface web quanto de aplicativos ou integrações. "Usuário", "Cliente" ou "Contratante" refere-se à pessoa física ou jurídica que se cadastra na Plataforma e utiliza os Serviços, seja durante o período de trial gratuito ou mediante assinatura ativa. "Hóspede" é a pessoa física que se comunica com o estabelecimento do Usuário por meio dos canais de atendimento automatizados fornecidos pela Plataforma. "Dados Pessoais" possui o significado atribuído pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD). "Conteúdo" refere-se a todas as informações, textos, imagens, logotipos, dados e materiais fornecidos pelo Usuário ou gerados pela Plataforma durante o uso dos Serviços. "Trial" é o período de teste gratuito de 7 (sete) dias, conforme descrito na Seção 3 destes Termos. Estes Termos constituem um contrato eletrônico nos termos do art. 4º, inciso I, do Decreto nº 7.962/2013 do Marco Civil da Internet.`,
  },
  {
    icon: Brain,
    title: '2. Descrição do Serviço',
    content: `O ZEHLA SmartHotel é uma plataforma de gestão cognitiva desenvolvida especificamente para o segmento hoteleiro brasileiro, com foco em pousadas, hotéis boutique e estabelecimentos de hospedagem de pequeno e médio porte. A Plataforma utiliza tecnologias de inteligência artificial, incluindo modelos de linguagem avançados (LLMs), para oferecer atendimento automatizado aos hóspedes via WhatsApp, processamento de mensagens em tempo real, classificação de intenções, geração de respostas contextualizadas e encaminhamento de demandas complexas para a equipe do estabelecimento. Além do atendimento automatizado, o ZEHLA oferece módulos de gestão de reservas com confirmação e cancelamento em um clique, dashboard financeiro com indicadores como ADR, RevPAR e taxa de ocupação, terminal de mensagens unificado com categorização por remetente (hóspedes, colaboradores, fornecedores), criação e distribuição automática de promoções, e integrações de pagamento via PIX e cartão de crédito. A Plataforma é fornecida em regime de Software as a Service (SaaS), acessível por meio de navegador web, sem necessidade de instalação de software adicional. O ZEHLA pode realizar atualizações, melhorias e modificações na Plataforma a qualquer momento, visando aprimorar a experiência do Usuário e a qualidade dos Serviços, conforme previsto nestes Termos.`,
  },
  {
    icon: RefreshCw,
    title: '3. Cadastro e Trial',
    content: `Para utilizar a Plataforma, o Usuário deve realizar um cadastro completo, fornecendo informações verdadeiras, atualizadas e precisas, incluindo nome completo, CNPJ ou CPF, endereço do estabelecimento, dados de contato (telefone e e-mail) e informações operacionais como tipos de acomodação, quartos disponíveis e serviços oferecidos. O Usuário é integralmente responsável por manter a veracidade e atualização de seus dados cadastrais. Ao concluir o cadastro, o Usuário terá acesso automático a um período de teste gratuito (Trial) de 7 (sete) dias corridos, durante o qual poderá utilizar todas as funcionalidades da Plataforma sem custo financeiro e sem necessidade de cadastro de cartão de crédito. O período de Trial inicia-se no momento da ativação da conta pelo Usuário, após a conclusão do processo de onboarding na Plataforma. Durante o Trial, o Usuário terá acesso irrestrito a todos os módulos e funcionalidades do ZEHLA, incluindo o atendimento automatizado via WhatsApp, com a mesma qualidade e capacidade da versão paga. Findo o período de 7 dias, o acesso à Plataforma será automaticamente suspenso, podendo o Usuário optar pela assinatura do plano pago para continuidade do uso. A ZEHLA reserva-se o direito de limitar a um único Trial por Usuário ou por estabelecimento, sendo vedada a criação de múltiplas contas para obtenção de períodos de teste adicionais.`,
  },
  {
    icon: Scale,
    title: '4. Planos e Pagamentos',
    content: `O ZEHLA é oferecido em um modelo de assinatura mensal no valor de R$ 297,00 (trezentos e noventa e sete reais) por mês, com renovação automática. O plano inclui acesso completo a todas as funcionalidades da Plataforma, sem limites de quartos, reservas ou mensagens processadas, suporte técnico 24 horas por dia, 7 dias por semana, e atualizações contínuas do sistema. Os pagamentos poderão ser realizados por meio de PIX, cartão de crédito (Visa, Mastercard, Elo, American Express) ou boleto bancário, conforme as opções disponíveis no momento da contratação. O processamento dos pagamentos será realizado por meio de provedores de pagamento certificados e homologados pelo Banco Central do Brasil, garantindo a segurança das transações financeiras. A assinatura será renovada automaticamente a cada 30 (trinta) dias, salvo manifestação expressa de cancelamento pelo Usuário com antecedência mínima de 5 (cinco) dias úteis do vencimento. Em caso de falha no pagamento, o Usuário será notificado por e-mail e terá um período de carência de 3 (três) dias corridos para regularizar a pendência, após o qual o acesso à Plataforma será suspenso até a quitação do débito. Os valores pagos são não-reembolsáveis, exceto em casos de falha comprovada na prestação dos Serviços por parte da ZEHLA, conforme disposto na Seção 6 destes Termos. A ZEHLA reserva-se o direito de alterar os valores dos planos com aviso prévio mínimo de 30 (trinta) dias.`,
  },
  {
    icon: AlertTriangle,
    title: '5. Responsabilidades do Usuário',
    content: `O Usuário concorda em utilizar a Plataforma de forma responsável, ética e em conformidade com a legislação brasileira vigente, incluindo mas não se limitando ao Código de Defesa do Consumidor, Marco Civil da Internet, LGPD e demais normas aplicáveis ao setor hoteleiro. São responsabilidades do Usuário: manter a confidencialidade de suas credenciais de acesso (login e senha), não compartilhando-as com terceiros; garantir que todas as informações fornecidas durante o cadastro e a configuração da Plataforma sejam verdadeiras, completas e atualizadas; utilizar a Plataforma exclusivamente para a gestão de seu estabelecimento de hospedagem, vedado o uso para fins ilícitos, fraudulentos ou prejudiciais a terceiros; monitorar as interações automatizadas com os hóspedes e intervir quando necessário, especialmente em situações que envolvam segurança, emergências ou demandas que exijam discernimento humano; notificar imediatamente a ZEHLA em caso de uso não autorizado de sua conta, suspeita de violação de segurança ou qualquer irregularidade identificada na Plataforma; não tentar acessar áreas restritas do sistema, realizar engenharia reversa, descompilar ou modificar o código-fonte da Plataforma; não utilizar robôs, scrapers ou qualquer forma automatizada de extração de dados da Plataforma. O descumprimento destas obrigações poderá acarretar a suspensão ou o encerramento imediato da conta do Usuário, sem prejuízo das medidas legais cabíveis.`,
  },
  {
    icon: Shield,
    title: '6. Limitação de Responsabilidade',
    content: `A ZEHLA emprega esforços razoáveis para manter a Plataforma disponível, funcional e livre de erros, porém não garante que os Serviços serão prestados de forma ininterrupta, livre de falhas ou completamente seguros. Eventuais interrupções temporárias, decorrentes de manutenção programada (com aviso prévio de 24 horas quando possível), atualizações de sistema, falhas de infraestrutura de terceiros ou circunstâncias de força maior, não configuram descumprimento contratual. A Plataforma utiliza inteligência artificial para o atendimento automatizado de hóspedes, e embora os modelos de linguagem sejam continuamente aprimorados, a ZEHLA não se responsabiliza por respostas que possam conter imprecisões, informações desatualizadas ou interpretações incorretas. O Usuário reconhece que a Plataforma é uma ferramenta auxiliar de gestão e que a responsabilidade final sobre as interações com os hóspedes, decisões comerciais e conformidade com a legislação hoteleira permanece exclusivamente com o estabelecimento. A responsabilidade total da ZEHLA perante o Usuário, em qualquer hipótese, fica limitada ao menor valor entre os danos efetivamente comprovados e o total das mensalidades pagas pelo Usuário nos 12 (doze) meses anteriores ao evento. Ficam excluídas de responsabilidade perdas indiretas, lucros cessantes, danos emergentes, danos morais (salvo dolo) e quaisquer outros danos que não decorram diretamente do uso da Plataforma. A ZEHLA não se responsabiliza por danos decorrentes de caso fortuito ou força maior.`,
  },
  {
    icon: Lock,
    title: '7. Propriedade Intelectual',
    content: `Todos os direitos de propriedade intelectual relacionados à Plataforma, incluindo mas não se limitando a software, design, interfaces gráficas, logotipos, marcas, nomes comerciais, textos, gráficos, ícones, imagens, clipes de áudio, bases de dados, algoritmos, modelos de inteligência artificial, prompts de sistema, workflows cognitivos e qualquer outro conteúdo integrante da Plataforma, são de titularidade exclusiva da ZEHLA Technologies ou de seus licenciadores, estando protegidos pela legislação brasileira de propriedade intelectual, incluindo a Lei nº 9.609/1998 (Lei de Software), a Lei nº 9.279/1996 (Lei de Propriedade Industrial) e a Lei nº 9.610/1998 (Lei de Direitos Autorais). O uso da Plataforma não confere ao Usuário qualquer direito de propriedade sobre os elementos que a compõem. É expressamente vedada a reprodução, distribuição, modificação, adaptação, tradução, engenharia reversa, descompilação, desmontagem ou criação de obras derivadas da Plataforma, no todo ou em parte, sem autorização prévia e expressa da ZEHLA. O Usuário concede à ZEHLA uma licença não-exclusiva, gratuita e revogável para utilizar suas marcas, logotipos e informações do estabelecimento exclusivamente no contexto da prestação dos Serviços. O Conteúdo fornecido pelo Usuário na Plataforma permanece de sua titularidade, e o Usuário garante que possui os direitos necessários sobre tais conteúdos para conceder à ZEHLA as autorizações necessárias para o processamento e uso no âmbito dos Serviços contratados.`,
  },
  {
    icon: BookOpen,
    title: '8. LGPD e Privacidade',
    content: `O tratamento de dados pessoais realizado pela ZEHLA no âmbito dos Serviços está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD) e demais normas aplicáveis. A ZEHLA atua como controladora de dados pessoais dos Usuários e como operadora dos dados dos hóspedes, processando estes últimos por conta e ordem do estabelecimento contratante. Os dados pessoais coletados incluem informações de identificação (nome, CPF/CNPJ, endereço), dados de contato (telefone, e-mail), informações operacionais (dados de reservas, preferências de hóspedes, interações de atendimento) e dados técnicos (endereço IP, tipo de navegador, dados de uso da Plataforma). O tratamento destes dados tem como base legal o consentimento do titular (art. 7º, I, LGPD), a execução de contrato (art. 7º, V, LGPD) e o legítimo interesse do controlador (art. 7º, IX, LGPD). Para informações detalhadas sobre coleta, tratamento, compartilhamento, retenção e direitos dos titulares, consulte nossa Política de Privacidade disponível em /privacidade. O Usuário, como controlador dos dados de seus hóspedes, é responsável por obter os consentimentos necessários e garantir a conformidade com a LGPD em relação ao tratamento de dados realizado por meio da Plataforma. A ZEHLA disponibiliza um Encarregado de Proteção de Dados (DPO) que pode ser contatado através do canal designado em nossa Política de Privacidade.`,
  },
  {
    icon: Server,
    title: '9. Disponibilidade do Serviço',
    content: `A ZEHLA compromete-se a manter a Plataforma disponível para acesso dos Usuários de forma contínua, buscando garantir um nível de disponibilidade (uptime) de 99,5% mensal, medido pela média ponderada dos períodos de indisponibilidade não programada. Este compromisso de disponibilidade não se aplica a períodos de manutenção programada, que serão realizados preferencialmente em horários de menor fluxo (entre 02h e 05h do horário de Brasília), sempre que possível, com aviso prévio de 24 horas por meio de notificação na Plataforma ou por e-mail. A disponibilidade também pode ser afetada por fatores fora do controle da ZEHLA, incluindo falhas em provedores de infraestrutura em nuvem, problemas de conectividade de internet do Usuário, interrupções nos serviços do WhatsApp/Meta, ataques cibernéticos de grande escala (DDoS) e casos fortuitos ou de força maior. A ZEHLA mantém backups diários de todos os dados dos Usuários, armazenados em localizações geograficamente distintas, com retenção mínima de 30 (trinta) dias. Em caso de indisponibilidade prolongada superior a 24 (vinte e quatro) horas consecutivas, o Usuário terá direito a prorrogação proporcional do período da assinatura equivalente ao tempo de indisponibilidade. A ZEHLA monitora a saúde de seus sistemas em tempo real e emprega práticas de DevOps, CI/CD e observabilidade para identificar e corrigir incidentes com a máxima agilidade.`,
  },
  {
    icon: Trash2,
    title: '10. Encerramento',
    content: `O Usuário poderá encerrar sua assinatura e solicitar a exclusão de sua conta a qualquer momento, sem multa ou penalidade, por meio das configurações da Plataforma ou por solicitação formal ao suporte da ZEHLA. O cancelamento surtirá efeitos ao término do período já pago da assinatura em curso, garantindo ao Usuário o pleno uso da Plataforma até o vencimento da última mensalidade paga. Após o cancelamento, o Usuário terá um período de carência de 30 (trinta) dias para exportar todos os seus dados e conteúdos armazenados na Plataforma, por meio de funcionalidade de exportação disponibilizada na interface do sistema. Findo este período, os dados do Usuário serão permanentemente excluídos de nossos servidores ativos, ressalvadas as obrigações legais de retenção previstas em lei, como obrigações tributárias e fiscais, que poderão exigir a manutenção de determinados registros por prazos adicionais conforme legislação específica. A ZEHLA reserva-se o direito de encerrar a conta de um Usuário e rescindir estes Termos de imediato, sem necessidade de aviso prévio, nas seguintes hipóteses: uso indevido ou fraudulento da Plataforma; violação de qualquer disposição destes Termos; inadimplência por período superior a 30 (trinta) dias; prática de atos que possam prejudicar a imagem, a reputação ou os interesses da ZEHLA ou de terceiros; e determinação judicial ou administrativa. O encerramento por iniciativa da ZEHLA não desobriga o Usuário do pagamento dos valores pendentes até a data do encerramento.`,
  },
  {
    icon: RefreshCw,
    title: '11. Alterações nos Termos',
    content: `A ZEHLA reserva-se o direito de alterar, modificar ou atualizar estes Termos de Uso a qualquer momento, visando adequá-los a mudanças legislativas, regulatórias, tecnológicas ou operacionais, ou simplesmente para aprimorar a clareza e a abrangência das condições aqui dispostas. Quaisquer alterações substanciais nestes Termos serão comunicadas ao Usuário com antecedência mínima de 30 (trinta) dias, por meio de notificação por e-mail e/ou aviso destacado na Plataforma, indicando a data de vigência das novas condições. O Usuário será considerado automaticamente em conformidade com as alterações caso continue utilizando a Plataforma após a data de vigência estabelecida. Caso o Usuário não concorde com as alterações realizadas, deverá encerrar sua conta dentro do período de aviso prévio, conforme o procedimento descrito na Seção 10 (Encerramento). As versões anteriores destes Termos ficarão arquivadas e disponíveis para consulta mediante solicitação ao suporte da ZEHLA. Alterações que não configurem modificações substanciais, como correções gramaticais, ajustes de formatação ou atualizações de informações de contato, poderão ser realizadas sem aviso prévio. A ZEHLA recomenda que o Usuário revise periodicamente estes Termos para se manter informado sobre eventuais atualizações. A continuidade do uso da Plataforma após a publicação de alterações constitui aceitação tácita dos novos termos.`,
  },
  {
    icon: Gavel,
    title: '12. Foro',
    content: `Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil, sendo aplicável exclusivamente a legislação brasileira para a interpretação, execução e resolução de quaisquer questões deles decorrentes. Para a resolução de controvérsias oriundas destes Termos, as partes concordam em submeter-se ao foro da Comarca do domicílio do Usuário-Consumidor, nos termos do art. 101, I, do Código de Defesa do Consumidor (Lei nº 8.078/1990), com preferência pela aplicação de mecanismos de resolução alternativa de disputas, como mediação e arbitragem, conforme previsto na Lei nº 13.140/2015 (Lei de Mediação) e na Lei nº 9.307/1996 (Lei de Arbitragem). Antes de recorrer à via judicial, as partes comprometem-se a observar o procedimento de resolução de conflitos em duas etapas: (i) tentativa de resolução amigável por meio de contato direto com o suporte da ZEHLA, no prazo de 15 (quinze) dias úteis a contar da manifestação da parte insatisfeita; e (ii) submissão à Câmara de Arbitragem do setor tecnológico ou órgão similar, caso a resolução amigável não seja alcançada no prazo estipulado. Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, como alternativa para a resolução de litígios que não envolvam o Usuário na condição de consumidor, conforme o art. 4º, inciso IX, do Código Civil Brasileiro. Eventuais disposições destes Termos que venham a ser consideradas inválidas ou inexequíveis não afetarão a validade das demais disposições restantes.`,
  },
];

export default function TermosPage() {
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
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm text-orange-400 font-semibold mb-6">
              <Shield className="w-3.5 h-3.5" />
              Documento Legal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100 mb-3">
              Termos de Uso{' '}
              <span className="gradient-text">— SMARTHOTEL / ZEHLA</span>
            </h1>
            <p className="text-neutral-400 text-sm">
              Última atualização: Abril de 2026 · Vigência a partir de 01/04/2026
            </p>
          </motion.div>

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-6 sm:p-8 mb-8"
          >
            <p className="text-neutral-300 text-sm leading-relaxed">
              Estes Termos de Uso regulam o acesso e a utilização da Plataforma ZEHLA SmartHotel,
              fornecida pela ZEHLA Technologies. Ao utilizar nossos Serviços, você declara ter lido,
              compreendido e concordado integralmente com todas as condições aqui estabelecidas, em
              conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/1990), o Marco Civil da
              Internet (Lei nº 12.965/2014), o Decreto nº 7.962/2013 e a Lei Geral de Proteção de
              Dados (Lei nº 13.709/2018).
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.05 }}
                className="glass-card p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-100 mb-3">
                      {section.title}
                    </h2>
                    <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
