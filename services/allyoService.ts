import api from './api';

export interface AllyoDemandBriefing {
    objective?: string;
    targetAudience?: string;
    deliverables?: string[];
    formats?: string[];
    creativeDirection?: string[];
    references?: string;
    notes?: string;
}

export interface AllyoDemand {
    id: string;
    name: string;
    service: string;
    status: 'Em andamento' | 'Em revisão' | 'Concluído' | 'Rascunho' | string;
    deadline?: string;
    progress: number;
    tasks: number;
    unread: number;
    accent?: string;
    team: string[];
    description?: string;
    workspace?: { id: string; name: string; plan?: string };
    briefing?: AllyoDemandBriefing | null;
    designsCount: number;
    messagesCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface DemandsResponse {
    count: number;
    demands: AllyoDemand[];
}

export interface DesignSubmission {
    name: string;
    version?: string;
    color?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
}

export interface ProjectMessagePayload {
    person?: string;
    role?: string;
    initials?: string;
    text: string;
}

export const allyoService = {
    /**
     * Busca todas as demandas dos clientes no Allyo Space
     */
    async getDemands(params?: { status?: string; workspaceId?: string }): Promise<DemandsResponse> {
        const response = await api.get('/allyo/demands', { params });
        return response.data;
    },

    /**
     * Atualiza o status, progresso ou prazo de um projeto
     */
    async updateProjectStatus(
        projectId: string,
        data: {
            status?: 'Em andamento' | 'Em revisão' | 'Concluído' | 'Rascunho' | string;
            progress?: number;
            deadline?: string;
            tasks?: number;
        }
    ) {
        const response = await api.post(`/allyo/projects/${projectId}/status`, data);
        return response.data;
    },

    /**
     * Submete uma nova versão de design para revisão do cliente
     */
    async submitDesignRevision(projectId: string, data: DesignSubmission) {
        const response = await api.post(`/allyo/projects/${projectId}/designs`, data);
        return response.data;
    },

    /**
     * Envia mensagem no chat da demanda
     */
    async sendProjectMessage(projectId: string, data: ProjectMessagePayload) {
        const response = await api.post(`/allyo/projects/${projectId}/messages`, data);
        return response.data;
    },

    /**
     * Atribui criativos à equipe da demanda
     */
    async assignProjectTeam(projectId: string, team: string[]) {
        const response = await api.post(`/allyo/projects/${projectId}/assign`, { team });
        return response.data;
    },

    /**
     * Alterna a liberação do Brand Brain para o cliente
     */
    async updateBrandBrainAccess(workspaceId: string, access: 'available' | 'unavailable') {
        const response = await api.post(`/allyo/workspaces/${workspaceId}/brand-brain`, { access });
        return response.data;
    },
};

export default allyoService;
