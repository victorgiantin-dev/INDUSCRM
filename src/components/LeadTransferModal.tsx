import React, { useState } from 'react';
import { X, UserCheck, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { Lead, UserProfile } from '../types/crm';

interface LeadTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  gestor: UserProfile;
  availableUsers: UserProfile[];
  onDistribute: (leadId: string, targetUserId: string, targetUserName: string, gestorName: string, note?: string) => void;
}

export const LeadTransferModal: React.FC<LeadTransferModalProps> = ({
  isOpen,
  onClose,
  lead,
  gestor,
  availableUsers,
  onDistribute,
}) => {
  if (!isOpen || !lead) return null;

  const sellers = availableUsers.filter((u) => u.active);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    sellers.find((s) => s.id !== lead.responsavel_id)?.id || sellers[0]?.id || ''
  );
  const [note, setNote] = useState('');

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = sellers.find((u) => u.id === selectedUserId);
    if (!targetUser) return;

    onDistribute(lead.id, targetUser.id, targetUser.name, gestor.name, note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md shadow-2xl p-5 text-neutral-100">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Triagem & Distribuição de Lead</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4 text-xs">
          {/* Lead Summary */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
            <div className="text-[11px] text-neutral-400">Empresa / Oportunidade:</div>
            <div className="text-sm font-bold text-white mt-0.5">{lead.empresa}</div>
            <div className="text-[11px] text-sky-400 mt-1">{lead.produto_interesse}</div>
            <div className="text-[11px] text-neutral-400 mt-2 flex items-center gap-1.5">
              <span>Responsável Atual:</span>
              <strong className="text-neutral-200">
                {lead.responsavel_nome || 'Sem Vendedor (Triagem)'}
              </strong>
            </div>
          </div>

          {/* Target Seller */}
          <div>
            <label className="block text-neutral-300 font-semibold mb-1.5">
              Distribuir / Transferir Para o Vendedor:
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {sellers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'gestor' ? 'Gestor' : 'Vendedor'}) - {u.email}
                </option>
              ))}
            </select>
          </div>

          {/* Orientation Note */}
          <div>
            <label className="block text-neutral-300 font-semibold mb-1.5">
              Orientação do Gestor para o Vendedor (Opcional):
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Entrar em contato hoje mesmo. Cliente tem interesse na injetora 350T e já possui linha de crédito aprovada no BNDES."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Confirmar Transferência</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
