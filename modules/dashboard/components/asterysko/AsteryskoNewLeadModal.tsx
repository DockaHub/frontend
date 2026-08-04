import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, LockKeyhole, Search, UserRound, X } from 'lucide-react';
import api from '../../../../services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organizationId?: string;
}

interface ClientOption {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    cpfCnpj?: string | null;
}

const CRM_STAGES = [
    { id: 'leads', label: 'Novos leads' },
    { id: 'contato_iniciado', label: 'Contato iniciado' },
    { id: 'em_conversa', label: 'Em conversa' },
    { id: 'preparation', label: 'Diagnóstico' },
    { id: 'viability', label: 'Viabilidade' },
    { id: 'proposta', label: 'Proposta' },
    { id: 'contract', label: 'Contrato' }
];

const INITIAL_FORM = {
    clientId: '',
    clientName: '',
    contactEmail: '',
    contactPhone: '',
    brandName: '',
    planId: '',
    serviceInterest: 'Registro de marca',
    assignedUserId: '',
    leadOrigin: 'Instagram',
    status: 'leads',
    priority: 'medium',
    internalNotes: ''
};

const Field = ({ label, locked, children }: { label: string; locked?: boolean; children: React.ReactNode }) => (
    <div className="flex flex-col border-b border-[#e5e5e5] px-6 py-3 dark:border-zinc-800">
        <label className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9f9f9f]">
            {locked && <LockKeyhole size={11} />} {label}
        </label>
        {children}
    </div>
);

const inputClass = 'w-full bg-transparent border-none outline-none font-sans text-[13px] font-semibold text-black dark:text-white placeholder:text-[#ccc] disabled:text-[#8f8f8f] disabled:cursor-not-allowed';

const AsteryskoNewLeadModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, organizationId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [clientMenuOpen, setClientMenuOpen] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setFormData(INITIAL_FORM);
        setFeedback('');
        setClientMenuOpen(false);
        setLoadingOptions(true);
        const requests: Promise<any>[] = [
            api.get('/asterysko/crm/plan-options'),
            api.get('/asterysko/crm/client-options'),
            organizationId ? api.get(`/organizations/${organizationId}/members`) : Promise.resolve({ data: [] })
        ];
        Promise.all(requests)
            .then(([planResponse, clientResponse, memberResponse]) => {
                setPlans(Array.isArray(planResponse.data) ? planResponse.data.filter((plan: any) => plan.active !== false) : []);
                setClients(Array.isArray(clientResponse.data) ? clientResponse.data : []);
                setMembers(Array.isArray(memberResponse.data) ? memberResponse.data.filter((member: any) => String(member.user?.role || member.globalRole || '').toUpperCase() !== 'CLIENT') : []);
            })
            .catch(error => {
                console.error('Failed to load lead options', error);
                setFeedback('Não foi possível carregar clientes, planos ou responsáveis.');
            })
            .finally(() => setLoadingOptions(false));
    }, [isOpen, organizationId]);

    const filteredClients = useMemo(() => {
        const term = formData.clientName.trim().toLocaleLowerCase('pt-BR');
        if (!term || formData.clientId) return clients.slice(0, 8);
        return clients.filter(client => `${client.name} ${client.email || ''} ${client.phone || ''} ${client.cpfCnpj || ''}`.toLocaleLowerCase('pt-BR').includes(term)).slice(0, 8);
    }, [clients, formData.clientId, formData.clientName]);

    const selectedPlan = plans.find(plan => plan.id === formData.planId);
    const existingClientSelected = Boolean(formData.clientId);

    if (!isOpen) return null;

    const selectClient = (client: ClientOption) => {
        setFormData(current => ({
            ...current,
            clientId: client.id,
            clientName: client.name || '',
            contactEmail: client.email || '',
            contactPhone: client.phone || ''
        }));
        setClientMenuOpen(false);
    };

    const clearSelectedClient = () => {
        setFormData(current => ({ ...current, clientId: '', clientName: '', contactEmail: '', contactPhone: '' }));
        setClientMenuOpen(true);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setFeedback('');
        if (!formData.clientName.trim() || !formData.brandName.trim()) return setFeedback('Informe o cliente e a marca.');
        if (!formData.contactEmail.trim()) return setFeedback('Informe o e-mail do cliente para criar o acesso ao portal.');
        if (!formData.planId) return setFeedback('Selecione o plano comercial.');
        if (!formData.assignedUserId) return setFeedback('Selecione o responsável comercial.');

        setIsLoading(true);
        try {
            await api.post('/asterysko/crm/deals', {
                title: formData.brandName.trim(),
                subtitle: formData.clientName.trim(),
                status: formData.status,
                contactName: formData.clientName.trim(),
                contactEmail: formData.contactEmail.trim() || null,
                contactPhone: formData.contactPhone.trim() || null,
                clientId: formData.clientId || null,
                assignedUserId: formData.assignedUserId,
                planId: formData.planId,
                priority: formData.priority,
                description: formData.internalNotes.trim() || null,
                tags: [
                    { label: `Origem: ${formData.leadOrigin}`, color: 'bg-blue-100 text-blue-700' },
                    { label: `Serviço: ${formData.serviceInterest}`, color: 'bg-violet-100 text-violet-700' }
                ],
                organizationId
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to create lead', error);
            setFeedback(error.response?.data?.error || 'Erro ao criar o lead. Revise os dados e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm dark:bg-black/40">
            <div className="m-4 flex w-[440px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl animate-slide-left dark:bg-zinc-950">
                <div className="flex shrink-0 items-center justify-between border-b border-[#e5e5e5] px-6 py-5 dark:border-zinc-800">
                    <div><h2 className="font-season text-[22px] font-[420] text-black dark:text-white">Novo lead</h2><p className="mt-1 text-xs text-[#8f8f8f]">Cliente, plano e responsável serão vinculados ao processo.</p></div>
                    <button onClick={onClose} className="rounded-full p-1 text-[#9f9f9f] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={20} /></button>
                </div>

                <form id="asterysko-new-lead-form" onSubmit={handleSubmit} className="custom-scrollbar flex flex-1 flex-col overflow-y-auto pb-6">
                    <div className="px-6 pb-2 pt-5"><h3 className="font-season text-[18px] font-[420] text-black dark:text-white">Cliente</h3></div>
                    <div className="relative border-b border-[#e5e5e5] px-6 py-3 dark:border-zinc-800">
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#9f9f9f]">Pesquisar ou criar cliente</label>
                        <div className="flex items-center gap-2">
                            {existingClientSelected ? <Check size={16} className="text-emerald-600" /> : <Search size={16} className="text-[#9f9f9f]" />}
                            <input className={inputClass} value={formData.clientName} placeholder="Nome, e-mail, telefone ou CPF/CNPJ" onFocus={() => setClientMenuOpen(true)} onChange={event => { setFormData(current => ({ ...current, clientId: '', clientName: event.target.value, contactEmail: '', contactPhone: '' })); setClientMenuOpen(true); }} />
                            {existingClientSelected && <button type="button" onClick={clearSelectedClient} className="text-[11px] font-bold text-[#0412dd]">Trocar</button>}
                        </div>
                        {clientMenuOpen && !existingClientSelected && (
                            <div className="absolute left-4 right-4 top-[58px] z-20 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                                {filteredClients.map(client => (
                                    <button key={client.id} type="button" onClick={() => selectClient(client)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950"><UserRound size={15} /></span>
                                        <span className="min-w-0"><strong className="block truncate text-xs text-black dark:text-white">{client.name}</strong><small className="block truncate text-[11px] text-[#8f8f8f]">{client.email || client.phone || client.cpfCnpj}</small></span>
                                    </button>
                                ))}
                                {formData.clientName.trim() && (
                                    <button type="button" onClick={() => setClientMenuOpen(false)} className="mt-1 w-full rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-left text-xs font-semibold text-[#0412dd] hover:bg-indigo-50 dark:border-zinc-700 dark:hover:bg-indigo-950/30">
                                        {filteredClients.length ? 'Não é nenhum destes? ' : 'Nenhum cliente encontrado. '}Continuar com “{formData.clientName.trim()}” como novo cliente
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {existingClientSelected && <p className="mx-6 mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">Cliente existente selecionado. Os dados abaixo vêm do cadastro e não podem ser alterados neste lead.</p>}
                    <Field label="E-mail" locked={existingClientSelected}><input type="email" className={inputClass} disabled={existingClientSelected} value={formData.contactEmail} placeholder="cliente@email.com" onChange={event => setFormData(current => ({ ...current, contactEmail: event.target.value }))} /></Field>
                    <Field label="WhatsApp" locked={existingClientSelected}><input className={inputClass} disabled={existingClientSelected} value={formData.contactPhone} placeholder="(00) 00000-0000" onChange={event => setFormData(current => ({ ...current, contactPhone: event.target.value }))} /></Field>

                    <div className="px-6 pb-2 pt-5"><h3 className="font-season text-[18px] font-[420] text-black dark:text-white">Processo</h3></div>
                    <Field label="Marca"><input className={inputClass} value={formData.brandName} placeholder="Nome da marca" onChange={event => setFormData(current => ({ ...current, brandName: event.target.value }))} /></Field>
                    <Field label="Serviço de interesse"><select className={`${inputClass} appearance-none`} value={formData.serviceInterest} onChange={event => setFormData(current => ({ ...current, serviceInterest: event.target.value }))}>{['Registro de marca', 'Renovação', 'Recurso', 'Oposição', 'Transferência', 'Acompanhamento', 'Outro'].map(option => <option key={option}>{option}</option>)}</select></Field>
                    <Field label="Plano comercial">
                        <div className="relative"><select className={`${inputClass} appearance-none pr-6`} value={formData.planId} onChange={event => setFormData(current => ({ ...current, planId: event.target.value }))}><option value="">Selecione um plano</option>{plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name} — {plan.billingMode === 'SUBSCRIPTION' ? `R$ ${Number(plan.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês` : `R$ ${Number(plan.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#9f9f9f]" /></div>
                        {selectedPlan?.billingMode === 'SUBSCRIPTION' && <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-300">Primeira cobrança: R$ {(Number(selectedPlan.value || 0) + (selectedPlan.taxChargeTiming === 'FIRST_PAYMENT' ? Number(selectedPlan.officialTax || 0) : 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Depois: R$ {Number(selectedPlan.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês.</p>}
                    </Field>

                    <div className="px-6 pb-2 pt-5"><h3 className="font-season text-[18px] font-[420] text-black dark:text-white">Organização do atendimento</h3></div>
                    <Field label="Responsável comercial"><select className={`${inputClass} appearance-none`} value={formData.assignedUserId} onChange={event => setFormData(current => ({ ...current, assignedUserId: event.target.value }))}><option value="">Selecione um usuário interno</option>{members.map(member => <option key={member.userId || member.user?.id} value={member.userId || member.user?.id}>{member.user?.name || member.name} {member.user?.email ? `— ${member.user.email}` : ''}</option>)}</select></Field>
                    <Field label="Etapa inicial do CRM"><select className={`${inputClass} appearance-none`} value={formData.status} onChange={event => setFormData(current => ({ ...current, status: event.target.value }))}>{CRM_STAGES.map(stage => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select>{formData.status === 'contract' && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Ao cadastrar, o cliente e o processo serão provisionados e o contrato será enviado por e-mail, WhatsApp e portal.</p>}</Field>
                    <Field label="Origem do lead"><select className={`${inputClass} appearance-none`} value={formData.leadOrigin} onChange={event => setFormData(current => ({ ...current, leadOrigin: event.target.value }))}>{['Instagram', 'Site', 'Indicação', 'Prospecção ativa', 'Outros'].map(option => <option key={option}>{option}</option>)}</select></Field>
                    <Field label="Prioridade"><select className={`${inputClass} appearance-none`} value={formData.priority} onChange={event => setFormData(current => ({ ...current, priority: event.target.value }))}><option value="low">Baixa</option><option value="medium">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option></select></Field>
                    <Field label="Observações internas"><textarea rows={3} className={`${inputClass} resize-none`} value={formData.internalNotes} placeholder="Contexto comercial e próximos passos" onChange={event => setFormData(current => ({ ...current, internalNotes: event.target.value }))} /></Field>
                    {feedback && <p className="mx-6 mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">{feedback}</p>}
                </form>

                <div className="shrink-0 bg-white p-6 dark:bg-zinc-950">
                    <button form="asterysko-new-lead-form" type="submit" disabled={isLoading || loadingOptions} className="flex h-12 w-full items-center justify-center rounded-lg bg-[#0412dd] text-[13px] font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 dark:bg-[#3b48ff]">
                        {isLoading ? (formData.status === 'contract' ? 'Criando acesso e enviando contrato...' : 'Cadastrando...') : loadingOptions ? 'Carregando opções...' : 'Cadastrar lead'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsteryskoNewLeadModal;
