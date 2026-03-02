
import React from 'react';
import {
    Shield, Globe, Key, Save, Server, ToggleLeft, ToggleRight, Database
} from 'lucide-react';
import { Organization } from '../../../../types';
import OrganizationIconSettings from '../../../../components/OrganizationIconSettings';

interface DockaSettingsViewProps {
    organization?: Organization;
}

const DockaSettingsView: React.FC<DockaSettingsViewProps> = ({ organization }) => {
    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Configurações do Sistema (Docka)</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gerenciamento global da infraestrutura e segurança da holding.</p>
                </div>

                <div className="space-y-8">

                    {organization && (
                        <OrganizationIconSettings organization={organization} />
                    )}

                    {/* Global Identity */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Globe size={16} /> Identidade & White-Label
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome da Holding</label>
                                    <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" defaultValue="Docka Group" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Domínio Raiz (CNAME)</label>
                                    <div className="flex items-center">
                                        <span className="bg-docka-50 dark:bg-zinc-900 border border-r-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-500 text-xs py-2 px-2 rounded-l-lg">https://</span>
                                        <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-r-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" defaultValue="docka.io" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Tema Global</label>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 ring-2 ring-offset-2 ring-slate-300 dark:ring-offset-zinc-800 dark:ring-zinc-600 cursor-pointer"></div>
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-indigo-300 dark:hover:ring-offset-zinc-800 dark:hover:ring-indigo-700 transition-all"></div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-600 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-emerald-300 dark:hover:ring-offset-zinc-800 dark:hover:ring-emerald-700 transition-all"></div>
                                </div>
                                <p className="text-xs text-docka-400 dark:text-zinc-500 mt-2">Esta cor será aplicada na sidebar e botões primários de novos tenants.</p>
                            </div>
                        </div>
                    </div>

                    {/* Global API Keys & Integrations */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Key size={16} /> Chaves de API & Infraestrutura
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Google Gemini API Key</label>
                                <div className="flex gap-2">
                                    <input type="password" className="flex-1 px-3 py-2 bg-docka-50 dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-500 dark:text-zinc-500 font-mono" value="AIzaSy...XyZ123" disabled />
                                    <button className="px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-medium hover:bg-docka-50 dark:hover:bg-zinc-700 text-docka-600 dark:text-zinc-300">Rotacionar</button>
                                </div>
                                <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-1">Usado para recursos de IA em e-mail, resumo e geração de conteúdo em todas as orgs.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Storage Provider</label>
                                    <div className="flex items-center gap-2">
                                        <Database size={14} className="text-docka-400 dark:text-zinc-500" />
                                        <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100">
                                            <option>AWS S3 (us-east-1)</option>
                                            <option>Google Cloud Storage</option>
                                            <option>Azure Blob Storage</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">SMTP Server (Emails)</label>
                                    <div className="flex items-center gap-2">
                                        <Server size={14} className="text-docka-400 dark:text-zinc-500" />
                                        <span className="text-sm font-medium text-docka-900 dark:text-zinc-100">SendGrid Pro</span>
                                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded ml-auto border border-emerald-200 dark:border-emerald-800">Conectado</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Policies */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Shield size={16} /> Políticas de Segurança
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-3 border border-docka-100 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                <div>
                                    <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Autenticação de Dois Fatores (2FA)</h4>
                                    <p className="text-xs text-docka-500 dark:text-zinc-500">Forçar uso de 2FA para todos os administradores e usuários.</p>
                                </div>
                                <button className="text-emerald-600 dark:text-emerald-500"><ToggleRight size={28} /></button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-docka-100 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                <div>
                                    <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Single Sign-On (SSO)</h4>
                                    <p className="text-xs text-docka-500 dark:text-zinc-500">Permitir login via Google Workspace ou Microsoft 365.</p>
                                </div>
                                <button className="text-emerald-600 dark:text-emerald-500"><ToggleRight size={28} /></button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-docka-100 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                <div>
                                    <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Log de Auditoria Estendido</h4>
                                    <p className="text-xs text-docka-500 dark:text-zinc-500">Reter logs de atividade por 12 meses (Padrão: 30 dias).</p>
                                </div>
                                <button className="text-docka-300 dark:text-zinc-600"><ToggleLeft size={28} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Save Actions */}
                    <div className="flex justify-end pt-4">
                        <button className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2">
                            <Save size={16} /> Salvar Configurações
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DockaSettingsView;
