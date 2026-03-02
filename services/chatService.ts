
import api from './api';
import { ChatChannel, ChatMessage } from '../types';

export const chatService = {
    async getChannels(organizationId: string): Promise<ChatChannel[]> {
        const response = await api.get(`/chat/organizations/${organizationId}/channels`);
        return response.data.map((c: any) => mapChannel(c));
    },

    async createChannel(organizationId: string, data: { name: string; type: 'public' | 'private' | 'dm'; members?: string[] }): Promise<ChatChannel> {
        const response = await api.post(`/chat/organizations/${organizationId}/channels`, data);
        return mapChannel(response.data);
    },

    async getMessages(channelId: string): Promise<ChatMessage[]> {
        const response = await api.get(`/chat/channels/${channelId}/messages`);
        return response.data.map((m: any) => mapMessage(m));
    },

    async sendMessage(channelId: string, content: string): Promise<ChatMessage> {
        const response = await api.post(`/chat/channels/${channelId}/messages`, { content });
        return mapMessage(response.data);
    }
};

// Utilities to map backend data to frontend types
function mapChannel(c: any): ChatChannel {
    // Logic to determine name/avatar for DMs would typically go here or in component
    // based on current user. For now, we pass raw data and let component handle or use simplified mapping.
    return {
        id: c.id,
        name: c.name,
        type: c.type.toLowerCase(), // Backend might ensure lowercase but good to be safe
        unreadCount: 0, // TODO: Implement unread count logic
        memberIds: c.members?.map((m: any) => m.id) || [],
    };
}

function mapMessage(m: any): ChatMessage {
    return {
        id: m.id,
        senderId: m.senderId,
        senderName: m.sender.name,
        senderAvatar: m.sender.avatar,
        content: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        // Store full date if needed for date separators, but UI currently just wants string.
        // We might want to changet timestamp to string | Date in types later.
    };
}
