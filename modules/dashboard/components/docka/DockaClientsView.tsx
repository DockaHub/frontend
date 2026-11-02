import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Building2, CheckCircle2, ExternalLink, Mail, RefreshCw, Search, Users, X } from 'lucide-react';
import api from '../../../../services/api';

interface ProductAccount { id: string; product: string; externalId: string; status: string; metadata?: Record<string, unknown>; lastSyncedAt: string; }
interface CompanyContact { id: string; name: string; email?: string; phone?: string; jobTitle?: string; isPrimary: boolean; }
interface Company {
    id: string; name: string; legalName?: string; document?: string; website?: string; primaryEmail?: string; primaryPhone?: string;
    status: string; lifecycleStage: string; healthStatus: string; updatedAt: string; productAccounts: ProductAccount[]; contacts: CompanyContact[];
    _count?: { contacts: number };
}
interface RegistryResponse { companies: Company[]; total: number; stats: { active: number; attention: number; byProduct: Record<string, number> }; }

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
            {selected && <CompanyDrawer company={selected} onClose={() => setSelected(null)} />}
        </div>
    );
};

const CompanyDrawer = ({ company, onClose }: { company: Company; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25" onMouseDown={onClose}>
        <aside className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl dark:bg-zinc-950" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-start justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ManyCompanyID · {company.id}</span><h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{company.name}</h2><p className="text-sm text-zinc-500">{company.legalName || formatDocument(company.document)}</p></div><button onClick={onClose} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={20} /></button></div>
            <section className="mb-6 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"><h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">Contato</h3><div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300"><p>{company.primaryEmail ? <><Mail size={14} className="mr-2 inline" />{company.primaryEmail}</> : 'E-mail não informado'}</p><p>{company.primaryPhone || 'Telefone não informado'}</p>{company.website && <a className="inline-flex items-center gap-1 font-semibold text-emerald-700" href={company.website} target="_blank" rel="noreferrer">Abrir site <ExternalLink size={13} /></a>}</div></section>
            <section><h3 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">Presença no ecossistema</h3><div className="space-y-3">{company.productAccounts.map((account) => <article key={account.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"><div className="mb-3 flex items-center justify-between"><ProductBadge product={account.product} /><span className="text-[10px] text-zinc-400">{account.status}</span></div><p className="text-xs text-zinc-500">ID local</p><code className="text-xs text-zinc-700 dark:text-zinc-300">{account.externalId}</code>{account.metadata && <div className="mt-3 grid grid-cols-2 gap-2">{Object.entries(account.metadata).filter(([, value]) => value !== null && value !== undefined && value !== '').slice(0, 6).map(([key, value]) => <div key={key}><span className="block text-[10px] uppercase text-zinc-400">{key}</span><span className="text-xs text-zinc-700 dark:text-zinc-300">{String(value)}</span></div>)}</div>}</article>)}</div></section>
        </aside>
    </div>
);

export default DockaClientsView;
