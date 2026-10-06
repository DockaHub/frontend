import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowDownAZ,
    Bookmark,
    CalendarDays,
    CheckCircle2,
    Columns3,
    Filter,
    GripVertical,
    ListFilter,
    Pin,
    Search,
    Settings2,
    Sparkles,
    Star,
    UsersRound,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type Tone = 'blue' | 'violet' | 'mint' | 'orange' | 'rose' | 'sky';
type RolePreset = { role: string; fullName: string; tone: Tone; filters: [string, string][]; statuses: string[] };

const availableFilters = ['Tarefas', 'Período', 'Categoria', 'Clientes', 'Responsável', 'CAM', 'CESM', 'CQS/AD', 'Status', 'Data de entrega', 'Nível'];
const availableColumns = ['Id', 'Nome', 'Categoria', 'Item', 'Cliente', 'CAM', 'Responsável', 'CQS/AD', 'Status', 'Deadline', 'Tier'];
const pinnedColumns = ['Id', 'Deadline', 'Status', 'Cliente', 'Item'];

const commonUses = [
    'Organizar a pauta diária',
    'Monitorar entregas previstas',
    'Identificar gargalos operacionais',
    'Acompanhar clientes específicos',
    'Visualizar tarefas por responsabilidade',
    'Analisar capacidade e distribuição',
];

const sortingOptions = [
    { title: 'Data de entrega', description: 'Mostra rapidamente as tarefas mais urgentes.', icon: CalendarDays, tone: 'rose' as const },
    { title: 'Cliente', description: 'Facilita análises específicas de contas.', icon: UsersRound, tone: 'sky' as const },
    { title: 'Status', description: 'Ajuda a localizar gargalos operacionais.', icon: ListFilter, tone: 'violet' as const },
    { title: 'Responsável', description: 'Analisa a distribuição de carga entre criativos.', icon: UsersRound, tone: 'mint' as const },
    { title: 'CAM', description: 'Agrupa demandas por Customer Account Manager.', icon: UsersRound, tone: 'orange' as const },
    { title: 'CQS/AD', description: 'Exibe tarefas por qualidade ou direção criativa.', icon: Star, tone: 'violet' as const },
];

const presets: RolePreset[] = [
    {
        role: 'CESM', fullName: 'Customer Excellence Success Manager', tone: 'violet',
        filters: [['Tarefas', 'Tarefas ativas'], ['Período', 'Todos'], ['CESM', 'Seu próprio nome'], ['Data de entrega', 'Hoje']],
        statuses: ['Nova', 'Análise CQS', 'Iniciar', 'Em andamento', 'Em pausa', 'Aprovação CAM', 'Aprovação CQS', 'Alterar', 'Esperando aceite'],
    },
    {
        role: 'CAM', fullName: 'Customer Account Manager', tone: 'mint',
        filters: [['Tarefas', 'Tarefas ativas'], ['Período', 'Todos'], ['CAM', 'Seu próprio nome'], ['CESM', 'CESM responsável'], ['Data de entrega', 'Hoje']],
        statuses: ['Nova', 'Análise CAM', 'Análise CQS', 'Pendência de Briefing', 'Iniciar', 'Em andamento', 'Em pausa', 'Aprovação CAM', 'Aprovação CQS', 'Alterar', 'Esperando aceite'],
    },
    {
        role: 'CAS', fullName: 'Customer Account Senior', tone: 'orange',
        filters: [['Tarefas', 'Tarefas ativas'], ['Período', 'Todos'], ['CAM', 'Parceiro ou conta'], ['CESM', 'CESM responsável']],
        statuses: ['Nova', 'Análise CAM', 'Análise CQS', 'Pendência de Briefing', 'Aprovação CAM'],
    },
    {
        role: 'CQS', fullName: 'Creative Quality Specialist', tone: 'violet',
        filters: [['Tarefas', 'Tarefas ativas'], ['Período', 'Todos'], ['CESM', 'CESM responsável'], ['CQS/AD', 'Seu próprio nome']],
        statuses: ['Nova', 'Análise CQS', 'Aprovação CQS', 'Alterar', 'Em pausa', 'Em andamento', 'Iniciar', 'Esperando aceite'],
    },
    {
        role: 'AD', fullName: 'Art Director', tone: 'rose',
        filters: [['Tarefas', 'Tarefas ativas'], ['Período', 'Todos'], ['CESM', 'CESM responsável'], ['CQS/AD', 'Seu próprio nome']],
        statuses: ['Nova', 'Análise CQS', 'Aprovação CQS', 'Aprovação CAM', 'Pendência de Briefing', 'Alterar', 'Em pausa', 'Em andamento', 'Iniciar', 'Esperando aceite'],
    },
    {
        role: 'Criativos', fullName: 'Creative team', tone: 'sky',
        filters: [['Tarefas', 'Tarefas ativas'], ['Período', 'Todos'], ['CESM', 'CESM responsável']],
        statuses: ['Iniciar', 'Em andamento', 'Em pausa', 'Aprovação CAM', 'Alterar', 'Esperando aceite'],
    },
];

const bestPractices = [
    'Utilize o preset recomendado para sua função.',
    'Revise sua pauta no início e no final do dia.',
    'Priorize a visualização por data de entrega.',
    'Use filtros específicos para análises pontuais.',
    'Mantenha as colunas organizadas conforme sua rotina.',
    'Evite controles paralelos quando a informação já estiver na plataforma.',
];

const AllyoTaskListContent = () => (
    <div className="space-y-10">
        <section className="overflow-hidden rounded-[18px] border border-indigo-100 bg-gradient-to-br from-[#f2f4ff] via-white to-[#f8f9ff] p-6 shadow-sm dark:border-indigo-500/15 dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-900 sm:p-8 lg:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr]">
                <div>
                    <span className="text-[9px] font-bold uppercase tracking-[.18em] text-[#777d88]">Plataforma Faster</span>
                    <h2 className="mt-5 max-w-[720px] font-season text-[clamp(30px,4vw,46px)] leading-[1.08]">A visão central da operação.</h2>
                    <p className="mt-5 max-w-[700px] text-sm leading-7 text-[#5f6570] dark:text-zinc-300">É onde CAMs, CASs, CQSs, ADs e criativos acompanham demandas, organizam prioridades, monitoram prazos e identificam gargalos da operação.</p>
                    <div className="mt-6 flex flex-wrap gap-2"><Badge tone="sky" icon={Filter}>Filtros</Badge><Badge tone="violet" icon={Columns3}>Colunas</Badge><Badge tone="mint" icon={ArrowDownAZ}>Ordenação</Badge><Badge tone="orange" icon={Star}>Presets por função</Badge></div>
                </div>
                <TaskTablePreview />
            </div>
        </section>

        <NumberedSection number="01" title="Filtros" description="Combine filtros para localizar demandas e construir visões específicas da operação. Cada configuração fica associada à visualização profissional." icon={Filter}>
            <Panel>
                <Subheading icon={Filter} title="Filtros disponíveis" />
                <div className="mt-4 flex flex-wrap gap-2">{availableFilters.map((filter) => <Chip key={filter}>{filter}</Chip>)}</div>
                <div className="my-6 border-t border-black/8 dark:border-white/10" />
                <Subheading icon={Sparkles} title="Usos mais comuns" />
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">{commonUses.map((item) => <CheckItem key={item}>{item}</CheckItem>)}</ul>
                <div className="mt-6 rounded-[14px] border border-dashed border-[#d8dae1] bg-[#fafafe] p-4 dark:border-zinc-700 dark:bg-zinc-900"><div className="flex items-start gap-3"><Bookmark size={15} className="mt-1 shrink-0 text-violet-600 dark:text-violet-300" /><div><strong className="text-xs">Salvamento automático</strong><p className="mt-1 text-[11px] leading-5 text-[#717681] dark:text-zinc-400">Cada profissional mantém sua própria visualização sem precisar reconfigurar filtros diariamente.</p></div></div></div>
            </Panel>
        </NumberedSection>

        <NumberedSection number="02" title="Personalização de colunas" description="Use o botão Colunas para exibir, ocultar, reordenar e fixar informações conforme sua rotina de trabalho." icon={Columns3}>
            <Panel><Subheading icon={Columns3} title="Colunas disponíveis" /><div className="mt-4 flex flex-wrap gap-2">{availableColumns.map((column) => <Chip key={column}>{column}</Chip>)}</div></Panel>
            <div className="mt-[10px] grid gap-[10px] lg:grid-cols-2">
                <Panel>
                    <div className="flex items-start justify-between gap-3"><Subheading icon={Settings2} title="Gerenciador de visualização" /><Badge tone="blue">Botão Colunas</Badge></div>
                    <p className="mt-2 text-[11px] text-[#777c85] dark:text-zinc-500">Arraste para reordenar; clique para exibir ou ocultar.</p>
                    <div className="mt-5 space-y-2"><ColumnRow name="Id" state="Fixado" tone="violet" checked /><ColumnRow name="Nome" state="Oculto" tone="blue" /><ColumnRow name="Deadline" state="Recomendado" tone="mint" checked /></div>
                </Panel>
                <Panel>
                    <div className="flex items-start justify-between gap-3"><Subheading icon={Pin} title="Fixação recomendada" /><Badge tone="orange">Pin esquerdo</Badge></div>
                    <p className="mt-2 text-[11px] text-[#777c85] dark:text-zinc-500">Mantenha sempre visíveis as colunas-chave da pauta.</p>
                    <div className="mt-5 flex flex-wrap gap-2">{pinnedColumns.map((column) => <Badge key={column} tone="orange" icon={Pin}>{column}</Badge>)}</div>
                    <div className={`mt-5 flex overflow-hidden rounded-full border bg-white dark:bg-zinc-900 ${ALLYO_BORDER}`}>{pinnedColumns.map((column) => <span key={column} className="flex min-w-24 items-center gap-2 border-r border-black/8 px-3 py-2 text-[10px] last:border-0 dark:border-white/10"><Pin size={10} className="text-orange-500" />{column}</span>)}<span className="min-w-28 px-3 py-2 text-[10px] text-[#a2a5ac]">Outras colunas →</span></div>
                    <p className="mt-5 text-[11px] leading-5 text-[#717681] dark:text-zinc-400">Fixe ou desafixe rapidamente pelo menu de contexto ao lado do nome da coluna na tabela principal.</p>
                </Panel>
            </div>
        </NumberedSection>

        <NumberedSection number="03" title="Ordenação da pauta" description="A tabela permite ordem crescente ou decrescente em praticamente todas as colunas." icon={ArrowDownAZ}>
            <div className="grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{sortingOptions.map((option) => <SortCard key={option.title} {...option} />)}</div>
        </NumberedSection>

        <NumberedSection number="04" title="Presets padrão por função" description="Cada função possui uma configuração recomendada de filtros e status para manter consistência na gestão da operação." icon={Star}>
            <div className="grid gap-[10px] lg:grid-cols-2 xl:grid-cols-3">{presets.map((preset) => <PresetCard key={preset.role} preset={preset} />)}</div>
        </NumberedSection>

        <NumberedSection number="05" title="Boas práticas" icon={CheckCircle2}>
            <Panel><ul className="grid gap-3 lg:grid-cols-2">{bestPractices.map((item) => <CheckItem key={item}>{item}</CheckItem>)}</ul></Panel>
        </NumberedSection>
    </div>
);

const tone = {
    blue: { badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300', icon: 'text-blue-600 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-500/25', surface: 'bg-blue-50/55 dark:bg-blue-500/5' },
    violet: { badge: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300', icon: 'text-violet-600 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-500/25', surface: 'bg-violet-50/55 dark:bg-violet-500/5' },
    mint: { badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300', icon: 'text-emerald-600 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/25', surface: 'bg-emerald-50/55 dark:bg-emerald-500/5' },
    orange: { badge: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300', icon: 'text-orange-600 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-500/25', surface: 'bg-orange-50/55 dark:bg-orange-500/5' },
    rose: { badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300', icon: 'text-rose-600 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-500/25', surface: 'bg-rose-50/55 dark:bg-rose-500/5' },
    sky: { badge: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300', icon: 'text-sky-600 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-500/25', surface: 'bg-sky-50/55 dark:bg-sky-500/5' },
};

const NumberedSection = ({ number, title, description, icon: Icon, children }: { number: string; title: string; description?: string; icon: LucideIcon; children: ReactNode }) => <section><span className="text-[9px] font-bold uppercase tracking-[.18em] text-[#858994]">{number}</span><div className="mt-2 flex items-center gap-2"><Icon size={17} className="text-violet-600 dark:text-violet-300" /><h3 className="font-season text-[25px]">{title}</h3></div>{description && <p className="mb-5 mt-2 max-w-[760px] text-xs leading-6 text-[#6a6f7a] dark:text-zinc-400">{description}</p>}{!description && <div className="mb-5" />}{children}</section>;
const Panel = ({ children }: { children: ReactNode }) => <article className={`rounded-[17px] border bg-white p-5 shadow-sm dark:bg-zinc-950 sm:p-6 ${ALLYO_BORDER}`}>{children}</article>;
const Subheading = ({ icon: Icon, title }: { icon: LucideIcon; title: string }) => <div className="flex items-center gap-2"><Icon size={15} className="text-violet-600 dark:text-violet-300" /><strong className="text-sm">{title}</strong></div>;
const Badge = ({ tone: color, icon: Icon, children }: { tone: Tone; icon?: LucideIcon; children: ReactNode }) => <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.05em] ${tone[color].badge}`}>{Icon && <Icon size={11} />}{children}</span>;
const Chip = ({ children }: { children: ReactNode }) => <span className="rounded-full border border-[#d8dae1] bg-[#f2f3f6] px-2.5 py-1 text-[10px] text-[#555b67] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">{children}</span>;
const CheckItem = ({ children }: { children: ReactNode }) => <li className="flex items-start gap-2 text-xs leading-6 text-[#5f6570] dark:text-zinc-400"><CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-300" />{children}</li>;

const TaskTablePreview = () => {
    const rows = [
        ['#904', 'Nova', 'RNP', 'Layout de landing page', 'Hoje'],
        ['#913', 'Em andamento', 'Allyo', 'Layout de e-mail marketing', 'Hoje'],
        ['#939', 'Iniciar', 'Faster', 'Anúncio responsivo', 'Amanhã'],
        ['#852', 'Análise CQS', 'SEK', 'Storyboard', 'Amanhã'],
        ['#947', 'Aprovação CAM', 'Flexsis', 'Layout de landing page', '18 jun.'],
        ['#999', 'Em pausa', 'Consórcio', 'Peça estática', '19 jun.'],
    ];
    return <div className="overflow-hidden rounded-[16px] border border-black/8 bg-white p-4 shadow-[0_18px_50px_rgba(45,50,77,.10)] dark:border-white/10 dark:bg-zinc-950"><div className="flex items-center justify-between"><div><span className="block text-[8px] text-[#8f949e]">Tarefas</span><strong className="text-[11px]">Todas as tarefas</strong></div><span className="rounded-md bg-orange-400 px-3 py-1.5 text-[8px] font-bold text-white">Nova tarefa</span></div><div className="mt-3 flex gap-1.5"><span className="flex flex-1 items-center gap-1 rounded-md border border-[#e5e6eb] px-2 py-1 text-[8px] text-[#a1a5ad]"><Search size={9} />Pesquisar...</span>{['Ativas', 'Todos', 'Status'].map((filter) => <span key={filter} className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[8px] text-violet-700">{filter}</span>)}</div><div className="mt-3 overflow-hidden rounded-md border border-[#ececf0]"><div className="grid grid-cols-[.5fr_.8fr_.8fr_1.4fr_.6fr] bg-[#f6f6f8] px-2 py-1.5 text-[7px] font-semibold text-[#8d919a]"><span>Id</span><span>Status</span><span>Cliente</span><span>Item</span><span>Entrega</span></div>{rows.map((row) => <div key={row[0]} className="grid grid-cols-[.5fr_.8fr_.8fr_1.4fr_.6fr] items-center border-t border-[#eeeef1] px-2 py-2 text-[7px] text-[#5f6470]"><strong>{row[0]}</strong><span className="w-fit rounded-full bg-violet-50 px-1.5 py-0.5 text-violet-700">{row[1]}</span><span>{row[2]}</span><span className="truncate">{row[3]}</span><span>{row[4]}</span></div>)}</div><div className="mt-3 flex items-center justify-between text-[7px] text-[#999da5]"><span className="rounded bg-blue-500 px-2 py-1 text-white">Carregar mais...</span><span>6 de 94 resultados</span></div></div>;
};

const ColumnRow = ({ name, state, tone: color, checked = false }: { name: string; state: string; tone: Tone; checked?: boolean }) => <div className={`flex items-center gap-3 rounded-[14px] border p-3 ${tone[color].border} ${tone[color].surface}`}><GripVertical size={14} className="text-[#a4a7ae]" /><span className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? 'border-violet-500 bg-violet-500 text-white' : 'border-[#d4d6dc]'}`}>{checked && <CheckCircle2 size={13} />}</span><span className="flex-1 text-xs">{name}</span><Badge tone={color}>{state}</Badge></div>;
const SortCard = ({ title, description, icon: Icon, tone: color }: { title: string; description: string; icon: LucideIcon; tone: Tone }) => <article className={`rounded-[16px] border p-4 ${tone[color].border} ${tone[color].surface}`}><div className="flex h-24 items-center justify-center rounded-[10px] border border-black/8 bg-white/70 dark:border-white/10 dark:bg-black/10"><div className="w-[80%] rounded-md border border-violet-300 bg-white px-3 py-2 dark:bg-zinc-900"><div className="flex items-center justify-between text-[9px] font-semibold text-violet-700 dark:text-violet-300"><span>{title}</span><ArrowDownAZ size={12} /></div><div className="mt-2 h-1.5 rounded-full bg-[#ececf2]" /><div className="mt-1 h-1.5 w-2/3 rounded-full bg-[#ececf2]" /></div></div><div className="mt-4 flex items-center gap-2"><Icon size={14} className={tone[color].icon} /><strong className="text-xs">Por {title.toLowerCase()}</strong></div><p className="mt-2 text-[10px] leading-5 text-[#6f747e] dark:text-zinc-400">{description}</p></article>;
const PresetCard = ({ preset }: { preset: RolePreset }) => <article className={`rounded-[17px] border bg-white p-5 shadow-sm dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-start justify-between gap-3"><div><h4 className="font-season text-[24px]">{preset.role}</h4><span className="text-[8px] font-bold uppercase tracking-[.15em] text-[#828791]">{preset.fullName}</span></div><Badge tone={preset.tone} icon={Star}>Preset</Badge></div><dl className="mt-5 space-y-2">{preset.filters.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 border-b border-dashed border-black/8 pb-2 text-[11px] last:border-0 dark:border-white/10"><dt className="text-[#777c85] dark:text-zinc-500">{label}</dt><dd className="text-right font-medium">{value}</dd></div>)}</dl><span className="mt-5 block text-[8px] font-bold uppercase tracking-[.16em] text-[#828791]">Status</span><div className="mt-3 flex flex-wrap gap-1.5">{preset.statuses.map((status) => <span key={status} className={`rounded-full border px-2 py-1 text-[9px] ${tone[preset.tone].badge}`}>{status}</span>)}</div></article>;

export default AllyoTaskListContent;
