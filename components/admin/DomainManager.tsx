import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, CheckCircle, AlertCircle, RefreshCw, Copy } from 'lucide-react';
import { Organization, Domain } from '../../types';
import { domainService } from '../../services/domainService';
import { useToast } from '../../context/ToastContext';

interface DomainManagerProps {
    organizations: Organization[];
}

const DomainManager: React.FC<DomainManagerProps> = ({ organizations }) => {
    const [selectedOrgId, setSelectedOrgId] = useState<string>(organizations[0]?.id || '');
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDomainName, setNewDomainName] = useState('');
    const [expandedDomainId, setExpandedDomainId] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        if (selectedOrgId) {
            loadDomains();
        }
    }, [selectedOrgId]);

    const loadDomains = async () => {
        setLoading(true);
        try {
            const data = await domainService.listDomains(selectedOrgId);
            setDomains(data);
        } catch (error) {
            console.error('Failed to load domains', error);
            addToast({ type: 'error', title: 'Erro ao carregar domínios', duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomainName) return;

        setCreateLoading(true);
        try {
            const newDomain = await domainService.createDomain(selectedOrgId, newDomainName);
            setDomains([...domains, newDomain]);
            setIsModalOpen(false);
            setNewDomainName('');
            addToast({ type: 'success', title: 'Domínio adicionado com sucesso', duration: 4000 });
            // Automatically expand the new domain to show DNS records
            setExpandedDomainId(newDomain.id);
        } catch (error: any) {
            console.error('Failed to create domain', error);
            addToast({ type: 'error', title: error.response?.data?.error || 'Erro ao adicionar domínio', duration: 4000 });
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteDomain = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja remover este domínio?')) return;
        try {
            await domainService.deleteDomain(id);
            setDomains(domains.filter(d => d.id !== id));
            addToast({ type: 'success', title: 'Domínio removido', duration: 4000 });
        } catch (error) {
            console.error('Failed to delete domain', error);
            addToast({ type: 'error', title: 'Erro ao remover domínio', duration: 4000 });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        addToast({ type: 'success', title: 'Copiado para a área de transferência', duration: 2000 });
    };

    const toggleExpand = (id: string) => {
        setExpandedDomainId(expandedDomainId === id ? null : id);
    };

    return (
        <div className="bg-white rounded-xl border border-docka-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-docka-200 flex justify-between items-center bg-white">
                <div>
                    <h2 className="text-lg font-bold text-docka-900">Gerenciamento de Domínios</h2>
                    <p className="text-xs text-docka-500">Configure domínios personalizados para envio de e-mails via AWS SES.</p>
                </div>
                <div className="flex gap-3">
                    <select
                        className="px-3 py-1.5 text-sm bg-docka-50 border border-docka-200 rounded-md outline-none focus:border-docka-400 transition-colors w-64"
                        value={selectedOrgId}
                        onChange={(e) => setSelectedOrgId(e.target.value)}
                    >
                        {organizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-3 py-1.5 text-sm bg-docka-900 text-white rounded-md hover:bg-docka-800 transition-colors shadow-sm"
                    >
                        <Plus size={16} className="mr-2" /> Novo Domínio
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-docka-50 text-docka-500 uppercase text-xs font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-3 border-b border-docka-100">Domínio</th>
                            <th className="px-6 py-3 border-b border-docka-100">Status</th>
                            <th className="px-6 py-3 border-b border-docka-100">Criado em</th>
                            <th className="px-6 py-3 border-b border-docka-100 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-docka-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-docka-500">
                                    <RefreshCw className="animate-spin mx-auto mb-2" size={20} />
                                    Carregando domínios...
                                </td>
                            </tr>
                        ) : domains.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-docka-500">
                                    Nenhum domínio configurado para esta organização.
                                </td>
                            </tr>
                        ) : (
                            domains.map((domain) => (
                                <React.Fragment key={domain.id}>
                                    <tr className="hover:bg-docka-50 transition-colors cursor-pointer" onClick={() => toggleExpand(domain.id)}>
                                        <td className="px-6 py-4 font-medium text-docka-900 flex items-center">
                                            <Globe size={16} className="mr-2 text-docka-400" />
                                            {domain.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {domain.status === 'VERIFIED' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    <CheckCircle size={12} className="mr-1" /> Verificado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                    <AlertCircle size={12} className="mr-1" /> Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-docka-500">
                                            {new Date(domain.createdAt!).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteDomain(domain.id); }}
                                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                                title="Remover Domínio"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                    {/* DNS Records Detail Row */}
                                    {expandedDomainId === domain.id && (
                                        <tr className="bg-docka-50">
                                            <td colSpan={4} className="px-6 py-4 border-b border-docka-200">
                                                <div className="bg-white p-4 rounded-lg border border-docka-200">
                                                    <h4 className="font-semibold text-docka-900 mb-3 flex items-center">
                                                        Configuração DNS (Adicione no seu provedor de domínio)
                                                    </h4>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-xs font-semibold text-docka-500 uppercase mb-1">Registro TXT (Verificação)</p>
                                                            <div className="flex items-center bg-docka-100 p-2 rounded text-xs font-mono text-docka-700 break-all justify-between">
                                                                <span>_amazonses.{domain.name}</span>
                                                                <span className="mx-2 text-docka-400">=</span>
                                                                <span className="flex-1 mr-2">{domain.verificationToken}</span>
                                                                <button onClick={() => copyToClipboard(domain.verificationToken || '')} className="text-docka-500 hover:text-docka-900">
                                                                    <Copy size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-docka-500 uppercase mb-1">Registros CNAME (DKIM)</p>
                                                            {domain.dkimTokens?.map((token, idx) => (
                                                                <div key={idx} className="flex items-center bg-docka-100 p-2 rounded text-xs font-mono text-docka-700 break-all justify-between mb-1">
                                                                    <span>{token}._domainkey.{domain.name}</span>
                                                                    <span className="mx-2 text-docka-400">CNAME</span>
                                                                    <span className="flex-1 mr-2">{token}.dkim.amazonses.com</span>
                                                                    <button onClick={() => copyToClipboard(`${token}.dkim.amazonses.com`)} className="text-docka-500 hover:text-docka-900">
                                                                        <Copy size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100 flex items-start">
                                                        <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                                                        <p>
                                                            Após adicionar esses registros no seu provedor DNS, a AWS pode levar de alguns minutos até 72 horas para verificar o domínio. O status atualizará automaticamente para "Verificado" assim que a propagação ocorrer.
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Domain Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-docka-900 mb-4">Adicionar Novo Domínio</h3>
                        <form onSubmit={handleCreateDomain}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-docka-700 mb-1">Nome do Domínio</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="ex: tokyon.com.br"
                                        className="w-full pl-9 pr-3 py-2 border border-docka-300 rounded-md focus:outline-none focus:ring-2 focus:ring-docka-500"
                                        value={newDomainName}
                                        onChange={e => setNewDomainName(e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-docka-500 mt-1">
                                    Não inclua 'http://' ou 'www'. Apenas o domínio raiz.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-docka-600 hover:bg-docka-50 rounded-md text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 bg-docka-900 text-white rounded-md text-sm font-medium hover:bg-docka-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {createLoading ? <RefreshCw className="animate-spin mr-2" size={16} /> : null}
                                    Adicionar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DomainManager;
