import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    CalendarDays,
    Calculator,
    CheckCircle2,
    CircleAlert,
    CirclePause,
    CirclePlay,
    Clock3,
    Gauge,
    Layers3,
    PackageOpen,
    Sparkles,
    TimerReset,
    TrendingUp,
    XCircle,
    Zap,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type Tone = 'mint' | 'blue' | 'violet' | 'orange' | 'rose';
type SlaGroup = { hours: number; subtitle: string; items: string[]; tone: Tone };

const toneStyles: Record<Tone, { border: string; surface: string; badge: string; text: string; dot: string; icon: string }> = {
    mint: {
        border: 'border-emerald-200 dark:border-emerald-500/25',
        surface: 'bg-emerald-50/60 dark:bg-emerald-500/5',
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300',
        text: 'text-emerald-600 dark:text-emerald-300',
        dot: 'bg-emerald-500',
        icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
    blue: {
        border: 'border-blue-200 dark:border-blue-500/25',
        surface: 'bg-blue-50/55 dark:bg-blue-500/5',
        badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300',
        text: 'text-blue-600 dark:text-blue-300',
        dot: 'bg-blue-500',
        icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300',
    },
    violet: {
        border: 'border-violet-200 dark:border-violet-500/25',
        surface: 'bg-violet-50/55 dark:bg-violet-500/5',
        badge: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300',
        text: 'text-violet-600 dark:text-violet-300',
        dot: 'bg-violet-500',
        icon: 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
    },
    orange: {
        border: 'border-orange-200 dark:border-orange-500/25',
        surface: 'bg-orange-50/55 dark:bg-orange-500/5',
        badge: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300',
        text: 'text-orange-600 dark:text-orange-300',
        dot: 'bg-orange-500',
        icon: 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300',
    },
    rose: {
        border: 'border-rose-200 dark:border-rose-500/25',
        surface: 'bg-rose-50/55 dark:bg-rose-500/5',
        badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300',
        text: 'text-rose-600 dark:text-rose-300',
        dot: 'bg-rose-500',
        icon: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
    },
};

const slaGroups: SlaGroup[] = [
    {
        hours: 8,
        subtitle: 'Técnico, IA ou adaptação',
        tone: 'mint',
        items: ['Banner', 'Banner para e-mail marketing', 'Banner para site', 'Conversão de arquivo editável (Digital)', 'Criação de Thumbnail', 'Geração de imagem via IA', 'Mascote via IA', 'Mockup', 'Redimensionamento', 'Vetorização'],
    },
    {
        hours: 10,
        subtitle: 'Estruturado e previsível',
        tone: 'blue',
        items: ['Adesivo', 'Apresentação de slides', 'Caderno', 'Camiseta', 'Cartão de visita', 'Cartão postal', 'Catálogo digital', 'Catálogo impresso', 'Convite', 'Cordão para credencial', 'Credencial', 'Ecobag', 'Envelope', 'Fechamento de arquivo impresso', 'Infográfico', 'Marca página', 'Pasta', 'Papel timbrado', 'Relatório', 'Style Guide', 'Tag'],
    },
    {
        hours: 12,
        subtitle: 'Criativo, estratégico ou denso',
        tone: 'violet',
        items: ['Carrossel', 'Cartaz', 'Conceito visual', 'Display de mesa', 'DOOH Estático', 'E-book', 'Edição de imagem', 'Embalagem', 'Estático', 'Flyer', 'Folder', 'Folheto', 'Ilustração', 'Key visual', 'Layout de e-mail marketing', 'Layout de landing page', 'Livro/Revista', 'Logo', 'Newsletter', 'OOH Impresso', 'Storyboard', 'Testeira', 'Wobbler'],
    },
    {
        hours: 24,
        subtitle: 'Copy, vídeo, áudio e web',
        tone: 'orange',
        items: ['Animação de banner em HTML5', 'Animação de imagem via IA', 'Animado', 'Anúncio responsivo para Google Ads', 'Avatar via IA', 'Conteúdo para apresentação', 'Conteúdo para banner web', 'Conteúdo para blog', 'Conteúdo para carrossel', 'Conteúdo para e-book', 'Conteúdo para e-mail marketing', 'Conteúdo para infográfico', 'Conteúdo para landing page', 'Conteúdo para locução', 'Conteúdo para peça impressa', 'Conteúdo para redes sociais', 'Conversão de arquivo (Vídeo & Áudio)', 'Criação de conteúdo estratégico', 'Criação de conteúdo publicitário', 'DOOH Animado', 'Edição de áudio', 'Edição de vídeo', 'Edição de vídeo Lite', 'Geração de vídeo via IA', 'GIF animado', 'HTML para e-mail marketing', 'HTML para landing page', 'Legenda para redes sociais', 'Legendagem', 'Legendagem via IA', 'Locução', 'Locução via IA', 'Montagem de e-mail em plataforma do cliente', 'Montagem de site em plataforma do cliente', 'Naming', 'Redes sociais', 'Revisão de legenda para vídeo', 'Revisão de texto', 'Roteiro para vídeo', 'Slogan', 'Totem', 'Tradução de texto', 'Vídeo Institucional'],
    },
];

const consumingStatuses = ['Nova', 'Análise CQS', 'Análise CAM', 'Iniciar', 'Alterar', 'Esperando aceite', 'Em pausa', 'Em andamento', 'Aprovação CAM', 'Aprovação CQS'];
const pausedStatuses = ['Pendência Briefing', 'Aprovação Externa', 'Bloqueada', 'Finalizada', 'Edição pelo cliente'];

const AllyoSlaContent = () => {
    const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

    return (
        <div className="space-y-10">
            <section className="overflow-hidden rounded-[18px] border border-indigo-200 bg-gradient-to-br from-[#eef3ff] via-white to-[#eeeeff] p-6 dark:border-indigo-500/20 dark:from-indigo-950/30 dark:via-zinc-950 dark:to-violet-950/30 sm:p-8">
                <div className="flex flex-wrap gap-2">
                    <Badge tone="blue">Plataforma Faster</Badge>
                    <Badge tone="violet">Operação</Badge>
                </div>
                <p className="mt-5 max-w-[720px] text-sm leading-7 text-[#585c69] dark:text-zinc-300">O período sob responsabilidade da Faster para execução, análise, priorização, QA e movimentação interna da tarefa. Aqui você entende como ele é calculado, quando começa, quando pausa e como varia por versão e complexidade.</p>
            </section>

            <ContentSection title="Fórmula oficial" icon={Calculator}>
                <div className="grid gap-[10px] lg:grid-cols-2">
                    <Card>
                        <Eyebrow>SLA V1</Eyebrow>
                        <Formula><span>SLA V1 = </span><strong>multiplicador</strong><span> × </span><strong>horas por crédito</strong></Formula>
                        <p className="mt-4 text-[11px] leading-5 text-[#737782] dark:text-zinc-400">Os créditos seguem fracionados para consumo e cobrança. Apenas o multiplicador usado no prazo é arredondado para cima.</p>
                    </Card>
                    <Card>
                        <Eyebrow>Exemplos</Eyebrow>
                        <div className="mt-3 space-y-2">
                            <FormulaExample label="0,5 em Item de 12h" multiplier="× 1" result="12h" />
                            <FormulaExample label="1,4 em Item de 8h" multiplier="× 2" result="16h" />
                            <FormulaExample label="2,1 em Item de 24h" multiplier="× 3" result="72h" />
                            <FormulaExample label="3,5 em Item de 12h" multiplier="× 4" result="48h" />
                        </div>
                    </Card>
                </div>
            </ContentSection>

            <ContentSection title="SLA de crédito por item" icon={Gauge}>
                <div className="grid items-stretch gap-[10px] sm:grid-cols-2 xl:grid-cols-4">
                    {slaGroups.map((group) => {
                        const expanded = Boolean(expandedGroups[group.hours]);
                        return <SlaGroupCard key={group.hours} group={group} expanded={expanded} onToggle={() => setExpandedGroups((current) => ({ ...current, [group.hours]: !expanded }))} />;
                    })}
                </div>
            </ContentSection>

            <section className="rounded-[18px] border border-violet-300 bg-gradient-to-r from-violet-50 via-white to-blue-50 p-6 shadow-[0_10px_32px_rgba(124,58,237,.08)] dark:border-violet-500/25 dark:from-violet-950/20 dark:via-zinc-950 dark:to-blue-950/20 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3"><IconBox icon={TimerReset} tone="violet" /><h3 className="font-season text-[24px]">Regra de início do SLA</h3></div>
                    <Badge tone="violet">Atenção</Badge>
                </div>
                <p className="mt-5 max-w-[760px] text-xs leading-6 text-[#656977] dark:text-zinc-400">O momento em que o cronômetro começa depende do horário de abertura ou aprovação da tarefa. Atenção a estes três cenários:</p>
                <div className="mt-5 grid gap-[10px] lg:grid-cols-3">
                    <RuleTile label="Antes das 09h" value="Começa às 09h do mesmo dia" />
                    <RuleTile label="Após 18h ou folga" value="Começa às 09h do próximo dia útil" />
                    <RuleTile label="Simulações após 16h" value="Iniciam no próximo dia útil" />
                </div>
            </section>

            <ContentSection title="O que consome (e o que não consome) SLA" icon={Gauge}>
                <div className="grid gap-[10px] lg:grid-cols-2">
                    <StatusPanel icon={CirclePlay} title="Consome SLA" statuses={consumingStatuses} tone="mint" />
                    <StatusPanel icon={CirclePause} title="Não consome" statuses={pausedStatuses} tone="rose" />
                </div>
            </ContentSection>

            <ContentSection title="Calendário operacional" icon={CalendarDays}>
                <div className="grid gap-[10px] lg:grid-cols-2">
                    <Card>
                        <Clock3 size={19} className="text-blue-600 dark:text-blue-300" />
                        <strong className="mt-4 block text-xs">Janela operacional</strong>
                        <p className="mt-2 text-[clamp(22px,3vw,30px)] font-bold leading-tight text-blue-600 dark:text-blue-300">09h às 18h de segunda a sexta</p>
                        <p className="mt-2 text-[11px] leading-5 text-[#737782] dark:text-zinc-400">Pausa no fim da janela e retoma no próximo horário útil. Nunca vence fora da janela comercial.</p>
                    </Card>
                    <Card>
                        <XCircle size={19} className="text-rose-500" />
                        <strong className="mt-4 block text-xs">Não conta tempo em</strong>
                        <DotList items={['Sábados e domingos', 'Feriados nacionais', 'Feriados oficiais de SP']} tone="rose" />
                    </Card>
                </div>
            </ContentSection>

            <ContentSection title="Ciclo da versão" icon={Sparkles}>
                <div className="grid gap-[10px] lg:grid-cols-2">
                    <Card>
                        <div className="flex items-center gap-3"><IconBox icon={CirclePlay} tone="blue" /><Badge tone="blue">Início da versão</Badge></div>
                        <p className="mt-5 text-xs leading-6 text-[#5f6470] dark:text-zinc-400">O SLA começa quando a task fica efetivamente disponível para execução da versão.</p>
                        <FlowLabel label="Status de início V1" value="Iniciar" tone="mint" />
                        <p className="mt-3 text-[11px] leading-5 text-[#686d78] dark:text-zinc-400">Nova → qualquer status operacional<br />Bloqueada → Nova (tasks de Stack)</p>
                        <FlowLabel label="Status de início V2+" value="Alterar" tone="orange" />
                        <p className="mt-3 text-[11px] leading-5 text-[#686d78] dark:text-zinc-400">Aprovação Externa → Análise CQS (nova versão)</p>
                    </Card>
                    <Card>
                        <div className="flex items-center gap-3"><IconBox icon={CheckCircle2} tone="mint" /><Badge tone="mint">Fim da versão</Badge></div>
                        <p className="mt-5 text-xs leading-6 text-[#5f6470] dark:text-zinc-400">Cada versão termina quando a entrega vai para Aprovação Externa.</p>
                        <div className={`mt-5 flex items-center gap-3 rounded-[10px] border px-4 py-3 ${ALLYO_BORDER}`}><Badge tone="blue">Qualquer status</Badge><ArrowRight size={14} className="text-[#858a94]" /><Badge tone="mint">Aprovação Externa</Badge></div>
                        <p className="mt-4 text-[11px] leading-5 text-[#737782] dark:text-zinc-400">O tempo em Aprovação Externa não consome SLA. Se o cliente pedir alterações e a task voltar para Análise CQS, começa uma nova versão, medida separadamente.</p>
                    </Card>
                </div>
            </ContentSection>

            <ContentSection title="SLA por versão" icon={Layers3}>
                <div className="grid gap-[10px] lg:grid-cols-2">
                    <ToneCard tone="blue">
                        <div className="flex items-center justify-between gap-3"><Badge tone="blue">V1</Badge><Eyebrow>Primeira versão</Eyebrow></div>
                        <strong className="mt-5 block text-sm">Calculado pelos créditos da task</strong>
                        <Formula><span>SLA V1 = multiplicador × horas por crédito</span></Formula>
                        <div className="mt-4 rounded-[12px] border border-black/8 bg-white/50 p-4 text-[11px] leading-5 text-[#656a76] dark:border-white/10 dark:bg-black/10 dark:text-zinc-400"><Eyebrow>Exemplo</Eyebrow><p className="mt-2">Vídeo via IA: 6 segundos<br />Bloco operacional: 5 segundos → 2 blocos<br />Créditos: 1,4 / Multiplicador: 2</p></div>
                    </ToneCard>
                    <ToneCard tone="violet">
                        <div className="flex items-center justify-between gap-3"><Badge tone="violet">V2+</Badge><Eyebrow>Alteração incremental</Eyebrow></div>
                        <strong className="mt-5 block text-sm">SLA V2+ = 8h ou 24h</strong>
                        <div className="mt-4 space-y-2"><RateRow label="Design Gráfico" value="8h úteis" /><RateRow label="Demais especialidades" value="24h úteis" /></div>
                        <p className="mt-4 text-[11px] leading-5 text-[#737782] dark:text-zinc-400">V2+ não multiplica créditos pelo SLA por crédito. Vale quando a alteração preserva a entrega anterior.</p>
                    </ToneCard>
                </div>
                <div className="mt-[10px] grid gap-[10px] lg:grid-cols-2">
                    <CompactRule title="Aplica V2+ quando há" tone="mint" items={['Refinamento', 'Correção pontual', 'Adequação na estrutura', 'Manutenção da narrativa', 'Manutenção da direção', 'Reaproveitamento estrutural']} />
                    <CompactRule title="Volta para lógica de V1" tone="rose" items={['Aumento de escopo', 'Refação total', 'Nova narrativa', 'Novo conceito', 'Nova direção visual', 'Mudança estrutural']} />
                </div>
            </ContentSection>

            <div className="grid gap-[10px] lg:grid-cols-2">
                <Card>
                    <div className="flex items-center gap-3"><IconBox icon={PackageOpen} tone="orange" /><Badge tone="orange">Tasks em Stack</Badge></div>
                    <p className="mt-5 text-xs leading-6 text-[#5f6470] dark:text-zinc-400">A criação da Stack não inicia o SLA. Tasks dependentes ficam <strong>Bloqueadas</strong> e só começam a consumir SLA no evento Bloqueada → Nova.</p>
                    <DotList items={['Liberações fora da janela são ajustadas para o próximo horário útil.', 'Com múltiplas dependências, a previsão usa a mais tardia entre as bloqueadoras.', 'Alteração de dependência recalcula o cronograma completo.']} tone="orange" />
                </Card>
                <Card>
                    <div className="flex items-center gap-3"><IconBox icon={Zap} tone="violet" /><Badge tone="violet">Booster</Badge></div>
                    <p className="mt-5 text-xs leading-6 text-[#5f6470] dark:text-zinc-400">Cada Booster reduz o equivalente operacional de <strong>1 crédito</strong> no SLA da task. A equivalência em horas depende da relação operacional do item.</p>
                    <div className="mt-5 rounded-[12px] border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-500/25 dark:bg-rose-500/5"><Eyebrow className="text-rose-600 dark:text-rose-300">Booster não é garantia</Eyebrow><p className="mt-2 text-[11px] leading-5 text-[#6f6570] dark:text-zinc-400">Não remove dependências, não altera a ordem da Stack e depende de fila, capacidade e contexto da demanda.</p></div>
                </Card>
            </div>

            <ContentSection title="Produção, SLA e tempo percebido" icon={TrendingUp}>
                <div className="grid gap-[10px] lg:grid-cols-3">
                    <DefinitionCard label="Produção ativa" tone="mint">Execução operacional efetiva, no status em Em andamento.</DefinitionCard>
                    <DefinitionCard label="SLA operacional" tone="blue">Todo o período sob responsabilidade da Faster: fila, análise, QA, execução.</DefinitionCard>
                    <DefinitionCard label="Tempo percebido" tone="orange">Período externo total entre abertura e conclusão, do ponto de vista do cliente.</DefinitionCard>
                </div>
                <p className="mt-4 text-[11px] leading-5 text-[#737782] dark:text-zinc-400">Nunca confunda os três conceitos: o cliente enxerga o tempo percebido, mas o SLA mede apenas o que está sob nossa responsabilidade operacional.</p>
            </ContentSection>

            <ContentSection title="Exemplos de contabilização de prazo" icon={Calculator} description="Veja como o cronômetro é aplicado em diferentes cenários, combinando regra de início, horas por crédito e dias úteis.">
                <div className="grid gap-[10px] lg:grid-cols-3">
                    <ExampleCard tone="mint" number="1" title="Banner" rate="8h por crédito" credits="2 créditos" entry="ter. 23/06/2026, 10h" steps={['SLA V1 = 2 × 8h = 16h úteis', 'Jornada de 9h às 18h (9h úteis/dia)']} result="25/06/2026 às 12h" />
                    <ExampleCard tone="violet" number="2" title="Apresentação de slides" rate="10h por crédito" credits="3 créditos" entry="sex. 26/06/2026, 19h" steps={['Início do SLA: 29/06/2026 às 09h', 'SLA V1 = 3 × 10h = 30h úteis']} result="02/07/2026 às 12h" />
                    <ExampleCard tone="orange" number="3" title="Edição de vídeo" rate="24h por crédito" credits="2 créditos" entry="qua. 24/06/2026, 08h" steps={['Início do SLA: 24/06/2026 às 09h', 'SLA V1 = 2 × 24h = 48h úteis (≈ 5 dias úteis e meio)']} result="01/07/2026 às 09h" />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-2"><Badge tone="blue">Revisões (V2+)</Badge><span className="text-[11px] text-[#737782] dark:text-zinc-400">Após a 1ª entrega, o SLA passa a ser fixo: 8h para Design Gráfico e 24h para demais especialidades.</span></div>
                <div className="mt-4 grid gap-[10px] lg:grid-cols-3">
                    <ExampleCard tone="mint" number="4" title="Banner (V2)" rate="V2+ · 8h fixas" credits="Revisão" entry="qui. 25/06/2026, 14h" steps={['Especialidade: Design Gráfico', 'SLA V2 = 8h úteis (fixo, independe de créditos)']} result="26/06/2026 às 14h" />
                    <ExampleCard tone="violet" number="5" title="Apresentação de slides (V3)" rate="V2+ · 8h fixas" credits="Revisão" entry="qui. 02/07/2026, 16h" steps={['Especialidade: Design Gráfico', 'SLA V3 = 8h úteis (mesma regra de V2)']} result="03/07/2026 às 15h" />
                    <ExampleCard tone="orange" number="6" title="Edição de vídeo (V2)" rate="V2+ · 24h fixas" credits="Revisão" entry="qua. 01/07/2026, 10h" steps={['Especialidade: Vídeo & Áudio (demais)', 'SLA V2 = 24h úteis (fixo)']} result="02/07/2026 às 10h" />
                </div>
            </ContentSection>
        </div>
    );
};

const ContentSection = ({ title, icon: Icon, description, children }: { title: string; icon: LucideIcon; description?: string; children: ReactNode }) => <section><div className="mb-5 flex items-center gap-2"><Icon size={17} className="text-blue-600 dark:text-blue-300" /><h3 className="font-season text-[24px]">{title}</h3></div>{description && <p className="-mt-3 mb-5 max-w-[720px] text-xs leading-6 text-[#686d78] dark:text-zinc-400">{description}</p>}{children}</section>;
const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => <article className={`rounded-[16px] border bg-white p-5 dark:bg-zinc-950 sm:p-6 ${ALLYO_BORDER} ${className}`}>{children}</article>;
const Badge = ({ tone, children }: { tone: Tone; children: ReactNode }) => <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${toneStyles[tone].badge}`}>{children}</span>;
const Eyebrow = ({ children, className = '' }: { children: ReactNode; className?: string }) => <span className={`text-[9px] font-bold uppercase tracking-[.12em] text-[#7d8290] dark:text-zinc-500 ${className}`}>{children}</span>;
const Formula = ({ children }: { children: ReactNode }) => <div className={`mt-3 rounded-[12px] border bg-[#fcfcfd] px-4 py-3 font-mono text-xs text-[#39404d] dark:bg-zinc-900 dark:text-zinc-200 ${ALLYO_BORDER}`}>{children}</div>;
const FormulaExample = ({ label, multiplier, result }: { label: string; multiplier: string; result: string }) => <div className={`flex items-center justify-between gap-4 rounded-full border px-3 py-1.5 text-[11px] ${ALLYO_BORDER}`}><span><strong>{label.split(' ')[0]}</strong> {label.substring(label.indexOf(' ') + 1)}</span><span className="shrink-0">{multiplier} → <strong className="text-blue-600 dark:text-blue-300">{result}</strong></span></div>;
const IconBox = ({ icon: Icon, tone }: { icon: LucideIcon; tone: Tone }) => <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${toneStyles[tone].icon}`}><Icon size={18} /></span>;
const RuleTile = ({ label, value }: { label: string; value: string }) => <div className={`rounded-[14px] border bg-white/70 p-4 dark:bg-zinc-950/60 ${ALLYO_BORDER}`}><Eyebrow>{label}</Eyebrow><strong className="mt-2 block text-sm">{value}</strong></div>;

const SlaGroupCard = ({ group, expanded, onToggle }: { group: SlaGroup; expanded: boolean; onToggle: () => void }) => {
    const styles = toneStyles[group.tone];
    const visibleItems = expanded ? group.items : group.items.slice(0, 8);
    return <article className={`flex h-full flex-col rounded-[16px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-start justify-between gap-3"><Badge tone={group.tone}>{group.hours}h por crédito</Badge><span className="flex items-baseline gap-1"><strong className="text-2xl">{group.items.length}</strong><small className="text-[9px] text-[#858a94]">itens</small></span></div><p className="mt-3 text-[11px] text-[#737782] dark:text-zinc-400">{group.subtitle}</p><ul className="mt-4 flex-1 space-y-2">{visibleItems.map((item) => <li key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#555b68] dark:text-zinc-400"><span className={`mt-2 h-1 w-1 shrink-0 rounded-full ${styles.dot}`} />{item}</li>)}</ul>{group.items.length > 8 && <button type="button" aria-expanded={expanded} onClick={onToggle} className={`mt-5 w-fit text-left text-[11px] font-medium transition hover:opacity-70 ${styles.text}`}>{expanded ? 'Mostrar menos' : `Mostrar mais (+${group.items.length - 8})`}</button>}</article>;
};

const StatusPanel = ({ icon: Icon, title, statuses, tone }: { icon: LucideIcon; title: string; statuses: string[]; tone: Tone }) => <article className={`rounded-[16px] border p-5 sm:p-6 ${toneStyles[tone].border} ${toneStyles[tone].surface}`}><div className="flex items-center gap-3"><IconBox icon={Icon} tone={tone} /><Badge tone={tone}>{title}</Badge></div><ul className="mt-5 grid gap-2 sm:grid-cols-2">{statuses.map((status) => <li key={status} className={`flex items-center gap-2 rounded-full border bg-white/55 px-3 py-1.5 text-[11px] dark:bg-black/10 ${toneStyles[tone].border}`}>{tone === 'rose' ? <XCircle size={12} className={toneStyles[tone].text} /> : <CheckCircle2 size={12} className={toneStyles[tone].text} />}{status}</li>)}</ul></article>;
const DotList = ({ items, tone }: { items: string[]; tone: Tone }) => <ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2 text-[11px] leading-5 text-[#666c78] dark:text-zinc-400"><span className={`mt-2 h-1 w-1 shrink-0 rounded-full ${toneStyles[tone].dot}`} />{item}</li>)}</ul>;
const FlowLabel = ({ label, value, tone }: { label: string; value: string; tone: Tone }) => <div className="mt-4 flex flex-wrap items-center gap-2"><Eyebrow>{label}</Eyebrow><Badge tone={tone}>{value}</Badge></div>;
const ToneCard = ({ tone, children }: { tone: Tone; children: ReactNode }) => <article className={`rounded-[16px] border p-5 sm:p-6 ${toneStyles[tone].border} ${toneStyles[tone].surface}`}>{children}</article>;
const RateRow = ({ label, value }: { label: string; value: string }) => <div className={`flex items-center justify-between gap-4 rounded-[12px] border bg-white/60 px-4 py-3 text-xs dark:bg-black/10 ${ALLYO_BORDER}`}><span>{label}</span><strong className="text-violet-600 dark:text-violet-300">{value}</strong></div>;
const CompactRule = ({ title, tone, items }: { title: string; tone: Tone; items: string[] }) => <article className={`rounded-[14px] border p-5 ${toneStyles[tone].border} ${toneStyles[tone].surface}`}><div className="flex items-center gap-2"><CircleAlert size={14} className={toneStyles[tone].text} /><Eyebrow className={toneStyles[tone].text}>{title}</Eyebrow></div><ul className="mt-3 grid gap-x-7 gap-y-1 sm:grid-cols-2">{items.map((item) => <li key={item} className="text-[11px] leading-5 text-[#5f6470] before:mr-1 before:content-['•'] dark:text-zinc-400">{item}</li>)}</ul></article>;
const DefinitionCard = ({ label, tone, children }: { label: string; tone: Tone; children: ReactNode }) => <Card><Badge tone={tone}>{label}</Badge><p className="mt-4 text-xs leading-6 text-[#5f6470] dark:text-zinc-400">{children}</p></Card>;

const ExampleCard = ({ tone, number, title, rate, credits, entry, steps, result }: { tone: Tone; number: string; title: string; rate: string; credits: string; entry: string; steps: string[]; result: string }) => <article className={`rounded-[16px] border p-5 ${toneStyles[tone].border} ${toneStyles[tone].surface}`}><div className="flex items-center justify-between gap-3"><Badge tone={tone}>Exemplo {number}</Badge><Eyebrow>{rate}</Eyebrow></div><h4 className="mt-4 text-lg font-semibold">{title}</h4><div className="mt-4 grid gap-2 sm:grid-cols-2"><DataTile label="Créditos" value={credits} /><DataTile label="Entrada" value={entry} /></div><ol className="mt-4 space-y-2">{steps.map((step, index) => <li key={step} className="flex items-start gap-2 text-[11px] leading-5 text-[#5f6470] dark:text-zinc-400"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[8px] dark:border-white/10 dark:bg-zinc-900">{index + 1}</span>{step}</li>)}</ol><div className={`mt-4 flex items-center gap-3 rounded-[12px] border bg-white/60 px-4 py-3 text-[11px] dark:bg-black/10 ${ALLYO_BORDER}`}><ArrowRight size={14} className="shrink-0 text-blue-600 dark:text-blue-300" /><span>Entrega prevista: <strong>{result}</strong></span></div></article>;
const DataTile = ({ label, value }: { label: string; value: string }) => <div className={`rounded-[12px] border bg-white/55 px-3 py-2 dark:bg-black/10 ${ALLYO_BORDER}`}><Eyebrow>{label}</Eyebrow><strong className="mt-1 block text-xs">{value}</strong></div>;

export default AllyoSlaContent;
