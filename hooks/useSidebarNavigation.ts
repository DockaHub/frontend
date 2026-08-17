import {
    LayoutDashboard, Ticket, CreditCard, Mic2, LayoutTemplate, Megaphone, Users,
    BarChart3, Settings, Globe, Headphones, FolderOpen, Mail,
    Zap, Briefcase, Building2, Scale, Home, Key, Car, ShieldAlert,
    Network, Server, Search, MessageSquare, Book, Trophy, Wallet
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

            // Escutando eventos customizados para desconto imediato pós-leitura
            const handleLeadRead = () => {
                setUnreadLeads(prev => Math.max(0, prev - 1));
            };
            window.addEventListener('asterysko-lead-read', handleLeadRead);

            return () => {
                clearInterval(interval);
                window.removeEventListener('asterysko-lead-read', handleLeadRead);
            };
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
                {
                    id: 'boards',
                    label: 'Quadros de Trabalho',
                    icon: Briefcase,
                    children: [
                        { id: 'clients', label: 'CRM & Vendas' },
                        { id: 'projects', label: 'Gestão de Projetos' },
                        { id: 'generic-board', label: 'Kanban Genérico' },
                    ]
                },
                { id: 'orange-program', label: 'Orange Program', icon: Zap },
                { id: 'client-list', label: 'Base de Clientes', icon: Users },
                { id: 'financial', label: 'Financeiro', icon: CreditCard },
            ];
        }

        // Specific Menu for Fauves
        if (currentOrg.slug === 'fauves') {
            return [
                { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'events', label: 'Eventos & Vendas', icon: Ticket },
                { id: 'leads', label: 'Newsletter & Leads', icon: Users },
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
                { id: 'reports', label: 'Relatórios', icon: BarChart3 },
            ];
        }

        // Specific Menu for Asterysko
        if (currentOrg.slug === 'asterysko') {
            return [
                { id: 'overview', label: 'Início', icon: Home },
                { id: 'research', label: 'Radar da Marca', icon: Search },
                { id: 'clients', label: 'Clientes', icon: Users },
                { id: 'processes', label: 'Processos', icon: Scale },
                { id: 'crm', label: 'CRM', icon: Briefcase, badgeCount: unreadLeads > 0 ? unreadLeads : undefined, badgeColor: 'bg-red-500' },
                { id: 'performance', label: 'Minhas Metas', icon: Trophy },
                { id: 'financial', label: 'Financeiro', icon: CreditCard },
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
            ];
        }

        // ManySpace (Holding)
        if (currentOrg.slug === 'manyspace') {
            return [
                { id: 'overview', label: 'Início', icon: Home },
                { id: 'finance', label: 'Financeiro', icon: Wallet },
                { id: 'team', label: 'Equipe', icon: Users },
                { id: 'clients', label: 'Clientes', icon: Users },
                { id: 'automations', label: 'Automações', icon: Zap },
                { id: 'ecosystem', label: 'Ecossistema', icon: Network },
                { id: 'audit', label: 'Auditoria', icon: ShieldAlert },
                { id: 'settings', label: 'Configurações', icon: Settings },
            ];
        }

        // Fallback
        return [
            { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
        ];
    };

    const filterMenuByPermissions = (items: MenuItem[]): MenuItem[] => {
        if (!currentOrg) return items;
        
        // Donos e Admins globais/da org vêem tudo
        if (currentOrg.memberRole === 'OWNER' || currentOrg.memberRole === 'ADMIN') {
            return items;
        }

        const perms = currentOrg.memberPermissions;
        if (!perms) {
            if (currentOrg.slug === 'manyspace') {
                return items.filter((item) => !['team', 'automations', 'settings'].includes(item.id));
            }
            return items;
        }

        return items.filter(item => {
            // Regras específicas da Asterysko
            if (currentOrg.slug === 'asterysko') {
                if (item.id === 'crm') return perms.canAccessCRM !== false;
                if (item.id === 'processes') return perms.canAccessProcesses !== false;
                if (item.id === 'research') return perms.canAccessResearch !== false;
                if (item.id === 'clients') return perms.canAccessClients !== false;
            }

            // Regras para Financeiro
            if (['financial', 'finance', 'billing', 'financeiro'].includes(item.id.toLowerCase())) {
                return perms.canAccessFinance !== false;
            }
            
            // Regras para Configurações
            if (item.id.toLowerCase() === 'settings') {
                return perms.canAccessSettings !== false;
            }

            if (item.id.toLowerCase() === 'automations') {
                return perms.canAccessSettings !== false;
            }

            // Regras para Pessoas/Usuários
            if (['users', 'members', 'pessoas', 'clients', 'team'].includes(item.id.toLowerCase())) {
                return perms.canAccessPeople !== false;
            }

            // Regras para Conteúdo/Operacional (Geral)
            if (['content', 'events', 'artists', 'properties'].includes(item.id.toLowerCase())) {
                return perms.canAccessContent !== false;
            }

            return true;
        });
    };

    return {
        menuItems: filterMenuByPermissions(getOrgMenu()),
    };
};
