import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowLeft, Building2, CheckCircle2, ChevronRight, ExternalLink, HeartPulse, Mail, Package, Phone, RefreshCw, Search, Users, X } from 'lucide-react';
import api from '../../../../services/api';

interface ProductAccount { id: string; product: string; externalId: string; status: string; metadata?: Record<string, unknown>; lastSyncedAt: string; }
interface CompanyContact { id: string; name: string; email?: string; phone?: string; jobTitle?: string; isPrimary: boolean; }
interface Company {
    id: string; name: string; legalName?: string; document?: string; website?: string; primaryEmail?: string; primaryPhone?: string;
    status: string; lifecycleStage: string; healthStatus: string; updatedAt: string; productAccounts: ProductAccount[]; contacts: CompanyContact[];
    _count?: { contacts: number };
}
interface RegistryResponse { companies: Company[]; total: number; stats: { active: number; attention: number; byProduct: Record<string, number> }; }
interface CompanyProfileData {
    company: Company;
    summary: { products: number; contacts: number; services: number; activeSubscriptions: number; paidAmount: number; pendingAmount: number };
    contacts: CompanyContact[];
    services: any[];
    contracts: any[];
    finance: { invoices: any[]; subscriptions: any[]; paidAmount: number; pendingAmount: number };
    activities: any[];
    operational: { emails: any[]; tasks: any[]; meetings: any[]; deals: any[]; notes: any[] };
    activitySummary: Record<string, number>;
    productData: Record<string, any>;
}
type DetailKind = 'contact' | 'service' | 'contract' | 'invoice' | 'subscription' | 'deal' | 'activity';
type DetailSelection = { kind: DetailKind; title: string; data: any };

const productStyle: Record<string, string> = {
    ALLYO: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    ASTERYSKO: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900',
    TOKYON: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900',
    FAUVES: 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900',
};

const formatDocument = (value?: string) => {
    if (!value) return 'Documento não informado';
    if (value.length === 14) return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    if (value.length === 11) return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    return value;
};

const ProductBadge = ({ product }: { product: string }) => (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${productStyle[product] || 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
        {product.charAt(0) + product.slice(1).toLowerCase()}
    </span>
);

const DockaClientsView: React.FC = () => {
    const [data, setData] = useState<RegistryResponse>({ companies: [], total: 0, stats: { active: 0, attention: 0, byProduct: {} } });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [search, setSearch] = useState('');
    const [product, setProduct] = useState('ALL');
    const [selected, setSelected] = useState<Company | null>(null);
    const [feedback, setFeedback] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/customers');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch global companies', error);
            setFeedback('Não foi possível carregar as empresas.');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const sync = async () => {
        setSyncing(true); setFeedback('');
        try {
            const response = await api.post('/customers/sync');
            const imported = Object.values(response.data.results || {}).reduce((sum: number, item: any) => sum + Number(item.imported || 0), 0);
            setFeedback(`${imported} vínculo(s) sincronizado(s).`);
            await load();
        } catch (error) {
            console.error('Failed to sync companies', error);
            setFeedback('A sincronização não pôde ser concluída.');
        } finally { setSyncing(false); }
    };

    const filtered = useMemo(() => data.companies.filter((company) => {
        const term = search.trim().toLowerCase();
        const matchesSearch = !term || [company.name, company.legalName, company.document, company.primaryEmail].some((value) => String(value || '').toLowerCase().includes(term));
        return matchesSearch && (product === 'ALL' || company.productAccounts.some((account) => account.product === product));
    }), [data.companies, product, search]);

    const multiBusiness = data.companies.filter((company) => company.productAccounts.length > 1).length;
    const products = Array.from(new Set(data.companies.flatMap((company) => company.productAccounts.map((account) => account.product)))).sort();

    return (
        <div className="flex h-full flex-col bg-[#f7f7f5] dark:bg-zinc-950">
            <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
                <div><h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Empresas Manyways</h1><p className="text-xs text-zinc-500">Cadastro global e vínculos com cada negócio.</p></div>
                <button onClick={sync} disabled={syncing} className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900">
                    <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />{syncing ? 'Sincronizando' : 'Sincronizar negócios'}
                </button>
            </header>

            <main className="flex-1 space-y-5 overflow-y-auto p-6">
                {feedback && <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">{feedback}</div>}
                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                        { label: 'Empresas globais', value: data.total, icon: Building2 }, { label: 'Ativas', value: data.stats.active, icon: CheckCircle2 },
                        { label: 'Em mais de um negócio', value: multiBusiness, icon: Users }, { label: 'Precisam de atenção', value: data.stats.attention, icon: AlertTriangle },
                    ].map(({ label, value, icon: Icon }) => (
                        <article key={label} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><Icon size={18} className="mb-5 text-zinc-400" /><strong className="block text-2xl text-zinc-900 dark:text-zinc-100">{value}</strong><span className="text-xs text-zinc-500">{label}</span></article>
                    ))}
                </section>

                <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 md:flex-row dark:border-zinc-800">
                        <label className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empresa, documento ou contato" className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100" /></label>
                        <div className="flex gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">{['ALL', ...products].map((item) => <button key={item} onClick={() => setProduct(item)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${product === item ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white' : 'text-zinc-500'}`}>{item === 'ALL' ? 'Todos' : item.charAt(0) + item.slice(1).toLowerCase()}</button>)}</div>
                    </div>
                    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-800/60"><tr><th className="px-5 py-3">Empresa</th><th className="px-5 py-3">Negócios</th><th className="px-5 py-3">Contato principal</th><th className="px-5 py-3">Saúde</th><th className="px-5 py-3">Atualização</th></tr></thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {loading ? <tr><td colSpan={5} className="px-5 py-16 text-center text-zinc-400">Carregando empresas...</td></tr> : filtered.map((company) => (
                                <tr key={company.id} onClick={() => setSelected(company)} className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                    <td className="px-5 py-4"><strong className="block text-zinc-900 dark:text-zinc-100">{company.name}</strong><span className="text-xs text-zinc-500">{formatDocument(company.document)}</span></td>
                                    <td className="px-5 py-4"><div className="flex flex-wrap gap-1.5">{company.productAccounts.map((account) => <ProductBadge key={account.id} product={account.product} />)}</div></td>
                                    <td className="px-5 py-4"><span className="block text-zinc-700 dark:text-zinc-300">{company.contacts[0]?.name || 'Não definido'}</span><span className="text-xs text-zinc-500">{company.primaryEmail || company.contacts[0]?.email || 'Sem e-mail'}</span></td>
                                    <td className="px-5 py-4"><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{company.healthStatus === 'UNASSESSED' ? 'Não avaliada' : company.healthStatus}</span></td>
                                    <td className="px-5 py-4 text-xs text-zinc-500">{new Date(company.updatedAt).toLocaleDateString('pt-BR')}</td>
                                </tr>
                            ))}
                            {!loading && filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-16 text-center text-zinc-500">Nenhuma empresa encontrada. Sincronize os negócios para iniciar a base global.</td></tr>}
                        </tbody>
                    </table></div>
                </section>
            </main>
            {selected && <CompanyProfile company={selected} onClose={() => setSelected(null)} />}
        </div>
    );
};

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const statusLabels: Record<string, string> = { PAID: 'Pago', PENDING: 'Pendente', OVERDUE: 'Vencido', ACTIVE: 'Ativo', UNASSESSED: 'Não avaliada' };
const statusLabel = (value?: string) => statusLabels[String(value || '').toUpperCase()] || value || 'Não informado';

const CompanyProfile = ({ company, onClose }: { company: Company; onClose: () => void }) => {
    const [profile, setProfile] = useState<CompanyProfileData | null>(null);
    const [tab, setTab] = useState<'overview' | 'finance' | 'activities' | 'intelligence'>('overview');
    const [detail, setDetail] = useState<DetailSelection | null>(null);
    useEffect(() => { api.get(`/customers/${company.id}`).then((response) => setProfile(response.data)).catch(() => setProfile(null)); }, [company.id]);
    const current = profile?.company || company;

    return <div className="fixed inset-0 z-50 flex flex-col bg-[#f4f4f2] dark:bg-zinc-950">
        <header className="flex min-h-20 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-4"><button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"><ArrowLeft size={20} /></button><div><span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ManyCompanyID · {current.id}</span><h2 className="text-xl font-bold text-zinc-900 dark:text-white">{current.name}</h2></div></div>
            <div className="flex items-center gap-3"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{statusLabel(current.status)}</span><button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={20} /></button></div>
        </header>
        <nav className="flex shrink-0 justify-center border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">{[
            ['overview', 'Visão geral'], ['finance', 'Faturamento'], ['activities', 'Atividades'], ['intelligence', 'Inteligência'],
        ].map(([id, label]) => <button key={id} onClick={() => setTab(id as any)} className={`min-w-40 border-b-2 px-8 py-4 text-sm font-semibold ${tab === id ? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white' : 'border-transparent text-zinc-400'}`}>{label}</button>)}</nav>
        {!profile ? <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">Carregando painel da empresa...</div> : <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="space-y-4 overflow-y-auto">
                <Panel title="Sobre a empresa"><Info label="Nome" value={current.name} /><Info label="Razão social" value={current.legalName} /><Info label="Documento" value={formatDocument(current.document)} /><Info label="Estágio" value={current.lifecycleStage} /><Info label="Saúde" value={statusLabel(current.healthStatus)} /></Panel>
                <Panel title="Contato principal"><p className="flex items-center gap-2 text-sm"><Mail size={14} />{current.primaryEmail || 'Não informado'}</p><p className="mt-2 flex items-center gap-2 text-sm"><Phone size={14} />{current.primaryPhone || 'Não informado'}</p></Panel>
                <Panel title="Presença no ecossistema"><div className="flex flex-wrap gap-2">{current.productAccounts.map((account) => <ProductBadge key={account.id} product={account.product} />)}</div></Panel>
            </aside>
            <main className="overflow-y-auto">
                {tab === 'overview' && <OverviewTab profile={profile} onOpen={setDetail} />}
                {tab === 'finance' && <FinanceTab profile={profile} onOpen={setDetail} />}
                {tab === 'activities' && <ActivitiesTab profile={profile} onOpen={setDetail} />}
                {tab === 'intelligence' && <IntelligenceTab profile={profile} />}
            </main>
            <aside className="space-y-4 overflow-y-auto">
                <Panel title={`Contatos (${profile.contacts.length})`}>{profile.contacts.length ? profile.contacts.map((contact) => <RecordButton key={contact.id} onClick={() => setDetail({ kind: 'contact', title: contact.name, data: contact })}><strong className="block text-sm">{contact.name}</strong><span className="text-xs text-zinc-500">{contact.jobTitle || 'Cargo não informado'}</span><span className="block text-xs text-zinc-500">{contact.email}</span></RecordButton>) : <Empty text="Nenhum contato associado" />}</Panel>
                <Panel title={`Serviços (${profile.services.length})`}>{profile.services.slice(0, 5).map((service) => <RecordButton key={service.id} onClick={() => setDetail({ kind: 'service', title: service.brand?.name || 'Serviço', data: service })}><strong className="block text-sm">{service.brand?.name || 'Serviço'}</strong><span className="text-xs text-zinc-500">{service.inpiProcessNumber || service.status}</span></RecordButton>)}{!profile.services.length && <Empty text="Nenhum serviço associado" />}</Panel>
                <Panel title={`Negócios (${profile.operational.deals.length})`}>{profile.operational.deals.slice(0, 5).map((deal) => <RecordButton key={deal.id} onClick={() => setDetail({ kind: 'deal', title: deal.title, data: deal })}><strong className="block text-sm">{deal.title}</strong><span className="text-xs text-zinc-500">{statusLabel(deal.status)}{deal.value !== null ? ` · ${money(deal.value)}` : ''}</span></RecordButton>)}{!profile.operational.deals.length && <Empty text="Nenhum negócio associado" />}</Panel>
                <Panel title={`Faturas (${profile.finance.invoices.length})`}>{profile.finance.invoices.slice(0, 4).map((invoice) => <RecordButton key={invoice.id} onClick={() => setDetail({ kind: 'invoice', title: invoice.description || `Fatura ${invoice.id.slice(0, 8)}`, data: invoice })}><strong className="text-sm">{money(invoice.amount)}</strong><span className="float-right text-xs text-zinc-500">{statusLabel(invoice.status)}</span><span className="block text-xs text-zinc-500">{new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</span></RecordButton>)}{!profile.finance.invoices.length && <Empty text="Nenhuma fatura associada" />}</Panel>
            </aside>
        </div>}
        {detail && <DetailDrawer detail={detail} onClose={() => setDetail(null)} />}
    </div>;
};

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><h3 className="mb-4 font-bold text-zinc-900 dark:text-white">{title}</h3>{children}</section>;
const Info = ({ label, value }: { label: string; value?: string | null }) => <div className="mb-3"><span className="block text-[10px] font-bold uppercase text-zinc-400">{label}</span><span className="text-sm text-zinc-700 dark:text-zinc-300">{value || 'Não informado'}</span></div>;
const Empty = ({ text }: { text: string }) => <p className="py-5 text-center text-xs text-zinc-400">{text}</p>;
const RecordButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => <button type="button" onClick={onClick} className="group flex w-full items-center justify-between border-b border-zinc-100 py-3 text-left last:border-0 hover:text-zinc-950 dark:border-zinc-800 dark:hover:text-white"><span className="min-w-0 flex-1">{children}</span><ChevronRight size={15} className="ml-2 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5" /></button>;

const OverviewTab = ({ profile, onOpen }: { profile: CompanyProfileData; onOpen: (detail: DetailSelection) => void }) => <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
        ['Saúde', statusLabel(profile.company.healthStatus), HeartPulse], ['Negócios', profile.summary.products, Building2], ['Serviços', profile.summary.services, Package], ['Contatos', profile.summary.contacts, Users],
    ].map(([label, value, Icon]: any) => <Panel key={label} title={label}><Icon size={18} className="mb-4 text-zinc-400" /><strong className="text-xl">{value}</strong></Panel>)}</div>
    <Panel title="Saúde da conta"><div className="grid gap-4 md:grid-cols-3"><Info label="Situação" value={statusLabel(profile.company.healthStatus)} /><Info label="Última atualização" value={new Date(profile.company.updatedAt).toLocaleDateString('pt-BR')} /><Info label="Pendências financeiras" value={money(profile.summary.pendingAmount)} /></div></Panel>
    <Panel title="Especificações por negócio"><div className="grid gap-3 md:grid-cols-2">{profile.company.productAccounts.map((account) => <article key={account.id} className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800"><ProductBadge product={account.product} /><div className="mt-4 grid grid-cols-2 gap-3">{Object.entries(account.metadata || {}).filter(([, value]) => value !== null && value !== '').map(([key, value]) => <Info key={key} label={key} value={String(value)} />)}</div></article>)}</div></Panel>
    <Panel title={`Contratos (${profile.contracts.length})`}>{profile.contracts.length ? profile.contracts.map((contract) => <RecordButton key={contract.id} onClick={() => onOpen({ kind: 'contract', title: contract.brand?.name || 'Contrato', data: contract })}><span className="flex items-center justify-between"><span><strong className="block text-sm">{contract.brand?.name}</strong><span className="text-xs text-zinc-500">{contract.planType || 'Plano não informado'}</span></span><span className="text-xs font-semibold">{statusLabel(contract.contractSignStatus)}</span></span></RecordButton>) : <Empty text="Nenhum contrato associado" />}</Panel>
    <Panel title="Operação conectada"><div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[
        ['E-mails', profile.operational.emails.length], ['Tarefas', profile.operational.tasks.length], ['Reuniões', profile.operational.meetings.length], ['Negócios', profile.operational.deals.length], ['Observações', profile.operational.notes.length],
    ].map(([label, value]) => <div key={String(label)} className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800"><strong className="block text-lg">{value}</strong><span className="text-xs text-zinc-500">{label}</span></div>)}</div></Panel>
</div>;

const FinanceTab = ({ profile, onOpen }: { profile: CompanyProfileData; onOpen: (detail: DetailSelection) => void }) => <div className="space-y-4"><div className="grid grid-cols-2 gap-3"><Panel title="Recebido"><strong className="text-2xl">{money(profile.finance.paidAmount)}</strong></Panel><Panel title="Pendente"><strong className="text-2xl">{money(profile.finance.pendingAmount)}</strong></Panel></div><Panel title={`Faturas (${profile.finance.invoices.length})`}>{profile.finance.invoices.map((invoice) => <RecordButton key={invoice.id} onClick={() => onOpen({ kind: 'invoice', title: invoice.description || `Fatura ${invoice.id.slice(0, 8)}`, data: invoice })}><span className="grid grid-cols-[1fr_auto_auto] gap-4 text-sm"><span>{invoice.description || invoice.type}</span><span>{new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</span><strong>{money(invoice.amount)} · {statusLabel(invoice.status)}</strong></span></RecordButton>)}{!profile.finance.invoices.length && <Empty text="Nenhuma fatura associada" />}</Panel><Panel title={`Assinaturas (${profile.finance.subscriptions.length})`}>{profile.finance.subscriptions.map((subscription) => <RecordButton key={subscription.id} onClick={() => onOpen({ kind: 'subscription', title: subscription.description || 'Assinatura', data: subscription })}><span className="flex justify-between text-sm"><span>{subscription.description}</span><strong>{money(subscription.amount)} · {statusLabel(subscription.status)}</strong></span></RecordButton>)}{!profile.finance.subscriptions.length && <Empty text="Nenhuma assinatura associada" />}</Panel></div>;

const activityFilters = [
    ['ALL', 'Todas'], ['NOTE', 'Observações'], ['EMAIL', 'E-mails'], ['TASK', 'Tarefas'], ['MEETING', 'Reuniões'], ['DEAL', 'Negócios'], ['INVOICE', 'Financeiro'],
];

const ActivitiesTab = ({ profile, onOpen }: { profile: CompanyProfileData; onOpen: (detail: DetailSelection) => void }) => {
    const [filter, setFilter] = useState('ALL');
    const items = filter === 'ALL' ? profile.activities : profile.activities.filter((activity) => activity.category === filter);
    return <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">{activityFilters.map(([id, label]) => {
            const count = id === 'ALL' ? profile.activities.length : (profile.activitySummary[id] || 0);
            return <button key={id} onClick={() => setFilter(id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${filter === id ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'}`}>{label} · {count}</button>;
        })}</div>
        <Panel title={`Linha do tempo (${items.length})`}>{items.map((activity) => <button type="button" key={activity.id} onClick={() => onOpen({ kind: 'activity', title: activity.title || activity.type, data: activity })} className="flex w-full gap-3 border-b border-zinc-100 py-4 text-left last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"><Activity size={16} className="mt-1 shrink-0 text-zinc-400" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="block text-sm">{activity.title || activity.type}</strong><span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">{activity.category}</span>{activity.status && <span className="text-[10px] font-semibold text-zinc-400">{statusLabel(activity.status)}</span>}</div><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{activity.content}</p><span className="text-xs text-zinc-400">{new Date(activity.occurredAt).toLocaleString('pt-BR')}{activity.actor ? ` · ${activity.actor}` : ''} · {activity.source}</span></div><ChevronRight size={15} className="mt-1 shrink-0 text-zinc-300" /></button>)}{!items.length && <Empty text="Nenhum registro nesta categoria" />}</Panel>
    </div>;
};

const dateValue = (value?: string | Date | null) => value ? new Date(value).toLocaleString('pt-BR') : 'Não informado';
const amountValue = (value?: number | null) => value === null || value === undefined ? 'Não informado' : money(Number(value));
const detailLabels: Record<DetailKind, string> = { contact: 'Contato', service: 'Serviço', contract: 'Contrato', invoice: 'Fatura', subscription: 'Assinatura', deal: 'Negócio', activity: 'Atividade' };

const detailRows = ({ kind, data }: DetailSelection): Array<[string, React.ReactNode]> => {
    if (kind === 'contact') return [['Nome', data.name], ['Cargo', data.jobTitle], ['E-mail', data.email], ['Telefone', data.phone], ['Contato principal', data.isPrimary ? 'Sim' : 'Não'], ['Atualização', dateValue(data.updatedAt)]];
    if (kind === 'contract') return [['Marca/serviço', data.brand?.name], ['Plano', data.planType], ['Status da assinatura', statusLabel(data.contractSignStatus)], ['Data da assinatura', dateValue(data.contractSignDate)], ['Modelo de cobrança', data.billingMode], ['Valor recorrente', amountValue(data.recurringAmount)], ['Taxa inicial', amountValue(data.initialFeeAmount)], ['Primeiro pagamento', amountValue(data.firstPaymentAmount)], ['Validade/expiração', dateValue(data.expirationDate)], ['Processo INPI', data.inpiProcessNumber]];
    if (kind === 'invoice') return [['Identificador', data.id], ['Status', statusLabel(data.status)], ['Valor', amountValue(data.amount)], ['Valor líquido', amountValue(data.netValue)], ['Vencimento', dateValue(data.dueDate)], ['Pagamento', dateValue(data.paidAt)], ['Forma de pagamento', data.paymentMethod || data.billingType], ['Tipo', data.type], ['Descrição', data.description], ['Competência', data.billingPeriod], ['Falha', data.failureReason], ['Itens', data.items ? JSON.stringify(data.items) : null]];
    if (kind === 'subscription') return [['Status', statusLabel(data.status)], ['Descrição', data.description], ['Valor', amountValue(data.amount)], ['Primeiro pagamento', amountValue(data.firstPaymentAmount)], ['Taxa inicial', amountValue(data.initialFeeAmount)], ['Próximo vencimento', dateValue(data.nextDueDate)], ['Ciclo', data.cycle], ['Forma de pagamento', data.paymentMethod], ['Último pagamento', dateValue(data.lastPaymentAt)], ['Status do último pagamento', statusLabel(data.lastPaymentStatus)], ['Última falha', data.lastFailureReason]];
    if (kind === 'service') return [['Marca', data.brand?.name], ['Tipo da marca', data.brand?.type], ['Processo INPI', data.inpiProcessNumber], ['Status', statusLabel(data.status)], ['Plano', data.planType], ['Cobrança', data.billingMode], ['Pagamento', statusLabel(data.paymentStatus)], ['Valor recorrente', amountValue(data.recurringAmount)], ['Taxa inicial', amountValue(data.initialFeeAmount)], ['Protocolo', dateValue(data.filingDate)], ['Concessão', dateValue(data.concessionDate)], ['Expiração', dateValue(data.expirationDate)]];
    if (kind === 'deal') return [['Título', data.title], ['Status', statusLabel(data.status)], ['Prioridade', data.priority], ['Valor', amountValue(data.value)], ['Descrição', data.description || data.subtitle], ['Contato', data.contactName], ['E-mail', data.contactEmail], ['Telefone', data.contactPhone], ['Plano', data.planType], ['Cobrança', data.billingMode], ['Fechamento', dateValue(data.closedAt)], ['Atualização', dateValue(data.updatedAt)]];
    return [['Categoria', data.category], ['Tipo', data.type], ['Status', statusLabel(data.status)], ['Descrição', data.content], ['Responsável', data.actor], ['Origem', data.source], ['Data', dateValue(data.occurredAt)], ['Valor', data.amount === null || data.amount === undefined ? null : amountValue(data.amount)], ['Vencimento', data.dueDate ? dateValue(data.dueDate) : null]];
};

const detailLinks = ({ kind, data }: DetailSelection) => {
    const candidates: Array<[string, unknown]> = kind === 'invoice' ? [
        ['Abrir fatura', data.invoiceUrl], ['Boleto', data.officialBoletoUrl], ['Comprovante', data.receiptUrl || data.transactionReceiptUrl], ['Nota fiscal', data.fiscalInvoiceUrl],
    ] : (kind === 'contract' || kind === 'service') ? [
        ['Abrir contrato', data.contractUrl], ['Procuração', data.proxySignedUrl || data.proxyUrl], ['Protocolo', data.protocolReceiptUrl], ['Certificado', data.certificateUrl],
    ] : [];
    return candidates.filter((entry): entry is [string, string] => typeof entry[1] === 'string' && /^https?:\/\//i.test(entry[1]));
};

const DetailDrawer = ({ detail, onClose }: { detail: DetailSelection; onClose: () => void }) => {
    const rows = detailRows(detail).filter(([, value]) => value !== null && value !== undefined && value !== '');
    const links = detailLinks(detail);
    return <div className="fixed inset-0 z-[70] bg-black/30" onMouseDown={onClose}>
        <aside className="ml-auto flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl dark:bg-zinc-950" onMouseDown={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between border-b border-zinc-200 p-6 dark:border-zinc-800"><div><span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{detailLabels[detail.kind]}</span><h3 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{detail.title}</h3></div><button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={20} /></button></header>
            <div className="flex-1 overflow-y-auto p-6">
                {links.length > 0 && <div className="mb-6 flex flex-wrap gap-2">{links.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">{label}<ExternalLink size={13} /></a>)}</div>}
                <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 px-5 dark:divide-zinc-800 dark:border-zinc-800">{rows.map(([label, value]) => <div key={label} className="py-4"><span className="block text-[10px] font-bold uppercase tracking-wide text-zinc-400">{label}</span><div className="mt-1 break-words text-sm text-zinc-800 dark:text-zinc-200">{value || 'Não informado'}</div></div>)}</div>
            </div>
        </aside>
    </div>;
};

const IntelligenceTab = ({ profile }: { profile: CompanyProfileData }) => <div className="space-y-4"><Panel title="Leitura consolidada"><div className="grid gap-3 md:grid-cols-3"><Info label="Negócios ativos" value={String(profile.summary.products)} /><Info label="Serviços contratados" value={String(profile.summary.services)} /><Info label="Assinaturas ativas" value={String(profile.summary.activeSubscriptions)} /></div></Panel><Panel title="Qualidade dos dados"><p className="text-sm text-zinc-600 dark:text-zinc-300">A inteligência usará somente dados reais dos negócios vinculados. A próxima etapa adicionará avaliação de saúde, riscos e oportunidades com histórico auditável.</p></Panel></div>;

export default DockaClientsView;
