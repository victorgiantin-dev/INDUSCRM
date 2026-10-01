import React from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  ArrowRight,
  Kanban,
  MapPin,
  Calendar,
  Layers,
  Wrench,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { Lead, Task, UserProfile, FUNNEL_STAGES_CONFIG } from '../types/crm';

interface DashboardViewProps {
  user: UserProfile;
  leads: Lead[];
  tasks: Task[];
  onNavigateTab: (tab: string) => void;
  onOpenNewLeadModal: () => void;
  onSelectLead: (lead: Lead) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  leads,
  tasks,
  onNavigateTab,
  onOpenNewLeadModal,
  onSelectLead,
}) => {
  const isGestor = user.role === 'gestor';

  // Métricas calculadas
  const totalLeads = leads.length;

  const leadsGanhos = leads.filter((l) => l.etapa === 'venda_ganha');
  const valorTotalGanho = leadsGanhos.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

  const leadsEmNegociacao = leads.filter(
    (l) => l.etapa === 'negociacao' || l.etapa === 'proposta' || l.etapa === 'contato' || l.etapa === 'qualificado'
  );
  const valorPipelineAberto = leadsEmNegociacao.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

  const leadsTriagem = leads.filter((l) => l.etapa === 'triagem' || l.etapa === 'novo' || !l.responsavel_id);

  const leadsPerdidos = leads.filter((l) => l.etapa === 'venda_perdida');
  const totalFinalizados = leadsGanhos.length + leadsPerdidos.length;
  const taxaConversao = totalFinalizados > 0 ? (leadsGanhos.length / totalFinalizados) * 100 : 0;

  const ticketMedio = leadsGanhos.length > 0 ? valorTotalGanho / leadsGanhos.length : (valorPipelineAberto / (leadsEmNegociacao.length || 1));

  // Formatação em Reais (BRL)
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Contagem por etapa do funil
  const stageCounts = FUNNEL_STAGES_CONFIG.map((stage) => {
    const stageLeads = leads.filter((l) => l.etapa === stage.id);
    const sum = stageLeads.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);
    return {
      ...stage,
      count: stageLeads.length,
      totalValor: sum,
    };
  });

  // Top Máquinas Industriais em demanda
  const productDemandMap: Record<string, { count: number; totalValor: number }> = {};
  leads.forEach((l) => {
    const prod = l.produto_interesse || 'Outro Equipamento';
    if (!productDemandMap[prod]) {
      productDemandMap[prod] = { count: 0, totalValor: 0 };
    }
    productDemandMap[prod].count += 1;
    productDemandMap[prod].totalValor += l.valor_estimado || 0;
  });

  const topProducts = Object.entries(productDemandMap)
    .map(([nome, data]) => ({ nome, ...data }))
    .sort((a, b) => b.totalValor - a.totalValor)
    .slice(0, 4);

  // Desempenho por vendedor (para Gestor)
  const sellerStatsMap: Record<string, { count: number; ganho: number; aberto: number }> = {};
  leads.forEach((l) => {
    const seller = l.responsavel_nome || 'Sem Responsável';
    if (!sellerStatsMap[seller]) {
      sellerStatsMap[seller] = { count: 0, ganho: 0, aberto: 0 };
    }
    sellerStatsMap[seller].count += 1;
    if (l.etapa === 'venda_ganha') {
      sellerStatsMap[seller].ganho += l.valor_estimado || 0;
    } else if (l.etapa !== 'venda_perdida') {
      sellerStatsMap[seller].aberto += l.valor_estimado || 0;
    }
  });

  const sellerStats = Object.entries(sellerStatsMap).map(([nome, s]) => ({
    nome,
    ...s,
  }));

  const pendingTasks = tasks.filter((t) => !t.concluida).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            <span>Visão Geral do CRM</span>
            <span>·</span>
            <span>Máquinas & Equipamentos Industriais</span>
            <span>·</span>
            <span className="font-semibold text-neutral-300">
              {isGestor ? 'Controle Geral (Gestão)' : 'Painel Individual (Vendas)'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isGestor ? 'Dashboard Executivo de Maquinário' : `Pipeline Comercial - ${user.name}`}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Acompanhe o funil de vendas, oportunidades em aberto e agendamento de visitas técnicas a fábricas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('kanban')}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Kanban className="w-3.5 h-3.5 text-sky-400" />
            <span>Ver Kanban</span>
          </button>
          <button
            onClick={() => onNavigateTab('mapa')}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Ver no Mapa</span>
          </button>
          <button
            onClick={onOpenNewLeadModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>+ Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Alerta de Triagem para Gestor */}
      {isGestor && leadsTriagem.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-900/60 text-purple-300 shrink-0">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
                Triagem Pendente
              </span>
              <span className="text-sm font-medium">
                Existem <strong className="text-white tabular-nums">{leadsTriagem.length}</strong> leads aguardando qualificação técnica e distribuição para vendedores.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('leads')}
            className="px-3.5 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors whitespace-nowrap self-end sm:self-center"
          >
            Fazer Triagem Agora &rarr;
          </button>
        </div>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pipeline em Aberto */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pipeline em Aberto</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {formatBRL(valorPipelineAberto)}
          </div>
          <div className="text-xs text-neutral-400 mt-2 flex items-center gap-1.5">
            <span className="text-sky-400 font-semibold font-mono tabular-nums">
              {leadsEmNegociacao.length}
            </span>
            <span>oportunidades em andamento</span>
          </div>
        </div>

        {/* KPI 2: Vendas Fechadas (Ganho) */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Vendas Fechadas</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-400 font-mono tabular-nums">
            {formatBRL(valorTotalGanho)}
          </div>
          <div className="text-xs text-neutral-400 mt-2 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold font-mono tabular-nums">
              {leadsGanhos.length}
            </span>
            <span>máquinas vendidas e contratadas</span>
          </div>
        </div>

        {/* KPI 3: Taxa de Conversão */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Taxa de Conversão</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {taxaConversao.toFixed(1)}%
          </div>
          <div className="text-xs text-neutral-400 mt-2 flex items-center gap-1.5">
            <span>Ticket médio:</span>
            <span className="text-neutral-200 font-semibold font-mono tabular-nums">
              {formatBRL(ticketMedio)}
            </span>
          </div>
        </div>

        {/* KPI 4: Leads Totais */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Leads no Radar</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {totalLeads}
          </div>
          <div className="text-xs text-neutral-400 mt-2 flex items-center gap-1.5">
            <span className="text-purple-400 font-semibold font-mono tabular-nums">
              {leadsTriagem.length}
            </span>
            <span>em triagem / novos</span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Funnel Breakdown */}
      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Etapas do Funil de Máquinas Industriais</h2>
            <p className="text-xs text-neutral-400">
              Distribuição de volume e valores ao longo das 7 etapas do processo comercial.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('kanban')}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            <span>Abrir Quadro Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {stageCounts.map((stage) => (
            <div
              key={stage.id}
              onClick={() => onNavigateTab('kanban')}
              className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-300 group-hover:text-white truncate">
                  {stage.label}
                </span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
              </div>
              <div className="text-lg font-bold text-white font-mono tabular-nums">
                {stage.count}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono tabular-nums truncate mt-0.5">
                {formatBRL(stage.totalValor)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Top Máquinas em Demanda & Performance de Vendedores (ou Tarefas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna 1: Top Máquinas e Equipamentos */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-sky-400" />
              <h2 className="text-base font-semibold text-white">Máquinas Mais Demandadas</h2>
            </div>
            <button
              onClick={() => onNavigateTab('produtos')}
              className="text-xs text-neutral-400 hover:text-white font-medium"
            >
              Ver Catálogo
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">Nenhum lead com produto registrado.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800/60"
                >
                  <div className="truncate mr-3">
                    <div className="text-xs font-semibold text-neutral-200 truncate">{p.nome}</div>
                    <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
                      {p.count} {p.count === 1 ? 'oportunidade' : 'oportunidades'} ativas
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-white font-mono tabular-nums">
                      {formatBRL(p.totalValor)}
                    </div>
                    <span className="text-[10px] text-neutral-400">volume estimado</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Tarefas & Follow-ups ou Distribuição por Vendedor */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Próximos Compromissos & Visitas</h2>
            </div>
            <button
              onClick={() => onNavigateTab('tarefas')}
              className="text-xs text-neutral-400 hover:text-white font-medium"
            >
              Ver Todas
            </button>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">Nenhuma tarefa pendente agendada.</p>
            ) : (
              pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/60 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-neutral-200">{t.titulo}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {t.lead_nome && (
                        <span className="text-sky-400 font-medium mr-2">{t.lead_nome}</span>
                      )}
                      <span>Responsável: {t.responsavel_nome}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-amber-400 font-mono tabular-nums">
                      {new Date(t.data_vencimento).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="block text-[10px] text-neutral-400 capitalize">{t.tipo}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Gestor: Quadro de Distribuição da Equipe de Vendas */}
      {isGestor && (
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h2 className="text-base font-semibold text-white">Performance da Equipe Comercial</h2>
            </div>
            <button
              onClick={() => onNavigateTab('usuarios')}
              className="text-xs text-neutral-400 hover:text-white font-medium"
            >
              Gerenciar Equipe
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sellerStats.map((s, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-neutral-950 border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-200">{s.nome}</span>
                  <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
                    {s.count} {s.count === 1 ? 'lead' : 'leads'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Em Aberto:</span>
                    <span className="font-semibold text-white font-mono tabular-nums">
                      {formatBRL(s.aberto)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Vendas Ganhas:</span>
                    <span className="font-semibold text-emerald-400 font-mono tabular-nums">
                      {formatBRL(s.ganho)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
