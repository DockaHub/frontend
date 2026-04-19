
import React from 'react';
import { Search, Filter, Download, Shield } from 'lucide-react';
import DashboardPage from '../../../../components/DashboardPage';

const LOGS = [
    { id: 'LOG-9921', action: 'Login Bem-sucedido', user: 'Alex Arquiteto', ip: '192.168.1.10', location: 'São Paulo, BR', time: 'Hoje, 10:45', module: 'Auth' },
    { id: 'LOG-9920', action: 'Contrato Criado', user: 'Sarah Engenheira', ip: '192.168.1.12', location: 'Rio de Janeiro, BR', time: 'Hoje, 09:30', module: 'Tokyon' },
    { id: 'LOG-9919', action: 'Exportação de Dados', user: 'Mike Vendas', ip: '201.45.99.12', location: 'Lisboa, PT', time: 'Ontem, 18:20', module: 'Fauves' },
    { id: 'LOG-9918', action: 'Alteração de Permissões', user: 'Sistema', ip: 'localhost', location: 'Server', time: 'Ontem, 14:00', module: 'Admin' },
];


const DockaAuditView: React.FC = () => {
  return (
    <DashboardPage 
        title="Auditoria & Segurança" 
        icon={Shield}
        actions={
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-bold uppercase tracking-wider text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50 transition-colors">
                <Download size={14} /> Exportar CSV
            </button>
        }
    >
        <div className="animate-in fade-in duration-500">
            <p className="text-docka-500 dark:text-zinc-400 text-sm mb-8 -mt-2">Logs detalhados de atividades em todo o ecossistema Docka.</p>

            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                
                {/* Toolbar */}
                <div className="p-4 border-b border-docka-200 dark:border-zinc-800 flex justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                        <input 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 font-sans" 
                            placeholder="Buscar por usuário, IP ou ação..." 
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold uppercase tracking-widest text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50 transition-colors">
                            <Filter size={14} /> Filtrar
                        </button>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-sm text-left">
                    <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-bold text-xs uppercase tracking-wider border-b border-docka-100 dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Evento</th>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Contexto (IP/Loc)</th>
                            <th className="px-6 py-4">Módulo</th>
                            <th className="px-6 py-4 text-right">Data/Hora</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                        {LOGS.map(log => (
                            <tr key={log.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{log.action}</div>
                                    <div className="text-[10px] text-docka-400 dark:text-zinc-500 font-mono tracking-tighter uppercase">{log.id}</div>
                                </td>
                                <td className="px-6 py-4 text-docka-700 dark:text-zinc-300 font-medium">{log.user}</td>
                                <td className="px-6 py-4">
                                    <div className="text-docka-900 dark:text-zinc-100 font-mono text-xs">{log.ip}</div>
                                    <div className="text-[10px] font-bold uppercase text-docka-500 dark:text-zinc-500 tracking-tight">{log.location}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded text-[10px] font-bold text-docka-600 dark:text-zinc-400 uppercase tracking-widest">{log.module}</span>
                                </td>
                                <td className="px-6 py-4 text-right text-docka-500 dark:text-zinc-500 font-mono text-[11px] font-medium">{log.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </DashboardPage>
  );
};

export default DockaAuditView;
