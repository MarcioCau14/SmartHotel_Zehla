// Minimal test - just start Socket.io server
import { Server } from 'socket.io';

const PORT = 3003;

const io = new Server({
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

io.listen(PORT);
console.log(`Socket.io server listening on port ${PORT}`);
