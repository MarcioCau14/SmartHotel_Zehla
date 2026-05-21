import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
