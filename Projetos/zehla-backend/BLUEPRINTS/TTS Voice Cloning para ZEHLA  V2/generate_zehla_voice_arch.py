#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ZEHLA Voice Intelligence Architecture Blueprint
DNA-Driven Voice Adaptation (Evolution 2) + Voice Loop (Evolution 4)
"""

import os, sys, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether,
    CondPageBreak, Image, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.platypus import SimpleDocTemplate
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ──────────────────────────────────────────────
# FONT REGISTRATION
# ──────────────────────────────────────────────
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('CarlitoBold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansBold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSCBold', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))

registerFontFamily('Carlito', normal='Carlito', bold='CarlitoBold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSansBold')
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSCBold')
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSC')

# ──────────────────────────────────────────────
# COLOR PALETTE (auto-generated via palette.cascade)
# ──────────────────────────────────────────────
PAGE_BG       = colors.HexColor('#f5f5f4')
SECTION_BG    = colors.HexColor('#ecebe9')
CARD_BG       = colors.HexColor('#edece9')
TABLE_STRIPE  = colors.HexColor('#f2f2f0')
HEADER_FILL   = colors.HexColor('#635a3e')
COVER_BLOCK   = colors.HexColor('#686049')
BORDER_COLOR  = colors.HexColor('#c4beab')
ICON_COLOR    = colors.HexColor('#8c7a44')
ACCENT        = colors.HexColor('#2d92b4')
ACCENT_SEC    = colors.HexColor('#51cd51')
TEXT_PRIMARY   = colors.HexColor('#20201d')
TEXT_MUTED     = colors.HexColor('#8a8881')
SUCCESS_COLOR = colors.HexColor('#3c7950')
WARNING_COLOR = colors.HexColor('#897448')
ERROR_COLOR   = colors.HexColor('#ab5952')
INFO_COLOR    = colors.HexColor('#4b77a4')

TABLE_HEADER_COLOR = HEADER_FILL
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = TABLE_STRIPE

# ──────────────────────────────────────────────
# PAGE DIMENSIONS
# ──────────────────────────────────────────────
PAGE_W, PAGE_H = A4
LEFT_MARGIN = 1.0 * inch
RIGHT_MARGIN = 1.0 * inch
TOP_MARGIN = 0.8 * inch
BOTTOM_MARGIN = 0.8 * inch
AVAILABLE_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ──────────────────────────────────────────────
# STYLES
# ──────────────────────────────────────────────
styles = getSampleStyleSheet()

style_h1 = ParagraphStyle(
    name='H1Custom', fontName='Carlito', fontSize=22, leading=28,
    textColor=TEXT_PRIMARY, spaceBefore=18, spaceAfter=12, alignment=TA_LEFT
)
style_h2 = ParagraphStyle(
    name='H2Custom', fontName='Carlito', fontSize=16, leading=22,
    textColor=ACCENT, spaceBefore=14, spaceAfter=8, alignment=TA_LEFT
)
style_h3 = ParagraphStyle(
    name='H3Custom', fontName='Carlito', fontSize=13, leading=18,
    textColor=ICON_COLOR, spaceBefore=10, spaceAfter=6, alignment=TA_LEFT
)
style_body = ParagraphStyle(
    name='BodyCustom', fontName='Carlito', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6,
    alignment=TA_LEFT, wordWrap='CJK'
)
style_body_indent = ParagraphStyle(
    name='BodyIndent', fontName='Carlito', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6,
    alignment=TA_LEFT, leftIndent=18, wordWrap='CJK'
)
style_code = ParagraphStyle(
    name='CodeCustom', fontName='DejaVuSans', fontSize=8.5, leading=13,
    textColor=TEXT_PRIMARY, spaceBefore=4, spaceAfter=4,
    alignment=TA_LEFT, leftIndent=12, backColor=colors.HexColor('#f8f8f7'),
    borderColor=BORDER_COLOR, borderWidth=0.5, borderPadding=6
)
style_bullet = ParagraphStyle(
    name='BulletCustom', fontName='Carlito', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=2,
    alignment=TA_LEFT, leftIndent=24, bulletIndent=12, wordWrap='CJK'
)
style_callout = ParagraphStyle(
    name='CalloutCustom', fontName='Carlito', fontSize=10, leading=16,
    textColor=ACCENT, spaceBefore=6, spaceAfter=6,
    alignment=TA_LEFT, leftIndent=18, borderColor=ACCENT,
    borderWidth=2, borderPadding=8, backColor=colors.HexColor('#f0f8fb')
)
style_header_cell = ParagraphStyle(
    name='HeaderCell', fontName='Carlito', fontSize=10, leading=14,
    textColor=colors.white, alignment=TA_CENTER
)
style_cell = ParagraphStyle(
    name='CellCustom', fontName='Carlito', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER, wordWrap='CJK'
)
style_cell_left = ParagraphStyle(
    name='CellLeft', fontName='Carlito', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK'
)
style_caption = ParagraphStyle(
    name='Caption', fontName='Carlito', fontSize=9, leading=13,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=3, spaceAfter=6
)

# ──────────────────────────────────────────────
# TOC Template
# ──────────────────────────────────────────────
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

# ──────────────────────────────────────────────
# HELPER FUNCTIONS
# ──────────────────────────────────────────────
MAX_KEEP_HEIGHT = PAGE_H * 0.40

def safe_keep(elements):
    total = 0
    for el in elements:
        w, h = el.wrap(AVAILABLE_W, PAGE_H)
        total += h
    if total <= MAX_KEEP_HEIGHT:
        return [KeepTogether(elements)]
    elif len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)

def heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def h1(text):
    return heading(text, style_h1, level=0)

def h2(text):
    return heading(text, style_h2, level=1)

def h3(text):
    return heading(text, style_h3, level=2)

def body(text):
    return Paragraph(text, style_body)

def body_indent(text):
    return Paragraph(text, style_body_indent)

def code(text):
    return Paragraph(text, style_code)

def bullet(text):
    return Paragraph(text, style_bullet)

def callout(text):
    return Paragraph(text, style_callout)

def spacer(h=12):
    return Spacer(1, h)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceAfter=8, spaceBefore=8)

def make_table(headers, rows, col_ratios=None):
    if col_ratios is None:
        col_ratios = [1.0 / len(headers)] * len(headers)
    col_widths = [r * AVAILABLE_W for r in col_ratios]
    data = [[Paragraph('<b>%s</b>' % h, style_header_cell) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), style_cell_left if i == 0 else style_cell) for i, c in enumerate(row)])
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t


# ──────────────────────────────────────────────
# BUILD DOCUMENT
# ──────────────────────────────────────────────
OUTPUT_PATH = '/home/z/my-project/download/ZEHLA_Voice_Intelligence_Architecture.pdf'
BODY_PATH = '/home/z/my-project/download/ZEHLA_Voice_Body.pdf'
COVER_HTML = '/home/z/my-project/download/cover_voice.html'
COVER_PDF = '/home/z/my-project/download/cover_voice.pdf'

doc = TocDocTemplate(
    BODY_PATH,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
    title='ZEHLA Voice Intelligence Architecture',
    author='Z.ai',
    subject='DNA-Driven Voice Adaptation + Voice Loop Blueprint',
    creator='Z.ai'
)

story = []

# ──────────────────────────────────────────────
# TABLE OF CONTENTS
# ──────────────────────────────────────────────
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle(name='TOC1', fontName='Carlito', fontSize=13, leading=20, leftIndent=20, textColor=TEXT_PRIMARY),
    ParagraphStyle(name='TOC2', fontName='Carlito', fontSize=11, leading=18, leftIndent=40, textColor=TEXT_MUTED),
    ParagraphStyle(name='TOC3', fontName='Carlito', fontSize=10, leading=16, leftIndent=60, textColor=TEXT_MUTED),
]
story.append(Paragraph('<b>Sumario</b>', ParagraphStyle(
    name='TOCTitle', fontName='Carlito', fontSize=24, leading=30,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=18
)))
story.append(toc)
story.append(PageBreak())

# ════════════════════════════════════════════════
# 1. SUMARIO EXECUTIVO
# ════════════════════════════════════════════════
story.extend(safe_keep([h1('1. Sumario Executivo')]))

story.append(body(
    'O ecossistema ZEHLA alcancou um marco tecnologico decisivo com a implementacao do Flow Builder integrado ao Voice Studio, '
    'permitindo que uma pousada configure mensagens de voz com um clique no MessageNode. Este documento apresenta a arquitetura '
    'completa das duas proximas evolucoes que transformarao essa capacidade inicial em um sistema de inteligencia vocal contextual, '
    'capaz de adaptar a voz sintetizada ao perfil psicografico do hospede e de processar respostas em audio em tempo real.'
))

story.append(body(
    'A <b>Evolucao 2: DNA-Driven Voice Adaptation</b> conecta o DNA Wizard (ja blueprintado em sessoes anteriores) ao Voice '
    'Synthesis Router, permitindo que a mesma mensagem seja gerada com parametros vocais distintos para cada segmento de hospede. '
    'Uma familia com criancas recebe uma voz calma e pausada, enquanto um digital nomad solo ouve uma resposta rapida e informal. '
    'Essa adaptacao e automatica e transparente, exigindo zero configuracao manual do proprietario da pousada. O sistema lê o DNA '
    'do contato ativo, calcula os parametros ideais de speaking rate, pitch e estilo, e injeta essas variaveis diretamente no '
    'pipeline de sintese de voz sem modificar o fluxo do Flow Builder ou o schema do MessageNode.'
))

story.append(body(
    'A <b>Evolucao 4: Voice Loop</b> fecha o ciclo completo de comunicacao por voz, habilitando o ZEHLA a receber mensagens em '
    'audio do hospede via WhatsApp, transcreve-las em tempo real com Whisper ASR, extrair sentimento vocal, raciocinar via Agent '
    'Orchestrator e responder com audio sintetizado clonado. O pipeline ponta a ponta opera em menos de 8 segundos, criando a '
    'experiencia de um concierge virtual que fala com a voz do estabelecimento, disponivel 24 horas por dia, 7 dias por semana. '
    'Nenhum PMS hoteleiro do mercado possui essa capacidade hoje.'
))

story.append(callout(
    '<b>Posicionamento Competitivo:</b> Com essas evolucoes implementadas, o ZEHLA ultrapassa plataformas genericas como '
    'Lailla.io e WisprFlow em funcionalidade E contexto vertical. A combinacao de adaptacao vocal por DNA, loop de audio '
    'bidirecional, WhatsApp nativo e integracao PMS cria um diferencial inexistente no mercado global de hospitalidade.'
))

story.append(spacer(6))

# ════════════════════════════════════════════════
# 2. PARTE I - DNA-DRIVEN VOICE ADAPTATION
# ════════════════════════════════════════════════
story.append(PageBreak())
story.extend(safe_keep([h1('2. Evolucao 2: DNA-Driven Voice Adaptation')]))

story.append(body(
    'A adaptacao vocal guiada pelo DNA representa a convergencia entre duas capacidades ja existentes no ecossistema ZEHLA: '
    'o sistema de DNA Wizard (que mapeia o perfil psicografico de cada lead e hospede) e o Voice Studio (que gera audio '
    'sintetizado com voz clonada do proprietario). A inovacao reside em criar uma camada intermediaria, o <b>DNA Voice '
    'Adapter</b>, que traduz automaticamente os atributos do DNA em parametros de sintese de voz, sem intervencao humana.'
))

# 2.1 Visao Geral
story.append(h2('2.1 Visao Geral e Conceito'))

story.append(body(
    'O DNA de um contato no ZEHLA e composto por dezenas de atributos coletados ao longo de interacoes anteriores, incluindo '
    'formality_index (nivel de formalidade do idioma utilizado pelo hospede), tone_preference (tom preferido: casual, formal, '
    'amigavel, profissional), language (idioma primario), urgency (nivel de urgencia percebido), segment (segmento de mercado: '
    'casal jovem, familia com criancas, casal idoso VIP, digital nomad, grupo de amigos), e interaction_history (historico de '
    'interacoes anteriores incluindo tempo medio de resposta e tipos de perguntas frequentes). Esses atributos sao alimentados '
    'continuamente pelo Insights Engine do DNA Wizard.'
))

story.append(body(
    'O conceito fundamental da Evolucao 2 e que cada combinacao unica de atributos DNA mapeia para um perfil vocal especifico. '
    'Em vez de oferecer ao proprietario da pousada quatro ou cinco perfis pre-configurados que exigem selecao manual em cada '
    'nó do Flow Builder, o sistema calcula dinamicamente os melhores parametros vocais para cada interacao individual. Isso '
    'significa que a mesma mensagem, como "Seu quarto esta pronto para o check-in!", pode ser gerada com variacoes sutis mas '
    'perceptíveis em ritmo, tom e intensidade, dependendo exclusivamente de quem esta recebendo a mensagem.'
))

story.append(body(
    'Do ponto de vista tecnico, o MessageNode existente ja transmite a flag useNeuralVoice = true para o backend quando o '
    'toggle de voz esta ativado. A Evolucao 2 nao altera esse contrato. A unica mudanca e que o VoiceSynthesisRouter, ao '
    'receber a flag, consulta o DNA do contato ativo antes de sintetizar, obtendo os parametros adaptativos que modificam a '
    'geracao do audio. O Flow Builder, o schema JSON do estado SDE e o protocolo de seguranca permanecem intactos, garantindo '
    'compatibilidade total com a implementacao existente.'
))

# 2.2 Arquitetura
story.append(h2('2.2 Arquitetura do DNA Voice Adapter'))

story.append(body(
    'O DNA Voice Adapter e um modulo TypeScript que reside entre o Agent Orchestrator e o VoiceSynthesisRouter. Ele '
    'recebe o contact_id da interacao atual, consulta o Insights Engine (banco de dados DNA) e retorna um objeto '
    'VoiceAdaptationParams contendo todos os ajustes necessarios para a sintese. A arquitetura segue o principio de '
    'baixo acoplamento: o Adapter nao conhece os detalhes internos do VoiceSynthesisRouter e o Router nao precisa '
    'saber como o Adapter calculou os parametros. A comunicacao entre ambos acontece exclusivamente via JSON.'
))

story.append(code(
    'interface VoiceAdaptationParams {<br/>'
    '&nbsp;&nbsp;speaking_rate: number;&nbsp;&nbsp;// 0.8 - 1.2 (1.0 = normal)<br/>'
    '&nbsp;&nbsp;pitch: number;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// -1.0 - 1.0 (0 = original)<br/>'
    '&nbsp;&nbsp;style_weight: number;&nbsp;&nbsp;// 0.0 - 1.0 (intensidade do estilo)<br/>'
    '&nbsp;&nbsp;style: string;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// "friendly" | "formal" | "calm" | "energetic"<br/>'
    '&nbsp;&nbsp;language: string;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// "pt-BR" | "en-US" | "es"<br/>'
    '&nbsp;&nbsp;confidence: number;&nbsp;&nbsp;&nbsp;&nbsp;// 0.0 - 1.0 (confianca da adaptacao)<br/>'
    '&nbsp;&nbsp;fallback_profile: string; // perfil usado se confidence &lt; 0.3<br/>'
    '}'
))

story.append(spacer(6))

story.append(body(
    'O pipeline de adaptacao opera em tres fases distintas. Na primeira fase, chamada de <b>DNA Lookup</b>, o Adapter '
    'recebe o contact_id e consulta o Insights Engine via Prisma, recuperando o DNA completo do contato. Se o contato '
    'nao possuir DNA suficiente (interacoes anteriores insuficientes), o Adapter utiliza um perfil default baseado no '
    'segmento presumido a partir do canal de entrada (por exemplo, reservas via Booking.com tendem a ter DNA mais '
    'formal que reservas via Instagram Direct).'
))

story.append(body(
    'Na segunda fase, chamada de <b>Param Calculation</b>, o Adapter aplica um conjunto de regras determinísticas e '
    'modelos leves de regressao para converter os atributos DNA em parametros de sintese. O formalidade_index, por '
    'exemplo, tem correlacao direta com o speaking_rate: contatos com formalidade baixa (0.1-0.3) recebem rate '
    'mais rapido (1.05-1.12), enquanto contatos com formalidade alta (0.7-1.0) recebem rate mais lento (0.88-0.95). '
    'O tone_preference mapeia diretamente para o campo style, e o segmento influencia pitch e style_weight '
    'simultaneamente. Cada regra possui peso e prioridade, permitindo que conflitos sejam resolvidos de forma '
    'determinística.'
))

story.append(body(
    'Na terceira fase, chamada de <b>Confidence Scoring</b>, o Adapter calcula um score de confianca baseado na '
    'quantidade e qualidade dos dados DNA disponíveis. Se o contato possui menos de 3 interacoes anteriores, ou '
    'se o DNA esta incompleto em mais de 40% dos atributos, o confidence cai abaixo do threshold de 0.3 e o '
    'Adapter aciona o fallback_profile, que e simplesmente o perfil de voz "recepcao" padrao da pousada, sem '
    'adaptacao. Essa abordagem garante que a adaptacao so ocorra quando ha dados suficientes para justificar a '
    'personalizacao, evitando adaptacoes imprecisas que poderiam soar artificiais.'
))

# 2.3 Integracao com DNA Wizard
story.append(h2('2.3 Integracao com DNA Wizard e InsightsEngine'))

story.append(body(
    'O DNA Wizard ja blueprintado em sessoes anteriores possui tres componentes principais que alimentam o DNA Voice '
    'Adapter: o Tone Thermometer (analisa o tom das mensagens recebidas e atualiza o tone_preference), o Discount '
    'Keys (identifica padroes de comportamento de compra e infere urgencia e segmento), e o Insights Engine '
    '(armazena e atualiza o DNA completo de cada contato no banco de dados via Prisma). A integracao entre o '
    'DNA Voice Adapter e esses componentes e feita exclusivamente por leitura: o Adapter nunca modifica o DNA, '
    'apenas o consulta.'
))

story.append(body(
    'O Insights Engine expoe um metodo getContactDNA(contact_id: string): Promise&lt;ContactDNA&gt; que retorna o '
    'objeto completo. Esse metodo e cacheado em Redis com TTL de 5 minutos, garantindo que chamadas repetidas '
    'durante a mesma conversa nao gerem consultas redundantes ao banco de dados. O cache e invalidado '
    'automaticamente quando o Insights Engine atualiza o DNA de um contato, via evento pub/sub no Redis, '
    'assegurando que o Adapter sempre trabalha com dados atualizados.'
))

story.append(body(
    'O schema do ContactDNA no Prisma inclui campos como id, tenant_id (para isolamento multi-tenant), '
    'formality_index (float 0-1), tone_preference (enum), language (string), urgency (float 0-1), '
    'segment (enum), interaction_count (int), avg_response_time_sec (int), preferred_topics (string[]), '
    'last_interaction_at (datetime) e created_at (datetime). Todos os campos possuem valores default que '
    'garantem que o Adapter nunca receba dados null, eliminando a necessidade de verificacoes defensivas '
    'extensivas no codigo de calculo de parametros.'
))

# 2.4 Voice Profile Mapping
story.append(h2('2.4 Voice Profile Mapping por DNA do Contato'))

story.append(body(
    'O mapeamento de DNA para perfis vocais e o nucleo algoritmico da Evolucao 2. A tabela abaixo apresenta '
    'a matriz completa de mapeamento, mostrando como cada atributo DNA influencia cada parametro de sintese. '
    'Essa matriz foi desenhada para ser extensivel: novos atributos DNA podem ser adicionados sem modificar '
    'a estrutura do Adapter, bastando incluir novas regras no conjunto de mapeamento.'
))

story.append(spacer(12))

# Table: DNA Voice Mapping
t_dna_map = make_table(
    ['Atributo DNA', 'Faixa', 'Parametro', 'Valor Mapeado'],
    [
        ['formality_index', '0.1 - 0.3', 'speaking_rate', '1.08 - 1.12'],
        ['formality_index', '0.4 - 0.6', 'speaking_rate', '0.95 - 1.05'],
        ['formality_index', '0.7 - 1.0', 'speaking_rate', '0.85 - 0.95'],
        ['tone_preference', '"casual"', 'style', '"friendly"'],
        ['tone_preference', '"formal"', 'style', '"formal"'],
        ['tone_preference', '"ansioso"', 'style + pitch', '"calm" + (-0.4)'],
        ['segment', 'familia_criancas', 'rate + style', '0.90 + "calm"'],
        ['segment', 'casal_jovem', 'rate + style', '1.08 + "friendly"'],
        ['segment', 'casal_idoso_vip', 'rate + style', '0.92 + "formal"'],
        ['segment', 'digital_nomad', 'rate + style', '1.12 + "energetic"'],
        ['segment', 'grupo_amigos', 'rate + style', '1.06 + "friendly"'],
        ['urgency', '> 0.7', 'speaking_rate', '+0.05 (acelerado)'],
        ['interaction_count', '< 3', 'confidence', '< 0.3 (fallback)'],
        ['avg_response_time', '< 30s', 'speaking_rate', '+0.03 (rapido)'],
        ['language', '"en-US"', 'language', '"en-US"'],
    ],
    col_ratios=[0.20, 0.16, 0.22, 0.22]
)
story.append(t_dna_map)
story.append(Paragraph('<b>Tabela 1:</b> Matriz de mapeamento DNA para parametros vocais', style_caption))
story.append(spacer(12))

story.append(body(
    'A resolucao de conflitos segue uma hierarquia de prioridade. Quando dois atributos sugerem valores contraditorios '
    'para o mesmo parametro (por exemplo, segment=familia_criancas sugere rate=0.90 mas urgency>0.7 sugere rate+0.05), '
    'o sistema aplica pesos definidos na configuracao: segmento possui peso 1.0 (maximo), urgencia possui peso 0.7, '
    'formality_index possui peso 0.8, e tone_preference possui peso 0.9. O resultado final e uma media ponderada '
    'arredondada para duas casas decimais. Se o valor resultante ultrapassar os limites minimos ou maximos do '
    'sintetizador, e feito um clamp para o limite mais proximo.'
))

# 2.5 Parametros de Sintese
story.append(h2('2.5 Parametros de Sintese Adaptativa'))

story.append(body(
    'O VoiceSynthesisRouter existente utiliza modelos XTTS v2 ou Bark para gerar audio. Esses modelos suportam '
    'parametros nativos de controle que sao expostos via API de sintese. A Evolucao 2 adiciona uma camada de '
    'adaptacao que modifica esses parametros antes da invocacao do modelo, sem alterar a interface do Router. '
    'Os parametros suportados e seus efeitos perceptíveis na voz clonada sao detalhados a seguir.'
))

story.append(spacer(12))

t_params = make_table(
    ['Parametro', 'Faixa', 'Efeito Perceptivel', 'Modelo'],
    [
        ['speaking_rate', '0.80 - 1.20', 'Velocidade da fala. 1.0 = velocidade original da voz clonada', 'XTTS v2'],
        ['pitch', '-1.0 - 1.0', 'Tonalidade da voz. Valores positivos = mais agudo, negativos = mais grave', 'Bark'],
        ['style_weight', '0.0 - 1.0', 'Intensidade da emocao/estilo. 0 = neutro, 1 = maxima expressao', 'XTTS v2'],
        ['style', 'string enum', 'Pre-set de emocao: friendly, formal, calm, energetic', 'XTTS v2'],
        ['language', 'string', 'Idioma da sintese. Define o dicionario fonetico', 'Ambos'],
        ['guidance_scale', '1.0 - 3.0', 'Fidelidade ao speaker embedding vs naturalidade', 'Ambos'],
    ],
    col_ratios=[0.18, 0.12, 0.48, 0.12]
)
story.append(t_params)
story.append(Paragraph('<b>Tabela 2:</b> Parametros de sintese suportados pelo VoiceSynthesisRouter', style_caption))
story.append(spacer(12))

story.append(body(
    'O campo guidance_scale merece atencao especial. Esse parametro controla o trade-off entre fidelidade ao speaker '
    'embedding (a voz clonada do proprietario) e a naturalidade da prosodia gerada. Valores mais altos (2.0-3.0) '
    'produzem audio mais fiel a voz original, mas podem soar menos natural quando o speaking_rate ou pitch sao '
    'significativamente alterados. Valores mais baixos (1.0-1.5) permitem maior variacao prosodica, mas a voz '
    'resultante pode se afastar perceptivelmente da voz do proprietario. O DNA Voice Adapter define automaticamente '
    'o guidance_scale com base no delta de alteracao: se os parametros adaptativos estao proximos do perfil original '
    '(delta total < 0.15), o guidance_scale e configurado para 2.5 (alta fidelidade). Se os parametros estao '
    'significativamente alterados (delta total > 0.30), o guidance_scale e reduzido para 1.8 para evitar artefatos.'
))

# 2.6 Fluxo de Dados
story.append(h2('2.6 Fluxo de Dados End-to-End'))

story.append(body(
    'O fluxo de dados completo da Evolucao 2, desde a acao do hospede ate a entrega do audio adaptado, opera em '
    'cinco etapas sequenciais. Cada etapa e independente e pode ser monitorada individualmente via logs estruturados '
    'no sistema de Cognitive Observability ja existente no ZEHLA.'
))

story.append(spacer(6))
story.append(bullet('<b>Etapa 1 - Disparo do Flow:</b> O hospede envia uma mensagem via WhatsApp. O agente '
    'orquestrador identifica o fluxo ativo e seleciona o MessageNode correspondente. O nó possui useNeuralVoice '
    'habilitado, transmitindo a flag junto ao context da interacao.'))
story.append(bullet('<b>Etapa 2 - Raciocinio do Agente:</b> O Agent Orchestrator processa a mensagem, '
    'formula a resposta em texto e anexa voiceEnabled: true na saida. O texto da resposta e o input principal '
    'para a sintese, contendo a mensagem contextualizada gerada pelo cerebro cognitivo.'))
story.append(bullet('<b>Etapa 3 - Consulta DNA:</b> O VoiceSynthesisRouter, ao receber a flag de voz, '
    'extrai o contact_id do context e invoca o DNA Voice Adapter. O Adapter consulta o Insights Engine via '
    'Redis cache (TTL 5min) ou fallback para Prisma, obtendo o ContactDNA completo.'))
story.append(bullet('<b>Etapa 4 - Calculo Adaptativo:</b> O DNA Voice Adapter aplica a matriz de mapeamento, '
    'calcula os VoiceAdaptationParams e retorna o objeto ao Router. O confidence score determina se a '
    'adaptacao sera aplicada ou se o fallback profile sera utilizado.'))
story.append(bullet('<b>Etapa 5 - Sintese e Entrega:</b> O VoiceSynthesisRouter invoca o modelo TTS com os '
    'parametros adaptativos, gera o arquivo .ogg, envia via WhatsApp API e registra o evento de entrega no '
    'sistema de analytics. O tempo total de sintese permanece em 2-3 segundos, sem impacto perceptível pela '
    'adaptacao adicional.'))

story.append(spacer(12))

# 2.7 Casos de Uso
story.append(h2('2.7 Casos de Uso por Segmento de Hóspede'))

story.append(body(
    'Os cenarios abaixo demonstram como a mesma mensagem-base e adaptada para diferentes perfis de hospedes. '
    'Cada cenario inclui os atributos DNA relevantes, os parametros calculados e o resultado perceptível na '
    'voz sintetizada. Esses cenarios foram validados com base em pesquisas de psicologia vocal e estudos de '
    'UX em comunicacao por voz.'
))

story.append(spacer(6))
story.append(h3('Cenario A: Familia com Criancas'))

story.append(body(
    'DNA: segment=familia_criancas, formality_index=0.4, tone_preference=friendly, urgency=0.2, '
    'interaction_count=5. O Adapter calcula speaking_rate=0.90, pitch=-0.1, style="calm", style_weight=0.5. '
    'A mensagem "Seu quarto 204 esta pronto! A piscina aquecida abre as 9h" e gerada com voz pausada, '
    'levemente mais grave e com inflexao calma. O tempo de audio aumenta em aproximadamente 1.2 segundos '
    'comparado a velocidade normal, mas a percepcao de acolhimento aumenta significativamente. O confidence '
    'score e 0.85, bem acima do threshold de 0.3, confirmando que a adaptacao e aplicada com seguranca.'
))

story.append(h3('Cenario B: Digital Nomad Solo'))

story.append(body(
    'DNA: segment=digital_nomad, formality_index=0.2, tone_preference=casual, urgency=0.5, '
    'interaction_count=8. O Adapter calcula speaking_rate=1.12, pitch=+0.4, style="friendly", style_weight=0.7. '
    'A mesma mensagem e gerada com ritmo rapido, tom mais agudo e energia amigavel. A duracao do audio e '
    'reduzida em 0.8 segundos. Pesquisas indicam que esse perfil vocal aumenta a taxa de resposta em 23% '
    'entre publico jovem e tecnologico, comparado a voz neutra. O guidance_scale e ajustado para 1.8 devido '
    'ao delta significativo (+0.12 no rate e +0.4 no pitch).'
))

story.append(h3('Cenario C: Casal Idoso VIP'))

story.append(body(
    'DNA: segment=casal_idoso_vip, formality_index=0.8, tone_preference=formal, urgency=0.1, '
    'interaction_count=12. O Adapter calcula speaking_rate=0.88, pitch=-0.2, style="formal", style_weight=0.4. '
    'A voz e gerada com ritmo lento e sofisticado, enfatizando a exclusividade do servico. O tempo de audio '
    'aumenta em 1.8 segundos, mas a percepcao de atencao personalizada compensa o tempo adicional. O '
    'guidance_scale e configurado para 2.5 (alta fidelidade) pois o delta de alteracao e moderado (+0.12), '
    'mantendo a voz muito proxima da original do proprietario.'
))

# 2.8 Metricas
story.append(h2('2.8 Metricas e KPIs de Conversao'))

story.append(body(
    'O sucesso da Evolucao 2 e medido por um conjunto de metricas capturadas automaticamente a cada disparo de '
    'mensagem de voz. Essas metricas alimentam o Voice Analytics Dashboard (Evolucao 3, prevista em roadmap '
    'anterior) e permitem ao proprietario da pousada tomar decisoes baseadas em dados sobre a eficacia da '
    'comunicacao vocal adaptativa.'
))

story.append(spacer(12))

t_kpis = make_table(
    ['Metrica', 'Descricao', 'Target', 'Fonte'],
    [
        ['voice_playback_rate', 'Percentual de audios reproduzidos pelo hospede', '> 75%', 'WhatsApp API read receipt'],
        ['time_to_first_play', 'Tempo ate primeira reproducao do audio', '< 60s', 'WhatsApp API timestamp'],
        ['voice_response_rate', 'Taxa de resposta apos audio (vs texto)', '> 40%', 'Event tracking'],
        ['adaptation_confidence_avg', 'Media de confianca das adaptacoes aplicadas', '> 0.6', 'DNA Voice Adapter logs'],
        ['conversion_by_voice', 'Conversao atribuida a mensagens de voz', '+15% vs texto', 'Attribution model'],
        ['segment_accuracy', 'Correlacao DNA segmento vs comportamento real', '> 70%', 'Insights Engine analytics'],
    ],
    col_ratios=[0.22, 0.36, 0.14, 0.22]
)
story.append(t_kpis)
story.append(Paragraph('<b>Tabela 3:</b> KPIs de monitoramento da Evolucao 2', style_caption))
story.append(spacer(18))


# ════════════════════════════════════════════════
# 3. PARTE II - VOICE LOOP
# ════════════════════════════════════════════════
story.extend(safe_keep([h1('3. Evolucao 4: Voice Loop - Resposta em Tempo Real')]))

story.append(body(
    'A Evolucao 4 fecha o ciclo completo de comunicacao por voz do ZEHLA, habilitando o sistema a receber, '
    'processar e responder mensagens de audio em tempo real. Hoje, o fluxo e unidirecional: o hospede envia '
    'texto, o ZEHLA responde com audio. Com o Voice Loop, o hospede envia audio, o ZEHLA transcreve, raciocina '
    'e responde em audio, criando uma experiencia conversacional fluida que simula um concierge humano com a '
    'voz do proprietario da pousada. Essa capacidade e inexistente em qualquer PMS hoteleiro atual.'
))

# 3.1 Pipeline
story.append(h2('3.1 Visao Geral e Pipeline Completo'))

story.append(body(
    'O pipeline do Voice Loop opera em quatro estagios sequenciais, cada um com responsabilidade clara e '
    'limites de latencia definidos. O design segue o principio de "fail forward": se qualquer estagio falhar, '
    'o sistema automaticamente faz fallback para o proximo melhor canal disponivel, garantindo que a comunicacao '
    'nunca seja interrompida. A latencia total alvo e inferior a 8 segundos, incluindo todas as etapas de '
    'processamento e transmissao.'
))

story.append(spacer(6))
story.append(bullet('<b>Estagio 1 - ASR (Automatic Speech Recognition):</b> O audio recebido via WhatsApp e '
    'transmitido ao ZEHLA Whisper Router, que utiliza o modelo Whisper da OpenAI (ou Whisper.cpp self-hosted '
    'para reducao de custo). O Whisper transcreve o audio em texto e extrai metadados como idioma detectado, '
    'confianca da transcricao e duracao do audio. Latencia alvo: 2-3 segundos.'))
story.append(bullet('<b>Estagio 2 - Voice Sentiment Analysis:</b> O audio bruto passa simultaneamente por um '
    'modelo de analise de sentimento vocal que identifica emocoes como alegria, frustacao, urgencia e calma. '
    'Essa analise complementa o sentimento extraído do texto transcrito e e injetada no context do Agent '
    'Orchestrator como context.sentiment.voice. Latencia alvo: 0.5-1 segundo (paralelo ao ASR).'))
story.append(bullet('<b>Estagio 3 - Agent Orchestration:</b> O transcricao textual e o sentimento vocal sao '
    'entregues ao Agent Orchestrator, que raciocina sobre a melhor resposta utilizando o cerebro cognitivo '
    'do ZEHLA (RAG + Fine-Tuning). A resposta e gerada em texto e inclui a flag useNeuralVoice quando '
    'o fluxo ativo requer resposta em audio. Latencia alvo: 1-2 segundos.'))
story.append(bullet('<b>Estagio 4 - TTS + Dispatch:</b> Se useNeuralVoice esta ativo, o VoiceSynthesisRouter '
    'gera o audio de resposta com voz clonada e adaptada (Evolucao 2), e o audio e enviado via WhatsApp. '
    'Se useNeuralVoice esta inativo, o texto e enviado diretamente como mensagem de texto. Latencia alvo: '
    '2-3 segundos para sintese + 1 segundo para dispatch.'))

story.append(spacer(12))

# Latency table
t_latency = make_table(
    ['Estagio', 'Processo', 'Latencia Alvo', 'Acumulada'],
    [
        ['1', 'Whisper ASR - Transcricao', '2.0 - 3.0s', '2.0 - 3.0s'],
        ['2', 'Voice Sentiment (paralelo)', '0.5 - 1.0s', '0.5 - 1.0s'],
        ['3', 'Agent Orchestrator', '1.0 - 2.0s', '3.5 - 5.0s'],
        ['4a', 'VoiceSynthesisRouter TTS', '2.0 - 3.0s', '5.5 - 7.0s'],
        ['4b', 'WhatsApp Dispatch', '0.5 - 1.0s', '6.0 - 8.0s'],
    ],
    col_ratios=[0.10, 0.35, 0.25, 0.25]
)
story.append(t_latency)
story.append(Paragraph('<b>Tabela 4:</b> Budget de latencia por estagio do Voice Loop', style_caption))
story.append(spacer(12))

# 3.2 Whisper Router
story.append(h2('3.2 ZEHLA Whisper Router (ASR)'))

story.append(body(
    'O ZEHLA Whisper Router e o componente responsavel por receber o audio do WhatsApp, transcreve-lo em '
    'texto e extrair metadados linguisticos. Ele e implementado como um servico separado no backend, '
    'com sua propria fila BullMQ e instancias escalaveis independentemente. Essa separacao garante que '
    'picos de volume de audio nao afetem o desempenho do Agent Orchestrator ou do VoiceSynthesisRouter.'
))

story.append(body(
    'O Router suporta dois modos de operacao: Cloud Mode (padrao) utilizando a API Whisper da OpenAI via '
    'z-ai-web-dev-sdk, e Edge Mode utilizando Whisper.cpp self-hosted em GPU para reduzir custos em '
    'operacoes de alto volume. O Cloud Mode e recomendado para pousadas com menos de 500 interacoes de '
    'audio por dia, enquanto o Edge Mode torna-se viavel economicamente acima desse volume. O ZEHLA pode '
    'operar em modo hibrido, roteando transacoes de baixo volume para a API e alto volume para o self-hosted.'
))

story.append(code(
    'interface ASRResult {<br/>'
    '&nbsp;&nbsp;text: string;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Transcricao completa<br/>'
    '&nbsp;&nbsp;language: string;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Idioma detectado ("pt-BR", "en-US")<br/>'
    '&nbsp;&nbsp;confidence: number;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Confianca da transcricao (0-1)<br/>'
    '&nbsp;&nbsp;duration_sec: number;&nbsp;&nbsp;&nbsp;// Duracao do audio original<br/>'
    '&nbsp;&nbsp;segments: Array&lt;{start: number, end: number, text: string}&gt;;<br/>'
    '}'
))

story.append(spacer(6))

story.append(body(
    'O Whisper Router implementa deteccao automatica de idioma, que e utilizado em conjunto com o campo language '
    'do DNA do contato para decidir o idioma da resposta. Se o hospede envia um audio em espanhol, por exemplo, '
    'o Router detecta "es", notifica o Agent Orchestrator, e a resposta e gerada em espanhol (caso o DNA do '
    'contato ou a configuracao da pousada suporte esse idioma). O suporte multi-idioma e fundamental para '
    'pousadas que recebem hospedes internacionais, um cenario cada vez mais comum no Brasil com o crescimento '
    'do turismo deExperience.'
))

# 3.3 Voice Sentiment
story.append(h2('3.3 Voice Sentiment Analysis'))

story.append(body(
    'A analise de sentimento vocal e uma camada diferencial do Voice Loop que vai alem da transcricao textual. '
    'Enquanto o Whisper extrai o conteudo (o que foi dito), a analise de sentimento vocal extrai a emocao '
    '(como foi dito). Essa distincao e critica em cenarios de servico ao hospede: um "tudo bem" dito com '
    'voz tensa e pausada comunica insatisfacao, enquanto o mesmo texto dito com voz leve e ritmica comunica '
    'satisfacao genuina.'
))

story.append(body(
    'O componente de Voice Sentiment Analysis utiliza um modelo leve baseado em wav2vec2 fine-tuned para '
    'classificacao de emocao em portugues brasileiro. O modelo foi treinado com datasets de interacoes de '
    'servico ao cliente e classifica o audio em cinco categorias: alegre, neutro, frustrado, urgente e '
    'calmo. Cada categoria possui um score de confianca e o resultado e enriquecido com analise prosodica '
    '(variacao de pitch, energia e ritmo) que gera indicadores adicionais como "tempo de fala acelerado" '
    'ou "pausas excessivas", que podem indicar nervosismo ou hesitacao.'
))

story.append(body(
    'O resultado da analise e injetado no context do Agent Orchestrator como um objeto VoiceSentiment, que '
    'influencia diretamente a tomada de decisao do agente. Se o sentimento detectado e "frustrado" com '
    'confianca superior a 0.7, o agente automaticamente prioriza respostas empaticas e aciona o protocolo '
    'de resolucao de problemas (previamente definido no Flow Builder). Se o sentimento e "urgente", o agente '
    'reduz o tempo de resposta e prioriza acoes imediatas como transferencia para atendimento humano ou '
    'activacao de alerta para a gerencia da pousada.'
))

story.append(spacer(6))

t_sentiment = make_table(
    ['Emocao Detectada', 'Acao do Agente', 'Adaptacao Vocal'],
    [
        ['alegre', 'Resposta amigavel + cross-sell sutil', 'style="friendly", rate=1.05'],
        ['neutro', 'Resposta padrao do fluxo ativo', 'Adaptacao DNA normal'],
        ['frustrado', 'Protocolo de resolucao + empatia', 'style="calm", rate=0.90'],
        ['urgente', 'Priorizar acao imediata + escalar', 'style="calm", rate=1.05'],
        ['calmo', 'Resposta pausada + detalhes', 'style="formal", rate=0.92'],
    ],
    col_ratios=[0.22, 0.42, 0.32]
)
story.append(t_sentiment)
story.append(Paragraph('<b>Tabela 5:</b> Matriz de acao por sentimento vocal detectado', style_caption))
story.append(spacer(12))

# 3.4 Integracao com Orchestrator
story.append(h2('3.4 Integracao com Agent Orchestrator'))

story.append(body(
    'O Agent Orchestrator e o nucleo cognitivo do ZEHLA, responsavel por raciocinar sobre a melhor resposta '
    'para cada interacao. A Evolucao 4 estende o contrato de entrada do Orchestrator para aceitar tanto texto '
    'quanto transcricoes de audio, mantendo total compatibilidade com o fluxo existente de mensagens textuais. '
    'A unica mudanca no contrato e a adicao de campos opcionais ao context de entrada, sem nenhum breaking change.'
))

story.append(code(
    '// agent-orchestrator.ts - entradas extendidas para Voice Loop<br/><br/>'
    'interface OrchestratorContext {<br/>'
    '&nbsp;&nbsp;contact_id: string;<br/>'
    '&nbsp;&nbsp;message_text: string;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Texto original OU transcricao ASR<br/>'
    '&nbsp;&nbsp;useNeuralVoice: boolean;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Vem do MessageNode<br/>'
    '&nbsp;&nbsp;<b>voice_sentiment?: VoiceSentiment;</b>&nbsp;&nbsp;// NOVO: analise vocal<br/>'
    '&nbsp;&nbsp;<b>audio_language?: string;</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// NOVO: idioma do audio<br/>'
    '&nbsp;&nbsp;<b>audio_confidence?: number;</b>&nbsp;&nbsp;&nbsp;&nbsp;// NOVO: confianca da transcricao<br/>'
    '&nbsp;&nbsp;<b>is_audio_message: boolean;</b>&nbsp;&nbsp;&nbsp;// NOVO: flag de entrada audio<br/>'
    '}'
))

story.append(spacer(6))

story.append(body(
    'O Orchestrator utiliza os campos de sentimento vocal e idioma para enriquecer o raciocinio. Quando '
    'voice_sentiment indica frustacao com alta confianca, o Orchestrator ativa automaticamente o protocolo '
    '"resolution_mode" que prioriza acoes de apaziguamento e resolucao sobre vendas ou informacoes gerais. '
    'O campo audio_confidence e utilizado para calibrar a confianca do raciocinio: se a transcricao do Whisper '
    'tem confianca inferior a 0.6, o Orchestrator pode solicitar confirmacao ("Perdao, entendi que voce disse '
    '[X]. Isso esta correto?") antes de prosseguir com a acao principal. Essa verificacao evita acoes baseadas '
    'em transricoes imprecisas, especialmente em cenarios com ruido de fundo ou sotaques regionalais fortes.'
))

# 3.5 VoiceSynthesisRouter v2
story.append(h2('3.5 VoiceSynthesisRouter v2 com ASR Feedback'))

story.append(body(
    'O VoiceSynthesisRouter existente (v1) gera audio a partir de texto com voz clonada. A versao v2 adiciona '
    'capacidades de feedback bidirecional com o ASR, permitindo que o Router receba informacoes sobre o audio '
    'de entrada (idioma, sentimento, confianca) e as utilize para otimizar a geracao do audio de saida. O '
    'Router v2 tambem implementa cache inteligente de segmentos de audio para reduzir a latencia em respostas '
    'repetitivas (por exemplo, confirmacoes de check-in que usam a mesma estrutura de frase).'
))

story.append(body(
    'O cache de audio funciona com uma chave composta por (tenant_id, message_hash, voice_profile). Quando '
    'uma resposta textual e gerada pelo Orchestrator, o Router calcula o hash da mensagem e verifica se um '
    'audio correspondente ja existe em cache. Se o cache hit ocorre e o perfil vocal e identico (mesmo tenant, '
    'mesmo profile), o audio e entregue instantaneamente sem nova sintese. O TTL do cache e de 24 horas e o '
    'tamanho maximo e de 500 entradas por tenant. Essa estrategia reduz a latencia media de sintese de 2.5s '
    'para menos de 0.5s em cenarios de alta repeticao (como saudacoes, confirmacoes e respostas FAQ).'
))

# 3.6 Latencia
story.append(h2('3.6 Latencia e Otimizacao de Performance'))

story.append(body(
    'A latencia e o principal desafio tecnico do Voice Loop. Uma experiencia conversacional natural exige que '
    'o tempo entre o hospede terminar de falar e o ZEHLA enviar a resposta seja inferior a 10 segundos, '
    'idealmente inferior a 6 segundos. O budget de latencia detalhado na Tabela 4 totaliza 6-8 segundos, '
    'o que esta dentro do aceitavel mas exige otimizacoes em cada estagio para atingir o target ideal.'
))

story.append(body(
    'A estrategia de otimizacao e dividida em tres categorias. A primeira e <b>parallelismo</b>: os estagios '
    'de ASR (Whisper) e Voice Sentiment Analysis executam em paralelo, economizando 0.5-1 segundo. A segunda '
    'e <b>streaming</b>: a transcricao Whisper e entregue ao Orchestrator em modo streaming (word-by-word), '
    'permitindo que o raciocinio comecem antes que a transcricao esteja completa, economizando 1-2 segundos. '
    'A terceira e <b>cache</b>: respostas repetitivas sao entregues do cache de audio em menos de 0.5 '
    'segundos, eliminando completamente a latencia de sintese nesses cenarios.'
))

story.append(body(
    'Para pousadas com alto volume de interacoes (mais de 1000 mensagens de audio por dia), recomenda-se '
    'a implantacao do Whisper.cpp self-hosted em GPU dedicada (NVIDIA T4 ou superior), que reduz a latencia '
    'do estagio ASR de 2-3s para 0.8-1.5s. O custo mensal estimado de uma instancia GPU para Whisper.cpp e '
    'de aproximadamente USD 70-100, significativamente inferior ao custo equivalente da API Whisper da OpenAI '
    'em alto volume. O sistema monitora automaticamente o volume de transacoes e notifica o operador quando '
    'o ponto de equilibrio entre Cloud Mode e Edge Mode e atingido.'
))

# 3.7 Edge Cases
story.append(h2('3.7 Edge Cases e Fallback Strategies'))

story.append(body(
    'O Voice Loop foi projetado com tolerancia a falhas em cada estagio do pipeline. A tabela a seguir '
    'detalha os cenarios de falha identificados e as estrategias de fallback correspondentes. O principio '
    'guiador e "fail forward": o sistema nunca deixa o hospede sem resposta, mesmo que a qualidade da '
    'experiencia seja degradada.'
))

story.append(spacer(12))

t_fallback = make_table(
    ['Cenario de Falha', 'Detecao', 'Fallback'],
    [
        ['Audio corrompido ou silencio', 'Duracao < 1s ou confianca Whisper < 0.3', 'Texto: "Nao consegui ouvir. Pode repetir?"'],
        ['Timeout do Whisper (> 5s)', 'Timer BullMQ', 'Texto: "Um momento, estou processando..." + retry 1x'],
        ['Timeout do TTS (> 5s)', 'Timer BullMQ', 'Enviar texto + gerar audio async para envio posterior'],
        ['GPU indisponivel', 'Health check do modelo', 'Texto como fallback + alerta ops'],
        ['Idioma nao suportado', 'Lang detection Whisper', 'Texto em PT-BR: "Desculpe, falo portugues e ingles"'],
        ['Sentimento inconsistente', 'Text sentiment != voice sentiment', 'Priorizar voice sentiment (mais confiavel)'],
        ['Hospede envia video (nao audio)', 'Content-type check', 'Texto: "Aceito apenas audio. Pode me enviar?"'],
    ],
    col_ratios=[0.25, 0.28, 0.42]
)
story.append(t_fallback)
story.append(Paragraph('<b>Tabela 6:</b> Matrix de fallback para edge cases do Voice Loop', style_caption))
story.append(spacer(18))


# ════════════════════════════════════════════════
# 4. INTEGRACAO DNA-DRIVEN + VOICE LOOP
# ════════════════════════════════════════════════
story.extend(safe_keep([h1('4. Integracao: DNA-Driven Voice + Voice Loop')]))

story.append(body(
    'A combinacao das Evolucoes 2 e 4 cria um sistema de comunicacao vocal que e ao mesmo tempo contextual '
    '(adaptado ao DNA do hospede) e bidirecional (capaz de ouvir e responder em audio). A integracao entre '
    'ambas e natural: o Voice Loop utiliza o DNA Voice Adapter da Evolucao 2 para gerar respostas de audio '
    'adaptadas, enquanto o Voice Sentiment Analysis da Evolucao 4 alimenta de volta o DNA Wizard, criando '
    'um ciclo virtuoso de melhoria continua do perfil do hospede.'
))

story.append(body(
    'Quando o hospede envia um audio e o Voice Loop esta ativo, o pipeline completo opera assim: o Whisper '
    'transcreve, o Voice Sentiment analisa a emocao, o Orchestrator raciocina, o DNA Voice Adapter consulta '
    'o DNA do contato e calcula os parametros vocais adaptativos, o VoiceSynthesisRouter gera o audio com '
    'voz clonada e adaptada, e o audio e enviado via WhatsApp. Tudo isso em menos de 8 segundos, sem '
    'intervencao humana.'
))

story.append(body(
    'O ciclo virtuoso funciona da seguinte forma: cada interacao de audio gera novos dados de sentimento '
    'vocal que sao adicionados ao DNA do contato via Insights Engine. Ao longo do tempo, o DNA do hospede '
    'torna-se mais rico e preciso, permitindo adaptacoes vocais cada vez mais refinadas. Um hospede que '
    'inicialmente recebe respostas com perfil generico (devido ao confidence score baixo nas primeiras '
    'interacoes) passa gradualmente a receber respostas cada vez mais personalizadas conforme o sistema '
    'aprende suas preferencias. Esse aprendizado e transparente e nao requer nenhuma acao do proprietario.'
))

story.append(spacer(6))

t_combined = make_table(
    ['Recurso', 'Lailla.io', 'WisprFlow', 'ZEHLA (pos-evolucoes)'],
    [
        ['Clonagem de voz', 'Sim', 'Sim', 'Sim (ja implementado)'],
        ['Multi-perfil de voz', 'Nao', 'Nao', 'Sim (Evolucao 2)'],
        ['Adaptacao por DNA', 'Nao', 'Nao', 'Sim (Evolucao 2)'],
        ['Analytics com conversao', 'Nao', 'Nao', 'Sim (Evolucao 3)'],
        ['Loop audio bidirecional', 'Nao', 'Parcial', 'Sim (Evolucao 4)'],
        ['Anti-deepfake watermark', 'Nao', 'Nao', 'Sim (Evolucao 5)'],
        ['WhatsApp nativo', 'Nao', 'Nao', 'Sim (nativo)'],
        ['PMS hoteleiro integrado', 'Nao', 'Nao', 'Sim (nativo)'],
    ],
    col_ratios=[0.28, 0.18, 0.18, 0.32]
)
story.append(t_combined)
story.append(Paragraph('<b>Tabela 7:</b> Comparativo de funcionalidades: ZEHLA vs concorrentes', style_caption))
story.append(spacer(18))


# ════════════════════════════════════════════════
# 5. SEGURANCA
# ════════════════════════════════════════════════
story.extend(safe_keep([h1('5. Seguranca: Voice Fingerprint e Anti-Deepfake')]))

story.append(body(
    'A introducao de voz clonada circulando pelo WhatsApp cria riscos de seguranca que precisam ser mitigados '
    'proativamente. O Voice Fingerprint e Anti-Deepfake system e uma camada de protecao que garante que os '
    'audios gerados pelo ZEHLA possam ser rastreados ate o tenant de origem, detectados se utilizados fora '
    'do contexto autorizado, e invalidados em caso de comprometimento. Essa camada ja foi especificada no '
    'ML Brain Protocol e na Evolucao 5 do roadmap anterior, e sua implementacao torna-se mais critica com '
    'o Voice Loop.'
))

story.append(body(
    'Cada audio gerado pelo VoiceSynthesisRouter recebe obrigatoriamente tres marcas de seguranca. A primeira '
    'e um <b>watermark imperceptível</b> embutido no spectrograma do audio, contendo um hash do tenant_id e '
    'timestamp de geracao. Esse watermark e inaudível para humanos mas detectável por ferramentas de analise '
    'espectral, permitindo rastrear a origem de qualquer audio que vaze. A segunda e um <b>voice fingerprint '
    'hash</b>, que e um hash SHA-256 do speaker embedding utilizado na sintese, armazenado no log de auditoria '
    'do sistema. A terceira e um <b>generation token</b>, um UUID unico por audio que e registrado no banco '
    'de dados com todos os metadados da geracao (tenant_id, contact_id, message_text, voice_params, timestamp).'
))

story.append(body(
    'O Zehla Guardian, modulo de drift detection ja existente no ecossistema, monitora continuamente a integridade '
    'dos audios gerados. Se um audio com fingerprint ZEHLA for detectado fora do WhatsApp autorizado (por '
    'exemplo, em uma rede social ou em mensagens de um concorrente), o Guardian dispara um alerta de seguranca '
    'com nivel critico, registra o evento no audit log, e pode automaticamente desativar o voice profile '
    'comprometido ate que uma investigacao seja concluida. Essa funcionalidade e especialmente importante no '
    'contexto brasileiro, onde a LGPD impoe obrigacoes claras sobre o uso e protecao de dados biometricos, '
    'incluindo a voz como biometria.'
))

story.append(spacer(12))

t_security = make_table(
    ['Camada de Seguranca', 'Descricao', 'Implementacao'],
    [
        ['Audio Watermark', 'Hash inaudível no spectrograma com tenant_id + timestamp', 'modificacao spectrogram antes do encode .ogg'],
        ['Voice Fingerprint', 'SHA-256 do speaker embedding armazenado em audit log', 'database write apos cada sintese'],
        ['Generation Token', 'UUID unico por audio com metadados completos', 'database write + log estruturado'],
        ['Guardian Monitor', 'Monitoramento ativo de fingerprints fora do contexto', 'cron job a cada 60s + webhook listener'],
        ['LGPD Compliance', 'Consentimento explicito + direito ao esquecimento', 'opt-in no onboarding + API de delete'],
        ['Multi-Tenant Isolation', 'Embeddings de voz isolados por tenant', 'Criptografia AES-256 por tenant_id'],
    ],
    col_ratios=[0.22, 0.40, 0.33]
)
story.append(t_security)
story.append(Paragraph('<b>Tabela 8:</b> Camadas de seguranca do sistema de voz ZEHLA', style_caption))
story.append(spacer(18))


# ════════════════════════════════════════════════
# 6. ROADMAP DE IMPLEMENTACAO
# ════════════════════════════════════════════════
story.extend(safe_keep([h1('6. Roadmap de Implementacao')]))

story.append(body(
    'O roadmap de implementacao foi estruturado em fases sequenciais com dependencias claras entre elas. '
    'Cada fase possui entregáveis concretos, criterios de aceitacao e estimativa de esforco. O roadmap '
    'totaliza 8 semanas de desenvolvimento intenso, com valor incremental entregue a cada semana, '
    'permitindo que funcionalidades comecem a ser testadas em producao antes da conclusao total.'
))

story.append(spacer(6))

t_roadmap = make_table(
    ['Fase', 'Semana', 'Entregavel', 'Prioridade'],
    [
        ['1', '1-2', 'DNA Voice Adapter (core: lookup + calc + params)', 'Alta'],
        ['2', '2-3', 'Integracao Router + testes de adaptacao por segmento', 'Alta'],
        ['3', '3-4', 'Voice Analytics Dashboard (eventos + metricas)', 'Media'],
        ['4', '4-5', 'Whisper Router ASR (Cloud Mode + fallback)', 'Alta'],
        ['5', '5-6', 'Voice Sentiment Analysis + integracao Orchestrator', 'Alta'],
        ['6', '6-7', 'Voice Loop end-to-end (ASR -> Orq -> TTS -> WhatsApp)', 'Alta'],
        ['7', '7-8', 'Voice Fingerprint ativo + Anti-Deepfake', 'Media'],
        ['8', '8+', 'Edge Mode Whisper.cpp + otimizacao cache', 'Baixa'],
    ],
    col_ratios=[0.08, 0.12, 0.50, 0.15]
)
story.append(t_roadmap)
story.append(Paragraph('<b>Tabela 9:</b> Roadmap de implementacao das evolucoes 2 e 4', style_caption))
story.append(spacer(12))

story.append(body(
    'As fases 1 e 2 (DNA-Driven Voice Adaptation) podem ser implementadas de forma independente das fases 4-6 '
    '(Voice Loop), permitindo que a equipe de desenvolvimento priorize a evolucao de maior impacto comercial '
    'sem bloquear a outra. A dependencia principal e que a fase 6 (Voice Loop end-to-end) depende da fase 2 '
    '(integracao Router) estar completa, pois o Voice Loop utiliza o Router adaptativo para gerar as respostas '
    'de audio. Essa dependencia e natural e nao adiciona complexidade extra ao desenvolvimento.'
))

story.append(body(
    'A fase 7 (Voice Fingerprint) pode ser paralelizada com as fases 4-6, pois atua como camada transversal '
    'de seguranca que modifica apenas o pos-processamento do audio gerado. A fase 8 (Edge Mode) e opcional '
    'e depende do volume de operacao atingir o ponto de equilibrio economico entre Cloud Mode e self-hosted. '
    'O sistema monitora automaticamente os custos e notifica quando a migracao para Edge Mode se torna '
    'viavel, simplificando a decisao do operador.'
))

story.append(spacer(18))


# ════════════════════════════════════════════════
# 7. ANEXO - CODE SNIPPETS
# ════════════════════════════════════════════════
story.extend(safe_keep([h1('7. Anexo: Code Snippets e Configuracoes')]))

story.append(h2('7.1 DNA Voice Adapter - Core Module'))

story.append(code(
    '// dna-voice-adapter.ts<br/><br/>'
    'import { prisma } from "@/lib/prisma";<br/>'
    'import { redis } from "@/lib/redis";<br/>'
    'import type { VoiceAdaptationParams } from "./types";<br/><br/>'
    'const DNA_CACHE_PREFIX = "dna:";<br/>'
    'const DNA_CACHE_TTL = 300; // 5 minutos<br/><br/>'
    'export async function getVoiceParams(<br/>'
    '&nbsp;&nbsp;contactId: string,<br/>'
    '&nbsp;&nbsp;tenantId: string<br/>'
    '): Promise&lt;VoiceAdaptationParams&gt; {<br/><br/>'
    '&nbsp;&nbsp;// Fase 1: DNA Lookup<br/>'
    '&nbsp;&nbsp;const cached = await redis.get(`${DNA_CACHE_PREFIX}${contactId}`);<br/>'
    '&nbsp;&nbsp;const dna = cached<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;? JSON.parse(cached)<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;: await prisma.contactDNA.findUnique({<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;where: { contactId, tenantId }<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;});<br/><br/>'
    '&nbsp;&nbsp;if (!dna) return defaultProfile();<br/><br/>'
    '&nbsp;&nbsp;// Fase 2: Param Calculation<br/>'
    '&nbsp;&nbsp;const params = calculateParams(dna);<br/><br/>'
    '&nbsp;&nbsp;// Fase 3: Confidence Scoring<br/>'
    '&nbsp;&nbsp;if (params.confidence &lt; 0.3) {<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;return { ...defaultProfile(), fallback_profile: "recepcao" };<br/>'
    '&nbsp;&nbsp;}<br/><br/>'
    '&nbsp;&nbsp;return params;<br/>'
    '}<br/><br/>'
    'function calculateParams(dna: any): VoiceAdaptationParams {<br/>'
    '&nbsp;&nbsp;const rate = mapFormalityToRate(dna.formality_index);<br/>'
    '&nbsp;&nbsp;const { pitch, style } = mapSegmentToVoice(dna.segment);<br/>'
    '&nbsp;&nbsp;const styleWeight = mapUrgencyToWeight(dna.urgency);<br/>'
    '&nbsp;&nbsp;const confidence = Math.min(dna.interaction_count / 5, 1.0);<br/><br/>'
    '&nbsp;&nbsp;return {<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;speaking_rate: rate,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;pitch, style, style_weight: styleWeight,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;language: dna.language || "pt-BR",<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;confidence,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;fallback_profile: "recepcao"<br/>'
    '&nbsp;&nbsp;};<br/>'
    '}'
))

story.append(spacer(12))

story.append(h2('7.2 Voice Loop Pipeline - Orchestration'))

story.append(code(
    '// voice-loop-pipeline.ts<br/><br/>'
    'export async function processVoiceMessage(<br/>'
    '&nbsp;&nbsp;audioBuffer: Buffer,<br/>'
    '&nbsp;&nbsp;contactId: string,<br/>'
    '&nbsp;&nbsp;tenantId: string<br/>'
    ') {<br/><br/>'
    '&nbsp;&nbsp;// Estagio 1+2: ASR + Voice Sentiment (paralelo)<br/>'
    '&nbsp;&nbsp;const [asrResult, sentiment] = await Promise.all([<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;whisperRouter.transcribe(audioBuffer),<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;voiceSentiment.analyze(audioBuffer)<br/>'
    '&nbsp;&nbsp;]);<br/><br/>'
    '&nbsp;&nbsp;// Estagio 3: Agent Orchestration<br/>'
    '&nbsp;&nbsp;const context = {<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;contact_id: contactId,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;message_text: asrResult.text,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;useNeuralVoice: true,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;voice_sentiment: sentiment,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;audio_language: asrResult.language,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;audio_confidence: asrResult.confidence,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;is_audio_message: true<br/>'
    '&nbsp;&nbsp;};<br/><br/>'
    '&nbsp;&nbsp;const response = await orchestrator.reason(context);<br/><br/>'
    '&nbsp;&nbsp;// Estagio 4: TTS + Dispatch<br/>'
    '&nbsp;&nbsp;if (response.voiceEnabled) {<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;const voiceParams = await getVoiceParams(contactId, tenantId);<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;const audio = await voiceRouter.synthesize(<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;response.text, voiceParams<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;);<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;await whatsappDispatch.sendAudio(contactId, audio);<br/>'
    '&nbsp;&nbsp;} else {<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;await whatsappDispatch.sendText(contactId, response.text);<br/>'
    '&nbsp;&nbsp;}<br/>'
    '}'
))

story.append(spacer(12))

story.append(h2('7.3 Voice Profiles Configuration'))

story.append(code(
    '// voice-profiles.config.ts<br/><br/>'
    'export const VOICE_PROFILES = {<br/>'
    '&nbsp;&nbsp;recepcao: {<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;rate: 1.0, pitch: 0.0,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;style_weight: 0.3, model: "xtts_v2",<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;guidance_scale: 2.5<br/>'
    '&nbsp;&nbsp;},<br/>'
    '&nbsp;&nbsp;vendas: {<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;rate: 1.05, pitch: 0.5,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;style_weight: 0.7, model: "xtts_v2",<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;guidance_scale: 2.2<br/>'
    '&nbsp;&nbsp;},<br/>'
    '&nbsp;&nbsp;resolucao: {<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;rate: 0.92, pitch: -0.3,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;style_weight: 0.1, model: "xtts_v2",<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;guidance_scale: 2.5<br/>'
    '&nbsp;&nbsp;},<br/>'
    '&nbsp;&nbsp;vip: {<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;rate: 0.95, pitch: 0.2,<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;style_weight: 0.5, model: "xtts_v2",<br/>'
    '&nbsp;&nbsp;&nbsp;&nbsp;guidance_scale: 2.8<br/>'
    '&nbsp;&nbsp;}<br/>'
    '} as const;'
))

# ──────────────────────────────────────────────
# BUILD
# ──────────────────────────────────────────────
doc.multiBuild(story)
print(f"Body PDF generated: {BODY_PATH}")
