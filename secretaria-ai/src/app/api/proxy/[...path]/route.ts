import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const urlPath = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  const targetUrl = `http://127.0.0.1:8000/${urlPath}${queryString}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Back-end indisponível na porta 8000. Verifique se o servidor FastAPI está rodando.' },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const urlPath = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  const targetUrl = `http://127.0.0.1:8000/${urlPath}${queryString}`;

  try {
    let body: string | undefined;
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      body = await request.text();
    }

    const upstreamResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${upstreamResponse.status}` },
        { status: upstreamResponse.status }
      );
    }

    /* ── SSE STREAMING ──
       If the backend returns text/event-stream, proxy it as-is.
       The readable body stream passes through without buffering. */
    const upstreamContentType = upstreamResponse.headers.get('content-type') || '';
    if (
      upstreamContentType.includes('text/event-stream') ||
      upstreamContentType.includes('application/x-ndjson')
    ) {
      return new NextResponse(upstreamResponse.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    /* ── REGULAR JSON ── */
    const data = await upstreamResponse.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Back-end indisponível na porta 8000. Verifique se o servidor FastAPI está rodando.' },
      { status: 502 }
    );
  }
}
