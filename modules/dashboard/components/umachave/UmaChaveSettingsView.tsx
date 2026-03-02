
import React, { useState } from 'react';
import { Building2, Key, Wallet, Globe, Save, ToggleLeft, ToggleRight, Share2, FileSignature, Home, Percent } from 'lucide-react';
import { Organization } from '../../../../types';
import OrganizationIconSettings from '../../../../components/OrganizationIconSettings';

interface UmaChaveSettingsViewProps {
    onOpenClientPortal?: () => void;
    organization?: Organization;
}

const UmaChaveSettingsView: React.FC<UmaChaveSettingsViewProps> = ({ organization }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'integrations' | 'portal'>('general');

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Configurações UmaChave</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Defina as regras de locação, repasses financeiros e integrações com portais.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-docka-200 dark:border-zinc-800 mb-8 overflow-x-auto">
                    {[
                        { id: 'general', label: 'Dados da Imobiliária', icon: Building2 },
                        { id: 'financial', label: 'Financeiro & Repasses', icon: Wallet },
                        { id: 'integrations', label: 'Portais & Assinatura', icon: Share2 },
                        { id: 'portal', label: 'Portal do Cliente', icon: Globe },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-orange-600 text-orange-700 dark:text-orange-400' : 'border-transparent text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">

                    {/* TAB: GENERAL */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                            {organization && (
                                <OrganizationIconSettings organization={organization} />
                            )}

                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <Building2 size={16} /> Identidade Legal
                                    </h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Razão Social</label>
                                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-400 dark:focus:border-orange-500 text-docka-900 dark:text-zinc-100" defaultValue="UmaChave Negócios Imobiliários LTDA" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">CNPJ</label>
                                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-400 dark:focus:border-orange-500 text-docka-900 dark:text-zinc-100" defaultValue="12.345.678/0001-90" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">CRECI Jurídico</label>
                                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-400 dark:focus:border-orange-500 text-docka-900 dark:text-zinc-100" defaultValue="J-12345" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Endereço da Sede</label>
                                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-400 dark:focus:border-orange-500 text-docka-900 dark:text-zinc-100" defaultValue="Av. Paulista, 1000 - Cj 101, São Paulo - SP" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: FINANCIAL */}
                    {activeTab === 'financial' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <Percent size={16} /> Taxas & Regras de Cobrança
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Taxa de Administração (%)</label>
                                            <div className="flex items-center">
                                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-l-lg text-sm outline-none focus:border-orange-400 dark:focus:border-orange-500 text-right text-docka-900 dark:text-zinc-100" defaultValue="10" />
                                                <span className="bg-docka-50 dark:bg-zinc-700 border border-l-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-400 text-sm px-3 py-2 rounded-r-lg font-bold">%</span>
                                            </div>
                                            <p className="text-[10px] text-docka-400 dark:text-zinc-500 mt-1">Cobrada sobre o valor do aluguel.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Taxa de 1º Aluguel (%)</label>
                                            <div className="flex items-center">
                                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-l-lg text-sm outline-none focus:border-orange-400 dark:focus:border-orange-500 text-right text-docka-900 dark:text-zinc-100" defaultValue="100" />
                                                <span className="bg-docka-50 dark:bg-zinc-700 border border-l-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-400 text-sm px-3 py-2 rounded-r-lg font-bold">%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Multa por Atraso (%)</label>
                                            <div className="flex items-center">
                                                <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-l-lg text-sm outline-none focus:border-orange-400 dark:focus:border-orange-500 text-right text-docka-900 dark:text-zinc-100" defaultValue="10" />
                                                <span className="bg-docka-50 dark:bg-zinc-700 border border-l-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-400 text-sm px-3 py-2 rounded-r-lg font-bold">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <Wallet size={16} /> Automação de Repasses (Split)
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg">
                                        <div>
                                            <h4 className="text-sm font-bold text-orange-900 dark:text-orange-300">Split de Pagamento Automático</h4>
                                            <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">Ao receber o boleto do inquilino, o sistema separa automaticamente a taxa de administração e transfere o restante para o proprietário.</p>
                                        </div>
                                        <button className="text-orange-600 dark:text-orange-500"><ToggleRight size={32} /></button>
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Dia do Repasse</label>
                                            <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100">
                                                <option>D+1 após compensação</option>
                                                <option>Dia 10 de cada mês</option>
                                                <option>Dia 25 de cada mês</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Banco de Liquidação</label>
                                            <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100">
                                                <option>Itaú (341) - Ag 0000</option>
                                                <option>Inter (077)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: INTEGRATIONS */}
                    {activeTab === 'integrations' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

                            {/* Real Estate Portals */}
                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <Home size={16} /> Integração com Portais
                                    </h3>
                                </div>
                                <div className="divide-y divide-docka-50 dark:divide-zinc-800">
                                    {[
                                        { name: 'Zap Imóveis', status: 'active', leads: '128 leads/mês' },
                                        { name: 'VivaReal', status: 'active', leads: '95 leads/mês' },
                                        { name: 'OLX Imóveis', status: 'inactive', leads: '-' },
                                        { name: 'Chaves na Mão', status: 'inactive', leads: '-' },
                                    ].map((portal, i) => (
                                        <div key={i} className="p-4 flex items-center justify-between hover:bg-docka-50 dark:hover:bg-zinc-800 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${portal.status === 'active' ? 'bg-emerald-500' : 'bg-docka-300 dark:bg-zinc-600'}`} />
                                                <div>
                                                    <h4 className="font-bold text-sm text-docka-900 dark:text-zinc-100">{portal.name}</h4>
                                                    <p className="text-xs text-docka-500 dark:text-zinc-500">{portal.status === 'active' ? `Sincronizando • ${portal.leads}` : 'Desconectado'}</p>
                                                </div>
                                            </div>
                                            <button className={`text-docka-400 dark:text-zinc-600 hover:text-docka-600 dark:hover:text-zinc-400 ${portal.status === 'active' ? 'text-emerald-600 dark:text-emerald-500' : ''}`}>
                                                {portal.status === 'active' ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-6 py-3 bg-docka-50 dark:bg-zinc-800/50 border-t border-docka-100 dark:border-zinc-800">
                                    <label className="block text-xs font-bold text-docka-600 dark:text-zinc-400 uppercase mb-1">URL do Feed XML (Padrão VivaReal)</label>
                                    <div className="flex gap-2">
                                        <input className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded text-xs text-docka-500 dark:text-zinc-400 font-mono" value="https://feed.umachave.com.br/xml/listings.xml" readOnly />
                                        <button className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline">Copiar</button>
                                    </div>
                                </div>
                            </div>

                            {/* Digital Signature */}
                            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                                    <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                        <FileSignature size={16} /> Assinatura Digital
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-xs">DocuSign</div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100">DocuSign Integration</h4>
                                            <p className="text-xs text-docka-500 dark:text-zinc-500">Para assinatura de contratos de locação e venda.</p>
                                        </div>
                                        <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">Conectado</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Environment</label>
                                            <select className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100">
                                                <option>Production</option>
                                                <option>Sandbox (Test)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Account ID</label>
                                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none text-docka-900 dark:text-zinc-100" type="password" value="********" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PORTAL */}
                    {activeTab === 'portal' && (
                        <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                    <Globe size={16} /> Área do Cliente (Inquilino/Proprietário)
                                </h3>
                                <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">ATIVO</span>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg flex gap-4 items-start">
                                    <Key size={24} className="text-orange-600 dark:text-orange-500 shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-orange-900 dark:text-orange-200">Portal Unificado</h4>
                                        <p className="text-xs text-orange-800 dark:text-orange-300 mt-1">
                                            Inquilinos acessam boletos e abrem chamados. Proprietários visualizam extratos de repasse e vacância.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cor Primária do Portal</label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-orange-600 border border-docka-200 dark:border-zinc-700" />
                                            <input className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" defaultValue="#EA580C" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Subdomínio</label>
                                        <div className="flex items-center">
                                            <input className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-l-lg text-sm text-right text-docka-900 dark:text-zinc-100" defaultValue="cliente" />
                                            <span className="bg-docka-50 dark:bg-zinc-700 border border-l-0 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-400 text-sm px-3 py-2 rounded-r-lg font-mono">.umachave.com</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-docka-50 dark:bg-zinc-800/50 border-t border-docka-100 dark:border-zinc-800 flex justify-end">
                                <button className="text-orange-600 dark:text-orange-400 text-sm font-bold hover:underline">Ver como Cliente &rarr;</button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-docka-200 dark:border-zinc-800 mt-8">
                        <button className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors shadow-sm flex items-center gap-2">
                            <Save size={16} /> Salvar Configurações
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UmaChaveSettingsView;
