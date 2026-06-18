'use client';

import { motion } from 'framer-motion';
import { Brain, Shield, Cpu, Database, MessageCircle, Globe, Lock, Zap } from 'lucide-react';

const archNodes = [
  { icon: MessageCircle, label: 'WhatsApp API', desc: 'Evolution API', color: 'text-green-400' },
  { icon: Brain, label: 'ZÉLLA Brain', desc: 'Orquestrador Cognitivo', color: 'text-emerald-400' },
  { icon: Shield, label: 'Guardian', desc: 'Segurança & Compliance', color: 'text-purple-400' },
  { icon: Cpu, label: 'Agent Fleet', desc: '8 Agentes IA Especializados', color: 'text-cyan-400' },
  { icon: Database, label: 'ZDR', desc: 'Zero-Trust Data Router', color: 'text-amber-400' },
  { icon: Globe, label: 'Edge Nodes', desc: '6 Nodos de Borda', color: 'text-blue-400' },
  { icon: Lock, label: 'LGPD/PCI', desc: 'Compliance Engine', color: 'text-red-400' },
  { icon: Zap, label: 'Gemma Engine', desc: 'Sovereign LLM', color: 'text-yellow-400' },
];

export function ArchitectureSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-100 mb-4">
          Arquitetura <span className="gradient-text">Neural Distribuída</span>
        </h2>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
          Infraestrutura edge-first com sovereign AI, processamento local e compliance em tempo real.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="glass-strong p-8 sm:p-12 rounded-2xl"
      >
        {/* Connection lines visual */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {archNodes.map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card p-4 text-center group hover:bg-white/5 transition-all duration-300"
            >
              <node.icon className={`w-8 h-8 mx-auto mb-3 ${node.color}`} />
              <div className="text-sm font-semibold text-neutral-200">{node.label}</div>
              <div className="text-xs text-neutral-500 mt-1">{node.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Flow diagram */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-600 font-mono">
          <span className="px-2 py-1 rounded bg-green-500/10 text-green-400">Guest →</span>
          <span>WhatsApp</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">Brain</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400">Guardian</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400">Agents</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400">Action</span>
        </div>
      </motion.div>
    </section>
  );
}
