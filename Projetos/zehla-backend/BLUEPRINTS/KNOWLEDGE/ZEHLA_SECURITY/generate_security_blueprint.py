#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ZEHLA Data Security Blueprint - PDF Generator
Covers: LGPD, Encryption, Access Control, WhatsApp Security, Lead Protection,
        Infrastructure, Audit Logging, Backup/Recovery, Incident Response
"""

import sys, os
import hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
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
# COLOR PALETTE (auto-generated)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCENT       = colors.HexColor('#c14c25')
TEXT_PRIMARY  = colors.HexColor('#202224')
TEXT_MUTED    = colors.HexColor('#6d7478')
BG_SURFACE   = colors.HexColor('#dbdfe2')
BG_PAGE      = colors.HexColor('#eaedef')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STYLES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE_W, PAGE_H = A4
LEFT_M = 1.0 * inch
RIGHT_M = 1.0 * inch
TOP_M = 0.9 * inch
BOTTOM_M = 0.9 * inch
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    name='DocTitle', fontName='DejaVuSerif', fontSize=28,
    leading=36, alignment=TA_LEFT, textColor=ACCENT, spaceAfter=6
)
h1_style = ParagraphStyle(
    name='H1', fontName='DejaVuSerif', fontSize=20,
    leading=28, alignment=TA_LEFT, textColor=ACCENT,
    spaceBefore=18, spaceAfter=10
)
h2_style = ParagraphStyle(
    name='H2', fontName='DejaVuSerif', fontSize=15,
    leading=22, alignment=TA_LEFT, textColor=TEXT_PRIMARY,
    spaceBefore=14, spaceAfter=8
)
h3_style = ParagraphStyle(
    name='H3', fontName='DejaVuSerif', fontSize=12,
    leading=18, alignment=TA_LEFT, textColor=TEXT_PRIMARY,
    spaceBefore=10, spaceAfter=6
)
body_style = ParagraphStyle(
    name='Body', fontName='DejaVuSerif', fontSize=10.5,
    leading=17, alignment=TA_LEFT, textColor=TEXT_PRIMARY,
    spaceBefore=0, spaceAfter=6, wordWrap='CJK'
)
body_indent = ParagraphStyle(
    name='BodyIndent', fontName='DejaVuSerif', fontSize=10.5,
    leading=17, alignment=TA_LEFT, textColor=TEXT_PRIMARY,
    spaceBefore=0, spaceAfter=6, leftIndent=20, wordWrap='CJK'
)
bullet_style = ParagraphStyle(
    name='Bullet', fontName='DejaVuSerif', fontSize=10.5,
    leading=17, alignment=TA_LEFT, textColor=TEXT_PRIMARY,
    spaceBefore=2, spaceAfter=4, leftIndent=28, bulletIndent=14,
    bulletFontName='Tinos', bulletFontSize=10.5
)
code_style = ParagraphStyle(
    name='Code', fontName='SarasaMonoSC', fontSize=9,
    leading=14, alignment=TA_LEFT, textColor=colors.HexColor('#1a1a2e'),
    backColor=colors.HexColor('#f4f4f8'),
    spaceBefore=4, spaceAfter=4, leftIndent=14,
    borderColor=TEXT_MUTED, borderWidth=0.5, borderPadding=6,
    wordWrap='CJK'
)
callout_style = ParagraphStyle(
    name='Callout', fontName='DejaVuSerif', fontSize=10.5,
    leading=17, alignment=TA_LEFT, textColor=ACCENT,
    spaceBefore=6, spaceAfter=6, leftIndent=20,
    borderColor=ACCENT, borderWidth=2, borderPadding=8,
    backColor=colors.HexColor('#fdf4f0')
)
caption_style = ParagraphStyle(
    name='Caption', fontName='DejaVuSerif', fontSize=9,
    leading=14, alignment=TA_CENTER, textColor=TEXT_MUTED,
    spaceBefore=3, spaceAfter=6
)
toc_h1 = ParagraphStyle(name='TOCH1', fontSize=13, leftIndent=20, fontName='DejaVuSerif', leading=22, textColor=TEXT_PRIMARY)
toc_h2 = ParagraphStyle(name='TOCH2', fontSize=11, leftIndent=40, fontName='DejaVuSerif', leading=18, textColor=TEXT_MUTED)

header_cell = ParagraphStyle(
    name='HeaderCell', fontName='DejaVuSerif', fontSize=10,
    leading=14, alignment=TA_CENTER, textColor=colors.white
)
body_cell = ParagraphStyle(
    name='BodyCell', fontName='DejaVuSerif', fontSize=9.5,
    leading=14, alignment=TA_LEFT, textColor=TEXT_PRIMARY, wordWrap='CJK'
)
body_cell_center = ParagraphStyle(
    name='BodyCellCenter', fontName='DejaVuSerif', fontSize=9.5,
    leading=14, alignment=TA_CENTER, textColor=TEXT_PRIMARY
)

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
    """Create a styled table with alternating rows."""
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
    elements = [Spacer(1, 18), t]
    if caption_text:
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(caption_text, caption_style))
    elements.append(Spacer(1, 18))
    return elements

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CONTENT BUILD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT_PATH = '/home/z/my-project/download/ZEHLA_Data_Security_Blueprint.pdf'
BODY_PATH = '/home/z/my-project/download/ZEHLA_security_body.pdf'
COVER_PATH = '/home/z/my-project/download/ZEHLA_security_cover.pdf'

doc = TocDocTemplate(
    BODY_PATH,
    pagesize=A4,
    leftMargin=LEFT_M, rightMargin=RIGHT_M,
    topMargin=TOP_M, bottomMargin=BOTTOM_M
)

story = []

# ─── TOC ───
story.append(Paragraph('<b>Table of Contents</b>', title_style))
story.append(Spacer(1, 12))
toc = TableOfContents()
toc.levelStyles = [toc_h1, toc_h2]
story.append(toc)
story.append(PageBreak())

# ═══════════════════════════════════════════════════════
# SECTION 1: INTRODUCTION
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>1. Introducao: Por Que Seguranca de Dados e Critica</b>', h1_style, 0),
    Paragraph(
        'O ecossistema ZEHLA opera na intersecao de tres vetores de alta sensibilidade: dados pessoais de proprietarios '
        'de pousadas coletados de fontes publicas, mensagens enviadas e recebidas via WhatsApp que trafegam informacoes '
        'comerciais confidenciais, e dados comportamentais gerados pelo sistema de pontuacao e classificacao de leads. '
        'A combinacao desses elementos cria um superficie de ataque significativa que exige uma arquitetura de seguranca '
        'robusta, multi-camadas e em conformidade com a legislacao brasileira de protecao de dados.',
        body_style
    ),
    Paragraph(
        'Com mais de 10.000 contatos de pousadas em sua base de dados, incluindo numeros de telefone, nomes, localizacoes '
        'geograficas e perfis de negocio, qualquer violacao de seguranca pode resultar em danos reputacionais irreparaveis, '
        'multas regulatórias severas pela Autoridade Nacional de Protecao de Dados (ANPD), e a perda de confianca dos '
        'proprietarios que constituem o nucleo do modelo de negocio SMARTHOTEL. Alem disso, as mensagens enviadas via '
        'WhatsApp carregam propostas comerciais, precos e estrategias que, se expostas, podem comprometer vantagens '
        'competitivas significativas no mercado de hospitalidade.',
        body_style
    ),
    Paragraph(
        'Este blueprint define a arquitetura de seguranca completa para o ecossistema ZEHLA, cobrindo sete pilares '
        'fundamentais: (1) conformidade com a LGPD e framework de privacidade, (2) criptografia de dados em repouso e '
        'em transito, (3) controle de acesso e autenticacao multi-fator, (4) seguranca especifica para mensagens WhatsApp, '
        '(5) protecao de dados de leads e planilhas sensíveis, (6) logging de auditoria e monitoramento em tempo real, '
        'e (7) plano de resposta a incidentes e recuperacao de desastres. Cada pilar e detalhado com controles tecnicos '
        'especificos, prioridades de implementacao e metricas de verificacao.',
        body_style
    ),
])

# Data classification table
data_class = [
    [Paragraph('<b>Categoria</b>', header_cell),
     Paragraph('<b>Exemplos</b>', header_cell),
     Paragraph('<b>Nivel de Risco</b>', header_cell),
     Paragraph('<b>Regulamentacao</b>', header_cell)],
    [Paragraph('Dados Pessoais', body_cell),
     Paragraph('Nome, telefone, e-mail, endereco da pousada, CNPJ', body_cell),
     Paragraph('ALTO', body_cell_center),
     Paragraph('LGPD Art. 5, Art. 46', body_cell_center)],
    [Paragraph('Mensagens WhatsApp', body_cell),
     Paragraph('Propostas comerciais, respostas de leads, historico de conversas', body_cell),
     Paragraph('CRITICO', body_cell_center),
     Paragraph('LGPD Art. 7, Marco Civil', body_cell_center)],
    [Paragraph('Dados Comportamentais', body_cell),
     Paragraph('Score de lead, estagio do funil, cluster, historico de interacoes', body_cell),
     Paragraph('MEDIO-ALTO', body_cell_center),
     Paragraph('LGPD Art. 8, Art. 20', body_cell_center)],
    [Paragraph('Dados de Negocio', body_cell),
     Paragraph('Estrategia de precos, taxas de conversao, taxa de resposta', body_cell),
     Paragraph('ALTO', body_cell_center),
     Paragraph('Segredo empresarial', body_cell_center)],
    [Paragraph('Credenciais de Acesso', body_cell),
     Paragraph('Tokens API, chaves de criptografia, sessoes WhatsApp', body_cell),
     Paragraph('CRITICO', body_cell_center),
     Paragraph('LGPD Art. 46, LGPD Art. 48', body_cell_center)],
]
cw1 = [CONTENT_W * 0.22, CONTENT_W * 0.38, CONTENT_W * 0.15, CONTENT_W * 0.25]
story.extend(make_table(data_class, cw1, '<b>Tabela 1:</b> Classificacao de dados sensíveis do ecossistema ZEHLA'))

# ═══════════════════════════════════════════════════════
# SECTION 2: LGPD COMPLIANCE
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>2. Framework de Conformidade LGPD</b>', h1_style, 0),
    Paragraph(
        'A Lei Geral de Protecao de Dados (Lei 13.709/2018) estabelece regras claras sobre coleta, armazenamento, '
        'tratamento e compartilhamento de dados pessoais no Brasil. O ecossistema ZEHLA, ao operar com dados de '
        'proprietarios de pousadas captados de fontes publicas como Google Maps e redes sociais, precisa garantir '
        'que todas as bases legais de tratamento sejam respeitadas. A lgica central e que, mesmo quando os dados '
        'sao publicos, o seu tratamento para fins comerciais exige bases legais especificas, como legítimo interesse '
        'ou consentimento, dependendo do contexto e da finalidade.',
        body_style
    ),
    add_heading('<b>2.1 Bases Legais de Tratamento Aplicaveis</b>', h2_style, 1),
    Paragraph(
        'Para cada tipo de operacao de dados realizada pelo ZEHLA, e necessario identificar a base legal adequada. '
        'A tabela a seguir mapeia cada operacao do sistema para sua respectiva base legal na LGPD, incluindo o '
        'fundamento juridico e as medidas de mitigacao associadas. Este mapeamento deve ser revisado trimestralmente '
        'pelo DPO (Data Protection Officer) designado e atualizado sempre que novas funcionalidades forem adicionadas '
        'ao sistema.',
        body_style
    ),
])

lgpd_table = [
    [Paragraph('<b>Operacao</b>', header_cell),
     Paragraph('<b>Base Legal</b>', header_cell),
     Paragraph('<b>Artigo LGPD</b>', header_cell),
     Paragraph('<b>Medida Necessaria</b>', header_cell)],
    [Paragraph('Captura de leads de fontes publicas', body_cell),
     Paragraph('Legitimo Interesse', body_cell_center),
     Paragraph('Art. 7, IX', body_cell_center),
     Paragraph('Teste de proporcionalidade e ROPA', body_cell)],
    [Paragraph('Envio de mensagens WhatsApp', body_cell),
     Paragraph('Consentimento', body_cell_center),
     Paragraph('Art. 7, I', body_cell_center),
     Paragraph('Opt-in confirmado, opt-out facil', body_cell)],
    [Paragraph('Scoring e classificacao de leads', body_cell),
     Paragraph('Execucao de contrato', body_cell_center),
     Paragraph('Art. 7, V', body_cell_center),
     Paragraph('Transparencia no processamento', body_cell)],
    [Paragraph('Armazenamento de mensagens', body_cell),
     Paragraph('Obrigacao legal', body_cell_center),
     Paragraph('Art. 7, II', body_cell_center),
     Paragraph('Retention policy definida', body_cell)],
    [Paragraph('Compartilhamento com SMARTHOTEL', body_cell),
     Paragraph('Consentimento', body_cell_center),
     Paragraph('Art. 7, I', body_cell_center),
     Paragraph('DPA assinado entre partes', body_cell)],
]
cw2 = [CONTENT_W * 0.30, CONTENT_W * 0.20, CONTENT_W * 0.16, CONTENT_W * 0.34]
story.extend(make_table(lgpd_table, cw2, '<b>Tabela 2:</b> Mapeamento de operacoes para bases legais LGPD'))

story.extend([
    add_heading('<b>2.2 Direitos dos Titulares e Mecanismos de Exercicio</b>', h2_style, 1),
    Paragraph(
        'A LGPD garante aos titulares de dados uma serie de direitos que devem ser implementados como funcionalidades '
        'técnicas no sistema ZEHLA. O direito de acesso (Art. 18) exige que qualquer proprietario de pousada possa '
        'solicitar e receber, em ate 15 dias, uma copia completa de todos os dados pessoais armazenados. O direito '
        'de eliminacao (Art. 18, VI) requer que o sistema suporte a exclusao completa de um lead e todas as suas '
        'interacoes associadas, incluindo mensagens, scores e eventos do pipeline, mantendo apenas registros anonimizados '
        'para fins estatisticos quando aplicavel.',
        body_style
    ),
    Paragraph(
        'O direito de portabilidade (Art. 18, V) implica que o ZEHLA deve ser capaz de exportar todos os dados de um '
        'titular em formato estruturado e de uso corrente, como JSON ou CSV. Ja o direito de revogacao do consentimento '
        '(Art. 8, par. 5) exige que, ao receber uma solicitacao de opt-out, o sistema interrompa imediatamente qualquer '
        'envio de mensagens ao numero revogado e marque o lead como inativo no pipeline de eventos. A implementacao '
        'desses direitos como rotinas automatizadas no backend do ZEHLA Brain garante conformidade operacional e reduz '
        'o risco de penalidades da ANPD.',
        body_style
    ),
    add_heading('<b>2.3 Documentos de Conformidade Obrigatorios</b>', h2_style, 1),
    Paragraph(
        'Para demonstrar conformidade com a LGPD, o ecossistema ZEHLA precisa manter uma suite de documentos de '
        'governanca de dados. O Registro de Operacoes de Tratamento (ROPA) e o documento central que mapeia todas '
        'as atividades de processamento de dados, incluindo categorias de titulares, dados tratados, finalidades, '
        'bases legais, medidas de seguranca e prazo de retencao. Este registro deve ser atualizado sempre que houver '
        'alteracoes nas operacoes de tratamento e deve estar disponivel para consulta pela ANPD mediante solicitacao.',
        body_style
    ),
    Paragraph(
        'Alem do ROPA, o ZEHLA necessita de um Termo de Privacidade especifico para proprietarios de pousadas que '
        'recebem mensagens, um Relatorio de Impacto a Protecao de Dados (RIPD) que avalie os riscos do processamento '
        'em massa de dados pessoais via WhatsApp, e uma Politica de Retencao que defina prazos claros para cada '
        'categoria de dado. Os prazos recomendados sao: mensagens WhatsApp (90 dias apos ultima interacao), dados '
        'de scoring (12 meses), leads inativos sem resposta (6 meses), e registros de auditoria (24 meses). '
        'Apos expiracao do prazo, os dados devem ser anonimizados ou eliminados de forma segura.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════
# SECTION 3: ENCRYPTION
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>3. Arquitetura de Criptografia</b>', h1_style, 0),
    Paragraph(
        'A criptografia e o pilar tecnico mais fundamental da estrategia de seguranca do ZEHLA. Sem criptografia '
        'adequada, qualquer vulnerabilidade no perimeter de seguranca pode resultar na exposicao em texto claro de '
        'dados pessoais, mensagens comerciais e credenciais de acesso. A arquitetura de criptografia do ZEHLA e '
        'dividida em tres camadas complementares: criptografia em transito para proteger dados que se movem entre '
        'componentes do sistema, criptografia em repouso para proteger dados armazenados em banco de dados e '
        'filesystems, e criptografia em uso para proteger dados enquanto sao processados pela aplicacao.',
        body_style
    ),
    add_heading('<b>3.1 Criptografia em Transito (TLS 1.3)</b>', h2_style, 1),
    Paragraph(
        'Todas as comunicacoes entre componentes do ecossistema ZEHLA devem utilizar TLS 1.3 como protocolo '
        'minimo de criptografia. Isso inclui a comunicacao entre o frontend Next.js e a API backend, entre o '
        'backend e o PostgreSQL, entre o backend e o Redis, entre workers BullMQ e o broker Redis, e entre o '
        'backend e os servicos externos como API WhatsApp (Evolution API, Z-API) e servicos de e-mail. A '
        'configuracao do Nginx ou do load balancer deve desabilitar explicitamente TLS 1.0, TLS 1.1 e TLS 1.2, '
        'mantendo apenas TLS 1.3 com cipher suites modernos como TLS_AES_256_GCM_SHA384.',
        body_style
    ),
    Paragraph(
        'Para a conexao com o PostgreSQL, e necessario configurar o parametro sslmode=require no Prisma connection '
        'string e gerar certificados SSL autoassinados com validade de 1 ano para o cluster de banco de dados. '
        'A conexao Redis tambem deve utilizar TLS via stunnel ou Redislabs com suporte nativo a TLS. No nivel '
        'da aplicacao Next.js, todas as rotas API devem habilitar o header Strict-Transport-Security (HSTS) com '
        'valor max-age=31536000; includeSubDomains; preload, forcando o navegador a utilizar HTTPS exclusivamente.',
        body_style
    ),
    Paragraph(
        'Implementacao pratica no Prisma schema para PostgreSQL com SSL:',
        body_style
    ),
    Paragraph(
        'DATABASE_URL="postgresql://user:pass@host:5432/zehla?sslmode=require&sslrootcert=/etc/ssl/certs/pg-ca.pem"',
        code_style
    ),
    add_heading('<b>3.2 Criptografia em Repouso (AES-256-GCM)</b>', h2_style, 1),
    Paragraph(
        'Dados em repouso no PostgreSQL e no filesystem devem ser protegidos com criptografia AES-256-GCM. No '
        'banco de dados, campos sensíveis como numeros de telefone, enderecos de e-mail, conteudo de mensagens e '
        'tokens de sessao WhatsApp devem ser criptografados na camada da aplicacao antes da persistencia, utilizando '
        'uma estrategia de envelope encryption. Cada registro recebe uma chave de dados (DEK) unica gerada por '
        'AES-256-GCM, e a DEK e criptografada com uma chave mestra de criptografia (KEK) armazenada em um '
        'servico de gerenciamento de chaves (KMS).',
        body_style
    ),
    Paragraph(
        'A chave mestra (KEK) nunca deve ser armazenada no banco de dados ou no codigo-fonte. Ela deve residir '
        'exclusivamente em variaveis de ambiente protegidas ou em um servico de KMS como AWS KMS, HashiCorp Vault '
        'ou, para deployments on-premise, em um hardware security module (HSM) ou arquivo criptografado acessível '
        'somente pelo processo da aplicacao. O uso de envelope encryption garante que, mesmo que um atacante obtenha '
        'acesso ao banco de dados, ele nao consiga descriptografar os campos sensíveis sem acessar a KEK.',
        body_style
    ),
    Paragraph(
        'Para PostgreSQL, e recomendado adicionalmente habilitar o recurso pgcrypto e TDE (Transparent Data '
        'Encryption) no nivel do cluster. Para volumes de disco (em deployments VPS ou bare-metal), utilizar '
        'LUKS (Linux Unified Key Setup) para criptografia full-disk, garantindo que dados no disco nao sejam '
        'legíveis em caso de roubo fisico do hardware ou acesso nao autorizado ao storage.',
        body_style
    ),
])

encrypt_table = [
    [Paragraph('<b>Campo de Dado</b>', header_cell),
     Paragraph('<b>Algoritmo</b>', header_cell),
     Paragraph('<b>Chave</b>', header_cell),
     Paragraph('<b>Rotacao</b>', header_cell)],
    [Paragraph('Telefone do lead', body_cell),
     Paragraph('AES-256-GCM', body_cell_center),
     Paragraph('DEK por registro', body_cell_center),
     Paragraph('90 dias', body_cell_center)],
    [Paragraph('Conteudo mensagem', body_cell),
     Paragraph('AES-256-GCM', body_cell_center),
     Paragraph('DEK por mensagem', body_cell_center),
     Paragraph('90 dias', body_cell_center)],
    [Paragraph('Token sessao WhatsApp', body_cell),
     Paragraph('AES-256-GCM + HMAC', body_cell_center),
     Paragraph('KEK global', body_cell_center),
     Paragraph('30 dias', body_cell_center)],
    [Paragraph('API keys (Z-API)', body_cell),
     Paragraph('AES-256-GCM', body_cell_center),
     Paragraph('KEK global', body_cell_center),
     Paragraph('A cada rotacao de key', body_cell_center)],
    [Paragraph('Planilhas de leads', body_cell),
     Paragraph('AES-256-GCM (ficheiro)', body_cell_center),
     Paragraph('DEK por arquivo', body_cell_center),
     Paragraph('A cada upload', body_cell_center)],
]
cw3 = [CONTENT_W * 0.28, CONTENT_W * 0.26, CONTENT_W * 0.24, CONTENT_W * 0.22]
story.extend(make_table(encrypt_table, cw3, '<b>Tabela 3:</b> Matriz de criptografia por campo de dado'))

# ═══════════════════════════════════════════════════════
# SECTION 4: ACCESS CONTROL
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>4. Controle de Acesso e Autenticacao</b>', h1_style, 0),
    Paragraph(
        'O controle de acesso no ecossistema ZEHLA segue o principio do menor privilegio (PoLP) e o modelo RBAC '
        '(Role-Based Access Control). Cada usuario do sistema, seja administrador, operador de vendas, ou membro '
        'da equipe de suporte, possui um conjunto minimo de permissoes necessarias para executar suas funcoes. '
        'A implementacao desses controles deve ser realizada tanto na camada de API (middleware de autenticacao) '
        'quanto na camada de banco de dados (row-level security do PostgreSQL), garantindo defesa em profundidade.',
        body_style
    ),
    add_heading('<b>4.1 Autenticacao Multi-Fator (MFA)</b>', h2_style, 1),
    Paragraph(
        'Todos os acessos ao painel administrativo do ZEHLA devem obrigatoriamente utilizar autenticacao multi-fator. '
        'A arquitetura recomendada combina tres fatores: algo que voce sabe (senha com minimo de 12 caracteres, '
        'incluindo maiusculas, minusculas, numeros e simbolos especiais), algo que voce tem (TOTP via Google '
        'Authenticator ou Authy), e algo que voce e (opcional, para acoes criticas como exportacao de dados em massa '
        'ou alteracao de permissoes de usuarios). A implementacao deve utilizar a biblioteca otp do Node.js para '
        'geracao e validacao de codigos TOTP, com secrets armazenados no banco de dados criptografados via AES-256.',
        body_style
    ),
    Paragraph(
        'Sessoes de usuario devem ter tempo de expiracao curto: 15 minutos para o painel administrativo, 30 minutos '
        'para a API de operacoes, e 1 hora para dashboards de visualizacao. Cada sessao deve receber um refresh token '
        'com validade de 7 dias, armazenado como cookie HttpOnly, Secure e SameSite=Strict. O backend deve '
        'implementar validacao de device fingerprint, detectando logins simultaneos em dispositivos diferentes e '
        'forçando reautenticacao automaticamente quando uma anomalia e detectada. Tentativas falhas de login devem '
        'ser limitadas a 5 tentativas por IP por 15 minutos, com bloqueio progressivo: 5 falhas = 5 min bloqueio, '
        '10 falhas = 30 min bloqueio, 15 falhas = 24h bloqueio.',
        body_style
    ),
    add_heading('<b>4.2 Modelo RBAC: Papeis e Permissoes</b>', h2_style, 1),
    Paragraph(
        'O modelo de roles do ZEHLA define quatro papeis principais com permissoes granulares. O papel Admin possui '
        'acesso total ao sistema, incluindo gerenciamento de usuarios, configuracoes de seguranca e exportacao de '
        'dados. O papel Operator pode enviar mensagens, visualizar leads e acessar dashboards, mas nao pode alterar '
        'configuracoes do sistema. O papel Analyst possui acesso somente leitura a dashboards e relatorios, sem '
        'capacidade de modificar dados. Finalmente, o papel API_Service e utilizado por servicos automatizados e '
        'workers, com acesso limitado as APIs necessarias para a execucao de tarefas programadas.',
        body_style
    ),
])

rbac_table = [
    [Paragraph('<b>Permissao</b>', header_cell),
     Paragraph('<b>Admin</b>', header_cell),
     Paragraph('<b>Operator</b>', header_cell),
     Paragraph('<b>Analyst</b>', header_cell),
     Paragraph('<b>API Service</b>', header_cell)],
    [Paragraph('Visualizar leads', body_cell), Paragraph('SIM', body_cell_center), Paragraph('SIM', body_cell_center), Paragraph('SIM', body_cell_center), Paragraph('SIM', body_cell_center)],
    [Paragraph('Enviar mensagens', body_cell), Paragraph('SIM', body_cell_center), Paragraph('SIM', body_cell_center), Paragraph('NAO', body_cell_center), Paragraph('SIM', body_cell_center)],
    [Paragraph('Exportar dados', body_cell), Paragraph('SIM', body_cell_center), Paragraph('NAO', body_cell_center), Paragraph('SIM', body_cell_center), Paragraph('NAO', body_cell_center)],
    [Paragraph('Gerenciar usuarios', body_cell), Paragraph('SIM', body_cell_center), Paragraph('NAO', body_cell_center), Paragraph('NAO', body_cell_center), Paragraph('NAO', body_cell_center)],
    [Paragraph('Configurar seguranca', body_cell), Paragraph('SIM', body_cell_center), Paragraph('NAO', body_cell_center), Paragraph('NAO', body_cell_center), Paragraph('NAO', body_cell_center)],
    [Paragraph('Acessar logs auditoria', body_cell), Paragraph('SIM', body_cell_center), Paragraph('NAO', body_cell_center), Paragraph('SIM', body_cell_center), Paragraph('NAO', body_cell_center)],
    [Paragraph('Deletar leads', body_cell), Paragraph('SIM', body_cell_center), Paragraph('NAO', body_cell_center), Paragraph('NAO', body_cell_center), Paragraph('NAO', body_cell_center)],
    [Paragraph('Alterar scores', body_cell), Paragraph('SIM', body_cell_center), Paragraph('SIM', body_cell_center), Paragraph('NAO', body_cell_center), Paragraph('SIM', body_cell_center)],
]
cw4 = [CONTENT_W * 0.30, CONTENT_W * 0.17, CONTENT_W * 0.18, CONTENT_W * 0.17, CONTENT_W * 0.18]
story.extend(make_table(rbac_table, cw4, '<b>Tabela 4:</b> Matriz de permissoes RBAC do ecossistema ZEHLA'))

story.extend([
    add_heading('<b>4.3 Row-Level Security (RLS) no PostgreSQL</b>', h2_style, 1),
    Paragraph(
        'Alem do controle de acesso na aplicacao, o PostgreSQL deve implementar Row-Level Security para garantir '
        'que, mesmo que um atacante consiga acessar o banco de dados diretamente, ele so consiga visualizar os dados '
        'permitidos pelo seu papel. A configuracao do RLS no ZEHLA deve criar policies que filtrem leads por regiao '
        'do operador, mensagens por sessao WhatsApp autorizada, e eventos do pipeline por tenant. A habilitacao '
        'do RLS e feita com o comando ALTER TABLE ... ENABLE ROW LEVEL SECURITY, seguido pela criacao de policies '
        'especificas para cada tabela e papel.',
        body_style
    ),
    Paragraph(
        'Para a tabela de leads, a policy de RLS deve garantir que operadores so visualizem leads da sua regiao '
        'atribuida (definida por um campo region_id no schema), enquanto admins visualizam todos os leads. Para a '
        'tabela de mensagens, a policy deve restringir o acesso a mensagens associadas a sessoes WhatsApp ativas '
        'do usuario logado. Para a tabela de eventos do pipeline (implementada na Fase 4), a policy deve garantir '
        'que a API de webhook so consiga criar eventos (INSERT) mas nunca ler ou modificar eventos existentes.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════
# SECTION 5: WHATSAPP MESSAGE SECURITY
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>5. Seguranca de Mensagens WhatsApp</b>', h1_style, 0),
    Paragraph(
        'O envio de mensagens em massa via WhatsApp representa o vetor de risco mais complexo do ecossistema ZEHLA. '
        'As mensagens trafegam informacoes comerciais confidenciais (propostas, precos, condiçoes), dados pessoais '
        'dos leads (nomes, telefones, preferencias) e conteudo de marketing que, se exposto ou interceptado, pode '
        'comprometer toda a operacao comercial. Alem disso, o uso de APIs de terceiros (Evolution API, Z-API) '
        'introduz dependencias de seguranca que precisam ser gerenciadas com rigor.',
        body_style
    ),
    add_heading('<b>5.1 Securitizacao de Sessoes WhatsApp</b>', h2_style, 1),
    Paragraph(
        'As sessoes WhatsApp (tokens de autenticacao, cookies e dados de conexao) devem ser tratadas como credenciais '
        'de altissima sensibilidade, equivalentes a chaves privadas de criptografia. Cada sessao deve ser armazenada '
        'no Redis com criptografia AES-256-GCM e tempo de expiracao (TTL) de 24 horas, forcando a renovacao periodica. '
        'O storage de sessoes no Redis garante que, em caso de comprometimento do PostgreSQL, as sessoes WhatsApp '
        'continuem protegidas em um sistema de cache isolado com politicas de eviccao proprias.',
        body_style
    ),
    Paragraph(
        'A renovacao de sessoes deve ser automatizada via um worker BullMQ que verifica a validade de cada sessao a '
        'cada 6 horas e dispara o processo de reconexao antes da expiracao. O worker deve logar cada renovacao com '
        'timestamp, ID da sessao e status, permitindo auditoria completa do ciclo de vida das sessoes. Em caso de '
        'falha na renovacao, o sistema deve notificar o administrador via e-mail e Telegram, e interromper qualquer '
        'envio de mensagens pela sessao afetada ate que a conexao seja restabelecida.',
        body_style
    ),
    add_heading('<b>5.2 Criptografia de Conteudo de Mensagens</b>', h2_style, 1),
    Paragraph(
        'O conteudo das mensagens enviadas e recebidas via WhatsApp deve ser criptografado antes da persistencia no '
        'banco de dados. Isso inclui tanto o texto da mensagem quanto os metadados (timestamp, status de entrega, '
        'ID da mensagem no WhatsApp). A criptografia deve ser aplicada na camada de servico do backend, antes de '
        'chamar o Prisma para persistir os dados. O campo de conteudo criptografado no banco de dados deve ser '
        'armazenado como texto base64, contendo o IV (Initialization Vector) concatenado ao ciphertext.',
        body_style
    ),
    Paragraph(
        'A implementacao pratica utiliza o modulo nativo crypto do Node.js com o algoritmo aes-256-gcm. Cada '
        'mensagem recebe um IV aleatorio de 12 bytes gerado por crypto.randomBytes(), e o resultado da criptografia '
        'inclui o authentication tag de 16 bytes que garante a integridade do ciphertext. A chave de criptografia '
        'das mensagens (MEK - Message Encryption Key) e derivada da KEK mestra via HKDF (HMAC-based Key Derivation '
        'Function), garantindo que a comprometicao de uma chave de mensagem nao comprometa as demais.',
        body_style
    ),
    Paragraph(
        'Implementacao de referência para criptografia de mensagens no backend:',
        body_style
    ),
    Paragraph(
        'import crypto from "crypto";<br/>'
        'const ALGO = "aes-256-gcm";<br/>'
        'const IV_LEN = 12; const TAG_LEN = 16;<br/>'
        'function encryptMessage(plaintext: string, key: Buffer) {<br/>'
        '&nbsp;&nbsp;const iv = crypto.randomBytes(IV_LEN);<br/>'
        '&nbsp;&nbsp;const cipher = crypto.createCipheriv(ALGO, key, iv);<br/>'
        '&nbsp;&nbsp;let enc = cipher.update(plaintext, "utf8", "base64");<br/>'
        '&nbsp;&nbsp;enc += cipher.final("base64");<br/>'
        '&nbsp;&nbsp;const tag = cipher.getAuthTag();<br/>'
        '&nbsp;&nbsp;return iv.toString("base64") + ":" + tag.toString("base64") + ":" + enc;<br/>'
        '}',
        code_style
    ),
    add_heading('<b>5.3 Gestao de Tokens e Credenciais de API</b>', h2_style, 1),
    Paragraph(
        'As credenciais de API utilizadas para conectar o ZEHLA aos servicos de WhatsApp (Evolution API, Z-API, '
        'Baileys) devem ser gerenciadas com o mesmo nivel de seguranca que chaves de producao. Os tokens devem ser '
        'armazenados em variaveis de ambiente criptografadas via Docker Secrets ou AWS Secrets Manager, nunca '
        'hardcoded no codigo-fonte ou em arquivos de configuracao committados no repositorio Git. Cada instancia '
        'da API deve receber um token dedicado, permitindo revogacao individual sem afetar outras conexoes.',
        body_style
    ),
    Paragraph(
        'A rotacao de tokens deve ocorrer a cada 90 dias, com notificacao automatica 7 dias antes da expiracao. '
        'O processo de rotacao deve ser automatizado: o sistema gera um novo token, testa a conexao, substitui '
        'o token antigo e invalida o anterior, tudo sem interrupcao do servico. Logs de rotacao de tokens devem '
        'ser armazenados com nivel de sensibilidade CRITICO e retidos por 24 meses. Qualquer tentativa de uso '
        'de token expirado deve ser logada como evento de seguranca e disparar um alerta imediato ao administrador.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════
# SECTION 6: LEAD DATA PROTECTION
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>6. Protecao de Dados de Leads e Planilhas</b>', h1_style, 0),
    Paragraph(
        'A base de leads do ZEHLA, composta por mais de 10.000 contatos de pousadas captados de fontes publicas, '
        'representa o ativo de dados mais valioso e mais exposto do ecossistema. A protecao desses dados requer '
        'controles em multiplas camadas, desde a ingestao inicial ate a eliminacao segura apos o periodo de retencao. '
        'Planilhas de leads (CSV, XLSX) exportadas do sistema devem ser tratadas como documentos confidenciais com '
        'rastreamento de acesso e marca d\'agua digital para identificar vazamentos.',
        body_style
    ),
    add_heading('<b>6.1 Seguranca na Ingestao de Dados</b>', h2_style, 1),
    Paragraph(
        'O processo de ingestao de leads no ZEHLA passa por tres etapas de validacao e sanitizacao. A primeira '
        'etapa e a validacao de schema, que verifica se cada campo do lead corresponde ao formato esperado '
        '(telefone com regex E.164, e-mail com validacao RFC 5322, coordenadas geograficas com bounding box '
        'do Brasil). A segunda etapa e a sanitizacao de dados, que remove caracteres maliciosos, normaliza '
        'formatacoes (remocao de mascaras de telefone, normalizacao de UF para sigla padrao) e aplica hashing '
        'para deduplicacao baseada em fingerprint do lead.',
        body_style
    ),
    Paragraph(
        'A terceira etapa e a classificacao de sensibilidade, que atribui automaticamente um nivel de risco a cada '
        'lead baseado nos campos preenchidos. Leads com telefone, e-mail e endereco completo recebem classificacao '
        'ALTA e tem seus campos sensíveis criptografados imediatamente. Leads com apenas nome e telefone recebem '
        'classificacao MEDIA e tem apenas o telefone criptografado. Essa classificacao triagem de risco automatizada '
        'garante que recursos de criptografia sejam aplicados onde sao mais necessarios, otimizando performance '
        'do sistema sem comprometer seguranca.',
        body_style
    ),
    add_heading('<b>6.2 Protecao de Planilhas Exportadas</b>', h2_style, 1),
    Paragraph(
        'Quando leads sao exportados do sistema para planilhas (CSV, XLSX), medidas adicionais de seguranca devem '
        'ser aplicadas. Cada arquivo exportado deve receber uma marca d\'agua digital invisível contendo o ID do '
        'usuario que fez a exportacao, timestamp da operacao e um hash unico do arquivo. Em caso de vazamento, '
        'essa marca d\'agua permite rastrear a origem do leak. A implementacao da marca d\'agua pode ser feita '
        'via metadados do arquivo XLSX (propriedades personalizadas no OpenXML) ou via steganografia em CSV '
        '(insercao de caracteres invisíveis em campos especificos).',
        body_style
    ),
    Paragraph(
        'Exportacoes em massa (mais de 1.000 leads) devem requerer aprovacao de um Admin e ser registradas no log '
        'de auditoria com nivel de detalhamento completo: usuario, IP, horario, filtros aplicados, numero de '
        'registros, e hash do arquivo gerado. Os arquivos exportados devem ter validade de acesso limitada: '
        'links de download devem expirar em 24 horas e os arquivos no servidor devem ser deletados automaticamente '
        'apos 48 horas. Para planilhas XLSX, e recomendavel aplicar protecao de senha no nivel do arquivo utilizando '
        'a biblioteca exceljs com criptografia AES-128.',
        body_style
    ),
    add_heading('<b>6.3 Anonimizacao e Eliminacao de Dados</b>', h2_style, 1),
    Paragraph(
        'A LGPD exige que dados pessoais sejam eliminados quando nao houver mais finalidade para seu tratamento. '
        'O ZEHLA implementa um sistema de anonimizacao em tres niveis. O nivel 1 (pseudonimizacao) substitui '
        'identificadores diretos por tokens reversíveis, permitindo reidentificacao apenas por administradores com '
        'autorizacao especial. O nivel 2 (anonimizacao irreversível) aplica tecnicas de k-anonimidade e l-diversidade '
        'para garantir que leads anonimizados nao possam ser reidentificados por inferencia. O nivel 3 (eliminacao '
        'segura) aplica sobreescrita criptografica multipla antes da delecao definitiva, garantindo recuperacao '
        'impossível mesmo com forensic tools.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════
# SECTION 7: AUDIT LOGGING
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>7. Logging de Auditoria e Monitoramento</b>', h1_style, 0),
    Paragraph(
        'O logging de auditoria e o mecanismo que permite rastrear todas as acoes realizadas no ecossistema ZEHLA, '
        'identificar violacoes de seguranca, e comprovar conformidade com a LGPD em caso de auditoria pela ANPD. '
        'O sistema de logging deve seguir o principio da imutabilidade: uma vez que um log e registrado, ele nao '
        'pode ser alterado ou deletado por nenhum usuario, incluindo administradores. A imutabilidade dos logs '
        'e garantida pela utilizacao de uma tabela PostgreSQL com permissao somente de INSERT, sem UPDATE ou DELETE.',
        body_style
    ),
    add_heading('<b>7.1 Eventos de Auditoria Obrigatorios</b>', h2_style, 1),
    Paragraph(
        'Todos os eventos de seguranca do ZEHLA devem ser classificados em quatro niveis de criticidade: INFO '
        '(acoes operacionais normais), WARN (acoes suspeitas que nao configuram violacao), ALERT (eventos que '
        'indicam tentativa de violacao), e CRITICAL (violacao confirmada com impacto em dados). Cada evento de '
        'auditoria deve conter obrigatoriamente: timestamp em UTC com precisao de milissegundos, ID do usuario '
        'que executou a acao, IP de origem, user-agent, recurso acessado, acao realizada (CRUD), resultado '
        '(sucesso/falha), e dados adicionais contextuais em formato JSON.',
        body_style
    ),
])

audit_table = [
    [Paragraph('<b>Evento</b>', header_cell),
     Paragraph('<b>Nivel</b>', header_cell),
     Paragraph('<b>Retencao</b>', header_cell),
     Paragraph('<b>Alerta</b>', header_cell)],
    [Paragraph('Login bem-sucedido', body_cell), Paragraph('INFO', body_cell_center), Paragraph('90 dias', body_cell_center), Paragraph('NAO', body_cell_center)],
    [Paragraph('Login falhado (5+ tentativas)', body_cell), Paragraph('ALERT', body_cell_center), Paragraph('24 meses', body_cell_center), Paragraph('SIM', body_cell_center)],
    [Paragraph('Exportacao de leads em massa', body_cell), Paragraph('WARN', body_cell_center), Paragraph('24 meses', body_cell_center), Paragraph('SIM', body_cell_center)],
    [Paragraph('Alteracao de permissoes de usuario', body_cell), Paragraph('ALERT', body_cell_center), Paragraph('24 meses', body_cell_center), Paragraph('SIM', body_cell_center)],
    [Paragraph('Envio de mensagem WhatsApp', body_cell), Paragraph('INFO', body_cell_center), Paragraph('90 dias', body_cell_center), Paragraph('NAO', body_cell_center)],
    [Paragraph('Acesso a dados criptografados', body_cell), Paragraph('WARN', body_cell_center), Paragraph('12 meses', body_cell_center), Paragraph('SIM', body_cell_center)],
    [Paragraph('Rotacao de chave de criptografia', body_cell), Paragraph('ALERT', body_cell_center), Paragraph('24 meses', body_cell_center), Paragraph('SIM', body_cell_center)],
    [Paragraph('Tentativa de SQL injection', body_cell), Paragraph('CRITICAL', body_cell_center), Paragraph('Indefinida', body_cell_center), Paragraph('SIM', body_cell_center)],
    [Paragraph('Acesso nao autorizado a API', body_cell), Paragraph('CRITICAL', body_cell_center), Paragraph('Indefinida', body_cell_center), Paragraph('SIM', body_cell_center)],
    [Paragraph('Exclusao de lead (LGPD)', body_cell), Paragraph('ALERT', body_cell_center), Paragraph('Indefinida', body_cell_center), Paragraph('SIM', body_cell_center)],
]
cw5 = [CONTENT_W * 0.38, CONTENT_W * 0.14, CONTENT_W * 0.18, CONTENT_W * 0.12]
story.extend(make_table(audit_table, cw5, '<b>Tabela 5:</b> Eventos de auditoria obrigatórios com niveis de criticidade'))

story.extend([
    add_heading('<b>7.2 Arquitetura do Sistema de Logs</b>', h2_style, 1),
    Paragraph(
        'O sistema de logging do ZEHLA utiliza uma arquitetura de tres camadas. A primeira camada e o Application '
        'Logger, implementado via Winston ou Pino no backend Next.js, que captura todos os eventos da aplicacao '
        'com formatacao estruturada em JSON. A segunda camada e o Audit Database, uma tabela PostgreSQL dedicada '
        '(audit_logs) com particionamento mensal por data e indexacao por user_id, resource e severity. A terceira '
        'camada e o SIEM (Security Information and Event Management), opcional para deployments de producao, que '
        'agrega logs de todas as camadas (aplicacao, banco, Nginx, Redis) em um unico painel de analise.',
        body_style
    ),
    Paragraph(
        'Para alertas em tempo real, o ZEHLA deve implementar um sistema de notificacao baseado no pipeline de eventos '
        'ja existente (Fase 4 Brain Sync). Eventos de nivel ALERT e CRITICAL disparam acoes automaticas: ALERT gera '
        'notificacao via e-mail para o administrador e registro no dashboard de seguranca; CRITICAL gera notificacao '
        'via Telegram, e-mail e interrompe a operacao afetada ate revisao manual. A integracao com o pipeline de '
        'eventos ja implementado permite reaproveitar toda a infraestrutura de scoring, classificacao e acao automatica '
        'do ZEHLA Brain para eventos de seguranca.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════
# SECTION 8: BACKUP & RECOVERY
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>8. Backup e Recuperacao de Desastres</b>', h1_style, 0),
    Paragraph(
        'O plano de backup e recuperacao de desastres do ZEHLA e projetado para garantir a continuidade do negocio '
        'em caso de falhas de hardware, ataques de ransomware, erros humanos ou desastres naturais. A estrategia '
        'segue a regra 3-2-1: tres copias dos dados, em dois tipos de midia diferentes, com uma copia offsite. '
        'O objetivo de recuperacao (RPO - Recovery Point Objective) e de no maximo 1 hora para dados criticos '
        '(leads, mensagens) e 24 horas para dados de analytics. O objetivo de tempo de recuperacao (RTO - Recovery '
        'Time Objective) e de no maximo 4 horas para restauracao completa do sistema.',
        body_style
    ),
    add_heading('<b>8.1 Estrategia de Backup PostgreSQL</b>', h2_style, 1),
    Paragraph(
        'O PostgreSQL utiliza uma estrategia de backup combinando full dumps semanais com WAL (Write-Ahead Log) '
        'archiving continuo. O full dump e executado toda noite as 02:00 UTC via pg_dump com formato custom e '
        'compressao lz4, armazenando o resultado em um bucket S3 com versionamento habilitado e criptografia '
        'AES-256 server-side. Os arquivos de WAL sao arquivados continuamente a cada 5 minutos para o mesmo bucket '
        'S3, permitindo restauracao point-in-time com granularidade de 5 minutos. O backup da chave de criptografia '
        '(KEK) e armazenado separadamente em um cofre fisico ou em um servico KMS diferente do S3.',
        body_style
    ),
    Paragraph(
        'A verificacao de integridade dos backups e realizada automaticamente a cada 24 horas via pg_verifybackup, '
        'que valida que o arquivo de backup pode ser restaurado com sucesso. Alem disso, um teste de restauracao '
        'completo e executado mensalmente em um ambiente de staging isolado, simulando um cenario de recuperacao '
        'de desastre real. Os resultados de cada verificacao e teste sao registrados no log de auditoria com '
        'detalhes como tamanho do backup, tempo de verificacao, status e eventuais erros encontrados.',
        body_style
    ),
    add_heading('<b>8.2 Backup de Sessoes e Dados em Redis</b>', h2_style, 1),
    Paragraph(
        'O Redis, utilizado para cache de sessoes WhatsApp e filas BullMQ, implementa persistencia combinada '
        'RDB + AOF. O RDB (snapshot) e gerado a cada 15 minutos para um arquivo local, e o AOF (append-only file) '
        'registra cada operacao de escrita em tempo real. Esses arquivos sao copiados para o bucket S3 a cada hora. '
        'Em caso de falha do Redis, a recuperacao prioritaria restaura o AOF mais recente, seguido do RDB como fallback. '
        'Sessoes WhatsApp perdidas sao recriadas automaticamente pelo worker de renovacao de sessoes.',
        body_style
    ),
])

backup_table = [
    [Paragraph('<b>Componente</b>', header_cell),
     Paragraph('<b>Frequencia</b>', header_cell),
     Paragraph('<b>Destino</b>', header_cell),
     Paragraph('<b>RPO</b>', header_cell),
     Paragraph('<b>Retencao</b>', header_cell)],
    [Paragraph('PostgreSQL Full', body_cell), Paragraph('Diario (02:00 UTC)', body_cell), Paragraph('S3 + local', body_cell), Paragraph('24h', body_cell_center), Paragraph('30 dias', body_cell_center)],
    [Paragraph('PostgreSQL WAL', body_cell), Paragraph('Continuo (5 min)', body_cell), Paragraph('S3', body_cell), Paragraph('5 min', body_cell_center), Paragraph('7 dias', body_cell_center)],
    [Paragraph('Redis RDB', body_cell), Paragraph('A cada 15 min', body_cell), Paragraph('S3', body_cell), Paragraph('15 min', body_cell_center), Paragraph('3 dias', body_cell_center)],
    [Paragraph('Redis AOF', body_cell), Paragraph('Continuo', body_cell), Paragraph('S3 (horario)', body_cell), Paragraph('1h', body_cell_center), Paragraph('3 dias', body_cell_center)],
    [Paragraph('Chaves de Criptografia', body_cell), Paragraph('A cada rotacao', body_cell), Paragraph('KMS / cofre', body_cell), Paragraph('0 (simultaneo)', body_cell_center), Paragraph('Indefinida', body_cell_center)],
    [Paragraph('Logs de Auditoria', body_cell), Paragraph('Continuo', body_cell), Paragraph('PostgreSQL + S3', body_cell), Paragraph('0 (real-time)', body_cell_center), Paragraph('24 meses', body_cell_center)],
]
cw6 = [CONTENT_W * 0.20, CONTENT_W * 0.22, CONTENT_W * 0.20, CONTENT_W * 0.16, CONTENT_W * 0.22]
story.extend(make_table(backup_table, cw6, '<b>Tabela 6:</b> Estrategia de backup por componente do ecossistema'))

# ═══════════════════════════════════════════════════════
# SECTION 9: INCIDENT RESPONSE
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>9. Plano de Resposta a Incidentes de Seguranca</b>', h1_style, 0),
    Paragraph(
        'O plano de resposta a incidentes define procedimentos claros para identificar, conter, erradicar e '
        'recuperar-se de violacoes de seguranca no ecossistema ZEHLA. Este plano e fundamental para cumprir o '
        'Art. 48 da LGPD, que exige que a Autoridade Nacional de Protecao de Dados (ANPD) seja notificada em ate '
        '72 horas apos a percepcao de um incidente de seguranca que possa acarretar risco ou dano relevante aos '
        'titulares de dados. A comunicacao aos titulares afetados tambem e obrigatoria quando o incidente puder '
        'resultar em risco significativo para seus direitos e liberdades.',
        body_style
    ),
    add_heading('<b>9.1 Classificacao de Incidentes</b>', h2_style, 1),
    Paragraph(
        'Os incidentes de seguranca do ZEHLA sao classificados em quatro niveis de severidade, cada um com '
        'procedimentos de resposta especificos e prazos de notificacao definidos. O nivel P1 (Critico) inclui '
        'exposicao de dados pessoais em massa, comprometimento da chave mestra de criptografia, ransomware no '
        'servidor de producao, ou acesso nao autorizado ao banco de dados. Incidentes P1 requerem resposta '
        'imediata (15 minutos), notificacao a ANPD em 72 horas e comunicacao aos titulares afetados em 72 horas.',
        body_style
    ),
    Paragraph(
        'O nivel P2 (Alto) abrange acessos nao autorizados a contas de usuario, exfiltracao parcial de dados, '
        'ou comprometimento de sessoes WhatsApp. Incidentes P2 requerem resposta em 1 hora, avaliacao de risco '
        'para determinacao de notificacao a ANPD, e comunicacao interna imediata. O nivel P3 (Medio) inclui '
        'tentativas de ataque bloqueadas com sucesso, vulnerabilidades descobertas mas nao exploradas, e '
        'configuracoes incorretas de seguranca. O nivel P4 (Baixo) cobre eventos de seguranca informativos que '
        'nao representam risco imediato, como scans de porta bloqueados ou logins falhados com pocos tentativas.',
        body_style
    ),
])

incident_table = [
    [Paragraph('<b>Nivel</b>', header_cell),
     Paragraph('<b>Exemplos</b>', header_cell),
     Paragraph('<b>Tempo de Resposta</b>', header_cell),
     Paragraph('<b>Notificacao ANPD</b>', header_cell),
     Paragraph('<b>Comunicacao Titulares</b>', header_cell)],
    [Paragraph('P1 - Critico', body_cell),
     Paragraph('Exposicao de dados em massa, ransomware, comprometimento KEK', body_cell),
     Paragraph('15 minutos', body_cell_center),
     Paragraph('72 horas', body_cell_center),
     Paragraph('72 horas', body_cell_center)],
    [Paragraph('P2 - Alto', body_cell),
     Paragraph('Acesso nao autorizado a conta, exfiltracao parcial', body_cell),
     Paragraph('1 hora', body_cell_center),
     Paragraph('Apos avaliacao', body_cell_center),
     Paragraph('Se risco significativo', body_cell_center)],
    [Paragraph('P3 - Medio', body_cell),
     Paragraph('Tentativas bloqueadas, vulnerabilidades nao exploradas', body_cell),
     Paragraph('4 horas', body_cell_center),
     Paragraph('Registro interno', body_cell_center),
     Paragraph('NAO', body_cell_center)],
    [Paragraph('P4 - Baixo', body_cell),
     Paragraph('Scans bloqueados, logins falhados isolados', body_cell),
     Paragraph('24 horas', body_cell_center),
     Paragraph('NAO', body_cell_center),
     Paragraph('NAO', body_cell_center)],
]
cw7 = [CONTENT_W * 0.12, CONTENT_W * 0.30, CONTENT_W * 0.16, CONTENT_W * 0.20, CONTENT_W * 0.22]
story.extend(make_table(incident_table, cw7, '<b>Tabela 7:</b> Classificacao de incidentes e procedimentos de notificacao'))

story.extend([
    add_heading('<b>9.2 Fluxo de Resposta a Incidentes</b>', h2_style, 1),
    Paragraph(
        'O fluxo de resposta a incidentes segue a metodologia NIST (National Institute of Standards and Technology) '
        'adaptada ao contexto do ecossistema ZEHLA. A fase de Preparacao inclui a manutencao da lista de contatos '
        'de emergencia (equipe de seguranca, juridico, comunicacao, ANPD), a realizacao de simulados trimestrais '
        'de resposta a incidentes, e a atualizacao periodica do plano. A fase de Deteccao e Analise utiliza o sistema '
        'de logging de auditoria e alertas em tempo real para identificar anomalias, com analise de causa raiz para '
        'determinar o escopo e impacto do incidente.',
        body_style
    ),
    Paragraph(
        'A fase de Contencao isola imediatamente os sistemas afetados: revogacao de sessoes WhatsApp comprometidas, '
        'bloqueio de contas de usuario suspeitas, e isolamento de servidores infectados. A fase de Erradicacao '
        'remove a causa raiz do incidente, aplicando patches, revogando credenciais comprometidas e corrigindo '
        'vulnerabilidades. A fase de Recuperacao restaura os sistemas a operacao normal utilizando os backups '
        'validados, com monitoramento intensivo nos 7 dias seguintes. A fase de Pos-incidente gera um relatorio '
        'detalhado com lições aprendidas e acoes corretivas, atualizando o plano de seguranca conforme necessario.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════
# SECTION 10: INFRASTRUCTURE SECURITY
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>10. Seguranca de Infraestrutura</b>', h1_style, 0),
    Paragraph(
        'A seguranca da infraestrutura fisica e de rede do ZEHLA constitui a primeira linha de defesa contra ataques '
        'externos. Mesmo que todos os controles de aplicacao e dados estejam implementados corretamente, uma '
        'configuracao incorreta no servidor, no firewall ou no DNS pode abrir vetores de ataque que contornam '
        'todas as camadas de seguranca superiores. A arquitetura de infraestrutura do ZEHLA deve seguir o modelo '
        'de defesa em profundidade, com multiplas barreiras de seguranca em cada camada.',
        body_style
    ),
    add_heading('<b>10.1 Hardening de Servidor</b>', h2_style, 1),
    Paragraph(
        'O servidor de producao do ZEHLA deve seguir um checklist de hardening que inclui: desabilitar portas e '
        'servicos desnecessarios (somente SSH na porta 2222, HTTP/HTTPS na 80/443), configurar fail2ban para '
        'bloqueio automatico de IPs com tentativas de brute force, desabilitar login root via SSH e utilizar '
        'autenticacao por chave SSH exclusivamente (senha desabilitada), configurar UFW (Uncomplicated Firewall) '
        'com regras default DROP para INPUT e FORWARD, e permitir apenas tráfego nas portas necessarias.',
        body_style
    ),
    Paragraph(
        'Alem disso, o sistema operacional deve receber atualizacoes de seguranca automaticas via unattended-upgrades '
        '(configurado para security-only), com reboot automatico programado caso necessario. Os processos da aplicacao '
        'devem rodar sob usuarios dedicados com privilegios minimos (nunca como root), e o Docker deve ser configurado '
        'com security-opt=no-new-privileges:true e read-only filesystem para os containers que nao precisam de escrita. '
        'O acesso SSH ao servidor deve ser restrito a IPs whitelistados e autenticacao por chave publica com passphrase.',
        body_style
    ),
    add_heading('<b>10.2 Protecao contra Ataques Comuns</b>', h2_style, 1),
    Paragraph(
        'O ZEHLA deve implementar protecoes especificas contra os vetores de ataque mais comuns em aplicacoes web. '
        'Para protecao contra SQL Injection, todas as queries ao banco de dados devem utilizar Prisma Client com '
        'parameterized queries (nunca template strings com concatenacao de inputs). Para protecao contra XSS (Cross-Site '
        'Scripting), o Next.js deve utilizar o componente next/head com Content-Security-Policy header restritivo, '
        'e todos os inputs de usuario devem ser sanitizados com DOMPurify antes da renderizacao. Para protecao contra '
        'CSRF (Cross-Site Request Forgery), todas as rotas de API que modificam estado devem validar o token CSRF '
        'gerado pelo Next.js middleware.',
        body_style
    ),
    Paragraph(
        'Para protecao contra Rate Limiting, o Nginx (ou o middleware do Next.js) deve limitar requisicoes a '
        '100 req/min por IP para rotas de API e 10 req/min para rotas de autenticacao. Para protecao contra '
        'brute force em logins, a politica de bloqueio progressivo descrita na secao de autenticacao deve ser '
        'implementada. Headers de seguranca obrigatorios devem incluir X-Frame-Options: DENY, X-Content-Type-Options: '
        'nosniff, Referrer-Policy: strict-origin-when-cross-origin, e Permissions-Policy para restringir acesso '
        'a APIs do navegador como camera, microfone e geolocation.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════
# SECTION 11: INTEGRATION WITH ZEHLA BRAIN
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>11. Integracao com o Pipeline ZEHLA Brain (Fase 4)</b>', h1_style, 0),
    Paragraph(
        'A arquitetura de seguranca nao opera de forma isolada: ela se integra profundamente com o pipeline de '
        'eventos implementado na Fase 4 do ZEHLA Brain. O sistema de eventos (Capture, Validate, Enrich, Classify, '
        'Act) que ja rasteia interacoes de leads e calcula scores deve ser estendido para capturar e classificar '
        'eventos de seguranca, criando uma visao unificada de todas as atividades do ecossistema.',
        body_style
    ),
    add_heading('<b>11.1 Tipos de Evento de Seguranca no Pipeline</b>', h2_style, 1),
    Paragraph(
        'O sistema de tipos de evento existente no ZEHLA Brain (types.ts) deve ser estendido com tres novas categorias '
        'dedicadas a seguranca: SECURITY_AUTH para eventos de autenticacao (login, logout, falha de MFA), '
        'SECURITY_DATA para eventos de protecao de dados (exportacao, criptografia, rotacao de chaves), e '
        'SECURITY_INFRA para eventos de infraestrutura (firewall, patch, backup). Cada tipo de evento de seguranca '
        'possui seu proprio impacto no score de risco do sistema, permitindo que o ZEHLA Brain detecte padroes '
        'anomalos de atividade e dispare alertas automaticos.',
        body_style
    ),
    Paragraph(
        'A integracao pratica e feita extendendo o enum EventType em types.ts com os novos tipos de seguranca, '
        'atualizando o validator para aceitar payloads de evento de seguranca, e adicionando regras no scoring.ts '
        'para calcular um "Security Score" que reflete o nivel de risco atual do sistema. Quando o Security Score '
        'ultrapassa um limiar critico (definido por variavel de ambiente), o pipeline de acoes dispara automaticamente '
        'o lockdown parcial do sistema: sessoes WhatsApp sao pausadas, exports sao bloqueados, e o administrador '
        'recebe notificacao imediata via todos os canais configurados.',
        body_style
    ),
    add_heading('<b>11.2 Dashboard de Seguranca Unificado</b>', h2_style, 1),
    Paragraph(
        'O dashboard de eventos existente em /events deve ser estendido com um widget de seguranca que exibe '
        'em tempo real o Security Score do sistema, a lista de alertas ativos, o mapa de calor de tentativas de '
        'accesso suspeitas por regiao geografica (reaproveitando o componente LeafletMap ja implementado no LIS), '
        'e o historico de incidentes com sua resolucao. Este dashboard unificado permite ao operador visualizar '
        'tanto a saude comercial do funil de vendas quanto a saude de seguranca do sistema em uma unica interface, '
        'sem necessidade de alternar entre ferramentas.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════
# SECTION 12: IMPLEMENTATION ROADMAP
# ═══════════════════════════════════════════════════════
story.extend([
    CondPageBreak(A4[1] * 0.15),
    add_heading('<b>12. Roadmap de Implementacao por Prioridade</b>', h1_style, 0),
    Paragraph(
        'A implementacao da arquitetura de seguranca deve seguir uma abordagem incremental, priorizando os controles '
        'que mitigam os maiores riscos primeiro. O roadmap a seguir define quatro fases de implementacao, cada uma com '
        'entregáveis concretos e metricas de verificacao. A priorizacao foi baseada na analise de risco das superficies '
        'de ataque do ecossistema ZEHLA, considerando a probabilidade e o impacto de cada ameaca identificada.',
        body_style
    ),
])

roadmap_table = [
    [Paragraph('<b>Fase</b>', header_cell),
     Paragraph('<b>Prazo</b>', header_cell),
     Paragraph('<b>Entregáveis</b>', header_cell),
     Paragraph('<b>Prioridade</b>', header_cell)],
    [Paragraph('Fase 1: Fundamentos', body_cell),
     Paragraph('Semanas 1-2', body_cell_center),
     Paragraph('TLS 1.3 em todas as conexoes, MFA para admin, env vars para segredos, headers de seguranca, rate limiting', body_cell),
     Paragraph('CRITICA', body_cell_center)],
    [Paragraph('Fase 2: Criptografia', body_cell),
     Paragraph('Semanas 3-4', body_cell_center),
     Paragraph('Envelope encryption para campos sensiveis, criptografia de mensagens, KEK em KMS, rotacao automatica', body_cell),
     Paragraph('ALTA', body_cell_center)],
    [Paragraph('Fase 3: Auditoria', body_cell),
     Paragraph('Semanas 5-6', body_cell_center),
     Paragraph('Tabela audit_logs imutavel, eventos de seguranca no pipeline Brain, alertas em tempo real, dashboard de seguranca', body_cell),
     Paragraph('ALTA', body_cell_center)],
    [Paragraph('Fase 4: LGPD', body_cell),
     Paragraph('Semanas 7-8', body_cell_center),
     Paragraph('ROPA, RIPD, politica de retencao, endpoints de direitos do titular, opt-out automatico, anonimizacao', body_cell),
     Paragraph('ALTA', body_cell_center)],
    [Paragraph('Fase 5: Infraestrutura', body_cell),
     Paragraph('Semanas 9-10', body_cell_center),
     Paragraph('Hardening de servidor, fail2ban, UFW, backup automatizado com verificacao, plano de resposta a incidentes', body_cell),
     Paragraph('MEDIA', body_cell_center)],
    [Paragraph('Fase 6: Avancado', body_cell),
     Paragraph('Semanas 11-12', body_cell_center),
     Paragraph('RLS no PostgreSQL, marca d\'agua em exports, SIEM integracao, simulados trimestrais, HSM para KEK', body_cell),
     Paragraph('MEDIA', body_cell_center)],
]
cw8 = [CONTENT_W * 0.16, CONTENT_W * 0.14, CONTENT_W * 0.54, CONTENT_W * 0.16]
story.extend(make_table(roadmap_table, cw8, '<b>Tabela 8:</b> Roadmap de implementacao da arquitetura de seguranca'))

story.extend([
    add_heading('<b>12.1 Metricas de Verificacao e KPIs de Seguranca</b>', h2_style, 1),
    Paragraph(
        'Cada fase de implementacao deve ser validada por metricas claras que demonstrem a eficacia dos controles '
        'implementados. Para a Fase 1 (Fundamentos), as metricas incluem: 100% das conexoes utilizam TLS 1.3 '
        '(verificavel via SSL Labs scan), 100% dos logins admin utilizam MFA (verificavel via log de auditoria), '
        'e zero credenciais hardcoded no repositorio Git (verificavel via git-secrets ou truffleHog). Para a '
        'Fase 2 (Criptografia), as metricas incluem: 100% dos campos sensíveis criptografados no banco de dados '
        '(verificavel via query de rotina), rotacao de chaves executada com sucesso nos prazos definidos, e '
        'tempo de criptografia/descriptografia inferior a 5ms por operacao (performance).',
        body_style
    ),
    Paragraph(
        'Para as fases subsequentes, as metricas evoluem para cobrir cobertura de logs de auditoria (100% dos '
        'eventos obrigatorios registrados), tempo de deteccao de incidentes (MTTD inferior a 15 minutos para '
        'eventos CRITICAL), tempo de resposta a incidentes (MTTR inferior a 4 horas para P1), e conformidade '
        'LGPD (documentos de governanca completos e atualizados). Essas metricas devem ser monitoradas em um '
        'dashboard de seguranca dedicado e revisadas mensalmente pela equipe com reuniao de retrospectiva de '
        'seguranca.',
        body_style
    ),
])

# ═══════════════════════════════════════════════════════
# BUILD PDF
# ═══════════════════════════════════════════════════════
print("Building body PDF...")
doc.multiBuild(story)
print(f"Body PDF created: {BODY_PATH}")
