'use client';

import { useState, useEffect, useCallback } from 'react';
  Plus,
  Loader2,
  Trash2,
  CheckCircle2,
  Circle,
  Flag,
  Calendar,
  AlertTriangle,
  User,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'pending' | 'completed';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignee: string;
  createdAt: string;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; iconColor: string }> = {
  low: { label: 'Baixa', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', iconColor: 'text-slate-500' },
  medium: { label: 'Média', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', iconColor: 'text-blue-400' },
  high: { label: 'Alta', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', iconColor: 'text-amber-400' },
  urgent: { label: 'Urgente', color: 'bg-red-500/20 text-red-400 border-red-500/30', iconColor: 'text-red-400' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [creating, setCreating] = useState(false);

  const loadTasks = useCallback(async () => {
  const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      const res = await fetch(`/api/crm/tasks?${params}`);
      if (res.ok) setTasks(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggleComplete = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
  await fetch(`/api/crm/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      await loadTasks();
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
  const res = await fetch('/api/crm/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          dueDate: newDueDate || null,
          assignee: newAssignee || null,
        }),
      });
      if (res.ok) {
        setNewTitle('');
        setNewDescription('');
        setNewPriority('medium');
        setNewDueDate('');
        setNewAssignee('');
        setShowCreate(false);
        await loadTasks();
      }
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  await fetch(`/api/crm/tasks/${id}`, { method: 'DELETE' });
    } catch {
      await loadTasks();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Tarefas</h2>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-400 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Título</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="O que precisa ser feito?"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Descrição</label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detalhes da tarefa..."
                  className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Prioridade</label>
                  <Select value={newPriority} onValueChange={(v: TaskPriority) => setNewPriority(v)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Vencimento</label>
                  <Input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Responsável</label>
                <Input
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  placeholder="Nome do responsável"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-400 text-white mt-2"
                onClick={handleCreate}
                disabled={!newTitle.trim() || creating}
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-1" />
                )}
                Criar Tarefa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-500" />
          <Select value={statusFilter} onValueChange={(v: TaskStatus | 'all') => setStatusFilter(v)}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-8 text-xs w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={priorityFilter} onValueChange={(v: TaskPriority | 'all') => setPriorityFilter(v)}>
          <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-8 text-xs w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-white">
            <SelectItem value="all">Todas prioridades</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const priorityCfg = PRIORITY_CONFIG[task.priority];
          const overdue = task.status === 'pending' && isOverdue(task.dueDate);
          const dueToday = task.status === 'pending' && isToday(task.dueDate);

          return (
            <div
              key={task.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border transition-all',
                task.status === 'completed'
                  ? 'bg-slate-800/20 border-slate-700/30 opacity-60'
                  : overdue
                  ? 'bg-red-900/10 border-red-800/30'
                  : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600',
              )}
            >
              <button
                onClick={() => handleToggleComplete(task)}
                className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white',
                    )}
                  >
                    {task.title}
                  </span>
                  <Badge variant="outline" className={cn('text-[10px]', priorityCfg.color)}>
                    {priorityCfg.label}
                  </Badge>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-500 mb-1.5 line-clamp-2">{task.description}</p>
                )}

                <div className="flex items-center gap-3 text-xs">
                  {task.dueDate && (
                    <span
                      className={cn(
                        'flex items-center gap-1',
                        overdue ? 'text-red-400 font-medium' : dueToday ? 'text-amber-400' : 'text-slate-500',
                      )}
                    >
                      {overdue ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Calendar className="w-3 h-3" />
                      )}
                      {overdue ? 'Vencida: ' : dueToday ? 'Hoje: ' : ''}
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                  {task.assignee && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <User className="w-3 h-3" />
                      {task.assignee}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(task.id)}
                className="p-1 text-slate-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        {filteredTasks.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            Nenhuma tarefa encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
