export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

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
