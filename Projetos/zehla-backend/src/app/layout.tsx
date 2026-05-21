import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
