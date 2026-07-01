import { Server } from 'socket.io';
import * as jose from 'jose';

const PORT = 3005;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://smart-hotel-zehla.vercel.app'];

const io = new Server(PORT, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.warn('[Realtime] MOCK mode — conexão sem token');
    socket.data.tenantId = 'client-001';
    socket.data.role = 'guest';
    return next();
  }
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production');
    const { payload } = await jose.jwtVerify(token, secret);
    socket.data.tenantId = (payload as Record<string, unknown>).tenantId as string || 'client-001';
    socket.data.role = (payload as Record<string, unknown>).role as string || 'guest';
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`[Realtime] Client connected: ${socket.id} (tenant: ${socket.data.tenantId})`);

  socket.on('tenant:join', (tenantId: string) => {
    if (tenantId !== socket.data.tenantId && socket.data.tenantId !== 'client-001') {
      socket.emit('error', { message: 'Unauthorized room access' });
      return;
    }
    socket.join(`tenant:${tenantId}`);
    console.log(`[Realtime] ${socket.id} joined tenant:${tenantId}`);
  });

  socket.on('tenant:leave', (tenantId: string) => {
    socket.leave(`tenant:${tenantId}`);
  });

  socket.on('ai:message', (data: { tenantId: string; message: object }) => {
    if (data.tenantId === socket.data.tenantId || socket.data.tenantId === 'client-001') {
      io.to(`tenant:${data.tenantId}`).emit('ai:message', data.message);
    }
  });

  socket.on('ai:escalation', (data: { tenantId: string; escalation: object }) => {
    if (data.tenantId === socket.data.tenantId || socket.data.tenantId === 'client-001') {
      io.to(`tenant:${data.tenantId}`).emit('ai:escalation', data.escalation);
    }
  });

  socket.on('booking:created', (data: { tenantId: string; booking: object }) => {
    if (data.tenantId === socket.data.tenantId || socket.data.tenantId === 'client-001') {
      io.to(`tenant:${data.tenantId}`).emit('booking:created', data.booking);
    }
  });

  socket.on('booking:updated', (data: { tenantId: string; booking: object }) => {
    if (data.tenantId === socket.data.tenantId || socket.data.tenantId === 'client-001') {
      io.to(`tenant:${data.tenantId}`).emit('booking:updated', data.booking);
    }
  });

  socket.on('notification:new', (data: { tenantId: string; notification: object }) => {
    if (data.tenantId === socket.data.tenantId || socket.data.tenantId === 'client-001') {
      io.to(`tenant:${data.tenantId}`).emit('notification:new', data.notification);
    }
  });

  socket.on('guest:updated', (data: { tenantId: string; guest: object }) => {
    if (data.tenantId === socket.data.tenantId || socket.data.tenantId === 'client-001') {
      io.to(`tenant:${data.tenantId}`).emit('guest:updated', data.guest);
    }
  });

  socket.on('metrics:refresh', (data: { tenantId: string }) => {
    if (data.tenantId === socket.data.tenantId || socket.data.tenantId === 'client-001') {
      io.to(`tenant:${data.tenantId}`).emit('metrics:refresh');
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Realtime] Client disconnected: ${socket.id} (${reason})`);
  });
});

console.log(`[Realtime] Socket.IO server running on port ${PORT}`);
