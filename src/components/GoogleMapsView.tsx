import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building,
  Navigation,
  Phone,
  MessageCircle,
  ExternalLink,
  Layers,
  Wrench,
  Search,
  Filter,
  DollarSign,
  Compass,
  Maximize2,
  Eye,
  Radar,
  Sliders,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  CircleDot,
  Radio,
  MapPinned,
} from 'lucide-react';
import { Lead, UserProfile, FUNNEL_STAGES_CONFIG } from '../types/crm';
import { formatCnpj } from '../services/brasilApi';

interface GoogleMapsViewProps {
  user: UserProfile;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenNewLeadModal: () => void;
}

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  user,
  leads,
  onSelectLead,
  onOpenNewLeadModal,
}) => {
  const isGestor = user.role === 'gestor';

  // Sub-abas na coluna esquerda (Apenas Gestor vê a aba de Raio por CNAE)
  const [activeLeftTab, setActiveLeftTab] = useState<'leads' | 'radius_cnae'>('leads');

  const [selectedLead, setSelectedLead] = useState<Lead | null>(leads[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = roadmap, 'k' = satélite
  const [zoomLevel, setZoomLevel] = useState<number>(14);

  // Estados da Pesquisa de Raio por CNAE (Exclusivo Gestor e Independente dos leads cadastrados)
  const [radiusKm, setRadiusKm] = useState<number>(35); // Caixa de digitação numérica de raio
  const [typedCnae, setTypedCnae] = useState<string>('25.39-0-01'); // Área onde o gestor digita o CNAE livremente
  const [targetLocation, setTargetLocation] = useState<string>('Joinville - SC'); // Cidade e/ou Bairro para varredura
  const [showVisualRadiusCircle, setShowVisualRadiusCircle] = useState<boolean>(true); // Mostrar raio visualmente no mapa

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Coordenadas aproximadas para cidades brasileiras industriais
  const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    'santa bárbara d\'oeste': { lat: -22.7561, lng: -47.4144 },
    'joinville': { lat: -26.2415, lng: -48.8526 },
    'são josé dos campos': { lat: -23.2355, lng: -45.8653 },
    'caxias do sul': { lat: -29.1678, lng: -51.1794 },
    'são josé dos pinhais': { lat: -25.5348, lng: -49.2064 },
    'uberlândia': { lat: -18.9186, lng: -48.2772 },
    'jundiaí': { lat: -23.1857, lng: -46.8978 },
    'campinas': { lat: -22.9099, lng: -47.0626 },
    'sorocaba': { lat: -23.5015, lng: -47.4526 },
    'piracicaba': { lat: -22.7253, lng: -47.6492 },
    'são paulo': { lat: -23.5505, lng: -46.6333 },
    'curitiba': { lat: -25.4297, lng: -49.2719 },
    'porto alegre': { lat: -30.0346, lng: -51.2177 },
    'belo horizonte': { lat: -19.9167, lng: -43.9345 },
  };

  const getLeadCoords = (lead: Lead): { lat: number; lng: number } => {
    if (lead.lat && lead.lng) return { lat: lead.lat, lng: lead.lng };
    const cityKey = lead.cidade.toLowerCase().trim();
    if (CITY_COORDS[cityKey]) return CITY_COORDS[cityKey];
    const hash = (lead.empresa.length * 37) % 100;
    return {
      lat: -23.5 + (hash / 100) * 1.5,
      lng: -46.6 - (hash / 100) * 1.5,
    };
  };

  // Sugestões de CNAEs industriais comuns para máquinas
  const COMMON_CNAES = [
    { code: '25.39-0-01', desc: 'Usinagem, Tornearia e Solda' },
    { code: '25.32-2-01', desc: 'Estamparia e Conformação' },
    { code: '28.29-1-00', desc: 'Máquinas e Equipamentos' },
    { code: '25.11-0-00', desc: 'Estruturas Metálicas e Caldeiraria' },
    { code: '22.29-3-99', desc: 'Injeção de Plásticos e Moldes' },
    { code: '30.41-5-00', desc: 'Peças Aeroespaciais e Defesa' },
  ];

  // Sugestões rápidas de cidades e pólos industriais
  const COMMON_LOCATIONS = [
    'Joinville - SC',
    'Campinas - SP',
    'Caxias do Sul - RS',
    'Distrito Industrial Piracicaba',
    'São José dos Campos - SP',
    'Grande ABC - SP',
    'S. J. dos Pinhais - PR',
    'Uberlândia - MG',
  ];

  // Cálculo da área de cobertura do raio
  const radiusAreaKm2 = Math.round(Math.PI * Math.pow(radiusKm, 2));

  // Filtro padrão dos leads já cadastrados no CRM
  const uniqueStates = Array.from(new Set(leads.map((l) => l.uf).filter(Boolean)));
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.produto_interesse.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || l.etapa === stageFilter;
    const matchesState = selectedState === 'all' || l.uf === selectedState;
    return matchesSearch && matchesStage && matchesState;
  });

  useEffect(() => {
    if (!selectedLead && filteredLeads.length > 0) {
      setSelectedLead(filteredLeads[0]);
    }
  }, [filteredLeads, selectedLead]);

  // URL interativa do Google Maps
  const getGoogleMapsEmbedUrl = () => {
    if (activeLeftTab === 'radius_cnae' && isGestor) {
      // Prospecção aberta de mercado: Busca no Google Maps pelo CNAE + Cidade e/ou Bairro
      const locationPart = targetLocation.trim() || 'Brasil';
      const cnaePart = typedCnae.trim() ? `${typedCnae} empresas industrias fabricas` : 'polos industriais fabricas';
      const targetQuery = encodeURIComponent(`${cnaePart} ${locationPart}`);
      const dynamicZoom = radiusKm <= 15 ? 13 : radiusKm <= 40 ? 11 : radiusKm <= 90 ? 10 : 8;
      return `https://maps.google.com/maps?q=${targetQuery}&t=${mapType}&z=${dynamicZoom}&ie=UTF8&iwloc=&output=embed`;
    }

    if (!selectedLead) {
      return `https://maps.google.com/maps?q=-23.5505,-46.6333&t=${mapType}&z=11&ie=UTF8&iwloc=&output=embed`;
    }

    const queryParts = [
      selectedLead.empresa,
      selectedLead.logradouro,
      selectedLead.numero,
      selectedLead.cidade,
      selectedLead.uf,
      'Brasil',
    ].filter(Boolean);

    const query = encodeURIComponent(queryParts.join(', '));
    return `https://maps.google.com/maps?q=${query}&t=${mapType}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Context */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <span>Mapa Interativo do Google Maps (Localização & Expansão)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {activeLeftTab === 'radius_cnae' && isGestor
              ? 'Módulo de Prospecção Territorial de Mercado: filtre por CNAE, cidade/bairro e raio geográfico.'
              : 'Navegue pelo Google Maps diretamente no painel. Selecione uma indústria à esquerda para centralizar a fábrica.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Alternar Mapa / Satélite */}
          <div className="flex items-center p-1 bg-neutral-950 border border-neutral-800 rounded-lg">
            <button
              onClick={() => setMapType('m')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                mapType === 'm'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => setMapType('k')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                mapType === 'k'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Satélite 3D
            </button>
          </div>

          {activeLeftTab === 'leads' && (
            <>
              {/* Search */}
              <div className="relative flex-1 md:w-48">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar fábrica cadastrada..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* UF Filter */}
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-sky-500"
              >
                <option value="all">Todos Estados</option>
                {uniqueStates.map((uf) => (
                  <option key={uf} value={uf}>
                    Estado: {uf}
                  </option>
                ))}
              </select>

              {/* Stage filter */}
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-sky-500"
              >
                <option value="all">Todas Etapas</option>
                {FUNNEL_STAGES_CONFIG.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </>
          )}

          {activeLeftTab === 'radius_cnae' && isGestor && (
            <button
              onClick={() => setShowVisualRadiusCircle(!showVisualRadiusCircle)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showVisualRadiusCircle
                  ? 'bg-purple-950 border-purple-500 text-purple-300'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>{showVisualRadiusCircle ? 'Raio Visual: Ativo' : 'Raio Visual: Oculto'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map + Sidebar Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[560px]">
        {/* Left Column: Tabbed Navigation (Plantas Cadastradas vs Radar de Prospecção por Raio & CNAE) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-full order-2 lg:order-1">
          {/* Sub-Tabs: Exclusiva para Gestor */}
          <div className="p-2 bg-neutral-950/80 border-b border-neutral-800 flex items-center gap-1.5">
            <button
              onClick={() => setActiveLeftTab('leads')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeLeftTab === 'leads'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Plantas ({filteredLeads.length})</span>
            </button>

            {isGestor && (
              <button
                onClick={() => setActiveLeftTab('radius_cnae')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  activeLeftTab === 'radius_cnae'
                    ? 'bg-purple-900/60 border border-purple-700/60 text-purple-200 shadow-xs'
                    : 'text-purple-400 hover:text-purple-300 hover:bg-neutral-900'
                }`}
              >
                <Radar className="w-3.5 h-3.5 text-purple-400" />
                <span>Raio por CNAE</span>
              </button>
            )}
          </div>

          {/* TAB 1: LISTA PADRÃO DE LEADS CADASTRADOS */}
          {activeLeftTab === 'leads' && (
            <div className="p-2.5 space-y-2 overflow-y-auto flex-1">
              <div className="text-[11px] text-neutral-400 px-1 pb-1">
                Clientes e indústrias cadastradas no CRM:
              </div>
              {filteredLeads.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  Nenhuma empresa encontrada com os filtros atuais.
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id;
                  const stageConfig = FUNNEL_STAGES_CONFIG.find((s) => s.id === lead.etapa);
                  const coords = getLeadCoords(lead);

                  return (
                    <div
                      key={lead.id}
                      onClick={() => {
                        setSelectedLead(lead);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-neutral-800/90 border-sky-500 shadow-sm ring-1 ring-sky-500'
                          : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-white truncate mr-2">{lead.empresa}</span>
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: stageConfig?.color }}
                        />
                      </div>

                      <div className="text-[11px] text-sky-400 font-medium truncate mb-1">
                        {lead.produto_interesse}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                          {lead.cidade} - {lead.uf}
                        </span>
                        <span className="font-mono font-semibold text-neutral-200 tabular-nums">
                          {formatBRL(lead.valor_estimado)}
                        </span>
                      </div>

                      {lead.cnae && (
                        <div className="text-[10px] text-neutral-500 font-mono mt-1 truncate">
                          CNAE: {lead.cnae} ({lead.cnae_descricao || 'Industrial'})
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: PROSPECÇÃO DE MERCADO POR RAIO & CNAE (EXCLUSIVO GESTOR, NÃO LINCADO COM LEADS CADASTRADOS) */}
          {activeLeftTab === 'radius_cnae' && isGestor && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              {/* Badge Informativo de Mercado */}
              <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/60">
                <div className="flex items-center gap-2 text-purple-300 font-semibold text-[11px]">
                  <Radar className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Prospecção Aberta de Mercado</span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Varredura territorial no Google Maps sem restringir aos clientes já cadastrados.
                </p>
              </div>

              {/* 1. Área para DIGITAR O CNAE LIVREMENTE */}
              <div className="space-y-1.5">
                <label className="block text-neutral-200 font-semibold text-[11px]">
                  Digite o CNAE ou Ramo Industrial:
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={typedCnae}
                    onChange={(e) => setTypedCnae(e.target.value)}
                    placeholder="Ex: 25.39-0-01, 28.29, Usinagem, Estamparia..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Chips com sugestões rápidas de CNAE */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {COMMON_CNAES.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setTypedCnae(item.code)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        typedCnae === item.code
                          ? 'bg-purple-900 border-purple-500 text-purple-200'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }`}
                    >
                      {item.code} ({item.desc.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Opção de BUSCAR POR CIDADE E/OU BAIRRO */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-neutral-200 font-semibold text-[11px] flex items-center gap-1.5">
                    <MapPinned className="w-3.5 h-3.5 text-purple-400" />
                    <span>Buscar por Cidade e/ou Bairro:</span>
                  </label>
                  {targetLocation && (
                    <button
                      type="button"
                      onClick={() => setTargetLocation('')}
                      className="text-[10px] text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={targetLocation}
                    onChange={(e) => setTargetLocation(e.target.value)}
                    placeholder="Ex: Joinville, Distrito Industrial Campinas, Mooca SP, Caxias do Sul..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Chips com sugestões rápidas de Cidades / Pólos */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {COMMON_LOCATIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setTargetLocation(loc)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        targetLocation === loc
                          ? 'bg-purple-900 border-purple-500 text-purple-200'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Seletor de Raio com CAIXA DE DIGITAÇÃO NUMÉRICA */}
              <div className="space-y-1.5 p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-200 font-semibold text-[11px]">
                    Raio de Alcance Territorial:
                  </label>
                  <span className="text-[10px] text-neutral-400">Área: ~{radiusAreaKm2.toLocaleString('pt-BR')} km²</span>
                </div>

                {/* Caixa de Digitação Numérica */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={radiusKm || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setRadiusKm(val >= 0 ? val : 1);
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-purple-300 font-bold font-mono focus:outline-none focus:border-purple-500"
                      placeholder="Digite o raio em km..."
                    />
                    <span className="absolute right-3 top-2 text-xs text-neutral-400 font-mono">km</span>
                  </div>

                  {/* Botões rápidos de ajuste */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setRadiusKm((r) => Math.max(1, r - 10))}
                      className="px-2 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-mono font-bold text-neutral-300"
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      onClick={() => setRadiusKm((r) => r + 10)}
                      className="px-2 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-mono font-bold text-neutral-300"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Slider e Pills de Raio */}
                <input
                  type="range"
                  min="5"
                  max="250"
                  step="5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full accent-purple-500 h-1 bg-neutral-800 rounded-lg cursor-pointer mt-1"
                />

                <div className="flex justify-between gap-1 mt-1">
                  {[10, 25, 50, 100, 200].map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setRadiusKm(km)}
                      className={`text-[10px] font-mono py-0.5 px-1.5 rounded transition-colors ${
                        radiusKm === km
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-neutral-900 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {km}km
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Ações de Prospecção Territorial */}
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Raio Definido:</span>
                  <span className="font-mono text-purple-300 font-bold">{radiusKm} km</span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  CNAE: <strong className="text-white">{typedCnae || 'Todos os setores'}</strong>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Localização:{' '}
                  <strong className="text-purple-300">{targetLocation.trim() || 'Brasil (Nacional)'}</strong>
                </div>

                <div className="pt-2 flex flex-col gap-1.5">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${typedCnae} industrias fabricas empresas ${targetLocation.trim() || 'Brasil'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver Empresas no Google Maps Externo</span>
                  </a>

                  <button
                    type="button"
                    onClick={onOpenNewLeadModal}
                    className="w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
                    <span>Cadastrar Novo Lead Descoberto</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real Interactive Google Maps Viewport com RAIO VISUAL no mapa */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-full relative order-1 lg:order-2">
          {/* Top Bar inside Map Canvas */}
          <div className="p-2.5 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs truncate mr-2">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="font-semibold text-white truncate">
                {activeLeftTab === 'radius_cnae' && isGestor
                  ? `Raio Visual de ${radiusKm}km · CNAE: ${typedCnae || 'Geral'}${
                      targetLocation ? ` · Região: ${targetLocation}` : ''
                    }`
                  : selectedLead
                  ? `${selectedLead.empresa} — ${selectedLead.cidade}/${selectedLead.uf}`
                  : 'Nenhum lead selecionado'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 1, 19))}
                title="Aproximar Zoom"
                className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center font-bold text-xs"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 1, 8))}
                title="Afastar Zoom"
                className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center font-bold text-xs"
              >
                -
              </button>
              {selectedLead && activeLeftTab === 'leads' && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${selectedLead.empresa}, ${selectedLead.logradouro || ''} ${selectedLead.numero || ''}, ${
                      selectedLead.cidade
                    } - ${selectedLead.uf}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded font-medium flex items-center gap-1 transition-colors"
                >
                  <Maximize2 className="w-3 h-3 text-sky-400" />
                  <span className="hidden sm:inline">Tela Cheia</span>
                </a>
              )}
            </div>
          </div>

          {/* Interactive Google Maps Frame + VISUAL RADIUS OVERLAY */}
          <div className="flex-1 w-full h-full relative bg-neutral-950 overflow-hidden">
            <iframe
              key={`${activeLeftTab}-${radiusKm}-${typedCnae}-${targetLocation}-${selectedLead?.id || 'default'}-${mapType}-${zoomLevel}`}
              title="Google Maps Interativo"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'brightness(0.92) contrast(1.05)' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={getGoogleMapsEmbedUrl()}
            />

            {/* VISUAL RADIUS CIRCLE & RADAR OVERLAY (Exibição Visual do Raio) */}
            {activeLeftTab === 'radius_cnae' && isGestor && showVisualRadiusCircle && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                {/* SVG Visual Radius Ring com marcas de distância */}
                <div className="relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 md:w-[460px] md:h-[460px] animate-pulse">
                  {/* Outer Radius Boundary Circle */}
                  <div className="absolute inset-0 rounded-full border-2 border-purple-400/80 bg-purple-500/10 shadow-[0_0_50px_rgba(168,85,247,0.3)] backdrop-blur-[0.5px]" />

                  {/* Concentric Guide Rings */}
                  <div className="absolute inset-8 sm:inset-10 rounded-full border border-dashed border-purple-400/40" />
                  <div className="absolute inset-16 sm:inset-20 rounded-full border border-purple-400/30" />
                  <div className="absolute inset-28 sm:inset-32 rounded-full border border-dashed border-purple-400/20" />

                  {/* Center Radar Crosshair */}
                  <div className="absolute w-8 h-8 rounded-full bg-purple-500/30 border border-purple-300 flex items-center justify-center shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <div className="w-2 h-2 rounded-full bg-purple-400 absolute" />
                  </div>

                  {/* Axis Crosslines */}
                  <div className="absolute w-full h-[1px] bg-purple-400/20 pointer-events-none" />
                  <div className="absolute h-full w-[1px] bg-purple-400/20 pointer-events-none" />

                  {/* Radius Distance Floating Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-950/95 border border-purple-400 text-purple-200 px-3 py-1 rounded-full text-[11px] font-mono font-bold shadow-xl flex items-center gap-1.5 whitespace-nowrap">
                    <Radio className="w-3.5 h-3.5 text-purple-300 animate-spin" />
                    <span>Raio: {radiusKm} km</span>
                  </div>

                  {/* Location floating pin info if specified */}
                  {targetLocation && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-neutral-900/95 border border-purple-500/60 text-purple-200 px-3 py-1 rounded-full text-[10px] font-semibold shadow-xl flex items-center gap-1.5 whitespace-nowrap">
                      <MapPin className="w-3 h-3 text-purple-400" />
                      <span>Região: {targetLocation}</span>
                    </div>
                  )}
                </div>

                {/* Radar Floating Info HUD on Map Bottom-Right */}
                <div className="absolute bottom-4 right-4 bg-neutral-900/90 border border-purple-800/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-neutral-100 max-w-xs pointer-events-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                      Radar Territorial de Mercado
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-300 space-y-0.5">
                    <div>
                      CNAE em Varredura:{' '}
                      <strong className="text-purple-300">{typedCnae || 'Todos os setores'}</strong>
                    </div>
                    <div>
                      Cidade / Bairro:{' '}
                      <strong className="text-white">{targetLocation.trim() || 'Brasil (Nacional)'}</strong>
                    </div>
                    <div>
                      Raio Geográfico:{' '}
                      <strong className="text-white font-mono">{radiusKm} km</strong> (~{radiusAreaKm2.toLocaleString('pt-BR')} km²)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating Selected Lead Plant Drawer Card (apenas quando na aba de leads) */}
          {activeLeftTab === 'leads' && selectedLead && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-neutral-900/95 border border-neutral-700 p-4 rounded-xl shadow-2xl backdrop-blur-md z-20 text-neutral-100">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block">
                    Fábrica em Foco no Google Maps
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{selectedLead.empresa}</h4>
                  <p className="text-xs text-neutral-400">
                    {[selectedLead.logradouro, selectedLead.numero, selectedLead.cidade, selectedLead.uf]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-white tabular-nums bg-neutral-800 px-2 py-1 rounded shrink-0 ml-2">
                  {formatBRL(selectedLead.valor_estimado)}
                </span>
              </div>

              <div className="my-2.5 p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg">
                <div className="text-[10px] text-neutral-400">Máquina em Negociação:</div>
                <div className="text-xs font-semibold text-neutral-200 mt-0.5 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-sky-400" />
                  <span>{selectedLead.produto_interesse}</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Contato: <strong className="text-neutral-300">{selectedLead.contato}</strong> (
                  {selectedLead.telefone})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${selectedLead.empresa}, ${selectedLead.logradouro || ''}, ${selectedLead.cidade} - ${
                      selectedLead.uf
                    }`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Traçar Rota no Google Maps</span>
                </a>
                <button
                  onClick={() => onSelectLead(selectedLead)}
                  className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-lg text-xs transition-colors"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
