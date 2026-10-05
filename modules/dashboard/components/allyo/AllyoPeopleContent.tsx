import type { LucideIcon } from 'lucide-react';
import {
    CheckCircle2,
    Clock3,
    Compass,
    Crown,
    Headphones,
    Palette,
    ShieldCheck,
    Sparkles,
    UsersRound,
    Workflow,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';

type RoleKey = 'cesm' | 'cam' | 'cas' | 'cqs' | 'ad';
type ContentGroup = { title: string; items: string[] };
type Cadence = { label: string; title: string; items: string[] };

type RoleProfile = {
    code: string;
    name: string;
    icon: LucideIcon;
    purpose: string;
    description: string;
    responsibilities: ContentGroup[];
    cadence?: Cadence[];
    guides?: ContentGroup[];
    tools: string[];
    integration: string;
};

const profiles: Record<RoleKey, RoleProfile> = {
    cesm: {
        code: 'CESM',
        name: 'Creative Excellence Senior Manager',
        icon: Crown,
        purpose: 'Estratégia, governança e resultados da Excelência Criativa.',
        description: 'Atua de forma transversal, conectando clientes, operação criativa, Produto, Tecnologia, Comercial, Financeiro e CriaHub para manter a experiência escalável, eficiente e sustentável.',
        responsibilities: [
            { title: 'Governança da área', items: ['Definir e evoluir processos, políticas e boas práticas', 'Garantir padronização entre times e aderência aos fluxos', 'Estruturar o Playbook e identificar gargalos de operação'] },
            { title: 'Gestão de resultados', items: ['Acompanhar indicadores, saúde operacional e financeira', 'Garantir eficiência, qualidade e previsibilidade', 'Apoiar retenção, crescimento e alcance das metas'] },
            { title: 'Liderança da operação', items: ['Apoiar CAMs, CASs, CQSs e ADs na tomada de decisão', 'Desenvolver lideranças e especialistas', 'Definir prioridades e atuar em situações críticas'] },
            { title: 'Inovação e evolução', items: ['Identificar automações e melhorias de processo', 'Avaliar ferramentas e iniciativas de inteligência artificial', 'Promover evolução contínua da experiência de clientes e equipes'] },
        ],
        cadence: [
            { label: 'Contínuo', title: 'Direcionamento', items: ['Monitorar riscos e indicadores críticos', 'Destravar decisões entre áreas', 'Manter as frentes alinhadas'] },
            { label: 'Semanal', title: 'Liderança', items: ['Revisar capacidade, qualidade e saúde das contas', 'Acompanhar prioridades com as lideranças', 'Tratar escaladas da operação'] },
            { label: 'Mensal', title: 'Governança', items: ['Consolidar resultados e aprendizados', 'Revisar metas e roadmap', 'Priorizar projetos de evolução'] },
        ],
        guides: [{ title: 'Integração entre áreas', items: ['Produto e Tecnologia', 'Comercial e CS', 'Financeiro e Operações', 'Excelência Criativa e CriaHub'] }],
        tools: ['ManySpace', 'Métricas Allyo', 'Relatórios operacionais', 'Google Meet', 'Documentação do Playbook'],
        integration: 'O CESM é o elo responsável por garantir que decisões estratégicas, mudanças de processo e evoluções da plataforma aconteçam de forma integrada e alinhada aos objetivos da Allyo.',
    },
    cam: {
        code: 'CAM',
        name: 'Creative Account Manager',
        icon: Compass,
        purpose: 'Guardião da experiência do cliente e da qualidade percebida.',
        description: 'Atua de forma estratégica para prevenir churn, assegurar clareza nos processos, conduzir rituais e transformar dados de uso, créditos e entregas em decisões que fortaleçam o relacionamento.',
        responsibilities: [
            { title: 'Gestão da conta', items: ['Reduzir riscos ligados à experiência e à qualidade', 'Acompanhar consumo de créditos e uso da plataforma', 'Garantir pauta saudável e entregas sem atrasos'] },
            { title: 'Relacionamento estratégico', items: ['Conduzir imersões, checkpoints e apresentações de resultados', 'Ser o principal ponto de contato estratégico', 'Antecipar riscos e alinhar soluções com cliente e liderança'] },
            { title: 'Olhar analítico', items: ['Ler indicadores com senso crítico', 'Gerar hipóteses e recomendações', 'Conectar números ao contexto da conta', 'Apoiar decisões de negócio e expansão'] },
        ],
        cadence: [
            { label: 'Diário', title: 'Operação da carteira', items: ['Programar o dia e revisar a pauta', 'Acompanhar contas críticas e consumo', 'Alinhar prioridades com o CAS', 'Fechar follow-ups'] },
            { label: 'Semanal', title: 'Saúde e alinhamento', items: ['Revisar clientes com baixo uso', 'Trocar contexto entre CAMs', 'Participar do ritual do time', 'Atualizar saúde das contas'] },
            { label: 'Quinzenal', title: 'Direcionamento criativo', items: ['Alinhar contas com CQS e AD', 'Compartilhar riscos e oportunidades com CS', 'Realizar 1:1 com liderança'] },
            { label: 'Mensal', title: 'Resultados', items: ['Preparar e conduzir apresentações', 'Sugerir ações de reengajamento', 'Revisar objetivos e oportunidades'] },
        ],
        guides: [
            { title: 'Gatilhos de ciclo', items: ['Preparar resultados após cada virada de ciclo', 'Agendar apresentações com antecedência', 'Cobrar avaliações antes do encerramento', 'Enviar ações de incentivo à usabilidade'] },
            { title: 'Decisão estratégica', items: ['Interpretar o que os dados revelam', 'Propor ajustes em créditos, mix e rituais', 'Transformar insights em próximos passos claros'] },
        ],
        tools: ['ManySpace', 'Métricas Allyo', 'Gestão de clientes', 'Google Meet', 'WhatsApp e e-mail'],
        integration: 'CAM e CAS atuam juntos: o CAM direciona prioridades e decisões de relacionamento; o CAS mantém a execução fluida, organizada e sem gargalos.',
    },
    cas: {
        code: 'CAS',
        name: 'Creative Account Support',
        icon: Headphones,
        purpose: 'Suporte operacional e comunicação ágil para a jornada do cliente.',
        description: 'Filtra demandas, resolve questões recorrentes e encaminha ao CAM somente situações estratégicas ou críticas, garantindo fluidez no uso da plataforma e rapidez na resolução de pendências.',
        responsibilities: [
            { title: 'Suporte e SLA', items: ['Manter tempo médio de resposta inferior a 30 minutos durante o expediente', 'Acompanhar pendências, briefings, aprovações e ajustes', 'Cobrar avaliações para sustentar o engajamento'] },
            { title: 'Organização operacional', items: ['Apoiar o CAM em clientes críticos, churn e boosters', 'Filtrar solicitações e escalar apenas casos críticos', 'Padronizar mensagens de boas-vindas, lembretes e pendências'] },
            { title: 'Apoio à produção', items: ['Ajudar ADs e criativos em ajustes de tarefa', 'Manter conversas registradas e contextualizadas', 'Sinalizar riscos de prazo e aprovação'] },
        ],
        cadence: [
            { label: 'Diário', title: 'Abertura e acompanhamento', items: ['Checar canais, mensagens e plataforma', 'Realizar daily com o CAM', 'Acompanhar tarefas críticas e aprovações', 'Fechar conversas e follow-ups'] },
            { label: 'Semanal', title: 'Engajamento', items: ['Revisar boas práticas da operação', 'Acompanhar avaliações e aprovações antigas', 'Participar do ritual do time completo'] },
            { label: 'Quinzenal', title: 'Clientes críticos ou novos', items: ['Participar de checkpoints com CAM', 'Acelerar ativação e engajamento', 'Atualizar mensagens padrão'] },
            { label: 'Mensal', title: 'Fechamento de ciclo', items: ['Apoiar apresentações e viradas', 'Organizar registros de boosters', 'Revisar pendências recorrentes'] },
        ],
        guides: [
            { title: 'Rotinas fixas', items: ['Bater ponto e checar canais no início do dia', 'Fazer check de pauta às 16h', 'Acompanhar pendências e aprovações externas', 'Registrar conversas e decisões nas tarefas'] },
            { title: 'Escalada ao CAM', items: ['Risco de churn ou insatisfação', 'Mudança relevante de escopo', 'Decisão comercial ou estratégica', 'Cliente crítico sem resolução operacional'] },
        ],
        tools: ['ManySpace', 'Chat e tarefas', 'Métricas Allyo', 'WhatsApp', 'E-mail', 'Google Meet'],
        integration: 'O CAS garante previsibilidade no cotidiano e oferece ao CAM contexto confiável para decisões estratégicas, mantendo comunicação, pauta e clientes críticos sob controle.',
    },
    cqs: {
        code: 'CQS',
        name: 'Creative Quality Specialist',
        icon: ShieldCheck,
        purpose: 'Guardião de escopo, briefing, prazo, cobrança e qualidade final.',
        description: 'Atua como camada crítica da operação: valida a entrada das tarefas, revisa as entregas, reduz retrabalho e garante consistência antes que qualquer material siga para o cliente.',
        responsibilities: [
            { title: 'Validação técnica', items: ['Validar briefing, escopo, prazo e cobrança antes da produção', 'Conferir contabilização de conteúdo e item do catálogo', 'Liberar, bloquear ou devolver tarefas com objetividade'] },
            { title: 'Qualidade criativa', items: ['Revisar aderência ao briefing e ao objetivo', 'Verificar consistência técnica e de marca', 'Usar comparativos visuais ao orientar ajustes'] },
            { title: 'Gestão de fluxo', items: ['Priorizar tarefas por prazo, booster e impacto', 'Acionar CAM ou CAS diante de desalinhamentos', 'Conhecer senioridade e especialidades do CriaHub'] },
            { title: 'Feedback', items: ['Descrever ponto, problema e ajuste esperado', 'Indicar onde e como ajustar quando necessário', 'Evitar comentários genéricos ou subjetivos'] },
        ],
        guides: [
            { title: 'SLA por crédito', items: ['Até 1 crédito: 24h úteis', 'De 1,1 a 2 créditos: 48h úteis', 'De 2,1 a 3 créditos: 72h úteis', 'Acima de 3 créditos: +24h por crédito adicional', 'Cada booster reduz 24h úteis'] },
            { title: 'Início da contagem', items: ['Briefing validado até 16h: inicia no mesmo dia útil', 'Após 16h: inicia no próximo dia útil às 9h'] },
            { title: 'Checklist de liberação', items: ['Escopo e cobrança corretos', 'Volume validado', 'Prazo viável', 'Briefing claro e completo', 'Insumos aplicados corretamente'] },
            { title: 'Status e prioridade', items: ['Nova e Análise CQS: preparar e validar', 'Em andamento: acompanhar produção', 'Aprovação CQS: revisão interna', 'Análise CAM: escalada estratégica', 'Aprovação externa: validação do cliente', 'Bloqueada ou Alterar: dependência e ajustes'] },
            { title: 'Copywriting', items: ['Produção e versionamento no documento oficial', 'Compartilhamento com o CQS', 'Revisão e comentários no próprio documento', 'Solicitação de ajustes quando necessário', 'Novo envio e aprovação final'] },
            { title: 'Cobrança de conteúdo', items: ['1 crédito: até 250 palavras', 'Múltiplas peças: 1 crédito por peça', 'Roteiro/vídeo: mínimo de 5 segundos de leitura por cena'] },
        ],
        tools: ['ManySpace', 'Catálogo criativo', 'Brand Kit', 'Google Drive e Docs', 'Métricas Allyo'],
        integration: 'CQS, CAM e CAS trabalham de forma integrada. Toda comunicação de revisão deve permanecer registrada na tarefa, com contexto, link e ação esperada.',
    },
    ad: {
        code: 'AD',
        name: 'Art Director',
        icon: Palette,
        purpose: 'Qualidade criativa, execução visual e consistência de marca.',
        description: 'Transforma o briefing em soluções visuais claras e funcionais, atua diretamente na produção e no direcionamento criativo e é a principal referência técnica de design dentro da conta.',
        responsibilities: [
            { title: 'Execução visual', items: ['Produzir peças com qualidade técnica e consistência', 'Traduzir briefings em soluções claras e funcionais', 'Aplicar tipografia, cor, grid e hierarquia corretamente'] },
            { title: 'Direcionamento', items: ['Apoiar o time em decisões visuais', 'Garantir aderência ao Brand Kit', 'Revisar peças antes da aprovação', 'Sinalizar quando o briefing impede uma boa execução'] },
            { title: 'Competências esperadas', items: ['Senso estético apurado', 'Domínio técnico de design', 'Clareza na interpretação do briefing', 'Atenção a detalhes, agilidade e abertura a feedbacks'] },
        ],
        guides: [
            { title: 'Papel na operação', items: ['Entrega visualmente bem resolvida', 'Identidade da marca preservada', 'Peça funcional para canal e objetivo', 'Qualidade técnica adequada'] },
            { title: 'Início e booster', items: ['Validação até 16h: inicia no mesmo dia útil', 'Após 16h: inicia no próximo dia útil às 9h', 'Cada booster reduz 24h úteis'] },
            { title: 'Escopo e briefing', items: ['Confirmar item correto do catálogo', 'Validar créditos e volume', 'Ler briefing e histórico completos', 'Acionar CAM em caso de desalinhamento'] },
            { title: 'Status da tarefa', items: ['Nova ou Análise CQS: aguardar validação', 'Iniciar ou Em andamento: produzir', 'Alterar: executar ajustes', 'Aprovação externa: aguardar cliente'] },
            { title: 'Prioridade de pauta', items: ['Prazo curto', 'Tarefas com booster', 'Demandas que destravam fluxo', 'Entregas de maior impacto'] },
            { title: 'Checklist final', items: ['Escopo correto', 'Cobrança correta', 'Volume validado', 'Prazo respeitado', 'Alinhamento com briefing e Brand Kit'] },
        ],
        tools: ['ManySpace', 'Figma e Adobe', 'Google Drive', 'Brand Kit', 'Catálogo criativo'],
        integration: 'O AD registra contexto e decisões na tarefa, aciona CAM ou CAS quando necessário e só libera materiais tecnicamente consistentes e alinhados à marca.',
    },
};

export const AllyoPeopleRoleContent = ({ role }: { role: RoleKey }) => {
    const profile = profiles[role];
    const Icon = profile.icon;

    return (
        <div className="space-y-10">
            <section className={`rounded-[16px] border bg-gradient-to-br from-[#f2f5eb] via-white to-[#f7f7f3] p-6 dark:from-[#172018] dark:via-zinc-950 dark:to-zinc-900 sm:p-10 ${ALLYO_BORDER}`}>
                <div className="flex items-center gap-3 text-[#708346]"><span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white shadow-sm dark:bg-zinc-900"><Icon size={20} /></span><span className="text-xs font-bold uppercase tracking-[.14em]">Creative Ops · Pessoas · {profile.code}</span></div>
                <h2 className="mt-6 max-w-[980px] font-season text-[clamp(32px,4vw,48px)] leading-[1.08]">{profile.purpose}</h2>
                <p className="mt-5 max-w-[980px] text-sm leading-7 text-[#626262] dark:text-zinc-400"><strong className="text-black dark:text-white">{profile.name} ({profile.code})</strong> — {profile.description}</p>
            </section>

            <RoleSection eyebrow="Escopo do papel" title="Principais responsabilidades">
                <div className="grid gap-[10px] md:grid-cols-2">
                    {profile.responsibilities.map((group, index) => <ResponsibilityCard key={group.title} index={index + 1} {...group} />)}
                </div>
            </RoleSection>

            {profile.cadence?.length ? <RoleSection eyebrow="Ritmo de trabalho" title="Rotina e cadência">
                <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">
                    {profile.cadence.map((item) => <CadenceCard key={`${item.label}-${item.title}`} {...item} />)}
                </div>
            </RoleSection> : null}

            {profile.guides?.length ? <RoleSection eyebrow="Referência prática" title="Guia operacional">
                <div className="grid gap-[10px] lg:grid-cols-2">
                    {profile.guides.map((group) => <GuideCard key={group.title} {...group} />)}
                </div>
            </RoleSection> : null}

            <RoleSection eyebrow="Ferramentas" title="Ecossistema de trabalho">
                <div className="flex flex-wrap gap-2">
                    {profile.tools.map((tool) => <span key={tool} className={`inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs font-semibold dark:bg-zinc-950 ${ALLYO_BORDER}`}><Sparkles size={13} className="text-[#829454]" />{tool}</span>)}
                </div>
            </RoleSection>

            <section className="rounded-[16px] border border-[#cbd8b0] bg-[#f3f6ed] p-6 dark:border-[#9db669]/30 dark:bg-[#172018] sm:p-8">
                <div className="flex items-center gap-3"><UsersRound size={19} className="text-[#708346]" /><h2 className="font-season text-[28px]">Integração na operação</h2></div>
                <p className="mt-4 max-w-[1000px] text-sm leading-7 text-[#606b55] dark:text-zinc-400">{profile.integration}</p>
            </section>
        </div>
    );
};

const RoleSection = ({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) => <section><span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#7f7f7f]">{eyebrow}</span><h2 className="mt-2 font-season text-[30px]">{title}</h2><div className="mt-5">{children}</div></section>;
const ResponsibilityCard = ({ index, title, items }: ContentGroup & { index: number }) => <article className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef3e4] font-mono text-[10px] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]">0{index}</span><h3 className="font-season text-xl">{title}</h3></div><BulletList items={items} /></article>;
const CadenceCard = ({ label, title, items }: Cadence) => <article className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.14em] text-[#829454]"><Clock3 size={13} />{label}</span><h3 className="mt-3 font-season text-xl">{title}</h3><BulletList items={items} /></article>;
const GuideCard = ({ title, items }: ContentGroup) => <article className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef3e4] text-[#708346] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Workflow size={16} /></span><h3 className="font-season text-xl">{title}</h3></div><BulletList items={items} /></article>;
const BulletList = ({ items }: { items: string[] }) => <ul className="mt-4 space-y-2.5">{items.map((item) => <li key={item} className="flex items-start gap-2.5 text-xs leading-6 text-[#626262] dark:text-zinc-400"><CheckCircle2 size={15} className="mt-1 shrink-0 text-[#8aa05b]" />{item}</li>)}</ul>;

export default AllyoPeopleRoleContent;
