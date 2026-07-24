import React, { useState, useEffect } from 'react';
import { 
    X, CheckCircle2, AlertOctagon, Send, RotateCcw, Archive, ShieldOff, ShieldCheck, 
    Building2, Plus, Trash2, ExternalLink, Loader2, Mail, Phone
} from 'lucide-react';
import api from '../../../../../services/api';

interface Props {
    isOpen: boolean;
    opportunityId: string | null;
    onClose: () => void;
    onUpdate: () => void;
    onOpenSendToCrm: (opp: any) => void;
    onOpenDiscard: (opp: any) => void;
}

export const AsteryskoOpportunityDetailsModal: React.FC<Props> = ({
    isOpen,
    opportunityId,
    onClose,
    onUpdate,
    onOpenSendToCrm,
    onOpenDiscard
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'evidences' | 'history'>('overview');
    const [loading, setLoading] = useState(false);
    const [opportunity, setOpportunity] = useState<any>(null);

    // Contatos Form State
    const [showContactForm, setShowContactForm] = useState(false);
    const [cName, setCName] = useState('');
    const [cRole, setCRole] = useState('');
    const [cEmail, setCEmail] = useState('');
    const [cPhone, setCPhone] = useState('');
    const [cType] = useState('desconhecido');
    const [cIsPrimary, setCIsPrimary] = useState(false);
    const [savingContact, setSavingContact] = useState(false);

    // Evidências Form State
    const [showEvidenceForm, setShowEvidenceForm] = useState(false);
    const [eType, setEType] = useState('website');
    const [eTitle, setETitle] = useState('');
    const [eUrl, setEUrl] = useState('');
    const [eSummary, setESummary] = useState('');
    const [savingEvidence, setSavingEvidence] = useState(false);

    useEffect(() => {
        if (isOpen && opportunityId) {
            fetchOpportunity();
        }
    }, [isOpen, opportunityId]);

    const fetchOpportunity = async () => {
        if (!opportunityId) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/asterysko/opportunities/${opportunityId}`);
            setOpportunity(data);
        } catch (error) {
            console.error('Failed to fetch opportunity detail', error);
            alert('Falha ao carregar detalhes da oportunidade.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !opportunityId) return null;

    const handleQualify = async () => {
        if (!opportunity) return;
        try {
            await api.post(`/asterysko/opportunities/${opportunity.id}/qualify`);
            alert('Oportunidade qualificada com sucesso!');
            fetchOpportunity();
            onUpdate();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Falha ao qualificar oportunidade.');
        }
    };

    const handleRestore = async () => {
        if (!opportunity) return;
        try {
            await api.post(`/asterysko/opportunities/${opportunity.id}/restore`);
            alert('Oportunidade restaurada para análise.');
            fetchOpportunity();
            onUpdate();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Falha ao restaurar oportunidade.');
        }
    };

    const handleArchive = async () => {
        if (!opportunity) return;
        if (!window.confirm('Tem certeza de que deseja arquivar esta oportunidade?')) return;
        try {
            await api.post(`/asterysko/opportunities/${opportunity.id}/archive`);
            alert('Oportunidade arquivada com sucesso.');
            onUpdate();
            onClose();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Falha ao arquivar oportunidade.');
        }
    };

    const handleToggleDoNotContact = async () => {
        if (!opportunity) return;
        const newDoNotContact = !opportunity.doNotContact;
        try {
            await api.post(`/asterysko/opportunities/${opportunity.id}/toggle-do-not-contact`, {
                doNotContact: newDoNotContact
            });
            alert(newDoNotContact ? 'Marcação de Não Contatar ativada.' : 'Restrição de Não Contatar removida.');
            fetchOpportunity();
            onUpdate();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Falha ao alterar restrição.');
        }
    };

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cName.trim()) return;
        setSavingContact(true);
        try {
            await api.post(`/asterysko/opportunities/${opportunityId}/contacts`, {
                name: cName.trim(),
                role: cRole.trim() || undefined,
                email: cEmail.trim() || undefined,
                phone: cPhone.trim() || undefined,
                contactType: cType,
                isPrimary: cIsPrimary
            });
            setCName('');
            setCRole('');
            setCEmail('');
            setCPhone('');
            setCIsPrimary(false);
            setShowContactForm(false);
            fetchOpportunity();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Falha ao adicionar contato.');
        } finally {
            setSavingContact(false);
        }
    };

    const handleRemoveContact = async (contactId: string) => {
        if (!window.confirm('Deseja remover este contato?')) return;
        try {
            await api.delete(`/asterysko/opportunities/${opportunityId}/contacts/${contactId}`);
            fetchOpportunity();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Falha ao remover contato.');
        }
    };

    const handleAddEvidence = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eTitle.trim()) return;
        setSavingEvidence(true);
        try {
            await api.post(`/asterysko/opportunities/${opportunityId}/evidences`, {
                type: eType,
                title: eTitle.trim(),
                url: eUrl.trim() || undefined,
                summary: eSummary.trim() || undefined
            });
            setETitle('');
            setEUrl('');
            setESummary('');
            setShowEvidenceForm(false);
            fetchOpportunity();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Falha ao adicionar evidência.');
        } finally {
            setSavingEvidence(false);
        }
    };

    const handleRemoveEvidence = async (evidenceId: string) => {
        if (!window.confirm('Deseja remover esta evidência?')) return;
        try {
            await api.delete(`/asterysko/opportunities/${opportunityId}/evidences/${evidenceId}`);
            fetchOpportunity();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Falha ao remover evidência.');
        }
    };

    const formatScore = (val: number | null | undefined) => {
        if (val === null || val === undefined) return <span className="text-zinc-400 font-normal italic">Não analisado</span>;
        return <span className="font-bold">{val}/100</span>;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'review':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">Para analisar</span>;
            case 'qualified':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">Qualificada</span>;
            case 'discarded':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">Descartada</span>;
            case 'sent_to_crm':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">Enviada ao CRM</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{status}</span>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
            <div className="bg-white dark:bg-zinc-950 w-full max-w-3xl h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-200">
                {/* Header Panel */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-start justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {opportunity && getStatusBadge(opportunity.status)}
                            <span className="text-xs font-bold text-zinc-400">
                                {opportunity?.code}
                            </span>
                            {opportunity?.doNotContact && (
                                <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <ShieldOff size={12} /> Não Contatar
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">
                            {opportunity?.brandName}
                        </h2>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
                            {opportunity?.companyName || opportunity?.tradeName || 'Pessoa Física / Não Informado'}
                            {opportunity?.city && <span>• {opportunity.city}/{opportunity.state}</span>}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Internal Tabs */}
                <div className="px-6 border-b border-zinc-100 dark:border-zinc-800 flex gap-4 bg-white dark:bg-zinc-950 shrink-0">
                    {[
                        { id: 'overview', label: 'Visão Geral' },
                        { id: 'contacts', label: `Contatos (${opportunity?.contacts?.length || 0})` },
                        { id: 'evidences', label: `Evidências (${opportunity?.evidences?.length || 0})` },
                        { id: 'history', label: 'Histórico' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                                activeTab === tab.id
                                    ? 'border-[#0412dd] dark:border-[#3b48ff] text-[#0412dd] dark:text-[#3b48ff]'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="py-20 text-center text-zinc-400 flex flex-col items-center gap-2">
                            <Loader2 size={24} className="animate-spin text-[#0412dd]" />
                            <p className="text-xs font-medium">Carregando oportunidade...</p>
                        </div>
                    ) : opportunity && (
                        <>
                            {/* TAB 1: VISÃO GERAL */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Action Bar per Status */}
                                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                                        <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                                            Ações disponíveis para este registro:
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {opportunity.status === 'review' && (
                                                <>
                                                    <button
                                                        onClick={() => onOpenDiscard(opportunity)}
                                                        className="px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <AlertOctagon size={14} /> Descartar
                                                    </button>
                                                    <button
                                                        onClick={handleQualify}
                                                        className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <CheckCircle2 size={14} /> Qualificar Oportunidade
                                                    </button>
                                                </>
                                            )}

                                            {opportunity.status === 'qualified' && (
                                                <>
                                                    <button
                                                        onClick={() => onOpenDiscard(opportunity)}
                                                        className="px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors"
                                                    >
                                                        Descartar
                                                    </button>
                                                    <button
                                                        onClick={() => onOpenSendToCrm(opportunity)}
                                                        className="px-4 py-2 rounded-lg bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Send size={14} /> Enviar ao CRM
                                                    </button>
                                                </>
                                            )}

                                            {opportunity.status === 'discarded' && (
                                                <button
                                                    onClick={handleRestore}
                                                    className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <RotateCcw size={14} /> Restaurar para Análise
                                                </button>
                                            )}

                                            {opportunity.status === 'sent_to_crm' && (
                                                <a
                                                    href="/crm?view=commercial"
                                                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                                                >
                                                    Abrir Lead no CRM <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pontuações Independentes (0-100) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Proteção de Marca</p>
                                            <p className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                                                {formatScore(opportunity.protectionNeed)}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Viabilidade Preliminar</p>
                                            <p className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                                                {formatScore(opportunity.preliminaryViability)}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Potencial Comercial</p>
                                            <p className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                                                {formatScore(opportunity.commercialPotential)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalhes Cadastrais */}
                                    <div className="space-y-4 pt-2">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                            <Building2 size={14} /> Cadastro & Origem
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-zinc-400 block font-medium">Razão Social:</span>
                                                <span className="font-semibold text-zinc-900 dark:text-white">{opportunity.companyName || 'Não informada'}</span>
                                            </div>
                                            <div>
                                                <span className="text-zinc-400 block font-medium">CNPJ:</span>
                                                <span className="font-semibold text-zinc-900 dark:text-white">{opportunity.cnpj || 'Não informado'}</span>
                                            </div>
                                            <div>
                                                <span className="text-zinc-400 block font-medium">Segmento:</span>
                                                <span className="font-semibold text-zinc-900 dark:text-white">{opportunity.segment || 'Não informado'}</span>
                                            </div>
                                            <div>
                                                <span className="text-zinc-400 block font-medium">Website:</span>
                                                {opportunity.website ? (
                                                    <a href={opportunity.website} target="_blank" rel="noreferrer" className="text-[#0412dd] dark:text-[#3b48ff] font-semibold hover:underline flex items-center gap-1">
                                                        {opportunity.website} <ExternalLink size={12} />
                                                    </a>
                                                ) : <span className="text-zinc-400">Não informado</span>}
                                            </div>
                                            <div>
                                                <span className="text-zinc-400 block font-medium">Tipo da Origem:</span>
                                                <span className="font-semibold uppercase text-zinc-800 dark:text-zinc-200">{opportunity.sourceType}</span>
                                            </div>
                                            <div>
                                                <span className="text-zinc-400 block font-medium">Data da Captação:</span>
                                                <span className="font-semibold text-zinc-900 dark:text-white">{new Date(opportunity.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resumo e Observações */}
                                    {opportunity.summary && (
                                        <div className="pt-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Resumo</span>
                                            <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                                {opportunity.summary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Secundary Actions */}
                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                        <button
                                            onClick={handleToggleDoNotContact}
                                            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            {opportunity.doNotContact ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                                            {opportunity.doNotContact ? 'Remover restrição "Não Contatar"' : 'Marcar como "Não Contatar"'}
                                        </button>
                                        <button
                                            onClick={handleArchive}
                                            className="text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                                        >
                                            <Archive size={14} /> Arquivar Oportunidade
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: CONTATOS */}
                            {activeTab === 'contacts' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Contatos da Oportunidade</h3>
                                        <button
                                            onClick={() => setShowContactForm(!showContactForm)}
                                            className="px-3 py-1.5 rounded-lg bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold hover:bg-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus size={14} /> Adicionar Contato
                                        </button>
                                    </div>

                                    {showContactForm && (
                                        <form onSubmit={handleAddContact} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Nome do Contato *"
                                                    value={cName}
                                                    onChange={(e) => setCName(e.target.value)}
                                                    className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Cargo / Função"
                                                    value={cRole}
                                                    onChange={(e) => setCRole(e.target.value)}
                                                    className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                                                />
                                                <input
                                                    type="email"
                                                    placeholder="E-mail"
                                                    value={cEmail}
                                                    onChange={(e) => setCEmail(e.target.value)}
                                                    className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Telefone / WhatsApp"
                                                    value={cPhone}
                                                    onChange={(e) => setCPhone(e.target.value)}
                                                    className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between pt-1">
                                                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={cIsPrimary}
                                                        onChange={(e) => setCIsPrimary(e.target.checked)}
                                                        className="rounded text-[#0412dd]"
                                                    />
                                                    Contato Principal
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowContactForm(false)}
                                                        className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={savingContact}
                                                        className="px-4 py-1.5 rounded-lg bg-[#0412dd] text-white text-xs font-bold hover:bg-blue-800"
                                                    >
                                                        Salvar Contato
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    )}

                                    {opportunity.contacts?.length === 0 ? (
                                        <p className="text-xs text-zinc-400 italic text-center py-8">Nenhum contato cadastrado.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {opportunity.contacts?.map((c: any) => (
                                                <div key={c.id} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-zinc-900 dark:text-white">{c.name}</span>
                                                            {c.isPrimary && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#0412dd]">Principal</span>}
                                                            {c.role && <span className="text-[11px] text-zinc-400">• {c.role}</span>}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
                                                            {c.email && <span className="flex items-center gap-1"><Mail size={12} /> {c.email}</span>}
                                                            {c.phone && <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveContact(c.id)}
                                                        className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 3: EVIDÊNCIAS */}
                            {activeTab === 'evidences' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Evidências da Oportunidade</h3>
                                        <button
                                            onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                                            className="px-3 py-1.5 rounded-lg bg-[#0412dd] dark:bg-[#3b48ff] text-white text-xs font-bold hover:bg-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus size={14} /> Anexar Evidência
                                        </button>
                                    </div>

                                    {showEvidenceForm && (
                                        <form onSubmit={handleAddEvidence} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Título da Evidência *"
                                                    value={eTitle}
                                                    onChange={(e) => setETitle(e.target.value)}
                                                    className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold"
                                                />
                                                <select
                                                    value={eType}
                                                    onChange={(e) => setEType(e.target.value)}
                                                    className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                                                >
                                                    <option value="website">Website Oficial</option>
                                                    <option value="rede_social">Rede Social</option>
                                                    <option value="anuncio">Anúncio / Publicidade</option>
                                                    <option value="cadastro_empresarial">Cadastro Empresarial</option>
                                                    <option value="observacao_manual">Observação Manual</option>
                                                </select>
                                            </div>
                                            <input
                                                type="url"
                                                placeholder="URL de Origem (https://...)"
                                                value={eUrl}
                                                onChange={(e) => setEUrl(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                                            />
                                            <div className="flex items-center justify-end gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEvidenceForm(false)}
                                                    className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={savingEvidence}
                                                    className="px-4 py-1.5 rounded-lg bg-[#0412dd] text-white text-xs font-bold hover:bg-blue-800"
                                                >
                                                    Salvar Evidência
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {opportunity.evidences?.length === 0 ? (
                                        <p className="text-xs text-zinc-400 italic text-center py-8">Nenhuma evidência anexada.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {opportunity.evidences?.map((ev: any) => (
                                                <div key={ev.id} className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-950">
                                                    <div>
                                                        <span className="text-xs font-bold text-zinc-900 dark:text-white block">{ev.title}</span>
                                                        {ev.url && (
                                                            <a href={ev.url} target="_blank" rel="noreferrer" className="text-[11px] text-[#0412dd] hover:underline flex items-center gap-1 mt-0.5">
                                                                {ev.url} <ExternalLink size={10} />
                                                            </a>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveEvidence(ev.id)}
                                                        className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 4: HISTÓRICO */}
                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Trilha de Auditoria & Histórico</h3>
                                    <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 space-y-6 py-2">
                                        {opportunity.histories?.map((h: any) => (
                                            <div key={h.id} className="relative pl-6">
                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-2 border-[#0412dd]" />
                                                <div className="text-xs font-bold text-zinc-900 dark:text-white">
                                                    {h.description}
                                                </div>
                                                <div className="text-[10px] font-medium text-zinc-400 mt-0.5 flex items-center gap-2">
                                                    <span>{new Date(h.createdAt).toLocaleString('pt-BR')}</span>
                                                    {h.createdBy?.name && <span>• Por: {h.createdBy.name}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
