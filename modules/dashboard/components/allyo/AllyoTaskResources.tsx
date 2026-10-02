import { useState, type ReactNode } from 'react';
import {
    Check,
    ChevronRight,
    Copy,
    Download,
    Eye,
    ExternalLink,
    FileArchive,
    FileText,
    Film,
    Globe,
    Grid2X2,
    ImageIcon,
    Layers,
    Link2,
    Paperclip,
    Play,
    Share2,
} from 'lucide-react';
import { ALLYO_BORDER } from './AllyoUI';
import type {
    AllyoTaskAttachment,
    AllyoTaskLink,
    AllyoTaskReference,
    AllyoTaskResources as TaskResources,
} from './allyoTaskResourceData';
import { ReferenceTaskModal, TaskFilePreviewModal } from './AllyoTaskResourceModals';
import { downloadAllyoFile } from './allyoFileDownload';
import { useToast } from '../../../../context/ToastContext';

const getLinkBadgeStyle = (category: AllyoTaskLink['category']) => {
    switch (category) {
        case 'figma':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
        case 'drive':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
        case 'canva':
            return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
        case 'dropbox':
        case 'wetransfer':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        case 'social':
            return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
        case 'video':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
        default:
            return 'bg-[#eef3e4] text-[#607343] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]';
    }
};

const getLinkIcon = (category: AllyoTaskLink['category']) => {
    switch (category) {
        case 'figma':
            return <Layers size={14} />;
        case 'drive':
        case 'dropbox':
        case 'wetransfer':
            return <Share2 size={14} />;
        case 'canva':
            return <ImageIcon size={14} />;
        case 'video':
            return <Play size={14} />;
        case 'social':
            return <ExternalLink size={14} />;
        default:
            return <Globe size={14} />;
    }
};

const AllyoTaskResources = ({ resources, onOpenTask }: { resources: TaskResources; onOpenTask: (taskId: string) => void }) => {
    const { addToast } = useToast();
    const [selectedReference, setSelectedReference] = useState<AllyoTaskReference | null>(null);
    const [selectedFile, setSelectedFile] = useState<AllyoTaskAttachment | null>(null);
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

    const handleCopyLink = async (link: AllyoTaskLink) => {
        try {
            await navigator.clipboard.writeText(link.url);
            setCopiedLinkId(link.id);
            addToast('Link copiado para a área de transferência', 'success');
            setTimeout(() => {
                setCopiedLinkId((current) => (current === link.id ? null : current));
            }, 2000);
        } catch {
            addToast('Não foi possível copiar o link', 'error');
        }
    };

    return (
        <>
            <ResourceSection
                icon={<Paperclip size={15} />}
                title="Arquivos para a tarefa"
                description="Uploads enviados pelo cliente"
                action={
                    resources.archiveUrl || resources.attachments.length > 1 ? (
                        <button
                            type="button"
                            onClick={() => {
                                const targetUrl = resources.archiveUrl || resources.attachments[0]?.downloadUrl;
                                if (targetUrl) void downloadAllyoFile(targetUrl, 'arquivos-da-tarefa.zip');
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#d9ddd5] bg-white px-2.5 py-1.5 text-[9px] font-bold text-[#65705e] transition hover:bg-[#f4f6f1] dark:border-zinc-700 dark:bg-zinc-900"
                        >
                            <Download size={11} /> Baixar {resources.attachments.length > 1 ? 'todos' : 'ZIP'}
                        </button>
                    ) : undefined
                }
            >
                {resources.attachments.length > 0 ? (
                    <div className="space-y-2">
                        {resources.attachments.map((file) => (
                            <div
                                key={file.id}
                                className={`group flex w-full items-center gap-2.5 rounded-[10px] border bg-white p-2.5 text-left transition hover:border-[#b7c99a] dark:bg-zinc-900 ${ALLYO_BORDER}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(file)}
                                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#f2f3ef] text-[#737b72] dark:bg-zinc-800">
                                        {file.extension === 'ZIP' || file.extension === 'RAR' ? (
                                            <FileArchive size={14} />
                                        ) : ['MP4', 'MOV', 'WEBM'].includes(file.extension) ? (
                                            <Film size={14} />
                                        ) : ['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(file.extension) ? (
                                            <ImageIcon size={14} />
                                        ) : (
                                            <FileText size={14} />
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <strong className="block truncate text-xs font-semibold hover:text-[#546838]">
                                            {file.name}
                                        </strong>
                                        <small className="mt-1 block text-[10px] text-[#8d938e]">
                                            {file.purpose} · {file.size}
                                        </small>
                                    </span>
                                </button>
                                <div className="flex shrink-0 items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(file)}
                                        title="Visualizar prévia"
                                        className="hidden rounded p-1 text-[#879087] transition hover:bg-[#f0f2ed] hover:text-[#2c332b] group-hover:block dark:hover:bg-zinc-800"
                                    >
                                        <Eye size={13} />
                                    </button>
                                    {file.downloadUrl && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                void downloadAllyoFile(file.downloadUrl!, file.name);
                                            }}
                                            title="Baixar arquivo"
                                            className="rounded p-1 text-[#879087] transition hover:bg-[#f0f2ed] hover:text-[#2c332b] dark:hover:bg-zinc-800"
                                        >
                                            <Download size={13} />
                                        </button>
                                    )}
                                    <span className="shrink-0 rounded-[5px] border border-[#dfe2dc] px-1.5 py-1 text-[8px] font-bold text-[#737b72] dark:border-zinc-700">
                                        {file.extension}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyResource>Nenhum arquivo foi enviado pelo cliente.</EmptyResource>
                )}
            </ResourceSection>

            <ResourceSection
                icon={<Link2 size={15} />}
                title="Links de referência"
                description="Links e referências externas adicionadas pelo cliente"
            >
                {resources.links.length > 0 ? (
                    <div className="space-y-2">
                        {resources.links.map((link) => {
                            const isCopied = copiedLinkId === link.id;
                            return (
                                <div
                                    key={link.id}
                                    className={`group flex w-full items-center gap-2.5 rounded-[10px] border bg-white p-2.5 transition hover:border-[#b7c99a] dark:bg-zinc-900 ${ALLYO_BORDER}`}
                                >
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${getLinkBadgeStyle(link.category)}`}>
                                        {getLinkIcon(link.category)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <strong className="block truncate text-xs font-semibold text-[#1c241a] dark:text-zinc-200">
                                            {link.title}
                                        </strong>
                                        <span className="mt-0.5 block truncate text-[10px] text-[#8d938e]">
                                            {link.domain}
                                        </span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => void handleCopyLink(link)}
                                            title={isCopied ? 'Copiado!' : 'Copiar link'}
                                            className="rounded-md p-1.5 text-[#879087] transition hover:bg-[#f0f2ed] hover:text-[#2c332b] dark:hover:bg-zinc-800"
                                        >
                                            {isCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                        </button>
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Abrir link em nova aba"
                                            className="inline-flex items-center gap-1 rounded-md bg-[#f4f6f1] px-2 py-1 text-[10px] font-semibold text-[#5a684b] transition hover:bg-[#e8ece2] hover:text-[#38432e] dark:bg-zinc-800 dark:text-zinc-300"
                                        >
                                            <span>Abrir</span>
                                            <ExternalLink size={11} />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyResource>Nenhum link adicionado como referência.</EmptyResource>
                )}
            </ResourceSection>

            <ResourceSection
                icon={<Grid2X2 size={15} />}
                title="Referências de tarefas"
                description="Tarefas anteriores adicionadas pelo cliente"
            >
                {resources.references.length > 0 ? (
                    <div className="space-y-2">
                        {resources.references.map((reference) => (
                            <button
                                key={reference.id}
                                type="button"
                                onClick={() => setSelectedReference(reference)}
                                className={`flex w-full items-center gap-2.5 rounded-[10px] border bg-white p-2.5 text-left transition hover:border-[#b7c99a] dark:bg-zinc-900 ${ALLYO_BORDER}`}
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#eef3e4] text-[#72844d] dark:bg-[#d0f08e]/10 dark:text-[#d0f08e]">
                                    <Grid2X2 size={13} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <strong className="block truncate text-xs font-semibold">
                                        {reference.title}
                                    </strong>
                                    <small className="mt-1 block text-[10px] text-[#8d938e]">
                                        #{reference.id} · {reference.category}
                                    </small>
                                </span>
                                <ChevronRight size={14} className="shrink-0 text-[#a0a5a0]" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <EmptyResource>Nenhuma tarefa foi adicionada como referência.</EmptyResource>
                )}
            </ResourceSection>

            <ReferenceTaskModal reference={selectedReference} onClose={() => setSelectedReference(null)} onOpenTask={onOpenTask} />
            <TaskFilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />
        </>
    );
};

const ResourceSection = ({
    icon,
    title,
    description,
    action,
    children,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
    children: ReactNode;
}) => (
    <section className={`border-b p-5 ${ALLYO_BORDER}`}>
        <div className="mb-3 flex items-start gap-2.5">
            <span className="mt-0.5 text-[#81915f]">{icon}</span>
            <span className="min-w-0 flex-1">
                <h3 className="font-season text-base font-normal">{title}</h3>
                <p className="mt-1 text-[10px] leading-4 text-[#929792]">{description}</p>
            </span>
            {action}
        </div>
        {children}
    </section>
);

const EmptyResource = ({ children }: { children: ReactNode }) => (
    <p className="rounded-[9px] bg-[#f6f7f4] px-3 py-3 text-[11px] leading-4 text-[#8b918b] dark:bg-zinc-900">
        {children}
    </p>
);

export default AllyoTaskResources;
