import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  Users,
  MapPin,
  Building2,
  Contact2,
  CheckSquare,
  Wrench,
  UserCog,
  Settings,
} from 'lucide-react';
import { UserProfile } from '../types/crm';

interface SidebarProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unassignedLeadsCount: number;
  totalLeadsCount: number;
  pendingTasksCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  unassignedLeadsCount,
  totalLeadsCount,
  pendingTasksCount,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const isGestor = user.role === 'gestor';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'kanban',
      label: 'Funil Kanban',
      icon: Kanban,
      badge: totalLeadsCount > 0 ? totalLeadsCount : null,
    },
    {
      id: 'leads',
      label: 'Leads & Triagem',
      icon: Users,
      badge: isGestor && unassignedLeadsCount > 0 ? `${unassignedLeadsCount} triagem` : null,
      badgeColor: 'bg-purple-900/60 text-purple-300 border border-purple-700/50',
    },
    {
      id: 'mapa',
      label: 'Mapa de Leads',
      icon: MapPin,
      badge: 'Google Maps',
      badgeColor: 'bg-sky-950 text-sky-400 border border-sky-800/40',
    },
    {
      id: 'empresas',
      label: 'Empresas',
      icon: Building2,
      badge: null,
    },
    {
      id: 'contatos',
      label: 'Contatos',
      icon: Contact2,
      badge: null,
    },
    {
      id: 'tarefas',
      label: 'Tarefas Comerciais',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
    },
    {
      id: 'produtos',
      label: 'Catálogo Máquinas',
      icon: Wrench,
      badge: null,
    },
    // Itens exclusivos do perfil GESTOR (Equipe e Configurações de SQL/API)
    ...(isGestor
      ? [
          {
            id: 'usuarios',
            label: 'Equipe de Vendas',
            icon: UserCog,
            badge: 'Gestor',
            badgeColor: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
          },
          {
            id: 'configuracoes',
            label: 'Configurações & SQL',
            icon: Settings,
            badge: 'Gestor',
            badgeColor: 'bg-purple-950/60 text-purple-300 border border-purple-800/50',
          },
        ]
      : []),
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 mb-2">
            Módulos Industriais
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group text-left ${
                    isActive
                      ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-sky-400' : 'text-neutral-500 group-hover:text-neutral-300'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono shrink-0 ml-1.5 ${
                        item.badgeColor || 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mensagem para perfil Vendedor */}
          {!isGestor && (
            <div className="mt-6 p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 text-[11px] text-neutral-400">
              <span className="font-semibold text-neutral-300 block mb-1">
                Acesso Comercial (Vendedor)
              </span>
              Visualização restrita aos seus próprios leads, empresas e tarefas comerciais.
            </div>
          )}
        </div>

        {/* Rodapé institucional com indicação de versão e sistema */}
        <div className="p-3 border-t border-neutral-800 text-center">
          <span className="text-[10px] text-neutral-400 font-mono">
            IndusCRM Industrial · v2.4
          </span>
        </div>
      </aside>
    </>
  );
};
