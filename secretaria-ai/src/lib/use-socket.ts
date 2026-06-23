'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const REALTIME_PORT = 3005;

interface UseSocketOptions {
  tenantId: string | null;
  autoConnect?: boolean;
}

export function useSocket({ tenantId, autoConnect = true }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectDelay = 30000;

  const getReconnectDelay = useCallback(() => {
    const attempt = reconnectAttemptsRef.current;
    const delay = Math.min(1000 * Math.pow(2, attempt), maxReconnectDelay);
    return delay;
  }, []);

  useEffect(() => {
    if (!autoConnect || !tenantId) return;

    const connect = () => {
      if (socketRef.current?.connected) return;

      const socketInstance = io('/?XTransformPort=' + REALTIME_PORT, {
        transports: ['websocket', 'polling'],
        reconnection: false,
      });

      socketInstance.on('connect', () => {
        console.log('[Socket] Connected:', socketInstance.id);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        socketInstance.emit('tenant:join', tenantId);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
        setIsConnected(false);
        socketRef.current = null;
        setSocket(null);

        if (reason !== 'io server disconnect') {
          const delay = getReconnectDelay();
          reconnectAttemptsRef.current += 1;
          console.log(`[Socket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          setTimeout(connect, delay);
        }
      });

      socketInstance.on('connect_error', () => {
        setIsConnected(false);
        socketRef.current = null;
        setSocket(null);
        const delay = getReconnectDelay();
        reconnectAttemptsRef.current += 1;
        setTimeout(connect, delay);
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('tenant:leave', tenantId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [tenantId, autoConnect, getReconnectDelay]);

  const emit = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  return { socket, isConnected, emit, on };
}
