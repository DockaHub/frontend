import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft, Book, CheckCircle2, ChevronRight, Edit2, Filter, FolderOpen,
    HelpCircle, LayoutDashboard, MessageSquare, Plus, RefreshCw, Search,
    Trash2, Users, X,
} from 'lucide-react';
import { TicketSupport } from '../../../../types';
import { fauvesService } from '../../../../services/fauvesService';
import { formatStatusLabel } from '../../../../utils/statusPresentation';
import {
    EmptyState, FauvesPageHeader, LoadingState, Panel, PrimaryButton, SecondaryButton,
} from './FauvesUI';

interface SupportViewProps {
    activeSubView?: string;
}

const cardTitleClass = 'text-sm font-bold text-slate-900 dark:text-white';
const mutedTextClass = 'text-xs leading-5 text-slate-500 dark:text-zinc-400';
const fieldClass = 'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-base text-slate-900 outline-none transition focus:border-[#2a2ad7] focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';

const SupportView: React.FC<SupportViewProps> = ({ activeSubView = 'helpdesk' }) => {
    const [tickets, setTickets] = useState<TicketSupport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState(0);

    const fetchTickets = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fauvesService.getSupportTickets(1, 20);
            setTickets(data.items || []);
            setTotalItems(data.total || 0);
        } catch (err: any) {
            console.error('Failed to fetch tickets:', err);
            const status = err.response?.status;
            if (status === 401) setError('Sua sessão não tem acesso aos chamados de suporte.');
            else if (status === 404) setError('A integração de suporte ainda não está disponível.');
            else setError('Não foi possível consultar o suporte agora.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { void fetchTickets(); }, []);

    const pageDescription = activeSubView === 'helpdesk-tickets'
        ? 'Acompanhe e responda aos chamados dos usuários.'
        : activeSubView === 'helpdesk-chat'
            ? 'Conversas e atendimentos em tempo real.'
            : activeSubView === 'helpdesk-center'
                ? 'Conteúdo de ajuda para clientes e produtoras.'
                : 'Visão geral dos atendimentos e da base de conhecimento da Fauves.';

    return (
        <div className="h-full min-h-0 overflow-y-auto bg-white animate-in fade-in duration-300 dark:bg-zinc-950">
            <FauvesPageHeader
                title="Suporte"
                description={pageDescription}
                actions={(
                    <SecondaryButton onClick={() => void fetchTickets()} disabled={isLoading}>
                        <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Atualizar
                    </SecondaryButton>
                )}
            />
            <main className="p-4 sm:p-6 lg:p-8">
                {activeSubView === 'helpdesk-tickets' ? (
                    <TicketsView tickets={tickets} isLoading={isLoading} error={error} onRetry={fetchTickets} />
                ) : activeSubView === 'helpdesk-chat' ? (
                    <LiveChatView />
                ) : activeSubView === 'helpdesk-center' ? (
                    <HelpCenterView />
                ) : (
                    <SupportDashboard tickets={tickets} totalTickets={totalItems} />
                )}
            </main>
        </div>
    );
};

const SupportDashboard = ({ tickets, totalTickets }: { tickets: TicketSupport[]; totalTickets: number }) => {
    const resolved = tickets.filter((ticket: any) => ['resolved', 'closed'].includes(String(ticket.status).toLowerCase())).length;
    const open = Math.max(totalTickets - resolved, 0);
    const stats = [
        { label: 'Total de tickets', value: totalTickets, icon: MessageSquare, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' },
        { label: 'Aguardando atendimento', value: open, icon: HelpCircle, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' },
        { label: 'Resolvidos', value: resolved, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' },
        { label: 'Chats ativos', value: 0, icon: Users, tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300' },
    ];

    return (
        <div className="space-y-6">
            <section className="grid grid-cols-2 gap-px overflow-hidden border border-[#e5e5e5] bg-[#e5e5e5] dark:border-zinc-800 dark:bg-zinc-800 xl:grid-cols-4">
                {stats.map(({ label, value, icon: Icon, tone }) => (
                    <div key={label} className="bg-white p-5 dark:bg-zinc-950">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon size={19} /></span>
                        <strong className="mt-5 block text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{value.toLocaleString('pt-BR')}</strong>
                        <span className="mt-1 block text-xs font-medium text-slate-500 dark:text-zinc-400">{label}</span>
                    </div>
                ))}
            </section>

            <Panel className="overflow-hidden rounded-none shadow-none">
                <div className="border-b border-slate-100 px-5 py-4 dark:border-zinc-800 sm:px-6">
                    <h2 className={cardTitleClass}>Áreas de atendimento</h2>
                    <p className={`mt-1 ${mutedTextClass}`}>Acompanhe os principais canais da operação em um só lugar.</p>
                </div>
                <div className="grid md:grid-cols-3 md:divide-x md:divide-slate-100 md:dark:divide-zinc-800">
                    {[
                        { title: 'Gerenciar tickets', description: 'Visualize e responda às solicitações recebidas.', meta: `${open} aguardando`, icon: MessageSquare, tone: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300' },
                        { title: 'Live chat', description: 'Atenda conversas em tempo real com seus clientes.', meta: '0 conversas ativas', icon: Users, tone: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300' },
                        { title: 'Central de ajuda', description: 'Organize categorias e artigos de autoatendimento.', meta: '0 artigos publicados', icon: Book, tone: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-300' },
                    ].map(({ title, description, meta, icon: Icon, tone }) => (
                        <article key={title} className="group border-b border-slate-100 p-5 last:border-b-0 dark:border-zinc-800 md:border-b-0 sm:p-6">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon size={20} /></div>
                            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
                            <p className={`mt-1 ${mutedTextClass}`}>{description}</p>
                            <div className="mt-5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <span>{meta}</span><ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:text-[#2a2ad7]" />
                            </div>
                        </article>
                    ))}
                </div>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
                <Panel className="overflow-hidden rounded-none shadow-none">
                    <div className="border-b border-slate-100 px-5 py-4 dark:border-zinc-800 sm:px-6"><h2 className={cardTitleClass}>Desempenho de tickets</h2></div>
                    <div className="space-y-5 p-5 sm:p-6">
                        {[
                            { label: 'Taxa de resolução', value: totalTickets ? Math.round((resolved / totalTickets) * 100) : 0 },
                            { label: 'Tickets resolvidos', value: totalTickets ? Math.round((resolved / totalTickets) * 100) : 0 },
                            { label: 'Tickets em aberto', value: totalTickets ? Math.round((open / totalTickets) * 100) : 0 },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div className="mb-2 flex justify-between text-xs"><span className="font-medium text-slate-500">{stat.label}</span><strong className="text-slate-900 dark:text-white">{stat.value}%</strong></div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-[#2a2ad7]" style={{ width: `${stat.value}%` }} /></div>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel className="overflow-hidden rounded-none shadow-none">
                    <div className="border-b border-slate-100 px-5 py-4 dark:border-zinc-800 sm:px-6"><h2 className={cardTitleClass}>Resumo da operação</h2></div>
                    <div className="divide-y divide-slate-100 px-5 dark:divide-zinc-800 sm:px-6">
                        {[
                            { icon: MessageSquare, title: `${open} tickets aguardando resposta`, description: 'Fila atual de solicitações de suporte' },
                            { icon: Users, title: '0 chats ativos agora', description: 'Atendimentos em tempo real' },
                            { icon: Book, title: '0 artigos publicados', description: 'Conteúdo disponível na central de ajuda' },
                        ].map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex items-center gap-3 py-4">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-300"><Icon size={17} /></span>
                                <div><h3 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h3><p className="mt-0.5 text-[11px] text-slate-400">{description}</p></div>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
        </div>
    );
};

const TicketsView = ({ tickets, isLoading, error, onRetry }: { tickets: TicketSupport[]; isLoading: boolean; error: string | null; onRetry: () => void }) => {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('Todos');
    const visibleTickets = useMemo(() => tickets.filter((ticket: any) => {
        const matchesQuery = `${ticket.subject} ${ticket.user} ${ticket.id}`.toLowerCase().includes(query.trim().toLowerCase());
        const normalized = String(ticket.status).toLowerCase();
        const matchesStatus = status === 'Todos'
            || (status === 'Abertos' && normalized === 'open')
            || (status === 'Em andamento' && ['in_progress', 'pending'].includes(normalized))
            || (status === 'Fechados' && ['closed', 'resolved'].includes(normalized));
        return matchesQuery && matchesStatus;
    }), [query, status, tickets]);

    return (
        <Panel className="overflow-hidden rounded-none shadow-none">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-zinc-800 sm:p-5 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por assunto, usuário ou ID…" className={`${fieldClass} rounded-full pl-10`} />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {['Todos', 'Abertos', 'Em andamento', 'Fechados'].map((tab) => (
                        <button key={tab} onClick={() => setStatus(tab)} className={`min-h-10 whitespace-nowrap rounded-full px-4 text-xs font-semibold transition ${status === tab ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'}`}>{tab}</button>
                    ))}
                </div>
            </div>

            {isLoading ? <LoadingState label="Carregando tickets…" /> : error ? (
                <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center"><p className="text-sm font-medium text-rose-600">{error}</p><SecondaryButton className="mt-4" onClick={onRetry}><RefreshCw size={14} /> Tentar novamente</SecondaryButton></div>
            ) : visibleTickets.length === 0 ? <EmptyState title="Nenhum ticket encontrado" description="Não há solicitações que correspondam aos filtros selecionados." /> : (
                <>
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800 lg:hidden">
                        {visibleTickets.map((ticket: any) => (
                            <button key={ticket.id} type="button" className="grid min-h-[84px] w-full grid-cols-[minmax(0,1fr)_20px] items-center gap-3 px-4 py-3 text-left transition hover:bg-teal-50/40 dark:hover:bg-teal-950/10">
                                <span className="min-w-0"><span className="flex items-center gap-2"><strong className="truncate text-sm text-slate-900 dark:text-white">{ticket.subject}</strong><Priority value={ticket.priority} /></span><small className="mt-1 block truncate text-[11px] text-slate-500">{ticket.user} · {ticket.date}</small><span className="mt-1.5 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">{formatStatusLabel(ticket.status)}</span></span>
                                <ChevronRight size={17} className="text-slate-300 dark:text-zinc-600" />
                            </button>
                        ))}
                    </div>
                    <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-zinc-800 dark:bg-zinc-800/40"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Assunto</th><th className="px-6 py-4">Usuário</th><th className="px-6 py-4">Prioridade</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Data</th></tr></thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {visibleTickets.map((ticket: any) => <tr key={ticket.id} className="cursor-pointer transition hover:bg-teal-50/30 dark:hover:bg-teal-950/10"><td className="px-6 py-4 font-mono text-xs text-slate-400">{ticket.id.substring(0, 8)}</td><td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{ticket.subject}</td><td className="px-6 py-4 text-slate-600 dark:text-zinc-400">{ticket.user}</td><td className="px-6 py-4"><Priority value={ticket.priority} /></td><td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">{formatStatusLabel(ticket.status)}</span></td><td className="px-6 py-4 text-right text-xs text-slate-400">{ticket.date}</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </Panel>
    );
};

const Priority = ({ value }: { value: string }) => <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase ${value === 'high' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'}`}>{value === 'high' ? 'Alta' : value || 'Normal'}</span>;

const LiveChatView = () => (
    <Panel className="flex min-h-[540px] overflow-hidden rounded-none shadow-none">
        <aside className="flex w-full flex-col border-r border-slate-100 dark:border-zinc-800 md:w-80">
            <div className="border-b border-slate-100 p-5 dark:border-zinc-800">
                <div className="flex items-center gap-2"><Users size={18} className="text-teal-600" /><h2 className={cardTitleClass}>Conversas</h2><span className="ml-auto h-2 w-2 rounded-full bg-rose-500" /></div>
                <div className="relative mt-4"><Filter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${fieldClass} rounded-full pl-9`} placeholder="Buscar conversas…" /></div>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800"><MessageSquare size={25} /></span><h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-white">Nenhuma conversa ativa</h3><p className={`mt-1 ${mutedTextClass}`}>Novos atendimentos aparecerão nesta fila.</p></div>
        </aside>
        <div className="hidden flex-1 flex-col items-center justify-center bg-slate-50/40 p-8 text-center dark:bg-zinc-950/40 md:flex"><span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><Users size={28} /></span><h3 className="mt-5 font-bold text-slate-900 dark:text-white">Selecione uma conversa</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Escolha um chat da lista para começar a atender seus clientes em tempo real.</p></div>
    </Panel>
);

const HelpCenterView = () => {
    const [view, setView] = useState<'home' | 'categories' | 'articles'>('home');
    const [showCategoryForm, setShowCategoryForm] = useState(false);

    if (view === 'categories') return (
        <div className="space-y-6">
            <SubPageHeader onBack={() => setView('home')} title="Categorias da central" description="Organize os artigos por assunto e público." action={!showCategoryForm && <PrimaryButton onClick={() => setShowCategoryForm(true)}><Plus size={15} /> Nova categoria</PrimaryButton>} />
            {showCategoryForm && <CategoryForm onClose={() => setShowCategoryForm(false)} />}
            <Panel className="overflow-hidden">
                <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-zinc-800 dark:bg-zinc-800/40"><tr><th className="px-6 py-4">Ordem</th><th className="px-6 py-4">Nome</th><th className="px-6 py-4">Slug</th><th className="px-6 py-4">Público</th><th className="px-6 py-4">Artigos</th><th className="px-6 py-4 text-right">Ações</th></tr></thead><tbody><tr><td className="px-6 py-4 text-xs font-bold">0</td><td className="px-6 py-4"><span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/30"><HelpCircle size={15} /></span><strong>Exemplo de categoria</strong></span></td><td className="px-6 py-4 font-mono text-xs text-slate-500">exemplo-categoria</td><td className="px-6 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-600">Clientes</span></td><td className="px-6 py-4 text-xs text-slate-500">0 artigos</td><td className="px-6 py-4"><span className="flex justify-end gap-2"><button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-teal-600"><Edit2 size={15} /></button><button className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={15} /></button></span></td></tr></tbody></table></div>
                <div className="p-4 md:hidden"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600"><HelpCircle size={17} /></span><div><strong className="text-sm text-slate-900 dark:text-white">Exemplo de categoria</strong><p className="mt-0.5 text-[11px] text-slate-400">Clientes · 0 artigos</p></div></div></div>
            </Panel>
        </div>
    );

    if (view === 'articles') return (
        <div className="space-y-6">
            <SubPageHeader onBack={() => setView('home')} title="Artigos" description="Gerencie o conteúdo publicado na central de ajuda." action={<PrimaryButton><Plus size={15} /> Novo artigo</PrimaryButton>} />
            <Panel className="p-4"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]"><div className="relative"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className={`${fieldClass} pl-10`} placeholder="Buscar artigos…" /></div><select className={fieldClass}><option>Todas as categorias</option></select><select className={fieldClass}><option>Todos os status</option><option>Publicados</option><option>Rascunhos</option></select></div></Panel>
            <Panel><EmptyState title="Nenhum artigo encontrado" description="Publique o primeiro artigo para começar sua base de conhecimento." /></Panel>
        </div>
    );

    return (
        <div className="space-y-6">
            <SubPageHeader title="Central de ajuda" description="Gerencie a base de conhecimento e reduza o volume de chamados." action={<PrimaryButton onClick={() => setView('articles')}><Plus size={15} /> Novo artigo</PrimaryButton>} />
            <div className="grid gap-4 md:grid-cols-3">
                {[{ label: 'Artigos publicados', icon: Book }, { label: 'Categorias', icon: FolderOpen }, { label: 'Visualizações totais', icon: LayoutDashboard }].map(({ label, icon: Icon }) => <Panel key={label} className="p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-300"><Icon size={19} /></span><strong className="mt-5 block text-2xl text-slate-950 dark:text-white">0</strong><span className="mt-1 block text-xs font-medium text-slate-500">{label}</span></Panel>)}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <HelpCenterAction icon={FolderOpen} title="Gerenciar categorias" description="Organize o conteúdo em grupos fáceis de encontrar." onClick={() => setView('categories')} />
                <HelpCenterAction icon={Book} title="Gerenciar artigos" description="Crie, edite e publique orientações para seus usuários." onClick={() => setView('articles')} />
            </div>
            <Panel><div className="border-b border-slate-100 px-5 py-4 dark:border-zinc-800 sm:px-6"><h2 className={cardTitleClass}>Artigos mais visualizados</h2></div><EmptyState title="Ainda não há dados de leitura" description="As visualizações aparecerão aqui quando houver artigos publicados." /></Panel>
        </div>
    );
};

const SubPageHeader = ({ title, description, action, onBack }: { title: string; description: string; action?: React.ReactNode; onBack?: () => void }) => <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{onBack && <button onClick={onBack} className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition hover:text-teal-600"><ArrowLeft size={14} /> Voltar</button>}<h2 className="text-xl font-bold text-slate-950 dark:text-white">{title}</h2><p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{description}</p></div>{action}</div>;

const HelpCenterAction = ({ icon: Icon, title, description, onClick }: { icon: React.ElementType; title: string; description: string; onClick: () => void }) => <Panel className="overflow-hidden"><button onClick={onClick} className="group flex w-full items-center gap-4 p-5 text-left sm:p-6"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition group-hover:scale-105 dark:bg-teal-950/30 dark:text-teal-300"><Icon size={22} /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-slate-900 dark:text-white">{title}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span></span><ChevronRight size={18} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600" /></button></Panel>;

const CategoryForm = ({ onClose }: { onClose: () => void }) => <Panel className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-800 sm:px-6"><div><h3 className={cardTitleClass}>Nova categoria</h3><p className={`mt-1 ${mutedTextClass}`}>Defina como o conteúdo será organizado.</p></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"><X size={18} /></button></div><div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"><label className="text-xs font-bold text-slate-600 dark:text-zinc-300">Nome *<input className={`${fieldClass} mt-2`} placeholder="Primeiros passos" /></label><label className="text-xs font-bold text-slate-600 dark:text-zinc-300">Slug *<input className={`${fieldClass} mt-2`} placeholder="primeiros-passos" /></label><label className="text-xs font-bold text-slate-600 dark:text-zinc-300 sm:col-span-2">Descrição<textarea rows={3} className={`${fieldClass} mt-2 resize-none`} placeholder="Breve descrição dos artigos desta categoria…" /></label><label className="text-xs font-bold text-slate-600 dark:text-zinc-300">Público-alvo *<select className={`${fieldClass} mt-2`}><option>Clientes (compradores)</option><option>Organizadores</option><option>Produtores</option><option>Todos</option></select></label><label className="text-xs font-bold text-slate-600 dark:text-zinc-300">Ordem<input type="number" defaultValue={0} className={`${fieldClass} mt-2`} /></label><div className="flex gap-2 border-t border-slate-100 pt-5 dark:border-zinc-800 sm:col-span-2"><PrimaryButton><Plus size={15} /> Criar categoria</PrimaryButton><SecondaryButton onClick={onClose}>Cancelar</SecondaryButton></div></div></Panel>;

export default SupportView;
