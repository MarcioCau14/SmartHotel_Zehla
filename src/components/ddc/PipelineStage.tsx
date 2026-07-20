'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, Flame, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Guest, GuestStatus } from '@/types/ddc';

interface PipelineStageProps {
  status: GuestStatus;
  title: string;
  description: string;
  guests: Guest[];
  color: string;
  count: number;
  isActive?: boolean;
  onClick: () => void;
}

export function PipelineStage({
  status,
  title,
  description,
  guests,
  color,
  count,
  isActive = false,
  onClick
}: PipelineStageProps) {
  const slideIn = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    }
  } as const;

  const totalGuests = 45; // Mock total
  const percentage = (count / totalGuests) * 100;

  const getIcon = () => {
    switch (status) {
      case 'hot':
        return <Flame className="w-4 h-4" />;
      case 'warm':
        return <TrendingUp className="w-4 h-4" />;
      case 'cold':
        return <Clock className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'lost':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getBackgroundColor = () => {
    if (isActive) {
      return `bg-gradient-to-r ${color}`;
    }
    return 'bg-white/[0.02]';
  };

  const getBorderColor = () => {
    if (isActive) {
      return 'border-white/20';
    }
    return 'border-white/[0.06]';
  };

  const getTextColor = () => {
    if (isActive) {
      return 'text-white';
    }
    return 'text-white/70';
  };

  return (
    <motion.button
      variants={slideIn}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-white/[0.04] ${getBackgroundColor()} ${getBorderColor()}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white/[0.04]'} flex items-center justify-center`}>
            {getIcon()}
          </div>
          <div>
            <span className={`text-xs font-semibold ${getTextColor()}`}>
              {title}
            </span>
          </div>
        </div>
        <Badge variant="outline" className={`text-[9px] h-5 ${
          isActive ? 'bg-white/20 text-white border-white/30' : 'bg-white/10 text-white/70'
        }`}>
          {count}
        </Badge>
      </div>

      {/* Description */}
      {description && (
        <p className="text-[9px] text-white/40 mb-2 line-clamp-1">
          {description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        />
      </div>

      {/* Bottom Info */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[8px] text-white/30">
          {Math.round(percentage)}% do total
        </span>
        <div className="flex -space-x-1">
          {guests.slice(0, 3).map((guest, index) => (
            <div
              key={guest.id}
              className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 border-2 border-white/[0.08] flex items-center justify-center text-[8px] text-white font-bold"
              style={{ zIndex: 3 - index }}
            >
              {(guest.name ?? '?').split(' ').map(n => n[0]).join('')}
            </div>
          ))}
          {guests.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-white/10 border-2 border-white/[0.08] flex items-center justify-center text-[8px] text-white/60 font-bold">
              +{guests.length - 3}
            </div>
          )}
        </div>
      </div>
    </motion.button>
  );
}