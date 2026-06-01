export function MainFooter() {
  return (
    <footer className="w-full py-8 text-center text-xs text-[#555555] border-t border-white/5 bg-[#050505]/80 backdrop-blur-md tracking-wider uppercase">
      <p>
        &copy; {new Date().getFullYear()} <span className="text-[#FF5500] font-bold">ZEHLA</span>. Todos os direitos reservados.
      </p>
    </footer>
  );
}

