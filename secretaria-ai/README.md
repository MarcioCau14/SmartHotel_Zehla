# Secretaria.ai | Relationship OS

Uma plataforma unificada de inteligência comercial e prospecção automatizada.

## 📁 Estrutura do Projeto

```text
secretaria-ai/
├── backend/               # Motor de Inteligência LESSIE AI (FastAPI)
│   ├── agents/            # Agentes de IA especializados
│   ├── core/              # Orquestrador e Banco de Dados
│   ├── scripts/           # Scripts de teste e missões manuais
│   ├── skills/            # Habilidades (OSINT, People Search, etc.)
│   └── server.py          # Entrypoint da API
├── src/                   # Frontend Next.js
├── public/                # Assets estáticos
└── README.md              # Este guia
```

## 🚀 Como Iniciar

### 1. Backend (LESSIE AI)
Certifique-se de ter as dependências instaladas (`pip install fastapi uvicorn pandas openpyxl`).

```bash
cd backend
python3 server.py
```
A API estará disponível em `http://localhost:8000`.

### 2. Frontend (Secretaria.ai)
Instale as dependências e inicie o ambiente de desenvolvimento.

```bash
npm install
npm run dev
```
O dashboard estará disponível em `http://localhost:3000`.

## 🛠️ Funcionalidades Principais

- **Deep OSINT Enrichment**: Validação de identidade e pegada digital em tempo real.
- **Entity Resolution**: Score de confiança para matches de decisores.
- **Auto-Export**: Geração automática de listas em Excel prontas para Google Sheets.
- **Real-time Hunting**: Dashboard reativo com logs de progresso via SSE.

## 🧪 Testes de Missão
Você pode rodar missões diretamente via terminal para validar a inteligência:

```bash
python3 backend/scripts/test_ifood_mission.py
python3 backend/scripts/test_cimed_mission.py
```

---
*Desenvolvido com maestria por Antigravity.*
