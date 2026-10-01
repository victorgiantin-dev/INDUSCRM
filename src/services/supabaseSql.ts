export const SUPABASE_SETUP_SQL = `-- ==============================================================================
-- IndusCRM - SCHEMA LIMPO E COMPLETO PARA SUPABASE (POSTGRESQL)
-- Executa com DROP CASCADE para substituir tabelas antigas/conflitantes
-- ==============================================================================

-- 0. Remover tabelas anteriores para evitar conflitos de colunas antigas
DROP TABLE IF EXISTS public.tarefas CASCADE;
DROP TABLE IF EXISTS public.atividades CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.contatos CASCADE;
DROP TABLE IF EXISTS public.empresas CASCADE;
DROP TABLE IF EXISTS public.perfis CASCADE;

-- 1. Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar ENUMS com checagem de existência
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('gestor', 'vendedor');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'funnel_stage') THEN
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
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_priority') THEN
    CREATE TYPE lead_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('disponivel', 'sob_encomenda', 'indisponivel');
  END IF;
END $$;

-- 3. TABELA DE PERFIS DE USUÁRIOS (vinculada ao auth.users)
CREATE TABLE public.perfis (
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
CREATE TABLE public.empresas (
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
CREATE TABLE public.contatos (
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
CREATE TABLE public.produtos (
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
CREATE TABLE public.leads (
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
  cidade TEXT NOT NULL,
  uf TEXT NOT NULL,
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
CREATE TABLE public.atividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TABELA DE TAREFAS
CREATE TABLE public.tarefas (
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

-- Políticas de Acesso
CREATE POLICY "Leitura de perfis para autenticados"
  ON public.perfis FOR SELECT TO authenticated USING (true);

CREATE POLICY "Gestores gerenciam todos os perfis"
  ON public.perfis FOR ALL TO authenticated USING (public.is_gestor() OR auth.uid() = id);

CREATE POLICY "Gestor tem acesso total a leads"
  ON public.leads FOR ALL TO authenticated USING (public.is_gestor());

CREATE POLICY "Vendedor visualiza apenas seus leads"
  ON public.leads FOR SELECT TO authenticated USING (responsavel_id = auth.uid());

CREATE POLICY "Vendedor atualiza apenas seus leads"
  ON public.leads FOR UPDATE TO authenticated USING (responsavel_id = auth.uid()) WITH CHECK (responsavel_id = auth.uid());

CREATE POLICY "Gestor acessa todas atividades"
  ON public.atividades FOR ALL TO authenticated USING (public.is_gestor());

CREATE POLICY "Vendedor acessa atividades dos seus leads"
  ON public.atividades FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.leads WHERE leads.id = atividades.lead_id AND leads.responsavel_id = auth.uid())
  );

CREATE POLICY "Vendedor registra atividades nos seus leads"
  ON public.atividades FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Gestor acessa todas tarefas"
  ON public.tarefas FOR ALL TO authenticated USING (public.is_gestor());

CREATE POLICY "Vendedor gerencia apenas suas tarefas"
  ON public.tarefas FOR ALL TO authenticated USING (responsavel_id = auth.uid());

CREATE POLICY "Todos autenticados visualizam produtos e empresas"
  ON public.produtos FOR SELECT TO authenticated USING (true);

CREATE POLICY "Gestores gerenciam produtos"
  ON public.produtos FOR ALL TO authenticated USING (public.is_gestor());

CREATE POLICY "Todos autenticados visualizam empresas"
  ON public.empresas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Todos autenticados criam/editam empresas"
  ON public.empresas FOR ALL TO authenticated USING (true);

CREATE POLICY "Todos autenticados visualizam contatos"
  ON public.contatos FOR ALL TO authenticated USING (true);

-- 11. Trigger de Perfil Automático no Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis (id, email, nome, cargo_perfil)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'cargo_perfil')::user_role, 'vendedor')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome = COALESCE(EXCLUDED.nome, public.perfis.nome);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 12. Produtos Iniciais de Máquinas Industriais
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

-- ==============================================================================
-- 13. CONFIGURAÇÃO DE STORAGE (ARMAZENAMENTO DE ARQUIVOS) DO SUPABASE
-- Criação dos Buckets e Políticas de Segurança (RLS em storage.objects)
-- ==============================================================================

-- Criação dos buckets com verificação de conflito
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'documentos',
    'documentos',
    false,
    52428800, -- 50MB
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png']
  ),
  (
    'produtos',
    'produtos',
    true,
    20971520, -- 20MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'avatares',
    'avatares',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de Armazenamento para storage.objects
-- Remover políticas antigas para evitar duplicidade
DROP POLICY IF EXISTS "Leitura pública de imagens de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Leitura pública de avatares" ON storage.objects;
DROP POLICY IF EXISTS "Leitura de documentos autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Upload de documentos comerciais por autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Upload de imagens de produtos por gestores" ON storage.objects;
DROP POLICY IF EXISTS "Upload de avatar do proprio usuario" ON storage.objects;
DROP POLICY IF EXISTS "Atualização e exclusao de documentos por gestores" ON storage.objects;
DROP POLICY IF EXISTS "Atualização e exclusao pelo proprietario do arquivo" ON storage.objects;

-- 1. LEITURA PÚBLICA DE PRODUTOS E AVATARES
CREATE POLICY "Leitura pública de imagens de produtos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'produtos');

CREATE POLICY "Leitura pública de avatares"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatares');

-- 2. LEITURA DE DOCUMENTOS E PROPOSTAS COMERCIAIS (APENAS AUTENTICADOS)
CREATE POLICY "Leitura de documentos autenticados"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documentos');

-- 3. UPLOAD DE DOCUMENTOS / PROPOSTAS POR USUÁRIOS AUTENTICADOS (GESTORES E VENDEDORES)
CREATE POLICY "Upload de documentos comerciais por autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documentos');

-- 4. UPLOAD DE FOTOS DE MÁQUINAS (PRODUTOS) POR GESTORES
CREATE POLICY "Upload de imagens de produtos por gestores"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'produtos' AND (
      public.is_gestor() OR auth.role() = 'authenticated'
    )
  );

-- 5. UPLOAD DE AVATAR PELO PRÓPRIO USUÁRIO OU GESTOR
CREATE POLICY "Upload de avatar do proprio usuario"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatares');

-- 6. ATUALIZAÇÃO E EXCLUSÃO POR GESTOR OU DONO DO ARQUIVO
CREATE POLICY "Atualização e exclusao de documentos por gestores"
  ON storage.objects FOR ALL
  TO authenticated
  USING (public.is_gestor());

CREATE POLICY "Atualização e exclusao pelo proprietario do arquivo"
  ON storage.objects FOR ALL
  TO authenticated
  USING ((owner)::text = (auth.uid())::text);

`;
