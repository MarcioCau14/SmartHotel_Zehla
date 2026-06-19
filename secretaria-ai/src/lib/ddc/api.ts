// ZEHLA DDC - Cognitive OS Command Center
// Client API Functions
import type {
  ApiResponse,
  PaginatedResponse,
  RevenueMetrics,
  Guest,
  Booking,
  ConversationLog,
  TrainingPrompt,
  Notification,
  AIStatusData,
  GuestFilters,
  ConversationFilters,
  BookingFilters
} from '@/types/ddc';

const API_BASE = '/api/ddc';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: {
        code: response.status.toString(),
        message: data.error || 'An error occurred',
        details: data.details
      }
    };
  }

  return {
    success: true,
    data: data.data || data,
    meta: data.meta
  };
}

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString() ? `?${searchParams.toString()}` : '';
}

// ============================================================================
// METRICS API
// ============================================================================

export async function fetchMetrics(period: 'today' | 'week' | 'month' = 'today'): Promise<ApiResponse<RevenueMetrics>> {
  const response = await fetch(`${API_BASE}/metrics?period=${period}`);
  return handleResponse<RevenueMetrics>(response);
}

export async function fetchAIStatus(): Promise<ApiResponse<AIStatusData>> {
  const response = await fetch(`${API_BASE}/ai-status`);
  return handleResponse<AIStatusData>(response);
}

// ============================================================================
// GUESTS API
// ============================================================================

export async function fetchGuests(filters?: GuestFilters): Promise<ApiResponse<PaginatedResponse<Guest>>> {
  const queryString = filters ? buildQueryString(filters) : '';
  const response = await fetch(`${API_BASE}/guests${queryString}`);
  return handleResponse<PaginatedResponse<Guest>>(response);
}

export async function fetchGuest(guestId: string): Promise<ApiResponse<Guest>> {
  const response = await fetch(`${API_BASE}/guests/${guestId}`);
  return handleResponse<Guest>(response);
}

export async function createGuest(guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Guest>> {
  const response = await fetch(`${API_BASE}/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(guest)
  });
  return handleResponse<Guest>(response);
}

export async function updateGuest(guestId: string, guest: Partial<Guest>): Promise<ApiResponse<Guest>> {
  const response = await fetch(`${API_BASE}/guests/${guestId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(guest)
  });
  return handleResponse<Guest>(response);
}

export async function deleteGuest(guestId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE}/guests/${guestId}`, {
    method: 'DELETE'
  });
  return handleResponse<void>(response);
}

export async function updateGuestStatus(guestId: string, status: Guest['status']): Promise<ApiResponse<Guest>> {
  return updateGuest(guestId, { status });
}

// ============================================================================
// BOOKINGS API
// ============================================================================

export async function fetchBookings(filters?: BookingFilters): Promise<ApiResponse<PaginatedResponse<Booking>>> {
  const queryString = filters ? buildQueryString(filters) : '';
  const response = await fetch(`${API_BASE}/bookings${queryString}`);
  return handleResponse<PaginatedResponse<Booking>>(response);
}

export async function fetchBooking(bookingId: string): Promise<ApiResponse<Booking>> {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`);
  return handleResponse<Booking>(response);
}

export async function createBooking(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Booking>> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });
  return handleResponse<Booking>(response);
}

export async function updateBooking(bookingId: string, booking: Partial<Booking>): Promise<ApiResponse<Booking>> {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });
  return handleResponse<Booking>(response);
}

export async function deleteBooking(bookingId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
    method: 'DELETE'
  });
  return handleResponse<void>(response);
}

// ============================================================================
// CONVERSATIONS API
// ============================================================================

export async function fetchConversations(filters?: ConversationFilters): Promise<ApiResponse<PaginatedResponse<ConversationLog>>> {
  const queryString = filters ? buildQueryString(filters) : '';
  const response = await fetch(`${API_BASE}/conversations${queryString}`);
  return handleResponse<PaginatedResponse<ConversationLog>>(response);
}

export async function fetchConversation(conversationId: string): Promise<ApiResponse<ConversationLog>> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}`);
  return handleResponse<ConversationLog>(response);
}

export async function deleteConversation(conversationId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    method: 'DELETE'
  });
  return handleResponse<void>(response);
}

export async function sendMessage(conversationId: string, message: string): Promise<ApiResponse<ConversationLog>> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message })
  });
  return handleResponse<ConversationLog>(response);
}

export async function escalateConversation(conversationId: string): Promise<ApiResponse<ConversationLog>> {
  const response = await fetch(`${API_BASE}/conversations/${conversationId}/escalate`, {
    method: 'POST'
  });
  return handleResponse<ConversationLog>(response);
}

// ============================================================================
// TRAINING PROMPTS API
// ============================================================================

export async function fetchTrainings(): Promise<ApiResponse<TrainingPrompt[]>> {
  const response = await fetch(`${API_BASE}/training`);
  return handleResponse<TrainingPrompt[]>(response);
}

export async function fetchTraining(trainingId: string): Promise<ApiResponse<TrainingPrompt>> {
  const response = await fetch(`${API_BASE}/training/${trainingId}`);
  return handleResponse<TrainingPrompt>(response);
}

export async function createTraining(training: Omit<TrainingPrompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<TrainingPrompt>> {
  const response = await fetch(`${API_BASE}/training`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(training)
  });
  return handleResponse<TrainingPrompt>(response);
}

export async function updateTraining(trainingId: string, training: Partial<TrainingPrompt>): Promise<ApiResponse<TrainingPrompt>> {
  const response = await fetch(`${API_BASE}/training/${trainingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(training)
  });
  return handleResponse<TrainingPrompt>(response);
}

export async function deleteTraining(trainingId: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE}/training/${trainingId}`, {
    method: 'DELETE'
  });
  return handleResponse<void>(response);
}

export async function testTraining(trainingId: string): Promise<ApiResponse<{ status: 'passed' | 'failed'; score: number; feedback: string }>> {
  const response = await fetch(`${API_BASE}/training/${trainingId}/test`, {
    method: 'POST'
  });
  return handleResponse<{ status: 'passed' | 'failed'; score: number; feedback: string }>(response);
}

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export async function fetchNotifications(): Promise<ApiResponse<Notification[]>> {
  const response = await fetch(`${API_BASE}/notifications`);
  return handleResponse<Notification[]>(response);
}

export async function markNotificationAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'read' })
  });
  return handleResponse<Notification>(response);
}

export async function markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT'
  });
  return handleResponse<void>(response);
}

// ============================================================================
// LIVE FEED (SSE)
// ============================================================================

export function connectToLiveFeed(onMessage: (conversation: ConversationLog) => void): EventSource {
  const eventSource = new EventSource(`${API_BASE}/live-feed`);

  eventSource.addEventListener('message', (event) => {
    try {
      const conversation: ConversationLog = JSON.parse(event.data);
      onMessage(conversation);
    } catch (error) {
      console.error('Error parsing live feed message:', error);
    }
  });

  eventSource.addEventListener('error', (error) => {
    console.error('Live feed connection error:', error);
  });

  return eventSource;
}

// ============================================================================
// ZCC INTEGRATION API
// ============================================================================

export async function notifyZCC(event: string, data: Record<string, any>): Promise<ApiResponse<void>> {
  const response = await fetch('/api/zcc/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, data })
  });
  return handleResponse<void>(response);
}