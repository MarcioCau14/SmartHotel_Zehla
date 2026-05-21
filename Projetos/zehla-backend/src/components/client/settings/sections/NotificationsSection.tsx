'use client';

import { Switch } from '@/components/ui/switch';
import { Bell, CalendarDays, DoorOpen, Clock, DollarSign, MessageCircle, BarChart3, type LucideIcon } from 'lucide-react';
import { type NotificationPrefs } from '../types';

interface Props {
  notifications: NotificationPrefs;
  onChange: (data: NotificationPrefs) => void;
}

const items: { key: keyof NotificationPrefs; label: string; desc: string; icon: LucideIcon }[] = [
  { key: 'newReservations', label: 'Novas reservas', desc: 'Receber alerta quando uma nova reserva for feita', icon: CalendarDays },
  { key: 'checkins', label: 'Check-ins', desc: 'Notificar quando um hóspede realizar check-in', icon: DoorOpen },
  { key: 'checkouts', label: 'Check-outs', desc: 'Notificar quando um hóspede realizar check-out', icon: Clock },
  { key: 'paymentAlerts', label: 'Alertas de pagamento', desc: 'Notificar sobre pagamentos recebidos ou falhas', icon: DollarSign },
  { key: 'whatsappMessages', label: 'Mensagens do WhatsApp', desc: 'Notificar sobre novas mensagens recebidas', icon: MessageCircle },
  { key: 'dailyReports', label: 'Relatórios diários', desc: 'Receber relatório de ocupação e receita por e-mail', icon: BarChart3 }
];

export function NotificationsSection({ notifications, onChange }: Props) {
  return (
    <div className="mt-2 space-y-1">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center">
              <item.icon className="w-4 h-4 text-[#4d4d4d]" />
            </div>
            <div>
              <div className="text-sm text-[#efefef]">{item.label}</div>
              <div className="text-[11px] text-[#4d4d4d]">{item.desc}</div>
            </div>
          </div>
          <Switch
            checked={notifications[item.key]}
            onCheckedChange={(checked) => onChange({ ...notifications, [item.key]: checked })}
          />
        </div>
      ))}
    </div>
  );
}
