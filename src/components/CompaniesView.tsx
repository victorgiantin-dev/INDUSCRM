import React, { useState } from 'react';
import { Building2, Search, MapPin, Phone, Mail, FileText, ExternalLink } from 'lucide-react';
import { Company } from '../types/crm';
import { formatCnpj } from '../services/brasilApi';

interface CompaniesViewProps {
  companies: Company[];
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({ companies }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = companies.filter(
    (c) =>
      c.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj.includes(searchTerm) ||
      c.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnae_descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span>Empresas & Clientes Industriais</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Base de dados das fábricas, metalúrgicas e indústrias cadastradas com CNAE e endereço.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por razão social, CNPJ ou cidade..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Grid of Companies */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-xl">
            Nenhuma empresa encontrada com os filtros informados.
          </div>
        ) : (
          filtered.map((company) => (
            <div
              key={company.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{company.nome_fantasia || company.razao_social}</h3>
                    <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
                      CNPJ: {formatCnpj(company.cnpj)}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/50 shrink-0">
                    {company.total_leads} {company.total_leads === 1 ? 'oportunidade' : 'oportunidades'}
                  </span>
                </div>

                {company.cnae_descricao && (
                  <div className="p-2 rounded bg-neutral-950 border border-neutral-800/80 mb-3 text-[11px]">
                    <span className="text-neutral-500 font-mono">{company.cnae}:</span>{' '}
                    <span className="text-neutral-300">{company.cnae_descricao}</span>
                  </div>
                )}

                <div className="space-y-1.5 text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>
                      {company.cidade} - {company.uf} ({company.bairro || company.logradouro})
                    </span>
                  </div>
                  {company.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span>{company.telefone}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-500">Razão Social:</span>
                <span className="text-neutral-300 font-medium truncate max-w-[200px]" title={company.razao_social}>
                  {company.razao_social}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
