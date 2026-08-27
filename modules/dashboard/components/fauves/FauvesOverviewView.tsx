import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CalendarDays, RefreshCw, ServerCog, WalletCards } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fauvesService, FauvesOverviewSnapshot } from '../../../../services/fauvesService';
import { currency, shortCurrency } from './FauvesUI';

const BORDER = 'border-[#e5e5e5] dark:border-zinc-800';

const EMPTY: FauvesOverviewSnapshot = {
    gmv: 0,
    platformRevenue: 0,
    ticketsToday: 0,
    courtesyTicketsToday: 0,
    pendingWithdrawals: 0,
    activeEvents: 0,
    activeOrganizations: 0,
    paymentMix: { pix: 0, card: 0 },
    revenueSeries: [],
    integrations: [],
    activities: [],
};

const monthLabels = ['jul/25', 'ago/25', 'set/25', 'out/25', 'nov/25', 'dez/25', 'jan/26', 'fev/26', 'mar/26', 'abr/26', 'mai/26', 'jun/26'];
const emptyRevenueSeries = monthLabels.map((label) => ({ label, current: 0, previous: 0 }));

const todayLabel = () => {
    const now = new Date();
    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${weekdays[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}. de ${now.getFullYear()}`;
};

interface KpiProps {
    label: string;
    value: string;
    detail: React.ReactNode;
}

const Kpi = ({ label, value, detail }: KpiProps) => (
    <div className={`flex min-h-[170px] min-w-0 flex-col justify-between border-b border-r bg-white p-5 sm:p-[30px] dark:bg-zinc-950 ${BORDER}`}>
        <span className="text-xs font-medium text-black sm:text-sm dark:text-zinc-300">{label}</span>
        <div className="flex flex-col gap-5">
            <span className="truncate font-season text-[28px] font-[420] leading-none text-black sm:text-[32px] dark:text-white" title={value}>{value}</span>
            <span className="min-h-[10px] text-[10px] font-semibold leading-none text-[#9f9f9f] dark:text-zinc-500">{detail}</span>
        </div>
    </div>
);

const RevenueChart = ({ data }: { data: FauvesOverviewSnapshot['revenueSeries'] }) => {
    const series = data.length > 1 ? data.slice(-12) : emptyRevenueSeries;
    return (
        <div className="h-[374px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 28, right: 0, left: 0, bottom: 0 }} barCategoryGap={0}>
                    <defs>
                        <linearGradient id="fauvesRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#dedeff" stopOpacity={0.95} />
                            <stop offset="100%" stopColor="#f8f8ff" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e5e5e5" vertical />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#111111', fontFamily: 'Plus Jakarta Sans' }} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#111111', fontFamily: 'Plus Jakarta Sans' }} width={34} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(42,42,215,.035)' }} formatter={(value) => currency(Number(value))} contentStyle={{ border: '1px solid #e5e5e5', borderRadius: 0, fontSize: 11, boxShadow: 'none' }} />
                    <Bar dataKey="current" fill="url(#fauvesRevenue)" stroke="#2a2ad7" strokeWidth={1} radius={0}>
                        <LabelList dataKey="current" position="top" formatter={(value: React.ReactNode) => Number(value) ? shortCurrency(Number(value)) : ''} style={{ fontSize: 9, fill: '#111111', fontFamily: 'Plus Jakarta Sans' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

interface AlertRowProps {
    icon: React.ReactNode;
    label: string;
    action: string;
}

const AlertRow = ({ icon, label, action }: AlertRowProps) => (
    <div className={`flex min-h-[51px] items-center justify-between gap-5 border-t px-5 py-3 sm:px-[30px] ${BORDER}`}>
        <div className="flex min-w-0 items-center gap-[10px]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#fd6b32]">{icon}</span>
            <span className="truncate text-xs font-semibold text-black dark:text-zinc-200">{label}</span>
        </div>
        <span className="truncate text-right text-[11px] font-normal text-[#9f9f9f] dark:text-zinc-500">{action}</span>
    </div>
);

const FauvesOverviewView: React.FC<{ userName?: string }> = ({ userName = 'Usuário' }) => {
    const [snapshot, setSnapshot] = useState<FauvesOverviewSnapshot>(EMPTY);
    const [ranking, setRanking] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const [overview, rankingData] = await Promise.all([
                fauvesService.getOverviewSnapshot(),
                fauvesService.getRanking().catch(() => []),
            ]);
            setSnapshot(overview);
            setRanking(Array.isArray(rankingData) ? rankingData : []);
        } catch {
            setSnapshot(EMPTY);
            setRanking([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, []);

    const kpis: KpiProps[] = [
        { label: 'GMV Total', value: shortCurrency(snapshot.gmv), detail: <><span className="text-[#76ba00]">+0%</span> <span>vs mês anterior</span></> },
        { label: 'Receita Fauves', value: shortCurrency(snapshot.platformRevenue), detail: 'Take-rate acumulado' },
        { label: 'Ingressos hoje', value: snapshot.ticketsToday.toLocaleString('pt-BR'), detail: `${snapshot.courtesyTicketsToday} cortesias` },
        { label: 'Saques pendentes', value: shortCurrency(snapshot.pendingWithdrawals), detail: 'Fila Pix operacional' },
        { label: 'Eventos ativos', value: snapshot.activeEvents.toLocaleString('pt-BR'), detail: 'Publicados e vendendo' },
        { label: 'Calendários', value: snapshot.activeOrganizations.toLocaleString('pt-BR'), detail: 'Produtoras operando' },
    ];

    const topOrganizations = useMemo(() => ranking.slice(0, 5), [ranking]);
    const maxRanking = Math.max(1, ...topOrganizations.map((item) => Number(item.value || item.revenue || 0)));
    const degradedIntegrations = snapshot.integrations.filter((integration) => integration.status !== 'operational').length;

    return (
        <div className="min-h-full bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <header className={`sticky top-0 z-10 flex h-[75px] items-center justify-between border-b bg-white/95 px-5 backdrop-blur-sm sm:px-7 dark:bg-zinc-950/95 ${BORDER}`}>
                <span className="font-season text-[22px] font-[420] text-black dark:text-white">Olá, {userName}</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => void load()} disabled={loading} aria-label="Atualizar dashboard" className="mr-1 rounded-full p-1.5 text-[#9f9f9f] transition hover:bg-zinc-100 hover:text-black disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-white">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <Calendar size={17} className="text-[#9f9f9f]" />
                    <span className="hidden text-sm font-semibold text-black sm:inline dark:text-zinc-300">{todayLabel()}</span>
                </div>
            </header>

            <section className={`grid grid-cols-2 border-l md:grid-cols-3 xl:grid-cols-6 ${BORDER}`} aria-label="Indicadores da operação">
                {kpis.map((kpi) => <Kpi key={kpi.label} {...kpi} />)}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2">
                <div className={`border-b border-r ${BORDER}`}>
                    <div className={`flex min-h-[72px] items-center gap-4 border-b px-5 sm:px-[30px] ${BORDER}`}>
                        <h2 className="text-sm font-medium text-black dark:text-zinc-200">Faturamento</h2>
                        <span className="text-[10px] font-medium text-black dark:text-zinc-500">Comparativo por período</span>
                    </div>
                    <RevenueChart data={snapshot.revenueSeries} />
                </div>

                <div className={`border-b ${BORDER}`}>
                    <div className={`flex min-h-[72px] items-center border-b px-5 sm:px-[30px] ${BORDER}`}>
                        <h2 className="text-sm font-medium text-black dark:text-zinc-200">Top organizadores</h2>
                    </div>
                    <div className="min-h-[204px]">
                        {topOrganizations.length ? topOrganizations.map((item, index) => {
                            const value = Number(item.value || item.revenue || 0);
                            const width = Math.max(7, (value / maxRanking) * 100);
                            return (
                                <div key={item.id || item.name || index} className={`flex min-h-[41px] items-center border-b px-5 last:border-b-0 sm:px-[30px] ${BORDER}`}>
                                    <span className="w-[145px] shrink-0 truncate text-xs font-medium text-[#fd6b32]">{item.name || item.organizationName || 'Organizador'}</span>
                                    <div className="relative h-[30px] min-w-0 flex-1">
                                        <div className="absolute inset-y-0 left-0 border-r border-[#fd6b32] bg-gradient-to-l from-[#ffeee8] to-transparent dark:from-orange-950/30" style={{ width: `${width}%` }} />
                                    </div>
                                    <span className="w-[76px] shrink-0 text-right text-[10px] font-medium text-black dark:text-zinc-300">{shortCurrency(value)}</span>
                                </div>
                            );
                        }) : <div className="flex min-h-[204px] items-center justify-center text-xs text-[#9f9f9f]">Sem faturamento ranqueado no período.</div>}
                    </div>

                    <div className={`flex min-h-[72px] items-center border-y px-5 sm:px-[30px] ${BORDER}`}>
                        <h2 className="text-sm font-medium text-black dark:text-zinc-200">Alertas operacionais</h2>
                    </div>
                    <AlertRow icon={<WalletCards size={17} strokeWidth={1.5} />} label="Saques Pix pendentes" action={snapshot.pendingWithdrawals > 0 ? `Revisar ${currency(snapshot.pendingWithdrawals)}` : 'Fila conciliada'} />
                    <AlertRow icon={<ServerCog size={17} strokeWidth={1.5} />} label="Saúde das integrações" action={degradedIntegrations ? `${degradedIntegrations} serviço(s) exigem atenção` : 'Todos os serviços operacionais'} />
                    <AlertRow icon={<CalendarDays size={17} strokeWidth={1.5} />} label="Eventos ativos" action={`${snapshot.activeEvents.toLocaleString('pt-BR')} publicados e vendendo`} />
                </div>
            </section>
        </div>
    );
};

export default FauvesOverviewView;
