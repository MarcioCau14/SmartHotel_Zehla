import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';


'use client'


export const MessageNode = memo(({ data, isConnectable }: unknown) => {
  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden min-w-[280px]">
      {/* Header do Nó */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-zinc-800 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-400 font-mono text-xs font-semibold tracking-wider">DNA INJECTED</span>
        </div>
        <div className="flex items-center gap-2">
          {data.useNeuralVoice && <span className="text-[10px] text-orange-400 font-bold tracking-widest animate-pulse">VOICE ACTIVE</span>}
          <span className="text-zinc-500 text-xs">Message Node</span>
        </div>
      </div>

      {/* Corpo do Nó */}
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Índice de Formalidade</label>
          <select 
            className="w-full bg-[#111111] border border-zinc-800 text-sm text-zinc-200 rounded-lg p-2 outline-none focus:border-emerald-500/50 transition-colors"
            defaultValue={data.formality || "ADAPTIVE"}
          >
            <option value="ADAPTIVE">Adaptativo (SDE Auto)</option>
            <option value="FORMAL">Rigidamente Formal</option>
            <option value="INFORMAL">Relaxado / Gírias</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Template Base</label>
          <textarea 
            className="w-full bg-[#111111] border border-zinc-800 text-sm text-zinc-300 rounded-lg p-3 outline-none focus:border-emerald-500/50 min-h-[80px] resize-none"
            placeholder="Digite a estrutura da mensagem..."
            defaultValue={data.template}
          />
        </div>
        
        <div className="pt-2 border-t border-zinc-800">
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <p className="text-xs font-semibold text-zinc-300 group-hover:text-emerald-400 transition-colors">Responder com ZEHLA Voice</p>
              <p className="text-[10px] text-zinc-500 leading-relaxed mt-0.5">
                Gera um áudio usando o <span className="text-emerald-500/80 font-bold">Voice Profile</span> da Pousada.
              </p>
            </div>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                defaultChecked={data.useNeuralVoice} 
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${data.useNeuralVoice ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.useNeuralVoice ? 'transform translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>

      {/* Conectores React Flow */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-zinc-800 border-2 border-[#0A0A0A] left-[-7px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-emerald-500 border-2 border-[#0A0A0A] right-[-7px]"
      />
    </div>
  );
});

MessageNode.displayName = 'MessageNode';
