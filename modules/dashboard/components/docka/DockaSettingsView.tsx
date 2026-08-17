
import React, { useEffect, useMemo, useState } from 'react';
import {
    Shield, Globe, Key, Server, ToggleLeft, ToggleRight, Database, Settings,
    Building2, CheckCircle2, ChevronDown
} from 'lucide-react';
import { Organization } from '../../../../types';
import OrganizationIconSettings from '../../../../components/OrganizationIconSettings';
import DashboardPage from '../../../../components/DashboardPage';
import SlackIntegrationSettings from './SlackIntegrationSettings';

interface DockaSettingsViewProps {
    organization?: Organization;
    organizations?: Organization[];
}

const DockaSettingsView: React.FC<DockaSettingsViewProps> = ({ organization, organizations = [] }) => {
    const managedOrganizations = useMemo(
        () => organizations.filter((item) => item.slug !== 'manyspace'),
        [organizations]
    );
    const [selectedOrganizationId, setSelectedOrganizationId] = useState(managedOrganizations[0]?.id || organization?.id || '');
    const selectedOrganization = organizations.find((item) => item.id === selectedOrganizationId) || organization;

    useEffect(() => {
        if (managedOrganizations.length > 0 && !managedOrganizations.some((item) => item.id === selectedOrganizationId)) {
            setSelectedOrganizationId(managedOrganizations[0].id);
        }
    }, [managedOrganizations, selectedOrganizationId]);

    return (
        <DashboardPage 
            title="Central de Configurações"
            icon={Settings}
        >
            <div className="animate-in fade-in duration-500">
                <p className="text-docka-500 dark:text-zinc-400 text-sm mb-8 -mt-2">Configurações do grupo e de todas as empresas, sem precisar entrar em cada painel.</p>

                <div className="space-y-8">
                    <div className="overflow-hidden rounded-2xl border border-docka-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex flex-col gap-4 border-b border-docka-100 bg-docka-50/40 px-6 py-5 dark:border-zinc-800 dark:bg-zinc-800/30 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"><Building2 size={19} /></div>
                                <div>
                                    <h2 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Configurações por empresa</h2>
                                    <p className="mt-0.5 text-[10px] text-docka-500 dark:text-zinc-400">Escolha o painel que deseja configurar.</p>
                                </div>
                            </div>
                            <div className="relative min-w-[240px]">
                                <select value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} className="w-full appearance-none rounded-xl border border-docka-200 bg-white px-4 py-2.5 pr-10 text-xs font-bold outline-none focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-900">
                                    {managedOrganizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                                    {organization && managedOrganizations.length === 0 && <option value={organization.id}>{organization.name}</option>}
                                </select>
                                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-docka-400" />
                            </div>
                        </div>
                        <div className="grid gap-px bg-docka-100 sm:grid-cols-3 dark:bg-zinc-800">
                            {[
                                ['Identidade visual', 'Logo, ícone e cores'],
                                ['Equipe e permissões', 'Gerenciado na aba Equipe'],
                                ['Integrações', 'Canais e credenciais'],
                            ].map(([title, description]) => (
                                <div key={title} className="flex items-center gap-3 bg-white px-5 py-4 dark:bg-zinc-900">
                                    <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                                    <div><p className="text-xs font-bold">{title}</p><p className="mt-0.5 text-[9px] text-docka-400">{description}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedOrganization && (
                        <OrganizationIconSettings key={selectedOrganization.id} organization={selectedOrganization} />
                    )}

                    {organization?.slug === 'manyspace' && (
                        <SlackIntegrationSettings organization={organization} />
                    )}

                    {/* Global Identity */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <Globe size={16} className="text-docka-400" /> Identidade & White-Label
                            </h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2 tracking-wider">Nome da Holding</label>
                                    <input className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 text-docka-900 dark:text-zinc-100 font-sans" defaultValue="ManySpace Group" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2 tracking-wider">Domínio Raiz (CNAME)</label>
                                    <div className="flex items-center">
                                        <span className="bg-docka-50 dark:bg-zinc-900 border border-r-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-500 text-[10px] font-bold py-3 px-3 rounded-l-lg">HTTPS://</span>
                                        <input className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-r-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 text-docka-900 dark:text-zinc-100 font-sans" defaultValue="manyspace.io" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-4 tracking-wider">Tema Global</label>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 ring-2 ring-offset-2 ring-slate-300 dark:ring-offset-zinc-800 dark:ring-zinc-600 cursor-pointer shadow-sm"></div>
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-indigo-300 dark:hover:ring-offset-zinc-800 dark:hover:ring-indigo-700 transition-all shadow-sm"></div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-600 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-emerald-300 dark:hover:ring-offset-zinc-800 dark:hover:ring-emerald-700 transition-all shadow-sm"></div>
                                </div>
                                <p className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 mt-4 uppercase tracking-tighter">* Esta cor será aplicada na sidebar e botões primários de novos tenants.</p>
                            </div>
                        </div>
                    </div>

                    {/* Global API Keys & Integrations */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <Key size={16} className="text-docka-400" /> Chaves de API & Infraestrutura
                            </h3>
                        </div>
                        <div className="p-8 space-y-8">
                            <div>
                                <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2 tracking-wider">Google Gemini API Key</label>
                                <div className="flex gap-3">
                                    <input type="password" className="flex-1 px-4 py-2.5 bg-docka-50 dark:bg-zinc-950 border border-docka-200 dark:border-zinc-800 rounded-lg text-sm text-docka-500 dark:text-zinc-500 font-mono" value="AIzaSy...XyZ123" disabled />
                                    <button className="px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-docka-50 dark:hover:bg-zinc-700 text-docka-600 dark:text-zinc-300 transition-all shadow-sm">Rotacionar</button>
                                </div>
                                <p className="text-[10px] font-medium text-docka-400 dark:text-zinc-500 mt-2">Usado para recursos de IA em e-mail, resumo e geração de conteúdo em todas as orgs.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2 tracking-wider">Storage Provider</label>
                                    <div className="flex items-center gap-3">
                                        <Database size={16} className="text-docka-400 dark:text-zinc-500" />
                                        <select className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-800 text-docka-900 dark:text-zinc-100 font-sans shadow-sm">
                                            <option>AWS S3 (us-east-1)</option>
                                            <option>Google Cloud Storage</option>
                                            <option>Azure Blob Storage</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2 tracking-wider">SMTP Server (Emails)</label>
                                    <div className="flex items-center gap-3 p-2.5 bg-docka-50 dark:bg-zinc-800/50 rounded-lg border border-docka-100 dark:border-zinc-700 shadow-sm px-4">
                                        <Server size={16} className="text-docka-400 dark:text-zinc-500" />
                                        <span className="text-xs font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-widest">SendGrid Pro</span>
                                        <span className="text-[9px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded ml-auto border border-emerald-200 dark:border-emerald-800 uppercase tracking-tighter">Conectado</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Policies */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <Shield size={16} className="text-docka-400" /> Políticas de Segurança
                            </h3>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="flex items-center justify-between p-4 border border-docka-50 dark:border-zinc-800 rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-all group">
                                <div>
                                    <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-tight">Autenticação de Dois Fatores (2FA)</h4>
                                    <p className="text-[10px] font-medium text-docka-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Forçar uso de 2FA para todos os administradores.</p>
                                </div>
                                <button className="text-emerald-600 dark:text-emerald-500 transition-transform active:scale-95"><ToggleRight size={32} /></button>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-docka-50 dark:border-zinc-800 rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-all group">
                                <div>
                                    <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-tight">Single Sign-On (SSO)</h4>
                                    <p className="text-[10px] font-medium text-docka-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Permitir login via Google Workspace ou Microsoft 365.</p>
                                </div>
                                <button className="text-emerald-600 dark:text-emerald-500 transition-transform active:scale-95"><ToggleRight size={32} /></button>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-docka-50 dark:border-zinc-800 rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-all group">
                                <div>
                                    <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-tight">Log de Auditoria Estendido</h4>
                                    <p className="text-[10px] font-medium text-docka-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Reter logs de atividade por 12 meses (Padrão: 30 dias).</p>
                                </div>
                                <button className="text-docka-300 dark:text-zinc-600 transition-transform active:scale-95"><ToggleLeft size={32} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardPage>
    );
};

export default DockaSettingsView;
