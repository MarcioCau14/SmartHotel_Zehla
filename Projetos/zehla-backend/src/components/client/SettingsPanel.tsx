'use client';

import { useState } from 'react';
import { Building2, BedDouble, DoorOpen, MessageCircle, DollarSign, Users, Bell, Sparkles, Save } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PropertySection } from './settings/sections/PropertySection';
import { AccommodationSection } from './settings/sections/AccommodationSection';
import { RoomsSection } from './settings/sections/RoomsSection';
import { PersonaSection } from './settings/sections/PersonaSection';
import { WhatsAppSection } from './settings/sections/WhatsAppSection';
import { PricingSection } from './settings/sections/PricingSection';
import { TeamSection } from './settings/sections/TeamSection';
import { NotificationsSection } from './settings/sections/NotificationsSection';
import type { PropertyData, AccommodationType, Room, WhatsAppConfig, PersonaConfig, PricingRule, TeamMember, NotificationPrefs } from './settings/types';

const initialProperty: PropertyData = {
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
  starRating: '4'
};

const initialAccommodationTypes: AccommodationType[] = [
  { id: 'at-1', name: 'Standard', capacity: 2, basePrice: 280, amenities: ['wifi', 'ac', 'tv', 'coffee'] },
  { id: 'at-2', name: 'Superior', capacity: 2, basePrice: 420, amenities: ['wifi', 'ac', 'tv', 'minibar', 'coffee', 'bathtub'] },
  { id: 'at-3', name: 'Suíte Premium', capacity: 3, basePrice: 580, amenities: ['wifi', 'ac', 'tv', 'minibar', 'coffee', 'bathtub', 'pool', 'restaurant'] },
  { id: 'at-4', name: 'Chalé Família', capacity: 5, basePrice: 780, amenities: ['wifi', 'ac', 'tv', 'parking', 'minibar', 'coffee', 'bathtub', 'pool', 'restaurant'] }
];

const initialRooms: Room[] = [
  { id: 'r-1', number: '101', typeId: 'at-1', floor: 1, status: 'disponivel' },
  { id: 'r-2', number: '102', typeId: 'at-1', floor: 1, status: 'ocupado' },
  { id: 'r-3', number: '103', typeId: 'at-2', floor: 1, status: 'sujo' },
  { id: 'r-4', number: '201', typeId: 'at-2', floor: 2, status: 'disponivel' },
  { id: 'r-5', number: '202', typeId: 'at-3', floor: 2, status: 'ocupado' },
  { id: 'r-6', number: '203', typeId: 'at-3', floor: 2, status: 'disponivel' },
  { id: 'r-7', number: '301', typeId: 'at-4', floor: 3, status: 'manutencao' },
  { id: 'r-8', number: '302', typeId: 'at-4', floor: 3, status: 'disponivel' }
];

const initialWhatsApp: WhatsAppConfig = {
  connected: false,
  autoReply: false,
  welcomeMessage: 'Olá! 👋 Bem-vindo(a) à Pousada Maravilha! Somos felizes em recebê-lo(a) em Noronha. Se precisar de algo, é só chamar!',
  checkinInstructions: '🏨 Seu check-in é às 14h. Apresente seu documento e comprovante de reserva na recepção. A chave do quarto será entregue após a confirmação.',
  wifiInfo: '📶 Rede: PousadaMaravilha_Guest | Senha: maravilha2024',
  hoursInfo: '🏊 Piscina: 07h–22h | 🍽️ Restaurante: 07h–10h (café) e 12h–22h (almoço/jantar) | 🧹 Limpeza diária: 09h–15h',
  whatsappType: 'GUESTS_ONLY',
  supplierContact: '',
  ignoreSuppliers: true
};

const initialPersona: PersonaConfig = {
  formality: 40,
  aggressiveness: 'CONSULTATIVE',
  allowEmojis: true,
  style: 'RUSTIC',
  useBrandDNA: true
};

const initialPricingRules: PricingRule[] = [
  { id: 'pr-1', typeId: 'at-1', altaPercent: 30, baixaPercent: 15, feriadoPercent: 45, minPrice: 200, maxPrice: 450 },
  { id: 'pr-2', typeId: 'at-2', altaPercent: 25, baixaPercent: 15, feriadoPercent: 40, minPrice: 320, maxPrice: 650 },
  { id: 'pr-3', typeId: 'at-3', altaPercent: 25, baixaPercent: 10, feriadoPercent: 35, minPrice: 450, maxPrice: 850 },
  { id: 'pr-4', typeId: 'at-4', altaPercent: 20, baixaPercent: 10, feriadoPercent: 30, minPrice: 600, maxPrice: 1100 }
];

const initialTeam: TeamMember[] = [
  { id: 'tm-1', name: 'Carla Mendes', role: 'Gerente', phone: '(81) 99876-5432', email: 'carla@pousadamaravilha.com.br' },
  { id: 'tm-2', name: 'Rafael Costa', role: 'Recepcionista', phone: '(81) 99123-4567', email: 'rafael@pousadamaravilha.com.br' },
  { id: 'tm-3', name: 'Ana Beatriz Lima', role: 'Recepcionista', phone: '(81) 99876-1234', email: 'anab@pousadamaravilha.com.br' },
  { id: 'tm-4', name: 'Maria das Neves', role: 'Camareira', phone: '(81) 99345-6789', email: 'maria@pousadamaravilha.com.br' },
  { id: 'tm-5', name: 'José Carlos Silva', role: 'Manutenção', phone: '(81) 99456-7890', email: 'jose@pousadamaravilha.com.br' }
];

const initialNotifications: NotificationPrefs = {
  newReservations: true,
  checkins: true,
  checkouts: true,
  paymentAlerts: true,
  whatsappMessages: false,
  dailyReports: true
};

interface SectionDef {
  value: string;
  icon: typeof Building2;
  label: string;
  desc: string;
  iconBg: string;
  iconColor: string;
}

const sections: SectionDef[] = [
  { value: 'section-1', icon: Building2, label: 'Dados da Propriedade', desc: 'Informações cadastrais e operacionais', iconBg: 'bg-[#FF5500]/10', iconColor: 'text-[#FF5500]' },
  { value: 'section-2', icon: BedDouble, label: 'Tipos de Acomodação', desc: `${initialAccommodationTypes.length} tipos cadastrados`, iconBg: 'bg-[#FF5500]/10', iconColor: 'text-[#FF5500]' },
  { value: 'section-3', icon: DoorOpen, label: 'Quartos', desc: `${initialRooms.length} quartos cadastrados`, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
  { value: 'section-4-1', icon: Sparkles, label: 'Personalidade da IA', desc: 'Calibre o tom de voz e o comportamento (Mesa de Equalização)', iconBg: 'bg-orange-500/10', iconColor: 'text-orange-400' },
  { value: 'section-4', icon: MessageCircle, label: 'WhatsApp', desc: 'Mensagens e atendimento automático', iconBg: 'bg-green-500/10', iconColor: 'text-green-400' },
  { value: 'section-5', icon: DollarSign, label: 'Precificação Dinâmica', desc: 'Regras de preço por temporada', iconBg: 'bg-[#FF5500]/10', iconColor: 'text-[#FF5500]' },
  { value: 'section-6', icon: Users, label: 'Equipe', desc: `${initialTeam.length} membros`, iconBg: 'bg-[#FF5500]/10', iconColor: 'text-[#FF5500]' },
  { value: 'section-7', icon: Bell, label: 'Notificações', desc: 'Preferências de alertas', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-400' }
];

export function SettingsPanel() {
  const { toast } = useToast();
  const [property, setProperty] = useState(initialProperty);
  const [accommodationTypes, setAccommodationTypes] = useState(initialAccommodationTypes);
  const [rooms, setRooms] = useState(initialRooms);
  const [whatsapp, setWhatsapp] = useState(initialWhatsApp);
  const [persona, setPersona] = useState(initialPersona);
  const [pricingRules, setPricingRules] = useState(initialPricingRules);
  const [competitorPricing, setCompetitorPricing] = useState(false);
  const [team, setTeam] = useState(initialTeam);
  const [notifications, setNotifications] = useState(initialNotifications);

  const getTypeName = (typeId: string) => accommodationTypes.find((t) => t.id === typeId)?.name || 'N/A';

  const handleSave = () => {
    toast({ title: 'Configurações salvas', description: 'Todas as alterações foram salvas com sucesso.' });
  };

  const renderSection = (sec: SectionDef) => {
    const commonProps = { className: 'glass-card border-[#2e2e2e] rounded-xl overflow-hidden' };

    switch (sec.value) {
      case 'section-1':
        return <PropertySection property={property} onChange={setProperty} />;
      case 'section-2':
        return <AccommodationSection types={accommodationTypes} onChange={setAccommodationTypes} />;
      case 'section-3':
        return <RoomsSection rooms={rooms} types={accommodationTypes} onChange={setRooms} getTypeName={getTypeName} />;
      case 'section-4-1':
        return <PersonaSection persona={persona} onChange={setPersona} />;
      case 'section-4':
        return <WhatsAppSection whatsapp={whatsapp} onChange={setWhatsapp} />;
      case 'section-5':
        return (
          <PricingSection
            rules={pricingRules}
            types={accommodationTypes}
            competitorPricing={competitorPricing}
            onRulesChange={setPricingRules}
            onCompetitorChange={setCompetitorPricing}
            getTypeName={getTypeName}
          />
        );
      case 'section-6':
        return <TeamSection team={team} onChange={setTeam} />;
      case 'section-7':
        return <NotificationsSection notifications={notifications} onChange={setNotifications} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#FF5500]" />
            Configurações
          </h1>
          <p className="text-sm text-[#4d4d4d] mt-1">Gerencie todas as configurações da sua propriedade</p>
        </div>
        <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white gap-2 self-start sm:self-auto">
          <Save className="w-4 h-4" />
          Salvar Configurações
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['section-1']} className="space-y-2">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <AccordionItem key={sec.value} value={sec.value} className="glass-card border-[#2e2e2e] rounded-xl overflow-hidden">
              <AccordionTrigger className="px-5 py-4 text-[#fafafa] hover:no-underline hover:text-[#FF5500] transition-colors [&>svg]:text-[#4d4d4d]">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${sec.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${sec.iconColor}`} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{sec.label}</div>
                    <div className="text-xs text-[#4d4d4d]">{sec.desc}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                {renderSection(sec)}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="flex justify-end pt-2 pb-4">
        <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Save className="w-4 h-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
