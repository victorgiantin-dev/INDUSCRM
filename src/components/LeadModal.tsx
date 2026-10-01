import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Building,
  CheckCircle,
  AlertCircle,
  Save,
  Trash2,
  MapPin,
  DollarSign,
  User,
  Wrench,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Lead, UserProfile, Product, FunnelStage, Priority, LeadSource, FUNNEL_STAGES_CONFIG } from '../types/crm';
import { consultarBrasilApiCnpj, formatCnpj, cleanCnpj } from '../services/brasilApi';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLead: (leadData: Partial<Lead>, isNew: boolean) => void;
  onDeleteLead?: (leadId: string) => void;
  leadToEdit?: Lead | null;
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  availableProducts: Product[];
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSaveLead,
  onDeleteLead,
  leadToEdit,
  currentUser,
  availableUsers,
  availableProducts,
}) => {
  const isGestor = currentUser.role === 'gestor';
  const isNew = !leadToEdit;

  // Form states
  const [cnpjInput, setCnpjInput] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnae, setCnae] = useState('');
  const [cnaeDescricao, setCnaeDescricao] = useState('');
  const [contato, setContato] = useState('');
  const [contatoCargo, setContatoCargo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [produtoInteresse, setProdutoInteresse] = useState('');
  const [valorEstimado, setValorEstimado] = useState<number>(0);
  const [responsavelId, setResponsavelId] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<FunnelStage>('novo');
  const [origem, setOrigem] = useState<LeadSource>('Website');
  const [prioridade, setPrioridade] = useState<Priority>('media');
  const [observacoes, setObservacoes] = useState('');

  // BrasilAPI state
  const [searchingCnpj, setSearchingCnpj] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (leadToEdit) {
      setCnpjInput(leadToEdit.cnpj ? formatCnpj(leadToEdit.cnpj) : '');
      setEmpresa(leadToEdit.empresa || '');
      setRazaoSocial(leadToEdit.razao_social || '');
      setNomeFantasia(leadToEdit.nome_fantasia || '');
      setCnae(leadToEdit.cnae || '');
      setCnaeDescricao(leadToEdit.cnae_descricao || '');
      setContato(leadToEdit.contato || '');
      setContatoCargo(leadToEdit.contato_cargo || '');
      setTelefone(leadToEdit.telefone || '');
      setWhatsapp(leadToEdit.whatsapp || '');
      setEmail(leadToEdit.email || '');
      setCep(leadToEdit.cep || '');
      setLogradouro(leadToEdit.logradouro || '');
      setNumero(leadToEdit.numero || '');
      setComplemento(leadToEdit.complemento || '');
      setBairro(leadToEdit.bairro || '');
      setCidade(leadToEdit.cidade || '');
      setUf(leadToEdit.uf || '');
      setProdutoInteresse(leadToEdit.produto_interesse || '');
      setValorEstimado(leadToEdit.valor_estimado || 0);
      setResponsavelId(leadToEdit.responsavel_id || null);
      setEtapa(leadToEdit.etapa || 'novo');
      setOrigem(leadToEdit.origem || 'Website');
      setPrioridade(leadToEdit.prioridade || 'media');
      setObservacoes(leadToEdit.observacoes || '');
    } else {
      // Default para novo lead
      setCnpjInput('');
      setEmpresa('');
      setRazaoSocial('');
      setNomeFantasia('');
      setCnae('');
      setCnaeDescricao('');
      setContato('');
      setContatoCargo('');
      setTelefone('');
      setWhatsapp('');
      setEmail('');
      setCep('');
      setLogradouro('');
      setNumero('');
      setComplemento('');
      setBairro('');
      setCidade('');
      setUf('');
      setProdutoInteresse(availableProducts[0]?.nome || 'Torno CNC Romi');
      setValorEstimado(availableProducts[0]?.preco_base || 345000);
      // Se for vendedor criando, ele é o responsável. Se for gestor, fica em triagem (null) ou seleciona vendedor.
      setResponsavelId(isGestor ? null : currentUser.id);
      setEtapa(isGestor ? 'triagem' : 'qualificado');
      setOrigem('Website');
      setPrioridade('media');
      setObservacoes('');
    }
    setApiFeedback(null);
  }, [leadToEdit, isOpen, currentUser, isGestor, availableProducts]);

  if (!isOpen) return null;

  // Consulta automática via BrasilAPI
  const handleConsultarCnpj = async () => {
    if (!cnpjInput.trim()) {
      setApiFeedback({ type: 'error', message: 'Digite o CNPJ para consulta.' });
      return;
    }

    setSearchingCnpj(true);
    setApiFeedback(null);

    const result = await consultarBrasilApiCnpj(cnpjInput);
    setSearchingCnpj(false);

    if (result.success && result.data) {
      const data = result.data;
      setCnpjInput(data.cnpjFormatted);
      setRazaoSocial(data.razaoSocial);
      setNomeFantasia(data.nomeFantasia || data.razaoSocial);
      setEmpresa(data.nomeFantasia || data.razaoSocial);
      setCnae(data.cnae);
      setCnaeDescricao(data.cnaeDescricao);
      setLogradouro(data.logradouro);
      setNumero(data.numero);
      setComplemento(data.complemento);
      setBairro(data.bairro);
      setCidade(data.municipio);
      setUf(data.uf);
      setCep(data.cep);
      if (data.telefone && !telefone) setTelefone(data.telefone);
      if (data.whatsapp && !whatsapp) setWhatsapp(data.whatsapp);
      if (data.email && !email) setEmail(data.email);

      setApiFeedback({
        type: 'success',
        message: `Dados da Receita Federal carregados com sucesso! Situação: ${data.situacao}.`,
      });
    } else {
      setApiFeedback({
        type: 'error',
        message: result.error || 'Erro ao consultar CNPJ na BrasilAPI.',
      });
    }
  };

  const handleSelectProduct = (prodName: string) => {
    setProdutoInteresse(prodName);
    const prod = availableProducts.find((p) => p.nome === prodName);
    if (prod && !leadToEdit) {
      setValorEstimado(prod.preco_base);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresa.trim()) {
      setApiFeedback({ type: 'error', message: 'O nome da empresa é obrigatório.' });
      return;
    }

    const assignedUser = availableUsers.find((u) => u.id === responsavelId);

    const payload: Partial<Lead> = {
      ...(leadToEdit ? { id: leadToEdit.id } : {}),
      empresa: empresa.trim(),
      cnpj: cleanCnpj(cnpjInput),
      razao_social: razaoSocial.trim() || empresa.trim(),
      nome_fantasia: nomeFantasia.trim() || empresa.trim(),
      cnae: cnae.trim(),
      cnae_descricao: cnaeDescricao.trim(),
      contato: contato.trim() || 'Comprador Industrial',
      contato_cargo: contatoCargo.trim(),
      telefone: telefone.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      cep: cep.trim(),
      logradouro: logradouro.trim(),
      numero: numero.trim(),
      complemento: complemento.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim() || 'São Paulo',
      uf: uf.trim() || 'SP',
      produto_interesse: produtoInteresse.trim() || 'Máquinas Industriais',
      valor_estimado: Number(valorEstimado) || 0,
      responsavel_id: responsavelId,
      responsavel_nome: assignedUser ? assignedUser.name : null,
      etapa: etapa,
      origem: origem,
      prioridade: prioridade,
      observacoes: observacoes.trim(),
    };

    onSaveLead(payload, isNew);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-3xl shadow-2xl max-h-[92vh] flex flex-col my-auto text-neutral-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-neutral-900 z-10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-sky-400" />
              <span>{isNew ? 'Cadastrar Novo Lead Industrial' : `Editar Lead: ${empresa}`}</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Preencha os dados técnicos da empresa compradora e do maquinário de interesse.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* SEÇÃO 1: CONSULTA BRASILAPI / CNPJ */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Consulta Automática BrasilAPI (Receita Federal)</span>
              </div>
              <span className="text-[10px] text-neutral-400">Preenchimento Instantâneo</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={cnpjInput}
                  onChange={(e) => setCnpjInput(e.target.value)}
                  placeholder="Informe o CNPJ (ex: 00.000.000/0001-00 ou só números)"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="button"
                onClick={handleConsultarCnpj}
                disabled={searchingCnpj}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {searchingCnpj ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Consultando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Consultar CNPJ</span>
                  </>
                )}
              </button>
            </div>

            {/* Feedback message */}
            {apiFeedback && (
              <div
                className={`p-2.5 rounded-lg flex items-start gap-2 text-[11px] ${
                  apiFeedback.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-200'
                    : 'bg-red-950/60 border border-red-800/80 text-red-200'
                }`}
              >
                {apiFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{apiFeedback.message}</span>
              </div>
            )}
          </div>

          {/* SEÇÃO 2: DADOS DA EMPRESA */}
          <div className="space-y-3">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Dados Cadastrais da Empresa
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Nome Fantasia / Empresa *</label>
                <input
                  type="text"
                  required
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Nome comercial da fábrica ou indústria"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Razão Social</label>
                <input
                  type="text"
                  value={razaoSocial}
                  onChange={(e) => setRazaoSocial(e.target.value)}
                  placeholder="Razão social completa"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">CNAE Fiscal</label>
                <input
                  type="text"
                  value={cnae}
                  onChange={(e) => setCnae(e.target.value)}
                  placeholder="Ex: 25.39-0-01"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-neutral-300 mb-1 font-medium">Atividade Econômica (CNAE)</label>
                <input
                  type="text"
                  value={cnaeDescricao}
                  onChange={(e) => setCnaeDescricao(e.target.value)}
                  placeholder="Ex: Serviços de usinagem, tornearia e solda"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: ENDEREÇO DA PLANTA INDUSTRIAL */}
          <div className="space-y-3">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>Localização da Fábrica / Planta (Para Google Maps)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">CEP</label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-neutral-300 mb-1 font-medium">Logradouro / Avenida</label>
                <input
                  type="text"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  placeholder="Av. das Indústrias"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Número</label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Bairro</label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Distrito Industrial"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-neutral-300 mb-1 font-medium">Cidade / Município *</label>
                <input
                  type="text"
                  required
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: Joinville, Caxias do Sul, Campinas"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">UF (Estado) *</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={uf}
                  onChange={(e) => setUf(e.target.value.toUpperCase())}
                  placeholder="SP"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 uppercase font-mono"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 4: CONTATO PRINCIPAL */}
          <div className="space-y-3">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Contato Comercial / Decisor Técnico
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Nome do Contato *</label>
                <input
                  type="text"
                  required
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  placeholder="Ex: Eng. Roberto Santos"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Cargo / Área</label>
                <input
                  type="text"
                  value={contatoCargo}
                  onChange={(e) => setContatoCargo(e.target.value)}
                  placeholder="Ex: Diretor Industrial, Gerente de Manutenção"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Telefone Fixo</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 3300-4000"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">WhatsApp Comercial</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="11999998888"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">E-mail Corporativo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@empresa.com.br"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 5: MÁQUINA, VALOR E FUNIL */}
          <div className="space-y-3">
            <h3 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-sky-400" />
              <span>Oportunidade & Equipamento Industrial</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Produto / Máquina de Interesse *</label>
                <select
                  value={produtoInteresse}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {availableProducts.map((prod) => (
                    <option key={prod.id} value={prod.nome}>
                      {prod.nome} ({prod.fabricante})
                    </option>
                  ))}
                  <option value="Outro Equipamento Personalizado">Outro Equipamento sob Medida</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Valor Estimado da Venda (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-neutral-400 font-mono">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={valorEstimado}
                    onChange={(e) => setValorEstimado(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Etapa do Funil */}
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Etapa do Funil</label>
                <select
                  value={etapa}
                  onChange={(e) => setEtapa(e.target.value as FunnelStage)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {FUNNEL_STAGES_CONFIG.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsável (Gestor pode mudar/atribuir) */}
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">
                  Responsável {isGestor ? '(Gestor)' : ''}
                </label>
                {isGestor ? (
                  <select
                    value={responsavelId || ''}
                    onChange={(e) => setResponsavelId(e.target.value ? e.target.value : null)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="">Aguardando Triagem (Sem vendedor)</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-400"
                  />
                )}
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Prioridade</label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as Priority)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              {/* Origem */}
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Origem do Lead</label>
                <select
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value as LeadSource)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Website">Website</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Feira Industrial">Feira Industrial</option>
                  <option value="Prospecção Ativa">Prospecção Ativa</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Observações & Requisitos Técnicos</label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Exigências técnicas de voltagem, capacidade de usinagem, prazo de entrega, forma de pagamento (Finame/BNDES), etc."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            {leadToEdit && isGestor && onDeleteLead ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Confirma a exclusão definitiva do lead ${empresa}?`)) {
                    onDeleteLead(leadToEdit.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Lead</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{isNew ? 'Criar Lead' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
