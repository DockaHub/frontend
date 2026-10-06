import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    Ban,
    CheckCircle2,
    Circle,
    Clock3,
    CreditCard,
    Eye,
    GitBranch,
    Layers3,
    Link2,
    ListChecks,
    Pause,
    Plus,
    RefreshCw,
    Rocket,
    Save,
    Sparkles,
    TriangleAlert,
    Zap,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type FlowState = 'done' | 'active' | 'blocked' | 'pending' | 'disabled';
type Accent = 'violet' | 'navy' | 'mint' | 'rose';

type Example = {
    initials: string;
    title: string;
    context: string;
    status: string;
    credits: string;
    accent: Accent;
    booster?: string;
    summary: string;
    steps: { label: string; state: FlowState }[];
};

const examples: Example[] = [
    {
        initials: 'QA',
        title: '(Legendagem) User Education — Corretor em Cena',
        context: 'Growth · Legendagem (Vídeo & Áudio) · #66141',
        status: 'Bloqueada',
        credits: '8 créditos',
        accent: 'violet',
        summary: '3 em andamento · 1 bloqueada',
        steps: [
            { label: 'Animado', state: 'done' },
            { label: 'Transcrição de áudio', state: 'done' },
            { label: 'Revisão de legenda', state: 'active' },
            { label: 'Legendagem', state: 'blocked' },
        ],
    },
    {
        initials: 'AB',
        title: '(Conceito visual) Arte de divulgação',
        context: 'Conceito visual · Campanha de lançamento · #67192',
        status: 'Alterar',
        credits: '3 créditos',
        accent: 'navy',
        booster: 'Booster 1 crédito',
        summary: '1 em andamento · 1 bloqueada',
        steps: [
            { label: 'Conceito visual', state: 'pending' },
            { label: 'Estático', state: 'blocked' },
        ],
    },
    {
        initials: 'TP',
        title: '[Conteúdo] Social de divulgação — E-book Nutrição',
        context: 'Materiais ricos · Animado (Redes Sociais) · #63119',
        status: 'Aprovação Externa',
        credits: '2,5 créditos',
        accent: 'mint',
        summary: '3 em andamento · 1 bloqueada',
        steps: [
            { label: 'Roteiro para vídeo', state: 'done' },
            { label: 'Storyboard', state: 'done' },
            { label: 'Animado', state: 'active' },
            { label: 'Legenda redes sociais', state: 'blocked' },
        ],
    },
    {
        initials: 'AD',
        title: '(Transcrição de áudio via IA) Legendagem institucional',
        context: 'Transcrição de áudio (Vídeo & Áudio) · #65435',
        status: 'Pendência de Briefing',
        credits: '0,5 crédito',
        accent: 'rose',
        summary: '1 em andamento · 2 bloqueadas',
        steps: [
            { label: 'Transcrição de áudio', state: 'pending' },
            { label: 'Revisão de legenda', state: 'blocked' },
            { label: 'Legendagem', state: 'blocked' },
        ],
    },
];

const intelligentFlows = [
    'Produção de vídeo',
    'Produção de materiais ricos',
    'Produção de campanhas',
    'Produção de e-books',
    'Projetos com múltiplas especialidades',
    'Fluxos personalizados',
];

const manualSteps = [
    ['Criar as tarefas', 'Todas as tarefas precisam existir antes.'],
    ['Abrir a tarefa principal', 'Acesse a tarefa que será a origem do fluxo.'],
    ['Abrir o Fluxo Inteligente', 'Use o botão na parte inferior da tarefa.'],
    ['Adicionar tarefa ao fluxo', 'Clique em “Adicionar tarefa ao fluxo”.'],
    ['Selecionar a tarefa', 'Escolha na lista e clique em “Confirmar”.'],
    ['Conectar as tarefas', 'Crie a dependência manualmente entre os blocos.'],
    ['Salvar o fluxo', 'Clique em “Salvar fluxo inteligente” para aplicar.'],
];

const benefits: { label: string; icon: LucideIcon }[] = [
    { label: 'Organização operacional', icon: GitBranch },
    { label: 'Controle de dependências', icon: Layers3 },
    { label: 'Automação de desbloqueios', icon: Sparkles },
    { label: 'Previsibilidade de prazo', icon: Clock3 },
    { label: 'Flexibilidade para ajustes', icon: RefreshCw },
    { label: 'Pagamento centralizado', icon: CreditCard },
    { label: 'Reaproveitamento de fluxos', icon: Rocket },
    { label: 'Visibilidade completa', icon: Eye },
];

const AllyoTaskStackContent = () => (
    <div className="space-y-12">
        <section className="rounded-[18px] border border-indigo-100 bg-gradient-to-br from-[#f1f3ff] via-white to-[#f9faff] p-6 dark:border-indigo-500/20 dark:from-indigo-950/25 dark:via-zinc-950 dark:to-zinc-900 sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                    <span className="text-[9px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-300">Fluxo operacional</span>
                    <h2 className="mt-4 max-w-[720px] font-season text-[clamp(30px,4vw,46px)] leading-[1.08]">Tarefas conectadas, entregas previsíveis.</h2>
                    <p className="mt-4 max-w-[760px] text-sm leading-7 text-[#606674] dark:text-zinc-300">Uma Stack conecta tarefas em sequência. Cada entrega bloqueia ou libera automaticamente as próximas etapas, transformando processos complexos em fluxos previsíveis e escaláveis.</p>
                </div>
                <Badge icon={Layers3}>Fluxo conectado de tarefas</Badge>
            </div>
        </section>

        <Section eyebrow="Conceito" title="Como funciona uma Stack" description="Cada tarefa pode depender de outra. Enquanto a anterior não for aprovada, as dependentes permanecem bloqueadas. Após a aprovação, são liberadas automaticamente como tarefas novas.">
            <div className="grid gap-[10px] lg:grid-cols-3">
                <FeatureCard icon={Ban} title="Bloqueada">Aguarda a conclusão de uma ou mais tarefas anteriores para iniciar.</FeatureCard>
                <FeatureCard icon={Rocket} title="Liberada">Assim que a dependência é aprovada, muda automaticamente para <strong>Nova</strong>.</FeatureCard>
                <FeatureCard icon={RefreshCw} title="Recalculada">Mudanças no fluxo recalculam datas, ordem e cronograma da Stack.</FeatureCard>
            </div>
        </Section>

        <Section eyebrow="Exemplos reais" title="Stacks em diferentes formatos" description="Os cards abaixo reproduzem como uma tarefa de Stack aparece na plataforma, com o fluxo inteligente conectando as etapas.">
            <div className="grid gap-[10px] xl:grid-cols-2">{examples.map((example) => <ExampleCard key={example.title} example={example} />)}</div>
        </Section>

        <Section eyebrow="Automação" title="Fluxos Inteligentes" description="Modelos pré-configurados criam automaticamente as tarefas conectadas, com dependências, bloqueios e desbloqueios aplicados desde a abertura.">
            <div className="grid gap-[10px] sm:grid-cols-2 lg:grid-cols-3">{intelligentFlows.map((flow) => <div key={flow} className={`flex items-center gap-3 rounded-[14px] border bg-white p-4 text-sm dark:bg-zinc-950 ${ALLYO_BORDER}`}><GitBranch size={15} className="shrink-0 text-indigo-500" />{flow}</div>)}</div>
        </Section>

        <Section eyebrow="Ciclo de vida" title="Da abertura à aprovação final" description="Toda tarefa dentro de uma Stack passa por um ciclo padronizado. Os status Finalizada e Aprovada são exclusivos das Stacks.">
            <Panel>
                <FlowLine steps={[{ label: 'Nova', state: 'active' }, { label: 'Produção', state: 'active' }, { label: 'Aprovação Externa', state: 'disabled' }, { label: 'Finalizada', state: 'done' }, { label: 'Aprovada', state: 'done' }]} />
                <div className="mt-6 grid gap-[10px] lg:grid-cols-2">
                    <Inset title="Finalizada" icon={CheckCircle2}>Entrega aprovada e dependentes liberadas, mas ainda existe tarefa aberta na Stack. <strong>Pagamento ainda não realizado.</strong></Inset>
                    <Inset title="Aprovada" icon={Sparkles}>Stack encerrada, créditos consolidados e <strong>pagamentos liberados automaticamente.</strong></Inset>
                </div>
            </Panel>
            <div className="mt-[10px] grid gap-[10px] lg:grid-cols-2">
                <Panel>
                    <Title icon={CreditCard}>Pagamento em Stacks</Title>
                    <p className="mt-4 text-xs leading-6 text-[#626874] dark:text-zinc-400">O pagamento ocorre <strong>somente após a conclusão completa da Stack.</strong> Mesmo etapas finalizadas antes só são pagas quando todo o fluxo for encerrado.</p>
                    <div className="mt-5 rounded-[14px] border border-[#e2e3e9] bg-[#fafafe] p-4 dark:border-zinc-700 dark:bg-zinc-900"><FlowLine steps={[{ label: 'Storyboard', state: 'done' }, { label: 'Animado', state: 'active' }, { label: 'Legendagem', state: 'blocked' }]} /><p className="mt-3 text-[10px] text-[#747985] dark:text-zinc-500">Pagamento liberado apenas ao concluir a última tarefa.</p></div>
                </Panel>
                <Panel>
                    <Title icon={Clock3}>Prazos encadeados</Title>
                    <p className="mt-4 text-xs leading-6 text-[#626874] dark:text-zinc-400">O prazo de uma tarefa bloqueada é calculado <strong>a partir da previsão de entrega da tarefa que a bloqueia</strong>, não da data de abertura da Stack.</p>
                    <div className="mt-5 rounded-[14px] border border-[#e2e3e9] bg-[#fafafe] p-4 text-[11px] dark:border-zinc-700 dark:bg-zinc-900"><div className="flex justify-between gap-4"><span>Storyboard</span><span className="font-mono text-[#717681]">05/06 09h</span></div><div className="mt-2 flex justify-between gap-4"><span>Vídeo institucional <span className="text-[#8c919b]">(SLA 3 dias)</span></span><span className="font-mono text-[#717681]">10/06 09h</span></div></div>
                </Panel>
            </div>
        </Section>

        <Section eyebrow="Aceleração" title="Boosters em Stacks" description="Permitem antecipar prazos de etapas específicas sem alterar a estrutura de dependências. O cronograma completo é recalculado antes da confirmação.">
            <div className="grid gap-[10px] lg:grid-cols-2">
                <ListCard icon={Zap} title="O que muda" tone="orange" items={['Prazo da tarefa onde o Booster é aplicado', 'Datas das etapas seguintes (efeito em cadeia)', 'Prazo total do projeto']} />
                <ListCard icon={Ban} title="O que não muda" tone="gray" items={['Dependências entre tarefas', 'Ordem de execução e estrutura da Stack', 'Fluxo Inteligente configurado']} />
            </div>
        </Section>

        <Section eyebrow="Legenda visual" title="Como interpretar uma Stack">
            <div className="grid gap-[10px] sm:grid-cols-2 lg:grid-cols-5">
                <Legend state="done" label="Verde" description="Concluída" />
                <Legend state="active" label="Azul" description="Em andamento" />
                <Legend state="blocked" label="Cinza" description="Bloqueada" />
                <Legend state="pending" label="Vermelho" description="Pendência" />
                <Legend state="disabled" label="Roxo" description="Desativada" />
            </div>
        </Section>

        <Section eyebrow="Passo a passo" title="Criar uma Stack manualmente" description="Quando o fluxo padrão do catálogo não atende, é possível conectar tarefas já existentes na plataforma.">
            <div className="grid gap-[10px] lg:grid-cols-2">
                {manualSteps.map(([title, description], index) => <StepCard key={title} number={index + 1} title={title} description={description} />)}
                <div className="flex items-center gap-4 rounded-[15px] border border-dashed border-indigo-300 bg-indigo-50/60 p-5 text-xs leading-5 text-[#656b77] dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-zinc-300"><Plus size={18} className="shrink-0 text-indigo-500" />A plataforma atualiza automaticamente dependências, datas e cronograma depois que o fluxo é salvo.</div>
            </div>
        </Section>

        <Section eyebrow="Por que usar" title="Benefícios das Stacks">
            <div className="grid gap-[10px] sm:grid-cols-2 lg:grid-cols-4">{benefits.map(({ label, icon: Icon }) => <div key={label} className={`flex items-center gap-3 rounded-[14px] border bg-white p-4 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10"><Icon size={16} /></span><strong className="text-xs">{label}</strong></div>)}</div>
        </Section>
    </div>
);

const flowTone: Record<FlowState, string> = {
    done: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    active: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    blocked: 'border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
    pending: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
    disabled: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
};

const accentTone: Record<Accent, { border: string; avatar: string }> = {
    violet: { border: 'border-t-violet-600', avatar: 'bg-violet-600' },
    navy: { border: 'border-t-slate-800', avatar: 'bg-slate-800' },
    mint: { border: 'border-t-emerald-500', avatar: 'bg-emerald-600' },
    rose: { border: 'border-t-rose-500', avatar: 'bg-rose-600' },
};

const Section = ({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children: ReactNode }) => <section><span className="text-[9px] font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-300">{eyebrow}</span><h3 className="mt-2 font-season text-[clamp(26px,3vw,34px)] leading-tight">{title}</h3>{description && <p className="mb-6 mt-3 max-w-[800px] text-xs leading-6 text-[#676d79] dark:text-zinc-400">{description}</p>}{!description && <div className="mb-6" />}{children}</section>;
const Panel = ({ children }: { children: ReactNode }) => <article className={`rounded-[17px] border bg-white p-5 shadow-sm dark:bg-zinc-950 sm:p-6 ${ALLYO_BORDER}`}>{children}</article>;
const Badge = ({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) => <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-2 text-[10px] font-medium text-[#676d79] dark:border-indigo-500/30 dark:bg-zinc-900 dark:text-zinc-300">{Icon && <Icon size={14} className="text-indigo-500" />}{children}</span>;
const Title = ({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) => <div className="flex items-center gap-2"><Icon size={17} className="text-indigo-500" /><h4 className="font-season text-[22px]">{children}</h4></div>;
const FeatureCard = ({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) => <article className={`rounded-[17px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10"><Icon size={16} /></span><strong className="text-sm">{title}</strong></div><p className="mt-4 text-xs leading-6 text-[#666c77] dark:text-zinc-400">{children}</p></article>;

const ExampleCard = ({ example }: { example: Example }) => <article className={`overflow-hidden rounded-[17px] border border-t-[8px] bg-white p-5 shadow-sm dark:bg-zinc-950 ${ALLYO_BORDER} ${accentTone[example.accent].border}`}><div className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[10px] font-bold text-white ${accentTone[example.accent].avatar}`}>{example.initials}</span><div className="min-w-0"><h4 className="text-sm font-bold leading-5">{example.title}</h4><p className="mt-1 text-[9px] leading-4 text-[#7b808a] dark:text-zinc-500">{example.context}</p></div></div><div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/8 pt-4 text-[10px] dark:border-white/10"><span className="text-[#777c86]">Status:</span><span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">{example.status}</span><span className="text-[#a1a5ad]">•</span><span>Consumo <strong>{example.credits}</strong></span>{example.booster && <><span className="text-[#a1a5ad]">•</span><span className="inline-flex items-center gap-1"><Zap size={11} className="text-orange-500" />{example.booster}</span></>}</div><div className="mt-4 rounded-[14px] border border-[#e2e3e9] bg-[#fafafe] p-4 dark:border-zinc-700 dark:bg-zinc-900"><div className="mb-3 flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-[11px] font-bold"><GitBranch size={13} className="text-indigo-500" />Fluxo inteligente</span><span className="text-[9px] text-[#7d828d] dark:text-zinc-500">{example.summary}</span></div><FlowLine steps={example.steps} /></div></article>;

const StateIcon = ({ state }: { state: FlowState }) => {
    if (state === 'done') return <CheckCircle2 size={12} />;
    if (state === 'active') return <Circle size={12} className="fill-current" />;
    if (state === 'blocked') return <Pause size={12} />;
    if (state === 'pending' || state === 'disabled') return <TriangleAlert size={12} />;
    return null;
};
const FlowLine = ({ steps }: { steps: { label: string; state: FlowState }[] }) => <div className="flex flex-wrap items-center gap-2">{steps.map((step, index) => <div key={`${step.label}-${index}`} className="contents"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] ${flowTone[step.state]}`}><StateIcon state={step.state} />{step.label}</span>{index < steps.length - 1 && <ArrowRight size={13} className="text-[#a7abb3]" />}</div>)}</div>;
const Inset = ({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) => <div className="rounded-[14px] border border-[#e1e2e8] bg-[#fafafe] p-4 dark:border-zinc-700 dark:bg-zinc-900"><div className="flex items-center gap-2"><Icon size={14} className="text-emerald-600 dark:text-emerald-300" /><strong className="text-xs">{title}</strong></div><p className="mt-3 text-[10px] leading-5 text-[#686e79] dark:text-zinc-400">{children}</p></div>;
const ListCard = ({ icon: Icon, title, items, tone }: { icon: LucideIcon; title: string; items: string[]; tone: 'orange' | 'gray' }) => <Panel><div className="flex items-center gap-2"><Icon size={16} className={tone === 'orange' ? 'text-orange-500' : 'text-[#777d87]'} /><strong className="text-xs">{title}</strong></div><ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2 text-xs leading-5 text-[#646a75] dark:text-zinc-400"><span className={tone === 'orange' ? 'text-orange-500' : 'text-[#888d96]'}>•</span>{item}</li>)}</ul></Panel>;
const Legend = ({ state, label, description }: { state: FlowState; label: string; description: string }) => <div className={`rounded-[14px] border bg-white p-4 text-center dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className={`mx-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] ${flowTone[state]}`}><StateIcon state={state} />{label}</span><p className="mt-3 text-[10px] text-[#747985] dark:text-zinc-500">{description}</p></div>;
const StepCard = ({ number, title, description }: { number: number; title: string; description: string }) => <article className={`flex items-start gap-4 rounded-[15px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">{number}</span><div><strong className="text-xs">{title}</strong><p className="mt-1 text-[10px] leading-5 text-[#737985] dark:text-zinc-500">{description}</p></div>{number === 3 && <ListChecks size={15} className="ml-auto text-indigo-400" />}{number === 6 && <Link2 size={15} className="ml-auto text-indigo-400" />}{number === 7 && <Save size={15} className="ml-auto text-indigo-400" />}</article>;

export default AllyoTaskStackContent;
