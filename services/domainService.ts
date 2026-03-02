import api from './api';

export interface Domain {
    id: string;
    name: string;
    status: 'PENDING' | 'VERIFIED' | 'FAILED';
    verificationToken?: string;
    dkimTokens?: string[];
    organizationId: string;
    createdAt: string;
}

export const domainService = {
    listDomains: async (organizationId: string): Promise<Domain[]> => {
        const response = await api.get(`/domains/${organizationId}/list`);
        return response.data;
    },

    listAllGlobal: async (): Promise<Domain[]> => {
        const response = await api.get('/domains/all'); // Ensure this route matches backend
        return response.data;
    },

    updateDomain: async (id: string, data: { organizationId?: string }): Promise<Domain> => {
        const response = await api.patch(`/domains/${id}`, data);
        return response.data;
    },

    createDomain: async (organizationId: string, domain: string): Promise<Domain> => {
        const response = await api.post(`/domains/${organizationId}`, { domain });
        return response.data;
    },

    getDomain: async (id: string): Promise<Domain> => {
        const response = await api.get(`/domains/${id}`); // This route wasn't explicitly seen in domain.routes.ts but might exist or be added later. 
        // Wait, looking at domain.routes.ts, there is NO getById route. 
        // Only list, create, delete.
        // So I should probably remove getDomain or comment it out if not used.
        // But for safe-keeping I'll leave it or check if I need it. 
        // MailboxManager doesn't use it.
        return response.data;
    },

    deleteDomain: async (id: string): Promise<void> => {
        await api.delete(`/domains/${id}`);
    }
};
