import React, { useEffect, useMemo, useState } from 'react';
import { Building2, ChevronRight, Crown, Search, ShieldCheck, UserPlus, UsersRound } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { useToast } from '../../../../context/ToastContext';
import { AllyoClient, AllyoUser, AllyoUserCategory, allyoService } from '../../../../services/allyoService';
import { AllyoPageHeader, ALLYO_BORDER, DataCell } from './AllyoUI';
import { AllyoField, AllyoInput, AllyoPrimaryButton, AllyoSecondaryButton, AllyoSelect } from './AllyoForm';

type HierarchyGroup = 'Direção' | 'Gestão' | 'Operação' | 'Cliente';

const CATEGORY_CONFIG: Record<AllyoUserCategory, { label: string; group: HierarchyGroup; level: number; permission: string }> = {
    CREATIVE_EXCELLENCE_SR_MANAGER: { label: 'Creative Excellence Sr. Manager', group: 'Direção', level: 4, permission: 'Administra a operação criativa, estrutura e acessos.' },
    ADMIN_ATENDIMENTO: { label: 'Admin Atendimento', group: 'Direção', level: 4, permission: 'Administra atendimento, clientes e equipes.' },
    ADMIN_CRIATIVO: { label: 'Admin Criativo', group: 'Direção', level: 4, permission: 'Administra o time criativo, capacidade e qualidade.' },
    CREATIVE_ACCOUNT_MANAGER: { label: 'Creative Account Manager', group: 'Gestão', level: 3, permission: 'Gerencia clientes, projetos e distribuição de tarefas.' },
    CREATIVE_QUALITY_SPECIALIST: { label: 'Creative Quality Specialist', group: 'Gestão', level: 3, permission: 'Revisa materiais, qualidade e aprovações internas.' },
    CREATIVE_ACCOUNT_SUPPORT: { label: 'Creative Account Support', group: 'Gestão', level: 3, permission: 'Apoia contas, prazos e comunicação operacional.' },
    CUSTOMER_SUPPORT: { label: 'Customer Support', group: 'Gestão', level: 3, permission: 'Atende usuários e acompanha solicitações da plataforma.' },
    SQUAD_LEADER: { label: 'Squad Leader', group: 'Gestão', level: 3, permission: 'Coordena uma equipe e acompanha suas entregas.' },
    ATENDIMENTO: { label: 'Atendimento', group: 'Operação', level: 2, permission: 'Acompanha clientes, briefings e prazos atribuídos.' },
    CRIATIVO: { label: 'Criativo', group: 'Operação', level: 2, permission: 'Acessa e executa as tarefas atribuídas.' },
    CRIATIVO_SMB: { label: 'Criativo SMB', group: 'Operação', level: 2, permission: 'Executa tarefas da operação SMB.' },
    ART_DIRECTOR: { label: 'Art Director', group: 'Operação', level: 2, permission: 'Executa e orienta entregas de direção de arte.' },
    CLIENTE: { label: 'Cliente', group: 'Cliente', level: 1, permission: 'Acessa somente a empresa e os projetos vinculados.' },
};

const CATEGORY_GROUPS: HierarchyGroup[] = ['Direção', 'Gestão', 'Operação', 'Cliente'];

const emptyForm = {
    name: '', email: '', phone: '', category: 'CRIATIVO' as AllyoUserCategory,
    jobTitle: '', team: '', language: 'pt-BR', clientId: '',
};

const AllyoUsersView = () => {
    const { addToast } = useToast();
    const [users, setUsers] = useState<AllyoUser[]>([]);
    const [clients, setClients] = useState<AllyoClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [group, setGroup] = useState<'Todos' | HierarchyGroup>('Todos');

    const loadData = async () => {
        setIsLoading(true);
        const [usersResult, clientsResult] = await Promise.allSettled([allyoService.getUsers(), allyoService.getClients()]);
        if (usersResult.status === 'fulfilled') setUsers(usersResult.value.users || []);
        if (clientsResult.status === 'fulfilled') setClients(clientsResult.value.clients || []);
        if (usersResult.status === 'rejected') {
            addToast({ type: 'error', title: 'Não foi possível carregar os usuários', message: 'Tente atualizar a página em alguns instantes.' });
        }
        setIsLoading(false);
    };

    useEffect(() => { void loadData(); }, []);

    const visibleUsers = useMemo(() => {
        const term = search.trim().toLocaleLowerCase('pt-BR');
        return users
            .filter((user) => group === 'Todos' || CATEGORY_CONFIG[user.category]?.group === group)
            .filter((user) => !term || `${user.name} ${user.email} ${user.jobTitle || ''} ${user.client?.name || ''}`.toLocaleLowerCase('pt-BR').includes(term))
            .sort((a, b) => (CATEGORY_CONFIG[b.category]?.level || 0) - (CATEGORY_CONFIG[a.category]?.level || 0));
    }, [group, search, users]);

    const handleCreated = (user: AllyoUser) => {
        setUsers((current) => [user, ...current.filter((item) => item.id !== user.id)]);
        setIsCreateOpen(false);
    };

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader
                title="Usuários e hierarquia"
                actions={<AllyoPrimaryButton onClick={() => setIsCreateOpen(true)}><UserPlus size={15} /> Novo usuário</AllyoPrimaryButton>}
            />

            <section className={`border-b px-5 py-6 sm:px-[30px] ${ALLYO_BORDER}`}>
                <div className="mb-4">
                    <h2 className="font-season text-xl font-normal">Níveis de acesso</h2>
                    <p className="mt-1 text-xs leading-5 text-[#777] dark:text-zinc-400">A categoria define o alcance do usuário. O vínculo com empresa é obrigatório apenas para perfis de cliente.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <HierarchyCard icon={<Crown size={17} />} level="Nível 4" title="Direção" description="Configura a operação e administra acessos." count={users.filter((user) => CATEGORY_CONFIG[user.category]?.group === 'Direção').length} />
                    <HierarchyCard icon={<ShieldCheck size={17} />} level="Nível 3" title="Gestão" description="Coordena contas, equipes e qualidade." count={users.filter((user) => CATEGORY_CONFIG[user.category]?.group === 'Gestão').length} />
                    <HierarchyCard icon={<UsersRound size={17} />} level="Nível 2" title="Operação" description="Atua nas tarefas e projetos atribuídos." count={users.filter((user) => CATEGORY_CONFIG[user.category]?.group === 'Operação').length} />
                    <HierarchyCard icon={<Building2 size={17} />} level="Nível 1" title="Cliente" description="Vê somente sua empresa e seus projetos." count={users.filter((user) => CATEGORY_CONFIG[user.category]?.group === 'Cliente').length} />
                </div>
            </section>

            <section>
                <div className={`flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-[30px] ${ALLYO_BORDER}`}>
                    <div className="relative w-full sm:max-w-xs">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, e-mail ou empresa" className="h-10 w-full rounded-full border border-[#dedede] bg-white pl-9 pr-4 text-xs outline-none focus:border-[#9db669] dark:border-zinc-700 dark:bg-zinc-900" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(['Todos', ...CATEGORY_GROUPS] as const).map((item) => <button key={item} type="button" onClick={() => setGroup(item)} className={`rounded-full border px-3 py-2 text-[11px] font-semibold transition ${group === item ? 'border-[#9db669] bg-[#edf2e2] text-[#536a2e] dark:bg-[#9db669]/15 dark:text-[#cce18e]' : 'border-[#e2e2e2] text-[#777] dark:border-zinc-800 dark:text-zinc-400'}`}>{item}</button>)}
                    </div>
                </div>

                {visibleUsers.map((user) => {
                    const config = CATEGORY_CONFIG[user.category] || CATEGORY_CONFIG.CRIATIVO;
                    return (
                        <div key={user.id} className={`grid min-h-[78px] grid-cols-[minmax(210px,1.3fr)_190px_130px_minmax(160px,1fr)_110px_18px] items-center gap-7 border-b px-5 py-4 sm:px-[30px] max-xl:grid-cols-[minmax(210px,1.3fr)_180px_minmax(160px,1fr)_110px_18px] max-lg:grid-cols-[minmax(210px,1.2fr)_180px_110px_18px] max-sm:grid-cols-[minmax(0,1fr)_100px_18px] ${ALLYO_BORDER}`}>
                            <div className="flex min-w-0 items-center gap-3">
                                <UserAvatar user={user} />
                                <span className="min-w-0"><strong className="block truncate text-sm font-semibold">{user.name}</strong><span className="mt-1 block truncate text-[11px] text-[#777] dark:text-zinc-400">{user.email}</span></span>
                            </div>
                            <DataCell label="CATEGORIA" value={config.label} />
                            <DataCell label="HIERARQUIA" value={`Nível ${config.level} · ${config.group}`} className="max-xl:hidden" />
                            <DataCell label={config.group === 'Cliente' ? 'EMPRESA' : 'EQUIPE / CARGO'} value={user.client?.name || user.team || user.jobTitle || 'Não informado'} className="max-lg:hidden" />
                            <span className="max-sm:hidden"><span className="inline-flex rounded-full bg-[#edf2e2] px-2.5 py-1.5 text-[10px] font-semibold text-[#607738] dark:bg-[#9db669]/15 dark:text-[#cce18e]">{user.status || 'Ativo'}</span></span>
                            <ChevronRight size={18} className="text-[#aaa]" />
                        </div>
                    );
                })}

                {!isLoading && visibleUsers.length === 0 && (
                    <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center"><UsersRound size={26} className="text-[#9db669]" /><strong className="mt-4 text-sm">Nenhum usuário encontrado</strong><span className="mt-2 text-xs text-[#777]">Cadastre o primeiro usuário ou ajuste os filtros.</span></div>
                )}
            </section>

            <CreateUserModal isOpen={isCreateOpen} clients={clients} onClose={() => setIsCreateOpen(false)} onCreated={handleCreated} />
        </div>
    );
};

const HierarchyCard = ({ icon, level, title, description, count }: { icon: React.ReactNode; level: string; title: string; description: string; count: number }) => (
    <div className="rounded-[14px] border border-[#e5e5e5] bg-[#fbfcf8] p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8eedb] text-[#6f8744] dark:bg-[#9db669]/15">{icon}</span><span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#8a8a8a]">{level}</span></div>
        <div className="mt-4 flex items-end justify-between gap-3"><span><strong className="block text-sm font-semibold">{title}</strong><span className="mt-1 block text-[11px] leading-4 text-[#777] dark:text-zinc-400">{description}</span></span><strong className="font-season text-2xl font-normal text-[#7c9550]">{count}</strong></div>
    </div>
);

const UserAvatar = ({ user }: { user: AllyoUser }) => {
    const initials = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    return <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0d1e1d] text-[11px] font-bold text-[#d7e7b1]">{user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials}</span>;
};

const CreateUserModal = ({ isOpen, clients, onClose, onCreated }: { isOpen: boolean; clients: AllyoClient[]; onClose: () => void; onCreated: (user: AllyoUser) => void }) => {
    const { addToast } = useToast();
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const config = CATEGORY_CONFIG[form.category];
    const clientRequired = form.category === 'CLIENTE';

    useEffect(() => { if (!isOpen) setForm(emptyForm); }, [isOpen]);

    const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (clientRequired && !form.clientId) {
            addToast({ type: 'warning', title: 'Selecione a empresa do cliente' });
            return;
        }
        setIsSaving(true);
        try {
            const result = await allyoService.createUser({
                name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined,
                category: form.category, jobTitle: form.jobTitle.trim() || undefined,
                team: form.team.trim() || undefined, language: form.language, clientId: clientRequired ? form.clientId : undefined,
            });
            onCreated(result.user);
            addToast({ type: 'success', title: 'Usuário criado', message: `${form.name.trim()} já pode receber o acesso à Allyo.` });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível criar o usuário', message: error.response?.data?.message || error.response?.data?.error || 'Revise os dados e tente novamente.' });
        } finally { setIsSaving(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo usuário" size="lg" footer={<><AllyoSecondaryButton type="button" onClick={onClose}>Cancelar</AllyoSecondaryButton><AllyoPrimaryButton type="submit" form="allyo-user-form" disabled={isSaving}>{isSaving ? 'Criando...' : 'Criar usuário'}</AllyoPrimaryButton></>}>
            <form id="allyo-user-form" onSubmit={submit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <AllyoField label="Categoria" required className="sm:col-span-2"><AllyoSelect value={form.category} onChange={(event) => update('category', event.target.value)}>
                        {CATEGORY_GROUPS.map((categoryGroup) => <optgroup key={categoryGroup} label={categoryGroup}>{(Object.entries(CATEGORY_CONFIG) as [AllyoUserCategory, typeof config][]).filter(([, item]) => item.group === categoryGroup).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</optgroup>)}
                    </AllyoSelect></AllyoField>
                    <div className="sm:col-span-2 rounded-[12px] border border-[#dce5c9] bg-[#f6f8f1] p-3 dark:border-[#9db669]/30 dark:bg-[#9db669]/10"><span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#718548]">Nível {config.level} · {config.group}</span><p className="mt-1 text-xs leading-5 text-[#596442] dark:text-[#d1dcba]">{config.permission}</p></div>
                    <AllyoField label="Nome completo" required><AllyoInput required minLength={2} value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex.: João da Silva" /></AllyoField>
                    <AllyoField label="E-mail" required><AllyoInput required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="joao@empresa.com" /></AllyoField>
                    <AllyoField label="Telefone" hint="opcional"><AllyoInput value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+55 (11) 99999-9999" /></AllyoField>
                    <AllyoField label="Idioma"><AllyoSelect value={form.language} onChange={(event) => update('language', event.target.value)}><option value="pt-BR">Português (Brasil)</option><option value="en">English</option><option value="es">Español</option></AllyoSelect></AllyoField>
                    {clientRequired && <AllyoField label="Empresa contratual" required className="sm:col-span-2"><AllyoSelect required value={form.clientId} onChange={(event) => update('clientId', event.target.value)}><option value="">Selecione a empresa</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</AllyoSelect></AllyoField>}
                    <AllyoField label="Cargo" hint="opcional"><AllyoInput value={form.jobTitle} onChange={(event) => update('jobTitle', event.target.value)} placeholder={clientRequired ? 'Ex.: Gerente de Marketing' : 'Ex.: Motion Designer'} /></AllyoField>
                    <AllyoField label="Equipe" hint="opcional"><AllyoInput value={form.team} onChange={(event) => update('team', event.target.value)} placeholder={clientRequired ? 'Ex.: Marketing' : 'Ex.: Squad Growth'} /></AllyoField>
                </div>
            </form>
        </Modal>
    );
};

export default AllyoUsersView;
