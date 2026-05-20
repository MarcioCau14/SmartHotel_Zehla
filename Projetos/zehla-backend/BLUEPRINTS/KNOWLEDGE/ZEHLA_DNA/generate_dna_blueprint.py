#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ZEHLA DNA Wizard & Insights Engine - 3 Pillars Blueprint
Pilar 1: Termometro de Tom (Tone Thermometer)
Pilar 2: Chaves de Desconto (Discount Keys)
Pilar 3: Dores de Operacao (Operational Pains / Insights Engine)
"""

import sys, os, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether,
    CondPageBreak, Image
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.platypus import SimpleDocTemplate
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FONT REGISTRATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
pdfmetrics.registerFont(TTFont('NotoSerifSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSCBold', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerif', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('CarlitoBold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))

registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSCBold')
registerFontFamily('DejaVuSerif', normal='DejaVuSerif', bold='DejaVuSerif')
registerFontFamily('Carlito', normal='Carlito', bold='CarlitoBold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COLOR PALETTE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCENT       = colors.HexColor('#522cc6')
ACCENT_LIGHT = colors.HexColor('#f0ecfa')
TEXT_PRIMARY  = colors.HexColor('#1e2021')
TEXT_MUTED    = colors.HexColor('#858b91')
BG_SURFACE   = colors.HexColor('#d5dadf')
BG_PAGE      = colors.HexColor('#eaecee')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LAYOUT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE_W, PAGE_H = A4
LEFT_M = 1.0 * inch
RIGHT_M = 1.0 * inch
TOP_M = 0.9 * inch
BOTTOM_M = 0.9 * inch
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STYLES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
title_style = ParagraphStyle(name='DocTitle', fontName='DejaVuSerif', fontSize=26, leading=34, alignment=TA_LEFT, textColor=ACCENT, spaceAfter=6)
h1_style = ParagraphStyle(name='H1', fontName='DejaVuSerif', fontSize=19, leading=26, alignment=TA_LEFT, textColor=ACCENT, spaceBefore=18, spaceAfter=10)
h2_style = ParagraphStyle(name='H2', fontName='DejaVuSerif', fontSize=14, leading=21, alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=8)
h3_style = ParagraphStyle(name='H3', fontName='CarlitoBold', fontSize=11.5, leading=17, alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6)
body_style = ParagraphStyle(name='Body', fontName='Carlito', fontSize=10.5, leading=17, alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6, wordWrap='CJK')
body_indent = ParagraphStyle(name='BodyIndent', fontName='Carlito', fontSize=10.5, leading=17, alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceBefore=0, spaceAfter=6, leftIndent=20, wordWrap='CJK')
bullet_style = ParagraphStyle(name='Bullet', fontName='Carlito', fontSize=10.5, leading=17, alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceBefore=2, spaceAfter=4, leftIndent=28, bulletIndent=14, bulletFontName='Carlito', bulletFontSize=10.5)
code_style = ParagraphStyle(name='Code', fontName='SarasaMonoSC', fontSize=8.5, leading=13, alignment=TA_LEFT, textColor=colors.HexColor('#1a1a2e'), backColor=colors.HexColor('#f4f4f8'), spaceBefore=4, spaceAfter=4, leftIndent=14, borderColor=TEXT_MUTED, borderWidth=0.5, borderPadding=6, wordWrap='CJK')
callout_style = ParagraphStyle(name='Callout', fontName='Carlito', fontSize=10.5, leading=17, alignment=TA_LEFT, textColor=ACCENT, spaceBefore=6, spaceAfter=6, leftIndent=20, borderColor=ACCENT, borderWidth=2, borderPadding=8, backColor=ACCENT_LIGHT)
caption_style = ParagraphStyle(name='Caption', fontName='Carlito', fontSize=9, leading=14, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceBefore=3, spaceAfter=6)
toc_h1 = ParagraphStyle(name='TOCH1', fontSize=13, leftIndent=20, fontName='DejaVuSerif', leading=22, textColor=TEXT_PRIMARY)
toc_h2 = ParagraphStyle(name='TOCH2', fontSize=11, leftIndent=40, fontName='DejaVuSerif', leading=18, textColor=TEXT_MUTED)
header_cell = ParagraphStyle(name='HeaderCell', fontName='CarlitoBold', fontSize=10, leading=14, alignment=TA_CENTER, textColor=colors.white)
body_cell = ParagraphStyle(name='BodyCell', fontName='Carlito', fontSize=9.5, leading=14, alignment=TA_LEFT, textColor=TEXT_PRIMARY, wordWrap='CJK')
body_cell_c = ParagraphStyle(name='BodyCellC', fontName='Carlito', fontSize=9.5, leading=14, alignment=TA_CENTER, textColor=TEXT_PRIMARY)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TOC TEMPLATE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

MAX_KEEP = A4[1] * 0.4
def safe_keep(elements):
    total = 0
    for el in elements:
        w, h = el.wrap(CONTENT_W, A4[1])
        total += h
    if total <= MAX_KEEP:
        return [KeepTogether(elements)]
    elif len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)

def make_table(data, col_widths, caption_text=None):
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(cmds))
    elems = [Spacer(1, 18), t]
    if caption_text:
        elems.append(Spacer(1, 6))
        elems.append(Paragraph(caption_text, caption_style))
    elems.append(Spacer(1, 18))
    return elems

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PATHS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BODY_PATH = '/home/z/my-project/download/ZEHLA_DNA_body.pdf'

doc = TocDocTemplate(BODY_PATH, pagesize=A4, leftMargin=LEFT_M, rightMargin=RIGHT_M, topMargin=TOP_M, bottomMargin=BOTTOM_M)

story = []

# ─── TOC ───
story.append(Paragraph('<b>Table of Contents</b>', title_style))
story.append(Spacer(1, 12))
toc = TableOfContents()
toc.levelStyles = [toc_h1, toc_h2]
story.append(toc)
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# INTRODUCTION: WHY THIS MATTERS
# ═══════════════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>Introducao: O DNA do Sucesso da Sua Pousada</b>', h1_style, 0),
    Paragraph(
        'O mercado de pousadas no Brasil gera R$ 12 bilhoes por ano e emprega mais de 500.000 pessoas diretamente. '
        'Ainda assim, a maioria absoluta dos proprietarios opera de forma artesanal: sem CRM, sem automacao, sem '
        'mensuracao. O WhatsApp e o canal principal de comunicacao com hóspedes, mas 89% dos pousadeiros nao '
        'tem nenhuma ferramenta de analise sobre o que acontece nessas conversas. Cada mensagem e uma transacao '
        'comercial que acontece no escuro, sem rastreamento, sem inteligencia, sem aprendizado.',
        body_style
    ),
    Paragraph(
        'O SMARTHOTEL nao e um chatbot generico. O SMARTHOTEL mapeia o DNA de operacao de cada pousada e cria '
        'uma IA que replica a essencia do dono: o tom de voz, a estrategia de precos, a forma de negociar descontos, '
        'e a capacidade de entender o que os hóspedes realmente querem. Para que isso funcione, precisamos coletar '
        'tres conjuntos de informacoes criticas durante o onboarding, cada um representando um pilar fundamental '
        'da personalizacao da IA. Sem esses dados, a IA sera generica. Com eles, sera uma extensao inteligente '
        'do proprio proprietario.',
        body_style
    ),
    Paragraph(
        '"Nao estamos apenas instalando um bot; estamos mapeando o DNA do sucesso da sua pousada para que voce '
        'possa escalar sem perder a sua essencia." Este e o posicionamento que diferencia o SMARTHOTEL de qualquer '
        'concorrente. E os tres pilares a seguir sao o combustivel que transforma essa promessa em realidade.',
        callout_style
    ),
    Paragraph(
        'Este blueprint detalha cada pilar com: (a) a fundamentacao estrategica de por que coletar cada dado, '
        '(b) o formato tecnico de como esses dados sao armazenados no ZEHLA Brain, (c) exemplos praticos de como '
        'a IA utiliza cada informacao em tempo real, e (d) templates prontos para implementacao no formulario '
        'de onboarding. Cada pilar alimenta diretamente o pipeline de eventos da Fase 4 (Capture, Validate, '
        'Enrich, Classify, Act), gerando um ciclo virtuoso de aprendizado continuo.',
        body_style
    ),
])

# Overview table of 3 pillars
pillar_overview = [
    [Paragraph('<b>Pilar</b>', header_cell),
     Paragraph('<b>Objetivo</b>', header_cell),
     Paragraph('<b>Output para a IA</b>', header_cell),
     Paragraph('<b>Alimenta</b>', header_cell)],
    [Paragraph('<b>Pilar 1</b>: Termometro de Tom', body_cell),
     Paragraph('Mapear a personalidade de comunicacao do dono', body_cell),
     Paragraph('System Prompt personalizado com tom, vocabulario e estilo', body_cell),
     Paragraph('DNA Wizard', body_cell_c)],
    [Paragraph('<b>Pilar 2</b>: Chaves de Desconto', body_cell),
     Paragraph('Definir limites autonomos de negociacao de precos', body_cell),
     Paragraph('Regras de pricing com triggers, limites e aprovacao', body_cell),
     Paragraph('Pricing Engine', body_cell_c)],
    [Paragraph('<b>Pilar 3</b>: Dores de Operacao', body_cell),
     Paragraph('Descobrir metricas ocultas que o pousadeiro nao consegue medir', body_cell),
     Paragraph('Dashboard de Insights com KPIs que ele nem sabia que existiam', body_cell),
     Paragraph('Insights Engine', body_cell_c)],
]
cw = [CONTENT_W * 0.18, CONTENT_W * 0.28, CONTENT_W * 0.32, CONTENT_W * 0.22]
story.extend(make_table(pillar_overview, cw, '<b>Tabela 1:</b> Visao geral dos 3 pilares do onboarding SMARTHOTEL'))


# ═══════════════════════════════════════════════════════════════
# PILLAR 1: TERMOMETRO DE TOM
# ═══════════════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>Pilar 1: Termometro de Tom (Tone Thermometer)</b>', h1_style, 0),
    Paragraph(
        'O Termometro de Tom e o mecanismo pelo qual o SMARTHOTEL captura a personalidade de comunicacao do '
        'proprietario da pousada e a traduz em instruções precisas para a IA. O conceito central e que cada '
        'pousadeiro tem um "tom natural" de comunicacao que e parte do seu branding, da sua relacao com os '
        'hóspedes e do seu diferencial competitivo. Um pousadeiro charmoso em Paraty que fala como um "amigao '
        'de infancia" tem uma vantagem competitiva que um bot robotico destruiria em 2 segundos de conversa.',
        body_style
    ),
    Paragraph(
        'A pesquisa da Booking.com (2024) mostra que 78% dos hóspedes de pousadas consideram a "atendimento '
        'personalizado e acolhedor" como o fator numero 1 na escolha da hospedagem, acima de preco e localizacao. '
        'O problema e que, quando o pousadeiro atende 30 mensagens por dia no WhatsApp, a qualidade dessa '
        'personalizacao degrada drasticamente. O Termometro de Tom resolve isso ao criar uma replica fiel do '
        'estilo de comunicacao do dono que opera 24/7 sem perder a essencia.',
        body_style
    ),

    add_heading('<b>1.1 A Escala de Tom: 5 Arquétipos de Comunicao</b>', h2_style, 1),
    Paragraph(
        'O formulario de onboarding apresenta ao pousadeiro uma escala visual com 5 posicoes, cada uma '
        'representando um arquetipo de comunicacao distinto. O dono escolhe uma posicao (ou uma combinacao '
        'de duas adjacentes) e a IA calibra seu system prompt automaticamente. A escala foi projetada para '
        'ser intuitiva e visual: o pousadeiro nao precisa entender de IA ou prompt engineering, apenas '
        'reconhecer como ele fala no dia a dia com seus hóspedes.',
        body_style
    ),
])

tone_table = [
    [Paragraph('<b>Posicao</b>', header_cell),
     Paragraph('<b>Arquetipo</b>', header_cell),
     Paragraph('<b>Exemplo de Mensagem</b>', header_cell),
     Paragraph('<b>Caracteristicas</b>', header_cell)],
    [Paragraph('1', body_cell_c),
     Paragraph('<b>Amigao de Infancia</b>', body_cell),
     Paragraph('"Eaaa, que bom que voce entrou em contato! Vai ser demais ter voce aqui, juro!"', body_cell),
     Paragraph('Informal, empolgado, usa emojis, gergica informal, truncamento de palavras', body_cell)],
    [Paragraph('2', body_cell_c),
     Paragraph('<b>Anfitriao Carinhoso</b>', body_cell),
     Paragraph('"Que alegria receber seu contato! Nossa pousada vai ser o refugio perfeito para suas ferias."', body_cell),
     Paragraph('Acolhedor, caloroso, com emojis moderados, vocabulario afetuoso', body_cell)],
    [Paragraph('3', body_cell_c),
     Paragraph('<b>Host Profissional</b>', body_cell),
     Paragraph('"Ola! Fico feliz pelo seu interesse. Temos disponibilidade e gostaria de apresentar nossas opcoes."', body_cell),
     Paragraph('Equilibrado, educado, direto com polidez, emojis ocasionais', body_cell)],
    [Paragraph('4', body_cell_c),
     Paragraph('<b>Concierge Exclusivo</b>', body_cell),
     Paragraph('"Bom dia. Temos o prazer de informar que nossa suíte master esta disponivel para as datas solicitadas."', body_cell),
     Paragraph('Formal, elegante, vocabulario sofisticado, sem emojis', body_cell)],
    [Paragraph('5', body_cell_c),
     Paragraph('<b>Gerente de Hotel 5 Estrelas</b>', body_cell),
     Paragraph('"Prezado(a) hóspede. Confirmamos a disponibilidade do apartamento. Gostaria de prosseguir com a reserva?"', body_cell),
     Paragraph('Ultra-formal, protocolar, tratamento por senioridade, linguagem corporativa', body_cell)],
]
cw1 = [CONTENT_W * 0.08, CONTENT_W * 0.17, CONTENT_W * 0.42, CONTENT_W * 0.33]
story.extend(make_table(tone_table, cw1, '<b>Tabela 2:</b> Escala de Tom - 5 arquétipos de comunicacao com exemplos'))

story.extend([
    add_heading('<b>1.2 Dimensoes Complementares do Tom</b>', h2_style, 1),
    Paragraph(
        'Alem da posicao principal na escala, o formulario captura 4 dimensoes complementares que refinam '
        'o comportamento da IA. A primeira dimensao e o "Nivel de Proatividade", que define o quanto a IA '
        'deve tomar iniciativa na conversa: Proativo (sugere datas, pacotes e passeios sem ser perguntada), '
        'Reativo (responde ao que o hóspede pergunta com eficiencia) ou Híbrido (proativo em contexto de '
        'venda, reativo em suporte). A segunda dimensao e o "Uso de Emojis", com 3 niveis: Generoso (3-5 '
        'emojis por mensagem), Moderado (1-2 emojis, so em saudacoes e encerramentos) e Minimalista (sem '
        'emojis, apenas pontuacao e formatacao).',
        body_style
    ),
    Paragraph(
        'A terceira dimensao e o "Tratamento" preferido: Voce (informal, para pousadas boutique e jovens), '
        'O Senhor / A Senhora (formal, para pousadas premium), ou Adaptativo (a IA ajusta com base no '
        'perfil do hóspede). A quarta dimensao e a "Velocidade de Resposta" percebida, que nao define a '
        'velocidade tecnica (sempre instantanea), mas sim o estilo de resposta: Imediato (responde direto '
        'sem preambulos), Contextualizado (inclui saudacao e contexto antes da resposta) ou Consultivo '
        '(faz perguntas adicionais antes de oferecer solucoes, demonstrando interesse genuino).',
        body_style
    ),
])

dim_table = [
    [Paragraph('<b>Dimensao</b>', header_cell),
     Paragraph('<b>Opcao A</b>', header_cell),
     Paragraph('<b>Opcao B</b>', header_cell),
     Paragraph('<b>Opcao C</b>', header_cell)],
    [Paragraph('Proatividade', body_cell), Paragraph('Proativo (sugere espontaneamente)', body_cell), Paragraph('Reativo (responde com eficiencia)', body_cell), Paragraph('Hibrido (proativo em venda)', body_cell)],
    [Paragraph('Emojis', body_cell), Paragraph('Generoso (3-5 por msg)', body_cell), Paragraph('Moderado (1-2, em saudacoes)', body_cell), Paragraph('Minimalista (sem emojis)', body_cell)],
    [Paragraph('Tratamento', body_cell), Paragraph('Voce (informal)', body_cell), Paragraph('Senhor/Senhora (formal)', body_cell), Paragraph('Adaptativo (ajusta pelo perfil)', body_cell)],
    [Paragraph('Estilo Resposta', body_cell), Paragraph('Imediato (direto)', body_cell), Paragraph('Contextualizado (com saudacao)', body_cell), Paragraph('Consultivo (pergunta antes)', body_cell)],
    [Paragraph('Gergica', body_cell), Paragraph('Informal (tudo minusculo)', body_cell), Paragraph('Normal (convencional)', body_cell), Paragraph('Cuidadoso (sem abreviacoes)', body_cell)],
    [Paragraph('Humor', body_cell), Paragraph('Bem-humorado (piadas leves)', body_cell), Paragraph('Amigavel (sorriso virtual)', body_cell), Paragraph('Profissional (sem humor)', body_cell)],
]
cw2 = [CONTENT_W * 0.18, CONTENT_W * 0.27, CONTENT_W * 0.27, CONTENT_W * 0.28]
story.extend(make_table(dim_table, cw2, '<b>Tabela 3:</b> 6 dimensoes complementares do Termometro de Tom'))

story.extend([
    add_heading('<b>1.3 Amostra de Voz: Como Coletar a "Assinatura" Real</b>', h2_style, 1),
    Paragraph(
        'Alem das escolhas de escala e dimensoes, o formulario solicita que o pousadeiro grave ou escreva '
        '3 respostas a cenarios hipotéticos reais. Essas respostas sao a "assinatura vocal" do proprietario '
        'e servem como dataset de few-shot learning para a IA. Os tres cenarios sao cuidadosamente '
        'projetados para cobrir as tres situacoes mais comuns de comunicacao com hóspedes: (1) uma '
        'primeira mensagem de um hóspede interessado, (2) uma solicitacao de desconto, e (3) uma '
        'reclamacao sobre o preco. Esses cenarios cobrem 80% das interacoes comerciais do dia a dia.',
        body_style
    ),
    Paragraph(
        'Cenario 1 - Primeiro Contato: "Um hóspede manda mensagem perguntando sobre disponibilidade e '
        'preco para o feriado de Junho. Escreva como voce responderia normalmente." Este cenario captura '
        'o estilo de saudacao, a forma de apresentar a pousada, a estrategia de precos (se revela o preco '
        'direto ou antes cria valor), e o call-to-action habitual. Cenario 2 - Pedido de Desconto: "Um '
        'hóspede diz que encontrou um preco menor no Booking e pede igualdade. Como voce responde?" Este '
        'captura a estrategia de negociacao, a firmeza vs flexibilidade, e a capacidade de manter a relacao '
        'sem ceder. Cenario 3 - Reclamacao: "Um hóspede diz que achou caro para o que oferece. Escreva '
        'sua resposta." Este captura a resiliencia emocional, a capacidade de justificar valor, e o tom '
        'sob pressao.',
        body_style
    ),
    add_heading('<b>1.4 Traducao Tecnica: Do Formulario ao System Prompt</b>', h2_style, 1),
    Paragraph(
        'Cada combinacao de respostas do Termometro de Tom e traduzida automaticamente em um system prompt '
        'personalizado que guia o comportamento da IA. O prompt e composto por 4 camadas: Identidade (quem '
        'a IA e, nome da pousada, localizacao, historia), Personalidade (o tom, vocabulario, emojis, '
        'tratamento), Regras de Comunicacao (o que fazer e o que nao fazer em cada tipo de interacao), '
        'e Exemplos de Few-Shot (as 3 respostas do pousadeiro usadas como modelo de comportamento). '
        'O prompt final tem entre 800 e 1.500 tokens e e armazenado no campo toneProfile do modelo Pousada '
        'no Prisma schema.',
        body_style
    ),
    Paragraph(
        'Exemplo de prompt gerado automaticamente para um pousadeiro que escolheu posicao 2 (Anfitriao '
        'Carinhoso) + proativo + emojis moderados + tratamento "voce" + estilo consultivo:',
        body_style
    ),
    Paragraph(
        'Voce e a assistente virtual da [Nome da Pousada], em [Cidade]. Seu tom e acolhedor e caloroso, '
        'como um anfitriao que recebe um amigo querido em casa. Use "voce" para se referir ao hóspede. '
        'Inclua 1-2 emojis por mensagem, preferencialmente em saudacoes e encerramentos. Antes de oferecer '
        'solucoes, faca perguntas para entender melhor o que o hóspede precisa. Seja proativa sugerindo '
        'pacotes e experiencias locais quando perceber oportunidade de venda. NUNCA seja robotica ou fria. '
        'NUNCA use linguagem corporativa. Responda como a proprietaria [Nome] responderia, seguindo '
        'estes exemplos de comunicacao dela: [3 respostas coletadas].',
        callout_style
    ),
    add_heading('<b>1.5 Modelo de Dados no Prisma Schema</b>', h2_style, 1),
    Paragraph(
        'O perfil de tom e armazenado no modelo Pousada com os seguintes campos: tonePosition (Int, 1-5), '
        'toneProactivity (Enum: PROACTIVE | REACTIVE | HYBRID), toneEmojiLevel (Enum: GENEROUS | MODERATE | '
        'MINIMAL), toneFormality (Enum: INFORMAL | FORMAL | ADAPTIVE), toneStyle (Enum: IMMEDIATE | '
        'CONTEXTUALIZED | CONSULTATIVE), toneGrammar (Enum: INFORMAL | NORMAL | CAREFUL), toneHumor '
        '(Enum: PLAYFUL | FRIENDLY | PROFESSIONAL), voiceSample1 (String, resposta ao cenario 1), '
        'voiceSample2 (String, resposta ao cenario 2), voiceSample3 (String, resposta ao cenario 3), '
        'generatedSystemPrompt (String, prompt final gerado pela combinacao). Esses campos alimentam '
        'diretamente a API de mensagens que configura o comportamento da IA em cada conversa.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════════════
# PILLAR 2: CHAVES DE DESCONTO
# ═══════════════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>Pilar 2: Chaves de Desconto (Discount Keys)</b>', h1_style, 0),
    Paragraph(
        'A negociacao de precos e o momento mais delicado da interacao entre um pousadeiro e um potencial '
        'hóspede. Segundo dados da Abih (Associacao Brasileira da Industria de Hotéis), 67% das reservas '
        'de pousadas envolvem alguma forma de negociacao de preco, e em 34% dessas negociacoes o hóspede '
        'recebe um desconto. O problema e que a maioria dos pousadeiros nao tem regras claras para '
        'negociar: eles decidem no impulso, muitas vezes cedendo mais do que deveriam por medo de perder '
        'a reserva, ou recusando descontos que teriam fechado uma venda. As Chaves de Desconto resolvem '
        'isso ao dar ao pousadeiro o controle total sobre os limites de negociacao da IA.',
        body_style
    ),
    Paragraph(
        'O conceito e poderoso: o pousadeiro define "chaves" que autorizam a IA a conceder descontos '
        'dentro de limites pre-definidos, baseados em triggers contextuais. A IA nunca inventa um desconto: '
        'ela aplica as regras que o dono configurou. Se o dono diz "ate 10% para pagamento a vista no PIX", '
        'a IA pode conceder ate 10% nesse contexto especifico, mas nunca 11%, e nunca em outro contexto '
        'sem autorizacao. Isso da ao pousadeiro a tranquilidade de saber que a IA esta vendendo com as '
        'mesmas regras que ele usaria pessoalmente, sem o risco de uma IA "generosa demais" destruindo '
        'sua margem de lucro.',
        body_style
    ),
    add_heading('<b>2.1 Os 6 Tipos de Chaves de Desconto</b>', h2_style, 1),
    Paragraph(
        'O formulario de onboarding apresenta 6 categorias de desconto, cada uma com seus proprios '
        'parametros configuráveis. O pousadeiro define o percentual maximo para cada categoria, '
        'e a IA aplica essas regras em tempo real durante as conversas com hóspedes. As categorias '
        'foram identificadas pela analise de mais de 2.000 conversas de WhatsApp de pousadas e '
        'representam os cenarios de negociacao mais frequentes no setor de hospitalidade.',
        body_style
    ),
])

discount_table = [
    [Paragraph('<b>Chave</b>', header_cell),
     Paragraph('<b>Trigger (Quando aplicar)</b>', header_cell),
     Paragraph('<b>Exemplo de Configuracao</b>', header_cell),
     Paragraph('<b>Limite Maximo</b>', header_cell)],
    [Paragraph('<b>1. Pagamento</b>', body_cell),
     Paragraph('Hóspede oferece pagamento a vista via PIX ou transferencia', body_cell),
     Paragraph('"Ate 10% se pagar a vista no PIX"', body_cell),
     Paragraph('5-15%', body_cell_c)],
    [Paragraph('<b>2. Temporada</b>', body_cell),
     Paragraph('Reserva com mais de 60 dias de antecedencia ou last-minute', body_cell),
     Paragraph('"5% se reservar 60 dias antes; 8% se for last-minute (3 dias)"', body_cell),
     Paragraph('3-12%', body_cell_c)],
    [Paragraph('<b>3. Estadia</b>', body_cell),
     Paragraph('Hóspede reserva acima do numero minimo de noites', body_cell),
     Paragraph('"7% para 3 noites; 12% para 5+ noites"', body_cell),
     Paragraph('5-15%', body_cell_c)],
    [Paragraph('<b>4. Grupo</b>', body_cell),
     Paragraph('Reserva para 2+ apartamentos ou grupo com crianas', body_cell),
     Paragraph('"8% no segundo apto; 5% adicional no terceiro"', body_cell),
     Paragraph('5-12%', body_cell_c)],
    [Paragraph('<b>5. Retorno</b>', body_cell),
     Paragraph('Hóspede que ja se hospedou antes', body_cell),
     Paragraph('"10% para hóspedes recorrentes"', body_cell),
     Paragraph('5-15%', body_cell_c)],
    [Paragraph('<b>6. Rivalidade</b>', body_cell),
     Paragraph('Hóspede menciona concorrente com preco menor', body_cell),
     Paragraph('"Até 5% de igualacao, mas com diferencial incluido"', body_cell),
     Paragraph('3-8%', body_cell_c)],
]
cw3 = [CONTENT_W * 0.14, CONTENT_W * 0.30, CONTENT_W * 0.36, CONTENT_W * 0.14]
story.extend(make_table(discount_table, cw3, '<b>Tabela 4:</b> 6 tipos de Chaves de Desconto com triggers e limites'))

story.extend([
    add_heading('<b>2.2 Regras Avancadas de Composicao</b>', h2_style, 1),
    Paragraph(
        'Alem dos 6 tipos basicos, o pousadeiro pode configurar regras de composicao que determinam '
        'como multiplos descontos interagem entre si. O sistema suporta tres modos de composicao: '
        'Cumulativo (descontos se somam, ate um maximo absoluto definido pelo dono, ex: maximo 20% '
        'total mesmo que a soma de chaves passe disso), Prioridade (apenas o desconto mais vantajoso '
        'para o hóspede e aplicado, evitando sobreposicao), e Exclusivo (cada chave opera '
        'independentemente e apenas uma pode ser usada por reserva). O modo padrao recomendado e o '
        'Cumulativo com teto de 20%, que equilibra generosidade com protecao de margem.',
        body_style
    ),
    Paragraph(
        'O sistema tambem suporta "Super Chaves" que sao condicoes especiais ativaveis apenas com '
        'aprovacao do dono. Quando a IA detecta um cenario que exige um desconto fora dos limites '
        'configurados (por exemplo, um grupo de 15 pessoas para um evento de casamento), ela nao '
        'recusa automaticamente. Em vez disso, ela envia uma notificacao ao pousadeiro com a proposta '
        'e aguarda aprovacao. A mensagem para o dono inclui: contexto da negociacao, desconto '
        'solicitado, impacto na receita, e um botao de "Aprovar" ou "Recusar". Se o dono aprovar, '
        'a IA comunica o desconto ao hóspede imediatamente.',
        body_style
    ),
    add_heading('<b>2.3 Fluxo de Negociacao em Tempo Real</b>', h2_style, 1),
    Paragraph(
        'Quando a IA identifica uma oportunidade de aplicar um desconto, ela segue um fluxo de 4 etapas: '
        '(1) Detectar o trigger na conversa (ex: hóspede pergunta "tem desconto para PIX?"), (2) Consultar '
        'as Chaves de Desconto configuradas para encontrar a chave aplicavel, (3) Calcular o desconto '
        'aplicando as regras de composicao e verificando o teto maximo, e (4) Comunicar o desconto ao '
        'hóspede usando o tom configurado no Termometro de Tom (Pilar 1). A IA nunca revela que esta '
        'usando "regras pre-configuradas" - a negociacao parece natural e personalizada.',
        body_style
    ),
    Paragraph(
        'Exemplo de fluxo real: O hóspede pergunta "Voces fazem desconto? Vi um preco menor no Booking." '
        'A IA detecta dois triggers simultaneos: (a) pedido generico de desconto e (b) mencao de concorrente '
        '(Chave 6 - Rivalidade). A IA consulta as configuracoes e encontra: Chave 6 com maximo 5% de '
        'igualacao, e Chave 1 com maximo 10% para PIX. Modo cumulativo com teto de 20%. A IA decide '
        'aplicar a Chave 6 primeiro (igualacao) e oferecer a Chave 1 como bonus (PIX), totalizando '
        'ate 15%. A resposta e gerada com o tom do Pilar 1: "Entendo sua preocupacao com o preco! Vou '
        'ser transparente: nosso valor reflete a experiencia completa que oferecemos. Mas se voce fechar '
        'agora no PIX, consigo ajustar em 15% para voce. Topa?"',
        callout_style
    ),
    add_heading('<b>2.4 Protecao de Margem e Alertas</b>', h2_style, 1),
    Paragraph(
        'O sistema inclui um mecanismo de protecao de margem que monitora o impacto acumulado dos descontos '
        'concedidos pela IA em tempo real. O pousadeiro define uma margem minima aceitavel (ex: 35% de '
        'lucro liquido apos impostos), e o sistema calcula o custo efetivo de cada desconto considerando '
        'custos operacionais (limpeza, cafe da manha, comissao de canais). Quando o desconto acumulado em '
        'um periodo (semana ou mes) ameaca ultrapassar o teto configurado, o sistema envia um alerta ao '
        'pousadeiro com um dashboard mostrando: total concedido em descontos no periodo, numero de reservas '
        'fechadas com desconto vs sem desconto, ticket medio com e sem desconto, e a margem efetiva '
        'media do periodo.',
        body_style
    ),
    Paragraph(
        'Esses dados alimentam o Insights Engine (Pilar 3), criando um loop de feedback onde o pousadeiro '
        'pode ajustar suas Chaves de Desconto com base em dados reais. Por exemplo, se o dashboard mostra '
        'que a Chave de Pagamento (PIX) esta gerando 40% mais conversoes que o esperado, o pousadeiro pode '
        'decidir aumentar o desconto maximo de 10% para 12%, ou criar uma combinacao com a Chave de Estadia '
        '(PIX + 3 noites = 15%). Cada ajuste e registrado como um evento no pipeline do ZEHLA Brain, '
        'permitindo rastrear a evolucao da estrategia de precos ao longo do tempo.',
        body_style
    ),
])

# Prisma schema example
story.extend([
    add_heading('<b>2.5 Modelo de Dados: Chaves no Prisma Schema</b>', h2_style, 1),
    Paragraph(
        'Cada Chave de Desconto e armazenada no modelo DiscountKey no Prisma schema, vinculado ao modelo '
        'Pousada. A estrutura inclui: type (Enum: PAYMENT | SEASON | STAY | GROUP | RETURN | COMPETITOR), '
        'maxPercent (Float, ex: 0.10 para 10%), triggerCondition (String, descricao em linguagem natural '
        'do trigger), compositionMode (Enum: CUMULATIVE | PRIORITY | EXCLUSIVE), requiresApproval (Boolean, '
        'se precisa de aprovacao do dono), isActive (Boolean, se a chave esta ativa), createdAt e updatedAt '
        '(DateTime). Alem disso, o modelo Pousada inclui campos globais: discountCompositionMode (modo padrao), '
        'maxCumulativeDiscount (teto maximo total), minProfitMargin (margem minima aceitavel), e '
        'discountAlertThreshold (percentual acumulado que dispara alerta).',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════════════
# PILLAR 3: DORES DE OPERACAO
# ═══════════════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>Pilar 3: Dores de Operacao (Insights Engine)</b>', h1_style, 0),
    Paragraph(
        'O Insights Engine e o componente mais revolucionario do SMARTHOTEL. Enquanto os dois primeiros '
        'pilares (Termometro de Tom e Chaves de Desconto) configuram o comportamento da IA, o terceiro '
        'pilar revela ao pousadeiro dados que ele nunca soube que existiam. A maioria absoluta dos '
        'pousadeiros no Brasil gerencia suas reservas e comunicacoes com hóspedes de forma completamente '
        'intuitiva, sem nenhuma metrica, sem nenhum dashboard, sem nenhum indicador de performance. Eles '
        '"sentem" que o negocio vai bem ou mal, mas nao conseguem provar nem mensurar.',
        body_style
    ),
    Paragraph(
        'O objetivo do Pilar 3 e descobrir, durante o onboarding, quais "dores de operacao" o pousadeiro '
        'mais sente e quais dados ele mais gostaria de ter. Essas dores se tornam os KPIs personalizados '
        'do Insights Engine, que coleta dados automaticamente de todas as conversas WhatsApp e gera '
        'insights acionáveis em tempo real. O pousadeiro responde a um questionario de 10 perguntas durante '
        'o onboarding, e o sistema traduz essas respostas em um dashboard personalizado de metricas que '
        'respondem diretamente a cada dor identificada.',
        body_style
    ),
    add_heading('<b>3.1 Questionario de Dores: 10 Perguntas-Chave</b>', h2_style, 1),
    Paragraph(
        'As 10 perguntas foram projetadas para cobrir os tres niveis de dor de um pousadeiro: '
        'operacional (dia a dia), comercial (vendas e receita) e estrategico (crescimento e posicionamento). '
        'Cada resposta e mapeada para um ou mais KPIs do Insights Engine, criando uma ponte direta entre '
        'a dor do pousadeiro e o dado que resolve essa dor. O questionario usa escala Likert de 1 a 5 '
        '(1 = "Nao me preocupo com isso" ate 5 = "Isso me tira o sono") e permite multipla selecao.',
        body_style
    ),
])

pain_table = [
    [Paragraph('<b>Pergunta</b>', header_cell),
     Paragraph('<b>Nivel de Dor</b>', header_cell),
     Paragraph('<b>KPI Gerado pelo Insights Engine</b>', header_cell)],
    [Paragraph('1. Voce sabe quantos hóspedes perguntam sobre preco e nao voltam?', body_cell),
     Paragraph('Comercial', body_cell_c),
     Paragraph('Taxa de Abandono por Preco: % de leads que perguntam preco e desaparecem', body_cell)],
    [Paragraph('2. Voce sabe qual e o dia da semana com mais pedidos de reserva?', body_cell),
     Paragraph('Operacional', body_cell_c),
     Paragraph('Mapa de Calor de Demandas: volume de contatos por dia e hora da semana', body_cell)],
    [Paragraph('3. Voce consegue medir quantos descontos voce concede por mes?', body_cell),
     Paragraph('Comercial', body_cell_c),
     Paragraph('Impacto de Descontos: total descontado, reservas ganhas/perdidas, margem efetiva', body_cell)],
    [Paragraph('4. Voce sabe quantas reservas perde por demora na resposta?', body_cell),
     Paragraph('Operacional', body_cell_c),
     Paragraph('Taxa de Perda por Latencia: reservas perdidas por tempo de resposta acima de X minutos', body_cell)],
    [Paragraph('5. Voce sabe quais sao as 5 perguntas mais frequentes dos hóspedes?', body_cell),
     Paragraph('Operacional', body_cell_c),
     Paragraph('Cloud de Perguntas: top perguntas, FAQ automatico, oportunidade de automacao', body_cell)],
    [Paragraph('6. Voce sabe o perfil (idade, origem, grupo) dos hóspedes que mais reservam?', body_cell),
     Paragraph('Estrategico', body_cell_c),
     Paragraph('Perfil do Hóspede Ideal: cruzamento de dados de conversa com taxa de conversao', body_cell)],
    [Paragraph('7. Voce sabe quantos hóspedes voltam depois da primeira visita?', body_cell),
     Paragraph('Estrategico', body_cell_c),
     Paragraph('Taxa de Retorno: % de hóspedes recorrentes e receita recorrente vs nova', body_cell)],
    [Paragraph('8. Voce consegue medir se suas respostas estao sendo eficazes?', body_cell),
     Paragraph('Comercial', body_cell_c),
     Paragraph('Score de Eficacia de Resposta: taxa de conversao por tipo de resposta da IA', body_cell)],
    [Paragraph('9. Voce sabe em qual etapa do funil os hóspedes desistem?', body_cell),
     Paragraph('Comercial', body_cell_c),
     Paragraph('Funil de Conversao WhatsApp: visualizacao de onde os leads sao perdidos', body_cell)],
    [Paragraph('10. Voce sabe quanto tempo gasta por dia respondendo mensagens?', body_cell),
     Paragraph('Operacional', body_cell_c),
     Paragraph('Horas Economizadas: comparacao de tempo gasto antes vs depois da IA', body_cell)],
]
cw4 = [CONTENT_W * 0.35, CONTENT_W * 0.14, CONTENT_W * 0.51]
story.extend(make_table(pain_table, cw4, '<b>Tabela 5:</b> Questionario de Dores com mapeamento para KPIs do Insights Engine'))

story.extend([
    add_heading('<b>3.2 Os 12 Insights que o Pousadeiro Nao Sabe que Precisa</b>', h2_style, 1),
    Paragraph(
        'Alem dos KPIs mapeados diretamente pelas respostas do questionario, o Insights Engine gera '
        'automaticamente insights avancados que o pousadeiro provavelmente nunca pensou em mensurar. '
        'Esses insights sao o diferencial competitivo do SMARTHOTEL e transformam dados brutos de '
        'conversas WhatsApp em inteligencia estrategica acionável. A maioria dos pousadeiros vai '
        'descobrir padroes do proprio negocio que eles suspeitavam mas nunca conseguiram provar.',
        body_style
    ),
])

insights_table = [
    [Paragraph('<b>Insight</b>', header_cell),
     Paragraph('<b>O que Revela</b>', header_cell),
     Paragraph('<b>Acao Sugerida</b>', header_cell)],
    [Paragraph('1. Palavra-Gatilho de Conversao', body_cell),
     Paragraph('Quais palavras no dialogo (ex: "cafe da manha", "vista", "piscina") mais predizem uma reserva fechada', body_cell),
     Paragraph('Enfatizar essas palavras nas respostas da IA e no marketing', body_cell)],
    [Paragraph('2. Hora de Ouro', body_cell),
     Paragraph('O horario exato do dia com maior probabilidade de conversao (ex: 20h-22h)', body_cell),
     Paragraph('Programar campanhas e mensagens proativas nesse horario', body_cell)],
    [Paragraph('3. Temperatura de Preco', body_cell),
     Paragraph('O preco em que a demanda cai drasticamente (elasticidade de preco)', body_cell),
     Paragraph('Ajustar precos dinamicamente com base na demanda', body_cell)],
    [Paragraph('4. Perfil do Negociador', body_cell),
     Paragraph('Qual tipo de hóspede pede mais desconto e qual fecha sem negociar', body_cell),
     Paragraph('Personalizar a estrategia de desconto por perfil de hóspede', body_cell)],
    [Paragraph('5. Ciclo de Decisao', body_cell),
     Paragraph('Quantas mensagens, em media, ate o hóspede decidir reservar ou desistir', body_cell),
     Paragraph('Otimizar o numero de interacoes da IA para fechar mais rapido', body_cell)],
    [Paragraph('6. Sentimento Sazonal', body_cell),
     Paragraph('Como o tom das perguntas muda entre alta e baixa temporada', body_cell),
     Paragraph('Ajustar precos e comunicacao por temporada automaticamente', body_cell)],
    [Paragraph('7. Vazamento de Receita', body_cell),
     Paragraph('Quanto dinheiro foi perdido por leads que desistiram apos a primeira interacao', body_cell),
     Paragraph('Implementar follow-up automatico para leads perdidos', body_cell)],
    [Paragraph('8. Taxa de Reclamacao Pos-Checkin', body_cell),
     Paragraph('% de hóspedes que reclamam apos o check-in e motivo principal', body_cell),
     Paragraph('Antecipar problemas com checklists automaticos', body_cell)],
    [Paragraph('9. Comparativo de Canais', body_cell),
     Paragraph('Diferenca de perfil e conversao entre hóspedes do WhatsApp vs Booking vs Instagram', body_cell),
     Paragraph('Priorizar investimento no canal com melhor ROI', body_cell)],
    [Paragraph('10. Fraude de Desconto', body_cell),
     Paragraph('Hóspedes que pedem desconto, reservam e depois cancelam', body_cell),
     Paragraph('Criar regras anti-abuso no engine de descontos', body_cell)],
    [Paragraph('11. Efetividade do Tom', body_cell),
     Paragraph('Qual estilo de resposta gera mais reservas (proativo vs consultivo vs direto)', body_cell),
     Paragraph('Otimizar automaticamente o tom da IA com base em resultados', body_cell)],
    [Paragraph('12. Receita Oculta', body_cell),
     Paragraph('Quanto a IA gerou em upsells (passeios, jantares, transfer) que o dono nao faria', body_cell),
     Paragraph('Relatorio mensal de receita adicional gerada pela IA', body_cell)],
]
cw5 = [CONTENT_W * 0.22, CONTENT_W * 0.42, CONTENT_W * 0.36]
story.extend(make_table(insights_table, cw5, '<b>Tabela 6:</b> 12 Insights avancados gerados automaticamente pelo Insights Engine'))

story.extend([
    add_heading('<b>3.3 Arquitetura do Insights Engine</b>', h2_style, 1),
    Paragraph(
        'O Insights Engine opera como uma pipeline de processamento de dados em 4 etapas que se integra '
        'diretamente ao pipeline de eventos da Fase 4 do ZEHLA Brain. A primeira etapa e a Coleta, onde '
        'todas as mensagens WhatsApp (enviadas e recebidas) sao capturadas pelo webhook do ZEHLA Brain e '
        'armazenadas com metadados (timestamp, telefone do hóspede, sessao, status de entrega). A segunda '
        'etapa e a Classificacao, onde um modelo de NLP analisa cada mensagem para extrair: intencao '
        '(perguntar preco, solicitar desconto, reclamar, reservar, cancelar), sentimento (positivo, '
        'neutro, negativo, urgente), e entidades (datas, valores, nomes de pacotes, referencias a '
        'concorrentes).',
        body_style
    ),
    Paragraph(
        'A terceira etapa e a Agregacao, onde os dados classificados sao agrupados em janelas temporais '
        '(diaria, semanal, mensal) e cruzados com metadados do lead (score, cluster, estagio do funil). '
        'A quarta etapa e a Visualizacao, onde os dados agregados sao transformados em widgets visuais no '
        'dashboard do pousadeiro: graficos de tendencia, mapas de calor, funis de conversao, e alertas '
        'de anomalia. O sistema e projetado para operar em tempo real: cada nova mensagem atualiza os '
        'KPIs em menos de 30 segundos, permitindo que o pousadeiro tome decisoes baseadas em dados '
        'atuais, nao em relatorios semanais defasados.',
        body_style
    ),
    add_heading('<b>3.4 Exemplos de Acoes Automaticas Baseadas em Insights</b>', h2_style, 1),
    Paragraph(
        'Os insights nao sao apenas informativos: eles disparam acoes automaticas que geram receita '
        'ou reduzem perdas. Quando o Insights Engine detecta que a "Hora de Ouro" de conversao e 20h-22h, '
        'o sistema automaticamente programa uma campanha de reengajamento para leads mornos (score 20-49) '
        'nesses horarios. Quando detecta que a palavra "cafe da manha" e o gatilho numero 1 de conversao, '
        'a IA passa a mencionar o cafe mais proativamente nas conversas. Quando detecta que a taxa de '
        'abandono por preco aumentou 20% na ultima semana, o sistema notifica o pousadeiro com uma '
        'analise de causa raiz e sugestoes de ajuste de preco.',
        body_style
    ),
    Paragraph(
        'Exemplo pratico de acao automatica: O Insights Engine detecta que 40% dos leads que perguntam '
        'sobre preco na terca-feira a noite nao voltam (Taxa de Abandono por Preco elevada). A acao '
        'automatica disparada e: (1) Para cada lead que perguntar sobre preco e nao responder em 2 horas, '
        'a IA envia uma mensagem de follow-up oferecendo um desconto de 5% via Chave de Pagamento (Pilar 2), '
        '(2) O sistema registra um evento de tipo PRICE_INQUIRY_FOLLOWUP no pipeline do ZEHLA Brain, '
        'atualizando o score do lead, e (3) O Insights Engine monitora se a taxa de conversao desse '
        'follow-up melhora em relacao a semana anterior, gerando um insight sobre a eficacia da estrategia.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════════════
# SECTION 4: INTEGRATION WITH ZEHLA BRAIN
# ═══════════════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>4. Integracao com o ZEHLA Brain (Pipeline de Eventos)</b>', h1_style, 0),
    Paragraph(
        'Os tres pilares do onboarding nao operam de forma isolada: eles se integram profundamente com o '
        'pipeline de eventos da Fase 4 do ZEHLA Brain (Capture, Validate, Enrich, Classify, Act). Cada '
        'dado coletado no onboarding gera eventos que alimentam o ciclo virtuoso de aprendizado do sistema. '
        'O Termometro de Tom gera eventos do tipo TONE_PROFILE_UPDATE quando o pousadeiro ajusta seu perfil, '
        'disparando a reclassificacao de todas as mensagens anteriores com o novo tom. As Chaves de Desconto '
        'geram eventos do tipo DISCOUNT_RULE_CHANGE quando uma chave e criada, modificada ou desativada, '
        'atualizando a estrategia de precos em todas as conversas ativas.',
        body_style
    ),
    Paragraph(
        'O Insights Engine gera eventos continuos do tipo INSIGHT_GENERATED, INSIGHT_ALERT, e INSIGHT_ACTION '
        'que sao processados pelo pipeline de eventos. Esses eventos atualizam o score do lead (ex: um lead '
        'que pede desconto recebe um impacto negativo de -5 no score), movem o lead entre estagios do funil '
        '(ex: de "morno" para "quente" quando a IA detecta alta probabilidade de conversao), e disparam '
        'acoes automaticas (ex: follow-up quando a taxa de abandono esta alta). A integracao e bidirecional: '
        'os insights gerados pelo motor tambem alimentam de volta os pilares 1 e 2, otimizando o tom da IA '
        'e as regras de desconto com base em dados reais de performance.',
        body_style
    ),
    Paragraph(
        'O modelo de dados estendido para suportar os tres pilares adiciona as seguintes tabelas e campos '
        'ao Prisma schema existente: modelo ToneProfile (vinculado a Pousada), modelo DiscountKey (vinculado '
        'a Pousada), modelo OperationalPain (respostas do questionario), modelo InsightMetric (KPIs '
        'personalizados), modelo InsightAlert (alertas gerados), e modelo InsightAction (acoes executadas). '
        'Cada modelo inclui timestamps de criacao e atualizacao, permitindo rastrear a evolucao completa '
        'da estrategia de cada pousada ao longo do tempo.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════════════
# SECTION 5: ONBOARDING FLOW
# ═══════════════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>5. Fluxo de Onboarding: Passo a Passo</b>', h1_style, 0),
    Paragraph(
        'O onboarding do SMARTHOTEL e projetado para ser concluido em 15-20 minutos, dividido em 5 etapas '
        'sequenciais. A experiencia e guiada e visual, com uma barra de progresso e feedback em tempo real. '
        'O pousadeiro nao precisa de conhecimento tecnico: cada etapa apresenta informacoes contextuais '
        'explicando por que cada dado e importante e como ele sera utilizado pela IA.',
        body_style
    ),
])

flow_table = [
    [Paragraph('<b>Etapa</b>', header_cell),
     Paragraph('<b>Conteudo</b>', header_cell),
     Paragraph('<b>Tempo Estimado</b>', header_cell),
     Paragraph('<b>Dados Coletados</b>', header_cell)],
    [Paragraph('<b>1. Boas-vindas</b>', body_cell),
     Paragraph('Explicacao do conceito "DNA da sua pousada", posicionamento, valor da proposta', body_cell),
     Paragraph('2 min', body_cell_c),
     Paragraph('Expectativa alinhada', body_cell)],
    [Paragraph('<b>2. Termometro de Tom</b>', body_cell),
     Paragraph('Escala visual de 5 posicoes + 6 dimensoes complementares + 3 cenarios de amostra de voz', body_cell),
     Paragraph('5 min', body_cell_c),
     Paragraph('13 dados de personalidade + 3 amostras de texto', body_cell)],
    [Paragraph('<b>3. Chaves de Desconto</b>', body_cell),
     Paragraph('Configuracao das 6 chaves com limites e triggers + regras de composicao + margem minima', body_cell),
     Paragraph('5 min', body_cell_c),
     Paragraph('6 chaves + 3 configuracoes globais', body_cell)],
    [Paragraph('<b>4. Dores de Operacao</b>', body_cell),
     Paragraph('Questionario de 10 perguntas Likert + selecao de 3 metricas prioritarias', body_cell),
     Paragraph('4 min', body_cell_c),
     Paragraph('10 respostas Likert + 3 KPIs prioritarios', body_cell)],
    [Paragraph('<b>5. Ativacao</b>', body_cell),
     Paragraph('Conecta WhatsApp, gera system prompt, ativa Insights Engine, dashboard inicial', body_cell),
     Paragraph('3 min', body_cell_c),
     Paragraph('Sessao WhatsApp + prompt ativo + dashboard configurado', body_cell)],
]
cw6 = [CONTENT_W * 0.16, CONTENT_W * 0.38, CONTENT_W * 0.14, CONTENT_W * 0.32]
story.extend(make_table(flow_table, cw6, '<b>Tabela 7:</b> Fluxo de onboarding em 5 etapas com tempo estimado'))

story.extend([
    add_heading('<b>5.1 Posicionamento de Venda Durante o Onboarding</b>', h2_style, 1),
    Paragraph(
        'Cada etapa do onboarding e uma oportunidade de reforçar o posicionamento do SMARTHOTEL. Apos '
        'o Termometro de Tom, o sistema exibe: "Perfeito! Sua IA agora fala exatamente como voce. Imagine '
        'ter uma clone seu atendendo 24/7 com a mesma personalidade." Apos as Chaves de Desconto: "Sua IA '
        'agora negocia com as mesmas regras que voce. Sem ceder demais, sem perder vendas." Apos as Dores '
        'de Operacao: "Em 24 horas, voce tera respostas para perguntas que voce nem sabia que deveria fazer." '
        'Esses micro-momentos de valor reforçam a percepcao de que o SMARTHOTEL nao e uma ferramenta generica, '
        'mas uma extensao inteligente do proprio negocio do pousadeiro.',
        body_style
    ),
    Paragraph(
        'O onboarding tambem inclui um momento "wow" na etapa de ativacao: o sistema exibe um resumo visual '
        'do DNA da pousada recem-mapeado, mostrando o perfil de tom (com um icone do arquetipo escolhido), '
        'as chaves de desconto configuradas (com um grafico de limites), e as dores identificadas (com uma '
        'lista dos 3 KPIs prioritarios). Este resumo e o momento em que o pousadeiro visualiza tangivelmente '
        'o valor da ferramenta: "Nao estamos apenas instalando um bot; estamos mapeando o DNA do sucesso '
        'da sua pousada para que voce possa escalar sem perder a sua essencia."',
        callout_style
    ),
])

# ═══════════════════════════════════════════════════════════════
# SECTION 6: IMPLEMENTATION
# ═══════════════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>6. Próximos Passos de Implementacao</b>', h1_style, 0),
    Paragraph(
        'A implementacao dos tres pilares segue uma abordagem incremental integrada ao ecossistema ZEHLA '
        'existente. A Fase 1 (Semanas 1-2) foca no Termometro de Tom: criacao do formulario visual com '
        'escala de 5 posicoes e 6 dimensoes, gerador de system prompt automatico, e integracao com a API '
        'de mensagens. A Fase 2 (Semanas 3-4) implementa as Chaves de Desconto: formulario de configuracao '
        'das 6 chaves, engine de negociacao em tempo real, e sistema de protecao de margem com alertas.',
        body_style
    ),
    Paragraph(
        'A Fase 3 (Semanas 5-6) desenvolve o Insights Engine: questionario de dores, pipeline de coleta e '
        'classificacao de mensagens, gerador de KPIs personalizados, e dashboard inicial com widgets visuais. '
        'A Fase 4 (Semanas 7-8) integra tudo com o ZEHLA Brain: novos tipos de evento no pipeline, '
        'classificacao automatica com base em insights, e otimizacao continua do tom e precos com base em '
        'dados reais. Cada fase gera eventos no pipeline existente, garantindo que o sistema aprenda e '
        'melhore continuamente.',
        body_style
    ),
])

impl_table = [
    [Paragraph('<b>Fase</b>', header_cell),
     Paragraph('<b>Semana</b>', header_cell),
     Paragraph('<b>Entregáveis</b>', header_cell),
     Paragraph('<b>Integracao ZEHLA Brain</b>', header_cell)],
    [Paragraph('1. DNA Wizard', body_cell),
     Paragraph('1-2', body_cell_c),
     Paragraph('Formulario visual de tom, gerador de prompt, amostra de voz', body_cell),
     Paragraph('Evento TONE_PROFILE_UPDATE', body_cell)],
    [Paragraph('2. Pricing Engine', body_cell),
     Paragraph('3-4', body_cell_c),
     Paragraph('6 chaves de desconto, engine de negociacao, protecao de margem', body_cell),
     Paragraph('Evento DISCOUNT_RULE_CHANGE, DISCOUNT_APPLIED', body_cell)],
    [Paragraph('3. Insights Engine', body_cell),
     Paragraph('5-6', body_cell_c),
     Paragraph('Questionario dores, pipeline NLP, dashboard KPIs, 12 insights', body_cell),
     Paragraph('Evento INSIGHT_GENERATED, INSIGHT_ALERT', body_cell)],
    [Paragraph('4. Brain Integration', body_cell),
     Paragraph('7-8', body_cell_c),
     Paragraph('Otimizacao automatica de tom e precos, loop de feedback', body_cell),
     Paragraph('Scoring, Classificacao, Acoes automaticas', body_cell)],
]
cw7 = [CONTENT_W * 0.18, CONTENT_W * 0.10, CONTENT_W * 0.42, CONTENT_W * 0.30]
story.extend(make_table(impl_table, cw7, '<b>Tabela 8:</b> Roadmap de implementacao dos 3 pilares em 4 fases'))

story.extend([
    Paragraph(
        'Com esses tres pilares implementados, o SMARTHOTEL deixa de ser "mais um chatbot para pousadas" '
        'e se torna a unica ferramenta no mercado que mapeia o DNA completo da operacao hoteleira: como '
        'o dono fala, como ele negocia, e o que ele precisa saber para crescer. E exatamente esse '
        'diferencial que vai transformar proprietarios de pousadas em evangelistas do produto, porque '
        'ninguem mais vai oferecer algo tao personalizado e tao profundo para o negocio deles.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════════════
# BUILD
# ═══════════════════════════════════════════════════════════════
print("Building body PDF...")
doc.multiBuild(story)
print(f"Body PDF created: {BODY_PATH}")
