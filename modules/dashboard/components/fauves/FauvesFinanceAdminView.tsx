import React, { useEffect, useMemo, useState } from 'react';
import { Banknote, CheckCircle2, ChevronLeft, ChevronRight, FileUp, Loader2, Mail, Receipt, RefreshCw, RotateCcw, ShieldCheck, WalletCards, XCircle } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { Order } from '../../../../types';
import { fauvesService, FauvesWithdrawal } from '../../../../services/fauvesService';
import { ConfirmAction, currency, EmptyState, ExportButton, LoadingState, PageHeader, Panel, PrimaryButton, SearchInput, SecondaryButton, StatusBadge, useFauvesToast } from './FauvesUI';

type ActionState = { resource: 'orders' | 'withdrawals'; id: string; action: string; title: string; description: string; confirmation?: string };

const FauvesFinanceAdminView: React.FC = () => {
    const notify = useFauvesToast();
    const [tab, setTab] = useState<'orders' | 'withdrawals'>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [withdrawals, setWithdrawals] = useState<FauvesWithdrawal[]>([]);
    const [total, setTotal] = useState({ orders: 0, withdrawals: 0 });
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [action, setAction] = useState<ActionState | null>(null);
    const [manualWithdrawal, setManualWithdrawal] = useState<FauvesWithdrawal | null>(null);
    const [manualProof, setManualProof] = useState('');
    const [rejectWithdrawal, setRejectWithdrawal] = useState<FauvesWithdrawal | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const limit = 20;

    const load = async () => {
        setLoading(true);
        try {
            if (tab === 'orders') {
                const response = await fauvesService.getOrders(page, limit);
                setOrders(response.items); setTotal((value) => ({ ...value, orders: response.total }));
            } else {
                const response = await fauvesService.getWithdrawals(page, limit);
                setWithdrawals(response.items); setTotal((value) => ({ ...value, withdrawals: response.total }));
            }
        } catch { notify(tab === 'orders' ? 'Não foi possível carregar os pedidos.' : 'A fila de saques ainda não está disponível na API Fauves.', 'error'); }
        finally { setLoading(false); }
    };
    useEffect(() => { void load(); }, [tab, page]);

    const filteredOrders = useMemo(() => orders.filter((order) => `${order.code} ${order.customer.name} ${order.customer.email} ${order.event}`.toLowerCase().includes(query.toLowerCase())), [orders, query]);
    const filteredWithdrawals = useMemo(() => withdrawals.filter((item) => `${item.organizationName} ${item.eventName} ${item.pixKey}`.toLowerCase().includes(query.toLowerCase())), [withdrawals, query]);
    const pageGmv = orders.filter((order) => order.status === 'approved').reduce((sum, order) => sum + Number(order.amount || 0), 0);
    const pageFees = orders.filter((order) => order.status === 'approved').reduce((sum, order) => sum + Number((order as any).platformFee || 0), 0);
    const pendingAmount = withdrawals.filter((item) => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0);

    const performAction = async () => {
        if (!action) return;
        setBusy(true);
        try {
            await fauvesService.runAdminAction(action.resource, action.id, action.action, { auditReason: action.title });
            if (action.resource === 'orders' && action.action === 'refund') setOrders((items) => items.map((item) => item.id === action.id ? { ...item, status: 'canceled' } : item));
            if (action.resource === 'withdrawals') setWithdrawals((items) => items.map((item) => item.id === action.id ? { ...item, status: 'approved', processedAt: new Date().toISOString() } : item));
            notify(`${action.title} concluído com registro de auditoria.`); setAction(null);
        } catch { notify('A operação financeira foi recusada pela API Fauves.', 'error'); }
        finally { setBusy(false); }
    };

    const submitManual = async () => {
        if (!manualWithdrawal || !manualProof.trim()) return;
        setBusy(true);
        try {
            await fauvesService.runAdminAction('withdrawals', manualWithdrawal.id, 'approve-manual', { proof: manualProof });
            setWithdrawals((items) => items.map((item) => item.id === manualWithdrawal.id ? { ...item, status: 'approved', processedAt: new Date().toISOString() } : item));
            setManualWithdrawal(null); setManualProof(''); notify('Saque aprovado manualmente e comprovante anexado à auditoria.');
        } catch { notify('Não foi possível registrar a aprovação manual.', 'error'); }
        finally { setBusy(false); }
    };

    const submitReject = async () => {
        if (!rejectWithdrawal || rejectReason.trim().length < 10) return;
        setBusy(true);
        try {
            await fauvesService.runAdminAction('withdrawals', rejectWithdrawal.id, 'reject', { reason: rejectReason, notifyByEmail: true });
            setWithdrawals((items) => items.map((item) => item.id === rejectWithdrawal.id ? { ...item, status: 'rejected' } : item));
            setRejectWithdrawal(null); setRejectReason(''); notify('Saque recusado e justificativa enviada por e-mail.');
        } catch { notify('Não foi possível recusar o saque.', 'error'); }
        finally { setBusy(false); }
    };

    return <div className="animate-in fade-in duration-500">
        <PageHeader eyebrow="Financeiro & Efí Bank" title="Pedidos, split & saques Pix" description="Conciliação global, reembolsos e liberação segura de repasses para produtoras." actions={<><ExportButton filename={tab === 'orders' ? 'pedidos-fauves' : 'saques-fauves'} rows={tab === 'orders' ? filteredOrders.map((order) => ({ ID: order.id, Codigo: order.code, Comprador: order.customer.name, Email: order.customer.email, Evento: order.event, Bruto: order.amount, Liquido: (order as any).netAmount, TaxaFauves: (order as any).platformFee, Status: order.status })) : filteredWithdrawals.map((item) => ({ ID: item.id, Produtora: item.organizationName, Evento: item.eventName, Valor: item.amount, Pix: item.pixKey, SolicitadoEm: item.requestedAt, Status: item.status }))} /><SecondaryButton onClick={() => void load()}><RefreshCw size={14} /> Atualizar</SecondaryButton></>} />
        <div className="mb-6 grid gap-4 sm:grid-cols-3"><Panel className="p-5"><Receipt size={18} className="text-teal-500" /><div className="mt-5 text-2xl font-bold">{currency(pageGmv)}</div><div className="mt-1 text-xs text-slate-400">GMV aprovado nesta página</div></Panel><Panel className="p-5"><ShieldCheck size={18} className="text-emerald-500" /><div className="mt-5 text-2xl font-bold">{currency(pageFees)}</div><div className="mt-1 text-xs text-slate-400">Taxa Fauves visível</div></Panel><Panel className="p-5"><WalletCards size={18} className="text-amber-500" /><div className="mt-5 text-2xl font-bold">{currency(pendingAmount)}</div><div className="mt-1 text-xs text-slate-400">Fila Pix pendente visível</div></Panel></div>
        <Panel className="overflow-hidden"><div className="flex flex-col gap-4 border-b border-slate-100 p-4 dark:border-zinc-800 lg:flex-row lg:items-center"><div className="inline-flex w-fit rounded-xl bg-slate-100 p-1 dark:bg-zinc-950">{(['orders', 'withdrawals'] as const).map((item) => <button key={item} onClick={() => { setTab(item); setPage(1); setQuery(''); }} className={`rounded-lg px-4 py-2 text-xs font-bold transition ${tab === item ? 'bg-white text-slate-950 shadow-sm dark:bg-zinc-800 dark:text-white' : 'text-slate-400'}`}>{item === 'orders' ? 'Pedidos globais' : 'Fila de saques Pix'}</button>)}</div><SearchInput value={query} onChange={setQuery} placeholder={tab === 'orders' ? 'Buscar código, comprador ou evento…' : 'Buscar produtora, evento ou Pix…'} /></div>
            {loading ? <LoadingState label={tab === 'orders' ? 'Conciliando pedidos…' : 'Carregando fila Pix…'} /> : tab === 'orders' ? (filteredOrders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:bg-zinc-950/50"><tr><th className="px-5 py-3">Pedido</th><th className="px-5 py-3">Comprador</th><th className="px-5 py-3">Evento</th><th className="px-5 py-3">Bruto</th><th className="px-5 py-3">Taxa Fauves</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Operações</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-zinc-800">{filteredOrders.map((order) => <tr key={order.id} className="hover:bg-teal-50/30 dark:hover:bg-teal-950/10"><td className="px-5 py-4 font-mono text-[11px] font-bold">{order.code || order.id.slice(0, 8)}</td><td className="px-5 py-4"><strong className="block text-slate-900 dark:text-white">{order.customer.name}</strong><span className="mt-1 block text-[10px] text-slate-400">{order.customer.email}</span></td><td className="max-w-[220px] truncate px-5 py-4 text-slate-500">{order.event}</td><td className="px-5 py-4 font-bold">{currency(order.amount)}</td><td className="px-5 py-4 font-bold text-teal-600">{currency(Number((order as any).platformFee || 0))}</td><td className="px-5 py-4"><StatusBadge value={order.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button title="Reenviar ingressos" onClick={() => setAction({ resource: 'orders', id: order.id, action: 'resend-tickets', title: 'Reenviar ingressos', description: `Os ingressos serão reenviados para ${order.customer.email}.` })} className="rounded-lg p-2 text-slate-400 hover:bg-teal-50 hover:text-teal-600"><Mail size={15} /></button><button title="Baixa manual" onClick={() => setAction({ resource: 'orders', id: order.id, action: 'manual-settlement', title: 'Registrar baixa manual', description: 'O pedido será marcado como pago fora do fluxo automático.', confirmation: 'BAIXA' })} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"><CheckCircle2 size={15} /></button><button title="Reembolsar" disabled={order.status !== 'approved'} onClick={() => setAction({ resource: 'orders', id: order.id, action: 'refund', title: 'Estornar pedido', description: `O valor de ${currency(order.amount)} será solicitado à API de pagamentos.`, confirmation: 'ESTORNAR' })} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"><RotateCcw size={15} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState title="Nenhum pedido encontrado" description="Não há pedidos compatíveis com a busca." />) : (filteredWithdrawals.length ? <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 dark:bg-zinc-950/50"><tr><th className="px-5 py-3">Produtora</th><th className="px-5 py-3">Evento</th><th className="px-5 py-3">Valor</th><th className="px-5 py-3">Chave Pix</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Operações</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-zinc-800">{filteredWithdrawals.map((item) => <tr key={item.id} className="hover:bg-teal-50/30 dark:hover:bg-teal-950/10"><td className="px-5 py-4"><strong className="text-slate-900 dark:text-white">{item.organizationName}</strong><span className="mt-1 block text-[10px] text-slate-400">{new Date(item.requestedAt).toLocaleDateString('pt-BR')}</span></td><td className="px-5 py-4 text-slate-500">{item.eventName || 'Saldo da organização'}</td><td className="px-5 py-4 text-base font-bold">{currency(item.amount)}</td><td className="px-5 py-4 font-mono text-[11px]">{item.pixKey || '—'}</td><td className="px-5 py-4"><StatusBadge value={item.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button disabled={item.status !== 'pending'} title="Aprovar Pix Out Efí" onClick={() => setAction({ resource: 'withdrawals', id: item.id, action: 'approve-pix-out', title: 'Aprovar e disparar Pix Out', description: `A Efí enviará ${currency(item.amount)} para a chave ${item.pixKey || 'cadastrada'}.`, confirmation: 'PAGAR' })} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-30"><Banknote size={16} /></button><button disabled={item.status !== 'pending'} title="Aprovar manualmente" onClick={() => setManualWithdrawal(item)} className="rounded-lg p-2 text-cyan-600 hover:bg-cyan-50 disabled:opacity-30"><FileUp size={16} /></button><button disabled={item.status !== 'pending'} title="Recusar saque" onClick={() => setRejectWithdrawal(item)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-30"><XCircle size={16} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState title="Fila de saques vazia" description="Nenhuma solicitação de saque foi retornada pela integração." />)}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-400 dark:border-zinc-800"><span>{total[tab].toLocaleString('pt-BR')} registros · página {page}</span><div className="flex gap-2"><SecondaryButton disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} /></SecondaryButton><SecondaryButton disabled={page * limit >= total[tab]} onClick={() => setPage((value) => value + 1)}><ChevronRight size={14} /></SecondaryButton></div></div>
        </Panel>
        <ConfirmAction open={Boolean(action)} onClose={() => setAction(null)} onConfirm={() => void performAction()} busy={busy} title={action?.title || ''} description={action?.description || ''} confirmationText={action?.confirmation} />
        <Modal isOpen={Boolean(manualWithdrawal)} onClose={() => setManualWithdrawal(null)} title="Aprovação manual do saque" size="sm" footer={<><SecondaryButton onClick={() => setManualWithdrawal(null)}>Cancelar</SecondaryButton><PrimaryButton disabled={!manualProof.trim() || busy} onClick={() => void submitManual()}>{busy && <Loader2 size={14} className="animate-spin" />} Aprovar manualmente</PrimaryButton></>}><p className="text-sm leading-6 text-slate-500">Informe a URL ou referência imutável do comprovante bancário. Ela será anexada ao Audit Trail.</p><label className="mt-5 block text-xs font-bold">Comprovante<input value={manualProof} onChange={(event) => setManualProof(event.target.value)} placeholder="https://… ou ID do documento" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950" /></label></Modal>
        <Modal isOpen={Boolean(rejectWithdrawal)} onClose={() => setRejectWithdrawal(null)} title="Recusar saque" size="sm" footer={<><SecondaryButton onClick={() => setRejectWithdrawal(null)}>Cancelar</SecondaryButton><PrimaryButton disabled={rejectReason.trim().length < 10 || busy} onClick={() => void submitReject()}>{busy && <Loader2 size={14} className="animate-spin" />} Recusar e notificar</PrimaryButton></>}><p className="text-sm leading-6 text-slate-500">A justificativa será registrada e enviada por e-mail à produtora.</p><label className="mt-5 block text-xs font-bold">Justificativa<textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950" /></label></Modal>
    </div>;
};

export default FauvesFinanceAdminView;
