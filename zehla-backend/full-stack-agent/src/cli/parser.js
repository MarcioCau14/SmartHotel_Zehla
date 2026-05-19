/**
 * FULL_STACK_AGENT — CLI Parser
 * Argument parsing nativo usando process.argv (zero deps)
 */

import { showHelp, showVersion, showCommandHelp } from './help.js';

const VALID_COMMANDS = new Set(['analyze', 'review', 'fix', 'infra', 'generate', 'ai', 'full']);
const VALID_REPORTS = new Set(['md', 'json', 'html']);

/**
 * Parseia process.argv e retorna objeto de configuração
 * @returns {{ command: string, path: string, options: object }}
 */
export function parseArgs(argv = process.argv.slice(2)) {
  // Sem argumentos → mostrar help
  if (argv.length === 0) {
    showHelp();
    process.exit(0);
  }

  // Flags globais sem comando
  if (argv[0] === '--help' || argv[0] === '-h') {
    showHelp();
    process.exit(0);
  }

  if (argv[0] === '--version' || argv[0] === '-v') {
    showVersion();
    process.exit(0);
  }

  // help <comando>
  if (argv[0] === 'help') {
    showCommandHelp(argv[1]);
    process.exit(0);
  }

  const command = argv[0];

  // Valida comando
  if (!VALID_COMMANDS.has(command)) {
    process.stderr.write(
      `\n  ✖ Comando inválido: "${command}"\n` +
      `  Comandos válidos: ${[...VALID_COMMANDS].join(', ')}\n` +
      `  Use: fsa --help\n\n`
    );
    process.exit(1);
  }

  // Se segundo arg é --help, mostra help do comando
  if (argv[1] === '--help' || argv[1] === '-h') {
    showCommandHelp(command);
    process.exit(0);
  }

  // Segundo argumento é o caminho do projeto
  let projectPath = '.';
  let flagStart = 1;

  if (argv[1] && !argv[1].startsWith('--')) {
    projectPath = argv[1];
    flagStart = 2;
  }

  // Parseia flags
  const options = {
    deep: false,
    fix: false,
    report: 'md',
    output: '.fsa-reports',
    ignore: [],
    ai: false,
    ci: false,
    force: false,
    dryRun: false,
    verbose: false,
    watch: false,
    noColor: false,
    timeout: 60000,
  };

  const flags = argv.slice(flagStart);

  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    const next = flags[i + 1];

    switch (flag) {
      case '--deep':
        options.deep = true;
        break;

      case '--fix':
        options.fix = true;
        break;

      case '--ai':
        options.ai = true;
        break;

      case '--ci':
        options.ci = true;
        options.noColor = true;
        break;

      case '--force':
        options.force = true;
        break;

      case '--dry-run':
        options.dryRun = true;
        break;

      case '--verbose':
        options.verbose = true;
        break;

      case '--watch':
        options.watch = true;
        break;

      case '--json':
        options.report = 'json';
        break;

      case '--no-color':
        options.noColor = true;
        break;

      case '--report':
        if (!next || !VALID_REPORTS.has(next)) {
          process.stderr.write(
            `\n  ✖ --report requer um formato válido: md | json | html\n\n`
          );
          process.exit(1);
        }
        options.report = next;
        i++;
        break;

      case '--output':
        if (!next || next.startsWith('--')) {
          process.stderr.write(`\n  ✖ --output requer um diretório\n\n`);
          process.exit(1);
        }
        options.output = next;
        i++;
        break;

      case '--ignore':
        if (!next || next.startsWith('--')) {
          process.stderr.write(`\n  ✖ --ignore requer um padrão (ex: "node_modules,dist")\n\n`);
          process.exit(1);
        }
        options.ignore = next.split(',').map(s => s.trim()).filter(Boolean);
        i++;
        break;

      case '--timeout':
        if (!next || isNaN(parseInt(next))) {
          process.stderr.write(`\n  ✖ --timeout requer um número em ms\n\n`);
          process.exit(1);
        }
        options.timeout = parseInt(next);
        i++;
        break;

      default:
        // Flag desconhecida
        if (flag.startsWith('--')) {
          process.stderr.write(
            `\n  ✖ Flag desconhecida: "${flag}"\n` +
            `  Use: fsa --help\n\n`
          );
          process.exit(1);
        }
        break;
    }
  }

  return { command, path: projectPath, options };
}
