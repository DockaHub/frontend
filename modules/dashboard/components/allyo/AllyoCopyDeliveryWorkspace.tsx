import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Check,
    ChevronDown,
    ChevronUp,
    Clock,
    Copy,
    ExternalLink,
    FileText,
    Link2,
    Lock,
    MessageSquareText,
    Paperclip,
    Trash2,
    Upload,
} from 'lucide-react';
import type { AllyoTask } from './AllyoUI';
import { ALLYO_BORDER, FilterSelect } from './AllyoUI';
import type { ManagedFile } from './AllyoDeliveryWorkspaces';
import AllyoRichTextEditor from './AllyoRichTextEditor';
import {
    getDeliverableCaption,
    getDeliverableDocText,
    parseCopyContent,
    serializeDocument,
    serializeSocialCaption,
    type CopyMode,
    type StructuredCaption,
    type StructuredDocument,
} from './allyoCopyContent';

interface AllyoCopyDeliveryWorkspaceProps {
    task: AllyoTask;
    version: string;
    versionOptions?: string[];
    onVersionChange: (version: string) => void;
    textContent: string;
    onTextContentChange: (text: string) => void;
    sourceUrl?: string;
    onSourceUrlChange?: (url: string) => void;
    optionalFiles?: ManagedFile[];
    onOptionalFilesChange?: (files: ManagedFile[]) => void;
    onUploadOptionalFile?: (file: File) => Promise<{ fileUrl: string; name: string; size: number }>;
    disabled?: boolean;
    disabledReason?: string;
}

export const AllyoCopyDeliveryWorkspace: React.FC<AllyoCopyDeliveryWorkspaceProps> = ({
    task,
    version,
    versionOptions = [version || 'Versão 1'],
    onVersionChange,
    textContent,
    onTextContentChange,
    sourceUrl = '',
    onSourceUrlChange,
    optionalFiles = [],
    onOptionalFilesChange,
    onUploadOptionalFile,
    disabled = false,
    disabledReason,
}) => {
    const taskNameLower = (task.name || '').toLowerCase();
    const taskCategoryLower = (task.category || '').toLowerCase();
    const isSocialTask = /legenda|social|post|instagram|feed|reels|story|carrossel/i.test(`${taskNameLower} ${taskCategoryLower}`);
    const initialContentRef = useRef<ReturnType<typeof parseCopyContent> | null>(null);
    if (!initialContentRef.current) initialContentRef.current = parseCopyContent(textContent, isSocialTask);
    const initialContent = initialContentRef.current;
    const [mode, setMode] = useState<CopyMode>(initialContent.mode);
    const [socialData, setSocialData] = useState<StructuredCaption>(initialContent.social);
    const [docData, setDocData] = useState<StructuredDocument>(initialContent.doc);
    const [attachmentsOpen, setAttachmentsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const loadedTaskRef = useRef(task.id);
    const loadedVersionRef = useRef(version);
    const lastEmittedContentRef = useRef(textContent);

    useEffect(() => {
        const contextChanged = loadedTaskRef.current !== task.id || loadedVersionRef.current !== version;
        const contentChangedExternally = textContent !== lastEmittedContentRef.current;
        if (!contextChanged && !contentChangedExternally) return;

        const parsed = parseCopyContent(textContent, isSocialTask);
        setMode(parsed.mode);
        setSocialData(parsed.social);
        setDocData(parsed.doc);
        setCopied(false);
        setUploadError('');
        loadedTaskRef.current = task.id;
        loadedVersionRef.current = version;
        lastEmittedContentRef.current = textContent;
    }, [isSocialTask, task.id, textContent, version]);

    // Propaga mudanças para o pai
    const handleUpdateSocial = (field: keyof StructuredCaption, value: string) => {
        const next = { ...socialData, [field]: value };
        setSocialData(next);
        const serialized = serializeSocialCaption(next);
        lastEmittedContentRef.current = serialized;
        onTextContentChange(serialized);
    };

    const handleUpdateDoc = (field: keyof StructuredDocument, value: string) => {
        const next = { ...docData, [field]: value };
        setDocData(next);
        const serialized = serializeDocument(next);
        lastEmittedContentRef.current = serialized;
        onTextContentChange(serialized);
    };

    // Métricas calculadas EXCLUSIVAMENTE sobre a entrega final, excluindo as observações/notas internas
    const deliverableText = useMemo(() => {
        if (mode === 'social_caption') {
            return getDeliverableCaption(socialData);
        }
        return getDeliverableDocText(docData);
    }, [mode, socialData, docData]);

    const characterCount = deliverableText.length;
    const wordCount = deliverableText.trim() ? deliverableText.trim().split(/\s+/).length : 0;
    const estimatedReadingTime = wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / 180));

    const handleCopyDeliverable = async () => {
        const textToCopy = deliverableText.trim();
        if (!textToCopy) return;
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    const selectMode = (nextMode: CopyMode) => {
        const serialized = nextMode === 'social_caption'
            ? serializeSocialCaption(socialData)
            : serializeDocument(docData);
        setMode(nextMode);
        lastEmittedContentRef.current = serialized;
        onTextContentChange(serialized);
    };

    const hasValidSourceUrl = /^https?:\/\//i.test(sourceUrl.trim());

    return (
        <section className={`border-b bg-white dark:bg-zinc-950 ${ALLYO_BORDER}`}>
            <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 sm:px-[30px] ${ALLYO_BORDER}`}>
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-[.08em] text-[#9db669]">Pacote de entrega</span>
                    <h2 className="mt-1 font-season text-lg">Texto da versão</h2>
                </div>
                <div className="flex items-center gap-2">
                    <FilterSelect
                        label="Versão"
                        value={version}
                        options={versionOptions}
                        onChange={onVersionChange}
                        includeAll={false}
                    />
                </div>
            </div>

            {/* Aviso de bloqueio ou versão anterior */}
            {disabled && (
                <div className="border-b border-amber-200/60 bg-amber-50/70 px-5 py-2.5 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300 flex items-center gap-2 sm:px-[30px]">
                    <Lock size={13} className="shrink-0" />
                    <span>{disabledReason || 'O envio de texto fica liberado apenas quando a tarefa estiver com o status "Em andamento" ou "Alteração".'}</span>
                </div>
            )}

            <div className="p-5 sm:p-[30px]">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="grid w-full grid-cols-2 rounded-[10px] border border-[#e5e5e5] bg-[#f8f9f6] p-1 sm:w-auto dark:border-zinc-800 dark:bg-zinc-900">
                        <button
                            type="button"
                            onClick={() => selectMode('social_caption')}
                            className={`flex min-h-9 items-center justify-center gap-2 rounded-[8px] px-3 text-xs font-semibold transition ${
                                mode === 'social_caption'
                                    ? 'bg-[#131f15] text-white shadow-sm dark:bg-[#d0f08e] dark:text-[#131f15]'
                                    : 'text-[#777] hover:text-black dark:text-zinc-400 dark:hover:text-white'
                            }`}
                        >
                            <MessageSquareText size={14} />
                            <span>Legenda social</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => selectMode('document_free')}
                            className={`flex min-h-9 items-center justify-center gap-2 rounded-[8px] px-3 text-xs font-semibold transition ${
                                mode === 'document_free'
                                    ? 'bg-[#131f15] text-white shadow-sm dark:bg-[#d0f08e] dark:text-[#131f15]'
                                    : 'text-[#777] hover:text-black dark:text-zinc-400 dark:hover:text-white'
                            }`}
                        >
                            <FileText size={14} />
                            <span>Documento</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleCopyDeliverable}
                        disabled={!deliverableText.trim()}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#dedede] bg-white px-3.5 text-xs font-semibold text-[#555] transition hover:border-[#9db669] hover:text-[#739044] disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copied ? 'Copiado!' : mode === 'social_caption' ? 'Copiar legenda' : 'Copiar texto'}</span>
                    </button>
                </div>

                {/* Área de Edição */}
                {mode === 'social_caption' ? (
                    <div className="grid gap-6 lg:grid-cols-[1.3fr_.9fr]">
                        {/* Formulário Estruturado de Legenda */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[.06em] text-[#888]">
                                    Gancho / Headline (1ª linha)
                                </label>
                                <p className="mb-1.5 text-[11px] text-[#999]">A frase que aparece antes do botão "mais" no feed.</p>
                                <input
                                    type="text"
                                    value={socialData.headline}
                                    onChange={(e) => handleUpdateSocial('headline', e.target.value)}
                                    placeholder="Ex: Pare de cometer este erro na gestão da sua marca..."
                                    disabled={disabled}
                                    className="w-full rounded-[10px] border border-[#dedede] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/10 disabled:bg-[#f6f6f6] dark:border-zinc-700 dark:bg-zinc-900"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold uppercase tracking-[.06em] text-[#888]">
                                        Corpo da Legenda
                                    </label>
                                </div>
                                <textarea
                                    value={socialData.body}
                                    onChange={(e) => handleUpdateSocial('body', e.target.value)}
                                    placeholder="Desenvolva o conteúdo principal da mensagem aqui..."
                                    rows={8}
                                    disabled={disabled}
                                    className="mt-1.5 w-full resize-y rounded-[10px] border border-[#dedede] bg-white p-3.5 text-sm leading-relaxed outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/10 disabled:bg-[#f6f6f6] dark:border-zinc-700 dark:bg-zinc-900"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-[.06em] text-[#888]">
                                        Chamada para Ação (CTA)
                                    </label>
                                    <input
                                        type="text"
                                        value={socialData.cta}
                                        onChange={(e) => handleUpdateSocial('cta', e.target.value)}
                                        placeholder="Ex: Comente 'QUERO' ou clique no link da bio."
                                        disabled={disabled}
                                        className="mt-1.5 w-full rounded-[10px] border border-[#dedede] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/10 disabled:bg-[#f6f6f6] dark:border-zinc-700 dark:bg-zinc-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-[.06em] text-[#888]">
                                        Hashtags & Palavras-chave
                                    </label>
                                    <input
                                        type="text"
                                        value={socialData.hashtags}
                                        onChange={(e) => handleUpdateSocial('hashtags', e.target.value)}
                                        placeholder="#marketing #branding #inovacao"
                                        disabled={disabled}
                                        className="mt-1.5 w-full rounded-[10px] border border-[#dedede] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/10 disabled:bg-[#f6f6f6] dark:border-zinc-700 dark:bg-zinc-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[.06em] text-[#888]">
                                    Orientações complementares (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={socialData.notes}
                                    onChange={(e) => handleUpdateSocial('notes', e.target.value)}
                                    placeholder="Ex: Sugerimos publicar às 18h com áudio em alta. Imagem em anexo opcional."
                                    disabled={disabled}
                                    className="mt-1.5 w-full rounded-[10px] border border-[#dedede] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/10 disabled:bg-[#f6f6f6] dark:border-zinc-700 dark:bg-zinc-900"
                                />
                                <p className="mt-1 text-[11px] text-[#999]">
                                    Aparecem separadas da legenda e não entram na contagem de caracteres.
                                </p>
                            </div>
                        </div>

                        {/* Pré-visualização ao vivo */}
                        <div>
                            <div className="flex items-center justify-between pb-2">
                                <span className="text-xs font-bold uppercase tracking-[.06em] text-[#888] flex items-center gap-1.5">
                                    <FileText size={13} className="text-[#9db669]" />
                                    Prévia do cliente
                                </span>
                            </div>
                            <div className={`overflow-hidden rounded-[10px] border ${ALLYO_BORDER} bg-[#fafbf8] p-5 dark:bg-zinc-900/40`}>
                                <div className="border-b border-[#e5e5e5] pb-3 mb-4 dark:border-zinc-800">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9db669]">
                                        {task.projectName} • {task.name}
                                    </span>
                                    <h4 className="mt-1 font-semibold text-sm text-black dark:text-white">
                                        {socialData.headline || 'Título / Gancho aparecerá aqui'}
                                    </h4>
                                </div>
                                <div className="max-h-[360px] overflow-y-auto pr-1 text-xs leading-relaxed text-[#444] whitespace-pre-wrap dark:text-zinc-300">
                                    {socialData.body || <span className="italic text-[#aaa]">O corpo da legenda preenchido será exibido aqui em tempo real...</span>}
                                </div>
                                {socialData.cta && (
                                    <div className="mt-4 border-t border-[#e8ece0] pt-3 text-xs font-semibold text-black dark:border-zinc-800 dark:text-white">
                                        {socialData.cta}
                                    </div>
                                )}
                                {socialData.hashtags && (
                                    <div className="mt-3 text-[11px] text-[#739044] font-medium dark:text-[#a6c464]">
                                        {socialData.hashtags}
                                    </div>
                                )}
                                {socialData.notes && (
                                    <div className="mt-4 flex gap-2 border-t border-[#e8ece0] pt-3 text-[11px] text-[#777] dark:border-zinc-800 dark:text-zinc-400">
                                        <FileText size={12} className="mt-0.5 shrink-0" />
                                        <span>Orientações: {socialData.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Modo Documento / Artigo / Tradução */
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-[.06em] text-[#888]">
                                Título do Conteúdo / Documento
                            </label>
                            <input
                                type="text"
                                value={docData.title}
                                onChange={(e) => handleUpdateDoc('title', e.target.value)}
                                placeholder="Ex: Artigo: 5 Práticas Essenciais de Segurança Cibernética em 2026"
                                disabled={disabled}
                                className="mt-1.5 w-full rounded-[10px] border border-[#dedede] bg-white px-3.5 py-2.5 text-base font-semibold outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/10 disabled:bg-[#f6f6f6] dark:border-zinc-700 dark:bg-zinc-900"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold uppercase tracking-[.06em] text-[#888]">
                                    Texto Completo da Entrega
                                </label>
                            </div>
                            <AllyoRichTextEditor
                                value={docData.body}
                                onChange={(html) => handleUpdateDoc('body', html)}
                                disabled={disabled}
                                placeholder="Redija ou cole o texto final da entrega aqui..."
                                minHeight="360px"
                            />
                        </div>

                        <div>
                                <label className="block text-xs font-bold uppercase tracking-[.06em] text-[#888]">
                                    Notas e referências (opcional)
                            </label>
                            <input
                                type="text"
                                value={docData.notes}
                                onChange={(e) => handleUpdateDoc('notes', e.target.value)}
                                placeholder="Ex: Pesquisa baseada no relatório anual da Gartner. Ajustes de tom conforme o Brand Kit."
                                disabled={disabled}
                                className="mt-1.5 w-full rounded-[10px] border border-[#dedede] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#9db669] focus:ring-2 focus:ring-[#9db669]/10 disabled:bg-[#f6f6f6] dark:border-zinc-700 dark:bg-zinc-900"
                            />
                            <p className="mt-1 text-[11px] text-[#999]">
                                Aparecem separadas do documento e não entram na contagem do texto.
                            </p>
                        </div>
                    </div>
                )}

                <div className={`mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border bg-[#f9faf7] px-4 py-3 text-xs text-[#666] dark:bg-zinc-900 dark:text-zinc-400 ${ALLYO_BORDER}`}>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <span className="font-semibold text-black dark:text-white">
                            {characterCount.toLocaleString('pt-BR')} caracteres {mode === 'social_caption' ? 'da legenda' : 'do conteúdo'}
                            {mode === 'social_caption' && (
                                <span className={characterCount > 2200 ? 'ml-1 text-red-500 font-bold' : 'ml-1 text-[#999]'}>
                                    / 2.200 (Instagram)
                                </span>
                            )}
                        </span>
                        <span>{wordCount.toLocaleString('pt-BR')} palavras</span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            ~{estimatedReadingTime} min de leitura
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {mode === 'social_caption' && socialData.notes.trim() ? (
                            <span className="text-[11px] text-[#888] italic">
                                * Observações ({socialData.notes.trim().length} chars) não entram na contagem
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-[11px] text-[#888]">
                                <Check size={12} className="text-[#829454]" />
                                Pronto para aprovação sem anexos externos
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-5 border-t pt-4 border-[#eee] dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setAttachmentsOpen(!attachmentsOpen)}
                        className="flex items-center gap-2 text-xs font-semibold text-[#739044] hover:underline dark:text-[#a6c464]"
                    >
                        <Paperclip size={14} />
                        <span>Anexos complementares ou link de referência (opcional)</span>
                        {attachmentsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {attachmentsOpen && (
                        <div className="mt-4 space-y-4 rounded-[10px] border border-[#e5e5e5] bg-[#fafafa] p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                            <div>
                                <label className="block text-xs font-semibold text-[#555] dark:text-zinc-300">
                                    Link de Referência Externa (Google Docs, Notion, Figma, Drive)
                                </label>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                                        <input
                                            type="url"
                                            value={sourceUrl}
                                            onChange={(e) => onSourceUrlChange?.(e.target.value)}
                                            placeholder="https://docs.google.com/document/d/..."
                                            disabled={disabled}
                                            aria-invalid={Boolean(sourceUrl.trim()) && !hasValidSourceUrl}
                                            className="w-full rounded-[8px] border border-[#dedede] bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#9db669] dark:border-zinc-700 dark:bg-zinc-950"
                                        />
                                    </div>
                                    {hasValidSourceUrl && (
                                        <a
                                            href={sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#dedede] bg-white text-[#555] hover:text-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                                            title="Abrir link"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                                {sourceUrl.trim() && !hasValidSourceUrl && (
                                    <p className="mt-1.5 text-[11px] text-red-600 dark:text-red-400">Use um link iniciado por http:// ou https://.</p>
                                )}
                            </div>

                            {onUploadOptionalFile && (
                                <div>
                                    <label className="block text-xs font-semibold text-[#555] dark:text-zinc-300">
                                        Arquivo complementar opcional (PDF, DOCX, TXT)
                                    </label>
                                    <div className="mt-2 flex flex-wrap items-center gap-3">
                                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#dedede] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#555] transition hover:border-[#9db669] hover:text-[#739044] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                                            <Upload size={13} />
                                            <span>Anexar arquivo de apoio</span>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.txt"
                                                className="hidden"
                                                disabled={disabled}
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                            try {
                                                setUploadError('');
                                                const uploaded = await onUploadOptionalFile(file);
                                                        onOptionalFilesChange?.([
                                                            ...optionalFiles,
                                                            { id: String(Date.now()), name: uploaded.name, size: uploaded.size, fileUrl: uploaded.fileUrl },
                                                        ]);
                                            } catch (error: any) {
                                                setUploadError(error?.response?.data?.message || error?.message || 'Não foi possível anexar o arquivo.');
                                                    }
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>

                                        {optionalFiles.map((file, idx) => (
                                            <div
                                                key={file.id || idx}
                                                className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs border border-[#dedede] dark:bg-zinc-950 dark:border-zinc-700"
                                            >
                                                <FileText size={12} className="text-[#9db669]" />
                                                <span className="truncate max-w-[180px]">{file.name}</span>
                                                {!disabled && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onOptionalFilesChange?.(optionalFiles.filter((_, i) => i !== idx))}
                                                        aria-label={`Remover ${file.name}`}
                                                        className="text-[#999] hover:text-red-500"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {uploadError && <p className="mt-2 text-[11px] text-red-600 dark:text-red-400">{uploadError}</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AllyoCopyDeliveryWorkspace;
