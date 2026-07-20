'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Play,
  X,
  Star,
  MapPin,
  TrendingUp,
  MessageSquare,
  Calendar,
  ChevronRight,
  Quote,
} from 'lucide-react';
import { useNiche } from '@/contexts/NicheContext';

interface CaseStudy {
  id: string;
  name: string;
  location: string;
  avatar: string;
  quote: string;
  videoUrl: string;
  videoThumb: string;
  stats: {
    metric: string;
    value: string;
    description: string;
  }[];
  tags: string[];
}

const pousadasCases: CaseStudy[] = [
  {
    id: 'serenity',
    name: 'Pousada Serenity',
    location: 'Florianópolis, SC',
    avatar: '/avatar-serenity.jpg',
    quote: 'Antes do Zélla, perdíamos 60% das mensagens que chegavam à noite. Hoje, nenhuma mensagem fica sem resposta — e as reservas aumentaram 42% em 3 meses.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumb: '/pousada-vista.jpg',
    stats: [
      { metric: 'Reservas', value: '+42%', description: 'Aumento em 90 dias' },
      { metric: 'Respostas', value: '< 8s', description: 'Tempo médio de resposta' },
      { metric: 'Noites Vendidas', value: '+180', description: 'No primeiro trimestre' },
    ],
    tags: ['12 quartos', 'Praia', 'Alta temporada'],
  },
  {
    id: 'sol-mar',
    name: 'Pousada Sol & Mar',
    location: 'Ubatuba, SP',
    avatar: '/avatar-solmar.svg',
    quote: 'O Zélla pagou a si mesmo no primeiro mês. A economia com a otimização de mensagens e o aumento de reservas diretas cobriram o plano LITE inteiro.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumb: '/pousada-piscina.jpg',
    stats: [
      { metric: 'ROI', value: '12x', description: 'Retorno sobre investimento' },
      { metric: 'Diretas', value: '+35%', description: 'Reservas sem intermediário' },
      { metric: 'Economia', value: 'R$2.400', description: 'Economia mensal em taxas' },
    ],
    tags: ['8 quartos', 'Piscina', 'Férias'],
  },
  {
    id: 'chale-montanha',
    name: 'Chalé da Montanha',
    location: 'Campos do Jordão, SP',
    avatar: '/avatar-chale.svg',
    quote: 'Meus hóspedes acham que eu tenho uma equipe de 5 pessoas atendendo WhatsApp. Na verdade, é só eu e o Zélla. A IA responde no meu tom de voz.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumb: '/pousada-chale.jpg',
    stats: [
      { metric: 'Satisfação', value: '4.9/5', description: 'Avaliação dos hóspedes' },
      { metric: 'Automação', value: '89%', description: 'Mensagens sem intervenção' },
      { metric: 'Tempo', value: '-15h', description: 'Horas poupadas por semana' },
    ],
    tags: ['6 chalés', 'Montanha', 'Inverno'],
  },
];

const anfitrioesCases: CaseStudy[] = [
  {
    id: 'apt-centro-sp',
    name: 'Apartamento Centro SP',
    location: 'São Paulo, SP',
    avatar: '/avatar-serenity.jpg',
    quote: 'Antes do Zélla, eu perdia várias mensagens de hóspedes enquanto trabalhava. Hoje, a IA responde por mim 24h e já fechou reservas de R$8.000 num único mês.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumb: '/pousada-vista.jpg',
    stats: [
      { metric: 'Reservas', value: '+38%', description: 'Aumento em 90 dias' },
      { metric: 'Respostas', value: '< 6s', description: 'Tempo médio de resposta' },
      { metric: 'Faturamento', value: 'R$8k', description: 'Faturado em 1 mês' },
    ],
    tags: ['1 imóvel', 'Airbnb', 'Urbano'],
  },
  {
    id: 'flat-copa',
    name: 'Flat Copacabana',
    location: 'Rio de Janeiro, RJ',
    avatar: '/avatar-solmar.svg',
    quote: 'O Zélla pagou a si mesmo no primeiro mês. O check-in virtual e as respostas automáticas cobriram o plano LITE inteiro com o que economizei em comissões.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumb: '/pousada-piscina.jpg',
    stats: [
      { metric: 'ROI', value: '15x', description: 'Retorno sobre investimento' },
      { metric: 'Diretas', value: '+40%', description: 'Reservas sem intermediário' },
      { metric: 'Economia', value: 'R$1.800', description: 'Economia mensal em taxas' },
    ],
    tags: ['2 imóveis', 'Praia', 'Alta temporada'],
  },
  {
    id: 'chale-campos',
    name: 'Chalé Campos',
    location: 'Campos do Jordão, SP',
    avatar: '/avatar-chale.svg',
    quote: 'Meus hóspedes elogiam o atendimento rápido pelo WhatsApp. A IA do Zélla responde no meu tom e resolve tudo, desde a reserva até as orientações de chegada.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoThumb: '/pousada-chale.jpg',
    stats: [
      { metric: 'Satisfação', value: '4.9/5', description: 'Avaliação dos hóspedes' },
      { metric: 'Automação', value: '92%', description: 'Mensagens sem intervenção' },
      { metric: 'Tempo', value: '-12h', description: 'Horas poupadas por semana' },
    ],
    tags: ['1 chalé', 'Montanha', 'Fim de semana'],
  },
];

function VideoModal({ videoUrl, onClose }: { videoUrl: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={videoUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Depoimento em vídeo"
        />
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

function CaseCard({ study, index }: { study: CaseStudy; index: number }) {
  const [showVideo, setShowVideo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.15 }}
        className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all duration-300"
      >
        {/* Video Thumbnail */}
        <div
          className="relative aspect-video overflow-hidden cursor-pointer"
          onClick={() => setShowVideo(true)}
        >
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
            style={{ backgroundImage: `url(${study.videoThumb})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/90 flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:scale-110 group-hover:bg-emerald-400 transition-all duration-300">
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </div>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <img src={study.avatar} alt={study.name} className="w-8 h-8 rounded-full border-2 border-white/20 object-cover" />
              <div>
                <h3 className="text-white font-bold text-sm">{study.name}</h3>
                <div className="flex items-center gap-1 text-neutral-300 text-[10px]">
                  <MapPin className="w-2.5 h-2.5" />
                  {study.location}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="absolute top-4 right-4 flex gap-1.5">
            {study.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white text-[9px] font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-7">
          {/* Quote */}
          <div className="relative mb-7">
            <Quote className="absolute -top-1 -left-1 w-6 h-6 text-emerald-500/20" />
            <p className="text-neutral-300 text-sm leading-relaxed pl-5 italic">
              &ldquo;{study.quote}&rdquo;
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {study.stats.map((stat) => (
              <div key={stat.metric} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-xl font-extrabold text-emerald-400 mb-0.5">{stat.value}</div>
                <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{stat.metric}</div>
                <div className="text-[9px] text-neutral-600 mt-0.5">{stat.description}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowVideo(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/80 text-sm font-medium hover:bg-white/[0.06] hover:text-white transition-all duration-200 cursor-pointer"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            Ver depoimento completo
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showVideo && <VideoModal videoUrl={study.videoUrl} onClose={() => setShowVideo(false)} />}
      </AnimatePresence>
    </>
  );
}

export function SuccessCasesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { isAirbnb } = useNiche();

  const activeCases = isAirbnb ? anfitrioesCases : pousadasCases;

  const headerTitle = isAirbnb
    ? (<>Anfitriões reais, <span className="text-amber-400 font-bold">resultados reais</span></>)
    : (<>Pousadas reais, <span className="text-amber-400 font-bold">resultados reais</span></>);

  const headerDesc = isAirbnb
    ? 'Veja como anfitriões de diferentes regiões do Brasil transformaram seu atendimento e aumentaram suas reservas com o Zélla.'
    : 'Veja como pousadas de diferentes regiões do Brasil transformaram seu atendimento e aumentaram suas reservas com o Zélla.';

  const bottomStats = isAirbnb
    ? [
        { icon: MessageSquare, value: '50.000+', label: 'Mensagens IA/mês' },
        { icon: TrendingUp, value: '35%', label: 'Aumento médio em reservas' },
        { icon: Calendar, value: '100+', label: 'Anfitriões atendidos' },
        { icon: Star, value: '4.9/5', label: 'Satisfação dos hóspedes' },
      ]
    : [
        { icon: MessageSquare, value: '50.000+', label: 'Mensagens IA/mês' },
        { icon: TrendingUp, value: '35%', label: 'Aumento médio em reservas' },
        { icon: Calendar, value: '100+', label: 'Pousadas atendidas' },
        { icon: Star, value: '4.9/5', label: 'Satisfação dos hóspedes' },
      ];

  return (
    <section ref={ref} className="relative py-28 sm:py-36 lg:py-44 bg-[#0a0a0a] overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-medium uppercase tracking-wider">Casos de Sucesso</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">
            {headerTitle}
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            {headerDesc}
          </p>
        </motion.div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeCases.map((study, i) => (
            <CaseCard key={study.id} study={study} index={i} />
          ))}
        </div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
        >
          {bottomStats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="text-center">
                <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <div className="text-xl font-extrabold text-white">{item.value}</div>
                <div className="text-[10px] text-neutral-500 font-medium">{item.label}</div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
