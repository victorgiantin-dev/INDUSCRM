export const SUPABASE_SETUP_SQL = `-- ==============================================================================
-- IndusCRM - SCHEMA COMPLETO PARA SUPABASE (POSTGRESQL)
-- Especializado para Empresa de Máquinas e Equipamentos Industriais
-- ==============================================================================

-- 1. Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('gestor', 'vendedor');
CREATE TYPE funnel_stage AS ENUM (
  'novo',
  'triagem',
  'qualificado',
  'contato',
  'negociacao',
  'proposta',
  'venda_ganha',
  'venda_perdida'
);
CREATE TYPE lead_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
CREATE TYPE product_status AS ENUM ('disponivel', 'sob_encomenda', 'indisponivel');

-- 3. TABELA DE PERFIS DE USUÁRIOS (vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  cargo_perfil user_role NOT NULL DEFAULT 'vendedor',
  telefone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABELA DE EMPRESAS (Clientes Industriais / CNPJs)
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cnpj TEXT NOT NULL UNIQUE,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnae TEXT,
  cnae_descricao TEXT,
  telefone TEXT,
  email TEXT,
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT NOT NULL,
  uf TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABELA DE CONTATOS (Diretoria, Manutenção, Engenharia, Compras)
CREATE TABLE IF NOT EXISTS public.contatos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cargo TEXT,
  departamento TEXT,
  email TEXT,
  telefone TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABELA DE PRODUTOS / MÁQUINAS INDUSTRIAIS
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  modelo TEXT NOT NULL,
  potencia_especificacao TEXT,
  preco_base NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  status product_status NOT NULL DEFAULT 'disponivel',
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABELA DE LEADS
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  empresa_nome TEXT NOT NULL,
  cnpj TEXT,
  razao_social TEXT,
  nome_fantasia TEXT,
  cnae TEXT,
  cnae_descricao TEXT,
  contato_nome TEXT NOT NULL,
  contato_cargo TEXT,
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  uf TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  produto_interesse TEXT NOT NULL,
  valor_estimado NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  responsavel_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
  etapa funnel_stage NOT NULL DEFAULT 'novo',
  origem TEXT NOT NULL DEFAULT 'Website',
  prioridade lead_priority NOT NULL DEFAULT 'media',
  observacoes TEXT,
  motivo_perda TEXT,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TABELA DE ATIVIDADES E HISTÓRICO
CREATE TABLE IF NOT EXISTS public.atividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'ligacao', 'whatsapp', 'reuniao', 'visita_tecnica', 'proposta', 'mudanca_etapa', 'nota'
  titulo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TABELA DE TAREFAS
CREATE TABLE IF NOT EXISTS public.tarefas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  responsavel_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'followup',
  data_vencimento TIMESTAMPTZ NOT NULL,
  concluida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) - CONTROLE DE ACESSO
-- ==============================================================================

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para checar se o usuário logado é Gestor
CREATE OR REPLACE FUNCTION public.is_gestor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = auth.uid() AND cargo_perfil = 'gestor' AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- POLÍTICAS PARA PERFIS ---
-- Qualquer usuário autenticado pode ler os perfis ativos (para visualização de equipe/responsáveis)
CREATE POLICY "Leitura de perfis para autenticados"
  ON public.perfis FOR SELECT
  TO authenticated
  USING (true);

-- Apenas Gestores podem criar, atualizar e desativar perfis de outros usuários
CREATE POLICY "Gestores gerenciam todos os perfis"
  ON public.perfis FOR ALL
  TO authenticated
  USING (public.is_gestor() OR auth.uid() = id);

-- --- POLÍTICAS PARA LEADS ---
-- Gestor: Acesso TOTAL (Criar, visualizar, editar, transferir e deletar todos os leads)
CREATE POLICY "Gestor tem acesso total a leads"
  ON public.leads FOR ALL
  TO authenticated
  USING (public.is_gestor());

-- Vendedor: Pode visualizar apenas os leads em que é o responsável
CREATE POLICY "Vendedor visualiza apenas seus leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (responsavel_id = auth.uid());

-- Vendedor: Pode atualizar apenas os seus próprios leads (mudar etapa, observações)
CREATE POLICY "Vendedor atualiza apenas seus leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (responsavel_id = auth.uid())
  WITH CHECK (responsavel_id = auth.uid());

-- --- POLÍTICAS PARA ATIVIDADES ---
CREATE POLICY "Gestor acessa todas atividades"
  ON public.atividades FOR ALL
  TO authenticated
  USING (public.is_gestor());

CREATE POLICY "Vendedor acessa atividades dos seus leads"
  ON public.atividades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = atividades.lead_id AND leads.responsavel_id = auth.uid()
    )
  );

CREATE POLICY "Vendedor registra atividades nos seus leads"
  ON public.atividades FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- --- POLÍTICAS PARA TAREFAS ---
CREATE POLICY "Gestor acessa todas tarefas"
  ON public.tarefas FOR ALL
  TO authenticated
  USING (public.is_gestor());

CREATE POLICY "Vendedor gerencia apenas suas tarefas"
  ON public.tarefas FOR ALL
  TO authenticated
  USING (responsavel_id = auth.uid());

-- --- POLÍTICAS PARA PRODUTOS E EMPRESAS ---
CREATE POLICY "Todos autenticados visualizam produtos e empresas"
  ON public.produtos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gestores gerenciam produtos"
  ON public.produtos FOR ALL
  TO authenticated
  USING (public.is_gestor());

CREATE POLICY "Todos autenticados visualizam empresas"
  ON public.empresas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Todos autenticados criam/editam empresas"
  ON public.empresas FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Todos autenticados visualizam contatos"
  ON public.contatos FOR ALL
  TO authenticated
  USING (true);

-- ==============================================================================
-- 11. TRIGGER PARA CRIAR PERFIL AUTOMÁTICO NO SIGN UP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis (id, email, nome, cargo_perfil)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'cargo_perfil')::user_role, 'vendedor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 12. DADOS INICIAIS (SEED) DE MÁQUINAS INDUSTRIAIS
-- ==============================================================================
INSERT INTO public.produtos (nome, categoria, fabricante, modelo, potencia_especificacao, preco_base, status, descricao)
VALUES
  ('Torno CNC de Alta Precisão', 'Usinagem', 'Romi / Haas', 'Centur 30D / ST-20', 'Barramento inclinado, 4500 RPM, passagem 65mm', 345000.00, 'disponivel', 'Torno CNC robusto para usinagem pesada de eixos e flanges.'),
  ('Centro de Usinagem 5 Eixos', 'Usinagem', 'DMG Mori / Mazak', 'DMU 50 3rd Gen', 'Spindle 15.000 RPM, mesa basculante diam. 630mm', 890000.00, 'disponivel', 'Centro de usinagem simultâneo 5 eixos para peças complexas aeroespaciais e automotivas.'),
  ('Prensa Hidráulica 200 Toneladas', 'Conformação', 'Schuler / Gutmann', 'PH-200T Auto', 'Curso 600mm, mesa 1200x1000mm, CLP Siemens', 420000.00, 'disponivel', 'Prensa hidráulica com duplo efeito para repuxo profundo e estampagem industrial.'),
  ('Máquina de Corte a Laser Fibra 6kW', 'Corte e Solda', 'Bystronic / Bodor', 'Fiber 6000W C-Series', 'Mesa de troca 3000x1500mm, corte inox até 25mm', 680000.00, 'disponivel', 'Sistema laser de fibra óptica com cabeçote autofocus e resfriamento chiller industrial.'),
  ('Dobradeira CNC Eletro-Hidráulica', 'Conformação', 'Newton / Amada', 'HAP 135/30', 'Capacidade 135T, comprimento 3200mm, 4 eixos CNC', 290000.00, 'disponivel', 'Dobradeira industrial de alta repetibilidade com compensação de deformação.'),
  ('Injetora de Termoplásticos 350T', 'Plásticos', 'Romi / Engel', 'Primax 350-R', 'Entre colunas 710x710mm, volume injeção 1280cm³', 510000.00, 'sob_encomenda', 'Injetora servo-motorizada de alta eficiência energética para ciclo rápido.'),
  ('Compressor de Ar Parafuso 75HP', 'Utilidades Industriais', 'Atlas Copco / Chicago', 'GA-55 VSD+', 'Vazão 385 PCM, inversor de frequência integrado', 165000.00, 'disponivel', 'Compressor industrial silencioso com secador integrado para alimentação contínua de fábrica.')
ON CONFLICT DO NOTHING;
`;
