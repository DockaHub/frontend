
import React, { useState } from 'react';
import { Server, Globe, CreditCard, Save, Clock, ToggleLeft, ToggleRight, Mail } from 'lucide-react';
import { Organization } from '../../../../types';
import OrganizationIconSettings from '../../../../components/OrganizationIconSettings';

interface HostiziSettingsViewProps {
    organization?: Organization;
}

const HostiziSettingsView: React.FC<HostiziSettingsViewProps> = ({ organization }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'infra' | 'notifications'>('general');

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Configurações do Sistema Hostizi</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Defina as regras de automação, faturamento e infraestrutura da sua empresa de hospedagem.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-docka-200 dark:border-zinc-800 mb-8 overflow-x-auto">
                    {[
                        { id: 'general', label: 'Geral & DNS', icon: Globe },
                        { id: 'billing', label: 'Faturamento & Automação', icon: CreditCard },
                        { id: 'infra', label: 'Servidores & Integrações', icon: Server },
                        { id: 'notifications', label: 'E-mail & SMTP', icon: Mail },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-docka-900 dark:border-zinc-100 text-docka-900 dark:text-zinc-100' : 'border-transparent text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">

                    {/* TAB: GENERAL & DNS */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                            {organization && (
                                <OrganizationIconSettings organization={organization} />
                            )}

                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <Globe size={16} /> Identidade e Nameservers
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome da Empresa (Remetente)</label>
                                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" defaultValue="Hostizi Cloud Services" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">URL do Painel do Cliente</label>
                                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" defaultValue="https://painel.hostizi.com" />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">Nameservers Padrão</h4>
                                        <p className="text-xs text-blue-700 dark:text-blue-400 mb-4">Estes NS serão enviados nos e-mails de boas-vindas para novos clientes configurarem seus domínios.</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-blue-800/70 dark:text-blue-300/70 uppercase mb-1">Nameserver 1</label>
                                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-900/50 rounded-lg text-sm text-docka-700 dark:text-zinc-300 font-mono" defaultValue="ns1.hostizi.com" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-blue-800/70 dark:text-blue-300/70 uppercase mb-1">Nameserver 2</label>
                                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-900/50 rounded-lg text-sm text-docka-700 dark:text-zinc-300 font-mono" defaultValue="ns2.hostizi.com" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-blue-800/70 dark:text-blue-300/70 uppercase mb-1">Nameserver 3 (Opcional)</label>
                                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-900/50 rounded-lg text-sm text-docka-700 dark:text-zinc-300 font-mono" defaultValue="ns3.hostizi.com" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-blue-800/70 dark:text-blue-300/70 uppercase mb-1">Nameserver 4 (Opcional)</label>
                                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-900/50 rounded-lg text-sm text-docka-700 dark:text-zinc-300 font-mono" defaultValue="ns4.hostizi.com" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: BILLING & AUTOMATION */}
                    {activeTab === 'billing' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <Clock size={16} /> Regras de Automação (Ciclo de Vida)
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between p-3 border border-docka-100 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                        <div>
                                            <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Gerar Faturas Automaticamente</h4>
                                            <p className="text-xs text-docka-500 dark:text-zinc-400">Criar fatura X dias antes do vencimento do serviço.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input className="w-16 px-2 py-1 text-right bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm text-docka-900 dark:text-zinc-100" defaultValue="7" />
                                            <span className="text-xs text-docka-500 dark:text-zinc-500">dias antes</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-docka-100 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                        <div>
                                            <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Suspensão Automática</h4>
                                            <p className="text-xs text-docka-500 dark:text-zinc-400">Suspender conta se a fatura não for paga após o vencimento.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input className="w-16 px-2 py-1 text-right bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm text-docka-900 dark:text-zinc-100" defaultValue="5" />
                                            <span className="text-xs text-docka-500 dark:text-zinc-500">dias após</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border border-docka-100 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                        <div>
                                            <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100 text-red-600 dark:text-red-400">Terminação (Exclusão) Automática</h4>
                                            <p className="text-xs text-docka-500 dark:text-zinc-400">Remover completamente a conta do servidor (Irreversível).</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input className="w-16 px-2 py-1 text-right bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded text-sm text-docka-900 dark:text-zinc-100" defaultValue="90" />
                                            <span className="text-xs text-docka-500 dark:text-zinc-500">dias após</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <CreditCard size={16} /> Gateways de Pagamento
                                    </h3>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-docka-200 dark:border-zinc-700 p-4 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-docka-100 dark:bg-zinc-800 rounded flex items-center justify-center font-bold text-docka-500 dark:text-zinc-400 text-xs">PIX</div>
                                            <div>
                                                <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Banco Central (Estático)</div>
                                                <div className="text-xs text-docka-500 dark:text-zinc-500">Manual</div>
                                            </div>
                                        </div>
                                        <div className="text-emerald-600 dark:text-emerald-500"><ToggleRight size={24} /></div>
                                    </div>
                                    <div className="border border-docka-200 dark:border-zinc-700 p-4 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">ASAAS</div>
                                            <div>
                                                <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Asaas / Boleto</div>
                                                <div className="text-xs text-docka-500 dark:text-zinc-500">Automático (API)</div>
                                            </div>
                                        </div>
                                        <div className="text-emerald-600 dark:text-emerald-500"><ToggleRight size={24} /></div>
                                    </div>
                                    <div className="border border-docka-200 dark:border-zinc-700 p-4 rounded-lg flex justify-between items-center opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center font-bold text-white text-xs">STR</div>
                                            <div>
                                                <div className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Stripe</div>
                                                <div className="text-xs text-docka-500 dark:text-zinc-500">Cartão de Crédito</div>
                                            </div>
                                        </div>
                                        <div className="text-docka-300 dark:text-zinc-600"><ToggleLeft size={24} /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: INFRA & SERVERS */}
                    {activeTab === 'infra' && (
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                    <Server size={16} /> Servidores Conectados (WHM/cPanel)
                                </h3>
                                <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">+ Adicionar Servidor</button>
                            </div>
                            <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                {[
                                    { name: 'br-sp-node-01.hostizi.cloud', ip: '192.168.1.10', load: '0.45', accounts: 124, active: true },
                                    { name: 'us-va-node-02.hostizi.cloud', ip: '104.23.11.20', load: '1.20', accounts: 45, active: true },
                                ].map((srv, i) => (
                                    <div key={i} className="p-4 flex items-center justify-between hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${srv.active ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                                <Server size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">{srv.name}</h4>
                                                <p className="text-xs text-docka-500 dark:text-zinc-500 font-mono mt-0.5">{srv.ip} • Load: {srv.load}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-docka-500 dark:text-zinc-500 uppercase">Contas</div>
                                                <div className="text-sm font-bold text-docka-900 dark:text-zinc-100">{srv.accounts}</div>
                                            </div>
                                            <button className="px-3 py-1.5 border border-docka-200 dark:border-zinc-700 rounded text-xs font-medium hover:bg-docka-100 dark:hover:bg-zinc-800 text-docka-700 dark:text-zinc-300">Gerenciar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-docka-50 dark:bg-zinc-800/50 border-t border-docka-100 dark:border-zinc-800">
                                <h4 className="text-xs font-bold text-docka-600 dark:text-zinc-400 uppercase mb-3">Opções de Provisionamento</h4>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="accent-docka-900 dark:accent-zinc-100" defaultChecked />
                                    <span className="text-sm text-docka-700 dark:text-zinc-300">Provisionar automaticamente novas contas no servidor com menor uso (Load Balancing)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* TAB: NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                    <Mail size={16} /> Servidor de E-mail (SMTP)
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Host SMTP</label>
                                        <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" placeholder="smtp.sendgrid.net" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Porta</label>
                                        <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" placeholder="587" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Usuário SMTP</label>
                                        <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Senha</label>
                                        <input type="password" className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 text-docka-900 dark:text-zinc-100" />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button className="px-4 py-2 bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-400 rounded-lg text-sm font-medium hover:bg-docka-200 dark:hover:bg-zinc-700">Testar Conexão</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-docka-200 dark:border-zinc-800 mt-8">
                        <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
                            <Save size={16} /> Salvar Configurações
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HostiziSettingsView;
