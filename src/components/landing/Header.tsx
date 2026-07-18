'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { ZellaLogo } from '@/components/brand/ZellaLogo';

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
    { name: 'Como Funciona', href: '#como-funciona', lgOnly: false },
    { name: 'Funcionalidades', href: '#funcionalidades', lgOnly: false },
    { name: 'Integrações', href: '#integracoes', lgOnly: true },
    { name: 'Calculadora', href: '#calculadora', lgOnly: true },
    { name: 'Preços', href: '#precos', lgOnly: false },
    { name: 'FAQ', href: '#faq', lgOnly: true },
    { name: 'Contato', href: '#contato', lgOnly: false },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md bg-[#0a0a0f]/80 border-b border-white/[0.06] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-10 flex items-center justify-between gap-6 md:gap-8 lg:gap-10">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg">
          <ZellaLogo size={42} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-xs font-medium text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-md px-1 py-0.5${link.lgOnly ? ' hidden lg:block' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-white/80 hover:text-white px-4 py-2 transition-all active:scale-95 duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
          >
            ENTRAR
          </Link>
          <Link
            href="#precos"
            className="group relative inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-400 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
                  className="w-full text-center text-sm font-semibold text-white bg-blue-500 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all"
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
