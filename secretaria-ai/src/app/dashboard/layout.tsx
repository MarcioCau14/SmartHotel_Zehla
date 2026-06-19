import type { Metadata } from 'next';
import { QueryProvider } from '@/components/providers/query-provider';

export const metadata: Metadata = {
  title: 'Dashboard - ZELLA DDC',
  description: 'Cognitive OS Command Center - Dashboard do Cliente',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}