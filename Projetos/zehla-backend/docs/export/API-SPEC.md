# ZEHLA SmartHotel — API Specification
# For Frontend Integration (Chat Z.AI)

## Base URL
```
Development: http://localhost:3000
Production: https://api.zehla.com.br
```

## Authentication
All endpoints (except /api/health) require JWT token in header:
```
Authorization: Bearer <token>
```
Token obtained from: POST /api/auth/callback/credentials

## Response Format
All responses follow:
```json
{
  "success": true|false,
  "data": {},
  "error": "string" (only if success=false)
}
```

## Endpoints Detail

### 1. GET /api/health
No auth required.
Response:
```json
{
  "status": "OK",
  "timestamp": "2026-04-25T10:00:00Z",
  "version": "2.5.0"
}
```

### 2. POST /api/agents/receptionist
Main WhatsApp handler.
Request:
```json
{
  "propertyId": "cl_string",
  "message": "Quanto custa um quarto?",
  "context": { "phone": "48999999999" },
  "sessionId": "optional"
}
```
Response:
```json
{
  "success": true,
  "agent": "RECEPTIONIST",
  "intent": "PRICE_INQUIRY",
  "confidence": 0.94,
  "response": "Temos quartos a partir de R$ 150/noite! 🏖️",
  "data": { "entities": { "quartos": "1" } },
  "tokensUsed": 120,
  "cost": 0.005,
  "duration": 350,
  "fallback": false
}
```

### 3. POST /api/agents/reservations
Reservation CRUD.
Request (CREATE):
```json
{
  "action": "CREATE",
  "propertyId": "cl_string",
  "data": {
    "roomId": "cl_string",
    "guestName": "João Silva",
    "guestEmail": "joao@email.com",
    "guestPhone": "48999999999",
    "guestCount": 2,
    "checkIn": "2026-05-01",
    "checkOut": "2026-05-05",
    "source": "WHATSAPP",
    "notes": "Lua de mel"
  }
}
```
Response:
```json
{
  "success": true,
  "data": {
    "id": "cl_string",
    "code": "ZEH-2026-005",
    "guestName": "João Silva",
    "roomPrice": 280,
    "totalAmount": 1120,
    "status": "CONFIRMED",
    "room": { "number": "101", "name": "Vista Mar" }
  }
}
```

### 4. POST /api/agents/housekeeping
Room status management.
Request (UPDATE_STATUS):
```json
{
  "action": "UPDATE_STATUS",
  "propertyId": "cl_string",
  "data": { "roomId": "cl_string", "status": "CLEANING" }
}
```
Response:
```json
{
  "success": true,
  "data": { "id": "cl_string", "number": "104", "status": "CLEANING" }
}
```

### 5. POST /api/agents/financial
Payments and revenue.
Request (CREATE_PAYMENT):
```json
{
  "action": "CREATE_PAYMENT",
  "propertyId": "cl_string",
  "data": { "reservationId": "cl_string" }
}
```
Response:
```json
{
  "success": true,
  "data": {
    "id": "cl_string",
    "amount": 1120,
    "status": "PENDING",
    "pixQrCode": "https://api.qrserver.com/...",
    "pixCode": "0002012658...",
    "pixExpiration": "2026-04-26T10:00:00Z"
  }
}
```

### 6. GET /api/rooms?propertyId=xxx
List rooms for a property.
Response:
```json
{
  "success": true,
  "data": [
    { "id": "cl_string", "number": "101", "name": "Vista Mar", "type": "DELUXE", "capacity": 2, "basePrice": 280, "status": "AVAILABLE", "amenities": ["Wi-Fi", "Ar", "TV"] }
  ]
}
```

### 7. GET /api/properties
List all properties (admin) or single property.
Response:
```json
{
  "success": true,
  "data": {
    "id": "cl_string",
    "name": "Pousada do Sol",
    "slug": "pousada-do-sol-praia-do-rosa",
    "address": "Rua das Ondas, 123",
    "city": "Imbituba",
    "state": "SC",
    "capacity": 8,
    "plan": "LITE",
    "isTrial": true,
    "trialEndsAt": "2026-05-02T00:00:00Z",
    "rooms": [ ... ],
    "services": [ ... ]
  }
}
```

### 8. POST /api/brain
Direct brain engine access.
Request (CLASSIFY_INTENT):
```json
{
  "action": "CLASSIFY_INTENT",
  "data": { "message": "Quero fazer uma reserva" }
}
```
Response:
```json
{
  "success": true,
  "data": {
    "intent": "RESERVATION_CREATE",
    "confidence": 0.95,
    "entities": { "data": "2026-05-01", "quartos": "1" },
    "rawMessage": "Quero fazer uma reserva"
  }
}
```

## Error Codes
| Code | Meaning |
|------|---------|
| 400 | Bad Request (missing fields) |
| 401 | Unauthorized (invalid token) |
| 404 | Not Found (resource doesn't exist) |
| 409 | Conflict (duplicate resource) |
| 429 | Rate Limited (Guardian blocked) |
| 500 | Internal Server Error |

## Frontend Integration Notes
1. All API calls should use the `apiClient` utility (src/lib/api/client.ts)
2. Handle loading states with `useApi` hook
3. Auth state managed by `useAuth` hook (localStorage + JWT)
4. Real-time updates via polling (every 30s) or WebSocket (future)
5. All dates are ISO 8601 strings
6. All prices are in BRL (float)
