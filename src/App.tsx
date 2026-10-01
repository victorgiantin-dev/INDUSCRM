import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Lead,
  Task,
  Product,
  Company,
  Contact,
  Activity,
  FunnelStage,
} from './types/crm';
import {
  getCurrentSessionUser,
  logoutUser,
  fetchLeads,
  saveLead,
  deleteLead,
  moveLeadStage,
  distributeLead,
  addLeadActivity,
  fetchTasks,
  saveTask,
  toggleTaskCompletion,
  fetchProducts,
  saveProduct,
  fetchUsers,
  saveUser,
  fetchCompanies,
  fetchContacts,
} from './services/supabaseClient';

// Components
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { KanbanView } from './components/KanbanView';
import { LeadsView } from './components/LeadsView';
import { GoogleMapsView } from './components/GoogleMapsView';
import { CompaniesView } from './components/CompaniesView';
import { ContactsView } from './components/ContactsView';
import { TasksView } from './components/TasksView';
import { ProductsView } from './components/ProductsView';
import { UsersView } from './components/UsersView';
import { SettingsView } from './components/SettingsView';
import { LeadModal } from './components/LeadModal';
import { LeadTransferModal } from './components/LeadTransferModal';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';

export default function App() {
  // Estado de autenticação: Inicialmente nulo (a primeira tela é estritamente o LOGIN)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentSessionUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dados da aplicação
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modais
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [leadToTransfer, setLeadToTransfer] = useState<Lead | null>(null);

  const [selectedLeadDrawer, setSelectedLeadDrawer] = useState<Lead | null>(null);

  // Carregar dados sempre que o usuário mudar
  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;
    setLoadingData(true);

    const loadAll = async () => {
      try {
        const [loadedLeads, loadedTasks, loadedProds, loadedUsers, loadedComps, loadedConts] =
          await Promise.all([
            fetchLeads(currentUser.role, currentUser.id),
            fetchTasks(currentUser.role, currentUser.id),
            fetchProducts(),
            fetchUsers(),
            fetchCompanies(),
            fetchContacts(),
          ]);

        if (isMounted) {
          setLeads(loadedLeads);
          setTasks(loadedTasks);
          setProducts(loadedProds);
          setUsers(loadedUsers);
          setCompanies(loadedComps);
          setContacts(loadedConts);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Recarregar dados pontuais
  const refreshLeads = async () => {
    if (!currentUser) return;
    const l = await fetchLeads(currentUser.role, currentUser.id);
    setLeads(l);
    const comps = await fetchCompanies();
    setCompanies(comps);
    const conts = await fetchContacts();
    setContacts(conts);
  };

  const refreshTasks = async () => {
    if (!currentUser) return;
    const t = await fetchTasks(currentUser.role, currentUser.id);
    setTasks(t);
  };

  const refreshUsers = async () => {
    const u = await fetchUsers();
    setUsers(u);
  };

  const refreshProducts = async () => {
    const p = await fetchProducts();
    setProducts(p);
  };

  // Handlers de autenticação
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Ações de Leads
  const handleSaveLead = async (leadData: Partial<Lead>, isNew: boolean) => {
    const saved = await saveLead(leadData, isNew);
    await refreshLeads();
    if (selectedLeadDrawer && selectedLeadDrawer.id === saved.id) {
      setSelectedLeadDrawer(saved);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!currentUser) return;
    await deleteLead(leadId, currentUser.role);
    await refreshLeads();
    if (selectedLeadDrawer?.id === leadId) {
      setSelectedLeadDrawer(null);
    }
  };

  const handleMoveStage = async (leadId: string, newStage: FunnelStage, motivoPerda?: string) => {
    if (!currentUser) return;
    const updated = await moveLeadStage(
      leadId,
      newStage,
      currentUser.id,
      currentUser.name,
      motivoPerda
    );
    await refreshLeads();
    if (selectedLeadDrawer?.id === leadId) {
      setSelectedLeadDrawer(updated);
    }
  };

  const handleDistribute = async (
    leadId: string,
    targetUserId: string,
    targetUserName: string,
    gestorName: string,
    note?: string
  ) => {
    const updated = await distributeLead(leadId, targetUserId, targetUserName, gestorName, note);
    await refreshLeads();
    if (selectedLeadDrawer?.id === leadId) {
      setSelectedLeadDrawer(updated);
    }
  };

  const handleAddActivity = async (activityData: Omit<Activity, 'id' | 'data'>) => {
    await addLeadActivity(activityData);
    await refreshLeads();
    if (selectedLeadDrawer && selectedLeadDrawer.id === activityData.lead_id) {
      const currentActivities = selectedLeadDrawer.atividades || [];
      const newAct: Activity = {
        ...activityData,
        id: `act_${Date.now()}`,
        data: new Date().toISOString(),
      };
      setSelectedLeadDrawer({
        ...selectedLeadDrawer,
        atividades: [newAct, ...currentActivities],
      });
    }
  };

  // Ações de Tarefas
  const handleAddTask = async (taskData: Partial<Task>) => {
    await saveTask(taskData);
    await refreshTasks();
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await toggleTaskCompletion(taskId, completed);
    await refreshTasks();
  };

  // Ações de Produtos
  const handleAddProduct = async (productData: Partial<Product>) => {
    await saveProduct(productData);
    await refreshProducts();
  };

  // Ações de Usuários
  const handleSaveUser = async (userData: Partial<UserProfile>) => {
    await saveUser(userData);
    await refreshUsers();
  };

  // Leads em triagem (sem responsável atribuído)
  const unassignedLeadsCount = leads.filter((l) => !l.responsavel_id || l.etapa === 'triagem').length;
  const pendingTasksCount = tasks.filter((t) => !t.concluida).length;

  // SE NÃO HOUVER USUÁRIO AUTENTICADO: A PRIMEIRA TELA DEVE SER OBRIGATORIAMENTE O LOGIN
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Header seguindo o Top Bar Contract de 3 zonas */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onOpenNewLeadModal={() => {
          setLeadToEdit(null);
          setIsLeadModalOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Layout Body com Sidebar e Área Principal */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          user={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unassignedLeadsCount={unassignedLeadsCount}
          totalLeadsCount={leads.length}
          pendingTasksCount={pendingTasksCount}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Viewport Principal */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-950">
          {activeTab === 'dashboard' && (
            <DashboardView
              user={currentUser}
              leads={leads}
              tasks={tasks}
              onNavigateTab={setActiveTab}
              onOpenNewLeadModal={() => {
                setLeadToEdit(null);
                setIsLeadModalOpen(true);
              }}
              onSelectLead={(l) => setSelectedLeadDrawer(l)}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanView
              user={currentUser}
              leads={leads}
              onMoveStage={handleMoveStage}
              onSelectLead={(l) => setSelectedLeadDrawer(l)}
              onOpenNewLeadModal={() => {
                setLeadToEdit(null);
                setIsLeadModalOpen(true);
              }}
              onOpenTransferModal={(l) => {
                setLeadToTransfer(l);
                setIsTransferModalOpen(true);
              }}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsView
              user={currentUser}
              leads={leads}
              onOpenNewLeadModal={() => {
                setLeadToEdit(null);
                setIsLeadModalOpen(true);
              }}
              onEditLead={(l) => {
                setLeadToEdit(l);
                setIsLeadModalOpen(true);
              }}
              onDeleteLead={handleDeleteLead}
              onOpenTransferModal={(l) => {
                setLeadToTransfer(l);
                setIsTransferModalOpen(true);
              }}
              onSelectLead={(l) => setSelectedLeadDrawer(l)}
            />
          )}

          {activeTab === 'mapa' && (
            <GoogleMapsView
              user={currentUser}
              leads={leads}
              onSelectLead={(l) => setSelectedLeadDrawer(l)}
              onOpenNewLeadModal={() => {
                setLeadToEdit(null);
                setIsLeadModalOpen(true);
              }}
            />
          )}

          {activeTab === 'empresas' && <CompaniesView companies={companies} />}

          {activeTab === 'contatos' && <ContactsView contacts={contacts} />}

          {activeTab === 'tarefas' && (
            <TasksView
              user={currentUser}
              tasks={tasks}
              leads={leads}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
            />
          )}

          {activeTab === 'produtos' && (
            <ProductsView
              user={currentUser}
              products={products}
              onAddProduct={handleAddProduct}
            />
          )}

          {activeTab === 'usuarios' && currentUser.role === 'gestor' && (
            <UsersView
              currentUser={currentUser}
              users={users}
              leads={leads}
              onSaveUser={handleSaveUser}
            />
          )}

          {activeTab === 'configuracoes' && currentUser.role === 'gestor' && <SettingsView />}
        </main>
      </div>

      {/* Modal de Criação / Edição de Lead (com Consulta BrasilAPI) */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setLeadToEdit(null);
        }}
        onSaveLead={handleSaveLead}
        onDeleteLead={handleDeleteLead}
        leadToEdit={leadToEdit}
        currentUser={currentUser}
        availableUsers={users}
        availableProducts={products}
      />

      {/* Modal de Triagem e Distribuição de Lead (Gestor) */}
      <LeadTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setLeadToTransfer(null);
        }}
        lead={leadToTransfer}
        gestor={currentUser}
        availableUsers={users}
        onDistribute={handleDistribute}
      />

      {/* Drawer Lateral de Detalhes do Lead (com Histórico e Ações) */}
      <LeadDetailDrawer
        isOpen={Boolean(selectedLeadDrawer)}
        onClose={() => setSelectedLeadDrawer(null)}
        lead={selectedLeadDrawer}
        currentUser={currentUser}
        onMoveStage={handleMoveStage}
        onAddActivity={handleAddActivity}
        onOpenTransferModal={(l) => {
          setLeadToTransfer(l);
          setIsTransferModalOpen(true);
        }}
        onEditLead={(l) => {
          setLeadToEdit(l);
          setIsLeadModalOpen(true);
        }}
      />
    </div>
  );
}
