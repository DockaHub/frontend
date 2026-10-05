export interface AllyoPlaybookNode {
    id: string;
    label: string;
    children?: AllyoPlaybookNode[];
}

export const ALLYO_PLAYBOOK_SECTIONS: AllyoPlaybookNode[] = [
    {
        id: 'playbook-fundamentos', label: 'Fundamentos', children: [
            { id: 'playbook-fundamentos-boas-vindas', label: 'Boas-vindas' },
            { id: 'playbook-fundamentos-onboarding', label: 'Onboarding' },
            { id: 'playbook-fundamentos-sobre-allyo', label: 'Sobre a Allyo' },
            { id: 'playbook-fundamentos-excelencia-criativa', label: 'Excelência criativa' },
            { id: 'playbook-fundamentos-comunicacao-interna', label: 'Comunicação interna' },
            { id: 'playbook-fundamentos-links-uteis', label: 'Links úteis' },
            { id: 'playbook-fundamentos-planos-allyo', label: 'Planos Allyo' },
            { id: 'playbook-fundamentos-glossario', label: 'Glossário' },
        ],
    },
    {
        id: 'playbook-creative-ops', label: 'Creative Ops', children: [
            {
                id: 'playbook-creative-ops-pessoas', label: 'Pessoas', children: [
                    { id: 'playbook-creative-ops-pessoas-cesm', label: 'CESM' },
                    { id: 'playbook-creative-ops-pessoas-cam', label: 'CAM' },
                    { id: 'playbook-creative-ops-pessoas-cas', label: 'CAS' },
                    { id: 'playbook-creative-ops-pessoas-cqs', label: 'CQS' },
                    { id: 'playbook-creative-ops-pessoas-ad', label: 'AD' },
                ],
            },
            {
                id: 'playbook-creative-ops-processos', label: 'Processos', children: [
                    { id: 'playbook-creative-ops-rituais-cliente', label: 'Rituais com cliente' },
                    { id: 'playbook-creative-ops-rituais-internos', label: 'Rituais internos' },
                    { id: 'playbook-creative-ops-regras-calls', label: 'Regras gerais de calls' },
                    { id: 'playbook-creative-ops-manutencao-contas', label: 'Manutenção de contas' },
                    { id: 'playbook-creative-ops-custo-criativo', label: 'Gestão de custo criativo' },
                    { id: 'playbook-creative-ops-carteiras', label: 'Gestão de carteiras' },
                    { id: 'playbook-creative-ops-entrega-arquivos', label: 'Entrega de arquivos' },
                    { id: 'playbook-creative-ops-pauta', label: 'Gestão de pauta' },
                    { id: 'playbook-creative-ops-comunicacao-cliente', label: 'Comunicação com cliente' },
                ],
            },
            {
                id: 'playbook-creative-ops-ferramentas', label: 'Ferramentas', children: [
                    {
                        id: 'playbook-creative-ops-plataforma-allyo', label: 'Plataforma Allyo', children: [
                            { id: 'playbook-creative-ops-plataforma-visao-geral', label: 'Visão geral' },
                            { id: 'playbook-creative-ops-plataforma-recursos', label: 'Principais recursos' },
                            { id: 'playbook-creative-ops-plataforma-fluxo', label: 'Fluxo de trabalho' },
                            { id: 'playbook-creative-ops-plataforma-papeis', label: 'Papéis e rotina' },
                            { id: 'playbook-creative-ops-plataforma-boas-praticas', label: 'Boas práticas de uso' },
                            { id: 'playbook-creative-ops-plataforma-atencao', label: 'Pontos de atenção' },
                        ],
                    },
                    { id: 'playbook-creative-ops-acessos', label: 'Acessos' },
                ],
            },
        ],
    },
    {
        id: 'playbook-educacional', label: 'Educacional', children: [
            {
                id: 'playbook-educacional-processos', label: 'Processos', children: [
                    { id: 'playbook-educacional-sla', label: 'SLA de entrega' },
                    { id: 'playbook-educacional-cobranca', label: 'Cobrança de tarefas' },
                    { id: 'playbook-educacional-video', label: 'Projetos de vídeo' },
                    { id: 'playbook-educacional-identidade', label: 'Identidade visual' },
                    { id: 'playbook-educacional-ia', label: 'Inteligência Artificial (IA)' },
                ],
            },
            {
                id: 'playbook-educacional-plataforma', label: 'Plataforma', children: [
                    { id: 'playbook-educacional-designer-agent', label: 'Designer Agent' },
                    { id: 'playbook-educacional-lista-tarefas', label: 'Lista de tarefas' },
                    { id: 'playbook-educacional-stack', label: 'Stack de tarefas' },
                    { id: 'playbook-educacional-booster', label: 'Booster' },
                    { id: 'playbook-educacional-canva', label: 'Canva' },
                    { id: 'playbook-educacional-brand-kit', label: 'Brand Kit' },
                ],
            },
            {
                id: 'playbook-educacional-catalogo', label: 'Catálogo Criativo', children: [
                    { id: 'playbook-catalogo-adesivo', label: 'Adesivo' },
                    { id: 'playbook-catalogo-ebook', label: 'E-book' },
                    { id: 'playbook-catalogo-landing-page', label: 'Layout de landing page' },
                    { id: 'playbook-catalogo-storyboard', label: 'Storyboard' },
                    { id: 'playbook-catalogo-locucao', label: 'Locução' },
                    { id: 'playbook-catalogo-logos', label: 'Logos' },
                    { id: 'playbook-catalogo-locucao-ia', label: 'Locução via IA' },
                    { id: 'playbook-catalogo-legendagem-ia', label: 'Legendagem via IA' },
                    { id: 'playbook-catalogo-video-ia', label: 'Geração de vídeo via IA' },
                    { id: 'playbook-catalogo-animacao-ia', label: 'Animação de imagem via IA' },
                    { id: 'playbook-catalogo-imagem-ia', label: 'Geração de imagem via IA' },
                    { id: 'playbook-catalogo-redimensionamento-ia', label: 'Redimensionamento via IA' },
                    { id: 'playbook-catalogo-avatar-ia', label: 'Avatar via IA' },
                    { id: 'playbook-catalogo-mascote-ia', label: 'Mascote com IA' },
                ],
            },
        ],
    },
    {
        id: 'playbook-governanca', label: 'Governança', children: [
            { id: 'playbook-governanca-indicadores', label: 'Indicadores' },
            { id: 'playbook-governanca-metas', label: 'Alinhamento de metas' },
            { id: 'playbook-governanca-feedback', label: 'Avaliação e feedback' },
            { id: 'playbook-governanca-desenvolvimento', label: 'Desenvolvimento profissional' },
        ],
    },
    {
        id: 'playbook-artemis', label: 'Artemis Agent.IA', children: [
            {
                id: 'playbook-artemis-calculadora', label: 'Calculadora', children: [
                    { id: 'playbook-artemis-visao-geral', label: 'Visão geral' },
                    { id: 'playbook-artemis-arquitetura', label: 'Arquitetura' },
                    { id: 'playbook-artemis-fluxos', label: 'Fluxos' },
                    { id: 'playbook-artemis-engines', label: 'Engines' },
                    { id: 'playbook-artemis-frentes', label: 'Frentes operacionais' },
                    { id: 'playbook-artemis-governanca', label: 'Governança técnica' },
                    { id: 'playbook-artemis-roadmap', label: 'Roadmap' },
                ],
            },
        ],
    },
    {
        id: 'playbook-criahub', label: 'CriaHub', children: [
            { id: 'playbook-criahub-visao-geral', label: 'CriaHub' },
            { id: 'playbook-criahub-boas-vindas', label: 'Boas-vindas' },
            { id: 'playbook-criahub-sobre', label: 'Sobre o CriaHub' },
            { id: 'playbook-criahub-comunicacao', label: 'Comunicação' },
            { id: 'playbook-criahub-plataforma', label: 'Plataforma' },
            { id: 'playbook-criahub-checklist', label: 'Checklist' },
            { id: 'playbook-criahub-performance', label: 'Performance' },
            { id: 'playbook-criahub-glossario', label: 'Glossário' },
        ],
    },
];

export interface AllyoPlaybookEntry extends AllyoPlaybookNode {
    breadcrumbs: string[];
}

export const flattenPlaybookEntries = (nodes = ALLYO_PLAYBOOK_SECTIONS, parents: string[] = []): AllyoPlaybookEntry[] => nodes.flatMap((node) => {
    const breadcrumbs = [...parents, node.label];
    return [{ ...node, breadcrumbs }, ...flattenPlaybookEntries(node.children || [], breadcrumbs)];
});

export const ALLYO_PLAYBOOK_ENTRIES = flattenPlaybookEntries();
export const ALLYO_PLAYBOOK_WELCOME_ID = 'playbook-fundamentos-boas-vindas';
