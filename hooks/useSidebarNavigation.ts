
import {
    LayoutDashboard, Ticket, CreditCard, Mic2, LayoutTemplate, Megaphone, Users,
    BarChart3, Settings, Globe, Headphones, FolderOpen, Mail,
    Zap, Briefcase, Building2, Scale, Home, Key, Car, ShieldAlert,
    Network, FileInput, Server, Search, MessageSquare, Book
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Organization } from '../types';
import api from '../services/api';

export interface MenuItem {
    id: string;
    label: string;
    icon: any;
    badgeCount?: number;
    badgeColor?: string;
    children?: { id: string; label: string; icon?: any }[];
}

export const useSidebarNavigation = (currentOrg: Organization) => {
    const [unreadLeads, setUnreadLeads] = useState(0);

    // Fetch unread leads specifically for Asterysko
    useEffect(() => {
        if (currentOrg?.slug === 'asterysko') {
            const fetchUnread = async () => {
                try {
                    const res = await api.get('/asterysko/crm/deals/unread-count');
                    setUnreadLeads(res.data.count || 0);
                } catch (error) {
                    console.error('Failed to fetch unread leads count', error);
                }
            };

            fetchUnread();
            // Polling every 30 seconds
            const interval = setInterval(fetchUnread, 30000);
            return () => clearInterval(interval);
        } else {
            setUnreadLeads(0);
        }
    }, [currentOrg?.slug]);

    const getOrgMenu = (): MenuItem[] => {
        if (!currentOrg) return [];

        // Specific Menu for Tokyon
        if (currentOrg.slug === 'tokyon') {
            return [
                { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
                { id: 'orange-program', label: 'Orange Program', icon: Zap },
                { id: 'clients', label: 'Clientes & Projetos', icon: Briefcase },
                { id: 'financial', label: 'Financeiro', icon: CreditCard },
                { id: 'settings', label: 'Configurações', icon: Settings },
            ];
        }

        // Specific Menu for Fauves
        if (currentOrg.slug === 'fauves') {
            return [
                { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'events', label: 'Eventos & Vendas', icon: Ticket },
                { id: 'categories', label: 'Categorias', icon: FolderOpen },
                { id: 'artists', label: 'Artistas', icon: Mic2 },
                { id: 'slides', label: 'Slides', icon: LayoutTemplate },
                { id: 'ads', label: 'Anúncios', icon: Megaphone },
                { id: 'emails', label: 'Emails', icon: Mail },
                { id: 'users', label: 'Usuários', icon: Users },
                { id: 'finance', label: 'Financeiro', icon: CreditCard },
                {
                    id: 'helpdesk',
                    label: 'Helpdesk',
                    icon: Headphones,
                    children: [
                        { id: 'helpdesk-tickets', label: 'Tickets', icon: MessageSquare },
                        { id: 'helpdesk-chat', label: 'Live Chat', icon: Users },
                        { id: 'helpdesk-center', label: 'Central de Ajuda', icon: Book }
                    ]
                },
                { id: 'organizations', label: 'Organizações', icon: Building2 },
                { id: 'settings', label: 'Configurações', icon: Settings },
                { id: 'reports', label: 'Relatórios', icon: BarChart3 },
            ];
        }

        // Specific Menu for Asterysko
        if (currentOrg.slug === 'asterysko') {
            return [
                { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
                { id: 'research', label: 'Pesquisa & Viabilidade', icon: Search },
                { id: 'clients', label: 'Clientes', icon: Briefcase },
                { id: 'crm', label: 'CRM & Leads', icon: Users, badgeCount: unreadLeads > 0 ? unreadLeads : undefined, badgeColor: 'bg-red-500' },
                { id: 'processes', label: 'Processos INPI', icon: Scale },
                { id: 'financial', label: 'Financeiro', icon: CreditCard },
                { id: 'settings', label: 'Configurações', icon: Settings },
            ];
        }

        // Specific Menu for UmaChave
        if (currentOrg.slug === 'umachave') {
            return [
                { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
                { id: 'properties', label: 'Imóveis (Morar)', icon: Home },
                { id: 'contracts', label: 'Contratos & Repasses', icon: Key },
                { id: 'financial', label: 'Gestão de Contas', icon: CreditCard },
                { id: 'vehicles', label: 'Veículos (Dirigir)', icon: Car },
                { id: 'crm', label: 'CRM & Propostas', icon: Users },
                { id: 'settings', label: 'Configurações', icon: Settings },
            ];
        }

        // Specific Menu for Hostizi
        if (currentOrg.slug === 'hostizi') {
            return [
                { id: 'overview', label: 'Dashboard Infra', icon: LayoutDashboard },
                { id: 'clients', label: 'Clientes', icon: Users },
                { id: 'hosting', label: 'Hospedagem (Sites)', icon: Server },
                { id: 'domains', label: 'Domínios', icon: Globe },
                { id: 'webmail', label: 'Webmail', icon: Mail },
                { id: 'financial', label: 'Faturas', icon: CreditCard },
                { id: 'support', label: 'Suporte', icon: Headphones },
                { id: 'settings', label: 'Configurações', icon: Settings },
            ];
        }

        // Docka (Holding)
        if (currentOrg.slug === 'docka') {
            return [
                { id: 'overview', label: 'Visão Global', icon: Globe },
                { id: 'ecosystem', label: 'Ecossistema', icon: Network },
                { id: 'forms', label: 'Formulários & Captura', icon: FileInput },
                { id: 'audit', label: 'Auditoria & Logs', icon: ShieldAlert },
                { id: 'billing', label: 'Faturamento Geral', icon: CreditCard },
                { id: 'settings', label: 'Configurações', icon: Settings },
            ];
        }

        // Fallback
        return [
            { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
            { id: 'settings', label: 'Configurações', icon: Settings },
        ];
    };

    return {
        menuItems: getOrgMenu(),
    };
};
