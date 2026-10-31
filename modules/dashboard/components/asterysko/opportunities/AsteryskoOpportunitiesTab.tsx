import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Loader2, Mail, Phone, Plus, RefreshCw, Search, Trash2, Users } from 'lucide-react';
import api from '../../../../../services/api';
import { AsteryskoNewOpportunityModal } from './AsteryskoNewOpportunityModal';
import { AsteryskoOpportunity } from './asteryskoApiTypes';

interface Props {
    organizationId?: string;
    onTotalChange?: (total: number) => void;
    onLeadCreated?: () => void | Promise<void>;
}

const PAGE_SIZE = 20;

const SOURCE_LABELS: Record<string, string> = {
    prospeccao_ativa: 'Prospecção ativa',
    manual: 'Cadastro manual',
    indicacao: 'Indicação',
    importacao: 'Importação manual',
    outro: 'Outro',
};

const sourceLabel = (source?: string | null) => SOURCE_LABELS[source || ''] || 'Prospecção ativa';

export const AsteryskoOpportunitiesTab: React.FC<Props> = ({ organizationId, onTotalChange, onLeadCreated }) => {
    const [items, setItems] = useState<AsteryskoOpportunity[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isNewContactOpen, setIsNewContactOpen] = useState(false);
    const [workingId, setWorkingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const loadContacts = useCallback(async (manualRefresh = false) => {
        if (!organizationId) {
            setItems([]); setTotal(0); onTotalChange?.(0);
            return;
        }
        manualRefresh ? setRefreshing(true) : setLoading(true);
        try {
            const { data } = await api.get('/asterysko/opportunities', {
                headers: { 'x-organization-id': organizationId },
                params: {
                    page, limit: PAGE_SIZE, search: appliedSearch || undefined,
                    compact: true, manualOnly: true,
                },
            });
            const nextTotal = data.pagination?.total || 0;
            setItems(data.items || []);
            setTotal(nextTotal);
            setTotalPages(data.pagination?.totalPages || 1);
            onTotalChange?.(nextTotal);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.response?.data?.error || 'Não foi possível carregar os contatos.' });
        } finally {
            setLoading(false); setRefreshing(false);
        }
    }, [appliedSearch, onTotalChange, organizationId, page]);

    useEffect(() => { void loadContacts(); }, [loadContacts]);
    useEffect(() => {
        const timer = window.setTimeout(() => { setPage(1); setAppliedSearch(search.trim()); }, 300);
        return () => window.clearTimeout(timer);
    }, [search]);

    const promoteToLead = async (item: AsteryskoOpportunity) => {
        const contact = item.contacts?.[0];
        const label = contact?.name || item.brandName;
        if (!window.confirm(`Transformar ${label} em lead e enviar para “Novos leads”?`)) return;
        setWorkingId(item.id); setFeedback(null);
        try {
            const { data } = await api.post('/asterysko/opportunities/batch-send-to-crm', {
                opportunityIds: [item.id],
            }, { headers: { 'x-organization-id': organizationId } });
            if (!data.sent) throw new Error(data.results?.[0]?.error || 'O contato não pôde ser transformado em lead.');
            setFeedback({ type: 'success', message: `${label} agora está em “Novos leads”.` });
            window.dispatchEvent(new CustomEvent('asterysko-crm-updated'));
            await onLeadCreated?.();
            await loadContacts(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.response?.data?.error || error?.message || 'Não foi possível transformar o contato em lead.' });
        } finally { setWorkingId(null); }
    };

    const deleteContact = async (item: AsteryskoOpportunity) => {
        const contact = item.contacts?.[0];
        const label = contact?.name || item.brandName;
        if (!window.confirm(`Excluir o contato ${label}?`)) return;
        setWorkingId(item.id); setFeedback(null);
        try {
            await api.delete(`/asterysko/opportunities/${item.id}`, { headers: { 'x-organization-id': organizationId } });
            setFeedback({ type: 'success', message: 'Contato excluído.' });
            await loadContacts(true);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error?.response?.data?.error || 'Não foi possível excluir o contato.' });
        } finally { setWorkingId(null); }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-4">
            <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <div className="flex items-center gap-2"><Users size={18} className="text-[#0412dd] dark:text-[#3b48ff]" /><h2 className="text-xl font-bold text-zinc-900 dark:text-white">Contatos de prospecção</h2></div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Pessoas da prospecção ativa que ainda não viraram leads comerciais.</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => void loadContacts(true)} disabled={refreshing} className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 px-3 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900" title="Atualizar contatos"><RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /></button>
                    <button type="button" onClick={() => setIsNewContactOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0412dd] px-5 text-sm font-bold text-white hover:bg-blue-800 dark:bg-[#3b48ff]"><Plus size={16} /> Novo contato</button>
                </div>
            </div>

            {feedback && <div className={`rounded-xl border px-4 py-3 text-xs ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300'}`}>{feedback.message}</div>}

            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar nome, empresa, e-mail ou telefone" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-xs text-zinc-900 outline-none focus:border-[#0412dd] dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" /></div>
                    <span className="text-xs font-medium text-zinc-500">{total} {total === 1 ? 'contato' : 'contatos'}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead><tr className="border-b border-zinc-100 bg-zinc-50/80 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/70"><th className="px-5 py-3.5">Contato</th><th className="px-4 py-3.5">Empresa / marca</th><th className="px-4 py-3.5">Canais</th><th className="px-4 py-3.5">Origem</th><th className="px-4 py-3.5">Adicionado em</th><th className="px-5 py-3.5 text-right">Ações</th></tr></thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {loading ? <tr><td colSpan={6} className="py-14 text-center text-xs text-zinc-400"><Loader2 size={20} className="mx-auto mb-2 animate-spin text-[#0412dd]" />Carregando contatos...</td></tr>
                            : items.length === 0 ? <tr><td colSpan={6} className="py-14 text-center"><Users size={24} className="mx-auto mb-2 text-zinc-300" /><p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Nenhum contato aguardando</p><p className="mt-1 text-xs text-zinc-400">Adicione pessoas da prospecção ativa para começar.</p></td></tr>
                            : items.map(item => {
                                const contact = item.contacts?.[0];
                                const phone = contact?.phone || contact?.whatsapp;
                                const busy = workingId === item.id;
                                return <tr key={item.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                                    <td className="px-5 py-4"><p className="text-sm font-bold text-zinc-900 dark:text-white">{contact?.name || 'Contato não informado'}</p><p className="mt-0.5 text-[11px] text-zinc-500">{contact?.role || 'Sem cargo informado'}</p></td>
                                    <td className="px-4 py-4"><p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.brandName}</p><p className="mt-0.5 max-w-[220px] truncate text-[11px] text-zinc-400">{item.companyName || item.website || '—'}</p></td>
                                    <td className="px-4 py-4"><div className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300">{contact?.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 hover:text-[#0412dd]"><Mail size={12} />{contact.email}</a>}{phone && <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-[#0412dd]"><Phone size={12} />{phone}</a>}{!contact?.email && !phone && <span className="text-zinc-400">Sem canais informados</span>}</div></td>
                                    <td className="px-4 py-4"><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{sourceLabel(item.sourceType)}</span></td>
                                    <td className="px-4 py-4 text-[11px] text-zinc-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' }) : '—'}</td>
                                    <td className="px-5 py-4"><div className="flex items-center justify-end gap-1.5"><button type="button" onClick={() => void deleteContact(item)} disabled={busy} className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-950/30" title="Excluir contato"><Trash2 size={15} /></button><button type="button" onClick={() => void promoteToLead(item)} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-[#0412dd] px-3 py-2 text-[11px] font-bold text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-[#3b48ff]">{busy ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />} Transformar em lead</button></div></td>
                                </tr>;
                            })}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 dark:border-zinc-800"><span className="text-[11px] text-zinc-500">Página {page} de {totalPages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 dark:border-zinc-700">Anterior</button><button type="button" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 dark:border-zinc-700">Próxima</button></div></div>}
            </div>

            <AsteryskoNewOpportunityModal isOpen={isNewContactOpen} organizationId={organizationId} onClose={() => setIsNewContactOpen(false)} onCreated={() => { setPage(1); void loadContacts(true); }} />
        </div>
    );
};
