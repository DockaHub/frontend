import type { ReactNode } from 'react';
import {
    BookOpen,
    CheckCircle2,
    CircleDot,
    FileAudio,
    FileText,
    LayoutTemplate,
    Monitor,
    Palette,
    PenTool,
    Scissors,
    Smartphone,
    Sparkles,
    Target,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type PageId = 'playbook-catalogo-adesivo' | 'playbook-catalogo-ebook' | 'playbook-catalogo-landing-page' | 'playbook-catalogo-storyboard' | 'playbook-catalogo-locucao' | 'playbook-catalogo-logos';

const ebookFeatures = [
    ['Conteúdo de qualidade', 'Aborda um tema relevante para o público e entrega informações úteis, bem pesquisadas e escritas.'],
    ['Design atraente', 'Combina layout, gráficos, imagens e formatação para tornar a leitura agradável.'],
    ['Captação de leads', 'Pode solicitar dados de contato para liberar o acesso ao material.'],
    ['Chamadas à ação', 'Convida o leitor a dar o próximo passo, como entrar em contato ou assinar uma lista.'],
    ['Distribuição', 'Pode ser promovido em site, mídia, redes sociais e campanhas de e-mail.'],
    ['Geração de oportunidades', 'Ajuda a nutrir contatos e transformar interesse em relacionamento comercial.'],
];

const landingFeatures = [
    ['Título claro e convincente', 'Destaca a promessa ou o principal benefício da oferta.'],
    ['Descrição da oferta', 'Explica o produto ou serviço de forma direta e persuasiva.'],
    ['Imagens ou vídeos', 'Apoiam a compreensão e valorizam a oferta apresentada.'],
    ['Formulário ou CTA', 'Direciona o visitante para a ação desejada.'],
    ['Prova social', 'Usa depoimentos, avaliações ou evidências para gerar confiança.'],
    ['Elementos de confiança', 'Inclui selos, parceiros, segurança e políticas relevantes.'],
    ['Texto persuasivo', 'Organiza argumentos com foco em benefícios e objeções.'],
    ['Design limpo e focado', 'Reduz distrações e mantém a atenção na conversão.'],
    ['Responsividade', 'Precisa funcionar corretamente em desktop e dispositivos móveis.'],
];

const landingSections = [
    ['Cabeçalho', 'Título impactante, descrição breve e chamada para ação inicial.'],
    ['Benefícios', 'Apresenta o valor da oferta e os ganhos para o público.'],
    ['Prova social', 'Reúne depoimentos, números ou referências de credibilidade.'],
    ['Chamada para ação', 'Convida o visitante a realizar uma ação clara.'],
    ['Imagens e vídeos', 'Explicam a oferta e tornam a narrativa mais envolvente.'],
    ['Formulário', 'Coleta as informações necessárias para a conversão.'],
    ['Rodapé', 'Concentra políticas, contatos e navegação secundária.'],
];

const storyboardFeatures = [
    ['Planejamento visual', 'Permite visualizar cenas, enquadramentos, composição, movimentos e cenários antes da produção.'],
    ['Comunicação', 'Traduz a visão criativa em uma sequência clara para toda a equipe.'],
    ['Economia de tempo e recursos', 'Antecipar decisões reduz erros, refações e custos durante a execução.'],
    ['Narrativa', 'Estrutura os eventos em uma sequência lógica, coesa e compreensível.'],
    ['Edição prévia', 'Permite ajustar ritmo e história antes de investir em filmagem ou animação.'],
];

const logoFeatures = [
    ['Simplicidade', 'Precisa ser fácil de reconhecer, reproduzir e lembrar.'],
    ['Relevância', 'Deve traduzir o posicionamento e os valores da marca.'],
    ['Memorabilidade', 'Precisa ser único e distinto diante da concorrência.'],
    ['Atemporalidade', 'Deve resistir às mudanças de tendências sem perder identidade.'],
    ['Versatilidade', 'Precisa funcionar em diferentes formatos, contextos e escalas.'],
    ['Legibilidade e acesso', 'Deve permanecer compreensível em tamanhos pequenos e aplicações diversas.'],
];

const AllyoCatalogPlaybookContent = ({ pageId }: { pageId: string }) => {
    if (pageId === 'playbook-catalogo-adesivo') return <StickerPage />;
    if (pageId === 'playbook-catalogo-ebook') return <EbookPage />;
    if (pageId === 'playbook-catalogo-landing-page') return <LandingPage />;
    if (pageId === 'playbook-catalogo-storyboard') return <StoryboardPage />;
    if (pageId === 'playbook-catalogo-locucao') return <VoiceOverPage />;
    if (pageId === 'playbook-catalogo-logos') return <LogoPage />;
    return null;
};

export const ALLYO_CATALOG_PLAYBOOK_IDS: PageId[] = ['playbook-catalogo-adesivo', 'playbook-catalogo-ebook', 'playbook-catalogo-landing-page', 'playbook-catalogo-storyboard', 'playbook-catalogo-locucao', 'playbook-catalogo-logos'];

const StickerPage = () => <div className="space-y-10"><Hero icon={Scissors} eyebrow="Catálogo · Impresso" title="Adesivo" description="O formato do corte define quais informações devem estar no briefing e evita ajustes tardios na produção." /><Panel><SectionTitle>Para produzir um adesivo, medidas são suficientes ou é necessária uma faca especial?</SectionTitle><div className="mt-5 space-y-3"><Bullet><strong>Corte circular, quadrado ou retangular:</strong> informe largura e altura.</Bullet><Bullet><strong>Corte personalizado:</strong> envie a faca especial ou descreva o desenho e o limite máximo de dimensão.</Bullet><Bullet><strong>Cartela de adesivos:</strong> informe largura e altura da cartela e identifique cada adesivo.</Bullet></div><div className="mt-7 grid gap-[10px] lg:grid-cols-3"><StickerExample type="simple" title="Corte simples" caption="Largura e altura" /><StickerExample type="custom" title="Faca especial" caption="Formato e limite de dimensão" /><StickerExample type="sheet" title="Cartela" caption="Dimensão total e itens individuais" /></div></Panel></div>;

const EbookPage = () => <div className="space-y-10"><Hero icon={BookOpen} eyebrow="Catálogo · Conteúdo" title="E-book" description="Um recurso digital que transforma conhecimento em valor para o público e apoia estratégias de aquisição e relacionamento." /><Panel><p className="text-sm leading-7 text-[#555c68] dark:text-zinc-300">Um e-book, muitas vezes usado como <strong>lead magnet</strong>, reúne conteúdo aprofundado em um formato de leitura estruturado. Em marketing, pode atrair potenciais clientes em troca de informações de contato e iniciar uma jornada de nutrição.</p><SectionTitle className="mt-8">Principais características</SectionTitle><FeatureGrid items={ebookFeatures} /><Callout>O material deve equilibrar profundidade editorial, leitura fluida, identidade visual e uma próxima ação clara para o público.</Callout></Panel></div>;

const LandingPage = () => <div className="space-y-10"><Hero icon={LayoutTemplate} eyebrow="Catálogo · Digital" title="Layout de landing page" description="Uma página focada em uma única oferta ou mensagem, projetada para conduzir o visitante a uma ação específica." /><Panel><SectionTitle>O que é uma landing page?</SectionTitle><p className="mt-5 text-sm leading-7 text-[#555c68] dark:text-zinc-300">É uma página de destino criada para campanhas, anúncios, promoções ou objetivos de conversão. Seu conteúdo precisa ser relevante, persuasivo e concentrado no preenchimento de formulário, compra, assinatura, download ou outra ação definida.</p><SectionTitle className="mt-8">Principais características</SectionTitle><FeatureGrid items={landingFeatures} columns={3} /><SectionTitle className="mt-8">Landing page × site</SectionTitle><div className="mt-5 grid gap-[10px] lg:grid-cols-2"><CompareCard title="Landing page" icon={Target} items={['Objetivo único e mensurável', 'Conteúdo altamente direcionado', 'Poucas distrações e foco em conversão']} /><CompareCard title="Site" icon={Monitor} items={['Conteúdo amplo e institucional', 'Navegação entre várias páginas', 'Informações para diferentes jornadas']} /></div><SectionTitle className="mt-8">Seções comuns</SectionTitle><div className="mt-5 grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">{landingSections.map(([title, description], index) => <Step key={title} number={index + 1} title={title}>{description}</Step>)}</div><SectionTitle className="mt-8">Responsabilidade no layout</SectionTitle><p className="mt-4 text-xs leading-6 text-[#626975] dark:text-zinc-400">A entrega deve documentar as duas visualizações principais. Desktop e mobile não são apenas escalas diferentes: cada composição precisa manter hierarquia, leitura e conversão.</p><ResponsivePreview /></Panel></div>;

const StoryboardPage = () => <div className="space-y-10"><Hero icon={PenTool} eyebrow="Catálogo · Vídeo" title="Storyboard" description="A representação visual que transforma roteiro em cenas e antecipa decisões antes da produção." /><Panel><SectionTitle>O que é um Storyboard?</SectionTitle><p className="mt-5 text-sm leading-7 text-[#555c68] dark:text-zinc-300">É uma sequência de ilustrações ou quadros usada para planejar filmes, animações e outras narrativas audiovisuais. Cada cena ajuda a equipe a visualizar a execução antes de iniciar a produção.</p><SectionTitle className="mt-8">Principais características</SectionTitle><FeatureGrid items={storyboardFeatures} /><StoryboardStrip /><Callout>Inclua frame, duração, locução, lettering, ação, movimento e observações em cada cena.</Callout></Panel></div>;

const VoiceOverPage = () => <div className="space-y-10"><Hero icon={FileAudio} eyebrow="Catálogo · Áudio" title="Locução" description="Um bom briefing elimina ambiguidades de leitura, pronúncia, estilo e ritmo antes da gravação." /><Panel><SectionTitle>Dicas para a criação do briefing</SectionTitle><div className="mt-5 space-y-3"><Bullet>Revise o texto final: tudo o que estiver no campo de locução será narrado, salvo indicação explícita.</Bullet><Bullet>Para palavras inventadas ou estrangeiras, envie uma gravação curta com a pronúncia desejada.</Bullet><Bullet>Indique como letras maiúsculas, minúsculas, símbolos, siglas e endereços devem ser lidos.</Bullet></div><div className="mt-6 rounded-[15px] border border-indigo-100 bg-indigo-50/60 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/5"><strong className="text-xs">Exemplo de leitura</strong><div className="mt-4 grid gap-3 lg:grid-cols-2"><CodeLine label="Sem indicação">/xis/ · /pê/ · /tê/ · /zero/ · /hashtag/ · /ípsilon/</CodeLine><CodeLine label="Com indicação">xis maiúsculo · pê minúsculo · tê maiúsculo · ípsilon minúsculo</CodeLine></div></div><SectionTitle className="mt-8">Antes de enviar</SectionTitle><FeatureGrid items={[["Sites e URLs", "Escreva exatamente como o endereço deve ser narrado."], ["Estilo de voz", "Se a opção ideal não estiver disponível, descreva-a em Outros e anexe uma referência."], ["Arquivos de apoio", "Anexe áudios; vídeos online podem não permitir download de referência."], ["Mudanças após aprovação", "Alterações de texto, formato, estilo ou pronúncia podem gerar nova cobrança."]]} columns={2} /><Callout>Consulte o banco de vozes cadastrado na plataforma antes de finalizar o briefing.</Callout></Panel></div>;

const LogoPage = () => <div className="space-y-10"><Hero icon={Palette} eyebrow="Catálogo · Identidade" title="Logos" description="Criação de uma marca visual simples, relevante, memorável e preparada para diferentes pontos de contato." /><Panel><p className="text-sm leading-7 text-[#555c68] dark:text-zinc-300">Um logotipo é um símbolo gráfico que identifica uma empresa, produto, campanha ou projeto. Ele combina forma, tipografia e cor para comunicar uma identidade de maneira rápida e reconhecível.</p><SectionTitle className="mt-8">Quando criar um logo</SectionTitle><FeatureGrid items={[["Nova empresa", "Estabelece uma identidade visual desde o início."], ["Rebranding", "Reflete mudanças relevantes de posicionamento ou público."], ["Lançamento de produto", "Diferencia uma nova oferta dentro do portfólio."], ["Eventos e campanhas", "Cria uma assinatura temporária para uma iniciativa específica."], ["Projetos e departamentos", "Organiza identidades derivadas sem perder vínculo com a marca principal."]]} /><SectionTitle className="mt-8">Principais características</SectionTitle><FeatureGrid items={logoFeatures} columns={3} /><SectionTitle className="mt-8">Fluxo de entrega</SectionTitle><div className="mt-5 grid gap-[10px] lg:grid-cols-3"><LogoStage stage="01" title="Até três conceitos" formats="JPG · PNG · PDF" type="concepts" /><LogoStage stage="02" title="Conceito aprovado" formats="JPG · PNG · PDF · AI · FIG" type="approved" /><LogoStage stage="03" title="Documentação adicional" formats="PDF" type="documentation" /></div></Panel></div>;

const Hero = ({ icon: Icon, eyebrow, title, description }: { icon: typeof Sparkles; eyebrow: string; title: string; description: string }) => <section className="rounded-[18px] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 dark:border-indigo-500/20 dark:from-indigo-950/25 dark:via-zinc-950 dark:to-violet-950/20 sm:p-8"><span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-indigo-500"><Icon size={13} />{eyebrow}</span><h2 className="mt-5 font-season text-[clamp(34px,5vw,52px)] leading-none">{title}</h2><p className="mt-5 max-w-[780px] text-sm leading-7 text-[#626875] dark:text-zinc-300">{description}</p></section>;
const Panel = ({ children }: { children: ReactNode }) => <section className={`rounded-[18px] border bg-white p-6 shadow-sm dark:bg-zinc-950 sm:p-8 ${ALLYO_BORDER}`}>{children}</section>;
const SectionTitle = ({ children, className = '' }: { children: ReactNode; className?: string }) => <h3 className={`border-b border-black/10 pb-3 font-season text-[25px] dark:border-white/10 ${className}`}>{children}</h3>;
const Bullet = ({ children }: { children: ReactNode }) => <div className="flex items-start gap-3 text-xs leading-6 text-[#5e6571] dark:text-zinc-400"><CircleDot size={13} className="mt-1.5 shrink-0 text-indigo-400" /><p>{children}</p></div>;
const FeatureGrid = ({ items, columns = 2 }: { items: string[][]; columns?: 2 | 3 }) => <div className={`mt-5 grid gap-[10px] ${columns === 3 ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2'}`}>{items.map(([title, description]) => <div key={title} className="rounded-[14px] border border-[#e3e5ea] bg-[#fafafe] p-4 dark:border-zinc-700 dark:bg-zinc-900"><div className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-indigo-500" /><div><strong className="text-xs">{title}</strong><p className="mt-2 text-[10px] leading-5 text-[#6e7480] dark:text-zinc-500">{description}</p></div></div></div>)}</div>;
const Callout = ({ children }: { children: ReactNode }) => <div className="mt-6 rounded-[14px] border border-indigo-200 bg-indigo-50/60 px-5 py-4 text-xs leading-6 text-[#555d6a] dark:border-indigo-500/25 dark:bg-indigo-500/5 dark:text-zinc-300"><Sparkles size={14} className="mr-2 inline text-indigo-500" />{children}</div>;

const StickerExample = ({ type, title, caption }: { type: 'simple' | 'custom' | 'sheet'; title: string; caption: string }) => <article><p className="mb-2 text-center text-[10px] italic text-[#747a85]">{title} · {caption}</p><div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[14px] ${type === 'simple' ? 'bg-gradient-to-br from-emerald-200 via-orange-100 to-rose-200' : type === 'custom' ? 'bg-gradient-to-br from-sky-300 to-blue-700' : 'bg-gradient-to-br from-pink-400 to-rose-500'}`}>{type === 'simple' && <><div className="h-36 w-52 rotate-[-12deg] rounded-md bg-orange-500 shadow-xl"><StickerFace /></div><div className="absolute bottom-7 right-8 h-20 w-20 rounded-full bg-white shadow-xl"><StickerFace /></div></>}{type === 'custom' && <div className="h-56 w-24 -rotate-12 rounded-full bg-[#193b68] shadow-xl"><div className="mt-10 flex flex-col items-center gap-5"><StickerFace /><span className="text-3xl">⚡</span></div></div>}{type === 'sheet' && <div className="grid w-60 rotate-[-9deg] grid-cols-4 gap-3 rounded-[10px] bg-[#181823] p-5 shadow-xl">{['★','●','✿','⚡','♥','◆','☀','✦','●','★','♥','✿'].map((shape, index) => <span key={index} className="text-center text-xl text-yellow-300">{shape}</span>)}</div>}</div></article>;
const StickerFace = () => <div className="flex h-full w-full items-center justify-center text-4xl">☺</div>;
const CompareCard = ({ title, icon: Icon, items }: { title: string; icon: typeof Target; items: string[] }) => <div className="rounded-[15px] border border-[#e2e4e9] p-5 dark:border-zinc-700"><div className="flex items-center gap-2"><Icon size={15} className="text-indigo-500" /><strong className="text-sm">{title}</strong></div><ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-xs text-[#656b77] dark:text-zinc-400"><span className="text-indigo-500">•</span>{item}</li>)}</ul></div>;
const Step = ({ number, title, children }: { number: number; title: string; children: ReactNode }) => <div className="rounded-[14px] border border-[#e2e4e9] p-4 dark:border-zinc-700"><span className="text-[9px] font-bold text-indigo-500">{String(number).padStart(2, '0')}</span><strong className="mt-3 block text-xs">{title}</strong><p className="mt-2 text-[10px] leading-5 text-[#717783] dark:text-zinc-500">{children}</p></div>;
const ResponsivePreview = () => <div className="mt-5 grid gap-[10px] lg:grid-cols-[1.65fr_.65fr]"><DevicePreview icon={Monitor} label="Desktop" narrow={false} /><DevicePreview icon={Smartphone} label="Mobile" narrow /></div>;
const DevicePreview = ({ icon: Icon, label, narrow }: { icon: typeof Monitor; label: string; narrow: boolean }) => <div className="rounded-[16px] bg-gradient-to-br from-cyan-950 via-blue-900 to-indigo-950 p-5 text-white"><div className="flex items-center gap-2 text-[10px]"><Icon size={14} />{label}</div><div className={`mt-8 ${narrow ? 'max-w-[240px]' : 'max-w-[540px]'}`}><span className="text-[9px] uppercase tracking-[.15em] text-emerald-300">Uma experiência melhor</span><h4 className="mt-3 font-season text-[clamp(25px,4vw,46px)] leading-tight">Design pensado para converter.</h4><p className="mt-4 text-[10px] leading-5 text-white/70">Mensagem clara, benefício evidente e uma ação principal.</p><span className="mt-5 inline-flex rounded-full bg-emerald-400 px-5 py-2 text-[9px] font-bold text-emerald-950">Começar agora</span></div></div>;
const StoryboardStrip = () => <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{['Abertura', 'Contexto', 'Virada', 'Encerramento'].map((scene, index) => <div key={scene} className="overflow-hidden rounded-[13px] border border-[#dfe1e7] dark:border-zinc-700"><div className={`aspect-video bg-gradient-to-br ${index % 2 ? 'from-orange-200 to-rose-400' : 'from-indigo-200 to-violet-500'} p-3`}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[9px] font-bold text-indigo-700">{index + 1}</span></div><div className="p-3"><strong className="text-[10px]">{scene}</strong><p className="mt-1 text-[9px] text-[#777d88]">Frame · locução · movimento</p></div></div>)}</div>;
const CodeLine = ({ label, children }: { label: string; children: ReactNode }) => <div className="rounded-[12px] border border-indigo-100 bg-white p-4 dark:border-indigo-500/20 dark:bg-zinc-950"><span className="text-[9px] font-bold uppercase text-indigo-500">{label}</span><code className="mt-2 block text-[10px] leading-5 text-[#59606d] dark:text-zinc-400">{children}</code></div>;
const LogoStage = ({ stage, title, formats, type }: { stage: string; title: string; formats: string; type: 'concepts' | 'approved' | 'documentation' }) => <article><p className="mb-2 text-center text-[10px] italic text-[#757b86]">{title}</p><div className="flex aspect-[1.1] flex-col items-center justify-center rounded-[16px] border border-[#dfe1e6] bg-[#fafafa] p-6 dark:border-zinc-700 dark:bg-zinc-900"><span className="text-[9px] font-bold text-indigo-500">ETAPA {stage}</span>{type === 'concepts' && <div className="mt-8 grid w-full grid-cols-3 gap-3">{['A','B','C'].map((item) => <div key={item} className="rounded-md bg-white p-3 text-center shadow-sm dark:bg-zinc-950"><strong className="font-season text-2xl text-indigo-600">{item}</strong><div className="mx-auto mt-3 h-1.5 w-10 rounded bg-zinc-200" /></div>)}</div>}{type === 'approved' && <div className="mt-8 rounded-[22px] border-2 border-indigo-200 bg-white p-10 text-center shadow-sm dark:bg-zinc-950"><span className="font-season text-3xl text-indigo-600">LOGO</span></div>}{type === 'documentation' && <div className="mt-8 w-full rounded-[15px] border bg-white p-5 shadow-sm dark:bg-zinc-950"><span className="font-season text-xl">Guia do logo</span><div className="mt-5 h-2 w-2/3 rounded bg-zinc-200" /><div className="mt-2 h-2 w-1/2 rounded bg-zinc-200" /><div className="mt-5 flex gap-2"><span className="h-9 w-9 rounded bg-indigo-600" /><span className="h-9 w-9 rounded bg-pink-500" /></div></div>}<span className="mt-8 rounded-full bg-zinc-200 px-3 py-1 text-[9px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">{formats}</span></div></article>;

export default AllyoCatalogPlaybookContent;
