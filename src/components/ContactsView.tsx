import React, { useState } from 'react';
import { Contact2, Search, Phone, MessageCircle, Mail, Building } from 'lucide-react';
import { Contact } from '../types/crm';

interface ContactsViewProps {
  contacts: Contact[];
}

export const ContactsView: React.FC<ContactsViewProps> = ({ contacts }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = contacts.filter(
    (c) =>
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.empresa_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Contact2 className="w-5 h-5 text-sky-400" />
            <span>Contatos & Decisores Industriais</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Engenheiros chefes, diretores industriais, compradores e gestores de manutenção.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, cargo ou empresa..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Grid of Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-xl">
            Nenhum contato encontrado.
          </div>
        ) : (
          filtered.map((contact) => (
            <div
              key={contact.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{contact.nome}</h3>
                    <div className="text-xs text-sky-400 font-medium">{contact.cargo}</div>
                  </div>
                  <span className="text-[10px] text-neutral-400 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">
                    {contact.departamento}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-300 font-semibold mb-3">
                  <Building className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{contact.empresa_nome}</span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                  {contact.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{contact.telefone}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
                {contact.whatsapp && (
                  <a
                    href={`https://wa.me/55${contact.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
