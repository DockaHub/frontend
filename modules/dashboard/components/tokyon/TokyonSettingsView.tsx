
import React from 'react';
import { Building2, Globe, Users, ShieldAlert, ToggleLeft, ToggleRight, Save, Upload, Eye, Link, Copy } from 'lucide-react';
import { Organization } from '../../../../types';
import OrganizationIconSettings from '../../../../components/OrganizationIconSettings';

interface TokyonSettingsViewProps {
    onOpenClientPortal?: () => void;
    organization?: Organization;
}

const TokyonSettingsView: React.FC<TokyonSettingsViewProps> = ({ onOpenClientPortal, organization }) => {
    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Configurações do Workspace</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerencie detalhes da organização Tokyon, equipe e integrações.</p>
                </div>

                <div className="space-y-8">
                    {organization && (
                        <OrganizationIconSettings organization={organization} />
                    )}

                    {/* General Information */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Building2 size={16} /> Informações Gerais
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex gap-6 items-start">
                                <div className="w-24 h-24 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0">T</div>
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome da Organização</label>
                                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" defaultValue="Agência Tokyon" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Slug URL</label>
                                            <div className="flex items-center">
                                                <span className="bg-docka-50 dark:bg-zinc-800 border border-r-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-500 text-xs py-2 px-2 rounded-l-lg">docka.io/</span>
                                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-r-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100" defaultValue="tokyon" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button className="text-xs font-medium text-docka-500 dark:text-zinc-400 flex items-center gap-1 hover:text-docka-900 dark:hover:text-zinc-200">
                                            <Upload size={12} /> Alterar Logo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-docka-50 dark:bg-zinc-800/30 border-t border-docka-100 dark:border-zinc-800 flex justify-end">
                            <button className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors flex items-center gap-2">
                                <Save size={14} /> Salvar Alterações
                            </button>
                        </div>
                    </div>

                    {/* Portal Management (Enhanced) */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Globe size={16} /> Portal do Cliente (Tokyon.Client)
                            </h3>
                            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">ATIVO</span>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Link de Acesso Geral</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex items-center bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-docka-600 dark:text-zinc-400">
                                            <Link size={14} className="mr-2 text-docka-400 dark:text-zinc-500" />
                                            portal.tokyon.jp/login
                                        </div>
                                        <button className="p-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-700 text-docka-600 dark:text-zinc-400">
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            onClick={onOpenClientPortal}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                                        >
                                            <Eye size={16} /> Visualizar como Cliente
                                        </button>
                                    </div>
                                    <p className="text-xs text-docka-400 dark:text-zinc-500 mt-2">Este é o portal onde seus clientes aprovam criativos e veem relatórios de performance.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modules / Features */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Users size={16} /> Módulos Internos
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { title: 'Orange Program', desc: 'Habilita dashboard de gestão de projetos high-ticket.', active: true },
                                { title: 'CRM de Vendas', desc: 'Pipeline de leads e gestão de contatos.', active: true },
                                { title: 'Gestão Financeira', desc: 'Módulo de faturas e fluxo de caixa.', active: true },
                            ].map((mod, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border border-docka-100 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div>
                                        <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">{mod.title}</h4>
                                        <p className="text-xs text-docka-500 dark:text-zinc-500">{mod.desc}</p>
                                    </div>
                                    <button className={`text-docka-400 dark:text-zinc-600 hover:text-docka-600 dark:hover:text-zinc-400 ${mod.active ? 'text-emerald-600 dark:text-emerald-500' : ''}`}>
                                        {mod.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-100 dark:border-red-900/50 rounded-xl overflow-hidden shadow-sm bg-red-50/30 dark:bg-red-900/10">
                        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2 text-red-700 dark:text-red-400">
                            <ShieldAlert size={16} />
                            <h3 className="font-bold text-sm">Zona de Perigo</h3>
                        </div>
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Arquivar Organização</h4>
                                <p className="text-xs text-docka-500 dark:text-zinc-400 mt-1">Isso tornará a organização somente leitura para todos os membros.</p>
                            </div>
                            <button className="bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                Arquivar Tokyon
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TokyonSettingsView;
