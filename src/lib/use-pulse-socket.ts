'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const PULSE_PORT = 3003;

// ── Types matching the pulse-service ──────────────────────────────────────────────

export interface PulseAlert {
  id: string;
  timestamp: string;
  container: string;
  severity: 'ALTA' | 'MÉDIA' | 'BAIXA';
  title: string;
  stackTrace: string;
  arquivo_linha: string;
  impacto_usuario: string;
  causa_raiz: string;
  codigo_solucao: string;
}

export interface VPSMetrics {
  cpuUsage: number;
  cpuCores: number;
  ramUsed: number;
  ramTotal: number;
  diskUsed: number;
  diskTotal: number;
  loadAvg: [number, number, number];
  uptime: string;
  networkIn: number;
  networkOut: number;
  timestamp: string;
}

export interface ContainerStatus {
  name: string;
  service: string;
  status: 'running' | 'stopped' | 'restarting';
  uptime: string;
  cpu: number;
  memory: number;
  port: number;
  image: string;
}

export interface CommandPayload {
  type: 'clear_cache' | 'restart_agent' | 'pause_tenant' | 'force_container_restart';
  target: string;
  confirmToken?: string;
}

export interface CommandResult {
  success: boolean;
  message: string;
  target: string;
  type: string;
}

export interface AnalysisResult {
  alertId: string;
  container: string;
  title: string;
  analysis: {
    diagnostico: string;
    impacto: string;
    acao_recomendada: string;
    severidade_estimada: string;
    tempo_estimado_resolucao: string;
    automacao_possivel: boolean;
  };
  timestamp: string;
}

export function usePulseSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<VPSMetrics | null>(null);
  const [containers, setContainers] = useState<ContainerStatus[]>([]);
  const [alerts, setAlerts] = useState<PulseAlert[]>([]);
  const [commandResults, setCommandResults] = useState<CommandResult[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    let activeSocket: Socket | null = null;
    let destroyed = false;

    const connect = () => {
      if (activeSocket?.connected || destroyed) return;

      // Connect to the pulse-service via the gateway pattern
      // The Socket.io server runs on port 3003 (started via instrumentation.ts)
      const newSocket = io(`/?XTransformPort=${PULSE_PORT}`, {
        transports: ['websocket', 'polling'],
        reconnection: false,
      });

      newSocket.on('connect', () => {
        if (destroyed) return;
        console.log('[Pulse] Connected:', newSocket.id);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        newSocket.emit('zcc:subscribe');
      });

      newSocket.on('pulse:metrics', (data: VPSMetrics) => {
        if (destroyed) return;
        setMetrics(data);
      });

      newSocket.on('pulse:containers', (data: ContainerStatus[]) => {
        if (destroyed) return;
        setContainers(data);
      });

      newSocket.on('pulse:alert', (data: PulseAlert) => {
        if (destroyed) return;
        setAlerts(prev => [data, ...prev].slice(0, 50));
      });

      newSocket.on('command:result', (data: CommandResult) => {
        if (destroyed) return;
        setCommandResults(prev => [data, ...prev].slice(0, 20));
      });

      newSocket.on('analysis:result', (data: AnalysisResult) => {
        if (destroyed) return;
        setAnalysisResults(prev => [data, ...prev].slice(0, 20));
      });

      newSocket.on('disconnect', (reason) => {
        if (destroyed) return;
        console.log('[Pulse] Disconnected:', reason);
        setIsConnected(false);
        activeSocket = null;
        if (reason !== 'io server disconnect') {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current += 1;
          setTimeout(connect, delay);
        }
      });

      newSocket.on('connect_error', (err) => {
        if (destroyed) return;
        console.log('[Pulse] Connection error:', err.message);
        setIsConnected(false);
        activeSocket = null;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current += 1;
        setTimeout(connect, delay);
      });

      activeSocket = newSocket;
      setSocket(newSocket);
    };

    connect();

    return () => {
      destroyed = true;
      if (activeSocket) {
        activeSocket.disconnect();
        activeSocket = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  const sendCommand = useCallback((payload: CommandPayload) => {
    if (socket?.connected) {
      socket.emit('zcc:command', payload);
    }
  }, [socket]);

  const requestAnalysis = useCallback((alertId: string, container: string, title: string) => {
    if (socket?.connected) {
      socket.emit('zcc:request_analysis', { alertId, container, title });
    }
  }, [socket]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const clearCommandResults = useCallback(() => {
    setCommandResults([]);
  }, []);

  return {
    isConnected,
    metrics,
    containers,
    alerts,
    commandResults,
    analysisResults,
    sendCommand,
    requestAnalysis,
    clearAlerts,
    clearCommandResults,
  };
}
