#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DESIGN.md - Web Scraping Skill
Design Document completo para raspagem end-to-end de qualquer site.
"""

import os, sys, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, CondPageBreak, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━ FONTS ━━
pdfmetrics.registerFont(TTFont('TNR', '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'))
pdfmetrics.registerFont(TTFont('TNRB', '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Cal', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('CalB', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Dej', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('TNR', normal='TNR', bold='TNRB')
registerFontFamily('Cal', normal='Cal', bold='CalB')
registerFontFamily('Dej', normal='Dej', bold='Dej')

# ━━ PALETTE ━━
PAGE_BG      = colors.HexColor('#f2f2f0')
CARD_BG      = colors.HexColor('#e8e6e2')
TABLE_STRIPE = colors.HexColor('#f3f3f2')
HEADER_FILL  = colors.HexColor('#686047')
BORDER       = colors.HexColor('#d4cfc2')
ICON         = colors.HexColor('#86774b')
ACCENT       = colors.HexColor('#2b94b7')
ACCENT_2     = colors.HexColor('#36cb36')
TEXT_PRIMARY = colors.HexColor('#1d1c1a')
TEXT_MUTED   = colors.HexColor('#7e7b74')
SEM_SUCCESS  = colors.HexColor('#4c845f')
SEM_WARNING  = colors.HexColor('#96783c')
SEM_ERROR    = colors.HexColor('#9c554f')
SEM_INFO     = colors.HexColor('#5a7da0')

# ━━ PATHS ━━
OUT = '/home/z/my-project/download'
BODY = os.path.join(OUT, 'design_body.pdf')
COVER_HTML = os.path.join(OUT, 'design_cover.html')
COVER_PDF = os.path.join(OUT, 'design_cover.pdf')
FINAL = os.path.join(OUT, 'DESIGN_Web_Scraping_Skill.pdf')

# ━━ STYLES ━━
s = getSampleStyleSheet()
sH1 = ParagraphStyle('H1', fontName='TNRB', fontSize=20, leading=26, textColor=ACCENT, spaceBefore=18, spaceAfter=10)
sH2 = ParagraphStyle('H2', fontName='TNRB', fontSize=15, leading=20, textColor=HEADER_FILL, spaceBefore=14, spaceAfter=8)
sH3 = ParagraphStyle('H3', fontName='TNRB', fontSize=12, leading=16, textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6)
sB = ParagraphStyle('B', fontName='TNR', fontSize=10.5, leading=17, textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=6)
sBL = ParagraphStyle('BL', fontName='TNR', fontSize=10.5, leading=17, textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=4, leftIndent=24, bulletIndent=12)
sCode = ParagraphStyle('Code', fontName='Dej', fontSize=8.5, leading=13, textColor=TEXT_PRIMARY, backColor=CARD_BG, leftIndent=12, rightIndent=12, spaceBefore=4, spaceAfter=4, borderPadding=6)
sTH = ParagraphStyle('TH', fontName='TNRB', fontSize=9.5, textColor=colors.white, alignment=TA_CENTER)
sTC = ParagraphStyle('TC', fontName='TNR', fontSize=9, textColor=TEXT_PRIMARY, alignment=TA_LEFT, leading=13)
sTCC = ParagraphStyle('TCC', fontName='TNR', fontSize=9, textColor=TEXT_PRIMARY, alignment=TA_CENTER, leading=13)
sCap = ParagraphStyle('Cap', fontName='TNR', fontSize=9, leading=13, textColor=TEXT_MUTED, alignment=TA_CENTER, spaceBefore=3, spaceAfter=6)
sToc1 = ParagraphStyle('T1', fontName='TNRB', fontSize=13, leftIndent=20, textColor=TEXT_PRIMARY)
sToc2 = ParagraphStyle('T2', fontName='TNR', fontSize=11, leftIndent=40, textColor=TEXT_MUTED)

# ━━ TEMPLATE ━━
class TocDoc(SimpleDocTemplate):
    def afterFlowable(self, f):
        if hasattr(f, 'bookmark_name'):
            self.notify('TOCEntry', (getattr(f,'bookmark_level',0), getattr(f,'bookmark_text',''), self.page, getattr(f,'bookmark_key','')))

avail = A4[0] - 2*72

def h(text, style, level=0):
    k = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (k, text), style)
    p.bookmark_name = text; p.bookmark_level = level; p.bookmark_text = text; p.bookmark_key = k
    return p

def p(t): return Paragraph(t, sB)
def bl(t): return Paragraph('<bullet>&bull;</bullet> ' + t, sBL)
def code(t): return Paragraph(t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;'), sCode)
def sp(pts=12): return Spacer(1, pts)
def hr(): return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=6, spaceBefore=6)

def tbl(headers, rows, cw=None):
    if cw is None:
        n = len(headers)
        cw = [avail/n]*n
    tot = sum(cw)
    if tot > avail:
        cw = [w*avail/tot for w in cw]
    hdr = [Paragraph('<b>%s</b>'%x, sTH) for x in headers]
    data = [hdr] + [[Paragraph(str(c), sTC) for c in r] for r in rows]
    t = Table(data, colWidths=cw, hAlign='CENTER')
    cmds = [
        ('BACKGROUND',(0,0),(-1,0), HEADER_FILL),
        ('TEXTCOLOR',(0,0),(-1,0), colors.white),
        ('GRID',(0,0),(-1,-1),0.5, BORDER),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('LEFTPADDING',(0,0),(-1,-1),8),
        ('RIGHTPADDING',(0,0),(-1,-1),8),
        ('TOPPADDING',(0,0),(-1,-1),5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),
    ]
    for i in range(1, len(data)):
        cmds.append(('BACKGROUND',(0,i),(-1,i), colors.white if i%2==1 else TABLE_STRIPE))
    t.setStyle(TableStyle(cmds))
    return t

def tblc(headers, rows, cw=None):
    if cw is None:
        n = len(headers)
        cw = [avail/n]*n
    tot = sum(cw)
    if tot > avail:
        cw = [w*avail/tot for w in cw]
    hdr = [Paragraph('<b>%s</b>'%x, sTH) for x in headers]
    data = [hdr] + [[Paragraph(str(c), sTCC) for c in r] for r in rows]
    t = Table(data, colWidths=cw, hAlign='CENTER')
    cmds = [
        ('BACKGROUND',(0,0),(-1,0), HEADER_FILL),
        ('TEXTCOLOR',(0,0),(-1,0), colors.white),
        ('GRID',(0,0),(-1,-1),0.5, BORDER),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('LEFTPADDING',(0,0),(-1,-1),8),
        ('RIGHTPADDING',(0,0),(-1,-1),8),
        ('TOPPADDING',(0,0),(-1,-1),5),
        ('BOTTOMPADDING',(0,0),(-1,-1),5),
    ]
    for i in range(1, len(data)):
        cmds.append(('BACKGROUND',(0,i),(-1,i), colors.white if i%2==1 else TABLE_STRIPE))
    t.setStyle(TableStyle(cmds))
    return t


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  BUILD BODY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def build():
    doc = TocDoc(BODY, pagesize=A4, leftMargin=72, rightMargin=72, topMargin=60, bottomMargin=60)
    story = []

    # TOC
    story.append(Paragraph('<b>Sumario</b>', ParagraphStyle('TT', fontName='TNRB', fontSize=22, leading=28, textColor=TEXT_PRIMARY, spaceAfter=18)))
    toc = TableOfContents()
    toc.levelStyles = [sToc1, sToc2]
    story.append(toc)
    story.append(PageBreak())

    # ═══════════════════════════════════════════
    # 1. VISAO GERAL
    # ═══════════════════════════════════════════
    story.append(h('<b>1. Visao Geral</b>', sH1, 0))
    story.append(sp(6))
    story.append(h('<b>1.1 Proposito</b>', sH2, 1))
    story.append(p(
        'Este documento de design (DESIGN.md) especifica a arquitetura, os componentes e os fluxos de '
        'uma skill de raspagem web (web scraping) capaz de extrair dados de qualquer site de forma ponta '
        'a ponta, desde a navegacao e renderizacao da pagina ate a extracao, limpeza e exportacao dos dados. '
        'A skill foi projetada para funcionar como um modulo autonomo e reutilizavel, integravel em pipelines '
        'de automacao, sistemas de inteligencia artificial e workflows de processamento de dados. O design '
        'prioriza flexibilidade, robustez e conformidade etica, garantindo que a raspagem possa ser realizada '
        'de forma confiavel em diferentes tipos de sites, desde paginas estaticas simples ate aplicacoes '
        'web complexas com renderizacao do lado do cliente (SPA), protecoes anti-bot e conteudo dinâmico.'
    ))
    story.append(p(
        'A arquitetura proposta utiliza um motor de navegacao baseado em Playwright (headless browser) como '
        'camada principal de interacao com os sites, complementado por um sistema inteligente de seletores '
        'CSS/XPath que se adaptam automaticamente a mudancas na estrutura do HTML. O pipeline de processamento '
        'e dividido em fases claramente definidas: descoberta de URLs, navegacao e renderizacao, selecao e '
        'extracao de dados, limpeza e normalizacao, e exportacao em multiplos formatos. Cada fase e isolada '
        'e configuravel independentemente, permitindo adaptacao a cenarios especificos sem modificacao do core.'
    ))

    story.append(h('<b>1.2 Publico-Alvo e Casos de Uso</b>', sH2, 1))
    story.append(p(
        'A skill foi projetada para atender diferentes perfis de usuarios tecnicos, desde engenheiros de dados '
        'que precisam coletar informacoes estruturadas da web para analise, ate equipes de growth que monitoram '
        'concorrentes e precos, e desenvolvedores que integram dados externos em suas aplicacoes. Os casos de '
        'uso principais incluem: monitoramento de precos e disponibilidade de produtos em e-commerces, coleta '
        'de dados de imoveis para plataformas de real estate, agregacao de noticias e artigos de fontes diversas, '
        'extracao de dados financeiros de portais de investimento, catalogacao de perfis profissionais em redes '
        'sociais, compilacao de dados academicos de repositoios de pesquisas, e alimentacao de LLMs com dados '
        'atualizados extraidos automaticamente da web.'
    ))

    story.append(h('<b>1.3 Princpios de Design</b>', sH2, 1))
    story.append(p('O design da skill segue sete principios fundamentais que guiam todas as decisoes arquiteturais:'))
    story.append(bl('<b>Modularidade:</b> Cada componente do pipeline (navegacao, extracao, limpeza, exportacao) e independente e pode ser substituido ou estendido sem afetar os demais. A arquitetura baseada em plugins permite adicionar novos extratores, formatos de saida e estrategias de navegacao.'))
    story.append(bl('<b>Resiliencia:</b> O sistema deve lidar graciosamente com falhas de rede, timeouts, mudancas no layout do site, blocos anti-bot e erros inesperados, implementando retry automatico com backoff exponencial e fallback para estrategias alternativas de extracao.'))
    story.append(bl('<b>Transparencia:</b> Todas as acoes de raspagem devem ser registradas em logs detalhados, permitindo auditoria, debug e conformidade regulatoria. O usuario deve ter visibilidade completa sobre o que foi extraido, de onde e quando.'))
    story.append(bl('<b>Eficiencia:</b> A raspagem deve minimizar o consumo de recursos (CPU, memoria, banda) e tempo de execucao, utilizando tecnicas como concorrencia controlada, cache de paginas, e seletores otimizados que evitam processamento desnecessario.'))
    story.append(bl('<b>Etica:</b> A skill deve respeitar robots.txt, limites de rate, termos de servico dos sites e leis de protecao de dados (LGPD/GDPR). O usuario deve poder configurar o nivel de agressividade da raspagem.'))
    story.append(bl('<b>Configurabilidade:</b> Todos os parametros criticos (timeout, user-agent, proxy, rate limit, seletor) devem ser expostos como opcoes de configuracao, permitindo adaptacao sem modificacao de codigo.'))
    story.append(bl('<b>Simplicidade de Uso:</b> A API deve ser intuitiva, com funcoes de alto nivel que abstraem a complexidade da raspagem, permitindo que um usuario extrai dados de uma pagina com poucas linhas de codigo.'))
    story.append(sp(12))

    # ═══════════════════════════════════════════
    # 2. ARQUITETURA
    # ═══════════════════════════════════════════
    story.append(h('<b>2. Arquitetura do Sistema</b>', sH1, 0))
    story.append(sp(6))

    story.append(h('<b>2.1 Visao Geral da Arquitetura</b>', sH2, 1))
    story.append(p(
        'A arquitetura da skill segue o padrao de pipeline em fases, onde cada fase recebe a saida da fase '
        'anterior e produz dados para a proxima. O fluxo principal e: Configuracao -> Navegacao -> Renderizacao '
        '-> Extracao -> Limpeza -> Validacao -> Exportacao. Cada fase e encapsulada em um modulo independente '
        'com interface bem definida, permitindo composicao flexivel e teste unitario isolado. O pipeline pode '
        'ser executado de forma sequencial (uma pagina por vez) ou em batch (multiplas paginas em paralelo), '
        'dependendo da configuracao do usuario e dos limites do site alvo.'
    ))
    story.append(p(
        'O componente central e o ScrapeEngine, que orquestra a execucao do pipeline. Ele recebe uma '
        'configuracao (ScrapeConfig), gerencia o ciclo de vida do navegador, coordena as fases e coleta '
        'os resultados. O motor suporta dois modos de operacao: single-page (extracao de uma unica pagina) '
        'e crawl (navegacao recursiva a partir de uma URL semente, seguindo links internos respeitando regras '
        'de escopo). O design favorece composicao sobre heranca, utilizando interfaces e injecao de dependencias '
        'para permitir extensibilidade sem acoplamento forte entre componentes.'
    ))

    story.append(h('<b>2.2 Componentes Principais</b>', sH2, 1))
    story.append(sp(6))
    story.append(tbl(
        ['Componente', 'Responsabilidade', 'Tecnologia', 'Interface'],
        [
            ['ScrapeEngine', 'Orquestra o pipeline completo', 'TypeScript', 'scrape(config) -> Result'],
            ['Navigator', 'Gerencia ciclo de vida do browser', 'Playwright', 'goto(url), click(sel)'],
            ['Renderer', 'Aguarda renderizacao completa', 'Playwright + JS', 'waitFor(selector, timeout)'],
            ['Extractor', 'Seleciona e extrai dados do DOM', 'Cheerio / DOM API', 'extract(schema, html)'],
            ['Cleaner', 'Limpa e normaliza dados extraidos', 'TypeScript puro', 'clean(rawData) -> CleanData'],
            ['Validator', 'Valida tipos e integridade', 'Zod / Joi', 'validate(data, schema)'],
            ['Paginator', 'Navega paginacao de listas', 'Playwright', 'hasNext() -> next()'],
            ['RateLimiter', 'Controla frequencia de requisicoes', 'Token Bucket', 'acquire() -> Promise'],
            ['AntiDetect', 'Evasao de deteccao anti-bot', 'Stealth plugins', 'apply(context)'],
            ['Exporter', 'Exporta dados em multiplos formatos', 'TypeScript', 'export(data, format)'],
            ['Logger', 'Registro detalhado de acoes', 'Winston / Pino', 'info/warn/error(msg)'],
            ['Cache', 'Cache de respostas HTTP e paginas', 'In-memory / Redis', 'get(key) / set(key, val)'],
        ],
        cw=[70, 155, 100, 125]
    ))
    story.append(Paragraph('Tabela 1: Componentes principais da skill e suas responsabilidades.', sCap))
    story.append(sp(12))

    story.append(h('<b>2.3 Stack Tecnologica</b>', sH2, 1))
    story.append(sp(6))
    story.append(tbl(
        ['Camada', 'Tecnologia', 'Versao', 'Justificativa'],
        [
            ['Runtime', 'Node.js', '20+ (LTS)', 'Ecossistema maduro para scraping e automacao web'],
            ['Navegador Headless', 'Playwright', '1.40+', 'Multi-browser, API moderna, auto-wait nativo'],
            ['Parsing HTML', 'Cheerio', '1.0+', 'jQuery-like, rapido, sem browser overhead'],
            ['Validacao', 'Zod', '3.20+', 'TypeScript-first, erros amigaveis, schemas compostos'],
            ['HTTP Fallback', 'Axios + Undici', '1.6+ / 6.0+', 'Requisicoes HTTP puras para APIs e sitemaps'],
            ['Exportacao CSV', 'PapaParse', '5.4+', 'Streaming, grandes arquivos, encoding flexivel'],
            ['Exportacao Excel', 'ExcelJS', '4.4+', 'XLSX com formatacao, multi-sheet, streaming'],
            ['Log', 'Pino', '8.0+', 'JSON estruturado, alto desempenho, multi-transport'],
            ['Cache', 'node-cache / Redis', '- / 7.0+', 'In-memory para dev, Redis para producao'],
            ['Proxy', 'proxy-chain', '2.4+', 'Rotacao de proxies, autenticacao, verificacao'],
            ['Scheduling', 'node-cron', '3.0+', 'Agendamento de tasks periodicas de scraping'],
            ['Tipagem', 'TypeScript', '5.3+', 'Seguranca de tipos em todo o codebase'],
        ],
        cw=[85, 105, 55, 205]
    ))
    story.append(Paragraph('Tabela 2: Stack tecnologica completo da skill.', sCap))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 3. MOTOR DE NAVEGACAO
    # ═══════════════════════════════════════════
    story.append(h('<b>3. Motor de Navegacao (Navigator)</b>', sH1, 0))
    story.append(sp(6))

    story.append(h('<b>3.1 Gerenciamento do Browser</b>', sH2, 1))
    story.append(p(
        'O Navigator e o componente responsavel por gerenciar o ciclo de vida completo do navegador headless. '
        'Ele encapsula a criacao, configuracao e destruicao de instancias do browser Playwright, garantindo '
        'que os recursos sejam liberados corretamente apos o uso. O design suporta tres modos de operacao: '
        'headless (sem interface grafica, modo padrao para producao), headed (com interface grafica visivel, '
        'util para debug) e remote (conectado a um browser remoto via CDP, para escalabilidade horizontal). '
        'O gerenciamento inclui configuracao de contexto de navegacao (viewports, user-agents, geolocation, '
        'locale, timezone), interceptacao de requisicoes de rede (para bloqueio de recursos desnecessarios '
        'como imagens, fontes e stylesheets, acelerando o carregamento), e injecao de scripts customizados '
        'no contexto da pagina antes do carregamento do HTML.'
    ))
    story.append(p(
        'Cada instancia do browser opera em um contexto isolado (BrowserContext), o que permite executar '
        'multiplas sessoes de raspagem em paralelo dentro do mesmo processo, cada uma com seus proprios '
        'cookies, storage e configuracoes. O Navigator implementa um pool de contextos reutilizaveis, '
        'reduzindo o overhead de criacao de novos contextos para cada pagina. Quando uma sessao de scraping '
        'e finalizada, o contexto e resetado (cookies limpos, storage limpo) e retornado ao pool, em vez '
        'de ser destruido. Essa estrategia reduz significativamente o tempo total de execucao em operacoes '
        'de crawl com centenas ou milhares de paginas.'
    ))

    story.append(h('<b>3.2 Configuracao Anti-Deteccao</b>', sH2, 1))
    story.append(p(
        'O modulo AntiDetect aplica uma camada de ofuscacao sobre o navegador headless para evitar deteccao '
        'por scripts anti-bot. As tecnicas implementadas incluem: remocao de propriedades reveladoras do '
        'objeto navigator (webdriver, languages, plugins), injecao de WebGL e Canvas fingerprint realistas, '
        'emulacao de interacoes humanas (movimentos de mouse com curvas de Bezier, delays aleatorios entre '
        'teclas, scroll natural com aceleracao e desaceleracao), spoofing de headers HTTP (User-Agent rotativo, '
        'Accept-Language, Sec- headers), e manipulacao do viewport e media queries para simular um ambiente '
        'de desktop ou mobile real. O modulo tambem suporta integracao com servicos de fingerprint rotation '
        'como AdsPower ou Multilogin para cenarios que exigem nivel maximo de evasao.'
    ))
    story.append(sp(6))
    story.append(tbl(
        ['Tecnica', 'Protecao', 'Implementacao', 'Impacto'],
        [
            ['User-Agent rotativo', 'Fingerprinting basico', 'Pool de 500+ UAs atualizados', 'Alto'],
            ['WebDriver removal', 'navigator.webdriver', 'Object.defineProperty override', 'Critico'],
            ['Canvas fingerprint', 'Canvas/Audio fingerprint', 'Injecao de noise sutil', 'Medio'],
            ['WebGL spoofing', 'WebGL fingerprint', 'Vendor/Renderer override', 'Medio'],
            ['Mouse emulation', 'Comportamento automatizado', 'Bezier curves + jitter', 'Alto'],
            ['Header spoofing', 'Header analysis', 'Sec-Fetch, Accept, Lang', 'Critico'],
            ['Viewport emulation', 'Device detection', 'Real device profiles', 'Alto'],
            ['Cookie isolation', 'Sessao tracking', 'Contexto isolado por sessao', 'Critico'],
            ['JS challenge solver', 'Cloudflare, Akamai', 'Delay adaptativo + espera', 'Alto'],
        ],
        cw=[100, 100, 150, 100]
    ))
    story.append(Paragraph('Tabela 3: Tecnicas anti-deteccao e niveis de impacto.', sCap))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 4. ESTRATEGIAS DE RASPAGEM
    # ═══════════════════════════════════════════
    story.append(h('<b>4. Estrategias de Raspagem</b>', sH1, 0))
    story.append(sp(6))

    story.append(h('<b>4.1 Classificacao de Sites</b>', sH2, 1))
    story.append(p(
        'A skill identifica automaticamente o tipo de site alvo e seleciona a estrategia de raspagem mais '
        'adequada. A classificacao e baseada em analise heuristica do HTML inicial, headers HTTP e comportamento '
        'de JavaScript. O sistema distingue cinco categorias principais de sites, cada uma exigindo abordagens '
        'diferentes de renderizacao e extracao. A classificacao correta e fundamental para escolher o modo de '
        'renderizacao (HTTP puro vs. browser completo), o timing de espera apropriado, e as tecnicas de extracao '
        'mais eficazes para cada tipo de pagina.'
    ))
    story.append(sp(6))
    story.append(tbl(
        ['Categoria', 'Caracteristicas', 'Estrategia', 'Exemplos'],
        [
            ['Estatico', 'HTML completo no response, sem JS', 'HTTP puro + Cheerio', 'Blogs WordPress, Wikis, Gov'],
            ['SPA (React/Vue/Angular)', 'HTML vazio, conteudo via JS', 'Playwright + waitFor', 'Gmail, Twitter, Airbnb'],
            ['Hybrido', 'HTML base + enriquecimento JS', 'HTTP + Playwright fallback', 'Amazon, LinkedIn, Medium'],
            ['Protegido (anti-bot)', 'Cloudflare, Akamai, Captcha', 'Stealth + delay + solver', 'Bot-protection sites'],
            ['API-driven', 'Dados via XHR/fetch em JSON', 'Interceptacao de rede', 'Apps com API publica'],
        ],
        cw=[80, 120, 105, 145]
    ))
    story.append(Paragraph('Tabela 4: Classificacao de sites e estrategias recomendadas.', sCap))
    story.append(sp(12))

    story.append(h('<b>4.2 Extracao de Dados Estruturados</b>', sH2, 1))
    story.append(p(
        'O Extrator e o componente central de coleta de dados, responsavel por mapear elementos do DOM para '
        'campos de dados estruturados. O usuario define um schema de extracao declarativo que especifica, para '
        'cada campo desejado, o seletor CSS ou XPath, o tipo de dado esperado (texto, atributo, HTML interno, '
        'link, imagem, preco, data), e transformacoes opcionais (regex, trim, parse de data, conversao numerica). '
        'O schema funciona como um contrato entre a intencao do usuario e a estrutura da pagina, permitindo que '
        'mudancas no layout do site sejam absorvidas pela atualizacao dos seletores sem modificacao do pipeline.'
    ))
    story.append(p(
        'O extrator suporta extracao de dados de tres tipos de fontes: elementos individuais (um seletor retorna '
        'um valor), listas (um seletor pai retorna N itens filhos com sub-seletores), e tabelas (extracao automatica '
        'de dados tabulares com deteccao de headers). Para cada tipo, o sistema aplica automaticamente normalizacao '
        'de espacos em branco, remocao de caracteres invisiveis (zero-width spaces, BOM), e decodificacao de '
        'entidades HTML. O resultado e um array de objetos JSON com campos tipados e validados, pronto para '
        'consumo por etapas posteriores do pipeline ou exportacao direta.'
    ))

    story.append(h('<b>4.3 Sistema de Seletores Inteligentes</b>', sH2, 1))
    story.append(p(
        'Alem dos seletores CSS e XPath manuais, a skill implementa um sistema de seletores inteligentes que '
        'ajudam a lidar com mudancas de layout do site alvo. Os seletores inteligentes utilizam multiplas '
        'estrategias de fallback encadeadas: se o seletor primario falhar, o sistema tenta automaticamente '
        'seletores alternativos baseados em heuristicas como atributos data-test, aria-label, texto do elemento, '
        'posicao relacional e proximidade semantica. O usuario pode definir um array de seletores candidatos '
        'para cada campo, ordenados por prioridade, e o sistema escolhera o primeiro que retornar resultados.'
    ))
    story.append(sp(6))
    story.append(tbl(
        ['Tipo de Seletor', 'Prioridade', 'Exemplo', 'Robustez'],
        [
            ['data-test / data-testid', '1 (maior)', '[data-test="price"]', 'Muito alta'],
            ['aria-label', '2', '[aria-label="Product name"]', 'Alta'],
            ['ID estavel', '3', '#product-price', 'Alta'],
            ['Classe semantica', '4', '.product-card .price', 'Media'],
            ['Estrutura relativa', '5', '.card > div:nth-child(2)', 'Baixa'],
            ['Texto do elemento', '6', ':contains("Add to cart")', 'Baixa'],
            ['XPath complexo', '7 (fallback)', '//div[@class="item"]//span', 'Media'],
        ],
        cw=[100, 70, 155, 70]
    ))
    story.append(Paragraph('Tabela 5: Tipos de seletores ordenados por robustez contra mudancas.', sCap))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 5. PAGINACAO
    # ═══════════════════════════════════════════
    story.append(h('<b>5. Sistema de Paginacao</b>', sH1, 0))
    story.append(sp(6))
    story.append(p(
        'O Paginator e o componente responsavel por detectar e navegar automaticamente sistemas de paginacao '
        'em listas de resultados. Ele analisa a estrutura da pagina para identificar padroes comuns de '
        'paginacao: botoes "Proximo" / "Anterior", links numericos de pagina, scroll infinito, e botes de '
        '"Carregar mais". A deteccao e baseada em heuristicas que combinam seletores CSS com analise de texto '
        '(busca por termos como "next", "proxima", "more", "carregar mais" em diferentes idiomas). O sistema '
        'suporta cinco padroes de paginacao, cada um com logica de navegacao dedicada e estrategias de espera '
        'especificas para garantir que todos os itens sejam carregados antes da extracao.'
    ))
    story.append(sp(6))
    story.append(tbl(
        ['Padrao', 'Deteccao', 'Navegacao', 'Limite'],
        [
            ['Paginacao numerada', 'Botoes/a com numeros sequenciais', 'Clique no proximo numero', 'Definido pelo user'],
            ['Next/Prev', 'Botoes "Proximo" / "Anterior"', 'Clique no "Proximo"', 'Ate desabilitar'],
            ['Scroll infinito', 'Ausencia de paginacao visivel', 'Scroll ate final + wait', 'Max pages config'],
            ['Load more button', 'Botao "Carregar mais"', 'Clique + espera conteudo', 'Ate botao sumir'],
            ['URL params', '?page=2, ?offset=20', 'Incrementa param na URL', 'Ate 404/vazio'],
        ],
        cw=[95, 130, 120, 105]
    ))
    story.append(Paragraph('Tabela 6: Padroes de paginacao suportados com estrategias de navegacao.', sCap))
    story.append(sp(12))

    story.append(h('<b>5.1 Crawl recursivo com controle de escopo</b>', sH2, 1))
    story.append(p(
        'Para operacoes de crawl que requerem navegacao alem de paginas de listas, o sistema implementa '
        'um crawler recursivo com controle de escopo rigoroso. O crawler recebe uma URL semente e um conjunto '
        'de regras de escopo que definem quais links podem ser seguidos. As regras incluem: prefixo de URL '
        'permitido (ex.: apenas links dentro de /products/), profundidade maxima (ex.: no maximo 3 niveis de '
        'profundidade a partir da semente), filtros por padrao de URL (regex de inclusao/exclusao), e limites '
        'de domino (ex.: apenas links do mesmo dominio ou subdominios especificos). O crawler mantem uma fila '
        'de URLs a visitar, um conjunto de URLs ja visitadas (para evitar ciclos) e uma frontier queue com '
        'prioridade baseada na relevancia do link. O politeness (delay entre requisicoes ao mesmo dominio) e '
        'configuravel e respeita automaticamente as diretrizes do robots.txt.'
    ))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 6. LIMPEZA E VALIDACAO
    # ═══════════════════════════════════════════
    story.append(h('<b>6. Pipeline de Limpeza e Validacao</b>', sH1, 0))
    story.append(sp(6))

    story.append(h('<b>6.1 Limpeza de Dados</b>', sH2, 1))
    story.append(p(
        'O Cleaner recebe os dados brutos extraidos pelo Extrator e aplica uma sequencia de transformacoes '
        'para normaliza-los em um formato consistente e utilizavel. As operacoes de limpeza sao definidas por '
        'tipo de dado e incluem: normalizacao de texto (remocao de espacos extras, tabs, newlines duplicados, '
        'caracteres zero-width, entidades HTML, tags HTML residuais), normalizacao de numeros (remocao de '
        'simbolos de moeda, separadores de milhar, conversao para float/int), normalizacao de datas (parser '
        'flexivel que aceita formatos DD/MM/YYYY, MM/DD/YYYY, ISO 8601, texto relativo como "ha 3 dias"), '
        'normalizacao de URLs (resolucao de paths relativos para absolutos, remocao de tracking params como '
        'utm_source, normalizacao de www/http/https), e deduplicacao de registros baseada em hash dos campos '
        'primarios. Cada transformacao e idempotente, garantindo que execucoes repetidas nao alterem o resultado.'
    ))
    story.append(sp(6))
    story.append(tbl(
        ['Tipo de Dado', 'Transformacoes', 'Exemplo de Entrada', 'Saida'],
        [
            ['Texto', 'Trim, collapse whitespace, strip HTML', ' "  Produto  X  "', '"Produto X"'],
            ['Preco', 'Remove R$, sep. milhar, to float', '"R$ 1.299,90"', '1299.90'],
            ['Data', 'Parse flexivel para ISO 8601', '"15 de Mar, 2026"', '"2026-03-15"'],
            ['URL', 'Resolve relativa, remove tracking', '"/p?id=5&utm=x"', '"https://site.com/p?id=5"'],
            ['Telefone', 'Strip non-digits, add country code', '"+55 (11) 99999-0000"', '"+5511999990000"'],
            ['Bool', 'Parse sim/nao/true/false/1/0', '"Sim"', 'true'],
        ],
        cw=[70, 130, 110, 140]
    ))
    story.append(Paragraph('Tabela 7: Transformacoes de limpeza por tipo de dado com exemplos.', sCap))
    story.append(sp(12))

    story.append(h('<b>6.2 Validacao com Schema (Zod)</b>', sH2, 1))
    story.append(p(
        'Apos a limpeza, os dados passam por um processo de validacao baseado em schemas Zod que garante '
        'integridade tipologica e a presenca de campos obrigatorios. O schema de validacao e derivado '
        'automaticamente do schema de extracao definido pelo usuario, com regras adicionais de consistencia. '
        'Se um registro falhar na validacao, ele e marcado com status "invalid" e incluido no relatorio de '
        'erros (junto com o motivo da falha), mas nao e descartado silenciosamente. O validador tambem '
        'detecta anomalias estatisticas, como valores muitos acima ou abaixo da media, e sinaliza esses '
        'casos para revisao manual. O resultado da validacao e um objeto estruturado contendo o array de '
        'registros validos, o array de registros invalidos com erros, e estatisticas de qualidade (taxa de '
        'validacao, campos mais frequentemente ausentes, distribuicao de erros por campo).'
    ))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 7. EXPORTACAO
    # ═══════════════════════════════════════════
    story.append(h('<b>7. Sistema de Exportacao</b>', sH1, 0))
    story.append(sp(6))
    story.append(p(
        'O Exporter suporta saida em multiplos formatos, permitindo que os dados extraidos sejam consumidos '
        'por diferentes sistemas e ferramentas. Cada formato possui configuracoes especificas como encoding, '
        'delimitador, formatacao de numeros/datas, e compressao. O exportador e projetado para lidar com '
        'datasets grandes de forma eficiente, utilizando streaming quando possivel para evitar carregar todo '
        'o dataset em memoria. O usuario pode configurar multiplos formatos de saida simultaneos, e o sistema '
        'gera todos eles em uma unica execucao do pipeline.'
    ))
    story.append(sp(6))
    story.append(tbl(
        ['Formato', 'Biblioteca', 'Max Recomendado', 'Caracteristicas'],
        [
            ['JSON', 'fs.writeFileSync', '100MB+', 'Estruturado, aninhado, ideal para APIs'],
            ['CSV', 'PapaParse unparse', '500K+ linhas', 'Universal, Excel-compatible, streaming'],
            ['XLSX (Excel)', 'ExcelJS', '1M+ celulas', 'Multi-sheet, formatacao, formulas'],
            ['HTML', 'Template strings', 'Ilimitado', 'Visual, web-ready, customizavel'],
            ['XML', 'xml2js', '50MB+', 'Estruturado, schema-validavel'],
            ['Markdown', 'Custom formatter', 'Ilimitado', 'Tabelas, listas, legivel'],
            ['Parquet', 'apache-arrow', 'Big data', 'Colunar, compressao, analytics-ready'],
        ],
        cw=[75, 95, 80, 200]
    ))
    story.append(Paragraph('Tabela 8: Formatos de exportacao suportados com limites e caracteristicas.', sCap))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 8. RATE LIMITING E ETICA
    # ═══════════════════════════════════════════
    story.append(h('<b>8. Rate Limiting e Conformidade Etica</b>', sH1, 0))
    story.append(sp(6))

    story.append(h('<b>8.1 Controle de Frequencia</b>', sH2, 1))
    story.append(p(
        'O RateLimiter implementa o algoritmo Token Bucket para controlar a frequencia de requisicoes ao '
        'site alvo. O algoritmo permite rajadas curtas de requisicoes (burst) dentro de um limite maximo, '
        'mas mantem uma media ao longo do tempo que respeita o rate configurado. O usuario pode configurar '
        'tres parametros: requests per second (RPS), max burst size, e per-domain delay. O sistema tambem '
        'suporta adaptive rate limiting, onde o RPS e automaticamente reduzido quando o site alvo retorna '
        'codigos de status 429 (Too Many Requests) ou 503 (Service Unavailable), e gradualmente restaurado '
        'apos o site voltar a responder normalmente. Essa estrategia auto-reguladora protege tanto o site '
        'alvo (evitando sobrecarga) quanto o scraper (evitando bans por excesso de requisicoes).'
    ))

    story.append(h('<b>8.2 Respeito a robots.txt e sitemaps</b>', sH2, 1))
    story.append(p(
        'A skill analisa automaticamente o robots.txt do dominio alvo antes de iniciar a raspagem, verificando '
        'quais paths sao permitidos ou bloqueados para user-agents genericos ou especificos. URLs bloqueadas '
        'por robots.txt sao excluidas automaticamente do escopo do crawl, e o usuario recebe um aviso no log. '
        'O sistema tambem pode extrair e utilizar sitemaps.xml para descoberta eficiente de URLs, priorizando '
        'as URLs listadas no sitemap em vez de seguir links do HTML (mais lento e menos completo). O sitemap '
        'e processado incrementalmente, permitindo iniciar a raspagem antes de baixar todo o sitemap, e URLs '
        'com lastmod recente sao priorizadas para maximizar a relevancia dos dados coletados.'
    ))

    story.append(h('<b>8.3 Conformidade LGPD / GDPR</b>', sH2, 1))
    story.append(p(
        'A skill inclui funcionalidades para auxiliar na conformidade com legislacoes de protecao de dados. '
        'O sistema detecta automaticamente banners de consentimento de cookies (GDPR) e pode aceita-los ou '
        'rejeita-los conforme a configuracao. Dados pessoais (emails, telefones, CPFs, enderecos) sao marcados '
        'com metadados de sensibilidade no resultado da extracao, permitindo ao usuario aplicar anonimizacao '
        'automatica ou excluir esses campos da exportacao. O log de raspagem registra a data, hora, URL e '
        'dados extraidos, proporcionando rastreabilidade para fins de auditoria. O usuario e responsavel por '
        'verificar se a raspagem dos dados esta de acordo com os termos de servico do site e a legislacao '
        'aplicavel, mas a skill fornece as ferramentas para facilitar essa conformidade.'
    ))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 9. TRATAMENTO DE ERROS
    # ═══════════════════════════════════════════
    story.append(h('<b>9. Sistema de Tratamento de Erros e Recuperacao</b>', sH1, 0))
    story.append(sp(6))
    story.append(p(
        'O tratamento de erros e projetado em tres niveis hierarquicos: nivel de requisicao (falhas individuais '
        'de carregamento de pagina), nivel de extracao (falhas no parsing de elementos especificos) e nivel de '
        'pipeline (falhas estruturais que impedem a execucao). Cada nivel tem sua propria estrategia de recovery. '
        'Erros de requisicao triggeram retry com backoff exponencial (1s, 2s, 4s, 8s, maximo 3 tentativas), '
        'alternancia de User-Agent entre tentativas, e eventual fallback para HTTP puro se o browser falhar '
        'repetidamente. Erros de extracao triggeram fallback para seletores alternativos, e se todos falharem, '
        'o campo e marcado como null com registro do erro no log detalhado. Erros de pipeline causam parada '
        'graciosa com salvamento automatico dos dados coletados ate o momento do erro.'
    ))
    story.append(sp(6))
    story.append(tbl(
        ['Tipo de Erro', 'Codigo', 'Acao Automatica', 'Max Retries'],
        [
            ['Timeout de navegacao', 'ERR_TIMEOUT', 'Retry + aumentar timeout', '3'],
            ['Pagina nao encontrada', '404', 'Log + pular URL', '0'],
            ['Rate limited', '429', 'Backoff + reduzir RPS', '5'],
            ['Erro de servidor', '5xx', 'Retry com backoff', '3'],
            ['Seletor nao encontrado', 'SEL_MISSING', 'Fallback para alternativo', '0'],
            ['JS nao carregou', 'RENDER_FAIL', 'Retry + espera estendida', '2'],
            ['Captcha detectado', 'CAPTCHA', 'Pausa + notifica usuario', '0'],
            ['Conexao recusada', 'ECONNREFUSED', 'Retry + trocar proxy', '3'],
            ['Erro de parsing', 'PARSE_ERR', 'Log + campo null', '0'],
            ['Memoria insuficiente', 'OOM', 'Fechar contexto + reiniciar', '1'],
        ],
        cw=[100, 75, 160, 60]
    ))
    story.append(Paragraph('Tabela 9: Catalogo de erros com acoes automaticas de recuperacao.', sCap))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 10. CONFIGURACAO
    # ═══════════════════════════════════════════
    story.append(h('<b>10. Interface de Configuracao</b>', sH1, 0))
    story.append(sp(6))
    story.append(p(
        'Toda a configuracao da skill e centralizada em um objeto TypeScript (ScrapeConfig) que e passado '
        'como argumento para o ScrapeEngine. A configuracao utiliza o padrao "convention over configuration", '
        'onde valores padrao sao fornecidos para todos os parametros, permitindo ao usuario override apenas '
        'os parametros que precisa personalizar. A configuracao pode ser fornecida como objeto JavaScript/TypeScript '
        'inline, como arquivo JSON externo, ou como variaveis de ambiente (para deploy em containers). A validacao '
        'da configuracao e realizada em tempo de inicializacao pelo schema Zod, e erros de configuracao invalida '
        'sao reportados imediatamente com mensagens descritivas, evitando falhas em runtime.'
    ))
    story.append(sp(6))
    story.append(tbl(
        ['Parametro', 'Tipo', 'Padrao', 'Descricao'],
        [
            ['url', 'string', '-', 'URL inicial ou lista de URLs para iniciar a raspagem'],
            ['mode', 'enum', 'single', 'single (uma pagina) ou crawl (navegacao recursiva)'],
            ['browser', 'enum', 'chromium', 'chromium, firefox, webkit'],
            ['headless', 'boolean', 'true', 'Executar browser em modo headless'],
            ['timeout', 'number', '30000', 'Timeout de navegacao em milissegundos'],
            ['rateLimit', 'number', '2', 'Maximo de requisicoes por segundo'],
            ['maxPages', 'number', '100', 'Maximo de paginas para crawl'],
            ['depth', 'number', '3', 'Profundidade maxima de navegacao'],
            ['proxy', 'string', 'none', 'URL do proxy (http://user:pass@host:port)'],
            ['userAgent', 'string', 'auto', 'User-Agent personalizado ou rotacao automatica'],
            ['output', 'string[]', '["json"]', 'Formatos de exportacao desejados'],
            ['respectRobotsTxt', 'boolean', 'true', 'Respeitar diretrizes do robots.txt'],
            ['antiDetect', 'boolean', 'true', 'Ativar tecnicas anti-deteccao'],
        ],
        cw=[90, 45, 55, 260]
    ))
    story.append(Paragraph('Tabela 10: Parametros de configuracao com tipos e valores padrao.', sCap))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 11. MONITORAMENTO
    # ═══════════════════════════════════════════
    story.append(h('<b>11. Monitoramento e Observabilidade</b>', sH1, 0))
    story.append(sp(6))
    story.append(p(
        'O sistema de monitoramento fornece visibilidade completa sobre a execucao da raspagem em tempo real '
        'e historico. O Logger registra todos os eventos em formato JSON estruturado com campos de timestamp, '
        'nivel (info, warn, error), modulo de origem, URL sendo processada, e dados do evento. Os logs sao '
        'escritos em dois destinos simultaneos: console (para desenvolvimento) e arquivo rotacionado (para '
        'producao). Alem dos logs textuais, o sistema emite metricas quantitativas que podem ser consumidas '
        'por sistemas de monitoramento como Prometheus ou Grafana: numero total de paginas processadas, taxa '
        'de sucesso/falha por URL, tempo medio de carregamento por pagina, quantidade de dados extraidos, '
        'utilizacao de memoria do processo, e numero de requisicoes bloqueadas pelo rate limiter.'
    ))
    story.append(p(
        'O monitoramento inclui tambem um sistema de alertas configuraveis que disparam notificacoes quando '
        'determinados thresholds sao atingidos: taxa de erro acima de 10% (alerta), acima de 30% (critico), '
        'tempo medio de pagina acima de 5 segundos, numero de paginas sem dados extraidos acima de 5 consecutivas, '
        'e memoria acima de 80% do limite configurado. Os alertas podem ser enviados via webhook, email, ou '
        'integracao com Slack/Discord. O dashboard de monitoramento fornece uma visao consolidada com graficos '
        'de progresso, contadores de paginas, erros recentes e estimativa de tempo restante para a conclusao.'
    ))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 12. EXEMPLOS DE USO
    # ═══════════════════════════════════════════
    story.append(h('<b>12. Exemplos de Uso</b>', sH1, 0))
    story.append(sp(6))

    story.append(h('<b>12.1 Exemplo Basico - Raspagem de uma pagina</b>', sH2, 1))
    story.append(p(
        'O exemplo mais simples de uso da skill e a raspagem de dados estruturados de uma unica pagina. '
        'O usuario define a URL, o schema de extracao com seletores CSS para cada campo desejado, e o formato '
        'de saida. O motor cuida de todo o resto: navega ate a URL, espera a renderizacao completa, extrai '
        'os dados conforme o schema, limpa e valida os resultados, e exporta no formato solicitado. O codigo '
        'abaixo demonstra uma extracao de produtos de uma pagina de e-commerce, com seletores para titulo, '
        'preco, avaliacao e link do produto.'
    ))
    story.append(code(
        'import { scrape } from \'web-scraper\';<br/>'
        '<br/>'
        'const result = await scrape({<br/>'
        '&nbsp;&nbsp;url: \'https://exemplo.com/produtos\',<br/>'
        '&nbsp;&nbsp;schema: [<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ field: \'titulo\', selector: \'.product-title\' },<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ field: \'preco\', selector: \'.price\', type: \'number\' },<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ field: \'avaliacao\', selector: \'.rating\', type: \'number\' },<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ field: \'link\', selector: \'a.product\', attr: \'href\' },<br/>'
        '&nbsp;&nbsp;],<br/>'
        '&nbsp;&nbsp;output: [\'json\', \'csv\'],<br/>'
        '&nbsp;&nbsp;rateLimit: 2,<br/>'
        '});<br/>'
        '<br/>'
        '// result.data => Array de objetos extraidos<br/>'
        '// result.files => { json: \'./output/data.json\', csv: \'./output/data.csv\' }'
    ))
    story.append(sp(12))

    story.append(h('<b>12.2 Exemplo Avancado - Crawl com paginacao</b>', sH2, 1))
    story.append(p(
        'Para extrair dados de multiplas paginas, o modo crawl com paginacao automatica e o mais indicado. '
        'O usuario configura a URL semente, o seletor da lista de itens, o padrao de paginacao, e o numero '
        'maximo de paginas. O sistema automaticamente navega pelas paginas, extrai os dados de cada uma, e '
        'consolida tudo em um unico dataset. O exemplo abaixo demonstra um crawl completo de um catalogo de '
        'produtos com paginacao numerada, incluindo deteccao automatica do botao "Proximo" e parada quando '
        'o botao e desabilitado (indicando a ultima pagina).'
    ))
    story.append(code(
        'const result = await scrape({<br/>'
        '&nbsp;&nbsp;url: \'https://exemplo.com/catalogo\',<br/>'
        '&nbsp;&nbsp;mode: \'crawl\',<br/>'
        '&nbsp;&nbsp;pagination: {<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;type: \'numbered\',<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;nextSelector: \'a.next-page\',<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;maxPages: 50,<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;waitForContent: \'.product-card\',<br/>'
        '&nbsp;&nbsp;},<br/>'
        '&nbsp;&nbsp;schema: [<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ field: \'produto\', selector: \'.product-name\' },<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ field: \'preco\', selector: \'.price\', type: \'number\' },<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ field: \'disponivel\', selector: \'.stock\', type: \'boolean\' },<br/>'
        '&nbsp;&nbsp;],<br/>'
        '&nbsp;&nbsp;output: [\'xlsx\'],<br/>'
        '&nbsp;&nbsp;rateLimit: 1,<br/>'
        '&nbsp;&nbsp;antiDetect: true,<br/>'
        '&nbsp;&nbsp;exportPath: \'./data/catalogo.xlsx\',<br/>'
        '});<br/>'
        '<br/>'
        '// result.stats => { pagesScraped: 47, itemsExtracted: 1402, errors: 0 }'
    ))
    story.append(sp(12))

    story.append(h('<b>12.3 Exemplo com API Interception</b>', sH2, 1))
    story.append(p(
        'Muitos sites modernos carregam dados via chamadas API (XHR/fetch) em formato JSON, o que e mais '
        'eficiente e confiavel do que raspar o HTML renderizado. A skill suporta interceptacao de requisicoes '
        'de rede para capturar respostas de API diretamente. O usuario especifica um padrao de URL ou content-type '
        'para filtrar as requisicoes desejadas, e o sistema coleta todas as respostas correspondentes durante '
        'a navegacao, eliminando a necessidade de seletores CSS e tornando a extracao imune a mudancas de layout.'
    ))
    story.append(code(
        'const result = await scrape({<br/>'
        '&nbsp;&nbsp;url: \'https://exemplo.com/dashboard\',<br/>'
        '&nbsp;&nbsp;apiInterception: {<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;urlPattern: \'/api/v1/products\',<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;responseType: \'json\',<br/>'
        '&nbsp;&nbsp;},<br/>'
        '&nbsp;&nbsp;actions: [<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ type: \'scroll\', target: \'.feed\', distance: 3000 },<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ type: \'click\', selector: \'.load-more\' },<br/>'
        '&nbsp;&nbsp;&nbsp;&nbsp;{ type: \'wait\', duration: 2000 },<br/>'
        '&nbsp;&nbsp;],<br/>'
        '&nbsp;&nbsp;output: [\'json\'],<br/>'
        '});<br/>'
        '<br/>'
        '// result.apiData => Array de respostas JSON capturadas'
    ))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 13. ESTRUTURA DO PROJETO
    # ═══════════════════════════════════════════
    story.append(h('<b>13. Estrutura do Projeto</b>', sH1, 0))
    story.append(sp(6))
    story.append(sp(6))
    story.append(tbl(
        ['Caminho', 'Tipo', 'Descricao'],
        [
            ['src/engine/', 'Modulo', 'Orquestrador principal do pipeline de raspagem'],
            ['src/navigator/', 'Modulo', 'Gerenciamento do browser Playwright'],
            ['src/extractor/', 'Modulo', 'Motor de seletores e extracao de dados do DOM'],
            ['src/cleaner/', 'Modulo', 'Transformacoes e normalizacao de dados'],
            ['src/validator/', 'Modulo', 'Validacao de schemas Zod e verificacao de tipos'],
            ['src/paginator/', 'Modulo', 'Deteccao e navegacao automatica de paginacao'],
            ['src/anti-detect/', 'Modulo', 'Tecnicas de evasao anti-bot e fingerprint spoofing'],
            ['src/exporter/', 'Modulo', 'Exportacao em JSON, CSV, XLSX, HTML, XML, Parquet'],
            ['src/rate-limiter/', 'Modulo', 'Controle de frequencia com Token Bucket'],
            ['src/logger/', 'Modulo', 'Logging estruturado com Pino'],
            ['src/cache/', 'Modulo', 'Cache in-memory e Redis para respostas HTTP'],
            ['src/types/', 'Modulo', 'Interfaces TypeScript e tipos compartilhados'],
            ['src/config/', 'Modulo', 'Schema Zod de validacao da configuracao'],
            ['src/utils/', 'Modulo', 'Funcoes utilitarias (URL, regex, encoding)'],
            ['tests/', 'Dir', 'Testes unitarios e de integracao (Vitest)'],
            ['examples/', 'Dir', 'Exemplos de uso com diferentes cenarios'],
        ],
        cw=[110, 55, 285]
    ))
    story.append(Paragraph('Tabela 11: Estrutura de diretorios do projeto com modulos e descricoes.', sCap))
    story.append(sp(18))

    # ═══════════════════════════════════════════
    # 14. ROADMAP
    # ═══════════════════════════════════════════
    story.append(h('<b>14. Roadmap de Evolucao</b>', sH1, 0))
    story.append(sp(6))
    story.append(sp(6))
    story.append(tbl(
        ['Fase', 'Feature', 'Prioridade', 'Complexidade'],
        [
            ['Fase 1', 'Motor de navegacao Playwright com anti-detect', 'Critica', 'Alta'],
            ['Fase 1', 'Extracao por seletores CSS/XPath com fallback', 'Critica', 'Media'],
            ['Fase 1', 'Exportacao JSON e CSV', 'Critica', 'Baixa'],
            ['Fase 1', 'Rate limiting com Token Bucket', 'Critica', 'Baixa'],
            ['Fase 2', 'Paginacao automatica (5 padroes)', 'Alta', 'Media'],
            ['Fase 2', 'Pipeline de limpeza e validacao Zod', 'Alta', 'Media'],
            ['Fase 2', 'Crawl recursivo com escopo configuravel', 'Alta', 'Alta'],
            ['Fase 2', 'Exportacao XLSX e HTML', 'Alta', 'Media'],
            ['Fase 3', 'Interceptacao de API (XHR/fetch)', 'Media', 'Alta'],
            ['Fase 3', 'Dashboard de monitoramento em tempo real', 'Media', 'Alta'],
            ['Fase 3', 'Suporte a proxy rotativo', 'Media', 'Baixa'],
            ['Fase 3', 'Agendamento com node-cron', 'Media', 'Baixa'],
            ['Fase 4', 'CapSolver / 2Captcha integration', 'Baixa', 'Media'],
            ['Fase 4', 'Exportacao Parquet para Big Data', 'Baixa', 'Media'],
            ['Fase 4', 'Plugin system para extensoes customizadas', 'Baixa', 'Alta'],
        ],
        cw=[50, 225, 60, 70]
    ))
    story.append(Paragraph('Tabela 12: Roadmap de evolucao por fase, prioridade e complexidade.', sCap))

    # BUILD
    doc.multiBuild(story)
    print(f'Body PDF: {BODY}')


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  COVER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def build_cover():
    W = 794; H = 1123
    html = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
<style>
@page {{ size: {W}px {H}px; margin: 0; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html, body {{ width:{W}px; height:{H}px; background:#f5f4f3; font-family:'Inter',sans-serif; overflow:hidden; }}
.cover-base {{ position:absolute; inset:0; background:#f5f4f3; z-index:0; }}
.cover-bg {{ position:absolute; inset:0; overflow:hidden; z-index:1; }}
.bg-grid {{
  position:absolute; inset:0;
  background-image:
    linear-gradient(rgba(43,148,183,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(43,148,183,0.04) 1px, transparent 1px);
  background-size: 50px 50px;
}}
.cover-lines {{ position:absolute; inset:0; z-index:2; }}
.anchor-line {{
  position:absolute;
  left: {0.12*W}px;
  top: {0.10*H}px;
  width: 6px;
  height: {0.80*H}px;
  background: #2b94b7;
  border-radius: 3px;
}}
.meta-line {{
  position:absolute;
  left: {0.12*W+30}px;
  top: {0.72*H}px;
  width: {0.35*W}px;
  height: 1px;
  background: rgba(43,148,183,0.4);
}}
.cover-content {{ position:absolute; inset:0; z-index:3; }}
.kicker {{
  position:absolute;
  left: {0.12*W+30}px;
  top: {0.15*H}px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(43,148,183,0.6);
}}
.hero {{
  position:absolute;
  left: {0.12*W+30}px;
  top: {0.28*H}px;
  max-width: {0.65*W}px;
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  font-weight: 900;
  line-height: 1.18;
  color: #1d1c1a;
}}
.hero .accent {{ color: #2b94b7; }}
.summary {{
  position:absolute;
  left: {0.12*W+30}px;
  top: {0.52*H}px;
  max-width: {0.55*W}px;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.7;
  color: rgba(29,28,26,0.75);
}}
.meta {{
  position:absolute;
  left: {0.12*W+30}px;
  top: {0.74*H}px;
  font-size: 14px;
  font-weight: 400;
  color: rgba(29,28,26,0.5);
  line-height: 1.8;
}}
.meta strong {{ color: rgba(29,28,26,0.7); }}
</style>
</head>
<body>
<div class="cover-base"></div>
<div class="cover-bg"><div class="bg-grid"></div></div>
<div class="cover-lines">
  <div class="anchor-line"></div>
  <div class="meta-line"></div>
</div>
<div class="cover-content">
  <div class="kicker">Design Document</div>
  <div class="hero">Web Scraping<br><span class="accent">Skill</span></div>
  <div class="summary">Especificacao completa de uma skill de raspagem web ponta a ponta. Arquitetura modular com Playwright, extracao inteligente de dados, anti-deteccao, paginacao automatica, pipeline de limpeza e validacao, e exportacao em multiplos formatos.</div>
  <div class="meta">
    <strong>Versao:</strong> 1.0.0<br>
    <strong>Data:</strong> Maio 2026<br>
    <strong>Tipo:</strong> DESIGN.md - Documento de Design Tecnico
  </div>
</div>
</body>
</html>'''
    with open(COVER_HTML, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Cover HTML: {COVER_HTML}')


def render_cover():
    import subprocess
    sd = '/home/z/my-project/skills/pdf/scripts'
    r = subprocess.run(['node', f'{sd}/html2poster.js', COVER_HTML, '--output', COVER_PDF, '--width', '794px'],
                       capture_output=True, text=True, cwd=OUT)
    if r.returncode != 0:
        raise Exception(f'Cover render failed: {r.stderr}')
    print(f'Cover PDF: {COVER_PDF}')


def merge():
    from pypdf import PdfReader, PdfWriter, Transformation
    A4W, A4H = 595.28, 841.89
    def norm(pg):
        bx = pg.mediabox; w, h = float(bx.width), float(bx.height)
        if abs(w-A4W) > 2 or abs(h-A4H) > 2:
            pg.add_transformation(Transformation().scale(A4W/w, A4H/h))
            pg.mediabox.lower_left = (0,0); pg.mediabox.upper_right = (A4W, A4H)
        return pg
    wr = PdfWriter()
    wr.add_page(norm(PdfReader(COVER_PDF).pages[0]))
    for pg in PdfReader(BODY).pages:
        wr.add_page(norm(pg))
    wr.add_metadata({'/Title':'DESIGN.md - Web Scraping Skill','/Author':'Z.ai','/Creator':'Z.ai','/Subject':'Design Document - Skill de Raspagem Web Ponta a Ponta'})
    with open(FINAL, 'wb') as f:
        wr.write(f)
    print(f'Final PDF: {FINAL}')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    print('=== DESIGN.md - Web Scraping Skill ===')
    print()
    print('[1/4] Gerando corpo...')
    build()
    print('[2/4] Gerando cover...')
    build_cover()
    print('[3/4] Renderizando cover...')
    render_cover()
    print('[4/4] Mesclando...')
    merge()
    sz = os.path.getsize(FINAL)
    print(f'\n=== PRONTO! ===')
    print(f'Arquivo: {FINAL}')
    print(f'Tamanho: {sz/1024:.1f} KB')
