import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { ALLYO_BORDER, AllyoPageHeader, FilterSelect } from './AllyoUI';
import { allyoService, AllyoDemand } from '../../../../services/allyoService';

interface DeliveryRow {
    id: string;
    approvedAt: string;
    versions: number;
    credits: number;
    boosters: number;
}

const formatCredits = (value: number) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${value === 1 ? 'crédito' : 'créditos'}`;

const downloadReport = (rows: DeliveryRow[]) => {
    const header = ['ID da Tarefa', 'Data de aprovação', 'Versões', 'Créditos', 'Boosters Utilizados'];
    const csv = [header, ...rows.map((row) => [row.id, row.approvedAt, row.versions, row.credits, row.boosters])]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'allyo-ganhos.csv';
    link.click();
    URL.revokeObjectURL(url);
};

const AllyoEarningsView = () => {
    const [period, setPeriod] = useState('Todas as entregas');
    const [demands, setDemands] = useState<AllyoDemand[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        allyoService.getDemands()
            .then((res) => {
                if (res && Array.isArray(res.demands)) {
                    setDemands(res.demands);
                }
            })
            .catch((err) => console.warn('[AllyoEarningsView] Erro ao carregar demandas:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const approvedDemands = useMemo(() => {
        return demands.filter((d) => d.status === 'Concluído' || d.status === 'Concluída');
    }, [demands]);

    const pendingDemands = useMemo(() => {
        return demands.filter((d) => d.status === 'Em revisão' || d.status === 'Em andamento');
    }, [demands]);

    const approvedCredits = useMemo(() => {
        return approvedDemands.reduce((sum, d) => sum + (d.tasks || 1), 0);
    }, [approvedDemands]);

    const pendingCredits = useMemo(() => {
        return pendingDemands.reduce((sum, d) => sum + (d.tasks || 1), 0);
    }, [pendingDemands]);

    // Cálculo de saldo com base no valor progressivo por crédito
    const totalEarnings = useMemo(() => {
        if (approvedCredits <= 0) return 0;
        if (approvedCredits <= 70) return approvedCredits * 50;
        return 70 * 50 + (approvedCredits - 70) * 70;
    }, [approvedCredits]);

    const deliveries: DeliveryRow[] = useMemo(() => {
        return approvedDemands.map((d) => ({
            id: d.id,
            approvedAt: new Date(d.updatedAt || d.createdAt).toLocaleDateString('pt-BR'),
            versions: d.designsCount || 1,
            credits: d.tasks || 1,
            boosters: 0,
        }));
    }, [approvedDemands]);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Ganhos" />
            <div className="grid min-h-[calc(100%_-_75px)] grid-cols-1 xl:grid-cols-[350px_minmax(0,1fr)]">
                <aside className={`border-b xl:border-b-0 xl:border-r ${ALLYO_BORDER}`}>
                    <div className={`border-b p-[30px] ${ALLYO_BORDER}`}>
                        <span className="block text-[10px] font-semibold text-[#9f9f9f]">SALDO</span>
                        <strong className="mt-[5px] block font-season text-[22px] font-normal">
                            {totalEarnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </strong>
                    </div>
                    <div className={`border-b px-[30px] py-5 ${ALLYO_BORDER}`}>
                        <h2 className="text-sm font-medium">Receita progressiva</h2>
                        <p className="mt-[10px] text-xs leading-[1.35] text-[#858585]">O valor que você recebe por crédito é progressivo e dinâmico. Confira abaixo as recompensas relacionadas ao seu desempenho:</p>
                        <div className="mt-5 rounded-[12px] border border-[#dce7c4] bg-[#f8faf3] p-3.5 dark:border-[#d0f08e]/20 dark:bg-[#d0f08e]/5">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-[.06em] text-[#739044] dark:text-[#d0f08e]">Seu nível atual</span>
                                <span className="text-xs font-semibold text-black dark:text-white">{approvedCredits} créditos aprovados</span>
                            </div>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e5ecd7] dark:bg-zinc-800">
                                <div className="h-full rounded-full bg-[#9db669]" style={{ width: `${Math.min(100, (approvedCredits / 70) * 100)}%` }} />
                            </div>
                            <p className="mt-2 text-[10px] leading-4 text-[#7b8669] dark:text-zinc-400">
                                {approvedCredits < 70
                                    ? `Faltam ${70 - approvedCredits} créditos para o próximo nível.`
                                    : 'Parabéns! Você atingiu a faixa máxima de remuneração.'}
                            </p>
                        </div>
                    </div>
                    <Tier label="<70 créditos aprovados" value="R$ 50,00" current={approvedCredits < 70} />
                    <Tier label="70–71 créditos aprovados" value="R$ 4.000,00" current={approvedCredits >= 70 && approvedCredits <= 71} />
                    <Tier label=">71 créditos aprovados" value="R$ 70,00" current={approvedCredits > 71} />
                    <div className={`border-b px-[30px] py-5 ${ALLYO_BORDER}`}>
                        <h2 className="text-sm font-medium">Créditos pendentes</h2>
                        <p className="mt-[10px] text-xs leading-[1.35] text-[#858585]">
                            Atualmente, <strong>{pendingCredits.toLocaleString('pt-BR')} créditos</strong> aguardam aprovação do cliente. Após aprovação, serão transferidos para sua lista de créditos aprovados.
                        </p>
                    </div>
                </aside>

                <main className="min-w-0">
                    <div className={`flex min-h-[91px] flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-[30px] ${ALLYO_BORDER}`}>
                        <h2 className="text-sm font-medium">Entregas que você realizou</h2>
                        <div className="flex items-center gap-[10px]">
                            <FilterSelect label="Período" value={period} options={['Todas as entregas', 'Últimos 30 dias']} onChange={setPeriod} />
                            <button
                                type="button"
                                disabled={deliveries.length === 0}
                                onClick={() => downloadReport(deliveries)}
                                className="inline-flex min-h-9 items-center gap-[10px] rounded-full bg-[#131f15] px-[15px] py-2 text-xs font-semibold text-white transition hover:bg-[#253829] disabled:opacity-40"
                            >
                                <Download size={13} /> <span className="hidden sm:inline">Baixar relatório</span>
                            </button>
                        </div>
                    </div>
                    <div className="custom-scrollbar overflow-x-auto">
                        <table className="w-full min-w-[760px] table-fixed text-left">
                            <thead>
                                <tr className={`border-b text-sm font-medium ${ALLYO_BORDER}`}>
                                    <th className="w-[18%] px-[30px] py-[15px] font-medium">ID da Tarefa</th>
                                    <th className="w-[25%] px-3 py-[15px] font-medium">Data de aprovação</th>
                                    <th className="w-[17%] px-3 py-[15px] font-medium">Versões</th>
                                    <th className="w-[20%] px-3 py-[15px] font-medium">Créditos</th>
                                    <th className="w-[20%] py-[15px] pl-3 pr-[30px] text-right font-medium">Boosters Utilizados</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.map((row) => (
                                    <tr key={row.id} className={`border-b text-sm font-medium transition-colors hover:bg-[#fafbf8] dark:hover:bg-zinc-900/60 ${ALLYO_BORDER}`}>
                                        <td className="px-[30px] py-5 truncate font-mono text-xs">{row.id}</td>
                                        <td className="px-3 py-5">{row.approvedAt}</td>
                                        <td className="px-3 py-5"><VersionBadges count={row.versions} /></td>
                                        <td className="px-3 py-5">{formatCredits(row.credits)}</td>
                                        <td className="py-5 pl-3 pr-[30px] text-right">{row.boosters}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {!isLoading && deliveries.length === 0 && (
                            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                                <strong className="text-sm font-semibold">Nenhuma entrega realizada ainda</strong>
                                <span className="mt-2 text-xs text-[#7f7f7f]">As demandas aprovadas pelos clientes na Allyo Space aparecerão aqui contabilizando créditos e saldo.</span>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const Tier = ({ label, value, current = false }: { label: string; value: string; current?: boolean }) => (
    <div className={`relative flex items-center justify-between gap-4 border-b px-[30px] py-5 ${ALLYO_BORDER} ${current ? 'bg-[#fbfcf8] dark:bg-[#d0f08e]/[.035]' : ''}`}>
        {current && <span className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-[#9db669]" />}
        <span className={`text-xs font-semibold ${current ? 'text-[#739044] dark:text-[#d0f08e]' : 'text-[#9f9f9f]'}`}>{label}{current && <small className="ml-2 rounded-full bg-[#eef4e3] px-2 py-1 text-[8px] font-bold uppercase tracking-[.06em] text-[#739044] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]">Atual</small>}</span>
        <strong className="shrink-0 font-season text-base font-normal">{value}</strong>
    </div>
);

const VersionBadges = ({ count }: { count: number }) => (
    <span className="inline-flex gap-[3px]">
        {Array.from({ length: Math.max(1, count) }, (_, index) => <span key={index} className="rounded-[3px] border border-[#c2c2c2] px-1 py-[3px] text-[10px] leading-none">{index + 1}ª</span>)}
    </span>
);

export default AllyoEarningsView;
