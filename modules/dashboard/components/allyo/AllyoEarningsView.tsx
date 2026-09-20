import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { ALLYO_BORDER, AllyoPageHeader, FilterSelect } from './AllyoUI';

const deliveries = Array.from({ length: 11 }, (_, index) => ({
    id: String(71271 + index),
    approvedAt: `${String(10 + (index % 9)).padStart(2, '0')}/09/2026 • ${String(index).padStart(2, '0')}:01`,
    versions: index % 3 === 0 ? 2 : 3,
    credits: index % 4 === 0 ? 1.5 : 1,
    boosters: index % 5 === 0 ? 1 : 0,
}));

const formatCredits = (value: number) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${value === 1 ? 'crédito' : 'créditos'}`;

const downloadReport = (rows: typeof deliveries) => {
    const header = ['ID da Tarefa', 'Data de aprovação', 'Versões', 'Créditos', 'Boosters Utilizados'];
    const csv = [header, ...rows.map((row) => [row.id, row.approvedAt, row.versions, row.credits, row.boosters])]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'allyo-ganhos-setembro-2026.csv';
    link.click();
    URL.revokeObjectURL(url);
};

const AllyoEarningsView = () => {
    const [period, setPeriod] = useState('Setembro/2026');
    const totalCredits = useMemo(() => deliveries.reduce((sum, row) => sum + row.credits, 0), []);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Ganhos" />
            <div className="grid min-h-[calc(100%_-_75px)] grid-cols-1 xl:grid-cols-[350px_minmax(0,1fr)]">
                <aside className={`border-b xl:border-b-0 xl:border-r ${ALLYO_BORDER}`}>
                    <div className={`border-b p-[30px] ${ALLYO_BORDER}`}>
                        <span className="block text-[10px] font-semibold text-[#9f9f9f]">SALDO</span>
                        <strong className="mt-[5px] block font-season text-[22px] font-normal">R$ 8.851,35</strong>
                    </div>
                    <div className={`border-b px-[30px] py-5 ${ALLYO_BORDER}`}>
                        <h2 className="text-sm font-medium">Receita progressiva</h2>
                        <p className="mt-[10px] text-xs leading-[1.35] text-[#858585]">O valor que você recebe por crédito é progressivo e dinâmico. Confira abaixo as recompensas relacionadas ao seu desempenho:</p>
                    </div>
                    <Tier label="&lt;70 créditos aprovados" value="R$ 50,00" />
                    <Tier label="70–71 créditos aprovados" value="R$ 4.000,00" />
                    <Tier label="&gt;71 créditos aprovados" value="R$ 70,00" />
                    <div className={`border-b px-[30px] py-5 ${ALLYO_BORDER}`}>
                        <h2 className="text-sm font-medium">Créditos pendentes</h2>
                        <p className="mt-[10px] text-xs leading-[1.35] text-[#858585]">Atualmente, <strong>{totalCredits.toLocaleString('pt-BR')} créditos</strong> aguardam aprovação do cliente. Após aprovação, serão transferidos para sua lista de créditos aprovados.</p>
                    </div>
                </aside>

                <main className="min-w-0">
                    <div className={`flex min-h-[91px] flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-[30px] ${ALLYO_BORDER}`}>
                        <h2 className="text-sm font-medium">Entregas que você realizou</h2>
                        <div className="flex items-center gap-[10px]">
                            <FilterSelect label="Período" value={period} options={['Setembro/2026', 'Agosto/2026', 'Julho/2026']} onChange={setPeriod} />
                            <button type="button" onClick={() => downloadReport(deliveries)} className="inline-flex min-h-9 items-center gap-[10px] rounded-full bg-[#131f15] px-[15px] py-2 text-xs font-semibold text-white transition hover:bg-[#253829]">
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
                                    <th className="w-[20%] px-3 py-[15px] text-right font-medium">Boosters Utilizados</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.map((row) => (
                                    <tr key={row.id} className={`border-b text-sm font-medium transition-colors hover:bg-[#fafbf8] dark:hover:bg-zinc-900/60 ${ALLYO_BORDER}`}>
                                        <td className="px-[30px] py-5">{row.id}</td>
                                        <td className="px-3 py-5">{row.approvedAt}</td>
                                        <td className="px-3 py-5"><VersionBadges count={row.versions} /></td>
                                        <td className="px-3 py-5">{formatCredits(row.credits)}</td>
                                        <td className="px-3 py-5 text-right">{row.boosters}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

const Tier = ({ label, value }: { label: string; value: string }) => (
    <div className={`flex items-center justify-between gap-4 border-b px-[30px] py-5 ${ALLYO_BORDER}`}>
        <span className="text-xs font-semibold text-[#9f9f9f]">{label}</span>
        <strong className="shrink-0 font-season text-base font-normal">{value}</strong>
    </div>
);

const VersionBadges = ({ count }: { count: number }) => (
    <span className="inline-flex gap-[3px]">
        {Array.from({ length: count }, (_, index) => <span key={index} className="rounded-[3px] border border-[#c2c2c2] px-1 py-[3px] text-[10px] leading-none">{index + 1}ª</span>)}
    </span>
);

export default AllyoEarningsView;
