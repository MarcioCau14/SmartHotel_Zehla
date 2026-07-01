import { NextResponse } from 'next/server';

interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export function sendError(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const payload: ErrorPayload = { code, message };
  if (details !== undefined) payload.details = details;
  return NextResponse.json({ success: false, error: payload }, { status });
}
