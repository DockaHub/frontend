import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'work' | 'meeting' | 'personal';
    meetId?: string | null;
    organizationId: string;
    createdById: string;
    createdBy?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    participants?: Array<{
        id: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    }>;
    createdAt: Date;
    updatedAt: Date;
}

export const calendarService = {
    async getEvents() {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/calendar/events`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            createdAt: new Date(event.createdAt),
            updatedAt: new Date(event.updatedAt),
        }));
    },

    async createEvent(data: {
        title: string;
        start: Date;
        end: Date;
        type: 'work' | 'meeting' | 'personal';
        participantIds?: string[];
    }) {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${API_URL}/calendar/events`,
            {
                title: data.title,
                start: data.start.toISOString(),
                end: data.end.toISOString(),
                type: data.type,
                participantIds: data.participantIds,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return {
            ...response.data,
            start: new Date(response.data.start),
            end: new Date(response.data.end),
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
        };
    },

    async updateEvent(
        eventId: string,
        data: {
            title?: string;
            start?: Date;
            end?: Date;
            type?: 'work' | 'meeting' | 'personal';
        }
    ) {
        const token = localStorage.getItem('token');
        const response = await axios.put(
            `${API_URL}/calendar/events/${eventId}`,
            {
                title: data.title,
                start: data.start?.toISOString(),
                end: data.end?.toISOString(),
                type: data.type,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return {
            ...response.data,
            start: new Date(response.data.start),
            end: new Date(response.data.end),
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
        };
    },

    async deleteEvent(eventId: string) {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/calendar/events/${eventId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
