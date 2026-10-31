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
        <div className="flex min-h-full w-full flex-col bg-white font-sans dark:bg-zinc-950">
            <header className="flex min-h-[76px] shrink-0 flex-col items-stretch justify-center gap-3 border-b border-[#e5e5e5] bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="min-w-0">
                    <h2 className="font-season text-xl font-[420] text-black dark:text-white sm:text-[22px]">Contatos de prospecção</h2>
                    <p className="mt-0.5 truncate text-[11px] text-[#7f7f7f] dark:text-zinc-400 sm:text-xs">Pessoas da prospecção ativa que ainda não viraram leads comerciais.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => void loadContacts(true)} disabled={refreshing} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white text-[#7f7f7f] transition-colors hover:bg-zinc-50 hover:text-black disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800" title="Atualizar contatos"><RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /></button>
                    <button type="button" onClick={() => setIsNewContactOpen(true)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-4 text-xs font-semibold text-black shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 sm:h-9 sm:flex-none"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0412dd] text-white dark:bg-[#3b48ff]"><Plus size={11} strokeWidth={3} /></span>Novo contato</button>
                </div>
            </header>

            {feedback && <div className={`border-b px-4 py-3 text-xs font-medium sm:px-7 ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300'}`}>{feedback.message}</div>}

            <div className="flex flex-col gap-3 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
                <div className="relative w-full sm:w-96"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9f9f9f]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar nome, empresa, e-mail ou telefone" className="h-10 w-full rounded-xl border border-[#e5e5e5] bg-white pl-9 pr-4 text-xs text-black outline-none transition-colors placeholder:text-[#9f9f9f] focus:border-[#0412dd] dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" /></div>
                <span className="text-[11px] font-semibold text-[#7f7f7f] dark:text-zinc-400">{total} {total === 1 ? 'contato aguardando' : 'contatos aguardando'}</span>
            </div>

            <div className="hidden grid-cols-12 border-b border-[#e5e5e5] bg-white px-10 py-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7f7f7f] dark:border-zinc-800 dark:bg-zinc-950 lg:grid">
                <span className="col-span-3">Contato</span><span className="col-span-2">Empresa / marca</span><span className="col-span-3">Canais</span><span className="col-span-1">Origem</span><span className="col-span-1">Adicionado</span><span className="col-span-2 text-right">Ações</span>
            </div>

            <div className="min-h-0 flex-1 bg-white dark:bg-zinc-950">
                {loading ? <div className="flex min-h-64 items-center justify-center text-xs text-[#9f9f9f]"><Loader2 size={19} className="mr-2 animate-spin text-[#0412dd]" />Carregando contatos...</div>
                : items.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><Users size={24} className="mb-3 text-zinc-300" /><p className="font-season text-lg font-[420] text-black dark:text-white">Nenhum contato aguardando</p><p className="mt-1 text-xs text-[#7f7f7f]">Adicione pessoas da prospecção ativa para começar.</p></div>
                : items.map(item => {
                    const contact = item.contacts?.[0];
                    const phone = contact?.phone || contact?.whatsapp;
                    const busy = workingId === item.id;
                    return <div key={item.id} className="grid grid-cols-2 items-center gap-x-3 gap-y-3 border-b border-[#e5e5e5] px-4 py-4 transition-colors hover:bg-zinc-50/60 dark:border-zinc-800 dark:hover:bg-zinc-900/40 sm:px-7 lg:min-h-[68px] lg:grid-cols-12 lg:gap-0 lg:px-10 lg:py-3">
                        <div className="col-span-2 min-w-0 lg:col-span-3"><p className="truncate text-sm font-semibold text-black dark:text-white">{contact?.name || 'Contato não informado'}</p><p className="mt-0.5 truncate text-[10.5px] text-[#9f9f9f]">{contact?.role || 'Sem cargo informado'}</p></div>
                        <div className="min-w-0 lg:col-span-2"><span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[#9f9f9f] lg:hidden">Empresa</span><p className="truncate text-xs font-semibold text-black dark:text-zinc-200">{item.brandName}</p><p className="mt-0.5 truncate text-[10.5px] text-[#9f9f9f]">{item.companyName || item.website || '—'}</p></div>
                        <div className="min-w-0 lg:col-span-3"><span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[#9f9f9f] lg:hidden">Canais</span><div className="space-y-1 text-[10.5px] text-[#7f7f7f] dark:text-zinc-300">{contact?.email && <a href={`mailto:${contact.email}`} className="flex min-w-0 items-center gap-1.5 hover:text-[#0412dd]"><Mail size={11} className="shrink-0" /><span className="truncate">{contact.email}</span></a>}{phone && <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-[#0412dd]"><Phone size={11} />{phone}</a>}{!contact?.email && !phone && <span className="text-[#9f9f9f]">Sem canais informados</span>}</div></div>
                        <div className="lg:col-span-1"><span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[#9f9f9f] lg:hidden">Origem</span><span className="text-[10.5px] font-semibold text-[#7f7f7f] dark:text-zinc-300">{sourceLabel(item.sourceType)}</span></div>
                        <div className="lg:col-span-1"><span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-[#9f9f9f] lg:hidden">Adicionado</span><span className="text-[10.5px] text-[#7f7f7f] dark:text-zinc-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' }) : '—'}</span></div>
                        <div className="col-span-2 flex items-center justify-end gap-1.5 lg:col-span-2"><button type="button" onClick={() => void deleteContact(item)} disabled={busy} className="flex h-9 w-9 items-center justify-center rounded-full text-[#9f9f9f] transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-950/30" title="Excluir contato"><Trash2 size={14} /></button><button type="button" onClick={() => void promoteToLead(item)} disabled={busy} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#0412dd] px-3 text-[10.5px] font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 dark:bg-[#3b48ff]">{busy ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}Transformar em lead</button></div>
                    </div>;
                })}
            </div>

            {totalPages > 1 && <div className="flex items-center justify-between border-t border-[#e5e5e5] bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:px-7 lg:px-10"><span className="text-[10.5px] text-[#7f7f7f]">Página {page} de {totalPages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-full border border-[#e5e5e5] px-3 py-1.5 text-[10.5px] font-semibold disabled:opacity-40 dark:border-zinc-700">Anterior</button><button type="button" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)} className="rounded-full border border-[#e5e5e5] px-3 py-1.5 text-[10.5px] font-semibold disabled:opacity-40 dark:border-zinc-700">Próxima</button></div></div>}

            <AsteryskoNewOpportunityModal isOpen={isNewContactOpen} organizationId={organizationId} onClose={() => setIsNewContactOpen(false)} onCreated={() => { setPage(1); void loadContacts(true); }} />
        </div>
    );
};
