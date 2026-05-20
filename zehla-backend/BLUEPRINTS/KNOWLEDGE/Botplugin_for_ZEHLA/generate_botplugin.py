# -*- coding: utf-8 -*-
import os, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, CondPageBreak
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import hashlib

pdfmetrics.registerFont(TTFont('NotoSerifSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSCBold', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('CarlitoBold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuMono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSCBold')
registerFontFamily('Carlito', normal='Carlito', bold='CarlitoBold')

ACCENT = colors.HexColor('#1d7794')
TEXT_PRIMARY = colors.HexColor('#242627')
TEXT_MUTED = colors.HexColor('#7a8086')
BG_SURFACE = colors.HexColor('#dce2e6')
BG_PAGE = colors.HexColor('#f1f2f4')

A4_W, A4_H = A4
lm = 1.0 * inch
aw = A4_W - 2*lm

body = ParagraphStyle(name='B', fontName='Carlito', fontSize=10.5, leading=17, alignment=TA_JUSTIFY, spaceAfter=6, textColor=TEXT_PRIMARY)
h1s = ParagraphStyle(name='H1', fontName='Carlito', fontSize=20, leading=26, spaceBefore=18, spaceAfter=10, textColor=ACCENT)
h2s = ParagraphStyle(name='H2', fontName='Carlito', fontSize=15, leading=21, spaceBefore=14, spaceAfter=8, textColor=TEXT_PRIMARY)
h3s = ParagraphStyle(name='H3', fontName='Carlito', fontSize=12, leading=17, spaceBefore=10, spaceAfter=6, textColor=TEXT_PRIMARY)
bul = ParagraphStyle(name='BL', fontName='Carlito', fontSize=10.5, leading=17, alignment=TA_LEFT, spaceAfter=4, textColor=TEXT_PRIMARY, leftIndent=24, bulletIndent=12)
cal = ParagraphStyle(name='CL', fontName='Carlito', fontSize=10, leading=16, alignment=TA_LEFT, spaceAfter=6, textColor=ACCENT, leftIndent=18, borderPadding=(6,6,6,6), backColor=BG_PAGE, borderWidth=0.5, borderColor=ACCENT)
cap = ParagraphStyle(name='CAP', fontName='Carlito', fontSize=9, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)
hc = ParagraphStyle(name='HC', fontName='Carlito', fontSize=10, textColor=colors.white, alignment=TA_CENTER)
tc = ParagraphStyle(name='TC', fontName='Carlito', fontSize=9.5, textColor=TEXT_PRIMARY, alignment=TA_CENTER)
tl = ParagraphStyle(name='TL', fontName='Carlito', fontSize=9.5, textColor=TEXT_PRIMARY, alignment=TA_LEFT)

def P(t, s=body): return Paragraph(t, s)
def H1(t):
    k='h_%s'%hashlib.md5(t.encode()).hexdigest()[:8]
    p=Paragraph('<a name="%s"/><b>%s</b>'%(k,t),h1s); p.bookmark_name=t; p.bookmark_level=0; p.bookmark_text=t; p.bookmark_key=k; return p
def H2(t):
    k='h2_%s'%hashlib.md5(t.encode()).hexdigest()[:8]
    p=Paragraph('<a name="%s"/><b>%s</b>'%(k,t),h2s); p.bookmark_name=t; p.bookmark_level=1; p.bookmark_text=t; p.bookmark_key=k; return p
def H3(t): return Paragraph('<b>%s</b>'%t,h3s)
def B(t): return Paragraph(t,bul,bulletText='\u2022')
def C(t): return Paragraph('<b>%s</b>'%t,cal)

def T(hdrs, rows, ratios=None):
    if ratios is None: ratios=[1.0/len(hdrs)]*len(hdrs)
    cw=[r*aw for r in ratios]
    d=[[Paragraph('<b>%s</b>'%h,hc) for h in hdrs]]
    for r in rows:
        d.append([Paragraph(str(c),tl if len(str(c))>30 else tc) for c in r])
    t=Table(d,colWidths=cw,hAlign='CENTER')
    sc=[('BACKGROUND',(0,0),(-1,0),ACCENT),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),0.5,TEXT_MUTED),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]
    for i in range(1,len(d)):
        sc.append(('BACKGROUND',(0,i),(-1,i),colors.white if i%2==1 else BG_SURFACE))
    t.setStyle(TableStyle(sc))
    return t

class TocDoc(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable,'bookmark_name'):
            l=getattr(flowable,'bookmark_level',0)
            t=getattr(flowable,'bookmark_text','')
            k=getattr(flowable,'bookmark_key','')
            self.notify('TOCEntry',(l,t,self.page,k))

doc=TocDoc('/home/z/my-project/download/BotPlugin_Analysis_ZEHLA_Body.pdf',pagesize=A4,leftMargin=lm,rightMargin=lm,topMargin=0.9*inch,bottomMargin=0.9*inch)
story=[]

# TOC
story.append(P('<b>Sumario</b>',ParagraphStyle(name='TT',fontName='Carlito',fontSize=22,leading=28,alignment=TA_LEFT,textColor=ACCENT,spaceAfter=18)))
toc=TableOfContents()
toc.levelStyles=[ParagraphStyle(name='t1',fontSize=13,leftIndent=20,fontName='Carlito',leading=22,spaceBefore=4),ParagraphStyle(name='t2',fontSize=11,leftIndent=40,fontName='Carlito',leading=18,spaceBefore=2)]
story.append(toc)
story.append(PageBreak())

# === SEC 1 ===
story.append(H1('1. Visao Geral do BotPlugin'))
story.append(P('O BotPlugin e uma plataforma brasileira de criacao de chatbots com inteligencia artificial, desenvolvida pela Roote Tecnologia (CNPJ 47.714.701/0001-56). Sua proposta central e democratizar o acesso a automacao de atendimento via WhatsApp e Instagram, permitindo que empreendedores e pequenas empresas criem fluxos de chatbot sofisticados sem necessidade de conhecimento em programacao. A plataforma opera com um sistema de "arrasta e solta" (drag-and-drop) onde blocos visuais sao combinados para construir experiencias de atendimento completas e personalizadas.'))
story.append(P('A plataforma se destaca no mercado por tres fatores principais: a simplicidade da interface visual, a integracao nativa com as principais IAs do mercado (especialmente o ChatGPT da OpenAI), e o modelo de precos acessivel que inclui uma versao gratuita. Diferente de solucoes enterprise complexas como Dialogflow ou IBM Watson, o BotPlugin foi desenhado para o empreendedor brasileiro que precisa automatizar seu atendimento rapidamente, sem uma equipe tecnica dedicada. Segundo a propria empresa, mais de 70% das empresas brasileiras ja utilizam o WhatsApp como canal de vendas, e o BotPlugin nasce para resolver os problemas de lentidao nas respostas, perda de oportunidades e sobrecarga das equipes que esse cenario gera.'))
story.append(P('Alem da versao web (SaaS em nuvem), o BotPlugin oferece uma extensao para Google Chrome que integra funcionalidades avancadas diretamente ao WhatsApp Web. Esta extensao permite automatizar conversas, melhorar a produtividade e personalizar a experiencia de atendimento sem sair do WhatsApp. A empresa tambem faz parte do ecossistema da Roote, que inclui outras solucoes como o ChatCenter (painel de atendimento humano), a Roote API (integracao via API) e o Membly (gestao de membros/assinaturas).'))

story.append(H2('1.1 Dados da Empresa'))
story.append(T(
    ['Atributo','Valor'],
    [['Empresa','Roote Tecnologia'],['CNPJ','47.714.701/0001-56'],['Produto','BotPlugin'],['Site','https://www.botplugin.com.br'],['App','https://app.botplugin.com.br'],['Extensao Chrome','Chrome Web Store (BotPlugin v1.1.77)'],['Suporte','suporte@multiweb.plus'],['Instagram','@botplugin.com.br'],['WhatsApp','+55 11 91834-4195'],['Avaliacao Chrome','4.7/5 (3 ratings, 2000+ usuarios)']],
    [0.30, 0.70]
))
story.append(Spacer(1,6))
story.append(P('Tabela 1: Dados cadastrais e canais do BotPlugin',cap))

# === SEC 2 ===
story.append(H1('2. Modelo de Funcionamento'))
story.append(P('O BotPlugin opera em um modelo hibrido que combina uma aplicacao web em nuvem (construcao e gestao dos bots) com uma extensao do Chrome (execucao e automacao dentro do WhatsApp Web). Este modelo e estrategicamente inteligente porque permite ao usuario construir seus fluxos em um ambiente rico (a plataforma web com canvas visual) e executa-los diretamente no WhatsApp Web, sem necessidade de APIs oficiais ou integracoes complexas com a Meta. A seguir, detalhamos cada camada do modelo de funcionamento.'))

story.append(H2('2.1 Plataforma Web (Builder)'))
story.append(P('A plataforma web e o ambiente onde o usuario cria, configura e gerencia seus chatbots. Ela opera como um builder visual com as seguintes capacidades:'))
story.append(B('<b>Canvas de Fluxo Visual:</b> Interface drag-and-drop onde blocos de funcionalidades sao conectados para formar o fluxo de atendimento. O usuario pode criar multiplos fluxos, cada um atendendo a um proposito especifico (boas-vindas, suporte, vendas, agendamento, etc.).'))
story.append(B('<b>Gestao de Contatos e Leads:</b> Painel integrado para visualizar e gerenciar os contatos que interagem com o bot, incluindo historico de conversas, tags e segmentacao.'))
story.append(B('<b>Dashboard de Metricas:</b> Analises em tempo real que permitem acompanhar o volume de conversas, taxa de resposta, tempo medio de atendimento e outras metricas relevantes para otimizar o atendimento.'))
story.append(B('<b>Configuracao de Canais:</b> Central para conectar e gerenciar os canais de atendimento (WhatsApp, Instagram Direct). O WhatsApp e conectado via extensao Chrome e o Instagram via integracao oficial.'))
story.append(B('<b>Gestao de Agentes IA:</b> Configuracao dos agentes de inteligencia artificial, incluindo selecao do modelo de IA (GPT), personalizacao do prompt de sistema e ajuste de parametros de comportamento.'))

story.append(H2('2.2 Extensao Chrome (Runtime)'))
story.append(P('A extensao para Google Chrome e o componente que efetivamente executa a automacao dentro do WhatsApp Web. Ela atua como uma ponte entre os fluxos criados na plataforma e a interface do WhatsApp Web, interceptando e respondendo mensagens automaticamente. As principais funcionalidades da extensao incluem:'))
story.append(B('<b>Automacao de Conversas:</b> A extensao monitora as mensagens recebidas no WhatsApp Web e dispara as acoes definidas nos blocos do fluxo. Isso inclui enviar mensagens automaticas, apresentar menus, capturar respostas e acionar integracoes.'))
story.append(B('<b>CRM Integrado:</b> Funcionalidades de CRM diretamente no WhatsApp Web, incluindo tags de contatos, notas, segmentacao e follow-up. Isso permite ao usuario gerenciar leads sem sair do WhatsApp.'))
story.append(B('<b>Multi-Conta:</b> Suporte a gestao de multiplos numeros de WhatsApp simultaneamente, permitindo que equipes ou agencias gerenciem varios clientes a partir de uma unica interface.'))
story.append(B('<b>Envio em Massa (Bulk):</b> Capacidade de enviar mensagens para listas de contatos de forma automatizada, com suporte a variaveis de personalizacao (nome, data, etc.).'))

story.append(H2('2.3 Fluxo de Dados End-to-End'))
story.append(P('O fluxo de dados do BotPlugin segue um ciclo completo em quatro etapas sincronizadas. Na primeira etapa, chamada de <b>Construcao</b>, o usuario acessa a plataforma web e cria o fluxo de atendimento conectando blocos visuais no canvas. Na segunda etapa, chamada de <b>Sincronizacao</b>, o fluxo criado e sincronizado com a extensao Chrome via API interna. Na terceira etapa, chamada de <b>Execucao</b>, a extensao monitora o WhatsApp Web e, ao receber uma nova mensagem, processa o fluxo e executa as acoes definidas (respostas automaticas, chamadas de IA, envio de menus, etc.). Na quarta etapa, chamada de <b>Coleta</b>, as interacoes sao registradas e os dados de analytics sao enviados de volta para a plataforma web, alimentando o dashboard de metricas.'))

# === SEC 3 ===
story.append(H1('3. Sistema de Blocos (Blocos Visuais)'))
story.append(P('O coracao do BotPlugin e o sistema de blocos visuais, que permite construir fluxos complexos de atendimento sem programar. Cada bloco representa uma acao ou elemento logico, e a combinacao desses blocos forma o fluxo completo do chatbot. O usuario simplesmente arrasta os blocos para o canvas e os conecta para definir a sequencia de acoes. Este conceito e similar ao de ferramentas como Typebot, BotConversa e ManyChat, mas com foco especifico no mercado brasileiro e no ecossistema WhatsApp.'))

story.append(H2('3.1 Blocos Core (Identificados)'))
story.append(T(
    ['Bloco','Funcao','Descricao Detalhada'],
    [
        ['Mensagem','Envio de texto','Envia uma mensagem de texto para o contato. Suporta variaveis de personalizacao como nome, data, horario e parametros capturados anteriormente no fluxo.'],
        ['Menu','Opcoes de escolha','Cria um menu de opcoes numeradas ou com botoes para interacao do usuario. Define os caminhos do fluxo com base na escolha feita pelo contato.'],
        ['Perguntas','Captura de dados','Apresenta uma pergunta ao usuario e captura a resposta. Util para coletar informacoes como nome, telefone, data desejada, tipo de servico, etc.'],
        ['Imagem','Envio de midia','Envia imagens para o contato. Pode ser usado para enviar fotos de produtos, mockups, comprovantes ou material visual de suporte.'],
        ['Documento','Envio de arquivos','Envia documentos PDF, planilhas ou outros arquivos anexos ao contato via WhatsApp.'],
        ['IA GPT','Inteligencia artificial','Integra com a API da OpenAI (ChatGPT) para gerar respostas inteligentes e contextuais. O bloco recebe o contexto da conversa e retorna uma resposta personalizada pela IA.'],
        ['Condicao','Logica de fluxo','Cria ramificacoes no fluxo baseadas em condicoes (if/else). Permite caminhos diferentes dependendo da resposta do usuario, horario, dia da semana, ou valor de variaveis.'],
        ['Delay','Tempo de espera','Introduz um intervalo de tempo entre acoes, simulando digitacao humana ou criando esperas estrategicas.'],
        ['Acao Webhook','Requisicao HTTP','Dispara uma requisicao HTTP (GET/POST) para uma URL externa. Permite integrar com sistemas de terceiros como CRM, ERP, e-commerce ou APIs customizadas.'],
        ['Agendamento','Gestao de agenda','Cria agendamentos e lembretes automaticos. Pode integrar com Google Agenda para sincronizar compromissos e enviar lembretes automaticos.'],
        ['Email','Envio de e-mail','Envia e-mails automaticamente a partir do fluxo. Util para confirmacoes de agendamento, envio de contratos, ou follow-up pos-atendimento.'],
    ],
    [0.14, 0.14, 0.72]
))
story.append(Spacer(1,6))
story.append(P('Tabela 2: Blocos visuais identificados do BotPlugin',cap))

story.append(H2('3.2 Integracoes Identificadas'))
story.append(T(
    ['Integracao','Tipo','Descricao'],
    [
        ['OpenAI GPT','IA Generativa','Integracao nativa com ChatGPT para respostas inteligentes. O usuario configura o prompt de sistema e o bloco GPT gera respostas contextuais em tempo real.'],
        ['WhatsApp Web','Mensagem','Conectado via extensao Chrome. Monitora e responde mensagens automaticamente diretamente no WhatsApp Web sem API oficial.'],
        ['Instagram Direct','Mensagem','Integracao com Instagram para atendimento automatizado no Direct. Permite fluxos similares ao WhatsApp no canal do Instagram.'],
        ['Google Agenda','Agendamento','Sincronizacao bidirecional com Google Calendar para criar, consultar e gerenciar agendamentos automaticamente.'],
        ['Email (SMTP)','Notificacao','Envio de e-mails transacionais e de follow-up a partir dos fluxos do chatbot.'],
        ['Webhook/API','Desenvolvedor','Requisicoes HTTP para integrar com sistemas externos (CRM, ERP, e-commerce, gateways de pagamento).'],
        ['Zapier/n8n','Automacao','Integracao via webhook com plataformas de automacao para conectar o BotPlugin a centenas de outras ferramentas.'],
    ],
    [0.16, 0.14, 0.70]
))
story.append(Spacer(1,6))
story.append(P('Tabela 3: Integracoes disponiveis no BotPlugin',cap))

# === SEC 4 ===
story.append(H1('4. IAs e Modelos Utilizados'))
story.append(P('O BotPlugin utiliza inteligencia artificial em dois niveis distintos dentro de sua plataforma. O primeiro nivel e a <b>IA de Criacao de Fluxos</b>, que permite ao usuario descrever em linguagem natural como ele deseja que o chatbot funcione, e a plataforma gera automaticamente o fluxo visual correspondente. O segundo nivel e a <b>IA de Resposta (ChatGPT)</b>, que e integrada como um bloco dentro dos fluxos e gera respostas inteligentes e contextuais em tempo real durante o atendimento.'))

story.append(H2('4.1 IA de Criacao de Fluxos (Prompt-to-Flow)'))
story.append(P('A funcionalidade mais inovadora do BotPlugin e a capacidade de criar fluxos de chatbot a partir de descricao em linguagem natural. O usuario digita como imagina seu fluxo (por exemplo: "Crie um chatbot para minha pousada que cumprimenta o cliente, pergunta as datas desejadas, verifica disponibilidade e envia preco") e a IA da plataforma gera automaticamente o fluxo visual com os blocos ja conectados. Esta funcionalidade funciona como um "copiloto de automacao" que drastically reduz o tempo de criacao de chatbots.'))
story.append(P('Tecnicamente, esta funcionalidade provavelmente utiliza um modelo de linguagem (GPT-4 ou similar) para interpretar a descricao do usuario, mapear os requisitos para blocos visuais pre-definidos, e gerar a estrutura do fluxo em formato JSON que e renderizada no canvas visual. O usuario pode entao editar, ajustar e personalizar o fluxo gerado antes de ativa-lo. Esta abordagem e especialmente poderosa para usuarios sem experiencia tecnica, pois elimina a barreira inicial de criacao e permite iteracoes rapidas sobre um fluxo ja funcional.'))

story.append(H2('4.2 IA de Resposta (ChatGPT no Fluxo)'))
story.append(P('O bloco de IA GPT e o componente que permite respostas inteligentes dentro dos fluxos de atendimento. Quando o fluxo atinge esse bloco, o sistema envia o contexto acumulado da conversa (mensagens anteriores, dados capturados, variaveis) para a API da OpenAI, que gera uma resposta personalizada. O proprietario pode configurar o prompt de sistema para definir o tom, a personalidade e as restricoes da IA, garantindo que as respostas estejam alinhadas com a identidade do negocio.'))
story.append(P('Esta funcionalidade e conceitualmente similar ao que o ZEHLA ML Brain faz com o sistema de Voice Cloning e RAG, porem com uma abordagem mais simples: o BotPlugin permite configurar manualmente um prompt de sistema (similar ao que o ZEHLA faz automaticamente via Voice Fingerprinting), mas nao possui aprendizado continuo, fine-tuning por pousada, ou extracao automatica de perfil de voz a partir de conversas anteriores. Este e um ponto critico de diferenciacao que sera explorado na secao de adaptacao.'))

story.append(H2('4.3 Modelo de IA e Configuracao'))
story.append(T(
    ['Aspecto','BotPlugin','ZEHLA (Proposto)'],
    [
        ['Modelo de IA','ChatGPT (OpenAI) via bloco GPT','GPT-4o-mini + modelos fine-tuned por pousada'],
        ['Configuracao do Prompt','Manual pelo usuario (prompt de sistema)','Automatico via Voice Cloning + ajuste manual (DNA Wizard)'],
        ['Contexto da Conversa','Historico da sessao atual','RAG com embeddings de conversas anteriores + historico'],
        ['Personalizacao por Negocio','Um prompt generico','Voice Profile com 6 dimensoes + Tone Thermometer'],
        ['Aprendizado Continuo','Nao disponivel','Feedback loop com MLInteractionLog + fine-tuning semanal'],
        ['Multi-Modelo','Apenas ChatGPT','LLM Router: GPT-4o-mini base + modelo fine-tuned por tenant'],
    ],
    [0.22, 0.35, 0.43]
))
story.append(Spacer(1,6))
story.append(P('Tabela 4: Comparacao BotPlugin vs ZEHLA em IA',cap))

# === SEC 5 ===
story.append(H1('5. Tipos de Workflows'))
story.append(P('O sistema de blocos do BotPlugin permite a criacao de diversos tipos de workflows de atendimento, desde os mais simples (um menu de opcoes) ate os mais complexos (fluxos multi-ramificados com IA e integracoes externas). A flexibilidade do sistema de blocos e as condicoes logicas permitem criar praticamente qualquer cenario de atendimento automatizado. A seguir, detalhamos os principais tipos de workflows identificados, com enfase especial nos padroes relevantes para o segmento de pousadas e hospedagem.'))

story.append(H2('5.1 Workflows Basicos'))
story.append(B('<b>Menu de Boas-Vindas:</b> Fluxo linear que envia uma mensagem de saudacao e apresenta um menu numerado de opcoes (ex: 1-Ver quartos, 2-Fazer reserva, 3-Horario de funcionamento, 4-Falar com atendente). Cada opcao direciona para um sub-fluxo especifico. Este e o tipo mais comum e serve como ponto de entrada para todos os contatos.'))
story.append(B('<b>Triagem e Qualificacao:</b> Fluxo que faz perguntas sequenciais para qualificar o lead (datas desejadas, numero de hospedes, tipo de quarto preferido, orcamento). As respostas capturadas alimentam variaveis que sao usadas nos blocos subsequentes para personalizar a resposta (ex: verificar disponibilidade apenas para as datas informadas).'))
story.append(B('<b>Resposta com IA:</b> Fluxo que redireciona a conversa para o bloco GPT quando o usuario faz uma pergunta que nao esta coberta pelo menu. A IA analisa a pergunta e gera uma resposta contextual, mantendo o tom e as restricoes configuradas no prompt de sistema. Se a IA nao souber responder, o fluxo pode direcionar para um atendente humano.'))

story.append(H2('5.2 Workflows Avancados'))
story.append(B('<b>Agendamento Automatico:</b> Fluxo que captura a data e hora desejada pelo contato, consulta a disponibilidade via webhook (integracao com sistema de reservas ou Google Agenda), e confirma o agendamento automaticamente. Pode incluir envio de lembrete por email ou WhatsApp antes da data agendada.'))
story.append(B('<b>Nutricao de Leads (Follow-up):</b> Fluxo automatizado que envia mensagens sequenciais ao longo do tempo para leads que nao converteram. Exemplo: Dia 0 - Proposta enviada; Dia 1 - "Deu uma pensada?"; Dia 3 - "Temos uma promocao especial"; Dia 7 - "Ultima disponibilidade para as datas solicitadas". Este tipo de workflow e essencial para maximizar a taxa de conversao.'))
story.append(B('<b>Atendimento Multi-Canal:</b> Fluxo que opera simultaneamente no WhatsApp e Instagram, com logica condicional para adaptar as respostas ao canal utilizado. Permite uma experiencia unificada de atendimento mesmo em plataformas diferentes.'))
story.append(B('<b>Fluxo com Escalada Humana:</b> Workflow que opera em modo "IA primeiro, humano quando necessario". O bot atende as demandas mais comuns automaticamente e, ao detectar insatisfacao, complexidade ou solicitacao explicita, transfere a conversa para um atendente humano com todo o contexto acumulado.'))

story.append(H2('5.3 Workflows Especificos para Pousadas'))
story.append(P('Embora o BotPlugin nao seja especifico para o segmento de hospedagem, seu sistema de blocos permite criar workflows perfeitamente adaptados para pousadas. Abaixo estao os workflows que o ZEHLA pode replicar e evoluir a partir dos conceitos do BotPlugin:'))
story.append(T(
    ['Workflow','Blocos Utilizados','Valor para Pousada'],
    [
        ['Recepcao Virtual','Mensagem + Menu + IA GPT + Condicao','Atende 24/7 com respostas sobre quartos, precos, localizacao'],
        ['Reserva Direta','Perguntas + Condicao + Webhook','Captura dados e envia para sistema de reservas automaticamente'],
        ['Check-in/Check-out','Mensagem + Imagem + Agendamento','Instrucoes personalizadas com mapa e horarios'],
        ['Recomendacao Local','IA GPT + Imagem + Mensagem','Sugere restaurantes, passeios e atrativos com base no perfil'],
        ['Recovery de Cancelamento','Condicao + IA GPT + Mensagem','Identifica cancelamentos e oferece alternativas com desconto'],
        ['Pos-Checkout','Delay + Mensagem + Email','Agradecimento + pedido de avaliacao + oferta de retorno'],
    ],
    [0.20, 0.32, 0.48]
))
story.append(Spacer(1,6))
story.append(P('Tabela 5: Workflows especificos para pousadas adaptados do BotPlugin',cap))

# === SEC 6 ===
story.append(H1('6. Precos e Modelo de Negocio'))
story.append(P('O BotPlugin adota um modelo de precos em camadas (freemium) que permite ao usuario comecar gratuitamente e evoluir conforme sua necessidade. Este modelo e agressivamente competitivo, especialmente considerando que a versao gratuita ja inclui acesso ao sistema de blocos e a IA GPT, diferentemente de concorrentes que limitam funcionalidades essenciais no plano gratuito.'))

story.append(T(
    ['Plano','Preco Mensal','Preco Anual','Funcionalidades Chave'],
    [
        ['Gratis','R$ 0','R$ 0','Conexao via navegador, todos os tipos de canais, blocos basicos, IA GPT com limite'],
        ['Nuvem','R$ 179,90','R$ 125,93/mes','Tudo do Gratis + sem marca dagua, integracoes avancadas, API completa'],
    ],
    [0.12, 0.14, 0.14, 0.60]
))
story.append(Spacer(1,6))
story.append(P('Tabela 6: Planos e precos do BotPlugin',cap))
story.append(P('O plano Nuvem oferece 30% de desconto no faturamento anual (R$ 125,93/mes vs R$ 179,90/mes). Ambos os planos possuem garantia de 7 dias para reembolso. A versao gratuita via extensao Chrome e particularmente atrativa para testes e uso pessoal, enquanto o plano Nuvem e voltado para empresas que precisam de escala, API e integracoes avancadas.'))

# === SEC 7 ===
story.append(H1('7. Analise Competitiva'))
story.append(P('O BotPlugin atua em um mercado competitivo de plataformas de chatbot para WhatsApp, com varios concorrentes diretos e indiretos. A analise abaixo posiciona o BotPlugin em relacao aos principais players e, criticamente, identifica como o ZEHLA pode se diferenciar neste cenario.'))

story.append(T(
    ['Plataforma','Tipo','Foco','IA Integrada','Preco','Diferencial ZEHLA'],
    [
        ['BotPlugin','Builder Visual','WhatsApp/Instagram','ChatGPT (bloco)','Gratis a R$ 180/mes','Simplicidade + Chrome Extension'],
        ['BotConversa','Builder Visual','WhatsApp','IA propria','A partir R$ 195/mes','Market share + cases'],
        ['Typebot','Builder Open-Source','Multi-canal','Multi-IA','Self-hosted gratis','Open source + flexibilidade'],
        ['ManyChat','Builder Visual','Instagram + WhatsApp','GPT integrado','A partir $15/mes','Forte no Instagram'],
        ['ZapResponder','SaaS','WhatsApp','IA generica','Planos variados','Bulk sending + CRM'],
        ['ZEHLA (proposto)','Builder + ML','WhatsApp','Fine-tuned por pousada','A ser definido','ML continuo + Voice Cloning'],
    ],
    [0.13, 0.12, 0.14, 0.14, 0.13, 0.34]
))
story.append(Spacer(1,6))
story.append(P('Tabela 7: Analise competitiva - BotPlugin e mercado',cap))

# === SEC 8 ===
story.append(H1('8. Blueprint de Adaptacao para o ZEHLA'))
story.append(P('Esta secao e o nucleo do documento: uma proposta concreta de como adaptar os conceitos, funcionalidades e workflows do BotPlugin para o ecossistema ZEHLA, evoluindo cada conceito com as capacidades unicas do ML Brain e do DNA Wizard que ja foram desenvolvidas nos blueprints anteriores.'))

story.append(H2('8.1 ZEHLA Flow Builder: O Visual Workflow Engine'))
story.append(P('O ZEHLA deve implementar um <b>Flow Builder</b> inspirado no sistema de blocos do BotPlugin, mas com diferenciacoes criticas. O conceito e o mesmo: blocos visuais conectados em um canvas para criar fluxos de atendimento. Porem, o ZEHLA Flow Builder sera nativamente "inteligente", ou seja, cada bloco ja vem pre-carregado com o contexto da pousada (Voice Profile, Discount Keys, Insights Engine) e as decisoes do fluxo sao informadas por dados reais de ML.'))
story.append(P('Abaixo, a proposta de blocos do ZEHLA Flow Builder com a evolucao em relacao aos blocos equivalentes do BotPlugin:'))

story.append(T(
    ['Bloco ZEHLA','Insp. BotPlugin','Evolucao ML','Descricao'],
    [
        ['Mensagem Inteligente','Mensagem','Voice Profile injection','Envia mensagem usando tom e vocabulario extraidos do Voice Fingerprinting da pousada.'],
        ['Menu Smart','Menu','Insights de opcoes mais clicadas','Apresenta menu com opcoes priorizadas pelos insights de conversao (opcoes que mais convertem primeiro).'],
        ['Pergunta com NLP','Perguntas','Intent classification','Captura resposta com classificacao automatica de intencao, eliminando necessidade de respostas exatas.'],
        ['Recomendacao IA','IA GPT','RAG + Voice Profile','Bloco GPT potencializado com RAG (busca em historico de sucesso) e tom personalizado.'],
        ['Condicao Data-Driven','Condicao','ML-based routing','Ramifica com base em predicoes de ML (probabilidade de conversao, perfil do lead).'],
        ['Negociacao Autonoma','N/A','Discount Keys','Bloco exclusivo ZEHLA que negocia descontos automaticamente respeitando as 6 chaves configuradas.'],
        ['Recuperacao Inteligente','N/A','Recovery patterns','Identifica leads parados e dispara padroes de recuperacao baseados em historico de sucesso.'],
        ['Agendamento Sync','Agendamento','Calendar integration','Agendamento com integracao bidirecional ao sistema de reservas da pousada.'],
        ['Webhook Custom','Webhook','Pre-built templates','Webhook com templates pre-construidos para Booking.com, Airbnb, Omie, etc.'],
        ['Handoff Humano','N/A','Tone alignment check','Transferencia para atendente com alerta de tom e recomendacao de resposta.'],
    ],
    [0.16, 0.12, 0.20, 0.52]
))
story.append(Spacer(1,6))
story.append(P('Tabela 8: Blocos do ZEHLA Flow Builder com evolucao ML',cap))

story.append(H2('8.2 Prompt-to-Flow com DNA Pre-Load'))
story.append(P('A funcionalidade mais inovadora do BotPlugin (criar fluxos a partir de descricao em linguagem natural) deve ser reproduzida no ZEHLA com uma evolucao significativa: o <b>DNA Pre-Load</b>. Quando o usuario descrever seu fluxo (ex: "Crie um bot que atenda hospedes perguntando datas, mostre quartos disponiveis e tente fechar a reserva"), o sistema nao apenas gerara o fluxo visual, mas ja o preenchera com: (1) mensagens no tom de voz da pousada (via Voice Profile), (2) estrategias de negociacao (via Discount Keys), (3) imagens e conteudo da pousada (via CMS integrado), e (4) insights de horarios e palavras-gatilho (via Insights Engine).'))
story.append(P('O resultado e que o fluxo gerado ja estara "vivo" desde o primeiro minuto, sem necessidade de configuracao manual extensa. O dono da pousada pode simplesmente digitar o que deseja, revisar o fluxo gerado pela IA, fazer ajustes finos e ativar. Esta abordagem reduz drasticamente a barreira de entrada e e o principal diferencial competitivo do ZEHLA em relacao ao BotPlugin e demais concorrentes.'))

story.append(H2('8.3 Chrome Extension ZEHLA'))
story.append(P('A extensao Chrome e um pilar importante da estrategia de distribuicao do BotPlugin, pois permite ao usuario comecar a usar a ferramenta sem configuracoes complexas. O ZEHLA pode replicar este conceito com a <b>ZEHLA Chrome Extension</b>, que oferece as funcionalidades da plataforma diretamente no WhatsApp Web. A extensao pode incluir: automacao de conversas com o agente IA da pousada, CRM visual com tags e notas, analytics em tempo real (leads recebidos, reservas feitas, taxa de conversao), e notificacoes de alertas (lead quente, follow-up pendente, drift detectado). A extensao servira como porta de entrada para a plataforma completa, convertendo usuarios gratuitos em pagos.'))

story.append(H2('8.4 Workflows Pre-Construidos para Pousadas'))
story.append(P('Enquanto o BotPlugin exige que o usuario construa seus fluxos do zero (ou use a IA para gerar), o ZEHLA pode oferecer uma biblioteca de <b>Workflows Pre-Construidos</b> especificos para o segmento de hospedagem. Cada workflow e um template completo, ja preenchido com blocos configurados, mensagens no tom adequado e integracoes prontas. O dono da pousada escolhe o template, personaliza os detalhes (nome da pousada, quartos, precos) e ativa em minutos.'))
story.append(P('A biblioteca deve incluir no minimo 8 templates: (1) Recepcao Virtual Completa, (2) Reserva com Verificacao de Disponibilidade, (3) Sequencia de Nutricao de Leads (7 dias), (4) Check-in e Check-out Automatizado, (5) Recomendacao de Experiencias Locais, (6) Recovery de Cancelamentos, (7) Pos-Checkout com Pedido de Avaliacao, e (8) Promocoes Sazonais com Urgencia Inteligente. Cada template deve ser editavel e totalmente customizavel via Flow Builder.'))

# === SEC 9 ===
story.append(H1('9. Matriz de Adaptacao Tecnica'))
story.append(P('Esta secao apresenta a traducao tecnica direta de cada funcionalidade do BotPlugin para a stack do ZEHLA (Next.js 16+, Tailwind CSS 4, Prisma ORM, PostgreSQL, Redis, BullMQ), identificando os componentes, tabelas, APIs e services necessarios para implementacao.'))

story.append(T(
    ['Feature BotPlugin','Componente ZEHLA','Tech Stack','Prioridade'],
    [
        ['Canvas Drag-and-Drop','FlowBuilder (ReactFlow)','@xyflow/react + DnD Kit','Fase 1'],
        ['Bloco Mensagem','MessageBlock component','LLM Router + Voice Profile','Fase 1'],
        ['Bloco Menu','MenuBlock component','Insights Engine DB','Fase 1'],
        ['Bloco Perguntas','QuestionBlock + NLP','Zod schemas + Intent classifier','Fase 1'],
        ['Bloco IA GPT','GPTBlock component','OpenAI API + RAG Pipeline','Fase 1'],
        ['Bloco Condicao','ConditionBlock component','Prisma queries + ML predictions','Fase 1'],
        ['Bloco Webhook','WebhookBlock component','BullMQ + HTTP client','Fase 2'],
        ['Bloco Agendamento','SchedulingBlock','Google Calendar API','Fase 2'],
        ['Prompt-to-Flow','FlowGeneratorService','OpenAI GPT-4o + JSON schema','Fase 2'],
        ['Chrome Extension','ZEHLA Extension','Chrome Extension Manifest V3','Fase 3'],
        ['Dashboard Analytics','CognitiveObservability','Prisma + Grafana','Fase 2'],
        ['CRM Integrado','ContactManager','Prisma (Contact, Tag, Note)','Fase 2'],
        ['Templates de Workflow','WorkflowTemplates','JSON schemas + CMS','Fase 2'],
    ],
    [0.18, 0.18, 0.32, 0.12]
))
story.append(Spacer(1,6))
story.append(P('Tabela 9: Matriz de adaptacao tecnica BotPlugin para ZEHLA',cap))

# === SEC 10 ===
story.append(H1('10. Roadmap de Implementacao'))

story.append(T(
    ['Fase','Semanas','Entregavel','Criterio de Aceitacao'],
    [
        ['Fase 1: Core Builder','1-6','Flow Builder visual com 6 blocos core','Usuario cria fluxo funcional sem codigo'],
        ['Fase 2: IA Integration','7-10','Blocos GPT + RAG + Prompt-to-Flow','Fluxo gerado por descricao em PT-BR'],
        ['Fase 3: Templates','11-14','8 templates para pousadas pre-construidos','Template ativado e convertendo em < 5 min'],
        ['Fase 4: Extension','15-18','Chrome Extension com bot + CRM','Automacao funcional no WhatsApp Web'],
        ['Fase 5: Advanced','19-24','Workflows avancados + analytics completo','Dashboard com 6 metricas em real-time'],
    ],
    [0.18, 0.10, 0.38, 0.34]
))
story.append(Spacer(1,6))
story.append(P('Tabela 10: Roadmap de implementacao do ZEHLA Flow Builder',cap))

story.append(H2('10.1 Fase 1: Core Builder (Semanas 1-6)'))
story.append(B('<b>Semana 1-2:</b> Setup do ReactFlow canvas, implementacao do drag-and-drop, renderizacao basica de blocos (mensagem, menu, condicao). Criacao do schema de Workflow no Prisma (nodes, edges, metadata).'))
story.append(B('<b>Semana 3-4:</b> Implementacao dos blocos core (mensagem com Voice Profile injection, menu com Insights prioritizacao, perguntas com captura de variaveis, condicao com logica de ramificacao). Integracao com o LLM Router existente para respostas inteligentes.'))
story.append(B('<b>Semana 5-6:</b> UI de edicao de blocos (painel lateral com propriedades), sistema de salvamento de fluxos, preview de execucao, deploy de fluxo ativo. Testes com 3 pousadas piloto.'))

story.append(H2('10.2 Fase 2: IA Integration (Semanas 7-10)'))
story.append(B('<b>Semana 7-8:</b> Bloco GPT integrado com RAG Pipeline (busca em historico de sucesso antes de gerar resposta). Bloco de Perguntas com NLP intent classification (classifica a resposta do usuario em categorias pre-definidas).'))
story.append(B('<b>Semana 9-10:</b> Prompt-to-Flow: servico que recebe descricao em linguagem natural, gera fluxo JSON via GPT-4o, e renderiza no canvas. Ajustes finos de prompt engineering para PT-BR. Testes de qualidade com 20 descricoes diferentes.'))

story.append(H2('10.3 Fase 3: Templates (Semanas 11-14)'))
story.append(B('<b>Semana 11-12:</b> Criacao dos 8 templates pre-construidos para pousadas (Recepcao Virtual, Reserva, Nutricao, Check-in, Recomendacao, Recovery, Pos-Checkout, Promocoes). Cada template inclui blocos, mensagens, imagens placeholder e configuracoes de IA.'))
story.append(B('<b>Semana 13-14:</b> Sistema de onboarding com selecao de template (wizard de 5 passos). Personalizacao rapida (nome, quartos, precos, imagens). Deploy em um clique. Testes de conversao com templates vs fluxos custom.'))

story.append(H2('10.4 Fase 4: Extension (Semanas 15-18)'))
story.append(B('<b>Semana 15-16:</b> Chrome Extension Manifest V3, content script para WhatsApp Web, sidebar com bot ativo (mini dashboard), integracao com a API ZEHLA para sincronizacao de fluxos.'))
story.append(B('<b>Semana 17-18:</b> CRM integrado no WhatsApp Web (tags, notas, segmentacao), analytics in-extension (leads recebidos, reservas feitas), notificacoes de alertas (lead quente, follow-up pendente). Publish no Chrome Web Store.'))

story.append(H2('10.5 Fase 5: Advanced (Semanas 19-24)'))
story.append(B('<b>Semana 19-20:</b> Workflows avancados (nutricao multi-step com delay condicional, recovery com ML prediction, A/B testing de fluxos). Bloco de Negociacao Autonoma com Discount Keys. Bloco de Recuperacao Inteligente com padroes de ML.'))
story.append(B('<b>Semana 21-22:</b> Dashboard completo de analytics (CognitiveObservability expandido com metricas de fluxo: taxa de conclusao, gargalos, drop-off por bloco). Graficos interativos com drill-down.'))
story.append(B('<b>Semana 23-24:</b> Sistema de versao de fluxos (versionamento e rollback), collaborative editing (multi-usuarios), exportacao/importacao de fluxos, testes de stress, audit de seguranca, documentacao de producao.'))

doc.multiBuild(story)
print("PDF body generated successfully!")
