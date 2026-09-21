import React, { useState } from 'react';
import { BadgeCheck, CalendarClock, ChevronRight, CircleGauge, UserRound } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { ALLYO_BORDER, AllyoPageHeader, DataCell } from './AllyoUI';

interface AllyoClient {
    id: string;
    name: string;
    segment: string;
    monthlyCredits: number;
    usedCredits: number;
    cam: string;
    contractEnd: string;
    since: string;
    logo: string;
}

const clients: AllyoClient[] = [
    { id: 'cli-001', name: 'Asterysko', segment: 'Jurídico', monthlyCredits: 90, usedCredits: 62, cam: 'Marina Alves', contractEnd: '30/04/2027', since: '01/05/2026', logo: '/brands/allyo/client-icon.png' },
    { id: 'cli-002', name: 'Fauves', segment: 'Eventos', monthlyCredits: 120, usedCredits: 87, cam: 'Bruno Costa', contractEnd: '18/06/2027', since: '18/06/2026', logo: '/brands/fauves.svg' },
    { id: 'cli-003', name: 'Tokyon', segment: 'Tecnologia', monthlyCredits: 70, usedCredits: 41, cam: 'Marina Alves', contractEnd: '12/08/2027', since: '12/08/2026', logo: '/brands/tokyon.svg' },
    { id: 'cli-004', name: 'Niva', segment: 'Mobilidade', monthlyCredits: 90, usedCredits: 76, cam: 'Bruno Costa', contractEnd: '04/09/2027', since: '04/09/2026', logo: '/brands/niva.svg' },
    { id: 'cli-005', name: 'Webmotors', segment: 'Automotivo', monthlyCredits: 150, usedCredits: 108, cam: 'Marina Alves', contractEnd: '21/11/2027', since: '21/11/2026', logo: '/brands/allyo/client-icon.png' },
    { id: 'cli-006', name: 'ManySpace', segment: 'Tecnologia', monthlyCredits: 80, usedCredits: 53, cam: 'Bruno Costa', contractEnd: '15/01/2028', since: '15/01/2027', logo: '/favicon.svg' },
];

const AllyoClientsView = () => {
    const [selected, setSelected] = useState<AllyoClient | null>(null);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Seus clientes" />
            <section aria-label="Clientes ativos">
                {clients.map((client) => (
                    <button key={client.id} type="button" onClick={() => setSelected(client)} className={`grid min-h-[78px] w-full grid-cols-[minmax(210px,1.2fr)_120px_140px_180px_150px_18px] items-center gap-[50px] border-b px-5 py-4 text-left transition-colors hover:bg-[#fafbf8] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9db669] sm:px-[30px] max-xl:grid-cols-[minmax(190px,1fr)_120px_160px_130px_18px] max-lg:grid-cols-[minmax(190px,1fr)_140px_130px_18px] max-sm:grid-cols-[1fr_105px_18px] ${ALLYO_BORDER}`}>
                        <span className="flex min-w-0 items-center gap-[10px]">
                            <span className="h-[35px] w-[35px] shrink-0 overflow-hidden rounded-[10px] border border-[#e9e9e9] bg-white dark:border-zinc-700">
                                <img src={client.logo} alt="" className="h-full w-full object-cover" />
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
                    <img src={client.logo} alt="" className="h-14 w-14 rounded-[14px] border border-[#e5e5e5] object-cover dark:border-zinc-700" />
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
                        <span className="font-semibold text-[#739044]">{Math.round((client.usedCredits / client.monthlyCredits) * 100)}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1e5] dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-[#9db669]" style={{ width: `${Math.min(100, (client.usedCredits / client.monthlyCredits) * 100)}%` }} />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#7f7f7f] dark:text-zinc-400">Restam {client.monthlyCredits - client.usedCredits} créditos disponíveis neste ciclo. As peças aprovadas podem ser consultadas no Painel Criativo.</p>
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
