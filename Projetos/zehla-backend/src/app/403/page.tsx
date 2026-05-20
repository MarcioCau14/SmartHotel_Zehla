// src/app/403/page.tsx
'use client';

import { ShieldOff, ArrowLeft } from 'lucide-react';  
import Link from 'next/link';

export default function ForbiddenPage() {  
  return (  
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">  
      <div className="text-center space-y-6 max-w-md">  
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">  
          <ShieldOff className="w-12 h-12 text-rose-400" />  
        </div>  
        <div>  
          <h1 className="text-4xl font-bold text-slate-100 mb-2">403</h1>  
          <p className="text-lg text-slate-400">Acesso negado ao ZCC Security</p>  
          <p className="text-sm text-slate-600 mt-2">  
            Esta área requer credenciais SUPER_ADMIN.<br/>  
            Sua tentativa foi registrada pelo Guardian Agent.  
          </p>  
        </div>  
        <div className="flex justify-center">
          <Link   
            href="/dashboard"   
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm hover:bg-orange-500/20 transition-colors"  
          >  
            <ArrowLeft className="w-4 h-4" />  
            Voltar ao Dashboard  
          </Link>  
        </div>
      </div>  
    </div>  
  );
}
