import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Download, Loader2, Search } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import Modal from '../../../../components/common/Modal';

export const currency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 2,
}).format(Number(value || 0));

export const shortCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1,
}).format(Number(value || 0));

export const dateTime = (value?: string) => value
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
    : '—';

type ToastTone = 'success' | 'error';
const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => undefined);

export const FauvesToastProvider = ({ children }: { children: React.ReactNode }) => {
    const notify = useCallback((message: string, tone: ToastTone = 'success') => {
        if (tone === 'success') toast.success(message);
        else toast.error(message);
    }, []);
    return (
        <ToastContext.Provider value={notify}>
            {children}
            <Toaster richColors position="top-right" closeButton theme="system" toastOptions={{ className: 'font-sans' }} />
        </ToastContext.Provider>
    );
};

export const useFauvesToast = () => useContext(ToastContext);

export const PageHeader = ({ eyebrow, title, description, actions }: {
    eyebrow?: string; title: string; description: string; actions?: React.ReactNode;
}) => (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
            {eyebrow && <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">{eyebrow}</div>}
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
);

export const PrimaryButton = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 ${className}`}>{children}</button>
);

export const SecondaryButton = ({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 ${className}`}>{children}</button>
);

export const SearchInput = ({ value, onChange, placeholder = 'Buscar…' }: { value: string; onChange: (value: string) => void; placeholder?: string }) => (
    <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
    </div>
);

export const StatusBadge = ({ value }: { value: string }) => {
    const normalized = String(value || '').toLowerCase();
    const positive = ['active', 'approved', 'paid', 'published', 'operational', 'resolved', 'verified', 'ativo', 'aprovado'].includes(normalized);
    const danger = ['blocked', 'banned', 'canceled', 'failed', 'offline', 'rejected', 'suspended', 'bloqueado'].includes(normalized);
    const classes = positive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
        : danger
            ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
            : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${classes}`}>{value || 'Pendente'}</span>;
};

export const Panel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_45px_-35px_rgba(15,23,42,.35)] dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>{children}</section>
);

export const LoadingState = ({ label = 'Carregando dados da operação…' }: { label?: string }) => (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-sm text-slate-400"><Loader2 className="animate-spin text-teal-500" size={28} /><span>{label}</span></div>
);

export const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center"><h3 className="font-bold text-slate-800 dark:text-zinc-100">{title}</h3><p className="mt-1 max-w-md text-sm text-slate-400">{description}</p></div>
);

export const ConfirmAction = ({ open, onClose, onConfirm, title, description, confirmationText, busy }: {
    open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; confirmationText?: string; busy?: boolean;
}) => {
    const [value, setValue] = useState('');
    const valid = !confirmationText || value.trim().toUpperCase() === confirmationText.toUpperCase();
    return (
        <Modal isOpen={open} onClose={onClose} title={title} size="sm" footer={<><SecondaryButton onClick={onClose}>Cancelar</SecondaryButton><PrimaryButton disabled={!valid || busy} onClick={onConfirm}>{busy && <Loader2 size={14} className="animate-spin" />}Confirmar ação</PrimaryButton></>}>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{description}</div>
            {confirmationText && <label className="mt-5 block text-xs font-bold text-slate-600 dark:text-zinc-300">Digite <strong>{confirmationText}</strong> para continuar<input autoFocus value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 dark:border-zinc-700 dark:bg-zinc-950" /></label>}
        </Modal>
    );
};

const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
export const exportCsv = (filename: string, rows: Record<string, unknown>[]) => {
    if (!rows.length) return;
    const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    const csv = [headers.map(csvCell).join(','), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
};

export const ExportButton = ({ filename, rows }: { filename: string; rows: Record<string, unknown>[] }) => {
    const disabled = useMemo(() => rows.length === 0, [rows]);
    return <SecondaryButton disabled={disabled} onClick={() => exportCsv(filename, rows)}><Download size={15} /> Exportar CSV</SecondaryButton>;
};
