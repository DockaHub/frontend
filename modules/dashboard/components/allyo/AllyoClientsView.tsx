import React, { useEffect, useState } from 'react';
import { BadgeCheck, CalendarClock, Camera, ChevronRight, CircleGauge, Plus, UserRound, Building2 } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../context/ToastContext';
import { ALLYO_BORDER, AllyoPageHeader, DataCell } from './AllyoUI';
import { allyoService, AllyoClient } from '../../../../services/allyoService';
import { AllyoField, AllyoInput, AllyoPrimaryButton, AllyoSecondaryButton, AllyoSelect, AllyoTextarea, AllyoToggle } from './AllyoForm';

const emptyClientForm = {
    name: '', legalName: '', document: '', segment: '', area: '', tier: '2' as '1' | '2' | '3',
    monthlyCredits: '20', contractStart: '', contractEnd: '', cam: '', responsibleEmail: '', logo: '',
    fileNamingPattern: '{{client_name}}_{{project_name}}_{{task_id}}', aiRestricted: false,
    requireTwoFactor: false, billingStatus: 'OK' as 'OK' | 'Aviso' | 'Bloqueado', notes: '', creativeDirection: '',
};

const AllyoClientsView = ({ canManage = false }: { canManage?: boolean }) => {
    const { addToast } = useToast();
    const [clients, setClients] = useState<AllyoClient[]>([]);
    const [selected, setSelected] = useState<AllyoClient | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        allyoService.getClients()
            .then((res) => {
                if (res && Array.isArray(res.clients)) {
                    setClients(res.clients);
                }
            })
            .catch((err) => console.warn('[AllyoClientsView] Erro ao carregar clientes:', err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Clientes" actions={canManage ? <AllyoPrimaryButton onClick={() => setIsCreateOpen(true)}><Plus size={15} /> Nova empresa</AllyoPrimaryButton> : undefined} />
            <section aria-label="Clientes ativos">
                {clients.map((client) => (
                    <button
                        key={client.id}
                        type="button"
                        onClick={() => setSelected(client)}
                        className={`grid min-h-[78px] w-full grid-cols-[minmax(210px,1.2fr)_120px_140px_180px_150px_18px] items-center gap-[50px] border-b px-5 py-4 text-left transition-colors hover:bg-[#fafbf8] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9db669] sm:px-[30px] max-xl:grid-cols-[minmax(190px,1fr)_120px_160px_130px_18px] max-lg:grid-cols-[minmax(190px,1fr)_140px_130px_18px] max-sm:grid-cols-[1fr_105px_18px] ${ALLYO_BORDER}`}
                    >
                        <span className="flex min-w-0 items-center gap-[10px]">
                            <span className="flex h-[35px] w-[35px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#e9e9e9] bg-[#0d1e1d] text-white dark:border-zinc-700">
                                {client.logo ? (
                                    <img src={client.logo} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <Building2 size={18} className="text-[#9db669]" />
                                )}
                            </span>
                            <strong className="truncate text-sm font-medium text-black dark:text-white">{client.name}</strong>
                        </span>
                        <DataCell label="SEGMENTO" value={client.segment} className="max-lg:hidden" />
                        <DataCell label="FRANQUIA MENSAL" value={`${client.monthlyCredits} créditos`} className="max-xl:hidden" />
                        <DataCell label="RESPONSÁVEL ATENDIMENTO" value={client.cam} className="max-sm:hidden" />
                        <DataCell label="VENCIMENTO CONTRATO" value={client.contractEnd} />
                        <ChevronRight size={18} className="text-[#9f9f9f]" />
                    </button>
                ))}

                {!isLoading && clients.length === 0 && (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                        <strong className="text-sm font-semibold">Nenhum cliente cadastrado</strong>
                        <span className="mt-2 text-xs text-[#7f7f7f]">As empresas e clientes cadastrados no portal da Allyo aparecerão aqui.</span>
                        {canManage && <AllyoPrimaryButton className="mt-5" onClick={() => setIsCreateOpen(true)}><Plus size={15} /> Cadastrar empresa</AllyoPrimaryButton>}
                    </div>
                )}
            </section>

            <ClientDetailsModal client={selected} onClose={() => setSelected(null)} />
            <CreateClientModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={(client) => {
                    setClients((current) => [client, ...current.filter((item) => item.id !== client.id)]);
                    setIsCreateOpen(false);
                    addToast({ type: 'success', title: 'Empresa cadastrada', message: `${client.name} já pode receber projetos e usuários.` });
                }}
            />
        </div>
    );
};

const ClientDetailsModal = ({ client, onClose }: { client: AllyoClient | null; onClose: () => void }) => (
    <Modal isOpen={Boolean(client)} onClose={onClose} title="Detalhes do cliente" size="lg">
        {client && (
            <div>
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#e5e5e5] bg-[#0d1e1d] text-white dark:border-zinc-700">
                        {client.logo ? (
                            <img src={client.logo} alt="" className="h-full w-full object-cover rounded-[14px]" />
                        ) : (
                            <Building2 size={26} className="text-[#9db669]" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#739044]"><BadgeCheck size={14} /> Cliente ativo</span>
                        <h2 className="mt-1 truncate font-season text-[28px] font-normal text-black dark:text-white">{client.name}</h2>
                        <p className="mt-1 text-xs text-[#7f7f7f] dark:text-zinc-400">{client.segment} • contrato desde {client.since}</p>
                    </div>
                </div>

                <div className={`mt-6 grid grid-cols-2 border-y md:grid-cols-4 ${ALLYO_BORDER}`}>
                    <ClientMetric icon={<CircleGauge size={16} />} label="FRANQUIA" value={`${client.monthlyCredits} créditos`} />
                    <ClientMetric icon={<CircleGauge size={16} />} label="USO NO MÊS" value={`${client.usedCredits} créditos`} bordered />
                    <ClientMetric icon={<UserRound size={16} />} label="CAM RESPONSÁVEL" value={client.cam} bordered />
                    <ClientMetric icon={<CalendarClock size={16} />} label="VENCIMENTO" value={client.contractEnd} bordered />
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-black dark:text-zinc-200">Consumo da franquia mensal</span>
                        <span className="font-semibold text-[#739044]">
                            {client.monthlyCredits > 0 ? Math.round((client.usedCredits / client.monthlyCredits) * 100) : 0}%
                        </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1e5] dark:bg-zinc-800">
                        <div
                            className="h-full rounded-full bg-[#9db669]"
                            style={{ width: `${Math.min(100, client.monthlyCredits > 0 ? (client.usedCredits / client.monthlyCredits) * 100 : 0)}%` }}
                        />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#7f7f7f] dark:text-zinc-400">
                        Restam {Math.max(0, client.monthlyCredits - client.usedCredits)} créditos disponíveis neste ciclo.
                    </p>
                </div>
            </div>
        )}
    </Modal>
);

const ClientMetric = ({ icon, label, value, bordered = false }: { icon: React.ReactNode; label: string; value: string; bordered?: boolean }) => (
    <div className={`min-w-0 px-3 py-4 first:pl-0 ${bordered ? 'border-l border-[#e5e5e5] pl-4 dark:border-zinc-800' : ''}`}>
        <span className="flex items-center gap-2 text-[#9db669]">{icon}<span className="text-[9px] font-bold tracking-[.04em] text-[#7f7f7f] dark:text-zinc-500">{label}</span></span>
        <strong className="mt-3 block truncate text-xs font-semibold text-black dark:text-white">{value}</strong>
    </div>
);

const CreateClientModal = ({ isOpen, onClose, onCreated }: { isOpen: boolean; onClose: () => void; onCreated: (client: AllyoClient) => void }) => {
    const { addToast } = useToast();
    const [form, setForm] = useState(emptyClientForm);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { if (!isOpen) setForm(emptyClientForm); }, [isOpen]);

    const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [field]: value }));

    const handleLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            addToast({ type: 'warning', title: 'Imagem muito grande', message: 'Escolha um logo de até 2 MB.' });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => update('logo', typeof reader.result === 'string' ? reader.result : '');
        reader.readAsDataURL(file);
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);
        try {
            const result = await allyoService.createClient({
                name: form.name.trim(), legalName: form.legalName.trim() || undefined,
                document: form.document.trim() || undefined, segment: form.segment,
                area: form.area || undefined, tier: form.tier, monthlyCredits: Number(form.monthlyCredits),
                contractStart: form.contractStart || undefined, contractEnd: form.contractEnd || undefined,
                cam: form.cam.trim() || undefined, responsibleEmail: form.responsibleEmail.trim() || undefined,
                logo: form.logo || undefined, fileNamingPattern: form.fileNamingPattern.trim() || undefined,
                aiRestricted: form.aiRestricted, requireTwoFactor: form.requireTwoFactor,
                billingStatus: form.billingStatus, notes: form.notes.trim() || undefined,
                creativeDirection: form.creativeDirection.trim() || undefined,
            });
            onCreated(result.client);
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível cadastrar a empresa', message: error.response?.data?.message || error.response?.data?.error || 'Revise os dados e tente novamente.' });
        } finally { setIsSaving(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova empresa cliente" size="xl" footer={<><AllyoSecondaryButton type="button" onClick={onClose}>Cancelar</AllyoSecondaryButton><AllyoPrimaryButton type="submit" form="allyo-client-form" disabled={isSaving}>{isSaving ? 'Cadastrando...' : 'Cadastrar empresa'}</AllyoPrimaryButton></>}>
            <form id="allyo-client-form" onSubmit={submit} className="space-y-7">
                <div className="flex items-center gap-4">
                    <label className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-[14px] bg-[#0d1e1d] text-[#9db669]">
                        {form.logo ? <img src={form.logo} alt="Prévia do logo" className="h-full w-full object-cover" /> : <Camera size={21} />}
                        <span className="absolute inset-0 hidden items-center justify-center bg-black/55 text-[9px] font-semibold text-white group-hover:flex">Alterar</span>
                        <input type="file" accept="image/*" className="sr-only" onChange={handleLogo} />
                    </label>
                    <span><strong className="block text-sm">Logo da empresa</strong><span className="mt-1 block text-[11px] text-[#888]">Opcional · JPG ou PNG de até 2 MB</span></span>
                </div>

                <FormSection title="Dados contratuais" description="A empresa será a responsável pelos projetos, usuários e consumo de créditos.">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <AllyoField label="Nome fantasia" required><AllyoInput required minLength={2} value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex.: Acme Brasil" /></AllyoField>
                        <AllyoField label="Razão social" hint="opcional"><AllyoInput value={form.legalName} onChange={(event) => update('legalName', event.target.value)} placeholder="Acme Brasil Ltda." /></AllyoField>
                        <AllyoField label="CNPJ / documento" hint="opcional"><AllyoInput value={form.document} onChange={(event) => update('document', event.target.value)} placeholder="00.000.000/0001-00" /></AllyoField>
                        <AllyoField label="E-mail responsável" hint="opcional"><AllyoInput type="email" value={form.responsibleEmail} onChange={(event) => update('responsibleEmail', event.target.value)} placeholder="financeiro@empresa.com" /></AllyoField>
                        <AllyoField label="Início do contrato"><AllyoInput type="date" value={form.contractStart} onChange={(event) => update('contractStart', event.target.value)} /></AllyoField>
                        <AllyoField label="Fim do contrato"><AllyoInput type="date" value={form.contractEnd} onChange={(event) => update('contractEnd', event.target.value)} /></AllyoField>
                    </div>
                </FormSection>

                <FormSection title="Perfil e operação">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AllyoField label="Segmento" required className="lg:col-span-2"><AllyoSelect required value={form.segment} onChange={(event) => update('segment', event.target.value)}><option value="">Selecione</option><option>Tecnologia</option><option>Serviços</option><option>Varejo</option><option>Indústria</option><option>Educação</option><option>Saúde</option><option>Financeiro</option><option>Entretenimento</option><option>Outro</option></AllyoSelect></AllyoField>
                        <AllyoField label="Área"><AllyoSelect value={form.area} onChange={(event) => update('area', event.target.value)}><option value="">Selecione</option><option>Marketing</option><option>Comunicação</option><option>Branding</option><option>Design</option><option>Conteúdo</option><option>Produto</option><option>Comercial</option><option>Outro</option></AllyoSelect></AllyoField>
                        <AllyoField label="Tier"><AllyoSelect value={form.tier} onChange={(event) => update('tier', event.target.value as '1' | '2' | '3')}><option value="1">Tier 1</option><option value="2">Tier 2</option><option value="3">Tier 3</option></AllyoSelect></AllyoField>
                        <AllyoField label="Créditos mensais" required><AllyoInput required type="number" min="1" value={form.monthlyCredits} onChange={(event) => update('monthlyCredits', event.target.value)} /></AllyoField>
                        <AllyoField label="CAM responsável" hint="opcional" className="lg:col-span-2"><AllyoInput value={form.cam} onChange={(event) => update('cam', event.target.value)} placeholder="Nome do responsável de atendimento" /></AllyoField>
                        <AllyoField label="Inadimplência"><AllyoSelect value={form.billingStatus} onChange={(event) => update('billingStatus', event.target.value as 'OK' | 'Aviso' | 'Bloqueado')}><option value="OK">OK</option><option value="Aviso">Aviso</option><option value="Bloqueado">Bloqueado</option></AllyoSelect></AllyoField>
                    </div>
                </FormSection>

                <FormSection title="Regras da conta">
                    <div className="grid gap-3 sm:grid-cols-2"><AllyoToggle checked={form.aiRestricted} onChange={(value) => update('aiRestricted', value)} label="Política contratual proíbe IA" description="Sinaliza tarefas desta empresa para não usar recursos de inteligência artificial." /><AllyoToggle checked={form.requireTwoFactor} onChange={(value) => update('requireTwoFactor', value)} label="Exigir verificação em duas etapas" description="Todos os usuários vinculados terão autenticação reforçada." /></div>
                    <div className="mt-4"><AllyoField label="Nomenclatura padrão de arquivos" hint="opcional"><AllyoInput value={form.fileNamingPattern} onChange={(event) => update('fileNamingPattern', event.target.value)} placeholder="{{client_name}}_{{project_name}}_{{task_id}}" /></AllyoField><p className="mt-2 text-[10px] text-[#888]">Variáveis aceitas: client_name, project_name e task_id.</p></div>
                </FormSection>

                <FormSection title="Contexto criativo" description="Informações que ajudam atendimento e criação desde o primeiro projeto.">
                    <div className="grid gap-4 sm:grid-cols-2"><AllyoField label="Observações" hint="opcional"><AllyoTextarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Acordos, particularidades e contatos importantes." /></AllyoField><AllyoField label="Direção criativa" hint="opcional"><AllyoTextarea value={form.creativeDirection} onChange={(event) => update('creativeDirection', event.target.value)} placeholder="Princípios visuais, tom e orientações permanentes da marca." /></AllyoField></div>
                </FormSection>
            </form>
        </Modal>
    );
};

const FormSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
    <section><div className="mb-4 border-b border-[#ececec] pb-3 dark:border-zinc-800"><h3 className="text-sm font-semibold">{title}</h3>{description && <p className="mt-1 text-[11px] leading-4 text-[#858585] dark:text-zinc-400">{description}</p>}</div>{children}</section>
);

export default AllyoClientsView;
