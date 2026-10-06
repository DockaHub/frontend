import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    Accessibility,
    BadgeCheck,
    BookOpen,
    Boxes,
    Brush,
    CheckCircle2,
    ChevronDown,
    ExternalLink,
    Eye,
    FileImage,
    GalleryHorizontalEnd,
    Grid2X2,
    Image,
    Images,
    Layers3,
    Lightbulb,
    MonitorSmartphone,
    Palette,
    PanelTop,
    PenTool,
    PlaySquare,
    Printer,
    ScanText,
    Shapes,
    ShieldCheck,
    Sparkles,
    Target,
    Type,
    UsersRound,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type Tone = 'blue' | 'violet' | 'mint' | 'orange';
type IdentityProduct = { title: string; focus: string; purpose: string; price: string; summary: string; uses: string[]; icon: LucideIcon; tone: Tone };
type GuideChapter = { number: number; title: string; description: string; items: string[]; purpose: string; icon: LucideIcon };

const operationalBenefits = [
    'Garantir coerência visual entre todas as peças',
    'Reduzir retrabalho e ajustes desnecessários',
    'Acelerar o tempo de produção',
    'Orientar clientes com mais segurança',
    'Padronizar processos internos',
];

const operationChallenges = [
    'Alto volume de entregas',
    'Múltiplos criativos na mesma conta',
    'Clientes sem identidade estruturada',
    'Prazos de produção definidos',
    'Alta expectativa de consistência',
];

const identityProducts: IdentityProduct[] = [
    {
        title: 'Style Guide', focus: 'Estratégico · longo prazo', purpose: 'Toda a comunicação da marca', price: '10 créditos até 5 capítulos + 2 por capítulo adicional', icon: BookOpen, tone: 'blue',
        summary: 'Manual que organiza e protege cores, tipografia, imagens, formas e aplicações para manter o sistema visual consistente ao longo do tempo.',
        uses: ['Marca sem identidade sólida', 'Rebranding', 'Eventos e projetos de grande porte', 'Padronização ampla da comunicação', 'Comunicação visual inconsistente'],
    },
    {
        title: 'Key Visual', focus: 'Tático · curto prazo', purpose: 'Campanhas e ações específicas', price: '5 créditos por conceito', icon: GalleryHorizontalEnd, tone: 'violet',
        summary: 'Aplicação visual principal que dá uma “cara” própria a um lançamento, campanha ou ativação e orienta todos os seus desdobramentos.',
        uses: ['Campanhas sazonais', 'Lançamentos', 'Ações institucionais', 'Ativações de marca', 'Projetos com muitos desdobramentos'],
    },
    {
        title: 'Conceito Visual', focus: 'Pontual · integrado ao stack', purpose: 'Uma peça ou pequeno grupo', price: '3 créditos por conceito', icon: Sparkles, tone: 'mint',
        summary: 'Criação conceitual com o mesmo peso criativo do Key Visual, mas custo reduzido por estar vinculada ao desdobramento imediato de ao menos uma entrega.',
        uses: ['Ausência de identidade definida', 'Nova direção sem sistema completo', 'Peças especiais ou únicas', 'Saída pontual do padrão da marca', 'Padronização mínima baseada em peças', 'Desdobramento imediato'],
    },
];

const guideChapters: GuideChapter[] = [
    { number: 1, title: 'Logotipo e assinaturas', icon: BadgeCheck, description: 'Define como a marca se apresenta em sua forma mais essencial.', items: ['Versões horizontal e vertical', 'Padronização do ícone', 'Versões positiva, negativa e especiais', 'Logotipo com slogan ou assinatura', 'Aplicações com clientes e parceiros', 'Margem de segurança e redução máxima'], purpose: 'Garantir consistência, legibilidade e integridade da marca em qualquer contexto.' },
    { number: 2, title: 'Tipografia', icon: Type, description: 'Organiza a comunicação verbal da marca no ambiente visual.', items: ['Tipografia primária e secundária', 'Tipografia para web', 'Hierarquia H1, H2, H3, subtítulos e corpo', 'Pesos, variações e usos corretos'], purpose: 'Assegurar leitura clara e coerência entre materiais físicos e digitais.' },
    { number: 3, title: 'Cores, paleta e gradientes', icon: Palette, description: 'Define o sistema cromático da marca.', items: ['Cores primárias e secundárias', 'Códigos Hex, RGB e CMYK', 'Gradientes lineares', 'Diretrizes de aplicação cromática'], purpose: 'Manter reconhecimento visual e harmonia entre todas as peças.' },
    { number: 4, title: 'Tabela de contraste', icon: Accessibility, description: 'Documento técnico de acessibilidade e legibilidade.', items: ['Combinações permitidas entre texto e fundo', 'Combinações proibidas', 'Aplicação para textos e formas'], purpose: 'Garantir leitura confortável, acessibilidade digital e boa performance visual.' },
    { number: 5, title: 'Formas de apoio e patterns', icon: Shapes, description: 'Elementos gráficos derivados da identidade.', items: ['Ícone como elemento gráfico', 'Patterns derivados do logotipo', 'Formas outline e expansões', 'Alinhamento e integridade visual'], purpose: 'Criar ritmo, reconhecimento e unidade nas composições.' },
    { number: 6, title: 'Iconografia', icon: Grid2X2, description: 'Estrutura o sistema de ícones da marca.', items: ['Traço, espessura e preenchimento', 'Ícones institucionais', 'Ícones para web e interfaces', 'Biblioteca oficial', 'Modos de uso incorretos'], purpose: 'Padronizar símbolos e facilitar a leitura em interfaces e materiais.' },
    { number: 7, title: 'Fotografia', icon: Image, description: 'Define o território visual fotográfico.', items: ['Imagens base', 'O que não fazer', 'Tratamento de imagem', 'Camadas escuras', 'Filtros e aplicações'], purpose: 'Manter consistência estética, autenticidade e qualidade das imagens.' },
    { number: 8, title: 'Ilustração', icon: PenTool, description: 'Orienta o uso de ilustrações na comunicação.', items: ['Estilo de ilustração', 'Uso interno e externo', 'Regras de cor e traço', 'Banco de imagens recomendado', 'Aplicações em comunicações'], purpose: 'Evitar conflito entre ilustrações e linguagem institucional.' },
    { number: 9, title: 'Papelaria e impressos', icon: Printer, description: 'Aplica a identidade aos materiais físicos.', items: ['Papelaria institucional', 'Composição de impressos', 'Hierarquia de informação em A4', 'Tipografia e grafismos físicos'], purpose: 'Padronizar a comunicação impressa e os materiais corporativos.' },
    { number: 10, title: 'Redes sociais', icon: Images, description: 'Estabelece regras para canais sociais dinâmicos.', items: ['Composição de posts', 'Hierarquia de textos', 'Aplicação de cores', 'Grafismos e patterns', 'Peças recorrentes'], purpose: 'Manter identidade forte em ambientes de alta rotatividade.' },
    { number: 11, title: 'Web e mobile', icon: MonitorSmartphone, description: 'Leva a identidade para ambientes digitais interativos.', items: ['Organização de interfaces', 'Composição web e mobile', 'Contraste mínimo', 'Uso de CTAs', 'Tipografia para UI'], purpose: 'Garantir consistência, usabilidade e acessibilidade em produtos digitais.' },
    { number: 12, title: 'Frames de vídeo', icon: PlaySquare, description: 'Padroniza conteúdos audiovisuais.', items: ['Molduras 9:16 e 16:9', 'Boxes de texto', 'Lettering', 'Marca d’água', 'Área segura', 'Finalização de vídeos'], purpose: 'Unificar institucionais, reels, stories, webinars e conteúdos educacionais.' },
    { number: 13, title: 'Aplicações da marca', icon: Boxes, description: 'Demonstra o sistema visual em situações reais.', items: ['Produtos físicos', 'Grafismos e fotografia', 'Gráficos e tabelas', 'Estilos de gráficos', 'Erros em gráficos e tabelas'], purpose: 'Traduzir as regras do guia em exemplos práticos de uso.' },
];

const selectionExamples = [
    { scenario: 'Evento anual da empresa', product: 'Style Guide', reason: 'Múltiplos desdobramentos recorrentes exigem uma identidade robusta e padronizada.' },
    { scenario: 'Campanha digital de lançamento', product: 'Key Visual', reason: 'Feed, stories, mídia paga, e-mails e banners precisam da mesma unidade.' },
    { scenario: 'Peça comemorativa ou institucional simples', product: 'Conceito Visual', reason: 'Criação pontual e rápida, sem padronização de longo prazo.' },
    { scenario: 'Rebranding de marca', product: 'Style Guide', reason: 'A identidade inteira precisa ser redefinida para todos os canais futuros.' },
    { scenario: 'Black Friday ou campanha sazonal', product: 'Key Visual', reason: 'Período específico, alto volume e forte identidade de impacto.' },
    { scenario: 'Lançamento de novo produto', product: 'Key Visual', reason: 'Cria identidade própria dentro da marca para peças promocionais e comerciais.' },
    { scenario: 'Material para feira ou stand', product: 'Style Guide ou Key Visual', reason: 'Use Guide se recorrente; KV quando a necessidade for pontual.' },
    { scenario: 'Campanha institucional de posicionamento', product: 'Key Visual', reason: 'A mensagem precisa de identidade forte aplicada em vários formatos.' },
    { scenario: 'Série contínua de posts educativos', product: 'Style Guide', reason: 'Mantém padrão ao longo do tempo, mesmo com criativos diferentes.' },
    { scenario: 'Peça especial fora do padrão', product: 'Conceito Visual', reason: 'Permite liberdade criativa pontual sem alterar o sistema da marca.' },
    { scenario: 'Novo projeto dentro de marca existente', product: 'Key Visual', reason: 'Dá identidade própria ao projeto sem romper com a marca principal.' },
];

const keyPoints = [
    'Style Guide, Key Visual e Conceito Visual atendem a objetivos diferentes.',
    'A identidade escolhida pelo cliente no fluxo da tarefa orienta todo o processo.',
    'O Conceito Visual tem peso criativo de Key Visual, com custo menor por integrar o stack.',
    'O time Faster orienta a escolha para garantir consistência e eficiência.',
    'Uma identidade forte reduz retrabalho e acelera as entregas.',
];

const AllyoVisualIdentityContent = () => (
    <div className="space-y-10">
        <section className="overflow-hidden rounded-[18px] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-rose-50 p-6 dark:border-violet-500/20 dark:from-violet-950/25 dark:via-zinc-950 dark:to-rose-950/20 sm:p-10">
            <div className="flex flex-wrap gap-2"><Badge tone="violet">Educacional</Badge><Badge tone="orange">Design de marca</Badge></div>
            <h2 className="mt-6 max-w-[900px] font-season text-[clamp(30px,4vw,48px)] leading-[1.08]">Um sistema visual que transforma presença em reconhecimento.</h2>
            <p className="mt-5 max-w-[980px] text-sm leading-7 text-[#625f6a] dark:text-zinc-300">Identidade visual é o conjunto organizado de elementos gráficos que constrói aparência, personalidade e reconhecimento. Ela mantém todas as peças coerentes, profissionais e conectadas à mesma marca em qualquer canal.</p>
            <div className="mt-8 grid gap-[10px] md:grid-cols-3"><SystemStep number="01" title="Identidade visual" text="É o sistema." icon={Palette} /><SystemStep number="02" title="Style Guide" text="Documenta e protege o sistema." icon={ShieldCheck} /><SystemStep number="03" title="KV ou Conceito" text="Aplica o sistema a uma campanha." icon={Sparkles} /></div>
        </section>

        <Section title="Por que isso é essencial na Faster" icon={Target} description="Em uma operação de alta demanda, consistência visual protege simultaneamente qualidade, produtividade e experiência do cliente.">
            <div className="grid gap-[10px] lg:grid-cols-2">
                <ListCard title="O que a identidade viabiliza" icon={CheckCircle2} items={operationalBenefits} tone="mint" />
                <ListCard title="Desafios da operação" icon={UsersRound} items={operationChallenges} tone="orange" />
            </div>
            <div className="mt-[10px] grid gap-[10px] sm:grid-cols-2 lg:grid-cols-4"><ImpactMetric value="Qualidade" text="Entregas visualmente coerentes" /><ImpactMetric value="Produtividade" text="Menos decisões repetidas" /><ImpactMetric value="Experiência" text="Mais confiança para o cliente" /><ImpactMetric value="Eficiência" text="Produção mais previsível" /></div>
        </Section>

        <Section title="Os três itens de identidade" icon={Layers3} description="Cada item possui função, escopo e momento de uso específicos. Todos pertencem à categoria Criação.">
            <div className="grid gap-[10px] xl:grid-cols-3">{identityProducts.map((product) => <ProductCard key={product.title} product={product} />)}</div>
        </Section>

        <section className="rounded-[18px] border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-violet-50 p-6 dark:border-blue-500/20 dark:from-blue-950/20 dark:via-zinc-950 dark:to-violet-950/20 sm:p-8">
            <div className="flex items-start gap-4"><IconBox icon={PanelTop} tone="blue" /><div><Badge tone="blue">Fluxo de solicitação</Badge><h3 className="mt-3 font-season text-[28px]">Escolha o caminho criativo do seu pedido</h3></div></div>
            <p className="mt-5 max-w-[1000px] text-xs leading-6 text-[#666a75] dark:text-zinc-400">Na abertura da tarefa, o cliente define se a peça seguirá uma referência ou identidade existente — Style Guide, Brand Book, Key Visual ou peça anterior — ou se precisa de uma criação conceitual antes do desdobramento.</p>
            <div className="mt-6 grid gap-[10px] lg:grid-cols-2"><ChoiceCard icon={Sparkles} title="Quero um novo conceito visual" text="Abre um stack composto pelo conceito visual e pela peça que será desdobrada." /><ChoiceCard icon={Eye} title="Seguir exatamente minhas referências" text="Usa uma identidade, guia, Key Visual ou peça existente como direção obrigatória." /></div>
        </section>

        <Section title="Identidade antes dos desdobramentos" icon={Brush} description="Campanhas, eventos, lançamentos e ações estratégicas precisam primeiro de uma base visual que dê unidade e direção às aplicações futuras.">
            <div className="grid gap-[10px] lg:grid-cols-2">
                <DecisionCard label="Sistema amplo e duradouro" title="Escolha Style Guide" text="Quando é preciso estruturar ou padronizar toda a identidade visual da marca para uso recorrente." tone="blue" />
                <DecisionCard label="Campanha ou ação específica" title="Escolha Key Visual" text="Quando a necessidade é construir uma identidade central para vários desdobramentos em um período ou projeto." tone="violet" />
            </div>
            <p className={`mt-[10px] rounded-[14px] border bg-white px-5 py-4 text-xs leading-6 text-[#656b70] dark:bg-zinc-950 dark:text-zinc-400 ${ALLYO_BORDER}`}>Essa etapa não entrega imediatamente uma peça funcional: ela constrói a “cara” da comunicação, reduz retrabalho e acelera toda a produção seguinte.</p>
        </Section>

        <Section title="Estrutura completa de um Style Guide" icon={BookOpen} description="O documento pode reunir treze frentes de diretrizes. A quantidade final depende do escopo contratado e das necessidades da marca.">
            <div className="grid gap-[10px] lg:grid-cols-2">{guideChapters.map((chapter, index) => <ChapterDetails key={chapter.number} chapter={chapter} open={index === 0} />)}</div>
        </Section>

        <Section title="Exemplos práticos de escolha" icon={Lightbulb} description="Use o horizonte de tempo, a quantidade de desdobramentos e a abrangência da mudança para indicar o item mais adequado.">
            <div className={`overflow-hidden rounded-[16px] border bg-white dark:bg-zinc-950 ${ALLYO_BORDER}`}>
                <div className="hidden grid-cols-[1fr_.7fr_1.5fr] gap-4 bg-[#f5f6f4] px-5 py-3 text-[9px] font-bold uppercase tracking-[.1em] text-[#7b8181] dark:bg-zinc-900 md:grid"><span>Cenário</span><span>Melhor item</span><span>Motivo</span></div>
                {selectionExamples.map((example) => <SelectionRow key={example.scenario} {...example} />)}
            </div>
        </Section>

        <section className="rounded-[18px] border border-emerald-200 bg-emerald-50/55 p-6 dark:border-emerald-500/20 dark:bg-emerald-500/5 sm:p-8">
            <div className="flex items-center gap-3"><IconBox icon={ScanText} tone="mint" /><h3 className="font-season text-[28px]">Pontos-chave para gravar</h3></div>
            <ul className="mt-6 grid gap-3 lg:grid-cols-2">{keyPoints.map((point) => <li key={point} className="flex items-start gap-3 rounded-[12px] border border-emerald-200 bg-white/65 p-4 text-xs leading-6 text-[#606964] dark:border-emerald-500/20 dark:bg-black/10 dark:text-zinc-400"><CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-300" />{point}</li>)}</ul>
        </section>

        <Section title="Exemplos de materiais" icon={FileImage}>
            <div className="grid gap-[10px] lg:grid-cols-2">
                <PortfolioLink title="Style Guides" description="Referências de sistemas visuais e manuais de marca." href="https://sites.google.com/fstr.co/portfolio-criahub/style-guides" tone="blue" />
                <PortfolioLink title="Key Visuals e conceitos criativos" description="Referências de campanhas e direções conceituais." href="https://sites.google.com/fstr.co/portfolio-criahub/key-visuals-e-conceito?authuser=0" tone="violet" />
            </div>
        </Section>
    </div>
);

const tone = {
    blue: { badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300', icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-500/25', surface: 'bg-blue-50/55 dark:bg-blue-500/5' },
    violet: { badge: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300', icon: 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-500/25', surface: 'bg-violet-50/55 dark:bg-violet-500/5' },
    mint: { badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300', icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/25', surface: 'bg-emerald-50/55 dark:bg-emerald-500/5' },
    orange: { badge: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300', icon: 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-500/25', surface: 'bg-orange-50/55 dark:bg-orange-500/5' },
};

const Section = ({ title, icon: Icon, description, children }: { title: string; icon: LucideIcon; description?: string; children: ReactNode }) => <section><div className="mb-5 flex items-center gap-2"><Icon size={17} className="text-violet-600 dark:text-violet-300" /><h3 className="font-season text-[24px]">{title}</h3></div>{description && <p className="-mt-3 mb-5 max-w-[1050px] text-xs leading-6 text-[#68666f] dark:text-zinc-400">{description}</p>}{children}</section>;
const Badge = ({ tone: color, children }: { tone: Tone; children: ReactNode }) => <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${tone[color].badge}`}>{children}</span>;
const IconBox = ({ icon: Icon, tone: color }: { icon: LucideIcon; tone: Tone }) => <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${tone[color].icon}`}><Icon size={18} /></span>;
const SystemStep = ({ number, title, text, icon: Icon }: { number: string; title: string; text: string; icon: LucideIcon }) => <article className={`rounded-[14px] border bg-white/70 p-5 dark:bg-black/10 ${ALLYO_BORDER}`}><div className="flex items-center justify-between"><IconBox icon={Icon} tone="violet" /><span className="font-mono text-[10px] text-[#97929c]">{number}</span></div><strong className="mt-4 block text-sm">{title}</strong><p className="mt-2 text-[11px] leading-5 text-[#6d6972] dark:text-zinc-400">{text}</p></article>;
const ListCard = ({ title, icon: Icon, items, tone: color }: { title: string; icon: LucideIcon; items: string[]; tone: Tone }) => <article className={`rounded-[16px] border p-6 ${tone[color].border} ${tone[color].surface}`}><div className="flex items-center gap-3"><IconBox icon={Icon} tone={color} /><h4 className="font-season text-[22px]">{title}</h4></div><ul className="mt-5 space-y-2.5">{items.map((item) => <li key={item} className="flex items-start gap-2.5 text-xs leading-6 text-[#656a6d] dark:text-zinc-400"><CheckCircle2 size={14} className="mt-1 shrink-0 text-emerald-600 dark:text-emerald-300" />{item}</li>)}</ul></article>;
const ImpactMetric = ({ value, text }: { value: string; text: string }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><strong className="font-season text-xl font-normal text-violet-700 dark:text-violet-300">{value}</strong><p className="mt-2 text-[11px] leading-5 text-[#747176] dark:text-zinc-400">{text}</p></article>;

const ProductCard = ({ product }: { product: IdentityProduct }) => <article className={`flex h-full flex-col rounded-[17px] border p-6 ${tone[product.tone].border} ${tone[product.tone].surface}`}><div className="flex items-center justify-between gap-3"><IconBox icon={product.icon} tone={product.tone} /><Badge tone={product.tone}>Criação</Badge></div><h4 className="mt-5 font-season text-[27px]">{product.title}</h4><p className="mt-3 text-xs leading-6 text-[#62676d] dark:text-zinc-400">{product.summary}</p><div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><SmallMetric label="Foco" value={product.focus} /><SmallMetric label="Serve para" value={product.purpose} /></div><div className={`mt-4 rounded-[12px] border bg-white/60 p-4 dark:bg-black/10 ${ALLYO_BORDER}`}><span className="text-[9px] font-bold uppercase tracking-[.1em] text-[#7f848c]">Produção original</span><strong className="mt-2 block text-xs leading-5">{product.price}</strong></div><div className="mt-5 flex-1"><strong className="text-xs">Quando utilizar</strong><BulletList items={product.uses} /></div></article>;
const SmallMetric = ({ label, value }: { label: string; value: string }) => <div className={`rounded-[11px] border bg-white/55 p-3 dark:bg-black/10 ${ALLYO_BORDER}`}><span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#858991]">{label}</span><strong className="mt-1 block text-[11px] leading-5">{value}</strong></div>;
const BulletList = ({ items }: { items: string[] }) => <ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#666b70] dark:text-zinc-400"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-500" />{item}</li>)}</ul>;
const ChoiceCard = ({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) => <article className={`rounded-[15px] border bg-white/70 p-5 dark:bg-black/10 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><IconBox icon={Icon} tone="blue" /><h4 className="text-sm font-semibold">{title}</h4></div><p className="mt-4 text-xs leading-6 text-[#666b75] dark:text-zinc-400">{text}</p></article>;
const DecisionCard = ({ label, title, text, tone: color }: { label: string; title: string; text: string; tone: Tone }) => <article className={`rounded-[16px] border p-6 ${tone[color].border} ${tone[color].surface}`}><Badge tone={color}>{label}</Badge><h4 className="mt-5 font-season text-[25px]">{title}</h4><p className="mt-3 text-xs leading-6 text-[#646970] dark:text-zinc-400">{text}</p></article>;

const ChapterDetails = ({ chapter, open }: { chapter: GuideChapter; open: boolean }) => <details open={open} className={`group rounded-[16px] border bg-white dark:bg-zinc-950 ${ALLYO_BORDER}`}><summary className="flex cursor-pointer list-none items-center gap-4 p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-violet-50 font-mono text-[10px] font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{String(chapter.number).padStart(2, '0')}</span><chapter.icon size={17} className="shrink-0 text-violet-600 dark:text-violet-300" /><div className="min-w-0 flex-1"><h4 className="text-sm font-semibold">{chapter.title}</h4><p className="mt-1 line-clamp-1 text-[11px] text-[#74717a] dark:text-zinc-500">{chapter.description}</p></div><ChevronDown size={17} className="shrink-0 text-[#929099] transition group-open:rotate-180" /></summary><div className="border-t border-black/8 px-5 pb-5 pt-4 dark:border-white/10"><p className="text-xs leading-6 text-[#666a72] dark:text-zinc-400">{chapter.description}</p><BulletList items={chapter.items} /><p className="mt-4 rounded-[10px] bg-[#f6f5f8] px-4 py-3 text-[11px] leading-5 text-[#68656d] dark:bg-zinc-900 dark:text-zinc-400"><strong className="text-black dark:text-white">Função no guia:</strong> {chapter.purpose}</p></div></details>;
const SelectionRow = ({ scenario, product, reason }: { scenario: string; product: string; reason: string }) => <article className="grid gap-2 border-t border-black/8 px-5 py-4 first:border-0 dark:border-white/10 md:grid-cols-[1fr_.7fr_1.5fr] md:gap-4"><div><span className="text-[9px] font-bold uppercase text-[#929696] md:hidden">Cenário</span><strong className="mt-1 block text-xs">{scenario}</strong></div><div><span className="text-[9px] font-bold uppercase text-[#929696] md:hidden">Melhor item</span><Badge tone={product.includes('Style') ? 'blue' : product.includes('Key') ? 'violet' : 'mint'}>{product}</Badge></div><div><span className="text-[9px] font-bold uppercase text-[#929696] md:hidden">Motivo</span><p className="mt-1 text-[11px] leading-5 text-[#696e70] dark:text-zinc-400">{reason}</p></div></article>;
const PortfolioLink = ({ title, description, href, tone: color }: { title: string; description: string; href: string; tone: Tone }) => <a href={href} target="_blank" rel="noreferrer" className={`group flex items-center gap-4 rounded-[16px] border p-6 transition hover:-translate-y-0.5 hover:shadow-sm ${tone[color].border} ${tone[color].surface}`}><IconBox icon={FileImage} tone={color} /><span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-[11px] leading-5 text-[#6c7075] dark:text-zinc-400">{description}</span></span><ExternalLink size={17} className="shrink-0 text-[#979b9f] transition group-hover:text-violet-600" /></a>;

export default AllyoVisualIdentityContent;
