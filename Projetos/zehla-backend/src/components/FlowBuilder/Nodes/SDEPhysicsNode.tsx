'use client'

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export const SDEPhysicsNode = memo(({ data, isConnectable }: any) => {
  return (
    <div className="bg-[#0A0A0A] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden min-w-[320px]">
      {/* Header do Nó */}
      <div className="bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 border-b border-zinc-800 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
          <span className="text-fuchsia-400 font-mono text-xs font-semibold tracking-wider">SDE PHYSICS ENGINE</span>
        </div>
        <span className="text-zinc-500 text-xs">State Tensor</span>
      </div>

      {/* Corpo do Nó */}
      <div className="p-4 space-y-4">
        
        {/* Tensão Cognitiva */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-zinc-400">Carga Cognitiva (x8)</span>
            <span className="text-fuchsia-400 font-mono">+{data.cognitiveLoad || 1.2}</span>
          </div>
          <input 
            type="range" 
            min="0" max="5" step="0.1" 
            defaultValue={data.cognitiveLoad || 1.2}
            className="w-full accent-fuchsia-500"
          />
        </div>

        {/* Nível de Estresse */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-zinc-400">Estresse Esperado (x3)</span>
            <span className="text-rose-400 font-mono">+{data.expectedStress || 0.5}</span>
          </div>
          <input 
            type="range" 
            min="0" max="5" step="0.1" 
            defaultValue={data.expectedStress || 0.5}
            className="w-full accent-rose-500"
          />
        </div>

        {/* Ação Dinâmica */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1">Impacto (Drift F)</label>
          <select 
            className="w-full bg-[#111111] border border-zinc-800 text-sm text-zinc-200 rounded-lg p-2 outline-none focus:border-fuchsia-500/50"
            defaultValue={data.driftAction || "REDUCE_FRICTION"}
          >
            <option value="REDUCE_FRICTION">Reduzir Atrito (Simplificar Msg)</option>
            <option value="INCREASE_URGENCY">Aumentar Urgência (Escassez)</option>
            <option value="FORCE_HANDOFF">Forçar Handoff Humano</option>
          </select>
        </div>
        
        <div className="pt-2 border-t border-zinc-800">
           <p className="text-[10px] text-zinc-500 leading-relaxed">
             * A Equação Estocástica será resolvida localmente via TurboQuant V3.
           </p>
        </div>
      </div>

      {/* Conectores */}
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
        className="w-3 h-3 bg-fuchsia-500 border-2 border-[#0A0A0A] right-[-7px]"
      />
    </div>
  );
});

SDEPhysicsNode.displayName = 'SDEPhysicsNode';
