import api from './api';
import { Organization, User } from '../types';

export interface OrganizationMember {
    id: string;
    userId: string;
    organizationId: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    user: User;
}

export const organizationService = {
    // Get organization details including members
    async getOrganization(id: string): Promise<Organization & { members: OrganizationMember[] }> {
        const response = await api.get(`/organizations/${id}`);
        return response.data;
    },

    // Get members of an organization
    async getMembers(id: string): Promise<OrganizationMember[]> {
        const response = await api.get(`/organizations/${id}/members`);
        return response.data || [];
    },

    // List ALL organizations (Admin)
    async listAllGlobal(): Promise<Organization[]> {
        const response = await api.get('/organizations/list/all');
        return response.data;
    },

    // Get organizations for a specific user (Admin only)
    async getOrganizationsForUser(userId: string): Promise<Organization[]> {
        const response = await api.get(`/organizations/users/${userId}`);
        return response.data;
    },

    // Get current user's organizations
    async getMyOrganizations(): Promise<Organization[]> {
        const response = await api.get('/organizations');
        return response.data;
    },

    // Add a member to the organization
    async addMember(id: string, email: string, role: string = 'MEMBER', permissions: any = null): Promise<OrganizationMember> {
        const response = await api.post(`/organizations/${id}/members`, { email, role, permissions });
        return response.data;
    },

    // Update member permissions
    async updateMemberPermissions(id: string, userId: string, permissions: any): Promise<void> {
        await api.patch(`/organizations/${id}/members/${userId}/permissions`, { permissions });
    },

    // Remove a member from the organization
    async removeMember(id: string, userId: string): Promise<void> {
        await api.delete(`/organizations/${id}/members/${userId}`);
    }
};
