import axios from 'axios';

const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        const savedUrl = localStorage.getItem('FAUVES_DYNAMIC_API_URL');
        if (savedUrl) {
            let url = savedUrl.trim();

            if (url.includes('fauves-api-production.up.railway.app')) {
                console.warn(`[FauvesAPI] Ignoring stale domain in localStorage: ${url}. Switching to Proxy.`);
            } else {
                if (url.endsWith('/')) url = url.slice(0, -1);
                if (!url.toLowerCase().endsWith('/api')) {
                    url += '/api';
                }
                const finalUrl = `${url}/`;
                console.log(`[FauvesAPI] Base URL configured from localStorage: ${finalUrl}`);
                return finalUrl;
            }
        }
    }

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

// Interceptor to add token or docka-key if needed
fauvesApi.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const dockaKey = localStorage.getItem('FAUVES_DOCKA_API_KEY');
        if (dockaKey) {
            config.headers['x-docka-key'] = dockaKey;
        }

        const dynamicToken = localStorage.getItem('FAUVES_DYNAMIC_API_TOKEN');
        const defaultToken = localStorage.getItem('token');
        const token = dynamicToken || defaultToken;
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
                    id: ev.id,
                    title: ev.name || ev.title || 'Sem título',
                    date: ev.startDate ? new Date(ev.startDate).toLocaleDateString('pt-BR') : (ev.date || '-'),
                    location: ev.locationCity ? `${ev.locationCity}, ${ev.locationUf}` : (ev.location || '-'),
                    status: ev.status || (ev.isPublished ? 'published' : 'draft'),
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
                        return {
                            ...item,
                            col1: item.name || item.fullName || 'Sem nome',
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
                            img: item.photoUrl || item.image || 'https://via.placeholder.com/150',
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
                        id: o.id,
                        code: o.code || o.id.substring(0, 8).toUpperCase(),
                        customer: { name: name || 'Cliente', email: email },
                        amount: Number(o.totalAmount || 0),
                        status: ((o.paymentStatus || 'pending').toLowerCase() === 'paid' ? 'approved' :
                            (o.paymentStatus || 'pending').toLowerCase() === 'canceled' ? 'canceled' : 'pending') as 'approved' | 'pending' | 'canceled',
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
        const endpoints = ['docka/organizations', 'admin/organizers', 'admin/organizations', 'organizers', 'organizations'];
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
                        id: org.id,
                        name: org.name || 'Sem nome',
                        slug: org.slug || '-',
                        eventCount: org.eventCount || org._count?.events || 0,
                        status: org.isActive !== false ? 'active' : 'inactive',
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
        const endpoints = [`admin/organizers/${id}`, `admin/organizations/${id}`];
        let lastError: any = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                const data = response.data.organizer || response.data.organization || response.data;
                return { ...data, rawFields: data };
            } catch (error: any) {
                lastError = error;
                if (error.response?.status === 404) continue;
            }
        }
        throw lastError;
    },

    getOrganizationStats: async (id: string) => {
        const endpoints = [`admin/organizers/${id}/stats`, `admin/organizations/${id}/stats`, `admin/metrics?organizationId=${id}`];
        for (const endpoint of endpoints) {
            try {
                const response = await fauvesApi.get(endpoint);
                return response.data.stats || response.data.metrics || response.data;
            } catch (e) {
                continue;
            }
        }
        return { eventsActive: 0, totalRevenue: 0, totalTickets: 0, totalOrders: 0 };
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
    }
};

export default fauvesService;
