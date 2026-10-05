import type { LucideIcon } from 'lucide-react';
import {
    ArrowUpRight,
    BookOpen,
    Boxes,
    BriefcaseBusiness,
    Check,
    CircleDollarSign,
    FileText,
    Gauge,
    Library,
    Link2,
    ListChecks,
    Palette,
    PanelsTopLeft,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ALLYO_BORDER } from './AllyoUI';

const resourceGroups = [
    {
        title: 'Operação e acompanhamento',
        description: 'Atalhos para executar e acompanhar a rotina da Allyo.',
        links: [
            { label: 'Tarefas', description: 'Fila de demandas, prazos e responsáveis.', view: 'tasks', icon: ListChecks },
            { label: 'Projetos', description: 'Gestão das operações e carteiras.', view: 'management-projects', icon: BriefcaseBusiness },
            { label: 'Métricas', description: 'Indicadores de volume, prazo, qualidade e capacidade.', view: 'metrics', icon: Gauge },
            { label: 'Clientes', description: 'Base administrativa e contexto das contas.', view: 'management-clients', icon: UsersRound },
        ],
    },
    {
        title: 'Materiais e padrões',
        description: 'Referências para manter qualidade e consistência nas entregas.',
        links: [
            { label: 'Catálogo criativo', description: 'Produtos, formatos, escopos e créditos.', view: 'management-catalog', icon: Library },
            { label: 'Brand Kit', description: 'Orientações sobre ativos e identidade dos clientes.', view: 'playbook-educacional-brand-kit', icon: Palette },
            { label: 'Painel Criativo', description: 'Visão de produção e acompanhamento do time.', view: 'creative-panel', icon: PanelsTopLeft },
            { label: 'Acessos', description: 'Referência para ferramentas e permissões da operação.', view: 'playbook-creative-ops-acessos', icon: Link2 },
        ],
    },
    {
        title: 'Conhecimento do time',
        description: 'Conteúdo para consulta, treinamento e evolução contínua.',
        links: [
            { label: 'Processos', description: 'Rituais, SLAs e regras de execução.', view: 'playbook-creative-ops-processos', icon: Boxes },
            { label: 'Educacional', description: 'Trilhas sobre plataforma, IA e produção criativa.', view: 'playbook-educacional', icon: BookOpen },
            { label: 'Glossário', description: 'Vocabulário comum da operação e de vídeo.', view: 'playbook-fundamentos-glossario', icon: FileText },
            { label: 'Central de Ajuda', description: 'Suporte e orientações de uso do ManySpace.', view: 'help-center', icon: Sparkles },
        ],
    },
];

export const AllyoUsefulLinksContent = () => {
    const [, setSearchParams] = useSearchParams();
    const navigate = (view: string) => setSearchParams((current) => {
        const params = new URLSearchParams(current);
        params.set('view', view);
        return params;
    });

    return (
        <div className="space-y-8">
            <section className={`rounded-[14px] border bg-gradient-to-br from-[#f2f5eb] via-white to-[#f5f5f0] p-6 dark:from-[#172018] dark:via-zinc-950 dark:to-zinc-900 sm:p-9 ${ALLYO_BORDER}`}>
                <span className="inline-flex items-center gap-2 text-[#708346]"><Link2 size={16} /><strong className="text-xs uppercase tracking-[.12em]">Atalhos do time</strong></span>
                <h2 className="mt-4 font-season text-[34px] font-normal">Tudo que a operação consulta, em um só lugar.</h2>
                <p className="mt-3 max-w-[760px] text-sm leading-6 text-[#666] dark:text-zinc-400">Os atalhos abaixo levam às áreas oficiais do ManySpace e às referências do Playbook, evitando links privados, duplicados ou desatualizados.</p>
            </section>

            {resourceGroups.map((group) => (
                <section key={group.title}>
                    <h2 className="font-season text-[27px] font-normal">{group.title}</h2>
                    <p className="mt-1 text-xs text-[#777] dark:text-zinc-400">{group.description}</p>
                    <div className="mt-4 grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">
                        {group.links.map((link) => <ResourceLink key={link.label} {...link} onClick={() => navigate(link.view)} />)}
                    </div>
                </section>
            ))}
        </div>
    );
};

const plans = [
    { name: 'Essencial', summary: 'Para operações em início de escala.', features: ['Franquia mensal de créditos', 'Volume controlado de tarefas', 'Alterações conforme escopo', 'Suporte operacional', 'Direção de arte'], tone: 'neutral' },
    { name: 'Pro', summary: 'Para uma rotina criativa recorrente.', features: ['Maior capacidade mensal', 'Mais tarefas simultâneas', 'Banco de créditos conforme contrato', 'Booster por ciclo', 'Acompanhamento de conta'], tone: 'neutral' },
    { name: 'Premium', summary: 'Para alto volume e máxima flexibilidade.', features: ['Volume robusto de créditos', 'Tarefas e usuários ampliados', 'Banco de créditos', 'Boosters por ciclo', 'Atendimento completo'], tone: 'featured' },
    { name: 'Enterprise', summary: 'Estrutura desenhada para operações complexas.', features: ['Créditos sob demanda', 'SLA e capacidade personalizados', 'Governança dedicada', 'Atendimento completo', 'Condições sob consulta'], tone: 'neutral' },
];

export const AllyoPlansContent = () => (
    <div className="space-y-9">
        <section className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 sm:p-9 ${ALLYO_BORDER}`}>
            <span className="inline-flex items-center gap-2 text-[#708346]"><CircleDollarSign size={16} /><strong className="text-xs uppercase tracking-[.12em]">Estruturas comerciais</strong></span>
            <h2 className="mt-4 font-season text-[34px] font-normal">Planos adequados ao ritmo de cada operação.</h2>
            <p className="mt-3 max-w-[840px] text-sm leading-6 text-[#666] dark:text-zinc-400">A composição final depende de volume, complexidade, SLA e modelo de atendimento. Valores e condições comerciais devem ser confirmados na proposta vigente.</p>
        </section>

        <section className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => <PlanCard key={plan.name} {...plan} />)}
        </section>

        <section>
            <span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#7f7f7f]">Modelos alternativos</span>
            <h2 className="mt-2 font-season text-[28px] font-normal">Necessidades que fogem da recorrência</h2>
            <div className="mt-5 grid gap-[10px] lg:grid-cols-2">
                <AlternativePlan eyebrow="Agências" title="Créditos avulsos e saldo acumulativo" text="Modelo para parceiros que atendem várias marcas e precisam contratar capacidade criativa de forma flexível, conforme regras comerciais vigentes." />
                <AlternativePlan eyebrow="Projetos" title="Escopo e prazo sob consulta" text="Contratação pontual dimensionada pela complexidade, volume de créditos, especialidades envolvidas e prazo necessário para a entrega." />
            </div>
        </section>

        <section className="rounded-[14px] border border-[#cbd8b0] bg-[#f3f6ed] p-6 dark:border-[#9db669]/30 dark:bg-[#172018]">
            <strong className="text-sm">Regra para o time</strong>
            <p className="mt-2 text-xs leading-5 text-[#66705b] dark:text-zinc-400">Não prometa preço, quantidade, SLA ou benefício fora da proposta aprovada. Em caso de dúvida, valide as condições com a liderança comercial.</p>
        </section>
    </div>
);

type GlossaryItem = readonly [string, string];

const operationTerms: GlossaryItem[] = [
    ['AD (Art Director)', 'Responsável pela direção visual e pela consistência técnica e estética das entregas.'],
    ['Aprovação externa', 'Etapa em que a entrega aguarda avaliação e retorno do cliente.'],
    ['Booster', 'Recurso que antecipa uma entrega conforme as regras do plano contratado.'],
    ['Brand Kit', 'Conjunto de logos, cores, fontes e demais ativos de identidade da marca.'],
    ['Briefing', 'Informações estratégicas e técnicas que orientam a execução de uma demanda.'],
    ['CAC', 'Custo total necessário para adquirir um novo cliente.'],
    ['CAM', 'Profissional que conecta estratégia do cliente e operação criativa.'],
    ['CAS', 'Responsável pelo suporte e pela organização operacional das tarefas.'],
    ['Catálogo', 'Relação oficial dos serviços, formatos, escopos e créditos disponíveis.'],
    ['Checkpoint', 'Ritual periódico para revisar entregas, riscos e próximos passos.'],
    ['Churn', 'Cancelamento do serviço ou perda de um cliente em determinado período.'],
    ['Cliente', 'Organização atendida, que pode possuir marcas, contas e usuários distintos.'],
    ['CQS', 'Especialista que analisa briefing, qualidade e aderência antes da produção.'],
    ['CriaHub', 'Comunidade de profissionais que participa da produção criativa.'],
    ['Créditos', 'Unidade usada para dimensionar e consumir os serviços do catálogo.'],
    ['Design', 'Disciplina que combina função, comunicação e expressão visual.'],
    ['Designer', 'Profissional responsável por conceber e executar soluções de design.'],
    ['Downgrade', 'Redução de plano, capacidade ou benefícios contratados.'],
    ['Fidelidade', 'Período mínimo de permanência definido em contrato.'],
    ['Forecast', 'Previsão de demanda, receita, capacidade ou consumo futuro.'],
    ['Guia Verbal', 'Diretrizes de voz, tom, linguagem e mensagens da marca.'],
    ['Guia Visual', 'Diretrizes que organizam estilo, identidade e aplicações gráficas.'],
    ['ICP', 'Perfil de cliente ideal para a estratégia do negócio.'],
    ['Imersão', 'Ritual inicial para compreender marca, públicos, objetivos e contexto.'],
    ['Key Visual (KV)', 'Peça-mãe que define o conceito visual de uma campanha.'],
    ['LTV', 'Valor gerado por um cliente durante todo o relacionamento.'],
    ['ManySpace', 'Ambiente central de trabalho, comunicação e gestão da operação Allyo.'],
    ['Modalidades de tarefas', 'Classificação da demanda: criação, originação, variação ou redimensionamento.'],
    ['MRR', 'Receita mensal recorrente gerada pelos contratos ativos.'],
    ['Multa', 'Penalidade prevista em contrato para situações específicas.'],
    ['Network Effect', 'Aumento de valor provocado pelo crescimento e conexão da rede.'],
    ['Pessoa Criativa', 'Profissional que concebe ou produz soluções originais.'],
    ['PMF', 'Ajuste entre a oferta e as necessidades reais do mercado.'],
    ['Produto', 'Combinação de plataforma e serviço oferecida ao cliente.'],
    ['Renovação', 'Extensão ou revalidação de um contrato ao final do ciclo.'],
    ['Repositório', 'Área onde ficam arquivos e materiais aprovados ou reutilizáveis.'],
    ['Roadmap', 'Planejamento de evolução organizado por prioridades e períodos.'],
    ['SaaS', 'Software disponibilizado como serviço recorrente.'],
    ['SLA', 'Prazo ou nível de serviço acordado para uma etapa da operação.'],
    ['Slot de tarefa', 'Espaço de capacidade destinado a uma nova demanda criativa.'],
    ['SMB', 'Segmento formado por pequenas e médias empresas.'],
    ['Squad', 'Equipe multidisciplinar organizada em torno de um objetivo.'],
    ['Stack de tarefas', 'Sequência de tarefas dependentes que compõem uma entrega maior.'],
    ['Status da tarefa', 'Etapa atual da demanda dentro do fluxo operacional.'],
    ['Style Guide', 'Guia de uso da identidade visual e de seus componentes.'],
    ['Tempo de produção', 'Período necessário para executar uma tarefa conforme o escopo.'],
    ['Upgrade', 'Ampliação do plano, capacidade ou benefícios contratados.'],
    ['Upsell', 'Oferta de capacidade ou serviço adicional ao contrato atual.'],
    ['Versionamento', 'Nova execução gerada após uma rodada de feedback.'],
];

const videoTerms: GlossaryItem[] = [
    ['Animação', 'Criação de movimento a partir de textos, imagens ou elementos gráficos.'],
    ['Cartela', 'Tela gráfica com texto, informação ou identidade dentro de um vídeo.'],
    ['Chroma Key', 'Técnica que substitui um fundo uniforme por outra imagem ou cena.'],
    ['Composição', 'Combinação de diferentes elementos visuais em uma única cena.'],
    ['Composição de áudio', 'Organização de vozes, música e efeitos sonoros.'],
    ['Edição', 'Seleção e organização de cenas para construir ritmo e narrativa.'],
    ['Fade', 'Transição gradual de entrada ou saída de imagem ou áudio.'],
    ['Frame Rate', 'Quantidade de quadros exibidos por segundo no vídeo.'],
    ['GC', 'Elemento gráfico que identifica pessoas, lugares ou informações na tela.'],
    ['Keyframe', 'Ponto que marca uma mudança de valor em uma animação.'],
    ['Mograph', 'Abreviação usada para motion graphics.'],
    ['Montagem', 'Arranjo das cenas para construir sentido, continuidade e ritmo.'],
    ['Motion Graphics', 'Design gráfico animado com textos, formas e imagens.'],
    ['Renderização', 'Processamento e exportação do arquivo final de vídeo.'],
    ['Rotoscopia', 'Recorte ou ajuste quadro a quadro de elementos filmados.'],
    ['Storyboard', 'Planejamento visual das cenas, movimentos e transições.'],
    ['Timeline', 'Área onde clipes, áudio e efeitos são organizados no tempo.'],
    ['Transição', 'Efeito visual ou sonoro usado entre cenas ou cortes.'],
    ['VFX', 'Efeitos visuais criados ou adicionados digitalmente.'],
    ['Vinheta', 'Trecho curto de abertura, encerramento ou identificação audiovisual.'],
];

export const AllyoGlossaryContent = () => (
    <div className="space-y-10">
        <GlossarySection title="Operação & Negócio" items={operationTerms} />
        <GlossarySection title="Vídeo & Motion" items={videoTerms} />
    </div>
);

const ResourceLink = ({ icon: Icon, label, description, onClick }: { icon: LucideIcon; label: string; description: string; onClick: () => void }) => <button type="button" onClick={onClick} className={`group rounded-[14px] border bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-[#9db669] dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef3e4] text-[#768a4e] dark:bg-[#9db669]/10 dark:text-[#d0f08e]"><Icon size={16} /></span><ArrowUpRight size={15} className="text-[#aaa] transition group-hover:text-[#768a4e]" /></span><strong className="mt-4 block text-sm">{label}</strong><span className="mt-2 block text-[11px] leading-5 text-[#777] dark:text-zinc-400">{description}</span></button>;
const PlanCard = ({ name, summary, features, tone }: { name: string; summary: string; features: string[]; tone: string }) => <article className={`relative rounded-[16px] border p-6 ${tone === 'featured' ? 'border-[#9db669] bg-[#f5f8ef] dark:bg-[#172018]' : `bg-white dark:bg-zinc-950 ${ALLYO_BORDER}`}`}>{tone === 'featured' && <span className="absolute -top-3 left-5 rounded-full bg-[#829454] px-3 py-1 text-[8px] font-bold uppercase tracking-[.14em] text-white">Mais completo</span>}<span className="text-[9px] font-bold uppercase tracking-[.16em] text-[#7f7f7f]">{name}</span><h3 className="mt-4 font-season text-[25px]">Sob consulta</h3><p className="mt-2 min-h-10 text-[11px] leading-5 text-[#777] dark:text-zinc-400">{summary}</p><ul className="mt-5 space-y-3">{features.map((feature) => <li key={feature} className="flex gap-2 text-[11px] leading-4"><Check size={14} className="shrink-0 text-[#829454]" />{feature}</li>)}</ul></article>;
const AlternativePlan = ({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) => <article className={`rounded-[14px] border bg-white p-6 dark:bg-zinc-950 ${ALLYO_BORDER}`}><span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#7f7f7f]">{eyebrow}</span><h3 className="mt-3 font-season text-xl">{title}</h3><p className="mt-3 text-xs leading-5 text-[#777] dark:text-zinc-400">{text}</p></article>;
const GlossarySection = ({ title, items }: { title: string; items: GlossaryItem[] }) => <section><div className="flex items-end justify-between border-b border-[#e3e3e3] pb-3 dark:border-zinc-800"><div><span className="text-[9px] font-bold uppercase tracking-[.16em] text-[#829454]">Glossário</span><h2 className="mt-2 font-season text-[29px]">{title}</h2></div><span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#999]">{items.length} termos</span></div><div className="mt-5 grid gap-[10px] lg:grid-cols-2">{items.map(([term, definition]) => <article key={term} className={`rounded-[14px] border bg-white p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}><strong className="text-xs">{term}</strong><p className="mt-2 text-[11px] leading-5 text-[#666] dark:text-zinc-400">{definition}</p></article>)}</div></section>;
