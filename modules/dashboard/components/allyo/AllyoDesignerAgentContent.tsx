import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    ArrowDownToLine,
    ArrowRight,
    Bot,
    CheckCircle2,
    Clock3,
    Cloud,
    Coins,
    Expand,
    FileImage,
    FolderArchive,
    ImagePlus,
    Layers3,
    LockKeyhole,
    Maximize2,
    Palette,
    PanelRight,
    RefreshCw,
    ScanSearch,
    ShieldCheck,
    Sparkles,
    SwatchBook,
    Type,
    WandSparkles,
    XCircle,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type Tone = 'blue' | 'violet' | 'mint' | 'orange' | 'rose';

const editCapabilities = [
    { label: 'Alteração de textos', icon: Type },
    { label: 'Modificação de cores', icon: Palette },
    { label: 'Substituição de elementos', icon: FileImage },
    { label: 'Reposicionamento de objetos', icon: Expand },
    { label: 'Imagens de referência', icon: ImagePlus },
    { label: 'Geração de novas versões', icon: RefreshCw },
];

const aspectRatios = [
    { ratio: '1:1', label: 'Quadrado', tone: 'mint' as const },
    { ratio: '16:9', label: 'Horizontal', tone: 'blue' as const },
    { ratio: '9:16', label: 'Vertical', tone: 'violet' as const },
    { ratio: '4:3', label: 'Clássico', tone: 'orange' as const },
    { ratio: '5:4', label: 'Editorial', tone: 'orange' as const },
    { ratio: '21:9', label: 'Panorâmico', tone: 'blue' as const },
    { ratio: '4:1', label: 'Banner', tone: 'blue' as const },
    { ratio: '8:1', label: 'Faixa', tone: 'blue' as const },
    { ratio: '1:4', label: 'Vertical longo', tone: 'violet' as const },
    { ratio: '1:8', label: 'Vertical extra', tone: 'violet' as const },
];

const useCases = [
    { title: 'Atualização de campanhas', items: ['Troca de preços', 'Alteração de datas', 'Atualização de ofertas', 'Inclusão de produtos'] },
    { title: 'Desdobramentos de peças', items: ['Adaptação de formatos', 'Ajustes de layout', 'Criação de versões derivadas'] },
    { title: 'Testes de comunicação', items: ['Headlines alternativas', 'Variações de oferta', 'Variações visuais', 'Testes A/B'] },
    { title: 'Ajustes operacionais', items: ['Correções simples', 'Atualização de informações', 'Troca de imagens'] },
];

const recommended = ['Usar peças aprovadas como referência', 'Fornecer instruções claras e objetivas', 'Anexar imagens de apoio quando necessário', 'Revisar o resultado antes da publicação', 'Usar o recurso para adaptações e desdobramentos'];
const avoid = ['Misturar referências de marcas diferentes', 'Pedir várias alterações complexas em uma geração', 'Publicar sem validação humana', 'Usar o agente para substituir direção estratégica', 'Prometer fidelidade perfeita antes da validação'];

const functionalContract = [
    { title: 'Entrada', icon: FileImage, tone: 'blue' as const, items: ['Peça do Repositório', 'Modo Editar ou Redimensionar', 'Instrução em linguagem natural', 'Referências opcionais', 'Proporção de destino'] },
    { title: 'Contexto', icon: SwatchBook, tone: 'violet' as const, items: ['Brand Guide da conta', 'Peças aprovadas anteriores', 'Preferências da organização', 'Conhecimento operacional', 'Regras por tipo de ativo'] },
    { title: 'Guardrails', icon: ShieldCheck, tone: 'orange' as const, items: ['Preservação da marca', 'Validação de texto e contraste', 'Elementos protegidos', 'Limites de transformação', 'Rastreabilidade da geração'] },
    { title: 'Saída', icon: Cloud, tone: 'mint' as const, items: ['Prévia comparável', 'Nova versão imutável', 'Aprovar, rejeitar ou refinar', 'Download', 'Salvar no Repositório'] },
];

const roadmap = [
    { phase: 'Fundação', status: 'Pré-requisito', title: 'Contexto e versionamento', items: ['Permissões do Repositório', 'Leitura do Brand Guide', 'Modelo de versões', 'Auditoria e telemetria', 'Política de retenção de assets'] },
    { phase: 'MVP 1', status: 'Editar', title: 'Ajustes por instrução', items: ['Painel lateral', 'Prompt e anexos', 'Texto, cor e substituições', 'Comparação antes/depois', 'Aceitar, rejeitar e regenerar'] },
    { phase: 'MVP 2', status: 'Redimensionar', title: 'Adaptação multiformato', items: ['Proporções predefinidas', 'Áreas seguras', 'Preservação de hierarquia', 'Expansão inteligente', 'Salvamento por formato'] },
    { phase: 'Evolução', status: 'Qualidade', title: 'Aprendizado controlado', items: ['Feedback estruturado', 'Preferências por conta', 'Regras de elementos restritos', 'Indicadores de aceitação', 'Fila de revisão humana'] },
];

const faq = [
    ['O Designer Agent consumirá créditos?', 'Proposta atual: gratuito para clientes ativos. A regra comercial precisa ser validada antes do lançamento.'],
    ['Quanto tempo levará uma geração?', 'Meta inicial de experiência: média entre 3 e 4 minutos, sujeita a testes de infraestrutura.'],
    ['Posso usar qualquer arte?', 'A proposta é aceitar peças disponíveis na plataforma ou no Repositório da conta, respeitando permissões.'],
    ['O resultado substitui validação humana?', 'Não. Toda peça deve ser revisada antes de publicação ou envio ao cliente.'],
    ['Será gerado um arquivo editável?', 'No escopo inicial, não. O resultado será uma nova imagem final, sem arquivo-fonte aberto.'],
    ['Posso criar campanhas do zero?', 'O foco será adaptação e variações. Projetos estratégicos continuam no fluxo criativo tradicional.'],
];

const AllyoDesignerAgentContent = () => (
    <div className="space-y-10">
        <section className="overflow-hidden rounded-[18px] border border-violet-200 bg-gradient-to-br from-[#f2efff] via-white to-[#ebf4ff] p-6 dark:border-violet-500/20 dark:from-violet-950/30 dark:via-zinc-950 dark:to-blue-950/25 sm:p-8 lg:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[.92fr_1.08fr]">
                <div>
                    <div className="flex flex-wrap gap-2"><Badge tone="orange">Produto planejado</Badge><Badge tone="violet">IA generativa</Badge><Badge tone="blue">Área Repositório</Badge></div>
                    <h2 className="mt-6 max-w-[720px] font-season text-[clamp(32px,4vw,50px)] leading-[1.05]">Designer Agent</h2>
                    <p className="mt-5 max-w-[700px] text-sm leading-7 text-[#5f6270] dark:text-zinc-300">Visão de uma funcionalidade capaz de criar novas versões de peças existentes, preservando a identidade visual da marca. O objetivo é dar autonomia para ajustes operacionais e liberar o time criativo para projetos estratégicos.</p>
                    <div className="mt-7 grid gap-3 sm:grid-cols-3"><MiniFact icon={Clock3} label="Meta" value="3–4 minutos" /><MiniFact icon={FolderArchive} label="Destino" value="Repositório" /><MiniFact icon={Coins} label="Modelo proposto" value="Sem créditos" /></div>
                </div>
                <DesignerAgentPreview />
            </div>
        </section>

        <section className="rounded-[16px] border border-orange-200 bg-orange-50/60 p-5 dark:border-orange-500/20 dark:bg-orange-500/5 sm:p-6">
            <div className="flex items-start gap-3"><AlertTriangle size={18} className="mt-1 shrink-0 text-orange-600 dark:text-orange-300" /><div><strong className="text-sm">Documento de visão futura</strong><p className="mt-2 text-xs leading-6 text-[#6b6762] dark:text-zinc-400">Esta página estrutura intenção, escopo e critérios para implementação. Tempos, gratuidade, formatos e capacidades ainda precisam de validação técnica, financeira e jurídica antes de serem comunicados como funcionalidade disponível.</p></div></div>
        </section>

        <Section eyebrow="Duas funções principais" title="Editar e redimensionar com IA" icon={WandSparkles}>
            <div className="grid gap-[10px] lg:grid-cols-2">
                <FeaturePanel icon={WandSparkles} tone="violet" title="Editar" description="Ajustes simples sem abrir uma nova tarefa: texto, cor, elementos, posicionamento e novas variações."><div className="grid gap-2 sm:grid-cols-2">{editCapabilities.map((capability) => <CapabilityChip key={capability.label} {...capability} />)}</div></FeaturePanel>
                <FeaturePanel icon={Maximize2} tone="blue" title="Redimensionar" description="Adaptação de uma peça existente para outras proporções, preservando composição, hierarquia e identidade."><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{aspectRatios.map((item) => <RatioCard key={item.ratio} {...item} />)}</div></FeaturePanel>
            </div>
        </Section>

        <Section eyebrow="Fluxo" title="Passo a passo previsto" icon={ArrowRight}>
            <div className="grid gap-[10px] lg:grid-cols-3">
                <FlowCard number="01" icon={PanelRight} title="Descreva o ajuste" text="Abra uma peça no Repositório, escolha Editar ou Redimensionar e descreva alterações objetivas. Referências adicionais podem ser anexadas quando ajudarem a direção." footer="Origem controlada no Repositório" />
                <FlowCard number="02" icon={Bot} title="O agente gera a versão" text="O sistema consulta contexto da conta, Brand Guide e regras operacionais; valida cor, tipografia, elementos protegidos e composição antes de entregar uma nova versão." footer="Processamento com guardrails" />
                <FlowCard number="03" icon={CheckCircle2} title="Aprove ou refine" text="Compare o resultado, aprove, rejeite ou descreva outro ajuste. A versão aceita pode ser baixada, usada como base ou salva novamente no Repositório." footer="Versionamento e rastreabilidade" />
            </div>
        </Section>

        <Section eyebrow="Quando usar" title="Casos de uso recomendados" icon={Sparkles}>
            <div className="grid gap-[10px] sm:grid-cols-2 xl:grid-cols-4">{useCases.map((useCase) => <UseCaseCard key={useCase.title} {...useCase} />)}</div>
            <div className="mt-[10px] rounded-[16px] border border-orange-200 bg-orange-50/55 p-6 dark:border-orange-500/20 dark:bg-orange-500/5"><div className="flex items-center gap-3"><AlertTriangle size={17} className="text-orange-600 dark:text-orange-300" /><h4 className="font-season text-[22px]">Limite de posicionamento</h4></div><p className="mt-4 text-xs leading-6 text-[#686661] dark:text-zinc-400">O Designer Agent acelera adaptações e desdobramentos. Campanhas inéditas, Key Visuals, conceitos criativos, estratégia de comunicação e trabalhos com direção especializada continuam no fluxo tradicional com o time.</p></div>
        </Section>

        <Section eyebrow="Base para implementação" title="Contrato funcional" icon={Layers3}>
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">{functionalContract.map((group) => <ContractCard key={group.title} {...group} />)}</div>
        </Section>

        <Section eyebrow="Plano de entrega" title="Roadmap sugerido" icon={RefreshCw}>
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">{roadmap.map((phase, index) => <RoadmapCard key={phase.phase} {...phase} index={index + 1} />)}</div>
            <div className={`mt-[10px] rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><IconBox icon={ScanSearch} tone="blue" /><h4 className="font-season text-[22px]">Critérios mínimos para piloto</h4></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Definition label="Segurança" text="Isolamento de dados por organização." /><Definition label="Qualidade" text="Comparação e aprovação obrigatória." /><Definition label="Controle" text="Histórico, versões e possibilidade de descarte." /><Definition label="Observabilidade" text="Tempo, falhas, custo e taxa de aceitação." /></div></div>
        </Section>

        <Section eyebrow="Boas práticas" title="Recomendado e evitar" icon={ShieldCheck}>
            <div className="grid gap-[10px] lg:grid-cols-2"><PracticePanel title="Recomendado" tone="mint" icon={CheckCircle2} items={recommended} /><PracticePanel title="Evitar" tone="rose" icon={XCircle} items={avoid} /></div>
        </Section>

        <Section eyebrow="Dúvidas frequentes" title="FAQ" icon={LockKeyhole}>
            <div className="grid gap-[10px] lg:grid-cols-2">{faq.map(([question, answer]) => <article key={question} className={`rounded-[16px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><h4 className="text-sm font-semibold">{question}</h4><p className="mt-3 text-xs leading-6 text-[#686d76] dark:text-zinc-400">{answer}</p></article>)}</div>
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

const Section = ({ eyebrow, title, icon: Icon, children }: { eyebrow: string; title: string; icon: LucideIcon; children: ReactNode }) => <section><span className="text-[9px] font-bold uppercase tracking-[.18em] text-[#858994]">{eyebrow}</span><div className="mb-5 mt-2 flex items-center gap-2"><Icon size={17} className="text-violet-600 dark:text-violet-300" /><h3 className="font-season text-[25px]">{title}</h3></div>{children}</section>;
const Badge = ({ tone: color, children }: { tone: Tone; children: ReactNode }) => <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${tone[color].badge}`}>{children}</span>;
const IconBox = ({ icon: Icon, tone: color }: { icon: LucideIcon; tone: Tone }) => <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${tone[color].icon}`}><Icon size={18} /></span>;

const DesignerAgentPreview = () => <div className="relative min-h-[330px] overflow-hidden rounded-[18px] border border-black/8 bg-[#24252a] p-5 shadow-[0_24px_60px_rgba(46,36,84,.16)] dark:border-white/10"><div className="absolute inset-5 right-[25%] overflow-hidden rounded-[10px] bg-gradient-to-br from-orange-500 via-orange-400 to-sky-400"><div className="absolute inset-y-0 left-0 w-1/2 bg-orange-500/90" /><div className="absolute left-[8%] top-[18%] max-w-[42%] text-white"><span className="rounded-full bg-white px-2 py-1 text-[7px] font-bold text-black">PACOTES</span><strong className="mt-4 block text-[clamp(18px,2vw,29px)] leading-tight">Temporada de inverno com ofertas quentinhas</strong><span className="mt-4 inline-flex rounded-md bg-black px-3 py-2 text-[8px] font-bold">Ver pacotes</span></div><div className="absolute bottom-5 right-6 h-28 w-28 rounded-full bg-white/30 blur-xl" /></div><div className="absolute bottom-5 right-5 top-12 w-[42%] rounded-[14px] bg-white p-4 text-[#17182a] shadow-2xl"><div className="flex items-center justify-between"><div><strong className="text-[11px]">Editar com IA</strong><span className="mt-0.5 block text-[8px] text-[#a2a5ae]">Designer Agent</span></div><Badge tone="mint">Previsto</Badge></div><div className="mt-4 flex rounded-full bg-[#eef0f5] p-1 text-[8px]"><span className="flex-1 rounded-full bg-white py-1.5 text-center font-semibold shadow-sm">Editar</span><span className="flex-1 py-1.5 text-center text-[#9da1ab]">Redimensionar</span></div><div className="mt-4 aspect-video rounded-[8px] bg-gradient-to-r from-[#222] via-orange-500 to-sky-400" /><p className="mt-3 text-center text-[9px] font-semibold">Descreva o ajuste desejado</p><div className="mt-2 h-16 rounded-[8px] border border-[#e5e6eb] p-2 text-[8px] leading-4 text-[#777b84]">Troque o preço e gere uma versão vertical para stories.</div><div className="mt-3 rounded-[7px] bg-violet-600 py-2 text-center text-[8px] font-semibold text-white">Gerar nova versão</div></div></div>;
const MiniFact = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => <div className="flex items-center gap-2"><Icon size={14} className="shrink-0 text-[#858994]" /><span><small className="block text-[8px] uppercase tracking-[.08em] text-[#969aa3]">{label}</small><strong className="text-[11px]">{value}</strong></span></div>;

const FeaturePanel = ({ icon: Icon, tone: color, title, description, children }: { icon: LucideIcon; tone: Tone; title: string; description: string; children: ReactNode }) => <article className={`rounded-[17px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><IconBox icon={Icon} tone={color} /><div><h4 className="font-season text-[24px]">{title}</h4><Badge tone={color}>{title === 'Editar' ? 'Ajustes operacionais' : 'Multiformato'}</Badge></div></div><p className="my-5 text-xs leading-6 text-[#666b76] dark:text-zinc-400">{description}</p>{children}</article>;
const CapabilityChip = ({ label, icon: Icon }: { label: string; icon: LucideIcon }) => <div className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] ${ALLYO_BORDER}`}><Icon size={13} className="shrink-0 text-violet-600 dark:text-violet-300" />{label}</div>;
const RatioCard = ({ ratio, label, tone: color }: { ratio: string; label: string; tone: Tone }) => { const [width, height] = ratio.split(':').map(Number); const scale = Math.min(38 / width, 38 / height); return <div className={`flex min-h-24 flex-col items-center justify-center rounded-[12px] border ${tone[color].border} ${tone[color].surface}`}><span className={`rounded-[5px] border-2 ${tone[color].border}`} style={{ width: Math.max(4, width * scale), height: Math.max(4, height * scale) }} /><strong className="mt-2 text-[10px]">{ratio}</strong><span className="text-[8px] text-[#8c9098]">{label}</span></div>; };
const FlowCard = ({ number, icon: Icon, title, text, footer }: { number: string; icon: LucideIcon; title: string; text: string; footer: string }) => <article className={`flex flex-col overflow-hidden rounded-[17px] border bg-white dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex-1 p-6"><div className="flex items-center justify-between"><IconBox icon={Icon} tone="violet" /><Badge tone="violet">{number}</Badge></div><h4 className="mt-5 font-season text-[23px]">{title}</h4><p className="mt-3 text-xs leading-6 text-[#666b76] dark:text-zinc-400">{text}</p></div><div className="flex items-center gap-2 border-t border-black/8 px-6 py-4 text-[10px] text-[#666b76] dark:border-white/10 dark:text-zinc-400"><ArrowDownToLine size={13} className="text-emerald-600" />{footer}</div></article>;
const UseCaseCard = ({ title, items }: { title: string; items: string[] }) => <article className={`rounded-[16px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><h4 className="text-sm font-semibold">{title}</h4><ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#696e78] dark:text-zinc-400"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-500" />{item}</li>)}</ul></article>;
const ContractCard = ({ title, icon: Icon, tone: color, items }: { title: string; icon: LucideIcon; tone: Tone; items: string[] }) => <article className={`rounded-[16px] border p-5 ${tone[color].border} ${tone[color].surface}`}><IconBox icon={Icon} tone={color} /><h4 className="mt-4 font-season text-xl">{title}</h4><ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#666b75] dark:text-zinc-400"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-600" />{item}</li>)}</ul></article>;
const RoadmapCard = ({ phase, status, title, items, index }: { phase: string; status: string; title: string; items: string[]; index: number }) => <article className={`relative rounded-[16px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center justify-between"><Badge tone={index === 1 ? 'orange' : index === 4 ? 'mint' : 'violet'}>{phase}</Badge><span className="font-mono text-[9px] text-[#999da5]">0{index}</span></div><span className="mt-4 block text-[9px] font-bold uppercase tracking-[.1em] text-[#8a8e96]">{status}</span><h4 className="mt-2 font-season text-xl">{title}</h4><ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="text-[11px] leading-5 text-[#696e77] before:mr-1 before:text-violet-500 before:content-['•'] dark:text-zinc-400">{item}</li>)}</ul>{index < 4 && <ArrowRight size={14} className="absolute -right-3 top-1/2 z-10 hidden text-[#aaaeb5] xl:block" />}</article>;
const Definition = ({ label, text }: { label: string; text: string }) => <div><strong className="text-xs">{label}</strong><p className="mt-1 text-[11px] leading-5 text-[#696e77] dark:text-zinc-400">{text}</p></div>;
const PracticePanel = ({ title, tone: color, icon: Icon, items }: { title: string; tone: Tone; icon: LucideIcon; items: string[] }) => <article className={`rounded-[16px] border p-6 ${tone[color].border} ${tone[color].surface}`}><div className="flex items-center gap-3"><IconBox icon={Icon} tone={color} /><h4 className="text-sm font-semibold">{title}</h4></div><ul className="mt-5 space-y-3">{items.map((item) => <li key={item} className="flex items-start gap-2.5 text-xs leading-6 text-[#646a74] dark:text-zinc-400"><Icon size={14} className={`mt-1 shrink-0 ${color === 'mint' ? 'text-emerald-600' : 'text-rose-500'}`} />{item}</li>)}</ul></article>;

export default AllyoDesignerAgentContent;
