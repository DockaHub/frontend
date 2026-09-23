import React from 'react';
import { Organization } from '../../../types';
import AllyoOverviewView from './allyo/AllyoOverviewView';
import AllyoTasksView from './allyo/AllyoTasksView';
import AllyoEarningsView from './allyo/AllyoEarningsView';
import AllyoCreativePanelView from './allyo/AllyoCreativePanelView';
import AllyoClientsView from './allyo/AllyoClientsView';
import AllyoUsersView from './allyo/AllyoUsersView';
import AllyoTaskDetailView from './allyo/AllyoTaskDetailView';
import { AllyoPageHeader } from './allyo/AllyoUI';

interface AllyoDashboardProps {
    activeView: string;
    organization?: Organization;
    user?: { name?: string; role?: string };
}

const placeholderLabels: Record<string, { title: string; description: string }> = {
    clients: { title: 'Clientes', description: 'A carteira de clientes e seus projetos aparecerá aqui.' },
    catalog: { title: 'Catálogo', description: 'Serviços, formatos e créditos criativos serão organizados aqui.' },
    settings: { title: 'Configurações', description: 'Preferências da operação, equipe e permissões da Allyo.' },
    'creative-panel': { title: 'Painel Criativo', description: 'Visão de capacidade, qualidade e desempenho do time criativo.' },
    'help-center': { title: 'Central de Ajuda', description: 'Documentação e suporte para a operação Allyo.' },
};

const AllyoDashboard: React.FC<AllyoDashboardProps> = ({ activeView, user, organization }) => {
    const canManageAccess = user?.role === 'ADMIN' || organization?.memberRole === 'OWNER' || organization?.memberRole === 'ADMIN';
    switch (activeView) {
        case 'overview':
        case 'home':
            return <AllyoOverviewView userName={user?.name} />;
        case 'tasks':
            return <AllyoTasksView />;
        case 'earnings':
            return <AllyoEarningsView />;
        case 'creative-panel':
            return <AllyoCreativePanelView />;
        case 'clients':
            return <AllyoClientsView canManage={canManageAccess} />;
        case 'users':
            return canManageAccess ? <AllyoUsersView /> : <AccessDenied />;
        case 'task-detail':
            return <AllyoTaskDetailView userName={user?.name} />;
        default: {
            const content = placeholderLabels[activeView] || { title: 'Allyo', description: 'Este módulo está sendo preparado.' };
            return (
                <div className="h-full overflow-y-auto bg-white dark:bg-zinc-950">
                    <AllyoPageHeader title={content.title} />
                    <div className="flex min-h-[420px] items-center justify-center px-6 text-center">
                        <div className="max-w-md">
                            <img src="/brands/allyo.svg" alt="Allyo" className="mx-auto h-14 w-14 rounded-lg" />
                            <h2 className="mt-6 font-season text-2xl text-black dark:text-white">{content.title}</h2>
                            <p className="mt-3 text-sm leading-6 text-[#7f7f7f] dark:text-zinc-400">{content.description}</p>
                        </div>
                    </div>
                </div>
            );
        }
    }
};

const AccessDenied = () => (
    <div className="h-full overflow-y-auto bg-white dark:bg-zinc-950">
        <AllyoPageHeader title="Usuários e hierarquia" />
        <div className="flex min-h-[420px] items-center justify-center px-6 text-center">
            <div className="max-w-sm"><h2 className="font-season text-2xl text-black dark:text-white">Acesso restrito</h2><p className="mt-3 text-sm leading-6 text-[#7f7f7f] dark:text-zinc-400">Somente administradores da Allyo podem gerenciar usuários e níveis de acesso.</p></div>
        </div>
    </div>
);

export default AllyoDashboard;
