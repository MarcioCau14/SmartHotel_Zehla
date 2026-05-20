/**
 * FULL_STACK_AGENT — CLI Help
 * Texto de ajuda completo da ferramenta
 */

export const VERSION = '0.1.0';

export function showHelp() {
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │         FULL_STACK_AGENT (FSA) v${VERSION}                    │
  │   Agente Full Stack Sênior — Análise, Revisão e Correção    │
  └─────────────────────────────────────────────────────────────┘

  USO:
    fsa <comando> <caminho> [opções]
    node src/index.js <comando> <caminho> [opções]

  COMANDOS:
    analyze    Analisa o projeto: framework, deps, rotas, banco, score
    review     Revisa código: smells, segurança, performance, tipos, LGPD
    fix        Corrige problemas automaticamente (com backup)
    infra      Gera infraestrutura: Dockerfile, CI/CD, ESLint, .env
    generate   Gera templates por framework (só cria o que falta)
    ai         Análise IA dos achados via OPENCODE (zero custo)
    full       Pipeline completo: analyze → review → fix → infra → generate → ai

  OPÇÕES GLOBAIS:
    --deep           Análise profunda (AST parsing completo)
    --fix            Aplica correções automáticas (modo Fixer)
    --report <fmt>   Formato: md (padrão) | json | html
    --output <dir>   Diretório de saída (padrão: .fsa-reports/)
    --ignore <pat>   Ignorar padrões (ex: --ignore "scripts,examples")
    --ai             Integração com IA para insights adicionais
    --ci             Modo CI/CD: saída estruturada, exit codes semânticos
    --force          Sobrescreve arquivos existentes (cuidado!)
    --dry-run        Mostra o que seria feito sem executar
    --verbose        Output detalhado (debug)
    --watch          Monitoramento contínuo de arquivos
    --version        Mostra a versão
    --help           Mostra esta ajuda

  EXEMPLOS:
    fsa analyze ./meu-projeto
    fsa review ./meu-projeto --deep --report json
    fsa fix ./meu-projeto --fix --dry-run
    fsa infra ./meu-projeto --output ./infra-gerada
    fsa full ./meu-projeto --ai --report html --verbose
    fsa review ./meu-projeto --ci --ignore "node_modules,.next"

  EXIT CODES (modo --ci):
    0   Sucesso — nenhum problema crítico
    1   Erro de execução
    2   Warnings (severidade medium/low)
    3   Problemas HIGH encontrados
    4   Problemas CRITICAL encontrados (bloqueia deploy)

  CONFIGURAÇÃO:
    Crie .fsa.conf na raiz do projeto para customizar regras.
    Variáveis de ambiente: FSA_AI_PROVIDER, FSA_AI_KEY, FSA_CACHE_DIR

  MAIS INFORMAÇÕES:
    GitHub: github.com/marciocau/full-stack-agent
`);
}

export function showVersion() {
  console.log(`FULL_STACK_AGENT v${VERSION}`);
}

export function showCommandHelp(command) {
  const helps = {
    analyze: `
  fsa analyze <caminho> [opções]

  Analisa a estrutura do projeto sem modificar nenhum arquivo.
  Detecta framework, dependências, rotas, banco de dados e gera
  um Score de Maturidade (0-100).

  OPÇÕES:
    --deep           Análise profunda com parsing completo
    --report <fmt>   Formato: md | json | html
    --output <dir>   Diretório de saída
    --ignore <pat>   Padrões a ignorar
    --ai             Insights adicionais via IA

  EXEMPLO:
    fsa analyze ./meu-projeto --deep --report html
`,
    review: `
  fsa review <caminho> [opções]

  Revisa o código em 5 categorias: segurança (OWASP Top 10),
  performance, code smells, type safety e conformidade LGPD.

  OPÇÕES:
    --deep           Análise profunda
    --fix            Aplica auto-fixes após revisão
    --report <fmt>   Formato: md | json | html
    --ci             Modo CI com exit codes semânticos
    --ai             Explicações em PT-BR via IA

  EXEMPLO:
    fsa review ./meu-projeto --deep --ci
`,
    fix: `
  fsa fix <caminho> [opções]

  Aplica correções automáticas com backup em .fsa-backups/.

  CORREÇÕES AUTOMÁTICAS:
    - Organização de imports (5 grupos ordenados)
    - Remoção de console.log (preserva warn/error)
    - Correção de tipos TypeScript
    - Adição de error handling
    - Remoção de código morto

  OPÇÕES:
    --fix            Aplica as correções (sem isso é dry-run)
    --dry-run        Mostra o que seria feito
    --report <fmt>   Formato do relatório

  EXEMPLO:
    fsa fix ./meu-projeto --fix --dry-run
`,
    infra: `
  fsa infra <caminho> [opções]

  Gera infraestrutura como código baseada no framework detectado.
  NUNCA sobrescreve arquivos existentes (use --force para isso).

  ARQUIVOS GERADOS:
    - Dockerfile (multi-stage)
    - docker-compose.yml + docker-compose.dev.yml
    - .github/workflows/ci.yml
    - .github/workflows/fsa-review.yml
    - vercel.json (com security headers)
    - .env.example
    - .eslintrc.json + .prettierrc
    - .gitignore (completo)
    - .dockerignore

  EXEMPLO:
    fsa infra ./meu-projeto --verbose
`,
    generate: `
  fsa generate <caminho> [opções]

  Gera templates e componentes faltantes baseados no framework.
  Usa motor de diff para criar apenas o que não existe.

  EXEMPLO:
    fsa generate ./meu-projeto --dry-run
`,
  };

  if (helps[command]) {
    console.log(helps[command]);
  } else {
    showHelp();
  }
}
