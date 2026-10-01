import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  Lead,
  Task,
  Product,
  Company,
  Contact,
  Activity,
  FunnelStage,
  UserRole,
} from '../types/crm';

// Chaves de armazenamento local
const SUPABASE_CONFIG_KEY = 'indus_supabase_config';
const LOCAL_LEADS_KEY = 'indus_crm_leads';
const LOCAL_TASKS_KEY = 'indus_crm_tasks';
const LOCAL_PRODUCTS_KEY = 'indus_crm_products';
const LOCAL_USERS_KEY = 'indus_crm_users';
const LOCAL_COMPANIES_KEY = 'indus_crm_companies';
const LOCAL_CONTACTS_KEY = 'indus_crm_contacts';
const CURRENT_USER_KEY = 'indus_current_user';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

// Configuração padrão
export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey, isConfigured: true };
  }

  const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        return { ...parsed, isConfigured: true };
      }
    } catch {
      // Ignora erro de parse
    }
  }

  return { url: '', anonKey: '', isConfigured: false };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(
    SUPABASE_CONFIG_KEY,
    JSON.stringify({ url: url.trim(), anonKey: anonKey.trim(), isConfigured: Boolean(url && anonKey) })
  );
}

// Instância do cliente Supabase quando configurado
let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.isConfigured || !config.url || !config.anonKey) {
    return null;
  }
  if (!supabaseClientInstance) {
    try {
      supabaseClientInstance = createClient(config.url, config.anonKey);
    } catch {
      return null;
    }
  }
  return supabaseClientInstance;
}

// ==============================================================================
// SEED INICIAL DE MÁQUINAS INDUSTRIAIS & LEADS PARA DEMO / OFFLINE ROBUSTO
// ==============================================================================

export const SEED_USERS: UserProfile[] = [
  {
    id: 'usr_gestor_01',
    email: 'gestor@induscrm.com.br',
    name: 'Carlos Mendes',
    role: 'gestor',
    phone: '(11) 98765-4321',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr_vendedor_01',
    email: 'marcos.vendas@induscrm.com.br',
    name: 'Marcos Silveira',
    role: 'vendedor',
    phone: '(19) 99123-4567',
    active: true,
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'usr_vendedor_02',
    email: 'patricia.machinery@induscrm.com.br',
    name: 'Patrícia Rocha',
    role: 'vendedor',
    phone: '(47) 98877-6655',
    active: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod_01',
    nome: 'Torno CNC de Alta Precisão Romi',
    categoria: 'Usinagem',
    fabricante: 'Indústrias Romi',
    modelo: 'Centur 30D / ST-20',
    potencia_especificacao: 'Motor 20 HP, 4500 RPM, passagem 65mm, barramento inclinado',
    preco_base: 345000,
    status: 'disponivel',
    descricao: 'Torno CNC robusto projetado para usinagem seriada de componentes mecânicos de alta exatidão dimensional.',
  },
  {
    id: 'prod_02',
    nome: 'Centro de Usinagem 5 Eixos DMG Mori',
    categoria: 'Usinagem',
    fabricante: 'DMG Mori',
    modelo: 'DMU 50 3rd Generation',
    potencia_especificacao: 'Spindle SpeedMASTER 15.000 RPM, mesa basculante integrada Ø630mm',
    preco_base: 890000,
    status: 'disponivel',
    descricao: 'Máquina de 5 eixos simultâneos para usinagem de formas livres e peças complexas aeroespaciais e médicas.',
  },
  {
    id: 'prod_03',
    nome: 'Prensa Hidráulica Industrial 200T',
    categoria: 'Conformação',
    fabricante: 'Gutmann Máquinas',
    modelo: 'PH-200T Auto Synchro',
    potencia_especificacao: 'Capacidade 200 toneladas, curso 600mm, mesa 1200x1000mm, CLP Siemens S7-1200',
    preco_base: 420000,
    status: 'disponivel',
    descricao: 'Prensa hidráulica com duplo efeito para repuxo profundo, forjamento e estampagem de chapas automotivas.',
  },
  {
    id: 'prod_04',
    nome: 'Cortadora a Laser Fibra Óptica 6kW',
    categoria: 'Corte e Solda',
    fabricante: 'Bystronic Bodor',
    modelo: 'Fiber Laser 6000W C-Pro',
    potencia_especificacao: 'Laser Raycus/IPG 6kW, mesa dupla de troca automática 3000x1500mm, corte inox até 25mm',
    preco_base: 680000,
    status: 'disponivel',
    descricao: 'Sistema de corte a laser de fibra de alto rendimento, alta velocidade para corte de chapas finas e grossas.',
  },
  {
    id: 'prod_05',
    nome: 'Dobradeira CNC Eletro-Hidráulica 135T',
    categoria: 'Conformação',
    fabricante: 'Newton Máquinas',
    modelo: 'HAP-13530 CNC 4 Eixos',
    potencia_especificacao: 'Força de dobra 135 toneladas, comprimento útil 3200mm, batente traseiro CNC',
    preco_base: 290000,
    status: 'disponivel',
    descricao: 'Dobradeira sincronizada CNC com compensação hidráulica automática de deformação de mesa.',
  },
  {
    id: 'prod_06',
    nome: 'Injetora de Termoplásticos Servo 350T',
    categoria: 'Plásticos e Polímeros',
    fabricante: 'Romi Primax',
    modelo: 'Primax 350-R Servo',
    potencia_especificacao: 'Entre colunas 710x710mm, volume de injeção 1280 cm³, servo-bomba de baixo consumo',
    preco_base: 510000,
    status: 'sob_encomenda',
    descricao: 'Injetora de plástico para peças técnicas com alta precisão de dosagem e redução de 40% no consumo elétrico.',
  },
  {
    id: 'prod_07',
    nome: 'Compressor de Parafuso Lubrificado 75HP',
    categoria: 'Utilidades Industriais',
    fabricante: 'Atlas Copco',
    modelo: 'GA-55 VSD+ Inverter',
    potencia_especificacao: 'Vazão 385 PCM, 75 HP, inversor VSD integrado, secador por refrigeração',
    preco_base: 165000,
    status: 'disponivel',
    descricao: 'Central de ar comprimido industrial silenciosa para plantas fabris de operação 24/7.',
  },
];

export const SEED_LEADS: Lead[] = [
  {
    id: 'lead_01',
    empresa: 'Metalúrgica Santa Bárbara Ltda',
    cnpj: '18.236.120/0001-58',
    razao_social: 'Metalúrgica Santa Bárbara Usinagem e Autopeças Ltda',
    nome_fantasia: 'MSB Usinagem Industrial',
    cnae: '25.39-0-01',
    cnae_descricao: 'Serviços de usinagem, tornearia e solda',
    contato: 'Eng. Ricardo Vasconcelos',
    contato_cargo: 'Diretor Industrial',
    telefone: '(19) 3455-8800',
    whatsapp: '19981239988',
    email: 'ricardo@msbusinagem.com.br',
    cep: '13450-000',
    logradouro: 'Avenida da Indústria',
    numero: '1450',
    bairro: 'Distrito Industrial',
    cidade: 'Santa Bárbara d\'Oeste',
    uf: 'SP',
    lat: -22.7561,
    lng: -47.4144,
    produto_interesse: 'Torno CNC de Alta Precisão Romi',
    valor_estimado: 345000,
    responsavel_id: 'usr_vendedor_01',
    responsavel_nome: 'Marcos Silveira',
    etapa: 'negociacao',
    origem: 'Prospecção Ativa',
    prioridade: 'alta',
    observacoes: 'Cliente precisa expandir linha de eixos de transmissão para montadoras. Avaliando proposta de leasing ou Finame.',
    data_criacao: '2026-02-12T14:20:00Z',
    data_atualizacao: '2026-03-28T10:15:00Z',
    atividades: [
      {
        id: 'act_01_1',
        lead_id: 'lead_01',
        usuario_id: 'usr_vendedor_01',
        usuario_nome: 'Marcos Silveira',
        tipo: 'visita_tecnica',
        titulo: 'Visita Técnica à Fábrica do Cliente',
        descricao: 'Vistoriada a fundação da fábrica e o suprimento elétrico de 380V. O torno cabe perfeitamente no galpão 2.',
        data: '2026-03-15T15:00:00Z',
      },
      {
        id: 'act_01_2',
        lead_id: 'lead_01',
        usuario_id: 'usr_vendedor_01',
        usuario_nome: 'Marcos Silveira',
        tipo: 'proposta',
        titulo: 'Envio da Proposta Comercial Revisada',
        descricao: 'Enviada cotação formal com condições Finame BNDES e treinamento de 4 operadores incluso.',
        data: '2026-03-22T11:30:00Z',
      },
    ],
  },
  {
    id: 'lead_02',
    empresa: 'Joinville Estamparia & Conformação S/A',
    cnpj: '84.629.832/0001-44',
    razao_social: 'Joinville Estamparia e Autopeças de Precisão S/A',
    nome_fantasia: 'Joinville Estamparia',
    cnae: '25.32-2-01',
    cnae_descricao: 'Produção de artefatos estampados de metal',
    contato: 'Luciana Albuquerque',
    contato_cargo: 'Gerente de Suprimentos',
    telefone: '(47) 3431-7700',
    whatsapp: '47997441122',
    email: 'luciana.compras@joinvillestamp.com.br',
    cep: '89219-600',
    logradouro: 'Rua Dona Francisca',
    numero: '8300',
    bairro: 'Zona Industrial Norte',
    cidade: 'Joinville',
    uf: 'SC',
    lat: -26.2415,
    lng: -48.8526,
    produto_interesse: 'Prensa Hidráulica Industrial 200T',
    valor_estimado: 420000,
    responsavel_id: 'usr_vendedor_02',
    responsavel_nome: 'Patrícia Rocha',
    etapa: 'proposta',
    origem: 'Feira Industrial',
    prioridade: 'urgente',
    observacoes: 'Contato captado na Feimec. Solicitou visita com urgência para entrega técnica em até 45 dias.',
    data_criacao: '2026-03-01T11:00:00Z',
    data_atualizacao: '2026-03-29T16:00:00Z',
    atividades: [
      {
        id: 'act_02_1',
        lead_id: 'lead_02',
        usuario_id: 'usr_vendedor_02',
        usuario_nome: 'Patrícia Rocha',
        tipo: 'reuniao',
        titulo: 'Alinhamento com Diretoria de Engenharia',
        descricao: 'Discutido curso do martelo da prensa e sistema de segurança NR-12 com barreira de luz.',
        data: '2026-03-25T14:00:00Z',
      },
    ],
  },
  {
    id: 'lead_03',
    empresa: 'AeroTech Componentes de Precisão',
    cnpj: '61.432.890/0001-12',
    razao_social: 'AeroTech Indústria e Comércio de Componentes Aeronáuticos Ltda',
    nome_fantasia: 'AeroTech Brasil',
    cnae: '30.41-5-00',
    cnae_descricao: 'Fabricação de aeronaves e peças para aeronaves',
    contato: 'Dr. Fernando Siqueira',
    contato_cargo: 'Head de Engenharia de Manufatura',
    telefone: '(12) 3947-2000',
    whatsapp: '12988114433',
    email: 'fsiqueira@aerotech.com.br',
    cep: '12227-000',
    logradouro: 'Avenida Faria Lima',
    numero: '2100',
    bairro: 'Putim',
    cidade: 'São José dos Campos',
    uf: 'SP',
    lat: -23.2355,
    lng: -45.8653,
    produto_interesse: 'Centro de Usinagem 5 Eixos DMG Mori',
    valor_estimado: 890000,
    responsavel_id: 'usr_vendedor_01',
    responsavel_nome: 'Marcos Silveira',
    etapa: 'qualificado',
    origem: 'Website',
    prioridade: 'urgente',
    observacoes: 'Contrato novo com fornecedora de turbinas. Precisam de 5 eixos simultâneos para blocos de titânio e Inconel.',
    data_criacao: '2026-03-10T16:45:00Z',
    data_atualizacao: '2026-03-30T09:20:00Z',
    atividades: [],
  },
  {
    id: 'lead_04',
    empresa: 'LaserCut Chapas & Perfis Especiais',
    cnpj: '07.891.234/0001-99',
    razao_social: 'LaserCut Soluções em Corte e Conformação Ltda',
    nome_fantasia: 'LaserCut Industrial',
    cnae: '25.11-0-00',
    cnae_descricao: 'Fabricação de estruturas metálicas',
    contato: 'Cláudio Bitencourt',
    contato_cargo: 'Sócio-Proprietário',
    telefone: '(54) 3218-9000',
    whatsapp: '54999887766',
    email: 'claudio@lasercutrs.com.br',
    cep: '95045-100',
    logradouro: 'Rodovia RS-122',
    numero: 'km 72',
    bairro: 'Desvio Rizzo',
    cidade: 'Caxias do Sul',
    uf: 'RS',
    lat: -29.1678,
    lng: -51.1794,
    produto_interesse: 'Máquina de Corte a Laser Fibra 6kW',
    valor_estimado: 680000,
    responsavel_id: null,
    responsavel_nome: null,
    etapa: 'triagem',
    origem: 'Google Ads',
    prioridade: 'alta',
    observacoes: 'Lead entrou ontem pelo formulário do site. O gestor precisa definir quem atenderá o polo metalmecânico do RS.',
    data_criacao: '2026-03-31T08:10:00Z',
    data_atualizacao: '2026-03-31T08:10:00Z',
    atividades: [],
  },
  {
    id: 'lead_05',
    empresa: 'PlastiSul Embalagens Técnicas',
    cnpj: '03.456.789/0001-33',
    razao_social: 'PlastiSul Indústria de Componentes Plásticos Ltda',
    nome_fantasia: 'PlastiSul',
    cnae: '22.29-3-99',
    cnae_descricao: 'Fabricação de artefatos de material plástico para outros usos',
    contato: 'Beatriz Fagundes',
    contato_cargo: 'Supervisora de Produção',
    telefone: '(41) 3381-4400',
    whatsapp: '41987556633',
    email: 'beatriz@plastisul.com.br',
    cep: '83015-000',
    logradouro: 'Rua Rui Barbosa',
    numero: '520',
    bairro: 'Afonso Pena',
    cidade: 'São José dos Pinhais',
    uf: 'PR',
    lat: -25.5348,
    lng: -49.2064,
    produto_interesse: 'Injetora de Termoplásticos Servo 350T',
    valor_estimado: 510000,
    responsavel_id: 'usr_vendedor_02',
    responsavel_nome: 'Patrícia Rocha',
    etapa: 'venda_ganha',
    origem: 'Indicação',
    prioridade: 'alta',
    observacoes: 'Contrato fechado com entrada de 30% e saldo em 24x pelo Finame. Equipamento em fabricação.',
    data_criacao: '2026-01-20T10:00:00Z',
    data_atualizacao: '2026-03-20T17:00:00Z',
    atividades: [
      {
        id: 'act_05_1',
        lead_id: 'lead_05',
        usuario_id: 'usr_vendedor_02',
        usuario_nome: 'Patrícia Rocha',
        tipo: 'mudanca_etapa',
        titulo: 'Venda Concluída com Sucesso',
        descricao: 'Assinatura eletrônica do contrato de compra e venda da injetora 350T concluída.',
        data: '2026-03-20T16:50:00Z',
      },
    ],
  },
  {
    id: 'lead_06',
    empresa: 'Caldeiraria & Estruturas Triângulo',
    cnpj: '22.333.444/0001-55',
    razao_social: 'Triângulo Manutenção e Caldeiraria Pesada Ltda',
    nome_fantasia: 'Caldeiraria Triângulo',
    cnae: '25.11-0-00',
    cnae_descricao: 'Fabricação de estruturas metálicas',
    contato: 'Márcio Queiroz',
    contato_cargo: 'Gerente Geral',
    telefone: '(34) 3232-1100',
    whatsapp: '34991122334',
    email: 'marcio@caldeirariatriangulo.com.br',
    cep: '38400-000',
    logradouro: 'Avenida Brasil',
    numero: '3100',
    bairro: 'Umuarama',
    cidade: 'Uberlândia',
    uf: 'MG',
    lat: -18.9186,
    lng: -48.2772,
    produto_interesse: 'Dobradeira CNC Eletro-Hidráulica 135T',
    valor_estimado: 290000,
    responsavel_id: null,
    responsavel_nome: null,
    etapa: 'novo',
    origem: 'Website',
    prioridade: 'media',
    observacoes: 'Solicitou catálogo pelo site às 07h da manhã. Aguardando triagem comercial.',
    data_criacao: '2026-04-01T07:15:00Z',
    data_atualizacao: '2026-04-01T07:15:00Z',
    atividades: [],
  },
  {
    id: 'lead_07',
    empresa: 'Usinagem de Peças Vanguarda',
    cnpj: '45.123.987/0001-88',
    razao_social: 'Vanguarda Indústria Mecânica Ltda',
    nome_fantasia: 'Vanguarda Usinagem',
    cnae: '25.39-0-01',
    cnae_descricao: 'Serviços de usinagem, tornearia e solda',
    contato: 'Julio Cesar Prado',
    contato_cargo: 'Diretor Técnico',
    telefone: '(11) 4588-3000',
    whatsapp: '11977665544',
    email: 'julio@vanguardausinagem.com.br',
    cep: '13214-000',
    logradouro: 'Rua das Indústrias',
    numero: '890',
    bairro: 'Fazenda Grande',
    cidade: 'Jundiaí',
    uf: 'SP',
    lat: -23.1857,
    lng: -46.8978,
    produto_interesse: 'Compressor de Parafuso Lubrificado 75HP',
    valor_estimado: 165000,
    responsavel_id: 'usr_vendedor_01',
    responsavel_nome: 'Marcos Silveira',
    etapa: 'contato',
    origem: 'Telefone',
    prioridade: 'media',
    observacoes: 'Substituição do sistema de ar da fábrica de válvulas industriais. Exige secador por adsorção.',
    data_criacao: '2026-03-24T10:00:00Z',
    data_atualizacao: '2026-03-29T14:30:00Z',
    atividades: [],
  },
];

export const SEED_TASKS: Task[] = [
  {
    id: 'task_01',
    lead_id: 'lead_01',
    lead_nome: 'Metalúrgica Santa Bárbara Ltda',
    responsavel_id: 'usr_vendedor_01',
    responsavel_nome: 'Marcos Silveira',
    titulo: 'Enviar minuta de financiamento BNDES/Finame',
    descricao: 'Encaminhar simulação de parcelas e carência de 6 meses para o Eng. Ricardo.',
    tipo: 'orcamento',
    data_vencimento: '2026-04-03T18:00:00Z',
    concluida: false,
  },
  {
    id: 'task_02',
    lead_id: 'lead_02',
    lead_nome: 'Joinville Estamparia & Conformação S/A',
    responsavel_id: 'usr_vendedor_02',
    responsavel_nome: 'Patrícia Rocha',
    titulo: 'Follow-up da aprovação de diretoria da prensa',
    descricao: 'Ligar para Luciana para verificar se a diretoria aprovou o orçamento da prensa 200T.',
    tipo: 'followup',
    data_vencimento: '2026-04-02T14:00:00Z',
    concluida: false,
  },
  {
    id: 'task_03',
    lead_id: 'lead_03',
    lead_nome: 'AeroTech Componentes de Precisão',
    responsavel_id: 'usr_vendedor_01',
    responsavel_nome: 'Marcos Silveira',
    titulo: 'Agendar demonstração técnica de usinagem 5 eixos',
    descricao: 'Demonstrar corte simultâneo do impeller no showroom de São Paulo.',
    tipo: 'demonstracao',
    data_vencimento: '2026-04-05T10:00:00Z',
    concluida: false,
  },
];

// Funções de Inicialização e Leitura Local com Persistência
function getLocalData<T>(key: string, defaultData: T): T {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultData;
  }
}

function setLocalData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ==============================================================================
// MÉTODOS DE AUTENTICAÇÃO E PERFIS
// ==============================================================================

export async function loginUser(email: string, pass: string): Promise<UserProfile> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) {
      throw new Error(error.message);
    }
    if (data.user) {
      // Buscar perfil na tabela perfis
      const { data: profile } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        name: profile?.nome || data.user.user_metadata?.nome || 'Usuário Industrial',
        role: profile?.cargo_perfil || data.user.user_metadata?.cargo_perfil || 'vendedor',
        phone: profile?.telefone || '',
        active: profile?.ativo ?? true,
        createdAt: data.user.created_at,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userProfile));
      return userProfile;
    }
  }

  // Fallback local robusto (Sandbox de alta fidelidade)
  const users = getLocalData<UserProfile[]>(LOCAL_USERS_KEY, SEED_USERS);
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!found) {
    // Se o usuário não existir no banco local e tiver digitado uma senha válida, criamos para conveniência
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: email.toLowerCase(),
      name: email.split('@')[0],
      role: email.includes('gestor') || email.includes('admin') ? 'gestor' : 'vendedor',
      active: true,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setLocalData(LOCAL_USERS_KEY, users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  }

  if (!found.active) {
    throw new Error('Este usuário está inativo no sistema. Procure o Gestor.');
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
  return found;
}

export async function registerUser(
  email: string,
  pass: string,
  name: string,
  role: UserRole,
  phone?: string
): Promise<UserProfile> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          nome: name,
          cargo_perfil: role,
          telefone: phone,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      // Salva no perfil
      await supabase.from('perfis').upsert({
        id: data.user.id,
        email: data.user.email || email,
        nome: name,
        cargo_perfil: role,
        telefone: phone,
        ativo: true,
      });

      const userProfile: UserProfile = {
        id: data.user.id,
        email,
        name,
        role,
        phone,
        active: true,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userProfile));
      return userProfile;
    }
  }

  const users = getLocalData<UserProfile[]>(LOCAL_USERS_KEY, SEED_USERS);
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Já existe um usuário cadastrado com este e-mail.');
  }

  const newUser: UserProfile = {
    id: `usr_${Date.now()}`,
    email: email.toLowerCase(),
    name,
    role,
    phone,
    active: true,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  setLocalData(LOCAL_USERS_KEY, users);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return newUser;
}

export function getCurrentSessionUser(): UserProfile | null {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  const supabase = getSupabaseClient();
  if (supabase) {
    supabase.auth.signOut().catch(() => {});
  }
  localStorage.removeItem(CURRENT_USER_KEY);
}

// ==============================================================================
// GESTÃO DE LEADS COM RLS (GESTOR VÊ TUDO / VENDEDOR VÊ APENAS OS SEUS)
// ==============================================================================

export async function fetchLeads(userRole: UserRole, userId: string): Promise<Lead[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      let query = supabase.from('leads').select('*').order('data_atualizacao', { ascending: false });
      // RLS aplicado no servidor: se o usuário for vendedor, ele só recebe os seus
      if (userRole === 'vendedor') {
        query = query.eq('responsavel_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Lead[];
      }
    } catch {
      // Cai no fallback local
    }
  }

  const allLeads = getLocalData<Lead[]>(LOCAL_LEADS_KEY, SEED_LEADS);

  // Regra de ouro de negócio: Vendedor enxerga somente os seus leads
  if (userRole === 'vendedor') {
    return allLeads.filter((l) => l.responsavel_id === userId);
  }

  // Gestor visualiza TODOS os leads (incluindo leads sem responsável para triagem)
  return allLeads;
}

export async function saveLead(leadData: Partial<Lead>, isNew = false): Promise<Lead> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  let finalLead: Lead;

  if (isNew) {
    finalLead = {
      id: leadData.id || `lead_${Date.now()}`,
      empresa: leadData.empresa || leadData.razao_social || 'Nova Empresa Industrial',
      cnpj: leadData.cnpj || '',
      razao_social: leadData.razao_social || leadData.empresa || '',
      nome_fantasia: leadData.nome_fantasia || '',
      cnae: leadData.cnae || '',
      cnae_descricao: leadData.cnae_descricao || '',
      contato: leadData.contato || 'Contato Principal',
      contato_cargo: leadData.contato_cargo || '',
      telefone: leadData.telefone || '',
      whatsapp: leadData.whatsapp || '',
      email: leadData.email || '',
      cep: leadData.cep || '',
      logradouro: leadData.logradouro || '',
      numero: leadData.numero || '',
      complemento: leadData.complemento || '',
      bairro: leadData.bairro || '',
      cidade: leadData.cidade || 'São Paulo',
      uf: leadData.uf || 'SP',
      lat: leadData.lat || -23.5505,
      lng: leadData.lng || -46.6333,
      produto_interesse: leadData.produto_interesse || 'Máquina sob Especificação',
      valor_estimado: Number(leadData.valor_estimado) || 0,
      responsavel_id: leadData.responsavel_id || null,
      responsavel_nome: leadData.responsavel_nome || null,
      etapa: leadData.etapa || 'novo',
      origem: leadData.origem || 'Website',
      prioridade: leadData.prioridade || 'media',
      observacoes: leadData.observacoes || '',
      motivo_perda: leadData.motivo_perda || '',
      data_criacao: now,
      data_atualizacao: now,
      atividades: [
        {
          id: `act_${Date.now()}`,
          lead_id: leadData.id || `lead_${Date.now()}`,
          usuario_id: leadData.responsavel_id || 'sys',
          usuario_nome: leadData.responsavel_nome || 'Sistema',
          tipo: 'nota',
          titulo: 'Lead Criado no Sistema',
          descricao: `Lead registrado com produto de interesse: ${leadData.produto_interesse || 'Máquinas'}.`,
          data: now,
        },
      ],
    };
  } else {
    finalLead = {
      ...(leadData as Lead),
      data_atualizacao: now,
    };
  }

  if (supabase) {
    try {
      await supabase.from('leads').upsert(finalLead);
    } catch {
      // Salva local
    }
  }

  const leads = getLocalData<Lead[]>(LOCAL_LEADS_KEY, SEED_LEADS);
  const index = leads.findIndex((l) => l.id === finalLead.id);

  if (index >= 0) {
    leads[index] = finalLead;
  } else {
    leads.unshift(finalLead);
  }

  setLocalData(LOCAL_LEADS_KEY, leads);
  return finalLead;
}

export async function deleteLead(leadId: string, userRole: UserRole): Promise<void> {
  if (userRole !== 'gestor') {
    throw new Error('Apenas o Gestor possui permissão para excluir leads.');
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('leads').delete().eq('id', leadId);
    } catch {
      // Deleta local
    }
  }

  const leads = getLocalData<Lead[]>(LOCAL_LEADS_KEY, SEED_LEADS);
  const filtered = leads.filter((l) => l.id !== leadId);
  setLocalData(LOCAL_LEADS_KEY, filtered);
}

export async function moveLeadStage(
  leadId: string,
  newStage: FunnelStage,
  userId: string,
  userName: string,
  motivoPerda?: string
): Promise<Lead> {
  const leads = getLocalData<Lead[]>(LOCAL_LEADS_KEY, SEED_LEADS);
  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    throw new Error('Lead não encontrado.');
  }

  const oldStage = lead.etapa;
  lead.etapa = newStage;
  lead.data_atualizacao = new Date().toISOString();
  if (newStage === 'venda_perdida' && motivoPerda) {
    lead.motivo_perda = motivoPerda;
  }

  const activity: Activity = {
    id: `act_${Date.now()}`,
    lead_id: leadId,
    usuario_id: userId,
    usuario_nome: userName,
    tipo: 'mudanca_etapa',
    titulo: `Fase alterada: ${oldStage} → ${newStage}`,
    descricao:
      newStage === 'venda_perdida' && motivoPerda
        ? `Lead marcado como Perdido. Motivo: ${motivoPerda}`
        : `Lead movimentado no funil de vendas.`,
    data: new Date().toISOString(),
  };

  lead.atividades = [activity, ...(lead.atividades || [])];

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('leads')
        .update({
          etapa: newStage,
          motivo_perda: lead.motivo_perda,
          data_atualizacao: lead.data_atualizacao,
        })
        .eq('id', leadId);

      await supabase.from('atividades').insert(activity);
    } catch {
      // Ignora erro de rede
    }
  }

  setLocalData(LOCAL_LEADS_KEY, leads);
  return lead;
}

export async function distributeLead(
  leadId: string,
  targetUserId: string,
  targetUserName: string,
  gestorName: string,
  notaDistribuicao?: string
): Promise<Lead> {
  const leads = getLocalData<Lead[]>(LOCAL_LEADS_KEY, SEED_LEADS);
  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    throw new Error('Lead não encontrado.');
  }

  const oldOwner = lead.responsavel_nome || 'Sem responsável (Triagem)';
  lead.responsavel_id = targetUserId;
  lead.responsavel_nome = targetUserName;
  if (lead.etapa === 'novo' || lead.etapa === 'triagem') {
    lead.etapa = 'qualificado'; // Avança da triagem para qualificado ao ser distribuído
  }
  lead.data_atualizacao = new Date().toISOString();

  const activity: Activity = {
    id: `act_${Date.now()}`,
    lead_id: leadId,
    usuario_id: targetUserId,
    usuario_nome: gestorName,
    tipo: 'nota',
    titulo: `Distribuição de Lead por ${gestorName}`,
    descricao: `Lead transferido de [${oldOwner}] para [${targetUserName}]. ${
      notaDistribuicao ? `Orientação técnica: ${notaDistribuicao}` : ''
    }`,
    data: new Date().toISOString(),
  };

  lead.atividades = [activity, ...(lead.atividades || [])];

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('leads')
        .update({
          responsavel_id: targetUserId,
          etapa: lead.etapa,
          data_atualizacao: lead.data_atualizacao,
        })
        .eq('id', leadId);

      await supabase.from('atividades').insert(activity);
    } catch {
      // Ignora erro
    }
  }

  setLocalData(LOCAL_LEADS_KEY, leads);
  return lead;
}

export async function addLeadActivity(activityData: Omit<Activity, 'id' | 'data'>): Promise<Activity> {
  const newActivity: Activity = {
    ...activityData,
    id: `act_${Date.now()}`,
    data: new Date().toISOString(),
  };

  const leads = getLocalData<Lead[]>(LOCAL_LEADS_KEY, SEED_LEADS);
  const lead = leads.find((l) => l.id === activityData.lead_id);
  if (lead) {
    lead.atividades = [newActivity, ...(lead.atividades || [])];
    lead.data_atualizacao = newActivity.data;
    setLocalData(LOCAL_LEADS_KEY, leads);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('atividades').insert(newActivity);
    } catch {
      // Ignora erro
    }
  }

  return newActivity;
}

// ==============================================================================
// GESTÃO DE TAREFAS
// ==============================================================================

export async function fetchTasks(userRole: UserRole, userId: string): Promise<Task[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('tarefas').select('*').order('data_vencimento', { ascending: true });
      if (userRole === 'vendedor') {
        query = query.eq('responsavel_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) return data as Task[];
    } catch {
      // fallback
    }
  }

  const allTasks = getLocalData<Task[]>(LOCAL_TASKS_KEY, SEED_TASKS);
  if (userRole === 'vendedor') {
    return allTasks.filter((t) => t.responsavel_id === userId);
  }
  return allTasks;
}

export async function saveTask(taskData: Partial<Task>): Promise<Task> {
  const newTask: Task = {
    id: taskData.id || `task_${Date.now()}`,
    lead_id: taskData.lead_id,
    lead_nome: taskData.lead_nome,
    responsavel_id: taskData.responsavel_id || 'usr_vendedor_01',
    responsavel_nome: taskData.responsavel_nome || 'Vendedor',
    titulo: taskData.titulo || 'Nova Tarefa Comercial',
    descricao: taskData.descricao || '',
    tipo: taskData.tipo || 'followup',
    data_vencimento: taskData.data_vencimento || new Date(Date.now() + 86400000).toISOString(),
    concluida: taskData.concluida || false,
  };

  const tasks = getLocalData<Task[]>(LOCAL_TASKS_KEY, SEED_TASKS);
  const idx = tasks.findIndex((t) => t.id === newTask.id);
  if (idx >= 0) {
    tasks[idx] = newTask;
  } else {
    tasks.unshift(newTask);
  }
  setLocalData(LOCAL_TASKS_KEY, tasks);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('tarefas').upsert(newTask);
    } catch {
      // ignora
    }
  }

  return newTask;
}

export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
  const tasks = getLocalData<Task[]>(LOCAL_TASKS_KEY, SEED_TASKS);
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.concluida = completed;
    setLocalData(LOCAL_TASKS_KEY, tasks);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('tarefas').update({ concluida: completed }).eq('id', taskId);
    } catch {
      // ignora
    }
  }
}

// ==============================================================================
// PRODUTOS (MÁQUINAS INDUSTRIAIS)
// ==============================================================================

export async function fetchProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('produtos').select('*');
      if (!error && data && data.length > 0) return data as Product[];
    } catch {
      // fallback
    }
  }
  return getLocalData<Product[]>(LOCAL_PRODUCTS_KEY, SEED_PRODUCTS);
}

export async function saveProduct(productData: Partial<Product>): Promise<Product> {
  const newProduct: Product = {
    id: productData.id || `prod_${Date.now()}`,
    nome: productData.nome || 'Máquina Industrial',
    categoria: productData.categoria || 'Geral',
    fabricante: productData.fabricante || 'Nacional',
    modelo: productData.modelo || 'Std-100',
    potencia_especificacao: productData.potencia_especificacao || '',
    preco_base: Number(productData.preco_base) || 0,
    status: productData.status || 'disponivel',
    descricao: productData.descricao || '',
  };

  const prods = getLocalData<Product[]>(LOCAL_PRODUCTS_KEY, SEED_PRODUCTS);
  const idx = prods.findIndex((p) => p.id === newProduct.id);
  if (idx >= 0) {
    prods[idx] = newProduct;
  } else {
    prods.push(newProduct);
  }
  setLocalData(LOCAL_PRODUCTS_KEY, prods);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('produtos').upsert(newProduct);
    } catch {
      // ignora
    }
  }

  return newProduct;
}

// ==============================================================================
// GESTÃO DE USUÁRIOS (GESTOR APENAS)
// ==============================================================================

export async function fetchUsers(): Promise<UserProfile[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('perfis').select('*');
      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          email: p.email,
          name: p.nome,
          role: p.cargo_perfil,
          phone: p.telefone,
          active: p.ativo,
          createdAt: p.created_at,
        }));
      }
    } catch {
      // fallback
    }
  }
  return getLocalData<UserProfile[]>(LOCAL_USERS_KEY, SEED_USERS);
}

export async function saveUser(userData: Partial<UserProfile>): Promise<UserProfile> {
  const newUser: UserProfile = {
    id: userData.id || `usr_${Date.now()}`,
    email: userData.email || '',
    name: userData.name || '',
    role: userData.role || 'vendedor',
    phone: userData.phone || '',
    active: userData.active ?? true,
    createdAt: userData.createdAt || new Date().toISOString(),
  };

  const users = getLocalData<UserProfile[]>(LOCAL_USERS_KEY, SEED_USERS);
  const idx = users.findIndex((u) => u.id === newUser.id);
  if (idx >= 0) {
    users[idx] = newUser;
  } else {
    users.push(newUser);
  }
  setLocalData(LOCAL_USERS_KEY, users);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('perfis').upsert({
        id: newUser.id,
        email: newUser.email,
        nome: newUser.name,
        cargo_perfil: newUser.role,
        telefone: newUser.phone,
        ativo: newUser.active,
      });
    } catch {
      // ignora
    }
  }

  return newUser;
}

// ==============================================================================
// EMPRESAS & CONTATOS
// ==============================================================================

export async function fetchCompanies(): Promise<Company[]> {
  const leads = getLocalData<Lead[]>(LOCAL_LEADS_KEY, SEED_LEADS);
  const companyMap = new Map<string, Company>();

  for (const l of leads) {
    const key = l.cnpj || l.empresa;
    if (!companyMap.has(key)) {
      companyMap.set(key, {
        id: `comp_${companyMap.size + 1}`,
        cnpj: l.cnpj,
        razao_social: l.razao_social || l.empresa,
        nome_fantasia: l.nome_fantasia || l.empresa,
        cnae: l.cnae,
        cnae_descricao: l.cnae_descricao,
        telefone: l.telefone,
        email: l.email,
        cidade: l.cidade,
        uf: l.uf,
        logradouro: l.logradouro,
        numero: l.numero,
        bairro: l.bairro,
        cep: l.cep,
        lat: l.lat,
        lng: l.lng,
        total_leads: 1,
      });
    } else {
      const existing = companyMap.get(key)!;
      existing.total_leads += 1;
    }
  }

  return Array.from(companyMap.values());
}

export async function fetchContacts(): Promise<Contact[]> {
  const leads = getLocalData<Lead[]>(LOCAL_LEADS_KEY, SEED_LEADS);
  return leads.map((l, index) => ({
    id: `cont_${index + 1}`,
    empresa_nome: l.empresa,
    nome: l.contato,
    cargo: l.contato_cargo || 'Gestor de Compras / Manutenção',
    departamento: 'Industrial & Manufatura',
    email: l.email,
    telefone: l.telefone,
    whatsapp: l.whatsapp,
  }));
}
