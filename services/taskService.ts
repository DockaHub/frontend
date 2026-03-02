import axios from 'axios';
import { Task } from '../types';

const API_URL = 'http://localhost:3002/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export const taskService = {
    /**
     * Get all tasks for the current user across all organizations
     */
    async getMyTasks(): Promise<Task[]> {
        const response = await axios.get(`${API_URL}/tasks/my-tasks`, {
            headers: getAuthHeader()
        });
        return response.data.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
        }));
    },

    /**
     * Get tasks for a specific organization
     */
    async getTasksByOrganization(organizationId: string): Promise<Task[]> {
        const response = await axios.get(`${API_URL}/tasks/${organizationId}`, {
            headers: getAuthHeader()
        });
        return response.data.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
        }));
    },

    /**
     * Create a new task
     */
    async createTask(data: Partial<Task>): Promise<Task> {
        console.log('📡 taskService.createTask - Sending POST request');
        console.log('   Payload:', data);

        // Sanitize payload
        const payload: any = { ...data };
        delete payload.organization;
        delete payload.creator;
        delete payload.assignee;
        delete payload.id; // Let backend generate ID
        delete payload.createdAt;
        delete payload.updatedAt;

        console.log('   Sanitized Payload:', payload);

        try {
            const response = await axios.post(`${API_URL}/tasks`, payload, {
                headers: getAuthHeader()
            });
            console.log('✅ taskService.createTask - Success:', response.data);
            return {
                ...response.data,
                createdAt: new Date(response.data.createdAt),
                updatedAt: new Date(response.data.updatedAt),
            };
        } catch (error: any) {
            console.error('❌ taskService.createTask - Failed:', error);
            console.error('   Status:', error.response?.status);
            console.error('   Error data:', error.response?.data);
            throw error;
        }
    },

    /**
     * Update an existing task
     */
    async updateTask(id: string, data: Partial<Task>): Promise<Task> {
        console.log('📡 taskService.updateTask - Sending PATCH request');
        console.log('   URL:', `${API_URL}/tasks/${id}`);
        console.log('   Original Payload:', data);

        // Sanitize payload: remove nested objects, keep IDs
        const payload: any = { ...data };
        delete payload.organization;
        delete payload.creator;
        delete payload.assignee;
        // Also remove timestamps as they are handled by backend
        delete payload.createdAt;
        delete payload.updatedAt;

        console.log('   Sanitized Payload:', payload);

        try {
            const response = await axios.patch(`${API_URL}/tasks/${id}`, payload, {
                headers: getAuthHeader()
            });
            console.log('✅ taskService.updateTask - Success:', response.data);
            return {
                ...response.data,
                createdAt: new Date(response.data.createdAt),
                updatedAt: new Date(response.data.updatedAt),
            };
        } catch (error: any) {
            console.error('❌ taskService.updateTask - Failed:', error);
            console.error('   Status:', error.response?.status);
            console.error('   Error data:', error.response?.data);
            throw error;
        }
    },

    /**
     * Delete a task
     */
    async deleteTask(id: string): Promise<void> {
        await axios.delete(`${API_URL}/tasks/${id}`, {
            headers: getAuthHeader()
        });
    }
};
