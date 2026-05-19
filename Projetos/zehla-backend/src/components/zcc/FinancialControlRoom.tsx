import { 
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';

import { Badge } from '@/components/ui/badge';


'use client';

  Save, 
  FileSpreadsheet, 
  Lock, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Calculator,
  Upload,
  Download,
  Edit3,
  Trash2,
  ChevronRight,
  FolderOpen,
  FilePlus,
  X,
  Check
} from 'lucide-react';

interface SpreadsheetFile {
  name: string;
  lastModified: string;
  size: number;
}

interface SpreadsheetData {
  fileName: string;
  sheets: string[];
  data: Record<string, any[][]>;
  lastModified: string;
}

export function FinancialControlRoom() : void {
  const [fileList, setFileList] = useState<SpreadsheetFile[]>([]);
  const [data, setData] = useState<SpreadsheetData | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  
  // Renaming states
  const [editingSheet, setEditingSheet] = useState<string | null>(null);
  const [newSheetName, setNewSheetName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkAccess = () => {
    if (password === 'ZEHLA_PRO_2026') {
      setIsAuthorized(true);
      toast.success('Acesso à Sala de Controle autorizado.');
    } else {
      toast.error('Código de acesso inválido.');
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadFileList();
    }
  }, [isAuthorized]);

  const loadFileList = async () => {
    try {
      const res = await fetch('/api/zcc/financeiro/spreadsheet');
      const json = await res.json();
      setFileList(json.files || []);
      // Auto-load master if exists
      const master = json.files?.find((f: unknown) => f.name.includes('Cronograma Geral'));
      if (master && !data) loadFile(master.name);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFile = async (fileName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/zcc/financeiro/spreadsheet?file=${encodeURIComponent(fileName)}`);
      if (!res.ok) throw new Error('Falha ao carregar arquivo');
      const json = await res.json();
      setData(json);
      if (json.sheets.length > 0) setActiveSheet(json.sheets[0]);
    } catch (err: unknown) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await fetch('/api/zcc/financeiro/spreadsheet', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Falha no upload');
      toast.success('Arquivo enviado com sucesso!');
      loadFileList();
    } catch (err: unknown) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    window.open(`/api/zcc/financeiro/spreadsheet?file=${encodeURIComponent(data.fileName)}&download=true`, '_blank');
  };

  const handleSave = async () => {
    if (!data || !activeSheet) return;
    setSaving(true);
    try {
      const res = await fetch('/api/zcc/financeiro/spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: data.fileName,
          sheetName: activeSheet,
          data: data.data[activeSheet]
        })
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      toast.success('Planilha salva!');
      loadFileList();
    } catch (err: unknown) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRenameSheet = async () => {
    if (!data || !editingSheet || !newSheetName) return;
    try {
      const res = await fetch('/api/zcc/financeiro/spreadsheet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'renameSheet',
          fileName: data.fileName,
          oldSheetName: editingSheet,
          newSheetName
        })
      });
      if (!res.ok) throw new Error('Erro ao renomear');
      toast.success('Aba renomeada!');
      loadFile(data.fileName);
      setEditingSheet(null);
    } catch (err: unknown) {
      toast.error(err.message);
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    if (!data || !activeSheet) return;
    const newData = { ...data };
    const numericValue = value === '' ? '' : isNaN(Number(value)) ? value : Number(value);
    newData.data[activeSheet][rowIndex][colIndex] = numericValue;
    setData(newData);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="glass-card p-8 max-w-md w-full border border-[#FF5500]/20 shadow-[0_0_50px_rgba(255,85,0,0.05)]">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#FF5500]/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-[#FF5500]" />
            </div>
            <h2 className="text-xl font-bold text-[#fafafa]">Sala de Controle Financeiro</h2>
            <p className="text-xs text-[#4d4d4d] mt-2">
              Insira o código master para gerenciar suas planilhas estratégicas.
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Código Master"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkAccess()}
              className="w-full bg-black/40 border border-[#2e2e2e] rounded-lg px-4 py-3 text-sm text-center text-[#efefef] focus:outline-none focus:border-[#FF5500]/50"
            />
            <button onClick={checkAccess} className="w-full bg-[#FF5500] hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg">
              ENTRAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${isFullscreen ? 'fixed inset-0 z-[100] bg-[#0a0a0a] p-6' : ''}`}>
      {/* File Explorer & Main Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar: Files */}
        <div className="glass-card p-4 border-[#2e2e2e] bg-black/20 overflow-y-auto max-h-[200px] lg:max-h-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-[#b4b4b4] flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-[#FF5500]" />
              ARQUIVOS MESTRES
            </h3>
            <button onClick={() => fileInputRef.current?.click()} className="p-1 rounded bg-[#FF5500]/10 text-[#FF5500] hover:bg-[#FF5500]/20">
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".xlsx" />
          </div>
          <div className="space-y-1">
            {fileList.map((file) => (
              <button
                key={file.name}
                onClick={() => loadFile(file.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[10px] truncate transition-all flex items-center gap-2 ${
                  data?.fileName === file.name ? 'bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20' : 'text-[#4d4d4d] hover:bg-white/[0.02]'
                }`}
              >
                <FileSpreadsheet className="w-3 h-3 flex-shrink-0" />
                {file.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FF5500]/10">
                <Calculator className="w-4 h-4 text-[#FF5500]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2">
                  {data?.fileName || 'Selecione um Arquivo'}
                  {data && <Badge className="bg-[#FF5500]/10 text-[#FF5500] border-0 text-[9px]">LIVE</Badge>}
                </h2>
                <p className="text-[9px] text-[#4d4d4d]">{data?.sheets.length || 0} abas disponíveis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={handleDownload} className="p-2 rounded-lg bg-[#0f0f0f] border border-[#2e2e2e] text-[#898989] hover:text-[#efefef]" title="Download">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-lg bg-[#0f0f0f] border border-[#2e2e2e] text-[#898989] hover:text-[#efefef]">
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handleSave} disabled={saving || !data} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5500] text-white font-bold text-xs shadow-lg disabled:opacity-50">
                {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                SALVAR
              </button>
            </div>
          </div>

          {/* Sheet Tabs with Rename */}
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-[#2e2e2e] overflow-x-auto no-scrollbar">
            {data?.sheets.map((sheet) => (
              <div key={sheet} className="relative group">
                {editingSheet === sheet ? (
                  <div className="flex items-center bg-[#1a1a1a] rounded-lg px-2 py-1">
                    <input
                      autoFocus
                      className="bg-transparent border-none outline-none text-[10px] text-white w-24"
                      value={newSheetName}
                      onChange={(e) => setNewSheetName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSheet()}
                    />
                    <button onClick={handleRenameSheet} className="p-0.5 text-[#FF5500]"><Check className="w-3 h-3" /></button>
                    <button onClick={() => setEditingSheet(null)} className="p-0.5 text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveSheet(sheet)}
                    onDoubleClick={() => { setEditingSheet(sheet); setNewSheetName(sheet); }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                      activeSheet === sheet ? 'bg-[#FF5500] text-white shadow-md' : 'text-[#4d4d4d] hover:bg-white/[0.02]'
                    }`}
                  >
                    {sheet}
                    <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Grid Container */}
          <div className="flex-1 glass-card border-[#2e2e2e] bg-black/20 overflow-hidden min-h-[400px] flex flex-col relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                <RefreshCw className="w-8 h-8 text-[#FF5500] animate-spin" />
              </div>
            ) : !data ? (
              <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 opacity-20">
                <FileSpreadsheet className="w-12 h-12" />
                <p className="text-xs font-mono">Selecione uma planilha no menu lateral</p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto zehla-scroll">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="sticky top-0 z-10 bg-[#0f0f0f]">
                      <th className="w-10 h-6 border border-[#2e2e2e] bg-[#0a0a0a] text-[8px] font-mono text-[#363636]"></th>
                      {data?.data[activeSheet][0]?.map((_, i) => (
                        <th key={i} className="min-w-[100px] h-6 border border-[#2e2e2e] bg-[#0a0a0a] text-[9px] font-mono text-[#4d4d4d] text-center">
                          {String.fromCharCode(65 + i)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data[activeSheet].map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="w-10 h-7 border border-[#2e2e2e] bg-[#0a0a0a] text-[8px] font-mono text-[#363636] text-center sticky left-0 z-10">
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="min-w-[100px] h-7 border border-[#2e2e2e] p-0">
                            <input
                              type="text"
                              value={cell === null || cell === undefined ? '' : cell}
                              onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                              className={`w-full h-full bg-transparent px-2 text-[10px] outline-none border-none focus:bg-[#FF5500]/5 ${
                                typeof cell === 'number' ? 'text-right font-mono text-cyan-400' : 'text-left text-[#b4b4b4]'
                              }`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
