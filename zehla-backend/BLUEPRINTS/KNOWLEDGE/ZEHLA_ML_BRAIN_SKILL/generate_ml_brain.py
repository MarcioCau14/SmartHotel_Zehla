# -*- coding: utf-8 -*-
import os, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.units import inch, cm
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

# ━━ Font Registration ━━
pdfmetrics.registerFont(TTFont('NotoSerifSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSCBold', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSCBold', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('CarlitoBold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuMono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSCBold')
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSCBold')
registerFontFamily('Carlito', normal='Carlito', bold='CarlitoBold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

# ━━ Color Palette ━━
ACCENT = colors.HexColor('#d8582e')
TEXT_PRIMARY = colors.HexColor('#242321')
TEXT_MUTED = colors.HexColor('#7b776f')
BG_SURFACE = colors.HexColor('#e7e4df')
BG_PAGE = colors.HexColor('#f3f2f1')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT = colors.white
TABLE_ROW_EVEN = colors.white
TABLE_ROW_ODD = BG_SURFACE

# ━━ Styles ━━
body_style = ParagraphStyle(
    name='Body', fontName='Carlito', fontSize=10.5,
    leading=17, alignment=TA_JUSTIFY, spaceAfter=6,
    textColor=TEXT_PRIMARY
)
body_left = ParagraphStyle(
    name='BodyLeft', fontName='Carlito', fontSize=10.5,
    leading=17, alignment=TA_LEFT, spaceAfter=6,
    textColor=TEXT_PRIMARY
)
h1_style = ParagraphStyle(
    name='H1', fontName='Carlito', fontSize=20,
    leading=26, spaceBefore=18, spaceAfter=10,
    textColor=ACCENT
)
h2_style = ParagraphStyle(
    name='H2', fontName='Carlito', fontSize=15,
    leading=21, spaceBefore=14, spaceAfter=8,
    textColor=TEXT_PRIMARY
)
h3_style = ParagraphStyle(
    name='H3', fontName='Carlito', fontSize=12,
    leading=17, spaceBefore=10, spaceAfter=6,
    textColor=TEXT_PRIMARY
)
code_style = ParagraphStyle(
    name='Code', fontName='DejaVuMono', fontSize=8.5,
    leading=13, alignment=TA_LEFT, spaceAfter=4,
    textColor=TEXT_PRIMARY, leftIndent=18, backColor=BG_SURFACE,
    borderPadding=(4,4,4,4)
)
bullet_style = ParagraphStyle(
    name='Bullet', fontName='Carlito', fontSize=10.5,
    leading=17, alignment=TA_LEFT, spaceAfter=4,
    textColor=TEXT_PRIMARY, leftIndent=24, bulletIndent=12
)
callout_style = ParagraphStyle(
    name='Callout', fontName='Carlito', fontSize=10,
    leading=16, alignment=TA_LEFT, spaceAfter=6,
    textColor=ACCENT, leftIndent=18, borderPadding=(6,6,6,6),
    backColor=BG_PAGE, borderWidth=0.5, borderColor=ACCENT
)
toc_h1 = ParagraphStyle(name='TOCH1', fontSize=13, leftIndent=20, fontName='Carlito', leading=22, spaceBefore=4)
toc_h2 = ParagraphStyle(name='TOCH2', fontSize=11, leftIndent=40, fontName='Carlito', leading=18, spaceBefore=2)
header_cell = ParagraphStyle(name='HeaderCell', fontName='Carlito', fontSize=10, textColor=colors.white, alignment=TA_CENTER)
cell = ParagraphStyle(name='Cell', fontName='Carlito', fontSize=9.5, textColor=TEXT_PRIMARY, alignment=TA_CENTER, wordWrap='CJK')
cell_left = ParagraphStyle(name='CellLeft', fontName='Carlito', fontSize=9.5, textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK')

# ━━ Helpers ━━
A4_W, A4_H = A4
left_margin = 1.0 * inch
right_margin = 1.0 * inch
available_width = A4_W - left_margin - right_margin
H1_ORPHAN_THRESHOLD = (A4_H - 2*inch) * 0.15

def P(text, style=body_style):
    return Paragraph(text, style)

def H1(text):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), h1_style)
    p.bookmark_name = text
    p.bookmark_level = 0
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def H2(text):
    key = 'h2_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/><b>%s</b>' % (key, text), h2_style)
    p.bookmark_name = text
    p.bookmark_level = 1
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def H3(text):
    return Paragraph('<b>%s</b>' % text, h3_style)

def Bullet(text):
    return Paragraph(text, bullet_style, bulletText='\u2022')

def Code(text):
    return Paragraph(text.replace('<','&lt;').replace('>','&gt;'), code_style)

def Callout(text):
    return Paragraph('<b>%s</b>' % text, callout_style)

def make_table(headers, rows, col_ratios=None):
    if col_ratios is None:
        col_ratios = [1.0/len(headers)] * len(headers)
    col_widths = [r * available_width for r in col_ratios]
    data = [[Paragraph('<b>%s</b>' % h, header_cell) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), cell_left if len(str(c)) > 30 else cell) for c in row])
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0,0), (-1,0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0,0), (-1,0), TABLE_HEADER_TEXT),
        ('GRID', (0,0), (-1,-1), 0.5, TEXT_MUTED),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0,i), (-1,i), bg))
    t.setStyle(TableStyle(style_cmds))
    return t

def safe_keep(elements):
    total = 0
    for el in elements:
        w, h = el.wrap(available_width, A4_H)
        total += h
    if total <= A4_H * 0.4:
        return [KeepTogether(elements)]
    elif len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    return list(elements)

# ━━ TocDocTemplate ━━
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

# ━━ Build Document ━━
doc = TocDocTemplate(
    '/home/z/my-project/download/ZEHLA_ML_Brain_Blueprint.pdf',
    pagesize=A4,
    leftMargin=left_margin, rightMargin=right_margin,
    topMargin=0.9*inch, bottomMargin=0.9*inch
)
story = []

# ════════════════════════════════════════════════════════════════
# TOC
# ════════════════════════════════════════════════════════════════
story.append(P('<b>Sumario</b>', ParagraphStyle(name='TocTitle', fontName='Carlito', fontSize=22, leading=28, alignment=TA_LEFT, textColor=ACCENT, spaceAfter=18)))
toc = TableOfContents()
toc.levelStyles = [toc_h1, toc_h2]
story.append(toc)
story.append(PageBreak())

# ════════════════════════════════════════════════════════════════
# SECTION 1: VISAO GERAL
# ════════════════════════════════════════════════════════════════
story.append(H1('1. Visao Geral do ZEHLA ML Brain'))

story.append(P(
    'O ZEHLA ML Brain e o sistema nervoso central da inteligencia artificial da plataforma SMARTHOTEL. '
    'Enquanto o ZEHLA Brain (camada cognitiva) gerencia a logica de atendimento, classificacao de leads e '
    'respostas em tempo real, o ML Brain e responsavel por garantir que esse atendimento se torne progressivamente '
    'mais personalizado, convergente e alinhado com a identidade de cada pousada. Ele nao opera como um modelo '
    'estatico: aprende continuamente com cada interacao WhatsApp, cada resultado de reserva e cada ajuste feito '
    'pelo dono da pousada atraves do DNA Wizard.'
))

story.append(P(
    'A premissa fundamental e que cada pousada possui um DNA de comunicacao unico. O dono que trata os clientes '
    'como "amigos de ferias" usa um vocabulario, ritmo de resposta e estrategia de negociacao completamente '
    'diferente daquele que opera com formalidade corporativa. O ML Brain extrai, codifica e replica esse DNA '
    'para que o agente de IA atenda com a mesma naturalidade que o proprietario faria pessoalmente. Isso nao '
    'significa simplesmente copiar frases: significa compreender profundamente os padroes linguisticos, '
    'estrategicos e emocionais que tornam aquela comunicacao efetiva.'
))

story.append(P(
    'Este documento rege como o agente de desenvolvimento deve implementar, monitorar e iterar sobre os '
    'componentes de Machine Learning do ZEHLA. Ele cobre desde a ingestao do historico de conversas WhatsApp '
    '(inspirado no conceito de ferramentas como wisprflow.ai) ate a geracao de modelos fine-tuned por pousada, '
    'passando pela pipeline de feedback de conversao, deteccao de drift e privacidade LGPD.'
))

story.append(H2('1.1 Principios Arquiteturais'))
story.append(Bullet('<b>Multi-Tenant Isolation:</b> Cada pousada possui seu proprio espaco de embeddings, modelo fine-tuned e perfil de voz. Dados de tenant A nunca influenciam o modelo de tenant B.'))
story.append(Bullet('<b>Privacy-First ML:</b> Todo processamento de dados pessoais segue LGPD. Mensagens sao anonimizadas antes da vetorizacao. Embeddings sao criados sobre textos sanitizados, nao sobre dados brutos com nomes e telefones.'))
story.append(Bullet('<b>Continuous Learning com Guardrails:</b> O sistema aprende com cada interacao, mas possui limites claros: validacao de qualidade minima, deteccao de drift e intervencao humana automatica quando necessario.'))
story.append(Bullet('<b>Hybrid Intelligence:</b> A combinacao de RAG (para memoria de longo prazo e contexto em tempo real) com Fine-Tuning (para reducao de custos em alta escala) garante que o sistema seja simultaneamente preciso e economico.'))
story.append(Bullet('<b>Observable Cognition:</b> Cada decisao do modelo e rastreavel. O ZCC (Zehla Control Center) exibe metricas em tempo real de alinhamento de tom, taxa de conversao por modelo e alertas de drift.'))

story.append(H2('1.2 Arquitetura Geral'))
story.append(P(
    'A arquitetura do ML Brain opera em tres camadas interconectadas que formam um ciclo continuo de aprendizado. '
    'A Camada de Ingestao captura e processa as conversas WhatsApp em tempo real. A Camada de Aprendizado '
    'transforma esses dados em representacoes vetoriais e modelos especializados. A Camada de Aplicacao injeta '
    'o conhecimento acumulado nas respostas do agente. Cada ciclo do loop gera novos dados que realimentam a '
    'Camada de Ingestao, criando um sistema que melhora progressivamente com o uso.'
))

story.append(Spacer(1, 12))
story.append(make_table(
    ['Camada', 'Funcao', 'Tecnologias'],
    [
        ['Ingestao', 'Captura, sanitiza e vetoriza conversas WhatsApp', 'BullMQ, PGVector, Zod schemas'],
        ['Aprendizado', 'Gera embeddings, treina modelos fine-tuned', 'OpenAI Ada-3, LoRA, jsonl pipelines'],
        ['Aplicacao', 'Injeta contexto e tom nas respostas do agente', 'RAG retrieval, system prompts dinamicos'],
        ['Observabilidade', 'Monitora drift, alinhamento e performance', 'CognitiveObservability, Grafana'],
    ],
    [0.15, 0.45, 0.40]
))
story.append(Spacer(1, 6))
story.append(P('Tabela 1: Camadas arquiteturais do ZEHLA ML Brain', ParagraphStyle(name='Caption', fontName='Carlito', fontSize=9, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)))

# ════════════════════════════════════════════════════════════════
# SECTION 2: ARQUITETURA HIBRIDA RAG + FINE-TUNING
# ════════════════════════════════════════════════════════════════
story.append(H1('2. Arquitetura Hibrida: RAG + Fine-Tuning'))

story.append(P(
    'A infraestrutura de Machine Learning do ZEHLA utiliza uma abordagem em duas camadas complementares. '
    'Nenhuma das duas sozinha resolveria o problema com a qualidade e eficiencia necessarias: o RAG fornece '
    'memoria contextual e atualizacao em tempo real, enquanto o Fine-Tuning oferece reducao dramatica de custos '
    'e especializacao profunda por pousada. A combinacao das duas cria um sistema que e simultaneamente flexivel '
    '(adaptavel a cada nova conversa), economico (custo por token reduzido na alta escala) e personalizado '
    '(o tom de voz e as estrategias de cada pousada sao internalizadas no modelo).'
))

story.append(H2('2.1 Camada 1: RAG (Retrieval-Augmented Generation)'))
story.append(P(
    'A camada RAG constitui a memoria de longo prazo do sistema. Quando um lead inicia uma conversa no WhatsApp, '
    'o sistema busca nos embeddings as 3 a 5 interacoes de maior sucesso daquela pousada especifica para guiar '
    'o tom de voz e a estrategia de resposta. O processo funciona em quatro etapas sincronizadas que garantem '
    'que o contexto mais relevante seja sempre disponibilizado antes da geracao da resposta.'
))

story.append(P(
    'Na primeira etapa, chamada de <b>Capture</b>, cada mensagem enviada e recebida pelo agente de WhatsApp e '
    'armazenada no banco de dados com metadados completos: tenantId, leadId, timestamp, tipo de mensagem, sentimento '
    'detectado e tag de outcome. Na segunda etapa, chamada de <b>Enrich</b>, as mensagens sao enriquecidas com '
    'analise de sentimento (via LLM lightweight), extracao de entidades (datas, valores, tipo de quarto) e classificacao '
    'de intencao (reserva, duvida, reclamacao, cancelamento). Na terceira etapa, chamada de <b>Vectorize</b>, '
    'batches de 50 mensagens sao enviados a API de embeddings (OpenAI text-embedding-3-small) apos sanitizacao LGPD. '
    'Na quarta etapa, chamada de <b>Retrieve</b>, quando um novo lead envia uma mensagem, o sistema gera o embedding '
    'da query e busca os top-k documentos mais similares usando cosine similarity no PGVector.'
))

story.append(Callout('Regra de Ouro RAG: Nunca injetar embeddings brutos no prompt. Sempre usar um reranker para selecionar os 3-5 documentos mais relevantes e formatar como contexto estruturado antes de enviar ao LLM.'))

story.append(H3('2.1.1 Estrategia de Chunking'))
story.append(P(
    'O chunking de conversas WhatsApp segue uma logica diferente de documentos tradicionais. Em vez de cortar por '
    'tokens fixos, o sistema agrupa mensagens em "turnos conversacionais" delimitados por janelas temporais de ate '
    '24 horas. Cada turno e tratado como um chunk independente. Se um turno exceder 1500 tokens, ele e subdividido '
    'por topicos usando um classificador lightweight que identifica mudancas de assunto. Cada chunk recebe metadados '
    'de: (1) outcome final da conversa (BOOKED, LOST, PENDING), (2) sentimento medio do turno, (3) categorias de '
    'topico extraidas, e (4) score de sucesso calculado pela razao entre mensagens positivas e total de mensagens.'
))

story.append(H3('2.1.2 Modelo de Embeddings'))
story.append(P(
    'O sistema utiliza o modelo text-embedding-3-small da OpenAI como embedding primario por oferecer o melhor '
    'custo-beneficio para textos em portugues brasileiro. Cada embedding possui 1536 dimensoes, com custo de '
    'aproximadamente US$ 0.02 por 1M tokens. Para pousadas com planos premium, ha opcao de migrar para '
    'text-embedding-3-large (3072 dimensoes) que oferece melhor captura de nuances semanticas em linguagem coloquial '
    'eRegionalismos brasileiros. Todos os embeddings sao armazenados no PGVector (extensao do PostgreSQL) com '
    'indice IVFFlat configurado para lists=100 e probes=10, balanceando velocidade de busca e precisao.'
))

story.append(Spacer(1, 12))
story.append(make_table(
    ['Parametro', 'Configuracao', 'Justificativa'],
    [
        ['Modelo', 'text-embedding-3-small', 'Melhor custo-beneficio para PT-BR'],
        ['Dimensoes', '1536 (small) / 3072 (large)', 'Trade-off precision vs storage'],
        ['Chunk Size', 'Ate 1500 tokens por turno', 'Preserva contexto conversacional'],
        ['Janela Temporal', '24h por chunk', 'Cobre ciclo completo de atendimento'],
        ['Top-K Retrieve', '3 a 5 documentos', 'Enriquece sem sobrecarregar prompt'],
        ['Reranker', 'Cohere Rerank / LLM judge', 'Seleciona os mais relevantes'],
        ['Storage', 'PGVector + IVFFlat index', 'Busca sub-50ms em ate 1M vetores'],
    ],
    [0.18, 0.32, 0.50]
))
story.append(Spacer(1, 6))
story.append(P('Tabela 2: Configuracao tecnica da camada RAG', ParagraphStyle(name='Cap2', fontName='Carlito', fontSize=9, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)))

story.append(H2('2.2 Camada 2: Fine-Tuning de Modelos Específicos'))
story.append(P(
    'A camada de Fine-Tuning e projetada para reducao de custos em alta escala. Uma vez por semana (ou sob demanda '
    'quando acumular 200+ conversas com tag success=true), o sistema compila os logs de interacoes de uma pousada em '
    'arquivos .jsonl e os envia para a API de Fine-Tuning da OpenAI. O resultado e um modelo dedicado (gpt-4o-mini '
    'fine-tuned) que internaliza o tom de voz, as estrategias de negociacao e os padroes de resposta bem-sucedidos '
    'daquela pousada. Esse modelo dedicado requer significativamente menos tokens no prompt de sistema, reduzindo '
    'o custo por interacao em ate 60% em comparacao com o uso exclusivo de RAG.'
))

story.append(P(
    'O processo de fine-tuning segue um pipeline rigoroso de cinco etapas. Na primeira etapa, chamada de <b>Select</b>, '
    'o sistema seleciona automaticamente conversas com outcome=BOOKED e score de alinhamento de tom superior a 0.7 '
    '(medido pela cosine similarity entre a resposta do agente e o perfil de voz esperado). Na segunda etapa, chamada '
    'de <b>Format</b>, as conversas selecionadas sao transformadas no formato jsonl exigido pela API, mantendo pares '
    'de user/assistant com contexto minimamente necessario. Na terceira etapa, chamada de <b>Validate</b>, um subconjunto '
    'de 10% e separado para validacao holdout. Na quarta etapa, chamada de <b>Train</b>, o job e submetido via API. '
    'Na quinta etapa, chamada de <b>Evaluate</b>, o modelo fine-tuned e testado contra o modelo base em 50 cenarios '
    'tipicos de atendimento e so e promovido para producao se superar o base em pelo menos 15% das metricas.'
))

story.append(H3('2.2.1 Formato do Dataset de Treinamento'))
story.append(P(
    'Cada entrada do dataset .jsonl segue o formato padrao da OpenAI com tres campos obrigatorios. O campo "messages" '
    'contem a sequencia completa de mensagens da conversa, incluindo o system prompt personalizado da pousada. '
    'O campo "metadata" inclui o tenantId, o outcome da conversa e o tom detectado. O sistema aplica automaticamente '
    'regras de qualidade: conversas com menos de 4 turnos sao descartadas (insuficientes para aprendizado), conversas '
    'com mensagens maiores que 2000 caracteres sao truncadas, e conversas onde o lead expressou insatisfacao sao excluidas '
    'do conjunto de treinamento positivo. O tamanho ideal do dataset por ciclo de treinamento e entre 500 e 5000 exemplos, '
    'com o sweet spot em torno de 2000 pares para pousadas com volume medio de atendimento.'
))

story.append(Spacer(1, 12))
story.append(make_table(
    ['Metrica', 'Base (GPT-4o-mini)', 'Fine-Tuned', 'Melhoria'],
    [
        ['Custo por 1K tokens (input)', 'US$ 0.15', 'US$ 0.15', '0% (mesmo custo base)'],
        ['Tokens de system prompt', '~1500', '~300', '-80% de overhead'],
        ['Custo efetivo por conversa', 'US$ 0.045', 'US$ 0.018', '-60%'],
        ['Tone Alignment Score', '0.72', '0.89', '+24%'],
        ['Taxa de Conversao (IA)', '18%', '26%', '+44%'],
        ['Tempo de Resposta (p95)', '2.1s', '1.4s', '-33%'],
    ],
    [0.30, 0.22, 0.22, 0.26]
))
story.append(Spacer(1, 6))
story.append(P('Tabela 3: Comparacao de performance - Modelo Base vs Fine-Tuned', ParagraphStyle(name='Cap3', fontName='Carlito', fontSize=9, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)))

story.append(H2('2.3 Complementaridade RAG + Fine-Tuning'))
story.append(P(
    'As duas camadas nao competem: se complementam. O RAG fornece o contexto de longo prazo e a memoria factual '
    '(disponibilidade de quartos, precos, politicas especificas de cancelamento), enquanto o fine-tuning internaliza '
    'o comportamento linguistico e a estrategia de resposta. Em producao, o fluxo e: (1) a mensagem do lead chega, '
    '(2) o sistema busca via RAG os contextos relevantes de conversas anteriores, (3) o modelo fine-tuned da pousada '
    'gera a resposta usando tanto o prompt de sistema quanto os contextos RAG, e (4) a resposta e enviada ao WhatsApp '
    'com o tom e estilo internalizados no modelo. Este design permite que o sistema mantenha a personalizacao mesmo '
    'quando o fine-tuned ainda nao foi treinado (usando RAG puro no inicio) e evolua continuamente conforme mais '
    'dados sao acumulados.'
))

# ════════════════════════════════════════════════════════════════
# SECTION 3: INGESTAO DE CONVERSAS WHATSAPP
# ════════════════════════════════════════════════════════════════
story.append(H1('3. Ingestao de Conversas WhatsApp (Voice Cloning Pipeline)'))

story.append(P(
    'Esta secao descreve o mecanismo pelo qual o ZEHLA ML Brain extrai o perfil de voz real de um proprietario de '
    'pousada a partir do seu historico de conversas WhatsApp. O conceito e similar ao que ferramentas como wisprflow.ai '
    'implementam: analisar padroes reais de comunicacao para construir um "DNA digital" que permita a IA replicar '
    'o estilo, o tom e a estrategia de forma natural. A diferenca fundamental e que o ZEHLA opera este pipeline de '
    'forma automatizada como parte do onboarding, com consentimento explicito do proprietario e em total conformidade '
    'com a LGPD.'
))

story.append(P(
    'Quando o dono da pousada conecta seu numero de WhatsApp ao ZEHLA (seja via API oficial da Meta ou via bridge '
    'segura), o sistema inicia um processo de quatro fases para extrair e codificar seu perfil de comunicacao. '
    'A primeira fase e a coleta, onde o historico e importado de forma segura. A segunda fase e a sanitizacao, '
    'onde dados pessoais sao removidos e as mensagens sao normalizadas. A terceira fase e a extracao de features, '
    'onde dezenas de atributos linguisticos e comportamentais sao medidos. A quarta fase e a geracao do perfil, '
    'onde os atributos extraidos sao compilados em um documento estruturado que alimenta o system prompt e o '
    'modelo fine-tuned.'
))

story.append(H2('3.1 Mecanismo de Coleta do Historico'))
story.append(P(
    'Existem tres metodos de coleta do historico de conversas, cada um com diferentes niveis de cobertura e '
    'complexidade tecnica. O metodo primario e a <b>Exportacao Nativa do WhatsApp</b>: o proprietario acessa '
    'Configuracoes > Conversas > Exportar Conversa no WhatsApp Business, seleciona as conversas relevantes com '
    'clientes (que resultaram em reservas), e envia o arquivo .txt ao ZEHLA via upload seguro no painel de onboarding. '
    'Este metodo e o mais simples e fornece o historico completo em formato texto com timestamp.'
))

story.append(P(
    'O metodo secundario e a <b>API Cloud da Meta</b>: se o proprietario ja utiliza a WhatsApp Business API, '
    'o ZEHLA pode solicitar acesso as mensagens historicas via endpoint messages da Graph API (limitado a 6 meses '
    'retroativos). Este metodo e mais automatizado mas requer configuracao previa do WhatsApp Business Account. '
    'O metodo terciario e a <b>Bridge de Forward</b>: durante o onboarding, o proprietario encaminha manualmente '
    '30 a 50 conversas representativas para o numero do ZEHLA. O sistema parserifica cada conversa encaminhada '
    'e extrai os padroes. Embora menos abrangente, este metodo e util como complemento e para validacao rapida.'
))

story.append(H2('3.2 Pipeline de Sanitizacao LGPD'))
story.append(P(
    'Antes de qualquer processamento, todas as mensagens passam pela pipeline de sanitizacao que garante conformidade '
    'com a LGPD e protege tanto os dados do proprietario quanto os dados dos hóspedes anteriores. Esta pipeline opera '
    'em cinco etapas sequenciais: (1) <b>Deteccao de PII</b> usando regex e NER (Named Entity Recognition) para '
    'identificar nomes, telefones, emails, CPFs, enderecos e dados bancarios, (2) <b>Substituicao por Placeholders</b> '
    'onde cada dado sensivel e substituido por tokens genericos ([NOME], [TELEFONE], [CPF], etc.), (3) <b>Validacao '
    'de Consentimento</b> onde o sistema verifica se o proprietario assinou o Termo de Autorizacao para uso de dados '
    'de comunicacao no ML, (4) <b>Registro de Audit Trail</b> onde cada operacao de sanitizacao e logada com timestamp '
    'e hash da mensagem original, e (5) <b>Descarte Seguro</b> onde a mensagem original (com dados pessoais) e descartada '
    'apos 72 horas, mantendo apenas a versao sanitizada para processamento.'
))

story.append(H2('3.3 Extracao de Features de Voz (Voice Fingerprinting)'))
story.append(P(
    'O coracao do sistema de Voice Cloning e a engine de extracao de features, que analisa as mensagens sanitizadas '
    'e mede dezenas de atributos linguisticos e comportamentais que definem o estilo unico de comunicacao do proprietario. '
    'Estes atributos sao organizados em seis dimensoes principais, cada uma com multiplas sub-metricas que juntas '
    'formam o "Voice Fingerprint" completo da pousada.'
))

story.append(Spacer(1, 12))
story.append(make_table(
    ['Dimensao', 'Atributos Extraidos', 'Exemplo de Output'],
    [
        ['Vocabulario', 'Frequencia de palavras, termos unicos, regionalismos, gírias', '{"vocab_diversity": 0.72, "top_terms": ["amor", "querido", "refresco"]}'],
        ['Ritmo', 'Tamanho medio de mensagem, variacao, frequencia de multi-msg', '{"avg_chars": 87, "std_chars": 42, "multi_msg_rate": 0.35}'],
        ['Emoji', 'Tipo, frequencia, posicao no texto, substituicoes por emoji', '{"emoji_rate": 0.12, "top_emoji": ["😊", "🙌", "🏖️"]}'],
        ['Saudacao', 'Forma de abrir conversa, horarios, personalizacao', '{"greeting_style": "informal_first_name", "time_aware": true}'],
        ['Negociacao', 'Estrategia de desconto, urgencia, comparacao, follow-up', '{"discount_style": "soft_comparison", "urgency_freq": 0.08}'],
        ['Encerramento', 'Forma de fechar, CTA frequente, promessa de retorno', '{"closing_cta_rate": 0.65, "next_step_freq": 0.45}'],
    ],
    [0.15, 0.42, 0.43]
))
story.append(Spacer(1, 6))
story.append(P('Tabela 4: Dimensoes do Voice Fingerprinting', ParagraphStyle(name='Cap4', fontName='Carlito', fontSize=9, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)))

story.append(H3('3.3.1 Indice de Formalidade'))
story.append(P(
    'Um dos indicadores mais importantes extraidos e o Indice de Formalidade, uma pontuacao de 0 a 1 que mede '
    'o grau de formalidade na comunicacao do proprietario. Este indice e calculado pela analise combinada de cinco '
    'fatores: (1) uso de pronome de tratamento (voce vs senhor/a, tu vs voce), (2) presenca de abreviaturas formais '
    '(Sr., Sra., Prezado/a), (3) uso de pontuacao rigorosa vs pontuacao casual (multiplos pontos de exclamacao, '
    'ausencia de virgulas), (4) vocabulario tecnico vs coloquial, e (5) uso de emojis e emoticons. Um indice de '
    '0.0-0.3 indica estilo "Amigao de Infancia" do Tone Thermometer, 0.3-0.5 indica "Anfitriio Carinhoso", '
    '0.5-0.7 indica "Conselheiro Local", 0.7-0.85 indica "Gestor Eficiente", e 0.85-1.0 indica "Gerente 5 Estrelas".'
))

story.append(H3('3.3.2 Padroes de Resposta Temporal'))
story.append(P(
    'Alem dos atributos textuais, o sistema extrai padroes temporais que informam o ritmo de atendimento. O '
    '<b>Tempo Medio de Primeira Resposta</b> (time-to-first-reply) e calculado a partir dos timestamps das '
    'conversas exportadas. O <b>Padrao de Agrupamento de Mensagens</b> mede se o proprietario tende a enviar '
    'mensagens longas unicas ou varias mensagens curtas em sequencia. O <b>Horario de Pico de Atendimento</b> '
    'identifica os periodos de maior atividade, permitindo que o agente de IA replique a sensacao de disponibilidade '
    'nos horarios em que o proprietario normalmente esta mais engajado. O <b>Padrao de Follow-up</b> mede o '
    'intervalo tipico entre o envio de uma proposta e o proximo contato proativo, informando a estrategia de '
    'nutricao automatica de leads pelo agente.'
))

story.append(H2('3.4 Geracao do Perfil de Voz Estruturado'))
story.append(P(
    'Apos a extracao de todas as features, o sistema compila o <b>Voice Profile Document</b>, um arquivo JSON '
    'estruturado que serve como entrada primaria para o sistema de IA. Este documento e gerado automaticamente '
    'pelo pipeline e pode ser refinado manualmente pelo proprietario atraves do DNA Wizard (onde ele pode ajustar '
    'o tom, adicionar restricoes e personalizar diretrizes). O Voice Profile e composto por quatro secoes: '
    '(1) <b>Diretrizes de Tom</b> geradas a partir do Indice de Formalidade e vocabulario extraido, '
    '(2) <b>Padroes de Saudacao e Encerramento</b> baseados nas mensagens de abertura e fechamento mais frequentes, '
    '(3) <b>Vocabulario Preferido e Termos a Evitar</b> extraidos por frequencia e sentimento, e '
    '(4) <b>Estrategias de Negociacao</b> identificadas pelo padrao de discurso persuasivo do proprietario.'
))

story.append(Callout('Integracao com DNA Wizard: O Voice Profile gerado automaticamente pela analise de conversas preenche os campos do Tone Thermometer do DNA Wizard. O proprietario pode validar, ajustar ou refinar cada parametro durante o onboarding, criando um perfil hibrido: dados reais + preferencias explicitas.'))

# ════════════════════════════════════════════════════════════════
# SECTION 4: VOICE FINGERPRINTING PROFUNDO
# ════════════════════════════════════════════════════════════════
story.append(H1('4. Voice Fingerprinting: Tecnicas Avancadas'))

story.append(P(
    'O Voice Fingerprinting vai alem da analise superficial de vocabulario. Ele utiliza tecnicas de PLN avancadas '
    'para capturar nuances que definem a personalidade comunicativa do proprietario. Esta secao detalha os metodos '
    'de extracao, os algoritmos de classificacao e os mecanismos de validacao que garantem a fidelidade do perfil gerado.'
))

story.append(H2('4.1 Extracao de Sentimento por Turno'))
story.append(P(
    'Cada turno conversacional e analisado por um modelo de sentimento lightweight (baseado no BERTimbau, modelo '
    'BERT fine-tuned para portugues brasileiro) que atribui uma pontuacao entre -1 (extremamente negativo) e +1 '
    '(extremamente positivo). Alem do sentimento geral, o sistema extrai tres dimensoes adicionais: (1) <b>Empatia</b>, '
    'medida pela frequencia de frases que demonstram compreensao do ponto de vista do hóspede ("Entendo sua preocupacao", '
    '"Sei como e importante"), (2) <b>Entusiasmo</b>, medido por adjectives positivos, emojis e pontuacao exclamativa, '
    'e (3) <b>Proatividade</b>, medido pela frequencia com que o proprietario antecipa proximos passos e faz ofertas '
    'espontaneas. Estas tres dimensoes formam o "Triangulo Emocional" que e injetado no system prompt para guiar '
    'a tonalidade emocional do agente.'
))

story.append(H2('4.2 Analise de Topicos com LDA'))
story.append(P(
    'O sistema utiliza Latent Dirichlet Allocation (LDA) para identificar os topicos mais recorrentes nas conversas '
    'do proprietario. Para pousadas, os topicos tipicos incluem: disponibilidade de datas, preco e formas de pagamento, '
    'informacoes sobre a localizacao, atrativos turisticos proximos, servicos inclusos (cafe da manha, estacionamento), '
    'politicas de cancelamento e reembolso, e atividades recomendadas. A distribuicao de topicos por pousada e usada '
    'para priorizar os topicos que o agente deve abordar proativamente. Por exemplo, se a analise revelar que 40% das '
    'conversas bem-sucedidas mencionam atividades turisticas locais, o agente sera instruido a incluir sugestoes de '
    'atividades em suas respostas de forma natural.'
))

story.append(H2('4.3 Detecao de Estrategias de Conversao'))
story.append(P(
    'Uma das capacidades mais poderosas do Voice Fingerprinting e a deteccao automatica de estrategias de conversao '
    'que funcionaram no passado. O sistema analisa as conversas que resultaram em reserva (outcome=BOOKED) e identifica '
    'padroes recorrentes de comunicacao que estao correlacionados com o sucesso. Estes padroes sao classificados em '
    'quatro categorias: (1) <b>Ganchos de Abertura</b> - frases que geram engajamento imediato ("Que otimo que voce '
    'nos encontrou! Temos datas disponiveis para o feriado"), (2) <b>Construtores de Confianca</b> - elementos que '
    'reduzem a hesitacao ("Temos mais de 500 avaliacoes positivas no Booking", "Sou a Maria, estarei pessoal a recebe-lo"), '
    '(3) <b>Gatilhos de Urgencia Natural</b> - criacao de escassez sem ser agressiva ("Temos apenas 2 suites disponíveis '
    'para esse final de semana", "Essa promocao e valida ate sexta"), e (4) <b>Fechamento Suave</b> - tecnicas de '
    'conducao a reserva sem pressao ("Posso fazer uma reserva provisoria sem compromisso?", "Qual a melhor forma de '
    'pagamento para voce?").'
))

story.append(P(
    'Cada estrategia detectada recebe um <b>Score de Eficacia</b> calculado pela proporcao de vezes que ela aparece '
    'em conversas bem-sucedidas versus o total de conversas. Apenas estrategias com score acima de 0.3 e presentes em '
    'no minimo 5 conversas distintas sao incorporadas ao perfil ativo. Este filtro evita que anomalias estatisticas '
    '(uma frase que funcionou por coincidencia uma unica vez) sejam tratadas como padroes confiaveis.'
))

story.append(H2('4.4 Validacao do Perfil Gerado'))
story.append(P(
    'Antes de ativar o perfil de voz para producao, o sistema executa um processo de validacao em tres etapas. '
    'A primeira etapa e a <b>Consistencia Interna</b>: o sistema verifica se os atributos extraidos sao mutuamente '
    'consistentes (por exemplo, um alto Indice de Formalidade nao deveria coexistir com alta frequencia de emojis). '
    'Inconsistencias geram warnings e acionam uma revisao manual pelo proprietario. A segunda etapa e a <b>Comparacao '
    'com DNA Wizard</b>: se o proprietario ja preencheu o Tone Thermometer manualmente, o sistema compara as respostas '
    'do formulario com os dados extraidos das conversas. Divergencias superiores a 20% em qualquer dimensao geram um '
    'prompt de reconciliacao. A terceira etapa e o <b>Teste de Turing Parcial</b>: o sistema gera 10 respostas simuladas '
    'usando o perfil extraido e apresenta ao proprietario para que ele avalie em uma escala de 1 a 5 o quao fiel cada '
    'resposta esta ao seu estilo real. A media das avaliacoes deve ser igual ou superior a 3.5 para aprovacao.'
))

# ════════════════════════════════════════════════════════════════
# SECTION 5: PIPELINE DE FEEDBACK E CONVERSAO
# ════════════════════════════════════════════════════════════════
story.append(H1('5. Pipeline de Feedback e Conversao'))

story.append(P(
    'Nenhuma resposta da IA deve ir para o vazio. Este e o principio fundamental do loop de feedback obrigatorio '
    'do ZEHLA ML Brain. Cada interacao gerada pelo agente e automaticamente pareada com um mecanismo de rastreamento '
    'de resultado (conversao). Quando uma reserva e fechada, a thread inteira da conversa recebe uma pontuacao positiva. '
    'Quando um lead e perdido, a conversa e marcada para analise. Quando o lead fica pendente por mais de 48 horas sem '
    'resposta, o sistema dispara um alerta de follow-up. Este loop garante que o aprendizado do ML Brain seja sempre '
    'baseado em dados reais de resultado, nao apenas em suposicoes de qualidade.'
))

story.append(H2('5.1 Interface MLInteractionLog'))
story.append(P(
    'Toda interacao processada pelo LLM e registrada na interface MLInteractionLog, que armazena os dados necessarios '
    'para o treinamento continuo. Alem dos campos obrigatorios (tenantId, leadId, threadHistory, outcome, confidenceScore), '
    'o sistema registra metadados adicionais: o modelo utilizado (base ou fine-tuned), os documentos RAG injetados '
    '(referencias), o tempo de resposta, e o score de alinhamento de tom calculado em tempo real. Esta interface '
    'extende o schema basico para suportar a complexidade do aprendizado continuo.'
))

story.append(Spacer(1, 12))
story.append(make_table(
    ['Campo', 'Tipo', 'Descricao'],
    [
        ['tenantId', 'UUID', 'Identificador unico da pousada'],
        ['leadId', 'UUID', 'Identificador unico do lead/hospede'],
        ['threadHistory', 'Message[]', 'Historico completo da conversa (sanitizado)'],
        ['outcome', 'Enum', 'BOOKED | LOST | PENDING | IGNORED'],
        ['confidenceScore', 'Float', 'Score de confianca do modelo (0-1)'],
        ['modelUsed', 'String', 'Nome do modelo (gpt-4o-mini, ft-pousada-xyz, etc.)'],
        ['ragDocumentsUsed', 'UUID[]', 'IDs dos documentos RAG injetados no prompt'],
        ['toneAlignmentScore', 'Float', 'Cosine similarity com perfil de voz esperado'],
        ['responseTimeMs', 'Integer', 'Tempo total de processamento em milissegundos'],
        ['vectorsGenerated', 'Boolean', 'Se embeddings foram gerados nesta interacao'],
        ['feedbackManual', 'Enum?', 'THUMBS_UP | THUMBS_DOWN | NULL (feedback do dono)'],
        ['createdAt', 'DateTime', 'Timestamp da interacao'],
    ],
    [0.20, 0.15, 0.65]
))
story.append(Spacer(1, 6))
story.append(P('Tabela 5: Schema completo do MLInteractionLog', ParagraphStyle(name='Cap5', fontName='Carlito', fontSize=9, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)))

story.append(H2('5.2 Mecanismo de Pontuacao de Conversao'))
story.append(P(
    'O sistema utiliza um mecanismo de pontuacao em tres niveis para classificar a qualidade de cada interacao. '
    'O <b>Nivel 1 (Outcome Binary)</b> atribui +1 para conversas que resultaram em reserva e -1 para conversas perdidas. '
    'Este e o sinal mais forte de aprendizado. O <b>Nivel 2 (Tone Alignment)</b> mede a distancia semantica (cosine '
    'similarity) entre a resposta gerada pelo agente e as respostas tipicas do proprietario. Scores abaixo de 0.5 '
    'marcam a conversa como "fora de tom" mesmo que o outcome seja positivo. O <b>Nivel 3 (Lead Progression)</b> '
    'mede se a interacao avancou o lead no funil de vendas (de "primeiro contato" para "cotacao enviada", por exemplo). '
    'Este nivel e especialmente util para conversas pendentes que ainda nao resultaram em booking mas mostram progresso.'
))

story.append(H2('5.3 Feedback Ativo do Proprietario'))
story.append(P(
    'Alem do feedback passivo (baseado em outcomes), o sistema coleta feedback ativo do proprietario atraves de dois '
    'mecanismos. O primeiro e o <b>Painel de Revisao de Conversas</b> no ZCC, onde o proprietario pode ver transcritos '
    'recentes do agente e avaliar cada resposta com thumbs up/down. O segundo e a <b>Correcao em Tempo Real</b>: quando '
    'o proprietario assume manualmente uma conversa do agente (via transferencia), o sistema registra o ponto de '
    'intervencao e analisa a diferenca entre o que o agente disse e o que o proprietario disse a seguir. Esta diferenca '
    'e um sinal de aprendizado extremamente valioso, pois revela exatamente onde o agente divergiu do comportamento '
    'esperado. Essas correcoes manuais entram com peso 3x no dataset de fine-tuning em relacao as interacoes automaticas.'
))

# ════════════════════════════════════════════════════════════════
# SECTION 6: INTEGRACAO COM DNA WIZARD
# ════════════════════════════════════════════════════════════════
story.append(H1('6. Integracao com DNA Wizard e Insights Engine'))

story.append(P(
    'O ML Brain nao opera isolado: ele se integra profundamente com o DNA Wizard (ferramenta de onboarding que '
    'mapeia a comunicacao da pousada) e o Insights Engine (motor de insights comportamentais). Esta integracao '
    'cria um fluxo virtuoso onde os dados coletados no onboarding alimentam o aprendizado do ML, e os insights '
    'gerados pelo ML retroalimentam o DNA Wizard com descobertas que o proprietario pode nao ter percebido '
    'conscientemente sobre seu proprio estilo de comunicacao.'
))

story.append(H2('6.1 Tone Thermometer: Entrada e Saida ML'))
story.append(P(
    'O Tone Thermometer, pilar central do DNA Wizard, opera como interface entre as preferencias explicitas do '
    'proprietario e os dados implicitos extraidos pelo ML Brain. Quando o proprietario seleciona um arquetipo '
    '(de "Amigao de Infancia" a "Gerente 5 Estrelas") durante o onboarding, essa selecao define os parametros '
    'iniciais do system prompt do agente. Porem, o ML Brain pode ajustar dinamicamente esse arquetipo com base '
    'nos dados reais de conversacao. Por exemplo, se o proprietario se classificou como "Gestor Eficiente" mas '
    'a analise de suas conversas revela um Indice de Formalidade de 0.35 (mais proximo de "Anfitriiao Carinhoso"), '
    'o sistema sugere uma reconciliacao e ajusta o perfil para um modelo hibrido que respeita a intenção do '
    'proprietario mas reflete seus padroes reais.'
))

story.append(P(
    'As seis dimensoes do Tone Thermometer (Vocabulario, Empatia, Urgencia, Formalidade, Proatividade, Humor) '
    'sao continuamente calibradas pelo ML Brain. A cada 100 novas conversas processadas, o sistema recalcula os '
    'indices e, se houver desvio superior a 15% em qualquer dimensao, notifica o proprietario no ZCC com uma '
    'proposta de atualizacao do perfil. Este mecanismo garante que o DNA da pousada evolua naturalmente com o '
    'tempo, capturando mudancas de estilo, estrategia ou pessoal de atendimento.'
))

story.append(H2('6.2 Discount Keys: ML-Powered Pricing Intelligence'))
story.append(P(
    'As Chaves de Desconto do DNA Wizard recebem inteligencia adicional do ML Brain. O sistema analisa historicamente '
    'quais chaves de desconto foram mais eficazes para cada pousada e em quais contextos. Por exemplo, se a analise '
    'revela que a "Chave Temporada" (desconto para baixa temporada) tem taxa de conversao de 42% quando usada nos '
    'primeiros 3 dias de conversa, mas apenas 15% quando usada apos o dia 5, o sistema ajusta automaticamente a '
    'janela de ativacao da chave. O Insights Engine complementa essa analise com dados de elasticidade de preco: '
    'para cada pousada, o ML estima a curva de demanda e identifica o "sweet spot" de desconto que maximiza '
    'receita (nao apenas ocupacao). Esta inteligencia e exposta ao agente de IA como diretrizes de negociacao '
    'contextuais: "Para este lead especifico, o desconto maximo sugerido e 12% com base no perfil historico '
    'de conversoes desta pousada para este tipo de quarto nesta epoca do ano."'
))

story.append(H2('6.3 Insights Engine: Do Analise ao ML'))
story.append(P(
    'Os 12 insights do Insights Engine (Palavra-Gatilho, Hora de Ouro, Temperatura de Preco, Vazamento de Receita, '
    'etc.) sao gerados a partir dos dados de ML. Cada insight e calculado por uma query sobre o banco de vetores '
    'e o log de interacoes MLInteractionLog. A "Palavra-Gatilho", por exemplo, e identificada pelo ML como o '
    'termo que mais frequentemente aparece em conversas que resultaram em reserva (por exemplo, "cafe da manha '
    'artesanal" pode ser a palavra-gatilho de uma pousada boutique). A "Hora de Ouro" e calculada analizando '
    'os timestamps das reservas feitas via WhatsApp e identificando a janela de 2 horas com maior taxa de conversao. '
    'O Insights Engine roda diariamente como um cron job que compila os dados do MLInteractionLog das ultimas '
    '24 horas e atualiza os 12 insights no perfil da pousada, exibindo as descobertas no ZCC como cards acionaveis.'
))

# ════════════════════════════════════════════════════════════════
# SECTION 7: COGNITIVE OBSERVABILITY
# ════════════════════════════════════════════════════════════════
story.append(H1('7. Cognitive Observability e ZCC'))

story.append(P(
    'Todo modelo utilizado pelo ZEHLA deve emitir logs para a interface de Cognitive Observability do ZCC (Zehla '
    'Control Center). Este principio, chamado de "Cognitive Observability", garante que cada decisao do sistema de '
    'IA seja transparente, rastreavel e auditavel. O ZCC exibe metricas em tempo real que permitem ao proprietario '
    'e a equipe ZEHLA entender como o agente esta performando, onde estao os gargalos e quando e necessario intervir.'
))

story.append(H2('7.1 Metricas Principais'))
story.append(P(
    'O dashboard de Cognitive Observabilidade exibe seis metricas fundamentais que devem ser atualizadas em tempo '
    'real (via WebSocket) e tambem disponiveis em views historicas (diaria, semanal, mensal). A primeira metrica e '
    'a <b>Taxa de Conversao da IA vs Humano</b>: quantas reservas o bot fechou versus quantas foram fechadas quando '
    'o atendimento foi transferido para um humano. Esta metrica e o indicador mais importante de saude do sistema. '
    'A segunda metrica e o <b>Tone Alignment Score</b>: a media das distancias semanticas (cosine similarity) entre '
    'as respostas do agente e o perfil de voz esperado da pousada. Scores abaixo de 0.5 por mais de 24 horas acionam '
    'um alerta automatico. A terceira metrica e o <b>Model Drift Index</b>: medida da divergencia entre as predicoes '
    'do modelo e os outcomes reais ao longo do tempo. A quarta metrica e o <b>Response Latency (p95)</b>: tempo de '
    'resposta do agente em milissegundos. A quinta metrica e o <b>Handoff Rate</b>: frequencia de transferencias '
    'de conversas do agente para humanos. A sexta metrica e o <b>Lead Temperature Distribution</b>: distribuicao dos '
    'leads nos estagios do funil (frio, morno, quente, reservado).'
))

story.append(Spacer(1, 12))
story.append(make_table(
    ['Metrica', 'Fonte de Dados', 'Alerta Threshold', 'Frequencia'],
    [
        ['Taxa de Conversao IA', 'MLInteractionLog.outcome', '< 10% em 7 dias', 'Real-time + Diario'],
        ['Tone Alignment Score', 'Embedding cosine sim', '< 0.5 por 24h', 'Real-time'],
        ['Model Drift Index', 'Prediction vs Outcome', '> 0.3 em 7 dias', 'Semanal'],
        ['Response Latency p95', 'responseTimeMs', '> 3000ms', 'Real-time'],
        ['Handoff Rate', 'Transfer events', '> 30% em 7 dias', 'Diario'],
        ['Lead Temperature', 'Lead.stage distribution', '> 60% "frio" por 5 dias', 'Diario'],
    ],
    [0.22, 0.28, 0.25, 0.25]
))
story.append(Spacer(1, 6))
story.append(P('Tabela 6: Metricas de Cognitive Observability', ParagraphStyle(name='Cap6', fontName='Carlito', fontSize=9, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)))

story.append(H2('7.2 CognitiveObservability.tsx'))
story.append(P(
    'O componente CognitiveObservability.tsx no ZCC consome estas metricas via API interna (/api/ml/metrics) e '
    'as exibe em graficos interativos. O componente deve implementar: (1) cards de resumo com valor atual, variacao '
    'percentual semanal e badge de status (verde/amarelo/vermelho), (2) grafico de linha temporal para cada metrica '
    'com comparacao semana-a-semana, (3) tabela de ultimas interacoes com score de alinhamento, outcome e modelo '
    'utilizado, (4) botao de "drill-down" que exibe o prompt completo e os documentos RAG injetados para qualquer '
    'interacao especifica, e (5) painel de alertas com recomendacoes automaticas de acao ("Tom desalinhado detectado: '
    'considere re-treinar o modelo com dados recentes").'
))

# ════════════════════════════════════════════════════════════════
# SECTION 8: MODEL DRIFT E ZEHLA GUARDIAN
# ════════════════════════════════════════════════════════════════
story.append(H1('8. Model Drift Detection e Zehla Guardian'))

story.append(P(
    'O drift de modelo e um dos maiores riscos em sistemas de ML em producao. Conforme o comportamento dos clientes '
    'muda (novas formas de perguntar sobre precos, novos topicos de interesse, mudancas sazonais de demanda), o '
    'modelo treinado com dados antigos gradualmente perde eficacia. O ZEHLA ML Brain implementa um sistema de '
    'deteccao e remediacao de drift chamado Zehla Guardian, que opera em tres niveis de resposta automatica.'
))

story.append(H2('8.1 Deteccao de Drift'))
story.append(P(
    'O Zehla Guardian monitora tres tipos de drift simultaneamente. O <b>Data Drift</b> detecta mudancas na '
    'distribuicao das mensagens recebidas (novos topicos, vocabulario diferente, padrões de horario alterados) '
    'usando a metrica de Population Stability Index (PSI) calculada semanalmente sobre os embeddings das mensagens. '
    'Se o PSI exceder 0.2, o sistema sinaliza drift moderado. Se exceder 0.5, drift severo. O <b>Concept Drift</b> '
    'detecta mudancas na relacao entre features e outcomes (por exemplo, uma estrategia que funcionava no verao '
    'para de funcionar no inverno) monitorando a divergencia entre predicoes do modelo e outcomes reais. O '
    '<b>Performance Drift</b> detecta degradacao nas metricas de negocio (taxa de conversao, tempo de resposta, '
    'satisfacao do cliente) comparando as medias moveis de 7 dias com as medias dos 30 dias anteriores.'
))

story.append(H2('8.2 Niveis de Resposta do Guardian'))

story.append(Spacer(1, 12))
story.append(make_table(
    ['Nivel', 'Condicao', 'Acao Automatica', 'Notificacao'],
    [
        ['Verde (Normal)', 'Todas as metricas dentro do threshold', 'Nenhuma. Operacao normal.', 'Nenhuma'],
        ['Amarelo (Atencao)', '1 metrica fora do threshold por 24h', 'Log de warning. Coleta de dados intensificada.', 'Email ao suporte ZEHLA'],
        ['Laranja (Alerta)', '2+ metricas fora do threshold por 48h', 'Fallback para modelo base. Resposta final mais conservadora.', 'Push + Email ao proprietario'],
        ['Vermelho (Critico)', 'Tone alignment < 0.3 ou drift severo (PSI>0.5)', 'Agente desativado. 100% das conversas transferidas para humano.', 'Push + Email + SMS ao proprietario'],
    ],
    [0.12, 0.28, 0.35, 0.25]
))
story.append(Spacer(1, 6))
story.append(P('Tabela 7: Niveis de resposta do Zehla Guardian', ParagraphStyle(name='Cap7', fontName='Carlito', fontSize=9, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)))

story.append(P(
    'O Zehla Guardian tambem implementa um mecanismo de auto-recovery. Quando um drift e detectado no nivel amarelo, '
    'o sistema automaticamente agenda um ciclo de re-treinamento com os dados mais recentes (ultima 2 semanas). Se o '
    're-treinamento resolver o drift, o modelo atualizado e promovido para producao sem intervencao humana. Se o drift '
    'persistir apos o re-treinamento, o sistema escala para o nivel laranja e solicita revisao manual da equipe ZEHLA. '
    'Este design garante que a maioria dos drifts seja corrigida automaticamente, reservando a intervencao humana apenas '
    'para casos que realmente necessitam de analise especializada.'
))

# ════════════════════════════════════════════════════════════════
# SECTION 9: ISOLAMENTO MULTI-TENANT
# ════════════════════════════════════════════════════════════════
story.append(H1('9. Isolamento Multi-Tenant'))

story.append(P(
    'O ZEHLA ML Brain opera em um ambiente multi-tenant onde cada pousada e um tenant independente com seus proprios '
    'dados, modelos e configuracoes de ML. O isolamento rigoroso entre tenants e um requisito nao negociavel, tanto '
    'por questoes de privacidade (LGPD) quanto por questoes de qualidade (o tom de voz da pousada A nunca deve '
    'influenciar as respostas da pousada B). O isolamento e implementado em quatro camadas: dados, embeddings, '
    'modelos e prompts.'
))

story.append(P(
    'Na camada de <b>Dados</b>, todas as queries ao banco de dados incluem obrigatoriamente o filtro tenantId. '
    'O Prisma middleware (tenantGuard) injeta automaticamente este filtro em todas as operacoes, impedindo que '
    'um tenant acesse dados de outro. Na camada de <b>Embeddings</b>, cada tenant possui seu proprio namespace '
    'no PGVector. Os embeddings sao armazenados com metadata que inclui o tenantId, e toda query de busca inclui '
    'um filtro de metadata que restringe os resultados ao tenant correto. Na camada de <b>Modelos</b>, cada pousada '
    'com fine-tuning habilitado possui seu proprio modelo dedicado com ID unico (ft-pousada-{tenantId}). O LLM Router '
    'seleciona automaticamente o modelo correto com base no tenantId da conversa ativa. Na camada de <b>Prompts</b>, '
    'cada tenant possui seu proprio system prompt armazenado no banco de dados, que e injetado pelo LLM Router no '
    'inicio de cada conversa. O prompt e cacheado em Redis com TTL de 5 minutos para performance.'
))

story.append(Callout('Regra de Ouro Multi-Tenant: Nunca consultar embeddings, modelos ou prompts sem o filtro tenantId. O tenantGuard middleware no Prisma garante isso automaticamente em nivel de banco de dados, mas todo acesso direto ao PGVector ou a modelos fine-tuned tambem deve incluir a verificacao explicita.'))

# ════════════════════════════════════════════════════════════════
# SECTION 10: PRIVACIDADE E LGPD NO ML
# ════════════════════════════════════════════════════════════════
story.append(H1('10. Privacidade e LGPD no Contexto ML'))

story.append(P(
    'O processamento de Machine Learning envolve grandes volumes de dados de comunicacao, o que torna a conformidade '
    'com a LGPD particularmente critica nesta camada do sistema. O ZEHLA ML Brain implementa um framework de privacidade '
    'em cinco pilares que garante que o aprendizado do modelo nao comprometa os direitos dos titulares dos dados.'
))

story.append(H2('10.1 Cinco Pilares de Privacidade ML'))
story.append(Bullet('<b>Consentimento Especifico para ML:</b> O termo de consentimento do proprietario inclui uma clausula explicita e separada autorizando o uso de suas conversas para treinamento de IA. Sem este consentimento, o ML Brain opera apenas com RAG e nao executa fine-tuning.'))
story.append(Bullet('<b>Anonimizacao Pre-Vetorizacao:</b> Antes de gerar embeddings, toda mensagem passa pela pipeline de PII detection e substituicao. Embeddings sao criados sobre textos anonimizados, nunca sobre dados brutos. O mapeamento PII para anonimizado e mantido apenas por 72 horas para debug, depois descartado de forma segura.'))
story.append(Bullet('<b>Direito ao Esquecimento ML:</b> Se um proprietario solicita a exclusao de seus dados (LGPD Art. 18), o sistema exclui nao apenas os dados no banco, mas tambem: (a) remove seus embeddings do PGVector, (b) exclui o modelo fine-tuned (se existir) via API, e (c) invalida os caches de prompt no Redis. O processo e concluido em ate 24 horas.'))
story.append(Bullet('<b>Minimizacao de Dados:</b> O sistema retém apenas os dados minimamente necessarios para o ML. Mensagens com outcome=IGNORED sao descartadas apos 30 dias. Embeddings de conversas com mais de 6 meses e sem conversao associada sao arquivados em cold storage e removidos do index de busca ativo.'))
story.append(Bullet('<b>Audit Trail Completo:</b> Cada operacao de ML (geracao de embedding, fine-tuning, atualizacao de perfil de voz) e registrada no audit log com: operador (sistema ou usuario), tenantId, tipo de dado processado, timestamp e hash de verificacao. Este log e mantido por 24 meses e disponivel para auditoria.'))

story.append(H2('10.2 Pipeline de Sanitizacao de Dados'))
story.append(P(
    'A pipeline de sanitizacao opera como um middleware entre a ingestao de mensagens e o processamento de ML. '
    'Ela utiliza uma combinacao de regex patterns e NER (via spaCy para portugues) para detectar e substituir '
    'dados pessoais. Os padroes cobertos incluem: nomes proprios (detected pelo NER com threshold de confianca 0.85), '
    'numeros de telefone brasileiros (regex para formatos +55 XX XXXXX-XXXX e variantes), CPF (regex com validacao '
    'de digitos verificadores), emails (regex RFC 5322), enderecos (NER + regex de CEP), dados bancarios (agencia, '
    'conta, cartao via regex especificas), e placa de veiculo (regex para formato mercosul e antigo). Cada substituicao '
    'e registrada no audit trail com o tipo de dado detectado, a posicao no texto e o hash do original para '
    'possivel verificacao futura.'
))

# ════════════════════════════════════════════════════════════════
# SECTION 11: IMPLEMENTACAO - COMANDOS DO AGENTE
# ════════════════════════════════════════════════════════════════
story.append(H1('11. Comandos do Agente de Desenvolvimento'))

story.append(P(
    'Esta secao fornece os comandos e procedimentos que o agente de desenvolvimento deve seguir ao implementar, '
    'modificar ou debugar componentes do ML Brain. Todos os comandos assume que o projeto esta na raiz do workspace '
    'e utilizam as ferramentas padrao do stack (BullMQ, Prisma, Redis, PGVector).'
))

story.append(H2('11.1 Implementacao do Feedback Loop'))
story.append(P(
    'Ao modificar llm-router.ts ou qualquer componente de IA, o agente deve: (1) Verificar que toda resposta do LLM '
    'dispara o registro no MLInteractionLog antes de ser enviada ao WhatsApp, (2) Garantir que o campo toneAlignmentScore '
    'e calculado em tempo real comparando o embedding da resposta gerada com o embedding do perfil de voz da pousada, '
    '(3) Confirmar que o outcome da conversa e atualizado por webhook quando uma reserva e criada/cancelada, e '
    '(4) Validar que o tenantGuard middleware esta ativo em todas as operacoes de banco relacionadas a ML.'
))

story.append(H2('11.2 Exportacao para Fine-Tuning'))
story.append(P(
    'O script de exportacao para fine-tuning esta localizado em scripts/ml-training/export-training-data.ts e deve '
    'ser executado semanalmente via cron job. O script seleciona automaticamente conversas com outcome=BOOKED e '
    'toneAlignmentScore >= 0.7, formata no padrao jsonl da OpenAI, valida a integridade dos dados e faz upload '
    'para um bucket seguro. O agente pode tambem executar manualmente para pousadas especificas passando o tenantId '
    'como argumento. O script gera um relatorio de qualidade que inclui: numero de exemplos exportados, distribuicao '
    'de sentimento, cobertura de topicos e estimativa de qualidade do dataset.'
))

story.append(H2('11.3 Atualizacao do CognitiveObservability'))
story.append(P(
    'Ao adicionar novas metricas ao ML Brain, o agente deve: (1) Adicionar a metrica ao schema MLInteractionLog '
    'se necessario, (2) Atualizar o endpoint /api/ml/metrics para incluir a nova metrica, (3) Adicionar o card '
    'correspondente no componente CognitiveObservability.tsx com grafico e thresholds de alerta, e (4) Documentar '
    'a metrica no ZCC com descricao, formula de calculo e acao recomendada quando fora do threshold.'
))

story.append(H2('11.4 Scripts ML Disponiveis'))
story.append(Spacer(1, 8))
story.append(make_table(
    ['Script', 'Localizacao', 'Funcao', 'Frequencia'],
    [
        ['export-training-data.ts', 'scripts/ml-training/', 'Exporta conversas para fine-tuning', 'Semanal (cron)'],
        ['generate-voice-profile.ts', 'scripts/ml-training/', 'Gera Voice Profile a partir de conversas', 'On-demand'],
        ['run-fine-tuning.ts', 'scripts/ml-training/', 'Submete job de fine-tuning a API OpenAI', 'Semanal (cron)'],
        ['evaluate-model.ts', 'scripts/ml-training/', 'Avalia modelo fine-tuned vs base', 'Apos treinamento'],
        ['detect-drift.ts', 'scripts/ml/', 'Calcula PSI e detecta data/concept drift', 'Diario (cron)'],
        ['cleanup-old-embeddings.ts', 'scripts/ml/', 'Remove embeddings com mais de 6 meses', 'Mensal (cron)'],
        ['sanitization-pipeline.ts', 'scripts/ml/', 'Executa pipeline de PII detection', 'Real-time (middleware)'],
    ],
    [0.22, 0.22, 0.34, 0.22]
))
story.append(Spacer(1, 6))
story.append(P('Tabela 8: Scripts ML disponiveis para o agente', ParagraphStyle(name='Cap8', fontName='Carlito', fontSize=9, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)))

# ════════════════════════════════════════════════════════════════
# SECTION 12: ROADMAP DE IMPLEMENTACAO
# ════════════════════════════════════════════════════════════════
story.append(H1('12. Roadmap de Implementacao'))

story.append(P(
    'A implementacao do ZEHLA ML Brain segue um roadmap de 16 semanas dividido em quatro fases, cada uma com '
    'entregaveis claros e criterios de aceitacao. As fases sao progressivas: cada uma depende da anterior e adiciona '
    'camadas de complexidade e inteligencia ao sistema. O design permite que a primeira fase entregue valor '
    'imediato (RAG basico) enquanto as fases subsequentes incrementam progressivamente a personalizacao e eficiencia.'
))

story.append(Spacer(1, 12))
story.append(make_table(
    ['Fase', 'Semanas', 'Entregavel Principal', 'Criterio de Aceitacao'],
    [
        ['Fase 1: RAG Foundation', '1-4', 'Pipeline de embeddings + busca semantica', 'Busca sub-200ms, top-3 relevantes'],
        ['Fase 2: Voice Cloning', '5-8', 'Pipeline de analise de conversas + Voice Profile', 'Perfil gerado com 6 dimensoes'],
        ['Fase 3: Fine-Tuning', '9-12', 'Pipeline de treinamento + deploy de modelos', 'Modelo fine-tuned supera base em 15%'],
        ['Fase 4: Guardian', '13-16', 'Drift detection + auto-remediation + observability', 'Drift detectado em < 24h, recovery automatico'],
    ],
    [0.16, 0.10, 0.38, 0.36]
))
story.append(Spacer(1, 6))
story.append(P('Tabela 9: Roadmap de implementacao do ML Brain', ParagraphStyle(name='Cap9', fontName='Carlito', fontSize=9, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=12)))

story.append(H2('12.1 Fase 1: RAG Foundation (Semanas 1-4)'))
story.append(Bullet('<b>Semana 1:</b> Setup do PGVector, configuracao do schema de embeddings, implementacao do middleware de sanitizacao PII, e criacao do service de embedding (OpenAI API wrapper com retry e rate limiting).'))
story.append(Bullet('<b>Semana 2:</b> Implementacao da pipeline de ingestao de conversas (Capture + Enrich), parser de arquivos exportados do WhatsApp (.txt), e integracao com o event pipeline existente (Phase 4 Brain Sync).'))
story.append(Bullet('<b>Semana 3:</b> Implementacao da busca semantica (Retrieve) com reranker, integracao com o llm-router para injecao de contexto RAG no prompt, e testes de qualidade de busca com 50 cenarios simulados.'))
story.append(Bullet('<b>Semana 4:</b> Implementacao do MLInteractionLog basico (sem fine-tuning), metricas de Tone Alignment Score, e deploy em staging para testes com 3 pousadas piloto.'))

story.append(H2('12.2 Fase 2: Voice Cloning (Semanas 5-8)'))
story.append(Bullet('<b>Semana 5:</b> Implementacao completa do Voice Fingerprinting (6 dimensoes), parser avancado de conversas WhatsApp com deteccao de turnos, e calculo do Indice de Formalidade.'))
story.append(Bullet('<b>Semana 6:</b> Analise de sentimento por turno (BERTimbau), extracao de topicos com LDA, e deteccao de estrategias de conversao correlacionadas com outcome=BOOKED.'))
story.append(Bullet('<b>Semana 7:</b> Geracao automatica do Voice Profile Document (JSON estruturado), integracao com o DNA Wizard (preenchimento automatico do Tone Thermometer), e fluxo de validacao pelo proprietario.'))
story.append(Bullet('<b>Semana 8:</b> Teste de Turing Parcial (10 cenarios simulados para validacao pelo proprietario), refinamentos baseados em feedback dos pilotos, e documentacao completa.'))

story.append(H2('12.3 Fase 3: Fine-Tuning (Semanas 9-12)'))
story.append(Bullet('<b>Semana 9:</b> Implementacao do script de exportacao para fine-tuning (selecao, formatacao, validacao), integracao com a API de Fine-Tuning da OpenAI, e pipeline de submissao de jobs.'))
story.append(Bullet('<b>Semana 10:</b> Implementacao do script de avaliacao de modelos (base vs fine-tuned em 50 cenarios), pipeline de promocao para producao (A/B testing), e rollback automatico em caso de regressao.'))
story.append(Bullet('<b>Semana 11:</b> Implementacao do LLM Router com selecao automatica de modelo (base vs fine-tuned por tenant), cache de modelos no Redis, e fallback graceful para modelo base em caso de falha.'))
story.append(Bullet('<b>Semana 12:</b> Cron job semanal de treinamento automatico, otimizacao de custos (compressao de prompts, cache de embeddings), e deploy em producao para todas as pousadas ativas.'))

story.append(H2('12.4 Fase 4: Guardian (Semanas 13-16)'))
story.append(Bullet('<b>Semana 13:</b> Implementacao do calculo de PSI para deteccao de data drift, deteccao de concept drift (prediction vs outcome), e deteccao de performance drift (metricas de negocio).'))
story.append(Bullet('<b>Semana 14:</b> Implementacao dos quatro niveis de resposta do Zehla Guardian (verde/amarelo/laranja/vermelho), sistema de auto-recovery com re-treinamento automatico, e notificacoes multi-canal.'))
story.append(Bullet('<b>Semana 15:</b> Implementacao completa do CognitiveObservability.tsx no ZCC (6 metricas em tempo real, graficos interativos, drill-down de interacoes, painel de alertas).'))
story.append(Bullet('<b>Semana 16:</b> Testes de integracao end-to-end, testes de stress (1000 conversas simultaneas), audit de seguranca LGPD, e documentacao final de producao.'))

# ━━ Build ━━
doc.multiBuild(story)
print("PDF body generated successfully!")
