'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  User, 
  Edit3, 
  Trash2, 
  LockKeyhole 
} from 'lucide-react';

export function TeamManagementTab() {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/zcc/team')
      .then(res => res.json())
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const [isAdding, setIsAdding] = useState(false);

  const availablePermissions = [
    { id: 'view_cognitivo', label: 'Cérebro Cognitivo' },
    { id: 'view_terminal', label: 'Terminal de Comando' },
    { id: 'view_agents', label: 'Gestão de Agentes' },
    { id: 'view_properties', label: 'Gestão de Pousadas' },
    { id: 'view_financial', label: 'Financeiro & Taxas' },
    { id: 'view_whatsapp', label: 'Fluxos de WhatsApp' },
    { id: 'view_apis', label: 'Configurações de API' },
    { id: 'view_security', label: 'Segurança & Auditoria' },
    { id: 'manage_team', label: 'Gerenciar Equipe' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#F97316]" />
            Gestão de Equipe & Colaboradores
          </h2>
          <p className="text-xs text-[#4d4d4d]">Controle quem pode visualizar e operar cada módulo do ZCC.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#F97316] hover:bg-[#F97316]/80 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Membro
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          {members.map(member => (
            <div key={member.id} className="glass-card p-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#242424] border border-[#363636] flex items-center justify-center text-[#898989]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#efefef]">{member.name}</div>
                  <div className="text-[10px] text-[#4d4d4d]">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    member.role === 'SUPER_ADMIN' ? 'bg-[#F97316]/20 text-[#F97316]' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {member.role}
                  </div>
                  <div className="text-[9px] text-[#363636] mt-1">{(member.permissions || []).length} permissões ativas</div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-[#242424] rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4 text-[#898989]" />
                  </button>
                  <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400/60" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center py-12 text-[#363636] text-sm">Nenhum colaborador encontrado.</div>
          )}
        </div>

        {/* Permissions Inspector */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[#b4b4b4] mb-4 flex items-center gap-2">
            <LockKeyhole className="w-4 h-4 text-[#F97316]" />
            Configuração de Acesso
          </h3>
          <div className="space-y-3">
            {availablePermissions.map(perm => (
              <label key={perm.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer group">
                <span className="text-xs text-[#898989] group-hover:text-[#efefef] transition-colors">{perm.label}</span>
                <div className="w-8 h-4 rounded-full bg-[#2e2e2e] relative transition-colors">
                   <div className="absolute left-1 top-1 w-2 h-2 rounded-full bg-neutral-600" />
                </div>
              </label>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-[#2e2e2e]">
            <p className="text-[10px] text-[#4d4d4d] italic">
              * Membros com papel TEAM não podem alterar senhas ou configurações mestres de API sem autorização do SUPER_ADMIN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
