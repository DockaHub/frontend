export type AllyoFlowTaskStatus = 'done' | 'in_progress' | 'available' | 'blocked' | 'review';

export interface AllyoFlowTask {
    id: string;
    title: string;
    specialty: string;
    assignee: string;
    credits: number;
    status: AllyoFlowTaskStatus;
    dependsOn?: string[];
}

export interface AllyoFlowStage {
    id: string;
    title: string;
    tasks: AllyoFlowTask[];
}

export interface AllyoProject {
    id: string;
    name: string;
    client: string;
    deadline: string;
    stages: AllyoFlowStage[];
}

export const ALLYO_PROJECTS: AllyoProject[] = [
    {
        id: 'project-fauves-launch', name: 'Campanha de lançamento 2027', client: 'Fauves', deadline: '23/12/2026',
        stages: [
            { id: 'strategy', title: 'Estratégia', tasks: [{ id: 'flow-fauves-copy', title: 'Conceito e copy da campanha', specialty: 'Copywriting', assignee: 'Ana', credits: 0.5, status: 'done' }] },
            { id: 'creation', title: 'Criação', tasks: [
                { id: '123456', title: 'KV campanha de lançamento', specialty: 'Direção de arte', assignee: 'Levy', credits: 1, status: 'in_progress', dependsOn: ['flow-fauves-copy'] },
                { id: 'flow-fauves-storyboard', title: 'Storyboard do vídeo', specialty: 'Storyboard', assignee: 'Joana', credits: 1, status: 'in_progress', dependsOn: ['flow-fauves-copy'] },
            ] },
            { id: 'production', title: 'Produção', tasks: [
                { id: 'flow-fauves-social', title: 'Estáticos e carrosséis', specialty: 'Direção de arte', assignee: 'Bianca', credits: 1.5, status: 'blocked', dependsOn: ['123456'] },
                { id: '123459', title: 'Edição do case anual', specialty: 'Edição de vídeo', assignee: 'Caio', credits: 1, status: 'blocked', dependsOn: ['flow-fauves-storyboard'] },
            ] },
            { id: 'delivery', title: 'Finalização', tasks: [{ id: 'flow-fauves-review', title: 'Revisão e pacote final', specialty: 'Controle de qualidade', assignee: 'Marina', credits: 0.5, status: 'blocked', dependsOn: ['flow-fauves-social', '123459'] }] },
        ],
    },
    {
        id: 'project-asterysko-security', name: 'Campanha Segurança 24h', client: 'Asterysko', deadline: '28/12/2026',
        stages: [
            { id: 'strategy', title: 'Estratégia', tasks: [{ id: 'flow-asterysko-copy', title: 'Copy da campanha', specialty: 'Copywriting', assignee: 'Ana', credits: 0.5, status: 'done' }] },
            { id: 'creation', title: 'Criação', tasks: [
                { id: '123461', title: 'Peças para mídia paga', specialty: 'Direção de arte', assignee: 'Caio', credits: 1, status: 'in_progress', dependsOn: ['flow-asterysko-copy'] },
                { id: '123457', title: 'Storyboard para filme manifesto', specialty: 'Storyboard', assignee: 'Joana', credits: 1, status: 'in_progress', dependsOn: ['flow-asterysko-copy'] },
            ] },
            { id: 'production', title: 'Produção', tasks: [{ id: 'flow-asterysko-motion', title: 'Motion da campanha', specialty: 'Motion design', assignee: 'Levy', credits: 1.5, status: 'blocked', dependsOn: ['123457'] }] },
            { id: 'delivery', title: 'Finalização', tasks: [{ id: 'flow-asterysko-kit', title: 'Kit de mídia final', specialty: 'Finalização', assignee: 'Marina', credits: 0.5, status: 'blocked', dependsOn: ['123461', 'flow-asterysko-motion'] }] },
        ],
    },
    {
        id: 'project-tokyon-institutional', name: 'Campanha institucional', client: 'Tokyon', deadline: '30/12/2026',
        stages: [
            { id: 'strategy', title: 'Estratégia', tasks: [{ id: 'flow-tokyon-script', title: 'Roteiro e narrativa', specialty: 'Copywriting', assignee: 'Ana', credits: 0.5, status: 'done' }] },
            { id: 'creation', title: 'Criação', tasks: [{ id: '123462', title: 'Apresentação comercial', specialty: 'Direção de arte', assignee: 'Levy', credits: 1, status: 'in_progress', dependsOn: ['flow-tokyon-script'] }] },
            { id: 'production', title: 'Produção', tasks: [{ id: '123458', title: 'Motion para redes sociais', specialty: 'Motion design', assignee: 'Levy', credits: 1, status: 'review', dependsOn: ['123462'] }] },
            { id: 'delivery', title: 'Finalização', tasks: [{ id: 'flow-tokyon-export', title: 'Adaptações e exportação', specialty: 'Finalização', assignee: 'Marina', credits: 0.5, status: 'blocked', dependsOn: ['123458'] }] },
        ],
    },
    {
        id: 'project-manyspace-brand', name: 'Reposicionamento digital', client: 'ManySpace', deadline: '05/01/2027',
        stages: [
            { id: 'strategy', title: 'Estratégia', tasks: [{ id: 'flow-manyspace-content', title: 'Arquitetura de conteúdo', specialty: 'Conteúdo', assignee: 'Ana', credits: 0.5, status: 'done' }] },
            { id: 'creation', title: 'Criação', tasks: [{ id: '123460', title: 'Landing page institucional', specialty: 'Design digital', assignee: 'Joana', credits: 1, status: 'done', dependsOn: ['flow-manyspace-content'] }] },
            { id: 'production', title: 'Produção', tasks: [{ id: '123463', title: 'Desdobramento de identidade', specialty: 'Branding', assignee: 'Joana', credits: 1, status: 'review', dependsOn: ['123460'] }] },
            { id: 'delivery', title: 'Finalização', tasks: [{ id: 'flow-manyspace-publish', title: 'QA e publicação', specialty: 'Web', assignee: 'Rafael', credits: 0.5, status: 'blocked', dependsOn: ['123463'] }] },
        ],
    },
];

export const getAllyoProject = (projectId: string) => ALLYO_PROJECTS.find((project) => project.id === projectId);
