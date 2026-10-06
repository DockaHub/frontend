import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    Archive,
    ArrowRight,
    Captions,
    CheckCircle2,
    ChevronDown,
    Clapperboard,
    Clock3,
    FileArchive,
    FileVideo2,
    Film,
    FolderTree,
    Gauge,
    Image,
    Layers3,
    Lightbulb,
    MessageSquareText,
    MonitorPlay,
    Palette,
    PlayCircle,
    RefreshCw,
    ScanText,
    Sparkles,
    Target,
    Type,
    UsersRound,
    Video,
    WandSparkles,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type Tone = 'blue' | 'violet' | 'mint' | 'orange' | 'rose';
type VideoType = { title: string; summary: string; components: string[]; benefits: string[]; examples: string[]; icon: LucideIcon; tone: Tone };

const strategicSteps = [
    {
        number: '01', title: 'Papel estratégico do time de excelência', icon: UsersRound,
        text: 'CAM e CAS traduzem o objetivo do cliente em uma narrativa audiovisual coerente, orientando briefing, roteiro, trilha e formato final. A postura deve ser consultiva, com clareza sobre o impacto das escolhas em prazo, créditos e performance.',
        note: 'O cliente precisa sentir que o time domina o processo com clareza, segurança e embasamento.',
    },
    {
        number: '02', title: 'Alinhamento de propósito e formato', icon: Target,
        text: 'Antes de discutir “reel”, “motion” ou “animação”, entenda para que o vídeo será usado e qual comportamento deve gerar.',
        items: ['O vídeo busca informar, inspirar ou converter?', 'Onde será publicado e qual é a duração ideal para o canal?', 'O público já conhece a mensagem ou é algo novo?', 'Há referências visuais que reforçam a identidade da marca?'],
    },
    {
        number: '03', title: 'Tempo e complexidade', icon: Clock3,
        text: 'Motion design, captação, animação, trilha, legendas e revisões alteram diretamente o cronograma e o consumo de créditos. Eduque sem burocratizar, usando um tom colaborativo.',
        quote: 'Como esse vídeo tem animação de personagens e locução, sugerimos prazos mais amplos para aprovação, garantindo a qualidade visual e sonora esperada.',
    },
    {
        number: '04', title: 'Roteiro como pilar central', icon: ScanText,
        text: 'O roteiro define ritmo, tom e estrutura da narrativa. Oriente a validação de conteúdo e clareza antes de iniciar discussões visuais.',
        quote: 'Vamos aprovar primeiro o roteiro para garantir que a mensagem esteja sólida antes de entrarmos na etapa visual. Isso mantém o ritmo e evita retrabalho.',
    },
    {
        number: '05', title: 'Expectativa e papel das versões', icon: Layers3,
        text: 'O refinamento é gradual e cada entrega possui uma função. Explique claramente o que deve ser validado em cada versão.',
        quote: 'Nessa primeira versão, nosso foco é validar ritmo e narrativa. Na próxima, refinamos os elementos visuais e finalizamos legendas e trilha.',
    },
    {
        number: '06', title: 'Direcionamento visual', icon: Palette,
        text: 'Mantenha consistência entre produções ativas para aumentar reconhecimento de marca e percepção de profissionalismo.',
        items: ['Paleta de cores e tipografia alinhadas ao Brand Kit', 'Elementos recorrentes: ícones, transições e texturas', 'Tom de voz visual coerente com a narrativa'],
    },
    {
        number: '07', title: 'Revisão, fechamento e valor', icon: CheckCircle2,
        text: 'Na entrega final, reconecte o resultado ao objetivo inicial e mostre como as escolhas criativas serviram à estratégia.',
        quote: 'Aqui está o vídeo final! Mantivemos o foco na mensagem central e exploramos transições suaves para reforçar o tom institucional definido no início.',
    },
    {
        number: '08', title: 'Postura consultiva contínua', icon: Lightbulb,
        text: 'Sugira melhorias, formatos alternativos e desdobramentos possíveis, como reels curtos derivados de um institucional. A orientação estratégica transforma produção operacional em parceria criativa.',
    },
];

const summaryPillars = [
    ['Propósito', 'Entender o porquê do vídeo e sua aderência à estratégia de marca.'],
    ['Expectativas', 'Educar sobre processo e prazos para evitar retrabalho.'],
    ['Narrativa', 'Estruturar uma mensagem clara para guiar roteiro e edição.'],
    ['Consistência visual', 'Manter identidade unificada e reconhecimento de marca.'],
    ['Comunicação final', 'Reforçar valor estratégico, confiança e autoridade.'],
];

const videoTypes: VideoType[] = [
    {
        title: 'Edição de vídeo', icon: Film, tone: 'blue',
        summary: 'Para filmagens prontas — tours, eventos, depoimentos ou materiais institucionais — que precisam de tratamento técnico e criativo para um resultado mais polido.',
        components: ['Cortes e ajustes de ritmo e narrativa', 'Legendas, textos e pequenas cartelas', 'Correção de cor e iluminação', 'Transições e efeitos visuais', 'Trilha sonora e efeitos sonoros'],
        benefits: ['Polimento profissional', 'Aprimoramento visual', 'Flexibilidade entre tipos de filmagem'],
        examples: ['Tour de empreendimento', 'GC e legendas em depoimentos', 'Redução de ruído e ajustes de luz', 'Vídeos gravados com edição rápida', 'Inserção de vinhetas, GCs e animações prontas'],
    },
    {
        title: 'Edição de vídeo Lite', icon: Gauge, tone: 'mint',
        summary: 'Serviço simplificado e ágil para filmagens prontas que precisam de otimização linear, especialmente conteúdos rápidos para redes sociais.',
        components: ['Cortes lineares e ajustes de fluidez', 'Legendas e inserções simples', 'Correção leve de cor e iluminação', 'Cortes secos ou transições simples', 'Trilha e efeitos sonoros leves'],
        benefits: ['Agilidade', 'Custo otimizado', 'Adequação a reels, stories e depoimentos'],
        examples: ['Trechos de palestras ou eventos', 'Depoimentos e bastidores', 'Recortes de vídeos longos', 'Montagens institucionais simples'],
    },
    {
        title: 'Animação', icon: WandSparkles, tone: 'violet',
        summary: 'Criação digital do zero com gráficos e textos em movimento. Exige storyboard detalhado e arquivos preparados para animação profissional.',
        components: ['Criação do vídeo sem filmagem prévia', 'Elementos gráficos e textos animados', 'Storyboard editável e vetorial em Photoshop ou Illustrator', 'Compatibilidade com After Effects'],
        benefits: ['Liberdade criativa', 'Maior potencial de engajamento', 'Acabamento visual profissional'],
        examples: ['Peças animadas para redes sociais', 'Convites digitais', 'Infográficos explicativos', 'Institucionais com gráficos e textos animados'],
    },
    {
        title: 'GIF', icon: RefreshCw, tone: 'orange',
        summary: 'Imagem animada em repetição contínua, compacta, leve e sem som, criada para captar atenção rapidamente.',
        components: ['Animação simples com poucos quadros', 'Repetição contínua e sem som', 'Uso frequente em redes sociais, e-mails e sites'],
        benefits: ['Captação rápida de atenção', 'Leveza e compartilhamento fácil', 'Versatilidade'],
        examples: ['Reações e emoções', 'Promoções e ofertas', 'Animações explicativas curtas'],
    },
    {
        title: 'Animação de cartela', icon: MonitorPlay, tone: 'rose',
        summary: 'Storyboard de uma tela: um único quadro animado em que os elementos interagem para transmitir uma mensagem curta, narrativa ou informativa.',
        components: ['Ação concentrada em uma única tela', 'Locução e trilha sonora', 'Legendagem para acessibilidade e compreensão'],
        benefits: ['Foco no conceito', 'Alta acessibilidade', 'Eficiência para mensagens curtas'],
        examples: ['Promoções', 'Explicações visuais', 'Comunicados institucionais'],
    },
];

const graphicResources = [
    {
        title: 'Storyboard', icon: Layers3, tone: 'blue' as const,
        text: 'Mapa visual que conta a história antes da animação, antecipando sequência de cenas e movimento de elementos gráficos e textuais.',
        items: ['Consistência com tipografia, cores e proporções da marca', 'Preservação da qualidade de gráficos e imagens', 'Compatibilidade técnica com softwares de animação'],
    },
    {
        title: 'Cartelas de vídeo', icon: Type, tone: 'mint' as const,
        text: 'Elementos animados que identificam, contextualizam e reforçam a identidade visual em vídeos institucionais, tutoriais e apresentações.',
        items: ['GC: nomes, cargos ou locais', 'Lettering: títulos e chamadas', 'Frame: área estática para alocar vídeo', 'Vinheta: abertura ou fechamento', 'Transição gráfica: efeitos entre cortes'],
    },
    {
        title: 'Cartela gráfica para animação', icon: Sparkles, tone: 'violet' as const,
        text: 'Peça de impacto imediato, sem múltiplas cenas, ideal para publicidade rápida — geralmente com até 15 segundos.',
        items: ['Design animado concentrado', 'Possibilidade de trilha e locução', 'Legendas para reforçar a mensagem', 'Uso em TV, plataformas digitais, GIFs e banners interativos'],
    },
];

const deliveryGuidelines = [
    { title: 'Formato', icon: FileVideo2, value: '.MOV transparente', text: 'Use ProRes 4444 ou QuickTime Animation em GCs, vinhetas, transições e logos animados.' },
    { title: 'Resolução', icon: MonitorPlay, value: 'Mesmo tamanho do vídeo', text: 'Normalmente 1920×1080 para Full HD ou 3840×2160 para 4K.' },
    { title: 'GC animado', icon: Type, value: '3 a 7 segundos', text: 'Forneça uma versão mais longa quando ajustes de edição puderem ser necessários.' },
    { title: 'Vinhetas', icon: PlayCircle, value: '3 a 5 segundos', text: 'Duração suficiente para abrir ou encerrar sem alongar o conteúdo.' },
    { title: 'Transições', icon: ArrowRight, value: '1 a 2 segundos', text: 'Curtas para preservar a fluidez entre as cenas.' },
    { title: 'Editáveis', icon: Archive, value: '.psd · .ai · .aep · .prproj', text: 'Inclua camadas de texto e elementos gráficos editáveis quando houver necessidade de alteração.' },
];

const visualAssetBenefits = [
    ['Flexibilidade', 'Arquivos editáveis aceleram ajustes sem reiniciar a animação.'],
    ['Integração', 'MOV transparente permite sobreposição direta no vídeo final.'],
    ['Qualidade', 'Formato e resolução corretos preservam o resultado visual.'],
    ['Eficiência', 'Pastas organizadas e arquivos completos reduzem atrasos.'],
];

const recurringSolutions = [
    { title: 'Aprovação interna de storyboard', text: 'Temporariamente, a Faster aprova os storyboards internamente. O cliente recebe diretamente o vídeo final e pode solicitar ajustes.', icon: CheckCircle2 },
    { title: 'Cartela de estilo para edição', text: 'Em vídeos de edição, uma cartela com fonte, cor e frame substitui o storyboard completo, reduzindo custo sem perder consistência.', icon: Palette },
    { title: 'Reutilização de assets', text: 'GCs, vinhetas e outros gráficos já produzidos podem ser reutilizados quando enviados com transparência ou arquivo editável.', icon: RefreshCw },
];

const captionOptions = [
    {
        number: '01', title: 'Legendagem via IA', tone: 'mint' as const, quality: 'Baixo–médio', price: '0,5 crédito por vídeo',
        description: 'Geração automática pelo Happy Scribe, sem revisão humana e com a fonte padrão da ferramenta.',
        useCases: ['Prioridade máxima em agilidade', 'Vídeos curtos ou de baixa complexidade', 'Conteúdos internos e rascunhos', 'Aceite de pequenas variações ou erros'],
    },
    {
        number: '02', title: 'Legendagem pelo vídeo Lite', tone: 'blue' as const, quality: 'Médio–alto', price: '0,5 crédito por minuto',
        description: 'A IA cria a base e o videomaker faz revisão leve, correções e aplicação da identidade visual quando necessário.',
        useCases: ['Mais qualidade que a IA bruta', 'Vídeos curtos ou médios', 'Identidade visual em fonte e estilo', 'Bom equilíbrio entre qualidade e custo'],
    },
    {
        number: '03', title: 'Legendagem tradicional', tone: 'violet' as const, quality: 'Alto', price: '2,5 créditos por minuto',
        description: 'Processo completo com transcrição, revisão humana criteriosa, timing e estilo do cliente.',
        useCases: ['Vídeos longos ou técnicos', 'Peças externas, institucionais e campanhas', 'Exigência de precisão textual e gramatical', 'Nomes próprios, siglas e trechos complexos'],
        breakdown: ['0,5 fixo: transcrição', '1 crédito até 1 min: revisão', '1 crédito até 1 min: legendagem'],
    },
];

const AllyoVideoProjectsContent = () => (
    <div className="space-y-10">
        <section className="overflow-hidden rounded-[18px] border border-indigo-200 bg-gradient-to-br from-[#edf3ff] via-white to-[#f3edff] p-6 dark:border-indigo-500/20 dark:from-blue-950/25 dark:via-zinc-950 dark:to-violet-950/25 sm:p-10">
            <div className="flex flex-wrap gap-2"><Badge tone="blue">Educacional</Badge><Badge tone="violet">Audiovisual</Badge></div>
            <h2 className="mt-6 max-w-[900px] font-season text-[clamp(30px,4vw,48px)] leading-[1.08]">Como orientar clientes em projetos de vídeo.</h2>
            <p className="mt-5 max-w-[920px] text-sm leading-7 text-[#5e6270] dark:text-zinc-300">Projetos audiovisuais pedem visão holística: propósito, narrativa, direção visual, produção e expectativa precisam avançar juntos. O time conduz cada decisão com segurança e transforma execução em parceria criativa.</p>
            <div className="mt-8 grid gap-[10px] sm:grid-cols-3"><HeroMetric value="Estratégia" label="antes de discutir formato" /><HeroMetric value="Clareza" label="sobre etapas, prazo e créditos" /><HeroMetric value="Consistência" label="da mensagem à entrega final" /></div>
        </section>

        <Section title="Condução estratégica" icon={Target} description="O atendimento orienta o projeto do objetivo inicial à percepção de valor na entrega.">
            <div className="grid gap-[10px] lg:grid-cols-2">{strategicSteps.map((step) => <StrategicCard key={step.number} {...step} />)}</div>
        </Section>

        <section className="rounded-[18px] border border-blue-200 bg-blue-50/55 p-6 dark:border-blue-500/20 dark:bg-blue-500/5 sm:p-8">
            <div className="flex items-center gap-3"><IconBox icon={Clapperboard} tone="blue" /><h3 className="font-season text-[28px]">Resumo estratégico</h3></div>
            <div className="mt-6 grid gap-[10px] md:grid-cols-2 xl:grid-cols-5">{summaryPillars.map(([title, text], index) => <article key={title} className={`rounded-[14px] border bg-white/70 p-4 dark:bg-black/10 ${ALLYO_BORDER}`}><span className="font-mono text-[9px] text-blue-600 dark:text-blue-300">0{index + 1}</span><strong className="mt-3 block text-xs">{title}</strong><p className="mt-2 text-[11px] leading-5 text-[#686d78] dark:text-zinc-400">{text}</p></article>)}</div>
        </section>

        <Section title="Diferenças entre produções de vídeo" icon={Video} description="Escolha o item a partir do material disponível, da complexidade necessária e do resultado esperado.">
            <div className="space-y-[10px]">{videoTypes.map((item, index) => <VideoTypeDetails key={item.title} item={item} open={index === 0} />)}</div>
        </Section>

        <Section title="Recursos gráficos para vídeos" icon={Image} description="Esses elementos estruturam a narrativa, preservam a identidade da marca e facilitam a produção e a reutilização.">
            <div className="grid gap-[10px] lg:grid-cols-3">{graphicResources.map((resource) => <ResourceCard key={resource.title} {...resource} />)}</div>
        </Section>

        <Section title="Entrega de recursos visuais" icon={FileVideo2} description="GCs animados, vinhetas, transições, frames e logos precisam chegar no formato correto, com qualidade e organização.">
            <div className="mb-5 flex flex-wrap gap-2">{['Frame', 'Tela de transição', 'Logo animado', 'GC animado', 'Vinhetas'].map((asset) => <Badge key={asset} tone="orange">{asset}</Badge>)}</div>
            <div className="grid gap-[10px] sm:grid-cols-2 xl:grid-cols-3">{deliveryGuidelines.map((guideline) => <GuidelineCard key={guideline.title} {...guideline} />)}</div>
            <div className="mt-[10px] grid gap-[10px] lg:grid-cols-2">
                <InfoCard icon={FolderTree} title="Organização dos arquivos"><BulletList items={['Separe GC Animado, Vinheta de Entrada, Vinheta de Saída e Transições em pastas nomeadas.', 'Informe texto, fonte e duração de cada GC.', 'Indique duração e estilo das vinhetas, incluindo áudio quando necessário.', 'Descreva como transições personalizadas devem ser aplicadas.']} /></InfoCard>
                <InfoCard icon={Sparkles} title="Benefícios do padrão"><div className="grid gap-3 sm:grid-cols-2">{visualAssetBenefits.map(([title, text]) => <div key={title}><strong className="text-xs">{title}</strong><p className="mt-1 text-[11px] leading-5 text-[#686d78] dark:text-zinc-400">{text}</p></div>)}</div></InfoCard>
            </div>
        </Section>

        <section className="rounded-[18px] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 dark:border-orange-500/20 dark:from-orange-950/20 dark:via-zinc-950 dark:to-amber-950/20 sm:p-8">
            <div className="flex items-start gap-4"><IconBox icon={FileArchive} tone="orange" /><div><Badge tone="orange">Collect de projeto</Badge><h3 className="mt-3 font-season text-[28px]">Compartilhamento para edição pela Faster</h3></div></div>
            <p className="mt-5 max-w-[1000px] text-xs leading-6 text-[#676864] dark:text-zinc-400">Projetos com cortes, montagem, mixagem ou alteração de elementos devem ser enviados em um único ZIP. No After Effects, use <strong>File → Dependencies → Collect Files</strong> para reunir as mídias corretamente.</p>
            <div className="mt-6 grid gap-[10px] lg:grid-cols-[1.1fr_.9fr]">
                <InfoCard icon={Archive} title="Conteúdo obrigatório"><BulletList items={['Projeto .aep ou .prproj', 'Composição final nomeada “render”', 'Múltiplos formatos: render - default, render - horizontal e render - square', 'Imagens, vídeos, trilhas, animações e demais assets', 'Fontes personalizadas utilizadas no projeto']} /></InfoCard>
                <div className={`rounded-[16px] border bg-[#191b20] p-5 font-mono text-[11px] leading-6 text-zinc-300 ${ALLYO_BORDER}`}><span className="text-orange-300">MeuTemplate.zip</span><br />├── images/<br />│   ├── imagem1.jpg<br />│   └── image2.png<br />├── fonts/<br />│   └── templatefont.ttf<br />├── media/<br />│   ├── videoabertura.mov<br />│   └── trilha.mp3<br />└── MeuTemplate.aep</div>
            </div>
            <p className="mt-5 text-[11px] leading-5 text-[#74746e] dark:text-zinc-500">Esse padrão evita arquivos offline, facilita a abertura do projeto e reduz atrasos de produção.</p>
        </section>

        <Section title="Soluções recorrentes" icon={Lightbulb}>
            <div className="grid gap-[10px] lg:grid-cols-3">{recurringSolutions.map((solution) => <article key={solution.title} className={`rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><IconBox icon={solution.icon} tone="mint" /><h4 className="mt-5 font-season text-xl">{solution.title}</h4><p className="mt-3 text-xs leading-6 text-[#676d6b] dark:text-zinc-400">{solution.text}</p></article>)}</div>
        </Section>

        <Section title="Quando usar cada item de legendagem" icon={Captions} description="Os três itens possuem níveis de rigor, custo e finalidade diferentes. A decisão depende de prazo, duração, orçamento e precisão necessária.">
            <div className="grid gap-[10px] lg:grid-cols-3">{captionOptions.map((option) => <CaptionCard key={option.title} {...option} />)}</div>
            <div className={`mt-[10px] rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="grid gap-4 md:grid-cols-3"><SummaryLine label="IA" text="Mais rápida e barata, sem revisão." /><SummaryLine label="Vídeo Lite" text="IA com revisão do videomaker e custo intermediário." /><SummaryLine label="Tradicional" text="Revisão humana profunda para materiais sensíveis." /></div></div>
        </Section>
    </div>
);

const tone = {
    blue: { badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300', icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-500/25', surface: 'bg-blue-50/55 dark:bg-blue-500/5' },
    violet: { badge: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300', icon: 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-500/25', surface: 'bg-violet-50/55 dark:bg-violet-500/5' },
    mint: { badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300', icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/25', surface: 'bg-emerald-50/55 dark:bg-emerald-500/5' },
    orange: { badge: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300', icon: 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-500/25', surface: 'bg-orange-50/55 dark:bg-orange-500/5' },
    rose: { badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300', icon: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-500/25', surface: 'bg-rose-50/55 dark:bg-rose-500/5' },
};

const Section = ({ title, icon: Icon, description, children }: { title: string; icon: LucideIcon; description?: string; children: ReactNode }) => <section><div className="mb-5 flex items-center gap-2"><Icon size={17} className="text-blue-600 dark:text-blue-300" /><h3 className="font-season text-[24px]">{title}</h3></div>{description && <p className="-mt-3 mb-5 max-w-[1050px] text-xs leading-6 text-[#676c77] dark:text-zinc-400">{description}</p>}{children}</section>;
const Badge = ({ tone: color, children }: { tone: Tone; children: ReactNode }) => <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${tone[color].badge}`}>{children}</span>;
const IconBox = ({ icon: Icon, tone: color }: { icon: LucideIcon; tone: Tone }) => <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${tone[color].icon}`}><Icon size={18} /></span>;
const HeroMetric = ({ value, label }: { value: string; label: string }) => <div className={`rounded-[14px] border bg-white/70 p-5 dark:bg-black/10 ${ALLYO_BORDER}`}><strong className="block font-season text-[24px] font-normal text-blue-700 dark:text-blue-300">{value}</strong><span className="mt-1 block text-[11px] text-[#747986] dark:text-zinc-400">{label}</span></div>;

const StrategicCard = ({ number, title, icon: Icon, text, items, note, quote }: { number: string; title: string; icon: LucideIcon; text: string; items?: string[]; note?: string; quote?: string }) => <article className={`rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center justify-between gap-3"><IconBox icon={Icon} tone="blue" /><span className="font-mono text-[10px] text-[#9297a2]">{number}</span></div><h4 className="mt-5 font-season text-[22px]">{title}</h4><p className="mt-3 text-xs leading-6 text-[#656b76] dark:text-zinc-400">{text}</p>{items && <BulletList items={items} />}{note && <p className="mt-4 rounded-[10px] bg-blue-50 px-4 py-3 text-[11px] font-medium leading-5 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">{note}</p>}{quote && <blockquote className="mt-4 border-l-2 border-violet-300 pl-4 text-[11px] italic leading-6 text-[#707482] dark:border-violet-500/50 dark:text-zinc-400">“{quote}”</blockquote>}</article>;
const BulletList = ({ items }: { items: string[] }) => <ul className="mt-4 space-y-2.5">{items.map((item) => <li key={item} className="flex items-start gap-2.5 text-[11px] leading-5 text-[#656b76] dark:text-zinc-400"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-300" />{item}</li>)}</ul>;

const VideoTypeDetails = ({ item, open }: { item: VideoType; open: boolean }) => <details open={open} className={`group rounded-[16px] border bg-white dark:bg-zinc-950 ${tone[item.tone].border}`}><summary className="flex cursor-pointer list-none items-center gap-4 p-5 sm:p-6"><IconBox icon={item.icon} tone={item.tone} /><div className="min-w-0 flex-1"><h4 className="font-season text-[22px]">{item.title}</h4><p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#6a707b] dark:text-zinc-400">{item.summary}</p></div><ChevronDown size={18} className="shrink-0 text-[#8b9099] transition group-open:rotate-180" /></summary><div className="border-t border-black/8 px-5 pb-6 pt-5 dark:border-white/10 sm:px-6"><p className="text-xs leading-6 text-[#626975] dark:text-zinc-400">{item.summary}</p><div className="mt-5 grid gap-5 lg:grid-cols-3"><DetailList title="Componentes principais" items={item.components} /><DetailList title="Benefícios" items={item.benefits} /><DetailList title="Exemplos de uso" items={item.examples} /></div></div></details>;
const DetailList = ({ title, items }: { title: string; items: string[] }) => <div><strong className="text-xs">{title}</strong><ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#6b707a] dark:text-zinc-400"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-500" />{item}</li>)}</ul></div>;

const ResourceCard = ({ title, icon: Icon, tone: color, text, items }: { title: string; icon: LucideIcon; tone: Tone; text: string; items: string[] }) => <article className={`rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><IconBox icon={Icon} tone={color} /><h4 className="mt-5 font-season text-[22px]">{title}</h4><p className="mt-3 text-xs leading-6 text-[#666c77] dark:text-zinc-400">{text}</p><BulletList items={items} /></article>;
const GuidelineCard = ({ title, icon: Icon, value, text }: { title: string; icon: LucideIcon; value: string; text: string }) => <article className={`rounded-[15px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><Icon size={17} className="text-orange-600 dark:text-orange-300" /><span className="text-[9px] font-bold uppercase tracking-[.1em] text-[#858a94]">{title}</span></div><strong className="mt-4 block text-sm">{value}</strong><p className="mt-2 text-[11px] leading-5 text-[#686e78] dark:text-zinc-400">{text}</p></article>;
const InfoCard = ({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) => <article className={`rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><IconBox icon={Icon} tone="orange" /><h4 className="font-season text-[22px]">{title}</h4></div><div className="mt-5">{children}</div></article>;

const CaptionCard = ({ number, title, tone: color, quality, price, description, useCases, breakdown }: { number: string; title: string; tone: Tone; quality: string; price: string; description: string; useCases: string[]; breakdown?: string[] }) => <article className={`rounded-[16px] border p-6 ${tone[color].border} ${tone[color].surface}`}><div className="flex items-center justify-between gap-3"><Badge tone={color}>{number}</Badge><span className="text-[9px] font-bold uppercase tracking-[.1em] text-[#7e838e]">Qualidade {quality}</span></div><h4 className="mt-5 font-season text-[23px]">{title}</h4><p className="mt-3 text-xs leading-6 text-[#646a75] dark:text-zinc-400">{description}</p><div className={`mt-4 rounded-[12px] border bg-white/60 p-4 dark:bg-black/10 ${ALLYO_BORDER}`}><span className="text-[9px] font-bold uppercase tracking-[.1em] text-[#858a94]">Custo</span><strong className="mt-1 block text-sm">{price}</strong>{breakdown && <ul className="mt-3 space-y-1">{breakdown.map((item) => <li key={item} className="text-[11px] text-[#6b7079] dark:text-zinc-400">• {item}</li>)}</ul>}</div><div className="mt-5"><strong className="text-xs">Quando usar</strong><BulletList items={useCases} /></div></article>;
const SummaryLine = ({ label, text }: { label: string; text: string }) => <div className="flex items-start gap-3"><MessageSquareText size={15} className="mt-1 shrink-0 text-blue-600 dark:text-blue-300" /><p className="text-[11px] leading-5 text-[#666c77] dark:text-zinc-400"><strong className="text-black dark:text-white">{label}:</strong> {text}</p></div>;

export default AllyoVideoProjectsContent;
