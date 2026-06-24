import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

export function formatTimeAgo(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return 'sem dados';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'sem dados';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
}

export function getGuestStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-500',
    warm: 'bg-yellow-500',
    hot: 'bg-orange-500',
    cold: 'bg-blue-300',
    booked: 'bg-emerald-500',
    staying: 'bg-purple-500',
    checked_out: 'bg-gray-500',
    closed: 'bg-emerald-600',
    lost: 'bg-red-500',
    inactive: 'bg-slate-500'
  };
  return colors[status] || 'bg-slate-500';
}
