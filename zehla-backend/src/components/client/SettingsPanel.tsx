'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  BedDouble,
  DoorOpen,
  MessageCircle,
  DollarSign,
  Users,
  Bell,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Save,
  ChevronDown,
  Wifi,
  Wind,
  Tv,
  Car,
  Waves,
  UtensilsCrossed,
  Snowflake,
  Bath,
  Coffee,
  QrCode,
  Zap,
  Clock,
  Shield,
  Eye,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

/* ────────────────────────────────────────────
   DEMO DATA
   ──────────────────────────────────────────── */

// Section 1 — Property Data
const initialProperty = {
  name: 'Pousada Maravilha',
  cnpj: '12.345.678/0001-90',
  address: 'Rua das Conchas, 45 — Praia do Cachorro',
  city: 'Fernando de Noronha',
  state: 'PE',
  phone: '(81) 3619-1234',
  email: 'contato@pousadamaravilha.com.br',
  checkinTime: '14:00',
  checkoutTime: '11:00',
  propertyType: 'pousada',
  starRating: '4',
};

// Section 2 — Accommodation Types
interface AccommodationType {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
  amenities: string[];
}

const amenityOptions = [
  { key: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { key: 'ac', label: 'Ar Condicionado', icon: Wind },
  { key: 'tv', label: 'TV', icon: Tv },
  { key: 'parking', label: 'Estacionamento', icon: Car },
  { key: 'pool', label: 'Piscina', icon: Waves },
  { key: 'restaurant', label: 'Restaurante', icon: UtensilsCrossed },
  { key: 'minibar', label: 'Frigobar', icon: Snowflake },
  { key: 'bathtub', label: 'Banheira', icon: Bath },
  { key: 'coffee', label: 'Café da Manhã', icon: Coffee },
];

const initialAccommodationTypes: AccommodationType[] = [
  {
    id: 'at-1',
    name: 'Standard',
    capacity: 2,
    basePrice: 280,
    amenities: ['wifi', 'ac', 'tv', 'coffee'],
  },
  {
    id: 'at-2',
    name: 'Superior',
    capacity: 2,
    basePrice: 420,
    amenities: ['wifi', 'ac', 'tv', 'minibar', 'coffee', 'bathtub'],
  },
  {
    id: 'at-3',
    name: 'Suíte Premium',
    capacity: 3,
    basePrice: 580,
    amenities: ['wifi', 'ac', 'tv', 'minibar', 'coffee', 'bathtub', 'pool', 'restaurant'],
  },
  {
    id: 'at-4',
    name: 'Chalé Família',
    capacity: 5,
    basePrice: 780,
    amenities: ['wifi', 'ac', 'tv', 'parking', 'minibar', 'coffee', 'bathtub', 'pool', 'restaurant'],
  },
];

// Section 3 — Rooms
type RoomStatus = 'disponivel' | 'ocupado' | 'sujo' | 'manutencao';

interface Room {
  id: string;
  number: string;
  typeId: string;
  floor: number;
  status: RoomStatus;
}

const statusConfig: Record<RoomStatus, { label: string; color: string; dotColor: string }> = {
  disponivel: { label: 'Disponível', color: 'bg-orange-500/15 text-[#FF5500] border-[#FF5500]/30', dotColor: 'bg-[#FF5500]' },
  ocupado: { label: 'Ocupado', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dotColor: 'bg-blue-400' },
  sujo: { label: 'Sujo', color: 'bg-amber-500/15 text-[#FF5500] border-[#FF5500]/30', dotColor: 'bg-amber-400' },
  manutencao: { label: 'Manutenção', color: 'bg-red-500/15 text-red-400 border-red-500/30', dotColor: 'bg-red-400' },
};

const initialRooms: Room[] = [
  { id: 'r-1', number: '101', typeId: 'at-1', floor: 1, status: 'disponivel' },
  { id: 'r-2', number: '102', typeId: 'at-1', floor: 1, status: 'ocupado' },
  { id: 'r-3', number: '103', typeId: 'at-2', floor: 1, status: 'sujo' },
  { id: 'r-4', number: '201', typeId: 'at-2', floor: 2, status: 'disponivel' },
  { id: 'r-5', number: '202', typeId: 'at-3', floor: 2, status: 'ocupado' },
  { id: 'r-6', number: '203', typeId: 'at-3', floor: 2, status: 'disponivel' },
  { id: 'r-7', number: '301', typeId: 'at-4', floor: 3, status: 'manutencao' },
  { id: 'r-8', number: '302', typeId: 'at-4', floor: 3, status: 'disponivel' },
];

// Section 4 — WhatsApp
interface WhatsAppConfig {
  connected: boolean;
  autoReply: boolean;
  welcomeMessage: string;
  checkinInstructions: string;
  wifiInfo: string;
  hoursInfo: string;
}

const initialWhatsApp: WhatsAppConfig = {
  connected: false,
  autoReply: false,
  welcomeMessage: 'Olá! 👋 Bem-vindo(a) à Pousada Maravilha! Somos felizes em recebê-lo(a) em Noronha. Se precisar de algo, é só chamar!',
  checkinInstructions: '🏨 Seu check-in é às 14h. Apresente seu documento e comprovante de reserva na recepção. A chave do quarto será entregue após a confirmação.',
  wifiInfo: '📶 Rede: PousadaMaravilha_Guest | Senha: maravilha2024',
  hoursInfo: '🏊 Piscina: 07h–22h | 🍽️ Restaurante: 07h–10h (café) e 12h–22h (almoço/jantar) | 🧹 Limpeza diária: 09h–15h',
};

// Section 5 — Dynamic Pricing
interface PricingRule {
  id: string;
  typeId: string;
  altaPercent: number;
  baixaPercent: number;
  feriadoPercent: number;
  minPrice: number;
  maxPrice: number;
}

const initialPricingRules: PricingRule[] = [
  { id: 'pr-1', typeId: 'at-1', altaPercent: 30, baixaPercent: 15, feriadoPercent: 45, minPrice: 200, maxPrice: 450 },
  { id: 'pr-2', typeId: 'at-2', altaPercent: 25, baixaPercent: 15, feriadoPercent: 40, minPrice: 320, maxPrice: 650 },
  { id: 'pr-3', typeId: 'at-3', altaPercent: 25, baixaPercent: 10, feriadoPercent: 35, minPrice: 450, maxPrice: 850 },
  { id: 'pr-4', typeId: 'at-4', altaPercent: 20, baixaPercent: 10, feriadoPercent: 30, minPrice: 600, maxPrice: 1100 },
];

// Section 6 — Team
interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

const initialTeam: TeamMember[] = [
  { id: 'tm-1', name: 'Carla Mendes', role: 'Gerente', phone: '(81) 99876-5432', email: 'carla@pousadamaravilha.com.br' },
  { id: 'tm-2', name: 'Rafael Costa', role: 'Recepcionista', phone: '(81) 99123-4567', email: 'rafael@pousadamaravilha.com.br' },
  { id: 'tm-3', name: 'Ana Beatriz Lima', role: 'Recepcionista', phone: '(81) 99876-1234', email: 'anab@pousadamaravilha.com.br' },
  { id: 'tm-4', name: 'Maria das Neves', role: 'Camareira', phone: '(81) 99345-6789', email: 'maria@pousadamaravilha.com.br' },
  { id: 'tm-5', name: 'José Carlos Silva', role: 'Manutenção', phone: '(81) 99456-7890', email: 'jose@pousadamaravilha.com.br' },
];

// Section 7 — Notifications
interface NotificationPrefs {
  newReservations: boolean;
  checkins: boolean;
  checkouts: boolean;
  paymentAlerts: boolean;
  whatsappMessages: boolean;
  dailyReports: boolean;
}

const initialNotifications: NotificationPrefs = {
  newReservations: true,
  checkins: true,
  checkouts: true,
  paymentAlerts: true,
  whatsappMessages: false,
  dailyReports: true,
};

/* ────────────────────────────────────────────
   HELPER: Dark input class
   ──────────────────────────────────────────── */
const darkInput = 'bg-[#242424] border border-[#363636] rounded-lg px-3 py-2 text-sm text-[#efefef] placeholder:text-[#363636] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors w-full';
const darkSelectTrigger = 'bg-[#242424] border border-[#363636] rounded-lg px-3 py-2 text-sm text-[#efefef] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors w-full';

/* ────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────── */

export function SettingsPanel() {
  const { toast } = useToast();

  // Section 1
  const [property, setProperty] = useState(initialProperty);

  // Section 2
  const [accommodationTypes, setAccommodationTypes] = useState<AccommodationType[]>(initialAccommodationTypes);
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCapacity, setNewTypeCapacity] = useState(2);
  const [newTypePrice, setNewTypePrice] = useState(300);
  const [newTypeAmenities, setNewTypeAmenities] = useState<string[]>([]);

  // Section 3
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomTypeId, setNewRoomTypeId] = useState('at-1');
  const [newRoomFloor, setNewRoomFloor] = useState(1);
  const [newRoomStatus, setNewRoomStatus] = useState<RoomStatus>('disponivel');

  // Section 4
  const [whatsapp, setWhatsapp] = useState<WhatsAppConfig>(initialWhatsApp);

  // Section 5
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(initialPricingRules);
  const [competitorPricing, setCompetitorPricing] = useState(false);

  // Section 6
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Recepcionista');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Section 7
  const [notifications, setNotifications] = useState<NotificationPrefs>(initialNotifications);

  // ── Handlers ──

  const getTypeName = (typeId: string) => accommodationTypes.find(t => t.id === typeId)?.name || 'N/A';

  const toggleAmenity = (key: string) => {
    setNewTypeAmenities(prev =>
      prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
    );
  };

  const addAccommodationType = () => {
    if (!newTypeName.trim()) return;
    const newType: AccommodationType = {
      id: `at-${Date.now()}`,
      name: newTypeName.trim(),
      capacity: newTypeCapacity,
      basePrice: newTypePrice,
      amenities: newTypeAmenities,
    };
    setAccommodationTypes(prev => [...prev, newType]);
    setNewTypeName('');
    setNewTypeCapacity(2);
    setNewTypePrice(300);
    setNewTypeAmenities([]);
    setShowAddType(false);
    toast({ title: 'Tipo adicionado', description: `"${newType.name}" foi adicionado com sucesso.` });
  };

  const removeAccommodationType = (id: string) => {
    setAccommodationTypes(prev => prev.filter(t => t.id !== id));
  };

  const addRoom = () => {
    if (!newRoomNumber.trim()) return;
    const newRoom: Room = {
      id: `r-${Date.now()}`,
      number: newRoomNumber.trim(),
      typeId: newRoomTypeId,
      floor: newRoomFloor,
      status: newRoomStatus,
    };
    setRooms(prev => [...prev, newRoom]);
    setNewRoomNumber('');
    setNewRoomTypeId('at-1');
    setNewRoomFloor(1);
    setNewRoomStatus('disponivel');
    setShowAddRoom(false);
    toast({ title: 'Quarto adicionado', description: `Quarto ${newRoom.number} criado com sucesso.` });
  };

  const removeRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const addTeamMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    const member: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newMemberName.trim(),
      role: newMemberRole,
      phone: newMemberPhone.trim(),
      email: newMemberEmail.trim(),
    };
    setTeam(prev => [...prev, member]);
    setNewMemberName('');
    setNewMemberRole('Recepcionista');
    setNewMemberPhone('');
    setNewMemberEmail('');
    setShowAddMember(false);
    toast({ title: 'Membro adicionado', description: `${member.name} entrou para a equipe.` });
  };

  const removeTeamMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
  };

  const handleSave = () => {
    toast({
      title: 'Configurações salvas',
      description: 'Todas as alterações foram salvas com sucesso.',
    });
  };

  const updatePricingRule = (id: string, field: keyof PricingRule, value: number) => {
    setPricingRules(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  /* ────────────────────────────────────────────
     RENDER
     ──────────────────────────────────────────── */

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#FF5500]" />
            Configurações
          </h1>
          <p className="text-sm text-[#4d4d4d] mt-1">Gerencie todas as configurações da sua propriedade</p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          Salvar Configurações
        </Button>
      </div>

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={['section-1']} className="space-y-2">

        {/* ═══════════ SECTION 1: Dados da Propriedade ═══════════ */}
        <AccordionItem value="section-1" className="glass-card border-[#2e2e2e] rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 text-[#fafafa] hover:no-underline hover:text-[#FF5500] transition-colors [&>svg]:text-[#4d4d4d]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#FF5500]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Dados da Propriedade</div>
                <div className="text-xs text-[#4d4d4d]">Informações cadastrais e operacionais</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="sm:col-span-2">
                <label className="text-xs text-[#4d4d4d] mb-1 block">Nome da Propriedade</label>
                <Input
                  value={property.name}
                  onChange={e => setProperty({ ...property, name: e.target.value })}
                  className={darkInput}
                />
              </div>
              <div>
                <label className="text-xs text-[#4d4d4d] mb-1 block">CNPJ</label>
                <Input
                  value={property.cnpj}
                  onChange={e => setProperty({ ...property, cnpj: e.target.value })}
                  className={darkInput}
                />
              </div>
              <div>
                <label className="text-xs text-[#4d4d4d] mb-1 block">Telefone</label>
                <Input
                  value={property.phone}
                  onChange={e => setProperty({ ...property, phone: e.target.value })}
                  className={darkInput}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-[#4d4d4d] mb-1 block">Endereço</label>
                <Input
                  value={property.address}
                  onChange={e => setProperty({ ...property, address: e.target.value })}
                  className={darkInput}
                />
              </div>
              <div>
                <label className="text-xs text-[#4d4d4d] mb-1 block">Cidade</label>
                <Input
                  value={property.city}
                  onChange={e => setProperty({ ...property, city: e.target.value })}
                  className={darkInput}
                />
              </div>
              <div>
                <label className="text-xs text-[#4d4d4d] mb-1 block">Estado</label>
                <Input
                  value={property.state}
                  onChange={e => setProperty({ ...property, state: e.target.value })}
                  className={darkInput}
                />
              </div>
              <div>
                <label className="text-xs text-[#4d4d4d] mb-1 block">E-mail</label>
                <Input
                  value={property.email}
                  onChange={e => setProperty({ ...property, email: e.target.value })}
                  className={darkInput}
                />
              </div>
              <div>
                <label className="text-xs text-[#4d4d4d] mb-1 block">Tipo de Propriedade</label>
                <Select
                  value={property.propertyType}
                  onValueChange={v => setProperty({ ...property, propertyType: v })}
                >
                  <SelectTrigger className={darkSelectTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-[#363636]">
                    <SelectItem value="pousada">Pousada</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="fazenda">Fazenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-[#4d4d4d] mb-1 block">Check-in</label>
                <Input
                  type="time"
                  value={property.checkinTime}
                  onChange={e => setProperty({ ...property, checkinTime: e.target.value })}
                  className={darkInput}
                />
              </div>
              <div>
                <label className="text-xs text-[#4d4d4d] mb-1 block">Check-out</label>
                <Input
                  type="time"
                  value={property.checkoutTime}
                  onChange={e => setProperty({ ...property, checkoutTime: e.target.value })}
                  className={darkInput}
                />
              </div>
              <div>
                <label className="text-xs text-[#4d4d4d] mb-1 block">Classificação (Estrelas)</label>
                <Select
                  value={property.starRating}
                  onValueChange={v => setProperty({ ...property, starRating: v })}
                >
                  <SelectTrigger className={darkSelectTrigger}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-[#363636]">
                    <SelectItem value="3">⭐⭐⭐ (3 estrelas)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (4 estrelas)</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5 estrelas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══════════ SECTION 2: Tipos de Acomodação ═══════════ */}
        <AccordionItem value="section-2" className="glass-card border-[#2e2e2e] rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 text-[#fafafa] hover:no-underline hover:text-[#FF5500] transition-colors [&>svg]:text-[#4d4d4d]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center">
                <BedDouble className="w-4 h-4 text-[#FF5500]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Tipos de Acomodação</div>
                <div className="text-xs text-[#4d4d4d]">{accommodationTypes.length} tipos cadastrados</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="space-y-3 mt-2">
              {accommodationTypes.map(type => (
                <motion.div
                  key={type.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-[#fafafa]">{type.name}</span>
                        <Badge variant="outline" className="bg-[#FF5500]/10 text-[#FF5500] border-purple-500/20 text-[10px]">
                          {type.capacity} hóspede{type.capacity > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="text-sm text-[#FF5500] font-medium mb-2">
                        R$ {type.basePrice.toLocaleString('pt-BR')},00 <span className="text-[#4d4d4d] text-xs">/noite</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {type.amenities.map(amenityKey => {
                          const amenity = amenityOptions.find(a => a.key === amenityKey);
                          if (!amenity) return null;
                          return (
                            <span key={amenityKey} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#242424] text-[10px] text-[#898989]">
                              <amenity.icon className="w-3 h-3" />
                              {amenity.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#363636] hover:text-red-400 hover:bg-red-500/10 shrink-0"
                      onClick={() => removeAccommodationType(type.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {/* Add new type */}
              <AnimatePresence>
                {showAddType && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="bg-white/[0.02] border border-dashed border-[#FF5500]/30 rounded-xl p-4 space-y-3"
                  >
                    <div className="text-xs font-semibold text-[#FF5500]">Novo Tipo de Acomodação</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        placeholder="Nome do tipo"
                        value={newTypeName}
                        onChange={e => setNewTypeName(e.target.value)}
                        className={darkInput}
                      />
                      <Input
                        type="number"
                        placeholder="Capacidade"
                        value={newTypeCapacity}
                        onChange={e => setNewTypeCapacity(Number(e.target.value))}
                        className={darkInput}
                      />
                      <Input
                        type="number"
                        placeholder="Preço base (R$)"
                        value={newTypePrice}
                        onChange={e => setNewTypePrice(Number(e.target.value))}
                        className={darkInput}
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#4d4d4d] mb-2">Comodidades</div>
                      <div className="flex flex-wrap gap-2">
                        {amenityOptions.map(a => (
                          <button
                            key={a.key}
                            type="button"
                            onClick={() => toggleAmenity(a.key)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                              newTypeAmenities.includes(a.key)
                                ? 'bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/30'
                                : 'bg-[#242424] text-[#4d4d4d] border border-[#363636] hover:bg-[#2e2e2e]'
                            }`}
                          >
                            <a.icon className="w-3 h-3" />
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addAccommodationType} className="bg-orange-500 hover:bg-orange-600 text-white">
                        Adicionar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddType(false)} className="text-[#898989]">
                        Cancelar
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showAddType && (
                <Button
                  variant="outline"
                  className="w-full border-dashed border-[#363636] text-[#4d4d4d] hover:text-[#FF5500] hover:border-[#FF5500]/30 hover:bg-orange-500/5"
                  onClick={() => setShowAddType(true)}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Tipo de Acomodação
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══════════ SECTION 3: Quartos ═══════════ */}
        <AccordionItem value="section-3" className="glass-card border-[#2e2e2e] rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 text-[#fafafa] hover:no-underline hover:text-[#FF5500] transition-colors [&>svg]:text-[#4d4d4d]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DoorOpen className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Quartos</div>
                <div className="text-xs text-[#4d4d4d]">{rooms.length} quartos cadastrados</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="mt-2">
              {/* Room grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rooms.map(room => {
                  const st = statusConfig[room.status];
                  return (
                    <motion.div
                      key={room.id}
                      layout
                      className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-3 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#fafafa]">#{room.number}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-[#363636] hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => removeRoom(room.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#4d4d4d]">Tipo</span>
                          <span className="text-xs text-[#b4b4b4]">{getTypeName(room.typeId)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#4d4d4d]">Andar</span>
                          <span className="text-xs text-[#b4b4b4]">{room.floor}º</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#4d4d4d]">Status</span>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border ${st.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor}`} />
                            {st.label}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Add new room */}
              <AnimatePresence>
                {showAddRoom && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="mt-4 bg-white/[0.02] border border-dashed border-[#FF5500]/30 rounded-xl p-4 space-y-3"
                  >
                    <div className="text-xs font-semibold text-[#FF5500]">Novo Quarto</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input
                        placeholder="Nº Quarto"
                        value={newRoomNumber}
                        onChange={e => setNewRoomNumber(e.target.value)}
                        className={darkInput}
                      />
                      <Select value={newRoomTypeId} onValueChange={setNewRoomTypeId}>
                        <SelectTrigger className={darkSelectTrigger}>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-[#363636]">
                          {accommodationTypes.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Andar"
                        value={newRoomFloor}
                        onChange={e => setNewRoomFloor(Number(e.target.value))}
                        className={darkInput}
                      />
                      <Select value={newRoomStatus} onValueChange={(v: RoomStatus) => setNewRoomStatus(v)}>
                        <SelectTrigger className={darkSelectTrigger}>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-[#363636]">
                          <SelectItem value="disponivel">Disponível</SelectItem>
                          <SelectItem value="ocupado">Ocupado</SelectItem>
                          <SelectItem value="sujo">Sujo</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addRoom} className="bg-orange-500 hover:bg-orange-600 text-white">
                        Adicionar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddRoom(false)} className="text-[#898989]">
                        Cancelar
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showAddRoom && (
                <Button
                  variant="outline"
                  className="w-full border-dashed border-[#363636] text-[#4d4d4d] hover:text-[#FF5500] hover:border-[#FF5500]/30 hover:bg-orange-500/5 mt-4"
                  onClick={() => setShowAddRoom(true)}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Quarto
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══════════ SECTION 4: WhatsApp ═══════════ */}
        <AccordionItem value="section-4" className="glass-card border-[#2e2e2e] rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 text-[#fafafa] hover:no-underline hover:text-[#FF5500] transition-colors [&>svg]:text-[#4d4d4d]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">WhatsApp</div>
                <div className="text-xs text-[#4d4d4d]">Mensagens e atendimento automático</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="mt-2 space-y-5">
              {/* Connection status */}
              <div className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${whatsapp.connected ? 'bg-green-400 animate-zehla-pulse' : 'bg-red-400'}`} />
                    <span className={`text-sm font-medium ${whatsapp.connected ? 'text-green-400' : 'text-red-400'}`}>
                      {whatsapp.connected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 text-xs">
                    <QrCode className="w-3.5 h-3.5" />
                    Escanear QR Code
                  </Button>
                </div>
                {/* QR placeholder */}
                <div className="w-full max-w-[200px] mx-auto aspect-square bg-[#242424] border border-dashed border-[#363636] rounded-xl flex flex-col items-center justify-center gap-2">
                  <QrCode className="w-10 h-10 text-[#363636]" />
                  <span className="text-[10px] text-[#363636]">QR Code aparecerá aqui</span>
                </div>
              </div>

              {/* Auto-reply toggle */}
              <div className="flex items-center justify-between bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4">
                <div>
                  <div className="text-sm font-medium text-[#efefef]">Atendimento automático pelo ZEHLA</div>
                  <div className="text-xs text-[#4d4d4d] mt-0.5">Respostas automáticas para hóspedes via WhatsApp</div>
                </div>
                <Switch
                  checked={whatsapp.autoReply}
                  onCheckedChange={checked => setWhatsapp({ ...whatsapp, autoReply: checked })}
                />
              </div>

              {/* Templates */}
              {whatsapp.autoReply && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs text-[#4d4d4d] mb-1.5 block">👋 Mensagem de Boas-vindas</label>
                    <textarea
                      value={whatsapp.welcomeMessage}
                      onChange={e => setWhatsapp({ ...whatsapp, welcomeMessage: e.target.value })}
                      className={`${darkInput} min-h-[80px] resize-none`}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#4d4d4d] mb-1.5 block">🏨 Instruções de Check-in</label>
                    <textarea
                      value={whatsapp.checkinInstructions}
                      onChange={e => setWhatsapp({ ...whatsapp, checkinInstructions: e.target.value })}
                      className={`${darkInput} min-h-[80px] resize-none`}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#4d4d4d] mb-1.5 block">📶 Informações de Wi-Fi</label>
                    <textarea
                      value={whatsapp.wifiInfo}
                      onChange={e => setWhatsapp({ ...whatsapp, wifiInfo: e.target.value })}
                      className={`${darkInput} min-h-[60px] resize-none`}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#4d4d4d] mb-1.5 block">🏊 Horários (Piscina, Restaurante, etc.)</label>
                    <textarea
                      value={whatsapp.hoursInfo}
                      onChange={e => setWhatsapp({ ...whatsapp, hoursInfo: e.target.value })}
                      className={`${darkInput} min-h-[80px] resize-none`}
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══════════ SECTION 5: Precificação Dinâmica ═══════════ */}
        <AccordionItem value="section-5" className="glass-card border-[#2e2e2e] rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 text-[#fafafa] hover:no-underline hover:text-[#FF5500] transition-colors [&>svg]:text-[#4d4d4d]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-[#FF5500]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Precificação Dinâmica</div>
                <div className="text-xs text-[#4d4d4d]">Regras de preço por temporada</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="mt-2 space-y-4">
              {/* Competitor toggle */}
              <div className="flex items-center justify-between bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-[#FF5500]" />
                  <div>
                    <div className="text-sm font-medium text-[#efefef]">Precificação baseada em concorrentes</div>
                    <div className="text-xs text-[#4d4d4d]">Ajuste automático de preços com base no mercado</div>
                  </div>
                </div>
                <Switch
                  checked={competitorPricing}
                  onCheckedChange={setCompetitorPricing}
                />
              </div>

              {/* Rules per type */}
              {pricingRules.map(rule => (
                <div key={rule.id} className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#fafafa]">{getTypeName(rule.typeId)}</span>
                    <span className="text-xs text-[#4d4d4d]">
                      Base: R$ {accommodationTypes.find(t => t.id === rule.typeId)?.basePrice.toLocaleString('pt-BR')},00
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[#4d4d4d] mb-1 block">Alta Temporada (%)</label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#FF5500]">+</span>
                        <Input
                          type="number"
                          value={rule.altaPercent}
                          onChange={e => updatePricingRule(rule.id, 'altaPercent', Number(e.target.value))}
                          className={darkInput}
                        />
                        <span className="text-xs text-[#4d4d4d]">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#4d4d4d] mb-1 block">Baixa Temporada (%)</label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-blue-400">−</span>
                        <Input
                          type="number"
                          value={rule.baixaPercent}
                          onChange={e => updatePricingRule(rule.id, 'baixaPercent', Number(e.target.value))}
                          className={darkInput}
                        />
                        <span className="text-xs text-[#4d4d4d]">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#4d4d4d] mb-1 block">Feriados (%)</label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#FF5500]">+</span>
                        <Input
                          type="number"
                          value={rule.feriadoPercent}
                          onChange={e => updatePricingRule(rule.id, 'feriadoPercent', Number(e.target.value))}
                          className={darkInput}
                        />
                        <span className="text-xs text-[#4d4d4d]">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2e2e2e]">
                    <div>
                      <label className="text-[10px] text-[#4d4d4d] mb-1 block">Preço Mínimo (R$)</label>
                      <Input
                        type="number"
                        value={rule.minPrice}
                        onChange={e => updatePricingRule(rule.id, 'minPrice', Number(e.target.value))}
                        className={darkInput}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#4d4d4d] mb-1 block">Preço Máximo (R$)</label>
                      <Input
                        type="number"
                        value={rule.maxPrice}
                        onChange={e => updatePricingRule(rule.id, 'maxPrice', Number(e.target.value))}
                        className={darkInput}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══════════ SECTION 6: Equipe ═══════════ */}
        <AccordionItem value="section-6" className="glass-card border-[#2e2e2e] rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 text-[#fafafa] hover:no-underline hover:text-[#FF5500] transition-colors [&>svg]:text-[#4d4d4d]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF5500]/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-[#FF5500]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Equipe</div>
                <div className="text-xs text-[#4d4d4d]">{team.length} membros</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="mt-2 space-y-3">
              {team.map(member => {
                const roleColors: Record<string, string> = {
                  Gerente: 'bg-purple-500/15 text-[#FF5500] border-[#FF5500]/30',
                  Recepcionista: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                  Camareira: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
                  Manutenção: 'bg-amber-500/15 text-[#FF5500] border-[#FF5500]/30',
                };
                return (
                  <motion.div
                    key={member.id}
                    layout
                    className="bg-white/[0.03] border border-[#2e2e2e] rounded-xl p-4 group flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-[#242424] border border-[#363636] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#898989]">
                          {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-[#fafafa] truncate">{member.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${roleColors[member.role] || 'bg-[#242424] text-[#898989] border-[#363636]'}`}>
                            {member.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#4d4d4d] truncate">
                          {member.email} · {member.phone}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#363636] hover:text-red-400 hover:bg-red-500/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeTeamMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                );
              })}

              {/* Add new member */}
              <AnimatePresence>
                {showAddMember && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="bg-white/[0.02] border border-dashed border-[#FF5500]/30 rounded-xl p-4 space-y-3"
                  >
                    <div className="text-xs font-semibold text-[#FF5500]">Novo Membro</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Nome completo"
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        className={darkInput}
                      />
                      <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                        <SelectTrigger className={darkSelectTrigger}>
                          <SelectValue placeholder="Cargo" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-[#363636]">
                          <SelectItem value="Gerente">Gerente</SelectItem>
                          <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                          <SelectItem value="Camareira">Camareira</SelectItem>
                          <SelectItem value="Manutenção">Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Telefone"
                        value={newMemberPhone}
                        onChange={e => setNewMemberPhone(e.target.value)}
                        className={darkInput}
                      />
                      <Input
                        placeholder="E-mail"
                        value={newMemberEmail}
                        onChange={e => setNewMemberEmail(e.target.value)}
                        className={darkInput}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addTeamMember} className="bg-orange-500 hover:bg-orange-600 text-white">
                        Adicionar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddMember(false)} className="text-[#898989]">
                        Cancelar
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showAddMember && (
                <Button
                  variant="outline"
                  className="w-full border-dashed border-[#363636] text-[#4d4d4d] hover:text-[#FF5500] hover:border-[#FF5500]/30 hover:bg-orange-500/5"
                  onClick={() => setShowAddMember(true)}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Membro
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══════════ SECTION 7: Notificações ═══════════ */}
        <AccordionItem value="section-7" className="glass-card border-[#2e2e2e] rounded-xl overflow-hidden">
          <AccordionTrigger className="px-5 py-4 text-[#fafafa] hover:no-underline hover:text-[#FF5500] transition-colors [&>svg]:text-[#4d4d4d]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Notificações</div>
                <div className="text-xs text-[#4d4d4d]">Preferências de alertas</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <div className="mt-2 space-y-1">
              {([
                { key: 'newReservations' as const, label: 'Novas reservas', desc: 'Receber alerta quando uma nova reserva for feita', icon: CalendarDays },
                { key: 'checkins' as const, label: 'Check-ins', desc: 'Notificar quando um hóspede realizar check-in', icon: DoorOpen },
                { key: 'checkouts' as const, label: 'Check-outs', desc: 'Notificar quando um hóspede realizar check-out', icon: Clock },
                { key: 'paymentAlerts' as const, label: 'Alertas de pagamento', desc: 'Notificar sobre pagamentos recebidos ou falhas', icon: DollarSign },
                { key: 'whatsappMessages' as const, label: 'Mensagens do WhatsApp', desc: 'Notificar sobre novas mensagens recebidas', icon: MessageCircle },
                { key: 'dailyReports' as const, label: 'Relatórios diários', desc: 'Receber relatório de ocupação e receita por e-mail', icon: BarChart3 },
              ]).map(item => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                >
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
                    onCheckedChange={checked =>
                      setNotifications(prev => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* Bottom Save Button */}
      <div className="flex justify-end pt-2 pb-4">
        <Button
          onClick={handleSave}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}


