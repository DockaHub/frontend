import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, CheckCircle2, Clock, AlertCircle, FileSignature, Shield, Download, Upload, File, FilePlus, Scale, ChevronRight, Briefcase, Trash2, ChevronDown, Activity } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

interface Client {
    id: string;
    name: string;
    email: string;
    company?: string;
}

// Timeline Data for a specific process (Helper)
const getTimelineEvents = (process: any) => {
    const events = [];

    // 1. Add Dispatches from DB
    if (process.dispatches && process.dispatches.length > 0) {
        const sorted = [...process.dispatches].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        sorted.forEach((d: any) => {
            events.push({
                type: 'dispatch',
                title: d.isVirtual ? d.description : `${d.code} - ${d.description}`,
                date: new Date(d.createdAt).toLocaleDateString('pt-BR'),
                status: 'completed',
                desc: d.details || `Publicado na RPI ${d.rpiNumber}`
            });
        });
    }

    // 2. Depósito do Pedido
    if (process.inpiProcessNumber || process.status !== 'NEW') {
        events.push({
            type: 'dispatch',
            title: 'Depósito do Pedido',
            date: new Date(process.createdAt).toLocaleDateString('pt-BR'),
            status: 'completed',
            desc: `Protocolo gerado: ${process.inpiProcessNumber || 'Pendente'}`
        });
    }

    // 3. Procuração Event
    events.push({
        type: 'proxy',
        title: 'Procuração INPI',
        date: process.createdAt ? new Date(process.createdAt).toLocaleDateString('pt-BR') : '',
        desc: process.proxySignStatus === 'VALIDATED' ? 'Procuração validada' : (process.proxySignStatus === 'SIGNED' ? 'Procuração enviada' : 'Aguardando envio da Procuração'),
        status: process.proxySignStatus === 'VALIDATED' || process.proxySignStatus === 'SIGNED' ? 'completed' : 'pending',
        internalState: process.proxySignStatus
    });

    // 4. Contrato Event
    events.push({
        type: 'contract',
        title: 'Contrato Assinado',
        date: process.contractSignDate ? new Date(process.contractSignDate).toLocaleDateString('pt-BR') : (process.createdAt ? new Date(process.createdAt).toLocaleDateString('pt-BR') : ''),
        desc: process.contractSignStatus === 'SIGNED' ? 'Contrato assinado.' : 'Aguardando assinatura.',
        status: process.contractSignStatus === 'SIGNED' ? 'completed' : 'pending',
        internalState: process.contractSignStatus
    });

    return events;
};

import api, { getBackendUrl } from '../../../../services/api';

const AsteryskoProcessesView: React.FC = () => {
    const [processes, setProcesses] = useState<any[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'timeline' | 'docs'>('timeline');
    const [isNewProcessOpen, setIsNewProcessOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    // Helper for Status Translation
    const formatStatus = (status: string) => {
        const map: Record<string, string> = {
            'NEW': 'Novo',
            'WAITING_PAYMENT': 'Aguardando Pagamento',
            'WAITING_DOCS': 'Aguardando Documentos',
            'FILED': 'Protocolado',
            'EXAMINATION': 'Em Exame',
            'OPPOSITION': 'Oposição',
            'GRANTED': 'Concedido',
            'DENIED': 'Indeferido',
            'RETIRED': 'Arquivado',
            'APPEAL': 'Em Recurso'
        };
        return map[status] || status;
    };

    // Helper for Next Step
    const getNextStep = (status: string) => {
        const s = status || '';
        if (s === 'NEW') return 'Revisar Dados';
        if (s === 'WAITING_PAYMENT') return 'Confirmar Pagamento';
        if (s === 'WAITING_DOCS') return 'Anexar Documentos';
        if (s === 'FILED') return 'Acompanhar RPI';
        if (s === 'EXAMINATION') return 'Aguardar Parecer';
        if (s === 'GRANTED') return 'Pagar Decênio';
        if (s === 'DENIED') return 'Analisar Recurso';
        if (s === 'OPPOSITION') return 'Manifestar Oposição';

        // Backward compatibility for Portuguese strings if any
        const lower = s.toLowerCase();
        if (lower.includes('aguardando exame')) return 'Acompanhar RPI';
        if (lower.includes('deferido')) return 'Pagar Taxas';
        if (lower.includes('indeferido')) return 'Analisar Recurso';
        if (lower.includes('concedido')) return 'Monitorar Vigência';

        return 'Consultar H. Despacho';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Processes
                const procRes = await api.get('/asterysko/processes');
                const mapped = procRes.data.map((p: any) => ({
                    id: p.id,
                    displayId: p.inpiProcessNumber || 'Pendente',
                    title: p.brand?.name || 'Sem Marca',
                    client: p.brand?.client?.user?.name || 'Sem Cliente',
                    class: p.brand?.nclClasses?.[0] ? `NCL ${p.brand.nclClasses[0]}` : 'N/A',
                    status: p.status,
                    date: new Date(p.updatedAt).toLocaleDateString('pt-BR'),
                    nextStep: getNextStep(p.status),
                    dispatches: p.dispatches,
                    createdAt: p.createdAt,
                    proxyUrl: p.proxyUrl,
                    contractUrl: p.contractUrl,
                    logoUrl: p.brand?.logoUrl
                }));
                setProcesses(mapped);

                // Fetch Clients
                const clientRes = await api.get('/asterysko/clients');
                setClients(clientRes.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
    }, []);

    // Helper for Status Badge
    const getStatusColor = (status: string) => {
        const s = status || '';
        if (s === 'GRANTED' || s === 'Concedido') return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
        if (s === 'FILED' || s === 'Publicado') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
        if (s === 'WAITING_PAYMENT' || s === 'WAITING_DOCS') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
        if (s === 'NEW') return 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400';
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    };

    // State for New Process Form
    const [newProcessData, setNewProcessData] = useState({
        inpiProcessNumber: '',
        date: '',
        brandName: '',
        clientName: '',
        nclClass: '',
        status: 'NEW', // Default to code
        type: 'MISTA', // Default
        logoUrl: ''
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProcessData(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateProcess = async () => {
        try {
            await api.post('/asterysko/processes', {
                inpiProcessNumber: newProcessData.inpiProcessNumber,
                rpiDate: newProcessData.date,
                brandName: newProcessData.brandName,
                clientName: newProcessData.clientName,
                nclClass: newProcessData.nclClass,
                status: newProcessData.status,
                brandType: newProcessData.type,
                logoUrl: newProcessData.logoUrl
            });
            setIsNewProcessOpen(false);

            // Refetch processes instead of reloading
            const response = await api.get('/asterysko/processes'); // Note: This might need to be /asterysko/portal/processes if that's what we are using now? 
            // Actually, keep consistency with what is used in useEffect: /asterysko/portal/processes
            // But wait, the useEffect used /asterysko/portal/processes. 
            // The handleCreateProcess used /asterysko/processes in the original code, BUT the useEffect used /asterysko/portal/processes
            // I should probably check if I should update the endpoint here too.
            // For now, let's just fix the mapping keys.
            const mapped = response.data.map((p: any) => ({
                id: p.id,
                displayId: p.inpiProcessNumber || 'Pendente',
                title: p.brand?.name,
                client: p.brand?.client?.user?.name,
                class: p.brand?.nclClasses?.[0] ? `NCL ${String(p.brand.nclClasses[0])}` : 'N/A',
                status: p.status,
                date: new Date(p.updatedAt).toLocaleDateString('pt-BR'),
                nextStep: getNextStep(p.status),
                dispatches: p.dispatches,
                createdAt: p.createdAt,
                proxyUrl: p.proxyUrl,
                contractUrl: p.contractUrl,
                logoUrl: p.brand?.logoUrl
            }));
            setProcesses(mapped);

        } catch (error: any) {
            console.error('Failed to create process', error);
            const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido';
            alert(`Erro ao criar processo: ${errorMessage}`);
        }
    };

    const handleDeleteProcess = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent row click
        if (confirm('Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.')) {
            try {
                await api.delete(`/asterysko/processes/${id}`);
                setProcesses(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                console.error('Failed to delete process', error);
                alert('Erro ao excluir processo.');
            }
        }
    };

    // ==========================================
    // MODULE: Process Details Actions (Phase 6)
    // ==========================================
    const [isStatusEditOpen, setIsStatusEditOpen] = useState(false);
    const [newStatusData, setNewStatusData] = useState({ status: '', description: '', details: '' });
    const [uploadingProxy, setUploadingProxy] = useState(false);

    const handleDownloadContract = async (process: any) => {
        try {
            if (!process.contractUrl) return alert('Contrato ainda não assinado.');
            if (process.contractUrl.startsWith('/api')) {
                // Endpoint returns { contract: base64 } or triggers direct DL. 
                const res = await api.get(process.contractUrl);
                if (res.data.contract) {
                    // If it's pure base64 pdf data string returned
                    const link = document.createElement('a');
                    link.href = res.data.contract.startsWith('data:') ? res.data.contract : `data:application/pdf;base64,${res.data.contract}`;
                    link.download = `Contrato_${process.title}.pdf`;
                    link.click();
                } else {
                    alert(res.data.message || 'Contrato requisitado com sucesso.');
                }
            } else {
                window.open(process.contractUrl, '_blank');
            }
        } catch (err: any) {
            console.error(err);
            alert('Falha ao baixar o contrato.');
        }
    };

    const handleGenerateProxy = async (process: any) => {
        if (!confirm('Deseja gerar e enviar o documento de Procuração modelo para o cliente?')) return;
        try {
            const res = await api.post(`/asterysko/processes/${process.id}/proxy/generate`);
            alert(res.data.message);
            setSelectedProcess({ ...process, proxySignStatus: 'PENDING', _forceRerender: Date.now() });
        } catch (err: any) {
            alert('Erro ao gerar Procuração.');
        }
    };

    const handleProxyFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, processId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingProxy(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post(`/asterysko/processes/${processId}/proxy/upload`, formData);
            alert('Enviado com sucesso!');
            setSelectedProcess((prev: any) => prev ? { ...prev, proxyUrl: res.data.proxyUrl } : null);
            // Also update main list silently
            setProcesses((prev: any[]) => prev.map((p: any) => p.id === processId ? { ...p, proxyUrl: res.data.proxyUrl } : p));
        } catch (error) {
            console.error('Proxy upload error', error);
            alert('Erro no envio da Procuração.');
        } finally {
            setUploadingProxy(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedProcess || !newStatusData.status || !newStatusData.description) return alert('Preencha pelo menos Status e Descrição do Despacho.');
        try {
            const res = await api.post(`/asterysko/processes/${selectedProcess.id}/status-update`, {
                status: newStatusData.status,
                dispatchDescription: newStatusData.description,
                dispatchDetails: newStatusData.details
            });
            alert('Evolução lançada no histórico com sucesso!');
            // Prepend new dispatch to Timeline visually
            const newProcessObj = {
                ...selectedProcess,
                status: newStatusData.status,
                nextStep: getNextStep(newStatusData.status),
                dispatches: [res.data.dispatch, ...(selectedProcess.dispatches || [])]
            };
            setSelectedProcess(newProcessObj);
            setProcesses(prev => prev.map(p => p.id === selectedProcess.id ? newProcessObj : p));
            setIsStatusEditOpen(false);
            setNewStatusData({ status: '', description: '', details: '' });
        } catch (error) {
            alert('Erro ao evoluir status.');
        }
    };

    return (
        <div className="h-full flex flex-col bg-docka-50 dark:bg-zinc-950 animate-in fade-in duration-300 p-8 overflow-hidden transition-colors">

            <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Processos INPI</h1>
                        <p className="text-docka-500 dark:text-zinc-400 text-sm mt-1">Gestão de marcas, patentes e acompanhamento processual.</p>
                    </div>
                    <button
                        onClick={() => setIsNewProcessOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Novo Processo
                    </button>
                </div>

                {/* Filters & List */}
                <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1 min-h-0">
                    <div className="p-4 border-b border-docka-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-docka-50/30 dark:bg-zinc-800/30 shrink-0">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                            <input className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-blue-400 dark:focus:border-blue-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600" placeholder="Buscar por marca, cliente ou número..." />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <select className="px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-docka-600 dark:text-zinc-400 outline-none focus:border-blue-400">
                                <option>Todos os Status</option>
                                <option>Aguardando Exame</option>
                                <option>Publicado</option>
                                <option>Deferido</option>
                                <option>Concedido</option>
                            </select>
                            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700/50">
                                <Filter size={14} /> Mais Filtros
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-docka-50 dark:bg-zinc-800/50 text-docka-500 dark:text-zinc-500 font-semibold text-xs uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3">Marca</th>
                                    <th className="px-6 py-3">Número INPI</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Classe</th>
                                    <th className="px-6 py-3">Status Atual</th>
                                    <th className="px-6 py-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-docka-100 dark:divide-zinc-800">
                                {processes.map((proc) => {
                                    const isAlert = proc.nextStep === 'Pagar Taxas' || proc.nextStep === 'Cumprir Exigência';
                                    return (
                                        <tr key={proc.id} className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer" onClick={() => setSelectedProcess(proc)}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {proc.logoUrl ? (
                                                        <img src={proc.logoUrl} alt="" className="w-8 h-8 rounded bg-white border border-docka-100 object-contain" />
                                                    ) : (proc.title.substring(0, 1))}
                                                    <span className="font-bold text-docka-900 dark:text-zinc-100">{proc.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-docka-600 dark:text-zinc-400 text-xs">{proc.displayId}</td>
                                            <td className="px-6 py-4 text-docka-700 dark:text-zinc-300">{proc.client}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 bg-docka-100 dark:bg-zinc-800 rounded text-xs font-medium text-docka-600 dark:text-zinc-400">{proc.class}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusColor(proc.status)}`}>
                                                        {formatStatus(proc.status)}
                                                    </span>
                                                    <div className={`flex items-center gap-1 text-[10px] font-bold ${isAlert ? 'text-rose-500' : 'text-amber-500'}`}>
                                                        {isAlert && <AlertCircle size={10} />}
                                                        {proc.nextStep}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => handleDeleteProcess(e, proc.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Excluir Processo"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button className="text-docka-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* NEW PROCESS MODAL */}
            <Modal
                isOpen={isNewProcessOpen}
                onClose={() => setIsNewProcessOpen(false)}
                title="Cadastrar Novo Processo INPI"
                size="lg"
                footer={
                    <>
                        <button onClick={() => setIsNewProcessOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                        <button onClick={handleCreateProcess} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white/90 rounded-lg shadow-sm">Cadastrar</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Número do Processo</label>
                            <div className="relative">
                                <Scale size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" />
                                <input
                                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                                    placeholder="900000000"
                                    value={newProcessData.inpiProcessNumber}
                                    onChange={(e) => setNewProcessData({ ...newProcessData, inpiProcessNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Data de Depósito</label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                                value={newProcessData.date}
                                onChange={(e) => setNewProcessData({ ...newProcessData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Nome da Marca</label>
                        <input
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                            placeholder="Ex: ASTERY"
                            value={newProcessData.brandName}
                            onChange={(e) => setNewProcessData({ ...newProcessData, brandName: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Tipo de Marca</label>
                            <select
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                                value={newProcessData.type}
                                onChange={(e) => setNewProcessData({ ...newProcessData, type: e.target.value })}
                            >
                                <option value="NOMINATIVA">Nominativa</option>
                                <option value="MISTA">Mista</option>
                                <option value="FIGURATIVA">Figurativa</option>
                                <option value="TRIDIMENSIONAL">Tridimensional</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Logotipo (Opcional)</label>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 hover:bg-docka-50 dark:hover:bg-zinc-700 text-docka-600 dark:text-zinc-400 px-3 py-2 rounded-lg text-sm w-full text-center truncate transition-colors">
                                    {newProcessData.logoUrl ? 'Imagem Selecionada' : 'Escolher Arquivo...'}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                {newProcessData.logoUrl && (
                                    <img src={newProcessData.logoUrl} alt="Preview" className="w-9 h-9 object-contain rounded bg-white border border-docka-200" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Cliente Titular</label>
                            <div className="relative">
                                <div
                                    onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100 cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-docka-400 dark:text-zinc-500" />
                                        <span className="truncate">
                                            {newProcessData.clientName || 'Selecionar cliente...'}
                                        </span>
                                    </div>
                                    <ChevronDown size={14} className={`text-docka-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {isClientDropdownOpen && (
                                    <div className="absolute z-[70] w-full mt-1 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-2 border-b border-docka-100 dark:border-zinc-800">
                                            <div className="relative">
                                                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-docka-400" />
                                                <input
                                                    autoFocus
                                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md outline-none focus:border-docka-400"
                                                    placeholder="Pesquisar cliente..."
                                                    value={clientSearch}
                                                    onChange={(e) => setClientSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin">
                                            {(clients || []).filter(c =>
                                                c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                                (c.company && c.company.toLowerCase().includes(clientSearch.toLowerCase()))
                                            ).map(c => (
                                                <div
                                                    key={c.id}
                                                    onClick={() => {
                                                        setNewProcessData({ ...newProcessData, clientName: c.name });
                                                        setIsClientDropdownOpen(false);
                                                        setClientSearch('');
                                                    }}
                                                    className="px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-md cursor-pointer transition-colors"
                                                >
                                                    <div className="font-medium">{c.name}</div>
                                                    <div className="text-[10px] opacity-60">{c.company || 'Sem Empresa'}</div>
                                                </div>
                                            ))}
                                            {(clients || []).filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).length === 0 && (
                                                <div className="px-3 py-4 text-xs text-center text-docka-400 italic">
                                                    Nenhum cliente encontrado.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Classe NCL</label>
                            <input
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                                placeholder="Ex: 35"
                                value={newProcessData.nclClass}
                                onChange={(e) => setNewProcessData({ ...newProcessData, nclClass: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Status Inicial</label>
                        <input
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 text-docka-900 dark:text-zinc-100"
                            placeholder="Ex: Aguardando Exame de Mérito"
                            value={newProcessData.status}
                            onChange={(e) => setNewProcessData({ ...newProcessData, status: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>

            {/* PROCESS DETAILS MODAL */}
            {selectedProcess && (
                <Modal
                    isOpen={!!selectedProcess}
                    onClose={() => setSelectedProcess(null)}
                    title={`Processo: ${selectedProcess.title}`}
                    size="xl"
                >
                    {isStatusEditOpen ? (
                        <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 p-4 border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl mb-6">
                            <h3 className="font-bold text-docka-900 dark:text-zinc-100 flex items-center gap-2">
                                <Activity size={18} className="text-blue-600" /> Evoluir Processo
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-docka-700 dark:text-zinc-300 mb-1 block">Novo Status</label>
                                    <select
                                        className="w-full bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-docka-900 dark:text-zinc-100"
                                        value={newStatusData.status}
                                        onChange={e => setNewStatusData({ ...newStatusData, status: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="WAITING_PAYMENT">Aguardando Pagto.</option>
                                        <option value="PROTOCOL_PENDING">Aguardando Protocolo</option>
                                        <option value="PUBLISHED">Publicado RPI</option>
                                        <option value="OPPOSITION_OPEN">Oposição Aberta</option>
                                        <option value="WAITING_MERIT">Aguardando Exame de Mérito</option>
                                        <option value="DEFERRED">Processo Deferido</option>
                                        <option value="REJECTED">Processo Indeferido</option>
                                        <option value="CONCESSAO_EMITIDA">Concessão Emitida</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-docka-700 dark:text-zinc-300 mb-1 block">Título do Andamento</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Protocolo Realizado"
                                        className="w-full bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-docka-900 dark:text-zinc-100"
                                        value={newStatusData.description}
                                        onChange={e => setNewStatusData({ ...newStatusData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-docka-700 dark:text-zinc-300 mb-1 block">Detalhes Adicionais (Público)</label>
                                <textarea
                                    className="w-full bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-docka-900 dark:text-zinc-100 min-h-[80px]"
                                    placeholder="Descreva o que ocorreu ou instruções para o cliente..."
                                    value={newStatusData.details}
                                    onChange={e => setNewStatusData({ ...newStatusData, details: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsStatusEditOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                                <button onClick={handleUpdateStatus} className="px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                                    <CheckCircle2 size={16} /> Salvar Evolução
                                </button>
                            </div>
                        </div>
                    ) : null}

                    <div className="flex flex-col h-[600px] -mt-2">

                        {/* Header Info */}
                        <div className="flex justify-between items-start pb-6 border-b border-docka-100 dark:border-zinc-800 mb-6 shrink-0">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                    {selectedProcess.title.substring(0, 2)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">{selectedProcess.title}</h2>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-docka-500 dark:text-zinc-400">
                                        <span className="flex items-center gap-1 font-mono bg-docka-100 dark:bg-zinc-800 px-1.5 rounded"><Scale size={12} /> {selectedProcess.displayId}</span>
                                        <span>•</span>
                                        <span>{selectedProcess.client}</span>
                                        <span>•</span>
                                        <span className="font-medium text-docka-700 dark:text-zinc-300">{selectedProcess.class}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-xs text-docka-400 dark:text-zinc-500 uppercase font-bold mb-1">Próxima Ação</div>
                                <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/30">
                                    <Clock size={16} /> {selectedProcess.nextStep}
                                </div>
                                <button
                                    onClick={() => setIsStatusEditOpen(true)}
                                    className="mt-3 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 flex items-center gap-1 rounded uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    <Activity size={12} /> Evoluir Status
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-6 border-b border-docka-200 dark:border-zinc-800 mb-6 shrink-0">
                            <button
                                onClick={() => setActiveTab('timeline')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-400' : 'border-transparent text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                            >
                                Linha do Tempo
                            </button>
                            <button
                                onClick={() => setActiveTab('docs')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'docs' ? 'border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-400' : 'border-transparent text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                            >
                                Documentos & Assinaturas
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">

                            {/* TIMELINE VIEW */}
                            {activeTab === 'timeline' && (
                                <div className="relative pl-4 space-y-8 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-docka-200 dark:before:bg-zinc-800">
                                    {getTimelineEvents(selectedProcess).map((event: any, idx: number) => (
                                        <div key={idx} className="relative flex gap-6 group">
                                            {/* Icon */}
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-zinc-900 transition-colors
                                            ${event.type === 'contract' || event.type === 'proxy' || event.status === 'completed' ? 'border-emerald-500 text-emerald-500' :
                                                    event.status === 'current' ? 'border-blue-500 text-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/30' :
                                                        'border-docka-300 dark:border-zinc-700 text-docka-300 dark:text-zinc-600'}
                                        `}>
                                                {event.type === 'contract' ? <FileSignature size={12} /> : event.type === 'proxy' ? <Shield size={12} /> : event.status === 'completed' ? <CheckCircle2 size={14} /> :
                                                    event.status === 'current' ? <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" /> :
                                                        <div className="w-2 h-2 bg-docka-300 dark:bg-zinc-600 rounded-full" />}
                                            </div>

                                            {/* Card */}
                                            <div className={`flex-1 p-4 rounded-xl border transition-all ${event.status === 'current' ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm' : 'bg-white dark:bg-zinc-800 border-docka-200 dark:border-zinc-700 hover:border-docka-300 dark:hover:border-zinc-600'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`font-bold text-sm ${event.status === 'future' ? 'text-docka-500 dark:text-zinc-500' : 'text-docka-900 dark:text-zinc-100'}`}>{event.title}</h4>
                                                    <span className="text-xs font-mono text-docka-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-docka-100 dark:border-zinc-700">{event.date}</span>
                                                </div>
                                                <p className="text-xs text-docka-500 dark:text-zinc-400 leading-relaxed">{event.desc}</p>

                                                {/* IN-TIMELINE ACTIONS FOR DOCS */}
                                                {event.type === 'contract' && event.status === 'completed' && selectedProcess.contractUrl && (
                                                    <div className="mt-2">
                                                        <button onClick={() => handleDownloadContract(selectedProcess)} className="text-xs font-medium text-docka-600 hover:text-emerald-600 flex items-center gap-1"><Download size={14} /> Baixar Cópia</button>
                                                    </div>
                                                )}
                                                {event.type === 'proxy' && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {(event.internalState === 'VALIDATED' || event.internalState === 'SIGNED') && selectedProcess.proxyUrl && (
                                                            <a href={selectedProcess.proxySignedUrl ? `${getBackendUrl()}${selectedProcess.proxySignedUrl}` : `${getBackendUrl()}/api/asterysko/processes/${selectedProcess.id}/proxy/download-pdf?token=${localStorage.getItem('token')}`} target="_blank" className="text-xs font-medium text-docka-600 hover:text-emerald-600 flex items-center gap-1 border border-docka-200 px-2 py-1 rounded bg-docka-50 dark:bg-zinc-800"><Download size={14} /> Ver Cópia</a>
                                                        )}
                                                        {event.internalState !== 'VALIDATED' && event.internalState !== 'SIGNED' && (
                                                            <button onClick={() => handleGenerateProxy(selectedProcess)} className="text-xs font-bold text-blue-600 flex items-center gap-1 border border-blue-200 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30">Gerar Documento</button>
                                                        )}
                                                        <label className="text-xs font-bold text-docka-600 flex items-center gap-1 border border-docka-200 px-2 py-1 rounded bg-docka-50 hover:bg-docka-100 cursor-pointer">
                                                            <Upload size={14} /> Anexar Manualmente
                                                            <input type="file" className="hidden" accept=".pdf,.jpeg,.jpg,.png" onChange={(e) => handleProxyFileUpload(e, selectedProcess.id)} />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* DOCUMENTS VIEW */}
                            {activeTab === 'docs' && (
                                <div className="space-y-6">

                                    {/* Contract Section */}
                                    <div className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><FileSignature size={20} /></div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-docka-900 dark:text-zinc-100">Contrato de Prestação de Serviços</h4>
                                                    <p className="text-xs text-docka-500 dark:text-zinc-400">
                                                        Status: {selectedProcess.contractUrl
                                                            ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">Assinado</span>
                                                            : <span className="text-amber-600 dark:text-amber-400 font-bold">Pendente</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedProcess.contractUrl ? (
                                                <button
                                                    onClick={() => handleDownloadContract(selectedProcess)}
                                                    className="text-xs font-medium text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 flex items-center gap-1 border border-docka-200 dark:border-zinc-700 px-2 py-1 rounded hover:bg-docka-50 dark:hover:bg-zinc-700"
                                                >
                                                    <Download size={12} /> Baixar PDF
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => alert('Em breve: Gerador de Contrato Automático do Processo (Isolado)')}
                                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 transition-colors"
                                                >
                                                    <FilePlus size={14} /> Gerar Contrato
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Procuração Section */}
                                    <div className="bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl p-5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />

                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><FileText size={20} /></div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-docka-900 dark:text-zinc-100">Procuração INPI</h4>
                                                    <p className="text-xs text-docka-500 dark:text-zinc-400 max-w-sm mt-1">Necessário para representar a empresa junto ao órgão federal.</p>
                                                </div>
                                            </div>
                                            {selectedProcess.proxyUrl ? (
                                                <a
                                                    href={selectedProcess.id ? `${getBackendUrl()}/api/asterysko/processes/${selectedProcess.id}/proxy/download-pdf?token=${localStorage.getItem('token')}` : '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-medium text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-200 flex items-center gap-1 border border-docka-200 dark:border-zinc-700 px-2 py-1 rounded hover:bg-docka-50 dark:hover:bg-zinc-700"
                                                >
                                                    <Download size={12} /> Baixar Procuração
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() => handleGenerateProxy(selectedProcess)}
                                                    className={`text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 transition-colors ${selectedProcess.proxySignStatus === 'PENDING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    disabled={selectedProcess.proxySignStatus === 'PENDING'}
                                                >
                                                    <FileText size={14} /> {selectedProcess.proxySignStatus === 'PENDING' ? 'Enviado ao Cliente' : 'Gerar Modelo'}
                                                </button>
                                            )}
                                        </div>

                                        {/* Upload/Status Area */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="h-px flex-1 bg-docka-100 dark:bg-zinc-700" />
                                                <span className="text-[10px] font-bold text-docka-400 uppercase">Ou Anexar Manualmente</span>
                                                <div className="h-px flex-1 bg-docka-100 dark:bg-zinc-700" />
                                            </div>

                                            <div
                                                className={`relative border-2 border-dashed border-docka-300 dark:border-zinc-600 rounded-xl bg-docka-50 dark:bg-zinc-800/50 p-6 flex flex-col items-center justify-center text-center transition-colors hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 group overflow-hidden ${uploadingProxy ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}`}
                                            >
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={(e) => handleProxyFileUpload(e, selectedProcess.id)}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-full shadow-sm flex items-center justify-center text-docka-400 dark:text-zinc-400 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all">
                                                    <Upload size={18} />
                                                </div>
                                                <h5 className="text-xs font-bold text-docka-800 dark:text-zinc-200">
                                                    {uploadingProxy ? 'Enviando documento...' : selectedProcess.proxyUrl ? 'Substituir Procuração Final' : 'Anexar Procuração Assinada'}
                                                </h5>
                                                <p className="text-[10px] text-docka-500 dark:text-zinc-400 mt-1">
                                                    PDF assinado pelo cliente.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Files List - Dynamic or Empty */}
                                    <div>
                                        <h4 className="text-xs font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Outros Arquivos</h4>
                                        {selectedProcess.files && selectedProcess.files.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedProcess.files.map((file: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg hover:border-docka-300 dark:hover:border-zinc-600 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-docka-100 dark:bg-zinc-700 rounded flex items-center justify-center text-docka-500 dark:text-zinc-400"><File size={16} /></div>
                                                            <span className="text-sm font-medium text-docka-700 dark:text-zinc-300">{file.name}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 border border-dashed border-docka-200 dark:border-zinc-800 rounded-lg text-docka-400 dark:text-zinc-600 text-xs">
                                                Nenhum outro arquivo anexado.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default AsteryskoProcessesView;
