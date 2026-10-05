import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    BarChart3,
    Bot,
    Boxes,
    BriefcaseBusiness,
    CheckCircle2,
    CircleUserRound,
    Clock3,
    Compass,
    FileText,
    Gauge,
    GraduationCap,
    HeartHandshake,
    MessageSquare,
    Rocket,
    ShieldCheck,
    Sparkles,
    Target,
    UsersRound,
    Video,
    Workflow,
    Zap,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

export const AllyoOnboardingContent = () => (
    <div className="space-y-10">
        <section className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 sm:p-9 ${ALLYO_BORDER}`}>
            <span className="inline-flex items-center gap-2 text-[#778a50]"><Sparkles size={17} /><strong className="font-season text-xl font-normal text-black dark:text-white">Boas-vindas à Allyo</strong></span>
            <div className={`mt-4 border-t pt-5 text-sm leading-7 text-[#656565] dark:text-zinc-400 ${ALLYO_BORDER}`}>
                <p>Este Playbook foi criado para acelerar sua adaptação, apresentar os principais processos e servir como referência para o dia a dia.</p>
                <p className="mt-3">Nosso objetivo é dar clareza sobre como trabalhamos, o que esperamos de cada função e como o time contribui para uma operação criativa saudável.</p>
                <p className="mt-3">Onboarding não é apenas aprendizado inicial: é o primeiro passo para construir autonomia, confiança e alinhamento.</p>
            </div>
        </section>

        <PlaybookSection eyebrow="Jornada" title="Seus primeiros 90 dias" description={<>A adaptação acontece de forma gradual, com evolução de <strong className="text-black dark:text-white">conhecimento, autonomia e capacidade de decisão.</strong></>}>
            <div className="grid gap-[10px] lg:grid-cols-3">
                <JourneyCard phase="Fase 1" period="0–30 dias" title="Imersão" subtitle="Entender pessoas, ferramentas e processos" icon={Compass} accent="sky" items={['Conhecer a estrutura da operação', 'Configurar os acessos essenciais', 'Entender catálogo, créditos e SLA', 'Acompanhar os rituais do time', 'Aprender os fluxos da sua função']} outcome="Executar atividades com segurança, mesmo com apoio pontual do time." />
                <JourneyCard phase="Fase 2" period="30–60 dias" title="Autonomia operacional" subtitle="Ganhar fluidez na rotina" icon={Gauge} accent="violet" items={['Executar com menor dependência', 'Aplicar os processos corretamente', 'Participar ativamente das discussões', 'Dominar as ferramentas da rotina', 'Resolver situações recorrentes']} outcome="Atuar de forma consistente e contribuir para a fluidez da operação." />
                <JourneyCard phase="Fase 3" period="60–90 dias" title="Integração plena" subtitle="Gerar impacto com autonomia" icon={Rocket} accent="emerald" items={['Atuar com autonomia responsável', 'Dominar os processos da função', 'Identificar riscos e oportunidades', 'Propor melhorias ao fluxo', 'Apoiar decisões com visão do cliente']} outcome="Gerar impacto, colaborar entre funções e ajudar a operação a evoluir." />
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Hands-on" title="Trilha prática inicial" description="Uma sequência curta para conhecer os pontos essenciais da operação e das ferramentas.">
            <div className="grid gap-[10px] sm:grid-cols-2 xl:grid-cols-4">
                <LearningCard number="01" icon={Boxes} title="Catálogo criativo" description="Conheça os produtos, escopos, prazos e regras de créditos." duration="20 min" />
                <LearningCard number="02" icon={Workflow} title="Plataforma Allyo" description="Explore projetos, tarefas, entregas e aprovações." duration="15 min" />
                <LearningCard number="03" icon={FileText} title="Briefing" description="Entenda as informações necessárias para uma boa execução." duration="10 min" />
                <LearningCard number="04" icon={MessageSquare} title="Comunicação" description="Conheça os canais, acordos e registros oficiais." duration="10 min" />
                <LearningCard number="05" icon={Video} title="Rituais" description="Veja como funcionam alinhamentos, reviews e reuniões." duration="15 min" />
                <LearningCard number="06" icon={BriefcaseBusiness} title="Gestão de clientes" description="Aprenda sobre carteiras, contexto e saúde das contas." duration="15 min" />
                <LearningCard number="07" icon={BarChart3} title="Métricas" description="Acompanhe prazos, qualidade, créditos e capacidade." duration="15 min" />
                <LearningCard number="08" icon={Bot} title="IA e Brand Brain" description="Use inteligência artificial com contexto e responsabilidade." duration="15 min" />
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Como trabalhamos" title="Boas práticas de trabalho" description="Princípios simples que orientam a rotina de quem faz parte da Allyo.">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-3">
                <PracticeCard index="01" icon={MessageSquare} title="Comunicação clara" text="Comunique contexto, decisão e próximo passo de forma objetiva e respeitosa." note="Informação bem compartilhada melhora a qualidade das decisões." />
                <PracticeCard index="02" icon={Boxes} title="Organização" text="Mantenha tarefas, documentos, prazos e registros sempre atualizados." note="Organização individual fortalece a eficiência coletiva." />
                <PracticeCard index="03" icon={UsersRound} title="Colaboração" text="Peça ajuda quando necessário e compartilhe conhecimento sempre que possível." note="Resultados melhores surgem da colaboração entre especialidades." />
                <PracticeCard index="04" icon={Zap} title="Proatividade" text="Antecipe riscos, proponha soluções e não espere o problema se tornar crítico." note="Iniciativa é uma expectativa, sempre com responsabilidade." />
                <PracticeCard index="05" icon={GraduationCap} title="Aprendizado contínuo" text="Mantenha curiosidade, abertura para feedback e disposição para evoluir." note="Processos e pessoas devem melhorar de forma contínua." />
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Operação do dia a dia" title="Primeiros ajustes administrativos" description="Acessos, rotinas e práticas que devem estar organizados desde o início.">
            <div className="grid gap-[10px] lg:grid-cols-2">
                <OperationalCard icon={CircleUserRound} title="Perfil e acessos">
                    <p>Revise seu perfil e preferências nas ferramentas essenciais:</p>
                    <MiniRow title="ManySpace" detail="Foto, nome, cargo e notificações" />
                    <MiniRow title="Allyo" detail="Função, especialidade e disponibilidade" />
                </OperationalCard>
                <OperationalCard icon={FileText} title="Orientações financeiras">
                    <p>Se sua contratação exigir documentação ou nota fiscal, confirme datas, dados e canal de envio diretamente com o responsável financeiro.</p>
                    <div className="mt-4 rounded-[10px] bg-[#f7f8f4] px-4 py-3 text-[11px] text-[#6f6f6f] dark:bg-zinc-900 dark:text-zinc-400">Dados fiscais e prazos oficiais devem ser consultados na área financeira — não use informações antigas ou recebidas fora dos canais oficiais.</div>
                </OperationalCard>
            </div>
            <OperationalCard icon={Video} title="Reuniões online" full>
                <div className="grid gap-2 sm:grid-cols-2">
                    {['Entre com antecedência e teste áudio e câmera.', 'Use um ambiente adequado e reduza distrações.', 'Mantenha câmera ligada quando o contexto permitir.', 'Tenha pauta e materiais preparados.', 'Registre decisões e próximos passos.', 'Sinalize ausências ou problemas técnicos.'].map((item, index) => <NumberedTip key={item} index={index + 1} text={item} />)}
                </div>
            </OperationalCard>
        </PlaybookSection>

        <section className="rounded-[14px] border border-[#cbd8b0] bg-gradient-to-r from-[#f3f6ed] to-white p-6 dark:border-[#9db669]/30 dark:from-[#172018] dark:to-zinc-950 sm:p-9">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8efdb] px-3 py-1 text-[10px] font-semibold text-[#667a3e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Sparkles size={12} /> O que esperamos de você</span>
            <h2 className="mt-5 font-season text-[30px] font-normal">Mais do que executar tarefas</h2>
            <p className="mt-3 max-w-[760px] text-sm leading-6 text-[#666] dark:text-zinc-400">Esperamos pessoas que ajudem a fortalecer nossa cultura, nossos processos e a experiência dos clientes.</p>
            <div className="mt-6 grid gap-2 md:grid-cols-2">
                {['Assumir responsabilidade pelos resultados', 'Colaborar com o time', 'Ter vontade de aprender', 'Buscar evolução constante', 'Compartilhar conhecimento', 'Propor melhorias', 'Atuar com ética, respeito e parceria'].map((item) => <div key={item} className={`flex items-center gap-3 rounded-[10px] border bg-white/80 px-4 py-3 text-xs font-semibold dark:bg-zinc-900/80 ${ALLYO_BORDER}`}><CheckCircle2 size={15} className="shrink-0 text-[#9db669]" />{item}</div>)}
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-[12px] border border-[#cbd8b0] px-5 py-4 text-xs"><ArrowRight size={15} className="mt-0.5 shrink-0 text-[#9db669]" /><span><strong>Seu onboarding é apenas o começo.</strong><span className="mt-1 block text-[#777] dark:text-zinc-400">A partir daqui, esperamos que você cresça junto com o time e ajude a construir o futuro da Allyo.</span></span></div>
        </section>
    </div>
);

export const AllyoAboutContent = () => (
    <div className="space-y-10">
        <section>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8efdb] px-3 py-1 text-[10px] font-semibold text-[#667a3e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Sparkles size={12} /> Quem somos</span>
            <h2 className="mt-5 max-w-[980px] font-season text-[clamp(30px,4vw,48px)] font-normal leading-[1.08]">Conectamos talento, processos e tecnologia para tornar a produção criativa mais simples e previsível.</h2>
            <p className="mt-5 max-w-[1120px] text-sm leading-7 text-[#656565] dark:text-zinc-400">A Allyo organiza a jornada criativa de ponta a ponta, ajudando times e clientes a transformar estratégia em execução com <strong className="text-black dark:text-white">clareza, consistência e escala.</strong></p>
            <div className="mt-7 space-y-[10px]">
                <FoundationRow icon={UsersRound} title="Talento humano" text="Pessoas de diferentes especialidades colaborando com contexto e responsabilidade." />
                <FoundationRow icon={Workflow} title="Processos" text="Fluxos claros que aumentam previsibilidade, qualidade e capacidade de evolução." />
                <FoundationRow icon={Sparkles} title="Tecnologia" text="Uma plataforma que conecta briefing, produção, aprovação, créditos e dados." active />
            </div>
        </section>

        <section className="rounded-[14px] border border-[#cbd8b0] bg-gradient-to-r from-[#f3f6ed] to-white p-7 dark:border-[#9db669]/30 dark:from-[#172018] dark:to-zinc-950 sm:p-10">
            <span className="text-[#9db669]">❞</span>
            <blockquote className="mt-4 max-w-[980px] font-season text-[clamp(24px,3vw,36px)] leading-tight">Criatividade ganha escala quando pessoas, processos e tecnologia trabalham na mesma direção.</blockquote>
        </section>

        <PlaybookSection eyebrow="Como criamos valor" title="Uma operação construída para evoluir" description="Nosso modelo combina especialização criativa, organização operacional e aprendizado contínuo.">
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">
                <StoryCard number="01" title="Contexto" text="Começamos pelo entendimento do cliente, da marca, dos objetivos e do desafio." />
                <StoryCard number="02" title="Orquestração" text="Transformamos estratégia em escopo, prioridades, responsáveis, créditos e prazos." />
                <StoryCard number="03" title="Execução" text="Especialistas produzem com padrões claros, colaboração e ciclos de revisão." />
                <StoryCard number="04" title="Evolução" text="Dados e feedbacks retroalimentam processos, qualidade e experiência." />
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Nossos valores" title="Princípios que orientam nossas decisões" description="Valores só fazem sentido quando aparecem nas atitudes e escolhas do cotidiano.">
            <div className="grid gap-[10px] sm:grid-cols-2 lg:grid-cols-5">
                <ValueCard number="01" title="Integridade" text="Ética, transparência e respeito em cada decisão." />
                <ValueCard number="02" title="Parceria" text="Relações genuínas com clientes, criativos e colegas." />
                <ValueCard number="03" title="Eficiência" text="Organizar, simplificar e gerar mais valor com qualidade." />
                <ValueCard number="04" title="Responsabilidade" text="Autonomia com compromisso sobre decisões e resultados." />
                <ValueCard number="05" title="Evolução" text="Aprender, ajustar e melhorar continuamente." />
            </div>
        </PlaybookSection>

        <PlaybookSection eyebrow="Cultura Allyo" title="Construída diariamente por quem faz parte" description={<>Cultura não é apenas o que está documentado, mas o que é <strong className="text-black dark:text-white">praticado todos os dias.</strong></>}>
            <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-3">
                <CultureItem icon={ShieldCheck} text="Confiança e respeito entre as pessoas" />
                <CultureItem icon={HeartHandshake} text="Liberdade com responsabilidade" />
                <CultureItem icon={MessageSquare} text="Comunicação próxima, direta e respeitosa" />
                <CultureItem icon={UsersRound} text="Ambiente seguro para feedback e aprendizado" />
                <CultureItem icon={BarChart3} text="Evolução contínua de pessoas, processos e produto" />
            </div>
        </PlaybookSection>

        <section className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 sm:p-9 ${ALLYO_BORDER}`}>
            <span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#7f7f7f]">Como a Allyo funciona</span>
            <h2 className="mt-2 font-season text-[30px] font-normal">Frentes que trabalham de forma integrada</h2>
            <p className="mt-3 max-w-[720px] text-sm leading-6 text-[#777] dark:text-zinc-400">Cada frente sustenta uma parte da experiência e todas compartilham responsabilidade sobre o resultado.</p>
            <div className="mt-6 grid gap-[10px] sm:grid-cols-2 xl:grid-cols-4">
                <AreaCard icon={Target} title="Excelência Criativa" text="Define padrões, acompanha qualidade e transforma aprendizados em evolução." />
                <AreaCard icon={BriefcaseBusiness} title="Creative Account" text="Conecta contexto do cliente, estratégia, carteira e operação." />
                <AreaCard icon={HeartHandshake} title="Customer Support" text="Apoia clientes e usuários, remove dúvidas e protege a experiência." />
                <AreaCard icon={Boxes} title="Creative Ops" text="Organiza capacidade, distribuição, fluxo e indicadores da produção." />
                <AreaCard icon={Sparkles} title="Art Direction" text="Orienta escolhas criativas e garante consistência visual." />
                <AreaCard icon={CheckCircle2} title="Creative Quality" text="Revisa entregas, padrões e aderência ao briefing." />
                <AreaCard icon={Workflow} title="Produto & Tech" text="Evolui a plataforma, automações, integrações e segurança." />
                <AreaCard icon={UsersRound} title="CriaHub" text="Conecta especialistas à operação e desenvolve a rede criativa." />
            </div>
        </section>

        <section className="rounded-[14px] border border-[#cbd8b0] bg-gradient-to-r from-[#f3f6ed] to-white p-7 dark:border-[#9db669]/30 dark:from-[#172018] dark:to-zinc-950 sm:p-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8efdb] px-3 py-1 text-[10px] font-semibold text-[#667a3e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><ArrowRight size={12} /> Construindo o futuro</span>
            <h2 className="mt-5 max-w-[900px] font-season text-[clamp(28px,3.5vw,42px)] leading-tight">Criatividade, quando apoiada por processos e tecnologia, gera resultados extraordinários.</h2>
            <p className="mt-4 max-w-[850px] text-sm leading-7 text-[#656565] dark:text-zinc-400">Todos os dias buscamos uma operação mais eficiente, escalável e inovadora — sem perder a proximidade, o cuidado e a qualidade que tornam o trabalho criativo valioso.</p>
        </section>
    </div>
);

const PlaybookSection = ({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: ReactNode; children: ReactNode }) => <section><span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#7f7f7f]">{eyebrow}</span><h2 className="mt-2 font-season text-[30px] font-normal">{title}</h2><div className="mt-2 max-w-[780px] text-xs leading-5 text-[#777] dark:text-zinc-400">{description}</div><div className="mt-5">{children}</div></section>;

const journeyAccent = { sky: { line: 'border-t-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-600 dark:text-sky-300', bullet: 'bg-sky-500' }, violet: { line: 'border-t-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-300', bullet: 'bg-violet-500' }, emerald: { line: 'border-t-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-300', bullet: 'bg-emerald-500' } };
const JourneyCard = ({ phase, period, title, subtitle, icon: Icon, accent, items, outcome }: { phase: string; period: string; title: string; subtitle: string; icon: LucideIcon; accent: keyof typeof journeyAccent; items: string[]; outcome: string }) => { const style = journeyAccent[accent]; return <article className={`flex overflow-hidden rounded-[14px] border border-t-[4px] bg-white dark:bg-zinc-950 ${ALLYO_BORDER} ${style.line}`}><div className="flex min-w-0 flex-1 flex-col"><div className={`flex gap-3 border-b p-5 ${ALLYO_BORDER}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.bg} ${style.text}`}><Icon size={18} /></span><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[.08em] ${style.bg} ${style.text}`}>{phase}</span><span className="text-[9px] font-semibold uppercase tracking-[.08em] text-[#777]">{period}</span></div><h3 className="mt-2 font-season text-xl">{title}</h3><p className="mt-1 text-[10px] text-[#777] dark:text-zinc-400">{subtitle}</p></div></div><div className="flex flex-1 flex-col p-5"><span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#777]">Você deverá</span><ul className="mt-3 space-y-2 text-xs leading-5 text-[#656565] dark:text-zinc-400">{items.map((item) => <li key={item} className="flex gap-2"><span className={`mt-2 h-1 w-1 shrink-0 rounded-full ${style.bullet}`} />{item}</li>)}</ul><div className={`mt-5 flex items-start gap-2 rounded-[10px] border p-4 text-[10px] leading-5 ${ALLYO_BORDER}`}><ArrowRight size={13} className={`mt-0.5 shrink-0 ${style.text}`} />{outcome}</div></div></div></article>; };
const LearningCard = ({ number, icon: Icon, title, description, duration }: { number: string; icon: LucideIcon; title: string; description: string; duration: string }) => <article className={`overflow-hidden rounded-[14px] border bg-white dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-[#eef3e4] via-[#fafbf8] to-[#e8ecd8] dark:from-[#172018] dark:via-zinc-900 dark:to-[#29351f]"><span className="absolute left-3 top-3 rounded-full bg-white px-2 py-1 font-mono text-[9px] dark:bg-zinc-900">{number}</span><Icon size={30} className="text-[#7a8e50]" /></div><div className="p-5"><h3 className="font-season text-lg">{title}</h3><p className="mt-2 min-h-12 text-[11px] leading-5 text-[#777] dark:text-zinc-400">{description}</p><span className="mt-4 flex items-center gap-1.5 text-[9px] font-semibold uppercase text-[#777]"><Clock3 size={12} />{duration}</span></div></article>;
const PracticeCard = ({ index, icon: Icon, title, text, note }: { index: string; icon: LucideIcon; title: string; text: string; note: string }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><span className="font-mono text-[9px] text-[#8d8d8d]">{index}</span></div><h3 className="mt-5 font-season text-xl">{title}</h3><p className="mt-3 text-xs leading-5 text-[#777] dark:text-zinc-400">{text}</p><p className={`mt-5 border-t pt-3 text-[10px] italic leading-5 text-[#777] dark:text-zinc-500 ${ALLYO_BORDER}`}>{note}</p></article>;
const OperationalCard = ({ icon: Icon, title, children, full = false }: { icon: LucideIcon; title: string; children: ReactNode; full?: boolean }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER} ${full ? 'mt-[10px]' : ''}`}><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={17} /></span><h3 className="font-season text-xl">{title}</h3></div><div className="mt-4 text-xs leading-6 text-[#666] dark:text-zinc-400">{children}</div></article>;
const MiniRow = ({ title, detail }: { title: string; detail: string }) => <div className={`mt-3 flex items-center justify-between gap-4 rounded-[10px] border px-4 py-3 ${ALLYO_BORDER}`}><span><strong className="block text-xs text-black dark:text-white">{title}</strong><span className="text-[10px]">{detail}</span></span><span className="rounded-lg bg-[#f2f4ed] px-3 py-1.5 text-[10px] font-semibold text-[#687a45] dark:bg-[#9db669]/10">Revisar</span></div>;
const NumberedTip = ({ index, text }: { index: number; text: string }) => <div className={`flex items-center gap-3 rounded-[10px] border px-4 py-3 ${ALLYO_BORDER}`}><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef3e4] text-[9px] font-bold text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]">{index}</span>{text}</div>;
const FoundationRow = ({ icon: Icon, title, text, active = false }: { icon: LucideIcon; title: string; text: string; active?: boolean }) => <div className={`flex items-center gap-4 rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${active ? 'border-[#9db669]' : ALLYO_BORDER}`}><span className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-[#9db669] text-white' : 'bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]'}`}><Icon size={18} /></span><span><strong className="font-season text-lg font-normal">{title}</strong><span className="mt-1 block text-[11px] text-[#777] dark:text-zinc-400">{text}</span></span></div>;
const StoryCard = ({ number, title, text }: { number: string; title: string; text: string }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef3e4] font-mono text-[10px] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]">{number}</span><h3 className="mt-4 font-season text-lg">{title}</h3><p className="mt-3 text-xs leading-5 text-[#777] dark:text-zinc-400">{text}</p></article>;
const ValueCard = ({ number, title, text }: { number: string; title: string; text: string }) => <article className={`rounded-[14px] border bg-white p-5 text-center dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="font-season text-2xl text-[#9db669]">{number}</span><strong className="mt-3 block text-xs">{title}</strong><p className="mt-3 text-[10px] leading-5 text-[#777] dark:text-zinc-400">{text}</p></article>;
const CultureItem = ({ icon: Icon, text }: { icon: LucideIcon; text: string }) => <div className={`flex items-center gap-3 rounded-[12px] border bg-white px-5 py-4 text-xs font-semibold dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={16} /></span>{text}</div>;
const AreaCard = ({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) => <article className="rounded-[12px] bg-[#f7f8f4] p-5 dark:bg-zinc-900"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-[#768a4e] dark:bg-zinc-800 dark:text-[#d0f08e]"><Icon size={16} /></span><h3 className="mt-4 font-season text-lg">{title}</h3><p className="mt-2 text-[10px] leading-5 text-[#777] dark:text-zinc-400">{text}</p></article>;
