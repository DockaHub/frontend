import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    CheckCircle2,
    CircleDollarSign,
    Clock3,
    Copy,
    FilePenLine,
    Layers3,
    Maximize2,
    PackageCheck,
    Palette,
    RefreshCw,
    Scale,
    Shapes,
    Sparkles,
    SplitSquareVertical,
    Target,
    XCircle,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

const benefits = [
    { title: 'Previsibilidade', text: 'Mais transparência para o cliente sobre consumo e composição das tarefas.', icon: Target },
    { title: 'Consistência', text: 'Menos cobranças incorretas e divergências entre demandas semelhantes.', icon: Scale },
    { title: 'Capacidade', text: 'Melhor gestão de banda criativa e dos prazos de entrega.', icon: Clock3 },
];

const modalities = [
    {
        title: 'Original',
        eyebrow: 'Esforço completo',
        icon: Sparkles,
        tone: 'blue' as const,
        description: 'Primeira entrega da tarefa. Percorre briefing, pesquisa, criação e validação, demandando mais horas e etapas.',
        example: 'Representa a construção criativa integral da peça.',
    },
    {
        title: 'Variação',
        eyebrow: 'Mesma estrutura',
        icon: Copy,
        tone: 'violet' as const,
        description: 'Reaproveita a base original e altera dados variáveis — imagem, texto ou cor — sem mudar a estrutura da composição.',
        example: 'Testes A/B, troca de personagens ou versões com cores diferentes.',
    },
    {
        title: 'Redimensionamento',
        eyebrow: 'Novo formato',
        icon: Maximize2,
        tone: 'mint' as const,
        description: 'Mantém layout e conceito, adaptando formato ou proporção. Exige refinamento manual, mas é um processo mecânico.',
        example: 'Feed 1080×1350 → Stories 1080×1920 → banner de e-mail.',
    },
];

const pieceJourney = [
    { label: 'Assets e guias visuais', text: 'Guias e elementos que padronizam a identidade de uma sequência de demandas.', icon: Palette },
    { label: 'Peças originadas', text: 'Peças criadas a partir dos padrões visuais e prontas para novos desdobramentos.', icon: Shapes },
    { label: 'Peças variadas', text: 'Mudanças pontuais sem perder identidade e composição; ideais para testes A/B e dados variáveis.', icon: Copy },
    { label: 'Peças redimensionadas', text: 'Reestruturação da composição para novas dimensões e distribuição em outros canais.', icon: Maximize2 },
];

const checklist = [
    'Registrar no briefing a modalidade correta: original, variação ou redimensionamento.',
    'Utilizar os nomes oficiais do catálogo no alinhamento com o time e o cliente.',
    'Conferir quantidade de peças, slides, segundos e os demais campos da metodologia.',
    'Evitar agrupar itens diferentes em uma única tarefa.',
    'Confirmar se o cliente enviou o arquivo editável antes de classificar um redimensionamento.',
    'Em caso de dúvida, editar a tarefa antes de liberar os créditos.',
];

const adjustmentCases = [
    'Mais de uma entrega original na mesma tarefa',
    'Tarefa somente de redimensionamento',
    'Tarefa somente de variação',
];

const campaignDeliverables = ['KV', 'Posts estáticos originais', 'Posts redimensionados', 'Posts variados', 'Vídeos curtos', 'Banners digitais'];

const AllyoTaskBillingContent = () => (
    <div className="space-y-10">
        <section className="overflow-hidden rounded-[18px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 dark:border-emerald-500/20 dark:from-emerald-950/25 dark:via-zinc-950 dark:to-blue-950/25 sm:p-10">
            <div className="flex flex-wrap gap-2"><Badge tone="mint">Operação</Badge><Badge tone="blue">Créditos</Badge></div>
            <h2 className="mt-6 max-w-[900px] font-season text-[clamp(30px,4vw,48px)] font-normal leading-[1.08]">Esforço criativo traduzido em uma unidade clara de valor.</h2>
            <p className="mt-5 max-w-[920px] text-sm leading-7 text-[#5d6465] dark:text-zinc-300">O modelo de cobrança por créditos traduz tempo e esforço criativo em uma unidade padronizada. Cada crédito cobre parte dos custos operacionais e da margem da Faster, equilibrando qualidade de entrega e sustentabilidade financeira.</p>
            <div className="mt-8 grid gap-[10px] md:grid-cols-3">{benefits.map((benefit) => <BenefitCard key={benefit.title} {...benefit} />)}</div>
        </section>

        <section className="rounded-[18px] border border-blue-200 bg-blue-50/55 p-6 dark:border-blue-500/20 dark:bg-blue-500/5 sm:p-8">
            <div className="flex items-start gap-4"><IconBox icon={PackageCheck} tone="blue" /><div><Eyebrow className="text-blue-600 dark:text-blue-300">Regra base</Eyebrow><h3 className="mt-2 font-season text-[28px]">Uma tarefa deve conter somente um item do catálogo.</h3></div></div>
            <p className="mt-5 max-w-[1000px] text-xs leading-6 text-[#626a73] dark:text-zinc-400">Redimensionamentos e variações podem acompanhar a peça original quando derivam diretamente dela. Misturar tipos diferentes gera inconsistências de prazo, cobrança e leitura de produtividade, pois cada item possui fluxo, especialidade e tempo próprios.</p>
            <div className="mt-6 grid gap-[10px] lg:grid-cols-2">
                <ExampleRule positive title="Composição correta">Carrossel original (10 slides) + stories redimensionados</ExampleRule>
                <ExampleRule title="Composição incorreta">Carrossel + post estático + banner de e-mail</ExampleRule>
            </div>
        </section>

        <Section title="Como a cobrança é calculada" icon={CircleDollarSign} description="Cada item possui uma metodologia própria, que cruza valor e tempo de produção conforme complexidade de execução e práticas de mercado.">
            <div className="grid gap-[10px] lg:grid-cols-3">
                <ProcessCard number="01" title="Item do catálogo" text="O item determina o fluxo, a especialidade e a metodologia aplicável." />
                <ProcessCard number="02" title="Quantidade e formato" text="Peças, slides, segundos e formatos alimentam o cálculo configurado na plataforma." />
                <ProcessCard number="03" title="Crédito final" text="O preenchimento correto evita consumo equivocado e divergências na tarefa." />
            </div>
            <Callout tone="orange" icon={AlertTriangle} title="Campos incorretos alteram o valor final">Antes de liberar créditos, confira se quantidade, unidade de cobrança, formato e modalidade correspondem exatamente ao pedido.</Callout>
        </Section>

        <Section title="Modalidades de produção" icon={SplitSquareVertical} description="A modalidade define o esforço aplicado em relação à peça original. Original é válida para todos os itens; variação e redimensionamento são exclusivos de Graphic Design, exceto na categoria Criação.">
            <div className="grid gap-[10px] lg:grid-cols-3">{modalities.map((modality) => <ModalityCard key={modality.title} {...modality} />)}</div>
            <Callout tone="rose" icon={AlertTriangle} title="JPEG sem editável não é redimensionamento">Quando o cliente envia somente um arquivo JPEG, a adaptação deve ser considerada original, porque exige a reconstrução da peça.</Callout>
        </Section>

        <Section title="Da identidade ao desdobramento" icon={Layers3} description="Assets e guias visuais criam a base que permite originar, variar e redimensionar peças com consistência.">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">{pieceJourney.map((step, index) => <JourneyCard key={step.label} {...step} index={index + 1} />)}</div>
        </Section>

        <Section title="Crédito não é sinônimo de tempo" icon={Clock3} description="Especialidades diferentes têm custos, etapas técnicas e tempos médios distintos, mesmo quando consomem a mesma quantidade de créditos.">
            <div className="grid gap-[10px] lg:grid-cols-2">
                <ComparisonCard icon={Palette} title="Design gráfico" detail="1 original + 10 redimensionamentos" credits="3 créditos" time="4h de produção" text="Criação da base e adaptações manuais para os formatos derivados." />
                <ComparisonCard icon={FilePenLine} title="Edição de vídeo" detail="1 vídeo de 1h" credits="3 créditos" time="6h de produção" text="Edição, revisão e renderização fazem parte do esforço técnico." />
            </div>
            <p className="mt-4 rounded-[12px] bg-[#f6f7f4] px-5 py-4 text-xs leading-6 text-[#616862] dark:bg-zinc-900 dark:text-zinc-400"><strong className="text-black dark:text-white">Resumo:</strong> créditos iguais não significam tempos iguais; cada especialidade incorpora processos técnicos diferentes.</p>
        </Section>

        <section className="rounded-[18px] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 dark:border-violet-500/20 dark:from-violet-950/20 dark:via-zinc-950 dark:to-indigo-950/20 sm:p-8">
            <div className="flex items-start gap-4"><IconBox icon={Boxes} tone="violet" /><div><Eyebrow className="text-violet-600 dark:text-violet-300">Conceito operacional</Eyebrow><h3 className="mt-2 font-season text-[28px]">“Desdobramento” não é modalidade de cobrança.</h3></div></div>
            <p className="mt-5 max-w-[1000px] text-xs leading-6 text-[#656573] dark:text-zinc-400">O termo descreve a expansão de uma campanha ou identidade visual para novos formatos, canais e peças. Um desdobramento pode envolver original, variação e redimensionamento; ele é um agrupamento estratégico, não uma regra de cobrança.</p>
            <div className={`mt-6 rounded-[14px] border bg-white/65 p-5 dark:bg-black/10 ${ALLYO_BORDER}`}>
                <div className="flex items-center gap-3"><Badge tone="violet">Exemplo</Badge><strong className="text-sm">Campanha de Black Friday</strong></div>
                <div className="mt-4 flex flex-wrap gap-2">{campaignDeliverables.map((item) => <span key={item} className={`rounded-full border bg-white px-3 py-1.5 text-[11px] dark:bg-zinc-900 ${ALLYO_BORDER}`}>{item}</span>)}</div>
            </div>
        </section>

        <Section title="Checklist antes de liberar créditos" icon={CheckCircle2}>
            <div className={`rounded-[16px] border bg-white p-5 dark:bg-zinc-950 sm:p-7 ${ALLYO_BORDER}`}><ul className="grid gap-3 lg:grid-cols-2">{checklist.map((item) => <li key={item} className="flex items-start gap-3 rounded-[12px] bg-[#f7f8f5] p-4 text-xs leading-6 text-[#606761] dark:bg-zinc-900 dark:text-zinc-400"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-300" />{item}</li>)}</ul></div>
        </Section>

        <Section title="Situações que exigem ajuste manual" icon={RefreshCw} description="Alguns cenários podem demandar correção de créditos e/ou abertura de slots de entrega.">
            <div className="grid gap-[10px] lg:grid-cols-3">{adjustmentCases.map((item, index) => <article key={item} className={`rounded-[16px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">{index + 1}</span><h4 className="mt-5 text-sm font-semibold leading-6">{item}</h4></article>)}</div>
            <Callout tone="blue" icon={FilePenLine} title="Valide antes de liberar">Quando um desses casos ocorrer, revise a composição da tarefa e ajuste créditos e slots antes de seguir com a produção.</Callout>
        </Section>
    </div>
);

type Tone = 'mint' | 'blue' | 'violet' | 'orange' | 'rose';

const tone = {
    mint: { badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300', icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300', callout: 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/5' },
    blue: { badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300', icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300', callout: 'border-blue-200 bg-blue-50/60 dark:border-blue-500/25 dark:bg-blue-500/5' },
    violet: { badge: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300', icon: 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300', callout: 'border-violet-200 bg-violet-50/60 dark:border-violet-500/25 dark:bg-violet-500/5' },
    orange: { badge: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300', icon: 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300', callout: 'border-orange-200 bg-orange-50/60 dark:border-orange-500/25 dark:bg-orange-500/5' },
    rose: { badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300', icon: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300', callout: 'border-rose-200 bg-rose-50/60 dark:border-rose-500/25 dark:bg-rose-500/5' },
};

const Section = ({ title, icon: Icon, description, children }: { title: string; icon: LucideIcon; description?: string; children: ReactNode }) => <section><div className="mb-5 flex items-center gap-2"><Icon size={17} className="text-emerald-600 dark:text-emerald-300" /><h3 className="font-season text-[24px]">{title}</h3></div>{description && <p className="-mt-3 mb-5 max-w-[1000px] text-xs leading-6 text-[#666d6c] dark:text-zinc-400">{description}</p>}{children}</section>;
const Badge = ({ tone: color, children }: { tone: Tone; children: ReactNode }) => <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${tone[color].badge}`}>{children}</span>;
const Eyebrow = ({ children, className = '' }: { children: ReactNode; className?: string }) => <span className={`text-[9px] font-bold uppercase tracking-[.12em] text-[#7e8585] dark:text-zinc-500 ${className}`}>{children}</span>;
const IconBox = ({ icon: Icon, tone: color }: { icon: LucideIcon; tone: Tone }) => <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${tone[color].icon}`}><Icon size={18} /></span>;
const BenefitCard = ({ title, text, icon: Icon }: { title: string; text: string; icon: LucideIcon }) => <article className={`rounded-[14px] border bg-white/70 p-5 dark:bg-black/10 ${ALLYO_BORDER}`}><IconBox icon={Icon} tone="mint" /><strong className="mt-4 block text-sm">{title}</strong><p className="mt-2 text-[11px] leading-5 text-[#666d6c] dark:text-zinc-400">{text}</p></article>;
const ExampleRule = ({ positive = false, title, children }: { positive?: boolean; title: string; children: ReactNode }) => <article className={`rounded-[14px] border p-5 ${positive ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/5' : 'border-rose-200 bg-rose-50/60 dark:border-rose-500/25 dark:bg-rose-500/5'}`}><div className="flex items-center gap-2">{positive ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-rose-500" />}<strong className="text-xs">{title}</strong></div><p className="mt-3 text-xs leading-6 text-[#5f6665] dark:text-zinc-400">{children}</p></article>;
const ProcessCard = ({ number, title, text }: { number: string; title: string; text: string }) => <article className={`rounded-[16px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-300">ETAPA {number}</span><h4 className="mt-4 font-season text-xl">{title}</h4><p className="mt-3 text-xs leading-6 text-[#666d6c] dark:text-zinc-400">{text}</p></article>;
const Callout = ({ tone: color, icon: Icon, title, children }: { tone: Tone; icon: LucideIcon; title: string; children: ReactNode }) => <div className={`mt-5 rounded-[14px] border p-5 ${tone[color].callout}`}><div className="flex items-center gap-3"><Icon size={17} className={tone[color].icon.split(' ').filter((item) => item.startsWith('text-')).join(' ')} /><strong className="text-xs">{title}</strong></div><p className="mt-3 text-xs leading-6 text-[#646a6b] dark:text-zinc-400">{children}</p></div>;
const ModalityCard = ({ title, eyebrow, icon: Icon, tone: color, description, example }: { title: string; eyebrow: string; icon: LucideIcon; tone: Tone; description: string; example: string }) => <article className={`rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center justify-between gap-3"><IconBox icon={Icon} tone={color} /><Badge tone={color}>{eyebrow}</Badge></div><h4 className="mt-5 font-season text-[24px]">{title}</h4><p className="mt-3 text-xs leading-6 text-[#616869] dark:text-zinc-400">{description}</p><p className="mt-4 border-l-2 border-black/10 pl-4 text-[11px] italic leading-5 text-[#7a8080] dark:border-white/10 dark:text-zinc-500">{example}</p></article>;
const JourneyCard = ({ label, text, icon: Icon, index }: { label: string; text: string; icon: LucideIcon; index: number }) => <article className={`relative rounded-[16px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center justify-between"><IconBox icon={Icon} tone={index === 1 ? 'blue' : index === 2 ? 'violet' : index === 3 ? 'mint' : 'orange'} /><span className="font-mono text-[10px] text-[#969b9b]">0{index}</span></div><h4 className="mt-5 text-sm font-semibold">{label}</h4><p className="mt-3 text-[11px] leading-5 text-[#666d6c] dark:text-zinc-400">{text}</p>{index < 4 && <ArrowRight size={14} className="absolute -right-3 top-1/2 z-10 hidden text-[#a8aeaa] xl:block" />}</article>;
const ComparisonCard = ({ icon: Icon, title, detail, credits, time, text }: { icon: LucideIcon; title: string; detail: string; credits: string; time: string; text: string }) => <article className={`rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><IconBox icon={Icon} tone="blue" /><div><h4 className="font-season text-[22px]">{title}</h4><span className="text-[11px] text-[#777e7e] dark:text-zinc-500">{detail}</span></div></div><div className="mt-5 grid grid-cols-2 gap-[10px]"><Metric label="Consumo" value={credits} /><Metric label="Tempo" value={time} /></div><p className="mt-4 text-xs leading-6 text-[#666d6c] dark:text-zinc-400">{text}</p></article>;
const Metric = ({ label, value }: { label: string; value: string }) => <div className="rounded-[12px] bg-[#f6f7f4] p-4 dark:bg-zinc-900"><Eyebrow>{label}</Eyebrow><strong className="mt-2 block text-sm">{value}</strong></div>;

export default AllyoTaskBillingContent;
