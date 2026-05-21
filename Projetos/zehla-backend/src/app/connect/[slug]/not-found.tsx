import Link from 'next/link';

export default function ConnectNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)' }}>
          <svg className="w-10 h-10" style={{ color: '#25D366' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: '#111B21' }}>Perfil não encontrado</h1>
        <p className="mt-3" style={{ color: '#667781' }}>
          Esta página do ZEHLA Connect não existe ou foi desativada pelo proprietário.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
          style={{ backgroundColor: '#25D366' }}
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
