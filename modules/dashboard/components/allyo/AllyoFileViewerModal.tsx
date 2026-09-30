import { Download, FileArchive, FileText } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { downloadAllyoFile, resolveAllyoFileUrl } from './allyoFileDownload';

export interface AllyoPreviewFile {
    name: string;
    url: string;
    contentType?: string;
    sizeLabel?: string;
}

const fileKind = (file: AllyoPreviewFile) => {
    const name = file.name.toLowerCase().split('?')[0];
    const url = file.url.toLowerCase().split('?')[0];
    const matches = (pattern: RegExp) => pattern.test(name) || pattern.test(url);
    if (file.contentType?.startsWith('image/') || matches(/\.(png|jpe?g|webp|gif|svg)$/)) return 'image';
    if (file.contentType?.startsWith('video/') || matches(/\.(mp4|mov|webm)$/)) return 'video';
    if (file.contentType === 'application/pdf' || matches(/\.pdf$/)) return 'pdf';
    if (matches(/\.(txt|md|csv)$/)) return 'document';
    if (matches(/\.(zip|rar|7z)$/)) return 'archive';
    return 'unsupported';
};

const AllyoFileViewerModal = ({ file, onClose }: { file: AllyoPreviewFile | null; onClose: () => void }) => {
    const url = file ? resolveAllyoFileUrl(file.url) : '';
    const kind = file ? fileKind(file) : 'unsupported';

    return (
        <Modal
            isOpen={Boolean(file)}
            onClose={onClose}
            title={file?.name || 'Visualizar arquivo'}
            size="2xl"
            footer={file ? <button type="button" onClick={() => void downloadAllyoFile(file.url, file.name)} className="inline-flex items-center gap-2 rounded-full bg-[#172019] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#28372b]"><Download size={13} /> Baixar arquivo</button> : undefined}
        >
            {file && (
                <div className="flex min-h-[520px] items-center justify-center overflow-hidden rounded-[14px] border border-[#e1e4df] bg-[#f1f3ef] p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
                    {kind === 'image' && <img src={url} alt={file.name} className="max-h-[620px] max-w-full rounded-[10px] object-contain shadow-xl" />}
                    {kind === 'video' && <video src={url} controls className="max-h-[620px] max-w-full rounded-[10px] shadow-xl" />}
                    {(kind === 'pdf' || kind === 'document') && <iframe src={url} title={`Visualização de ${file.name}`} className="h-[620px] w-full rounded-[10px] bg-white shadow-xl" />}
                    {(kind === 'archive' || kind === 'unsupported') && (
                        <div className="flex max-w-sm flex-col items-center text-center text-[#737a73] dark:text-zinc-300">
                            <span className="flex h-20 w-20 items-center justify-center rounded-[18px] bg-white text-[#78866d] shadow-sm dark:bg-zinc-900">{kind === 'archive' ? <FileArchive size={32} /> : <FileText size={32} />}</span>
                            <strong className="mt-5 text-sm">Prévia indisponível para este formato</strong>
                            <p className="mt-2 text-xs leading-5 text-[#858c84]">O arquivo continua protegido dentro da tarefa. Use “Baixar arquivo” para abri-lo no aplicativo compatível.</p>
                            {file.sizeLabel && <span className="mt-3 text-[10px] font-semibold uppercase tracking-[.08em] text-[#9aa098]">{file.sizeLabel}</span>}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default AllyoFileViewerModal;
