/**
 * FULL_STACK_AGENT — Logger
 * Structured logging com ANSI color codes nativos (zero deps)
 */

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

const SEVERITY_COLORS = {
  critical: COLORS.bgRed + COLORS.white,
  high: COLORS.red,
  medium: COLORS.yellow,
  low: COLORS.green,
  info: COLORS.cyan,
};

const SEVERITY_ICONS = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
  info: 'ℹ️ ',
};

const LOG_LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };

let currentLevel = 'info';
let verbose = false;
let useColors = !process.env.FSA_NO_COLOR && process.stdout.isTTY;
let ciMode = false;

function color(str, ...codes) {
  if (!useColors) return str;
  return codes.join('') + str + COLORS.reset;
}

function timestamp() {
  return new Date().toISOString().slice(11, 19); // HH:MM:SS
}

function prefix(level) {
  if (ciMode) return `[FSA][${level.toUpperCase()}]`;
  const icons = { error: '✖', warn: '⚠', info: '→', debug: '·', success: '✔' };
  return color(`[${timestamp()}]`, COLORS.gray) + ' ' + (icons[level] || '·');
}

const logger = {
  configure({ verboseMode = false, ci = false, noColor = false, level = 'info' } = {}) {
    verbose = verboseMode;
    ciMode = ci;
    useColors = !noColor && !ci && process.stdout.isTTY;
    currentLevel = level;
    if (verbose) currentLevel = 'debug';
  },

  error(msg, meta = {}) {
    if (LOG_LEVELS[currentLevel] < LOG_LEVELS.error) return;
    const line = `${prefix('error')} ${color(msg, COLORS.red)}`;
    process.stderr.write(line + '\n');
    if (verbose && meta.error?.stack) {
      process.stderr.write(color(meta.error.stack, COLORS.gray) + '\n');
    }
  },

  warn(msg) {
    if (LOG_LEVELS[currentLevel] < LOG_LEVELS.warn) return;
    console.log(`${prefix('warn')} ${color(msg, COLORS.yellow)}`);
  },

  info(msg) {
    if (LOG_LEVELS[currentLevel] < LOG_LEVELS.info) return;
    console.log(`${prefix('info')} ${msg}`);
  },

  success(msg) {
    if (LOG_LEVELS[currentLevel] < LOG_LEVELS.info) return;
    console.log(`${prefix('success')} ${color(msg, COLORS.green)}`);
  },

  debug(msg) {
    if (!verbose) return;
    console.log(`${prefix('debug')} ${color(msg, COLORS.gray)}`);
  },

  // Linha em branco
  br() {
    console.log('');
  },

  // Título de seção
  section(title) {
    if (LOG_LEVELS[currentLevel] < LOG_LEVELS.info) return;
    console.log('');
    console.log(color('━'.repeat(60), COLORS.cyan));
    console.log(color(`  ${title}`, COLORS.bold + COLORS.cyan));
    console.log(color('━'.repeat(60), COLORS.cyan));
  },

  // Banner inicial do FSA
  banner(version) {
    if (ciMode) return;
    console.log('');
    console.log(color('  ███████╗███████╗ █████╗ ', COLORS.cyan));
    console.log(color('  ██╔════╝██╔════╝██╔══██╗', COLORS.cyan));
    console.log(color('  █████╗  ███████╗███████║', COLORS.cyan));
    console.log(color('  ██╔══╝  ╚════██║██╔══██║', COLORS.cyan));
    console.log(color('  ██║     ███████║██║  ██║', COLORS.cyan));
    console.log(color('  ╚═╝     ╚══════╝╚═╝  ╚═╝', COLORS.cyan));
    console.log('');
    console.log(color(`  FULL_STACK_AGENT v${version}`, COLORS.bold));
    console.log(color('  Agente Full Stack Sênior Virtual', COLORS.gray));
    console.log('');
  },

  // Finding com severidade colorida
  finding({ severity, rule, message, file, line }) {
    const icon = SEVERITY_ICONS[severity] || '·';
    const sev = color(`[${severity.toUpperCase()}]`, SEVERITY_COLORS[severity]);
    const loc = line ? color(`${file}:${line}`, COLORS.gray) : color(file, COLORS.gray);
    console.log(`  ${icon} ${sev} ${color(rule, COLORS.bold)} — ${message}`);
    console.log(`     ${loc}`);
  },

  // Score com cor baseada no valor
  score(label, value, max = 100) {
    const pct = Math.round((value / max) * 100);
    let c = COLORS.green;
    if (pct < 50) c = COLORS.red;
    else if (pct < 75) c = COLORS.yellow;
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    console.log(`  ${label.padEnd(20)} ${color(bar, c)} ${color(`${value}/${max}`, COLORS.bold)}`);
  },

  // Tabela simples
  table(headers, rows) {
    const widths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map(r => String(r[i] || '').length))
    );
    const line = widths.map(w => '─'.repeat(w + 2)).join('┼');
    const header = headers.map((h, i) => h.padEnd(widths[i])).join(' │ ');
    console.log(color(`  ┌${line.replace(/┼/g, '┬')}┐`, COLORS.gray));
    console.log(`  │ ${color(header, COLORS.bold)} │`);
    console.log(color(`  ├${line}┤`, COLORS.gray));
    rows.forEach(row => {
      const line2 = row.map((cell, i) => String(cell || '').padEnd(widths[i])).join(' │ ');
      console.log(`  │ ${line2} │`);
    });
    console.log(color(`  └${line.replace(/┼/g, '┴')}┘`, COLORS.gray));
  },
};

export default logger;
