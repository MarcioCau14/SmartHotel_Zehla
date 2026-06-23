import { Server } from 'socket.io';

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

io.on('connection', (socket) => {
  console.log(`[Realtime] Client connected: ${socket.id}`);

  socket.on('tenant:join', (tenantId: string) => {
    socket.join(`tenant:${tenantId}`);
    console.log(`[Realtime] ${socket.id} joined tenant:${tenantId}`);
  });

  socket.on('tenant:leave', (tenantId: string) => {
    socket.leave(`tenant:${tenantId}`);
  });

  socket.on('ai:message', (data: { tenantId: string; message: object }) => {
    io.to(`tenant:${data.tenantId}`).emit('ai:message', data.message);
  });

  socket.on('ai:escalation', (data: { tenantId: string; escalation: object }) => {
    io.to(`tenant:${data.tenantId}`).emit('ai:escalation', data.escalation);
  });

  socket.on('booking:created', (data: { tenantId: string; booking: object }) => {
    io.to(`tenant:${data.tenantId}`).emit('booking:created', data.booking);
  });

  socket.on('booking:updated', (data: { tenantId: string; booking: object }) => {
    io.to(`tenant:${data.tenantId}`).emit('booking:updated', data.booking);
  });

  socket.on('notification:new', (data: { tenantId: string; notification: object }) => {
    io.to(`tenant:${data.tenantId}`).emit('notification:new', data.notification);
  });

  socket.on('guest:updated', (data: { tenantId: string; guest: object }) => {
    io.to(`tenant:${data.tenantId}`).emit('guest:updated', data.guest);
  });

  socket.on('metrics:refresh', (data: { tenantId: string }) => {
    io.to(`tenant:${data.tenantId}`).emit('metrics:refresh');
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Realtime] Client disconnected: ${socket.id} (${reason})`);
  });
});

console.log(`[Realtime] Socket.IO server running on port ${PORT}`);
