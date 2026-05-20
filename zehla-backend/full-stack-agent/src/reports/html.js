/**
 * FULL_STACK_AGENT — HTML Reporter (Standalone Dashboard)
 * Gera um único arquivo HTML premium com CSS/JS embutidos.
 */

export function generateHtmlReport(context) {
  const { project, scores, analysis, findings = [] } = context;
  const timestamp = new Date().toLocaleString('pt-BR');
  
  // Agrupamento de findings por severidade
  const summary = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  };

  return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FSA Dashboard — ${project.name}</title>
    <style>
        :root {
            --bg: #0f172a; --card: #1e293b; --text: #f8fafc;
            --primary: #38bdf8; --critical: #ef4444; --high: #f97316;
            --medium: #facc15; --low: #4ad62e;
        }
        body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .card { background: var(--card); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .score { font-size: 3rem; font-weight: bold; margin: 0.5rem 0; color: var(--primary); }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
        .critical { background: var(--critical); } .high { background: var(--high); } .medium { background: var(--medium); color: #000; } .low { background: var(--low); }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { text-align: left; padding: 1rem; border-bottom: 1px solid #334155; }
        th { background: #334155; }
        h1 { margin-top: 0; color: var(--primary); }
        .timestamp { color: #94a3b8; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="timestamp">Gerado em ${timestamp}</div>
    <h1>FULL_STACK_AGENT <small style="color:#94a3b8; font-size: 1rem;">v0.1.0</small></h1>
    
    <div class="grid">
        <div class="card">
            <div>Maturidade</div>
            <div class="score">${scores.maturity}</div>
        </div>
        <div class="card">
            <div>Qualidade</div>
            <div class="score">${scores.quality}</div>
        </div>
        <div class="card">
            <div>Findings</div>
            <div class="score" style="color:var(--critical)">${findings.length}</div>
        </div>
    </div>

    <div class="card">
        <h2>Detalhamento de Problemas</h2>
        <table>
            <thead>
                <tr>
                    <th>Severidade</th>
                    <th>ID</th>
                    <th>Mensagem</th>
                    <th>Arquivo</th>
                </tr>
            </thead>
            <tbody>
                ${findings.map(f => `
                    <tr>
                        <td><span class="badge ${f.severity}">${f.severity}</span></td>
                        <td><code>${f.rule}</code></td>
                        <td>${f.message}</td>
                        <td style="color:#94a3b8; font-size: 0.85rem;">${f.file}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
  `.trim();
}
