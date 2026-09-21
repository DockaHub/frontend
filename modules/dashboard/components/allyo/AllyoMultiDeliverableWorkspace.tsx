import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, FileText, Images, Layers3, PackageOpen } from 'lucide-react';
import type { AllyoDeliverable } from './AllyoUI';
import { ALLYO_BORDER, FilterSelect } from './AllyoUI';
import { FileSlot, type ManagedFile } from './AllyoDeliveryWorkspaces';

const VERSION_OPTIONS = ['Versão 1', 'Versão 2', 'Versão 3', 'Versão 4'];

type ApprovalFilesByItem = Record<string, Record<string, ManagedFile[]>>;

interface AllyoMultiDeliverableWorkspaceProps {
    deliverables: AllyoDeliverable[];
    onProgressChange?: (ready: number, total: number) => void;
}

const AllyoMultiDeliverableWorkspace = ({ deliverables, onProgressChange }: AllyoMultiDeliverableWorkspaceProps) => {
    const [openItems, setOpenItems] = useState<string[]>(deliverables[0] ? [deliverables[0].id] : []);
    const [activeScenes, setActiveScenes] = useState<Record<string, number>>({});
    const [versions, setVersions] = useState<Record<string, string>>(() => Object.fromEntries(deliverables.map((item) => [item.id, 'Versão 1'])));
    const [approvalFiles, setApprovalFiles] = useState<ApprovalFilesByItem>({});
    const [sourceFiles, setSourceFiles] = useState<ManagedFile[]>([]);
    const [sourceAssociations, setSourceAssociations] = useState<Record<string, string>>({});

    const readyCount = useMemo(() => deliverables.filter((item) => {
        const version = versions[item.id] || 'Versão 1';
        return (approvalFiles[item.id]?.[version] || []).length > 0;
    }).length, [approvalFiles, deliverables, versions]);

    useEffect(() => {
        onProgressChange?.(readyCount, deliverables.length);
    }, [deliverables.length, onProgressChange, readyCount]);

    const toggleItem = (itemId: string) => {
        setOpenItems((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
    };

    const updateApprovalFiles = (itemId: string, files: ManagedFile[]) => {
        const version = versions[itemId] || 'Versão 1';
        setApprovalFiles((current) => ({
            ...current,
            [itemId]: { ...(current[itemId] || {}), [version]: files },
        }));
    };

    const updateSourceFiles = (files: ManagedFile[]) => {
        setSourceFiles(files);
        const activeIds = new Set(files.map((file) => file.id));
        setSourceAssociations((current) => Object.fromEntries(Object.entries(current).filter(([fileId]) => activeIds.has(fileId))));
    };

    const associationOptions = ['Todos os pedidos', ...deliverables.map((item, index) => `Pedido ${index + 1} · ${item.title}`)];
    const progress = deliverables.length ? (readyCount / deliverables.length) * 100 : 0;

    return (
        <div>
            <section className={`border-b px-5 py-5 sm:px-[30px] ${ALLYO_BORDER}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#829454]">Progresso da entrega</span>
                        <p className="mt-1.5 text-sm font-semibold">{readyCount} de {deliverables.length} pedidos prontos para revisão</p>
                    </div>
                    <div className="h-2 w-full max-w-[260px] overflow-hidden rounded-full bg-[#eef0ea] dark:bg-zinc-800">
                        <span className="block h-full rounded-full bg-[#9db669] transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </section>

            <div className="space-y-3 p-3 sm:p-5">
                {deliverables.map((item, itemIndex) => {
                    const isOpen = openItems.includes(item.id);
                    const activeSceneIndex = Math.min(activeScenes[item.id] || 0, item.scenes.length - 1);
                    const activeScene = item.scenes[activeSceneIndex];
                    const version = versions[item.id] || 'Versão 1';
                    const files = approvalFiles[item.id]?.[version] || [];
                    const isReady = files.length > 0;

                    return (
                        <section key={item.id} className={`rounded-[14px] border ${isReady ? 'border-[#b9c99a]' : ALLYO_BORDER}`}>
                            <button type="button" onClick={() => toggleItem(item.id)} className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5">
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] ${isReady ? 'bg-[#edf4df] text-[#72844d] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]' : 'bg-[#f3f3f1] text-[#8c8c87] dark:bg-zinc-900'}`}>
                                    {item.type === 'Carrossel' ? <Images size={18} /> : <FileText size={17} />}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[10px] font-bold uppercase tracking-[.08em] text-[#999]">Pedido {itemIndex + 1} · {item.type}</span>
                                    <strong className="mt-1 block truncate text-sm font-semibold">{item.title}</strong>
                                    <small className="mt-1 block text-[11px] text-[#888]">{item.format} · {item.scenes.length} {item.scenes.length === 1 ? 'peça' : 'cards'}</small>
                                </span>
                                <span className={`hidden rounded-full px-3 py-1.5 text-[11px] font-semibold sm:inline-flex ${isReady ? 'bg-[#edf4df] text-[#657743] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]' : 'bg-[#f3f3f3] text-[#888] dark:bg-zinc-900'}`}>
                                    {isReady ? 'Pronto para revisão' : 'Pendente'}
                                </span>
                                {isOpen ? <ChevronUp size={16} className="shrink-0 text-[#888]" /> : <ChevronDown size={16} className="shrink-0 text-[#888]" />}
                            </button>

                            {isOpen && activeScene && (
                                <div className={`border-t ${ALLYO_BORDER}`}>
                                    {item.scenes.length > 1 && (
                                        <div className={`flex gap-2 overflow-x-auto border-b px-4 py-3 sm:px-5 ${ALLYO_BORDER}`}>
                                            {item.scenes.map((scene, sceneIndex) => (
                                                <button key={scene.id} type="button" onClick={() => setActiveScenes((current) => ({ ...current, [item.id]: sceneIndex }))} className={`flex h-9 min-w-9 items-center justify-center rounded-[7px] border px-3 text-xs font-semibold transition ${sceneIndex === activeSceneIndex ? 'border-[#9db669] bg-[#f3f7ea] text-[#72844d] dark:bg-[#d0f08e]/10' : 'border-[#dedede] text-[#777] hover:border-[#b9ca94] dark:border-zinc-700'}`}>
                                                    {sceneIndex + 1}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
                                        <div className={`p-5 lg:border-r ${ALLYO_BORDER}`}>
                                            <span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#9db669]">{activeScene.label}</span>
                                            <h3 className="mt-3 font-season text-xl leading-tight">{activeScene.title}</h3>
                                            <p className="mt-3 max-w-xl text-[13px] leading-6 text-[#777] dark:text-zinc-400">{activeScene.copy}</p>
                                            <div className="mt-5 grid gap-3 text-xs sm:grid-cols-3">
                                                <Specification label="Dimensões" value={item.format} />
                                                <Specification label="Software" value={item.software} />
                                                <Specification label="Extensão" value={item.approvalFormat} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center bg-[#f8f8f6] p-5 dark:bg-zinc-900/50">
                                            <div className="flex aspect-[4/5] w-full max-w-[170px] flex-col justify-between overflow-hidden rounded-[12px] border border-[#dedede] bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950">
                                                <span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#9db669]">ALLYO</span>
                                                <div><span className="font-season text-4xl text-[#dfe7cf]">{String(activeSceneIndex + 1).padStart(2, '0')}</span><p className="mt-3 text-sm font-semibold leading-tight">{activeScene.title}</p></div>
                                                <span className="h-1 w-10 rounded-full bg-[#9db669]" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`border-t p-4 sm:p-5 ${ALLYO_BORDER}`}>
                                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                            <div><span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#999]">Entrega deste pedido</span><p className="mt-1 text-xs text-[#777]">A versão e a aprovação são independentes das demais peças.</p></div>
                                            <FilterSelect label="Versão" value={version} options={VERSION_OPTIONS} onChange={(value) => setVersions((current) => ({ ...current, [item.id]: value }))} includeAll={false} />
                                        </div>
                                        <FileSlot
                                            icon={<CheckCircle2 size={17} />}
                                            title="Arquivo para aprovação deste pedido"
                                            description={`Material que o cliente irá visualizar · ${item.approvalFormat}`}
                                            files={files}
                                            onFilesChange={(nextFiles) => updateApprovalFiles(item.id, nextFiles)}
                                            accept=".png,.jpg,.jpeg,.pdf"
                                        />
                                    </div>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>

            <section className={`border-y ${ALLYO_BORDER}`}>
                <div className={`flex items-start gap-3 border-b px-5 py-5 sm:px-[30px] ${ALLYO_BORDER}`}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-[#eef3e4] text-[#798d50] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]"><PackageOpen size={18} /></span>
                    <div><span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#829454]">Pacote final da tarefa</span><h2 className="mt-1 font-season text-lg">Arquivos editáveis</h2><p className="mt-1.5 text-xs leading-5 text-[#888]">Envie uma única pasta, ZIP, link exportado ou vários arquivos e indique a quais pedidos pertencem.</p></div>
                </div>
                <div className="p-5 sm:p-[30px]">
                    <FileSlot icon={<Layers3 size={17} />} title="Arquivos abertos e editáveis" description="PSD, AI, FIG ou ZIP · obrigatórios para concluir a tarefa" files={sourceFiles} onFilesChange={updateSourceFiles} accept=".psd,.ai,.fig,.zip,.indd,.sketch" />

                    {sourceFiles.length > 0 && (
                        <div className={`mt-4 rounded-[12px] border ${ALLYO_BORDER}`}>
                            <div className={`border-b bg-[#fafbf8] px-4 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#888] dark:bg-zinc-900 ${ALLYO_BORDER}`}>Associação dos arquivos</div>
                            {sourceFiles.map((file) => (
                                <div key={file.id} className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0 ${ALLYO_BORDER}`}>
                                    <span className="min-w-0 flex-1 truncate text-xs font-medium">{file.name}</span>
                                    <FilterSelect label="Pertence a" value={sourceAssociations[file.id] || 'Todos os pedidos'} options={associationOptions} onChange={(value) => setSourceAssociations((current) => ({ ...current, [file.id]: value }))} includeAll={false} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

const Specification = ({ label, value }: { label: string; value: string }) => (
    <span className={`rounded-[9px] border px-3 py-2.5 ${ALLYO_BORDER}`}>
        <small className="block text-[9px] font-bold uppercase tracking-[.06em] text-[#999]">{label}</small>
        <strong className="mt-1 block truncate font-medium">{value}</strong>
    </span>
);

export default AllyoMultiDeliverableWorkspace;
