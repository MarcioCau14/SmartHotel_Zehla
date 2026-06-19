// ZEHLA DDC - Cognitive OS Command Center
// Type Definitions

// ============================================================================
// GUEST TYPES
// ============================================================================

export type GuestStatus = 'hot' | 'warm' | 'cold' | 'closed' | 'lost' | 'booked' | 'new' | 'staying';

export interface Guest {
  id: string;
  name: string;
  phoneNumber?: string;
  phone?: string; // mock data fallback
  email?: string;
  status: GuestStatus;
  score?: number; // 0-100
  propertyId?: string;
  lastMessage?: string;
  messageCount?: number;
  lostReason?: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

export interface GuestMessage {
  id: string;
  guestId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    confidence?: number;
    escalated?: boolean;
    model?: string;
  };
  createdAt: Date;
  [key: string]: any;
}

// ============================================================================
// BOOKING TYPES
// ============================================================================

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'checked_in';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  guestId: string;
  guestName?: string; // mock data fallback
  roomId?: string;
  checkIn: Date;
  checkOut: Date;
  total?: number;
  totalValue?: number; // mock data fallback
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  propertyId?: string;
  messages?: BookingMessage[];
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

export interface BookingMessage {
  id: string;
  bookingId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  [key: string]: any;
}

// ============================================================================
// AI ACTIVITY TYPES
// ============================================================================

export type ActivityType =
  | 'conversation_started'
  | 'conversation_escalated'
  | 'booking_created'
  | 'booking_confirmed'
  | 'payment_received'
  | string;

export interface AIActivityLog {
  id: string;
  type: ActivityType;
  description?: string;
  metadata?: Record<string, any>;
  propertyId?: string;
  createdAt?: Date;
  [key: string]: any;
}

export type AIActivity = AIActivityLog; // alias for mock data

// ============================================================================
// CONVERSATION TYPES
// ============================================================================

export type ConversationStatus = 'in_progress' | 'escalated' | 'closed' | 'resolved' | 'active';

export interface ConversationMessage {
  id: string;
  conversationId?: string;
  role?: 'user' | 'assistant' | 'system' | string;
  from?: 'user' | 'assistant' | 'system' | string; // mock data fallback
  content: string;
  confidence?: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
  [key: string]: any;
}

export interface ConversationLog {
  id: string;
  guestId: string;
  guestName: string;
  phoneNumber?: string;
  status: ConversationStatus;
  aiScore?: number;
  needsEscalation?: boolean;
  metadata?: Record<string, any>;
  messages: ConversationMessage[];
  propertyId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

// ============================================================================
// KNOWLEDGE BASE TYPES
// ============================================================================

export interface KnowledgeEntry {
  id: string;
  title?: string;
  question?: string; // mock data fallback
  answer?: string; // mock data fallback
  content?: string;
  category: string;
  isActive?: boolean;
  propertyId?: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

// ============================================================================
// TRAINING PROMPT TYPES
// ============================================================================

export interface TrainingPrompt {
  id: string;
  title?: string;
  name?: string; // mock data fallback
  content: string;
  category?: string;
  type?: string; // mock data fallback
  version?: number;
  isActive: boolean;
  testResult?: {
    status: 'passed' | 'failed' | 'pending';
    score?: number;
    feedback?: string;
  };
  propertyId?: string;
  createdAt: Date;
  updatedAt: Date;
  // additional properties from mock data
  variables?: string[];
  successRate?: number;
  usageCount?: number;
  lastUsed?: Date;
  [key: string]: any;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
  | 'new_guest'
  | 'booking_created'
  | 'payment_received'
  | 'ai_offline'
  | 'escalation_needed'
  | 'booking'
  | 'escalation'
  | 'payment'
  | 'achievement'
  | 'alert'
  | string;

export type NotificationStatus = 'read' | 'unread';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent' | 'medium' | string;

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status?: NotificationStatus;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  userId?: string;
  propertyId?: string;
  readAt?: Date;
  createdAt?: Date;
  [key: string]: any;
}

// ============================================================================
// PERFORMANCE METRICS TYPES
// ============================================================================

export interface PerformanceSnapshot {
  id: string;
  period: 'today' | 'week' | 'month';
  attendedCount: number;
  bookingsCount: number;
  revenue: number;
  occupancy?: number;
  conversion?: number;
  aiScore?: number;
  propertyId: string;
  createdAt: Date;
  [key: string]: any;
}

export interface RevenueMetrics {
  attendedToday?: number;
  attendedChange?: number;
  bookingsClosed?: number;
  bookingsChange?: number;
  revenue?: number;
  revenueChange?: number;
  occupancy?: number;
  occupancyChange?: number;
  conversion?: number;
  conversionChange?: number;
  aiScore?: number;
  aiScoreChange?: number;
  lastUpdated?: Date;
  // properties from mock data
  today?: any;
  weekly?: any;
  monthly?: any;
  [key: string]: any;
}

export type PerformanceMetrics = RevenueMetrics;

// ============================================================================
// AI STATUS TYPES
// ============================================================================

export type AIStatus = 'online' | 'processing' | 'offline' | 'error';

export interface AIStatusData {
  status: AIStatus;
  isProcessing: boolean;
  activeConversations: number;
  totalToday: number;
  averageResponseTime: number;
  lastActivity: Date;
  [key: string]: any;
}

// ============================================================================
// ROOM OCCUPANCY TYPES
// ============================================================================

export interface RoomOccupancy {
  date?: Date;
  totalRooms?: number;
  occupied?: number;
  available?: number;
  occupancyRate?: number;
  roomId?: string;
  status?: string;
  guestName?: string;
  checkOut?: string;
  [key: string]: any;
}

// ============================================================================
// PROPERTY SETTINGS TYPES
// ============================================================================

export type PropertySize = 'small' | 'medium' | 'large' | 'media';
export type PropertyTier = 'economica' | 'padrao' | 'luxo';
export type PropertyType = 'pousada' | 'hotel' | 'hostel' | 'chale' | 'resort';

export interface PropertySettings {
  id: string;
  name: string;
  size?: PropertySize;
  tier?: PropertyTier;
  type?: PropertyType;
  gridSize?: 'compact' | 'standard' | 'expanded';
  visibleModules?: string[];
  automationThresholds?: {
    autoBooking?: boolean;
    autoEscalation?: boolean;
    aiConfidence?: number;
  };
  dashboardDensity?: 'low' | 'medium' | 'high';
  language?: string;
  voice?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

// ============================================================================
// QUICK ACTION TYPES
// ============================================================================

export interface QuickAction {
  id: string;
  name?: string;
  description?: string;
  shortcut?: string;
  action: string | {
    type: 'navigate' | 'modal' | 'api' | 'command';
    path?: string;
    modalId?: string;
    apiEndpoint?: string;
    command?: string;
  };
  icon?: string;
  propertyId?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: Date;
  // properties from mock data
  category?: string;
  label?: string;
  requiresConfirmation?: boolean;
}

// ============================================================================
// DASHBOARD STATE TYPES
// ============================================================================

export interface DashboardState {
  activeTab: string;
  aiStatus: AIStatusData;
  metrics: RevenueMetrics;
  conversations: ConversationLog[];
  pipeline: {
    hot: Guest[];
    warm: Guest[];
    cold: Guest[];
    closed: Guest[];
    lost: Guest[];
  };
  notifications: Notification[];
  trainings: TrainingPrompt[];
  propertySettings: PropertySettings;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface GuestFilters {
  status?: GuestStatus;
  scoreMin?: number;
  scoreMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface ConversationFilters {
  status?: ConversationStatus;
  escalated?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  dateFrom?: Date;
  dateTo?: Date;
  guestId?: string;
  search?: string;
}

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export interface ChartDataPoint {
  name?: string;
  date?: string;
  value: number;
  timestamp?: Date;
}

export interface TimeSeriesData {
  date: string;
  revenue: number;
  bookings: number;
  occupancy: number;
  conversion: number;
}

export interface ConversionFunnelData {
  stage: string;
  count: number;
  conversion: number;
}

// ============================================================================
// DDC COMPONENT PROPS
// ============================================================================

export interface DDCHeaderProps {
  aiStatus: AIStatusData;
  metrics: RevenueMetrics;
  onNotificationClick: () => void;
  onUserMenuClick: () => void;
}

export interface RevenueMetricsProps {
  metrics: RevenueMetrics;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export interface AILiveFeedProps {
  conversations: ConversationLog[];
  isConnected: boolean;
  onReply: (conversationId: string, message: string) => void;
  onEscalate: (conversationId: string) => void;
  onViewDetails: (conversationId: string) => void;
}

export interface GuestCRMPipelineProps {
  pipeline: {
    hot: Guest[];
    warm: Guest[];
    cold: Guest[];
    closed: Guest[];
    lost: Guest[];
  };
  onStatusChange: (guestId: string, newStatus: GuestStatus) => void;
  onFilterChange: (filters: GuestFilters) => void;
}

export interface TrainingCenterProps {
  trainings: TrainingPrompt[];
  onAddTraining: (training: Omit<TrainingPrompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTestTraining: (trainingId: string) => Promise<TestResult>;
}

export interface TestResult {
  status: 'passed' | 'failed' | 'pending';
  score?: number;
  feedback?: string;
  timestamp: Date;
}

// ============================================================================
// EXPORT ALL
// ============================================================================