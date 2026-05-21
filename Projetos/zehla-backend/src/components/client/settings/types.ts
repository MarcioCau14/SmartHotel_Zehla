import { Building2, Wifi, Wind, Tv, Car, Waves, UtensilsCrossed, Snowflake, Bath, Coffee, type LucideIcon } from 'lucide-react';

export interface AccommodationType {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
}

export type RoomStatus = 'disponivel' | 'ocupado' | 'sujo' | 'manutencao';

export interface Room {
  id: string;
  number: string;
  typeId: string;
  floor: number;
  status: RoomStatus;
}

export interface WhatsAppConfig {
  connected: boolean;
  autoReply: boolean;
  welcomeMessage: string;
  checkinInstructions: string;
  wifiInfo: string;
  hoursInfo: string;
  whatsappType: 'GUESTS_ONLY' | 'GUESTS_AND_SUPPLIERS';
  supplierContact: string;
  ignoreSuppliers: boolean;
}

export interface PersonaConfig {
  formality: number;
  aggressiveness: 'PASSIVE' | 'CONSULTATIVE' | 'CLOSING';
  allowEmojis: boolean;
  style: 'REGIONAL' | 'EXECUTIVE' | 'RUSTIC' | 'MINIMALIST';
  useBrandDNA: boolean;
}

export interface PricingRule {
  id: string;
  typeId: string;
  altaPercent: number;
  baixaPercent: number;
  feriadoPercent: number;
  minPrice: number;
  maxPrice: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface NotificationPrefs {
  newReservations: boolean;
  checkins: boolean;
  checkouts: boolean;
  paymentAlerts: boolean;
  whatsappMessages: boolean;
  dailyReports: boolean;
}

export interface PropertyData {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  checkinTime: string;
  checkoutTime: string;
  propertyType: string;
  starRating: string;
}

export interface AmenityOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const amenityOptions: AmenityOption[] = [
  { key: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { key: 'ac', label: 'Ar Condicionado', icon: Wind },
  { key: 'tv', label: 'TV', icon: Tv },
  { key: 'parking', label: 'Estacionamento', icon: Car },
  { key: 'pool', label: 'Piscina', icon: Waves },
  { key: 'restaurant', label: 'Restaurante', icon: UtensilsCrossed },
  { key: 'minibar', label: 'Frigobar', icon: Snowflake },
  { key: 'bathtub', label: 'Banheira', icon: Bath },
  { key: 'coffee', label: 'Café da Manhã', icon: Coffee }
];

export const statusConfig: Record<RoomStatus, { label: string; color: string; dotColor: string }> = {
  disponivel: { label: 'Disponível', color: 'bg-orange-500/15 text-[#FF5500] border-[#FF5500]/30', dotColor: 'bg-[#FF5500]' },
  ocupado: { label: 'Ocupado', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dotColor: 'bg-blue-400' },
  sujo: { label: 'Sujo', color: 'bg-amber-500/15 text-[#FF5500] border-[#FF5500]/30', dotColor: 'bg-amber-400' },
  manutencao: { label: 'Manutenção', color: 'bg-red-500/15 text-red-400 border-red-500/30', dotColor: 'bg-red-400' }
};

export const darkInput = 'bg-[#242424] border border-[#363636] rounded-lg px-3 py-2 text-sm text-[#efefef] placeholder:text-[#363636] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors w-full';
export const darkSelectTrigger = 'bg-[#242424] border border-[#363636] rounded-lg px-3 py-2 text-sm text-[#efefef] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors w-full';
