import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Toaster } from "@/components/ui/toaster";

import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZEHLA — SmartHotel Cognitive OS",
  description: "Sistema Operacional Cognitivo para Pousadas — Automação inteligente com IA para hotelaria brasileira",
  keywords: ["ZEHLA", "SmartHotel", "IA", "hotelaria", "pousadas", "Brasil", "cognitive OS"],
  authors: [{ name: "ZEHLA Team" }],
  openGraph: {
    title: "ZEHLA — SmartHotel Cognitive OS",
    description: "Sistema Operacional Cognitivo para Pousadas",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-neutral-200`}
      >
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
