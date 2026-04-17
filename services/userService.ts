import api from './api';
import { User } from '../types';

export const userService = {
    async updateUser(userId: string, data: Partial<User>) {
        const response = await api.patch(`/users/${userId}`, data);
        return response.data;
    },


    async resetPassword(userId: string) {
        const response = await api.post(`/users/${userId}/reset-password`);
        return response.data;
    },

    async setPassword(userId: string, password: string) {
        const response = await api.post(`/users/${userId}/password`, { password });
        return response.data;
    },
    
    async uploadAvatar(file: File) {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.patch('/users/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};
