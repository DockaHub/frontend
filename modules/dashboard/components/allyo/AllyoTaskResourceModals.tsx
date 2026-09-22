import { Download, ExternalLink, FileArchive, FileText, Grid2X2, ImageIcon, Info, Play, Sparkles } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { ALLYO_BORDER, ALLYO_TASKS } from './AllyoUI';
import type { AllyoTaskAttachment, AllyoTaskReference } from './allyoTaskResourceData';

export const ReferenceTaskModal = ({ reference, onClose, onOpenTask }: { reference: AllyoTaskReference | null; onClose: () => void; onOpenTask: (taskId: string) => void }) => {
    const linkedTask = reference?.linkedTaskId ? ALLYO_TASKS.find((task) => task.id === reference.linkedTaskId) : undefined;
    return <Modal isOpen={Boolean(reference)} onClose={onClose} title="Tarefa de referência" size="lg" footer={<><button type="button" onClick={onClose} className="rounded-full border border-[#d9ddd7] px-4 py-2 text-xs font-semibold dark:border-zinc-700">Fechar</button>{reference?.linkedTaskId && <button type="button" onClick={() => { onClose(); onOpenTask(reference.linkedTaskId!); }} className="inline-flex items-center gap-2 rounded-full bg-[#172019] px-4 py-2 text-xs font-semibold text-white"><ExternalLink size={13} /> Abrir tarefa completa</button>}</>}>
        {reference && <div>
            <div className={`rounded-[14px] border bg-[#fbfcf9] p-5 dark:bg-zinc-950 ${ALLYO_BORDER}`}>
                <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#eaf2dd] text-[#71854e] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]"><Grid2X2 size={17} /></span><div className="min-w-0"><span className="inline-flex rounded-full bg-[#eaf4dd] px-2 py-1 text-[9px] font-bold text-[#617740]">Concluída</span><h2 className="mt-2 font-season text-xl">{reference.title}</h2><p className="mt-1 text-xs text-[#838983]">#{reference.id} · {reference.category}</p></div></div>
                <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-[#e2e5df] bg-[#e2e5df] sm:grid-cols-4 dark:border-zinc-700 dark:bg-zinc-700"><ReferenceMetric label="Cliente" value={linkedTask?.client || 'Mesmo cliente'} /><ReferenceMetric label="Projeto" value={linkedTask?.projectName || 'Projeto anterior'} /><ReferenceMetric label="Criativo" value={linkedTask?.creative || 'Equipe Allyo'} /><ReferenceMetric label="Entrega" value={linkedTask?.deadline || 'Histórico'} /></div>
            </div>
            <div className="mt-4 rounded-[12px] border border-[#e4e6e2] p-5 dark:border-zinc-800"><span className="text-[10px] font-bold uppercase tracking-[.08em] text-[#869268]">Como usar esta referência</span><p className="mt-2 text-sm leading-6 text-[#626a63] dark:text-zinc-400">Consulte a solução aprovada, a linguagem visual e a organização da entrega anterior. Esta referência não altera o conteúdo da tarefa atual.</p></div>
        </div>}
    </Modal>;
};

export const TaskFilePreviewModal = ({ file, onClose }: { file: AllyoTaskAttachment | null; onClose: () => void }) => {
    const previewType = file ? getPreviewType(file.extension) : 'document';
    const generatedPreview = file ? ['AI', 'INDD', 'PSD', 'DOCX', 'XLSX', 'PPTX'].includes(file.extension) : false;
    return <Modal isOpen={Boolean(file)} onClose={onClose} title={file?.name || 'Visualizar arquivo'} size="2xl" footer={<><button type="button" onClick={onClose} className="rounded-full border border-[#d9ddd7] px-4 py-2 text-xs font-semibold dark:border-zinc-700">Fechar</button>{file?.downloadUrl ? <a href={file.downloadUrl} download={file.name} className="inline-flex items-center gap-2 rounded-full bg-[#172019] px-4 py-2 text-xs font-semibold text-white"><Download size={13} /> Baixar arquivo</a> : <button type="button" disabled title="Disponível quando o arquivo estiver conectado ao armazenamento" className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-[#172019] px-4 py-2 text-xs font-semibold text-white opacity-40"><Download size={13} /> Baixar arquivo</button>}</>}>
        {file && <div className="grid min-h-[520px] overflow-hidden rounded-[14px] border border-[#e1e4df] lg:grid-cols-[minmax(0,1fr)_250px] dark:border-zinc-800">
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-[#f1f3ef] p-6 dark:bg-zinc-950">
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#bfc6ba 0.75px, transparent 0.75px)', backgroundSize: '18px 18px' }} />
                {file.previewUrl ? previewType === 'video' ? <video src={file.previewUrl} controls className="relative max-h-[470px] max-w-full rounded-[10px] shadow-xl" /> : previewType === 'image' ? <img src={file.previewUrl} alt={file.name} className="relative max-h-[470px] max-w-full rounded-[10px] object-contain shadow-xl" /> : <iframe src={file.previewUrl} title={`Prévia de ${file.name}`} className="relative h-[470px] w-full rounded-[10px] bg-white shadow-xl" /> : <MockPreview file={file} type={previewType} generated={generatedPreview} />}
            </div>
            <aside className="border-t bg-white p-5 lg:border-l lg:border-t-0 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#879087]"><Info size={13} /> Detalhes do arquivo</div>
                <dl className="mt-6 space-y-5"><FileDetail label="Formato" value={file.extension} /><FileDetail label="Tamanho" value={file.size} /><FileDetail label="Uso na tarefa" value={file.purpose} /><FileDetail label="Enviado por" value="Cliente" /><FileDetail label="Visualização" value={generatedPreview ? 'Prévia processada' : previewType === 'archive' ? 'Não disponível' : 'Disponível'} /></dl>
                {generatedPreview && <div className="mt-6 rounded-[10px] bg-[#eef3e4] p-3 text-[10px] leading-4 text-[#637047] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]"><span className="flex items-center gap-1.5 font-bold"><Sparkles size={12} /> Prévia Allyo</span><p className="mt-1">O arquivo original é convertido em PDF ou imagem para consulta, sem alterar o arquivo enviado.</p></div>}
            </aside>
        </div>}
    </Modal>;
};

const MockPreview = ({ file, type, generated }: { file: AllyoTaskAttachment; type: ReturnType<typeof getPreviewType>; generated: boolean }) => {
    if (type === 'video') return <div className="relative flex aspect-video w-full max-w-[680px] items-center justify-center rounded-[12px] bg-[#172019] shadow-xl"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 pl-1 text-[#172019]"><Play size={22} fill="currentColor" /></span><span className="absolute inset-x-5 bottom-4 h-1 rounded-full bg-white/20"><span className="block h-full w-1/3 rounded-full bg-[#d0f08e]" /></span></div>;
    if (type === 'archive') return <div className="relative flex flex-col items-center text-center text-[#737a73]"><span className="flex h-24 w-24 items-center justify-center rounded-[20px] bg-white shadow-sm dark:bg-zinc-900"><FileArchive size={38} /></span><strong className="mt-5 text-sm">Este pacote não possui visualização</strong><p className="mt-2 max-w-xs text-xs leading-5">Baixe o ZIP para acessar os arquivos contidos nele.</p></div>;
    if (type === 'image') return <div className="relative aspect-[4/3] w-full max-w-[620px] overflow-hidden rounded-[12px] bg-gradient-to-br from-[#172019] via-[#536642] to-[#d0f08e] shadow-xl"><div className="absolute inset-8 rounded-[10px] border border-white/25" /><span className="absolute bottom-8 left-8 font-season text-3xl text-white">Referência visual</span></div>;
    return <div className="relative flex aspect-[4/5] max-h-[470px] w-full max-w-[370px] flex-col rounded-[7px] bg-white p-8 shadow-xl dark:bg-zinc-900"><span className="text-[9px] font-bold uppercase tracking-[.12em] text-[#889477]">{generated ? 'Prévia processada pela Allyo' : file.extension}</span><h3 className="mt-8 font-season text-2xl leading-tight">{file.name.replace(/\.[^.]+$/, '')}</h3><div className="mt-8 space-y-3"><span className="block h-2 w-full rounded bg-[#e7e9e4] dark:bg-zinc-700" /><span className="block h-2 w-4/5 rounded bg-[#e7e9e4] dark:bg-zinc-700" /><span className="block h-2 w-11/12 rounded bg-[#e7e9e4] dark:bg-zinc-700" /><span className="mt-7 block h-28 rounded bg-[#eef3e4] dark:bg-zinc-800" /></div><span className="mt-auto text-[10px] text-[#969c96]">Visualização · {file.extension}</span></div>;
};

const ReferenceMetric = ({ label, value }: { label: string; value: string }) => <div className="min-w-0 bg-white p-3 dark:bg-zinc-900"><dt className="text-[9px] font-bold uppercase text-[#959b95]">{label}</dt><dd className="mt-1.5 truncate text-xs font-semibold">{value}</dd></div>;
const FileDetail = ({ label, value }: { label: string; value: string }) => <div><dt className="text-[10px] text-[#969c96]">{label}</dt><dd className="mt-1 text-xs font-semibold">{value}</dd></div>;
const getPreviewType = (extension: string) => ['MP4', 'MOV', 'WEBM'].includes(extension) ? 'video' as const : ['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(extension) ? 'image' as const : extension === 'ZIP' ? 'archive' as const : 'document' as const;
