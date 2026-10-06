export const ALLYO_CANONICAL_STATUSES = [
    'Iniciar', 'Em andamento', 'Em revisão', 'Alteração', 'Concluída', 'Bloqueada', 'Inativa',
] as const;

export type AllyoCanonicalStatus = typeof ALLYO_CANONICAL_STATUSES[number];

export const normalizeAllyoTaskStatus = (status: unknown): AllyoCanonicalStatus => {
    const normalized = String(status || '').trim().toLocaleLowerCase('pt-BR');
    const aliases: Record<string, AllyoCanonicalStatus> = {
        'a iniciar': 'Iniciar', iniciar: 'Iniciar', rascunho: 'Iniciar', nova: 'Iniciar',
        'em andamento': 'Em andamento', producao: 'Em andamento', 'em produção': 'Em andamento',
        'em revisão': 'Em revisão', revisao: 'Em revisão', 'aguardando aprovação': 'Em revisão',
        alteração: 'Alteração', alteracao: 'Alteração', 'em alteração': 'Alteração', 'em alteracao': 'Alteração',
        concluído: 'Concluída', concluido: 'Concluída', concluída: 'Concluída', concluida: 'Concluída', aprovado: 'Concluída', aprovada: 'Concluída',
        bloqueada: 'Bloqueada', bloqueado: 'Bloqueada', inativa: 'Inativa', inativo: 'Inativa', cancelada: 'Inativa', cancelado: 'Inativa',
    };
    return aliases[normalized] || 'Bloqueada';
};

export const calculateAllyoSlaHours = ({ credits, slaHours, revisionNumber = 1, category = '', boosterUnits = 0 }: {
    credits: number; slaHours: number; revisionNumber?: number; category?: string; boosterUnits?: number;
}): number => {
    const graphicDesign = /design|arte|graphic|branding|social|digital|banner|carrossel|apresenta/i.test(category);
    const base = revisionNumber <= 1 ? Math.ceil(Math.max(0, credits)) * Math.max(0, slaHours) : (graphicDesign ? 8 : 24);
    return Math.max(0, base - Math.max(0, Math.floor(boosterUnits)) * Math.max(0, slaHours));
};

interface StackTask {
    id: string;
    status?: string;
    dependsOn?: string[];
}

export const payableTaskIdsAfterStackClosure = (tasks: StackTask[]): Set<string> => {
    const byId = new Map(tasks.map((task) => [task.id, task]));
    const neighbors = new Map<string, Set<string>>();
    for (const task of tasks) {
        if (!neighbors.has(task.id)) neighbors.set(task.id, new Set());
        for (const dependency of task.dependsOn || []) {
            if (!byId.has(dependency)) continue;
            neighbors.get(task.id)?.add(dependency);
            if (!neighbors.has(dependency)) neighbors.set(dependency, new Set());
            neighbors.get(dependency)?.add(task.id);
        }
    }
    const payable = new Set<string>();
    const visited = new Set<string>();
    for (const task of tasks) {
        if (visited.has(task.id)) continue;
        const component: StackTask[] = [];
        const queue = [task.id];
        while (queue.length) {
            const id = queue.shift()!;
            if (visited.has(id)) continue;
            visited.add(id);
            const member = byId.get(id);
            if (member) component.push(member);
            for (const neighbor of neighbors.get(id) || []) if (!visited.has(neighbor)) queue.push(neighbor);
        }
        const closed = component.every((member) => normalizeAllyoTaskStatus(member.status) === 'Concluída');
        if (closed) component.forEach((member) => payable.add(member.id));
    }
    return payable;
};
