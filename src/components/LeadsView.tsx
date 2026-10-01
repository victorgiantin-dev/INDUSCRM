import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  UserCheck,
  Building,
  MoreVertical,
} from 'lucide-react';
import { Lead, UserProfile, FunnelStage, FUNNEL_STAGES_CONFIG } from '../types/crm';
import { formatCnpj } from '../services/brasilApi';

interface LeadsViewProps {
  user: UserProfile;
  leads: Lead[];
  onOpenNewLeadModal: () => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onOpenTransferModal: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  user,
  leads,
  onOpenNewLeadModal,
  onEditLead,
  onDeleteLead,
  onOpenTransferModal,
  onSelectLead,
}) => {
  const isGestor = user.role === 'gestor';
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [onlyTriagem, setOnlyTriagem] = useState(false);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.cnpj && l.cnpj.includes(searchTerm)) ||
      l.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.produto_interesse.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === 'all' || l.etapa === stageFilter;
    const matchesPriority = priorityFilter === 'all' || l.prioridade === priorityFilter;
    const matchesTriagem = !onlyTriagem || l.etapa === 'triagem' || !l.responsavel_id;

    return matchesSearch && matchesStage && matchesPriority && matchesTriagem;
  });

  // Exportar para CSV
  const handleExportCSV = () => {
    const headers = [
      'Empresa',
      'CNPJ',
      'Cidade',
      'UF',
      'Contato',
      'Telefone',
      'WhatsApp',
      'Email',
      'Produto de Interesse',
      'Valor Estimado (R$)',
      'Etapa',
      'Prioridade',
      'Responsável',
      'Data Criação',
    ];

    const rows = filteredLeads.map((l) => [
      `"${l.empresa.replace(/"/g, '""')}"`,
      `"${l.cnpj || ''}"`,
      `"${l.cidade}"`,
      `"${l.uf}"`,
      `"${l.contato.replace(/"/g, '""')}"`,
      `"${l.telefone}"`,
      `"${l.whatsapp}"`,
      `"${l.email}"`,
      `"${l.produto_interesse.replace(/"/g, '""')}"`,
      l.valor_estimado,
      `"${l.etapa}"`,
      `"${l.prioridade}"`,
      `"${l.responsavel_nome || 'Sem responsável'}"`,
      `"${l.data_criacao}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_induscrm_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por empresa, CNPJ, cidade, contato..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Todas as Etapas</option>
            {FUNNEL_STAGES_CONFIG.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          {/* Gestor: Quick Triagem Toggle */}
          {isGestor && (
            <button
              onClick={() => setOnlyTriagem(!onlyTriagem)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                onlyTriagem
                  ? 'bg-purple-900/60 border-purple-700 text-purple-200'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              Apenas Triagem / Sem Vendedor
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            title="Exportar dados para Excel / CSV"
            className="px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <button
            onClick={onOpenNewLeadModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Empresa / CNPJ</th>
                <th className="py-3 px-4">Cidade / UF</th>
                <th className="py-3 px-4">Contato / Decisor</th>
                <th className="py-3 px-4">Equipamento de Interesse</th>
                <th className="py-3 px-4 text-right">Valor Estimado</th>
                <th className="py-3 px-4">Etapa do Funil</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500 text-xs">
                    Nenhum lead industrial encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const stageConfig = FUNNEL_STAGES_CONFIG.find((s) => s.id === lead.etapa);
                  const isUnassigned = !lead.responsavel_id;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-neutral-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Empresa / CNPJ */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-sky-300 transition-colors">
                          {lead.empresa}
                        </div>
                        {lead.cnpj ? (
                          <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
                            {formatCnpj(lead.cnpj)}
                          </div>
                        ) : (
                          <div className="text-[11px] text-neutral-500">Sem CNPJ informado</div>
                        )}
                      </td>

                      {/* Cidade / UF */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-neutral-200">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{lead.cidade} - {lead.uf}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate max-w-[140px]">
                          {lead.bairro || lead.logradouro}
                        </div>
                      </td>

                      {/* Contato */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-neutral-200 font-medium">{lead.contato}</div>
                        <div className="text-[10px] text-neutral-400">{lead.contato_cargo || 'Decisor'}</div>
                      </td>

                      {/* Equipamento */}
                      <td className="py-3 px-4">
                        <div className="text-neutral-200 font-medium truncate max-w-[200px]">
                          {lead.produto_interesse}
                        </div>
                        <div className="text-[10px] text-neutral-400 capitalize">
                          Origem: {lead.origem}
                        </div>
                      </td>

                      {/* Valor Estimado */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums whitespace-nowrap">
                        {formatBRL(lead.valor_estimado)}
                      </td>

                      {/* Etapa */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${stageConfig?.color}18`,
                            color: stageConfig?.color,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: stageConfig?.color }}
                          />
                          <span>{stageConfig?.label}</span>
                        </span>
                      </td>

                      {/* Responsável */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isUnassigned ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-purple-400">
                              Triagem
                            </span>
                            {isGestor && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenTransferModal(lead);
                                }}
                                className="px-2 py-0.5 text-[10px] font-semibold bg-purple-900 hover:bg-purple-800 text-purple-200 rounded transition-colors"
                              >
                                Distribuir
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-300 text-xs">{lead.responsavel_nome}</span>
                            {isGestor && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenTransferModal(lead);
                                }}
                                title="Transferir lead para outro vendedor"
                                className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {lead.whatsapp && (
                            <a
                              href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Conversar no WhatsApp"
                              className="p-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => onEditLead(lead)}
                            title="Editar Lead"
                            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isGestor && (
                            <button
                              onClick={() => {
                                if (confirm(`Confirma a exclusão definitiva do lead ${lead.empresa}?`)) {
                                  onDeleteLead(lead.id);
                                }
                              }}
                              title="Excluir Lead (Gestor)"
                              className="p-1.5 rounded hover:bg-red-950/60 text-neutral-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
