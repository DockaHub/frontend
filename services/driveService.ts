import { DriveItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export const driveService = {
    // Lista todos os itens do usuário
    async listItems(token: string, parentId?: string | null, organizationId?: string): Promise<DriveItem[]> {
        let url = `${API_BASE_URL}/drive`;
        const params = new URLSearchParams();
        if (organizationId) params.append('organizationId', organizationId);
        if (parentId) params.append('parentId', parentId);

        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro ao listar itens:', response.status, errorText);
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || `Erro ${response.status}: ${errorText}`);
            } catch (e) {
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
        }

        return response.json();
    },

    // Lista itens compartilhados com o usuário
    async listSharedItems(token: string): Promise<DriveItem[]> {
        const response = await fetch(`${API_BASE_URL}/drive/shared`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao listar itens compartilhados');
        }

        return response.json();
    },

    // Compartilhar item
    async shareItem(id: string, email: string, permission: 'VIEW' | 'EDIT', token: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/drive/${id}/share`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, permission }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao compartilhar item');
        }
    },

    // Remover compartilhamento
    async unshareItem(id: string, targetUserId: string, token: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/drive/${id}/share/${targetUserId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao remover compartilhamento');
        }
    },

    // Cria nova pasta
    async createFolder(name: string, parentId: string | null, token: string, organizationId?: string): Promise<DriveItem> {
        const response = await fetch(`${API_BASE_URL}/drive/folder`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, parentId, organizationId }),
        });

        if (!response.ok) {
            throw new Error('Erro ao criar pasta');
        }

        return response.json();
    },

    // Upload de arquivo
    async uploadFile(file: File, parentId: string | null, token: string, organizationId?: string): Promise<DriveItem> {
        const formData = new FormData();
        formData.append('file', file);
        if (organizationId) {
            formData.append('organizationId', organizationId);
        }
        if (parentId) {
            formData.append('parentId', parentId);
        }

        const response = await fetch(`${API_BASE_URL}/drive/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao fazer upload do arquivo');
        }

        return response.json();
    },

    // Download de arquivo
    getDownloadUrl(id: string, token: string): string {
        return `${API_BASE_URL}/drive/download/${id}?token=${token}`;
    },

    // Atualiza item (renomear, mover)
    async updateItem(id: string, data: { name?: string; parentId?: string | null }, token: string): Promise<DriveItem> {
        const response = await fetch(`${API_BASE_URL}/drive/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar item');
        }

        return response.json();
    },

    // Toggle favorito
    async toggleStar(id: string, token: string): Promise<DriveItem> {
        const response = await fetch(`${API_BASE_URL}/drive/${id}/star`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao favoritar item');
        }

        return response.json();
    },

    // Deleta item
    async deleteItem(id: string, permanent: boolean, token: string): Promise<void> {
        const url = permanent
            ? `${API_BASE_URL}/drive/${id}?permanent=true`
            : `${API_BASE_URL}/drive/${id}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao deletar item');
        }
    },

    // Busca item específico (incluindo shares se for dono)
    async getItem(id: string, token: string): Promise<DriveItem> {
        const response = await fetch(`${API_BASE_URL}/drive/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar item');
        }

        return response.json();
    },
};
