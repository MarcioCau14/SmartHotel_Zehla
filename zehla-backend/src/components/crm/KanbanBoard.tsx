'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Plus, Loader2, GripVertical, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PipelineStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

interface Deal {
  id: string;
  title: string;
  value: number;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  probability: number;
  stage: PipelineStage;
}

const STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'prospecting', label: 'Prospecção', color: 'bg-slate-500' },
  { id: 'qualification', label: 'Qualificação', color: 'bg-blue-500' },
  { id: 'proposal', label: 'Proposta', color: 'bg-amber-500' },
  { id: 'negotiation', label: 'Negociação', color: 'bg-orange-500' },
  { id: 'closed_won', label: 'Ganho', color: 'bg-emerald-500' },
  { id: 'closed_lost', label: 'Perdido', color: 'bg-red-500' },
];

const STAGE_ORDER: PipelineStage[] = STAGES.map((s) => s.id);

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function DealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: deal.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 cursor-grab active:cursor-grabbing transition-all',
        'hover:border-slate-600 hover:bg-slate-800/80',
        isDragging && 'opacity-50 ring-2 ring-orange-500/30 shadow-xl z-50',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-white leading-tight line-clamp-2">{deal.title}</h4>
        <GripVertical className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
      </div>
      <p className="text-base font-bold text-emerald-400 mb-2">{formatBRL(deal.value)}</p>
      <p className="text-xs text-slate-400 mb-2">{deal.contactName}</p>
      <div className="flex items-center justify-between">
        <Badge
          className={cn(
            'text-[10px] px-1.5 py-0',
            deal.probability >= 80
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : deal.probability >= 50
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-slate-500/20 text-slate-400 border-slate-500/30',
          )}
          variant="outline"
        >
          {deal.probability}%
        </Badge>
        <div className="flex gap-1">
          {deal.contactPhone && <Phone className="w-3 h-3 text-slate-500" />}
          {deal.contactEmail && <Mail className="w-3 h-3 text-slate-500" />}
        </div>
      </div>
    </div>
  );
}

function Column({ stage, deals }: { stage: typeof STAGES[number]; deals: Deal[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-72 flex flex-col rounded-2xl bg-slate-900/50 border border-slate-800/50',
        isOver && 'ring-2 ring-orange-500/30 border-orange-500/30',
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50">
        <span className={cn('w-2.5 h-2.5 rounded-full', stage.color)} />
        <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
          {deals.length}
        </span>
      </div>
      <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[200px]">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
        {deals.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-slate-600">
            Arraste um negócio para cá
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const loadDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/crm/deals');
      if (res.ok) setDeals(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dealId = active.id as string;
    const newStage = over.id as PipelineStage;
    if (!STAGE_ORDER.includes(newStage)) return;

    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)),
    );

    try {
      await fetch(`/api/crm/deals/${dealId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
    } catch {
      await loadDeals();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Pipeline de Negócios</h2>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-400 text-white">
          <Plus className="w-4 h-4 mr-1" />
          Novo Negócio
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 zehla-scroll-x">
          {STAGES.map((stage) => (
            <Column
              key={stage.id}
              stage={stage}
              deals={deals.filter((d) => d.stage === stage.id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeDeal && (
            <div className="p-3 rounded-xl bg-slate-800 border border-orange-500/50 shadow-2xl w-72">
              <h4 className="text-sm font-medium text-white">{activeDeal.title}</h4>
              <p className="text-base font-bold text-emerald-400">{formatBRL(activeDeal.value)}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
