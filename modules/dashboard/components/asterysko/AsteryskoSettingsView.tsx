
import React, { useState, useEffect } from 'react';
import { Shield, CreditCard, Users, Link, Copy, Eye, Plus, Edit2, Trash2, DollarSign, Info, AlertCircle, Upload } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import api from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';
import { Organization } from '../../../../types';
import OrganizationIconSettings from '../../../../components/OrganizationIconSettings';

interface AsteryskoSettingsViewProps {
    onOpenClientPortal?: () => void;
    organization?: Organization;
}

interface Fee {
    id: string;
    name: string;
    description: string | null;
    value: number | string;
    officialTax: number | string | null;
    category: string;
}

const AsteryskoSettingsView: React.FC<AsteryskoSettingsViewProps> = ({ onOpenClientPortal, organization }) => {
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<Partial<Fee> | null>(null);
    const [saving, setSaving] = useState(false);
    const [inpiHistory, setInpiHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const { addToast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [clientPortalDomain, setClientPortalDomain] = useState(organization?.clientPortalDomain || '');

    useEffect(() => {
        if (organization?.clientPortalDomain !== undefined) {
            setClientPortalDomain(organization.clientPortalDomain || '');
        }
    }, [organization]);

    const handleUpdateDomain = async () => {
        if (!organization) return;
        try {
            await api.patch(`/organizations/${organization.id}`, { clientPortalDomain });
            addToast({ type: 'success', title: 'Salvo', message: 'Domínio atualizado com sucesso.' });
        } catch (error) {
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao atualizar o domínio.' });
        }
    };

    const categories = [
        { id: 'registration', label: 'Registro de Marca' },
        { id: 'monitoring', label: 'Acompanhamento' },
        { id: 'defense', label: 'Oposição / Defesa' },
        { id: 'certificate', label: 'Certificação' },
        { id: 'other', label: 'Outros Serviços' }
    ];

    useEffect(() => {
        fetchFees();
        fetchInpiHistory();
    }, []);

    const fetchInpiHistory = async () => {
        try {
            setLoadingHistory(true);
            const response = await api.get('/asterysko/inpi/history');
            setInpiHistory(response.data);
        } catch (error) {
            console.error('Error fetching INPI history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchFees = async () => {
        try {
            setLoading(true);
            const response = await api.get('/asterysko/fees');
            setFees(response.data);
        } catch (error) {
            console.error('Error fetching fees:', error);
            addToast({ type: 'error', title: 'Erro', message: 'Não foi possível carregar a tabela de honorários.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedFee?.name || !selectedFee?.value) {
            addToast({ type: 'error', title: 'Campos obrigatórios', message: 'Nome e valor são obrigatórios.' });
            return;
        }

        try {
            setSaving(true);
            const payload = {
                ...selectedFee,
                value: Number(selectedFee.value),
                officialTax: selectedFee.officialTax ? Number(selectedFee.officialTax) : null
            };

            if (selectedFee.id) {
                await api.put(`/asterysko/fees/${selectedFee.id}`, payload);
                addToast({ type: 'success', title: 'Sucesso', message: 'Honorário atualizado com sucesso.' });
            } else {
                await api.post('/asterysko/fees', payload);
                addToast({ type: 'success', title: 'Sucesso', message: 'Honorário criado com sucesso.' });
            }
            setIsModalOpen(false);
            fetchFees();
        } catch (error: any) {
            console.error('Error saving fee:', error);
            const errorMsg = error.response?.data?.error || 'Erro ao salvar honorário. Verifique o console ou o banco de dados.';
            addToast({ type: 'error', title: 'Erro ao Salvar', message: errorMsg });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este honorário?')) return;
        try {
            await api.delete(`/asterysko/fees/${id}`);
            addToast({ type: 'success', title: 'Excluído', message: 'Honorário removido com sucesso.' });
            fetchFees();
        } catch (error) {
            console.error('Error deleting fee:', error);
            addToast({ type: 'error', title: 'Erro', message: 'Não foi possível excluir o honorário.' });
        }
    };

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !organization) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            await api.post(`/organizations/${organization.id}/logo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            addToast({
                type: 'success',
                title: 'Logo atualizada',
                message: 'A logo da organização foi atualizada com sucesso.',
            });
            window.location.reload();
        } catch (error) {
            console.error('Error uploading logo:', error);
            addToast({
                type: 'error',
                title: 'Erro no upload',
                message: 'Não foi possível atualizar a logo.',
            });
        }
    };

    return (
        <div className="h-full bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar p-8 transition-colors">
            <div className="max-w-4xl mx-auto pb-20">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 uppercase tracking-tight">Configurações Asterysko</h1>
                    <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Preferências do escritório, tabela de honorários e portal do cliente.</p>
                </div>

                <div className="space-y-8">

                    {/* INPI Integration & RPI Upload */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Shield size={16} /> Motor INPI (Revista da Propriedade Industrial)
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg text-xs text-blue-700 dark:text-blue-300 mb-4">
                                <strong>Importante:</strong> Faça o upload do arquivo XML das Revistas (RPI) semanais ou históricas do INPI para alimentar o nosso Motor de Busca de Viabilidade interno.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Upload Box */}
                                <div>
                                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Processar Revista (XML)</label>
                                    <div
                                        onClick={() => document.getElementById('rpi-upload')?.click()}
                                        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-docka-200 dark:border-zinc-700 rounded-xl hover:bg-docka-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                                    >
                                        <Upload size={24} className="text-docka-400 dark:text-zinc-500 mb-2" />
                                        <p className="text-sm font-bold text-docka-700 dark:text-zinc-300">Clique para selecionar o XML</p>
                                        <p className="text-[10px] text-docka-500 dark:text-zinc-500 mt-1 text-center">Tamanho máx recomendado: 100MB<br />O processamento rodará em segundo plano.</p>
                                    </div>
                                    <input
                                        id="rpi-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".xml"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            try {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                // Exemplo: Usamos o timestamp atual como número genérico caso não venha no nome
                                                formData.append('rpiNumber', file.name.replace(/[^0-9]/g, '') || String(Date.now()));

                                                addToast({ type: 'success', title: 'Upload Iniciado', message: `Enviando ${file.name} ao servidor...` });

                                                await api.post('/asterysko/inpi/parse', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });

                                                addToast({ type: 'success', title: 'Processamento Iniciado', message: 'O arquivo XML está sendo indexado no Motor de Busca em segundo plano.' });
                                            } catch (err: any) {
                                                console.error(err);
                                                addToast({ type: 'error', title: 'Falha no Envio', message: err.response?.data?.error || 'Erro ao comunicar com a API.' });
                                            } finally {
                                                // Limpa o input
                                                e.target.value = '';
                                                setTimeout(fetchInpiHistory, 1500); // refresh list
                                            }
                                        }}
                                    />
                                </div>

                                {/* Legacy Credentials info */}
                                <div>
                                    <p className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Acesso API Automática (Futuro)</p>
                                    <div className="space-y-4 opacity-50 pointer-events-none">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-docka-500 mb-1">Login e-INPI</label>
                                            <input className="w-full px-3 py-2 bg-docka-50 dark:bg-zinc-800/50 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-700" value="asterysko_pi" disabled />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-docka-500 mb-1">Senha</label>
                                            <input type="password" className="w-full px-3 py-2 bg-docka-50 dark:bg-zinc-800/50 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-700" value="********" disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* History List */}
                            <div className="mt-8 pt-6 border-t border-docka-100 dark:border-zinc-800">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase flex items-center gap-2">Histórico de Processamento</h4>
                                    <button onClick={fetchInpiHistory} className="text-xs px-3 py-1 bg-docka-100 dark:bg-zinc-800 text-docka-600 dark:text-zinc-300 rounded-md hover:bg-docka-200 dark:hover:bg-zinc-700 font-bold transition-colors">Atualizar</button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                    {loadingHistory ? (
                                        <div className="text-sm text-center text-docka-400 py-4">Carregando histórico...</div>
                                    ) : inpiHistory.length === 0 ? (
                                        <div className="text-sm border-2 border-dashed border-docka-200 dark:border-zinc-800 p-6 rounded-xl text-center text-docka-500 dark:text-zinc-500 flex flex-col items-center">
                                            <Info size={20} className="mb-2 opacity-50" />
                                            Nenhum histórico de Revista do INPI encontrado. Faça seu primeiro Upload.
                                        </div>
                                    ) : (
                                        inpiHistory.map((log: any) => (
                                            <div key={log.id} className="flex items-center justify-between p-3 bg-docka-50 dark:bg-zinc-800/50 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm transition-colors hover:border-docka-300">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                                        RPI {log.rpiNumber}
                                                        {log.status === 'PROCESSING' && <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full font-bold animate-pulse">Processando...</span>}
                                                        {log.status === 'COMPLETED' && <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full font-bold">Concluído</span>}
                                                        {log.status === 'FAILED' && <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-full font-bold" title={log.errorMessage}>Falhou</span>}
                                                    </span>
                                                    <span className="text-[10px] text-docka-500 uppercase mt-1">Data da Edição: {new Date(log.rpiDate).toLocaleDateString('pt-BR')} • {log.fileName}</span>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="font-mono font-bold text-docka-700 dark:text-zinc-300">{log.totalExtracted.toLocaleString('pt-BR')}</span>
                                                    <span className="text-[10px] text-docka-400 uppercase">Marcas extraídas</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Fees Table Section */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <CreditCard size={16} /> Tabela de Honorários Padrão
                            </h3>
                            <button
                                onClick={() => { setSelectedFee({ category: 'registration' }); setIsModalOpen(true); }}
                                className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded text-[10px] font-bold hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-1.5 shadow-sm"
                            >
                                <Plus size={14} /> Novo Serviço
                            </button>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="py-8 text-center text-docka-400 text-xs italic">Carregando honorários...</div>
                            ) : (
                                <>
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-[10px] text-docka-500 dark:text-zinc-500 uppercase font-bold border-b border-docka-100 dark:border-zinc-800 tracking-widest">
                                            <tr>
                                                <th className="pb-3 text-left">Serviço</th>
                                                <th className="pb-3 text-right pr-6">Valor Padrão</th>
                                                <th className="pb-3 text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                                            {fees.map((fee) => (
                                                <tr key={fee.id} className="group hover:bg-docka-50/50 dark:hover:bg-zinc-800/30">
                                                    <td className="py-3">
                                                        <p className="font-bold text-docka-900 dark:text-zinc-100 text-sm">{fee.name}</p>
                                                        {fee.description && <p className="text-[10px] text-docka-500 dark:text-zinc-500">{fee.description}</p>}
                                                    </td>
                                                    <td className="py-3 text-right pr-6 font-mono font-bold text-docka-900 dark:text-zinc-100">
                                                        R$ {Number(fee.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => { setSelectedFee(fee); setIsModalOpen(true); }}
                                                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(fee.id)}
                                                                className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {fees.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="py-8 text-center text-docka-400 text-xs italic">Nenhum honorário cadastrado.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </>
                            )}
                            <div className="mt-6 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 flex gap-3">
                                <Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-800/80 dark:text-blue-300/60 leading-relaxed italic">
                                    Estes valores servem de base para o CRM. Você ainda poderá ajustar o valor individual de cada lead durante o fechamento.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Client Portal Management */}
                    <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-docka-100 dark:border-zinc-800 bg-docka-50/30 dark:bg-zinc-800/30 flex justify-between items-center">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                                <Users size={16} /> Portal do Cliente
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
                                            portal.asterysko.com/login
                                        </div>
                                        <button className="p-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg hover:bg-docka-50 dark:hover:bg-zinc-700 text-docka-600 dark:text-zinc-400">
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            onClick={onOpenClientPortal}
                                            className="px-4 py-2 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                                        >
                                            <Eye size={16} /> Visualizar como Cliente
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-docka-900 dark:text-zinc-100 mb-2">Personalização e Domínio</h4>

                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Domínio Customizado (White-Label)</label>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <input
                                                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors"
                                                placeholder="Ex: cliente.asterysko.com"
                                                value={clientPortalDomain}
                                                onChange={(e) => setClientPortalDomain(e.target.value)}
                                                onBlur={handleUpdateDomain}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleUpdateDomain();
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={handleUpdateDomain}
                                                className="px-4 py-2 bg-docka-100 dark:bg-zinc-800 text-docka-700 dark:text-zinc-300 rounded-lg text-sm font-bold hover:bg-docka-200 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                Salvar
                                            </button>
                                        </div>
                                        {clientPortalDomain && (
                                            <div className="mt-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700/50">
                                                <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                                    Configuração de Zona DNS
                                                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold">Pendente</span>
                                                </h5>
                                                <p className="text-[10px] text-slate-500 dark:text-zinc-500 mb-4">Adicione o registro abaixo no seu provedor de domínio (Cloudflare, Hostinger, Registro.br, etc) para ativar o redirecionamento. A propagação pode levar alguns minutos.</p>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mb-1">Tipo</span>
                                                        <div className="text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-2 py-1.5 rounded w-full text-docka-900 dark:text-zinc-100">CNAME</div>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mb-1 flex items-center justify-between">
                                                            Nome / Host
                                                        </span>
                                                        <div className="text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-2 py-1.5 rounded w-full text-docka-900 dark:text-zinc-100 truncate" title={clientPortalDomain}>
                                                            {clientPortalDomain.split('.').length > 2 ? clientPortalDomain.split('.')[0] : '@'}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mb-1 flex items-center justify-between">
                                                            Valor / Destino
                                                        </span>
                                                        <div className="text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-2 py-1.5 rounded w-full text-docka-900 dark:text-zinc-100 truncate">
                                                            cname.vercel-dns.com
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cor Primária</label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded bg-blue-600 border border-docka-200 dark:border-zinc-700" />
                                            <input className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-docka-900 dark:text-zinc-100" defaultValue="#2563EB" />
                                        </div>
                                    </div>

                                    {/* Logo Upload Section */}
                                    <div>
                                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Logo do Portal</label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                        <div className="flex items-center gap-3">
                                            {organization?.logo && (
                                                <div className="w-10 h-10 rounded-lg bg-white border border-docka-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                                                    <img src={`${api.defaults.baseURL?.replace('/api', '')}${organization.logo}`} alt="Logo" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                            <button
                                                onClick={handleLogoClick}
                                                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-left text-docka-500 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                {organization?.logo ? 'Alterar imagem...' : 'Carregar imagem...'}
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                {organization && (
                                    <div className="mt-8 pt-6 border-t border-docka-100 dark:border-zinc-800">
                                        <OrganizationIconSettings organization={organization} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* MODAL: ADD/EDIT FEE */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { if (!saving) setIsModalOpen(false); }}
                title={selectedFee?.id ? 'Editar Serviço' : 'Novo Serviço'}
                size="md"
                footer={
                    <div className="flex justify-end gap-2 outline-none">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : selectedFee?.id ? 'Atualizar' : 'Salvar'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 text-left">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Nome do Serviço</label>
                            <input
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Ex: Pedido de Registro de Marca"
                                value={selectedFee?.name || ''}
                                onChange={(e) => setSelectedFee({ ...selectedFee, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Descrição (Opcional)</label>
                            <textarea
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors"
                                placeholder="Breve descrição do que está incluso..."
                                rows={2}
                                value={selectedFee?.description || ''}
                                onChange={(e) => setSelectedFee({ ...selectedFee, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Honorários (R$)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 font-bold focus:border-blue-500 outline-none transition-colors"
                                        placeholder="0,00"
                                        value={selectedFee?.value || ''}
                                        onChange={(e) => setSelectedFee({ ...selectedFee, value: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5 font-mono">Taxa Oficial (R$)</label>
                                <div className="relative">
                                    <AlertCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-500 dark:text-zinc-400 focus:border-blue-500 outline-none transition-colors"
                                        placeholder="Taxa INPI"
                                        value={selectedFee?.officialTax || ''}
                                        onChange={(e) => setSelectedFee({ ...selectedFee, officialTax: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Categoria</label>
                            <select
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-zinc-100 focus:border-blue-500 outline-none transition-colors"
                                value={selectedFee?.category || 'registration'}
                                onChange={(e) => setSelectedFee({ ...selectedFee, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AsteryskoSettingsView;
