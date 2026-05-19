# FULL_STACK_AGENT (FSA)

> **Agente Full Stack Sênior Virtual** — Análise, revisão, correção e normalização de projetos de software

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org)
[![Zero Deps](https://img.shields.io/badge/deps-zero-blue)](package.json)
[![Version](https://img.shields.io/badge/version-0.1.0-orange)](package.json)

---

## O que é

O **FULL_STACK_AGENT** é uma CLI standalone que funciona como um engenheiro full stack sênior virtual. Ela analisa, revisa, corrige e normaliza projetos de software de forma automatizada — combinando detecção de padrões arquiteturais, revisão de segurança (OWASP Top 10), correção automática e geração de infraestrutura em um único fluxo de trabalho.

**Zero dependências externas.** Funciona com apenas Node.js 20+.

---

## Instalação

```bash
# Clone o projeto
git clone https://github.com/marciocau/full-stack-agent
cd full-stack-agent

# Torna o CLI executável
chmod +x src/index.js

# Link global (opcional)
npm link
```

---

## Uso

```bash
# Análise completa do projeto
fsa full ./meu-projeto --verbose

# Apenas análise estrutural
fsa analyze ./meu-projeto

# Revisão de código (segurança, smells, tipos)
fsa review ./meu-projeto --deep --report html

# Correções automáticas (com backup)
fsa fix ./meu-projeto --fix --dry-run

# Gerar infraestrutura (Dockerfile, CI/CD, ESLint)
fsa infra ./meu-projeto

# Gerar templates por framework
fsa generate ./meu-projeto

# Modo CI/CD (exit codes semânticos)
fsa review ./meu-projeto --ci --deep
```

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `analyze` | Detecta framework, deps, rotas, banco de dados. Gera Maturity Score |
| `review` | Revisa código: segurança (OWASP), smells, performance, tipos, LGPD |
| `fix` | Aplica correções automáticas com backup em `.fsa-backups/` |
| `infra` | Gera Dockerfile, docker-compose, GitHub Actions, vercel.json |
| `generate` | Gera templates por framework (só cria o que falta) |
| `full` | Pipeline completo: analyze → review → fix → infra → generate |

---

## Flags Globais

| Flag | Descrição |
|------|-----------|
| `--deep` | Análise profunda com parsing completo |
| `--fix` | Aplica correções automáticas |
| `--report <fmt>` | Formato: `md` \| `json` \| `html` |
| `--output <dir>` | Diretório de saída (padrão: `.fsa-reports/`) |
| `--ignore <pat>` | Padrões a ignorar (ex: `"scripts,examples"`) |
| `--ai` | Integração com IA para insights em PT-BR |
| `--ci` | Modo CI: exit codes semânticos, sem cores |
| `--force` | Sobrescreve arquivos existentes |
| `--dry-run` | Mostra o que seria feito sem executar |
| `--verbose` | Output detalhado (debug) |
| `--watch` | Monitoramento contínuo de arquivos |

---

## Exit Codes (Modo --ci)

| Code | Significado | Ação |
|------|-------------|------|
| `0` | Sucesso | ✅ Continua deploy |
| `1` | Erro de execução | ❌ Verificar logs |
| `2` | Warnings (medium/low) | ⚠️ Deploy continua |
| `3` | Problemas HIGH | ⚠️ Configurável |
| `4` | Problemas CRITICAL | ❌ Bloqueia deploy |

---

## Arquitetura

```
src/
├── index.js              # Entry point CLI
├── cli/
│   ├── parser.js         # Argument parsing nativo
│   └── help.js           # Help text
├── core/
│   ├── orchestrator.js   # Pipeline completo
│   ├── context.js        # ProjectContext detection
│   └── config.js         # .fsa.conf loader
├── modules/
│   ├── analyzer/         # Maturity Score + Framework detection
│   ├── reviewer/         # Quality Score + OWASP + LGPD
│   ├── fixer/            # Auto-correção com backup
│   ├── infra/            # Infraestrutura como código
│   └── generator/        # Templates por framework
├── reports/
│   ├── markdown.js       # Relatório .md
│   ├── json.js           # Relatório JSON estruturado
│   └── html.js           # Dashboard HTML standalone
├── ai/
│   └── provider.js       # OpenAI / Anthropic / Google / Ollama
└── utils/
    ├── fs.js             # File system helpers
    ├── logger.js         # ANSI colored logging
    ├── timer.js          # Performance measurement
    └── git.js            # Git integration
```

---

## Configuração (.fsa.conf)

```javascript
export default {
  ignore: ['generated/', 'mocks/'],
  rules: {
    disable: [],
    severity: { 'SEC-*': 'critical' }
  },
  fix: {
    autoFix: ['imports', 'console', 'unused-vars'],
    confirmFirst: ['types', 'error-handling'],
    neverFix: ['architecture']
  },
  report: { format: 'md', output: '.fsa-reports/' },
  ai: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5',
    maxTokens: 100000,
    explainFindings: true,
  }
};
```

---

## Integração GitHub Actions

```yaml
# .github/workflows/fsa-review.yml
name: FSA Code Review
on:
  pull_request:
    branches: [main]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node /path/to/full-stack-agent/src/index.js review . --ci --deep
```

---

## Projeto alvo principal

O FSA foi desenvolvido e calibrado contra o **SmartHotel / ZEHLA Cognitive Hospitality OS**:

- **Framework:** Next.js v16 (App Router)
- **Baseline:** Maturidade 42/100, Qualidade 10/100, 133 problemas
- **Meta:** Maturidade > 75/100, Qualidade > 60/100

---

> Desenvolvido por ZEHLA Cognitive OS — Maio 2026  
> Node.js 20+ | ESM | Zero dependências externas
