'use client';

import { GripVertical, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import type { ConnectLink } from './types';

interface Props {
  link: ConnectLink;
  onEdit: (link: ConnectLink) => void;
  onDelete: (id: string) => void;
}

export function SortableLinkItem({ link, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50',
        isDragging && 'opacity-50 ring-2 ring-orange-500/30',
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 transition-colors">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{link.label}</p>
        <p className="text-xs text-slate-400 truncate">{link.url}</p>
      </div>
      <Badge variant="outline" className="border-slate-600 text-slate-400 text-[10px]">
        {link.clickCount} cliques
      </Badge>
      <button onClick={() => onEdit(link)} className="p-1.5 text-slate-400 hover:text-white transition-colors">
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onDelete(link.id)} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
