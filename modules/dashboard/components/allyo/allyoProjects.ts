import type { AllyoDemand, AllyoDemandTask } from '../../../../services/allyoService';

export type AllyoFlowTaskStatus = 'done' | 'in_progress' | 'available' | 'blocked' | 'review';

export interface AllyoFlowTask {
    id: string;
    title: string;
    specialty: string;
    assignee: string;
    credits: number;
    status: AllyoFlowTaskStatus;
    dependsOn?: string[];
    requiresClientApproval?: boolean;
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

const preferredStageOrder = ['Conteúdo', 'Criação', 'Produção', 'Finalização'];

const inferStage = (task: AllyoDemandTask) => {
    if (task.workflowStage) return task.workflowStage;
    const value = `${task.title} ${task.team}`.toLocaleLowerCase('pt-BR');
    if (/(copy|conteúdo|conteudo|roteiro|texto|legenda)/.test(value)) return 'Conteúdo';
    if (/(cqs|qualidade|finalização|finalizacao|qa|publicação|publicacao)/.test(value)) return 'Finalização';
    if (/(motion|vídeo|video|animação|animacao|edição|edicao)/.test(value)) return 'Produção';
    return 'Criação';
};

const mapStatus = (task: AllyoDemandTask): AllyoFlowTaskStatus => {
    if (task.dependencyBlocked || task.status === 'Bloqueada') return 'blocked';
    if (task.status === 'Concluído' || task.status === 'Concluída') return 'done';
    if (task.status === 'Em revisão') return 'review';
    if (task.status === 'Em andamento') return 'in_progress';
    return 'available';
};

export const mapDemandToAllyoProject = (demand: AllyoDemand): AllyoProject => {
    const tasks = demand.tasksList || [];
    const grouped = new Map<string, AllyoFlowTask[]>();

    tasks.forEach((task) => {
        const stage = inferStage(task);
        const items = grouped.get(stage) || [];
        items.push({
            id: task.id,
            title: task.title,
            specialty: task.team,
            assignee: task.assignee || demand.team?.[0] || 'A definir',
            credits: Math.max(0.01, Number(task.credits ?? 1)),
            status: mapStatus(task),
            dependsOn: task.dependsOn || [],
            requiresClientApproval: task.requiresClientApproval,
        });
        grouped.set(stage, items);
    });

    const stages = Array.from(grouped.entries())
        .sort(([left], [right]) => {
            const leftIndex = preferredStageOrder.indexOf(left);
            const rightIndex = preferredStageOrder.indexOf(right);
            return (leftIndex < 0 ? preferredStageOrder.length : leftIndex) - (rightIndex < 0 ? preferredStageOrder.length : rightIndex);
        })
        .map(([title, stageTasks]) => ({ id: title.toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-'), title, tasks: stageTasks }));

    return {
        id: demand.id,
        name: demand.name,
        client: demand.workspace?.name || 'Cliente Allyo',
        deadline: (() => {
            if (!demand.deadline) return 'A definir';
            const value = new Date(demand.deadline);
            return Number.isNaN(value.getTime()) ? demand.deadline : value.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        })(),
        stages,
    };
};
