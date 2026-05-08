import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, 
    Plus, 
    Filter, 
    ChevronRight, 
    ChevronDown, 
    Briefcase, 
    Scale, 
    Clock, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    FileSignature, 
    Activity, 
    Download, 
    Upload, 
    Shield, 
    FilePlus, 
    CreditCard, 
    Camera, 
    Loader2, 
    Trash2 
} from 'lucide-react';
import api, { getBackendUrl } from '../../../../services/api';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../context/ToastContext';
import DashboardPage from '../../../../components/DashboardPage';

interface Client {
    id: string;
    name: string;
    email: string;
    company?: string;
}

// Timeline Data for a specific process (Helper)
const getTimelineEvents = (process: any) => {
    const events: any[] = [];

    // 1. Contrato Event
    events.push({
        type: 'contract',
        title: 'Contrato Assinado',
        date: process.contractSignDate ? new Date(process.contractSignDate).toLocaleDateString('pt-BR') : (process.createdAt ? new Date(process.createdAt).toLocaleDateString('pt-BR') : ''),
        desc: process.contractSignStatus === 'SIGNED' ? 'Contrato assinado.' : 'Aguardando assinatura.',
        status: process.contractSignStatus === 'SIGNED' ? 'completed' : 'pending',
        internalState: process.contractSignStatus,
        createdAt: process.contractSignDate || process.createdAt
    });

    // 2. Procuração Event
    events.push({
        type: 'proxy',
        title: 'Procuração INPI',
        date: process.createdAt ? new Date(process.createdAt).toLocaleDateString('pt-BR') : '',
        desc: process.proxySignStatus === 'VALIDATED' ? 'Procuração validada' : (process.proxySignStatus === 'SIGNED' ? 'Procuração enviada' : 'Aguardando envio da Procuração'),
        status: process.proxySignStatus === 'VALIDATED' || process.proxySignStatus === 'SIGNED' ? 'completed' : 'pending',
        internalState: process.proxySignStatus,
        createdAt: process.createdAt
    });

    // 3. GRU (Taxa Federal) - Only for ESSENCIAL and PREMIUM
    if (process.planType === 'ESSENCIAL' || process.planType === 'PREMIUM') {
        events.push({
            type: 'gru',
            title: 'Taxa Federal (GRU)',
            date: process.gruStatus === 'PAID' ? 'Pago' : (process.gruUrl ? 'Aguardando Pagto.' : ''),
            desc: process.gruStatus === 'PAID' ? 'Pagamento da GRU confirmado.' : (process.gruUrl ? 'Boleto GRU disponível para pagamento.' : 'Aguardando emissão da GRU pelo escritório.'),
            status: process.gruStatus === 'PAID' ? 'completed' : (process.gruUrl ? 'current' : 'pending'),
            internalState: process.gruStatus,
            createdAt: process.updatedAt || process.createdAt
        });
    }

    // 4. Depósito do Pedido (Administrative Milestone)
    if (process.inpiProcessNumber || (process.status && process.status !== 'NEW')) {
        events.push({
            type: 'dispatch',
            title: 'Depósito do Pedido',
            date: process.filingDate ? new Date(process.filingDate).toLocaleDateString('pt-BR') : (process.createdAt ? new Date(process.createdAt).toLocaleDateString('pt-BR') : ''),
            status: 'completed',
            desc: `Protocolo gerado: ${process.inpiProcessNumber || 'Pendente'}`,
            createdAt: process.filingDate || process.createdAt
        });
    }

    // 5. Add Dispatches from DB (Sorted newest first)
    if (process.dispatches && process.dispatches.length > 0) {
        process.dispatches.forEach((d: any) => {
            events.push({
                type: 'dispatch',
                title: d.isVirtual ? d.description : `${d.code} - ${d.description}`,
                date: new Date(d.createdAt).toLocaleDateString('pt-BR'),
                status: 'completed',
                desc: d.details || `Publicado na RPI ${d.rpiNumber}`,
                createdAt: d.createdAt
            });
        });
    }

    // Helper para formatar data com segurança e evitar NaNs na ordenação
    const safeTime = (val: any) => {
        if (!val) return 0;
        if (val instanceof Date) return val.getTime();
        if (typeof val === 'string') {
            if (val.includes('/')) {
                const parts = val.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    const d = new Date(year, month, day);
                    return isNaN(d.getTime()) ? 0 : d.getTime();
                }
            }
            const d = new Date(val);
            return isNaN(d.getTime()) ? 0 : d.getTime();
        }
        if (typeof val === 'number') return val;
        return 0;
    };

    return events.sort((a, b) => {
        const timeA = safeTime(a.createdAt);
        const timeB = safeTime(b.createdAt);
        if (timeA !== timeB) return timeB - timeA;
        
        // Ordem cronológica lógica das etapas em caso de empate na data (Newest at the top)
        const priorities: Record<string, number> = {
            'dispatch': 6,
            'gru': 5,
            'proxy': 4,
            'payment-confirmation': 3,
            'invoice': 2,
            'contract': 1
        };
        return (priorities[b.type] || 0) - (priorities[a.type] || 0);
    });
};


const AsteryskoProcessesView: React.FC = () => {
    const [processes, setProcesses] = useState<any[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<any | null>(null);
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'timeline' | 'docs' | 'info'>('timeline');
    const [isNewProcessOpen, setIsNewProcessOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);

    const handleDownloadProxyPdf = async (procId: string, brandName: string) => {
        try {
            setIsDownloadingPdf(procId);
            const token = localStorage.getItem('token');
            const url = `${getBackendUrl()}/api/asterysko/processes/${procId}/proxy/download-pdf?token=${token}`;

            const response = await axios({
                url,
                method: 'GET',
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `Procuracao_${brandName.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err: any) {
            console.error('Download failed:', err);
            // Fallback
            const token = localStorage.getItem('token');
            window.open(`${getBackendUrl()}/api/asterysko/processes/${procId}/proxy/download-pdf?token=${token}`, '_blank');
        } finally {
            setIsDownloadingPdf(null);
        }
    };

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
                    logoUrl: p.brand?.logoUrl,
                    planType: p.planType,
                    gruUrl: p.gruUrl,
                    gruBarcode: p.gruBarcode,
                    gruReceiptUrl: p.gruReceiptUrl,
                    gruStatus: p.gruStatus,
                    proxyUrl: p.proxyUrl,
                    proxySignedUrl: p.proxySignedUrl,
                    proxySignStatus: p.proxySignStatus,
                    contractUrl: p.contractUrl,
                    contractSignStatus: p.contractSignStatus,
                    contractSignDate: p.contractSignDate,
                    createdAt: p.createdAt,
                    brand: p.brand
                }));
                setProcesses(mapped);

                // Fetch Clients
                const clientRes = await api.get('/asterysko/clients');
                setClients(clientRes.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
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
                proxySignedUrl: p.proxySignedUrl,
                proxySignStatus: p.proxySignStatus,
                contractUrl: p.contractUrl,
                contractSignStatus: p.contractSignStatus,
                contractSignDate: p.contractSignDate,
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
            const res = await api.post(`/asterysko/processes/${processId}/proxy/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Enviado com sucesso!');
            setSelectedProcess((prev: any) => prev ? { ...prev, proxyUrl: res.data.proxyUrl, proxySignStatus: 'SIGNED' } : null);
            // Also update main list silently
            setProcesses((prev: any[]) => prev.map((p: any) => p.id === processId ? { ...p, proxyUrl: res.data.proxyUrl, proxySignStatus: 'SIGNED' } : p));
        } catch (error) {
            console.error('Proxy upload error', error);
            alert('Erro no envio da Procuração.');
        } finally {
            setUploadingProxy(false);
        }
    };

    const handleValidateProxy = async (processId: string) => {
        try {
            await api.post(`/asterysko/processes/${processId}/proxy/validate`);
            alert('Procuração validada com sucesso!');
            setSelectedProcess((prev: any) => prev ? { ...prev, proxySignStatus: 'VALIDATED' } : null);
            setProcesses((prev: any[]) => prev.map((p: any) => p.id === processId ? { ...p, proxySignStatus: 'VALIDATED' } : p));
        } catch (error) {
            alert('Erro ao validar procuração.');
        }
    };

    const handleUpdatePlan = async (plan: string) => {
        if (!selectedProcess) return;
        try {
            await api.put(`/asterysko/processes/${selectedProcess.id}`, { planType: plan });
            setSelectedProcess({ ...selectedProcess, planType: plan });
            setProcesses(prev => prev.map(p => p.id === selectedProcess.id ? { ...p, planType: plan } : p));
            addToast({ type: 'success', title: 'Sucesso', message: 'Plano do processo atualizado.' });
        } catch (error) {
            console.error('Update plan error', error);
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao atualizar plano.' });
        }
    };

    const handleUpdateClass = async (newClass: string) => {
        if (!selectedProcess) return;
        try {
            await api.put(`/asterysko/processes/${selectedProcess.id}`, {
                nclClass: newClass
            });
            const updated = { ...selectedProcess, class: newClass };
            setSelectedProcess(updated);
            setProcesses(prev => prev.map(p => p.id === selectedProcess.id ? updated : p));
            addToast({ type: 'success', title: 'Sucesso', message: 'Classe NCL atualizada!' });
        } catch (error) {
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao atualizar classe.' });
        }
    };

    // Advanced Info Management
    const [infoForm, setInfoForm] = useState<any>({});
    const [isSavingInfo, setIsSavingInfo] = useState(false);

    useEffect(() => {
        if (selectedProcess) {
            setInfoForm({
                brandName: selectedProcess.brand?.name || selectedProcess.title,
                brandType: selectedProcess.brand?.type || '',
                presentation: selectedProcess.brand?.presentation || '',
                nature: selectedProcess.brand?.nature || '',
                filingDate: selectedProcess.filingDate ? new Date(selectedProcess.filingDate).toISOString().split('T')[0] : '',
                concessionDate: selectedProcess.concessionDate ? new Date(selectedProcess.concessionDate).toISOString().split('T')[0] : '',
                expirationDate: selectedProcess.expirationDate ? new Date(selectedProcess.expirationDate).toISOString().split('T')[0] : '',
                nclClass: selectedProcess.brand?.nclClasses?.[0] || selectedProcess.class || '',
                nclSpecification: selectedProcess.brand?.nclSpecification || '',
                holders: selectedProcess.brand?.holders || '',
                procurator: selectedProcess.procurator || '',
                inpiProcessNumber: selectedProcess.inpiProcessNumber || selectedProcess.displayId || ''
            });
        }
    }, [selectedProcess]);

    const handleSaveInfo = async () => {
        if (!selectedProcess) return;
        setIsSavingInfo(true);
        try {
            await api.put(`/asterysko/processes/${selectedProcess.id}`, infoForm);
            
            // Refresh local state
            const updated = { 
                ...selectedProcess, 
                ...infoForm,
                title: infoForm.brandName,
                class: infoForm.nclClass,
                brand: {
                    ...selectedProcess.brand,
                    name: infoForm.brandName,
                    type: infoForm.brandType,
                    presentation: infoForm.presentation,
                    nature: infoForm.nature,
                    nclClasses: [infoForm.nclClass],
                    nclSpecification: infoForm.nclSpecification,
                    holders: infoForm.holders
                }
            };
            setSelectedProcess(updated);
            setProcesses(prev => prev.map(p => p.id === selectedProcess.id ? updated : p));
            
            addToast({ type: 'success', title: 'Sucesso', message: 'Informações do processo atualizadas!' });
        } catch (error) {
            console.error(error);
            addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar informações.' });
        } finally {
            setIsSavingInfo(false);
        }
    };

    const handleConcessionDateChange = (val: string) => {
        const newForm = { ...infoForm, concessionDate: val };
        if (val) {
            const date = new Date(val);
            date.setFullYear(date.getFullYear() + 10);
            newForm.expirationDate = date.toISOString().split('T')[0];
        }
        setInfoForm(newForm);
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

    // GRU Management
    const [uploadingGru, setUploadingGru] = useState(false);
    const [gruBarcode, setGruBarcode] = useState('');
    const [gruFile, setGruFile] = useState<File | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, processId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post(`/asterysko/processes/${processId}/logo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addToast({ type: 'success', title: 'Sucesso', message: 'Logotipo atualizado com sucesso!' });
            
            setLogoError(false); // Reset error state on success
            // Refresh process in list and selection
            const updateList = (prev: any[]) => prev.map(p => p.id === processId ? { ...p, logoUrl: res.data.logoUrl } : p);
            setProcesses(updateList);
            if (selectedProcess?.id === processId) {
                setSelectedProcess({ ...selectedProcess, logoUrl: res.data.logoUrl });
            }
        } catch (error: any) {
            console.error('Error uploading logo:', error);
            const msg = error.response?.data?.details || error.response?.data?.error || 'Falha ao processar logotipo.';
            addToast({ type: 'error', title: 'Erro', message: msg });
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleDownloadLogo = (processId: string) => {
        const token = localStorage.getItem('token');
        window.open(`${getBackendUrl()}/api/asterysko/processes/${processId}/logo/download?token=${token}`, '_blank');
    };

    const handleGruUpload = async (e: React.ChangeEvent<HTMLInputElement>, processId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!gruBarcode) return alert('Por favor, insira o código de barras primeiro.');
        
        setUploadingGru(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('barcode', gruBarcode);

            await api.post(`/asterysko/processes/${processId}/gru/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert('Boleto GRU enviado com sucesso! O cliente foi notificado.');
            
            // Refresh process data
            const res = await api.get('/asterysko/processes');
            // Re-map quickly or just update local state
            setProcesses(prev => prev.map(p => p.id === processId ? { ...p, gruUrl: 'uploaded', gruBarcode, gruStatus: 'WAITING_PAYMENT' } : p));
            if (selectedProcess?.id === processId) {
                setSelectedProcess({ ...selectedProcess, gruUrl: 'uploaded', gruBarcode, gruStatus: 'WAITING_PAYMENT' });
            }
        } catch (error) {
            console.error(error);
            alert('Falha ao enviar GRU.');
        } finally {
            setUploadingGru(false);
            setGruBarcode('');
        }
    };

    return (
        <DashboardPage 
            title="Gestão de Processos (INPI)" 
            icon={FileText}
            actions={
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500" size={14} />
                        <input className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-docka-100 w-64 shadow-sm" placeholder="Buscar marca, cliente ou número..." />
                    </div>
                    <button
                        onClick={() => setIsNewProcessOpen(true)}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-docka-800 dark:hover:bg-white transition-all shadow-sm flex items-center gap-2"
                    >
                        <Plus size={14} /> Novo Processo
                    </button>
                </div>
            }
        >
            <div className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-full animate-in fade-in duration-500">
                <div className="overflow-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-docka-50 dark:bg-zinc-800/50 text-[10px] font-bold uppercase tracking-wider text-docka-500 dark:text-zinc-500 border-b border-docka-100 dark:border-zinc-800 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4">Ativo / Marca</th>
                                <th className="px-6 py-4">Número INPI</th>
                                <th className="px-6 py-4">Titular</th>
                                <th className="px-6 py-4">Classe</th>
                                <th className="px-6 py-4">Evolução / Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-docka-50 dark:divide-zinc-800">
                            {processes.map((proc) => {
                                const isAlert = proc.nextStep === 'Pagar Taxas' || proc.nextStep === 'Cumprir Exigência';
                                return (
                                    <tr 
                                        key={proc.id} 
                                        onClick={(e) => { e.stopPropagation(); setSelectedProcess(proc); }}
                                        className="hover:bg-docka-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-docka-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-docka-900 dark:text-zinc-100 font-bold text-[10px] shrink-0 overflow-hidden border border-docka-50 dark:border-zinc-700 shadow-inner">
                                                    {proc.logoUrl ? (
                                                        <img 
                                                            src={`${getBackendUrl()}${proc.logoUrl}`} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                (e.target as HTMLImageElement).parentElement!.innerText = proc.title.substring(0, 2);
                                                            }}
                                                        />
                                                    ) : (proc.title.substring(0, 2))}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-docka-900 dark:text-zinc-100 group-hover:text-black transition-colors">{proc.title}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-docka-400/60">{proc.client}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono font-bold text-docka-500 dark:text-zinc-400 bg-docka-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-docka-100 dark:border-zinc-700">{proc.displayId}</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-docka-600 dark:text-zinc-400">{proc.client}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-docka-50 dark:bg-zinc-800 rounded-lg text-[9px] font-bold uppercase tracking-widest text-docka-400 dark:text-zinc-500 border border-docka-100 dark:border-zinc-700">{proc.class}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`w-fit px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${getStatusColor(proc.status)} border border-white/20 shadow-sm`}>
                                                    {formatStatus(proc.status)}
                                                </span>
                                                <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${isAlert ? 'text-rose-500' : 'text-amber-500/80'} ml-1`}>
                                                    {isAlert && <AlertCircle size={10} />}
                                                    {proc.nextStep}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={(e) => handleDeleteProcess(e, proc.id)} className="p-2 text-docka-200 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                                <div className="p-2 bg-docka-50 dark:bg-zinc-800 rounded-xl text-docka-400 group-hover:bg-docka-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all shadow-sm">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* NEW PROCESS MODAL DS 3.0 */}
            <Modal
                isOpen={isNewProcessOpen}
                onClose={() => setIsNewProcessOpen(false)}
                title="Novo Ativo / Processo INPI"
                size="lg"
            >
                <div className="flex flex-col gap-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-docka-400 ml-1 text-left">Dados Básicos</h4>
                            <div className="space-y-4 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                                <div>
                                    <label className="block text-[9px] font-bold text-docka-400 uppercase tracking-widest mb-1.5 ml-1 text-left">Número do Processo</label>
                                    <div className="relative">
                                        <Scale size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-docka-400" />
                                        <input
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm font-mono font-semibold text-docka-900 dark:text-zinc-100 shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                                            placeholder="900000000"
                                            value={newProcessData.inpiProcessNumber}
                                            onChange={(e) => setNewProcessData({ ...newProcessData, inpiProcessNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-docka-400 uppercase tracking-widest mb-1.5 ml-1 text-left">Nome da Ativo (Marca)</label>
                                    <input
                                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm font-bold text-docka-900 dark:text-zinc-100 shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                                        placeholder="EX: NOME DA MARCA"
                                        value={newProcessData.brandName}
                                        onChange={(e) => setNewProcessData({ ...newProcessData, brandName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-docka-400 ml-1 text-left">Classificação e Titular</h4>
                            <div className="space-y-4 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[9px] font-bold text-docka-400 uppercase tracking-widest mb-1.5 ml-1 text-left">Classe NCL</label>
                                        <input
                                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-center text-docka-900 dark:text-zinc-100 shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                                            placeholder="35"
                                            value={newProcessData.nclClass}
                                            onChange={(e) => setNewProcessData({ ...newProcessData, nclClass: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-docka-400 uppercase tracking-widest mb-1.5 ml-1 text-left">Data Depósito</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-[10px] font-semibold text-docka-600 dark:text-zinc-100 outline-none shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                                            value={newProcessData.date}
                                            onChange={(e) => setNewProcessData({ ...newProcessData, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-docka-400 uppercase tracking-widest mb-1.5 ml-1 text-left">Titular (Cliente)</label>
                                    <div className="relative">
                                        <div
                                            onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                                            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-docka-900 dark:text-zinc-100 cursor-pointer shadow-sm flex items-center justify-between"
                                        >
                                            <span className="truncate">{newProcessData.clientName || 'Selecionar...'}</span>
                                            <ChevronDown size={14} className={`text-docka-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        {isClientDropdownOpen && (
                                            <div className="absolute z-[70] w-full mt-2 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                                <div className="p-3 border-b border-docka-50 dark:border-zinc-800">
                                                    <div className="relative">
                                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400" />
                                                        <input
                                                            autoFocus
                                                            className="w-full pl-9 pr-4 py-2 text-xs bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 rounded-lg outline-none"
                                                            placeholder="Pesquisar..."
                                                            value={clientSearch}
                                                            onChange={(e) => setClientSearch(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto p-2 custom-scrollbar">
                                                    {(clients || []).filter(c =>
                                                        c.name.toLowerCase().includes(clientSearch.toLowerCase())
                                                    ).map(c => (
                                                        <div
                                                            key={c.id}
                                                            onClick={() => {
                                                                setNewProcessData({ ...newProcessData, clientName: c.name });
                                                                setIsClientDropdownOpen(false);
                                                                setClientSearch('');
                                                            }}
                                                            className="px-4 py-2.5 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-all group text-left flex flex-col"
                                                        >
                                                            <div className="text-sm font-bold text-docka-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white">{c.name}</div>
                                                            <div className="text-[9px] font-black uppercase tracking-wider opacity-50">{c.company || 'Sem Empresa'}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 items-center pt-4 border-t border-docka-100 dark:border-zinc-800 text-left">
                        <button onClick={() => setIsNewProcessOpen(false)} className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-docka-400 hover:text-docka-900 transition-colors">Cancelar</button>
                        <button onClick={handleCreateProcess} className="px-10 py-3 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-sm hover:bg-docka-800 transition-all">Sincronizar Ativo</button>
                    </div>
                </div>
            </Modal>

            {selectedProcess && (
                <Modal
                    isOpen={!!selectedProcess}
                    onClose={() => setSelectedProcess(null)}
                    title={selectedProcess.title}
                    size="xl"
                >
                    <div className="flex flex-col h-[75vh]">
                        {isStatusEditOpen && (
                            <div className="absolute inset-x-0 top-0 z-50 p-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-docka-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300 rounded-t-xl">
                                <div className="max-w-2xl mx-auto space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                            <Activity size={14} /> Evoluir Processo / Lançar Despacho
                                        </h3>
                                        <button onClick={() => setIsStatusEditOpen(false)} className="text-[10px] font-bold uppercase text-docka-300 hover:text-rose-500 transition-colors">Cancelar</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-bold text-docka-400 uppercase tracking-widest mb-1.5 ml-1">Novo Status Geral</label>
                                            <select 
                                                value={newStatusData.status}
                                                onChange={e => setNewStatusData({...newStatusData, status: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-docka-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="NEW">NOVO</option>
                                                <option value="WAITING_PAYMENT">AGUARDANDO PAGAMENTO</option>
                                                <option value="FILED">PROTOCOLADO</option>
                                                <option value="EXAMINATION">EM EXAME</option>
                                                <option value="GRANTED">DEFERIDO / CONCEDIDO</option>
                                                <option value="DENIED">INDEFERIDO</option>
                                                <option value="OPPOSITION">OPOSIÇÃO</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-docka-400 uppercase tracking-widest mb-1.5 ml-1">Título do Despacho (Ex: 3.1)</label>
                                            <input 
                                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-docka-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                                                placeholder="Publicação de Pedido"
                                                value={newStatusData.description}
                                                onChange={e => setNewStatusData({...newStatusData, description: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <textarea 
                                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-docka-700 dark:text-zinc-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 h-24 resize-none"
                                        placeholder="Detalhes adicionais do despacho..."
                                        value={newStatusData.details}
                                        onChange={e => setNewStatusData({...newStatusData, details: e.target.value})}
                                    />
                                    <button onClick={handleUpdateStatus} className="w-full py-3.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm hover:bg-blue-700 transition-all">Lançar Evolução</button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-8 border-b border-docka-50 dark:border-zinc-800 mb-6 shrink-0 pt-2">
                            <div className="flex gap-6">
                                <div className="relative group shrink-0">
                                    <div className="w-24 h-24 bg-white dark:bg-zinc-800 rounded-xl border border-docka-100 dark:border-zinc-700 shadow-sm flex items-center justify-center overflow-hidden p-2">
                                        {selectedProcess.logoUrl && !logoError ? (
                                            <img src={`${getBackendUrl()}${selectedProcess.logoUrl}`} alt="" className="w-full h-full object-contain" onError={() => setLogoError(true)} />
                                        ) : (
                                            <div className="text-2xl font-bold text-docka-200 dark:text-zinc-700 uppercase">{selectedProcess.title.substring(0, 2)}</div>
                                        )}
                                        {uploadingLogo && <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center backdrop-blur-sm"><Loader2 size={24} className="animate-spin text-docka-900" /></div>}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                                        <label className="w-8 h-8 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center text-docka-400 cursor-pointer hover:text-docka-900 transition-all border border-docka-50 dark:border-zinc-700">
                                            <Camera size={14} />
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, selectedProcess.id)} />
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight">{selectedProcess.title}</h2>
                                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-docka-400">
                                        <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-docka-200" /> {selectedProcess.client}</span>
                                        <span className="w-1 h-1 bg-docka-100 rounded-full" />
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-docka-50 dark:bg-zinc-800 rounded-lg text-docka-900 dark:text-zinc-100 border border-docka-100 dark:border-zinc-700"><Scale size={12} className="text-docka-300" /> {selectedProcess.displayId}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {['ESSENCIAL', 'PREMIUM', 'BLINDADO'].map(plan => (
                                            <button 
                                                key={plan}
                                                onClick={() => handleUpdatePlan(plan)}
                                                className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all border ${selectedProcess.planType === plan ? 'bg-docka-900 text-white border-docka-900 shadow-sm' : 'bg-white dark:bg-zinc-800 text-docka-400 border-docka-100 dark:border-zinc-700 hover:border-docka-300'}`}
                                            >
                                                {plan}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-3 shrink-0">
                                <div className="space-y-1 text-right">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-docka-400">Ação Recomendada</span>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20 text-amber-600 dark:text-amber-400 rounded-lg shadow-sm text-[10px] font-bold uppercase tracking-widest">
                                        <Clock size={14} /> {selectedProcess.nextStep}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsStatusEditOpen(true)}
                                    className="px-6 py-2 bg-white dark:bg-zinc-800 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                >
                                    Evoluir Status
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-8 mb-6 border-b border-docka-50 dark:border-zinc-800 shrink-0">
                            {['timeline', 'docs', 'info'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500 hover:text-docka-600'}`}
                                >
                                    {tab === 'timeline' ? 'Linha do Tempo' : tab === 'docs' ? 'Documentos' : 'Dossiê Técnico'}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-docka-900 dark:bg-zinc-100 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
                            {activeTab === 'timeline' && (
                                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-docka-200 dark:before:bg-zinc-800">
                                    {getTimelineEvents(selectedProcess).map((event: any, idx: number) => (
                                        <div key={idx} className="relative animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${idx * 50}ms` }}>
                                            {event.status === 'completed' ? (
                                                <div className="absolute -left-8 top-0 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 bg-emerald-600 text-white shadow-md flex items-center justify-center z-10">
                                                    <CheckCircle2 size={9} strokeWidth={2.8} />
                                                </div>
                                            ) : event.status === 'current' ? (
                                                <div className="absolute -left-8 top-0 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 bg-blue-600 text-white shadow-md flex items-center justify-center z-10">
                                                    <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
                                                    <Loader2 size={9} className="animate-spin absolute text-blue-200/40" />
                                                    <Activity size={9} className="relative z-10 animate-pulse" />
                                                </div>
                                            ) : (
                                                <div className="absolute -left-8 top-0 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 bg-docka-100 dark:bg-zinc-800 text-docka-400 dark:text-zinc-500 shadow-sm flex items-center justify-center z-10">
                                                    <Clock size={9} strokeWidth={2} />
                                                </div>
                                            )}
                                            <div className="flex-1 pl-2">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="text-sm font-bold text-docka-900 dark:text-zinc-100">{event.title}</h5>
                                                    <span className="text-[10px] font-bold text-docka-400 uppercase tracking-wider">{event.date}</span>
                                                </div>
                                                <p className="text-xs text-docka-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{event.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'docs' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {(selectedProcess.planType === 'ESSENCIAL' || selectedProcess.planType === 'PREMIUM') && (
                                        <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-docka-300 dark:hover:border-zinc-700 transition-all">
                                            <div>
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center border border-amber-500/20 shadow-sm"><CreditCard size={20} /></div>
                                                    <div>
                                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-docka-400 dark:text-zinc-500">Guia INPI (GRU)</h4>
                                                        <span className={`inline-flex items-center gap-1.5 mt-1 text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border ${selectedProcess.gruStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                                            {selectedProcess.gruStatus === 'PAID' ? 'Liquidada' : 'Aguardando'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {selectedProcess.gruStatus !== 'PAID' && (
                                                    <div className="space-y-4">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Código de Barras..." 
                                                            value={gruBarcode} 
                                                            onChange={e => setGruBarcode(e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800/50 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-semibold text-docka-800 dark:text-zinc-100 shadow-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                                                        />
                                                        <label className="flex items-center justify-center gap-2 w-full py-4 bg-amber-50/10 dark:bg-zinc-800/10 border-2 border-dashed border-amber-500/30 dark:border-zinc-700 rounded-xl text-[10px] font-bold uppercase tracking-wider text-amber-600 cursor-pointer hover:bg-amber-500/5 transition-all">
                                                            <Upload size={14} /> Selecionar PDF
                                                            <input type="file" hidden accept=".pdf" onChange={(e) => handleGruUpload(e, selectedProcess.id)} />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                            {selectedProcess.gruUrl && (
                                                <button 
                                                    onClick={() => { const token = localStorage.getItem('token'); window.open(`${getBackendUrl()}/api/asterysko/processes/${selectedProcess.id}/gru/download?token=${token}`, '_blank'); }} 
                                                    className="mt-6 w-full py-3 bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-docka-200 dark:border-zinc-700 hover:bg-docka-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
                                                >
                                                    Ver Guia Atual
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-docka-300 dark:hover:border-zinc-700 transition-all">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center border border-blue-500/20 shadow-sm"><FileSignature size={20} /></div>
                                                <div>
                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-docka-400 dark:text-zinc-500">Procuração</h4>
                                                    <span className="text-[9px] font-bold uppercase text-docka-400">Representação INPI</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button onClick={() => handleGenerateProxy(selectedProcess)} className="py-3 bg-white dark:bg-zinc-800 rounded-lg border border-blue-200 dark:border-zinc-700 text-[9px] font-bold uppercase text-blue-600 hover:bg-blue-50/50 transition-all">Gerar Modelo</button>
                                                <label className="py-3 bg-blue-600 rounded-lg text-[9px] font-bold uppercase text-white shadow-sm cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                                                    <Upload size={12} /> Upload Final
                                                    <input type="file" hidden accept=".pdf" onChange={(e) => handleProxyFileUpload(e, selectedProcess.id)} />
                                                </label>
                                            </div>
                                        </div>
                                        {selectedProcess.proxyUrl && (
                                            <button onClick={() => handleDownloadProxyPdf(selectedProcess.id, selectedProcess.title)} className="mt-6 w-full py-3 bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-docka-200 dark:border-zinc-700 hover:bg-docka-50 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                                                <Download size={14} /> Baixar Cópia
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'info' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-docka-400 ml-1">Informações do Ativo</h4>
                                            <div className="space-y-4 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                                                {['brandName', 'nature', 'presentation'].map(field => (
                                                    <div key={field}>
                                                        <label className="block text-[9px] font-bold text-docka-400 uppercase tracking-widest mb-1.5 ml-1">{field === 'brandName' ? 'Nome da Marca' : field === 'nature' ? 'Natureza' : 'Apresentação'}</label>
                                                        <input 
                                                            className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-docka-800 dark:text-zinc-100 shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                                                            value={infoForm[field] || ''}
                                                            onChange={e => setInfoForm({...infoForm, [field]: e.target.value})}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-docka-400 ml-1">Prazos e Vigência</h4>
                                            <div className="space-y-4 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm">
                                                <div className="grid grid-cols-2 gap-4">
                                                    {['filingDate', 'concessionDate'].map(field => (
                                                        <div key={field}>
                                                            <label className="block text-[9px] font-bold text-docka-400 uppercase tracking-widest mb-1.5 ml-1">{field === 'filingDate' ? 'Depósito' : 'Concessão'}</label>
                                                            <input 
                                                                type="date"
                                                                className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-[10px] font-semibold text-docka-600 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                                                                value={infoForm[field] || ''}
                                                                onChange={e => field === 'concessionDate' ? handleConcessionDateChange(e.target.value) : setInfoForm({...infoForm, [field]: e.target.value})}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-4 bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 dark:border-rose-900/30 rounded-lg">
                                                    <label className="block text-[9px] font-bold text-rose-500 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5"><Clock size={10} /> Expiração do Decênio</label>
                                                    <input 
                                                        type="date"
                                                        className="w-full bg-transparent border-none text-sm font-bold text-rose-600 dark:text-rose-400 outline-none"
                                                        value={infoForm.expirationDate || ''}
                                                        onChange={e => setInfoForm({...infoForm, expirationDate: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button 
                                            onClick={handleSaveInfo}
                                            disabled={isSavingInfo}
                                            className="px-12 py-3.5 bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-sm hover:bg-docka-800 transition-all flex items-center gap-3"
                                        >
                                            {isSavingInfo ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            Atualizar Dossiê Técnico
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </DashboardPage>
    );
};

export default AsteryskoProcessesView;
