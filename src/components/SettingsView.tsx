import React, { useState } from 'react';
import {
  Settings,
  Database,
  Key,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
} from '../services/supabaseClient';
import { SUPABASE_SETUP_SQL } from '../services/supabaseSql';

export const SettingsView: React.FC = () => {
  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.anonKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Google Maps API key
  const [mapsApiKey, setMapsApiKey] = useState(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('indus_gmp_api_key') || ''
  );
  const [mapsKeySaved, setMapsKeySaved] = useState(false);

  // SQL Copy state
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveMapsKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('indus_gmp_api_key', mapsApiKey.trim());
    setMapsKeySaved(true);
    setTimeout(() => setMapsKeySaved(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
          <span className="text-purple-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Exclusivo para Gestor
          </span>
          <span>·</span>
          <span>Infraestrutura do Sistema</span>
          <span>·</span>
          <span>Supabase PostgreSQL + Google Maps + BrasilAPI</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-sky-400" />
          <span>Configurações & Script SQL Supabase</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Aqui você pode conectar sua instância do Supabase em produção, configurar a chave do Google Maps e copiar o script SQL completo com RLS.
        </p>
      </div>

      {/* Grid: Conexão Supabase & Google Maps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Supabase Configuration */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Conexão com Supabase</span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Informe a URL do seu projeto e a chave anônima (anon public key).
            </p>

            <form onSubmit={handleSaveSupabase} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Anon Key (Public)</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  {currentConfig.isConfigured ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Conectado ao Supabase
                    </span>
                  ) : (
                    <span>Modo Local Sandbox Ativo</span>
                  )}
                </span>

                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                >
                  {saveSuccess ? 'Salvo com Sucesso!' : 'Salvar Conexão'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Card 2: Google Maps Platform Key */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Chave de API Google Maps Platform</span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">
              Usada para geolocalização dos clientes, cálculo de rotas e visualização das plantas fabris.
            </p>

            <form onSubmit={handleSaveMapsKey} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Google Maps API Key</label>
                <input
                  type="text"
                  value={mapsApiKey}
                  onChange={(e) => setMapsApiKey(e.target.value)}
                  placeholder="AIzaSyD..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400">
                A aplicação utiliza a biblioteca oficial <strong className="text-neutral-300">@vis.gl/react-google-maps</strong> com marcadores avançados e rotas industriais.
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                >
                  {mapsKeySaved ? 'Chave Salva!' : 'Salvar Chave Maps'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Seção SQL Supabase Completo (Tabelas, RLS e Triggers) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                Script SQL de Implantação Supabase com RLS
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Execute este script completo no <strong>SQL Editor</strong> do painel Supabase para criar todas as tabelas, tipos, triggers e políticas RLS de Gestor e Vendedor.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shrink-0 border border-neutral-700 shadow-sm"
          >
            {copiedSql ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">SQL Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-400" />
                <span>Copiar SQL Completo</span>
              </>
            )}
          </button>
        </div>

        {/* SQL Code Block */}
        <div className="relative">
          <pre className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-96 leading-relaxed select-all">
            {SUPABASE_SETUP_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
};
