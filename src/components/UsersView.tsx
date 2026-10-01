import React, { useState } from 'react';
import { UserCog, Plus, ShieldCheck, UserCheck, Mail, Phone, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { UserProfile, UserRole, Lead } from '../types/crm';

interface UsersViewProps {
  currentUser: UserProfile;
  users: UserProfile[];
  leads: Lead[];
  onSaveUser: (userData: Partial<UserProfile>) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({
  currentUser,
  users,
  leads,
  onSaveUser,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('vendedor');
  const [phone, setPhone] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSaveUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      phone: phone.trim(),
      active: true,
    });

    setName('');
    setEmail('');
    setPhone('');
    setIsAdding(false);
  };

  const toggleUserActive = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      alert('Você não pode desativar seu próprio usuário em sessão.');
      return;
    }
    onSaveUser({
      ...user,
      active: !user.active,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-sky-400" />
            <span>Gestão de Usuários & Equipe Comercial</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gerencie os vendedores e gestores com controle de acesso por RLS (Row Level Security).
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap self-end sm:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar Usuário</span>
        </button>
      </div>

      {/* RLS Security Explanatory Card */}
      <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 space-y-1">
        <div className="flex items-center gap-2 text-sky-400 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Políticas de Segurança Supabase RLS Aplicadas</span>
        </div>
        <p>
          Usuários com perfil <strong className="text-neutral-200">Vendedor</strong> possuem políticas RLS que limitam estritamente o acesso apenas aos leads e tarefas nos quais seu ID é o responsável.
          Já o perfil <strong className="text-neutral-200">Gestor</strong> tem permissão total de leitura, triagem, edição, distribuição e exclusão de todos os registros.
        </p>
      </div>

      {/* Form de Adicionar Novo Usuário */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <span className="font-bold text-white">Cadastrar Membro da Equipe</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Nome Completo *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Fernando Matos"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">E-mail Corporativo *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="fernando@induscrm.com.br"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Perfil de Acesso</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="vendedor">Vendedor Técnico (Apenas Seus Leads)</option>
                <option value="gestor">Gestor Geral (Acesso Total & Triagem)</option>
              </select>
            </div>
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98888-7777"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Criar Usuário no Supabase
            </button>
          </div>
        </form>
      )}

      {/* Grid de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const userLeads = leads.filter((l) => l.responsavel_id === u.id);
          const pipelineTotal = userLeads.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

          return (
            <div
              key={u.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {u.id === currentUser.id && (
                        <span className="text-[10px] text-sky-400 font-semibold">(Você)</span>
                      )}
                    </h3>
                    <div className="text-xs text-neutral-400 mt-0.5">{u.email}</div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                      u.role === 'gestor'
                        ? 'bg-sky-950 text-sky-300 border border-sky-800/50'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-1 mb-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Leads Atribuídos:</span>
                    <span className="font-semibold text-white font-mono tabular-nums">
                      {userLeads.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Pipeline Atual:</span>
                    <span className="font-semibold text-sky-400 font-mono tabular-nums">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0,
                      }).format(pipelineTotal)}
                    </span>
                  </div>
                </div>

                {u.phone && (
                  <div className="text-xs text-neutral-400 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{u.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between mt-4">
                <span
                  className={`text-xs flex items-center gap-1.5 ${
                    u.active ? 'text-emerald-400' : 'text-neutral-500'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-neutral-600'}`}
                  />
                  <span>{u.active ? 'Ativo no CRM' : 'Inativo'}</span>
                </span>

                {u.id !== currentUser.id && (
                  <button
                    onClick={() => toggleUserActive(u)}
                    className="text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    {u.active ? 'Desativar' : 'Reativar'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
