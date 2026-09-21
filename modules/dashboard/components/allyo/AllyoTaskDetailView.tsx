import React, { useRef, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, Clock3, FileImage, FileText, Instagram, Palette, Send, Upload, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ALLYO_BORDER, ALLYO_TASKS, FilterSelect, todayLabel } from './AllyoUI';

interface ManagedFile {
    id: string;
    name: string;
    size: number;
}

const statusOptions = ['Nova', 'Em andamento', 'Em revisão', 'Pronta para entrega', 'Entregue'];
const versionOptions = ['Versão 1', 'Versão 2', 'Versão 3'];

const AllyoTaskDetailView = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const task = ALLYO_TASKS.find((item) => item.id === searchParams.get('task')) || ALLYO_TASKS[0];
    const [status, setStatus] = useState(task.status === 'Iniciar' ? 'Nova' : task.status === 'Concluída' ? 'Entregue' : task.status);
    const [descriptionOpen, setDescriptionOpen] = useState(true);
    const [orderOpen, setOrderOpen] = useState(true);
    const [brandKitOpen, setBrandKitOpen] = useState(false);
    const [deliveryVersion, setDeliveryVersion] = useState('Versão 1');
    const [sourceVersion, setSourceVersion] = useState('Versão 1');
    const [deliveryFiles, setDeliveryFiles] = useState<ManagedFile[]>([]);
    const [sourceFiles, setSourceFiles] = useState<ManagedFile[]>([]);
    const [savedLabel, setSavedLabel] = useState('Alterações salvas automaticamente');

    const goBack = () => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.set('view', 'tasks');
            next.delete('task');
            return next;
        });
    };

    const updateStatus = (nextStatus: string) => {
        setStatus(nextStatus);
        setSavedLabel('Status atualizado agora');
    };

    return (
        <div className="h-full overflow-y-auto bg-white font-sans text-black dark:bg-zinc-950 dark:text-white">
            <header className={`sticky top-0 z-40 flex min-h-[75px] items-center justify-between gap-4 border-b bg-white/95 px-5 py-3 backdrop-blur-sm sm:px-[30px] dark:bg-zinc-950/95 ${ALLYO_BORDER}`}>
                <div className="flex min-w-0 items-center gap-3">
                    <button type="button" onClick={goBack} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] text-black transition hover:border-[#9db669] hover:text-[#739044] dark:border-zinc-700 dark:text-white" aria-label="Voltar para tarefas"><ArrowLeft size={16} /></button>
                    <div className="min-w-0">
                        <h1 className="truncate font-season text-[22px] font-normal leading-tight">{task.name}</h1>
                        <p className="mt-1 truncate text-[11px] font-medium text-[#a4a4a4] sm:text-sm">{task.client} • {task.category} • Redes Sociais • #{task.id}</p>
                    </div>
                </div>
                <div className="hidden shrink-0 items-center gap-[5px] text-sm font-semibold md:flex"><CalendarDays size={18} className="text-[#9f9f9f]" />{todayLabel()}</div>
            </header>

            <section className={`sticky top-[75px] z-30 flex flex-wrap items-center gap-x-6 gap-y-3 border-b bg-white/95 px-5 py-3 backdrop-blur-sm sm:px-[30px] dark:bg-zinc-950/95 ${ALLYO_BORDER}`}>
                <div className="flex items-center gap-[10px]"><span className="text-sm text-[#a4a4a4]">Status</span><FilterSelect label="Status" value={status} options={statusOptions} onChange={updateStatus} includeAll={false} /></div>
                <MetaItem label="Consumo" value="1 crédito" />
                <MetaItem label="Deadline" value={`${task.deadline}, ${task.time}`} icon={<Clock3 size={14} />} />
                <div className="flex items-center gap-[10px]"><span className="text-sm text-[#a4a4a4]">Equipe</span><span className="flex -space-x-2"><Avatar initials="MA" color="bg-[#9db669]" /><Avatar initials="LC" color="bg-[#2a2ad7]" /><Avatar initials="JA" color="bg-[#fd6b32]" /></span></div>
                <span className="ml-auto text-[10px] font-medium text-[#9f9f9f]" aria-live="polite">{savedLabel}</span>
            </section>

            <div className={`flex flex-wrap items-center gap-2 border-b px-5 py-4 text-sm text-[#a4a4a4] sm:px-[30px] ${ALLYO_BORDER}`}>
                <span>Isso é uma solicitação para</span><Tag>Post para Instagram</Tag><span>com</span><Tag>1 entrega</Tag><span>na extensão</span><Tag>PNG</Tag><span>e</span><Tag>1 arquivo aberto</Tag><span>no software</span><Tag>Photoshop</Tag>
            </div>

            <div className="grid min-w-0 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
                <main className={`min-w-0 border-r ${ALLYO_BORDER}`}>
                    <CollapsibleSection title="Descrição" open={descriptionOpen} onToggle={() => setDescriptionOpen((value) => !value)}>
                        <div className="space-y-5 text-sm leading-6 text-[#777] dark:text-zinc-400">
                            <BriefingBlock title="1. Objetivo do criativo" items={['Conversão: levar o público para uma demonstração', 'Comunicar proteção e resposta rápida com clareza']} />
                            <BriefingBlock title="2. Especificações técnicas" items={['Formato principal 1080 × 1350 px para feed', 'Área segura para texto e elementos de interface', 'Arquivo final em PNG e aberto em PSD']} />
                            <BriefingBlock title="3. Identidade visual" items={['Usar paleta e tipografia oficiais do cliente', 'Logo oficial com fundo transparente', 'Manter consistência com os materiais já aprovados']} />
                            <BriefingBlock title="4. Direção de conteúdo" items={['Hierarquia clara entre título, produto e benefício', 'Evitar excesso de informação e garantir leitura no celular', 'CTA visual: “Agende sua demonstração”']} />
                        </div>
                    </CollapsibleSection>

                    <div className={`border-b px-5 py-5 sm:px-[30px] ${ALLYO_BORDER}`}><h2 className="font-season text-lg font-normal">Visualização do pedido</h2></div>
                    <CollapsibleSection title="Post · 1080 × 1350 px" icon={<Instagram size={17} />} open={orderOpen} onToggle={() => setOrderOpen((value) => !value)}>
                        <div className={`grid border ${ALLYO_BORDER} lg:grid-cols-[1.25fr_.75fr]`}>
                            <div className={`p-5 sm:p-[30px] lg:border-r ${ALLYO_BORDER}`}>
                                <h3 className="font-season text-lg font-normal">Copy do criativo</h3>
                                <div className="mt-5 space-y-3 text-sm leading-5 text-[#858585] dark:text-zinc-400">
                                    <p><strong className="text-black dark:text-zinc-200">Tema:</strong> Ver mais é bom. Ter resposta é melhor.</p>
                                    <p><strong className="text-black dark:text-zinc-200">Título:</strong><br />Não é só ver. É poder agir.</p>
                                    <p><strong className="text-black dark:text-zinc-200">Visual:</strong><br />Câmera em destaque em um ambiente residencial real, com clima de rotina e proteção.</p>
                                    <p><strong className="text-black dark:text-zinc-200">Copy de apoio:</strong><br />A Câmera ajuda a acompanhar o ambiente e integra um sistema conectado à Central de Monitoramento 24h.</p>
                                </div>
                            </div>
                            <div>
                                <Specification label="Dimensões" value="1080 × 1350" />
                                <Specification label="Software" value="Photoshop" icon={<Palette size={16} />} />
                                <Specification label="Extensão" value="PNG" icon={<FileImage size={16} />} last />
                            </div>
                        </div>
                    </CollapsibleSection>

                    <UploadRow label="Arquivo para aprovação" version={deliveryVersion} onVersionChange={setDeliveryVersion} files={deliveryFiles} onFilesChange={setDeliveryFiles} accept=".png,.jpg,.jpeg,.pdf" />
                    <UploadRow label="Arquivo aberto" version={sourceVersion} onVersionChange={setSourceVersion} files={sourceFiles} onFilesChange={setSourceFiles} accept=".psd,.ai,.fig,.zip" />
                </main>

                <aside className="min-w-0 bg-[#fdfdfc] dark:bg-zinc-950">
                    <div className="sticky top-[139px]">
                        <div className={`border-b p-5 ${ALLYO_BORDER}`}>
                            <span className="text-[9px] font-bold uppercase tracking-[.08em] text-[#9db669]">Próxima ação</span>
                            <h2 className="mt-2 font-season text-xl font-normal">Produzir a primeira versão</h2>
                            <p className="mt-2 text-xs leading-5 text-[#7f7f7f] dark:text-zinc-400">Revise o briefing, faça o upload da peça e envie para a revisão interna.</p>
                            <button type="button" onClick={() => updateStatus('Em revisão')} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#131f15] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#283d2b]"><Send size={14} /> Enviar para revisão</button>
                        </div>
                        <SideRow label="Referências de tarefas"><Tag>#123456</Tag><Tag>#123982</Tag></SideRow>
                        <SideRow label="Arquivos para tarefa"><FileBadge label="PNG" /><FileBadge label="PDF" /><FileBadge label="ZIP" /></SideRow>
                        <button type="button" onClick={() => setBrandKitOpen((value) => !value)} className={`flex w-full items-center justify-between border-b p-5 text-left ${ALLYO_BORDER}`}><span className="font-season text-base">Brand Kit</span>{brandKitOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
                        {brandKitOpen && <div className={`border-b px-5 py-4 text-xs leading-5 text-[#7f7f7f] dark:text-zinc-400 ${ALLYO_BORDER}`}><p>Logo principal e negativo</p><p>Paleta: verde, grafite e branco</p><p>Tipografia: Plus Jakarta Sans</p></div>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const MetaItem = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => <div className="flex items-center gap-[10px] text-sm"><span className="text-[#a4a4a4]">{label}</span><strong className="flex items-center gap-1.5 font-medium text-black dark:text-white">{icon}{value}</strong></div>;
const Avatar = ({ initials, color }: { initials: string; color: string }) => <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white dark:border-zinc-950 ${color}`}>{initials}</span>;
const Tag = ({ children }: { children: React.ReactNode }) => <span className="inline-flex rounded-[4px] border border-[#c2c2c2] bg-white px-1.5 py-1 text-[10px] font-medium leading-none text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">{children}</span>;

const CollapsibleSection = ({ title, icon, open, onToggle, children }: { title: string; icon?: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode }) => (
    <section className={`border-b ${ALLYO_BORDER}`}>
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left sm:px-[30px]"><span className="flex items-center gap-[10px] font-season text-lg font-normal">{icon}{title}</span>{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>
        {open && <div className="px-5 pb-6 sm:px-[30px]">{children}</div>}
    </section>
);

const BriefingBlock = ({ title, items }: { title: string; items: string[] }) => <div><h3 className="font-semibold text-black dark:text-zinc-200">{title}</h3><ul className="mt-1 list-disc pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;

const Specification = ({ label, value, icon, last = false }: { label: string; value: string; icon?: React.ReactNode; last?: boolean }) => <div className={`flex min-h-[70px] items-center justify-between gap-4 px-5 ${last ? '' : `border-b ${ALLYO_BORDER}`}`}><span className="text-xs text-[#a4a4a4]">{label}</span><strong className="flex items-center gap-2 text-xs font-medium">{icon}{value}</strong></div>;

const UploadRow = ({ label, version, onVersionChange, files, onFilesChange, accept }: { label: string; version: string; onVersionChange: (value: string) => void; files: ManagedFile[]; onFilesChange: (files: ManagedFile[]) => void; accept: string }) => (
    <div className={`grid gap-4 border-b px-5 py-5 sm:px-[30px] lg:grid-cols-[210px_minmax(0,1fr)] lg:items-start ${ALLYO_BORDER}`}>
        <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-[#a4a4a4]">{label}</span><FilterSelect label="Versão" value={version} options={versionOptions} onChange={onVersionChange} includeAll={false} /></div>
        <UploadZone files={files} onFilesChange={onFilesChange} accept={accept} />
    </div>
);

const UploadZone = ({ files, onFilesChange, accept }: { files: ManagedFile[]; onFilesChange: (files: ManagedFile[]) => void; accept: string }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        const next = Array.from(incoming).map((file) => ({ id: `${file.name}-${file.lastModified}-${file.size}`, name: file.name, size: file.size }));
        onFilesChange([...files.filter((file) => !next.some((item) => item.id === file.id)), ...next]);
    };

    return (
        <div>
            <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }} className="flex min-h-[68px] w-full items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#cdd4c0] px-4 py-4 text-center text-xs font-semibold transition hover:border-[#9db669] hover:bg-[#fafcf6] dark:border-zinc-700 dark:hover:border-[#d0f08e] dark:hover:bg-zinc-900"><Upload size={18} className="text-[#9db669]" /> Arraste e solte ou clique para acessar seus arquivos</button>
            <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
            {files.length > 0 && <div className="mt-2 space-y-1.5">{files.map((file) => <div key={file.id} className="flex items-center gap-2 rounded-lg bg-[#f7f8f5] px-3 py-2 text-xs dark:bg-zinc-900"><FileText size={14} className="text-[#9db669]" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="text-[9px] text-[#9f9f9f]">{formatFileSize(file.size)}</span><button type="button" onClick={() => onFilesChange(files.filter((item) => item.id !== file.id))} className="text-[#9f9f9f] hover:text-red-500" aria-label={`Remover ${file.name}`}><X size={13} /></button></div>)}</div>}
        </div>
    );
};

const formatFileSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const SideRow = ({ label, children }: { label: string; children: React.ReactNode }) => <div className={`flex items-center justify-between gap-4 border-b p-5 ${ALLYO_BORDER}`}><span className="text-xs text-[#a4a4a4]">{label}</span><span className="flex items-center gap-1.5">{children}</span></div>;
const FileBadge = ({ label }: { label: string }) => <span className="flex h-8 w-8 items-center justify-center rounded-[5px] border border-[#c2c2c2] bg-white text-[8px] font-bold text-[#2a2ad7] dark:border-zinc-700 dark:bg-zinc-900">{label}</span>;

export default AllyoTaskDetailView;
