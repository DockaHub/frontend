import React, { useEffect, useState } from 'react';
import { BadgeCheck, CalendarClock, ChevronRight, CircleGauge, UserRound, Building2 } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { ALLYO_BORDER, AllyoPageHeader, DataCell } from './AllyoUI';
import { allyoService, AllyoClient } from '../../../../services/allyoService';

const AllyoClientsView = () => {
    const [clients, setClients] = useState<AllyoClient[]>([]);
    const [selected, setSelected] = useState<AllyoClient | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        allyoService.getClients()
            .then((res) => {
                if (res && Array.isArray(res.clients)) {
                    setClients(res.clients);
                }
            })
            .catch((err) => console.warn('[AllyoClientsView] Erro ao carregar clientes:', err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Seus clientes" />
            <section aria-label="Clientes ativos">
                {clients.map((client) => (
                    <button
                        key={client.id}
                        type="button"
                        onClick={() => setSelected(client)}
                        className={`grid min-h-[78px] w-full grid-cols-[minmax(210px,1.2fr)_120px_140px_180px_150px_18px] items-center gap-[50px] border-b px-5 py-4 text-left transition-colors hover:bg-[#fafbf8] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9db669] sm:px-[30px] max-xl:grid-cols-[minmax(190px,1fr)_120px_160px_130px_18px] max-lg:grid-cols-[minmax(190px,1fr)_140px_130px_18px] max-sm:grid-cols-[1fr_105px_18px] ${ALLYO_BORDER}`}
                    >
                        <span className="flex min-w-0 items-center gap-[10px]">
                            <span className="flex h-[35px] w-[35px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#e9e9e9] bg-[#0d1e1d] text-white dark:border-zinc-700">
                                {client.logo ? (
                                    <img src={client.logo} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <Building2 size={18} className="text-[#9db669]" />
                                )}
                            </span>
                            <strong className="truncate text-sm font-medium text-black dark:text-white">{client.name}</strong>
                        </span>
                        <DataCell label="SEGMENTO" value={client.segment} className="max-lg:hidden" />
                        <DataCell label="FRANQUIA MENSAL" value={`${client.monthlyCredits} créditos`} className="max-xl:hidden" />
                        <DataCell label="RESPONSÁVEL ATENDIMENTO" value={client.cam} className="max-sm:hidden" />
                        <DataCell label="VENCIMENTO CONTRATO" value={client.contractEnd} />
                        <ChevronRight size={18} className="text-[#9f9f9f]" />
                    </button>
                ))}

                {!isLoading && clients.length === 0 && (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                        <strong className="text-sm font-semibold">Nenhum cliente cadastrado</strong>
                        <span className="mt-2 text-xs text-[#7f7f7f]">As empresas e clientes cadastrados no portal da Allyo aparecerão aqui.</span>
                    </div>
                )}
            </section>

            <ClientDetailsModal client={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

const ClientDetailsModal = ({ client, onClose }: { client: AllyoClient | null; onClose: () => void }) => (
    <Modal isOpen={Boolean(client)} onClose={onClose} title="Detalhes do cliente" size="lg">
        {client && (
            <div>
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#e5e5e5] bg-[#0d1e1d] text-white dark:border-zinc-700">
                        {client.logo ? (
                            <img src={client.logo} alt="" className="h-full w-full object-cover rounded-[14px]" />
                        ) : (
                            <Building2 size={26} className="text-[#9db669]" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#739044]"><BadgeCheck size={14} /> Cliente ativo</span>
                        <h2 className="mt-1 truncate font-season text-[28px] font-normal text-black dark:text-white">{client.name}</h2>
                        <p className="mt-1 text-xs text-[#7f7f7f] dark:text-zinc-400">{client.segment} • contrato desde {client.since}</p>
                    </div>
                </div>

                <div className={`mt-6 grid grid-cols-2 border-y md:grid-cols-4 ${ALLYO_BORDER}`}>
                    <ClientMetric icon={<CircleGauge size={16} />} label="FRANQUIA" value={`${client.monthlyCredits} créditos`} />
                    <ClientMetric icon={<CircleGauge size={16} />} label="USO NO MÊS" value={`${client.usedCredits} créditos`} bordered />
                    <ClientMetric icon={<UserRound size={16} />} label="CAM RESPONSÁVEL" value={client.cam} bordered />
                    <ClientMetric icon={<CalendarClock size={16} />} label="VENCIMENTO" value={client.contractEnd} bordered />
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-black dark:text-zinc-200">Consumo da franquia mensal</span>
                        <span className="font-semibold text-[#739044]">
                            {client.monthlyCredits > 0 ? Math.round((client.usedCredits / client.monthlyCredits) * 100) : 0}%
                        </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1e5] dark:bg-zinc-800">
                        <div
                            className="h-full rounded-full bg-[#9db669]"
                            style={{ width: `${Math.min(100, client.monthlyCredits > 0 ? (client.usedCredits / client.monthlyCredits) * 100 : 0)}%` }}
                        />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#7f7f7f] dark:text-zinc-400">
                        Restam {Math.max(0, client.monthlyCredits - client.usedCredits)} créditos disponíveis neste ciclo.
                    </p>
                </div>
            </div>
        )}
    </Modal>
);

const ClientMetric = ({ icon, label, value, bordered = false }: { icon: React.ReactNode; label: string; value: string; bordered?: boolean }) => (
    <div className={`min-w-0 px-3 py-4 first:pl-0 ${bordered ? 'border-l border-[#e5e5e5] pl-4 dark:border-zinc-800' : ''}`}>
        <span className="flex items-center gap-2 text-[#9db669]">{icon}<span className="text-[9px] font-bold tracking-[.04em] text-[#7f7f7f] dark:text-zinc-500">{label}</span></span>
        <strong className="mt-3 block truncate text-xs font-semibold text-black dark:text-white">{value}</strong>
    </div>
);

export default AllyoClientsView;
