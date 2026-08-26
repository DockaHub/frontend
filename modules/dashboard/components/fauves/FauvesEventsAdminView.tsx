import React, { useEffect, useMemo, useState } from 'react';
import { AlertOctagon, CalendarDays, ChevronLeft, ChevronRight, Eye, Loader2, MapPin, MoreHorizontal, PauseCircle, Pin, PlayCircle, RefreshCw, Save, ShieldAlert, Ticket } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { fauvesService } from '../../../../services/fauvesService';
import { ConfirmAction, EmptyState, ExportButton, LoadingState, PageHeader, Panel, PrimaryButton, SearchInput, SecondaryButton, StatusBadge, useFauvesToast } from './FauvesUI';

type EventRow = {
    id: string; title: string; date: string; location: string; status: string; image?: string;
    organizationName?: string; ticketsSold?: number; ticketCapacity?: number; isFeatured?: boolean;
    startDate?: string; endDate?: string; locationCity?: string; locationUf?: string; isPublished?: boolean;
    reportsCount?: number; slug?: string;
};

const FauvesEventsAdminView: React.FC = () => {
    const notify = useFauvesToast();
    const [events, setEvents] = useState<EventRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('ALL');
    const [selected, setSelected] = useState<EventRow | null>(null);
    const [menuId, setMenuId] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ title: '', startDate: '', endDate: '', location: '', image: '' });
    const [busy, setBusy] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ event: EventRow; action: string; title: string; description: string; confirmation?: string } | null>(null);
    const limit = 20;

    const load = async () => {
        setLoading(true);
        try { const response = await fauvesService.getEvents(page, limit); setEvents(response.items as EventRow[]); setTotal(response.total); }
        catch { notify('Não foi possível carregar a moderação de eventos.', 'error'); setEvents([]); }
        finally { setLoading(false); }
    };
    useEffect(() => { void load(); }, [page]);

    const filtered = useMemo(() => events.filter((event) => {
        const matchesQuery = `${event.title} ${event.organizationName} ${event.location}`.toLowerCase().includes(query.toLowerCase());
        return matchesQuery && (status === 'ALL' || event.status.toLowerCase() === status.toLowerCase());
    }), [events, query, status]);

    const openEvent = async (event: EventRow) => {
        setSelected(event);
        setEditing(false);
        setForm({ title: event.title, startDate: event.startDate?.slice(0, 16) || '', endDate: event.endDate?.slice(0, 16) || '', location: event.location, image: event.image || '' });
        try {
            const details = await fauvesService.getEvent(event.id);
            const merged = { ...event, ...details, title: details.name || details.title || event.title };
            setSelected(merged);
            setForm({ title: merged.title, startDate: merged.startDate?.slice(0, 16) || '', endDate: merged.endDate?.slice(0, 16) || '', location: merged.location || '', image: merged.image || '' });
        } catch { /* Usa os dados da listagem. */ }
    };

    const performAction = async () => {
        if (!pendingAction) return;
        setBusy(true);
        try {
            await fauvesService.runAdminAction('events', pendingAction.event.id, pendingAction.action, { reason: 'Ação de moderação no Fauves HQ' });
            setEvents((items) => items.map((item) => item.id === pendingAction.event.id ? {
                ...item,
                status: pendingAction.action === 'publish' ? 'published' : pendingAction.action === 'pause' ? 'paused' : pendingAction.action === 'block' ? 'blocked' : item.status,
                isFeatured: pendingAction.action === 'feature' ? !item.isFeatured : item.isFeatured,
            } : item));
            notify(`${pendingAction.title} concluído e auditado.`);
            setPendingAction(null);
        } catch { notify('A API Fauves não concluiu a ação de moderação.', 'error'); }
        finally { setBusy(false); }
    };

    const saveEmergencyEdit = async () => {
        if (!selected) return;
        setBusy(true);
        try {
            await fauvesService.updateEvent(selected.id, { name: form.title, startDate: form.startDate || undefined, endDate: form.endDate || undefined, location: form.location, image: form.image, auditReason: 'Edição administrativa de emergência' });
            setEvents((items) => items.map((item) => item.id === selected.id ? { ...item, ...form, title: form.title } : item));
            setSelected({ ...selected, ...form, title: form.title });
            setEditing(false);
            notify('Evento atualizado com registro de auditoria.');
        } catch { notify('Não foi possível salvar a edição emergencial.', 'error'); }
        finally { setBusy(false); }
    };

    const action = (event: EventRow, type: string) => {
        const config: Record<string, { title: string; description: string; confirmation?: string }> = {
            publish: { title: 'Publicar evento', description: 'O evento ficará disponível para venda imediatamente.' },
            pause: { title: 'Pausar vendas', description: 'Novos pedidos serão interrompidos imediatamente.', confirmation: 'PAUSAR' },
            feature: { title: event.isFeatured ? 'Remover destaque' : 'Fixar na homepage', description: 'A curadoria da homepage será atualizada.' },
            block: { title: 'Bloquear por fraude/ilegalidade', description: 'Vendas serão interrompidas e o evento será marcado para investigação.', confirmation: 'BLOQUEAR' },
        };
        setPendingAction({ event, action: type, ...config[type] });
        setMenuId(null);
    };

    return <div className="animate-in fade-in duration-500">
        <PageHeader eyebrow="Trust & Safety" title="Moderação global de eventos" description="Aprove, pause e investigue eventos com visão operacional de ocupação e denúncias." actions={<><ExportButton filename="eventos-fauves" rows={filtered.map((event) => ({ ID: event.id, Evento: event.title, Produtora: event.organizationName, Local: event.location, Data: event.date, Vendidos: event.ticketsSold, Capacidade: event.ticketCapacity, Status: event.status }))} /><SecondaryButton onClick={() => void load()}><RefreshCw size={14} /> Atualizar</SecondaryButton></>} />
        <Panel className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-zinc-800 sm:flex-row"><SearchInput value={query} onChange={setQuery} placeholder="Buscar evento, cidade ou produtora…" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none dark:border-zinc-700 dark:bg-zinc-900"><option value="ALL">Todos os status</option><option value="published">Publicados</option><option value="draft">Rascunhos</option><option value="paused">Pausados</option><option value="blocked">Bloqueados</option></select></div>
            {loading ? <LoadingState label="Carregando eventos…" /> : filtered.length === 0 ? <EmptyState title="Nenhum evento encontrado" description="Não há eventos compatíveis com os filtros aplicados." /> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:bg-zinc-950/50"><tr><th className="px-5 py-3">Evento</th><th className="px-5 py-3">Produtora</th><th className="px-5 py-3">Local & data</th><th className="px-5 py-3">Ocupação</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Denúncias</th><th className="px-5 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-zinc-800">{filtered.map((event) => { const occupancy = event.ticketCapacity ? Math.min(100, Math.round((Number(event.ticketsSold || 0) / event.ticketCapacity) * 100)) : 0; return <tr key={event.id} className="hover:bg-teal-50/30 dark:hover:bg-teal-950/10"><td className="px-5 py-4"><button onClick={() => void openEvent(event)} className="flex max-w-xs items-center gap-3 text-left"><div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-zinc-800">{event.image ? <img src={event.image} alt="" className="h-full w-full object-cover" /> : <Ticket className="m-auto mt-3 text-slate-400" size={18} />}</div><div className="min-w-0"><div className="truncate font-bold text-slate-900 dark:text-white">{event.title}</div>{event.isFeatured && <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase text-amber-600"><Pin size={10} /> Destaque</span>}</div></button></td><td className="px-5 py-4 font-semibold text-slate-600 dark:text-zinc-300">{event.organizationName}</td><td className="px-5 py-4 text-slate-500"><div className="flex items-center gap-1.5"><MapPin size={12} /> {event.location}</div><div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400"><CalendarDays size={11} /> {event.date}</div></td><td className="px-5 py-4"><div className="flex justify-between text-[10px]"><span>{Number(event.ticketsSold || 0).toLocaleString('pt-BR')}</span><span>{occupancy}%</span></div><div className="mt-2 h-1.5 w-28 rounded-full bg-slate-100 dark:bg-zinc-800"><div className="h-full rounded-full bg-teal-500" style={{ width: `${occupancy}%` }} /></div></td><td className="px-5 py-4"><StatusBadge value={event.status} /></td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1 font-bold ${Number(event.reportsCount || 0) ? 'text-rose-600' : 'text-slate-400'}`}><AlertOctagon size={13} /> {Number(event.reportsCount || 0)}</span></td><td className="relative px-5 py-4 text-right"><button onClick={() => setMenuId(menuId === event.id ? null : event.id)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-zinc-800"><MoreHorizontal size={17} /></button>{menuId === event.id && <div className="absolute right-5 top-12 z-20 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl dark:border-zinc-700 dark:bg-zinc-900">{event.status !== 'published' && <button onClick={() => action(event, 'publish')} className="flex w-full items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800"><PlayCircle size={14} className="text-emerald-500" /> Aprovar e publicar</button>}<button onClick={() => action(event, 'pause')} className="flex w-full items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800"><PauseCircle size={14} className="text-amber-500" /> Pausar vendas</button><button onClick={() => action(event, 'feature')} className="flex w-full items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800"><Pin size={14} className="text-cyan-500" /> {event.isFeatured ? 'Remover destaque' : 'Fixar na home'}</button><button onClick={() => void openEvent(event)} className="flex w-full items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-800"><Eye size={14} /> Abrir painel</button><button onClick={() => action(event, 'block')} className="flex w-full items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"><ShieldAlert size={14} /> Bloquear evento</button></div>}</td></tr>; })}</tbody></table></div>}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-400 dark:border-zinc-800"><span>{total.toLocaleString('pt-BR')} eventos · página {page}</span><div className="flex gap-2"><SecondaryButton disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} /></SecondaryButton><SecondaryButton disabled={page * limit >= total} onClick={() => setPage((value) => value + 1)}><ChevronRight size={14} /></SecondaryButton></div></div>
        </Panel>
        <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title || 'Evento'} size="xl" footer={<>{editing ? <><SecondaryButton onClick={() => setEditing(false)}>Cancelar edição</SecondaryButton><PrimaryButton onClick={() => void saveEmergencyEdit()} disabled={busy}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar emergência</PrimaryButton></> : <><SecondaryButton onClick={() => setSelected(null)}>Fechar</SecondaryButton><PrimaryButton onClick={() => setEditing(true)}>Editar administrativamente</PrimaryButton></>}</>}>
            {selected && <div className="grid gap-6 lg:grid-cols-[1fr_.55fr]">{editing ? <div className="space-y-4"><label className="block text-xs font-bold">Nome<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-bold">Início<input type="datetime-local" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950" /></label><label className="block text-xs font-bold">Fim<input type="datetime-local" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950" /></label></div><label className="block text-xs font-bold">Local<input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950" /></label><label className="block text-xs font-bold">URL do banner<input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950" /></label><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">A edição administrativa será identificada como ação de emergência no Audit Trail.</div></div> : <div>{selected.image && <img src={selected.image} alt="" className="h-60 w-full rounded-2xl object-cover" />}<div className="mt-5 grid gap-4 sm:grid-cols-2"><div><span className="text-[10px] font-bold uppercase text-slate-400">Produtora</span><p className="mt-1 text-sm font-bold">{selected.organizationName}</p></div><div><span className="text-[10px] font-bold uppercase text-slate-400">Local</span><p className="mt-1 text-sm font-bold">{selected.location}</p></div></div></div>}<div className="space-y-4"><div className="rounded-2xl border border-slate-200 p-5 dark:border-zinc-800"><div className="flex items-center justify-between"><span className="text-xs font-bold">Status</span><StatusBadge value={selected.status} /></div><div className="mt-5 flex items-center justify-between"><span className="text-xs font-bold">Ocupação</span><strong className="text-teal-600">{Number(selected.ticketsSold || 0).toLocaleString('pt-BR')} / {Number(selected.ticketCapacity || 0).toLocaleString('pt-BR')}</strong></div></div><div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/20"><AlertOctagon className="text-rose-500" /><h3 className="mt-3 text-sm font-bold text-rose-900 dark:text-rose-200">Painel de denúncias</h3><p className="mt-2 text-xs text-rose-700 dark:text-rose-300">{Number(selected.reportsCount || 0)} denúncias vinculadas a este evento.</p><button className="mt-4 text-xs font-bold text-rose-700 underline">Ver relatos completos</button></div></div></div>}
        </Modal>
        <ConfirmAction open={Boolean(pendingAction)} onClose={() => setPendingAction(null)} onConfirm={() => void performAction()} busy={busy} title={pendingAction?.title || ''} description={pendingAction?.description || ''} confirmationText={pendingAction?.confirmation} />
    </div>;
};

export default FauvesEventsAdminView;
