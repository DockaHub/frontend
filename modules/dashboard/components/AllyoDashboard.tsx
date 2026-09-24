import React from 'react';
import { Organization } from '../../../types';
import AllyoOverviewView from './allyo/AllyoOverviewView';
import AllyoTasksView from './allyo/AllyoTasksView';
import AllyoEarningsView from './allyo/AllyoEarningsView';
import AllyoCreativePanelView from './allyo/AllyoCreativePanelView';
import AllyoClientsView from './allyo/AllyoClientsView';
import AllyoUsersView from './allyo/AllyoUsersView';
import AllyoCatalogView from './allyo/AllyoCatalogView';
import AllyoTaskDetailView from './allyo/AllyoTaskDetailView';
import { AllyoPageHeader } from './allyo/AllyoUI';

interface AllyoDashboardProps {
    activeView: string;
    organization?: Organization;
    user?: { name?: string; role?: string };
}

const placeholderLabels: Record<string, { title: string; description: string }> = {
    clients: { title: 'Meus clientes', description: 'Os clientes dos projetos em que você participa aparecerão aqui.' },
    settings: { title: 'Configurações', description: 'Preferências da operação, equipe e permissões da Allyo.' },
    'creative-panel': { title: 'Painel Criativo', description: 'Visão de capacidade, qualidade e desempenho do time criativo.' },
    'help-center': { title: 'Central de Ajuda', description: 'Documentação e suporte para a operação Allyo.' },
};

const AllyoDashboard: React.FC<AllyoDashboardProps> = ({ activeView, user, organization }) => {
    const globalRole = String(user?.role || '').toUpperCase();
    const canManageAccess = ['ADMIN', 'OWNER', 'SUPER_ADMIN'].includes(globalRole) || organization?.memberRole === 'OWNER' || organization?.memberRole === 'ADMIN';
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
            return <AllyoClientsView mode="assigned" />;
        case 'management-clients':
            return canManageAccess ? <AllyoClientsView mode="management" /> : <AccessDenied title="Empresas e contratos" />;
        case 'management-users':
        case 'users':
            return canManageAccess ? <AllyoUsersView /> : <AccessDenied title="Usuários e hierarquia" />;
        case 'management-catalog':
        case 'catalog':
            return canManageAccess ? <AllyoCatalogView /> : <AccessDenied title="Catálogo de produtos" />;
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

const AccessDenied = ({ title }: { title: string }) => (
    <div className="h-full overflow-y-auto bg-white dark:bg-zinc-950">
        <AllyoPageHeader title={title} />
        <div className="flex min-h-[420px] items-center justify-center px-6 text-center">
            <div className="max-w-sm"><h2 className="font-season text-2xl text-black dark:text-white">Acesso restrito</h2><p className="mt-3 text-sm leading-6 text-[#7f7f7f] dark:text-zinc-400">Somente administradores da Allyo podem acessar esta área de gestão.</p></div>
        </div>
    </div>
);

export default AllyoDashboard;
