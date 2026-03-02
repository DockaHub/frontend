import api from './api';

export const hostiziService = {
    getStats: async () => {
        const response = await api.get('/hostizi/stats');
        return response.data;
    },

    getAccounts: async () => {
        const response = await api.get('/hostizi/accounts');
        return response.data;
    },

    getNodes: async () => {
        const response = await api.get('/hostizi/nodes');
        return response.data;
    }
};
