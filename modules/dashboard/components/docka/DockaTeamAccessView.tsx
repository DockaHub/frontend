import React from 'react';
import { Building2, ShieldCheck, UserPlus, Users } from 'lucide-react';
import DashboardPage from '../../../../components/DashboardPage';
import UserManager from '../../../../components/admin/UserManager';
import { Organization } from '../../../../types';

interface DockaTeamAccessViewProps {
    organizations: Organization[];
}

const DockaTeamAccessView: React.FC<DockaTeamAccessViewProps> = ({ organizations }) => {
    const managedOrganizations = organizations.filter((org) => org.slug !== 'manyspace');
    const memberCount = managedOrganizations.reduce((total, org) => total + (org._count?.members || 0), 0);

    return (
        <DashboardPage title="Equipe & Acessos" icon={Users} padding="p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                    <p className="max-w-3xl text-sm leading-6 text-docka-500 dark:text-zinc-400">
                        Gerencie pessoas, empresas, funções e permissões em um único lugar. As mudanças feitas aqui são aplicadas diretamente ao acesso de cada painel.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryCard icon={Building2} label="Empresas gerenciadas" value={managedOrganizations.length} tone="violet" />
                    <SummaryCard icon={Users} label="Vínculos de acesso" value={memberCount} tone="blue" />
                    <SummaryCard icon={ShieldCheck} label="Controle central" value="Ativo" tone="emerald" />
                </div>

                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-5 py-4 dark:border-violet-900/50 dark:bg-violet-950/20">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-violet-600 p-2 text-white"><UserPlus size={16} /></div>
                        <div>
                            <h2 className="text-sm font-bold text-docka-900 dark:text-zinc-100">Um convite, vários painéis</h2>
                            <p className="mt-1 text-xs leading-5 text-docka-500 dark:text-zinc-400">Ao convidar uma pessoa, selecione todas as empresas às quais ela terá acesso. Depois, ajuste as permissões individualmente.</p>
                        </div>
                    </div>
                </div>

                {managedOrganizations.length > 0 ? (
                    <UserManager organizations={managedOrganizations} />
                ) : (
                    <div className="rounded-2xl border border-dashed border-docka-200 p-12 text-center dark:border-zinc-800">
                        <Building2 className="mx-auto mb-3 text-docka-300" size={28} />
                        <p className="text-sm font-semibold text-docka-700 dark:text-zinc-300">Nenhuma empresa disponível para gerenciar.</p>
                    </div>
                )}
            </div>
        </DashboardPage>
    );
};

const SummaryCard = ({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string | number; tone: 'violet' | 'blue' | 'emerald' }) => {
    const tones = {
        violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
    };
    return (
        <div className="rounded-2xl border border-docka-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-docka-400 dark:text-zinc-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold text-docka-900 dark:text-zinc-100">{value}</p>
                </div>
                <div className={`rounded-xl p-3 ${tones[tone]}`}><Icon size={20} /></div>
            </div>
        </div>
    );
};

export default DockaTeamAccessView;
