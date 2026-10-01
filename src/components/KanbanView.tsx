import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Phone,
  User,
  MapPin,
  Building,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { Lead, FunnelStage, FUNNEL_STAGES_CONFIG, UserProfile, Priority } from '../types/crm';
import { formatCnpj } from '../services/brasilApi';

interface KanbanViewProps {
  user: UserProfile;
  leads: Lead[];
  onMoveStage: (leadId: string, newStage: FunnelStage) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenNewLeadModal: () => void;
  onOpenTransferModal: (lead: Lead) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  user,
  leads,
  onMoveStage,
  onSelectLead,
  onOpenNewLeadModal,
  onOpenTransferModal,
}) => {
  const isGestor = user.role === 'gestor';
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sellerFilter, setSellerFilter] = useState<string>('all');
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);

  // Formatação de Moeda
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Vendedores únicos para o filtro do Gestor
  const uniqueSellers = Array.from(
    new Set(leads.map((l) => l.responsavel_nome).filter(Boolean))
  ) as string[];

  // Filtro de leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.cnpj.includes(searchTerm) ||
      lead.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.produto_interesse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.cidade.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || lead.prioridade === priorityFilter;

    const matchesSeller =
      sellerFilter === 'all' ||
      (sellerFilter === 'unassigned' && !lead.responsavel_id) ||
      lead.responsavel_nome === sellerFilter;

    return matchesSearch && matchesPriority && matchesSeller;
  });

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggingLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: FunnelStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggingLeadId;
    if (leadId) {
      onMoveStage(leadId, stageId);
    }
    setDraggingLeadId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar empresa, CNPJ, produto, cidade..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

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

          {/* Seller Filter (Gestor only) */}
          {isGestor && (
            <select
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-sky-500"
            >
              <option value="all">Todos os Vendedores</option>
              <option value="unassigned">Sem Responsável (Triagem)</option>
              {uniqueSellers.map((seller) => (
                <option key={seller} value={seller}>
                  {seller}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-neutral-400 font-mono tabular-nums">
            {filteredLeads.length} {filteredLeads.length === 1 ? 'oportunidade' : 'oportunidades'}
          </span>
          <button
            onClick={onOpenNewLeadModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 min-h-[calc(100vh-250px)] items-start">
        {FUNNEL_STAGES_CONFIG.map((stage, stageIndex) => {
          const stageLeads = filteredLeads.filter((l) => l.etapa === stage.id);
          const stageTotal = stageLeads.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="w-80 shrink-0 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col max-h-[82vh]"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-neutral-800 bg-neutral-900/80 sticky top-0 rounded-t-xl z-10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                      {stage.label}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono tabular-nums">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono tabular-nums">
                  <span>Total estimado:</span>
                  <span className="text-neutral-200 font-semibold">{formatBRL(stageTotal)}</span>
                </div>
              </div>

              {/* Column Body / Cards */}
              <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                {stageLeads.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-neutral-800/80 rounded-lg text-neutral-400 text-xs">
                    Arraste leads aqui
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const isUnassigned = !lead.responsavel_id;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => onSelectLead(lead)}
                        className={`bg-neutral-950 border border-neutral-800 rounded-lg p-3 hover:border-neutral-700 hover:shadow-md transition-all cursor-pointer group relative ${
                          draggingLeadId === lead.id ? 'opacity-40' : ''
                        }`}
                      >
                        {/* Card Header: Priority & City */}
                        <div className="flex items-center justify-between text-[10px] mb-2">
                          <span
                            className={`font-semibold capitalize ${
                              lead.prioridade === 'urgente'
                                ? 'text-red-400'
                                : lead.prioridade === 'alta'
                                ? 'text-orange-400'
                                : lead.prioridade === 'media'
                                ? 'text-sky-400'
                                : 'text-neutral-400'
                            }`}
                          >
                            Prioridade {lead.prioridade}
                          </span>
                          <span className="text-neutral-400 flex items-center gap-1 truncate max-w-[120px]">
                            <MapPin className="w-2.5 h-2.5 shrink-0 text-neutral-400" />
                            {lead.cidade} - {lead.uf}
                          </span>
                        </div>

                        {/* Company & CNPJ */}
                        <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1 mb-1">
                          {lead.empresa}
                        </h4>
                        {lead.cnpj && (
                          <div className="text-[11px] text-neutral-400 font-mono tabular-nums mb-2">
                            CNPJ: {formatCnpj(lead.cnpj)}
                          </div>
                        )}

                        {/* Machine Product of Interest */}
                        <div className="p-2 rounded bg-neutral-900 border border-neutral-800/80 mb-2.5">
                          <div className="text-[10px] text-neutral-400 font-medium">Equipamento:</div>
                          <div className="text-xs font-semibold text-sky-400 truncate">
                            {lead.produto_interesse}
                          </div>
                        </div>

                        {/* Estimated Value */}
                        <div className="flex items-center justify-between text-xs mb-2.5 pt-1 border-t border-neutral-900">
                          <span className="text-neutral-400 text-[11px]">Valor:</span>
                          <span className="font-bold text-white font-mono tabular-nums">
                            {formatBRL(lead.valor_estimado)}
                          </span>
                        </div>

                        {/* Assigned Seller / Triagem Banner */}
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/60">
                          <div className="flex items-center gap-1.5 truncate mr-2">
                            <User className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span className="truncate">
                              {isUnassigned ? (
                                <span className="text-purple-400 font-semibold">Triagem (Sem vendedor)</span>
                              ) : (
                                lead.responsavel_nome
                              )}
                            </span>
                          </div>

                          {/* Quick Gestor Distribute button if unassigned */}
                          {isGestor && isUnassigned && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenTransferModal(lead);
                              }}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-purple-900 hover:bg-purple-800 text-purple-200 rounded transition-colors whitespace-nowrap"
                            >
                              Distribuir
                            </button>
                          )}
                        </div>

                        {/* Quick Contact Icons & Stage Move Controls */}
                        <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {lead.whatsapp && (
                              <a
                                href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Abrir WhatsApp Comercial"
                                className="p-1 rounded bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            )}
                            {lead.telefone && (
                              <a
                                href={`tel:${lead.telefone}`}
                                onClick={(e) => e.stopPropagation()}
                                title="Ligar para o cliente"
                                className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {/* Stage step advance/retreat */}
                          <div className="flex items-center gap-1">
                            {stageIndex > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveStage(lead.id, FUNNEL_STAGES_CONFIG[stageIndex - 1].id);
                                }}
                                title={`Voltar para ${FUNNEL_STAGES_CONFIG[stageIndex - 1].label}`}
                                className="p-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}

                            {stageIndex < FUNNEL_STAGES_CONFIG.length - 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveStage(lead.id, FUNNEL_STAGES_CONFIG[stageIndex + 1].id);
                                }}
                                title={`Avançar para ${FUNNEL_STAGES_CONFIG[stageIndex + 1].label}`}
                                className="p-1 rounded bg-neutral-900 hover:bg-sky-900 text-neutral-400 hover:text-sky-300 transition-colors"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
