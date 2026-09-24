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

export interface AllyoDesignAsset {
    id: number;
    projectId: string;
    name: string;
    version: string;
    color: string;
    approved: boolean;
    fileUrl?: string;
    thumbnailUrl?: string;
    createdAt: string;
}

export interface AllyoClient {
    id: string;
    name: string;
    slug?: string;
    segment: string;
    monthlyCredits: number;
    creditBank?: number;
    availableCredits?: number;
    usedCredits: number;
    cam: string;
    contractEnd: string;
    contractEndDate?: string;
    since: string;
    logo?: string;
    projectsCount?: number;
    usersCount?: number;
    legalName?: string;
    document?: string;
    area?: string;
    tier?: '1' | '2' | '3' | string;
    contractStart?: string;
    responsibleEmail?: string;
    fileNamingPattern?: string;
    aiRestricted?: boolean;
    requireTwoFactor?: boolean;
    billingStatus?: 'OK' | 'Aviso' | 'Bloqueado' | string;
    notes?: string;
    creativeDirection?: string;
}

export interface ClientsResponse {
    count: number;
    clients: AllyoClient[];
}

export type AllyoUserCategory =
    | 'ATENDIMENTO'
    | 'CRIATIVO'
    | 'CLIENTE'
    | 'ADMIN_ATENDIMENTO'
    | 'ADMIN_CRIATIVO'
    | 'CRIATIVO_SMB'
    | 'SQUAD_LEADER'
    | 'CREATIVE_EXCELLENCE_SR_MANAGER'
    | 'CREATIVE_ACCOUNT_MANAGER'
    | 'CREATIVE_QUALITY_SPECIALIST'
    | 'CREATIVE_ACCOUNT_SUPPORT'
    | 'CUSTOMER_SUPPORT'
    | 'ART_DIRECTOR';

export interface AllyoUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    category: AllyoUserCategory;
    categoryLabel?: string;
    role?: string;
    jobTitle?: string;
    team?: string;
    language?: string;
    status?: 'Ativo' | 'Convite enviado' | 'Inativo' | string;
    hierarchy?: { level: number; label: string };
    client?: { id: string; name: string } | null;
    createdAt?: string;
}

export interface UsersResponse {
    count: number;
    users: AllyoUser[];
}

export type AllyoCatalogProductStatus = 'draft' | 'published' | 'archived';

export interface AllyoCatalogProduct {
    code: string;
    name: string;
    description: string;
    category: string;
    subcategory?: string | null;
    specialistRole: string;
    status: AllyoCatalogProductStatus;
    catalogVisibility: 'public' | 'internal';
    publishedInPublicCatalog: boolean;
    visibleToClient: boolean;
    slaHours: number;
    deliveryQuantity?: number | null;
    billing: {
        label?: string | null;
        ruleKey?: string | null;
        unit: string;
        step: number;
        includedGroups: number;
        includedQuantity: number;
        countablePieces: boolean;
        maxQuantity?: number | null;
        unitNote?: string | null;
        wordsPerUnit?: number | null;
        characterCredits?: number | null;
    };
    credits: {
        original: number;
        additional?: number | null;
        resize?: number | null;
        variation?: number | null;
        additionalAllowed: boolean;
        resizeAllowed: boolean;
        variationAllowed: boolean;
    };
    formats: {
        editable: string[];
        final: string[];
        available: string[];
        sizesAndRatios: string[];
        channels: string[];
    };
    addons: Array<{ code: string; name: string; credits: number; billable: boolean }>;
    relatedOptions: string[];
    sourceUrl?: string | null;
    version?: number;
    effectiveFrom?: string | null;
    effectiveUntil?: string | null;
}

export interface AllyoCatalogResponse {
    products: AllyoCatalogProduct[];
    engine?: Record<string, unknown>;
    managementPolicy?: Record<string, unknown>;
    schemaVersion?: string;
}

export type AllyoCatalogProductPayload = Omit<AllyoCatalogProduct, 'version' | 'effectiveFrom' | 'effectiveUntil'>;

export interface CreateAllyoUserPayload {
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    category: AllyoUserCategory;
    jobTitle?: string;
    team?: string;
    language: string;
    clientId?: string;
}

export interface UpdateAllyoUserPayload extends Omit<CreateAllyoUserPayload, 'email' | 'avatarUrl'> {
    status?: 'Ativo' | 'Convite enviado' | 'Inativo';
}

export interface CreateAllyoClientPayload {
    name: string;
    legalName?: string;
    document?: string;
    segment: string;
    area?: string;
    tier: '1' | '2' | '3';
    monthlyCredits: number;
    contractStart?: string;
    contractEnd?: string;
    cam?: string;
    responsibleEmail?: string;
    logo?: string;
    fileNamingPattern?: string;
    aiRestricted: boolean;
    requireTwoFactor: boolean;
    billingStatus: 'OK' | 'Aviso' | 'Bloqueado';
    notes?: string;
    creativeDirection?: string;
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
    designs?: AllyoDesignAsset[];
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
    async getCatalog(): Promise<AllyoCatalogResponse> {
        const response = await api.get('/allyo/catalog');
        return response.data;
    },

    async createCatalogProduct(data: AllyoCatalogProductPayload): Promise<{ product: AllyoCatalogProduct }> {
        const response = await api.post('/allyo/catalog/products', data);
        return response.data;
    },

    async updateCatalogProduct(code: string, data: Partial<AllyoCatalogProductPayload> & { expectedVersion?: number }): Promise<{ product: AllyoCatalogProduct }> {
        const response = await api.patch(`/allyo/catalog/products/${encodeURIComponent(code)}`, data);
        return response.data;
    },

    async publishCatalogProduct(code: string, expectedVersion?: number): Promise<{ product: AllyoCatalogProduct }> {
        const response = await api.post(`/allyo/catalog/products/${encodeURIComponent(code)}/publish`, expectedVersion ? { expectedVersion } : {});
        return response.data;
    },

    async archiveCatalogProduct(code: string): Promise<{ success: boolean; code: string; status: 'archived' }> {
        const response = await api.delete(`/allyo/catalog/products/${encodeURIComponent(code)}`);
        return response.data;
    },

    /**
     * Busca todas as demandas dos clientes no Allyo Space
     */
    async getDemands(params?: { status?: string; workspaceId?: string }): Promise<DemandsResponse> {
        const response = await api.get('/allyo/demands', { params });
        return response.data;
    },

    /**
     * Busca todos os clientes / workspaces cadastrados na Allyo Space
     */
    async getClients(params?: { scope?: 'assigned' }): Promise<ClientsResponse> {
        const response = await api.get('/allyo/clients', { params });
        return response.data;
    },

    /**
     * Cadastra uma empresa que responde contratualmente pelos projetos.
     */
    async createClient(data: CreateAllyoClientPayload): Promise<{ client: AllyoClient }> {
        const response = await api.post('/allyo/clients', data);
        return response.data;
    },

    async updateClient(id: string, data: CreateAllyoClientPayload): Promise<{ client: AllyoClient }> {
        const response = await api.patch(`/allyo/clients/${id}`, data);
        return response.data;
    },

    async addClientCredits(id: string, data: { amount: number; note?: string }): Promise<{ client: AllyoClient }> {
        const response = await api.post(`/allyo/clients/${id}/credits`, data);
        return response.data;
    },

    /**
     * Lista usuários internos e usuários dos clientes com sua posição hierárquica.
     */
    async getUsers(params?: { category?: AllyoUserCategory; clientId?: string }): Promise<UsersResponse> {
        const response = await api.get('/allyo/users', { params });
        return response.data;
    },

    /**
     * Cria um usuário e deriva suas permissões a partir da categoria informada.
     */
    async createUser(data: CreateAllyoUserPayload): Promise<{ user: AllyoUser }> {
        const response = await api.post('/allyo/users', data);
        return response.data;
    },

    async updateUser(id: string, data: UpdateAllyoUserPayload): Promise<{ user: AllyoUser }> {
        const response = await api.patch(`/allyo/users/${id}`, data);
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
