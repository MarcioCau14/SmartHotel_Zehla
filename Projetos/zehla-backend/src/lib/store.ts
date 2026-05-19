// ZEHLA SmartHotel Cognitive OS — In-Memory Data Store
// Brazilian hospitality data with realistic values

export type PropertyStatus = 'active' | 'trial' | 'suspended';

export interface Property {
  id: string;
  name: string;
  city: string;
  state: string;
  rooms: number;
  status: PropertyStatus;
  trialDaysLeft: number;
  googleRating: number;
  logo?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  roomId: string | null;
  propertyId: string;
  checkIn?: string;
  checkOut?: string;
  status: 'checked_in' | 'checked_out' | 'reserved' | 'walk_in';
}

export type RoomType = 'Standard' | 'Superior' | 'Deluxe' | 'Suite' | 'Premium';
export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'maintenance' | 'reserved';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  price: number;
  currentGuest: string | null;
  propertyId: string;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NOSHOW';

export interface Reservation {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  totalAmount: number;
  propertyId: string;
  createdAt: string;
}

export type AgentStatus = 'online' | 'offline' | 'busy';

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  tasksCompleted: number;
  tasksFailed: number;
  successRate: number;
  avgLatencyMs: number;
  modelUsed: string;
  uptimeHours: number;
  icon: string;
}

export interface IntentStat {
  name: string;
  count: number;
  avgLatencyMs: number;
  source: 'fast_path' | 'slow_path' | 'swarm';
  cacheHitRate: number;
}

export interface TerminalMessage {
  id: string;
  color: 'green' | 'purple' | 'yellow' | 'red';
  source: 'ZEHLA_BRAIN' | 'GUARDIAN' | 'FLEET' | 'ZDR';
  category: 'guest' | 'employee' | 'supplier' | 'alert';
  content: string;
  timestamp: string;
}

export interface B2BLead {
  id: string;
  name: string;
  category: 'pousada' | 'hotel' | 'hostel';
  city: string;
  state: string;
  phone: string;
  emails: string[];
  googleRating: number;
  leadScore: number;
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'lost';
  painPoints: string[];
}

// ===== PROPERTIES =====
export const properties: Property[] = [
  { id: 'prop-1', name: 'Pousada Maravilha', city: 'Fernando de Noronha', state: 'PE', rooms: 14, status: 'active', trialDaysLeft: 0, googleRating: 4.8 },
  { id: 'prop-2', name: 'Pousada Vila Floripa', city: 'Florianópolis', state: 'SC', rooms: 8, status: 'active', trialDaysLeft: 0, googleRating: 4.6 },
  { id: 'prop-3', name: 'Pousada do Ouro', city: 'Paraty', state: 'RJ', rooms: 12, status: 'active', trialDaysLeft: 0, googleRating: 4.9 },
  { id: 'prop-4', name: 'Pousada Chapada dos Veadeiros', city: 'Alto Paraíso', state: 'GO', rooms: 6, status: 'trial', trialDaysLeft: 4, googleRating: 4.5 },
  { id: 'prop-5', name: 'Pousada Bela Jeri', city: 'Jericoacoara', state: 'CE', rooms: 10, status: 'active', trialDaysLeft: 0, googleRating: 4.7 },
  { id: 'prop-6', name: 'Pousada Serrana', city: 'Gramado', state: 'RS', rooms: 9, status: 'trial', trialDaysLeft: 6, googleRating: 4.4 },
];

// ===== GUESTS =====
export const guests: Guest[] = [
  { id: 'guest-1', name: 'Ana Carolina Silva', email: 'ana.silva@email.com', phone: '(81) 99999-1234', cpf: '123.456.789-00', roomId: 'room-1', propertyId: 'prop-1', checkIn: '2025-04-12', checkOut: '2025-04-16', status: 'checked_in' },
  { id: 'guest-2', name: 'Pedro Henrique Santos', email: 'pedro.s@email.com', phone: '(48) 98888-5678', cpf: '234.567.890-11', roomId: 'room-5', propertyId: 'prop-2', checkIn: '2025-04-13', checkOut: '2025-04-17', status: 'checked_in' },
  { id: 'guest-3', name: 'Maria Fernanda Oliveira', email: 'mf.oliveira@email.com', phone: '(24) 97777-9012', cpf: '345.678.901-22', roomId: 'room-9', propertyId: 'prop-3', checkIn: '2025-04-14', checkOut: '2025-04-18', status: 'checked_in' },
  { id: 'guest-4', name: 'Lucas Gabriel Costa', email: 'lucas.costa@email.com', phone: '(62) 96666-3456', cpf: '456.789.012-33', roomId: 'room-13', propertyId: 'prop-4', checkIn: '2025-04-11', checkOut: '2025-04-15', status: 'checked_in' },
  { id: 'guest-5', name: 'Juliana Beatriz Pereira', email: 'juliana.p@email.com', phone: '(88) 95555-7890', cpf: '567.890.123-44', roomId: 'room-17', propertyId: 'prop-5', checkIn: '2025-04-13', checkOut: '2025-04-20', status: 'checked_in' },
  { id: 'guest-6', name: 'Rafael Almeida Souza', email: 'rafael.souza@email.com', phone: '(54) 94444-1234', cpf: '678.901.234-55', roomId: 'room-21', propertyId: 'prop-6', checkIn: '2025-04-12', checkOut: '2025-04-14', status: 'checked_in' },
  { id: 'guest-7', name: 'Isabela Rodrigues Lima', email: 'isabela.lima@email.com', phone: '(81) 93333-5678', cpf: '789.012.345-66', roomId: null, propertyId: 'prop-1', status: 'reserved' },
  { id: 'guest-8', name: 'Mateus Ferreira Martins', email: 'mateus.m@email.com', phone: '(48) 92222-9012', cpf: '890.123.456-77', roomId: null, propertyId: 'prop-2', status: 'reserved' },
  { id: 'guest-9', name: 'Gabriela Santos Mendes', email: 'gabi.mendes@email.com', phone: '(24) 91111-3456', cpf: '901.234.567-88', roomId: null, propertyId: 'prop-3', status: 'checked_out' },
  { id: 'guest-10', name: 'Thiago Nascimento Ribeiro', email: 'thiago.r@email.com', phone: '(62) 90000-7890', cpf: '012.345.678-99', roomId: null, propertyId: 'prop-4', status: 'checked_out' },
  { id: 'guest-11', name: 'Camila Aparecida Dias', email: 'camila.dias@email.com', phone: '(88) 98765-4321', cpf: '111.222.333-44', roomId: null, propertyId: 'prop-5', status: 'walk_in' },
  { id: 'guest-12', name: 'Bruno Cardoso Barbosa', email: 'bruno.b@email.com', phone: '(54) 98765-1234', cpf: '222.333.444-55', roomId: null, propertyId: 'prop-6', status: 'reserved' },
  { id: 'guest-13', name: 'Fernanda Gonçalves Araújo', email: 'fer.araujo@email.com', phone: '(81) 97654-3210', cpf: '333.444.555-66', roomId: null, propertyId: 'prop-1', status: 'reserved' },
  { id: 'guest-14', name: 'Diego Teixeira Moreira', email: 'diego.m@email.com', phone: '(48) 96543-2109', cpf: '444.555.666-77', roomId: null, propertyId: 'prop-2', status: 'walk_in' },
  { id: 'guest-15', name: 'Patrícia Rocha Vieira', email: 'patricia.v@email.com', phone: '(24) 95432-1098', cpf: '555.666.777-88', roomId: null, propertyId: 'prop-3', status: 'reserved' },
];

// ===== ROOMS =====
const roomTypes: RoomType[] = ['Standard', 'Standard', 'Superior', 'Superior', 'Deluxe', 'Suite'];
const roomPrices: Record<RoomType, number> = { Standard: 280, Superior: 420, Deluxe: 580, Suite: 850, Premium: 1200 };
const roomStatuses: RoomStatus[] = ['available', 'occupied', 'dirty', 'maintenance', 'reserved'];

export const rooms: Room[] = Array.from({ length: 24 }, (_, i) => {
  const floor = Math.floor(i / 5) + 1;
  const type = i < 6 ? 'Standard' : i < 10 ? 'Superior' : i < 15 ? 'Deluxe' : i < 20 ? 'Suite' : 'Premium';
  const guest = i < 6 ? guests[i] : null;
  const status: RoomStatus = i < 6 ? 'occupied' : i === 6 ? 'dirty' : i === 7 ? 'maintenance' : i < 12 ? 'available' : i < 18 ? 'reserved' : 'available';
  return {
    id: `room-${i + 1}`,
    number: `${floor}${String((i % 5) + 1).padStart(2, '0')}`,
    floor,
    type,
    status,
    price: roomPrices[type] + Math.floor(Math.random() * 100),
    currentGuest: guest?.name ?? null,
    propertyId: properties[Math.floor(i / 4)]?.id ?? 'prop-1',
  };
});

// ===== RESERVATIONS =====
const resStatuses: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING', 'CONFIRMED', 'CONFIRMED', 'PENDING', 'COMPLETED'];

export const reservations: Reservation[] = Array.from({ length: 15 }, (_, i) => ({
  id: `res-${String(i + 1).padStart(3, '0')}`,
  guestName: guests[i].name,
  guestEmail: guests[i].email,
  guestPhone: guests[i].phone,
  roomNumber: rooms[i]?.number ?? '101',
  roomType: rooms[i]?.type ?? 'Standard',
  checkIn: `2025-04-${String(10 + i).padStart(2, '0')}`,
  checkOut: `2025-04-${String(14 + i).padStart(2, '0')}`,
  status: resStatuses[i],
  totalAmount: (rooms[i]?.price ?? 300) * (3 + (i % 4)),
  propertyId: guests[i].propertyId,
  createdAt: `2025-04-0${String(Math.max(1, 8 - i)).padStart(1, '0')}T10:00:00Z`,
}));

// ===== AI AGENTS =====
export const aiAgents: AIAgent[] = [
  { id: 'agent-1', name: 'Recepcionista', role: 'Atendimento ao hóspede via WhatsApp', status: 'online', tasksCompleted: 847, tasksFailed: 12, successRate: 98.6, avgLatencyMs: 45, modelUsed: 'z-ai-web-dev-sdk', uptimeHours: 720, icon: '🛎️' },
  { id: 'agent-2', name: 'Concierge', role: 'Informações locais, turismo e recomendações', status: 'online', tasksCompleted: 534, tasksFailed: 8, successRate: 98.5, avgLatencyMs: 62, modelUsed: 'z-ai-web-dev-sdk', uptimeHours: 718, icon: '🗺️' },
  { id: 'agent-3', name: 'Reservas', role: 'Gestão de reservas, check-in e check-out', status: 'busy', tasksCompleted: 1203, tasksFailed: 18, successRate: 98.5, avgLatencyMs: 38, modelUsed: 'z-ai-web-dev-sdk', uptimeHours: 716, icon: '📅' },
  { id: 'agent-4', name: 'Housekeeping', role: 'Controle de limpeza e manutenção de quartos', status: 'online', tasksCompleted: 2156, tasksFailed: 28, successRate: 98.7, avgLatencyMs: 25, modelUsed: 'z-ai-web-dev-sdk', uptimeHours: 714, icon: '🧹' },
  { id: 'agent-5', name: 'Financeiro', role: 'Controle de pagamentos, PIX e receitas', status: 'online', tasksCompleted: 892, tasksFailed: 5, successRate: 99.4, avgLatencyMs: 55, modelUsed: 'z-ai-web-dev-sdk', uptimeHours: 712, icon: '💰' },
  { id: 'agent-6', name: 'Guardião', role: 'Segurança, anti-fraude e proteção de dados', status: 'online', tasksCompleted: 1567, tasksFailed: 2, successRate: 99.9, avgLatencyMs: 18, modelUsed: 'z-ai-web-dev-sdk', uptimeHours: 710, icon: '🛡️' },
  { id: 'agent-7', name: 'Marketing', role: 'Campanhas promocionais e captação de hóspedes', status: 'offline', tasksCompleted: 234, tasksFailed: 15, successRate: 94.0, avgLatencyMs: 120, modelUsed: 'z-ai-web-dev-sdk', uptimeHours: 350, icon: '📣' },
  { id: 'agent-8', name: 'Aprendiz', role: 'Aprendizado contínuo e otimização de respostas', status: 'online', tasksCompleted: 445, tasksFailed: 15, successRate: 96.6, avgLatencyMs: 210, modelUsed: 'z-ai-web-dev-sdk', uptimeHours: 680, icon: '📚' },
];

// ===== INTENT STATS =====
export const intentStats: IntentStat[] = [
  { name: 'wifi_password', count: 1247, avgLatencyMs: 18, source: 'fast_path', cacheHitRate: 98.5 },
  { name: 'checkout_request', count: 892, avgLatencyMs: 45, source: 'fast_path', cacheHitRate: 92.1 },
  { name: 'parking_info', count: 634, avgLatencyMs: 22, source: 'fast_path', cacheHitRate: 96.3 },
  { name: 'room_cleaning', count: 567, avgLatencyMs: 35, source: 'slow_path', cacheHitRate: 45.2 },
  { name: 'restaurant_reservation', count: 445, avgLatencyMs: 68, source: 'slow_path', cacheHitRate: 38.7 },
  { name: 'complaint_handling', count: 321, avgLatencyMs: 120, source: 'swarm', cacheHitRate: 12.4 },
  { name: 'local_tourism', count: 289, avgLatencyMs: 52, source: 'slow_path', cacheHitRate: 72.1 },
  { name: 'payment_issue', count: 234, avgLatencyMs: 89, source: 'swarm', cacheHitRate: 15.6 },
  { name: 'amenity_request', count: 198, avgLatencyMs: 30, source: 'fast_path', cacheHitRate: 88.9 },
  { name: 'late_checkin', count: 167, avgLatencyMs: 42, source: 'fast_path', cacheHitRate: 91.2 },
  { name: 'tv_troubleshoot', count: 145, avgLatencyMs: 55, source: 'slow_path', cacheHitRate: 67.3 },
  { name: 'extra_bed', count: 112, avgLatencyMs: 78, source: 'slow_path', cacheHitRate: 22.5 },
  { name: 'invoice_request', count: 98, avgLatencyMs: 95, source: 'swarm', cacheHitRate: 18.9 },
  { name: 'pool_hours', count: 87, avgLatencyMs: 15, source: 'fast_path', cacheHitRate: 99.1 },
  { name: 'transfer_service', count: 76, avgLatencyMs: 110, source: 'swarm', cacheHitRate: 8.3 },
];

// ===== TERMINAL MESSAGES =====
const terminalSources: TerminalMessage['source'][] = ['ZEHLA_BRAIN', 'GUARDIAN', 'FLEET', 'ZDR'];
const terminalCategories: TerminalMessage['category'][] = ['guest', 'employee', 'supplier', 'alert'];

const terminalContents = [
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '⚡ Intent classificada: wifi_password → fast_path (18ms, cache HIT)' },
  { color: 'purple' as const, source: 'GUARDIAN' as const, category: 'alert' as const, content: '🛡️ LGPD audit passed — tenant prop-1, 0 violations detected' },
  { color: 'yellow' as const, source: 'FLEET' as const, category: 'employee' as const, content: '🔧 Maintenance agent dispatched to room 204 — reported AC malfunction' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '✅ Checkout automatizado concluído — guest Ana Carolina Silva, room 101' },
  { color: 'red' as const, source: 'ZDR' as const, category: 'alert' as const, content: '⚠️ Circuit breaker activation — payment_service latency exceeded 3000ms threshold' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '💬 WhatsApp response delivered — Lucas Costa received restaurant recommendation' },
  { color: 'purple' as const, source: 'GUARDIAN' as const, category: 'alert' as const, content: '🔐 HITL approval pending — refund request R$ 1.200,00 requires manual review' },
  { color: 'yellow' as const, source: 'FLEET' as const, category: 'supplier' as const, content: '📦 Supplier sync: Linhares Produtos updated — 23 new SKUs imported' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '🎯 Dynamic pricing adjusted — Suite rates +12% (demand surge detected)' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '🧹 Housekeeping task created — room 307 needs deep cleaning after checkout' },
  { color: 'red' as const, source: 'ZDR' as const, category: 'alert' as const, content: '🚨 Anomaly detected: 3 failed login attempts from IP 189.x.x.x — blocked' },
  { color: 'purple' as const, source: 'GUARDIAN' as const, category: 'alert' as const, content: '📋 PCI DSS compliance check — all payment tokens valid, expiry scan passed' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '🏠 Room 502 status updated: available → occupied (Pedro Henrique Santos)' },
  { color: 'yellow' as const, source: 'FLEET' as const, category: 'employee' as const, content: '👥 Agent Voice processing audio message — PT-BR transcription in progress' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '📊 Revenue report generated — daily total: R$ 14.780,00 across all properties' },
  { color: 'purple' as const, source: 'GUARDIAN' as const, category: 'alert' as const, content: '🔒 Sovereign model integrity verified — hash match confirmed' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '🍽️ Restaurant reservation confirmed — Maria F. Oliveira, 19:30, Mesa 5' },
  { color: 'yellow' as const, source: 'FLEET' as const, category: 'supplier' as const, content: '🧺 Laundry service pickup scheduled — 8 rooms, estimated 14:00' },
  { color: 'red' as const, source: 'ZDR' as const, category: 'alert' as const, content: '⚠️ Rate limit warning — OpenAI API approaching 80% quota utilization' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '🚪 Auto check-in completed — Juliana B. Pereira, digital key sent via WhatsApp' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '💡 Upsell suggestion sent — Rafael A. Souza offered late checkout +R$ 150' },
  { color: 'purple' as const, source: 'GUARDIAN' as const, category: 'alert' as const, content: '📱 WhatsApp Business API health check — Evolution API connected, 0 errors' },
  { color: 'yellow' as const, source: 'FLEET' as const, category: 'employee' as const, content: '🗓️ Shift change — Night team active, 3 housekeepers on duty' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '🅿️ Parking spot assigned — Vaga P12 for Mateus F. Martins' },
  { color: 'red' as const, source: 'ZDR' as const, category: 'alert' as const, content: '⚡ Edge node noronha-01 latency spike — 450ms (threshold: 200ms)' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '💡 Local guide sent — Jericoacoara sunset tour info delivered to guest' },
  { color: 'purple' as const, source: 'GUARDIAN' as const, category: 'alert' as const, content: '✅ Backup completed — all tenant databases encrypted and stored' },
  { color: 'yellow' as const, source: 'FLEET' as const, category: 'supplier' as const, content: '🍷 Wine cellar inventory synced — 142 bottles tracked across 4 properties' },
  { color: 'green' as const, source: 'ZEHLA_BRAIN' as const, category: 'guest' as const, content: '🎉 Welcome message sent — Camila A. Dias received pousada guide + WiFi info' },
];

export const terminalMessages: TerminalMessage[] = terminalContents.map((msg, i) => ({
  id: `msg-${i + 1}`,
  ...msg,
  timestamp: new Date(Date.now() - (30 - i) * 60000).toISOString(),
}));

// ===== B2B LEADS =====
export const b2bLeads: B2BLead[] = [
  { id: 'lead-1', name: 'Pousada Sol e Lua', category: 'pousada', city: 'Porto Seguro', state: 'BA', phone: '(73) 99876-5432', emails: ['contato@pousadasolelua.com', 'reservas@pousadasolelua.com'], googleRating: 4.5, leadScore: 92, status: 'interested', painPoints: ['Check-in manual', 'Sem integração WhatsApp', 'Planilha para reservas'] },
  { id: 'lead-2', name: 'Hotel Praia Dourada', category: 'hotel', city: 'Salvador', state: 'BA', phone: '(71) 98765-4321', emails: ['gerencia@praiadourada.com'], googleRating: 4.2, leadScore: 78, status: 'contacted', painPoints: ['Revenue management complexo', 'Overbooking frequente'] },
  { id: 'lead-3', name: 'Hostel Trindade', category: 'hostel', city: 'Florianópolis', state: 'SC', phone: '(48) 97654-3210', emails: ['info@hosteltrindade.com'], googleRating: 4.3, leadScore: 65, status: 'new', painPoints: ['Check-out lento', 'Controle de estoque ruim'] },
  { id: 'lead-4', name: 'Pousada das Águas', category: 'pousada', city: 'Búzios', state: 'RJ', phone: '(22) 96543-2109', emails: ['pousada@aguasdebuzios.com', 'booking@aguasdebuzios.com'], googleRating: 4.7, leadScore: 88, status: 'interested', painPoints: ['Canal de vendas fragmentado', 'Sem análise de dados'] },
  { id: 'lead-5', name: 'Pousada Serra Gaúcha', category: 'pousada', city: 'Canela', state: 'RS', phone: '(54) 95432-1098', emails: ['atendimento@serragaucha.com'], googleRating: 4.6, leadScore: 85, status: 'converted', painPoints: ['Preços sazonais manuais', 'Atendimento WhatsApp'] },
  { id: 'lead-6', name: 'Hotel Central Express', category: 'hotel', city: 'Belo Horizonte', state: 'MG', phone: '(31) 94321-0987', emails: ['reservas@centralexpress.com', 'adm@centralexpress.com'], googleRating: 4.1, leadScore: 72, status: 'contacted', painPoints: ['Sistema legado', 'Sem integração OTA'] },
  { id: 'lead-7', name: 'Pousada Raízes', category: 'pousada', city: 'Tiradentes', state: 'MG', phone: '(32) 93210-9876', emails: ['contato@raizestiradentes.com'], googleRating: 4.8, leadScore: 95, status: 'new', painPoints: ['Gestão 100% manual', 'Perde reservas por WhatsApp'] },
  { id: 'lead-8', name: 'Hostel Mar Azul', category: 'hostel', city: 'Natal', state: 'RN', phone: '(84) 92109-8765', emails: ['marazul@hostel.com'], googleRating: 4.0, leadScore: 58, status: 'lost', painPoints: ['Orçamento limitado', 'Software caro'] },
];

// ===== HELPER FUNCTIONS =====

export function getBrainHealth() : void {
  try {
  return {
    edge_latency: Math.floor(20 + Math.random() * 30),
    brain_queue: Math.floor(Math.random() * 15),
    voice_swarm: Math.floor(Math.random() * 8),
    zdr_status: 'active' as const,
    cache_hit_rate: +(92 + Math.random() * 7).toFixed(1),
    active_agents: 7,
    tokens_today: Math.floor(150000 + Math.random() * 50000),
    sovereign_model: 'gemma-3-27b-it',
    gemma_engine_status: 'healthy' as const,
    fleet_nodes: 6,
    bullmq_pending: Math.floor(Math.random() * 25),
    lgpd_compliant: true,
  };
}

export function getRevenueKPIs() : void {
  try {
  const monthlyRevenue = [
    { month: 'Nov', revenue: 48200 },
    { month: 'Dez', revenue: 62400 },
    { month: 'Jan', revenue: 71800 },
    { month: 'Fev', revenue: 54300 },
    { month: 'Mar', revenue: 62100 },
    { month: 'Abr', revenue: 68900 },
  ];
  const weeklyOccupancy = [
    { day: 'Seg', rate: 78 },
    { day: 'Ter', rate: 72 },
    { day: 'Qua', rate: 85 },
    { day: 'Qui', rate: 91 },
    { day: 'Sex', rate: 96 },
    { day: 'Sáb', rate: 98 },
    { day: 'Dom', rate: 88 },
  ];
  return {
    active_guests: 47 + Math.floor(Math.random() * 10),
    today_revenue: 14780 + Math.floor(Math.random() * 3000),
    pending_checkins: 5 + Math.floor(Math.random() * 4),
    ai_tickets_resolved: 234 + Math.floor(Math.random() * 50),
    ai_tickets_total: 251 + Math.floor(Math.random() * 55),
    occupancy_rate: +(82 + Math.random() * 10).toFixed(1),
    avg_daily_rate: Math.floor(420 + Math.random() * 80),
    revpar: Math.floor(340 + Math.random() * 60),
    monthly_revenue_trend: monthlyRevenue,
    weekly_occupancy: weeklyOccupancy,
  };
}

export function getSecurityStatus() : void {
  try {
  return {
    zdr_status: 'active',
    zdr_uptime: '99.97%',
    guardian_verdicts: {
      safe: 1847,
      review: 23,
      blocked: 12,
    },
    hitl_pending: [
      { id: 'hitl-1', type: 'refund', amount: 'R$ 1.200,00', guest: 'Ana C. Silva', status: 'pending_review' },
      { id: 'hitl-2', type: 'complaint_escalation', amount: null, guest: 'Pedro H. Santos', status: 'pending_review' },
      { id: 'hitl-3', type: 'rate_change', amount: 'R$ 850,00 → R$ 1.100,00', guest: null, status: 'approved' },
    ],
    circuit_breaker: {
      status: 'closed' as const,
      last_trigger: '2025-04-14T08:23:00Z',
      services: [
        { name: 'payment_service', status: 'healthy', latency_ms: 45 },
        { name: 'whatsapp_gateway', status: 'healthy', latency_ms: 120 },
        { name: 'booking_engine', status: 'healthy', latency_ms: 38 },
        { name: 'revenue_optimizer', status: 'degraded', latency_ms: 280 },
      ],
    },
    lgpd_compliant: true,
    lgpd_last_audit: '2025-04-14T06:00:00Z',
    pci_compliant: true,
    pci_last_audit: '2025-04-13T12:00:00Z',
  };
}

export function simulateClassification(message: string) : void {
  try {
  const intents = [
    { intent: 'wifi_password', classification: 'fast_path', response: 'A senha do WiFi é: POUSADA_5G. Acesse a rede "ZEHLA_Guest" e use esta senha.', confidence: 0.98 },
    { intent: 'checkout_request', classification: 'fast_path', response: 'Seu check-out está previsto para hoje às 12:00. Deseja estender até 14:00 por R$ 80,00?', confidence: 0.95 },
    { intent: 'restaurant_reservation', classification: 'slow_path', response: 'Posso reservar para você no restaurante. Qual horário e número de pessoas?', confidence: 0.89 },
    { intent: 'complaint_handling', classification: 'swarm', response: 'Entendo sua insatisfação. Vou escalar para nosso supervisor imediatamente. Refund disponível em até 48h.', confidence: 0.92 },
    { intent: 'local_tourism', classification: 'slow_path', response: 'Recomendo visitar a Praia do Sancho e fazer o passeio de barco. Quer que eu agende?', confidence: 0.87 },
    { intent: 'payment_issue', classification: 'swarm', response: 'Identifiquei um problema no seu pagamento. Vou reprocessar agora. PIX ou cartão?', confidence: 0.94 },
    { intent: 'pool_hours', classification: 'fast_path', response: 'A piscina funciona das 7:00 às 22:00. Toalhas disponíveis na recepção.', confidence: 0.99 },
    { intent: 'parking_info', classification: 'fast_path', response: 'Estacionamento incluso. Sua vaga é a P-08 no subsolo. Pede a chave na recepção.', confidence: 0.97 },
  ];
  const lower = message.toLowerCase();
  const chosen = intents.find(i => lower.includes(i.intent.split('_')[0]) || lower.includes(i.intent)) || intents[Math.floor(Math.random() * intents.length)];
  return {
    intent: chosen.intent,
    classification: chosen.classification,
    response: chosen.response,
    source: chosen.classification === 'fast_path' ? 'edge_cache' : chosen.classification === 'slow_path' ? 'llm_inference' : 'multi_agent_swarm',
    confidence: chosen.confidence,
    latency_ms: chosen.classification === 'fast_path' ? Math.floor(12 + Math.random() * 20) : chosen.classification === 'slow_path' ? Math.floor(40 + Math.random() * 60) : Math.floor(80 + Math.random() * 120),
  };
}
