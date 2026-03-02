
import React from 'react';
import { Search, Filter, Download, Shield } from 'lucide-react';

const LOGS = [
    { id: 'LOG-9921', action: 'Login Bem-sucedido', user: 'Alex Arquiteto', ip: '192.168.1.10', location: 'São Paulo, BR', time: 'Hoje, 10:45', module: 'Auth' },
    { id: 'LOG-9920', action: 'Contrato Criado', user: 'Sarah Engenheira', ip: '192.168.1.12', location: 'Rio de Janeiro, BR', time: 'Hoje, 09:30', module: 'Tokyon' },
    { id: 'LOG-9919', action: 'Exportação de Dados', user: 'Mike Vendas', ip: '201.45.99.12', location: 'Lisboa, PT', time: 'Ontem, 18:20', module: 'Fauves' },
    { id: 'LOG-9918', action: 'Alteração de Permissões', user: 'Sistema', ip: 'localhost', location: 'Server', time: 'Ontem, 14:00', module: 'Admin' },
];

const DockaAuditView: React.FC = () => {
  return (
    <div className="h-full bg-docka-50 dark:bg-zinc-950 p-8 overflow-y-auto custom-scrollbar animate-in fade-in duration-300 transition-colors">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Auditoria & Segurança</h1>
                <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Logs detalhados de atividades em todo o ecossistema Docka.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                
                {/* Toolbar */}
                <div className="p-4 border-b border-docka-200 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                        <input 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" 
                            placeholder="Buscar por usuário, IP ou ação..." 
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50">
                            <Filter size={14} /> Filtrar
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50">
                            <Download size={14} /> Exportar CSV
                        </button>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-sm text-left">
                    <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Evento</th>
                            <th className="px-6 py-3">Usuário</th>
                            <th className="px-6 py-3">Contexto (IP/Loc)</th>
                            <th className="px-6 py-3">Módulo</th>
                            <th className="px-6 py-3 text-right">Data/Hora</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                        {LOGS.map(log => (
                            <tr key={log.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-3">
                                    <div className="font-medium text-docka-900 dark:text-zinc-100">{log.action}</div>
                                    <div className="text-[10px] text-docka-400 dark:text-zinc-500 font-mono">{log.id}</div>
                                </td>
                                <td className="px-6 py-3 text-docka-700 dark:text-zinc-300">{log.user}</td>
                                <td className="px-6 py-3">
                                    <div className="text-docka-900 dark:text-zinc-100">{log.ip}</div>
                                    <div className="text-[10px] text-docka-500 dark:text-zinc-500">{log.location}</div>
                                </td>
                                <td className="px-6 py-3">
                                    <span className="px-2 py-1 bg-docka-100 dark:bg-zinc-800 rounded text-xs font-bold text-docka-600 dark:text-zinc-400 uppercase">{log.module}</span>
                                </td>
                                <td className="px-6 py-3 text-right text-docka-500 dark:text-zinc-500 font-mono text-xs">{log.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default DockaAuditView;
