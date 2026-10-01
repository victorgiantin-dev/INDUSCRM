export type UserRole = 'gestor' | 'vendedor';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export type FunnelStage =
  | 'novo'
  | 'triagem'
  | 'qualificado'
  | 'contato'
  | 'negociacao'
  | 'proposta'
  | 'venda_ganha'
  | 'venda_perdida';

export const FUNNEL_STAGES_CONFIG: {
  id: FunnelStage;
  label: string;
  color: string;
  bgLight: string;
  borderLight: string;
  description: string;
}[] = [
  {
    id: 'novo',
    label: 'Novo',
    color: '#3b82f6', // blue
    bgLight: '#eff6ff',
    borderLight: '#bfdbfe',
    description: 'Lead recém-chegado aguardando primeiro contato ou triagem',
  },
  {
    id: 'triagem',
    label: 'Triagem',
    color: '#8b5cf6', // purple
    bgLight: '#f5f3ff',
    borderLight: '#ddd6fe',
    description: 'Gestor analisando fit técnico e definindo vendedor responsável',
  },
  {
    id: 'qualificado',
    label: 'Qualificado',
    color: '#06b6d4', // cyan
    bgLight: '#ecfeff',
    borderLight: '#a5f3fc',
    description: 'Empresa possui orçamento, necessidade real e perfil de compra',
  },
  {
    id: 'contato',
    label: 'Contato',
    color: '#f59e0b', // amber
    bgLight: '#fffbeb',
    borderLight: '#fde68a',
    description: 'Vendedor em diálogo com engenharia/compras do cliente',
  },
  {
    id: 'negociacao',
    label: 'Negociação',
    color: '#ea580c', // orange
    bgLight: '#fff7ed',
    borderLight: '#fed7aa',
    description: 'Alinhamento de prazos de entrega, frete técnico e forma de pagamento',
  },
  {
    id: 'proposta',
    label: 'Proposta',
    color: '#2563eb', // royal blue
    bgLight: '#eff6ff',
    borderLight: '#bfdbfe',
    description: 'Proposta técnica e comercial formal enviada ao decisor',
  },
  {
    id: 'venda_ganha',
    label: 'Venda Ganha',
    color: '#10b981', // emerald
    bgLight: '#ecfdf5',
    borderLight: '#a7f3d0',
    description: 'Contrato assinado e pedido de máquina emitido',
  },
  {
    id: 'venda_perdida',
    label: 'Venda Perdida',
    color: '#ef4444', // red
    bgLight: '#fef2f2',
    borderLight: '#fecaca',
    description: 'Oportunidade perdida por preço, prazo ou desistência do projeto',
  },
];

export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';

export type LeadSource =
  | 'Website'
  | 'Google Ads'
  | 'Indicação'
  | 'Feira Industrial'
  | 'Prospecção Ativa'
  | 'Telefone'
  | 'Outro';

export interface Activity {
  id: string;
  lead_id: string;
  usuario_id: string;
  usuario_nome: string;
  tipo: 'ligacao' | 'whatsapp' | 'reuniao' | 'visita_tecnica' | 'proposta' | 'mudanca_etapa' | 'nota';
  titulo: string;
  descricao: string;
  data: string;
}

export interface Lead {
  id: string;
  empresa: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae: string;
  cnae_descricao: string;
  contato: string;
  contato_cargo?: string;
  telefone: string;
  whatsapp: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  lat?: number;
  lng?: number;
  produto_interesse: string;
  valor_estimado: number;
  responsavel_id?: string | null;
  responsavel_nome?: string | null;
  etapa: FunnelStage;
  origem: LeadSource;
  prioridade: Priority;
  observacoes: string;
  motivo_perda?: string;
  data_criacao: string;
  data_atualizacao: string;
  atividades?: Activity[];
}

export interface Task {
  id: string;
  lead_id?: string;
  lead_nome?: string;
  responsavel_id: string;
  responsavel_nome: string;
  titulo: string;
  descricao: string;
  tipo: 'ligacao' | 'visita' | 'orcamento' | 'followup' | 'demonstracao';
  data_vencimento: string;
  concluida: boolean;
}

export interface Product {
  id: string;
  nome: string;
  categoria: string;
  fabricante: string;
  modelo: string;
  potencia_especificacao: string;
  preco_base: number;
  descricao: string;
  status: 'disponivel' | 'sob_encomenda' | 'indisponivel';
}

export interface Company {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cnae: string;
  cnae_descricao: string;
  telefone: string;
  email: string;
  cidade: string;
  uf: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  lat?: number;
  lng?: number;
  total_leads: number;
}

export interface Contact {
  id: string;
  empresa_id?: string;
  empresa_nome: string;
  nome: string;
  cargo: string;
  departamento: string;
  email: string;
  telefone: string;
  whatsapp: string;
}
