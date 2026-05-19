import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';


'use client';


interface Props {
  children: ReactNode;
  fallbackName?: string;
}

interface State {
  hasError: boolean;
  errorMsg: string;
  isRetrying: boolean;
}

export class ZccAutoHealer extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: '',
    isRetrying: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message, isRetrying: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ZCC Guardian Agent] Intercepted runtime error in ${this.props.fallbackName || 'Component'}:`, error, errorInfo);
    // Em um ambiente de produção real, o Guardião enviaria esse log pro Prisma
    // fetch('/api/security/log', { method: 'POST', body: JSON.stringify({ error: error.message, stack: errorInfo.componentStack }) })
  }

  private handleRetry = () => {
    this.setState({ isRetrying: true });
    // Agent Auto-heal delay
    setTimeout(() => {
      this.setState({ hasError: false, isRetrying: false, errorMsg: '' });
    }, 1500);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-semibold text-red-200">
              Guardião Interceptou Erro: {this.props.fallbackName || 'Componente'}
            </h3>
          </div>
          <p className="text-xs text-red-300/80 mb-4 font-mono truncate">
            {this.state.errorMsg}
          </p>
          <button 
            onClick={this.handleRetry}
            disabled={this.state.isRetrying}
            className="flex items-center gap-2 text-[10px] bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
            {this.state.isRetrying ? 'Agente tentando recuperação...' : 'Forçar Recuperação (Auto-Heal)'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
