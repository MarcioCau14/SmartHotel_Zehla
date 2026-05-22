import Link from 'next/link';
import { Brain } from 'lucide-react';

export function MainFooter() {
  return (
    <footer className="w-full border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-orange-500" />
              </div>
              <span className="font-bold text-lg text-neutral-100">ZEHLA</span>
            </Link>
            <p className="text-xs text-neutral-600 leading-relaxed">
              O Sistema Operacional Cognitivo para pousadas brasileiras.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-5">Planos</h4>
            <ul className="space-y-3">
              <li><Link href="/vendas#gratis" className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors">Grátis</Link></li>
              <li><Link href="/vendas#lite" className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors">Lite — R$ 248/mês</Link></li>
              <li><Link href="/vendas#pro" className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors">PRO — R$ 448/mês</Link></li>
              <li><Link href="/vendas#max" className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors">MAX — R$ 798/mês</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-5">Links</h4>
            <ul className="space-y-3">
              <li><Link href="/termos" className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors">Privacidade</Link></li>
              <li><Link href="/ajuda" className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors">Ajuda</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-5">Contato</h4>
            <ul className="space-y-3">
              <li><span className="text-sm text-neutral-600">suporte@zehla.com.br</span></li>
              <li><span className="text-sm text-neutral-600">ZEHLA Technologies</span></li>
              <li><span className="text-sm text-neutral-600">Brasil</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-neutral-700">
            &copy; {new Date().getFullYear()} ZEHLA SmartHotel. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
