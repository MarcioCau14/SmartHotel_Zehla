'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';  
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';  
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {  
  children: ReactNode;  
  fallback?: ReactNode;  
  name?: string;  
  onError?: (error: Error, errorInfo: ErrorInfo) => void;  
  showHomeButton?: boolean;  
}

interface ErrorBoundaryState {  
  hasError: boolean;  
  error: Error | null;  
  errorInfo: ErrorInfo | null;  
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {  
  constructor(props: ErrorBoundaryProps) {  
    super(props);  
    this.state = { hasError: false, error: null, errorInfo: null };  
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {  
    return { hasError: true, error };  
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {  
    this.setState({ errorInfo });  
    console.error(`[ErrorBoundary${this.props.name ? `:${this.props.name}` : ''}]`, error, errorInfo);  
    this.props.onError?.(error, errorInfo);

    if (process.env.NODE_ENV === 'production') {  
      fetch('/api/monitoring', {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          type: 'client-error-boundary',  
          component: this.props.name || 'Unknown',  
          error: error.message,  
          stack: error.stack,  
          componentStack: errorInfo.componentStack,  
          timestamp: new Date().toISOString(),  
        }),  
      }).catch(() => {});  
    }  
  }

  handleReset = () => { this.setState({ hasError: false, error: null, errorInfo: null }); };  
  handleGoHome = () => { window.location.href = '/'; };

  render(): ReactNode {  
    if (this.state.hasError) {  
      if (this.props.fallback) return this.props.fallback;  
      return (  
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-zinc-950 rounded-xl border border-white/[0.06]">  
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">  
            <AlertTriangle className="w-8 h-8 text-red-400" />  
          </div>  
          <h3 className="text-lg font-bold text-white mb-2">Algo deu errado</h3>  
          <p className="text-sm text-white/50 mb-1 text-center max-w-md">  
            {this.props.name && <span className="text-white/30">Componente: {this.props.name} — </span>}  
            Um erro inesperado ocorreu ao renderizar esta secao.  
          </p>  
          {process.env.NODE_ENV !== 'production' && this.state.error && (  
            <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-lg max-w-lg w-full overflow-auto max-h-32">  
              <p className="text-xs text-red-400 font-mono break-all">{this.state.error.message}</p>  
            </div>  
          )}  
          <div className="flex items-center gap-3 mt-6">  
            <Button onClick={this.handleReset} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm">  
              <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente  
            </Button>  
            {this.props.showHomeButton !== false && (  
              <Button variant="outline" onClick={this.handleGoHome} className="border-white/10 text-white/60 text-sm">  
                <Home className="w-4 h-4 mr-2" /> Inicio  
              </Button>  
            )}  
          </div>  
        </div>  
      );  
    }  
    return this.props.children;  
  }  
}  
