import React, { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, Grid2X2 } from 'lucide-react';

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
    { id: '123457', name: 'Roteiro para filme manifesto', category: 'Redação', client: 'Asterysko', deadline: '21/12/2026', time: '14h00min', status: 'Em andamento', cam: 'Marina', creative: 'Joana' },
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
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`border-t ${ALLYO_BORDER}`}>
            <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
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
                <ChevronRight size={18} className={`text-[#9f9f9f] transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
            {expanded && (
                <div className="grid grid-cols-2 gap-4 border-t border-dashed border-[#e5e5e5] bg-[#fafbf8] px-[30px] py-4 text-xs text-[#616161] dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400 sm:grid-cols-4">
                    <DataCell label="CAM" value={task.cam} />
                    <DataCell label="CRIATIVO" value={task.creative} />
                    <DataCell label="CLIENTE" value={task.client} />
                    <DataCell label="ENTREGA" value={`${task.deadline} • ${task.time}`} />
                </div>
            )}
        </div>
    );
};

export const DataCell = ({ label, value, className = '', valueClassName = '' }: { label: string; value: string; className?: string; valueClassName?: string }) => (
    <span className={`min-w-0 ${className}`}>
        <span className="block text-[9px] font-medium leading-none text-[#616161] dark:text-zinc-500">{label}</span>
        <span className={`mt-[10px] block truncate text-sm font-medium leading-none text-black dark:text-zinc-200 ${valueClassName}`}>{value}</span>
    </span>
);

export const FilterSelect = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) => (
    <label className="relative shrink-0">
        <span className="sr-only">{label}</span>
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="min-h-9 appearance-none rounded-full border border-[#e5e5e5] bg-white py-2 pl-[15px] pr-9 text-xs font-semibold text-black outline-none transition-colors hover:border-[#9db669] focus:border-[#9db669] dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        >
            <option value="Todos">{label}</option>
            {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-[13px] top-1/2 -translate-y-1/2 text-black dark:text-zinc-400" />
    </label>
);
