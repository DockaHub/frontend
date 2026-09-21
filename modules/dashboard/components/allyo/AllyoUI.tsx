import React, { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronRight, Grid2X2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const ALLYO_BORDER = 'border-[#e5e5e5] dark:border-zinc-800';
export const ALLYO_ACCENT = '#9db669';

export interface AllyoTask {
    id: string;
    name: string;
    category: string;
    client: string;
    deadline: string;
    time: string;
    status: 'Iniciar' | 'Em andamento' | 'Em revisão' | 'Concluída';
    cam: string;
    creative: string;
}

export const ALLYO_TASKS: AllyoTask[] = [
    { id: '123456', name: 'KV campanha de lançamento', category: 'Design', client: 'Fauves', deadline: '20/12/2026', time: '10h30min', status: 'Iniciar', cam: 'Marina', creative: 'Levy' },
    { id: '123457', name: 'Storyboard para filme manifesto', category: 'Storyboard', client: 'Asterysko', deadline: '21/12/2026', time: '14h00min', status: 'Em andamento', cam: 'Marina', creative: 'Joana' },
    { id: '123458', name: 'Motion para redes sociais', category: 'Motion', client: 'Tokyon', deadline: '22/12/2026', time: '16h45min', status: 'Em revisão', cam: 'Bruno', creative: 'Levy' },
    { id: '123459', name: 'Edição do case anual', category: 'Vídeo', client: 'Fauves', deadline: '23/12/2026', time: '09h00min', status: 'Iniciar', cam: 'Bruno', creative: 'Caio' },
    { id: '123460', name: 'Landing page institucional', category: 'Digital', client: 'ManySpace', deadline: '26/12/2026', time: '12h00min', status: 'Concluída', cam: 'Marina', creative: 'Joana' },
    { id: '123461', name: 'Peças para mídia paga', category: 'Design', client: 'Asterysko', deadline: '28/12/2026', time: '11h15min', status: 'Em andamento', cam: 'Bruno', creative: 'Caio' },
    { id: '123462', name: 'Apresentação comercial', category: 'Catálogo', client: 'Tokyon', deadline: '30/12/2026', time: '15h30min', status: 'Iniciar', cam: 'Marina', creative: 'Levy' },
    { id: '123463', name: 'Desdobramento de identidade', category: 'Branding', client: 'ManySpace', deadline: '05/01/2027', time: '17h00min', status: 'Em revisão', cam: 'Bruno', creative: 'Joana' },
];

export const todayLabel = () => {
    const now = new Date();
    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${weekdays[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}. de ${now.getFullYear()}`;
};

export const AllyoPageHeader = ({ title }: { title: string }) => (
    <header className={`sticky top-0 z-20 flex h-[75px] shrink-0 items-center justify-between border-b bg-white/95 px-5 backdrop-blur-sm sm:px-[30px] dark:bg-zinc-950/95 ${ALLYO_BORDER}`}>
        <h1 className="truncate font-season text-[22px] font-normal text-black dark:text-white">{title}</h1>
        <div className="flex items-center gap-[5px] text-black dark:text-zinc-300">
            <CalendarDays size={18} className="text-[#9f9f9f]" />
            <span className="hidden text-sm font-semibold sm:inline">{todayLabel()}</span>
        </div>
    </header>
);

const statusColor: Record<AllyoTask['status'], string> = {
    'Iniciar': 'text-[#9db669]',
    'Em andamento': 'text-[#2a2ad7] dark:text-indigo-300',
    'Em revisão': 'text-[#fd6b32]',
    'Concluída': 'text-emerald-600 dark:text-emerald-400',
};

export const TaskRow = ({ task }: { task: AllyoTask }) => {
    const [, setSearchParams] = useSearchParams();

    const openTask = () => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.set('view', 'task-detail');
            next.set('task', task.id);
            return next;
        });
    };

    return (
        <div className={`border-t ${ALLYO_BORDER}`}>
            <button
                type="button"
                onClick={openTask}
                className="grid min-h-[78px] w-full grid-cols-[minmax(190px,1.35fr)_70px_90px_minmax(155px,1fr)_105px_18px] items-center gap-5 px-5 py-4 text-left transition-colors hover:bg-[#fafbf8] sm:px-[30px] dark:hover:bg-zinc-900/70 max-lg:grid-cols-[minmax(180px,1fr)_80px_18px] max-sm:grid-cols-[1fr_18px]"
            >
                <span className="flex min-w-0 items-center gap-[10px]">
                    <span className="flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full border border-[#9db669] text-[#9db669]">
                        <Grid2X2 size={15} strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 text-sm font-medium leading-5 text-black dark:text-white">
                        <strong className="block truncate font-medium">{task.name}</strong>
                        <span className="block truncate">{task.category}</span>
                    </span>
                </span>
                <DataCell label="ID" value={task.id} className="max-lg:hidden" />
                <DataCell label="CLIENTE" value={task.client} className="max-lg:hidden" />
                <DataCell label="DEADLINE" value={`${task.deadline} • ${task.time}`} className="max-sm:hidden" />
                <DataCell label="STATUS" value={task.status} valueClassName={statusColor[task.status]} />
                <ChevronRight size={18} className="text-[#9f9f9f]" />
            </button>
        </div>
    );
};

export const DataCell = ({ label, value, className = '', valueClassName = '' }: { label: string; value: string; className?: string; valueClassName?: string }) => (
    <span className={`min-w-0 ${className}`}>
        <span className="block text-[9px] font-medium leading-none text-[#616161] dark:text-zinc-500">{label}</span>
        <span className={`mt-[10px] block truncate text-sm font-medium leading-none text-black dark:text-zinc-200 ${valueClassName}`}>{value}</span>
    </span>
);

export const FilterSelect = ({ label, value, options, onChange, includeAll = true }: { label: string; value: string; options: string[]; onChange: (value: string) => void; includeAll?: boolean }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuId = useId();
    const visibleValue = value === 'Todos' ? label : value;

    useEffect(() => {
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

    const select = (nextValue: string) => {
        onChange(nextValue);
        setOpen(false);
    };

    return (
        <div ref={rootRef} className="relative shrink-0">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-controls={menuId}
                className={`flex min-h-9 items-center gap-[10px] rounded-full border bg-white py-2 pl-[15px] pr-[13px] text-xs font-semibold outline-none transition-all dark:bg-zinc-900 dark:text-white ${open ? 'border-[#9db669] shadow-[0_0_0_3px_rgba(157,182,105,.13)] dark:border-[#d0f08e]' : 'border-[#e5e5e5] hover:border-[#b9ca94] dark:border-zinc-700'}`}
            >
                <span className={`max-w-[180px] truncate ${value === 'Todos' ? 'text-black dark:text-white' : 'text-[#72844d] dark:text-[#d0f08e]'}`}>{visibleValue}</span>
                <ChevronDown size={13} className={`shrink-0 transition-transform ${open ? 'rotate-180 text-[#9db669]' : 'text-black dark:text-zinc-400'}`} />
            </button>

            {open && (
                <div id={menuId} role="listbox" className="absolute left-0 top-[calc(100%+8px)] z-[80] min-w-[210px] overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white p-1.5 shadow-[0_18px_45px_rgba(19,31,21,.16)] animate-in fade-in zoom-in-95 duration-150 dark:border-zinc-700 dark:bg-zinc-900">
                    <div className="px-3 pb-2 pt-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#9f9f9f]">{label}</div>
                    {includeAll && (
                        <button type="button" role="option" aria-selected={value === 'Todos'} onClick={() => select('Todos')} className={`flex w-full items-center justify-between gap-4 rounded-[9px] px-3 py-2.5 text-left text-xs transition-colors ${value === 'Todos' ? 'bg-[#f3f7ea] font-semibold text-[#72844d] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]' : 'text-black hover:bg-[#f7f7f5] dark:text-zinc-200 dark:hover:bg-zinc-800'}`}>
                            <span>Todos</span>{value === 'Todos' && <Check size={14} />}
                        </button>
                    )}
                    {options.filter((option, index, list) => list.indexOf(option) === index).map((option) => (
                        <button key={option} type="button" role="option" aria-selected={value === option} onClick={() => select(option)} className={`flex w-full items-center justify-between gap-4 rounded-[9px] px-3 py-2.5 text-left text-xs transition-colors ${value === option ? 'bg-[#f3f7ea] font-semibold text-[#72844d] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]' : 'text-black hover:bg-[#f7f7f5] dark:text-zinc-200 dark:hover:bg-zinc-800'}`}>
                            <span className="truncate">{option}</span>{value === option && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
