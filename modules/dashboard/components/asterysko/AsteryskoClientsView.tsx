import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Loader2, Edit2, X, Save, User, Phone, Mail, FileText, MapPin, Activity, Clock3, Monitor, Smartphone } from 'lucide-react';
import api from '../../../../services/api';
import { Organization } from '../../../../types';
import AsteryskoNewClientModal from './AsteryskoNewClientModal';
import { formatPhoneMask, sanitizePhoneForSave } from './utils/phoneMask';
import { formatActivityContent, formatActivityMetadata, formatActivitySource } from './utils/activityPresentation';
import { formatStatusLabel } from './utils/statusPresentation';

interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    processesCount: number;
    createdAt?: string;
    owner?: string;
    processes?: any[];
    portalPresence?: {
        online: boolean;
        lastSeenAt?: string | null;
        sourceChannel?: string | null;
        browser?: string | null;
        deviceType?: string | null;
    };
}

interface Props {
    organization?: Organization;
}

const getProcessInitialsColor = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    const colors = [
        'bg-blue-600 text-white',
        'bg-indigo-600 text-white',
        'bg-purple-600 text-white',
        'bg-emerald-600 text-white',
        'bg-orange-600 text-white',
        'bg-cyan-600 text-white',
        'bg-rose-600 text-white'
    ];
    return colors[charCode % colors.length];
};

const AsteryskoClientsView: React.FC<Props> = ({ organization }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeDropdownClientId, setActiveDropdownClientId] = useState<string | null>(null);
    const [activityClient, setActivityClient] = useState<Client | null>(null);
    const [activityData, setActivityData] = useState<any>(null);
    const [activityLoading, setActivityLoading] = useState(false);

    const fetchClients = async () => {
        try {
            setIsLoading(true);
            const params = organization ? { organizationId: organization.id } : {};
            const response = await api.get('/asterysko/clients', { params });
            setClients(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch clients', error);
            setClients([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [organization?.id]);

    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDropdownClientId(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleResendAccess = async (client: Client) => {
        try {
            await api.post(`/asterysko/clients/${client.id}/resend-access`);
            alert(`Acesso reenviado via WhatsApp/E-mail com sucesso para ${client.name}!`);
        } catch (error) {
            console.error('Failed to resend access', error);
            alert('Falha ao reenviar acesso.');
        }
    };

    const openClientActivities = async (client: Client) => {
        setActivityClient(client);
        setActivityData(null);
        setActivityLoading(true);
        setActiveDropdownClientId(null);
        try {
            const response = await api.get(`/asterysko/clients/${client.id}/activities`);
            setActivityData(response.data);
        } catch (error) {
            console.error('Failed to load client activities', error);
        } finally {
            setActivityLoading(false);
        }
    };

    const handleDeleteClient = async (client: Client) => {
        if (!window.confirm(`Tem certeza de que deseja excluir o cliente ${client.name}?`)) {
            return;
        }
        try {
            await api.delete(`/asterysko/clients/${client.id}`);
            fetchClients();
            alert('Cliente excluído com sucesso!');
        } catch (error) {
            console.error('Failed to delete client', error);
            alert('Falha ao excluir cliente.');
        }
    };

    const [editingClient, setEditingClient] = useState<any | null>(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editCpfCnpj, setEditCpfCnpj] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editState, setEditState] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const handleOpenEdit = (client: any) => {
        setEditingClient(client);
        setEditName(client.name || client.company || '');
        setEditEmail(client.email || '');
        setEditPhone(formatPhoneMask(client.phone || ''));
        setEditCpfCnpj(client.cpfCnpj || client.cnpj || '');
        setEditAddress(client.address || '');
        setEditCity(client.city || '');
        setEditState(client.state || '');
        setActiveDropdownClientId(null);
    };

    const handleSaveClient = async () => {
        if (!editingClient?.id) return;
        try {
            setIsSavingEdit(true);
            const cleanedPhone = sanitizePhoneForSave(editPhone);
            await api.put(`/asterysko/clients/${editingClient.id}`, {
                name: editName,
                email: editEmail,
                phone: cleanedPhone,
                cnpj: editCpfCnpj,
                address: editAddress,
                city: editCity,
                state: editState
            });
            alert('Dados do cliente atualizados com sucesso!');
            setEditingClient(null);
            fetchClients();
        } catch (err: any) {
            console.error('Failed to update client', err);
            alert(err.response?.data?.error || 'Falha ao atualizar dados do cliente.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    return (
        <div className="relative z-0 flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-auto bg-white pb-[env(safe-area-inset-bottom)] font-sans transition-colors duration-300 dark:bg-zinc-950">
            {/* Modal Novo Cliente */}
            <AsteryskoNewClientModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchClients} 
                organizationId={organization?.id}
            />

            {activityClient && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-0 backdrop-blur-xs sm:p-4" onClick={() => setActivityClient(null)}>
                    <div className="flex h-full max-h-none w-full max-w-3xl flex-col overflow-hidden border border-zinc-200 bg-white pt-[env(safe-area-inset-top)] shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:h-auto sm:max-h-[88vh] sm:rounded-2xl sm:pt-0" onClick={event => event.stopPropagation()}>
                        <header className="flex items-start justify-between gap-3 border-b border-zinc-100 p-4 dark:border-zinc-800 sm:p-6">
                            <div className="min-w-0">
                                <h3 className="flex items-start gap-2 font-season text-lg font-bold leading-6 text-black dark:text-white sm:text-[22px]"><Activity size={19} className="mt-0.5 shrink-0 text-[#0412dd]" /><span className="break-words">Atividades de {activityClient.name}</span></h3>
                                <p className="text-xs text-zinc-500 mt-1">Sessões, acessos e ações realizadas no Portal do Cliente.</p>
                            </div>
                            <button onClick={() => setActivityClient(null)} className="shrink-0 rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800" aria-label="Fechar histórico"><X size={21} /></button>
                        </header>
                        <div className="overflow-y-auto p-4 sm:p-6">
                            {activityLoading ? (
                                <div className="py-16 flex justify-center text-zinc-400"><Loader2 className="animate-spin mr-2" size={18} />Carregando histórico...</div>
                            ) : !activityData ? (
                                <p className="py-16 text-center text-sm text-zinc-500">Não foi possível carregar este histórico.</p>
                            ) : (
                                <div className="space-y-6">
                                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-4"><small className="text-zinc-500">Presença</small><strong className={`mt-1 block text-sm ${activityData.presence?.online ? 'text-emerald-600' : 'text-zinc-700 dark:text-zinc-200'}`}>{activityData.presence?.online ? '● Online agora' : 'Offline'}</strong></div>
                                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-4"><small className="text-zinc-500">Último acesso</small><strong className="mt-1 block text-sm text-zinc-800 dark:text-white">{activityData.presence?.lastSeenAt ? new Date(activityData.presence.lastSeenAt).toLocaleString('pt-BR') : 'Nunca acessou'}</strong></div>
                                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-4"><small className="text-zinc-500">Canal de acesso</small><strong className="mt-1 block text-sm text-zinc-800 dark:text-white">{formatActivitySource(activityData.presence?.session?.sourceChannel) || '—'}</strong></div>
                                    </section>

                                    {activityData.sessions?.length > 0 && (
                                        <section>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Sessões recentes</h4>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {activityData.sessions.slice(0, 6).map((session: any) => (
                                                    <div key={session.id} className="min-w-[190px] rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 text-xs">
                                                        <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-white">{session.deviceType === 'mobile' ? <Smartphone size={14} /> : <Monitor size={14} />}{session.browser || 'Navegador'}</div>
                                                        <p className="mt-1 text-zinc-500">{session.operatingSystem || 'Sistema não identificado'}</p>
                                                        <p className="mt-2 text-zinc-500">{new Date(session.startedAt).toLocaleString('pt-BR')}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    <section>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Linha do tempo</h4>
                                        <div className="border-l-2 border-zinc-200 dark:border-zinc-700 ml-3 space-y-4">
                                            {activityData.activities?.length ? activityData.activities.map((event: any) => {
                                                const details = formatActivityMetadata(event.metadata);
                                                return (
                                                    <article key={event.id} className="relative pl-6">
                                                        <span className="absolute -left-[7px] top-2 h-3 w-3 rounded-full bg-[#0412dd] ring-4 ring-white dark:ring-zinc-900" />
                                                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                                                            <strong className="text-sm text-black dark:text-white">{formatActivityContent(event.content)}</strong>
                                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                                                                <Clock3 size={12} />
                                                                {new Date(event.createdAt).toLocaleString('pt-BR')}
                                                                {event.sourceChannel && <span>· Origem: {formatActivitySource(event.sourceChannel)}</span>}
                                                            </div>
                                                            {details.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                                    {details.map(detail => (
                                                                        <span key={detail.key} className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                                                            <span className="text-zinc-500 dark:text-zinc-400">{detail.label}:</span> {detail.value}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </article>
                                                );
                                            }) : <p className="pl-6 text-sm text-zinc-500">Nenhuma atividade registrada.</p>}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Cliente */}
            {editingClient && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-xs sm:p-4">
                    <div className="my-auto w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-season text-[22px] font-bold text-black dark:text-white flex items-center gap-2">
                                <Edit2 size={18} className="text-[#0412dd] dark:text-[#3b48ff]" /> Editar Cliente
                            </h3>
                            <button onClick={() => setEditingClient(null)} className="text-zinc-400 hover:text-zinc-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nome Completo / Razão Social</label>
                                <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                                    <User size={16} className="text-zinc-400 mr-2 shrink-0" />
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-full bg-transparent text-sm text-black dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">E-mail</label>
                                    <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                                        <Mail size={16} className="text-zinc-400 mr-2 shrink-0" />
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={e => setEditEmail(e.target.value)}
                                            className="w-full bg-transparent text-sm text-black dark:text-white outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Telefone / WhatsApp</label>
                                    <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                                        <Phone size={16} className="text-zinc-400 mr-2 shrink-0" />
                                        <input
                                            type="text"
                                            value={editPhone}
                                            onChange={e => setEditPhone(formatPhoneMask(e.target.value))}
                                            placeholder="(00) 00000-0000"
                                            className="w-full bg-transparent text-sm text-black dark:text-white outline-none"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mt-1">* Formatado automaticamente com DDI Brasil (+55)</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">CPF / CNPJ</label>
                                    <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                                        <FileText size={16} className="text-zinc-400 mr-2 shrink-0" />
                                        <input
                                            type="text"
                                            value={editCpfCnpj}
                                            onChange={e => setEditCpfCnpj(e.target.value)}
                                            className="w-full bg-transparent text-sm text-black dark:text-white outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Cidade / Estado</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Cidade"
                                            value={editCity}
                                            onChange={e => setEditCity(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-black dark:text-white outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="UF"
                                            maxLength={2}
                                            value={editState}
                                            onChange={e => setEditState(e.target.value)}
                                            className="w-16 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-black dark:text-white outline-none text-center font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Endereço Completo</label>
                                <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2">
                                    <MapPin size={16} className="text-zinc-400 mr-2 shrink-0" />
                                    <input
                                        type="text"
                                        value={editAddress}
                                        onChange={e => setEditAddress(e.target.value)}
                                        className="w-full bg-transparent text-sm text-black dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-zinc-100 pt-6 dark:border-zinc-800 sm:flex-row sm:justify-end">
                            <button
                                onClick={() => setEditingClient(null)}
                                className="min-h-11 rounded-xl px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 cursor-pointer dark:hover:bg-zinc-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveClient}
                                disabled={isSavingEdit}
                                className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#0412dd] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                            >
                                {isSavingEdit ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex shrink-0 flex-col items-stretch gap-4 border-b border-[#e5e5e5] px-4 py-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10 lg:pb-6 lg:pt-8">
                <span className="font-season text-[22px] font-[420] text-black dark:text-white">Clientes</span>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex h-11 w-full items-center justify-center rounded-full border border-[#e5e5e5] bg-white px-4 font-sans text-xs font-semibold text-black shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 sm:h-[36px] sm:w-auto"
                >
                    <div className="bg-[#0412dd] dark:bg-[#3b48ff] rounded-full p-0.5 mr-2">
                        <Plus size={10} className="text-white" strokeWidth={3} />
                    </div>
                    Novo cliente
                </button>
            </div>

            {/* Table */}
            <div className="w-full flex-1">
                {/* Table Header */}
                <div className="hidden grid-cols-12 border-b border-[#e5e5e5] bg-[#fafafa] px-10 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 lg:grid">
                    <div className="col-span-3 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Cliente</div>
                    <div className="col-span-3 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Email</div>
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Processos</div>
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Cadastrado</div>
                    <div className="col-span-2 text-sm font-semibold text-[#131f15] dark:text-zinc-200">Responsável</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12 opacity-40">
                            <Loader2 className="animate-spin text-black dark:text-white mr-2" size={16} />
                            <span className="text-sm font-semibold text-black dark:text-white">Carregando...</span>
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="flex justify-center items-center py-12 opacity-40">
                            <span className="text-sm font-semibold text-black dark:text-white">Nenhum cliente encontrado.</span>
                        </div>
                    ) : (
                        clients.map((client) => {
                            const displayedProcesses = client.processes || [];
                            const limit = 5;
                            const extraCount = displayedProcesses.length - limit;

                            return (
                                <div key={client.id} className="group relative grid grid-cols-2 items-start gap-x-4 gap-y-4 border-b border-[#e5e5e5] px-4 py-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-0 lg:px-10">
                                    <div className="col-span-2 min-w-0 pr-10 text-[13px] font-medium text-black dark:text-white lg:col-span-3 lg:pr-4">
                                        <div className="truncate text-sm font-semibold lg:text-[13px] lg:font-medium">{client.company || client.name}</div>
                                        <div className={`mt-1 text-[10px] font-bold ${client.portalPresence?.online ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                            {client.portalPresence?.online
                                                ? `● Online · ${client.portalPresence.sourceChannel === 'whatsapp' ? 'WhatsApp' : client.portalPresence.sourceChannel === 'email' ? 'E-mail' : 'Portal'}`
                                                : client.portalPresence?.lastSeenAt
                                                    ? `Último acesso ${new Date(client.portalPresence.lastSeenAt).toLocaleString('pt-BR')}`
                                                    : 'Nunca acessou o portal'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 min-w-0 text-[13px] font-medium text-black dark:text-white lg:col-span-3 lg:pr-4">
                                        <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-zinc-400 lg:hidden">E-mail</span>
                                        <span className="block truncate">{client.email || 'Não informado'}</span>
                                    </div>
                                    
                                    {/* Processes Overlapping Avatars */}
                                    <div className="col-span-2 flex min-w-0 items-center justify-between gap-3 lg:justify-start lg:pr-4">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 lg:hidden">Processos</span>
                                        {displayedProcesses.length === 0 ? (
                                            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">Nenhum</span>
                                        ) : (
                                            <div className="flex items-center">
                                                <div className="flex items-center -space-x-1.5 overflow-hidden mr-2">
                                                    {displayedProcesses.slice(0, limit).map((proc: any, idx: number) => {
                                                        const initials = proc.brand ? proc.brand.substring(0, 1).toUpperCase() : '?';
                                                        const colorClass = getProcessInitialsColor(proc.brand || '');
                                                        return (
                                                            <div 
                                                                key={proc.id || idx}
                                                                title={`${proc.brand} (${formatStatusLabel(proc.status)})`}
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-zinc-950 shrink-0 select-none ${colorClass}`}
                                                            >
                                                                {initials}
                                                            </div>
                                                        );
                                                    })}
                                                    {extraCount > 0 && (
                                                        <div 
                                                            title={`${extraCount} processo(s) adicional(ais)`}
                                                            className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-zinc-950 shrink-0 select-none"
                                                        >
                                                            +{extraCount}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-bold text-zinc-450 dark:text-zinc-500 select-none">
                                                    ({displayedProcesses.length})
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-1 text-[13px] font-medium text-black dark:text-white lg:col-span-2 lg:pr-4">
                                        <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-zinc-400 lg:hidden">Cadastrado</span>
                                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : '12/12/2022'}
                                    </div>
                                    <div className="col-span-1 min-w-0 text-right text-[13px] font-medium text-black dark:text-white lg:col-span-2 lg:pr-8 lg:text-left">
                                        <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-zinc-400 lg:hidden">Responsável</span>
                                        <span className="block truncate">{client.owner || 'Levy Câmara'}</span>
                                    </div>
                                    
                                    {/* Action Dropdown Menu */}
                                    <div className="absolute right-4 top-4 z-20 lg:right-10 lg:top-auto">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdownClientId(activeDropdownClientId === client.id ? null : client.id);
                                            }}
                                            className="rounded-lg p-2 text-black opacity-70 transition-opacity hover:bg-zinc-100 hover:opacity-100 dark:text-white dark:hover:bg-zinc-800 lg:p-1"
                                            aria-label={`Ações de ${client.company || client.name}`}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {activeDropdownClientId === client.id && (
                                            <>
                                                <div className="absolute right-0 z-30 mt-1 w-48 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 dark:border-zinc-800 dark:bg-zinc-900">
                                                    <button
                                                        onClick={() => void openClientActivities(client)}
                                                        className="flex min-h-10 w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                                    >
                                                        <Activity size={13} className="text-emerald-600 shrink-0" />
                                                        Ver atividades
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenEdit(client)}
                                                        className="flex min-h-10 w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                                    >
                                                        <Edit2 size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                                        Editar Cliente
                                                    </button>
                                                    <button 
                                                        onClick={() => handleResendAccess(client)}
                                                        className="flex min-h-10 w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                                                    >
                                                        Reenviar Acesso
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteClient(client)}
                                                        className="flex min-h-10 w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                                                    >
                                                        Excluir Cliente
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {clients.length > 0 && (
                    <div className="mt-6 pb-12 flex justify-center">
                        <button className="text-[10px] font-semibold text-[#0412dd] dark:text-[#3b48ff] uppercase tracking-wider hover:opacity-80 transition-opacity">
                            CARREGAR MAIS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AsteryskoClientsView;
