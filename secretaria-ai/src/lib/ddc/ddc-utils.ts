export { formatCurrency, formatTimeAgo, getGuestStatusColor } from '@/lib/utils';

export function formatPhoneNumber(phone: string): string {
  return phone;
}

export function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export function formatDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function getBookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-emerald-500',
    checked_in: 'bg-blue-500',
    checked_out: 'bg-gray-500',
    cancelled: 'bg-red-500',
    no_show: 'bg-orange-500'
  };
  return colors[status] || 'bg-slate-500';
}
