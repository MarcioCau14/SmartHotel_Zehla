import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from '@/components/providers/query-provider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secretaria.ai — Relationship OS",
  description: "Mission control for elite sports sponsorship hunting. Relationship Operating System powered by AI.",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Secretaria.ai — Relationship OS",
    description: "AI-powered relationship operating system for sports sponsorships",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster
          theme="dark"
          richColors
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              color: '#f1f5f9',
            },
          }}
        />
      </body>
    </html>
  );
}

