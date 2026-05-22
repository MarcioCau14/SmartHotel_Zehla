'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Instagram, Share2, MapPin, Bed, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

interface PousadaProfileData {
  nome: string;
  slug: string;
  descricao: string;
  cidade: string;
  estado: string;
  whatsapp: string;
  instagram: string;
  quartos: number;
  fotos: string[];
  avatarUrl?: string;
  coverUrl?: string;
}

interface PousadaProfileProps {
  data: PousadaProfileData;
}

function formatWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/55${digits}`;
}

export function PousadaProfile({ data }: PousadaProfileProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const initials = data.nome
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: data.nome, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {data.fotos.length > 0 ? (
          <img
            src={data.fotos[0]}
            alt={data.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-emerald-500/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-20 relative z-10 pb-16">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl ring-4 ring-black">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt={data.nome} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-3xl font-black text-black">{initials}</span>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-1">{data.nome}</h1>
          <div className="flex items-center justify-center gap-1 text-sm text-neutral-500 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{data.cidade}, {data.estado}</span>
          </div>
          {data.descricao && (
            <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
              {data.descricao}
            </p>
          )}
          {data.quartos > 0 && (
            <div className="flex items-center justify-center gap-1 text-xs text-neutral-600 mt-2">
              <Bed className="w-3 h-3" />
              <span>{data.quartos} quartos</span>
            </div>
          )}
        </motion.div>

        {/* Photo Carousel */}
        {data.fotos.length > 1 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative mb-8 rounded-2xl overflow-hidden aspect-video"
          >
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
              {data.fotos[currentPhoto] ? (
                <img
                  src={data.fotos[currentPhoto]}
                  alt={`${data.nome} - Foto ${currentPhoto + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Building2 className="w-12 h-12 text-neutral-700" />
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <button
                onClick={() => setCurrentPhoto((p) => (p > 0 ? p - 1 : data.fotos.length - 1))}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPhoto((p) => (p < data.fotos.length - 1 ? p + 1 : 0))}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {data.fotos.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentPhoto ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <a
            href={formatWhatsApp(data.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-xl shadow-green-500/20 transition-all active:scale-[0.98]"
          >
            <Smartphone className="w-6 h-6" />
            Reservar via WhatsApp
          </a>

          <div className="grid grid-cols-2 gap-3">
            {data.instagram && (
              <a
                href={`https://instagram.com/${data.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 hover:border-pink-500/40 text-pink-400 font-semibold text-sm transition-all active:scale-[0.98]"
              >
                <Instagram className="w-5 h-5" />
                Siga no Instagram
              </a>
            )}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-neutral-300 font-semibold text-sm transition-all active:scale-[0.98]"
            >
              <Share2 className="w-5 h-5" />
              Compartilhar Perfil
            </button>
          </div>
        </motion.div>

        {/* Reviews placeholder */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 rounded-2xl glass-strong border border-white/5 text-center"
        >
          <p className="text-xs text-neutral-600">
            Avaliações em breve
          </p>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-neutral-400">ZEHLA</span>
          </div>
          <p className="text-[10px] text-neutral-700">
            Perfil gratuito · Feito com ZEHLA SmartHotel
          </p>
        </div>
      </div>
    </div>
  );
}
