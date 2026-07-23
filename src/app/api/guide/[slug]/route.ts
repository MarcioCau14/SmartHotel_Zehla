import { NextRequest, NextResponse } from 'next/server';

// GET /api/guide/[slug] — Public guest guide (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const { db } = await import('@/lib/db');

    const guide = await db.guestGuide.findFirst({
      where: { slug, status: 'active' },
    });

    if (!guide) {
      return new NextResponse('Guia não encontrado', { status: 404, headers: { 'Content-Type': 'text/html' } });
    }

    // Increment view count
    await db.guestGuide.update({
      where: { id: guide.id },
      data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
    });

    // Parse sections
    let sections: any[] = [];
    try { sections = JSON.parse(guide.sections); } catch {}

    // Get property image if available
    let imageUrl = '';
    if (guide.airbPropertyId) {
      const airbProp = await db.airBProperty.findFirst({
        where: { id: guide.airbPropertyId },
        select: { imageUrl: true, name: true },
      });
      if (airbProp?.imageUrl) imageUrl = airbProp.imageUrl;
    }

    // Build beautiful HTML
    const html = buildGuideHTML(guide, sections, imageUrl);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[GuidePublic] Error:', error);
    return new NextResponse('Erro interno', { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
}

function buildGuideHTML(guide: any, sections: any[], imageUrl: string): string {
  const sectionRenderers: Record<string, (items: any[]) => string> = {
    essentials: (items) => items.map(item => {
      if (item.type === 'wifi') return `
        <div class="essentials-item wifi-item">
          <div class="essentials-icon">📶</div>
          <div class="essentials-content">
            <div class="essentials-label">Wi-Fi</div>
            <div class="essentials-value">Rede: <strong>${item.network}</strong></div>
            <div class="essentials-value">Senha: <strong class="wifi-password" onclick="copyPassword('${item.password}')">${item.password}</strong>
              <button class="copy-btn" onclick="copyPassword('${item.password}')">Copiar</button>
            </div>
          </div>
        </div>`;
      if (item.type === 'checkin') return `
        <div class="essentials-item">
          <div class="essentials-icon">🔑</div>
          <div class="essentials-content">
            <div class="essentials-label">${item.label}</div>
            <div class="essentials-value">${item.value}</div>
          </div>
        </div>`;
      if (item.type === 'checkout') return `
        <div class="essentials-item">
          <div class="essentials-icon">🚪</div>
          <div class="essentials-content">
            <div class="essentials-label">${item.label}</div>
            <div class="essentials-value">${item.value}</div>
          </div>
        </div>`;
      if (item.type === 'pix') return `
        <div class="essentials-item">
          <div class="essentials-icon">💰</div>
          <div class="essentials-content">
            <div class="essentials-label">${item.label}</div>
            <div class="essentials-value pix-value" onclick="copyPassword('${item.value}')">${item.value}
              <button class="copy-btn" onclick="copyPassword('${item.value}')">Copiar</button>
            </div>
          </div>
        </div>`;
      return `
        <div class="essentials-item">
          <div class="essentials-icon">📍</div>
          <div class="essentials-content">
            <div class="essentials-label">${item.label}</div>
            <div class="essentials-value">${item.value || item.answer || ''}</div>
          </div>
        </div>`;
    }).join(''),

    rules: (items) => items.map(item => `
      <div class="rule-item">
        <div class="rule-icon">📋</div>
        <div class="rule-content">
          <div class="rule-label">${item.label}</div>
          ${item.answer ? `<div class="rule-answer">${item.answer}</div>` : ''}
        </div>
      </div>
    `).join(''),

    tips: (items) => items.map(item => `
      <div class="tip-item">
        <div class="tip-icon">💡</div>
        <div class="tip-content">${item.label}</div>
      </div>
    `).join(''),

    neighborhood: (items) => items.map(item => `
      <div class="tip-item">
        <div class="tip-icon">📍</div>
        <div class="tip-content">${item.label}</div>
      </div>
    `).join(''),

    restaurant: (items) => items.map(item => `
      <div class="place-item">
        <div class="place-icon">🍽️</div>
        <div class="place-content">
          <div class="place-name">${item.label}</div>
          <div class="place-meta">${item.distance || ''} ${item.walkingTime ? `• ${item.walkingTime} caminhando` : ''}</div>
          ${item.rating ? `<div class="place-rating">⭐ ${item.rating}</div>` : ''}
        </div>
      </div>
    `).join(''),

    supermarket: (items) => items.map(item => `
      <div class="place-item">
        <div class="place-icon">🛒</div>
        <div class="place-content">
          <div class="place-name">${item.label}</div>
          <div class="place-meta">${item.distance || ''} ${item.walkingTime ? `• ${item.walkingTime}` : ''}</div>
        </div>
      </div>
    `).join(''),

    attraction: (items) => items.map(item => `
      <div class="place-item">
        <div class="place-icon">🗺️</div>
        <div class="place-content">
          <div class="place-name">${item.label}</div>
          <div class="place-meta">${item.distance || ''} ${item.walkingTime ? `• ${item.walkingTime}` : ''}</div>
          ${item.rating ? `<div class="place-rating">⭐ ${item.rating}</div>` : ''}
        </div>
      </div>
    `).join(''),

    pharmacy: (items) => items.map(item => `
      <div class="place-item">
        <div class="place-icon">💊</div>
        <div class="place-content">
          <div class="place-name">${item.label}</div>
          <div class="place-meta">${item.distance || ''}</div>
        </div>
      </div>
    `).join(''),

    transport: (items) => items.map(item => `
      <div class="place-item">
        <div class="place-icon">🚌</div>
        <div class="place-content">
          <div class="place-name">${item.label}</div>
          <div class="place-meta">${item.distance || ''}</div>
        </div>
      </div>
    `).join(''),

    emergency: (items) => items.map(item => `
      <div class="emergency-item">
        <div class="emergency-icon">🆘</div>
        <div class="emergency-content">
          <div class="emergency-name">${item.label}</div>
          ${item.phone ? `<div class="emergency-phone">📞 ${item.phone}</div>` : ''}
        </div>
      </div>
    `).join(''),

    amenities: (items) => items.map(item => `
      <div class="rule-item">
        <div class="rule-icon">✨</div>
        <div class="rule-content">
          <div class="rule-label">${item.label}</div>
          ${item.answer ? `<div class="rule-answer">${item.answer}</div>` : ''}
        </div>
      </div>
    `).join(''),

    faq: (items) => items.map(item => `
      <div class="faq-item">
        <div class="faq-question">${item.label}</div>
        <div class="faq-answer">${item.answer || ''}</div>
      </div>
    `).join(''),
  };

  const sectionsHTML = sections.map(section => {
    const renderer = sectionRenderers[section.type] || sectionRenderers.rules;
    const itemsHTML = renderer(section.items || []);
    return `
      <section class="guide-section">
        <h2 class="section-title">${section.title}</h2>
        <div class="section-items">${itemsHTML}</div>
      </section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${guide.title}</title>
  <link rel="icon" href="https://seuzella.com/favicon.svg">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8faf8;
      color: #1a1a1a;
      line-height: 1.6;
      max-width: 480px;
      margin: 0 auto;
      padding: 0;
    }
    .guide-header {
      background: linear-gradient(135deg, #14532d 0%, #166534 40%, #16a34a 100%);
      color: white;
      padding: 32px 24px 24px;
      text-align: center;
    }
    .guide-header h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
    .guide-header .welcome { font-size: 14px; opacity: 0.9; }
    .guide-header img {
      width: 80px; height: 80px; border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.3); margin-bottom: 12px; object-fit: cover;
    }
    .guide-body { padding: 20px 24px 80px; }
    .guide-section { margin-bottom: 24px; }
    .section-title {
      font-size: 16px; font-weight: 600; color: #166534;
      padding-bottom: 8px; border-bottom: 2px solid #dcfce7; margin-bottom: 12px;
    }
    .essentials-item, .rule-item, .tip-item, .place-item, .emergency-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 10px 0; border-bottom: 1px solid #f0f0f0;
    }
    .essentials-icon, .rule-icon, .tip-icon, .place-icon, .emergency-icon {
      font-size: 18px; width: 32px; text-align: center; flex-shrink: 0;
    }
    .essentials-content, .rule-content, .tip-content, .place-content, .emergency-content { flex: 1; }
    .essentials-label, .rule-label, .place-name, .emergency-name { font-weight: 600; font-size: 14px; }
    .essentials-value, .rule-answer, .place-meta, .emergency-phone { font-size: 13px; color: #555; }
    .wifi-password, .pix-value { cursor: pointer; }
    .copy-btn {
      background: #16a34a; color: white; border: none; padding: 2px 8px;
      border-radius: 4px; font-size: 11px; cursor: pointer; margin-left: 4px;
    }
    .copy-btn:active { background: #15803d; }
    .place-rating { font-size: 12px; color: #777; }
    .faq-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .faq-question { font-weight: 600; font-size: 14px; }
    .faq-answer { font-size: 13px; color: #555; margin-top: 4px; }
    .emergency-item { background: #fef2f2; padding: 10px 12px; border-radius: 8px; border-bottom: none; margin-bottom: 8px; }
    .emergency-icon { color: #dc2626; }
    .guide-footer {
      text-align: center; padding: 16px 24px; font-size: 12px; color: #999;
      background: #f0f0f0;
    }
    .toast {
      position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
      background: #166534; color: white; padding: 8px 16px;
      border-radius: 8px; font-size: 13px; z-index: 999;
      opacity: 0; transition: opacity 0.3s;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
  ${imageUrl ? `
  <div class="guide-header">
    <img src="${imageUrl}" alt="${guide.title}" onerror="this.style.display='none'">
    <h1>${guide.title}</h1>
    <p class="welcome">${guide.welcomeMessage}</p>
  </div>` : `
  <div class="guide-header">
    <h1>${guide.title}</h1>
    <p class="welcome">${guide.welcomeMessage}</p>
  </div>`}

  <div class="guide-body">
    ${sectionsHTML}
  </div>

  <div class="guide-footer">
    Powered by <strong>Zélla</strong> — Gestão Inteligente de Hospedagem
  </div>

  <div class="toast" id="toast">Copiado!</div>

  <script>
    function copyPassword(text) {
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      });
    }
  </script>
</body>
</html>`;
}
