# -*- coding: utf-8 -*-
"""
ZEHLA TTS Voice Cloning Blueprint - PDF Generator
"""
import os, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━ Font Registration ━━
pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/chinese/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/carlito-regular.ttf'))
pdfmetrics.registerFont(TTFont("DejaVuSans", '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont("SarasaMonoSC", '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))

registerFontFamily('LiberationSans', normal='LiberationSans', bold='LiberationSans')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Carlito', normal='Carlito', bold='Carlito')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ━━ Color Palette ━━
ACCENT = colors.HexColor('#542fc3')
TEXT_PRIMARY = colors.HexColor('#1c1d1f')
TEXT_MUTED = colors.HexColor('#7e848a')
BG_SURFACE = colors.HexColor('#d7dce2')
BG_PAGE = colors.HexColor('#edeff0')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT = colors.white
TABLE_ROW_EVEN = colors.white
TABLE_ROW_ODD = BG_SURFACE

# ━━ Styles ━━
styles = {}

styles['Title'] = ParagraphStyle(
    name='Title', fontName='LiberationSans', fontSize=28, leading=36,
    alignment=TA_CENTER, textColor=ACCENT, spaceAfter=6, spaceBefore=12
)
styles['H1'] = ParagraphStyle(
    name='H1', fontName='LiberationSans', fontSize=20, leading=26,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10, alignment=TA_LEFT
)
styles['H2'] = ParagraphStyle(
    name='H2', fontName='LiberationSans', fontSize=16, leading=22,
    textColor=TEXT_PRIMARY, spaceBefore=14, spaceAfter=8, alignment=TA_LEFT
)
styles['H3'] = ParagraphStyle(
    name='H3', fontName='LiberationSans', fontSize=13, leading=18,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6, alignment=TA_LEFT
)
styles['Body'] = ParagraphStyle(
    name='Body', fontName='Carlito', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=6,
    firstLineIndent=0
)
styles['BodyCN'] = ParagraphStyle(
    name='BodyCN', fontName='SimHei', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=6, wordWrap='CJK'
)
styles['Bullet'] = ParagraphStyle(
    name='Bullet', fontName='Carlito', fontSize=10, leading=16,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=4,
    leftIndent=18, bulletIndent=6
)
styles['Code'] = ParagraphStyle(
    name='Code', fontName='SarasaMonoSC', fontSize=9, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=4,
    leftIndent=12, backColor=colors.HexColor('#f5f5f5')
)
styles['Caption'] = ParagraphStyle(
    name='Caption', fontName='Carlito', fontSize=9, leading=13,
    textColor=TEXT_MUTED, alignment=TA_CENTER, spaceAfter=6
)
styles['HeaderCell'] = ParagraphStyle(
    name='HeaderCell', fontName='Carlito', fontSize=10, leading=14,
    textColor=colors.white, alignment=TA_CENTER
)
styles['Cell'] = ParagraphStyle(
    name='Cell', fontName='Carlito', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)
styles['CellLeft'] = ParagraphStyle(
    name='CellLeft', fontName='Carlito', fontSize=9.5, leading=14,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
styles['Callout'] = ParagraphStyle(
    name='Callout', fontName='Carlito', fontSize=10.5, leading=17,
    textColor=ACCENT, alignment=TA_LEFT, spaceAfter=6,
    leftIndent=12, borderPadding=6, backColor=colors.HexColor('#f0edf9')
)

# ━━ Helpers ━━
def h1(text):
    return Paragraph(f'<b>{text}</b>', styles['H1'])

def h2(text):
    return Paragraph(f'<b>{text}</b>', styles['H2'])

def h3(text):
    return Paragraph(f'<b>{text}</b>', styles['H3'])

def body(text):
    return Paragraph(text, styles['Body'])

def bullet(text):
    return Paragraph(f'  {text}', styles['Bullet'])

def callout(text):
    return Paragraph(text, styles['Callout'])

def make_table(headers, rows, col_ratios=None):
    page_w = A4[0] - 2*inch
    n = len(headers)
    if col_ratios is None:
        col_ratios = [1.0/n]*n
    col_widths = [r*page_w for r in col_ratios]
    data = []
    header_row = [Paragraph(f'<b>{h}</b>', styles['HeaderCell']) for h in headers]
    data.append(header_row)
    for row in rows:
        data.append([Paragraph(str(c), styles['CellLeft']) for c in row])
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
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
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def hr():
    return HRFlowable(width="100%", thickness=1, color=BG_SURFACE, spaceAfter=6, spaceBefore=6)

# ━━ Document ━━
output_path = '/home/z/my-project/download/ZEHLA_TTS_VoiceCloning_Blueprint.pdf'
doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=1*inch, rightMargin=1*inch,
    topMargin=0.8*inch, bottomMargin=0.8*inch,
    title='ZEHLA TTS Voice Cloning Blueprint',
    author='Z.ai',
    creator='Z.ai'
)

story = []

# ═══════════════════════════════════════
# COVER PAGE
# ═══════════════════════════════════════
story.append(Spacer(1, 120))
story.append(Paragraph('ZEHLA', styles['Title']))
story.append(Spacer(1, 8))
story.append(Paragraph('<b>TTS Voice Cloning Blueprint</b>', ParagraphStyle(
    name='SubTitle', fontName='LiberationSans', fontSize=18, leading=24,
    textColor=TEXT_MUTED, alignment=TA_CENTER
)))
story.append(Spacer(1, 16))
story.append(Paragraph('Modelo Proprio de Clonagem de Voz para WhatsApp', ParagraphStyle(
    name='SubTitle2', fontName='Carlito', fontSize=13, leading=18,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER
)))
story.append(Spacer(1, 40))
story.append(Paragraph('SMARTHOTEL Ecosystem | Versao 1.0', ParagraphStyle(
    name='Meta', fontName='Carlito', fontSize=11, leading=16,
    textColor=TEXT_MUTED, alignment=TA_CENTER
)))
story.append(Spacer(1, 8))
story.append(Paragraph('Maio 2026 | Confidencial', ParagraphStyle(
    name='Date', fontName='Carlito', fontSize=10, leading=14,
    textColor=TEXT_MUTED, alignment=TA_CENTER
)))
story.append(Spacer(1, 60))
story.append(hr())
story.append(Paragraph('Documento Tecnico - Blueprint de Arquitetura para Implementacao', ParagraphStyle(
    name='Footer', fontName='Carlito', fontSize=9, leading=13,
    textColor=TEXT_MUTED, alignment=TA_CENTER
)))
story.append(PageBreak())

# ═══════════════════════════════════════
# SUMARIO EXECUTIVO
# ═══════════════════════════════════════
story.append(h1('1. Sumario Executivo'))
story.append(body(
    'Este blueprint define a arquitetura completa para implementacao de um sistema proprietario de TTS '
    '(Text-to-Speech) com clonagem de voz no ecossistema ZEHLA/SMARTHOTEL. Inspirado na plataforma '
    'lailla.io, que ja oferece clonagem de voz para agentes de IA no WhatsApp com mais de 10.000 empresas '
    'ativas, este documento detalha como o ZEHLA pode implementar funcionalidade equivalente e superior '
    'utilizando modelos open-source de ponta, garantindo soberania tecnica, conformidade com a LGPD '
    'e custos operacionais drasticamente inferiores aos de solucoes comerciais como ElevenLabs.'
))
story.append(Spacer(1, 6))
story.append(body(
    'A analise da lailla.io revelou um modelo de negocio validado: a plataforma oferece agentes de IA para '
    'WhatsApp com clonagem de voz a partir de 1 minuto e 30 segundos de audio de referencia, permitindo '
    'que o agente envie mensagens de audio com a voz do proprietario ou atendente. Este recurso '
    '"humaniza" o atendimento automatizado, aumentando significativamente a taxa de conversao. '
    'Empresas como Sebrae, Vivo, XP, Honda e Volkswagen ja utilizam essa tecnologia.'
))
story.append(Spacer(1, 6))
story.append(callout('<b>OBJETIVO:</b> Criar um modelo TTS proprio para ZEHLA que permita clonar vozes com '
    'fidelidade, gerar audios em portugues brasileiro com latencia baixa, e integrar nativamente com '
    'o canal WhatsApp do SMARTHOTEL para mensagens de voz automatizadas.'))

story.append(Spacer(1, 12))

# ═══════════════════════════════════════
# ANALISE DA LAILLA.IO
# ═══════════════════════════════════════
story.append(h1('2. Analise da Lailla.io - Benchmark Competitivo'))

story.append(h2('2.1 Visao Geral da Plataforma'))
story.append(body(
    'A lailla.io e uma plataforma brasileira de IA para WhatsApp que se posiciona com o slogan '
    '"Da conversa a conversao". A plataforma permite criar agentes de IA personalizados para '
    'atendimento via WhatsApp em supostamente 11 minutos, sem necessidade de conhecimento tecnico. '
    'Seu diferencial competitivo principal e a clonagem de voz integrada ao fluxo de atendimento, '
    'permitindo que o agente envie mensagens de audio com a voz clonada do proprietario da empresa.'
))
story.append(Spacer(1, 6))
story.append(body(
    'A plataforma opera com parceria oficial com a Meta (WhatsApp Business API), o que confere '
    'legitimidade e estabilidade na integracao. O processo de onboarding e extremamente simplificado: '
    'o usuario cria uma conta, responde 6 perguntas sobre o negocio, recebe um agente personalizado, '
    'escolhe uma voz (ou clone a propria), conecta ao WhatsApp via QR code, e esta pronto. '
    'Essa simplicidade e fundamental para o publico-alvo de pousadas e pequenas empresas do '
    'setor de hospedagem que o ZEHLA atende.'
))

story.append(Spacer(1, 12))
story.append(h2('2.2 Funcionalidades de Clonagem de Voz Identificadas'))
story.append(body(
    'A partir da raspagem completa das 5 principais paginas da lailla.io (home, basic, agente-amplo, '
    'agente-2.0, light), foram identificadas as seguintes funcionalidades criticas de clonagem de voz:'
))

story.append(Spacer(1, 6))
t = make_table(
    ['Funcionalidade', 'Descricao', 'Prioridade ZEHLA'],
    [
        ['Clonagem de voz', 'Clone sua propria voz com fidelidade a partir de 1min30s de audio para o agente enviar audios no WhatsApp', 'CRITICA'],
        ['Resposta em audio', 'Quando o cliente envia audio, o agente responde em audio com voz clonada, humanizando o atendimento', 'CRITICA'],
        ['Multi-voz', 'Suporte a multiplas vozes clonadas (proprietario, atendente 1, atendente 2)', 'ALTA'],
        ['Personalizacao tom', 'A voz clonada mantem o tom e estilo da marca', 'ALTA'],
        ['Integracao WhatsApp', 'Envio nativo de mensagens de audio via WhatsApp Business API', 'CRITICA'],
        ['Escolha de voz', 'Selecao entre voz clonada propria ou do atendente', 'MEDIA'],
        ['Conversas humanizadas', 'Alternancia inteligente entre texto e audio', 'ALTA'],
    ],
    [0.22, 0.50, 0.28]
)
story.append(t)
story.append(Paragraph('Tabela 1: Funcionalidades de clonagem de voz da lailla.io', styles['Caption']))

story.append(Spacer(1, 12))
story.append(h2('2.3 Planos e Segmentacao'))
story.append(body(
    'A lailla.io opera com segmentacao vertical por nicho. Alem do plano generico "Basic" e "Light", '
    'a plataforma oferece planos especializados como "Agente Amplo" (focado em imobiliarias/corretoras) '
    'e "Agente 2.0" (versao premium). O plano "Light" e posicionado como a entrada acessivel, '
    'enquanto o "Basic" oferece a clonagem de voz completa. Essa segmentacao e uma estrategia relevante '
    'para o ZEHLA, que ja atende o nicho de pousadas e poderia expandir para imobiliarias, clinicas, '
    'e outros segmentos do mercado brasileiro de pequenas e medias empresas.'
))
story.append(Spacer(1, 6))
story.append(body(
    'Empresas de grande porte como Honda, Jacto, Sebrae, Vivo, XP e Volkswagen ja utilizam a '
    'plataforma, o que demonstra escalabilidade e confiabilidade do modelo de agentes de IA com '
    'voz para o mercado corporativo brasileiro. A Lailla tambem oferece um programa de parceiros, '
    'o que abre possibilidades de receita recorrente para o ZEHLA atraves de canais de distribuicao.'
))

story.append(PageBreak())

# ═══════════════════════════════════════
# MODELOS TTS OPEN-SOURCE
# ═══════════════════════════════════════
story.append(h1('3. Cenario de Modelos TTS Open-Source (2025-2026)'))

story.append(h2('3.1 Ranking dos Melhores Modelos'))
story.append(body(
    'O ecossistema de TTS open-source evoluiu dramaticamente em 2025-2026, com modelos que agora '
    'superam ou igualam a qualidade de solucoes comerciais como ElevenLabs em testes cegos. '
    'A pesquisa identificou 8 modelos principais com suporte a portugues brasileiro, '
    'cada um com caracteristicas tecnicas distintas que os tornam mais ou menos adequados '
    'para diferentes cenarios de uso dentro do ZEHLA.'
))

story.append(Spacer(1, 6))
t2 = make_table(
    ['Modelo', 'Audio Min.', 'Pt-BR', 'Latencia', 'Open-Source', 'Nota'],
    [
        ['Fish Audio S2 Pro', '10M horas', 'Sim', 'Baixa', 'Sim (Apache)', '9.5/10'],
        ['GPT-SoVITS v4', '5s zero-shot', 'Sim', 'Media', 'Sim (MIT)', '9.0/10'],
        ['F5-TTS', '3s', 'Sim (pesos BR)', 'Baixa', 'Sim (CC-BY)', '8.5/10'],
        ['CosyVoice2-0.5B', '10s', 'Sim', 'Media', 'Sim (Apache)', '8.5/10'],
        ['XTTS v2 (Coqui)', '6s', 'Sim (17 idiomas)', 'Alta', 'Sim (AGPL)', '7.5/10'],
        ['Kokoro', '5s', 'Sim', 'Baixa', 'Sim (Apache)', '8.0/10'],
        ['IndexTTS-2', '5s', 'Parcial', 'Baixa', 'Sim', '7.5/10'],
        ['OpenVoice', '5s', 'Parcial', 'Baixa', 'Sim (MIT)', '7.0/10'],
    ],
    [0.18, 0.15, 0.13, 0.13, 0.20, 0.21]
)
story.append(t2)
story.append(Paragraph('Tabela 2: Comparativo de modelos TTS open-source com suporte a portugues', styles['Caption']))

story.append(Spacer(1, 12))
story.append(h2('3.2 Modelo Recomendado: GPT-SoVITS v4'))
story.append(body(
    'Para o ZEHLA, o GPT-SoVITS v4 e o modelo recomendado como base principal da plataforma TTS. '
    'Esta recomendacao se fundamenta em cinco fatores criticos para o cenario do ZEHLA:'
))
story.append(Spacer(1, 4))
story.append(bullet('<b>Zero-shot com 5 segundos:</b> Permite clonagem instantanea de voz a partir de um trecho '
    'curto de audio, ideal para o fluxo de onboarding onde o usuario grava uma mensagem curta.'))
story.append(bullet('<b>Few-shot com 1 minuto:</b> Com fine-tuning de apenas 1 minuto de audio, o modelo alcaca '
    'similaridade de voz superior a 95%, ideal para a voz "oficial" do proprietario.'))
story.append(bullet('<b>Arquitetura de dois estagios:</b> O GPT-SoVITS utiliza uma arquitetura inovadora que separa '
    'a geracao de conteudo semantico da geracao acustica, resultando em voz mais natural.'))
story.append(bullet('<b>Comunidade brasileira ativa:</b> Existem milhares de usuarios brasileiros contribuindo com '
    'melhorias, pesos finetunados para portugues e tutoriais em portugues.'))
story.append(bullet('<b>Self-hosted completo:</b> Inclui WebUI, API REST, separacao vocal automatica, ASR em chines, '
    'e ferramentas de etiquetagem - tudo necessario para operar sem dependencias externas.'))
story.append(bullet('<b>Streaming TTS:</b> Suporta geracao de audio em streaming via API Rust de alta performance, '
    'essencial para respostas em tempo real no WhatsApp.'))

story.append(Spacer(1, 12))
story.append(h2('3.3 Modelo Secundario: F5-TTS (Portugues BR)'))
story.append(body(
    'O F5-TTS e recomendado como modelo secundario e fallback para o ZEHLA por um motivo '
    'especifico: existem pesos pre-treinados exclusivos para portugues brasileiro disponiveis '
    'no HuggingFace. O repositrio "firstpixel/F5-TTS-pt-br" oferece pesos focados exclusivamente '
    'em portugues do Brasil, e o "ModelsLab/F5-tts-brazilian" oferece outra opcao. Isso significa '
    'que, mesmo sem fine-tuning, o F5-TTS ja gera audio com pronuncia e entonacao brasileira natural, '
    'o que o torna ideal como fallback quando o GPT-SoVITS nao esta disponivel ou quando e '
    'necessario gerar audio rapidamente sem processo de clonagem.'
))
story.append(Spacer(1, 6))
story.append(body(
    'Alem disso, o F5-TTS utiliza flow matching, uma tecnica mais recente que os metodos tradicionais, '
    'resultando em clonagem de voz mais rapida e com menor latencia. Sua licenca CC-BY permite '
    'uso comercial com atribuicao, o que e viavel para o modelo SaaS do ZEHLA.'
))

story.append(PageBreak())

# ═══════════════════════════════════════
# ARQUITETURA DO SISTEMA ZEHLA VOICE
# ═══════════════════════════════════════
story.append(h1('4. Arquitetura do Sistema ZEHLA Voice'))

story.append(h2('4.1 Visao Arquitetural Geral'))
story.append(body(
    'O sistema de TTS do ZEHLA foi desenhado como um microsservico independente dentro do ecossistema '
    'SMARTHOTEL, integrando-se ao Brain (sistema cognitivo) e ao canal WhatsApp via BullMQ. '
    'A arquitetura segue os principios de multi-tenancy, observabilidade cognitiva e isolacao '
    'de dados ja estabelecidos no ML Brain Protocol previamente criado.'
))

story.append(Spacer(1, 6))
story.append(body(
    'O fluxo principal funciona da seguinte forma: quando o Brain decide que uma resposta deve '
    'ser enviada como audio (com base no contexto da conversa, Formality Index e configuracao do '
    'tenant), ele envia a solicitacao para a fila "voice:generate" no BullMQ. O servico Voice '
    'consume essa fila, seleciona o modelo TTS adequado (GPT-SoVITS para voz clonada ou F5-TTS '
    'para voz generica), gera o audio, e o envia de volta para o servico do WhatsApp que o '
    'encaminha ao hospede. Todo o processo deve ser concluido em menos de 3 segundos para '
    'garantir uma experiencia de usuario fluida.'
))

story.append(Spacer(1, 12))
story.append(h2('4.2 Componentes Principais'))

story.append(h3('4.2.1 Voice Service (Microsservico)'))
story.append(body(
    'O Voice Service e o componente central do sistema TTS. Ele opera como um microsservico Node.js '
    'independente, responsavel por gerenciar os modelos de voz, processar solicitacoes de sintese, '
    'e coordenar o pipeline de clonagem. O servico expoe uma API REST com endpoints para upload '
    'de audio de referencia, treinamento/fine-tuning de vozes clonadas, geracao de audio a partir '
    'de texto, e gerenciamento do catalogo de vozes do tenant.'
))
story.append(Spacer(1, 4))
story.append(body(
    'Internamente, o Voice Service utiliza um sistema de cache multi-camada com Redis para '
    'armazenar audios gerados recentemente (evitando re-geracao), um sistema de fila com prioridades '
    '(respostas urgentes vs. campanhas), e monitoramento de GPU via metrics do Prometheus. '
    'O servico e projetado para escalar horizontalmente: cada instancia pode atender um modelo '
    'TTS diferente, permitindo que a plataforma sirva multiplos tenants simultaneamente sem '
    'degradacao de performance.'
))

story.append(h3('4.2.2 Voice Print Registry (Registro de Impressao Vocal)'))
story.append(body(
    'Cada voz clonada e registrada no Voice Print Registry, que armazena os embeddings da voz, '
    'os metadados do treinamento, e as amostras de audio de referencia. Este registro e '
    'equivalente ao conceito de "Voice Fingerprinting" ja definido no ML Brain Protocol. '
    'O sistema armazena no minimo 3 versoes de cada voz: a versao original (logo apos o '
    'fine-tuning), uma versao de alta fidelidade (apos ajuste fino com mais dados), e uma '
    'versao otimizada para latencia (com quantizacao aplicada).'
))

story.append(h3('4.2.3 Voice Router (Roteador Inteligente)'))
story.append(body(
    'O Voice Router e o componente responsavel por decidir qual modelo TTS utilizar para cada '
    'solicitacao. Ele integra-se diretamente ao Brain e utiliza as seguintes regras para tomar '
    'a decisao: se existe uma voz clonada disponivel para o tenant e a situacao exige personalizacao '
    '(primeiro contato, mensagem com tom emocional, resposta a audio do cliente), usa o GPT-SoVITS; '
    'se o tenant configurou voz generica ou o GPT-SoVITS esta indisponivel, usa o F5-TTS com pesos '
    'BR; se a latencia e critica (chat em tempo real), usa o F5-TTS por ser mais rapido.'
))

story.append(PageBreak())

story.append(h2('4.3 Fluxo de Integracao com WhatsApp'))
story.append(body(
    'A integracao com o WhatsApp Business API segue o seguinte fluxo tecnico detalhado. Quando '
    'um hospede envia uma mensagem de audio, o sistema primeiro transcreve o audio para texto '
    'usando o modelo Whisper da OpenAI (ja disponivel no ecossistema ZEHLA). O texto transcrito '
    'e processado pelo Brain junto com o historico da conversa. O Brain decide a resposta e '
    'tambem decide o formato de resposta (texto ou audio) com base no Formality Index, no '
    'momento da conversa, e na configuracao do tenant.'
))
story.append(Spacer(1, 6))
story.append(body(
    'Se a decisao for por audio, o Brain envia o texto da resposta junto com o ID da voz selecionada '
    'para a fila "voice:generate". O Voice Service consome a fila, gera o audio usando o modelo '
    'TTS selecionado pelo Voice Router, codifica o audio em formato OGG OPUS (formato nativo '
    'do WhatsApp), e retorna o buffer para o servico WhatsApp que envia a mensagem de audio. '
    'O tamanho maximo de cada audio e limitado a 60 segundos conforme restricoes do WhatsApp, '
    'e textos mais longos sao automaticamente divididos em multiplos audios.'
))
story.append(Spacer(1, 6))
story.append(body(
    'Para mensagens proativas (como campanhas de marketing ou lembretes de reserva), o sistema '
    'pode gerar audios em batch usando o F5-TTS (mais rapido) e enviar via API de mensagens '
    'do WhatsApp. Isso permite que a pousada envie uma mensagem de voz personalizada com o nome '
    'do hospede, por exemplo: "Ola, Maria! Sua reserva para o fim de semana esta confirmada. '
    'Estamos ansiosos para recebe-la!" - tudo gerado automaticamente em voz clonada.'
))

story.append(Spacer(1, 12))

# ═══════════════════════════════════════
# PIPELINE DE CLONAGEM
# ═══════════════════════════════════════
story.append(h1('5. Pipeline de Clonagem de Voz'))

story.append(h2('5.1 Fluxo de Onboarding do Proprietario'))
story.append(body(
    'O pipeline de clonagem de voz para o ZEHLA foi desenhado para ser tao simples quanto o da '
    'lailla.io, com 6 etapas claras que o proprietario da pousada pode seguir sem conhecimento tecnico:'
))

story.append(Spacer(1, 6))
story.append(h3('Etapa 1: Captura de Audio de Referencia'))
story.append(body(
    'O proprietario acessa o painel do ZEHLA e clica em "Configurar Minha Voz". O sistema abre '
    'um gravador web que permite gravar ate 2 minutos de audio diretamente no navegador, ou '
    'fazer upload de um arquivo de audio ja existente (WAV ou MP3, ate 10MB). O sistema valida '
    'a qualidade do audio (taxa de amostragem minima de 16kHz, duracao minima de 30 segundos, '
    'SNR acima de 20dB) e exibe feedback imediato se a qualidade for insuficiente.'
))

story.append(h3('Etapa 2: Pre-processamento Automatico'))
story.append(body(
    'O audio de referencia passa por um pipeline automatico de pre-processamento que inclui '
    'normalizacao de volume, remocao de ruido usando um modelo RNNoise, segmentacao automatica '
    'em frases (usando Whisper para detectar fronteiras de sentenca), e extracao de features '
    'acusticas. O sistema gera um espectrograma visual que e exibido ao usuario para confirmacao, '
    'mostrando as partes do audio que serao usadas para o treinamento.'
))

story.append(h3('Etapa 3: Treinamento/Fine-Tuning'))
story.append(body(
    'O sistema inicia o fine-tuning do GPT-SoVITS com o audio pre-processado. Para 1 minuto de '
    'audio de referencia, o treinamento leva aproximadamente 5-10 minutos em uma GPU NVIDIA T4 '
    '(disponivel em instancias cloud a partir de USD 0.50/hora). O sistema usa LoRA (Low-Rank '
    'Adaptation) para acelerar o treinamento e reduzir os requisitos de memoria, permitindo '
    'treinar em GPUs com apenas 8GB de VRAM. O progresso e exibido em tempo real no painel.'
))

story.append(h3('Etapa 4: Validacao e Teste'))
story.append(body(
    'Apos o treinamento, o sistema gera 3 frases de teste que o proprietario pode ouvir '
    'diretamente no navegador: uma saudacao ("Ola, seja bem-vindo a nossa pousada!"), '
    'uma mensagem de reserva ("Confirmamos sua reserva para o fim de semana."), e uma mensagem '
    'de emergencia ("Infelizmente, precisamos cancelar sua reserva."). O proprietario avalia '
    'a qualidade e pode solicitar retrinamento com mais dados ou ajustar parametros como '
    'velocidade da fala e tom emocional.'
))

story.append(PageBreak())

story.append(h3('Etapa 5: Ativacao'))
story.append(body(
    'Uma vez aprovada, a voz clonada e ativada no Voice Print Registry e fica disponivel para '
    'uso imediato. O sistema cria automaticamente uma variavel de template "voz_proprietario" '
    'que pode ser usada em qualquer fluxo de automacao. O proprietario pode tambem gravar '
    'vozes adicionais (atendente 1, atendente 2) seguindo o mesmo processo, e atribuir cada '
    'voz a um horario de atendimento ou tipo de conversa especifico.'
))

story.append(h3('Etapa 6: Monitoramento Continuo'))
story.append(body(
    'O sistema monitora a qualidade da voz clonada ao longo do tempo usando o Zehla Guardian '
    '(sistema de deteccao de drift ja definido no ML Brain Protocol). Se a qualidade da voz '
    'degradar abaixo de um limiar configuravel (padrao: similaridade de voz abaixo de 85%), '
    'o sistema notifica o proprietario com sugestao de retrinamento. O Guardian tambem '
    'monitora metricas como latencia de geracao, taxa de erro, e utilizacao por conversa.'
))

story.append(Spacer(1, 12))

# ═══════════════════════════════════════
# ESPECIFICACOES TECNICAS
# ═══════════════════════════════════════
story.append(h1('6. Especificacoes Tecnicas'))

story.append(h2('6.1 Requisitos de Infraestrutura'))
story.append(body(
    'O sistema TTS do ZEHLA foi projetado para operar em infraestrutura cloud com custo otimizado. '
    'Para a fase inicial (ate 100 tenants ativos), uma unica GPU NVIDIA T4 (16GB VRAM) e '
    'suficiente para rodar o GPT-SoVITS e o F5-TTS simultaneamente. Conforme a base de clientes '
    'cresce, a arquitetura suporta escalabilidade horizontal adicionando mais instancias GPU.'
))

story.append(Spacer(1, 6))
t3 = make_table(
    ['Recurso', 'Minimo', 'Recomendado', 'Escalado'],
    [
        ['GPU', '1x NVIDIA T4 (16GB)', '1x NVIDIA A10G (24GB)', 'Multi-GPU auto-scale'],
        ['RAM', '16 GB', '32 GB', '64 GB+'],
        ['CPU', '4 vCPU', '8 vCPU', '16 vCPU+'],
        ['Disco', '50 GB SSD', '100 GB SSD', '500 GB NVMe'],
        ['Banda', '10 Mbps', '100 Mbps', '1 Gbps'],
        ['Custo/mes (est.)', 'USD 50-80', 'USD 120-200', 'USD 300-800'],
    ],
    [0.20, 0.22, 0.28, 0.30]
)
story.append(t3)
story.append(Paragraph('Tabela 3: Requisitos de infraestrutura para o servico TTS', styles['Caption']))

story.append(Spacer(1, 12))
story.append(h2('6.2 APIs e Endpoints'))
story.append(body(
    'O Voice Service expoe uma API REST documentada com OpenAPI 3.0, com os seguintes '
    'endpoints principais para integracao com o ecossistema ZEHLA:'
))

story.append(Spacer(1, 6))
t4 = make_table(
    ['Metodo', 'Endpoint', 'Descricao'],
    [
        ['POST', '/api/v1/voice/register', 'Registra nova voz para clonagem'],
        ['POST', '/api/v1/voice/train', 'Inicia fine-tuning de voz clonada'],
        ['GET', '/api/v1/voice/status/:id', 'Verifica status do treinamento'],
        ['POST', '/api/v1/voice/generate', 'Gera audio a partir de texto'],
        ['GET', '/api/v1/voice/list', 'Lista vozes disponiveis do tenant'],
        ['DELETE', '/api/v1/voice/:id', 'Remove voz clonada'],
        ['POST', '/api/v1/voice/test', 'Gera audio de teste para validacao'],
        ['GET', '/api/v1/voice/metrics', 'Metricas de uso e qualidade'],
    ],
    [0.10, 0.38, 0.52]
)
story.append(t4)
story.append(Paragraph('Tabela 4: Endpoints da API do Voice Service', styles['Caption']))

story.append(Spacer(1, 12))
story.append(h2('6.3 Formatos de Audio Suportados'))
story.append(body(
    'O sistema suporta multiplos formatos de audio para garantir compatibilidade maxima com '
    'o WhatsApp e com a infraestrutura existente do ZEHLA. O formato principal de saida e o '
    'OGG OPUS (codec nativo do WhatsApp, melhor qualidade por bitrate, suporte a metadados), '
    'que e gerado diretamente pelo pipeline TTS sem conversao adicional. O sistema tambem suporta '
    'MP3 (mais universal, maior compatibilidade com sistemas legados), WAV (para arquivamento e '
    'reprocessamento), e FLAC (sem perdas, para armazenamento de referencia).'
))

story.append(PageBreak())

# ═══════════════════════════════════════
# CONFORMIDADE LGPD E SEGURANCA
# ═════════════════════════════════════════
story.append(h1('7. Conformidade LGPD e Seguranca de Dados'))

story.append(h2('7.1 Tratamento de Dados Biometricos'))
story.append(body(
    'Dados de voz sao classificados como dados biometricos sob a LGPD (Lei Geral de Protecao '
    'de Dados), exigindo cuidados especiais. O ZEHLA implementa as seguintes medidas para '
    'garantir conformidade:'
))
story.append(Spacer(1, 4))
story.append(bullet('<b>Consentimento explicito:</b> O proprietario deve aceitar termos especificos '
    'de uso de dados biometricos antes de iniciar a clonagem de voz. O consentimento deve '
    'informar claramente quais dados sao coletados, como sao usados, e por quanto tempo sao armazenados.'))
story.append(bullet('<b>Base legal:</b> O processamento se fundamenta no consentimento do titular '
    '(Art. 7, I, LGPD) para fins de personalizacao de atendimento automatizado.'))
story.append(bullet('<b>Criptografia:</b> Todos os audios de referencia e modelos treinados sao '
    'armazenados com criptografia AES-256 em repouso. Os embeddings de voz sao armazenados '
    'com criptografia em nivel de aplicacao.'))
story.append(bullet('<b>Isolamento multi-tenant:</b> Cada tenant tem seu proprio namespace '
    'isolado. Vozes clonadas de um tenant nunca sao acessiveis por outro tenant, mesmo em '
    'circunstancias normais de operacao.'))
story.append(bullet('<b>Direito ao esquecimento:</b> O proprietario pode solicitar a exclusao '
    'completa de sua voz clonada a qualquer momento, incluindo modelos treinados, embeddings, '
    'e audios de referencia. O sistema deve executar a exclusao em ate 72 horas.'))
story.append(bullet('<b>Retencao:</b> Audios de referencia sao retidos por ate 90 dias apos a '
    'desativacao da voz, para permitir retrinamento caso o proprietario mude de ideia. '
    'Apos 90 dias, os dados sao excluidos permanentemente.'))

story.append(Spacer(1, 12))
story.append(h2('7.2 Seguranca do Modelo'))
story.append(body(
    'Para evitar riscos de deepfakes e uso nao autorizado da voz clonada, o ZEHLA implementa '
    'um sistema de protecao em multiplas camadas. Primeiro, as vozes clonadas sao marcadas '
    'com um watermark acustico inaudivel (imperceptivel ao ouvido humano, mas detectavel por '
    'analise forense) que permite rastrear a origem de qualquer audio gerado. Segundo, o sistema '
    'monitora padroes de uso suspeitosos, como geracao de volume anormal ou conteudo que '
    'diverge significativamente do perfil do tenant. Terceiro, a API de geracao de audio '
    'inclui rate limiting e autenticacao JWT obrigatia.'
))

story.append(PageBreak())

# ═══════════════════════════════════════
# MAPA DE INTEGRACAO COM ZEHLA
# ═══════════════════════════════════════
story.append(h1('8. Mapa de Integracao com o Ecossistema ZEHLA'))

story.append(h2('8.1 Integracao com Componentes Existentes'))
story.append(body(
    'O sistema TTS se integra com os seguintes componentes ja existentes ou planejados no '
    'ecossistema ZEHLA/SMARTHOTEL, criando uma rede inteligente de comunicacao por voz:'
))

story.append(Spacer(1, 6))
t5 = make_table(
    ['Componente ZEHLA', 'Tipo de Integracao', 'Fluxo'],
    [
        ['Brain (Cognitivo)', 'Decisao de formato', 'Brain decide texto vs audio e envia para fila'],
        ['LIS (Lead Intelligence)', 'Personalizacao', 'LIS fornece dados do lead para templates de voz'],
        ['DNA Wizard', 'Tom e formalidade', 'Formality Index guia tom emocional do audio'],
        ['ZCC (Central Control)', 'Orquestracao', 'ZCC coordena filas e prioridades'],
        ['Guardian (Drift)', 'Qualidade', 'Monitora degradacao de voz e qualidade'],
        ['WhatsApp Channel', 'Entrega', 'Envio de mensagens de audio via Business API'],
        ['BullMQ', 'Fila assincrona', 'Filas "voice:generate" com prioridade'],
        ['Redis', 'Cache', 'Cache de audios gerados recentemente'],
        ['PostgreSQL', 'Persistencia', 'Metadados de vozes, embeddings, configuracoes'],
    ],
    [0.22, 0.22, 0.56]
)
story.append(t5)
story.append(Paragraph('Tabela 5: Mapa de integracao do TTS com componentes ZEHLA', styles['Caption']))

story.append(Spacer(1, 12))
story.append(h2('8.2 Fluxos de Trabalho'))

story.append(h3('Fluxo 1: Atendimento Reativo (Resposta a Cliente)'))
story.append(body(
    'Este e o fluxo principal do sistema: o hospede envia mensagem (texto ou audio) no WhatsApp, '
    'o Brain processa e decide responder com audio. O texto da resposta e enviado ao Voice Service '
    'que gera o audio com voz clonada, e o audio e entregue via WhatsApp. Este fluxo e otimizado '
    'para latencia baixa, com SLA de 3 segundos do recebimento da mensagem a entrega do audio. '
    'Se a voz clonada nao estiver disponivel ou a latencia exceder o limiar, o sistema faz fallback '
    'automatico para resposta em texto.'
))

story.append(h3('Fluxo 2: Campanhas Proativas (Marketing)'))
story.append(body(
    'O ZEHLA pode enviar mensagens de voz personalizadas para hospedes em momentos estrategicos: '
    'confirmacao de reserva, lembrete de check-in, oferta de upsell, pedido de review pos-estadia, '
    'e mensagem de aniversario. O sistema usa o F5-TTS (mais rapido) com template de voz generica '
    'personalizado com o nome do hospede. Essas mensagens sao geradas em batch e enfileiradas '
    'para envio em horarios otimos, maximizando a taxa de abertura e engajamento.'
))

story.append(h3('Fluxo 3: Onboarding de Novos Clients'))
story.append(body(
    'Quando um novo hospede se cadastra no SMARTHOTEL pela primeira vez, o sistema pode enviar '
    'uma mensagem de boas-vindulas personalizada em voz com o nome do hospede e os detalhes da '
    'pousada. A voz generica do F5-TTS e personalizada com templates que incluem o nome, tipo de '
    'acomodacao, e data de check-in. Este primeiro contato por voz cria uma impressao memoravel '
    'e diferenciada, estabelecendo uma relacao emocional com a marca desde o inicio.'
))

story.append(PageBreak())

# ═══════════════════════════════════════
# ROADMAP DE IMPLEMENTACAO
# ═════════════════════════════════════════
story.append(h1('9. Roadmap de Implementacao'))

story.append(h2('9.1 Fases e Cronograma'))

story.append(Spacer(1, 6))
t6 = make_table(
    ['Fase', 'Entrega', 'Prazo', 'Prioridade'],
    [
        ['Fase 1 - Fundacao', 'Infraestrutura + F5-TTS generico + API basica', '2 semanas', 'CRITICA'],
        ['Fase 2 - Clonagem', 'GPT-SoVITS + clonagem de voz + fine-tuning', '3 semanas', 'CRITICA'],
        ['Fase 3 - WhatsApp', 'Integracao WhatsApp + mensagens de audio', '2 semanas', 'CRITICA'],
        ['Fase 4 - Brain', 'Integracao Brain + decisao texto/audio', '2 semanas', 'ALTA'],
        ['Fase 5 - Multi-Voz', 'Suporte a multiplas vozes + gerenciamento', '1 semana', 'ALTA'],
        ['Fase 6 - LGPD', 'Consentimento + criptografia + exclusao', '1 semana', 'ALTA'],
        ['Fase 7 - Guardian', 'Monitoramento de qualidade + drift detection', '1 semana', 'MEDIA'],
        ['Fase 8 - Otimizacao', 'Cache + latencia + escalabilidade', '2 semanas', 'MEDIA'],
    ],
    [0.22, 0.36, 0.18, 0.24]
)
story.append(t6)
story.append(Paragraph('Tabela 6: Roadmap de implementacao do sistema TTS', styles['Caption']))

story.append(Spacer(1, 12))
story.append(h2('9.2 Estimativa de Custos'))
story.append(body(
    'O custo total de implementacao e operacao do sistema TTS e significativamente inferior ao uso '
    'de solucoes comerciais como ElevenLabs (que cobra USD 0.30 por 1000 caracteres gerados). '
    'Com a infraestrutura propria, o custo por audio de 30 segundos cai para menos de USD 0.01 '
    'apos o investimento inicial em infraestrutura, representando uma economia de mais de 95%.'
))

story.append(Spacer(1, 6))
t7 = make_table(
    ['Item', 'Custo Estimado'],
    [
        ['Infraestrutura GPU (mensal)', 'USD 50-200'],
        ['Desenvolvimento Fase 1-8', 'USD 8.000-15.000'],
        ['Custo por audio (30s, pos-investimento)', 'USD 0.005-0.01'],
        ['Comparativo ElevenLabs (30s)', 'USD 0.09-0.30'],
        ['Economia anual (10k audios/mes)', 'USD 9.600-35.400'],
    ],
    [0.50, 0.50]
)
story.append(t7)
story.append(Paragraph('Tabela 7: Estimativa de custos comparativo', styles['Caption']))

story.append(Spacer(1, 18))
story.append(hr())
story.append(Spacer(1, 6))
story.append(Paragraph(
    '<b>Conclusao:</b> A implementacao de um modelo TTS proprio para o ZEHLA nao apenas e tecnicamente '
    'viavel como demonstrado neste blueprint, mas estrategicamente imperativa para a diferenciacao '
    'competitiva do SMARTHOTEL no mercado de SaaS para pousadas. A lailla.io ja validou o modelo '
    'de negocio com mais de 10.000 empresas ativas, e o ZEHLA pode ir alem com uma solucao '
    'proprietaria, mais barata, mais personalizavel e com integracao profunda ao ecossistema Brain, '
    'LIS e DNA Wizard que ja constituem vantagens competitivas unicas.',
    ParagraphStyle(name='Conc', fontName='Carlito', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY)
))

# ━━ Build ━━
doc.build(story)
print(f'PDF gerado com sucesso: {output_path}')
