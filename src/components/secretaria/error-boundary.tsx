'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    /* Log silencioso para debug sem crashar */
    console.error(`[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ''}]`, error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex flex-col items-center justify-center text-center min-h-[200px]"
        >
          <div className="p-3 rounded-2xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] mb-4">
            <AlertTriangle size={24} className="text-[#ef4444]" />
          </div>
          <h3 className="text-sm font-bold text-[#f1f5f9] mb-1">Erro ao carregar dados</h3>
          <p className="text-xs text-[#94a3b8] mb-4 max-w-[300px]">
            {this.state.error?.message || 'Ocorreu um erro inesperado. Tente novamente.'}
          </p>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#f1f5f9] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-all duration-200"
          >
            <RefreshCw size={13} />
            Tentar Novamente
          </motion.button>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
