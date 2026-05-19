import { SessionProvider } from "next-auth/react";


"use client";


export function NextAuthProvider(: void { children }: { children: React.ReactNode }) {
  try {
  return <SessionProvider>{children}</SessionProvider>;
}
