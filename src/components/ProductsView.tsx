import React, { useState } from 'react';
import { Wrench, Plus, Search, DollarSign, Check, Clock, AlertCircle } from 'lucide-react';
import { Product, UserProfile } from '../types/crm';

interface ProductsViewProps {
  user: UserProfile;
  products: Product[];
  onAddProduct: (product: Partial<Product>) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  user,
  products,
  onAddProduct,
}) => {
  const isGestor = user.role === 'gestor';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Usinagem');
  const [fabricante, setFabricante] = useState('');
  const [modelo, setModelo] = useState('');
  const [potencia, setPotencia] = useState('');
  const [precoBase, setPrecoBase] = useState(0);
  const [status, setStatus] = useState<'disponivel' | 'sob_encomenda' | 'indisponivel'>('disponivel');
  const [descricao, setDescricao] = useState('');

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const categories = Array.from(new Set(products.map((p) => p.categoria)));

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.potencia_especificacao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.categoria === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !fabricante.trim()) return;

    onAddProduct({
      nome: nome.trim(),
      categoria,
      fabricante: fabricante.trim(),
      modelo: modelo.trim(),
      potencia_especificacao: potencia.trim(),
      preco_base: Number(precoBase) || 0,
      status,
      descricao: descricao.trim(),
    });

    setNome('');
    setFabricante('');
    setModelo('');
    setPotencia('');
    setPrecoBase(0);
    setDescricao('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sky-400" />
            <span>Catálogo de Máquinas & Equipamentos Industriais</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Especificações de engenharia, potência e tabela base para cálculo de propostas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar máquina, fabricante..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Todas Categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {isGestor && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Máquina</span>
            </button>
          )}
        </div>
      </div>

      {/* Form Nova Máquina (Gestor) */}
      {isAdding && isGestor && (
        <form onSubmit={handleCreateProduct} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <span className="font-bold text-white">Cadastrar Equipamento no Catálogo</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-neutral-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-neutral-300 mb-1 font-medium">Nome do Equipamento *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Torno CNC Barramento Inclinado Romi"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Categoria Industrial</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Usinagem">Usinagem</option>
                <option value="Conformação">Conformação & Prensas</option>
                <option value="Corte e Solda">Corte e Solda Laser</option>
                <option value="Plásticos e Polímeros">Plásticos & Injeção</option>
                <option value="Utilidades Industriais">Utilidades & Compressores</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Fabricante / Marca *</label>
              <input
                type="text"
                required
                value={fabricante}
                onChange={(e) => setFabricante(e.target.value)}
                placeholder="Ex: Romi, Mazak, Bystronic"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Modelo</label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ex: ST-20 / Centur 30D"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Preço Base de Venda (R$)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={precoBase}
                onChange={(e) => setPrecoBase(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 mb-1 font-medium">
              Especificação Técnica (Potência, Barramento, Rotação, Tonelagem)
            </label>
            <input
              type="text"
              value={potencia}
              onChange={(e) => setPotencia(e.target.value)}
              placeholder="Ex: Spindle 15.000 RPM, passagem 65mm, 4500 RPM, CLP Siemens"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Salvar Máquina no Catálogo
            </button>
          </div>
        </form>
      )}

      {/* Grid of Machinery Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-400 block mb-0.5">
                    {prod.categoria}
                  </span>
                  <h3 className="text-sm font-bold text-white">{prod.nome}</h3>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                    prod.status === 'disponivel'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                      : prod.status === 'sob_encomenda'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                      : 'bg-red-950 text-red-300 border border-red-800/50'
                  }`}
                >
                  {prod.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs text-neutral-400 mb-3">
                <span className="text-neutral-500">Fabricante:</span>{' '}
                <strong className="text-neutral-300">{prod.fabricante}</strong>
                {prod.modelo && <span className="ml-1 font-mono">({prod.modelo})</span>}
              </div>

              {prod.potencia_especificacao && (
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 mb-3 text-xs">
                  <div className="text-[10px] text-neutral-400 uppercase font-semibold mb-0.5">
                    Especificações Técnicas
                  </div>
                  <div className="text-neutral-200">{prod.potencia_especificacao}</div>
                </div>
              )}

              {prod.descricao && (
                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 mb-3">
                  {prod.descricao}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 block">Preço Base Indicativo</span>
                <span className="text-sm font-bold text-white font-mono tabular-nums">
                  {formatBRL(prod.preco_base)}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400">Finame / BNDES Elegível</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
