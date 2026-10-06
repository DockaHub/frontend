import { useMemo } from 'react';
import {
    ArrowRight,
    BookOpen,
    Gauge,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ALLYO_BORDER, AllyoPageHeader } from './AllyoUI';
import {
    ALLYO_PLAYBOOK_ENTRIES,
    ALLYO_PLAYBOOK_WELCOME_ID,
    type AllyoPlaybookEntry,
} from './allyoPlaybookNavigation';
import { AllyoAboutContent, AllyoOnboardingContent } from './AllyoPlaybookFundamentals';
import AllyoCreativeExcellenceContent from './AllyoCreativeExcellenceContent';
import AllyoInternalCommunicationContent from './AllyoInternalCommunicationContent';
import { AllyoGlossaryContent, AllyoPlansContent, AllyoUsefulLinksContent } from './AllyoPlaybookResourcesContent';
import { AllyoPeopleRoleContent } from './AllyoPeopleContent';
import { AllyoAccountMaintenanceContent, AllyoCallRulesContent, AllyoClientRitualsContent, AllyoInternalRitualsContent } from './AllyoCreativeOpsProcessesContent';
import './AllyoPlaybookTypography.css';

const ONBOARDING_ID = 'playbook-fundamentos-onboarding';
const ABOUT_ID = 'playbook-fundamentos-sobre-allyo';
const CREATIVE_EXCELLENCE_ID = 'playbook-fundamentos-excelencia-criativa';
const INTERNAL_COMMUNICATION_ID = 'playbook-fundamentos-comunicacao-interna';
const USEFUL_LINKS_ID = 'playbook-fundamentos-links-uteis';
const PLANS_ID = 'playbook-fundamentos-planos-allyo';
const GLOSSARY_ID = 'playbook-fundamentos-glossario';
const PEOPLE_ROLE_BY_ID = {
    'playbook-creative-ops-pessoas-cesm': 'cesm',
    'playbook-creative-ops-pessoas-cam': 'cam',
    'playbook-creative-ops-pessoas-cas': 'cas',
    'playbook-creative-ops-pessoas-cqs': 'cqs',
    'playbook-creative-ops-pessoas-ad': 'ad',
} as const;
const CREATIVE_OPS_PROCESS_BY_ID = {
    'playbook-creative-ops-rituais-cliente': AllyoClientRitualsContent,
    'playbook-creative-ops-rituais-internos': AllyoInternalRitualsContent,
    'playbook-creative-ops-regras-calls': AllyoCallRulesContent,
    'playbook-creative-ops-manutencao-contas': AllyoAccountMaintenanceContent,
} as const;

const AllyoPlaybookView = ({ activeView }: { activeView: string }) => {
    const [, setSearchParams] = useSearchParams();
    const currentId = activeView === 'playbook' ? ALLYO_PLAYBOOK_WELCOME_ID : activeView;
    const entryIndex = ALLYO_PLAYBOOK_ENTRIES.findIndex((item) => item.id === currentId);
    const entry = ALLYO_PLAYBOOK_ENTRIES[entryIndex] || ALLYO_PLAYBOOK_ENTRIES.find((item) => item.id === ALLYO_PLAYBOOK_WELCOME_ID)!;
    const leafEntries = useMemo(() => ALLYO_PLAYBOOK_ENTRIES.filter((item) => !item.children?.length), []);
    const leafIndex = leafEntries.findIndex((item) => item.id === entry.id);
    const previous = leafIndex > 0 ? leafEntries[leafIndex - 1] : null;
    const next = leafIndex >= 0 ? leafEntries[leafIndex + 1] || null : leafEntries[0];

    const navigate = (target: AllyoPlaybookEntry | null) => {
        if (!target) return;
        setSearchParams((current) => {
            const params = new URLSearchParams(current);
            params.set('view', target.id);
            return params;
        });
    };

    if (entry.id !== ALLYO_PLAYBOOK_WELCOME_ID) {
        if (entry.id === ONBOARDING_ID) {
            return <PlaybookContentPage entry={entry} previous={previous} next={next} onNavigate={navigate}><AllyoOnboardingContent /></PlaybookContentPage>;
        }
        if (entry.id === ABOUT_ID) {
            return <PlaybookContentPage entry={entry} previous={previous} next={next} onNavigate={navigate}><AllyoAboutContent /></PlaybookContentPage>;
        }
        if (entry.id === CREATIVE_EXCELLENCE_ID) {
            return <PlaybookContentPage entry={entry} previous={previous} next={next} onNavigate={navigate}><AllyoCreativeExcellenceContent /></PlaybookContentPage>;
        }
        if (entry.id === INTERNAL_COMMUNICATION_ID) {
            return <PlaybookContentPage entry={entry} previous={previous} next={next} onNavigate={navigate}><AllyoInternalCommunicationContent /></PlaybookContentPage>;
        }
        if (entry.id === USEFUL_LINKS_ID) {
            return <PlaybookContentPage entry={entry} previous={previous} next={next} onNavigate={navigate}><AllyoUsefulLinksContent /></PlaybookContentPage>;
        }
        if (entry.id === PLANS_ID) {
            return <PlaybookContentPage entry={entry} previous={previous} next={next} onNavigate={navigate}><AllyoPlansContent /></PlaybookContentPage>;
        }
        if (entry.id === GLOSSARY_ID) {
            return <PlaybookContentPage entry={entry} previous={previous} next={next} onNavigate={navigate}><AllyoGlossaryContent /></PlaybookContentPage>;
        }
        const peopleRole = PEOPLE_ROLE_BY_ID[entry.id as keyof typeof PEOPLE_ROLE_BY_ID];
        if (peopleRole) {
            return <PlaybookContentPage entry={entry} previous={previous} next={next} onNavigate={navigate} headerTitle="Papel e rotina" includeCurrentBreadcrumb><AllyoPeopleRoleContent role={peopleRole} /></PlaybookContentPage>;
        }
        const ProcessContent = CREATIVE_OPS_PROCESS_BY_ID[entry.id as keyof typeof CREATIVE_OPS_PROCESS_BY_ID];
        if (ProcessContent) {
            return <PlaybookContentPage entry={entry} previous={previous} next={next} onNavigate={navigate}><ProcessContent /></PlaybookContentPage>;
        }
        return <PlaybookPlaceholder entry={entry} previous={previous} next={next} onNavigate={navigate} />;
    }

    return (
        <div className="allyo-playbook-readable h-full overflow-y-auto bg-[#fafafa] font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Boas-vindas" />
            <main className="mx-auto max-w-[1480px] space-y-5 p-5 sm:p-[30px]">
                <div className="text-[9px] font-bold uppercase tracking-[.18em] text-[#7f7f7f]">Playbook · Fundamentos</div>

                <section className={`overflow-hidden rounded-[14px] border bg-gradient-to-br from-[#f2f5eb] via-white to-[#f5f5f0] p-6 sm:p-10 lg:p-12 dark:from-[#172018] dark:via-zinc-950 dark:to-zinc-900 ${ALLYO_BORDER}`}>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cbd8b0] bg-white/80 px-3 py-1 text-[10px] font-semibold text-[#708346] dark:border-[#9db669]/30 dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Sparkles size={12} /> Playbook da operação criativa</span>
                    <h2 className="mt-6 max-w-[780px] font-season text-[clamp(30px,4vw,50px)] font-normal leading-[1.06]">O guia de atuação do time que transforma estratégia em entregas criativas.</h2>
                    <p className="mt-5 max-w-[760px] text-sm leading-6 text-[#666] dark:text-zinc-400">O Playbook Allyo conecta <strong className="text-black dark:text-white">pessoas, operação e execução</strong>, organizando o conhecimento necessário para entregar com qualidade, previsibilidade e uma ótima experiência para cada cliente.</p>

                    <div className="mt-9 grid gap-[10px] sm:grid-cols-3">
                        <HeroStat value="Um só lugar" label="para processos, padrões e aprendizados" />
                        <HeroStat value="Ponta a ponta" label="do briefing à aprovação da entrega" />
                        <HeroStat value="Time integrado" label="com papéis, rituais e responsabilidades claras" />
                    </div>
                </section>

                <section className="grid gap-[10px] lg:grid-cols-2">
                    <InfoCard icon={<UsersRound size={17} />} title="Conhecimento compartilhado">O Playbook é a referência comum do time. Ele reduz dúvidas, acelera o onboarding e mantém todas as funções alinhadas ao mesmo padrão de operação.</InfoCard>
                    <InfoCard icon={<BookOpen size={17} />} title="Operação baseada em créditos">Cada tarefa possui escopo, prazo e consumo definidos. Organização e previsibilidade ajudam a equilibrar qualidade, velocidade e uso responsável da franquia do cliente.</InfoCard>
                </section>

                <section className="pt-7">
                    <span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#7f7f7f]">Princípios de atuação</span>
                    <h2 className="mt-2 font-season text-[28px] font-normal">Três pilares que orientam a operação</h2>
                    <p className="mt-2 max-w-[690px] text-xs leading-5 text-[#777] dark:text-zinc-400">Uma rotina clara, indicadores acompanhados e colaboração entre as funções formam a base do nosso trabalho.</p>
                    <div className="mt-5 grid gap-[10px] md:grid-cols-3">
                        <Pillar index="01" icon={<Gauge size={17} />} title="Eficiência operacional">Manter o fluxo de tarefas saudável, reduzindo gargalos e tornando prazos mais previsíveis.</Pillar>
                        <Pillar index="02" icon={<ShieldCheck size={17} />} title="Qualidade e consistência">Assegurar entregas alinhadas à marca, ao briefing e às expectativas de cada cliente.</Pillar>
                        <Pillar index="03" icon={<UsersRound size={17} />} title="Experiência do cliente">Construir confiança com clareza, responsabilidade, comunicação e consistência.</Pillar>
                    </div>
                </section>

                <section className="grid gap-[10px] pt-5 lg:grid-cols-2">
                    <InfoCard icon={<RefreshCw size={17} />} title="Evolução contínua">
                        Este é um documento vivo. Processos são atualizados conforme surgem dados, aprendizados e novas necessidades da operação.
                        <BulletList items={['Revisar gargalos e indicadores', 'Ajustar fluxos conforme a operação evolui', 'Transformar feedbacks em melhoria', 'Compartilhar aprendizados com todo o time']} />
                    </InfoCard>
                    <InfoCard icon={<UsersRound size={17} />} title="Responsabilidade coletiva">
                        Nenhuma etapa acontece isoladamente. Briefing, distribuição, produção, validação e comunicação afetam o resultado final.
                        <BulletList items={['Seguir os processos definidos', 'Manter clareza na execução', 'Sinalizar riscos e gargalos', 'Propor melhorias de forma colaborativa']} />
                    </InfoCard>
                </section>

                <section className="rounded-[14px] border border-[#cbd8b0] bg-gradient-to-r from-[#f3f6ed] to-white p-6 sm:p-9 dark:border-[#9db669]/30 dark:from-[#172018] dark:to-zinc-950">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8efdb] px-3 py-1 text-[10px] font-semibold text-[#667a3e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Sparkles size={12} /> Diretriz para o time</span>
                    <h2 className="mt-5 font-season text-[28px] font-normal">Processos dão clareza. Pessoas fazem a operação evoluir.</h2>
                    <div className="mt-6 grid gap-2 sm:grid-cols-3">
                        {['O combinado deve ser seguido', 'Gargalos devem ser sinalizados', 'Melhorias devem ser propostas'].map((item) => <div key={item} className={`flex items-center gap-3 rounded-[10px] border bg-white/80 px-4 py-3 text-xs font-semibold dark:bg-zinc-900/80 ${ALLYO_BORDER}`}><ArrowRight size={14} className="text-[#9db669]" /> {item}</div>)}
                    </div>
                </section>

                <section className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 sm:p-8 ${ALLYO_BORDER}`}>
                    <span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#7f7f7f]">Como usar este Playbook</span>
                    <h2 className="mt-2 font-season text-[27px] font-normal">Uma base para consulta e evolução</h2>
                    <div className="mt-6 grid gap-[10px] md:grid-cols-4">
                        <Stage number="01" title="Entenda" text="Conheça os fundamentos, papéis e objetivos da operação." />
                        <Stage number="02" title="Aplique" text="Use processos e checklists no trabalho do dia a dia." />
                        <Stage number="03" title="Meça" text="Acompanhe qualidade, prazos, capacidade e satisfação." />
                        <Stage number="04" title="Evolua" text="Registre aprendizados e proponha melhorias ao modelo." />
                    </div>
                </section>

                <PlaybookPager previous={previous} next={next} onNavigate={navigate} />
            </main>
        </div>
    );
};

const PlaybookContentPage = ({ entry, previous, next, onNavigate, children, headerTitle, includeCurrentBreadcrumb = false }: { entry: AllyoPlaybookEntry; previous: AllyoPlaybookEntry | null; next: AllyoPlaybookEntry | null; onNavigate: (entry: AllyoPlaybookEntry | null) => void; children: React.ReactNode; headerTitle?: string; includeCurrentBreadcrumb?: boolean }) => (
    <div className="allyo-playbook-readable h-full overflow-y-auto bg-[#fafafa] font-sans text-black dark:bg-zinc-950 dark:text-white">
        <AllyoPageHeader title={headerTitle || entry.label} />
        <main className="mx-auto max-w-[1480px] p-5 sm:p-[30px]">
            <div className="mb-5 text-[9px] font-bold uppercase tracking-[.18em] text-[#7f7f7f]">Playbook · {(includeCurrentBreadcrumb ? entry.breadcrumbs : entry.breadcrumbs.slice(0, -1)).join(' · ')}</div>
            {children}
            <PlaybookPager previous={previous} next={next} onNavigate={onNavigate} />
        </main>
    </div>
);

const PlaybookPlaceholder = ({ entry, previous, next, onNavigate }: { entry: AllyoPlaybookEntry; previous: AllyoPlaybookEntry | null; next: AllyoPlaybookEntry | null; onNavigate: (entry: AllyoPlaybookEntry | null) => void }) => (
    <div className="allyo-playbook-readable h-full overflow-y-auto bg-[#fafafa] dark:bg-zinc-950">
        <AllyoPageHeader title={entry.label} />
        <main className="mx-auto flex min-h-[calc(100%-75px)] max-w-[1180px] flex-col p-5 sm:p-[30px]">
            <div className="text-[9px] font-bold uppercase tracking-[.16em] text-[#7f7f7f]">Playbook · {entry.breadcrumbs.slice(0, -1).join(' · ')}</div>
            <section className={`mt-5 flex min-h-[420px] flex-1 items-center justify-center rounded-[14px] border bg-white px-6 text-center dark:bg-zinc-950 ${ALLYO_BORDER}`}>
                <div className="max-w-md">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><BookOpen size={20} /></span>
                    <h2 className="mt-5 font-season text-[30px] font-normal">{entry.label}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#777] dark:text-zinc-400">Página estruturada e pronta para receber o conteúdo desta seção do Playbook.</p>
                </div>
            </section>
            <PlaybookPager previous={previous} next={next} onNavigate={onNavigate} />
        </main>
    </div>
);

const HeroStat = ({ value, label }: { value: string; label: string }) => <div className={`rounded-[12px] border bg-white/70 p-5 dark:bg-zinc-950/50 ${ALLYO_BORDER}`}><strong className="block font-season text-[26px] font-normal text-[#708346] dark:text-[#d0f08e]">{value}</strong><span className="mt-1 block text-[11px] leading-5 text-[#777] dark:text-zinc-400">{label}</span></div>;
const InfoCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => <article className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]">{icon}</span><h3 className="font-season text-xl font-normal">{title}</h3></div><div className="mt-4 text-xs leading-6 text-[#666] dark:text-zinc-400">{children}</div></article>;
const Pillar = ({ index, icon, title, children }: { index: string; icon: React.ReactNode; title: string; children: React.ReactNode }) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]">{icon}</span><span className="font-mono text-[10px] text-[#8d8d8d]">{index}</span></div><h3 className="mt-5 font-season text-xl font-normal">{title}</h3><p className="mt-3 text-xs leading-5 text-[#777] dark:text-zinc-400">{children}</p></article>;
const BulletList = ({ items }: { items: string[] }) => <ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex items-start gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#9db669]" />{item}</li>)}</ul>;
const Stage = ({ number, title, text }: { number: string; title: string; text: string }) => <div className="rounded-[10px] bg-[#f7f8f4] p-4 dark:bg-zinc-900"><span className="font-mono text-[9px] text-[#829454]">ETAPA {number}</span><strong className="mt-3 block text-xs">{title}</strong><p className="mt-2 text-[11px] leading-5 text-[#777] dark:text-zinc-400">{text}</p></div>;
const PlaybookPager = ({ previous, next, onNavigate }: { previous: AllyoPlaybookEntry | null; next: AllyoPlaybookEntry | null; onNavigate: (entry: AllyoPlaybookEntry | null) => void }) => <nav className="mt-5 grid gap-[10px] sm:grid-cols-2" aria-label="Navegação do Playbook"><button type="button" disabled={!previous} onClick={() => onNavigate(previous)} className={`min-h-16 rounded-[12px] border bg-white px-5 text-left disabled:invisible dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="block text-[8px] font-bold uppercase tracking-[.14em] text-[#999]">Anterior</span><strong className="mt-1 block text-xs">{previous?.label}</strong></button><button type="button" disabled={!next} onClick={() => onNavigate(next)} className={`min-h-16 rounded-[12px] border bg-white px-5 text-right disabled:invisible dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="block text-[8px] font-bold uppercase tracking-[.14em] text-[#999]">Próximo</span><strong className="mt-1 block text-xs">{next?.label}</strong></button></nav>;

export default AllyoPlaybookView;
