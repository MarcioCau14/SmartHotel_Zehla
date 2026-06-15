import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZEHLA SmartHotel — Outbound Hub</title>
  <style>
    :root {
      --bg: #09090b;
      --fg: #f4f4f5;
      --muted: #a1a1aa;
      --primary: #10b981;
      --primary-hover: #059669;
      --card: #18181b;
      --border: #27272a;
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg);
      color: var(--fg);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      width: 100%;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 16px;
      color: var(--fg);
      letter-spacing: -0.025em;
    }
    p {
      font-size: 1.1rem;
      line-height: 1.6;
      color: var(--muted);
      margin-bottom: 30px;
    }
    .cta-button {
      display: inline-block;
      background-color: var(--primary);
      color: var(--bg);
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      transition: background-color 0.2s;
    }
    .cta-button:hover {
      background-color: var(--primary-hover);
    }
    footer {
      margin-top: 40px;
      font-size: 0.85rem;
      color: var(--muted);
      border-top: 1px solid var(--border);
      padding-top: 20px;
      width: 100%;
    }
    .opt-out-btn {
      background: none;
      border: none;
      color: #ef4444;
      text-decoration: underline;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0;
    }
    .opt-out-btn:hover {
      color: #f87171;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>ZEHLA SmartHotel</h1>
    <p>Aumente em até 35% suas reservas diretas e elimine comissões de OTAs usando automação inteligente e WhatsApp ativo.</p>
    <a href="https://smarthotel.zehla.com.br" class="cta-button">Conhecer o ZEHLA</a>
    <footer>
      Deseja não receber mais comunicações? 
      <form action="/api/webhooks/whatsapp" method="POST" style="display:inline;" id="optout-form">
        <input type="hidden" name="phone" value="5548999999999">
        <input type="hidden" name="content" value="SAIR">
        <button type="submit" class="opt-out-btn">Descadastrar-se</button>
      </form>
    </footer>
  </div>
</body>
</html>`
  
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
