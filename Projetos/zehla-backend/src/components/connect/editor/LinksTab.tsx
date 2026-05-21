'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableLinkItem } from './SortableLinkItem';
import { LinkForm } from './LinkForm';
import type { ConnectLink } from './types';

interface Props {
  links: ConnectLink[];
  showForm: boolean;
  editingLink: ConnectLink | null;
  onShowForm: (show: boolean) => void;
  onSetEditingLink: (link: ConnectLink | null) => void;
  onSaveLink: (data: Partial<ConnectLink>) => void;
  onDeleteLink: (id: string) => void;
  onReorder: (links: ConnectLink[]) => void;
}

export function LinksTab({ links, showForm, editingLink, onShowForm, onSetEditingLink, onSaveLink, onDeleteLink, onReorder }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    onReorder(arrayMove(links, oldIndex, newIndex));
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Links</h3>
        <Button size="sm" onClick={() => { onSetEditingLink(null); onShowForm(true); }} className="bg-orange-500 hover:bg-orange-400 text-white">
          <Plus className="w-4 h-4 mr-1" />
          Novo Link
        </Button>
      </div>

      {showForm && (
        <LinkForm
          initial={editingLink || undefined}
          onSave={onSaveLink}
          onCancel={() => { onShowForm(false); onSetEditingLink(null); }}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {links.map((link) => (
              <SortableLinkItem
                key={link.id}
                link={link}
                onEdit={(link) => { onSetEditingLink(link); onShowForm(true); }}
                onDelete={onDeleteLink}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {links.length === 0 && !showForm && (
        <p className="text-center text-slate-500 py-8">Nenhum link ainda. Clique em "Novo Link" para começar.</p>
      )}
    </div>
  );
}
