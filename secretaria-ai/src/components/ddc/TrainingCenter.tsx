'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Sparkles, Play, CheckCircle2, XCircle, Plus, Search, Filter, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { mockTrainingPrompts } from '@/lib/ddc/mock-data';
import type { TrainingPrompt } from '@/types/ddc';

export function TrainingCenter() {
  const [trainings, setTrainings] = useState(mockTrainingPrompts);
  const [selectedTraining, setSelectedTraining] = useState<TrainingPrompt | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [testResult, setTestResult] = useState<{ status: 'passed' | 'failed' | 'pending'; score?: number; feedback?: string } | null>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: 'easeOut' as any
      }
    })
  };

  const filteredTrainings = trainings.filter(t =>
    (t.title || t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.category || t.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTest = async (trainingId: string) => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 2000));

    setTestResult({
      status: 'passed',
      score: Math.floor(Math.random() * 15) + 85,
      feedback: 'A IA respondeu corretamente e com alta confiança. O prompt está bem estruturado.'
    });

    setIsTesting(false);
  };

  const handleAddTraining = (training: Omit<TrainingPrompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTraining = {
      ...training,
      id: `training-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    } as TrainingPrompt;
    setTrainings(prev => [newTraining, ...prev]);
    setIsAdding(false);
  };

  const handleDeleteTraining = (trainingId: string) => {
    setTrainings(prev => prev.filter(t => t.id !== trainingId));
    if (selectedTraining?.id === trainingId) {
      setSelectedTraining(null);
    }
  };

  const handleToggleActive = (trainingId: string) => {
    setTrainings(prev =>
      prev.map(t =>
        t.id === trainingId ? { ...t, isActive: !t.isActive } : t
      )
    );
  };

  return (
    <Card className="bg-white/[0.02] border border-white/[0.06] h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-white">Centro de Treinamento IA</CardTitle>
              <p className="text-[10px] text-white/40 font-mono">
                {trainings.filter(t => t.isActive).length} ativos • Aprimore respostas
              </p>
            </div>
          </div>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-violet-500 hover:bg-violet-600">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                <span className="text-xs">Novo Treino</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0f] border-white/[0.06] max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Adicionar Novo Treinamento</DialogTitle>
              </DialogHeader>
              <AddTrainingForm onSubmit={handleAddTraining} onCancel={() => setIsAdding(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Buscar treinamentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30"
          />
        </div>
      </CardHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* Trainings List */}
        <div className="w-80 border-r border-white/[0.06] flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {filteredTrainings.map((training, index) => (
                <motion.button
                  key={training.id}
                  custom={index}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setSelectedTraining(training)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedTraining?.id === training.id
                      ? 'bg-violet-500/10 border-violet-500/30'
                      : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${training.isActive ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-white/[0.04]'} flex items-center justify-center`}>
                        <BookOpen className={`w-4 h-4 ${training.isActive ? 'text-white' : 'text-white/40'}`} />
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
                    {training.isActive && (
                      <Badge variant="outline" className="text-[8px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Ativo
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] h-4 bg-white/[0.04] text-white/60 border-white/[0.08]">
                      v{training.version || 1}
                    </Badge>
                    {training.testResult && (
                      <div className={`text-[9px] font-medium ${
                        training.testResult.status === 'passed' ? 'text-emerald-400' :
                        training.testResult.status === 'failed' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {training.testResult.status === 'passed' && '✓ Testado'}
                        {training.testResult.status === 'failed' && '✗ Falhou'}
                        {training.testResult.status === 'pending' && '⏳ Pendente'}
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Training Detail */}
        <div className="flex-1 flex flex-col">
          {selectedTraining ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{selectedTraining.title || selectedTraining.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] h-4 bg-white/[0.04] text-white/60 border-white/[0.08]">
                        {selectedTraining.category || selectedTraining.type}
                      </Badge>
                      <Badge variant="outline" className="text-[8px] h-4 bg-white/[0.04] text-white/60 border-white/[0.08]">
                        v{selectedTraining.version || 1}
                      </Badge>
                      {selectedTraining.testResult && selectedTraining.testResult.status === 'passed' && (
                        <Badge className="text-[8px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          ✓ {selectedTraining.testResult.score}% aprovado
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4 text-white/60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0a0a0f] border-white/[0.06]">
                      <DropdownMenuItem
                        className="text-white/70 hover:text-white cursor-pointer"
                        onClick={() => handleToggleActive(selectedTraining.id)}
                      >
                        {selectedTraining.isActive ? 'Desativar' : 'Ativar'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white/70 hover:text-white cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 hover:text-red-300 cursor-pointer"
                        onClick={() => handleDeleteTraining(selectedTraining.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Test Result */}
                <AnimatePresence>
                  {testResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-3 rounded-lg border ${
                        testResult.status === 'passed'
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {testResult.status === 'passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-xs font-semibold ${
                          testResult.status === 'passed' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {testResult.status === 'passed' ? 'Teste Aprovado!' : 'Teste Falhou'}
                        </span>
                        {testResult.score && (
                          <span className="text-[9px] text-white/50">
                            {testResult.score}% de acurácia
                          </span>
                        )}
                      </div>
                      {testResult.feedback && (
                        <p className="text-[10px] text-white/70">{testResult.feedback}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">
                      Conteúdo do Treinamento
                    </label>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                      <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                        {selectedTraining.content}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="p-3 border-t border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                    onClick={() => handleTest(selectedTraining.id)}
                    disabled={isTesting}
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    {isTesting ? 'Testando...' : 'Testar Prompt'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-white/[0.08] text-white/70 hover:bg-white/[0.04]"
                    onClick={() => setTestResult(null)}
                  >
                    Limpar Resultado
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <GraduationCap className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-sm text-white/40">Selecione um treinamento</p>
                <p className="text-[10px] text-white/30 mt-1">ou crie um novo para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function AddTrainingForm({ onSubmit, onCancel }: { onSubmit: (training: Omit<TrainingPrompt, 'id' | 'createdAt' | 'updatedAt'>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('checkin');
  const [content, setContent] = useState('');

  const categories = [
    { value: 'checkin', label: 'Check-in' },
    { value: 'checkout', label: 'Checkout' },
    { value: 'servicos', label: 'Serviços' },
    { value: 'horarios', label: 'Horários' },
    { value: 'reservas', label: 'Reservas' },
    { value: 'politicas', label: 'Políticas' },
    { value: 'faq', label: 'FAQ' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content) {
      onSubmit({
        title,
        category,
        content,
        version: 1,
        isActive: true,
        propertyId: 'prop-001'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">
          Título
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Como fazer check-in antecipado"
          className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30"
        />
      </div>

      <div>
        <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">
          Categoria
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                category === cat.value
                  ? 'bg-violet-500/20 border-violet-500/30 text-violet-400'
                  : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:bg-white/[0.04]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">
          Conteúdo do Treinamento
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Descreva como a IA deve responder a perguntas sobre este tema..."
          rows={6}
          className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 resize-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 border-white/[0.08] text-white/70 hover:bg-white/[0.04]"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          className="flex-1 bg-violet-500 hover:bg-violet-600"
          disabled={!title || !content}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Criar Treinamento
        </Button>
      </div>
    </form>
  );
}