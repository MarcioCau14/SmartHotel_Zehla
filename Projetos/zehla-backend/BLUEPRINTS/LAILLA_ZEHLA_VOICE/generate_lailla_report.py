#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lailla.io - Analise Completa e Mapa de Adaptacao para o ZEHLA
Documento gerado automaticamente para o ecossistema ZEHLA/SMARTHOTEL
"""

import os
import sys
import hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, CondPageBreak, Image
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━ Color Palette ━━
ACCENT = colors.HexColor('#c83c54')
TEXT_PRIMARY = colors.HexColor('#1f1e1c')
TEXT_MUTED = colors.HexColor('#89867d')
BG_SURFACE = colors.HexColor('#e7e5e1')
BG_PAGE = colors.HexColor('#edece8')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT = colors.white
TABLE_ROW_EVEN = colors.white
TABLE_ROW_ODD = BG_SURFACE

# ━━ Font Registration ━━
# NotoSansSC variable font not supported by ReportLab, using SarasaMonoSC for CJK fallback
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC-Bold', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/chinese/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito-Bold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))

registerFontFamily('Carlito', normal='Carlito', bold='Carlito-Bold')
registerFontFamily('LiberationSans', normal='LiberationSans', bold='LiberationSans')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans-Bold')
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSC-Bold')

# ━━ Page Setup ━━
PAGE_W, PAGE_H = A4
LEFT_M = 1.8 * cm
RIGHT_M = 1.8 * cm
TOP_M = 2.0 * cm
BOT_M = 2.0 * cm
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

# ━━ Styles ━━
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    name='DocTitle', fontName='Carlito', fontSize=26, leading=32,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=6
)
h1_style = ParagraphStyle(
    name='H1', fontName='Carlito', fontSize=18, leading=24,
    textColor=ACCENT, alignment=TA_LEFT, spaceBefore=18, spaceAfter=10
)
h2_style = ParagraphStyle(
    name='H2', fontName='Carlito', fontSize=14, leading=20,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceBefore=14, spaceAfter=8
)
h3_style = ParagraphStyle(
    name='H3', fontName='Carlito', fontSize=12, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceBefore=10, spaceAfter=6
)
body_style = ParagraphStyle(
    name='Body', fontName='Carlito', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=6
)
body_indent = ParagraphStyle(
    name='BodyIndent', fontName='Carlito', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=6, leftIndent=20
)
bullet_style = ParagraphStyle(
    name='Bullet', fontName='Carlito', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=4,
    leftIndent=20, bulletIndent=8
)
caption_style = ParagraphStyle(
    name='Caption', fontName='Carlito', fontSize=9, leading=13,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=3, spaceAfter=6
)
quote_style = ParagraphStyle(
    name='Quote', fontName='Carlito', fontSize=10, leading=16,
    textColor=TEXT_MUTED, alignment=TA_LEFT, spaceAfter=8,
    leftIndent=24, borderLeftWidth=3, borderLeftColor=ACCENT,
    borderPadding=8
)
header_cell = ParagraphStyle(
    name='HeaderCell', fontName='Carlito', fontSize=10,
    textColor=colors.white, alignment=TA_CENTER, leading=14
)
cell = ParagraphStyle(
    name='Cell', fontName='Carlito', fontSize=9.5,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, leading=14
)
cell_center = ParagraphStyle(
    name='CellCenter', fontName='Carlito', fontSize=9.5,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER, leading=14
)

# ━━ TOC Template ━━
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def make_table(headers, rows, col_ratios=None):
    """Create a styled table with Paragraph-wrapped cells."""
    if col_ratios is None:
        col_ratios = [1.0 / len(headers)] * len(headers)
    col_widths = [r * CONTENT_W for r in col_ratios]

    data = [[Paragraph('<b>%s</b>' % h, header_cell) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), cell) for c in row])

    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t


# ━━ BUILD DOCUMENT ━━
OUTPUT = '/home/z/my-project/download/ZEHLA_Analise_Lailla_io.pdf'
doc = TocDocTemplate(
    OUTPUT, pagesize=A4,
    leftMargin=LEFT_M, rightMargin=RIGHT_M,
    topMargin=TOP_M, bottomMargin=BOT_M,
    title='Analise Lailla.io - Mapa de Adaptacao ZEHLA',
    author='ZEHLA Intelligence',
    subject='Analise competitiva e mapa de adaptacao da plataforma Lailla.io para o ecossistema ZEHLA/SMARTHOTEL'
)

story = []

# ── TOC ──
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle(name='TOC1', fontName='Carlito', fontSize=12, leftIndent=20, leading=20, spaceBefore=6),
    ParagraphStyle(name='TOC2', fontName='Carlito', fontSize=10.5, leftIndent=40, leading=18, spaceBefore=3),
]
story.append(Paragraph('<b>Sumario</b>', title_style))
story.append(Spacer(1, 12))
story.append(toc)
story.append(PageBreak())

# ════════════════════════════════════════════════════════════════
# 1. VISAO GERAL DA PLATAFORMA
# ════════════════════════════════════════════════════════════════
story.append(add_heading('<b>1. Visao Geral da Lailla.io</b>', h1_style, 0))

story.append(Paragraph(
    'A Lailla.io e uma plataforma SaaS brasileira de atendimento automatizado via WhatsApp, '
    'fundada com a proposta de transformar a maneira como empresas interagem com seus clientes '
    'no canal de comunicacao mais utilizado do Brasil. Sua tagline oficial, "da conversa a conversao", '
    'reflete com precisao a proposta de valor central: nao apenas responder mensagens, mas '
    'transformar cada interacao em uma oportunidade concreta de venda ou retencao.',
    body_style))

story.append(Paragraph(
    'A plataforma foi construida sobre o principio de que qualquer empresa, independentemente '
    'do porte ou conhecimento tecnico, deve ser capaz de implementar um agente de inteligencia '
    'artificial funcional no WhatsApp em menos de 11 minutos. Essa promessa e alcancada atraves '
    'de uma interface no-code onde o usuario configura seu agente, carrega sua base de conhecimento, '
    'clona sua voz (opcional) e conecta o WhatsApp via QR Code simples, sem necessidade de APIs '
    'complexas ou integracoes de terceiros para o funcionamento basico.',
    body_style))

story.append(Paragraph(
    'A Lailla e operada pela LAILLA LTDA, empresa registrada sob o CNPJ 53.009.679/0001-46, '
    'com sede em Sao Jose, Santa Catarina. O suporte ao cliente opera de segunda a sexta das '
    '08h as 18h e aos sabados das 08h as 12h, com atendimento via e-mail (suporte@lailla.io) '
    'e WhatsApp. A empresa se posiciona como solucao de Business Intelligence voltada para '
    'micro, pequenas e medias empresas brasileiras que buscam escalar operacoes de vendas e '
    'atendimento sem aumentar proporcionalmente a equipe humana.',
    body_style))

story.append(add_heading('<b>1.1 Posicionamento no Mercado</b>', h2_style, 1))

story.append(Paragraph(
    'A Lailla ocupa o segmento de plataformas de automacao conversacional com IA para WhatsApp. '
    'Seu diferencial competitivo reside na combinacao de tres pilares tecnologicos que poucas '
    'plataformas concorrentes oferecem de forma integrada: clonagem de voz com fidelidade para '
    'respostas em audio, escuta ativa (capacidade de processar audios recebidos dos clientes e '
    'responder de forma contextualizada), e a parceria oficial com a OpenAI que dispensa o '
    'usuario de configurar chaves de API ou gerenciar contas separadas na provedora de IA.',
    body_style))

story.append(Paragraph(
    'Enquanto concorrentes como Gallabox, Typebot e Chatwoot focam primariamente em chatbots '
    'baseados em texto com fluxos pre-definidos, a Lailla avancou ao integrar resposta vocal '
    'sintetizada, qualificacao automatica de leads via IA generativa, e um sistema de disparo '
    'em massa com randomizador de numeros que visa mitigar o risco de bloqueios pelo WhatsApp. '
    'O modelo de precos baseado em tokens (e nao em mensagens enviadas) tambem se diferencia, '
    'permitindo que empresas com alto volume de interacoes tenham previsibilidade de custo.',
    body_style))

# ════════════════════════════════════════════════════════════════
# 2. FUNCIONALIDADES CORE
# ════════════════════════════════════════════════════════════════
story.append(add_heading('<b>2. Funcionalidades Core</b>', h1_style, 0))

story.append(Paragraph(
    'A plataforma oferece um conjunto abrangente de funcionalidades que cobre todo o ciclo '
    'de vida do atendimento ao cliente via WhatsApp, desde a captacao inicial ate a recuperacao '
    'pos-venda. Cada funcionalidade foi projetada para operar de forma autonoma, com minimas '
    'necessidades de intervencao humana, mantendo porem a possibilidade de takeover manual '
    'quando situaes complexas exigem decisao humana.',
    body_style))

story.append(add_heading('<b>2.1 Agentes de Conversa com IA</b>', h2_style, 1))

story.append(Paragraph(
    'O recurso central da Lailla sao os Agentes de Conversa, entidades de IA configuraveis que '
    'operam diretamente no WhatsApp do cliente. Cada agente pode ser treinado com instrucoes '
    'especificas, personalidade da marca, base de conhecimento propria e objetivos definidos. '
    'A plataforma suporta multiplos agentes trabalhando simultaneamente, cada um responsavel '
    'por uma etapa diferente do funil de vendas ou por segmentos distintos de clientes.',
    body_style))

story.append(Paragraph(
    'A configuracao do agente e guiada por um assistente interno que solicita ao usuario '
    'informacoes sobre o negocio, tom de comunicacao desejado, politicas da empresa, produtos '
    'e servicos oferecidos, e objetivos comerciais. Com base nessas informacoes, o sistema '
    'gera automaticamente o prompt do agente e o disponibiliza para edicao fina pelo usuario. '
    'Nao e necessario conhecimento em prompt engineering para obter resultados funcionais, '
    'embora a edicao avancada seja possivel para usuarios tecnicos.',
    body_style))

# Table: Agent Types
story.append(Spacer(1, 12))
story.append(make_table(
    ['Tipo de Agente', 'Funcao Principal', 'Exemplo de Acao'],
    [
        ['SDR - Qualificacao', 'Perguntas certas, filtro de fit e intencao de compra', 'Identifica se o lead tem perfil para o produto e qualifica antes de encaminhar'],
        ['Agendador', 'Marca no calendario e envia lembretes automaticos', 'Agenda demonstracao e envia lembrete no dia, reduzindo no-show'],
        ['Pos-venda / Nutricao', 'Acompanha, educa e empurra para proxima compra', 'Envia dicas de uso e ofertas complementares 7 dias apos a compra'],
        ['Recuperacao de Pagamento', 'Busca PIX, boletos e carrinhos abandonados', 'Identifica carrinho abandonado e envia proposta personalizada'],
        ['Vendedor IA', 'Atendimento completo de vendas com fechamento', 'Apresenta produto, tira duvidas e conduz ao checkout'],
    ],
    [0.20, 0.35, 0.45]
))
story.append(Paragraph('Tabela 1: Tipos de agentes pre-configurados disponiveis na Lailla', caption_style))

story.append(add_heading('<b>2.2 Clonagem de Voz (Voice Studio)</b>', h2_style, 1))

story.append(Paragraph(
    'O Voice Studio e uma das funcionalidades mais distintivas da Lailla. Ele permite ao '
    'usuario clonar sua propria voz (ou a de qualquer membro autorizado da equipe) para que '
    'o agente de IA envie mensagens em audio no WhatsApp usando a voz sintetizada. O processo '
    'de clonagem exige apenas que o usuario grave um audio de amostra, sem necessidade de '
    'software externo ou equipamentos especializados. A plataforma processa a amostra e gera '
    'um modelo vocal capaz de sintetizar novas frases com a voz do usuario, incluindo a '
    'reproducao de sotaques regionais.',
    body_style))

story.append(Paragraph(
    'Do ponto de vista tecnico, a clonagem de voz opera com um modelo de contagem de tokens '
    'onde cada caractere da resposta gerada em audio consome 1 token de voz. Isso significa '
    'que uma resposta de 27 caracteres (como "Seu pedido chega amanha!") consumiria exatamente '
    '27 tokens de voz. Os planos variam de 30.000 tokens (Plano Black) ate 1.000.000 de tokens '
    '(Plano Pro), com a possibilidade de contratar pacotes adicionais. A qualidade da voz '
    'sintetizada depende diretamente da qualidade e quantidade das amostras de audio fornecidas, '
    'e fatores ambientais como ruido de fundo podem afetar o resultado final.',
    body_style))

story.append(Paragraph(
    'Essa funcionalidade e particularmente relevante para o segmento de pousadas e hoteis '
    '(alvo do SMARTHOTEL), pois permite humanizar drasticamente o atendimento automatizado. '
    'Em vez de receber uma resposta de texto generica, o hospede ouve a voz do proprietario '
    'da pousada desejando boas-vindas, confirmando reserva ou fornecendo orientacoes locais. '
    'O impacto emocional dessa personalizacao e significativamente maior na decisao de compra '
    'e na fidelizacao do cliente.',
    body_style))

story.append(add_heading('<b>2.3 Escuta Ativa (Active Listening)</b>', h2_style, 1))

story.append(Paragraph(
    'A Escuta Ativa e a capacidade do agente Lailla de processar audios recebidos dos clientes '
    'no WhatsApp e gerar respostas contextualizadas com base no conteudo desses audios. Isso '
    'possibilita conversas 100% automatizadas em audio, onde o cliente fala e o agente responde '
    'tanto por texto quanto por audio (se a clonagem de voz estiver ativa), criando uma experiencia '
    'que simula uma conversa humana real.',
    body_style))

story.append(Paragraph(
    'A arquitetura tecnica da Escuta Ativa combina tres camadas de processamento: primeiramente, '
    'o audio recebido e transcrito para texto via Speech-to-Text (ASR); em seguida, o texto '
    'transcrito e processado pelo motor de IA (GPT) para compreensao da intencao e geracao '
    'da resposta; finalmente, se a resposta deve ser em audio, o texto gerado e convertido '
    'em voz sintetizada via Text-to-Speech (TTS) utilizando o modelo vocal clonado do usuario. '
    'Todo esse pipeline ocorre em questao de segundos, proporcionando uma experiencia fluida '
    'que nao revela ao cliente que esta interagindo com uma IA.',
    body_style))

story.append(Paragraph(
    'Para o ZEHLA, essa funcionalidade traduz-se na possibilidade de receber mensagens de voz '
    'de hospedes perguntando sobre disponibilidade, precos ou servicos, e responder automaticamente '
    'com informacoes precisas extraidas da base de conhecimento do estabelecimento, seja por texto '
    'ou pelo audio clonado do proprietario. A integracao com o ML Brain Protocol do ZEHLA pode '
    'potencializar essa capacidade ao adicionar camadas de compreensao contextual especificas '
    'do segmento hoteleiro, como reconhecimento de terminologia local e costumes regionais.',
    body_style))

story.append(add_heading('<b>2.4 Disparo em Massa com Randomizador</b>', h2_style, 1))

story.append(Paragraph(
    'O sistema de Disparo em Massa da Lailla permite enviar mensagens para listas de contatos '
    'de forma automatizada, com um diferencial critico: o Randomizador de WhatsApp. Essa '
    'funcionalidade distribui automaticamente os envios entre multiplos numeros de WhatsApp '
    'conectados, reduzindo significativamente o risco de bloqueios por parte do Meta/WhatsApp. '
    'O sistema opera com logica de round-robin inteligente que considera fatores como volume '
    'de envios recentes por numero, horarios de pico e historico de bloqueios.',
    body_style))

story.append(Paragraph(
    'Essa funcionalidade esta disponivel em todos os planos e pode ser utilizada para campanhas '
    'de marketing, recuperacao de leads inativos, lembretes de reserva, comunicacoes sazonais '
    'e qualquer outro cenario que requeira comunicacao em volume. Os contatos sao ilimitados '
    'em todos os planos, e o disparo suporta personalizacao por variaveis (nome do destinatario, '
    'produto de interesse, data de ultima interacao, entre outras).',
    body_style))

story.append(Paragraph(
    'Para o ZEHLA, o randomizador e especialmente valioso no contexto do SMARTHOTEL, onde '
    'campanhas sazonais (como feriados, Carnival, Reveillon) demandam comunicacao com centenas '
    'ou milhares de hospedes anteriores. A integracao com o LIS (Lead Intelligence System) '
    'do ZEHLA pode segmentar automaticamente os contatos por perfil, probabilidade de conversao '
    'e historico de interacoes, direcionando os disparos de forma otimizada e personalizada.',
    body_style))

story.append(add_heading('<b>2.5 Demais Funcionalidades</b>', h2_style, 1))

story.append(make_table(
    ['Funcionalidade', 'Descricao'],
    [
        ['Chat ao Vivo', 'Sistema de takeover manual onde um atendente humano assume a conversa do agente IA em tempo real, sem interrupcao para o cliente'],
        ['Board de Etiquetas', 'Quadro Kanban para organizacao visual de contatos por estagio do funil (novo lead, qualificado, agendado, cliente, etc.)'],
        ['Painel de Vendas', 'Dashboard com metricas de performance: conversoes por agente, ticket medio, tempo medio de atendimento, taxa de resposta automatica'],
        ['Workspaces', 'Ambientes isolados para gerenciar multiplos projetos ou empresas dentro de uma mesma conta, com equipes e configuracoes independentes'],
        ['Integracao CRM', 'Conexao com qualquer CRM que possua API aberta para atualizacao automatica de leads, registros de interacao e sincronizacao de dados'],
        ['Atendentes Ilimitados', 'Cadastro de membros da equipe com niveis de permissao diferenciados (admin, operador, visualizador), sem limite por plano'],
        ['Contatos Ilimitados', 'Base de contatos sem teto, com importacao via Google Contacts API e organizacao por etiquetas e segmentos personalizados'],
        ['Integracao com Agenda', 'Conexao com calendarios externos (Google Calendar, Calendly) para agendamento automatico de reunioes e reservas pelo agente IA'],
    ],
    [0.28, 0.72]
))
story.append(Paragraph('Tabela 2: Funcionalidades adicionais da plataforma Lailla', caption_style))

# ════════════════════════════════════════════════════════════════
# 3. IA E STACK TECNOLOGICO
# ════════════════════════════════════════════════════════════════
story.append(add_heading('<b>3. Arquitetura de IA e Stack Tecnologico</b>', h1_style, 0))

story.append(Paragraph(
    'A Lailla opera com uma arquitetura de IA multicamada que combina modelos de linguagem '
    'para geracao de texto, modelos de sintese de voz para resposta em audio, e modelos de '
    'reconhecimento de fala para processamento de audios recebidos. A integracao entre essas '
    'camadas e gerenciada internamente pela plataforma, de forma que o usuario final nao '
    'precisa configurar ou gerenciar conexoes com provedores de IA individuais.',
    body_style))

story.append(add_heading('<b>3.1 Modelos de IA Utilizados</b>', h2_style, 1))

story.append(make_table(
    ['Camada de IA', 'Tecnologia Provavel', 'Funcao no Pipeline', 'Tokenizacao'],
    [
        ['GPT (Texto)', 'OpenAI GPT-4o / GPT-4o-mini', 'Geracao de respostas textuais, compreensao de intencao, qualificacao de leads, tom de comunicacao', 'Somente output (resposta gerada) e contabilizado'],
        ['Voice Cloning (TTS)', 'Modelo proprietario ou ElevenLabs/TTS OpenAI', 'Sintese de voz clonada a partir de amostras do usuario, geracao de audios para WhatsApp', '1 caractere = 1 token de voz'],
        ['Active Listen (ASR)', 'Whisper (OpenAI) ou similar', 'Transcricao de audios recebidos dos clientes para processamento pelo motor GPT', 'Audio do cliente NAO consome tokens'],
        ['NLU / Intent Detection', 'Embeddings + classificacao via GPT', 'Identificacao automatica da intencao do cliente e roteamento para o fluxo adequado', 'Incluido nos tokens GPT'],
    ],
    [0.15, 0.22, 0.40, 0.23]
))
story.append(Paragraph('Tabela 3: Camadas de IA e tecnologias provaveis utilizadas pela Lailla', caption_style))

story.append(add_heading('<b>3.2 Parceria com a OpenAI</b>', h2_style, 1))

story.append(Paragraph(
    'Um diferencial estrategico significativo da Lailla e sua parceria oficial com a OpenAI. '
    'Isso significa que o usuario nao precisa criar uma conta na OpenAI, gerenciar chaves de API, '
    'configurar billing ou monitorar consumos em plataformas separadas. Todo o gerenciamento de '
    'tokens GPT e de voz e feito internamente pela Lailla, com relatorios de uso consolidados '
    'no painel da plataforma. Essa simplificacao e fundamental para o publico-alvo da ferramenta '
    '(micro e pequenas empresas), que tipicamente nao possui conhecimento tecnico para gerenciar '
    'integracoes com APIs de IA.',
    body_style))

story.append(Paragraph(
    'O modelo de contabilizacao de tokens merece atencao especial: apenas os tokens de output '
    '(a resposta gerada pela IA) sao cobrados do usuario. O que o cliente escreve ou envia '
    'como audio nao e contabilizado. Cada token representa, em media, 4 caracteres ou 0,75 '
    'palavras no caso de texto. Para audio, a proporcao e de 1 caractere por token. Os planos '
    'oferecem de 3 milhoes (Black) ate 15 milhoes (Pro) de tokens GPT mensais, com pacotes '
    'adicionais disponiveis para compra sob demanda.',
    body_style))

story.append(add_heading('<b>3.3 Arquitetura Tecnica Inferida</b>', h2_style, 1))

story.append(Paragraph(
    'Baseado na analise do site, documentacao e comportamento da plataforma, e possivel inferir '
    'a seguinte arquitetura tecnologica. O frontend e uma Single Page Application (SPA) construida '
    'provavelmente com React ou Next.js, utilizando Tailwind CSS para estilizacao e Elementor/WordPress '
    'para o site institucional (lailla.com.br). O backend opera com API RESTful que gerencia a '
    'comunicacao entre o frontend, os modelos de IA e a API do WhatsApp.',
    body_style))

story.append(Paragraph(
    'A conexao com o WhatsApp e realizada via QR Code, sugerindo o uso de bibliotecas como '
    'Baileys, Venom-Bot ou API Oficial do Meta, com a API Oficial sendo promovida em seus '
    'materiais de marketing recentes. O sistema de tokenizacao e billing e gerenciado por '
    'um middleware proprio que rastreia consumo em tempo real e aplica limites por plano. '
    'A plataforma suporta mais de 250 integracoes nativas via API aberta, incluindo CRM, '
    'sistemas de agenda, gateways de pagamento e plataformas de e-commerce.',
    body_style))

story.append(make_table(
    ['Componente', 'Tecnologia Provavel', 'Observacao'],
    [
        ['Frontend App', 'React / Next.js + Tailwind CSS', 'SPA com carregamento dinamico, interface no-code'],
        ['Site Institucional', 'WordPress + Elementor + LiteSpeed', 'lailla.com.br com cache agressivo e Cloudflare'],
        ['Backend API', 'Node.js ou Python (FastAPI/Django)', 'RESTful com WebSocket para chat ao vivo'],
        ['WhatsApp', 'API Oficial Meta ou Baileys', 'QR Code para conexao, API Oficial promovida recentemente'],
        ['IA - Texto', 'OpenAI GPT-4o (parceria oficial)', 'Tokens gerenciados pela Lailla, sem necessidade de API key'],
        ['IA - Voz (TTS)', 'Modelo proprietario ou ElevenLabs', 'Clonagem de voz com suporte a sotaques regionais'],
        ['IA - Audio (ASR)', 'Whisper (OpenAI)', 'Transcricao de audios recebidos para processamento'],
        ['Database', 'PostgreSQL ou MongoDB', 'Armazenamento de contatos, conversas, configuracoes'],
        ['Analytics', 'Google Analytics 4 + Microsoft Clarity', 'Tagging: GTM-N69RGCZL, G-78BYZMDY57, Clarity k2qs66eyfb'],
        ['Infra', 'Cloud (provavel AWS ou GCP)', 'Escalabilidade horizontal para suportar multiplos tenants'],
    ],
    [0.18, 0.32, 0.50]
))
story.append(Paragraph('Tabela 4: Arquitetura tecnologica inferida da Lailla.io', caption_style))

# ════════════════════════════════════════════════════════════════
# 4. PLANOS E PRECOS
# ════════════════════════════════════════════════════════════════
story.append(add_heading('<b>4. Planos, Precos e Modelo de Consumo</b>', h1_style, 0))

story.append(Paragraph(
    'A Lailla adota um modelo de precos baseado em assinatura mensal com franquia de tokens, '
    'com planos escalando em recursos e capacidade. O diferencial esta na contabilizacao por '
    'tokens (unidade de processamento de IA) e nao por volume de mensagens, permitindo que '
    'empresas com conversas longas tenham custo proporcional ao uso efetivo da IA.',
    body_style))

story.append(add_heading('<b>4.1 Tabela de Planos</b>', h2_style, 1))

story.append(make_table(
    ['Recurso', 'Black (R$197,90/mes)', 'Light (R$197,90/mes)', 'Essentials (R$697,90/mes)', 'Pro (R$1.497,90/mes)'],
    [
        ['Mensagens', 'Ilimitadas', 'Ilimitadas', 'Ilimitadas', 'Ilimitadas'],
        ['Contatos', 'Ilimitados', 'Ilimitados', 'Ilimitados', 'Ilimitados'],
        ['Fluxos Executados', '100', '1.000', 'Ilimitados', 'Ilimitados'],
        ['Tokens GPT', '3M', '5M', '5M', '15M'],
        ['Tokens de Voz', '30.000', '50.000', '400.000', '1.000.000'],
        ['Workspaces', '1', '1', '1', '3'],
        ['WhatsApp Conectados', '1', '1', '1', '3'],
        ['Vozes Clonadas', '1', '1', '1', '3'],
        ['Chat ao Vivo', 'Sim', 'Sim', 'Sim', 'Sim'],
        ['Board de Etiquetas', 'Sim', 'Sim', 'Sim', 'Sim'],
        ['Randomizador de WhatsApp', 'Sim', 'Sim', 'Sim', 'Sim'],
        ['Disparo de Lista', 'Sim', 'Sim', 'Sim', 'Sim'],
        ['Escuta Ativa', 'Sim', 'Sim', 'Sim', 'Sim'],
        ['Dispositivos Extras', 'Ate 3', 'Ate 3', 'Ate 3 (R$97/mes cada)', 'Ate 10 (R$97/mes cada)'],
    ],
    [0.20, 0.20, 0.20, 0.20, 0.20]
))
story.append(Paragraph('Tabela 5: Comparativo de planos Lailla.io (valores referenciados da pagina oficial)', caption_style))

story.append(add_heading('<b>4.2 Modelo de Consumo e Tokens</b>', h2_style, 1))

story.append(Paragraph(
    'O sistema de tokens e o coracao do modelo de negocio da Lailla. Para texto (GPT), apenas '
    'o output e contabilizado: se o cliente envia "Quero acompanhar meu pedido" (input), nao '
    'ha consumo. Se a IA responde "Claro! Me informe o numero do seu pedido", aproximadamente '
    '10 tokens sao consumidos. Cada token equivale a cerca de 4 caracteres ou 0,75 palavras. '
    'Para voz (audio), a proporcao e mais direta: cada caractere gerado na resposta em audio '
    'consome exatamente 1 token de voz.',
    body_style))

story.append(Paragraph(
    'O painel de controle oferece monitoramento em tempo real do consumo de tokens por texto '
    'e por audio, com separacao por canal de atendimento e alertas configuraveis quando o '
    'consumo se aproxima da franquia mensal. E possivel contratar pacotes adicionais de tokens '
    'diretamente pela plataforma, ou fazer upgrade de plano para aumentar a franquia. Para '
    'empresas com volume elevado, existe o plano Enterprise sob medida, que oferece tokens '
    'sob demanda, mais dispositivos e workspaces, funcionalidades exclusivas e suporte tecnico '
    'especializado.',
    body_style))

# ════════════════════════════════════════════════════════════════
# 5. TIPOS DE WORKFLOW
# ════════════════════════════════════════════════════════════════
story.append(add_heading('<b>5. Tipos de Fluxo de Trabalho (Workflows)</b>', h1_style, 0))

story.append(Paragraph(
    'A Lailla implementa um sistema de workflows baseado em "fluxos executados", que representam '
    'o numero de vezes que um agente de IA completa uma sequencia de interacao com um contato. '
    'Esses fluxos sao configurados pelo usuario para automatizar cenarios especificos de negocio, '
    'desde o primeiro contato ate o pos-venda. A flexibilidade do sistema permite criar fluxos '
    'para praticamente qualquer cenario de atendimento e vendas via WhatsApp.',
    body_style))

story.append(add_heading('<b>5.1 Workflow de Vendas (SDR + Closer)</b>', h2_style, 1))

story.append(Paragraph(
    'O workflow de vendas e o mais utilizado na plataforma e opera em duas etapas. Na primeira '
    'etapa, o agente SDR (Sales Development Representative) recebe o contato inicial e realiza '
    'a qualificacao atraves de perguntas estrategicas que avaliam o fit do lead com o produto '
    'ou servico, nivel de interesse, orcamento disponivel e urgencia. Com base nas respostas, '
    'o lead e classificado em categorias (hot, warm, cold) e encaminhado para a etapa seguinte '
    'ou para nutricao. Na segunda etapa, o agente Closer assume leads qualificados e conduz '
    'a conversa rumo ao fechamento, apresentando proposta, respondendo objecoes e facilitando '
    'o checkout.',
    body_style))

story.append(add_heading('<b>5.2 Workflow de Agendamento</b>', h2_style, 1))

story.append(Paragraph(
    'O workflow de agendamento automatiza todo o processo de marcacao de reunioes, consultas '
    'ou reservas. O agente identifica a intencao de agendamento na conversa, consulta a '
    'disponibilidade em agenda integrada (Google Calendar, Calendly ou sistema proprio), '
    'apresenta opcoes de horario ao cliente, confirma a marcacao e envia lembretes automaticos '
    'no dia e horario agendados. Para pousadas, isso se traduz na automacao completa do '
    'processo de reservas, desde a consulta de disponibilidade ate a confirmacao via WhatsApp, '
    'com lembretes que reduzem significativamente o indice de no-show.',
    body_style))

story.append(add_heading('<b>5.3 Workflow de Pos-venda e Nutricao</b>', h2_style, 1))

story.append(Paragraph(
    'Apos a conversao, o workflow de pos-venda assume a comunicacao com o cliente para garantir '
    'satisfacao, incentivar recompras e construir fidelizacao. O agente envia mensagens '
    'personalizadas em momentos estrategicos: confirmacao de entrega/prestacao, solicitacao '
    'de avaliacao, dicas de uso do produto adquirido, e ofertas complementares com base no '
    'historico de compras. No contexto hoteleiro, esse workflow pode gerenciar toda a comunicacao '
    'pos-estadia: solicitacao de review, oferta de retorno com desconto, comunicacao de eventos '
    'especiais e promocoes sazonais.',
    body_style))

story.append(add_heading('<b>5.4 Workflow de Recuperacao</b>', h2_style, 1))

story.append(Paragraph(
    'O workflow de recuperacao identifica contatos que iniciaram mas nao completaram um processo '
    'de compra (carrinho abandonado, boleto nao pago, proposta sem resposta) e iniciia uma '
    'sequencia de comunicacao automatizada para reengajamento. O agente identifica o ponto '
    'exato de abandono, personaliza a abordagem com base no historico de interacoes e oferece '
    'incentivos contextuais (descontos, condicoes especiais, urgencia) para conversao. Os '
    'resultados sao rastreados no Painel de Vendas, permitindo medir a eficacia das campanhas '
    'de recuperacao.',
    body_style))

# ════════════════════════════════════════════════════════════════
# 6. INTEGRACOES
# ════════════════════════════════════════════════════════════════
story.append(add_heading('<b>6. Ecossistema de Integracoes</b>', h1_style, 0))

story.append(Paragraph(
    'A Lailla se posiciona como plataforma hub, conectando-se com mais de 250 ferramentas '
    'que possuem API aberta. A filosofia de integracao e que a IA deve operar como camada '
    'inteligente sobre as ferramentas ja existentes na operacao da empresa, e nao como mais '
    'um silo desconectado. Isso significa que o agente pode atualizar o CRM, buscar informacoes '
    'em um sistema externo, agendar pessoas em um calendario e processar pagamentos, tudo '
    'durante a mesma conversa no WhatsApp.',
    body_style))

story.append(make_table(
    ['Categoria', 'Exemplos de Integracao', 'Uso no Workflow'],
    [
        ['CRM', 'HubSpot, Pipedrive, Salesforce, RD Station', 'Atualizacao automatica de leads qualificados e historico de interacoes'],
        ['Agenda', 'Google Calendar, Calendly, Calendly', 'Agendamento automatico de reunioes e envio de lembretes'],
        ['Pagamentos', 'Stripe, Mercadopago, PIX', 'Processamento de pagamentos e recuperacao de transacoes pendentes'],
        ['E-commerce', 'Shopify, Nuvemshop, Tray', 'Consulta de produtos, status de pedido e recuperacao de carrinho'],
        ['Email Marketing', 'Mailchimp, ActiveCampaign, ConvertKit', 'Sincronizacao de contatos e disparo de campanhas complementares'],
        ['Google', 'Google Contacts, Google Calendar, Google Sheets', 'Importacao de contatos, agendamento e planilhas de dados'],
    ],
    [0.15, 0.35, 0.50]
))
story.append(Paragraph('Tabela 6: Ecossistema de integracoes da Lailla.io', caption_style))

# ════════════════════════════════════════════════════════════════
# 7. MAPA DE ADAPTACAO ZEHLA
# ════════════════════════════════════════════════════════════════
story.append(add_heading('<b>7. Mapa de Adaptacao para o ZEHLA</b>', h1_style, 0))

story.append(Paragraph(
    'Com base na analise completa da Lailla.io, este capitulo apresenta o mapeamento detalhado '
    'de como cada funcionalidade pode ser adaptada, melhorada ou integrada ao ecossistema '
    'ZEHLA/SMARTHOTEL. O objetivo nao e replicar a Lailla, mas extrair conceitos validos '
    'e eleva-los ao nivel de sofisticacao que o ZEHLA propoe com seu ML Brain Protocol, '
    'DNA Wizard e sistema de observabilidade cognitiva.',
    body_style))

story.append(add_heading('<b>7.1 Mapeamento Funcional: Lailla vs ZEHLA</b>', h2_style, 1))

story.append(make_table(
    ['Funcionalidade Lailla', 'Situacao ZEHLA', 'Acao Recomendada', 'Prioridade'],
    [
        ['Clonagem de Voz', 'Existe no ML Brain Protocol (4 fases)', 'Refinar Voice Fingerprinting (6 dimensoes) + Formality Index para segmento hoteleiro', 'CRITICA'],
        ['Escuta Ativa', 'Parcialmente planejado', 'Implementar pipeline ASR completo Whisper + contexto hoteleiro com Zehla Brain', 'CRITICA'],
        ['Agentes de Conversa', 'Parcialmente implementado', 'Escalar para agentes especializados (reservas, vendas, concierge, POS-venda)', 'ALTA'],
        ['Randomizador de WhatsApp', 'Nao existe', 'Implementar modulo Zehla Shield com round-robin inteligente e anti-ban', 'ALTA'],
        ['Board de Etiquetas', 'Nao existe (LIS faz scoring)', 'Criar Zehla Board como visual layer sobre o LIS com drag-and-drop', 'MEDIA'],
        ['Disparo em Massa', 'Nao existe', 'Implementar modulo Zehla Broadcast com segmentacao avancada via DNA Wizard', 'ALTA'],
        ['Chat ao Vivo', 'Nao existe', 'Criar Zehla Live com handoff IA-Humano transparente e fila de espera', 'ALTA'],
        ['Painel de Vendas', 'Nao existe como dashboard', 'Criar Zehla Analytics com metricas hoteleiras (ADR, RevPAR, taxa de ocupacao)', 'MEDIA'],
        ['Integracao CRM', 'Via LIS', 'Aprimorar LIS para 2-way sync com RD Station, HubSpot e CRMs hoteleiros', 'MEDIA'],
        ['Modelo de Tokens', 'Nao existe', 'Avaliar modelo de custo baseado em tokens para precificacao SaaS', 'BAIXA'],
    ],
    [0.18, 0.22, 0.40, 0.20]
))
story.append(Paragraph('Tabela 7: Mapeamento de adaptacao Lailla para ZEHLA', caption_style))

story.append(add_heading('<b>7.2 Vantagens Competitivas do ZEHLA sobre a Lailla</b>', h2_style, 1))

story.append(Paragraph(
    'Embora a Lailla ofereca um conjunto robusto de funcionalidades, o ZEHLA possui fundamentos '
    'tecnologicos que, quando devidamente implementados, posicionam o ecossistema em um nivel '
    'significativamente superior. O ML Brain Protocol com sua arquitetura hibrida RAG + Fine-Tuning '
    'permite respostas muito mais contextualizadas e precisas do que o uso isolado de GPT via API. '
    'A voz clonada do ZEHLA possui Voice Fingerprinting com 6 dimensoes (timbre, ritmo, tom, '
    'articulacao, proeminencia, sotaque), enquanto a Lailla opera com clonagem mais simples.',
    body_style))

story.append(Paragraph(
    'O DNA Wizard com Tone Thermometer (5 arquetipos) e Discount Keys (6 chaves) oferece '
    'personalizacao emocional da comunicacao que a Lailla nao possui. A Formality Index (0.0-1.0) '
    'permite ajustar automaticamente o tom entre formal e informal conforme o contexto da conversa, '
    'algo que na Lailla depende de configuracao manual do prompt. O Guardian com 4 niveis de '
    'resposta (observe, adjust, alert, halt) para drift detection garante que o agente ZEHLA '
    'mantenha consistencia ao longo do tempo, uma limitacao reconhecida nos termos de uso da '
    'propria Lailla.',
    body_style))

story.append(Paragraph(
    'Adicionalmente, a arquitetura multi-tenant com 4 camadas de isolamento (database, '
    'workspace, voice, data) do ZEHLA e mais robusta do que o sistema de workspaces da Lailla. '
    'A conformidade LGPD no ML com 5 pilares (coleta, consentimento, retencao, anonimizacao, '
    'portabilidade) e mais completa que o basico de conformidade LGPD da Lailla. Essas vantagens '
    'constituem os pilares de diferenciacao que devem ser comunicados no posicionamento do ZEHLA.',
    body_style))

story.append(add_heading('<b>7.3 Funcionalidades a Adotar Diretamente</b>', h2_style, 1))

story.append(Paragraph(
    'Algumas funcionalidades da Lailla devem ser adotadas com poucas ou nenhuma modificacao, '
    'pois representam lacunas evidentes no ecossistema ZEHLA atual. A primeira e o sistema '
    'de Disparo em Massa com Randomizador, que resolve um problema critico para o SMARTHOTEL: '
    'a comunicacao em volume com hospedes para campanhas sazonais. A segunda e o Chat ao Vivo '
    'com handoff transparente IA-Humano, essencial para garantir que situacoes complexas ou '
    'sensiveis (reclamacoes, problemas com reserva, emergencias) sejam tratadas por pessoas.',
    body_style))

story.append(Paragraph(
    'A terceira funcionalidade a adotar e o Board de Etiquetas como camada visual sobre o '
    'LIS. O LIS ja possui o motor de scoring e enriquecimento de leads, mas carece de uma '
    'interface visual que permita a equipe operar de forma intuitiva. A Lailla demonstra que '
    'essa interface e um fator decisivo na adocao por usuarios nao tecnicos. A quarta e o '
    'Painel de Vendas adaptado para metricas hoteleiras (ADR, RevPAR, ocupacao, ticket medio '
    'por hospede, LTV por segmento), que transformaria dados brutos do LIS em insights acionaveis.',
    body_style))

story.append(add_heading('<b>7.4 Funcionalidades a Evoluir</b>', h2_style, 1))

story.append(Paragraph(
    'Outras funcionalidades devem ser adotadas em sua essencia mas significativamente evolu '
    'das pelo ZEHLA. A clonagem de voz, por exemplo, ja existe no ML Brain Protocol mas '
    'precisa ser expandida para suportar multiplas vozes por workspace (voz do proprietario, '
    'voz da recepcionista, voz do concierge), selecao automatica de voz por contexto de '
    'conversa (formal para reservas, informal para informacoes locais), e integracao direta '
    'com a Formality Index para ajustar o tom da voz ao nivel de formalidade calculado.',
    body_style))

story.append(Paragraph(
    'A Escuta Ativa deve ir alem da transcricao e resposta basica: o ZEHLA pode implementar '
    'analise de sentimento em tempo real no audio recebido, deteccao de emocoes (frustracao, '
    'alegria, urgencia) para adaptar a resposta automaticamente, e armazenamento do historico '
    'de audios para fine-tuning continuo do modelo de voz e do DNA Wizard. O DNA Wizard pode '
    'aprender com os audios dos hospedes a calibrar o tom ideal para cada perfil de cliente, '
    'criando um ciclo virtuoso de melhoria continua que a Lailla nao oferece.',
    body_style))

# ════════════════════════════════════════════════════════════════
# 8. ROADMAP DE IMPLEMENTACAO
# ════════════════════════════════════════════════════════════════
story.append(add_heading('<b>8. Roadmap de Implementacao Sugerido</b>', h1_style, 0))

story.append(Paragraph(
    'Com base na analise comparativa e no mapeamento funcional, propomos um roadmap de implementacao '
    'em 4 fases que prioriza as funcionalidades de maior impacto para o SMARTHOTEL e avanca '
    'progressivamente para a construcao de um ecossistema completo que supera a Lailla em '
    'todos os aspectos relevantes.',
    body_style))

story.append(make_table(
    ['Fase', 'Prazo', 'Funcionalidades', 'Entregaveis'],
    [
        ['Fase 1: Core', 'Semanas 1-4', 'WhatsApp API + Escuta Ativa + Chat ao Vivo + Voz Basica', 'Conexao API Oficial Meta, pipeline ASR/TTS, handoff IA-humano, 1 voz clonada por tenant'],
        ['Fase 2: VendAS', 'Semanas 5-8', 'Agentes Especializados + Board + Disparo com Randomizador', '4 agentes pre-configurados (reservas, vendas, concierge, pos-venda), Zehla Board, Zehla Broadcast'],
        ['Fase 3: Brain', 'Semanas 9-12', 'DNA Wizard Integration + Formality Index + Voz Multi-agente', 'Tone Thermometer em agentes, selecao automatica de voz, Formality Index por conversa'],
        ['Fase 4: Scale', 'Semanas 13-16', 'Analytics + Multi-tenant Avancado + LGPD ML + Guardian', 'Painel hoteleiro, 4 camadas de isolamento, 5 pilares LGPD, Zehla Guardian ativo'],
    ],
    [0.10, 0.12, 0.40, 0.38]
))
story.append(Paragraph('Tabela 8: Roadmap de implementacao ZEHLA inspirado na Lailla.io', caption_style))

# ════════════════════════════════════════════════════════════════
# 9. RISCOS E CONSIDERACOES
# ════════════════════════════════════════════════════════════════
story.append(add_heading('<b>9. Riscos e Consideracoes Estrategicas</b>', h1_style, 0))

story.append(Paragraph(
    'A analise da Lailla tambem revela pontos de atencao que devem ser considerados no '
    'posicionamento e desenvolvimento do ZEHLA. A Lailla possui reclamacoes no Reclame Aqui '
    'relacionadas a bugs no chatbot e dificuldades com o suporte, indicando que a maturidade '
    'tecnica da plataforma ainda esta em evolucao. Esse e um diferencial que o ZEHLA pode '
    'explorar: oferecer estabilidade superior e suporte proativo, especialmente para o segmento '
    'hoteleiro onde a confiabilidade do atendimento e critica.',
    body_style))

story.append(Paragraph(
    'O modelo de precos da Lailla (R$197,90 a R$1.497,90/mes) define o teto de aceitacao '
    'do mercado para esse tipo de solucao. O ZEHLA precisa posicionar-se de forma estrategica: '
    'pode optar por precos competitivos para ganhar mercado rapidamente, ou precos premium '
    'justificados pelas vantagens exclusivas (ML Brain Protocol, DNA Wizard, Guardian, '
    'Formality Index). A recomendacao e uma estrategia de precos tiered com um plano de '
    'entrada acessivel (para captura de mercado) e planos superiores que monetizam as '
    'funcionalidades avancadas.',
    body_style))

story.append(Paragraph(
    'A politica de conteudo gerado por IA nos Termos de Uso da Lailla revela uma preocupacao '
    'comum no setor: a plataforma admite que "a IA nao e perfeita" e requer que o usuario '
    "revise os conteudos antes de utiliza-los. O ZEHLA pode transformar essa limitacao em "
    'vantagem competitiva atraves do Guardian (drift detection) e da observabilidade cognitiva '
    'com 6 metricas (relevancia, coerencia, seguranca, latencia, personalizacao, engajamento), '
    'oferecendo garantias de qualidade que a Lailla nao pode oferecer. A conformidade LGPD '
    'com 5 pilares tambem e mais robusta do que o basico de conformidade exigido pela Lailla, '
    'sendo um argumento forte para clientes corporativos e pousadas com alto volume de dados '
    'sensiveis de hospedes.',
    body_style))

# ════════════════════════════════════════════════════════════════
# 10. CONCLUSAO
# ════════════════════════════════════════════════════════════════
story.append(add_heading('<b>10. Sintese e Proximos Passos</b>', h1_style, 0))

story.append(Paragraph(
    'A Lailla.io e uma referencia importante no mercado brasileiro de automacao WhatsApp com '
    'IA, especialmente pela combinacao intuitiva de clonagem de voz, escuta ativa e parceria '
    'com a OpenAI em uma interface no-code acessivel. Sua proposta de valor e clara: automatizar '
    'atendimento, vendas e operacoes em 11 minutos, sem codigo e sem conhecimento tecnico. '
    'Os planos sao acessiveis (a partir de R$197,90/mes) e o modelo de tokens oferece '
    'previsibilidade de custo.',
    body_style))

story.append(Paragraph(
    'Para o ZEHLA, a analise revela tanto funcionalidades a adotar (disparo com randomizador, '
    'chat ao vivo, board de etiquetas) quanto lacunas a explorar como diferenciais (DNA Wizard, '
    'Formality Index, Guardian, LGPD ML, Voice Fingerprinting). O roadmap de 16 semanas proposto '
    'permite ao ZEHLA construir um ecossistema que nao apenas replica as funcionalidades da '
    'Lailla, mas as supera significativamente em sofisticacao, personalizacao e confiabilidade, '
    'posicionando-se como a solucao premium para o segmento hoteleiro brasileiro.',
    body_style))

story.append(Paragraph(
    'O proximo passo recomendado e iniciar a Fase 1 do roadmap (WhatsApp API + Escuta Ativa + '
    'Chat ao Vivo + Voz Basica), que estabelece os fundamentos de comunicacao sobre os quais '
    'todas as funcionalidades avancadas serao construidas. Simultaneamente, o modulo Zehla '
    'Shield (randomizador anti-ban) deve ser prototipado como componente independente, dado '
    'sua importancia critica para operacoes em volume. A combinacao desses entregaveis com a '
    'base existente do ML Brain Protocol posicionara o ZEHLA como o ecossistema mais completo '
    'e sofisticado para automacao WhatsApp no segmento hoteleiro.',
    body_style))

# ── Build ──
doc.multiBuild(story)
print(f'PDF gerado com sucesso: {OUTPUT}')
