import { useEffect, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Database,
    Layers3,
    MessageSquare,
    Minus,
    Play,
    Plus,
    ShieldAlert,
    Sparkles,
    UsersRound,
    XCircle,
    Zap,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';
import { allyoService, type AllyoBoosterRequest } from '../../../../services/allyoService';
import { useToast } from '../../../../context/ToastContext';

const singleTaskSteps = [
    'Recusar o booster.',
    'Informar o cliente sobre o motivo e o ajuste necessário.',
    'Corrigir a tarefa: créditos, briefing e estrutura.',
    'Confirmar se o cliente ainda tem interesse no booster.',
    'Orientar uma nova aplicação com a tarefa atualizada no status Nova.',
];

const stackChecklist = [
    'Todas as tarefas da Stack estão corretamente estruturadas',
    'Os créditos de cada etapa fazem sentido',
    'A sequência é operacionalmente viável dentro do prazo',
    'Todos os responsáveis estão disponíveis e alinhados',
];

const alignmentGoals = [
    'Definir ordem de execução',
    'Ajustar prazos internos',
    'Identificar gargalos',
    'Garantir comprometimento do time',
    'Definir uma estratégia viável para o booster',
];

const bestPractices = [
    'Validar o briefing antes de aprovar',
    'Garantir que os créditos estejam corretos',
    'Alinhar a Stack com todo o time envolvido',
    'Priorizar etapas críticas do fluxo',
    'Usar aprovação interna com critério',
];

const AllyoBoosterContent = () => {
    const { addToast } = useToast();
    const [requests, setRequests] = useState<AllyoBoosterRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const loadRequests = () => allyoService.getBoosterRequests()
        .then((response) => setRequests(response.requests || []))
        .catch((error) => console.warn('[AllyoBoosterContent] Não foi possível carregar Boosters:', error))
        .finally(() => setIsLoading(false));
    useEffect(() => { void loadRequests(); }, []);
    const decide = async (request: AllyoBoosterRequest, status: 'APPROVED' | 'REJECTED') => {
        try {
            await allyoService.decideBooster(request.id, status);
            await loadRequests();
            addToast({ type: 'success', title: status === 'APPROVED' ? 'Booster aprovado' : 'Booster recusado' });
        } catch (error: any) {
            addToast({ type: 'error', title: 'Não foi possível decidir o Booster', message: error.response?.data?.message || 'Tente novamente.' });
        }
    };
    return (
    <div className="space-y-12">
        <section className="overflow-hidden rounded-[18px] border border-indigo-100 bg-gradient-to-br from-[#f3f3ff] via-white to-[#f8f9ff] p-6 dark:border-indigo-500/20 dark:from-indigo-950/25 dark:via-zinc-950 dark:to-zinc-900 sm:p-8">
            <div className="grid items-center gap-8 xl:grid-cols-[.95fr_1.05fr]">
                <div>
                    <div className="flex flex-wrap gap-2"><Pill icon={Sparkles}>Sprint de excelência</Pill><Pill icon={Zap}>Booster</Pill></div>
                    <h2 className="mt-5 max-w-[680px] font-season text-[clamp(32px,4vw,48px)] leading-[1.05]">Acelerador de prazo, com validação obrigatória.</h2>
                    <p className="mt-5 max-w-[680px] text-sm leading-7 text-[#626875] dark:text-zinc-300">Booster antecipa a entrega de uma tarefa ao reduzir o equivalente operacional de um crédito no SLA. Toda solicitação precisa passar por validação antes da aprovação, garantindo visibilidade e qualidade da entrega.</p>
                    <div className="mt-6 grid gap-[10px] sm:grid-cols-2">
                        <MiniInfo icon={Clock3} title="O que é">Acelerador de prazo que antecipa a entrega de uma tarefa.</MiniInfo>
                        <MiniInfo icon={ShieldAlert} title="Ponto crítico" critical>Validar sempre antes de aprovar. Booster sem validação compromete prazo, qualidade e o cliente.</MiniInfo>
                    </div>
                </div>
                <ApprovalCard compact rows={1} credits="1,2 créditos" available="1 Booster" original="04/05/2026" accelerated="30/04/2026" />
            </div>
        </section>

        <Section eyebrow="Tipos de aplicação" title="Dois cenários, dois fluxos de validação" description="Booster em tarefa única e Booster em Stack exigem rotinas diferentes de análise e execução.">
            <div className="grid gap-[10px] xl:grid-cols-2">
                <Panel><Title icon={Sparkles}>Booster em tarefa única</Title><div className="mt-4"><ApprovalCard rows={1} credits="1,2 créditos" available="1 Booster" original="04/05/2026" accelerated="30/04/2026" /></div></Panel>
                <Panel><Title icon={Layers3}>Booster em Stack de tarefas</Title><div className="mt-4"><ApprovalCard rows={4} credits="8,5 créditos" available="2 Boosters" original="28/04/2026" accelerated="24/04/2026" /></div></Panel>
            </div>
        </Section>

        <Section eyebrow="Tarefa única" title="Regra principal: validar o escopo antes de aprovar" description="Garanta que o escopo está correto. Em e-books, por exemplo, a quantidade de páginas precisa ser coerente com os créditos atribuídos. Inconsistências distorcem o prazo e invalidam o booster.">
            <div className="grid gap-[10px] lg:grid-cols-[1.05fr_.95fr]">
                <Panel>
                    <span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#747a85]">Nesses casos</span>
                    <ol className="mt-4 space-y-3">{singleTaskSteps.map((step, index) => <NumberedItem key={step} number={index + 1}>{step}</NumberedItem>)}</ol>
                </Panel>
                <div className="space-y-[10px]">
                    <Alert tone="danger" icon={ShieldAlert}><strong>Problema comum:</strong> créditos incorretos → prazo distorcido → booster inválido.</Alert>
                    <Alert tone="warning" icon={ShieldAlert}>Inconsistência entre páginas e créditos, especialmente em e-books, deve ser revisada antes do aceite.</Alert>
                </div>
            </div>
        </Section>

        <Section eyebrow="Stack de tarefas" title="Prazo único para toda a cadeia" description="Em uma Stack, o prazo antecipado representa a entrega do produto final completo. Não é o prazo de uma etapa intermediária.">
            <Alert tone="danger"><strong>Booster em Stack = entrega do produto final completo, não de uma etapa intermediária.</strong></Alert>
            <Panel className="mt-[10px]">
                <strong className="text-xs">Antes de aprovar o booster, valide:</strong>
                <div className="mt-4 grid gap-[10px] lg:grid-cols-2">{stackChecklist.map((item) => <ChecklistItem key={item}>{item}</ChecklistItem>)}</div>
            </Panel>
        </Section>

        <Section eyebrow="Obrigatório" title="Alinhamento entre áreas antes da aprovação" description="Abra uma conversa com todos os envolvidos para alinhar execução, disponibilidade e prazos.">
            <div className="grid gap-[10px] lg:grid-cols-2">
                <Panel>
                    <Title icon={UsersRound}>Envolvidos na conversa</Title>
                    <div className="mt-4 flex flex-wrap gap-2">{['CQS Copy', 'AD / Analista', 'CQS Motion'].map((role) => <span key={role} className="rounded-full border border-[#dedfe5] bg-[#fafafe] px-3 py-1.5 text-[10px] dark:border-zinc-700 dark:bg-zinc-900">{role}</span>)}</div>
                    <strong className="mt-6 block text-xs">Objetivos do alinhamento</strong>
                    <ul className="mt-3 space-y-2">{alignmentGoals.map((goal) => <li key={goal} className="flex items-center gap-2 text-xs text-[#626874] dark:text-zinc-400"><ArrowRight size={13} className="text-indigo-500" />{goal}</li>)}</ul>
                </Panel>
                <Panel>
                    <Title icon={MessageSquare}>Exemplo de conversa</Title>
                    <div className="mt-4 space-y-2">
                        <Message role="Operação">Temos um booster para analisar. A tarefa de copy fica aguardando sua validação; consegue verificar a viabilidade?</Message>
                        <Message role="Especialista">Consigo assumir a etapa, desde que o briefing e os créditos estejam corrigidos.</Message>
                        <Message role="Direção de arte">Para o prazo funcionar, preciso receber o storyboard até o fim do dia.</Message>
                        <Message role="Operação">Combinado. Vou registrar a ordem e só então aprovar a solicitação.</Message>
                    </div>
                </Panel>
            </div>
        </Section>

        <Section eyebrow="Estratégia" title="Como ganhar velocidade na execução da Stack">
            <div className="grid gap-[10px] lg:grid-cols-3">
                <StrategyCard icon={Sparkles} title="Antecipar etapas críticas">Copy e storyboard destravam a cadeia. Aprovações internas nas primeiras etapas reduzem o tempo de validação.</StrategyCard>
                <StrategyCard icon={ShieldAlert} title="Evitar envios intermediários">Mantenha as fases intermediárias dentro do time e não fragmente a aprovação externa.</StrategyCard>
                <StrategyCard icon={CheckCircle2} title="Aprovação externa só no final">Envie ao cliente apenas a entrega completa, conforme a configuração validada do fluxo.</StrategyCard>
            </div>
            <div className="mt-[10px] space-y-[10px]"><Alert tone="danger"><strong>Conte com o suporte da operação e do CAM para validar a decisão.</strong></Alert><Alert tone="warning" icon={ShieldAlert}>A estratégia aumenta a velocidade, mas exige rigor na qualidade para evitar retrabalho nas etapas finais.</Alert></div>
        </Section>

        <Section eyebrow="Regra crítica" title="Aprovar booster é assumir entrega sem atraso" description="Todo Booster solicitado pelo cliente e aprovado pela operação se torna um compromisso fechado de entrega.">
            <Alert tone="danger"><strong>A entrega precisa acontecer no dia e horário acordados, sem margem de atraso.</strong></Alert>
            <div className="mt-[10px] grid gap-[10px] lg:grid-cols-2">
                <article className="rounded-[17px] border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-500/25 dark:bg-rose-500/5"><Title icon={Clock3}>Atraso superior a 10 minutos</Title><p className="mt-4 text-xs leading-6 text-rose-700 dark:text-rose-300">O Booster é removido pela operação e o caso deve ser registrado.</p></article>
                <Panel><strong className="text-xs">Ao aprovar, o time confirma que:</strong><ul className="mt-4 space-y-2">{['O prazo é viável e executável', 'Todas as etapas estão alinhadas', 'Não existem dependências não mapeadas'].map((item) => <ChecklistItem key={item}>{item}</ChecklistItem>)}</ul></Panel>
            </div>
            <div className="mt-[10px] rounded-[13px] bg-[#111b32] px-5 py-4 text-xs font-semibold text-white"><span className="inline-flex items-center gap-2"><Sparkles size={15} />Resumindo: aprovar Booster é assumir entrega sem atraso.</span></div>
        </Section>

        <Section eyebrow="Resumo" title="Quando rejeitar e boas práticas">
            <div className="grid gap-[10px] lg:grid-cols-2">
                <article className="rounded-[17px] border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-500/25 dark:bg-rose-500/5"><strong className="text-xs text-rose-700 dark:text-rose-300">Quando rejeitar</strong><span className="mt-5 block text-[9px] font-bold uppercase tracking-[.1em] text-rose-600">Recusar se houver</span><ul className="mt-3 space-y-2"><RejectItem>Escopo mal definido ou briefing inconsistente</RejectItem><RejectItem>Créditos incorretos</RejectItem></ul><span className="mt-5 block text-[9px] font-bold uppercase tracking-[.1em] text-rose-600">Ação ao rejeitar</span><ol className="mt-3 space-y-2">{['Recusar', 'Ajustar a tarefa', 'Validar interesse no Booster', 'Cliente reaplica com status Nova'].map((item, index) => <NumberedItem key={item} number={index + 1}>{item}</NumberedItem>)}</ol></article>
                <article className="rounded-[17px] border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-500/25 dark:bg-emerald-500/5"><strong className="text-xs text-emerald-700 dark:text-emerald-300">Boas práticas</strong><ul className="mt-5 space-y-3">{bestPractices.map((item) => <ChecklistItem key={item}>{item}</ChecklistItem>)}</ul></article>
            </div>
            <div className="mt-[10px]"><Alert tone="danger" icon={ShieldAlert}>Em caso de dúvida, inconsistência ou necessidade de apoio, acione a pessoa analista de operação responsável e o CAM antes de decidir.</Alert></div>
        </Section>

        <Section eyebrow="Plataforma Faster" title="Gestão de Boosters no painel" description="As solicitações ficam centralizadas no painel, com tarefa, cliente, solicitante, data, quantidade e status.">
            <div className={`overflow-hidden rounded-[17px] border bg-white shadow-sm dark:bg-zinc-950 ${ALLYO_BORDER}`}>
                <div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-[10px]"><thead className="bg-[#f6f7fa] text-[9px] uppercase text-[#717783] dark:bg-zinc-900"><tr>{['Tarefa', 'Solicitante', 'Data', 'Qtd.', 'Novo prazo', 'Status', 'Ações'].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody>{requests.map((request) => <tr key={request.id} className="border-t border-black/6 dark:border-white/10"><td className="px-4 py-3 font-medium">#{request.taskId}</td><td className="px-4 py-3 text-[#69707c] dark:text-zinc-400">{request.requestedByName || 'Usuário Allyo'}</td><td className="px-4 py-3 text-[#69707c] dark:text-zinc-400">{new Date(request.createdAt).toLocaleString('pt-BR')}</td><td className="px-4 py-3">{request.units}</td><td className="px-4 py-3">{new Date(request.acceleratedDeadlineAt).toLocaleString('pt-BR')}</td><td className="px-4 py-3"><span className="rounded-full bg-[#f0f2ec] px-2 py-1 text-[9px] dark:bg-zinc-800">{{ PENDING: 'Pendente', APPROVED: 'Aprovado', REJECTED: 'Recusado' }[request.status]}</span></td><td className="px-4 py-3">{request.status === 'PENDING' ? <span className="flex gap-2"><button type="button" onClick={() => void decide(request, 'APPROVED')} className="rounded-full bg-emerald-600 px-3 py-1.5 font-semibold text-white">Aprovar</button><button type="button" onClick={() => void decide(request, 'REJECTED')} className="rounded-full bg-rose-600 px-3 py-1.5 font-semibold text-white">Recusar</button></span> : '—'}</td></tr>)}</tbody></table></div>
                {!isLoading && requests.length === 0 && <div className="px-6 py-10 text-center text-xs text-[#767c87]">Nenhuma solicitação de Booster registrada.</div>}
            </div>
            <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-[#767c87] dark:text-zinc-500"><Database size={13} />{isLoading ? 'Carregando registros' : `${requests.length} registro(s) operacional(is)`}</div>
        </Section>

        <section className={`rounded-[17px] border bg-white p-6 dark:bg-zinc-950 sm:p-8 ${ALLYO_BORDER}`}><h3 className="font-season text-[26px]">Reforce o aprendizado</h3><p className="mt-3 text-xs leading-6 text-[#676d79] dark:text-zinc-400">Use a gravação da sprint e o material oficial para revisar o processo de análise, aprovação e gestão de Boosters.</p><div className="mt-5 grid gap-[10px] md:grid-cols-2"><ResourceCard title="Gravação da sprint" label="Assistir conteúdo" /><ResourceCard title="Apresentação oficial" label="Consultar material" /></div></section>
    </div>
    );
};

const Section = ({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children: ReactNode }) => <section><span className="text-[9px] font-bold uppercase tracking-[.18em] text-indigo-500">{eyebrow}</span><h3 className="mt-2 font-season text-[clamp(27px,3vw,35px)] leading-tight">{title}</h3>{description && <p className="mb-6 mt-3 max-w-[830px] text-xs leading-6 text-[#686e79] dark:text-zinc-400">{description}</p>}{!description && <div className="mb-6" />}{children}</section>;
const Panel = ({ children, className = '' }: { children: ReactNode; className?: string }) => <article className={`rounded-[17px] border bg-white p-5 shadow-sm dark:bg-zinc-950 sm:p-6 ${ALLYO_BORDER} ${className}`}>{children}</article>;
const Pill = ({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) => <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.06em] text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300"><Icon size={11} />{children}</span>;
const Title = ({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) => <div className="flex items-center gap-2"><Icon size={16} className="text-indigo-500" /><strong className="text-sm">{children}</strong></div>;
const MiniInfo = ({ icon: Icon, title, critical = false, children }: { icon: LucideIcon; title: string; critical?: boolean; children: ReactNode }) => <div className={`rounded-[15px] border p-4 ${critical ? 'border-rose-200 bg-rose-50/60 dark:border-rose-500/25 dark:bg-rose-500/5' : 'border-[#e1e3e9] bg-white/70 dark:border-zinc-700 dark:bg-zinc-900'}`}><div className="flex items-center gap-2"><Icon size={14} className={critical ? 'text-rose-600' : 'text-indigo-500'} /><strong className={`text-xs ${critical ? 'text-rose-700 dark:text-rose-300' : ''}`}>{title}</strong></div><p className={`mt-3 text-[10px] leading-5 ${critical ? 'text-rose-700/80 dark:text-rose-300/80' : 'text-[#6b717c] dark:text-zinc-400'}`}>{children}</p></div>;

const ApprovalCard = ({ rows, credits, available, original, accelerated, compact = false }: { rows: number; credits: string; available: string; original: string; accelerated: string; compact?: boolean }) => {
    const tasks = ['Banner para site', 'Storyboard', 'Transcrição via IA', 'Redes sociais'];
    return <div className="overflow-hidden rounded-[17px] border border-[#e0e2e8] bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-950"><div className="flex items-center gap-3 border-b border-black/7 p-4 dark:border-white/10"><span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"><Zap size={18} /></span><div><strong className="text-xs">Aprovação de Booster</strong><p className="mt-1 text-[9px] text-[#737985] dark:text-zinc-500">Confira impactos em prazo e créditos antes de decidir.</p></div><XCircle size={14} className="ml-auto text-[#a3a7af]" /></div><div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4"><Metric label="Prazo original" value={original} /><Metric label="Prazo com Booster" value={accelerated} /><Metric label="Créditos" value={credits} /><Metric label="Disponíveis" value={available} highlight /></div><div className="overflow-x-auto"><div className="min-w-[590px]"><div className="grid grid-cols-[1.3fr_.55fr_.9fr_.7fr_.7fr_.45fr] bg-[#f6f7fa] px-4 py-2 text-[8px] uppercase text-[#666c77] dark:bg-zinc-900"><span>Tarefa ({rows})</span><span>Créditos</span><span>Responsável</span><span>Prazo original</span><span>Prazo Booster</span><span>Aplicado</span></div>{tasks.slice(0, rows).map((task, index) => <div key={task} className="grid grid-cols-[1.3fr_.55fr_.9fr_.7fr_.7fr_.45fr] items-center border-t border-black/6 px-4 py-2.5 text-[9px] dark:border-white/10"><span>{task}</span><span className="text-[#747a85]">{index === 0 ? '1,2' : index === 1 ? '2' : index === 2 ? '0,5' : '4'}</span><span className="flex items-center gap-1.5 text-[#747a85]"><i className="h-3.5 w-3.5 rounded-full bg-indigo-100" />Time criativo</span><span className="text-[#747a85]">{index ? `${23 + index}/04` : '04/05'}</span><span className="text-[#747a85]">—</span><span className="flex items-center gap-2"><Minus size={12} />0<Plus size={12} /></span></div>)}</div></div>{compact && <div className="grid grid-cols-3 gap-2 border-t border-black/7 p-3 dark:border-white/10"><button className="rounded-full bg-rose-500 px-3 py-2 text-[10px] font-semibold text-white">Recusar</button><button className="rounded-full bg-[#eceef3] px-3 py-2 text-[10px] font-semibold text-[#747985] dark:bg-zinc-800">Aprovar</button><button className="rounded-full border border-[#dfe1e7] px-3 py-2 text-[10px] font-semibold">Fechar</button></div>}</div>;
};

const Metric = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => <div><span className="block text-[8px] text-[#777d87]">{label}</span><strong className={`mt-1 block text-[9px] ${highlight ? 'w-fit rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : ''}`}>{value}</strong></div>;
const NumberedItem = ({ number, children }: { number: number; children: ReactNode }) => <li className="flex items-start gap-3 text-xs leading-5 text-[#5f6571] dark:text-zinc-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[9px] font-bold text-indigo-500 dark:bg-indigo-500/10">{number}</span>{children}</li>;
const ChecklistItem = ({ children }: { children: ReactNode }) => <li className="flex items-start gap-2 rounded-[12px] border border-[#e1e3e8] bg-[#fafafe] px-3 py-2.5 text-xs leading-5 text-[#606672] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />{children}</li>;
const RejectItem = ({ children }: { children: ReactNode }) => <li className="flex items-start gap-2 text-xs text-[#606672] dark:text-zinc-400"><XCircle size={14} className="shrink-0 text-rose-500" />{children}</li>;
const Alert = ({ tone, icon: Icon, children }: { tone: 'danger' | 'warning'; icon?: LucideIcon; children: ReactNode }) => <div className={`flex items-start gap-3 rounded-[13px] border px-4 py-3 text-xs leading-5 ${tone === 'danger' ? 'border-rose-500 bg-rose-500 text-white' : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'}`}>{Icon ? <Icon size={15} className="mt-0.5 shrink-0" /> : <span className="shrink-0">👉</span>}<div>{children}</div></div>;
const Message = ({ role, children }: { role: string; children: ReactNode }) => <div className="flex items-start gap-3"><span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-500/20" /><div className="flex-1 rounded-[13px] border border-[#e2e3e8] bg-[#fafafe] p-3 dark:border-zinc-700 dark:bg-zinc-900"><strong className="text-[10px]">{role}</strong><p className="mt-1 text-[10px] leading-5 text-[#6d737f] dark:text-zinc-400">{children}</p></div></div>;
const StrategyCard = ({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) => <Panel><span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10"><Icon size={16} /></span><strong className="mt-5 block text-xs">{title}</strong><p className="mt-3 text-[10px] leading-5 text-[#6a707c] dark:text-zinc-400">{children}</p></Panel>;
const ResourceCard = ({ title, label }: { title: string; label: string }) => <div className="overflow-hidden rounded-[15px] border border-indigo-200 bg-gradient-to-br from-indigo-700 via-violet-600 to-fuchsia-400 p-5 text-white dark:border-indigo-500/30"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><Play size={17} className="fill-white" /></span><h4 className="mt-8 font-season text-[22px]">{title}</h4><span className="mt-2 inline-flex items-center gap-2 text-[10px] font-semibold">{label}<ArrowRight size={12} /></span></div>;

export default AllyoBoosterContent;
