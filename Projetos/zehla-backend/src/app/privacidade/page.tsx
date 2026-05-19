import { Brain, ArrowLeft, Lock, Database, Target, Scale, Users, Cookie, Shield, Clock, Baby, RefreshCw, Mail } from 'lucide-react';
import { motion } from 'framer-motion';


'use client';


const sections = [
  {
    icon: Database,
    title: '1. Controlador de Dados',
    content: `A ZEHLA Technologies, empresa sediada no Brasil, inscrita no CNPJ sob o nº 00.000.000/0001-00, com sede na cidade de São Paulo, Estado de São Paulo, é a controladora de dados pessoais no âmbito da Plataforma ZEHLA SmartHotel, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Como controladora, a ZEHLA é responsável pelas decisões referentes ao tratamento de dados pessoais dos Usuários, incluindo a definição das finalidades, os meios de processamento, as medidas de segurança e a gestão dos direitos dos titulares. No que se refere aos dados pessoais dos hóspedes dos estabelecimentos clientes, a ZEHLA atua como operadora de dados, processando essas informações exclusivamente por conta e ordem do Usuário-Contratante, que assume a responsabilidade primária como controlador dos dados de seus hóspedes. Para o exercício dos direitos previstos na LGPD e para questões relacionadas à proteção de dados, a ZEHLA nomeou um Encarregado de Proteção de Dados (DPO — Data Protection Officer), cujas informações de contato estão disponíveis na Seção 12 desta Política. A ZEHLA compromete-se a manter registro atualizado de todas as atividades de tratamento de dados pessoais, conforme exigido pelo art. 37 da LGPD, e a disponibilizar este registro à Autoridade Nacional de Proteção de Dados (ANPD) sempre que solicitado.`,
  },
  {
    icon: Users,
    title: '2. Dados Coletados',
    content: `A ZEHLA coleta e processa as seguintes categorias de dados pessoais no âmbito da prestação dos Serviços: (a) Dados de Identificação: nome completo, CPF ou CNPJ, data de nascimento (para pessoas físicas), natureza jurídica e porte da empresa (para pessoas jurídicas), cargo ou função do responsável pela conta; (b) Dados de Contato: endereço de e-mail corporativo ou pessoal, número de telefone (incluindo números de WhatsApp para proprietário e atendimento), endereço completo do estabelecimento (logradouro, número, complemento, bairro, cidade, estado e CEP); (c) Dados de Cobrança e Pagamento: dados necessários para o processamento de transações financeiras, como dados de cartão de crédito (processados por provedores certificados pelo Banco Central, sem armazenamento direto pela ZEHLA), dados bancários para débito automático e histórico de pagamentos; (d) Dados Operacionais do Estabelecimento: tipos de acomodação, quartos disponíveis, serviços oferecidos, horários de check-in e check-out, políticas da propriedade, informações sobre a equipe do estabelecimento; (e) Dados de Interação com Hóspedes: conteúdo de mensagens trocadas via WhatsApp, intenções classificadas pelo sistema de IA, reservas realizadas, preferências manifestadas pelos hóspedes; (f) Dados Técnicos e de Uso: endereço IP, tipo e versão do navegador, sistema operacional, páginas acessadas, tempo de permanência, recursos utilizados, logs de erros e dados de cookies conforme detalhado na Seção 7 desta Política.`,
  },
  {
    icon: Target,
    title: '3. Finalidade do Tratamento',
    content: `Os dados pessoais coletados pela ZEHLA são tratados para as seguintes finalidades específicas, em conformidade com o princípio de finalidade previsto no art. 6º, III, da LGPD: (a) Prestação dos Serviços Contratados: processar o cadastro do Usuário e de seu estabelecimento, configurar a Plataforma de acordo com as necessidades operacionais, fornecer o atendimento automatizado via WhatsApp, gerenciar reservas e disponibilizar as funcionalidades do ZEHLA; (b) Inteligência Artificial e Aprendizado: treinar, calibrar e aprimorar os modelos de linguagem utilizados no atendimento automatizado, melhorando a precisão das respostas e a classificação de intenções dos hóspedes; (c) Gestão de Pagamentos e Cobrança: processar transações financeiras, emitir faturas, gerenciar cobranças e manter registros contábeis conforme exigido pela legislação fiscal brasileira; (d) Comunicação com o Usuário: enviar notificações operacionais, alertas do sistema, comunicados sobre atualizações da Plataforma, informações sobre a assinatura e materiais de suporte; (e) Suporte Técnico: diagnosticar e resolver problemas técnicos, responder solicitações de assistência e melhorar a qualidade dos Serviços; (f) Segurança e Prevenção de Fraudes: detectar atividades suspeitas, prevenir acessos não autorizados, proteger a integridade da Plataforma e cumprir obrigações legais; (g) Conformidade Regulatória: atender obrigações legais, regulatórias e administrativas, incluindo exigências de órgãos reguladores, fiscais e judiciais; (h) Melhoria Contínua: gerar estatísticas de uso, realizar análises de desempenho e desenvolver novas funcionalidades, sempre utilizando dados anonimizados ou pseudonimizados quando possível.`,
  },
  {
    icon: Scale,
    title: '4. Base Legal',
    content: `O tratamento de dados pessoais pela ZEHLA fundamenta-se nas seguintes bases legais previstas no art. 7º da LGPD, conforme a natureza de cada operação de processamento: (a) Consentimento do Titular (art. 7º, I): utilizado para o processamento de dados sensíveis, envio de comunicações de marketing e funcionalidades opcionais que requerem adesão explícita do Usuário. O consentimento é obtido de forma livre, informada, destacada e inequívoca, podendo ser revogado a qualquer momento; (b) Execução de Contrato (art. 7º, V): utilizado para o processamento de dados necessários à prestação dos Serviços contratados, incluindo dados cadastrais, operacionais e de pagamento, bem como para a utilização dos módulos da Plataforma pelo Usuário e seus hóspedes; (c) Legítimo Interesse do Controlador (art. 7º, IX): utilizado para operações de melhoria contínua dos Serviços, análise de dados agregados, prevenção de fraudes e comunicação sobre funcionalidades relevantes, sempre realizando o teste de proporcionalidade e impactos (LIA — Legitimate Interest Assessment); (d) Cumprimento de Obrigação Legal ou Regulatória (art. 7º, II): utilizado para a retenção de dados fiscais, contábeis e jurídicos conforme exigido pela legislação brasileira, incluindo o Código Tributário Nacional, a Lei das S/A e demais normas aplicáveis; (e) Exercício Regular de Direitos (art. 7º, VI): utilizado em processos judiciais, administrativos ou arbitrais em que a ZEHLA seja parte ou tenha interesse legítimo. A ZEHLA mantém registro documentado de cada base legal aplicável a cada categoria de dados pessoais tratados, disponível para consulta pela ANPD e pelos titulares.`,
  },
  {
    icon: Users,
    title: '5. Compartilhamento de Dados',
    content: `A ZEHLA poderá compartilhar dados pessoais com terceiros exclusivamente nas seguintes hipóteses e com as devidas salvaguardas: (a) Provedores de Serviços (Processadores de Dados): empresas que atuam em nome da ZEHLA para a prestação de serviços essenciais, incluindo provedores de infraestrutura em nuvem (AWS, Google Cloud ou Azure), processadores de pagamento (gateways de pagamento certificados pelo Banco Central), serviços de envio de e-mail e notificações, provedores de integração com WhatsApp Business API (Meta Platforms) e serviços de monitoramento e segurança. Todos os provedores são contratualmente obrigados a tratar os dados com o mesmo nível de proteção exigido pela LGPD; (b) Obrigações Legais: compartilhamento com autoridades públicas, órgãos reguladores e entidades governamentais quando exigido por lei, decisão judicial, requerimento administrativo ou determinação da ANPD; (c) Integrações Autorizadas pelo Usuário: quando o Usuário ativa integrações com plataformas de reservas (Booking.com, Airbnb), sistemas de PMS ou canais de distribuição, os dados necessários para o funcionamento dessas integrações são compartilhados conforme a configuração realizada pelo próprio Usuário; (d) Proteção de Direitos: compartilhamento em processos judiciais, administrativos ou de arbitragem para defesa dos direitos e interesses legítimos da ZEHLA. A ZEHLA não comercializa, aluga ou vende dados pessoais a terceiros para quaisquer finalidades. Todo compartilhamento é realizado com contratos de processamento de dados que garantem a proteção adequada dos dados pessoais em conformidade com o art. 39 da LGPD.`,
  },
  {
    icon: Shield,
    title: '6. Direitos do Titular',
    content: `Em conformidade com os arts. 17 a 22 da LGPD, o titular de dados pessoais tem os seguintes direitos que podem ser exercidos a qualquer momento perante a ZEHLA: (a) Confirmação e Acesso: confirmar a existência de tratamento e acessar os dados pessoais que a ZEHLA detém sobre o titular, incluindo informações sobre as finalidades do tratamento, a base legal, os dados compartilhados e o período de retenção; (b) Retificação: solicitar a correção de dados pessoais incompletos, inexatos ou desatualizados, sem custo adicional, no prazo de até 15 dias úteis; (c) Anonimização, Bloqueio ou Eliminação: solicitar a anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD, observadas as obrigações legais de retenção; (d) Portabilidade: solicitar a portabilidade dos dados a outro fornecedor de serviço ou em formato estruturado e de uso corrente, mediante requisição expressa; (e) Eliminação de dados tratados com base no consentimento: solicitar a eliminação dos dados pessoais cujo tratamento tenha sido baseado exclusivamente no consentimento, caso este seja revogado; (f) Informação sobre compartilhamento: obter informações sobre as entidades públicas e privadas com as quais os dados foram compartilhados; (g) Revogação do consentimento: revogar o consentimento previamente concedido a qualquer momento, sem comprometer a licitude do tratamento anterior à revogação. Para exercer qualquer destes direitos, o titular deve entrar em contato com o Encarregado (DPO) através dos canais indicados na Seção 12. A ZEHLA compromete-se a responder às solicitações no prazo de até 15 (quinze) dias úteis, conforme previsto na LGPD.`,
  },
  {
    icon: Cookie,
    title: '7. Cookies',
    content: `A Plataforma ZEHLA utiliza cookies e tecnologias similares de rastreamento para melhorar a experiência do Usuário, garantir o funcionamento adequado dos Serviços e coletar informações analíticas. Os cookies utilizados são classificados nas seguintes categorias: (a) Cookies Essenciais: necessários para o funcionamento básico da Plataforma, incluindo autenticação de sessão, preferências de idioma, tokens de segurança (CSRF) e configurações de acessibilidade. Estes cookies não podem ser desabilitados sem comprometer o funcionamento da Plataforma; (b) Cookies de Desempenho: utilizados para coletar informações anônimas sobre como os Usuários utilizam a Plataforma, como páginas visitadas, tempo de permanência e funcionalidades mais utilizadas. Estes dados são agregados e utilizados exclusivamente para melhorias na experiência de uso; (c) Cookies Funcionais: permitem que a Plataforma lembre preferências do Usuário, como tema de interface, configurações de notificação e layout do dashboard personalizado; (d) Cookies de Marketing: utilizados para rastrear visitantes entre websites e exibir anúncios relevantes, quando aplicável. Estes cookies só são ativados mediante consentimento expresso do Usuário. Em conformidade com a LGPD e o Marco Civil da Internet, o Usuário pode gerenciar suas preferências de cookies a qualquer momento por meio das configurações do navegador ou da seção de preferências na Plataforma. Informamos que a desativação de determinados cookies pode afetar a funcionalidade e a experiência de uso da Plataforma.`,
  },
  {
    icon: Lock,
    title: '8. Segurança',
    content: `A ZEHLA adota medidas técnicas e administrativas robustas para proteger os dados pessoais dos Usuários e hóspedes contra acessos não autorizados, destruição, perda, alteração ou qualquer forma de tratamento inadequado. As medidas de segurança implementadas incluem: (a) Criptografia: comunicação exclusivamente via HTTPS/TLS 1.3, criptografia de dados sensíveis em repouso utilizando AES-256 e criptografia de dados de pagamento conforme os padrões PCI-DSS; (b) Controle de Acesso: sistema de autenticação multifator (MFA), controle de acesso baseado em funções (RBAC), sessões com timeout automático e gestão centralizada de credenciais; (c) Infraestrutura: hospedagem em provedores de nuvem com certificações ISO 27001, SOC 2 Type II e conformidade com a LGPD, com data centers localizados no Brasil; (d) Monitoramento: sistema de detecção de intrusão (IDS), monitoramento contínuo de logs e auditoria em tempo real, análise de comportamento anômalo e resposta a incidentes com equipe dedicada; (e) backups: backup automático diário com retenção de 30 dias, replicação geográfica e testes periódicos de restauração; (f) Conformidade com PCI-DSS: processamento de dados de pagamento em conformidade com o Payment Card Industry Data Security Standard, sem armazenamento de dados completos de cartão de crédito nos servidores da ZEHLA; (g) Treinamento: todos os colaboradores com acesso a dados pessoais recebem treinamento obrigatório sobre proteção de dados, LGPD e boas práticas de segurança da informação; (h) Resposta a Incidentes: plano de resposta a incidentes com notificação à ANPD e aos titulares afetados em conformidade com o art. 48 da LGPD, no prazo de até 72 horas após a constatação do incidente.`,
  },
  {
    icon: Clock,
    title: '9. Retenção de Dados',
    content: `A ZEHLA retém os dados pessoais dos Usuários pelo período necessário para cumprir as finalidades para as quais foram coletados, observados os prazos legais aplicáveis. Os critérios de retenção são os seguintes: (a) Dados da Conta Ativa: mantidos enquanto a conta do Usuário estiver ativa e a assinatura em vigor, incluindo todo o período de uso da Plataforma; (b) Dados após o Cancelamento: após o encerramento da conta, os dados operacionais e de interação são mantidos por 30 (trinta) dias para permitir a exportação pelo Usuário, findo o qual são permanentemente excluídos dos sistemas ativos; (c) Dados Fiscais e Contábeis: mantidos pelo prazo de 5 (cinco) anos, conforme exigido pelo art. 173 do Código Tributário Nacional e demais normas da Receita Federal do Brasil, incluindo registros de transações, faturas e comprovantes de pagamento; (d) Dados de Contrato: mantidos pelo prazo de prescrição de eventuais obrigações contratuais e legais, que pode chegar a 10 (dez) anos conforme o Código Civil brasileiro; (e) Dados de Logs de Segurança: mantidos por 90 (noventa) dias para fins de análise de segurança e investigação de incidentes, após o que são anonimizados ou excluídos; (f) Dados para Análise e Melhoria: dados anonimizados ou pseudonimizados utilizados para aprimoramento dos modelos de IA e dos Serviços podem ser mantidos por período indeterminado, desde que não seja possível a identificação do titular. Após o término dos prazos de retenção, os dados são eliminados de forma segura e definitiva, utilizando métodos que garantem a irreversibilidade do processo, salvo quando a legislação exigir sua preservação.`,
  },
  {
    icon: Baby,
    title: '10. Menores de Idade',
    content: `A Plataforma ZEHLA SmartHotel não é direcionada a menores de 18 (dezoito) anos e não coleta intencionalmente dados pessoais de crianças ou adolescentes. Os Serviços são destinados exclusivamente a proprietários, gerentes e operadores de estabelecimentos de hospedagem, que necessariamente devem ser pessoas jurídicas ou pessoas físicas maiores e capazes. No contexto do atendimento automatizado a hóspedes via WhatsApp, a ZEHLA poderá processar mensagens enviadas por menores de idade, porém este processamento ocorre por conta e ordem do estabelecimento contratante, que é o responsável por garantir a conformidade com o Estatuto da Criança e do Adolescente (Lei nº 8.069/1990) e com o art. 14 da LGPD. Caso a ZEHLA tome conhecimento de que coletou dados pessoais de menor de idade sem o consentimento adequado dos pais ou responsáveis legais, medidas serão adotadas prontamente para eliminar tais dados de seus sistemas. O estabelecimento Usuário é responsável por obter todos os consentimentos necessários de pais ou responsáveis quando os Serviços envolverem interação direta com menores de idade, especialmente em situações que envolvam coleta de dados, processamento de preferências ou armazenamento de informações de hóspedes menores. A ZEHLA recomenda que os estabelecimentos clientes informem suas políticas de privacidade aos hóspedes e obtenham os consentimentos necessários no momento do check-in ou por meio de termos de uso específicos.`,
  },
  {
    icon: RefreshCw,
    title: '11. Alterações nesta Política',
    content: `A ZEHLA reserva-se o direito de atualizar esta Política de Privacidade a qualquer momento, para refletir mudanças em nossas práticas de tratamento de dados, alterações na legislação aplicável ou para aprimorar a transparência sobre nossas atividades de proteção de dados. Alterações substanciais serão comunicadas ao Usuário com antecedência mínima de 30 (trinta) dias, por meio de notificação por e-mail e aviso destacado na Plataforma. A continuidade do uso da Plataforma após a entrada em vigor das alterações constitui aceitação das novas condições. Caso o Usuário discorde de alguma alteração, poderá solicitar o encerramento de sua conta conforme os procedimentos estabelecidos nos Termos de Uso. A ZEHLA manterá as versões anteriores desta Política arquivadas e disponíveis para consulta, garantindo a rastreabilidade das condições vigentes em cada período. Recomendamos que o Usuário revise periodicamente esta Política para se manter informado sobre como seus dados pessoais são tratados. Esta Política foi elaborada em conformidade com as boas práticas recomendadas pela Autoridade Nacional de Proteção de Dados (ANPD) e com os princípios de proteção de dados previstos no art. 6º da LGPD, incluindo finalidade, adequação, necessidade, livre acesso, qualidade dos dados, transparência, segurança, prevenção, não discriminação e responsabilização e prestação de contas (accountability).`,
  },
  {
    icon: Mail,
    title: '12. Contato — Encarregado (DPO)',
    content: `Para exercer seus direitos como titular de dados pessoais, esclarecer dúvidas sobre esta Política de Privacidade, apresentar reclamações ou solicitações relacionadas ao tratamento de dados, entre em contato com nosso Encarregado de Proteção de Dados (DPO — Data Protection Officer) por meio dos seguintes canais: (a) E-mail: dpo@zehla.com.br — canal preferencial para solicitações formais relacionadas à LGPD, com prazo de resposta de até 15 dias úteis; (b) Formulário de Contato: disponível na Plataforma ZEHLA na seção "Configurações" > "Privacidade e Dados", para solicitações diretamente pelo sistema; (c) Correspondência: ZEHLA Technologies, Atencão ao DPO, São Paulo, SP, CEP 00000-000. Ao realizar uma solicitação, fornecer as seguintes informações: nome completo, dados de contato (e-mail e telefone), descrição detalhada da solicitação e, quando aplicável, o número de identificação do titular. O DPO da ZEHLA é responsável por receber as demandas dos titulares, orientar sobre os direitos previstos na LGPD, acompanhar a implementação de práticas de proteção de dados na empresa, mediar demandas entre a ZEHLA e os titulares de dados e interagir com a Autoridade Nacional de Proteção de Dados (ANPD). Caso o titular entenda que a resposta do DPO não foi satisfatória, poderá apresentar reclamação à ANPD por meio do site oficial da autoridade (www.gov.br/anpd). A ZEHLA garante que nenhuma forma de discriminação ou retaliatória será aplicada a titulares que exerçam seus direitos de proteção de dados.`,
  },
];

export default function PrivacidadePage() {
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
              <Lock className="w-3.5 h-3.5" />
              Proteção de Dados
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100 mb-3">
              Política de Privacidade{' '}
              <span className="gradient-text">— SMARTHOTEL / ZEHLA</span>
            </h1>
            <p className="text-neutral-400 text-sm">
              Última atualização: Abril de 2026 · Conforme LGPD (Lei nº 13.709/2018)
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
              A ZEHLA Technologies valoriza a privacidade e a proteção dos dados pessoais de seus
              Usuários e dos hóspedes atendidos por meio de sua Plataforma. Esta Política de
              Privacidade descreve como coletamos, utilizamos, armazenamos, compartilhamos e
              protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados
              (Lei nº 13.709/2018 — LGPD) e demais normas aplicáveis.
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
