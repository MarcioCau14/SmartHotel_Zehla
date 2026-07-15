'use client';

import { useEffect } from 'react';  
import { AlertTriangle, RefreshCw } from 'lucide-react';  
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {  
  useEffect(() => {  
    fetch('/api/monitoring', {  
      method: 'POST',  
      headers: { 'Content-Type': 'application/json' },  
      body: JSON.stringify({ type: 'global-error', error: error.message, digest: error.digest, stack: error.stack, timestamp: new Date().toISOString() }),  
    }).catch(() => {});  
    console.error('[GlobalError]', error);  
  }, [error]);

  return (  
    <html lang="pt-BR">  
      <body className="bg-zinc-950 text-white antialiased">  
        <div className="flex flex-col items-center justify-center min-h-screen p-8">  
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8">  
            <AlertTriangle className="w-10 h-10 text-red-400" />  
          </div>  
          <h1 className="text-3xl font-bold text-white mb-3">Erro inesperado</h1>  
          <p className="text-neutral-400 mb-2 text-center max-w-md">Um erro fatal ocorreu na aplicacao. Tente recarregar a pagina.</p>  
          {error.digest && <p className="text-xs text-white/30 mb-6 font-mono">ID: {error.digest}</p>}  
          {process.env.NODE_ENV !== 'production' && (  
            <div className="mb-6 p-4 bg-red-500/5 border border-red-500/10 rounded-lg max-w-lg w-full overflow-auto max-h-40">  
              <p className="text-xs text-red-400 font-mono">{error.message}</p>  
              {error.stack && <pre className="text-xs text-red-400/60 font-mono mt-2 whitespace-pre-wrap">{error.stack.split('\n').slice(0, 10).join('\n')}</pre>}  
            </div>  
          )}  
          <Button onClick={reset} className="bg-emerald-600 hover:bg-emerald-700 text-white">  
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente  
          </Button>  
          <p className="text-neutral-700 text-xs mt-12">(c) 2025 ZEHLA SmartHotel</p>  
        </div>  
      </body>  
    </html>  
  );  
}  
