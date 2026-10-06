import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    FileText,
    FolderOpen,
    GitBranch,
    Image,
    Images,
    Link2,
    Megaphone,
    Palette,
    Shapes,
    Sparkles,
    Star,
    Type,
    Upload,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

const kitItems: { title: string; description: string; actions: string[]; icon: LucideIcon }[] = [
    { title: 'Logotipo', description: 'Variações coloridas, brancas, pretas e outline em .AI, .SVG e .PNG.', actions: ['Upload de logotipo', 'Adicionar diretrizes'], icon: Shapes },
    { title: 'Cores', description: 'Paletas primárias e secundárias com HEX/CMYK e indicação de uso.', actions: ['Adicionar paleta de cor', 'Adicionar diretrizes'], icon: Palette },
    { title: 'Fontes', description: 'Famílias tipográficas principal e secundária em .OTF/.TTF prontas para instalar.', actions: ['Fazer upload de fonte', 'Adicionar diretrizes'], icon: Type },
    { title: 'Tom de voz', description: 'Palavras-chave, persona e estilo de escrita da marca.', actions: ['Adicionar tom de voz'], icon: Megaphone },
    { title: 'Fotos', description: 'Banco de imagens autorais ou licenciadas alinhadas à estética.', actions: ['Upload de fotos', 'Adicionar diretrizes'], icon: Images },
    { title: 'Elementos gráficos', description: 'Patterns, texturas, ilustrações e formas oficiais da marca.', actions: ['Upload de elementos gráficos', 'Adicionar diretrizes'], icon: Shapes },
    { title: 'Ícones', description: 'Set de ícones proprietário ou curado, preferencialmente vetorial.', actions: ['Upload de ícones', 'Adicionar diretrizes'], icon: Star },
    { title: 'Uploads diversos', description: 'Guia visual, KVs, peças de referência e templates editáveis.', actions: ['Upload de arquivos', 'Adicionar diretrizes'], icon: FolderOpen },
];

const checklist = [
    'Logos em boa resolução e em todas as variações',
    'Paleta descrita de forma clara e completa',
    'Fontes avulsas e em .zip por família',
    'Exemplos visuais coerentes com o posicionamento atual',
    'Orientação textual sobre tom de voz',
    'Arquivos organizados para todo o time',
    'Guia visual, KVs e peças de referência em Uploads diversos',
];

const creativeDirection = [
    ['Instruções exclusivas', 'Como representar a marca visual e verbalmente, com exemplos práticos.', Sparkles],
    ['Links de recursos', 'Site, redes sociais, manuais e guidelines oficiais da marca.', Link2],
    ['Referências e exemplos', 'Campanhas anteriores, animações e materiais que alinham o time.', Image],
    ['Padronização e nomenclatura', 'Regras para nomear arquivos e identificar tarefas.', FileText],
] as const;

const usageFlow = [
    ['Consultar o Manual de Marca', 'Entenda regras, diretrizes e usos corretos antes de produzir.'],
    ['Abrir o Brand Kit', 'Baixe os assets editáveis necessários para a peça.'],
    ['Produzir respeitando o manual', 'Aplique cor, tipografia e elementos segundo o padrão.'],
    ['Versionar no repositório', 'Salve a entrega para garantir rastreabilidade.'],
];

const AllyoBrandKitContent = () => (
    <div className="space-y-12">
        <section className="overflow-hidden rounded-[18px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-[#fafaff] dark:border-indigo-500/20 dark:from-indigo-950/25 dark:via-zinc-950 dark:to-zinc-900">
            <div className="grid items-stretch lg:grid-cols-[1.05fr_.95fr]">
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                    <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.14em] text-indigo-600 dark:text-indigo-300"><Shapes size={13} /> Plataforma Faster · Identidade</span>
                    <h2 className="mt-5 font-season text-[clamp(32px,4vw,48px)] leading-[1.05]">A identidade certa, disponível para todo o time.</h2>
                    <p className="mt-5 max-w-[690px] text-sm leading-7 text-[#626875] dark:text-zinc-300">O manual de marca é essencial para garantir consistência e coerência nas entregas criativas. Um Brand Kit bem estruturado mantém a identidade visual e a estratégia da marca, evitando erros e retrabalho.</p>
                </div>
                <BrandKitPreview />
            </div>
        </section>

        <Section title="O que um Brand Kit deve conter" description="Estrutura espelhada na área de Brand Kit dentro da plataforma.">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">{kitItems.map((item) => <KitCard key={item.title} {...item} />)}</div>
        </Section>

        <div className="grid gap-[10px] lg:grid-cols-2">
            <Panel>
                <Eyebrow icon={FileText}>Documento de referência</Eyebrow><h3 className="mt-4 text-lg font-semibold">Manual de Marca (PDF)</h3><p className="mt-3 text-xs leading-6 text-[#676d79] dark:text-zinc-400">Documento fechado com diretrizes completas de identidade: logotipos, cores, tipografia, tom de voz e exemplos de aplicação.</p><BulletList items={['Regras de uso visuais e descritivas', 'Referência oficial, sem edição direta', 'Consulta antes de qualquer produção']} />
            </Panel>
            <Panel>
                <Eyebrow icon={Shapes}>Assets editáveis</Eyebrow><h3 className="mt-4 text-lg font-semibold">Brand Kit (Arquivos)</h3><p className="mt-3 text-xs leading-6 text-[#676d79] dark:text-zinc-400">Pasta ou repositório com arquivos-fonte prontos para produção criativa.</p><div className="mt-5 flex flex-wrap gap-2">{['AI', 'EPS', 'SVG', 'PSD', 'ASE', 'ACO', 'OTF', 'TTF', 'PNG'].map((format) => <span key={format} className="rounded-full border border-[#dfe1e7] bg-[#f7f8fa] px-2.5 py-1 text-[9px] text-[#59606c] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">{format}</span>)}</div>
            </Panel>
        </div>

        <div className="grid gap-[10px] xl:grid-cols-[1.15fr_.85fr]">
            <Panel>
                <Eyebrow icon={CheckCircle2}>Checklist de revisão</Eyebrow><h3 className="mt-4 text-lg font-semibold">Antes de validar o Brand Kit</h3><div className="mt-5 grid gap-[10px] md:grid-cols-2">{checklist.map((item) => <CheckItem key={item}>{item}</CheckItem>)}</div>
            </Panel>
            <Panel>
                <Eyebrow icon={GitBranch}>Responsabilidades</Eyebrow><h3 className="mt-4 text-lg font-semibold">Quem atualiza</h3><div className="mt-5 space-y-2"><Role role="AD/CQS">Garante que o kit esteja completo, atualizado e disponível nos canais corretos.</Role><Role role="CAM">Sinaliza mudanças na estratégia ou identidade visual da marca.</Role><Role role="CAS">Apoia a organização e o upload dos arquivos na plataforma e no repositório.</Role></div>
            </Panel>
        </div>

        <Section eyebrow="Aliado ao Brand Kit" title="Direção Criativa" description="Complementa o Brand Kit com informações específicas da marca, garantindo que todos sigam as diretrizes estabelecidas pelo cliente.">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">{creativeDirection.map(([title, description, Icon]) => <article key={title} className={`rounded-[16px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><Icon size={16} className="text-indigo-500" /><strong className="mt-4 block text-xs">{title}</strong><p className="mt-2 text-[10px] leading-5 text-[#707682] dark:text-zinc-500">{description}</p></article>)}</div>
            <div className={`mt-[10px] grid gap-8 rounded-[17px] border bg-white p-5 dark:bg-zinc-950 lg:grid-cols-[1fr_auto_1fr] lg:items-center ${ALLYO_BORDER}`}>
                <DirectionStep number="01" title="Cadastro na ficha do cliente" description="O time preenche o campo Direção Criativa no cadastro do cliente."><DirectionInput /></DirectionStep>
                <ArrowRight className="hidden text-indigo-500 lg:block" />
                <DirectionStep number="02" title="Dica em cada tarefa" description="O conteúdo aparece automaticamente como orientação nas tarefas criadas."><DirectionTip /></DirectionStep>
            </div>
        </Section>

        <Section eyebrow="Fluxo de utilização" title="Como o time usa no dia a dia">
            <div className="grid gap-[10px] lg:grid-cols-4">{usageFlow.map(([title, description], index) => <article key={title} className={`relative rounded-[17px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="text-[9px] font-bold text-indigo-500">{String(index + 1).padStart(2, '0')}</span><strong className="mt-4 block text-xs">{title}</strong><p className="mt-3 text-[10px] leading-5 text-[#6f7580] dark:text-zinc-500">{description}</p>{index < usageFlow.length - 1 && <ArrowRight size={15} className="absolute -right-[13px] top-1/2 z-10 hidden text-[#c9cbd2] lg:block" />}</article>)}</div>
        </Section>

        <Section eyebrow="Desdobramentos" title="O Brand Kit alimenta outras áreas" description="O preenchimento correto melhora a experiência de diferentes recursos da plataforma.">
            <div className="grid gap-[10px] lg:grid-cols-3"><IntegrationCard type="tasks" title="Tarefas">Logos, cores, fontes e arquivos aparecem no painel da tarefa, prontos para consulta e download.</IntegrationCard><IntegrationCard type="image" title="Gerador de imagens com IA">A criação carrega as informações do Brand Kit para gerar imagens coerentes com a identidade do cliente.</IntegrationCard><IntegrationCard type="agent" title="Designer Agent">O agente consulta o guia de marca como base para editar e gerar novas versões.</IntegrationCard></div>
        </Section>

        <div className="flex items-start gap-3 rounded-[16px] border border-orange-200 bg-orange-50/60 p-5 text-xs leading-6 text-[#765f4d] dark:border-orange-500/25 dark:bg-orange-500/5 dark:text-orange-200"><AlertTriangle size={16} className="mt-1 shrink-0 text-orange-500" /><div><strong className="text-black dark:text-orange-100">Brand Kit incompleto = retrabalho</strong><p className="mt-1">Ao detectar cores sem código, fontes ausentes ou falta de orientação de tom de voz, acione o CAM responsável antes de iniciar a produção.</p></div></div>
    </div>
);

const Section = ({ title, description, eyebrow, children }: { title: string; description?: string; eyebrow?: string; children: ReactNode }) => <section>{eyebrow && <span className="text-[9px] font-bold uppercase tracking-[.16em] text-indigo-500">{eyebrow}</span>}<h3 className={`${eyebrow ? 'mt-2' : ''} text-[20px] font-semibold`}>{title}</h3>{description && <p className="mb-6 mt-2 text-xs leading-5 text-[#6d737e] dark:text-zinc-400">{description}</p>}{!description && <div className="mb-6" />}{children}</section>;
const Panel = ({ children }: { children: ReactNode }) => <article className={`rounded-[17px] border bg-white p-5 shadow-sm dark:bg-zinc-950 sm:p-6 ${ALLYO_BORDER}`}>{children}</article>;
const Eyebrow = ({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) => <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.1em] text-[#68707d]"><Icon size={12} />{children}</span>;

const BrandKitPreview = () => <div className="min-h-[360px] border-l border-black/6 bg-white p-5 dark:border-white/10 dark:bg-zinc-950"><div className="flex items-center justify-between"><strong className="text-xs">Brand Kit</strong><span className="rounded-md bg-indigo-500 px-3 py-1.5 text-[8px] text-white">+ Adicionar</span></div><div className="mt-5 rounded-[10px] border border-[#e4e6eb] p-3"><span className="text-[8px] font-semibold">Logotipo</span><div className="mt-3 grid grid-cols-4 gap-2">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="flex h-14 items-center justify-center rounded-md bg-[#f7f8fa] text-[9px] font-bold text-emerald-700 dark:bg-zinc-900">marca</div>)}</div></div><div className="mt-3 rounded-[10px] border border-[#e4e6eb] p-3"><span className="text-[8px] font-semibold">Cores</span><div className="mt-3 flex flex-wrap gap-2">{['#B9D94A', '#008761', '#005E58', '#FFEF74', '#FF8B00', '#FF395E', '#9C287E', '#6940C1', '#126DC5', '#23A9E0'].map((color) => <span key={color} className="h-10 w-10 rounded-md border border-black/5" style={{ backgroundColor: color }} />)}</div></div></div>;
const KitCard = ({ title, description, actions, icon: Icon }: { title: string; description: string; actions: string[]; icon: LucideIcon }) => <article className={`rounded-[17px] border bg-white p-4 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10"><Icon size={16} /></span><strong className="mt-4 block text-xs">{title}</strong><p className="mt-2 min-h-10 text-[10px] leading-5 text-[#6e7480] dark:text-zinc-500">{description}</p><div className="my-3 border-t border-black/7 dark:border-white/10" /><span className="text-[8px] font-bold uppercase tracking-[.08em] text-[#8a8f99]">Opções de adicionar</span><ul className="mt-2 space-y-1.5">{actions.map((action) => <li key={action} className="flex items-center gap-2 text-[9px] text-[#666c77] dark:text-zinc-400"><Upload size={10} className="text-indigo-500" />{action}</li>)}</ul></article>;
const BulletList = ({ items }: { items: string[] }) => <ul className="mt-5 space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2 text-xs text-[#626874] dark:text-zinc-400"><span className="text-indigo-500">•</span>{item}</li>)}</ul>;
const CheckItem = ({ children }: { children: ReactNode }) => <div className="flex items-start gap-2 rounded-[12px] border border-[#e3e4e9] bg-[#fafafe] px-3 py-3 text-[10px] leading-5 text-[#616773] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-indigo-500" />{children}</div>;
const Role = ({ role, children }: { role: string; children: ReactNode }) => <div className="rounded-[13px] border border-[#e3e4e9] bg-[#fafafe] p-4 dark:border-zinc-700 dark:bg-zinc-900"><strong className="text-xs text-indigo-600 dark:text-indigo-300">{role}</strong><p className="mt-2 text-[10px] leading-5 text-[#666c77] dark:text-zinc-400">{children}</p></div>;
const DirectionStep = ({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) => <div><div className="flex items-start gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-indigo-300 bg-indigo-50 text-[9px] text-indigo-600 dark:bg-indigo-500/10">{number}</span><div><strong className="text-xs">{title}</strong><p className="mt-1 text-[10px] text-[#737985] dark:text-zinc-500">{description}</p></div></div><div className="mt-4">{children}</div></div>;
const DirectionInput = () => <div className="rounded-[13px] border border-[#e1e3e8] bg-[#fafafe] p-5 dark:border-zinc-700 dark:bg-zinc-900"><strong className="text-lg">Direção criativa ⓘ</strong><div className="mt-3 rounded-[10px] border border-[#dfe1e6] bg-white p-4 text-[10px] leading-5 text-blue-600 dark:bg-zinc-950">Site: https://marca.com.br/<br />Instagram: @marca<br />Guia de uso do logo e referências</div></div>;
const DirectionTip = () => <div className="rounded-[13px] border-2 border-indigo-400 bg-[#fafafe] p-5 dark:bg-zinc-900"><strong className="text-xs">Dicas de direção criativa</strong><p className="mt-3 text-[9px] leading-5 text-[#6b7180] dark:text-zinc-400">Links de marca, referências visuais, uso correto do logo e orientações específicas para a entrega.</p></div>;

const IntegrationCard = ({ type, title, children }: { type: 'tasks' | 'image' | 'agent'; title: string; children: ReactNode }) => <article className={`overflow-hidden rounded-[17px] border bg-white dark:bg-zinc-950 ${ALLYO_BORDER}`}><IntegrationVisual type={type} /><div className="p-5"><strong className="text-sm">{title}</strong><p className="mt-2 text-[10px] leading-5 text-[#6a707c] dark:text-zinc-500">{children}</p></div></article>;
const IntegrationVisual = ({ type }: { type: 'tasks' | 'image' | 'agent' }) => <div className="min-h-44 bg-[#f1f3f7] p-4 dark:bg-zinc-900">{type === 'tasks' && <div className="mx-auto max-w-xs rounded-[12px] bg-white p-4 shadow-sm dark:bg-zinc-950"><strong className="text-[10px]">Brand Kit da tarefa</strong>{['Logotipo', 'Cores', 'Fontes', 'Arquivos'].map((item) => <div key={item} className="mt-2 flex justify-between rounded-md bg-[#f6f7f9] px-3 py-2 text-[8px] dark:bg-zinc-900"><span>{item}</span><span className="text-indigo-500">Baixar</span></div>)}</div>}{type === 'image' && <div className="grid h-36 grid-cols-[.65fr_1fr] gap-3 rounded-[12px] bg-white p-3 shadow-sm dark:bg-zinc-950"><div className="rounded-md border border-[#e1e3e8] p-2 text-[8px]">Gerar imagem<br /><span className="mt-2 block text-[#888d97]">Estilo da marca</span></div><div className="grid grid-cols-3 gap-2">{Array.from({ length: 6 }).map((_, i) => <span key={i} className="rounded-md bg-gradient-to-br from-violet-300 to-orange-200" />)}</div></div>}{type === 'agent' && <div className="flex h-36 items-center justify-end rounded-[12px] bg-gradient-to-br from-[#312f37] to-[#111]"><div className="mr-3 w-44 rounded-[12px] bg-white p-4 text-[9px] shadow-lg dark:bg-zinc-950"><span className="font-semibold">Editar com IA</span><div className="mt-5 flex items-center gap-2 text-indigo-600"><Sparkles size={13} />Consultando o guia de marca...</div></div></div>}</div>;

export default AllyoBrandKitContent;
