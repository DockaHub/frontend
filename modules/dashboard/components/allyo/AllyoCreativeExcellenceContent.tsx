import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Crown,
    Gauge,
    Headphones,
    HeartHandshake,
    Network,
    Palette,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    UsersRound,
    Workflow,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

const responsibilities = [
    'Entregas alinhadas ao briefing e aos objetivos do cliente',
    'Processos executados de forma consistente',
    'Prazos e acordos de SLA acompanhados',
    'Qualidade mantida conforme a operação escala',
    'Créditos utilizados com clareza e responsabilidade',
    'Experiência positiva em toda a jornada',
];

const expectations = [
    'Seguir os processos definidos',
    'Manter organização e disciplina operacional',
    'Registrar informações de forma clara e completa',
    'Comunicar-se com objetividade e respeito',
    'Colaborar com outras funções e especialidades',
    'Identificar riscos e gargalos',
    'Propor melhorias continuamente',
    'Atuar com autonomia e responsabilidade',
    'Manter foco na experiência do cliente',
];

export const AllyoCreativeExcellenceContent = () => (
    <div className="space-y-10">
        <section className={`rounded-[14px] border bg-gradient-to-br from-[#f2f5eb] via-white to-[#f5f5f0] p-6 dark:from-[#172018] dark:via-zinc-950 dark:to-zinc-900 sm:p-10 ${ALLYO_BORDER}`}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd8b0] bg-white/80 px-3 py-1 text-[10px] font-semibold text-[#708346] dark:border-[#9db669]/30 dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Sparkles size={12} /> O que é Excelência Criativa</span>
            <h2 className="mt-6 max-w-[920px] font-season text-[clamp(30px,4vw,48px)] font-normal leading-[1.08]">A frente que conecta estratégia, operação e produção criativa.</h2>
            <p className="mt-5 max-w-[850px] text-sm leading-7 text-[#656565] dark:text-zinc-400">Excelência Criativa garante que as entregas aconteçam com <strong className="text-black dark:text-white">qualidade, consistência, previsibilidade</strong> e alinhamento aos objetivos de cada cliente.</p>
            <p className="mt-2 max-w-[850px] text-sm leading-7 text-[#656565] dark:text-zinc-400">Mais do que acompanhar tarefas, a área transforma necessidades de negócio em uma operação criativa capaz de aprender e evoluir.</p>
        </section>

        <section className="rounded-[14px] border border-[#cbd8b0] bg-gradient-to-r from-[#f3f6ed] to-white p-6 dark:border-[#9db669]/30 dark:from-[#172018] dark:to-zinc-950 sm:p-8">
            <div className="flex items-center gap-3 text-[#71854c]"><span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#e8efdb] dark:bg-[#9db669]/10"><Target size={18} /></span><span className="text-[10px] font-bold uppercase tracking-[.12em]">Nossa missão</span></div>
            <p className="mt-5 max-w-[1180px] font-season text-[clamp(20px,2.2vw,29px)] leading-[1.35]">Fazer estratégia, operação e produção trabalharem de forma integrada para entregar experiências criativas de alta qualidade — com eficiência, previsibilidade e excelência no relacionamento.</p>
        </section>

        <section className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 sm:p-8 ${ALLYO_BORDER}`}>
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><CheckCircle2 size={17} /></span><h2 className="font-season text-xl">Nossa responsabilidade</h2></div>
            <p className="mt-4 text-xs text-[#777] dark:text-zinc-400">Somos corresponsáveis por garantir que:</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
                {responsibilities.map((item) => <div key={item} className="flex items-start gap-2.5 text-xs leading-5 text-[#656565] dark:text-zinc-400"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[#9db669]" />{item}</div>)}
            </div>
            <p className={`mt-6 border-t pt-4 text-[10px] italic leading-5 text-[#777] dark:text-zinc-500 ${ALLYO_BORDER}`}>O trabalho não termina quando uma peça é entregue: inclui acompanhar a experiência e melhorar continuamente a operação.</p>
        </section>

        <PlaybookSection eyebrow="Pilares da área" title="Três frentes inseparáveis">
            <div className="grid gap-[10px] lg:grid-cols-3">
                <Pillar index="01" icon={ShieldCheck} title="Qualidade" headline="Aderência ao briefing e às diretrizes da marca." text="Qualidade não é apenas estética. É clareza, funcionalidade, coerência e capacidade de resolver o problema do cliente." />
                <Pillar index="02" icon={Gauge} title="Eficiência" headline="Créditos, prazos e processos padronizados." text="Reduzimos retrabalho e gargalos para aumentar previsibilidade e escala sem comprometer a qualidade." />
                <Pillar index="03" icon={HeartHandshake} title="Experiência" headline="Cada interação molda a percepção do cliente." text="Construímos relações baseadas em confiança, transparência, proximidade e responsabilidade." />
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Como a operação funciona" title="Um único fluxo, do cliente à aprovação">
            <p className="mb-5 max-w-[680px] text-xs leading-5 text-[#777] dark:text-zinc-400">Cada etapa tem responsáveis, controles e critérios de qualidade.</p>
            <div className={`flex flex-wrap items-center gap-2 rounded-[14px] border bg-white p-5 dark:bg-zinc-950 sm:p-7 ${ALLYO_BORDER}`}>
                {['Cliente', 'Plataforma', 'Planejamento', 'Produção', 'Revisão', 'Aprovação'].map((item, index, list) => <div key={item} className="flex items-center gap-2"><span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs ${ALLYO_BORDER}`}><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eef3e4] text-[9px] font-bold text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]">{index + 1}</span>{item}</span>{index < list.length - 1 && <ArrowRight size={14} className="text-[#999]" />}</div>)}
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Estrutura da área" title="Cinco funções complementares">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-3">
                <RoleCard code="CESM" icon={Crown} title="Creative Excellence Senior Manager" text="Lidera estratégia, governança, inovação, evolução de processos e acompanhamento de resultados." />
                <RoleCard code="CAM" icon={UsersRound} title="Creative Account Manager" text="Conecta estratégia e relacionamento, acompanha carteiras, conduz rituais e direciona prioridades." />
                <RoleCard code="CAS" icon={Headphones} title="Creative Account Support" text="Organiza tarefas e pendências, apoia a conta e mantém fluidez na comunicação e nos registros." />
                <RoleCard code="CQS" icon={Search} title="Creative Quality Specialist" text="Valida briefing, escopo, créditos, aderência e qualidade antes que a entrega siga ao cliente." />
                <RoleCard code="AD" icon={Palette} title="Art Director" text="Orienta conceito e direção visual, garantindo consistência estética e aderência ao Brand Kit." />
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Como trabalhamos" title="Princípios fundamentais">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-3">
                <Principle index="01" icon={Workflow} title="Processos padronizados" text="Fluxos claros aumentam previsibilidade, eficiência e consistência." />
                <Principle index="02" icon={BarChart3} title="Decisões orientadas por dados" text="Indicadores mostram gargalos, resultados e oportunidades de melhoria." active />
                <Principle index="03" icon={Gauge} title="Melhoria contínua" text="Nenhum processo é definitivo; aprendizados e feedbacks geram evolução." />
                <Principle index="04" icon={HeartHandshake} title="Responsabilidade compartilhada" text="A experiência não pertence a uma única função: todos respondem pelo resultado." />
                <Principle index="05" icon={Network} title="Colaboração" text="A qualidade depende da integração entre contexto, conhecimento e especialidades." />
            </div>
        </PlaybookSection>

        <section className="rounded-[14px] border border-[#cbd8b0] bg-gradient-to-r from-[#f3f6ed] to-white p-7 dark:border-[#9db669]/30 dark:from-[#172018] dark:to-zinc-950 sm:p-10">
            <span className="text-[#9db669]">❞</span>
            <blockquote className="mt-4 max-w-[980px] font-season text-[clamp(24px,3vw,36px)] leading-tight">Excelência não significa perfeição. Significa <span className="text-[#71854c] dark:text-[#d0f08e]">compromisso constante</span> com qualidade, aprendizado, evolução e responsabilidade.</blockquote>
            <p className="mt-5 max-w-[820px] text-xs leading-6 text-[#777] dark:text-zinc-400">Ela aparece na forma como revisamos uma entrega, registramos contexto, conduzimos uma reunião e respondemos a um cliente.</p>
        </section>

        <PlaybookSection eyebrow="O que esperamos de todos" title="Independentemente da função">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-3">
                {expectations.map((item, index) => <div key={item} className={`flex items-center gap-3 rounded-[12px] border bg-white px-4 py-4 text-xs font-semibold dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef3e4] text-[9px] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]">{index + 1}</span>{item}</div>)}
            </div>
            <div className={`mt-5 rounded-[12px] border bg-white p-5 text-center text-xs italic text-[#777] dark:bg-zinc-950 dark:text-zinc-400 ${ALLYO_BORDER}`}>A força da Excelência Criativa está na <strong className="text-black dark:text-white">atuação integrada</strong> de todas as pessoas que fazem parte dela.</div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Estrutura do time" title="Organização por responsabilidade">
            <div className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 sm:p-8 ${ALLYO_BORDER}`}>
                <TeamLevel icon={Crown} label="Liderança de Excelência Criativa" detail="CESM · estratégia, governança e evolução" emphasized />
                <div className="mx-auto h-6 w-px bg-[#cbd8b0] dark:bg-[#9db669]/30" />
                <div className="grid gap-[10px] lg:grid-cols-3">
                    <TeamLevel icon={UsersRound} label="Gestão de contas" detail="CAM + CAS · contexto, carteira e operação" />
                    <TeamLevel icon={Search} label="Qualidade" detail="CQS · critérios, revisão e consistência" />
                    <TeamLevel icon={Palette} label="Direção criativa" detail="AD + CriaHub · orientação e execução" />
                </div>
                <div className="mt-5 rounded-[12px] border border-dashed border-[#cbd8b0] bg-[#fafbf8] p-5 text-center dark:border-[#9db669]/30 dark:bg-zinc-900"><strong className="text-xs">Rede criativa multidisciplinar</strong><p className="mt-2 text-[10px] text-[#777] dark:text-zinc-400">Design, motion, copy, vídeo, desenvolvimento e demais especialidades conforme cada projeto.</p></div>
            </div>
        </PlaybookSection>
    </div>
);

const PlaybookSection = ({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) => <section><span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#7f7f7f]">{eyebrow}</span><h2 className="mt-2 font-season text-[30px] font-normal">{title}</h2><div className="mt-5">{children}</div></section>;
const Pillar = ({ index, icon: Icon, title, headline, text }: { index: string; icon: LucideIcon; title: string; headline: string; text: string }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><span className="font-mono text-[9px] text-[#8d8d8d]">{index}</span></div><h3 className="mt-5 font-season text-xl">{title}</h3><strong className="mt-3 block text-xs">{headline}</strong><p className="mt-3 text-xs leading-5 text-[#777] dark:text-zinc-400">{text}</p></article>;
const RoleCard = ({ code, icon: Icon, title, text }: { code: string; icon: LucideIcon; title: string; text: string }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><span className="rounded-full border border-[#e5e5e5] px-2 py-1 font-mono text-[8px] dark:border-zinc-700">{code}</span></div><h3 className="mt-5 font-season text-lg">{title}</h3><p className="mt-3 text-xs leading-5 text-[#777] dark:text-zinc-400">{text}</p></article>;
const Principle = ({ index, icon: Icon, title, text, active = false }: { index: string; icon: LucideIcon; title: string; text: string; active?: boolean }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${active ? 'border-[#9db669]' : ALLYO_BORDER}`}><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={16} /></span><span className="font-mono text-[9px] text-[#8d8d8d]">{index}</span></div><h3 className="mt-5 font-season text-lg">{title}</h3><p className="mt-3 text-xs leading-5 text-[#777] dark:text-zinc-400">{text}</p></article>;
const TeamLevel = ({ icon: Icon, label, detail, emphasized = false }: { icon: LucideIcon; label: string; detail: string; emphasized?: boolean }) => <div className={`rounded-[12px] border p-5 text-center ${emphasized ? 'mx-auto max-w-md border-[#9db669] bg-[#f7f9f2] dark:bg-[#9db669]/10' : `${ALLYO_BORDER} bg-white dark:bg-zinc-950`}`}><span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><strong className="mt-3 block text-xs">{label}</strong><span className="mt-1 block text-[10px] leading-5 text-[#777] dark:text-zinc-400">{detail}</span></div>;

export default AllyoCreativeExcellenceContent;
