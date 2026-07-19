// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ZCC Pulse Socket.io API Route — Initializes the Socket.io server
// This route handles the HTTP part of the Socket.io handshake
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest } from 'next/server';

// This route is used by Socket.io for polling transport fallback
// The actual WebSocket upgrade is handled by the server instrumentation file

export async function GET(request: NextRequest) {
  // Socket.io will handle the upgrade internally
  // This route exists so Next.js doesn't return 404 for the path
  return new Response('Socket.io endpoint — use WebSocket client to connect', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

export async function POST(request: NextRequest) {
  return new Response('Socket.io endpoint — use WebSocket client to connect', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
