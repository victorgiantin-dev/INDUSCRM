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
  CheckCircle2,
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
  const [selectedLead, setSelectedLead] = useState<Lead | null>(leads[0] || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedState, setSelectedState] = useState('all');

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

  return (
    <div className="space-y-4">
      {/* Top Banner Context */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            <span>Geolocalização Industrial & Rotas (Pólos Fabris)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Localização das fábricas e clientes industriais com cálculo de rota direta e coordenadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-48">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar fábrica ou cidade..."
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
        </div>
      </div>

      {/* Main Map + Sidebar Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left Column: Leads List for rapid selection */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-full order-2 lg:order-1">
          <div className="p-3 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Plantas Mapeadas ({filteredLeads.length})
            </span>
            <span className="text-[11px] text-neutral-400">Selecione para focar</span>
          </div>

          <div className="p-2.5 space-y-2 overflow-y-auto flex-1">
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
                    onClick={() => setSelectedLead(lead)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neutral-800/90 border-sky-500 shadow-sm'
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

                    <div className="text-[10px] text-neutral-500 font-mono mt-1">
                      Coord: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Industrial Spatial Visualizer */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-full relative order-1 lg:order-2">
          <div className="w-full h-full bg-neutral-950 flex flex-col justify-between p-4 relative overflow-hidden">
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Header overlay */}
            <div className="relative z-10 flex items-center justify-between bg-neutral-900/90 border border-neutral-800 p-3 rounded-lg backdrop-blur-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-white">
                  Malha Industrial: SP, SC, RS, MG, PR
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                {filteredLeads.length} fábricas e metalúrgicas catalogadas
              </div>
            </div>

            {/* Pins spatial grid layout */}
            <div className="relative z-10 flex-1 flex items-center justify-center my-4 overflow-y-auto">
              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id;
                  const stage = FUNNEL_STAGES_CONFIG.find((s) => s.id === lead.etapa);
                  const coords = getLeadCoords(lead);

                  return (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-sky-950/80 border-sky-400 shadow-lg ring-1 ring-sky-400'
                          : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: stage?.color }}
                        />
                        <span className="truncate">{lead.empresa}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate mt-1">
                        {lead.cidade} - {lead.uf}
                      </div>
                      <div className="text-[11px] text-sky-300 font-mono font-semibold tabular-nums mt-1">
                        {formatBRL(lead.valor_estimado)}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-1">
                        {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom info banner */}
            <div className="relative z-10 bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-lg text-center text-xs text-neutral-400 flex items-center justify-between">
              <span>Localização aproximada por município e endereço da Receita Federal (BrasilAPI).</span>
              <span className="text-neutral-500 font-mono">Sistema WGS84</span>
            </div>
          </div>

          {/* Floating Selected Lead Plant Drawer Card */}
          {selectedLead && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-neutral-900/95 border border-neutral-700 p-4 rounded-xl shadow-2xl backdrop-blur-md z-20 text-neutral-100">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider block">
                    Planta Industrial Selecionada
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{selectedLead.empresa}</h4>
                  <p className="text-xs text-neutral-400">
                    {[selectedLead.logradouro, selectedLead.numero, selectedLead.cidade, selectedLead.uf]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-white tabular-nums bg-neutral-800 px-2 py-1 rounded">
                  {formatBRL(selectedLead.valor_estimado)}
                </span>
              </div>

              <div className="my-3 p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg">
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
                  Ver Lead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
