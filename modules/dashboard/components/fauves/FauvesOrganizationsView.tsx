import React, { useEffect, useMemo, useState } from 'react';
import { Ban, Building2, ChevronLeft, ChevronRight, Loader2, Percent, RefreshCw, Save, ShieldCheck, WalletCards } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { fauvesService } from '../../../../services/fauvesService';
import { ConfirmAction, EmptyState, ExportButton, LoadingState, PageHeader, Panel, PrimaryButton, SearchInput, SecondaryButton, StatusBadge, useFauvesToast } from './FauvesUI';

type OrganizationRow = {
    id: string; name: string; slug: string; eventCount: number; status: string; logo?: string;
    currentLevel?: string; platformFeePercent?: number; lifetimeTicketsSold?: number;
    efiAccountStatus?: string; efiAccountId?: string; bankingInfo?: any; isBlocked?: boolean;
};

const levels = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'BLACK'];

const FauvesOrganizationsView: React.FC = () => {
    const notify = useFauvesToast();
    const [items, setItems] = useState<OrganizationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [query, setQuery] = useState('');
    const [level, setLevel] = useState('ALL');
    const [bankStatus, setBankStatus] = useState('ALL');
    const [selected, setSelected] = useState<OrganizationRow | null>(null);
    const [form, setForm] = useState({ platformFeePercent: 0, currentLevel: 'BRONZE', maintenancePaused: false });
    const [saving, setSaving] = useState(false);
    const [confirmBlock, setConfirmBlock] = useState(false);
    const limit = 20;

    const load = async () => {
        setLoading(true);
        try {
            const response = await fauvesService.getOrganizations(page, limit);
            setItems(response.items as OrganizationRow[]);
            setTotal(response.total);
        } catch {
            notify('Não foi possível carregar as produtoras da API Fauves.', 'error');
            setItems([]);
        } finally { setLoading(false); }
    };

    useEffect(() => { void load(); }, [page]);

    const filtered = useMemo(() => items.filter((item) => {
        const matchesQuery = `${item.name} ${item.slug}`.toLowerCase().includes(query.toLowerCase());
        const matchesLevel = level === 'ALL' || String(item.currentLevel).toUpperCase() === level;
        const matchesBank = bankStatus === 'ALL' || String(item.efiAccountStatus).toLowerCase() === bankStatus;
        return matchesQuery && matchesLevel && matchesBank;
    }), [items, query, level, bankStatus]);

    const openDetails = async (item: OrganizationRow) => {
        setSelected(item);
        setForm({ platformFeePercent: Number(item.platformFeePercent || 0), currentLevel: String(item.currentLevel || 'BRONZE').toUpperCase(), maintenancePaused: Boolean((item as any).maintenancePaused) });
        try {
            const details = await fauvesService.getOrganization(item.id);
            const merged = { ...item, ...details };
            setSelected(merged);
            setForm({ platformFeePercent: Number(details.platformFeePercent ?? details.platformFee ?? item.platformFeePercent ?? 0), currentLevel: String(details.currentLevel || item.currentLevel || 'BRONZE').toUpperCase(), maintenancePaused: Boolean(details.maintenancePaused) });
        } catch { /* A listagem já contém dados suficientes para abrir a gaveta. */ }
    };

    const save = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await fauvesService.updateOrganization(selected.id, form);
            setItems((current) => current.map((item) => item.id === selected.id ? { ...item, ...form } : item));
            setSelected((current) => current ? { ...current, ...form } : current);
            notify('Configurações da produtora atualizadas e registradas na auditoria.');
        } catch { notify('A API Fauves recusou a atualização da produtora.', 'error'); }
        finally { setSaving(false); }
    };

    const toggleBlock = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const action = selected.isBlocked ? 'unblock' : 'block';
            await fauvesService.runAdminAction('organizations', selected.id, action, { reason: 'Ação administrativa no Fauves HQ' });
            setSelected({ ...selected, isBlocked: !selected.isBlocked });
            setItems((current) => current.map((item) => item.id === selected.id ? { ...item, isBlocked: !selected.isBlocked } : item));
            setConfirmBlock(false);
            notify(selected.isBlocked ? 'Produtora desbloqueada.' : 'Produtora bloqueada para novos eventos e saques.');
        } catch { notify('Não foi possível alterar o bloqueio na API Fauves.', 'error'); }
        finally { setSaving(false); }
    };

    return <div className="animate-in fade-in duration-500">
        <PageHeader eyebrow="Rede de produtores" title="Produtoras & Calendários V2" description="Controle de nível, take-rate, conformidade bancária e risco de toda a rede Fauves." actions={<><ExportButton filename="produtoras-fauves" rows={filtered.map((item) => ({ ID: item.id, Produtora: item.name, Slug: item.slug, Nivel: item.currentLevel, Taxa: item.platformFeePercent, Ingressos: item.lifetimeTicketsSold, Banco: item.efiAccountStatus, Status: item.isBlocked ? 'Bloqueada' : item.status }))} /><SecondaryButton onClick={() => void load()}><RefreshCw size={14} /> Atualizar</SecondaryButton></>} />
        <Panel className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-zinc-800 lg:flex-row">
                <SearchInput value={query} onChange={setQuery} placeholder="Buscar produtora ou slug…" />
                <select value={level} onChange={(event) => setLevel(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"><option value="ALL">Todos os níveis</option>{levels.map((item) => <option key={item}>{item}</option>)}</select>
                <select value={bankStatus} onChange={(event) => setBankStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"><option value="ALL">Todas as contas Efí</option><option value="verified">Verificadas</option><option value="pending">Pendentes</option><option value="rejected">Rejeitadas</option></select>
            </div>
            {loading ? <LoadingState label="Carregando produtoras…" /> : filtered.length === 0 ? <EmptyState title="Nenhuma produtora encontrada" description="Ajuste os filtros ou verifique a integração com a Fauves." /> : <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:bg-zinc-950/50"><tr><th className="px-5 py-3">Produtora</th><th className="px-5 py-3">Nível</th><th className="px-5 py-3">Take-rate</th><th className="px-5 py-3">Ingressos lifetime</th><th className="px-5 py-3">Conta Efí</th><th className="px-5 py-3">Operação</th><th className="px-5 py-3 text-right">Ação</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-zinc-800">{filtered.map((item) => <tr key={item.id} className="transition hover:bg-teal-50/30 dark:hover:bg-teal-950/10"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-xs font-bold text-white">{item.logo ? <img src={item.logo} alt="" className="h-full w-full object-cover" /> : item.name.slice(0, 2).toUpperCase()}</div><div><div className="font-bold text-slate-900 dark:text-white">{item.name}</div><div className="mt-0.5 text-[10px] text-slate-400">/{item.slug} · {item.eventCount} eventos</div></div></div></td><td className="px-5 py-4 font-bold text-slate-600 dark:text-zinc-300">{item.currentLevel || 'BRONZE'}</td><td className="px-5 py-4 font-bold text-teal-700 dark:text-teal-400">{Number(item.platformFeePercent || 0).toFixed(2)}%</td><td className="px-5 py-4 text-slate-500">{Number(item.lifetimeTicketsSold || 0).toLocaleString('pt-BR')}</td><td className="px-5 py-4"><StatusBadge value={item.efiAccountStatus || 'pending'} /></td><td className="px-5 py-4"><StatusBadge value={item.isBlocked ? 'blocked' : item.status} /></td><td className="px-5 py-4 text-right"><button onClick={() => void openDetails(item)} className="font-bold text-teal-700 hover:underline dark:text-teal-400">Gerenciar</button></td></tr>)}</tbody></table></div>}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-400 dark:border-zinc-800"><span>{total.toLocaleString('pt-BR')} produtoras · página {page}</span><div className="flex gap-2"><SecondaryButton disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} /></SecondaryButton><SecondaryButton disabled={page * limit >= total} onClick={() => setPage((value) => value + 1)}><ChevronRight size={14} /></SecondaryButton></div></div>
        </Panel>
        <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name || 'Produtora'} size="xl" footer={<><SecondaryButton onClick={() => setSelected(null)}>Fechar</SecondaryButton><PrimaryButton onClick={() => void save()} disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar alterações</PrimaryButton></>}>
            {selected && <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
                <div className="space-y-5"><div className="rounded-2xl border border-slate-200 p-5 dark:border-zinc-800"><div className="mb-5 flex items-center gap-3"><Percent className="text-teal-500" size={20} /><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Comercial & jornada</h3><p className="text-xs text-slate-400">Configuração individual da produtora</p></div></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600 dark:text-zinc-300">Taxa customizada (%)<input type="number" min="0" max="100" step="0.01" value={form.platformFeePercent} onChange={(event) => setForm({ ...form, platformFeePercent: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950" /></label><label className="text-xs font-bold text-slate-600 dark:text-zinc-300">Nível<select value={form.currentLevel} onChange={(event) => setForm({ ...form, currentLevel: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none dark:border-zinc-700 dark:bg-zinc-950">{levels.map((item) => <option key={item}>{item}</option>)}</select></label></div><label className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4 text-xs font-bold text-slate-600 dark:bg-zinc-950 dark:text-zinc-300"><span><span className="block">Pausar manutenção de nível</span><span className="mt-1 block font-normal text-slate-400">Mantém o nível atual sem avaliação automática.</span></span><input type="checkbox" checked={form.maintenancePaused} onChange={(event) => setForm({ ...form, maintenancePaused: event.target.checked })} className="h-5 w-5 accent-teal-600" /></label></div>
                    <div className="rounded-2xl border border-slate-200 p-5 dark:border-zinc-800"><div className="mb-4 flex items-center gap-3"><ShieldCheck className="text-emerald-500" size={20} /><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Auditoria bancária Efí</h3><p className="text-xs text-slate-400">Titularidade e chave Pix vinculada</p></div></div><dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</dt><dd className="mt-2"><StatusBadge value={selected.efiAccountStatus || 'pending'} /></dd></div><div><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ID Efí</dt><dd className="mt-2 break-all font-mono text-xs text-slate-600 dark:text-zinc-300">{selected.efiAccountId || 'Não vinculado'}</dd></div><div className="sm:col-span-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chave Pix / conta</dt><dd className="mt-2 break-all text-xs text-slate-600 dark:text-zinc-300">{selected.bankingInfo ? JSON.stringify(selected.bankingInfo) : 'Nenhuma informação bancária retornada'}</dd></div></dl></div>
                </div>
                <div className="space-y-5"><div className="rounded-2xl bg-slate-950 p-6 text-white dark:bg-black"><Building2 size={24} className="text-teal-400" /><div className="mt-8 text-2xl font-bold">{Number(selected.lifetimeTicketsSold || 0).toLocaleString('pt-BR')}</div><div className="mt-1 text-xs text-slate-400">ingressos vendidos no ciclo de vida</div><div className="mt-6 flex items-center gap-2 text-xs text-slate-300"><WalletCards size={15} /> {selected.eventCount} eventos no calendário</div></div><div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/20"><Ban size={20} className="text-rose-500" /><h3 className="mt-4 text-sm font-bold text-rose-900 dark:text-rose-200">Controle antifraude</h3><p className="mt-2 text-xs leading-5 text-rose-700 dark:text-rose-300">O bloqueio impede novos eventos e solicitações de saque até revisão da equipe.</p><button onClick={() => setConfirmBlock(true)} className="mt-5 w-full rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40">{selected.isBlocked ? 'Desbloquear operação' : 'Bloquear produtora'}</button></div></div>
            </div>}
        </Modal>
        <ConfirmAction open={confirmBlock} onClose={() => setConfirmBlock(false)} onConfirm={() => void toggleBlock()} busy={saving} title={selected?.isBlocked ? 'Desbloquear produtora' : 'Bloquear produtora'} description={selected?.isBlocked ? 'A produtora recuperará acesso à criação de eventos e aos saques.' : 'Esta ação interrompe imediatamente a criação de eventos e os saques da produtora.'} confirmationText={selected?.isBlocked ? undefined : 'BLOQUEAR'} />
    </div>;
};

export default FauvesOrganizationsView;
