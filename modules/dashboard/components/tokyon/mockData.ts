import { KanbanCardData } from '../../../../types';

// Extend KanbanCardData locally for Phase 4 Orchestra metadata
export interface EnrichedKanbanCardData extends KanbanCardData {
    tasks?: { id: string; label: string; completed: boolean }[];
    finance?: {
        totalValue: string;
        paidValue: string;
        status: 'paid' | 'pending' | 'partial';
        nextDue?: string;
        history: { id: string; date: string; amount: string; status: 'paid' | 'pending' }[];
    };
    contract?: {
        fileUrl: string;
        fileName: string;
        startDate: string;
        endDate: string;
        status: 'active' | 'expired' | 'signed';
    };
    isOrangeProgram?: boolean;
    // Orchestra Specifics
    probability?: number; // 0-100
    estimatedROI?: string;
    health?: 'on-track' | 'at-risk' | 'delayed';
    estimatedHours?: number;
    loggedHours?: number;
    kickoffDate?: string;
}

export interface BoardData {
    id: string;
    title: string;
    description: string;
    columns: {
        id: string;
        title: string;
        color: string;
        cards: EnrichedKanbanCardData[];
    }[];
}

export const TOKYON_BOARDS: BoardData[] = [
    {
        id: 'clients',
        title: 'CRM & Vendas',
        description: 'Pipeline estratégico de aquisição de clientes high-ticket.',
        columns: [
            {
                id: 'leads', title: 'Novos Leads', color: 'bg-docka-300 dark:bg-zinc-700',
                cards: [
                    { 
                        id: 'c1', title: 'Grupo Soma', subtitle: 'Prospecção Ativa', date: 'Hoje', 
                        tags: [{ label: 'Varejo', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' }], 
                        members: [{id: 'm1', name: 'Alex', avatar: 'https://picsum.photos/id/11/50/50'}],
                        probability: 30,
                        estimatedROI: '3.5x'
                    },
                ]
            },
            {
                id: 'qualify', title: 'Qualificação', color: 'bg-indigo-400',
                cards: [
                    { 
                        id: 'c3', title: 'Rede D’Or', subtitle: 'Diagnóstico Estratégico', date: '24/02', priority: 'high', value: 'R$ 80k', 
                        members: [{id: 'm2', name: 'Sarah', avatar: 'https://picsum.photos/id/64/50/50'}],
                        probability: 50,
                        finance: {
                            totalValue: 'R$ 80.000,00',
                            paidValue: 'R$ 0,00',
                            status: 'pending',
                            history: []
                        }
                    }
                ]
            },
            {
                id: 'proposal', title: 'Proposta/Negociação', color: 'bg-amber-400',
                cards: [
                    { 
                        id: 'c4', title: 'XP Inc.', subtitle: 'Pitch de Retenção Criativa', value: 'R$ 120k', date: '20/02', 
                        tags: [{ label: 'Orange Program', color: 'bg-docka-900 text-white' }],
                        isOrangeProgram: true,
                        probability: 85,
                        contract: {
                            fileUrl: '#',
                            fileName: 'contrato_xp_v2.pdf',
                            startDate: '01/03/2026',
                            endDate: '01/03/2027',
                            status: 'signed'
                        }
                    },
                ]
            },
            {
                id: 'won', title: 'Fechado (Ganho)', color: 'bg-emerald-500',
                cards: [
                    { id: 'c5', title: 'TechStart', subtitle: 'Contrato Assinado', value: 'R$ 45k', date: 'Ontem', tags: [{ label: 'Design System', color: 'bg-purple-100 text-purple-700' }], probability: 100 }
                ]
            }
        ]
    },
    {
        id: 'projects',
        title: 'Gestão de Projetos',
        description: 'Orquestração de entregas e sprints de alta fidelidade.',
        columns: [
            {
                id: 'kickoff', title: 'Kickoff / Onboarding', color: 'bg-docka-800',
                cards: [
                    { 
                        id: 'p1', title: 'Taurus: Identidade Visual', subtitle: 'Configuração de Brand Core', date: '26/02', 
                        isOrangeProgram: true,
                        health: 'on-track',
                        tasks: [
                            { id: 'tp1', label: 'Briefing com Stakeholders', completed: true },
                            { id: 'tp2', label: 'Pesquisa de Mercado', completed: true },
                            { id: 'tp3', label: 'Moodboard Inicial', completed: false }
                        ],
                        estimatedHours: 40,
                        loggedHours: 12
                    }
                ]
            },
            {
                id: 'sprint', title: 'Sprint Atual', color: 'bg-orange-500',
                cards: [
                    { 
                        id: 'p2', title: 'SulAmérica: Redesign', subtitle: 'Prototipagem de Alta Fidelidade', date: '28/02', priority: 'high', 
                        health: 'at-risk',
                        members: [{id: 'm2', name: 'Sarah', avatar: 'https://picsum.photos/id/12/50/50'}],
                        estimatedHours: 120,
                        loggedHours: 85
                    }
                ]
            },
            {
                id: 'review', title: 'Revisão / QA', color: 'bg-indigo-500',
                cards: [
                    { 
                        id: 'p3', title: 'Gerdau: Portal RI', subtitle: 'Ajustes de Responsividade', date: '01/03',
                        health: 'on-track',
                        tasks: [
                            { id: 'tr1', label: 'Teste de QA Cross-browser', completed: true },
                            { id: 'tr2', label: 'Otimização de Performance', completed: false }
                        ]
                    }
                ]
            },
            {
                id: 'approval', title: 'Aprovação Cliente', color: 'bg-amber-500',
                cards: [
                    { id: 'p4', title: 'Coca-Cola: Campanha', subtitle: 'Aguardando Aprovação de Assets', date: '02/03', health: 'delayed' }
                ]
            }
        ]
    },
    {
        id: 'generic-board',
        title: 'Kanban Genérico',
        description: 'Quadro flexível para fluxos de trabalho diversos.',
        columns: [
            {
                id: 'todo', title: 'A Fazer', color: 'bg-zinc-400',
                cards: [
                    { id: 'g1', title: 'Tarefa de Exemplo', subtitle: 'Arraste para mover', date: 'Hoje' }
                ]
            },
            {
                id: 'doing', title: 'Em Andamento', color: 'bg-blue-400',
                cards: []
            },
            {
                id: 'done', title: 'Concluído', color: 'bg-emerald-400',
                cards: []
            }
        ]
    }
];
