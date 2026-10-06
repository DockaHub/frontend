import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    CheckCircle2,
    Copy,
    Download,
    Eye,
    FileImage,
    FileText,
    Layers3,
    Link2,
    Maximize2,
    Monitor,
    Palette,
    Play,
    Printer,
    ShieldCheck,
    Sparkles,
    Video,
    Zap,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type Tone = 'blue' | 'violet' | 'orange';

const resizeSteps = [
    ['Acesse Redimensionar', 'Na barra do editor, selecione Redimensionar.'],
    ['Escolha o formato', 'Use uma sugestão comum, pesquise por categoria ou marque vários tamanhos.'],
    ['Defina um tamanho personalizado', 'Informe medidas próprias e bloqueie ou desbloqueie a proporção.'],
    ['Selecione as páginas', 'Escolha todas as páginas ou somente as necessárias para o novo formato.'],
    ['Copie ou redimensione', 'Prefira Copiar e redimensionar para preservar o design original.'],
];

const deliveryGroups: { title: string; tone: Tone; icon: LucideIcon; items: string[] }[] = [
    {
        title: 'Digitais',
        tone: 'blue',
        icon: Monitor,
        items: ['Apresentação de slides', 'Banner para e-mail marketing', 'Banner para site', 'Carrossel', 'Conversão de arquivo editável (Digital)', 'Criação de thumbnail', 'E-book', 'Estático', 'Infográfico', 'Key visual', 'Layout de e-mail marketing'],
    },
    {
        title: 'Vídeo & áudio',
        tone: 'violet',
        icon: Video,
        items: ['Animado', 'Storyboard', 'Vídeo institucional'],
    },
    {
        title: 'Impressos',
        tone: 'orange',
        icon: Printer,
        items: ['Cartaz', 'Cartão de visita', 'Cartão postal', 'Flyer', 'Folder', 'Marca-página', 'Papel timbrado'],
    },
];

const AllyoCanvaContent = () => (
    <div className="space-y-12">
        <section className="rounded-[18px] border border-indigo-100 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-6 dark:border-indigo-500/20 dark:from-cyan-950/20 dark:via-zinc-950 dark:to-violet-950/20 sm:p-8 lg:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
                <div>
                    <div className="flex flex-wrap gap-2"><Badge tone="violet" icon={Sparkles}>Sprint de excelência</Badge><Badge tone="blue" icon={Palette}>Canva</Badge></div>
                    <h2 className="mt-5 max-w-[690px] font-season text-[clamp(32px,4vw,48px)] leading-[1.05]">Padrão oficial de entrega da categoria Canva.</h2>
                    <p className="mt-5 max-w-[670px] text-sm leading-7 text-[#626875] dark:text-zinc-300">Mais velocidade, organização e consistência nas entregas, com regras claras para arquivos fechados, editáveis e compartilhamento.</p>
                </div>
                <div className="grid gap-[10px] sm:grid-cols-2">
                    <HeroPoint icon={Layers3}>Estrutura correta de arquivos e nomenclaturas</HeroPoint>
                    <HeroPoint icon={ShieldCheck}>Critérios mínimos de qualidade antes do envio</HeroPoint>
                    <HeroPoint icon={CheckCircle2}>Boas práticas para reduzir retrabalho</HeroPoint>
                    <HeroPoint icon={AlertTriangle}>Pontos críticos que geram erro ou atraso</HeroPoint>
                    <HeroPoint icon={Zap}>Agilidade sem perder excelência</HeroPoint>
                </div>
            </div>
        </section>

        <Section icon={Layers3} title="Entrega de arquivos Canva">
            <div className="grid gap-[10px] lg:grid-cols-2">
                <Panel>
                    <div className="flex items-start gap-3"><IconBox icon={FileImage} tone="mint" /><div><Badge tone="mint">Entrega fechada</Badge><h4 className="mt-2 text-sm font-semibold">Arquivos finais conforme o briefing</h4></div></div>
                    <p className="mt-5 text-xs leading-6 text-[#6a707b] dark:text-zinc-400">Suba todos os formatos solicitados na tarefa.</p>
                    <div className="mt-4 grid grid-cols-3 gap-2"><FormatCard icon={FileImage} label="JPG" tone="blue" /><FormatCard icon={FileImage} label="PNG" tone="violet" /><FormatCard icon={FileText} label="PDF" tone="rose" /></div>
                </Panel>
                <Panel>
                    <div className="flex items-start gap-3"><IconBox icon={Link2} tone="violet" /><div><Badge tone="violet">Entrega editável</Badge><h4 className="mt-2 text-sm font-semibold">PPT/DOC com link do Canva</h4></div></div>
                    <p className="mt-5 text-xs leading-6 text-[#6a707b] dark:text-zinc-400">No Canva, configure: <strong>Compartilhar → Qualquer pessoa com o link → Pode visualizar.</strong></p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3"><RuleChip icon={Eye} tone="mint">Apenas visualização</RuleChip><RuleChip icon={AlertTriangle} tone="rose">Sem edição direta</RuleChip><RuleChip icon={Copy} tone="blue">Cópia pelo cliente</RuleChip></div>
                </Panel>
            </div>
            <div className="mt-[10px] grid gap-[10px] lg:grid-cols-3">
                <TutorialCard number="01" title="Compartilhar design" caption="Abra o painel Compartilhar no Canva"><ShareMock /></TutorialCard>
                <TutorialCard number="02" title="Nível de acesso" caption="Defina Qualquer pessoa com o link → Pode visualizar"><PermissionMock /></TutorialCard>
                <TutorialCard number="03" title="Fazer uma cópia" caption="Com login, o cliente usa Arquivo → Fazer uma cópia"><CopyMock /></TutorialCard>
            </div>
        </Section>

        <Section icon={Maximize2} title="Redimensionar peças">
            <div className="grid gap-[10px] xl:grid-cols-[1fr_1fr_1.85fr]">
                <div className="grid gap-[10px] sm:grid-cols-2 xl:grid-cols-1">{resizeSteps.slice(0, 3).map((step, index) => <StepCard key={step[0]} number={index + 1} title={step[0]} description={step[1]} />)}</div>
                <div className="grid gap-[10px] sm:grid-cols-2 xl:grid-cols-1">{resizeSteps.slice(3).map((step, index) => <StepCard key={step[0]} number={index + 4} title={step[0]} description={step[1]} />)}<div className="rounded-[15px] border border-dashed border-violet-300 bg-violet-50/60 p-5 text-[10px] leading-5 text-[#696f7b] dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-zinc-400"><strong className="block text-xs text-violet-700 dark:text-violet-300">Preserve o original</strong><p className="mt-2">No botão principal, escolha copiar sempre que o trabalho precisar manter a versão atual disponível.</p></div></div>
                <ResizeMock />
            </div>
        </Section>

        <Section icon={Layers3} title="Itens que entregamos em Canva">
            <div className="grid gap-[10px] lg:grid-cols-3">{deliveryGroups.map((group) => <DeliveryGroup key={group.title} {...group} />)}</div>
        </Section>

        <section className={`rounded-[17px] border bg-white p-6 dark:bg-zinc-950 sm:p-8 ${ALLYO_BORDER}`}>
            <h3 className="font-season text-[27px]">Reforce o padrão de entrega</h3>
            <p className="mt-3 text-xs leading-6 text-[#676d79] dark:text-zinc-400">Assista à gravação da sprint e consulte a apresentação com o padrão oficial de entrega da categoria Canva.</p>
            <div className="mt-5 grid gap-[10px] md:grid-cols-2"><ResourceCard title="Gravação da sprint" label="Assistir conteúdo" /><ResourceCard title="Apresentação oficial" label="Consultar material" /></div>
        </section>
    </div>
);

const tone = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
    orange: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
    mint: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
};

const Section = ({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) => <section><div className="mb-6 flex items-center gap-2"><Icon size={17} className="text-[#717783] dark:text-zinc-400" /><h3 className="text-[17px] font-semibold">{title}</h3></div>{children}</section>;
const Panel = ({ children }: { children: ReactNode }) => <article className={`rounded-[17px] border bg-white p-5 shadow-sm dark:bg-zinc-950 sm:p-6 ${ALLYO_BORDER}`}>{children}</article>;
const Badge = ({ tone: color, icon: Icon, children }: { tone: keyof typeof tone; icon?: LucideIcon; children: ReactNode }) => <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[.04em] ${tone[color]}`}>{Icon && <Icon size={11} />}{children}</span>;
const IconBox = ({ icon: Icon, tone: color }: { icon: LucideIcon; tone: 'mint' | 'violet' }) => <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border ${tone[color]}`}><Icon size={18} /></span>;
const HeroPoint = ({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) => <div className="flex items-center gap-3 rounded-[14px] border border-black/7 bg-white/70 px-4 py-3 text-[10px] text-[#5f6570] dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-300"><Icon size={14} className="shrink-0 text-violet-500" />{children}</div>;
const FormatCard = ({ icon: Icon, label, tone: color }: { icon: LucideIcon; label: string; tone: 'blue' | 'violet' | 'rose' }) => <div className="flex min-h-20 flex-col items-center justify-center rounded-[14px] border border-[#e2e3e8] bg-[#fafafe] dark:border-zinc-700 dark:bg-zinc-900"><Icon size={15} className="text-[#777d87]" /><Badge tone={color}>{label}</Badge></div>;
const RuleChip = ({ icon: Icon, tone: color, children }: { icon: LucideIcon; tone: 'blue' | 'mint' | 'rose'; children: ReactNode }) => <span className="flex items-center gap-2 rounded-full border border-[#e2e3e8] px-3 py-2 text-[10px] text-[#646a75] dark:border-zinc-700 dark:text-zinc-400"><Icon size={13} className={color === 'rose' ? 'text-rose-500' : color === 'mint' ? 'text-emerald-500' : 'text-blue-500'} />{children}</span>;

const TutorialCard = ({ number, title, caption, children }: { number: string; title: string; caption: string; children: ReactNode }) => <article className={`overflow-hidden rounded-[17px] border bg-white shadow-sm dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="min-h-64 bg-[#f1f3f7] p-5 dark:bg-zinc-900">{children}</div><div className="border-t border-black/7 p-4 dark:border-white/10"><div className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-50 text-[9px] font-bold text-violet-600 dark:bg-violet-500/10">{number}</span><strong className="text-[10px] uppercase tracking-[.04em]">{title}</strong></div><p className="mt-2 text-[10px] text-[#717783] dark:text-zinc-500">{caption}</p></div></article>;

const ShareMock = () => <div className="mx-auto max-w-sm rounded-[15px] bg-white p-5 shadow-lg dark:bg-zinc-950"><div className="flex justify-between"><strong className="text-base">Compartilhar design</strong><span className="text-xs">⚙</span></div><span className="mt-6 block text-xs font-semibold">Pessoas com acesso</span><div className="mt-3 rounded-[10px] border border-[#dcdfe6] px-4 py-3 text-xs text-[#a1a5ad]">⌕ Adicione pessoas ou grupos</div><span className="mt-6 block text-xs font-semibold">Nível de acesso</span><div className="mt-3 flex items-center justify-between rounded-[10px] border border-[#e5e6ea] p-3 text-xs"><span>🌐 Qualquer pessoa com o link</span><span>Ver⌄</span></div></div>;
const PermissionMock = () => <div className="mx-auto max-w-xs rounded-[15px] bg-white p-4 shadow-lg dark:bg-zinc-950"><div className="h-10 rounded-[8px] bg-violet-500" /><div className="mt-4 overflow-hidden rounded-[10px] border border-[#e0e2e7] text-sm"><div className="p-3">Pode editar</div><div className="border-t border-[#e0e2e7] p-3">Pode comentar</div><div className="flex justify-between border-t border-[#e0e2e7] bg-[#eceef2] p-3 font-semibold dark:bg-zinc-800"><span>Pode visualizar</span><CheckCircle2 size={16} /></div></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-[9px] text-[#777d87]"><span>🔗<br />Link público</span><span>▣<br />Modelo</span><span>•••<br />Ver tudo</span></div></div>;
const CopyMock = () => <div className="mx-auto max-w-xs overflow-hidden rounded-[15px] bg-white shadow-lg dark:bg-zinc-950"><div className="p-5"><strong className="text-lg">59310-PROJETO-V1</strong><p className="mt-1 text-[10px] text-[#777d87]">E-mail · Equipe criativa</p></div><div className="border-t border-[#e1e3e8] p-4 text-xs">＋ Criar novo design</div><div className="border-t border-[#e1e3e8] p-4 text-xs">⚙ Configurações</div><div className="border-t border-[#e1e3e8] bg-[#f1f2f5] p-4 text-xs font-semibold dark:bg-zinc-800">▣ Fazer uma cópia</div><div className="border-t border-[#e1e3e8] p-4 text-xs"><Download size={14} className="mr-2 inline" />Baixar</div></div>;

const StepCard = ({ number, title, description }: { number: number; title: string; description: string }) => <article className={`rounded-[15px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-50 text-[9px] font-bold text-violet-600 dark:bg-violet-500/10">{String(number).padStart(2, '0')}</span><strong className="mt-4 block text-xs">{title}</strong><p className="mt-2 text-[10px] leading-5 text-[#747a85] dark:text-zinc-500">{description}</p></article>;
const ResizeMock = () => <article className={`overflow-hidden rounded-[17px] border bg-white shadow-sm dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3 border-b border-black/7 p-4 text-[10px] dark:border-white/10"><Badge tone="blue">Exemplo de uso</Badge><span className="text-[#737985]">Painel Redimensionar com sugestões</span></div><div className="bg-gradient-to-br from-cyan-500 to-violet-600 p-3"><div className="flex min-h-[420px] gap-3 rounded-[10px] bg-[#f7f7f9] p-3 dark:bg-zinc-900"><div className="w-[43%] rounded-[10px] bg-white p-3 shadow-md dark:bg-zinc-950"><strong className="text-[10px]">Redimensionar</strong><div className="mt-3 rounded-md border px-2 py-2 text-[8px] text-[#999da5]">Buscar formatos...</div>{['Story do Instagram', 'Post quadrado', 'Apresentação', 'Tamanho personalizado'].map((item) => <div key={item} className="mt-3 flex items-center gap-2 text-[8px]"><span className="h-3 w-3 rounded bg-violet-400" />{item}</div>)}<button className="mt-5 w-full rounded-md bg-violet-600 py-2 text-[8px] font-semibold text-white">Copiar e redimensionar</button></div><div className="flex flex-1 items-center justify-center"><div className="w-[78%] rounded-[8px] bg-[#f1dec3] p-5 text-[#713d4a] shadow-md"><span className="text-[9px] font-bold uppercase">Campanha</span><h4 className="mt-2 font-season text-[clamp(16px,2vw,26px)] leading-tight">Uma mensagem que se adapta a todos os formatos.</h4><div className="mt-5 h-28 rounded-[8px] bg-gradient-to-br from-[#e3a8b0] to-[#9b5d79]" /><span className="mt-5 block rounded-full bg-[#713d4a] px-3 py-2 text-center text-[8px] font-bold text-white">Saiba mais</span></div></div></div></div></article>;

const groupTone: Record<Tone, { badge: keyof typeof tone; icon: string; border: string }> = {
    blue: { badge: 'blue', icon: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300', border: 'border-blue-100 dark:border-blue-500/20' },
    violet: { badge: 'violet', icon: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300', border: 'border-violet-100 dark:border-violet-500/20' },
    orange: { badge: 'orange', icon: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300', border: 'border-orange-100 dark:border-orange-500/20' },
};
const DeliveryGroup = ({ title, tone: color, icon: Icon, items }: { title: string; tone: Tone; icon: LucideIcon; items: string[] }) => <article className={`rounded-[17px] border bg-white p-5 dark:bg-zinc-950 ${groupTone[color].border}`}><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-[11px] ${groupTone[color].icon}`}><Icon size={17} /></span><Badge tone={groupTone[color].badge}>{title}</Badge></div><ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{items.map((item) => <li key={item} className="flex items-center gap-2 rounded-full border border-[#e5e6ea] px-3 py-2 text-[10px] text-[#656b76] dark:border-zinc-700 dark:text-zinc-400"><CheckCircle2 size={12} className={color === 'orange' ? 'text-orange-500' : color === 'violet' ? 'text-violet-500' : 'text-blue-500'} />{item}</li>)}</ul>{color === 'orange' && <div className="mt-5 rounded-[13px] border border-orange-200 bg-orange-50/60 p-4 text-[10px] leading-5 text-[#76645a] dark:border-orange-500/25 dark:bg-orange-500/5 dark:text-orange-200"><strong>Somente quando:</strong><ul className="mt-2 space-y-2"><li>• Não exigir fechamento técnico para gráfica.</li><li>• O uso final for digital ou impressão simples/caseira.</li></ul></div>}</article>;
const ResourceCard = ({ title, label }: { title: string; label: string }) => <div className="overflow-hidden rounded-[15px] border border-indigo-200 bg-gradient-to-br from-[#303d9d] via-violet-600 to-fuchsia-400 p-5 text-white dark:border-indigo-500/30"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><Play size={17} className="fill-white" /></span><h4 className="mt-8 font-season text-[22px]">{title}</h4><span className="mt-2 inline-flex items-center gap-2 text-[10px] font-semibold">{label} →</span></div>;

export default AllyoCanvaContent;
