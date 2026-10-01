import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Wrench,
  DollarSign,
  User,
  Clock,
  ArrowRight,
  CheckCircle,
  Plus,
  Send,
  FileText,
  Navigation,
} from 'lucide-react';
import { Lead, UserProfile, FunnelStage, FUNNEL_STAGES_CONFIG, Activity } from '../types/crm';
import { formatCnpj } from '../services/brasilApi';

interface LeadDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  currentUser: UserProfile;
  onMoveStage: (leadId: string, newStage: FunnelStage, motivoPerda?: string) => void;
  onAddActivity: (activity: Omit<Activity, 'id' | 'data'>) => void;
  onOpenTransferModal: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  isOpen,
  onClose,
  lead,
  currentUser,
  onMoveStage,
  onAddActivity,
  onOpenTransferModal,
  onEditLead,
}) => {
  if (!isOpen || !lead) return null;

  const isGestor = currentUser.role === 'gestor';
  const stageConfig = FUNNEL_STAGES_CONFIG.find((s) => s.id === lead.etapa);

  // Atividade form
  const [activityType, setActivityType] = useState<
    'ligacao' | 'whatsapp' | 'reuniao' | 'visita_tecnica' | 'proposta' | 'nota'
  >('whatsapp');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');
  const [submittingAct, setSubmittingAct] = useState(false);

  // Motivo perda modal state
  const [showLossReasonInput, setShowLossReasonInput] = useState(false);
  const [lossReason, setLossReason] = useState('');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleStageSelect = (stageId: FunnelStage) => {
    if (stageId === 'venda_perdida') {
      setShowLossReasonInput(true);
      return;
    }
    onMoveStage(lead.id, stageId);
  };

  const handleConfirmLoss = () => {
    onMoveStage(lead.id, 'venda_perdida', lossReason.trim() || 'Desistência ou preço concorrente');
    setShowLossReasonInput(false);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    setSubmittingAct(true);
    onAddActivity({
      lead_id: lead.id,
      usuario_id: currentUser.id,
      usuario_nome: currentUser.name,
      tipo: activityType,
      titulo: activityTitle.trim(),
      descricao: activityDesc.trim(),
    });

    setActivityTitle('');
    setActivityDesc('');
    setSubmittingAct(false);
  };

  const mapsQuery = encodeURIComponent(
    `${lead.empresa}, ${lead.logradouro || ''} ${lead.numero || ''}, ${lead.cidade} - ${lead.uf}`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl text-neutral-100">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-start justify-between bg-neutral-900/90 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold"
                style={{
                  backgroundColor: `${stageConfig?.color}20`,
                  color: stageConfig?.color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: stageConfig?.color }}
                />
                {stageConfig?.label}
              </span>
              <span className="text-[11px] text-neutral-400">·</span>
              <span className="text-[11px] text-neutral-400 capitalize">Prioridade {lead.prioridade}</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{lead.empresa}</h2>
            {lead.cnpj && (
              <div className="text-xs text-neutral-400 font-mono tabular-nums">
                CNPJ: {formatCnpj(lead.cnpj)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEditLead(lead)}
              className="px-3 py-1.5 text-xs text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors font-medium"
            >
              Editar
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Valor & Máquina de Interesse */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Valor Estimado</span>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
                {formatBRL(lead.valor_estimado)}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Responsável Comercial</span>
              <div className="text-xs font-semibold text-neutral-200 mt-1 flex items-center justify-between">
                <span>{lead.responsavel_nome || 'Em Triagem (Sem vendedor)'}</span>
                {isGestor && (
                  <button
                    onClick={() => onOpenTransferModal(lead)}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    Transferir
                  </button>
                )}
              </div>
            </div>
            <div className="col-span-2 pt-2 border-t border-neutral-900">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Equipamento de Interesse</span>
              <div className="text-sm font-semibold text-sky-400 mt-0.5 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{lead.produto_interesse}</span>
              </div>
            </div>
          </div>

          {/* Quick Stage Progression */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Mudar Etapa do Funil
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {FUNNEL_STAGES_CONFIG.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStageSelect(s.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    lead.etapa === s.id
                      ? 'border-sky-500 bg-sky-950/40 text-white font-bold'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-[11px] block truncate">{s.label}</span>
                </button>
              ))}
            </div>

            {/* Modal de Motivo de Perda */}
            {showLossReasonInput && (
              <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg space-y-2 mt-2">
                <span className="text-xs font-semibold text-red-300 block">
                  Informe o motivo da perda do negócio:
                </span>
                <input
                  type="text"
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  placeholder="Ex: Preço da concorrência, cancelamento do investimento, prazo de entrega..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowLossReasonInput(false)}
                    className="px-2.5 py-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmLoss}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold rounded"
                  >
                    Confirmar Perda
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dados de Contato & Ações Diretas */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Contato Comercial & Decisor
            </span>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{lead.contato}</div>
                  <div className="text-[11px] text-neutral-400">{lead.contato_cargo || 'Gestor de Compras'}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {lead.whatsapp && (
                    <a
                      href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {lead.telefone && (
                    <a
                      href={`tel:${lead.telefone}`}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-900 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-neutral-500">Telefone:</span> {lead.telefone || 'Não informado'}
                </div>
                <div>
                  <span className="text-neutral-500">E-mail:</span> {lead.email || 'Não informado'}
                </div>
              </div>
            </div>
          </div>

          {/* Localização da Fábrica & Rota Google Maps */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Localização da Fábrica / Planta
            </span>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{lead.cidade} - {lead.uf}</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {[lead.logradouro, lead.numero, lead.bairro, lead.cep].filter(Boolean).join(', ')}
                </div>
                {lead.cnae_descricao && (
                  <div className="text-[10px] text-neutral-400 mt-2">
                    CNAE: {lead.cnae} - {lead.cnae_descricao}
                  </div>
                )}
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>Abrir Rota</span>
              </a>
            </div>
          </div>

          {/* Observações */}
          {lead.observacoes && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Observações Técnicas & Comerciais
              </span>
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs whitespace-pre-wrap leading-relaxed">
                {lead.observacoes}
              </div>
            </div>
          )}

          {/* Timeline de Atividades & Histórico */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Histórico de Atividades & Registro de Contato
            </span>

            {/* Novo Registro de Atividade */}
            <form onSubmit={handleCreateActivity} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as any)}
                  className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="ligacao">Ligação Telefônica</option>
                  <option value="visita_tecnica">Visita Técnica à Fábrica</option>
                  <option value="reuniao">Reunião Presencial/Online</option>
                  <option value="proposta">Proposta Comercial Enviada</option>
                  <option value="nota">Nota Interna</option>
                </select>
                <input
                  type="text"
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="Título da atividade (ex: Reunião com Diretor Industrial)"
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <textarea
                rows={2}
                value={activityDesc}
                onChange={(e) => setActivityDesc(e.target.value)}
                placeholder="Detalhes da conversa, especificações técnicas discutidas, prazos combinados..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingAct || !activityTitle.trim()}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>Registrar Atividade</span>
                </button>
              </div>
            </form>

            {/* Lista de Atividades */}
            <div className="space-y-2 mt-3">
              {(!lead.atividades || lead.atividades.length === 0) ? (
                <div className="text-neutral-500 text-center py-4 text-xs">
                  Nenhuma atividade registrada até o momento.
                </div>
              ) : (
                lead.atividades.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-neutral-200">{act.titulo}</span>
                      <span className="text-neutral-400 font-mono tabular-nums">
                        {new Date(act.data).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {act.descricao && (
                      <p className="text-neutral-300 text-xs leading-relaxed">{act.descricao}</p>
                    )}
                    <div className="text-[10px] text-neutral-400 pt-1 flex items-center gap-1">
                      <span>Registrado por:</span>
                      <strong className="text-neutral-300">{act.usuario_nome}</strong>
                      <span className="capitalize">({act.tipo})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
