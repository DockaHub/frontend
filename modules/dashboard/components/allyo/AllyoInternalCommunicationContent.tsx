import type { LucideIcon } from 'lucide-react';
import {
    AlertTriangle,
    AtSign,
    BellRing,
    CalendarClock,
    CheckCircle2,
    ClipboardList,
    Hash,
    Headphones,
    Link2,
    MessageSquare,
    MessagesSquare,
    Palette,
    Pin,
    ShieldCheck,
    Sparkles,
    UsersRound,
    Workflow,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

const habits = [
    { icon: Hash, title: 'Use o espaço correto', text: 'Assuntos operacionais devem ficar no projeto, tarefa ou conversa correspondente — não em mensagens soltas.' },
    { icon: AtSign, title: 'Marque as pessoas certas', text: 'Mencione responsáveis e decisores. Evite notificar quem não precisa participar daquele contexto.' },
    { icon: MessagesSquare, title: 'Mantenha o contexto agrupado', text: 'Responda na conversa existente e preserve o histórico, especialmente quando houver decisões ou mudanças.' },
    { icon: Pin, title: 'Destaque o que importa', text: 'Links, documentos, decisões e combinados recorrentes devem permanecer fáceis de localizar.' },
    { icon: Link2, title: 'Comece pela tarefa', text: 'Conversas sobre execução devem partir do link ou da identificação da tarefa, evitando dúvidas sobre o escopo.' },
    { icon: CalendarClock, title: 'Padronize agendamentos', text: 'Informe objetivo, participantes, cliente ou projeto, data, horário e material de apoio.' },
];

const channels = [
    { icon: BellRing, eyebrow: 'Toda a equipe', title: 'Comunicados e movimentos importantes', audience: 'Liderança · Operação · Time criativo', text: 'Anúncios oficiais, mudanças de processo, novidades relevantes e informações que afetam várias frentes.', tone: 'green' as const },
    { icon: ClipboardList, eyebrow: 'Projetos e tarefas', title: 'Contexto de execução', audience: 'Responsáveis · Revisores · Atendimento', text: 'Dúvidas, decisões, entregas, alterações e alinhamentos vinculados ao trabalho em andamento.', tone: 'neutral' as const },
    { icon: UsersRound, eyebrow: 'Clientes e carteiras', title: 'Movimentações de atendimento', audience: 'CAM · CAS · CQS · Liderança', text: 'Entrada de clientes, mudanças de carteira, riscos, saúde da conta e decisões de relacionamento.', tone: 'blue' as const },
    { icon: Headphones, eyebrow: 'Plataforma e produto', title: 'Suporte, novidades e dúvidas', audience: 'Operação · Produto · Tech', text: 'Incidentes, comportamentos inesperados, melhorias, lançamentos e dúvidas rápidas sobre o uso da Allyo.', tone: 'blue' as const },
    { icon: Sparkles, eyebrow: 'Excelência Criativa', title: 'Rotina e cultura da área', audience: 'CESM · CAM · CAS · CQS · AD', text: 'Rituais, padrões, aprendizados, indicadores e temas que fortalecem a qualidade da operação.', tone: 'orange' as const },
    { icon: Palette, eyebrow: 'Especialidades criativas', title: 'Alinhamentos técnicos', audience: 'Direção · Qualidade · Especialistas', text: 'Dúvidas específicas, referências, critérios técnicos e orientações para cada especialidade.', tone: 'violet' as const },
];

export const AllyoInternalCommunicationContent = () => (
    <div className="space-y-10">
        <section className={`rounded-[14px] border bg-gradient-to-br from-[#f2f5eb] via-white to-[#f5f5f0] p-6 dark:from-[#172018] dark:via-zinc-950 dark:to-zinc-900 sm:p-10 ${ALLYO_BORDER}`}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd8b0] bg-white/80 px-3 py-1 text-[10px] font-semibold text-[#708346] dark:border-[#9db669]/30 dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><MessageSquare size={12} /> Comunicação interna</span>
            <h2 className="mt-6 max-w-[900px] font-season text-[clamp(30px,4vw,48px)] font-normal leading-[1.08]">Contexto é o coração da operação. Comunique com intenção.</h2>
            <p className="mt-5 max-w-[820px] text-sm leading-7 text-[#656565] dark:text-zinc-400">A comunicação do time acontece dentro do ecossistema ManySpace e deve acompanhar projetos, tarefas e decisões. O uso correto de cada espaço garante <strong className="text-black dark:text-white">agilidade, clareza e rastreabilidade.</strong></p>
        </section>

        <PlaybookSection eyebrow="Boas práticas de uso" title="Seis hábitos que mantêm a operação fluindo">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-3">
                {habits.map((habit, index) => <HabitCard key={habit.title} {...habit} active={index === 2} />)}
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Exemplos práticos" title="Como abrir uma conversa">
            <div className="grid gap-[10px] lg:grid-cols-2">
                <ExampleCard icon={Link2} label="Conversa sobre uma tarefa">
                    <div className={`rounded-[12px] border bg-[#fafafa] p-4 dark:bg-zinc-900 ${ALLYO_BORDER}`}>
                        <strong className="text-xs">@Responsável</strong>
                        <span className="ml-2 text-[10px] text-[#999]">na tarefa #46779</span>
                        <p className="mt-3 text-xs leading-5 text-[#555] dark:text-zinc-300"><strong>Contexto:</strong> o cliente solicitou ajuste no prazo de entrega.</p>
                        <p className="mt-2 rounded-[8px] border-l-2 border-[#9db669] bg-white px-3 py-2 text-[11px] leading-5 text-[#777] dark:bg-zinc-950 dark:text-zinc-400">Consegue revisar a capacidade e confirmar o novo prazo até 15h?</p>
                    </div>
                    <em className="mt-3 block text-[10px] leading-5 text-[#777]">Identifique a tarefa, explique o contexto e termine com uma ação clara.</em>
                </ExampleCard>
                <ExampleCard icon={CalendarClock} label="Agendamento de reunião">
                    <div className={`rounded-[12px] border bg-[#fafafa] p-4 text-xs leading-6 dark:bg-zinc-900 ${ALLYO_BORDER}`}>
                        <strong className="block">ALINHAMENTO DE DEMANDA</strong>
                        <span className="text-[#777] dark:text-zinc-400">@Responsáveis e participantes</span>
                        <dl className="mt-2 grid grid-cols-[68px_1fr] gap-x-2"><dt className="text-[#999]">Cliente</dt><dd>Nome da conta</dd><dt className="text-[#999]">Contexto</dt><dd>Objetivo e decisão necessária</dd><dt className="text-[#999]">Quando</dt><dd>Data, horário e duração</dd></dl>
                    </div>
                    <em className="mt-3 block text-[10px] leading-5 text-[#777]">Inclua objetivo, pessoas, contexto, data, horário e materiais necessários.</em>
                </ExampleCard>
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Mapa de comunicação" title="Cada assunto no lugar certo">
            <p className="mb-5 max-w-[720px] text-xs leading-5 text-[#777] dark:text-zinc-400">Os nomes dos espaços podem evoluir. A finalidade e o público de cada conversa são o que determina onde ela deve acontecer.</p>
            <div className="space-y-[10px]">
                {channels.map((channel) => <ChannelCard key={channel.title} {...channel} />)}
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Quando escalar" title="Urgência não elimina contexto">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">
                <EscalationCard icon={AlertTriangle} title="Risco de prazo" text="Avise responsável e liderança, indique impacto e apresente alternativas." />
                <EscalationCard icon={ShieldCheck} title="Risco de qualidade" text="Acione direção ou qualidade antes de avançar para aprovação." />
                <EscalationCard icon={Headphones} title="Impacto no cliente" text="Envolva atendimento com fatos, histórico e recomendação de resposta." />
                <EscalationCard icon={Workflow} title="Falha de plataforma" text="Registre evidências, comportamento esperado, impacto e urgência." />
            </div>
        </PlaybookSection>

        <section className="rounded-[14px] border border-[#cbd8b0] bg-gradient-to-r from-[#f3f6ed] to-white p-7 dark:border-[#9db669]/30 dark:from-[#172018] dark:to-zinc-950 sm:p-9">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8efdb] px-3 py-1 text-[10px] font-semibold text-[#667a3e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><CheckCircle2 size={12} /> Antes de enviar</span>
            <h2 className="mt-5 font-season text-[28px]">Uma boa mensagem responde cinco perguntas</h2>
            <div className="mt-6 grid gap-2 sm:grid-cols-5">
                {['O que aconteceu?', 'Qual é o contexto?', 'Quem precisa agir?', 'Até quando?', 'Qual resultado esperamos?'].map((item, index) => <div key={item} className={`rounded-[10px] border bg-white/80 p-4 text-xs font-semibold dark:bg-zinc-900/80 ${ALLYO_BORDER}`}><span className="mb-2 block font-mono text-[9px] text-[#829454]">0{index + 1}</span>{item}</div>)}
            </div>
        </section>
    </div>
);

const PlaybookSection = ({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) => <section><span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#7f7f7f]">{eyebrow}</span><h2 className="mt-2 font-season text-[30px] font-normal">{title}</h2><div className="mt-5">{children}</div></section>;
const HabitCard = ({ icon: Icon, title, text, active = false }: { icon: LucideIcon; title: string; text: string; active?: boolean }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${active ? 'border-[#9db669]' : ALLYO_BORDER}`}><span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><h3 className="mt-5 font-season text-lg">{title}</h3><p className="mt-3 text-xs leading-5 text-[#777] dark:text-zinc-400">{text}</p></article>;
const ExampleCard = ({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#71854c]"><Icon size={14} />{label}</span><div className="mt-5">{children}</div></article>;

const tones = {
    green: 'from-[#f1f5e9] to-white dark:from-[#172018] dark:to-zinc-950',
    blue: 'from-[#eef4f5] to-white dark:from-[#142022] dark:to-zinc-950',
    orange: 'from-[#f7f2ea] to-white dark:from-[#251d15] dark:to-zinc-950',
    violet: 'from-[#f3eef8] to-white dark:from-[#211827] dark:to-zinc-950',
    neutral: 'from-[#f6f6f3] to-white dark:from-zinc-900 dark:to-zinc-950',
};
const ChannelCard = ({ icon: Icon, eyebrow, title, audience, text, tone }: { icon: LucideIcon; eyebrow: string; title: string; audience: string; text: string; tone: keyof typeof tones }) => <article className={`rounded-[14px] border bg-gradient-to-r p-6 sm:p-7 ${ALLYO_BORDER} ${tones[tone]}`}><div className="flex items-start gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#768a4e] shadow-sm dark:bg-zinc-900 dark:text-[#d0f08e]"><Icon size={17} /></span><div><span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#7f7f7f]">{eyebrow}</span><h3 className="mt-1 font-season text-xl">{title}</h3><span className="mt-2 block text-[9px] font-semibold uppercase tracking-[.06em] text-[#829454]">{audience}</span><p className="mt-3 max-w-[840px] text-xs leading-5 text-[#777] dark:text-zinc-400">{text}</p></div></div></article>;
const EscalationCard = ({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={16} /></span><h3 className="mt-4 text-xs font-semibold">{title}</h3><p className="mt-2 text-[10px] leading-5 text-[#777] dark:text-zinc-400">{text}</p></article>;

export default AllyoInternalCommunicationContent;
