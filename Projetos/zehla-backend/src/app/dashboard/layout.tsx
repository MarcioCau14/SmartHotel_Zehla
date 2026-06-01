import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function DashboardLayoutRoute({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
