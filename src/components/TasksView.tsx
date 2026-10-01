import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Circle,
  Building,
  Filter,
} from 'lucide-react';
import { Task, UserProfile, Lead } from '../types/crm';

interface TasksViewProps {
  user: UserProfile;
  tasks: Task[];
  leads: Lead[];
  onToggleTask: (taskId: string, completed: boolean) => void;
  onAddTask: (task: Partial<Task>) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  user,
  tasks,
  leads,
  onToggleTask,
  onAddTask,
}) => {
  const isGestor = user.role === 'gestor';
  const [filterMode, setFilterMode] = useState<'pending' | 'completed' | 'all'>('pending');
  const [isAdding, setIsAdding] = useState(false);

  // New task form state
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [leadId, setLeadId] = useState('');
  const [tipo, setTipo] = useState<'followup' | 'visita' | 'orcamento' | 'ligacao' | 'demonstracao'>('followup');
  const [dataVencimento, setDataVencimento] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );

  const filteredTasks = tasks.filter((t) => {
    if (filterMode === 'pending') return !t.concluida;
    if (filterMode === 'completed') return t.concluida;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const selectedLead = leads.find((l) => l.id === leadId);

    onAddTask({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      lead_id: leadId || undefined,
      lead_nome: selectedLead ? selectedLead.empresa : undefined,
      tipo,
      data_vencimento: new Date(dataVencimento).toISOString(),
      responsavel_id: user.id,
      responsavel_nome: user.name,
      concluida: false,
    });

    setTitulo('');
    setDescricao('');
    setLeadId('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-sky-400" />
            <span>Tarefas Comerciais & Visitas Técnicas</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Agendamentos com decisores, alinhamentos de frete e vistorias de infraestrutura elétrica fabril.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="flex items-center p-1 bg-neutral-950 border border-neutral-800 rounded-lg">
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterMode === 'pending'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterMode === 'completed'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Concluídas
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todas
            </button>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Form de Criação de Tarefa */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <span className="font-bold text-white">Nova Ação Comercial</span>
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
              <label className="block text-neutral-300 mb-1 font-medium">Título da Tarefa *</label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Visita técnica para medir fundação do Torno CNC"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Empresa / Lead Vinculado</label>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="">Nenhum lead vinculado</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.empresa} ({l.produto_interesse})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Tipo de Tarefa</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="followup">Follow-up Comercial</option>
                <option value="visita">Visita Técnica à Fábrica</option>
                <option value="orcamento">Envio de Orçamento / Finame</option>
                <option value="demonstracao">Demonstração em Showroom</option>
                <option value="ligacao">Ligação com Decisor</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Data de Vencimento</label>
              <input
                type="date"
                required
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Salvar Tarefa
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-xl">
            Nenhuma tarefa encontrada nesta categoria.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id, !task.concluida)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                task.concluida
                  ? 'bg-neutral-950/60 border-neutral-800 opacity-60'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-neutral-400 hover:text-sky-400 transition-colors"
                >
                  {task.concluida ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-600 hover:text-neutral-300" />
                  )}
                </button>
                <div>
                  <h4
                    className={`text-xs font-bold ${
                      task.concluida ? 'line-through text-neutral-400' : 'text-white'
                    }`}
                  >
                    {task.titulo}
                  </h4>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                    {task.lead_nome && (
                      <span className="text-sky-400 font-semibold">{task.lead_nome}</span>
                    )}
                    <span>·</span>
                    <span className="capitalize">{task.tipo}</span>
                    <span>·</span>
                    <span>Resp: {task.responsavel_nome}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-mono font-semibold text-amber-400 tabular-nums">
                  {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-[10px] text-neutral-500">
                  {task.concluida ? 'Concluída' : 'Pendente'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
