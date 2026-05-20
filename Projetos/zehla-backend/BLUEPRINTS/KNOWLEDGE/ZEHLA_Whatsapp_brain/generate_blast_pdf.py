# -*- coding: utf-8 -*-
"""
ZEHLA Blast — Plataforma de Envio em Massa WhatsApp
PDF Master: Pesquisa + Arquitetura + Implementacao
"""
import os, sys, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, CondPageBreak
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

pdfmetrics.registerFont(TTFont('NotoSerifSC', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSCBold', '/usr/share/fonts/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSCBold', '/usr/share/fonts/truetype/chinese/SarasaMonoSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Carlito', '/usr/share/fonts/truetype/english/Carlito-Regular.ttf'))
pdfmetrics.registerFont(TTFont('CarlitoBold', '/usr/share/fonts/truetype/english/Carlito-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))
registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSCBold')
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSCBold')
registerFontFamily('Carlito', normal='Carlito', bold='CarlitoBold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

sys.path.insert(0, os.path.join("/home/z/my-project/skills/pdf", 'scripts'))
try:
    from pdf import install_font_fallback; install_font_fallback()
except: pass

# Colors
PAGE_BG=colors.HexColor('#f7f7f6'); TABLE_STRIPE=colors.HexColor('#efeeec')
HEADER_FILL=colors.HexColor('#4e4835'); COVER_BLOCK=colors.HexColor('#6f6547')
BORDER=colors.HexColor('#cac7bc'); ACCENT=colors.HexColor('#4e2db1')
ACCENT_2=colors.HexColor('#39b376'); TEXT_PRIMARY=colors.HexColor('#1e1d1b')
TEXT_MUTED=colors.HexColor('#77756e'); SEM_SUCCESS=colors.HexColor('#509266')
SEM_WARNING=colors.HexColor('#8d7340'); SEM_ERROR=colors.HexColor('#a34840')
SEM_INFO=colors.HexColor('#446b92')

PAGE_W, PAGE_H = A4; LM=0.85*inch; RM=0.85*inch; TM=0.8*inch; BM=0.8*inch
CW = PAGE_W - LM - RM; CH = PAGE_H - TM - BM
OUT = "/home/z/my-project/download/ZEHLA_Blast_Plataforma_WhatsApp.pdf"

# Styles
def S(name, **kw):
    defaults = dict(fontName='Carlito', fontSize=10.5, leading=17, textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=6)
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

sH1=S('H1',fontSize=22,leading=28,textColor=HEADER_FILL,spaceBefore=18,spaceAfter=10)
sH2=S('H2',fontSize=16,leading=22,textColor=SEM_INFO,spaceBefore=14,spaceAfter=8)
sH3=S('H3',fontSize=13,leading=18,textColor=ACCENT,spaceBefore=10,spaceAfter=6)
sBody=S('Body'); sLeft=S('BL',alignment=TA_LEFT); sBul=S('Bul',leftIndent=18,bulletIndent=6,spaceAfter=4)
sHC=S('HC',fontName='Carlito',fontSize=9.5,leading=14,textColor=colors.white,alignment=TA_CENTER)
sCE=S('CE',fontName='Carlito',fontSize=9,leading=14,textColor=TEXT_PRIMARY,alignment=TA_CENTER)
sCL=S('CL',fontName='Carlito',fontSize=9,leading=14,textColor=TEXT_PRIMARY,alignment=TA_LEFT)
sCap=S('Cap',fontName='Carlito',fontSize=9.5,leading=14,textColor=TEXT_MUTED,alignment=TA_CENTER,spaceBefore=3,spaceAfter=6)
sTH1=S('TH1',fontName='Carlito',fontSize=13,leading=20,leftIndent=20,textColor=TEXT_PRIMARY)
sTH2=S('TH2',fontName='Carlito',fontSize=11,leading=18,leftIndent=40,textColor=TEXT_MUTED)
sCO=S('CO',fontSize=10,leading=16,textColor=SEM_INFO,backColor=colors.HexColor('#edf2f7'),leftIndent=12,rightIndent=12,spaceBefore=6,spaceAfter=6,borderPadding=(8,12,8,12),borderColor=SEM_INFO,borderWidth=1,borderRadius=4)
sCW=S('CW',fontSize=10,leading=16,textColor=SEM_WARNING,backColor=colors.HexColor('#fef9ee'),leftIndent=12,rightIndent=12,spaceBefore=6,spaceAfter=6,borderPadding=(8,12,8,12),borderColor=SEM_WARNING,borderWidth=1,borderRadius=4)
sCEr=S('CEr',fontSize=10,leading=16,textColor=SEM_ERROR,backColor=colors.HexColor('#fef2f2'),leftIndent=12,rightIndent=12,spaceBefore=6,spaceAfter=6,borderPadding=(8,12,8,12),borderColor=SEM_ERROR,borderWidth=1,borderRadius=4)
sCOK=S('COK',fontSize=10,leading=16,textColor=SEM_SUCCESS,backColor=colors.HexColor('#f0fdf4'),leftIndent=12,rightIndent=12,spaceBefore=6,spaceAfter=6,borderPadding=(8,12,8,12),borderColor=SEM_SUCCESS,borderWidth=1,borderRadius=4)
sDec=S('Dec',fontSize=11,leading=17,textColor=colors.white,backColor=HEADER_FILL,leftIndent=12,rightIndent=12,spaceBefore=8,spaceAfter=4,borderPadding=(10,14,10,14),borderRadius=4)
sPh=S('Ph',fontSize=14,leading=20,textColor=colors.white,backColor=ACCENT,leftIndent=12,rightIndent=12,spaceBefore=12,spaceAfter=4,borderPadding=(10,14,10,14),borderRadius=4)
sSA=S('SA',fontName='SarasaMonoSC',fontSize=8,leading=12.5,textColor=colors.HexColor('#d4d4d4'),backColor=colors.HexColor('#1e1e1e'),leftIndent=8,rightIndent=8,spaceBefore=0,spaceAfter=0,borderPadding=(4,8,4,8))
sSN=S('SN',fontName='SarasaMonoSC',fontSize=9.5,leading=14,textColor=colors.HexColor('#e8e8e8'),backColor=colors.HexColor('#2d2d2d'),leftIndent=8,rightIndent=8,spaceBefore=8,spaceAfter=2,borderPadding=(6,8,6,8))

def h1(t): return Paragraph(f'<b>{t}</b>', sH1)
def h2(t): return Paragraph(f'<b>{t}</b>', sH2)
def h3(t): return Paragraph(f'<b>{t}</b>', sH3)
def bd(t): return Paragraph(t, sBody)
def bl(t): return Paragraph(f'&#8226; {t}', sBul)
def sp(p=12): return Spacer(1,p)
def cap(t): return Paragraph(t, sCap)
def co(t): return Paragraph(t, sCO)
def cw(t): return Paragraph(t, sCW)
def cer(t): return Paragraph(t, sCEr)
def cok(t): return Paragraph(t, sCOK)
def dec(t): return Paragraph(t, sDec)
def ph(t): return Paragraph(t, sPh)
def code_block(title, code):
    els = [Paragraph(f'<b>{title}</b>', sSN)]
    for line in code.strip().split('\n'):
        escaped = line.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('  ','&nbsp;&nbsp;')
        els.append(Paragraph(escaped, sSA))
    els.append(sp(6)); return els

def mk_tbl(hds, rows, ratios=None):
    if not ratios:
        n=len(hds); ratios=[1.0/n]*n
    cw_=[r*CW for r in ratios]
    d=[[Paragraph(f'<b>{h}</b>',sHC) for h in hds]]
    for r in rows:
        d.append([Paragraph(str(c),sCL if len(str(c))>30 else sCE) for c in r])
    t=Table(d,colWidths=cw_,hAlign='CENTER')
    cmds=[('BACKGROUND',(0,0),(-1,0),HEADER_FILL),('TEXTCOLOR',(0,0),(-1,0),colors.white),
          ('GRID',(0,0),(-1,-1),0.5,BORDER),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
          ('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),
          ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]
    for i in range(1,len(d)):
        cmds.append(('BACKGROUND',(0,i),(-1,i),colors.white if i%2==1 else TABLE_STRIPE))
    t.setStyle(TableStyle(cmds)); return t

class TocDoc(SimpleDocTemplate):
    def afterFlowable(self, f):
        if hasattr(f,'bookmark_name'):
            l=getattr(f,'bookmark_level',0); t=getattr(f,'bookmark_text',''); k=getattr(f,'bookmark_key','')
            self.notify('TOCEntry',(l,t,self.page,k))

def ah(text, style, level=0):
    key='h_%s'%hashlib.md5(text.encode()).hexdigest()[:8]
    p=Paragraph(f'<a name="{key}"/>{text}',style)
    p.bookmark_name=text; p.bookmark_level=level
    p.bookmark_text=text.replace('<b>','').replace('</b>',''); p.bookmark_key=key
    return p

def am(text,style): return [CondPageBreak(CH*0.15), ah(f'<b>{text}</b>',style,level=0)]

doc=TocDoc(OUT,pagesize=A4,leftMargin=LM,rightMargin=RM,topMargin=TM,bottomMargin=BM,
    title="ZEHLA Blast — Plataforma WhatsApp de Envio em Massa",author="Z.ai",creator="Z.ai",
    subject="Pesquisa competitiva, arquitetura e implementacao")

story=[]

# TOC
story.append(Paragraph('<b>Sumario</b>',ParagraphStyle('TT',fontName='Carlito',fontSize=24,leading=30,textColor=HEADER_FILL,alignment=TA_LEFT,spaceAfter=18)))
toc=TableOfContents(); toc.levelStyles=[sTH1,sTH2]
story.append(toc); story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# 1. PESQUISA COMPETITIVA
# ═══════════════════════════════════════════════════════════════
story.extend(am('1. Pesquisa Competitiva — Anatomia dos Concorrentes', sH1))
story.append(bd(
    'Esta secao apresenta a anatomia detalhada das duas plataformas referenciais para envio de mensagens '
    'WhatsApp em massa no mercado brasileiro. A pesquisa foi conduzida via web scraping, analise de codigo '
    'fonte (Chrome Web Store, npm), documentacao de help center e conteudo de blogs. O objetivo e extrair '
    'os conceitos, workflows, tecnicas anti-ban e arquiteturas que serao adaptados para a ferramenta ZEHLA Blast.'
))

story.extend(am('1.1. WaSeller.com.br — Extensao Chrome', sH2))
story.append(bd(
    'WaSeller e uma extensao do Google Chrome que se sobrepoe ao WhatsApp Web transformando-o em uma '
    'ferramenta de CRM e vendas. NAO e um SaaS, NAO usa API oficial e NAO requer login externo. Toda a '
    'funcionalidade roda client-side via injecao de JavaScript no DOM do WhatsApp Web. Possui 100.000+ '
    'usuarios ativos e nota 4.8 estrelas na Chrome Web Store. O preco e R$ 397/ano para acesso ilimitado.'
))

ws_features = [
    ['Envio em Massa', 'Texto, audio, imagem, video, documentos', 'DOM manipulation'],
    ['Funil de Mensagem', 'Sequencias pre-construidas com 1 clique', 'Timer + DOM queue'],
    ['Chatbot Flows', 'Fluxos interativos com opcoes clicaveis', 'State machine client-side'],
    ['Auto-Responder', 'Respostas automaticas simples', 'Message listener + timer'],
    ['Agendamento', 'Mensagens programadas para horarios futuros', 'localStorage + setTimeout'],
    ['Import CSV', 'Contatos com higienizacao DDI/DDD', 'PapaParse client-side'],
    ['Kanban CRM', 'Pipeline visual de vendas no sidebar', 'Drag-drop injected UI'],
    ['Tags / Etiquetas', 'Segmentacao ilimitada de contatos', 'IndexedDB local'],
    ['Variaveis', '{nome}, {produto}, {oferta}, {data}', 'Template engine regex'],
    ['Quick Replies', 'Mensagens pre-salvas com 1 clique', 'Hotkey + DOM injection'],
    ['AI Assistant', 'Escrita, traducao, resumo', 'API call a LLM externo'],
    ['Webhook', 'Notificacoes para endpoints externos', 'fetch() POST premium'],
]
story.append(sp(8))
story.append(mk_tbl(['Feature', 'Descricao', 'Tecnologia'], ws_features, [0.22, 0.45, 0.33]))
story.append(cap('Tabela 1: Features completas do WaSeller'))

story.append(sp(6))
story.append(cw(
    '<b>WaSeller — Como funciona o envio em massa:</b> O fluxo e: (1) Importar CSV com contatos, '
    '(2) Higienizar DDI/DDD e mesclar duplicatas, (3) Compor mensagem com variaveis ({nome}, {produto}), '
    '(4) Definir lotes e horarios, (5) Enviar teste para 10-50 contatos, (6) Lancar campanha e monitorar '
    'taxa de resposta em tempo real. Tudo via DOM manipulation do WhatsApp Web.'
))

story.extend(am('1.2. Zap Responder — SaaS Dual-Mode', sH2))
story.append(bd(
    'Zap Responder e uma plataforma SaaS brasileira completa fundada por Afonso Martins. Centraliza '
    'WhatsApp, Instagram Direct e Facebook Messenger em um unico dashboard. Opera em DOIS modos de '
    'conexao: (A) QR Code via Baileys (gratuito, nao-oficial) e (B) Meta Official Cloud API (pago, '
    'compliant). Possui builder visual de chatbot, CRM completo, sistema de campanhas com throttling, '
    'agentes IA (SDR-RAG), e Chrome Extension. Possui pacote npm propio: @zapresponder/baileys v6.7.10.'
))

zr_features = [
    ['CRM + Leads', 'Pipeline completo com dashboard KPIs', 'Web app (Bubble.io)'],
    ['Campanhas em Massa', 'Wizard 3 passos com throttling completo', 'Baileys / Meta API'],
    ['Builder de Chatbot', 'Fluxos visuais com variaveis e handoff', 'Visual flow editor'],
    ['Agente IA (SDR-RAG)', 'Atendente virtual com RAG + base conhecimento', 'OpenAI + Dify'],
    ['Multi-Canal', 'WhatsApp + Instagram + Messenger unificados', 'Multi-adapter API'],
    ['Departamentos', 'Multi-numero com sessoes independentes', 'Instance isolation'],
    ['Agendamento', 'Dias, horarios min/max, delay aleatorio', 'Cron + BullMQ-like queue'],
    ['Import CSV', 'Contatos com grupos e segmentacao', 'Server-side parser'],
    ['Opt-out #sair', 'Contatos digitam #sair para sair', 'Message filter + DB flag'],
    ['Templates Meta', 'Templates aprovados pela Meta', 'Cloud API HSM'],
    ['Avaliacoes', 'Rating de satisfacao pos-atendimento', 'Collect + analytics'],
    ['Relatorios', 'Dashboards com metricas de performance', 'Chart.js / Recharts'],
]
story.append(sp(8))
story.append(mk_tbl(['Feature', 'Descricao', 'Tecnologia'], zr_features, [0.22, 0.45, 0.33]))
story.append(cap('Tabela 2: Features completas do Zap Responder'))

story.extend(am('1.3. Evolution API — Biblioteca Open-Source', sH2))
story.append(bd(
    'Evolution API e a plataforma open-source de referencia para integracao WhatsApp (Apache 2.0, '
    '6.8k stars no GitHub). Fornece uma REST API completa que abstrai a complexidade do protocolo '
    'WhatsApp Web via Baileys/Whatsmeow. Suporta multi-instancia (numeros ilimitados), webhooks '
    'em tempo real, integracoes com Typebot, Chatwoot, Dify, OpenAI e N8N. E a base tecnica '
    'recomendada para a implementacao do ZEHLA Blast, combinada com a Meta Official API para escala.'
))

evo_features = [
    ['REST API', 'Endpoints para todas as operacoes', 'Express.js (porta 8080)'],
    ['Multi-Instancia', 'Numeros ilimitados, isolamento total', 'Multi-tenant architecture'],
    ['Baileys + Whatsmeow', 'Conexao via WebSocket (QR ou pairing code)', 'Protocolo binario WA Web'],
    ['Cloud API Meta', 'Conexao oficial para producao', 'Meta Business API'],
    ['Webhooks', 'Receber mensagens, status, conexoes', 'HTTP POST + Kafka/RabbitMQ/SQS'],
    ['Media Storage', 'S3 ou Minio para imagens/docs', 'Pre-signed URLs'],
    ['Chatbot Builder', 'Typebot integration (visual no-code)', '/typebot/create/{instance}'],
    ['AI Agents', 'OpenAI Whisper + GPT + Dify', '/chat/ai/{instance}'],
    ['N8N Automation', 'Workflows visuais complexos', 'Webhook event stream'],
    ['Docker Deploy', 'docker-compose com tudo incluso', 'PostgreSQL + Redis + S3'],
]
story.append(sp(8))
story.append(mk_tbl(['Feature', 'Descricao', 'Tecnologia'], evo_features, [0.22, 0.45, 0.33]))
story.append(cap('Tabela 3: Features do Evolution API'))

story.extend(am('1.4. Comparativo dos Concorrentes', sH2))

comp_headers = ['Criterio', 'WaSeller', 'Zap Responder', 'Evolution API', 'ZEHLA Blast (plano)']
comp_rows = [
    ['Tipo', 'Chrome Extension', 'SaaS Plataforma', 'API Open-Source', 'Modulo Integrado'],
    ['Conexao WA', 'DOM (WhatsApp Web)', 'Baileys + Meta API', 'Baileys + Meta API', 'Evolution API + Meta'],
    ['Anti-Ban', 'Ritmo humano', 'Meta API + delays', 'Delays + limites', 'Warm-up + delays + opt-out'],
    ['CRM', 'Kanbas basico', 'Completo com KPIs', 'Nao (precisa Chatwoot)', 'ZEHLa LIS + Brain'],
    ['Chatbot', 'Flows simples', 'Visual builder + IA', 'Typebot + OpenAI', 'Flows + ZEHLA Brain IA'],
    ['Campanhas', 'Basico com CSV', 'Wizard 3 passos', 'API direta', 'Campanhas + LIS integration'],
    ['Multi-Numero', 'Nao (1 browser)', 'Sim (departamentos)', 'Sim (multi-instance)', 'Sim (rotation pool)'],
    ['Preco', 'R$ 397/ano', 'R$ 29-89/mes', 'Gratuito', 'Custo Zero (proprio)'],
    ['Codigo Aberto', 'Nao', 'Nao', 'Sim (Apache 2.0)', 'Sim (interno)'],
    ['Score Reclame Aqui', '6.6/10', 'N/A', 'N/A', 'N/A (novo)'],
]
story.append(sp(8))
story.append(mk_tbl(comp_headers, comp_rows, [0.14, 0.18, 0.18, 0.22, 0.28]))
story.append(cap('Tabela 4: Comparativo competitivo'))

# ═══════════════════════════════════════════════════════════════
# 2. TECNICAS ANTI-BAN
# ═══════════════════════════════════════════════════════════════
story.extend(am('2. Tecnicas Anti-Banimento — Manual Completo', sH1))

story.append(bd(
    'Esta secao consolida todas as tecnicas de protecao contra banimento identificadas na pesquisa '
    'dos dois concorrentes e da documentacao do Evolution API e Baileys. O WhatsApp bana cerca de 8 '
    'milhoes de contas por ano na India so (2025). As tecnicas abaixo reduzem drasticamente o risco '
    'mas nao o eliminam completamente. A unica forma 100% segura e usar a Meta Official API.'
))

story.extend(am('2.1. Protocolo de Aquecimento de Numero (Chip Warming)', sH2))
story.append(bd(
    'Numeros novos ou recem-conectados tem limites muito baixos. O protocolo de aquecimento gradual '
    'aumenta esses limites ao longo de 30-90 dias. O ZEHLA Blast implementara esse protocolo '
    'automaticamente, recusando-se a enviar acima do limite diario configurado para cada instancia.'
))

warmup = [
    ['Dias 1-3', '10-20 msgs/dia', 'Enviar para contatos conhecidos, trocar mensagens organicas'],
    ['Dias 4-7', '30-50 msgs/dia', 'Iniciar conversas bidirecionais, responder mensagens recebidas'],
    ['Dias 8-14', '50-100 msgs/dia', 'Primeiros envios de campanha, apenas contatos opt-in'],
    ['Dias 15-30', '100-200 msgs/dia', 'Campanhas maiores, monitorar taxa de bloqueio (< 2%)'],
    ['Dias 31-60', '200-400 msgs/dia', 'Operacao normal com throttling agressivo'],
    ['Dias 61-90', '400-800 msgs/dia', 'Operacao plena, delays de 20-30s entre mensagens'],
    ['90+ dias', '800-1000 msgs/dia', 'Limite maximo, manter monitoramento continuo'],
]
story.append(sp(8))
story.append(mk_tbl(['Periodo', 'Limite Diario', 'Orientacao'], warmup, [0.15, 0.20, 0.65]))
story.append(cap('Tabela 5: Protocolo de aquecimento de numero'))

story.extend(am('2.2. Tecnicas de Throttling e Ritmo Humano', sH2))
story.append(bd(
    'O throttling controla a velocidade de envio para simular comportamento humano. O ZEHLA Blast '
    'implementa multiplas camadas de throttling: delay por mensagem, delay por lote, pausa entre '
    'lotes, e jitter aleatorio. Cada camada e configuravel por campanha e por instancia.'
))
story.append(bl('<b>Delay por mensagem:</b> 20-60 segundos entre cada mensagem, com jitter de +0 a +30s aleatorio'))
story.append(bl('<b>Lotes:</b> 20-30 mensagens por lote, seguido de pausa de 10-15 minutos'))
story.append(bl('<b>Horarios:</b> Enviar apenas entre 08:00-20:00 no fuso horario do destinatario'))
story.append(bl('<b>Dias:</b> Segunda a sexta apenas ( Domingo nunca para campanhas frias)'))
story.append(bl('<b>Personalizacao:</b> Variar tom, tamanho e estrutura das mensagens'))
story.append(bl('<b>Bidirecionalidade:</b> Responder mensagens recebidas antes de enviar novas'))
story.append(bl('<b>Engajamento:</b> Se > 5% dos contatos bloqueiam, pausar imediatamente'))

story.extend(am('2.3. Sistema de Opt-Out e Compliance', sH2))
story.append(bd(
    'Todo lead que receber mensagens do ZEHLA Blast deve ter a opcao de sair a qualquer momento. '
    'O sistema implementa opt-out de 3 formas: (1) a mensagem inclui instrucoes claras de '
    'como parar ("responda SAIR"), (2) o ZEHLA Brain detecta a resposta e marca o lead como '
    'opted-out, e (3) o filtro de campanha exclui automaticamente contatos opted-out. Alem disso, '
    'todo contato importado deve ter registro de consentimento (data, fonte, metodo de opt-in).'
))

story.extend(am('2.4. Rotacao de Numeros e Pool de Instancias', sH2))
story.append(bd(
    'Para distribuir a carga e minimizar o risco, o ZEHLA Blast opera com um pool de instancias '
    'WhatsApp (3-5 numeros recomendados para 10.000 contatos). O sistema rotaciona automaticamente: '
    'cada instancia envia no maximo N mensagens por hora, depois o balanceador direciona para a '
    'proxima instancia. Se uma instancia recebe alerta do WhatsApp (qualidade baixando), ela e '
    'automaticamente pausada e as mensagens sao redistribuidas para as demais.'
))

# ═══════════════════════════════════════════════════════════════
# 3. ARQUITETURA ZEHLA BLAST
# ═══════════════════════════════════════════════════════════════
story.extend(am('3. Arquitetura do ZEHLA Blast', sH1))
story.append(bd(
    'O ZEHLA Blast e um modulo integrado ao ecossistema ZEHLA que combina as melhores praticas dos '
    'concorrentes pesquisados com a inteligencia do ZEHLA Brain e a gestao de leads do LIS. A arquitetura '
    'segue o principio de separacao de concerns: o Evolution API cuida da conexao WhatsApp, o ZEHLA Blast '
    'gerencia campanhas e throttling, e o ZEHLA Brain rastreia todas as interacoes para score e classificacao.'
))

story.extend(am('3.1. Diagrama de Arquitetura', sH2))

arch_text = """
  ┌─────────────────────────────────────────────────────────────┐
  │                     ZEHLA BLAST (Next.js)                     │
  │                                                               │
  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
  │  │ ZCC Dashboard│  │  Campanhas   │  │  Contact Manager    │ │
  │  │ (UI/React)   │  │  CRUD+Stats  │  │  CSV Import+Clean   │ │
  │  └──────┬───────┘  └──────┬───────┘  └─────────┬───────────┘ │
  │         │                 │                    │              │
  │  ┌──────▼─────────────────▼────────────────────▼───────────┐ │
  │  │               BLAST ENGINE                              │ │
  │  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │ │
  │  │  │Campaign │ │Throttler │ │Message   │ │ Instance   │ │ │
  │  │  │Manager  │ │(delay/   │ │Composer  │ │ Rotator    │ │ │
  │  │  │         │ │ batch)   │ │(vars/tpl)│ │            │ │ │
  │  │  └────┬────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘ │ │
  │  │       │           │            │             │         │ │
  │  │  ┌────▼───────────▼────────────▼─────────────▼──────┐ │ │
  │  │  │           BULLMQ QUEUE (Redis)                    │ │ │
  │  │  │    blast:send ──► blast:process ──► blast:track   │ │ │
  │  │  └────────────────────┬──────────────────────────────┘ │ │
  │  └───────────────────────┼────────────────────────────────┘ │
  └──────────────────────────┼──────────────────────────────────┘
                             │
                   ┌─────────▼──────────┐
                   │   EVOLUTION API    │
                   │  (Docker separado) │
                   │  ┌───┐ ┌───┐ ┌──┐ │
                   │  │ WA│ │ WA│ │ WA│ │  Pool de instancias
                   │  │ #1│ │ #2│ │ #3│ │
                   │  └───┘ └───┘ └───┘ │
                   │  REST API :8080    │
                   └─────────┬──────────┘
                             │
                             ▼
                    ┌────────────────┐     ┌────────────────┐
                    │   WhatsApp    │     │  ZEHLA BRAIN   │
                    │   Servers     │◄────│  (Pipeline     │
                    │               │     │   5 estagios)  │
                    └────────────────┘     │  Score + Class │
                                          │  Auto-actions  │
                                          └────────────────┘"""
story.extend(code_block('Arquitetura ZEHLA Blast', arch_text))

story.extend(am('3.2. Componentes do Sistema', sH2))

comp_arch = [
    ['ZCC Dashboard', 'Interface React com listagem de campanhas, metricas em tempo real e configuracoes de throttling', 'React + Recharts + Zustand'],
    ['Campaign Manager', 'CRUD de campanhas com status (rascunho, ativa, pausada, concluida), filtros e agendamento', 'Prisma + Next.js API Routes'],
    ['Contact Manager', 'Import CSV com higienizacao DDI/DDD, validacao, deduplicacao e segmentacao', 'PapaParse + Prisma'],
    ['Message Composer', 'Editor de templates com variaveis ({nome}, {pousada}, {cidade}), preview e teste', 'Template Engine + React'],
    ['Throttler Engine', 'Controle de ritmo: delay por msg, lote, pausa, jitter, horarios, dias', 'BullMQ + Redis + Cron'],
    ['BullMQ Queue', 'Filas para envio (blast:send), processamento (blast:process) e tracking (blast:track)', 'BullMQ + Redis'],
    ['Instance Rotator', 'Balanceamento de carga entre instancias WhatsApp (pool de 3-5 numeros)', 'Round-robin + health check'],
    ['Evolution API Client', 'Cliente REST para conexao WhatsApp via Baileys/Meta API', 'fetch + WebSocket'],
    ['Webhook Receiver', 'Recebe respostas dos leads e direciona para o ZEHLA Brain', 'Next.js API Route'],
    ['ZEHLA Brain Integration', 'Track de eventos (whatsapp_open, whatsapp_reply) para score e classificacao', 'BullMQ + Prisma'],
]
story.append(sp(8))
story.append(mk_tbl(['Componente', 'Descricao', 'Tecnologia'], comp_arch, [0.20, 0.50, 0.30]))
story.append(cap('Tabela 6: Componentes do ZEHLA Blast'))

# ═══════════════════════════════════════════════════════════════
# 4. PRISMA SCHEMA
# ═══════════════════════════════════════════════════════════════
story.extend(am('4. Prisma Schema — Modelos de Dados', sH1))
story.append(bd(
    'O schema do ZEHLA Blast adiciona 4 modelos ao Prisma existente: BlastCampaign (campanhas), '
    'BlastMessage (mensagens individuais), BlastInstance (instancias WhatsApp do pool), e '
    'BlastContact (contatos importados com consentimento). Esses modelos se integram com o Lead '
    'e Event existentes do ZEHLA LIS para rastreabilidade completa.'
))

schema_campaign = """
model BlastCampaign {
  id            String   @id @default(cuid())
  name          String                        // Nome da campanha
  status        String   @default("draft")
  // draft, scheduled, active, paused,
  // completed, failed

  // Content
  messageTemplate String                     // Template com {variaveis}
  mediaUrl      String?                      // Imagem/video/documento
  mediaType     String?                      // image, video, document, audio

  // Targeting
  contactGroup  String                       // Grupo de contatos
  totalContacts Int      @default(0)
  sentCount     Int      @default(0)
  deliveredCount Int     @default(0)
  readCount     Int      @default(0)
  repliedCount  Int      @default(0)
  failedCount   Int      @default(0)
  optedOutCount Int     @default(0)

  // Scheduling
  scheduledAt   DateTime?                    // Agendamento
  startedAt     DateTime?
  completedAt   DateTime?

  // Throttling config (JSON)
  config        Json?     // delayMsg, batchSize,
  // batchPause, jitter, hours, days

  // Instance pool
  instanceIds   String[]                     // IDs das instancias Evolution API

  // Relations
  messages      BlastMessage[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("blast_campaigns")
}"""
story.extend(code_block('prisma/schema.prisma — BlastCampaign', schema_campaign))

schema_message = """
model BlastMessage {
  id            String   @id @default(cuid())
  campaignId    String
  campaign      BlastCampaign @relation(
    fields: [campaignId], references: [id])

  contactPhone  String                       // 5511999999999
  contactName   String?
  leadId        String?                      // Link com Lead do LIS

  // Status pipeline
  status        String   @default("pending")
  // pending, queued, sent, delivered,
  // read, replied, failed, opted_out

  // Personalized content
  renderedMessage String?                    // Template preenchido
  mediaUrl      String?

  // Instance used
  instanceId    String?

  // Tracking
  sentAt        DateTime?
  deliveredAt   DateTime?
  readAt        DateTime?
  repliedAt     DateTime?
  failedReason  String?
  optedOutAt    DateTime?

  // ZEHLA Brain event tracking
  brainEventId  String?                      // Link com LeadEvent

  createdAt     DateTime @default(now())

  @@index([campaignId])
  @@index([status])
  @@index([contactPhone])
  @@map("blast_messages")
}"""
story.extend(code_block('prisma/schema.prisma — BlastMessage', schema_message))

schema_instance = """
model BlastInstance {
  id            String   @id @default(cuid())
  name          String                       // Nome amigavel
  phone         String                       // 5511999999999
  evolutionUrl  String                       // URL do Evolution API
  apiKey        String                       // API key da instancia
  instanceName  String                       // Nome no Evolution API
  status        String   @default("disconnected")
  // connected, disconnected, banned, paused

  // Warmup tracking
  createdAt     DateTime @default(now())     // Data de criacao
  warmupStage   Int      @default(0)         // Dias de aquecimento
  dailyLimit    Int      @default(20)        // Limite diario atual
  hourlyLimit   Int      @default(10)        // Limite por hora
  sentToday     Int      @default(0)         // Enviadas hoje
  sentThisHour  Int      @default(0)         // Enviadas esta hora

  // Health
  lastError     String?
  lastErrorAt   DateTime?
  bannedAt      DateTime?
  qualityScore  Float?                       // 0-1

  campaigns     BlastCampaign[]

  @@unique([phone])
  @@map("blast_instances")
}"""
story.extend(code_block('prisma/schema.prisma — BlastInstance', schema_instance))

schema_contact = """
model BlastContact {
  id            String   @id @default(cuid())
  phone         String                       // 5511999999999
  name          String?
  email         String?
  pousadaName   String?
  city          String?
  state         String?
  group         String   @default("geral")

  // Consent
  optIn         Boolean  @default(false)
  optInSource   String?                      // csv_import, form, manual
  optInDate     DateTime?
  optedOut      Boolean  @default(false)
  optedOutAt    DateTime?
  optedOutReason String?

  // Link with LIS
  leadId        String?                      // Link com Lead do LIS

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([phone])
  @@index([group])
  @@index([optedOut])
  @@map("blast_contacts")
}"""
story.extend(code_block('prisma/schema.prisma — BlastContact', schema_contact))

# ═══════════════════════════════════════════════════════════════
# 5. BLAST ENGINE — CORE
# ═══════════════════════════════════════════════════════════════
story.extend(am('5. Blast Engine — Core de Envio', sH1))
story.append(bd(
    'O Blast Engine e o nucleo da operacao. Ele gerencia a fila de envio via BullMQ, controla '
    'o throttling com delays e lotes, rotaciona entre instancias do pool, e integra com o '
    'ZEHLA Brain para tracking de todas as interacoes. A arquitetura usa 3 filas dedicadas: '
    'blast:send (enfileiramento), blast:process (envio real), e blast:track (pos-envio).'
))

story.extend(am('5.1. Evolution API Client', sH2))

evo_client = """
// lib/evolution-client.ts — Cliente Evolution API
import { BlastInstance } from '@prisma/client';

interface EvolutionMessage {
  number: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: string;
  delay?: number;
}

export class EvolutionClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(instance: BlastInstance) {
    this.baseUrl = instance.evolutionUrl;
    this.apiKey = instance.apiKey;
  }

  private async request(
    method: string, path: string, body?: any
  ) {
    const url = `${this.baseUrl}${path}`;
    const opts: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(
        `Evolution API ${res.status}: ${err}`
      );
    }
    return res.json();
  }

  async checkConnection(): Promise<boolean> {
    try {
      const data = await this.request(
        'GET',
        `/instance/connectionState/${this.instanceName}`
      );
      return data.state === 'connected';
    } catch { return false; }
  }

  async sendText(
    number: string, text: string, delay = 30
  ) {
    return this.request('POST',
      `/message/sendText/${this.instanceName}`, {
      number, text, delay
    });
  }

  async sendMedia(
    number: string,
    mediaUrl: string,
    mediaType: string,
    caption?: string,
    delay = 30
  ) {
    const endpoint = {
      image: 'sendImage',
      video: 'sendVideo',
      document: 'sendDocument',
      audio: 'sendAudio',
    }[mediaType] || 'sendImage';

    return this.request('POST',
      `/message/${endpoint}/${this.instanceName}`, {
      number, mediatype: mediaType,
      mediaUrl, caption, delay
    });
  }

  async getQrCode(): Promise<string> {
    const data = await this.request('GET',
      `/instance/connect/${this.instanceName}`);
    return data.base64;
  }
}"""
story.extend(code_block('lib/evolution-client.ts', evo_client))

story.extend(am('5.2. Blast Queue Setup', sH2))

blast_queues = """
// lib/blast-queues.ts — Filas BullMQ do Blast Engine
import { Queue, Worker, Job } from 'bullmq';
import { redis } from './redis';

export const blastSendQueue = new Queue(
  'blast:send', { connection: redis }
);
export const blastProcessQueue = new Queue(
  'blast:process', { connection: redis }
);
export const blastTrackQueue = new Queue(
  'blast:track', { connection: redis }
);

// Worker de envio (1 concurrent para respeitar delays)
export const blastProcessWorker = new Worker(
  'blast:process',
  async (job: Job) => {
    const { messageId, phoneNumber, content,
      instanceId, delay } = job.data;
    // ... send via Evolution API
    // ... wait delay ms
    // ... update message status
  },
  {
    connection: redis,
    concurrency: 1, // 1 por instancia
    limiter: { max: 30, duration: 3600000 },
    // 30 msgs por hora por instancia
  }
);"""
story.extend(code_block('lib/blast-queues.ts', blast_queues))

story.extend(am('5.3. Campaign Sender Service', sH2))

sender = """
// services/campaign-sender.ts
import { prisma } from '@/lib/prisma';
import { blastProcessQueue } from '@/lib/blast-queues';
import { EvolutionClient } from '@/lib/evolution-client';

export async function launchCampaign(
  campaignId: string
) {
  const campaign = await prisma.blastCampaign
    .findUniqueOrThrow({
      where: { id: campaignId },
      include: { messages: true },
    });

  // Config de throttling
  const config = campaign.config || {};
  const delayMsg = config.delayMsg || 30000; // 30s default
  const batchSize = config.batchSize || 25;
  const batchPause = config.batchPause || 600000; // 10 min
  const jitter = config.jitter || 15000; // 15s random

  // Buscar instancias ativas
  const instances = await prisma.blastInstance
    .findMany({
      where: { status: 'connected' },
    });

  if (instances.length === 0) {
    throw new Error('Nenhuma instancia conectada');
  }

  // Marcar campanha como ativa
  await prisma.blastCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'active',
      startedAt: new Date(),
    },
  });

  // Buscar mensagens pendentes
  const messages = await prisma.blastMessage
    .findMany({
      where: {
        campaignId,
        status: 'pending',
      },
      orderBy: { createdAt: 'asc' },
    });

  // Distribuir entre instancias (round-robin)
  let instanceIdx = 0;
  for (const msg of messages) {
    const instance = instances[
      instanceIdx % instances.length
    ];
    instanceIdx++;

    const actualDelay =
      delayMsg + Math.random() * jitter;

    await blastProcessQueue.add(
      'send-message', {
        messageId: msg.id,
        campaignId,
        phoneNumber: msg.contactPhone,
        content: {
          text: msg.renderedMessage,
          mediaUrl: msg.mediaUrl,
          mediaType: campaign.mediaType,
        },
        instanceId: instance.id,
        delay: actualDelay,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        delay: actualDelay, // BullMQ delay
      }
    );
  }

  console.log(
    `[Blast] Campanha ${campaign.name}: ` +
    `${messages.length} msgs enfileiradas ` +
    `em ${instances.length} instancias`
  );
}"""
story.extend(code_block('services/campaign-sender.ts', sender))

story.extend(am('5.4. ZEHLA Brain Integration (Tracking)', sH2))
story.append(bd(
    'Toda mensagem enviada pelo ZEHLA Blast gera eventos no ZEHLA Brain. Quando um lead responde '
    'a uma mensagem de campanha, o webhook receiver detecta a resposta, cria um LeadEvent do tipo '
    'whatsapp_reply (+30 pontos), e o pipeline de classificacao recalcula o score e cluster do lead. '
    'Isso permite que o Brain saiba exatamente quais leads estao engajando com as campanhas.'
))

brain_integration = """
// services/blast-brain-tracker.ts
// Toda mensagem enviada gera evento no ZEHLA Brain

import { prisma } from '@/lib/prisma';

export async function trackBlastEvent(data: {
  messageId: string;
  leadId: string;
  eventType: 'whatsapp_open' | 'whatsapp_reply';
  campaignId: string;
}) {
  // Criar evento no ZEHLA Brain pipeline
  await fetch('/api/events/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: '', // lookup by leadId
      eventType: data.eventType,
      eventSource: 'zehla_blast',
      metadata: {
        messageId: data.messageId,
        campaignId: data.campaignId,
        blastCampaign: true,
      },
    }),
  });

  // Atualizar mensagem
  await prisma.blastMessage.update({
    where: { id: data.messageId },
    data: {
      status: data.eventType === 'whatsapp_reply'
        ? 'replied'
        : 'delivered',
      repliedAt: data.eventType === 'whatsapp_reply'
        ? new Date()
        : undefined,
    },
  });

  // Atualizar contadores da campanha
  const field = data.eventType === 'whatsapp_reply'
    ? 'repliedCount' : 'deliveredCount';
  await prisma.blastCampaign.update({
    where: { id: data.campaignId },
    data: { [field]: { increment: 1 } },
  });
}"""
story.extend(code_block('services/blast-brain-tracker.ts', brain_integration))

# ═══════════════════════════════════════════════════════════════
# 6. API ROUTES
# ═══════════════════════════════════════════════════════════════
story.extend(am('6. API Routes — Endpoints do ZEHLA Blast', sH1))

api_routes_headers = ['Endpoint', 'Metodo', 'Funcao']
api_routes_rows = [
    ['/api/blast/campaigns', 'GET+POST', 'Listar e criar campanhas'],
    ['/api/blast/campaigns/[id]', 'GET+PATCH+DEL', 'Detalhe, atualizar e deletar campanha'],
    ['/api/blast/campaigns/[id]/launch', 'POST', 'Iniciar campanha (enfileirar envio)'],
    ['/api/blast/campaigns/[id]/pause', 'POST', 'Pausar campanha ativa'],
    ['/api/blast/campaigns/[id]/resume', 'POST', 'Retomar campanha pausada'],
    ['/api/blast/contacts', 'GET+POST', 'Listar e adicionar contatos'],
    ['/api/blast/contacts/import', 'POST', 'Import CSV (multipart form)'],
    ['/api/blast/contacts/export', 'GET', 'Exportar contatos (CSV)'],
    ['/api/blast/instances', 'GET+POST', 'Listar e registrar instancias'],
    ['/api/blast/instances/[id]/qr', 'GET', 'Obter QR code para conexao'],
    ['/api/blast/instances/[id]/status', 'GET', 'Verificar status da instancia'],
    ['/api/blast/webhook', 'POST', 'Webhook receiver (respostas dos leads)'],
    ['/api/blast/templates', 'GET+POST', 'Listar e criar templates de mensagem'],
    ['/api/blast/stats', 'GET', 'Metricas gerais (enviadas, lidas, respondidas)'],
    ['/api/blast/health', 'GET', 'Health check do sistema Blast'],
]
story.append(sp(8))
story.append(mk_tbl(api_routes_headers, api_routes_rows, [0.40, 0.15, 0.45]))
story.append(cap('Tabela 7: Endpoints API do ZEHLA Blast'))

# ═══════════════════════════════════════════════════════════════
# 7. DEPLOY
# ═══════════════════════════════════════════════════════════════
story.extend(am('7. Deploy — Docker Compose Completo', sH1))
story.append(bd(
    'O deploy do ZEHLA Blast requer dois componentes: o Evolution API (Docker separado) e o '
    'modulo integrado ao projeto Next.js. O docker-compose abaixo provisiona tudo automaticamente: '
    'Evolution API com PostgreSQL e Redis, o servidor Next.js, e o BullMQ Board para monitoramento '
    'visual das filas em tempo real.'
))

docker = """
# docker-compose.yml — ZEHLA Blast + Evolution API
version: '3.8'

services:
  # Evolution API (WhatsApp connection)
  evolution-api:
    image: atendai/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      - SERVER_PORT=8080
      - DATABASE_TYPE=postgresql
      - DATABASE_URL=postgresql://evo:evo_pass@postgres-evo:5432/evolution
      - JWT_SECRET=${JWT_SECRET}
      - WHATSAPP_TYPE=baileys
      - TYPEBOT_ENABLED=false
      - CHATWOOT_ENABLED=false
    depends_on:
      - postgres-evo
    restart: unless-stopped

  postgres-evo:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: evo
      POSTGRES_PASSWORD: evo_pass
      POSTGRES_DB: evolution
    volumes:
      - evo_data:/var/lib/postgresql/data

  # ZEHLA Next.js App
  smarthotel:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://zehla:zehla_pass@postgres:5432/zehla_db
      - REDIS_URL=redis://redis:6379
      - EVOLUTION_API_URL=http://evolution-api:8080
      - EVOLUTION_API_KEY=${EVO_API_KEY}
    depends_on:
      - postgres
      - redis
      - evolution-api
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: zehla
      POSTGRES_PASSWORD: zehla_pass
      POSTGRES_DB: zehla_db
    volumes:
      - zehla_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: >
      redis-server
      --appendonly yes
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data

  bullmq-board:
    image: dockersamples/bullmq-board
    ports:
      - "3001:3000"
    environment:
      - REDIS_HOST=redis
    depends_on:
      - redis

volumes:
  evo_data:
  zehla_data:
  redis_data:"""
story.extend(code_block('docker-compose.yml', docker))

# ═══════════════════════════════════════════════════════════════
# 8. FLUXO COMPLETO
# ═══════════════════════════════════════════════════════════════
story.extend(am('8. Fluxo Completo End-to-End', sH1))
story.append(bd(
    'O fluxo abaixo descreve o ciclo completo de uma campanha de envio em massa, desde a importacao '
    'dos contatos ate a classificacao automatica dos leads que responderam pelo ZEHLA Brain.'
))

flow_headers = ['Etapa', 'Acao', 'Sistema']
flow_rows = [
    ['1', 'Importar CSV com 10.000 contatos de pousadas', 'Contact Manager'],
    ['2', 'Higienizar DDI/DDD, deduplicar, segmentar por UF', 'Contact Manager'],
    ['3', 'Criar campanha com template + variaveis', 'Campaign Manager'],
    ['4', 'Configurar throttling (delay 30s, lote 25, pausa 10min)', 'Throttler'],
    ['5', 'Conectar 3-5 instancias WhatsApp via QR Code', 'Evolution API'],
    ['6', 'Verificar aquecimento dos numeros (verificar warmup stage)', 'Instance Manager'],
    ['7', 'Enviar teste para 10 contatos selecionados', 'Blast Engine'],
    ['8', 'Lancar campanha (enfileirar 10.000 mensagens)', 'BullMQ Queue'],
    ['9', 'Blast Process Worker envia msg por msg com delay', 'Worker + Evolution API'],
    ['10', 'Rotacionar entre instancias (round-robin)', 'Instance Rotator'],
    ['11', 'Lead recebe mensagem e abre WhatsApp', 'WhatsApp + Webhook'],
    ['12', 'Webhook detecta abertura -> whatsapp_open (+25 pts)', 'ZEHLA Brain'],
    ['13', 'Lead responde -> whatsapp_reply (+30 pts)', 'ZEHLA Brain'],
    ['14', 'Score sobe para 55 -> cluster muda para WARM', 'Score Engine'],
    ['15', 'Brain dispara: email nurture + alerta vendas', 'Action Dispatcher'],
    ['16', 'Vendedor recebe alerta e entra em contato', 'WhatsApp + ZCC'],
    ['17', 'Lead faz trial -> trial_started (+50 pts)', 'Funil de vendas'],
    ['18', 'Lead vira cliente HOT -> conversao concluida', 'SMARTHOTEL'],
]
story.append(sp(8))
story.append(mk_tbl(flow_headers, flow_rows, [0.06, 0.58, 0.36]))
story.append(cap('Tabela 8: Fluxo completo de campanha ZEHLA Blast'))

# ═══════════════════════════════════════════════════════════════
# 9. ZCC DASHBOARD
# ═══════════════════════════════════════════════════════════════
story.extend(am('9. ZCC Dashboard — Interface do Blast', sH1))
story.append(bd(
    'O modulo ZEHLA Blast sera integrado ao ZCC (Zehla Central Control) existente como uma nova '
    'secao lateral. O dashboard inclui: listagem de campanhas com KPIs em tempo real (enviadas, '
    'entregues, leituras, respostas, falhas), grafico de engajamento por campanha, status das '
    'instancias WhatsApp (conectadas/desconectadas/banidas), gerenciador de contatos com importacao '
    'CSV, editor de templates com preview, e painel de metricas consolidadas do ZEHLA Brain '
    'mostrando como as campanhas impactaram o score e cluster dos leads.'
))

dash_headers = ['Widget', 'Tipo', 'Dados']
dash_rows = [
    ['KPI Cards', '4 cartoes', 'Total enviadas, entregues, leituras, respostas'],
    ['Campaign List', 'Tabela interativa', 'Nome, status, progresso, acoes (pause/resume/delete)'],
    ['Engagement Chart', 'Grafico de barras', 'Respostas por campanha (Recharts)'],
    ['Instance Health', 'Status badges', 'Verde (OK), Amarelo (warning), Vermelho (banned)'],
    ['Contact Manager', 'Tabela + filtro', 'Listagem, grupos, import CSV, export'],
    ['Template Editor', 'Editor de texto', 'Variaveis, preview, teste em tempo real'],
    ['Brain Impact', 'Cards + mini-chart', 'Leads WARM/HOT gerados por campanha'],
    ['Activity Feed', 'Timeline', 'Eventos recentes: envio, resposta, opt-out, alerta'],
]
story.append(sp(8))
story.append(mk_tbl(dash_headers, dash_rows, [0.22, 0.22, 0.56]))
story.append(cap('Tabela 9: Widgets do Dashboard ZEHLA Blast no ZCC'))

# ═══════════════════════════════════════════════════════════════
# 10. ESTRUTURA DE ARQUIVOS
# ═══════════════════════════════════════════════════════════════
story.extend(am('10. Estrutura de Arquivos — Modulo Blast', sH1))

file_headers = ['Arquivo', 'Tipo', 'Descricao']
file_rows = [
    ['prisma/schema.prisma', 'MODIFY', 'Adicionar BlastCampaign, BlastMessage, BlastInstance, BlastContact'],
    ['lib/evolution-client.ts', 'NOVO', 'Cliente REST para Evolution API (envio, QR, status)'],
    ['lib/blast-queues.ts', 'NOVO', '3 filas BullMQ: blast:send, blast:process, blast:track'],
    ['services/campaign-sender.ts', 'NOVO', 'Lancar campanha, enfileirar mensagens, rotacionar instancias'],
    ['services/contact-importer.ts', 'NOVO', 'Import CSV, higienizar DDI/DDD, deduplicar'],
    ['services/message-composer.ts', 'NOVO', 'Preencher templates com variaveis do contato'],
    ['services/blast-brain-tracker.ts', 'NOVO', 'Tracking de eventos no ZEHLA Brain (LIS)'],
    ['services/instance-manager.ts', 'NOVO', 'Gerenciar pool de instancias, warmup, health check'],
    ['services/throttler.ts', 'NOVO', 'Calculo de delays, lotes, pausas e horarios'],
    ['app/api/blast/campaigns/route.ts', 'NOVO', 'CRUD de campanhas + metricas'],
    ['app/api/blast/contacts/route.ts', 'NOVO', 'CRUD de contatos + import/export'],
    ['app/api/blast/instances/route.ts', 'NOVO', 'Registro e gerenciamento de instancias'],
    ['app/api/blast/webhook/route.ts', 'NOVO', 'Receber respostas do WhatsApp via Evolution API'],
    ['app/blast/page.tsx', 'NOVO', 'Dashboard principal do Blast no ZCC'],
    ['app/blast/campaigns/[id]/page.tsx', 'NOVO', 'Detalhe da campanha com metricas'],
    ['app/blast/contacts/page.tsx', 'NOVO', 'Gerenciador de contatos'],
    ['app/blast/templates/page.tsx', 'NOVO', 'Editor de templates'],
    ['docker-compose.yml', 'MODIFY', 'Adicionar Evolution API + postgres-evo'],
]
story.append(sp(8))
story.append(mk_tbl(file_headers, file_rows, [0.42, 0.10, 0.48]))
story.append(cap('Tabela 10: Estrutura completa do modulo ZEHLA Blast'))

# ═══════════════════════════════════════════════════════════════
# 11. VARIAS TECNICAS
# ═══════════════════════════════════════════════════════════════
story.extend(am('11. Varias Tecnicas Recomendadas', sH1))
story.append(bd(
    'Apos a analise dos concorrentes e da documentacao do Evolution API, as seguintes variacoes '
    'tecnicas sao recomendadas para maximizar a efetividade e seguranca da ferramenta ZEHLA Blast. '
    'Essas variacoes foram identificadas como diferenciais competitivos dos concorrentes e devem '
    'ser consideradas na roadmap de implementacao.'
))

vars_headers = ['Variacao', 'Prioridade', 'Descricao']
vars_rows = [
    ['Meta Official API', 'ALTA', 'Adicionar suporte a Cloud API da Meta para envio compliant sem risco de banimento. Ideal para escala acima de 1.000 contatos/dia.'],
    ['Sequencias de Mensagem', 'ALTA', 'Funis de mensagem (estilo WaSeller): pre-configurar sequencias de 3-5 msgs que sao disparadas em intervalos ao longo de dias.'],
    ['Agente IA (SDR-RAG)', 'MEDIA', 'Usar o ZEHLA Brain como agente IA de vendas: quando um lead responde, o Brain gera resposta contextual com base na pousada e no historico.'],
    ['Typebot Integration', 'MEDIA', 'Integrar Typebot via Evolution API para criar fluxos conversacionais interativos com opcoes clicaveis (botoes e listas).'],
    ['Multi-Canal', 'BAIXA', 'Expandir para Instagram Direct e Facebook Messenger via Evolution API, centralizando todos os canais no ZCC.'],
    ['Gravacao de Audio IA', 'BAIXA', 'Gerar mensagens de audio com voz sintetica (ElevenLabs/OpenAI TTS) para campanhas de voz, mais pessoais que texto.'],
    ['A/B Testing', 'MEDIA', 'Criar variantes de mensagem e testar qual gera mais respostas. Rastrear qual template converte melhor por segmento.'],
    ['Warm-up Automatico', 'ALTA', 'O sistema automaticamente limita envios baseado na idade da instancia (protocolo da Tabela 5) sem intervencao manual.'],
]
story.append(sp(8))
story.append(mk_tbl(vars_headers, vars_rows, [0.25, 0.12, 0.63]))
story.append(cap('Tabela 11: Variacoes tecnicas recomendadas'))

story.append(sp(12))
story.append(cok(
    '<b>Vantagem Competitiva do ZEHLA Blast:</b> Diferente do WaSeller (extensao limitada) e do '
    'Zap Responder (SaaS terceirizado), o ZEHLA Blast e proprietario, integrado ao ZEHLA Brain '
    '(pipeline de 5 estagios com scoring automatico), e usa o Evolution API open-source como '
    'base. Isso elimina custos mensais de SaaS, garante controle total dos dados, e fornece '
    'inteligencia de vendas que nenhum concorrente oferece: cada resposta de lead automaticamente '
    'alimenta o score, classificacao e acoes do ZEHLA Brain, criando um ciclo virtuoso de '
    'conversao que vai do primeiro contato a venda fechada.'
))

# BUILD
print("Construindo PDF...")
doc.multiBuild(story)
print(f"PDF gerado: {OUT}")
