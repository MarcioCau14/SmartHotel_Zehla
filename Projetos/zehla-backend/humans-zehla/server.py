"""
ZEHLA Brain — HERMES Engine Server
====================================
Servidor FastAPI que empacota o HERMES AGENT como backend
para o Cérebro ZEHLA. Accessível via API REST pelo Next.js.

Uso:
    pip install fastapi uvicorn openai python-dotenv pydantic
    python server.py
    
    O servidor rodará em http://localhost:8000
"""

import os
import sys
import json
import uuid
import time
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

# ============================================================
# CONFIGURAÇÃO
# ============================================================

from dotenv import load_dotenv
load_dotenv()

HERMES_API_KEY = os.getenv("HERMES_API_KEY", "zehla-brain-secret-2026")
HERMES_MODEL = os.getenv("HERMES_MODEL", "openrouter/anthropic/claude-sonnet-4")
HERMES_BASE_URL = os.getenv("HERMES_BASE_URL", "https://openrouter.ai/api/v1")
HERMES_API_KEY_LLM = os.getenv("OPENROUTER_API_KEY", "")
PORT = int(os.getenv("HERMES_PORT", "8000"))
MAX_ITERATIONS = int(os.getenv("HERMES_MAX_ITERATIONS", "30"))
AGENT_TIMEOUT = int(os.getenv("HERMES_TIMEOUT", "120"))  # seconds
MAX_SESSIONS = int(os.getenv("HERMES_MAX_SESSIONS", "100"))

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("zehla-brain")

# ============================================================
# DEPENDÊNCIAS (com fallback)
# ============================================================

try:
    from fastapi import FastAPI, Header, HTTPException, Depends
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    from pydantic import BaseModel, Field
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    logger.warning("FastAPI não instalado. Execute: pip install fastapi uvicorn")

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("openai não instalado. Execute: pip install openai")

# ============================================================
# MODELOS DE DADOS
# ============================================================

if FASTAPI_AVAILABLE:
    class ChatRequest(BaseModel):
        message: str
        session_id: Optional[str] = None
        pousada_id: Optional[str] = None
        context: Optional[str] = "zehla_brain"
        tools: Optional[List[str]] = None
        system_prompt: Optional[str] = None
        stream: bool = False

    class ChatResponse(BaseModel):
        session_id: str
        response: str
        model: str
        tokens_used: Optional[int] = None
        tools_called: Optional[List[str]] = None
        timestamp: str

    class SessionInfo(BaseModel):
        session_id: str
        pousada_id: Optional[str]
        created_at: str
        message_count: int
        last_activity: str

    class SkillRequest(BaseModel):
        name: str
        content: str
        tags: List[str] = []
        category: str = "general"

    class SkillResponse(BaseModel):
        skill_id: str
        name: str
        created_at: str
        status: str

    class PricingAnalysisRequest(BaseModel):
        pousada_id: str
        periodo: str
        current_prices: Dict[str, float]
        occupancy_data: Optional[List[Dict]] = None

    class CronJobRequest(BaseModel):
        name: str
        schedule: str  # cron expression
        task: str
        pousada_id: Optional[str] = None
        active: bool = True

# ============================================================
# MEMÓRIA PERSISTENTE (SQLite)
# ============================================================

import sqlite3
import threading

class ZehlaMemory:
    """Memória persistente baseada em SQLite com FTS5."""
    
    def __init__(self, db_path: str = "zehla_brain.db"):
        self.db_path = db_path
        self._local = threading.local()
        self._init_db()
    
    def _get_conn(self):
        if not hasattr(self._local, 'conn'):
            self._local.conn = sqlite3.connect(self.db_path)
            self._local.conn.row_factory = sqlite3.Row
        return self._local.conn
    
    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Sessões
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                pousada_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                message_count INTEGER DEFAULT 0,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT DEFAULT '{}'
            )
        """)
        
        # Mensagens
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                role TEXT CHECK(role IN ('system', 'user', 'assistant', 'tool')),
                content TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tokens INTEGER DEFAULT 0,
                metadata TEXT DEFAULT '{}',
                FOREIGN KEY (session_id) REFERENCES sessions(session_id)
            )
        """)
        
        # Skills
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                skill_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                tags TEXT DEFAULT '[]',
                success_count INTEGER DEFAULT 0,
                failure_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active INTEGER DEFAULT 1
            )
        """)
        
        # FTS5 para busca full-text
        cursor.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS skills_fts USING fts5(
                skill_id, name, content, category, tags,
                content='skills', content_rowid='rowid'
            )
        """)
        
        # Perfil de pousadas (Honcho-style)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pousada_profiles (
                pousada_id TEXT PRIMARY KEY,
                nome TEXT,
                localizacao TEXT,
                tipo TEXT DEFAULT 'pousada',
                estilo_gestao TEXT DEFAULT 'balanced',
                preferencias TEXT DEFAULT '{}',
                metricas_historicas TEXT DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Cron jobs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cron_jobs (
                job_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                schedule TEXT NOT NULL,
                task TEXT NOT NULL,
                pousada_id TEXT,
                active INTEGER DEFAULT 1,
                last_run TIMESTAMP,
                next_run TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Logs de decisões
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                pousada_id TEXT,
                decision_type TEXT,
                input_data TEXT,
                output_data TEXT,
                confidence REAL DEFAULT 0.0,
                outcome TEXT,  -- 'positive', 'negative', 'pending'
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("Banco de dados ZEHLA Brain inicializado")
    
    def save_session(self, session_id: str, pousada_id: str = None) -> bool:
        try:
            conn = self._get_conn()
            conn.execute(
                "INSERT OR REPLACE INTO sessions (session_id, pousada_id) VALUES (?, ?)",
                (session_id, pousada_id)
            )
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Erro ao salvar sessão: {e}")
            return False
    
    def save_message(self, session_id: str, role: str, content: str, tokens: int = 0):
        try:
            conn = self._get_conn()
            conn.execute(
                "INSERT INTO messages (session_id, role, content, tokens) VALUES (?, ?, ?, ?)",
                (session_id, role, content, tokens)
            )
            conn.execute(
                "UPDATE sessions SET message_count = message_count + 1, last_activity = CURRENT_TIMESTAMP WHERE session_id = ?",
                (session_id,)
            )
            conn.commit()
        except Exception as e:
            logger.error(f"Erro ao salvar mensagem: {e}")
    
    def get_session_history(self, session_id: str, limit: int = 50) -> list:
        try:
            conn = self._get_conn()
            rows = conn.execute(
                "SELECT role, content FROM messages WHERE session_id = ? ORDER BY id DESC LIMIT ?",
                (session_id, limit)
            ).fetchall()
            return [{"role": r["role"], "content": r["content"]} for r in reversed(rows)]
        except Exception as e:
            logger.error(f"Erro ao buscar histórico: {e}")
            return []
    
    def save_skill(self, skill_id: str, name: str, content: str, 
                   category: str = "general", tags: list = None):
        try:
            conn = self._get_conn()
            tags_json = json.dumps(tags or [])
            conn.execute(
                """INSERT OR REPLACE INTO skills (skill_id, name, content, category, tags)
                   VALUES (?, ?, ?, ?, ?)""",
                (skill_id, name, content, category, tags_json)
            )
            conn.execute(
                """INSERT INTO skills_fts (skill_id, name, content, category, tags)
                   VALUES (?, ?, ?, ?, ?)""",
                (skill_id, name, content, category, tags_json)
            )
            conn.commit()
            logger.info(f"Skill salva: {name} ({skill_id})")
            return True
        except Exception as e:
            logger.error(f"Erro ao salvar skill: {e}")
            return False
    
    def search_skills(self, query: str, limit: int = 5) -> list:
        try:
            conn = self._get_conn()
            rows = conn.execute(
                """SELECT s.* FROM skills s 
                   JOIN skills_fts f ON s.skill_id = f.skill_id
                   WHERE skills_fts MATCH ? ORDER BY rank LIMIT ?""",
                (query, limit)
            ).fetchall()
            return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Erro ao buscar skills: {e}")
            return []
    
    def get_active_sessions(self) -> list:
        try:
            conn = self._get_conn()
            cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()
            rows = conn.execute(
                "SELECT * FROM sessions WHERE last_activity > ? ORDER BY last_activity DESC",
                (cutoff,)
            ).fetchall()
            return [dict(r) for r in rows]
        except:
            return []
    
    def save_decision(self, session_id: str, pousada_id: str, 
                      decision_type: str, input_data: dict, output_data: dict,
                      confidence: float = 0.0):
        try:
            conn = self._get_conn()
            conn.execute(
                """INSERT INTO decisions (session_id, pousada_id, decision_type, 
                   input_data, output_data, confidence)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (session_id, pousada_id, decision_type,
                 json.dumps(input_data), json.dumps(output_data), confidence)
            )
            conn.commit()
        except Exception as e:
            logger.error(f"Erro ao salvar decisão: {e}")
    
    def get_pousada_profile(self, pousada_id: str) -> Optional[dict]:
        try:
            conn = self._get_conn()
            row = conn.execute(
                "SELECT * FROM pousada_profiles WHERE pousada_id = ?",
                (pousada_id,)
            ).fetchone()
            return dict(row) if row else None
        except:
            return None
    
    def cleanup_old_sessions(self, days: int = 7):
        try:
            conn = self._get_conn()
            cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
            conn.execute(
                "DELETE FROM messages WHERE session_id IN (SELECT session_id FROM sessions WHERE last_activity < ?)",
                (cutoff,)
            )
            conn.execute(
                "DELETE FROM sessions WHERE last_activity < ?",
                (cutoff,)
            )
            conn.commit()
            logger.info(f"Sessões com >{days} dias removidas")
        except Exception as e:
            logger.error(f"Erro no cleanup: {e}")

# ============================================================
# ZEHLA TOOLS (Ferramentas customizadas)
# ============================================================

class ZehlaTools:
    """Ferramentas customizadas para o domínio de hospitalidade brasileira."""
    
    def __init__(self, memory: ZehlaMemory):
        self.memory = memory
        self.tools = self._define_tools()
    
    def _define_tools(self) -> list:
        """Define as ferramentas disponíveis no formato OpenAI function calling."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "zehla_analisar_ocupacao",
                    "description": "Analisa a taxa de ocupação de uma pousada e identifica tendências.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pousada_id": {"type": "string", "description": "ID da pousada"},
                            "periodo": {"type": "string", "description": "Período para análise (ex: 2026-05)"},
                            "incluir_comparacao": {"type": "boolean", "default": True, "description": "Incluir comparação com período anterior"}
                        },
                        "required": ["pousada_id", "periodo"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "zehla_sugerir_preco",
                    "description": "Sugere preço ótimo baseado em ocupação, sazonalidade e concorrência.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pousada_id": {"type": "string"},
                            "tipo_quarto": {"type": "string", "description": "Tipo do quarto (standard, deluxe, suite)"},
                            "data_checkin": {"type": "string", "description": "Data de check-in (YYYY-MM-DD)"},
                            "data_checkout": {"type": "string", "description": "Data de check-out (YYYY-MM-DD)"},
                            "ocupacao_atual": {"type": "number", "description": "Ocupação atual em %"}
                        },
                        "required": ["pousada_id", "tipo_quarto", "data_checkin", "data_checkout"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "zehla_gerar_resposta_hospede",
                    "description": "Gera resposta personalizada para hóspede via WhatsApp com base no perfil da pousada.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pousada_id": {"type": "string"},
                            "pergunta_hospede": {"type": "string"},
                            "canal": {"type": "string", "enum": ["whatsapp", "telegram", "email"], "default": "whatsapp"},
                            "tom": {"type": "string", "enum": ["formal", "casual", "amigavel"], "default": "casual"}
                        },
                        "required": ["pousada_id", "pergunta_hospede"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "zehla_analisar_reviews",
                    "description": "Analisa reviews de Google/Booking para extrair insights e sentimentos.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pousada_id": {"type": "string"},
                            "plataforma": {"type": "string", "enum": ["google", "booking", "airbnb", "todas"], "default": "todas"},
                            "periodo": {"type": "string", "description": "Período (ex: últimos-30-dias)"}
                        },
                        "required": ["pousada_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "zehla_criar_conteudo_marketing",
                    "description": "Cria conteúdo de marketing para redes sociais da pousada.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pousada_id": {"type": "string"},
                            "tipo_conteudo": {"type": "string", "enum": ["instagram_post", "instagram_story", "facebook_post", "tiktok_script", "newsletter"], "default": "instagram_post"},
                            "tema": {"type": "string", "description": "Tema do conteúdo (ex: feriado, promoção, experiência)"},
                            "hashtag_customizadas": {"type": "array", "items": {"type": "string"}}
                        },
                        "required": ["pousada_id", "tipo_conteudo"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "zehla_gerar_relatorio_diario",
                    "description": "Gera relatório operacional diário da pousada com métricas-chave.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pousada_id": {"type": "string"},
                            "data": {"type": "string", "description": "Data do relatório (YYYY-MM-DD), default: hoje"},
                            "incluir_previsao": {"type": "boolean", "default": True}
                        },
                        "required": ["pousada_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "zehla_monitorar_concorrentes",
                    "description": "Monitora preços e disponibilidade de concorrentes na mesma região.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pousada_id": {"type": "string"},
                            "raio_km": {"type": "number", "default": 10, "description": "Raio de busca em km"},
                            "incluir_airbnb": {"type": "boolean", "default": True},
                            "incluir_booking": {"type": "boolean", "default": True}
                        },
                        "required": ["pousada_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "zehla_salvar_skill",
                    "description": "Salva um novo skill aprendido na memória do ZEHLA Brain.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "nome": {"type": "string"},
                            "conteudo": {"type": "string"},
                            "categoria": {"type": "string", "enum": ["revenue", "atendimento", "marketing", "operacional", "competitivo"]},
                            "tags": {"type": "array", "items": {"type": "string"}}
                        },
                        "required": ["nome", "conteudo", "categoria"]
                    }
                }
            }
        ]
    
    def execute_tool(self, tool_name: str, args: dict, session_id: str = None) -> str:
        """Executa uma ferramenta ZEHLA e retorna o resultado."""
        
        if tool_name == "zehla_analisar_ocupacao":
            return self._analisar_ocupacao(args)
        elif tool_name == "zehla_sugerir_preco":
            return self._sugerir_preco(args)
        elif tool_name == "zehla_gerar_resposta_hospede":
            return self._gerar_resposta_hospede(args)
        elif tool_name == "zehla_analisar_reviews":
            return self._analisar_reviews(args)
        elif tool_name == "zehla_criar_conteudo_marketing":
            return self._criar_conteudo_marketing(args)
        elif tool_name == "zehla_gerar_relatorio_diario":
            return self._gerar_relatorio_diario(args)
        elif tool_name == "zehla_monitorar_concorrentes":
            return self._monitorar_concorrentes(args)
        elif tool_name == "zehla_salvar_skill":
            return self._salvar_skill(args, session_id)
        else:
            return json.dumps({"error": f"Ferramenta desconhecida: {tool_name}"})
    
    def _analisar_ocupacao(self, args: dict) -> str:
        """Análise de ocupação com dados simulados/dados reais do DB."""
        pousada_id = args.get("pousada_id", "unknown")
        periodo = args.get("periodo", "2026-05")
        
        # TODO: Integrar com dados reais do Neon PostgreSQL
        # Aqui retornamos análise estruturada para o LLM trabalhar
        profile = self.memory.get_pousada_profile(pousada_id)
        
        return json.dumps({
            "pousada_id": pousada_id,
            "periodo": periodo,
            "ocupacao_media": 0.62,  # 62% - substituir por dados reais
            "ocupacao_anterior": 0.58,
            "variacao_percentual": 6.9,
            "tendencia": "crescente",
            "dias_mais_ocupados": ["sexta", "sabado"],
            "dias_menos_ocupados": ["terca", "quarta"],
            "recomendacao": "A ocupação está crescendo 6.9% vs período anterior. Considerar aumentar preços nos fins de semana.",
            "alertas": [
                "Terça e quarta com ocupação abaixo de 50% - considerar promoções"
            ],
            "status": "dados_simulados"  # Mudar para "dados_reais" quando integrado
        }, ensure_ascii=False)
    
    def _sugerir_preco(self, args: dict) -> str:
        """Sugestão de preço baseada em fatores múltiplos."""
        ocupacao = args.get("ocupacao_atual", 0.6)
        tipo = args.get("tipo_quarto", "standard")
        
        # Lógica de pricing simplificada
        base_prices = {"standard": 250, "deluxe": 380, "suite": 520}
        base = base_prices.get(tipo, 250)
        
        # Multiplicadores sazonais
        multiplicador = 1.0
        if ocupacao > 0.8:
            multiplicador = 1.25  # Alta demanda
        elif ocupacao > 0.6:
            multiplicador = 1.10  # Demanda moderada
        elif ocupacao < 0.4:
            multiplicador = 0.85  # Baixa demanda - promoção
        
        preco_sugerido = round(base * multiplicador, 2)
        
        return json.dumps({
            "tipo_quarto": tipo,
            "preco_base": base,
            "multiplicador": multiplicador,
            "preco_sugerido": preco_sugerido,
            "faixa_minima": round(preco_sugerido * 0.9, 2),
            "faixa_maxima": round(preco_sugerido * 1.15, 2),
            "ocupacao_referencia": ocupacao,
            "justificativa": f"Ocupação de {ocupacao*100:.0f}% sugere {'alta' if ocupacao > 0.7 else 'moderada' if ocupacao > 0.5 else 'baixa'} demanda. Preço ajustado em {multiplicador:.0%}.",
            "status": "dados_simulados"
        }, ensure_ascii=False)
    
    def _gerar_resposta_hospede(self, args: dict) -> str:
        """Gera estrutura de resposta para o hóspede."""
        pousada_id = args.get("pousada_id")
        pergunta = args.get("pergunta_hospede", "")
        tom = args.get("tom", "casual")
        
        profile = self.memory.get_pousada_profile(pousada_id)
        nome_pousada = profile.get("nome", "Nossa Pousada") if profile else "Nossa Pousada"
        
        return json.dumps({
            "pousada_nome": nome_pousada,
            "pergunta_original": pergunta,
            "tom_sugerido": tom,
            "estrutura_resposta": {
                "saudacao": f"Olá! Aqui é da {nome_pousada} 😊" if tom == "casual" else f"Prezado(a), {nome_pousada} agradeita seu contato.",
                "resposta_conteudo": "[O LLM deve preencher com a resposta adequada]",
                "encerramento": "Estamos à disposição!" if tom != "formal" else "Atenciosamente."
            },
            "status": "estrutura_pronta_para_llm"
        }, ensure_ascii=False)
    
    def _analisar_reviews(self, args: dict) -> str:
        """Análise de reviews."""
        return json.dumps({
            "total_reviews": 0,
            "nota_media": 0,
            "sentimento_geral": "neutro",
            "topics": ["Limpeza", "Atendimento", "Café da manhã", "Localização", "Custo-benefício"],
            "recomendacoes": ["Integrar com API do Google Places e Booking para dados reais"],
            "status": "dados_simulados"
        }, ensure_ascii=False)
    
    def _criar_conteudo_marketing(self, args: dict) -> str:
        """Cria estrutura de conteúdo de marketing."""
        tipo = args.get("tipo_conteudo", "instagram_post")
        tema = args.get("tema", "experiencia")
        
        return json.dumps({
            "tipo": tipo,
            "tema": tema,
            "estrutura": {
                "headline": "[LLM deve gerar]",
                "corpo": "[LLM deve gerar - max 280 chars para Instagram]",
                "cta": "[LLM deve gerar - call to action]",
                "hashtags_sugeridas": ["#pousada", "#hospitalidade", "#brasil", "#viagem"],
                "melhor_horario": "18h-20h para Instagram"
            },
            "status": "estrutura_pronta_para_llm"
        }, ensure_ascii=False)
    
    def _gerar_relatorio_diario(self, args: dict) -> str:
        """Gera relatório diário."""
        return json.dumps({
            "data": args.get("data", datetime.now().strftime("%Y-%m-%d")),
            "metricas": {
                "checkins_hoje": 0,
                "checkouts_hoje": 0,
                "hospedes_atuais": 0,
                "ocupacao_hoje": "0%",
                "receita_diaria": "R$0",
                "reservas_novas": 0
            },
            "status": "dados_simulados"
        }, ensure_ascii=False)
    
    def _monitorar_concorrentes(self, args: dict) -> str:
        """Monitoramento de concorrentes."""
        return json.dumps({
            "concorrentes_encontrados": 0,
            "preco_medio_regiao": "R$0",
            "posicionamento": "N/A",
            "oportunidades": ["Integrar com API de scraping de preços"],
            "status": "dados_simulados"
        }, ensure_ascii=False)
    
    def _salvar_skill(self, args: dict, session_id: str = None) -> str:
        """Salva um skill aprendido."""
        skill_id = f"skill_{uuid.uuid4().hex[:8]}"
        success = self.memory.save_skill(
            skill_id=skill_id,
            name=args.get("nome", "unnamed"),
            content=args.get("conteudo", ""),
            category=args.get("categoria", "general"),
            tags=args.get("tags", [])
        )
        return json.dumps({
            "skill_id": skill_id,
            "status": "salvo" if success else "erro",
            "message": "Skill salvo com sucesso! Será usado em futuras interações." if success else "Erro ao salvar skill."
        })

# ============================================================
# ZEHLA BRAIN ENGINE (Core)
# ============================================================

class ZehlaBrain:
    """Motor cognitivo do ZEHLA — empacota HERMES com tools customizadas."""
    
    def __init__(self):
        self.memory = ZehlaMemory()
        self.tools = ZehlaTools(self.memory)
        self.client = None
        self.sessions: Dict[str, dict] = {}
        self._init_client()
    
    def _init_client(self):
        """Inicializa cliente LLM."""
        if not OPENAI_AVAILABLE:
            logger.warning("Cliente LLM não disponível. Modo de demonstração.")
            return
        
        api_key = HERMES_API_KEY_LLM
        if not api_key:
            logger.warning("OPENROUTER_API_KEY não configurada. Modo demo.")
            return
        
        self.client = OpenAI(
            base_url=HERMES_BASE_URL,
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "https://zehla.com.br",
                "X-Title": "ZEHLA Brain"
            }
        )
        logger.info(f"Cliente LLM inicializado: {HERMES_MODEL}")
    
    def chat(self, message: str, session_id: str = None, 
             pousada_id: str = None, system_prompt: str = None) -> dict:
        """Processa uma mensagem e retorna resposta."""
        
        # Gerar session_id se necessário
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Criar sessão
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "created_at": datetime.utcnow().isoformat(),
                "pousada_id": pousada_id,
                "message_count": 0
            }
            self.memory.save_session(session_id, pousada_id)
        
        # Buscar histórico
        history = self.memory.get_session_history(session_id)
        
        # Buscar skills relevantes
        skills = self.memory.search_skills(message[:100])
        
        # System prompt
        default_system = self._build_system_prompt(pousada_id, skills)
        sys_prompt = system_prompt or default_system
        
        # Montar messages
        messages = [{"role": "system", "content": sys_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})
        
        # Salvar mensagem do usuário
        self.memory.save_message(session_id, "user", message)
        
        # Verificar se tem cliente LLM
        if not self.client:
            return {
                "session_id": session_id,
                "response": self._demo_response(message, pousada_id),
                "model": "demo",
                "tokens_used": 0,
                "tools_called": [],
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # Loop do agente (versão simplificada do HERMES)
        tools_called = []
        total_tokens = 0
        max_iter = MAX_ITERATIONS
        iteration = 0
        
        while iteration < max_iter:
            iteration += 1
            
            try:
                response = self.client.chat.completions.create(
                    model=HERMES_MODEL,
                    messages=messages,
                    tools=self.tools.tools if iteration <= 3 else [],
                    temperature=0.7,
                    max_tokens=2000
                )
                
                total_tokens += response.usage.total_tokens if response.usage else 0
                choice = response.choices[0]
                assistant_msg = choice.message
                
                messages.append(assistant_msg.model_dump())
                
                # Se não tem tool calls, retornar resposta
                if not assistant_msg.tool_calls:
                    self.memory.save_message(
                        session_id, "assistant", 
                        assistant_msg.content or "", total_tokens
                    )
                    
                    # Auto-criar skill se a conversa foi complexa
                    if iteration > 1 and len(tools_called) >= 2:
                        self._auto_create_skill(session_id, message, 
                                               assistant_msg.content, 
                                               tools_called)
                    
                    return {
                        "session_id": session_id,
                        "response": assistant_msg.content,
                        "model": HERMES_MODEL,
                        "tokens_used": total_tokens,
                        "tools_called": tools_called,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                
                # Executar tool calls
                for tool_call in assistant_msg.tool_calls:
                    tool_name = tool_call.function.name
                    tool_args = json.loads(tool_call.function.arguments)
                    
                    result = self.tools.execute_tool(tool_name, tool_args, session_id)
                    tools_called.append(tool_name)
                    
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": result
                    })
                    
                    self.memory.save_message(
                        session_id, "tool",
                        f"[{tool_name}] {result[:200]}..."
                    )
                    
            except Exception as e:
                logger.error(f"Erro no loop do agente: {e}")
                return {
                    "session_id": session_id,
                    "response": f"Erro ao processar: {str(e)}",
                    "model": HERMES_MODEL,
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
        
        return {
            "session_id": session_id,
            "response": "Limite de iterações atingido. Tente reformular sua pergunta.",
            "model": HERMES_MODEL,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _build_system_prompt(self, pousada_id: str = None, skills: list = None) -> str:
        """Monta system prompt contextualizado."""
        prompt = """Você é o ZEHLA Brain — o assistente cognitivo inteligente da plataforma ZEHLA para pousadas brasileiras.

SUA MISSÃO:
- Ajudar donos de pousadas a tomar melhores decisões de negócio
- Analisar dados de ocupação, receita e operação
- Sugerir preços otimizados baseados em sazonalidade e demanda
- Gerar conteúdo de marketing para redes sociais
- Responder hóspedes de forma profissional e personalizada
- Monitorar concorrência e identificar oportunidades

SUAS CAPACIDADES:
- Análise de ocupação e tendências
- Revenue management e sugestão de preços
- Geração de conteúdo para Instagram, Facebook, TikTok
- Respostas para hóspedes via WhatsApp/Telegram
- Monitoramento de concorrentes
- Relatórios operacionais automáticos
- Aprendizado contínuo (você melhora com o uso)

REGRAS:
1. Fale em português brasileiro, de forma clara e profissional
2. Use dados e métricas sempre que disponíveis
3. Considere o contexto da hospitalidade brasileira (sazonalidade, feriados, eventos)
4. Sempre ofereça sugestões acionáveis
5. Quando não tiver dados reais, indique claramente que é uma estimativa
6. Salve habilidades úteis para reuso futuro usando a ferramenta zehla_salvar_skill

CONTEXTO DA POUSADA:
"""
        
        if pousada_id:
            profile = self.memory.get_pousada_profile(pousada_id)
            if profile:
                prompt += f"\n- Nome: {profile.get('nome', 'N/A')}"
                prompt += f"\n- Localização: {profile.get('localizacao', 'N/A')}"
                prompt += f"\n- Tipo: {profile.get('tipo', 'pousada')}"
                prompt += f"\n- Estilo de gestão: {profile.get('estilo_gestao', 'balanced')}"
        
        if skills:
            prompt += "\n\nSKILLS DISPONÍVEIS (aprendidos de experiências anteriores):"
            for skill in skills[:3]:
                prompt += f"\n- [{skill.get('category')}] {skill.get('name')}: {skill.get('content', '')[:200]}"
        
        return prompt
    
    def _demo_response(self, message: str, pousada_id: str = None) -> str:
        """Resposta de demonstração quando não há API LLM configurada."""
        msg_lower = message.lower()
        
        if any(word in msg_lower for word in ["preço", "preco", "pricing", "valor"]):
            return """🧠 ZEHLA Brain — MODO DEMONSTRAÇÃO

Para ativar o sistema completo de pricing inteligente, configure a API LLM:

1. Instale o OpenAI SDK: `pip install openai`
2. Configure a chave: `export OPENROUTER_API_KEY=sk-or-v1-...`
3. Reinicie o servidor

Quando ativo, poderei:
- Analisar ocupação em tempo real
- Calcular preço ótimo por quarto e data
- Considerar sazonalidade e concorrência
- Sugerir promoções estratégicas

→ Configure a API para começar!"""
        
        elif any(word in msg_lower for word in ["relatório", "relatorio", "dashboard"]):
            return """📊 ZEHLA Brain — Relatório Demo

O sistema está em modo de demonstração. Relatórios disponíveis quando a API LLM estiver configurada:

1. Relatório Diário de Ocupação
2. Relatório de Revenue (RevPAR, ADR, GOPPAR)
3. Relatório de Concorrência
4. Relatório de Reviews & Sentimento
5. Relatório de Marketing & Engajamento

→ Configure a API LLM para relatórios completos!"""
        
        return f"🧠 ZEHLA Brain ativo (modo demo).\n\nSua mensagem: \"{message}\"\n\nPara respostas inteligentes completas, configure a API LLM com `OPENROUTER_API_KEY`. O sistema está pronto para processar análises de ocupação, pricing, marketing e atendimento ao hóspede."
    
    def _auto_create_skill(self, session_id: str, user_msg: str, 
                           assistant_response: str, tools_called: list):
        """Auto-cria skill quando a interação foi complexa e útil."""
        if len(tools_called) < 2:
            return
        
        # Criar skill resumido
        skill_name = f"auto_{tools_called[0]}_{uuid.uuid4().hex[:4]}"
        content = f"# Skill Auto-Criado\n\n## Contexto\n{user_msg[:500]}\n\n## Ferramentas Usadas\n{', '.join(tools_called)}\n\n## Abordagem\n{assistant_response[:800]}"
        
        self.memory.save_skill(
            skill_id=skill_name,
            name=skill_name,
            content=content,
            category="auto_generated",
            tags=tools_called
        )
        logger.info(f"Skill auto-criado: {skill_name}")
    
    def get_sessions(self) -> list:
        return self.memory.get_active_sessions()
    
    def get_skills(self, query: str = None) -> list:
        if query:
            return self.memory.search_skills(query)
        return []
    
    def health_check(self) -> dict:
        return {
            "status": "healthy",
            "llm_configured": self.client is not None,
            "model": HERMES_MODEL if self.client else "demo",
            "active_sessions": len(self.sessions),
            "memory_db": os.path.exists("zehla_brain.db"),
            "timestamp": datetime.utcnow().isoformat()
        }

# ============================================================
# API FASTAPI
# ============================================================

brain = ZehlaBrain()

if FASTAPI_AVAILABLE:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        logger.info("ZEHLA Brain iniciando...")
        brain.health_check()
        yield
        logger.info("ZEHLA Brain desligando...")
    
    app = FastAPI(
        title="ZEHLA Brain — HERMES Engine",
        description="API do Cérebro ZEHLA baseado no HERMES AGENT",
        version="1.0.0",
        lifespan=lifespan,
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    def verify_api_key(authorization: str = Header(None)):
        if authorization != f"Bearer {HERMES_API_KEY}":
            raise HTTPException(401, "API Key inválida")
        return True
    
    @app.get("/health")
    async def health():
        return brain.health_check()
    
    @app.post("/chat", response_model=ChatResponse)
    async def chat(req: ChatRequest, auth: bool = Depends(verify_api_key)):
        result = brain.chat(
            message=req.message,
            session_id=req.session_id,
            pousada_id=req.pousada_id,
            system_prompt=req.system_prompt,
        )
        return ChatResponse(**result)
    
    @app.get("/sessions")
    async def list_sessions(auth: bool = Depends(verify_api_key)):
        return {"sessions": brain.get_sessions()}
    
    @app.get("/sessions/{session_id}")
    async def get_session(session_id: str, auth: bool = Depends(verify_api_key)):
        history = brain.memory.get_session_history(session_id)
        return {"session_id": session_id, "messages": history}
    
    @app.post("/skills")
    async def create_skill(req: SkillRequest, auth: bool = Depends(verify_api_key)):
        skill_id = f"skill_{uuid.uuid4().hex[:8]}"
        success = brain.memory.save_skill(
            skill_id=skill_id,
            name=req.name,
            content=req.content,
            category=req.category,
            tags=req.tags,
        )
        if not success:
            raise HTTPException(500, "Erro ao criar skill")
        return SkillResponse(skill_id=skill_id, name=req.name, 
                           created_at=datetime.utcnow().isoformat(), 
                           status="created")
    
    @app.get("/skills")
    async def search_skills(q: str = None, auth: bool = Depends(verify_api_key)):
        return {"skills": brain.get_skills(q)}
    
    @app.get("/tools")
    async def list_tools(auth: bool = Depends(verify_api_key)):
        return {"tools": [t["function"]["name"] for t in brain.tools.tools]}
    
    @app.post("/analyze/pricing")
    async def analyze_pricing(req: PricingAnalysisRequest, 
                               auth: bool = Depends(verify_api_key)):
        """Análise de pricing dedicada."""
        result = brain.chat(
            message=f"Analise a seguinte situação de pricing para a pousada {req.pousada_id}: Preços atuais: {json.dumps(req.current_prices)}, Período: {req.periodo}, Dados de ocupação: {json.dumps(req.occupancy_data or [])}. Forneça recomendações específicas.",
            pousada_id=req.pousada_id,
        )
        return result
    
    @app.post("/analyze/reviews")
    async def analyze_reviews(pousada_id: str, 
                               auth: bool = Depends(verify_api_key)):
        """Análise de reviews."""
        result = brain.chat(
            message=f"Faça uma análise completa dos reviews da pousada {pousada_id}. Identifique pontos fortes, fracos, tendências e dê recomendações acionáveis.",
            pousada_id=pousada_id,
        )
        return result
    
    @app.post("/content/generate")
    async def generate_content(
        pousada_id: str,
        content_type: str = "instagram_post",
        theme: str = "experiencia",
        auth: bool = Depends(verify_api_key)
    ):
        """Geração de conteúdo de marketing."""
        result = brain.chat(
            message=f"Crie conteúdo de marketing para a pousada {pousada_id}: Tipo: {content_type}, Tema: {theme}. O conteúdo deve ser profissional, engajador e adequado para o público de hospitalidade brasileira.",
            pousada_id=pousada_id,
        )
        return result

# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    if not FASTAPI_AVAILABLE:
        print("❌ FastAPI não instalada. Execute:")
        print("   pip install fastapi uvicorn pydantic openai python-dotenv")
        sys.exit(1)
    
    import uvicorn
    
    print("""
    ╔═══════════════════════════════════════════════════╗
    ║          ZEHLA BRAIN — HERMES ENGINE              ║
    ║     Cérebro Cognitivo para Pousadas Brasileiras    ║
    ╚═══════════════════════════════════════════════════╝
    
    Status: ONLINE
    Porta: {}
    API Key: {}...{}
    Modelo: {}
    LLM: {}
    
    Endpoints:
      GET  /health          → Health check
      POST /chat            → Chat com o Brain
      GET  /sessions        → Listar sessões
      POST /skills          → Criar skill
      GET  /skills?q=...    → Buscar skills
      GET  /tools           → Listar ferramentas
      POST /analyze/pricing → Análise de pricing
      POST /analyze/reviews → Análise de reviews
      POST /content/generate → Gerar conteúdo marketing
    
    """.format(
        PORT,
        HERMES_API_KEY[:4],
        HERMES_API_KEY[-4:],
        HERMES_MODEL,
        "Configurado ✓" if brain.client else "Demo Mode ⚠️"
    ))
    
    uvicorn.run(app, host="0.0.0.0", port=PORT)
