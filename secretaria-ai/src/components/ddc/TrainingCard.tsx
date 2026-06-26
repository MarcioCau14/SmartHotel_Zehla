'use client';

import { motion } from 'framer-motion';
import { BookOpen, Play, CheckCircle2, XCircle, MoreVertical, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TrainingPrompt } from '@/types/ddc';

interface TrainingCardProps {
  training: TrainingPrompt;
  onClick: () => void;
  onTest: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: () => void;
}

export function TrainingCard({
  training,
  onClick,
  onTest,
  onEdit,
  onDelete,
  onToggleActive
}: TrainingCardProps) {
  const slideIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    }
  } as const;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'checkin': 'from-emerald-500 to-green-500',
      'checkout': 'from-blue-500 to-cyan-500',
      'servicos': 'from-purple-500 to-violet-500',
      'horarios': 'from-amber-500 to-orange-500',
      'reservas': 'from-pink-500 to-rose-500',
      'politicas': 'from-slate-500 to-gray-500',
      'faq': 'from-indigo-500 to-blue-500'
    };
    return colors[category] || 'from-gray-500 to-slate-500';
  };

  const testStatus = training.testResult?.status;

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      animate="visible"
      onClick={onClick}
    >
      <Card className="bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] transition-all cursor-pointer hover:bg-white/[0.04]">
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getCategoryColor(training.category || training.type || '')} flex items-center justify-center`}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white line-clamp-1">
                  {training.title || training.name}
                </div>
                <div className="text-[9px] text-white/40">
                  {training.category || training.type}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Test Result Badge */}
              {testStatus && (
                <Badge variant="outline" className={`text-[8px] h-4 ${
                  testStatus === 'passed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  testStatus === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}>
                  {testStatus === 'passed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {testStatus === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                  {testStatus === 'passed' ? `${training.testResult?.score}%` : 'Falhou'}
                </Badge>
              )}

              {/* Active Badge */}
              {training.isActive && (
                <Badge variant="outline" className="text-[8px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Ativo
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3 text-white/40" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0a0a0f] border-white/[0.06]">
                  <DropdownMenuItem
                    className="text-white/70 hover:text-white cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onTest(); }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Testar
                  </DropdownMenuItem>
                  {onToggleActive && (
                    <DropdownMenuItem
                      className="text-white/70 hover:text-white cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
                    >
                      {training.isActive ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem
                      className="text-white/70 hover:text-white cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      className="text-red-400 hover:text-red-300 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Version */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[8px] h-4 bg-white/[0.04] text-white/60 border-white/[0.08]">
              v{training.version}
            </Badge>
            <span className="text-[9px] text-white/40">
              Atualizado {new Date(training.updatedAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {/* Content Preview */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 mb-2">
            <p className="text-[10px] text-white/60 line-clamp-2">
              {training.content}
            </p>
          </div>

          {/* Test Result */}
          {training.testResult && training.testResult.feedback && (
            <div className={`p-2 rounded-lg border ${
              testStatus === 'passed'
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : testStatus === 'failed'
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-yellow-500/10 border-yellow-500/20'
            }`}>
              <p className="text-[9px] text-white/70 line-clamp-1">
                {training.testResult.feedback}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-2 pt-2 border-t border-white/[0.04]">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10 text-xs"
              onClick={(e) => { e.stopPropagation(); onTest(); }}
            >
              <Play className="w-3 h-3 mr-1.5" />
              Testar Prompt
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}