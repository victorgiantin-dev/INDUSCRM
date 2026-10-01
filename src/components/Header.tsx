import React from 'react';
import { Plus, LogOut, ShieldCheck, UserCheck, Menu, X } from 'lucide-react';
import { UserProfile } from '../types/crm';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  onOpenNewLeadModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenNewLeadModal,
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <header className="h-16 bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-neutral-400 hover:text-white p-1"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('dashboard');
          }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
          <span>IndusCRM</span>
        </a>
      </div>

      {/* Zone 2: 4-6 clean text navigation links / breadcrumbs (single-line) */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-300">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            activeTab === 'dashboard' ? 'text-white font-semibold' : 'text-neutral-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('kanban')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            activeTab === 'kanban' ? 'text-white font-semibold' : 'text-neutral-400'
          }`}
        >
          Funil Kanban
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            activeTab === 'leads' ? 'text-white font-semibold' : 'text-neutral-400'
          }`}
        >
          Leads
        </button>
        <button
          onClick={() => setActiveTab('mapa')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            activeTab === 'mapa' ? 'text-white font-semibold' : 'text-neutral-400'
          }`}
        >
          Mapa Google
        </button>
        <button
          onClick={() => setActiveTab('produtos')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            activeTab === 'produtos' ? 'text-white font-semibold' : 'text-neutral-400'
          }`}
        >
          Catálogo
        </button>
        <button
          onClick={() => setActiveTab('tarefas')}
          className={`hover:text-white transition-colors whitespace-nowrap ${
            activeTab === 'tarefas' ? 'text-white font-semibold' : 'text-neutral-400'
          }`}
        >
          Tarefas
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenNewLeadModal}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Novo Lead</span>
        </button>

        {/* User identification badge & logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-neutral-200 truncate max-w-[130px]">
              {user.name}
            </span>
            <span className="text-[10px] text-neutral-400 flex items-center justify-end gap-1 capitalize">
              {user.role === 'gestor' ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-sky-400" />
                  <span>Gestor</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span>Vendedor</span>
                </>
              )}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="Sair do sistema"
            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
