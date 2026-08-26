import {
    LayoutDashboard, Ticket, CreditCard, Megaphone, Users,
    Settings, Globe, Headphones, Mail,
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

            // Synchronize immediately after the CRM refreshes, moves or archives a lead.
            const handleCrmUpdated = (event: Event) => {
                const count = Number((event as CustomEvent<{ newLeadCount?: number }>).detail?.newLeadCount);
                if (Number.isFinite(count) && count >= 0) {
                    setUnreadLeads(count);
                    return;
                }
                void fetchUnread();
            };
            window.addEventListener('asterysko-crm-updated', handleCrmUpdated);

            return () => {
                clearInterval(interval);
                window.removeEventListener('asterysko-crm-updated', handleCrmUpdated);
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
                { id: 'overview', label: 'Centro de comando', icon: LayoutDashboard },
                { id: 'organizations', label: 'Produtoras', icon: Building2 },
                { id: 'events', label: 'Eventos', icon: Ticket },
                { id: 'users', label: 'Usuários & Risco', icon: ShieldAlert },
                { id: 'finance', label: 'Financeiro & Pix', icon: Wallet },
                {
                    id: 'helpdesk',
                    label: 'Suporte',
                    icon: Headphones,
                    children: [
                        { id: 'helpdesk-tickets', label: 'Tickets', icon: MessageSquare },
                        { id: 'helpdesk-chat', label: 'Live Chat', icon: Users },
                        { id: 'helpdesk-center', label: 'Central de Ajuda', icon: Book }
                    ]
                },
                { id: 'marketing', label: 'Marketing', icon: Megaphone },
                { id: 'settings', label: 'Auditoria & Ajustes', icon: Settings },
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
                // Mantém a central visível durante a restauração da sessão/API.
                // O backend continua sendo a autoridade para leitura e gerenciamento.
                return items.filter((item) => !['team', 'settings'].includes(item.id));
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
