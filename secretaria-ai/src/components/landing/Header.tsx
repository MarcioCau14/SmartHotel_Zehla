'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Como Funciona', href: '#como-funciona' },
    { name: 'Funcionalidades', href: '#funcionalidades' },
    { name: 'Calculadora', href: '#calculadora' },
    { name: 'Preços', href: '#precos' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md bg-[#0a0a0f]/80 border-b border-white/[0.06] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg">
          <div className="relative w-8 h-8 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-lg group-hover:border-emerald-500/30 transition-all">
            <img src="/logo.svg" className="w-5 h-5" alt="Seu ZÉLLA Logo" />
          </div>
          <span className="text-lg font-bold text-white tracking-wide font-sans">
            Seu <span className="gradient-text-royal font-bold">ZÉLLA</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs font-medium text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-md px-1 py-0.5"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-white/80 hover:text-white px-4 py-2 transition-all active:scale-95 duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
          >
            ENTRAR
          </Link>
          <Link
            href="#precos"
            className="group relative inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95 duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span>Testar por 7 dias</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-b border-white/[0.06] bg-[#0a0a0f] overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-white/70 hover:text-white py-1 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/[0.06] my-2" />
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm font-semibold text-white/80 hover:text-white py-2 border border-white/10 rounded-xl transition-all"
                >
                  ENTRAR
                </Link>
                <Link
                  href="#precos"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Testar por 7 dias
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
