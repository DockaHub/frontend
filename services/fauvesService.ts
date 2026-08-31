import axios from 'axios';
import api from './api';
import { adminActionSchema, globalSettingsInputSchema, overviewSnapshotSchema, withdrawalSchema } from './fauvesSchemas';

export type FauvesIntegrationStatus = 'operational' | 'degraded' | 'offline';

export interface FauvesOverviewSnapshot {
    gmv: number;
    platformRevenue: number;
    ticketsToday: number;
    courtesyTicketsToday: number;
    pendingWithdrawals: number;
    activeEvents: number;
    activeOrganizations: number;
    paymentMix: { pix: number; card: number };
    revenueSeries: Array<{ label: string; current: number; previous: number }>;
    integrations: Array<{ name: string; status: FauvesIntegrationStatus; latency?: string }>;
    activities: Array<{ id: string; type: string; title: string; description: string; createdAt: string; amount?: number }>;
}

export interface FauvesWithdrawal {
    id: string;
    organizationId?: string;
    organizationName: string;
    eventName?: string;
    amount: number;
    status: string;
    pixKey?: string;
    bankAccount?: Record<string, unknown> | string;
    requestedAt: string;
    processedAt?: string;
}

export interface FauvesReportsSnapshot {
    periodDays: number;
    revenue: number;
    orders: number;
    tickets: number;
    users: number;
    trends: { revenue: number | null; orders: number | null; tickets: number | null; users: number | null };
    series: Array<{ label: string; revenue: number; tickets: number }>;
    topEvents: Array<{ id: string; name: string; tickets: number; revenue: number }>;
    topOrganizations: Array<{ id: string; name: string; eventCount: number; revenue: number; change: number | null }>;
}

const getBaseURL = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
    const proxyUrl = apiBase.endsWith('/') ? `${apiBase}fauves-proxy/` : `${apiBase}/fauves-proxy/`;

    console.log(`[FauvesAPI] Using Backend Proxy as Base URL: ${proxyUrl}`);
    return proxyUrl;
};

const fauvesApi = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

const requestFirstAvailable = async <T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoints: string[],
    data?: unknown,
): Promise<T> => {
    let lastError: unknown;
    for (const endpoint of endpoints) {
        try {
            const response = method === 'get' || method === 'delete'
                ? await fauvesApi[method](endpoint)
                : await fauvesApi[method](endpoint, data);
            return response.data as T;
        } catch (error: any) {
            lastError = error;
            if ([401, 403, 404, 405].includes(error.response?.status)) continue;
            throw error;
        }
    }
    throw lastError || new Error('Nenhum endpoint compatível está disponível na API Fauves.');
};

const collectAllPages = async <T>(
    loader: (page: number, limit: number) => Promise<{ items: T[]; total: number }>,
    pageSize = 200,
): Promise<{ items: T[]; total: number }> => {
    const first = await loader(1, pageSize);
    const pageCount = Math.min(25, Math.ceil(first.total / pageSize));
    if (pageCount <= 1) return first;

    const remaining = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) => loader(index + 2, pageSize)),
    );
    return { items: [first, ...remaining].flatMap((page) => page.items), total: first.total };
};

const startOfLocalDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const changePercent = (current: number, previous: number): number | null => {
    if (previous === 0) return current === 0 ? 0 : null;
    return Math.round(((current - previous) / previous) * 1000) / 10;
};

// The browser only sends the ManySpace session. The Fauves integration key is
// injected by the authenticated backend proxy and is never stored client-side.
fauvesApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        // Remove credentials left by the legacy direct-to-Fauves configuration.
        localStorage.removeItem('FAUVES_DYNAMIC_API_URL');
        localStorage.removeItem('FAUVES_DYNAMIC_API_TOKEN');
        localStorage.removeItem('FAUVES_DOCKA_API_KEY');
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const fauvesService = {
    getEvents: async (page = 1, limit = 20) => {
        const endpoints = ['docka/admin/events', 'admin/events', 'events'];
        let lastError: any = null;

        for (const endpoint of endpoints) {
            const separator = endpoint.includes('?') ? '&' : '?';
            const fullEndpoint = `${endpoint}${separator}page=${page}&perPage=${limit}`;
            try {
                const response = await fauvesApi.get(fullEndpoint);
                const data = response.data;
                const rawEvents = data.events || data.items || (Array.isArray(data) ? data : []);
                const total = data.total || (Array.isArray(rawEvents) ? rawEvents.length : 0);

                const items = (rawEvents || []).map((ev: any) => ({
                    ...ev,
                    id: ev.id,
                    title: ev.name || ev.title || 'Sem título',
                    date: ev.startDate ? new Date(ev.startDate).toLocaleDateString('pt-BR') : (ev.date || '-'),
                    location: ev.locationCity ? `${ev.locationCity}, ${ev.locationUf}` : (ev.location || '-'),
                    status: ev.status || (ev.isPublished ? 'published' : 'draft'),
                    organizationName: ev.organization?.name || ev.organizationName || 'Sem produtora',
                    ticketsSold: Number(ev.ticketsSold ?? ev._count?.tickets ?? ev.stats?.sales ?? 0),
                    ticketCapacity: Number(ev.ticketCapacity ?? ev.capacity ?? ev.totalTickets ?? 0),
                    image: ev.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
                    stats: ev.stats || { views: 0, clicks: 0, interests: 0, orders: 0, sales: 0 }
                }));

                return { items, total };
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    getEvent: async (id: string) => {
        const endpoints = [`docka/event/${id}`, `admin/events/${id}`, `event/${id}`];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                const data = response.data;
                return data.event || data;
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    getManagementData: async (type: string, page = 1, limit = 20) => {
        const typeMap: Record<string, string[]> = {
            users: ['docka/users', 'admin/users', 'admin/user', 'users', 'user'],
            artists: ['docka/artists', 'admin/artists', 'admin/artist', 'artists', 'artist'],
            categories: ['docka/categories', 'admin/categories', 'admin/category', 'categories', 'category'],
            ads: ['docka/announcements', 'admin/announcements', 'admin/ads', 'announcements', 'ads'],
            slides: ['admin/slides', 'admin/slide', 'slides', 'slide']
        };

        const endpoints = typeMap[type] || [`admin/${type}`];
        let lastError: any = null;

        for (const baseEndpoint of endpoints) {
            const separator = baseEndpoint.includes('?') ? '&' : '?';
            const fullEndpoint = `${baseEndpoint}${separator}page=${page}&perPage=${limit}`;
            try {
                const response = await fauvesApi.get(fullEndpoint);
                const rawData = response.data;
                let rawItems: any[] = [];
                let total = 0;

                if (type === 'users') {
                    rawItems = rawData.users || rawData.items || (Array.isArray(rawData) ? rawData : []);
                    total = rawData.total || rawItems.length;
                } else if (type === 'categories') {
                    rawItems = Array.isArray(rawData) ? rawData : (rawData.categories || rawData.items || rawData.data || []);
                    total = rawData.total || (rawData.meta?.total) || rawItems.length;
                } else if (type === 'artists') {
                    rawItems = Array.isArray(rawData) ? rawData : (rawData.artists || rawData.items || []);
                    total = rawData.total || rawItems.length;
                } else if (type === 'ads' || type === 'slides') {
                    rawItems = Array.isArray(rawData) ? rawData : (rawData.items || rawData.slides || rawData.announcements || []);
                    total = rawData.total || rawItems.length;
                } else {
                    rawItems = Array.isArray(rawData) ? rawData : (rawData.items || [rawData]);
                    total = rawData.total || rawItems.length;
                }

                const items = (rawItems || []).map((item: any) => {
                    if (!item) return {};
                    if (type === 'users') {
                        const fullName = [item.name, item.surname].filter(Boolean).join(' ') || item.fullName || 'Sem nome';
                        return {
                            ...item,
                            col1: fullName,
                            sub1: item.email || '-',
                            col2: item.email || '-',
                            col3: item.isAdmin ? 'Admin' : (item.role || 'Usuário'),
                            col4: item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : '-',
                            badge: item.isAdmin ? 'purple' : 'gray'
                        };
                    }
                    if (type === 'categories') {
                        return {
                            ...item,
                            col1: item.name || item.title || 'Sem nome',
                            col2: item.slug || '-',
                            col3: item.sortOrder !== undefined ? String(item.sortOrder) : '0',
                            col4: item.isActive ? 'Ativo' : 'Inativo',
                            badge: item.isActive ? 'purple' : 'gray'
                        };
                    }
                    if (type === 'artists') {
                        return {
                            ...item,
                            img: item.imageUrl || item.photoUrl || item.image || '',
                            col1: item.name || 'Sem nome',
                            col2: String(item._count?.events || item.eventCount || 0),
                            col3: item.spotifyUrl || '', 
                            col4: item.isVerified ? 'Sim' : 'Não',
                            col5: 'Verificar Artista'
                        };
                    }
                    if (type === 'ads' || type === 'slides') {
                        return {
                            ...item,
                            col1: item.title || item.name || 'Sem título',
                            col2: item.category || item.targetUf || item.target || '-',
                            col3: item.linkType || item.type || '-',
                            col4: item.isActive !== false ? 'Ativo' : 'Inativo',
                            badge: item.isActive !== false ? 'purple' : 'gray'
                        };
                    }
                    return {
                        ...item,
                        col1: item.name || item.title || '-',
                        col2: item.slug || item.email || '-',
                        col3: item.status || item.role || '-'
                    };
                });
                return { items, total };
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    getOrders: async (page = 1, limit = 20) => {
        const endpoints = ['docka/orders', 'admin/orders', 'orders'];
        let lastError: any = null;
        for (const baseEndpoint of endpoints) {
            const separator = baseEndpoint.includes('?') ? '&' : '?';
            const fullEndpoint = `${baseEndpoint}${separator}page=${page}&perPage=${limit}`;
            try {
                const response = await fauvesApi.get(fullEndpoint);
                const data = response.data;
                const rawOrders = data.orders || data.items || (Array.isArray(data) ? data : []);
                const total = data.total || (Array.isArray(rawOrders) ? rawOrders.length : 0);

                const items = (Array.isArray(rawOrders) ? rawOrders : []).map((o: any) => {
                    if (!o) return {};
                    const email = o.purchaserEmail || o.customerEmail || o.email || o.user?.email || '-';
                    let name = o.purchaserName || o.customerName || o.name || o.user?.name;
                    if (!name && email !== '-') name = email.split('@')[0];

                    return {
                        ...o,
                        id: o.id,
                        code: o.code || String(o.id || '').slice(0, 8).toUpperCase(),
                        customer: { name: name || 'Cliente', email: email },
                        amount: Number(o.totalAmount || 0),
                        netAmount: Number(o.netAmount || 0),
                        platformFee: Number(o.platformFee || 0),
                        paymentMethod: o.paymentMethod || o.paymentType || '-',
                        status: (['paid', 'approved'].includes(String(o.paymentStatus || o.status || 'pending').toLowerCase()) ? 'approved' :
                            ['canceled', 'cancelled', 'refunded'].includes(String(o.paymentStatus || o.status || 'pending').toLowerCase()) ? 'canceled' : 'pending') as 'approved' | 'pending' | 'canceled',
                        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR') : '-',
                        event: o.event?.name || o.eventName || '-'
                    };
                });
                return { items, total };
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    getOrder: async (id: string) => {
        const payload = await requestFirstAvailable<any>('get', [
            `docka/orders/${id}`, `admin/orders/${id}`, `orders/${id}`,
        ]);
        const order = payload.order || payload.item || payload;
        const email = order.purchaserEmail || order.customerEmail || order.email || order.user?.email || '-';
        return {
            ...order,
            id: order.id,
            code: order.code || String(order.id).slice(0, 8).toUpperCase(),
            customer: {
                name: order.purchaserName || order.customerName || order.user?.name || 'Cliente',
                email,
                phone: order.purchaserPhone || order.user?.phone,
                document: order.purchaserDocument || order.user?.cpf,
            },
            amount: Number(order.totalAmount || order.amount || 0),
            status: String(order.paymentStatus || order.status || 'pending').toLowerCase() === 'paid' ? 'approved' : String(order.paymentStatus || order.status || 'pending').toLowerCase(),
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '-',
            event: order.event?.name || order.eventName || '-',
            rawFields: order,
        };
    },

    getSupportTickets: async (page = 1, limit = 20) => {
        const endpoints = ['docka/tickets', 'admin/tickets', 'tickets'];
        let lastError: any = null;
        for (const baseEndpoint of endpoints) {
            const separator = baseEndpoint.includes('?') ? '&' : '?';
            const fullEndpoint = `${baseEndpoint}${separator}page=${page}&perPage=${limit}`;
            try {
                const response = await fauvesApi.get(fullEndpoint);
                const data = response.data;
                const rawTickets = data.tickets || data.items || (Array.isArray(data) ? data : []);
                const total = data.total || (Array.isArray(rawTickets) ? rawTickets.length : 0);

                const items = (Array.isArray(rawTickets) ? rawTickets : []).map((t: any) => ({
                    id: t.id,
                    subject: t.subject || 'Sem assunto',
                    user: t.user || t.customerEmail || t.email || '-',
                    priority: (t.priority || 'medium') as 'low' | 'medium' | 'high',
                    status: (t.status || 'open') as 'open' | 'closed' | 'pending',
                    date: t.date || (t.createdAt ? new Date(t.createdAt).toLocaleDateString('pt-BR') : '-')
                }));
                return { items, total };
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    getOrganizations: async (page = 1, limit = 20) => {
        const endpoints = ['docka/organizations', 'admin/organizers', 'admin/organizations', 'organizers', 'organizations', 'organization'];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint, { params: { page, perPage: limit } });
                const data = response.data;
                const rawItems = data.organizers || data.organizations || data.items || data.rows || (Array.isArray(data) ? data : []);

                const items = rawItems.map((org: any) => {
                    const rawLogo = org.logoUrl || org.logo || org.image || org.avatar;
                    let logo = rawLogo;
                    if (logo && !logo.startsWith('http') && !logo.startsWith('data:')) {
                        const baseUrl = fauvesApi.defaults.baseURL?.replace(/\/api\/?$/, '') || '';
                        logo = `${baseUrl}${logo.startsWith('/') ? '' : '/'}${logo}`;
                    }
                    return {
                        ...org,
                        id: org.id,
                        name: org.name || 'Sem nome',
                        slug: org.slug || '-',
                        eventCount: Number(org.eventCount ?? org._count?.events ?? 0),
                        status: org.isBlocked ? 'blocked' : (org.isActive === false ? 'inactive' : 'active'),
                        currentLevel: org.currentLevel || org.level || 'BRONZE',
                        platformFeePercent: Number(org.platformFeePercent ?? org.platformFee ?? 0),
                        lifetimeTicketsSold: Number(org.lifetimeTicketsSold ?? org.ticketsSold ?? 0),
                        efiAccountStatus: org.efiAccountStatus || org.bankStatus || 'pending',
                        logo
                    };
                });
                return { items, total: data.total || items.length };
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    getOrganization: async (id: string) => {
        const endpoints = [
            `docka/organizations/${id}`,
            `admin/organizers/${id}`, 
            `admin/organizations/${id}`,
            `organizers/${id}`,
            `organizations/${id}`,
            `organization/${id}`
        ];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                const data = response.data.organizer || response.data.organization || response.data;
                // Handle cases where the response itself is the organization object or has a property
                const orgData = data.id ? data : (data.organizer || data.organization || data);
                return { ...orgData, rawFields: orgData };
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404 || error.response?.status === 401) continue;
            }
        }
        throw lastError;
    },

    getOrganizationStats: async (id: string) => {
        // Try secure docka route first, then fall back to admin routes
        const endpoints = [
            `docka/organizations/${id}/stats`,
            `admin/organizers/${id}/stats`,
            `admin/organizations/${id}/stats`,
            `admin/metrics?organizationId=${id}`
        ];
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                return response.data.stats || response.data.metrics || response.data;
            } catch (e: any) {
                if (e.response?.status === 404 || e.response?.status === 401) continue;
                continue;
            }
        }
        return { eventsActive: 0, totalRevenue: 0, totalTickets: 0, totalOrders: 0 };
    },

    updateOrganization: async (id: string, data: any) => {
        const endpoints = [
            `docka/organizations/${id}`,
            `admin/organizers/${id}`, 
            `admin/organizations/${id}`
        ];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.put(endpoint, data);
                return response.data;
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404 || error.response?.status === 401) continue;
            }
        }
        throw lastError;
    },

    getOrganizationMembers: async (id: string) => {
        const endpoints = [
            `docka/organizations/${id}/members`,
            `admin/organizations/${id}/members`, 
            `admin/organizers/${id}/members`,
            `organizers/${id}/team`,
            `organizations/${id}/members`
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                return response.data.members || response.data.items || response.data;
            } catch (error: any) {
                if (error.response?.status === 404 || error.response?.status === 401) continue;
            }
        }
        return [];
    },

    addOrganizationMember: async (id: string, memberData: { email: string, role?: string }) => {
        const endpoints = [`docka/organizations/${id}/members`, `admin/organizations/${id}/members` ];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.post(endpoint, memberData);
                return response.data;
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    removeOrganizationMember: async (id: string, userId: string) => {
        const endpoints = [`docka/organizations/${id}/members/${userId}`, `admin/organizations/${id}/members/${userId}` ];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.delete(endpoint);
                return response.data;
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    transferOrganizationOwnership: async (id: string, newOwnerId: string) => {
        const endpoints = [`admin/organizers/${id}/transfer-ownership`, `admin/organizations/${id}/transfer-ownership` ];
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.post(endpoint, { newOwnerId });
                return response.data;
            } catch (e) { continue; }
        }
        throw new Error('Endpoint de transferência não disponível na Fauves.');
    },

    updateOrganizationMemberRole: async (id: string, userId: string, role: string) => {
        const endpoints = [`admin/organizers/${id}/members/${userId}/role`, `admin/organizations/${id}/members/${userId}/role` ];
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.patch(endpoint, { role });
                return response.data;
            } catch (e) { continue; }
        }
        throw new Error('Endpoint de atualização de cargo não disponível na Fauves.');
    },

    searchUsers: async (query: string) => {
        const response = await api.get('users/search', { params: { q: query } });
        return response.data;
    },

    createEvent: async (eventData: any) => {
        try {
            const response = await fauvesApi.post('event', eventData);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },

    updateEvent: async (id: string, eventData: any) => {
        const endpoints = [`docka/event/${id}`, `event/${id}`];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.put(endpoint, eventData);
                return response.data;
            } catch (error: any) {
                lastError = error;
            }
        }
        throw lastError;
    },

    getEventSummary: async (id: string) => {
        const endpoints = [`docka/event-summary?eventId=${id}`, `admin/event-summary?eventId=${id}`];
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                return response.data.summary || response.data;
            } catch (e) {
                continue;
            }
        }
        return { ticketsSold: 0, checkins: 0, revenue: 0, pendingPayments: 0 };
    },

    getEventMetrics: async (id: string) => {
        const endpoints = [`docka/event-metrics?eventId=${id}`, `admin/metrics?eventId=${id}`];
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                return response.data.metrics || response.data;
            } catch (e) {
                continue;
            }
        }
        return { views: 0, interests: 0 };
    },

    getStats: async () => {
        const endpoints = ['docka/metrics', 'admin/metrics'];
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                return response.data.metrics || response.data;
            } catch (e) {
                continue;
            }
        }
        return { salesToday: 0, totalRevenue: 0, checkins: 0, eventsActive: 0 };
    },

    importEventExtract: async (url: string) => {
        const endpoints = [
            `docka/event-importer/extract?url=${encodeURIComponent(url)}`,
            `admin/event-importer/extract?url=${encodeURIComponent(url)}`
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                return response.data;
            } catch (error: any) {
                if (error.response?.status === 404) continue;
            }
        }
        throw new Error('Falha ao extrair dados do evento.');
    },

    importEventSave: async (eventData: any) => {
        const endpoints = ['docka/event-importer/save', 'admin/event-importer/save'];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.post(endpoint, eventData);
                return response.data;
            } catch (error: any) {
                if (error.response?.status === 404) continue;
            }
        }
        throw new Error('Falha ao salvar evento importado.');
    },

    searchArtists: async (query: string) => {
        try {
            const response = await fauvesApi.get(`docka/spotify/search/artists?q=${encodeURIComponent(query)}`);
            return response.data.artists || [];
        } catch (error) {
            try {
                const response = await fauvesApi.get(`spotify/search/artists?q=${encodeURIComponent(query)}`);
                return response.data.artists || [];
            } catch (e) {
                return [];
            }
        }
    },

    createCategory: async (data: any) => {
        const response = await fauvesApi.post('docka/categories', data);
        return response.data;
    },

    updateCategory: async (id: string, data: any) => {
        const response = await fauvesApi.put(`docka/category/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: string) => {
        const response = await fauvesApi.delete(`docka/category/${id}`);
        return response.data;
    },

    getUserDetails: async (id: string) => {
        const endpoints = [
            `docka/users/${id}`, // Primary integration endpoint (Enriched)
            `users/${id}`,      // Legacy fallback
        ];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                const data = response.data.user || response.data.item || response.data;
                if (data) return data;
            } catch (error: any) {
                lastError = error;
                // Continue if 404 or 401, but log the 401 for visibility
                if (error.response?.status === 401) {
                    console.warn(`[fauvesService] Unauthorized access (401) to ${endpoint}`);
                }
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError || new Error(`User ${id} not found in any endpoint`);
    },

    getUserDetailed: async (id: string) => {
        try {
            // Chamada direta para o backend local (ManySpace), ignorando o proxy da Fauves
            const response = await api.get(`users/${id}/detailed`);
            return response.data.user || response.data;
        } catch (error) {
            console.warn(`[fauvesService] Local user ${id} not found or error. Falling back to Fauves API...`);
            // Se falhar no backend local, tenta buscar diretamente na Fauves
            const externalUser = await fauvesService.getUserDetails(id);
            
            // Normalizar dados da Fauves para compatibilidade com o componente
            if (externalUser && !externalUser.surname) {
                const nameParts = (externalUser.name || externalUser.fullName || '').split(' ');
                externalUser.name = nameParts[0];
                externalUser.surname = nameParts.slice(1).join(' ') || '';
            }

            // Garantir que stats exista para não quebrar a UI
            if (!externalUser.stats) {
                externalUser.stats = {
                    totalSpent: 0,
                    totalOrders: 0,
                    paidOrders: 0,
                    eventsAttended: externalUser.attendingEventsCount || 0,
                    ticketsOwned: externalUser.ticketsCount || externalUser.attendingEventsCount || 0
                };
            }

            return externalUser;
        }
    },

    updateUser: async (id: string, data: any) => {
        const response = await fauvesApi.put(`docka/user/${id}`, data);
        return response.data;
    },

    toggleUserStatus: async (id: string) => {
        const response = await fauvesApi.post(`docka/user/${id}/toggle-status`);
        return response.data;
    },

    setUserAdmin: async (id: string, isAdmin: boolean) => requestFirstAvailable<any>('post', [
        `docka/users/${id}/admin`, `admin/users/${id}/admin`, `users/${id}/admin`,
    ], { isAdmin }),

    resetUserAccess: async (id: string) => requestFirstAvailable<any>('post', [
        `docka/users/${id}/reset-access`, `admin/users/${id}/reset-access`, `users/${id}/reset-password`,
    ], { sendEmail: true, sendOtp: true }),

    deleteUser: async (id: string) => {
        const response = await fauvesApi.delete(`docka/users/${id}`);
        return response.data;
    },

    getLeads: async () => {
        const endpoints = ['docka/admin/event-lead', 'admin/event-lead', 'event-lead'];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                return response.data;
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    deleteLead: async (id: string) => {
        const endpoints = [`docka/admin/event-lead/${id}`, `admin/event-lead/${id}`, `event-lead/${id}`];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.delete(endpoint);
                return response.data;
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    getRanking: async () => {
        const endpoints = ['docka/metrics/ranking', 'admin/metrics/ranking', 'admin/ranking', 'metrics/ranking'];
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                return response.data.ranking || response.data || [];
            } catch (e) {
                continue;
            }
        }
        return [];
    },

    getReportsSnapshot: async (periodDays = 30): Promise<FauvesReportsSnapshot> => {
        const days = [7, 30, 90].includes(periodDays) ? periodDays : 30;
        const [ordersPage, usersPage, organizationsPage, ranking] = await Promise.all([
            collectAllPages<any>((page, limit) => fauvesService.getOrders(page, limit)),
            collectAllPages<any>((page, limit) => fauvesService.getManagementData('users', page, limit)),
            collectAllPages<any>((page, limit) => fauvesService.getOrganizations(page, limit)),
            fauvesService.getRanking(),
        ]);

        const today = startOfLocalDay(new Date());
        const currentStart = new Date(today);
        currentStart.setDate(currentStart.getDate() - (days - 1));
        const previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - days);

        const inRange = (value: unknown, start: Date, end?: Date) => {
            const date = new Date(String(value || ''));
            return Number.isFinite(date.getTime()) && date >= start && (!end || date < end);
        };
        const ticketQuantity = (order: any) => Math.max(1, Number(order.participantsCount ?? order.ticketCount ?? 1) || 1);
        const paidOrders = ordersPage.items.filter((order: any) => order.status === 'approved');
        const currentOrders = paidOrders.filter((order: any) => inRange(order.createdAt, currentStart));
        const previousOrders = paidOrders.filter((order: any) => inRange(order.createdAt, previousStart, currentStart));
        const currentUsers = usersPage.items.filter((user: any) => inRange(user.createdAt, currentStart));
        const previousUsers = usersPage.items.filter((user: any) => inRange(user.createdAt, previousStart, currentStart));
        const sumRevenue = (orders: any[]) => orders.reduce((total, order) => total + Number(order.amount || 0), 0);
        const sumTickets = (orders: any[]) => orders.reduce((total, order) => total + ticketQuantity(order), 0);

        const series = Array.from({ length: days }, (_, index) => {
            const date = new Date(currentStart);
            date.setDate(date.getDate() + index);
            const next = new Date(date);
            next.setDate(next.getDate() + 1);
            const dayOrders = currentOrders.filter((order: any) => inRange(order.createdAt, date, next));
            return {
                label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                revenue: sumRevenue(dayOrders),
                tickets: sumTickets(dayOrders),
            };
        });

        const eventTotals = new Map<string, { id: string; name: string; tickets: number; revenue: number }>();
        currentOrders.forEach((order: any) => {
            const id = String(order.eventId || order.event || 'sem-evento');
            const current = eventTotals.get(id) || { id, name: order.event || 'Evento não informado', tickets: 0, revenue: 0 };
            current.tickets += ticketQuantity(order);
            current.revenue += Number(order.amount || 0);
            eventTotals.set(id, current);
        });

        const organizationById = new Map(organizationsPage.items.map((organization: any) => [String(organization.id), organization]));
        const topOrganizations = ranking.slice(0, 5).map((item: any) => {
            const organization: any = organizationById.get(String(item.id));
            return {
                id: String(item.id),
                name: item.name || organization?.name || 'Produtora',
                eventCount: Number(organization?.eventCount ?? organization?._count?.events ?? 0),
                revenue: Number(item.value || 0),
                change: typeof item.change === 'number' ? item.change : null,
            };
        });

        const currentRevenue = sumRevenue(currentOrders);
        const previousRevenue = sumRevenue(previousOrders);
        const currentTickets = sumTickets(currentOrders);
        const previousTickets = sumTickets(previousOrders);

        return {
            periodDays: days,
            revenue: currentRevenue,
            orders: currentOrders.length,
            tickets: currentTickets,
            users: currentUsers.length,
            trends: {
                revenue: changePercent(currentRevenue, previousRevenue),
                orders: changePercent(currentOrders.length, previousOrders.length),
                tickets: changePercent(currentTickets, previousTickets),
                users: changePercent(currentUsers.length, previousUsers.length),
            },
            series,
            topEvents: Array.from(eventTotals.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
            topOrganizations,
        };
    },

    getOverviewSnapshot: async (): Promise<FauvesOverviewSnapshot> => {
        try {
            const payload = await requestFirstAvailable<any>('get', [
                'docka/operations/overview',
                'admin/operations/overview',
                'admin/dashboard/overview',
            ]);
            const source = payload.data || payload.overview || payload;
            return overviewSnapshotSchema.parse({
                gmv: Number(source.gmv ?? source.totalRevenue ?? 0),
                platformRevenue: Number(source.platformRevenue ?? source.takeRateRevenue ?? source.platformFees ?? 0),
                ticketsToday: Number(source.ticketsToday ?? source.salesTodayCount ?? 0),
                courtesyTicketsToday: Number(source.courtesyTicketsToday ?? source.courtesiesToday ?? 0),
                pendingWithdrawals: Number(source.pendingWithdrawals ?? source.withdrawalQueueAmount ?? 0),
                activeEvents: Number(source.activeEvents ?? source.eventsActive ?? 0),
                activeOrganizations: Number(source.activeOrganizations ?? source.organizationsActive ?? 0),
                paymentMix: source.paymentMix || { pix: Number(source.pixShare ?? 0), card: Number(source.cardShare ?? 0) },
                revenueSeries: source.revenueSeries || source.chart || [],
                integrations: source.integrations || [],
                activities: source.activities || source.recentActivity || [],
            });
        } catch {
            const [stats, orders, organizations, events] = await Promise.all([
                fauvesService.getStats(),
                fauvesService.getOrders(1, 100).catch(() => ({ items: [], total: 0 })),
                fauvesService.getOrganizations(1, 100).catch(() => ({ items: [], total: 0 })),
                fauvesService.getEvents(1, 100).catch(() => ({ items: [], total: 0 })),
            ]);
            const paidOrders = orders.items.filter((order: any) => order.status === 'approved');
            const gmv = Number(stats.totalRevenue || paidOrders.reduce((total: number, order: any) => total + Number(order.amount || 0), 0));
            const today = startOfLocalDay(new Date());
            const ticketQuantity = (order: any) => Math.max(1, Number(order.participantsCount ?? order.ticketCount ?? 1) || 1);
            const todayOrders = paidOrders.filter((order: any) => {
                const createdAt = new Date(order.createdAt);
                return Number.isFinite(createdAt.getTime()) && createdAt >= today;
            });
            const paymentCounts = paidOrders.reduce((acc: { pix: number; card: number }, order: any) => {
                const method = String(order.paymentMethod || '').toLowerCase();
                if (method.includes('pix')) acc.pix += 1;
                if (method.includes('card') || method.includes('credit')) acc.card += 1;
                return acc;
            }, { pix: 0, card: 0 });
            const paymentTotal = paymentCounts.pix + paymentCounts.card;
            const revenueSeries = Array.from({ length: 7 }, (_, index) => {
                const date = new Date(today);
                date.setDate(date.getDate() - (6 - index));
                const next = new Date(date); next.setDate(next.getDate() + 1);
                const previousDate = new Date(date); previousDate.setDate(previousDate.getDate() - 7);
                const previousNext = new Date(next); previousNext.setDate(previousNext.getDate() - 7);
                const sumBetween = (start: Date, end: Date) => paidOrders
                    .filter((order: any) => { const createdAt = new Date(order.createdAt); return createdAt >= start && createdAt < end; })
                    .reduce((total: number, order: any) => total + Number(order.amount || 0), 0);
                return { label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), current: sumBetween(date, next), previous: sumBetween(previousDate, previousNext) };
            });
            return overviewSnapshotSchema.parse({
                gmv,
                platformRevenue: Number(stats.platformRevenue || stats.platformFees || paidOrders.reduce((total: number, order: any) => total + Number(order.platformFee || 0), 0)),
                ticketsToday: Number(stats.ticketsToday || stats.salesTodayCount || todayOrders.reduce((total: number, order: any) => total + ticketQuantity(order), 0)),
                courtesyTicketsToday: Number(stats.courtesyTicketsToday || 0),
                pendingWithdrawals: Number(stats.pendingWithdrawals || 0),
                activeEvents: Number(stats.eventsActive || events.items.filter((event: any) => event.status === 'published').length),
                activeOrganizations: organizations.items.filter((org: any) => org.status === 'active').length,
                paymentMix: paymentTotal ? { pix: Math.round((paymentCounts.pix / paymentTotal) * 100), card: Math.round((paymentCounts.card / paymentTotal) * 100) } : { pix: 0, card: 0 },
                revenueSeries: stats.revenueSeries || revenueSeries,
                integrations: stats.integrations || [{ name: 'API Fauves', status: 'operational' }],
                activities: stats.activities || orders.items.slice(0, 6).map((order: any) => ({ id: String(order.id), type: 'order', title: `Pedido ${order.code}`, description: `${order.customer?.name || 'Cliente'} · ${order.event || 'Evento'}`, createdAt: order.createdAt || new Date().toISOString(), amount: Number(order.amount || 0) })),
            });
        }
    },

    getWithdrawals: async (page = 1, limit = 20): Promise<{ items: FauvesWithdrawal[]; total: number }> => {
        const payload = await requestFirstAvailable<any>('get', [
            `docka/withdrawals?page=${page}&perPage=${limit}`,
            `admin/withdrawals?page=${page}&perPage=${limit}`,
            `withdrawals?page=${page}&perPage=${limit}`,
        ]);
        const rawItems = payload.withdrawals || payload.items || payload.data || (Array.isArray(payload) ? payload : []);
        const items = rawItems.map((item: any) => withdrawalSchema.parse({
            id: item.id,
            organizationId: item.organizationId,
            organizationName: item.organization?.name || item.organizationName || 'Produtora',
            eventName: item.event?.name || item.eventName,
            amount: Number(item.amount || 0),
            status: String(item.status || 'pending').toLowerCase(),
            pixKey: item.pixKey || item.bankAccount?.pixKey || item.bankAccount?.key,
            bankAccount: item.bankAccount,
            requestedAt: item.requestedAt || item.createdAt || new Date().toISOString(),
            processedAt: item.processedAt,
        }));
        return { items, total: Number(payload.total ?? payload.meta?.total ?? items.length) };
    },

    runAdminAction: async (
        resource: 'organizations' | 'events' | 'users' | 'orders' | 'withdrawals' | 'tickets',
        id: string,
        action: string,
        payload: Record<string, unknown> = {},
    ) => {
        const input = adminActionSchema.parse({ resource, id, action, payload });
        return requestFirstAvailable<any>('post', [
            `docka/${input.resource}/${input.id}/${input.action}`,
            `admin/${input.resource}/${input.id}/${input.action}`,
            `${input.resource}/${input.id}/${input.action}`,
        ], input.payload);
    },

    getAuditLogs: async (page = 1, limit = 50) => {
        const payload = await requestFirstAvailable<any>('get', [
            `docka/audit-logs?page=${page}&perPage=${limit}`,
            `admin/audit-logs?page=${page}&perPage=${limit}`,
            `admin/audit?page=${page}&perPage=${limit}`,
        ]);
        const items = payload.logs || payload.items || payload.data || (Array.isArray(payload) ? payload : []);
        return { items, total: Number(payload.total ?? payload.meta?.total ?? items.length) };
    },

    getGlobalSettings: async () => requestFirstAvailable<any>('get', [
        'docka/settings/global', 'admin/settings/global', 'admin/settings',
    ]),

    updateGlobalSettings: async (payload: Record<string, unknown>) => {
        const input = globalSettingsInputSchema.parse(payload);
        return requestFirstAvailable<any>('put', [
            'docka/settings/global', 'admin/settings/global', 'admin/settings',
        ], input);
    },
};

export default fauvesService;
