import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Layers3, Palette, UserRound } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { ALLYO_BORDER, AllyoPageHeader, FilterSelect, numericTaskId } from './AllyoUI';
import { allyoService } from '../../../../services/allyoService';

interface CreativeAsset {
    id: string;
    taskId: string;
    taskPublicId: string;
    taskName: string;
    client: string;
    designer: string;
    specialty: string;
    versions: number;
    approvedVersion: number;
    approvedAt: string;
    format: string;
    image: string;
    avatar?: string;
}

const AllyoCreativePanelView = () => {
    const [client, setClient] = useState('Todos');
    const [selected, setSelected] = useState<CreativeAsset | null>(null);
    const [creatives, setCreatives] = useState<CreativeAsset[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        allyoService.getDemands()
            .then((res) => {
                if (res && Array.isArray(res.demands)) {
                    const list: CreativeAsset[] = [];
                    res.demands.forEach((d) => {
                        if (d.designs && d.designs.length > 0) {
                            d.designs.forEach((design) => {
                                const relatedTask = d.tasksList?.find((task) => task.id === design.taskId) || d.tasksList?.[0];
                                list.push({
                                    id: String(design.id),
                                    taskId: relatedTask?.id || d.id,
                                    taskPublicId: numericTaskId(relatedTask?.id || d.id),
                                    taskName: `${d.name} — ${design.name}`,
                                    client: d.workspace?.name || 'Cliente Allyo',
                                    designer: d.team?.[0] || 'Levy Camará',
                                    specialty: d.service || 'Design',
                                    versions: d.designsCount || 1,
                                    approvedVersion: design.approved ? 1 : 0,
                                    approvedAt: new Date(design.createdAt || d.updatedAt).toLocaleDateString('pt-BR'),
                                    format: 'Design • Digital',
                                    image: design.thumbnailUrl || design.fileUrl || '/brands/allyo/creative-card.png',
                                    avatar: '/brands/allyo/creative-designer-avatar.png',
                                });
                            });
                        }
                    });
                    setCreatives(list);
                }
            })
            .catch((err) => console.warn('[AllyoCreativePanelView] Erro ao carregar criativos:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const clientsList = useMemo(() => {
        const uniqueClients = Array.from(new Set(creatives.map((c) => c.client).filter(Boolean)));
        return ['Todos', ...uniqueClients];
    }, [creatives]);

    const visibleCreatives = useMemo(() => {
        if (client === 'Todos') return creatives;
        return creatives.filter((c) => c.client === client);
    }, [client, creatives]);

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <AllyoPageHeader title="Painel Criativo" />

            <div className={`relative z-30 flex min-h-[71px] flex-wrap items-center gap-[10px] border-b px-5 py-4 sm:px-[30px] ${ALLYO_BORDER}`}>
                <span className="mr-1 text-sm font-medium">Filtros</span>
                <FilterSelect label="Selecione um cliente" value={client} options={clientsList} onChange={setClient} />
                <span className="ml-auto text-[10px] font-semibold text-[#9f9f9f]">{visibleCreatives.length} criativos no histórico</span>
            </div>

            <main className="p-5 sm:p-[30px]">
                {visibleCreatives.length > 0 && (
                    <div className="grid grid-cols-1 gap-[10px] min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                        {visibleCreatives.map((creative) => (
                            <button
                                key={creative.id}
                                type="button"
                                onClick={() => setSelected(creative)}
                                className="group relative aspect-square min-w-0 overflow-hidden rounded-[10px] bg-[#142320] text-left shadow-sm outline-none transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(19,31,21,.16)] focus-visible:ring-2 focus-visible:ring-[#9db669] focus-visible:ring-offset-2"
                            >
                                <img src={creative.image} alt={creative.taskName} className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.025]" />
                                <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                <span className="absolute bottom-[10px] left-[10px] flex h-[28px] max-w-[calc(100%-20px)] items-center gap-[7px] rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-[0_2px_8px_rgba(0,0,0,.18)]">
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#003f35] text-[9px] font-bold text-white">
                                        {creative.designer.slice(0, 2).toUpperCase()}
                                    </span>
                                    <span className="truncate text-[9px] font-semibold text-black">{creative.designer}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {!isLoading && visibleCreatives.length === 0 && (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                        <strong className="text-sm font-semibold">Nenhum criativo no histórico</strong>
                        <span className="mt-2 text-xs text-[#7f7f7f]">As versões e designs submetidos nas demandas aparecerão aqui organizados por cliente.</span>
                    </div>
                )}
            </main>

            <CreativeDetailsModal creative={selected} onClose={() => setSelected(null)} />
        </div>
    );
};

const CreativeDetailsModal = ({ creative, onClose }: { creative: CreativeAsset | null; onClose: () => void }) => (
    <Modal isOpen={Boolean(creative)} onClose={onClose} title="Detalhes do criativo" size="xl">
        {creative && (
            <div className="grid gap-6 md:grid-cols-[minmax(280px,1.05fr)_minmax(280px,.95fr)]">
                <div>
                    <div className="overflow-hidden rounded-[14px] bg-[#142320]">
                        <img src={creative.image} alt={creative.taskName} className="aspect-square w-full object-cover" />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-[#7f7f7f] dark:text-zinc-400">
                        <span>{creative.format}</span>
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={13} /> {creative.approvedVersion > 0 ? 'Aprovado' : 'Em revisão'}</span>
                    </div>
                </div>

                <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#9db669]">{creative.client}</span>
                    <h2 className="mt-2 font-season text-[28px] font-normal leading-tight text-black dark:text-white">{creative.taskName}</h2>
                    <p className="mt-2 font-mono text-[11px] text-[#9f9f9f]">ID da tarefa #{creative.taskPublicId}</p>

                    <div className={`mt-6 grid grid-cols-2 border-y ${ALLYO_BORDER}`}>
                        <Detail icon={<UserRound size={16} />} label="DESIGNER RESPONSÁVEL" value={creative.designer} detail={creative.specialty} />
                        <Detail icon={<Layers3 size={16} />} label="VERSÕES FEITAS" value={`${creative.versions} ${creative.versions === 1 ? 'versão' : 'versões'}`} detail={creative.approvedVersion > 0 ? `Aprovada na ${creative.approvedVersion}ª versão` : 'Aguardando aprovação'} borderLeft />
                        <Detail icon={<Clock3 size={16} />} label="DATA DE ENVIO" value={creative.approvedAt} detail={creative.approvedVersion > 0 ? 'Aprovado pelo cliente' : 'Em análise'} />
                        <Detail icon={<Palette size={16} />} label="FORMATO" value={creative.format.split(' • ')[0]} detail={creative.format.split(' • ')[1]} borderLeft />
                    </div>

                    <div className="mt-6 rounded-[14px] border border-[#dce7c4] bg-[#f7faef] p-4 dark:border-[#d0f08e]/20 dark:bg-[#d0f08e]/5">
                        <h3 className="text-xs font-semibold text-[#647440] dark:text-[#d0f08e]">Histórico da peça</h3>
                        <p className="mt-2 text-xs leading-5 text-[#72805a] dark:text-zinc-400">
                            {creative.approvedVersion > 0
                                ? `Esta peça foi aprovada na ${creative.approvedVersion}ª versão. O histórico ajuda o time criativo a entender as escolhas visuais e o padrão de aprovação deste cliente.`
                                : 'Esta peça foi enviada para o cliente e está em processo de revisão.'}
                        </p>
                    </div>
                </div>
            </div>
        )}
    </Modal>
);

const Detail = ({ icon, label, value, detail, borderLeft = false }: { icon: React.ReactNode; label: string; value: string; detail: string; borderLeft?: boolean }) => (
    <div className={`min-w-0 px-3 py-4 first:pl-0 even:pr-0 ${borderLeft ? 'border-l border-[#e5e5e5] pl-4 dark:border-zinc-800' : ''}`}>
        <span className="flex items-center gap-2 text-[#9db669]">{icon}<span className="text-[9px] font-bold tracking-[.04em] text-[#7f7f7f] dark:text-zinc-500">{label}</span></span>
        <strong className="mt-3 block truncate text-sm font-semibold text-black dark:text-white">{value}</strong>
        <span className="mt-1 block truncate text-[10px] text-[#9f9f9f]">{detail}</span>
    </div>
);

export default AllyoCreativePanelView;
