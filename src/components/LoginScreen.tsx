import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Building2 } from 'lucide-react';
import { UserProfile, UserRole } from '../types/crm';
import { loginUser, registerUser } from '../services/supabaseClient';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('vendedor');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Informe o e-mail e a senha cadastrados.');
        }
        const user = await loginUser(email.trim(), password);
        onLoginSuccess(user);
      } else {
        if (!name.trim() || !email.trim() || !password.trim()) {
          throw new Error('Preencha nome, e-mail e senha.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve possuir no mínimo 6 caracteres.');
        }
        const user = await registerUser(email.trim(), password, name.trim(), role, phone.trim());
        onLoginSuccess(user);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Falha na autenticação. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col justify-between text-neutral-100 selection:bg-sky-500 selection:text-white">
      {/* Top minimal brand indicator */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center text-sky-400 font-bold text-lg shadow-sm">
            <Building2 className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">IndusCRM</span>
            <span className="text-xs text-neutral-400 ml-2 font-mono">v2.4 Pro</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Ambiente Seguro com RLS & Supabase</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Card Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              {mode === 'login' ? 'Portal Comercial Industrial' : 'Cadastro de Acesso'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {mode === 'login'
                ? 'Entre com suas credenciais para acessar o pipeline de máquinas e vendas.'
                : 'Crie sua conta para atuar no CRM industrial com controle de perfil.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center p-1 bg-neutral-950 rounded-lg border border-neutral-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Acessar Sistema
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
                mode === 'register'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo de Oliveira"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Perfil de Acesso
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('gestor')}
                      className={`py-2 px-3 rounded-lg border text-left text-xs transition-colors ${
                        role === 'gestor'
                          ? 'border-sky-500 bg-sky-950/30 text-sky-300 font-semibold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-semibold text-neutral-200">Gestor Geral</div>
                      <div className="text-[10px] text-neutral-400">Triagem & Todos Leads</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('vendedor')}
                      className={`py-2 px-3 rounded-lg border text-left text-xs transition-colors ${
                        role === 'vendedor'
                          ? 'border-sky-500 bg-sky-950/30 text-sky-300 font-semibold'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-semibold text-neutral-200">Vendedor Técnico</div>
                      <div className="text-[10px] text-neutral-400">Apenas Seus Leads</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Telefone / WhatsApp (Opcional)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com.br"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Senha
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-neutral-500">Mínimo 6 dígitos</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-950 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar no Sistema' : 'Concluir Cadastro'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-neutral-400 border-t border-neutral-900">
        <span>IndusCRM Sistemas Industriais &copy; {new Date().getFullYear()}</span>
        <span className="mx-2">·</span>
        <span>Máquinas Ferramenta, Usinagem, Conformação e Automação</span>
      </div>
    </div>
  );
};
