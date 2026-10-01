import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import {
    X,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    CheckCircle2,
    MessageSquare,
    Send,
    Download,
    CornerDownRight,
    AlertCircle,
    Layers,
    FileText,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Type,
    Copy,
} from 'lucide-react';
import { GlobalWorkerOptions, getDocument, TextLayer, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import allyoService, { AllyoDesignAsset, AllyoReviewComment, AllyoReviewAnnotation } from '../../../../services/allyoService';
import { downloadAllyoFile } from './allyoFileDownload';
import { richTextToPlainText, sanitizeRichText } from './allyoCopyContent';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface TextSelectionData {
    text: string;
    point: { x: number; y: number };
    rect: { x: number; y: number; width: number; height: number };
}

export function parseQuotedSnippet(rawText: unknown): { snippet: string | null; cleanText: string } {
    if (!rawText || typeof rawText !== 'string') return { snippet: null, cleanText: '' };
    try {
        const match = rawText.match(/\[Trecho(?: selecionado)?: "(.*?)"\]\s*/s);
        if (match) {
            return {
                snippet: match[1],
                cleanText: rawText.replace(match[0], '').trim(),
            };
        }
    } catch {}
    return { snippet: null, cleanText: String(rawText || '') };
}

export function getCommentPage(comment: AllyoReviewComment | null | undefined): number {
    if (!comment) return 1;
    if (typeof comment.page === 'number' && comment.page > 0) return comment.page;
    const match = String(comment.text || '').match(/p[aá]gina\s*(\d+)/i);
    if (match) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 1;
}

export function getAnnotationPage(ann: any): number {
    if (!ann) return 1;
    if (typeof ann.page === 'number' && ann.page > 0) return ann.page;
    try {
        const payload = typeof ann.payload === 'string' ? JSON.parse(ann.payload) : ann.payload;
        if (payload && typeof payload.page === 'number' && payload.page > 0) return payload.page;
    } catch {}
    return 1;
}

interface CopyHighlightProps {
    content: string;
    safeHtml: string;
    isRichText: boolean;
    comments: AllyoReviewComment[];
    selectedCommentId: number | null;
    hoveredCommentId: number | null;
    onSelect: (commentId: number) => void;
    onHover: (commentId: number | null) => void;
    onMatchedCommentsChange: (commentIds: number[]) => void;
}

interface CopyHighlightRange {
    start: number;
    end: number;
}

const normalizeTextWithOffsets = (value: string) => {
    let text = '';
    const offsets: number[] = [];
    let previousWasWhitespace = false;

    for (let index = 0; index < value.length; index += 1) {
        const character = value[index];
        const isWhitespace = /\s/.test(character);
        if (isWhitespace) {
            if (!previousWasWhitespace) {
                text += ' ';
                offsets.push(index);
            }
        } else {
            text += character;
            offsets.push(index);
        }
        previousWasWhitespace = isWhitespace;
    }

    return { text, offsets };
};

const findCopyHighlightRanges = (fullText: string, snippet: string): CopyHighlightRange[] => {
    const exactRanges: CopyHighlightRange[] = [];
    let exactIndex = fullText.indexOf(snippet);
    while (exactIndex >= 0) {
        exactRanges.push({ start: exactIndex, end: exactIndex + snippet.length });
        exactIndex = fullText.indexOf(snippet, exactIndex + Math.max(1, snippet.length));
    }
    if (exactRanges.length) return exactRanges;

    const normalizedFullText = normalizeTextWithOffsets(fullText);
    const normalizedSnippet = normalizeTextWithOffsets(snippet.trim()).text;
    if (!normalizedSnippet) return [];

    const normalizedRanges: CopyHighlightRange[] = [];
    let normalizedIndex = normalizedFullText.text.indexOf(normalizedSnippet);
    while (normalizedIndex >= 0) {
        const start = normalizedFullText.offsets[normalizedIndex];
        const finalOffset = normalizedFullText.offsets[normalizedIndex + normalizedSnippet.length - 1];
        if (typeof start === 'number' && typeof finalOffset === 'number') {
            normalizedRanges.push({ start, end: finalOffset + 1 });
        }
        normalizedIndex = normalizedFullText.text.indexOf(
            normalizedSnippet,
            normalizedIndex + Math.max(1, normalizedSnippet.length)
        );
    }
    return normalizedRanges;
};

/**
 * Mantém as marcações de copy presas ao texto, em vez de coordenadas que se
 * desalinhariam quando o conteúdo muda de largura ou quebra de linha.
 */
const CopyTextWithHighlights: React.FC<CopyHighlightProps> = ({
    content,
    safeHtml,
    isRichText,
    comments,
    selectedCommentId,
    hoveredCommentId,
    onSelect,
    onHover,
    onMatchedCommentsChange,
}) => {
    const rootRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        if (isRichText) root.innerHTML = safeHtml;
        else root.textContent = content || 'Sem conteúdo de texto disponível diretamente.';

        const ownerDocument = root.ownerDocument;
        const showText = ownerDocument.defaultView?.NodeFilter.SHOW_TEXT ?? 4;
        const walker = ownerDocument.createTreeWalker(root, showText);
        const textNodes: Array<{ node: Text; start: number; end: number }> = [];
        let fullText = '';
        let currentNode = walker.nextNode();
        while (currentNode) {
            const node = currentNode as Text;
            const start = fullText.length;
            fullText += node.data;
            textNodes.push({ node, start, end: fullText.length });
            currentNode = walker.nextNode();
        }

        const highlightedComments = comments
            .map((comment, index) => ({
                comment,
                number: comments.slice(0, index + 1).filter((item) => Boolean(item.point)).length,
                snippet: parseQuotedSnippet(comment.text).snippet,
            }))
            .filter(({ comment, snippet }) => Boolean(comment.point && snippet));

        const occupiedRanges: CopyHighlightRange[] = [];
        const matchedCommentIds: number[] = [];
        const operations = new Map<Text, Array<{
            start: number;
            end: number;
            comment: AllyoReviewComment;
            number: number;
            snippet: string;
            isLastPart: boolean;
        }>>();

        const resolvePosition = (offset: number) => {
            const entry = textNodes.find(({ start, end }) => offset >= start && offset <= end);
            if (!entry) return null;
            return { node: entry.node, offset: Math.max(0, Math.min(entry.node.length, offset - entry.start)) };
        };

        highlightedComments.forEach(({ comment, number, snippet }) => {
            const candidates = findCopyHighlightRanges(fullText, snippet as string)
                .filter((candidate) => !occupiedRanges.some(
                    (occupied) => candidate.start < occupied.end && candidate.end > occupied.start
                ));
            if (!candidates.length) return;

            let selectedRange = candidates[0];
            if (candidates.length > 1 && comment.point) {
                const rootRect = (root.parentElement || root).getBoundingClientRect();
                selectedRange = candidates.reduce((closest, candidate) => {
                    const measureDistance = (range: CopyHighlightRange) => {
                        const start = resolvePosition(range.start);
                        const end = resolvePosition(range.end);
                        if (!start || !end || !rootRect.height) return Number.POSITIVE_INFINITY;
                        const domRange = ownerDocument.createRange();
                        domRange.setStart(start.node, start.offset);
                        domRange.setEnd(end.node, end.offset);
                        const rect = domRange.getBoundingClientRect();
                        const y = ((rect.top + rect.height / 2 - rootRect.top) / rootRect.height) * 100;
                        return Math.abs(y - comment.point!.y);
                    };
                    return measureDistance(candidate) < measureDistance(closest) ? candidate : closest;
                }, candidates[0]);
            }

            occupiedRanges.push(selectedRange);
            matchedCommentIds.push(comment.id);
            const affectedNodes = textNodes.filter(
                ({ start, end }) => selectedRange.start < end && selectedRange.end > start
            );
            affectedNodes.forEach((entry, index) => {
                const nodeOperations = operations.get(entry.node) || [];
                nodeOperations.push({
                    start: Math.max(0, selectedRange.start - entry.start),
                    end: Math.min(entry.node.length, selectedRange.end - entry.start),
                    comment,
                    number,
                    snippet: snippet as string,
                    isLastPart: index === affectedNodes.length - 1,
                });
                operations.set(entry.node, nodeOperations);
            });
        });

        onMatchedCommentsChange(matchedCommentIds);

        operations.forEach((nodeOperations, node) => {
            const fragment = ownerDocument.createDocumentFragment();
            let cursor = 0;

            nodeOperations.sort((a, b) => a.start - b.start).forEach((operation) => {
                if (operation.start > cursor) fragment.append(node.data.slice(cursor, operation.start));

                const color = operation.comment.resolved ? '#34d399' : '#fbbf24';
                const mark = ownerDocument.createElement('mark');
                mark.dataset.copyCommentId = String(operation.comment.id);
                mark.dataset.copyResolved = String(operation.comment.resolved);
                mark.className = 'cursor-pointer rounded-sm px-0.5 text-inherit transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300/80';
                mark.style.backgroundColor = operation.comment.resolved
                    ? 'rgba(52, 211, 153, 0.16)'
                    : 'rgba(251, 191, 36, 0.18)';
                mark.style.textDecoration = `underline 2px ${color}`;
                mark.style.textUnderlineOffset = '3px';
                mark.title = `Marcação ${operation.number}: ${operation.snippet}`;
                mark.append(node.data.slice(operation.start, operation.end));

                if (operation.isLastPart) {
                    mark.tabIndex = 0;
                    const badge = ownerDocument.createElement('sup');
                    badge.className = 'ml-1 inline-flex h-4 min-w-4 select-none items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none text-zinc-950 align-super';
                    badge.style.backgroundColor = color;
                    badge.textContent = String(operation.number);
                    badge.setAttribute('aria-hidden', 'true');
                    mark.append(badge);
                }

                fragment.append(mark);
                cursor = operation.end;
            });

            if (cursor < node.data.length) fragment.append(node.data.slice(cursor));
            node.replaceWith(fragment);
        });
    }, [comments, content, isRichText, onMatchedCommentsChange, safeHtml]);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        root.querySelectorAll<HTMLElement>('[data-copy-comment-id]').forEach((mark) => {
            const commentId = Number(mark.dataset.copyCommentId);
            const isActive = commentId === selectedCommentId || commentId === hoveredCommentId;
            const isResolved = mark.dataset.copyResolved === 'true';
            mark.style.backgroundColor = isResolved
                ? (isActive ? 'rgba(52, 211, 153, 0.3)' : 'rgba(52, 211, 153, 0.16)')
                : (isActive ? 'rgba(251, 191, 36, 0.34)' : 'rgba(251, 191, 36, 0.18)');
        });

    }, [comments, hoveredCommentId, selectedCommentId]);

    useEffect(() => {
        if (!selectedCommentId) return;
        rootRef.current
            ?.querySelector<HTMLElement>(`[data-copy-comment-id="${selectedCommentId}"]`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, [comments, content, isRichText, safeHtml, selectedCommentId]);

    const commentIdFromTarget = (target: EventTarget | null) => {
        if (!(target instanceof HTMLElement)) return null;
        const mark = target.closest<HTMLElement>('[data-copy-comment-id]');
        const commentId = Number(mark?.dataset.copyCommentId);
        return Number.isFinite(commentId) && commentId > 0 ? commentId : null;
    };

    return (
        <div
            ref={rootRef}
            onClick={(event) => {
                const commentId = commentIdFromTarget(event.target);
                if (commentId) onSelect(commentId);
            }}
            onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                const commentId = commentIdFromTarget(event.target);
                if (commentId) {
                    event.preventDefault();
                    onSelect(commentId);
                }
            }}
            onMouseOver={(event) => {
                const commentId = commentIdFromTarget(event.target);
                if (commentId) onHover(commentId);
            }}
            onMouseOut={(event) => {
                const fromCommentId = commentIdFromTarget(event.target);
                const toCommentId = commentIdFromTarget(event.relatedTarget);
                if (fromCommentId && fromCommentId !== toCommentId) onHover(null);
            }}
            className={isRichText
                ? `text-[15px] leading-relaxed text-zinc-200 select-text selection:bg-[#5d55c7]/40 selection:text-white
                    [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-white
                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-white
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-white
                    [&_p]:my-2
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
                    [&_li]:my-0.5
                    [&_blockquote]:border-l-4 [&_blockquote]:border-[#9db669] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-zinc-300
                    [&_pre]:bg-zinc-800/80 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-3 [&_pre]:overflow-x-auto
                    [&_hr]:my-4 [&_hr]:border-zinc-700
                    [&_a]:text-[#d0f08e] [&_a]:underline [&_a]:font-medium
                    [&_article>div]:whitespace-pre-wrap [&_article>div]:my-3
                    [&_aside]:mt-7 [&_aside]:border-t [&_aside]:border-zinc-700 [&_aside]:pt-4 [&_aside]:text-[13px] [&_aside]:text-zinc-400`
                : 'text-[15px] leading-relaxed text-zinc-200 whitespace-pre-wrap select-text selection:bg-[#5d55c7]/40 selection:text-white'}
        />
    );
};

interface AllyoPdfCanvasProps {
    url: string;
    altName: string;
    currentPage: number;
    onNumPagesChange?: (numPages: number) => void;
    onTextSelect?: (selection: TextSelectionData | null) => void;
}

const AllyoPdfCanvas: React.FC<AllyoPdfCanvasProps> = ({
    url,
    altName,
    currentPage,
    onNumPagesChange,
    onTextSelect,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const textLayerRef = useRef<HTMLDivElement | null>(null);
    const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
    const [isLoadingPdf, setIsLoadingPdf] = useState(true);
    const [pdfError, setPdfError] = useState<string | null>(null);

    // Carrega o documento PDF via pdfjs-dist
    useEffect(() => {
        let isCancelled = false;
        setIsLoadingPdf(true);
        setPdfError(null);
        setPdfDoc(null);

        if (!url) {
            setIsLoadingPdf(false);
            setPdfError('URL do arquivo não encontrada.');
            return;
        }

        let loadingTask: any = null;
        try {
            loadingTask = getDocument({ url });
            loadingTask.promise
                .then((doc: any) => {
                    if (isCancelled) return;
                    setPdfDoc(doc);
                    setIsLoadingPdf(false);
                    if (onNumPagesChange) onNumPagesChange(doc.numPages);
                })
                .catch((err: any) => {
                    if (isCancelled) return;
                    console.error('[AllyoPdfCanvas] Erro ao carregar PDF:', err);
                    setIsLoadingPdf(false);
                    setPdfError('Não foi possível carregar a prévia do arquivo PDF.');
                });
        } catch (err: any) {
            console.error('[AllyoPdfCanvas] Falha síncrona ao inicializar PDF:', err);
            setIsLoadingPdf(false);
            setPdfError('Não foi possível inicializar a prévia do PDF.');
        }

        return () => {
            isCancelled = true;
            try {
                loadingTask?.destroy()?.catch?.(() => {});
            } catch {}
        };
    }, [url]);

    // Renderiza a página no canvas mantendo alta resolução e proporção
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;
        let isCancelled = false;
        let renderTask: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | null = null;

        const renderPage = async () => {
            try {
                const page = await pdfDoc.getPage(currentPage);
                if (isCancelled || !canvasRef.current) return;

                const baseViewport = page.getViewport({ scale: 1 });
                const baseWidth = baseViewport.width;
                const baseHeight = baseViewport.height;

                // Calcula o espaço real disponível no palco para preencher a tela sem corte
                let availableW = 800;
                let availableH = 650;
                const stage = canvasRef.current?.closest<HTMLDivElement>('.allyo-review-stage');
                if (stage && stage.clientWidth > 0 && stage.clientHeight > 0) {
                    availableW = Math.max(240, stage.clientWidth - 32);
                    availableH = Math.max(240, stage.clientHeight - 32);
                } else {
                    availableW = Math.max(240, window.innerWidth - 440);
                    availableH = Math.max(240, window.innerHeight - 150);
                }

                // Preenche o espaço disponível mantendo 100% de proporção sem overflow
                const displayScale = Math.min(
                    availableW / baseWidth,
                    availableH / baseHeight
                );

                const displayWidth = Math.round(baseWidth * displayScale);
                const displayHeight = Math.round(baseHeight * displayScale);

                // Pixel ratio para nitidez retina
                const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
                const renderScale = displayScale * pixelRatio;
                const renderViewport = page.getViewport({ scale: renderScale });
                const textViewport = page.getViewport({ scale: displayScale });

                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.width = Math.floor(renderViewport.width);
                canvas.height = Math.floor(renderViewport.height);
                canvas.style.width = `${displayWidth}px`;
                canvas.style.height = `${displayHeight}px`;

                renderTask = page.render({
                    canvas,
                    canvasContext: context,
                    viewport: renderViewport,
                });
                await renderTask.promise;

                // Renderiza a camada de texto interativa para permitir seleção de trechos
                if (textLayerRef.current && !isCancelled) {
                    try {
                        textLayerRef.current.innerHTML = '';
                        textLayerRef.current.style.width = `${displayWidth}px`;
                        textLayerRef.current.style.height = `${displayHeight}px`;
                        const textContent = await page.getTextContent();
                        const textLayer = new TextLayer({
                            textContentSource: textContent,
                            container: textLayerRef.current,
                            viewport: textViewport,
                        });
                        await textLayer.render();
                    } catch (tlErr) {
                        console.warn('[AllyoPdfCanvas] Camada de texto interativa indisponível:', tlErr);
                    }
                }
            } catch (err: any) {
                if (!isCancelled && err?.name !== 'RenderingCancelledException') {
                    console.error('[AllyoPdfCanvas] Erro ao renderizar página:', err);
                }
            }
        };

        renderPage();

        return () => {
            isCancelled = true;
            renderTask?.cancel();
        };
    }, [pdfDoc, currentPage]);

    const handleMouseUp = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        const text = sel.toString().trim();
        if (text.length < 2) return;

        try {
            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const container = containerRef.current;
            if (!container) return;
            const containerRect = container.getBoundingClientRect();

            const point = {
                x: Math.max(0, Math.min(100, ((rect.left + rect.width / 2 - containerRect.left) / containerRect.width) * 100)),
                y: Math.max(0, Math.min(100, ((rect.top - containerRect.top) / containerRect.height) * 100)),
            };
            const highlightRect = {
                x: Math.max(0, Math.min(100, ((rect.left - containerRect.left) / containerRect.width) * 100)),
                y: Math.max(0, Math.min(100, ((rect.top - containerRect.top) / containerRect.height) * 100)),
                width: Math.max(1, Math.min(100, (rect.width / containerRect.width) * 100)),
                height: Math.max(1, Math.min(100, (rect.height / containerRect.height) * 100)),
            };

            if (onTextSelect) {
                onTextSelect({ text, point, rect: highlightRect });
            }
        } catch {}
    };

    if (isLoadingPdf) {
        return (
            <div className="flex h-[420px] w-[320px] sm:w-[460px] flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin text-[#9db669] mb-3" />
                <p className="text-xs font-medium text-zinc-300">Renderizando prévia do PDF...</p>
                <p className="mt-1 text-[11px] text-zinc-500 truncate max-w-xs">{altName}</p>
            </div>
        );
    }

    if (pdfError) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-red-900/50 bg-red-950/20 p-8 text-center text-zinc-300 max-w-md">
                <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
                <p className="text-sm font-semibold text-white">Falha ao abrir visualização do PDF</p>
                <p className="mt-1 text-xs text-zinc-400">{pdfError}</p>
                <button
                    type="button"
                    onClick={() => void downloadAllyoFile(url, altName)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white transition"
                >
                    <Download size={13} /> Baixar anexo original
                </button>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onMouseUp={handleMouseUp}
            className="relative select-text rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl"
        >
            <canvas
                ref={canvasRef}
                aria-label={`Documento PDF: ${altName}`}
                className="rounded-lg object-contain block pointer-events-none"
            />
            <div
                ref={textLayerRef}
                className="textLayer absolute inset-0 pointer-events-auto select-text"
                style={{ lineHeight: 1 }}
            />
        </div>
    );
};

interface AllyoReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    design: AllyoDesignAsset | null;
    availableVersions?: AllyoDesignAsset[];
    taskName?: string;
    onCommentResolved?: (commentId: number, resolved: boolean) => void;
}

class ReviewModalErrorBoundary extends React.Component<
    { children: React.ReactNode; onClose: () => void },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: any) {
        console.error('[AllyoReviewModal] Erro capturado pelo ErrorBoundary:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="flex max-w-md flex-col items-center rounded-2xl border border-zinc-800 bg-[#121a14] p-8 text-center text-white shadow-2xl">
                        <AlertCircle className="h-12 w-12 text-amber-400 mb-3" />
                        <h3 className="text-base font-semibold">Não foi possível carregar a revisão</h3>
                        <p className="mt-2 text-xs text-zinc-400">
                            Ocorreu um imprevisto ao renderizar os dados desta entrega.
                        </p>
                        <div className="mt-5 flex gap-2">
                            <button
                                type="button"
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="rounded-lg bg-[#9db669] px-4 py-2 text-xs font-semibold text-black hover:bg-[#b0cc77]"
                            >
                                Tentar novamente
                            </button>
                            <button
                                type="button"
                                onClick={this.props.onClose}
                                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const AllyoReviewModalInner: React.FC<AllyoReviewModalProps> = ({
    isOpen,
    onClose,
    design,
    availableVersions,
    taskName,
    onCommentResolved,
}) => {
    const [reviewDesign, setReviewDesign] = useState<AllyoDesignAsset | null>(design);
    const [zoom, setZoom] = useState(100);
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
    const [hoveredCommentId, setHoveredCommentId] = useState<number | null>(null);
    const [activeTextSelection, setActiveTextSelection] = useState<TextSelectionData | null>(null);
    const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
    const [highlightedCopyCommentIds, setHighlightedCopyCommentIds] = useState<number[]>([]);
    const [comments, setComments] = useState<AllyoReviewComment[]>([]);
    const [annotations, setAnnotations] = useState<AllyoReviewAnnotation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [pdfPage, setPdfPage] = useState(1);
    const [pdfNumPages, setPdfNumPages] = useState(1);
    const commentsListRef = useRef<HTMLDivElement>(null);
    const copyContainerRef = useRef<HTMLDivElement>(null);
    const [copyCopied, setCopyCopied] = useState(false);

    // Sincroniza design recebido nas props
    useEffect(() => {
        setReviewDesign(design);
        setPdfPage(1);
        setPdfNumPages(1);
        setZoom(100);
        setActiveTextSelection(null);
        setSelectedSnippet(null);
        setHighlightedCopyCommentIds([]);
        setHoveredCommentId(null);
    }, [design, isOpen]);

    // Carrega dados frescos de revisão via API ao abrir o modal
    useEffect(() => {
        if (!isOpen || !design?.id) return;

        setComments(design.comments || []);
        setAnnotations(design.annotations || []);
        setIsLoading(true);

        allyoService.getDesignReview(design.id)
            .then((fresh) => {
                if (fresh) {
                    setReviewDesign((prev) => ({ ...(prev || design), ...fresh }));
                    if (fresh.comments) setComments(fresh.comments);
                    if (fresh.annotations) setAnnotations(fresh.annotations);
                }
            })
            .catch((err) => {
                console.warn('[AllyoReviewModal] Erro ao buscar revisão atualizada:', err);
            })
            .finally(() => setIsLoading(false));
    }, [isOpen, design?.id]);

    const safeCopyHtml = useMemo(
        () => sanitizeRichText(reviewDesign?.textContent || design?.textContent || ''),
        [design?.textContent, reviewDesign?.textContent]
    );

    if (!isOpen || !design) return null;

    const activeDesign = reviewDesign || design;
    const fileUrl = activeDesign.fileUrl || activeDesign.thumbnailUrl;

    const isPdf = Boolean(
        activeDesign.contentType === 'application/pdf' ||
        /\.pdf$/i.test(activeDesign.name || '') ||
        (fileUrl && /\.pdf(\?.*)?$/i.test(fileUrl))
    );

    const isImage = !isPdf && (
        activeDesign.contentType?.startsWith('image/') ||
        /\.(png|jpe?g|webp|gif|svg)$/i.test(activeDesign.name || '') ||
        (fileUrl ? /\.(png|jpe?g|webp|gif|svg)(?:[?#].*)?$/i.test(fileUrl) : false)
    );

    const isVideo = Boolean(
        activeDesign.contentType?.startsWith('video/') ||
        /\.(mp4|mov|webm|m4v)$/i.test(activeDesign.name || '') ||
        (fileUrl ? /\.(mp4|mov|webm|m4v)(?:[?#].*)?$/i.test(fileUrl) : false)
    );

    const isAudio = Boolean(
        activeDesign.contentType?.startsWith('audio/') ||
        /\.(mp3|wav|m4a|aac|ogg)$/i.test(activeDesign.name || '') ||
        (fileUrl ? /\.(mp3|wav|m4a|aac|ogg)(?:[?#].*)?$/i.test(fileUrl) : false)
    );

    const isCopy = Boolean(
        activeDesign.textContent ||
        activeDesign.contentType?.startsWith('text/') ||
        /\.(txt|md|copy)$/i.test(activeDesign.name || '')
    );

    const safeComments = Array.isArray(comments) ? comments : [];
    const safeAnnotations = Array.isArray(annotations) ? annotations : [];

    const openComments = safeComments.filter((c) => Boolean(c) && !c.resolved);
    const resolvedComments = safeComments.filter((c) => Boolean(c) && c.resolved);
    const visibleComments = filter === 'open' ? openComments : filter === 'resolved' ? resolvedComments : safeComments;

    const pointedComments = useMemo(
        () => safeComments.filter((c) => Boolean(c && c.point)),
        [safeComments]
    );

    const markerNumber = (commentId: number) => {
        const idx = pointedComments.findIndex((c: any) => c.id === commentId);
        return idx >= 0 ? idx + 1 : 0;
    };

    // Toggle resolução do comentário
    const handleToggleResolved = async (commentId: number, currentResolved: boolean) => {
        const nextResolved = !currentResolved;
        setComments((prev) =>
            prev.map((c) => (c.id === commentId ? { ...c, resolved: nextResolved } : c))
        );

        try {
            await allyoService.toggleCommentResolved(design.id, commentId, nextResolved);
            if (onCommentResolved) onCommentResolved(commentId, nextResolved);
        } catch (err) {
            console.warn('[AllyoReviewModal] Falha ao atualizar status:', err);
            // Reverte em caso de erro
            setComments((prev) =>
                prev.map((c) => (c.id === commentId ? { ...c, resolved: currentResolved } : c))
            );
        }
    };

    // Captura seleção em materiais de texto / Copy
    const handleCopyMouseUp = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        const text = sel.toString().trim();
        if (text.length < 2) return;

        try {
            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const container = copyContainerRef.current;
            if (!container) return;
            const cRect = container.getBoundingClientRect();

            const point = {
                x: Math.max(0, Math.min(100, ((rect.left + rect.width / 2 - cRect.left) / cRect.width) * 100)),
                y: Math.max(0, Math.min(100, ((rect.top - cRect.top) / cRect.height) * 100)),
            };
            const highlightRect = {
                x: Math.max(0, Math.min(100, ((rect.left - cRect.left) / cRect.width) * 100)),
                y: Math.max(0, Math.min(100, ((rect.top - cRect.top) / cRect.height) * 100)),
                width: Math.max(1, Math.min(100, (rect.width / cRect.width) * 100)),
                height: Math.max(1, Math.min(100, (rect.height / cRect.height) * 100)),
            };

            setActiveTextSelection({ text, point, rect: highlightRect });
        } catch {}
    };

    const handleStartCommentOnSelection = () => {
        if (!activeTextSelection) return;
        setSelectedSnippet(activeTextSelection.text);
        setActiveTextSelection(null);
        const input = document.getElementById('creative-reply-input');
        input?.focus();
    };

    // Enviar resposta / novo comentário (vinculando trecho caso selecionado)
    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanDraft = replyText.trim();
        if (!cleanDraft || isSubmittingReply) return;

        const fullText = selectedSnippet
            ? `[Trecho selecionado: "${selectedSnippet}"]\n${cleanDraft}`
            : cleanDraft;

        setIsSubmittingReply(true);
        try {
            const res = await allyoService.addDesignComment(design.id, {
                text: fullText,
                version: Number(activeDesign.version?.replace(/\D/g, '')) || 1,
                page: isPdf ? pdfPage : 1,
            });

            const newComment: AllyoReviewComment = {
                id: res?.id || Date.now(),
                author: 'Você (Criativo)',
                text: fullText,
                time: 'Agora',
                resolved: false,
                version: Number(activeDesign.version?.replace(/\D/g, '')) || 1,
                page: isPdf ? pdfPage : 1,
            };

            setComments((prev) => [...prev, newComment]);
            setReplyText('');
            setSelectedSnippet(null);
            setSelectedCommentId(newComment.id);
        } catch (err) {
            console.warn('[AllyoReviewModal] Erro ao enviar comentário:', err);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleSelectPin = (commentId: number) => {
        const comm = comments.find((c) => c.id === commentId);
        if (isPdf && comm) {
            const targetPage = getCommentPage(comm);
            if (targetPage !== pdfPage) {
                setPdfPage(targetPage);
            }
        }
        setSelectedCommentId(commentId);
        setHoveredCommentId(commentId);
        // Scroll comment into view
        const element = document.getElementById(`comment-card-${commentId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="relative flex h-[92vh] w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl bg-[#0f1712] border border-zinc-800 text-white shadow-2xl">
                
                {/* Header superior */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#141e17] px-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#9db669]/20 text-[#d0f08e]">
                            <Layers size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="truncate text-base font-semibold text-white" title={activeDesign.name}>
                                    {activeDesign.name}
                                </h2>
                                {availableVersions && availableVersions.length > 1 ? (
                                    <select
                                        value={activeDesign.id}
                                        onChange={(e) => {
                                            const selectedId = Number(e.target.value);
                                            const next = availableVersions.find((d) => d.id === selectedId);
                                            if (next) {
                                                setReviewDesign(next);
                                                setSelectedCommentId(null);
                                                setHoveredCommentId(null);
                                            }
                                        }}
                                        className="rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[11px] font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#9db669] cursor-pointer"
                                    >
                                        {availableVersions.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {availableVersions.filter((item) => item.version === d.version).length > 1
                                                    ? `${d.version || 'Versão'} · ${d.name}`
                                                    : d.version || `Versão ${d.id}`}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                                        {activeDesign.version || 'v1'}
                                    </span>
                                )}
                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    activeDesign.approved
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                                }`}>
                                    {activeDesign.approved ? 'Aprovado pelo cliente' : 'Em revisão com anotações'}
                                </span>
                            </div>
                            <p className="truncate text-xs text-zinc-400">
                                {taskName || 'Revisão da entrega'} • {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'} e {annotations.length} {annotations.length === 1 ? 'marcação' : 'marcações'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {fileUrl && (
                            <button
                                type="button"
                                onClick={() => void downloadAllyoFile(fileUrl, activeDesign.name || 'arquivo-original')}
                                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700"
                                title="Baixar arquivo original"
                            >
                                <Download size={13} />
                                Original
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
                            aria-label="Fechar modal de revisão"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </header>

                {/* Conteúdo principal: Canvas interativo + Sidebar de comentários */}
                <div className="flex flex-1 min-h-0 overflow-hidden">
                    
                    {/* Área do Canvas com o arquivo e as marcações */}
                    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0c120e]">
                        
                        {/* Barra de ferramentas de Zoom e Paginação */}
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#162019]/90 p-1.5 shadow-lg backdrop-blur-md">
                            {isPdf && pdfNumPages > 1 && (
                                <div className="flex items-center gap-1 border-r border-zinc-700 pr-2 mr-1">
                                    <button
                                        type="button"
                                        disabled={pdfPage <= 1}
                                        onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition"
                                        title="Página anterior"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-xs font-mono text-zinc-300 px-1">
                                        {pdfPage} / {pdfNumPages}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={pdfPage >= pdfNumPages}
                                        onClick={() => setPdfPage((p) => Math.min(pdfNumPages, p + 1))}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition"
                                        title="Próxima página"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.max(30, z - 15))}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                title="Diminuir zoom"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <span className="min-w-12 text-center text-xs font-mono font-medium text-zinc-300">
                                {zoom}%
                            </span>
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.min(250, z + 15))}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                title="Aumentar zoom"
                            >
                                <ZoomIn size={16} />
                            </button>
                            <span className="mx-1 h-4 w-px bg-zinc-700" />
                            <button
                                type="button"
                                onClick={() => setZoom(100)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                                title="Ajustar zoom para 100%"
                            >
                                <RotateCcw size={14} />
                            </button>
                        </div>

                        {/* Palco do arquivo */}
                        <div className="allyo-review-stage flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center">
                            <div
                                className="relative transition-transform duration-100 ease-out origin-center shadow-2xl rounded-lg"
                                style={{ transform: `scale(${zoom / 100})` }}
                            >
                                {(isImage || isPdf || isVideo || isAudio) && fileUrl ? (
                                    <div className="relative select-text">
                                        {isPdf ? (
                                            <AllyoPdfCanvas
                                                url={fileUrl}
                                                altName={activeDesign.name}
                                                currentPage={pdfPage}
                                                onNumPagesChange={setPdfNumPages}
                                                onTextSelect={setActiveTextSelection}
                                            />
                                        ) : isVideo ? (
                                            <video
                                                src={fileUrl}
                                                controls
                                                playsInline
                                                className="max-h-[calc(100vh-180px)] max-w-[calc(100vw-440px)] rounded-lg border border-zinc-800 bg-black shadow-2xl"
                                            />
                                        ) : isAudio ? (
                                            <div className="flex min-h-[240px] w-[620px] max-w-[85vw] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 p-10 shadow-2xl">
                                                <FileText size={42} className="mb-5 text-[#9db669]" />
                                                <strong className="mb-5 max-w-full truncate text-sm text-white">{activeDesign.name}</strong>
                                                <audio src={fileUrl} controls className="w-full" />
                                            </div>
                                        ) : (
                                            <img
                                                src={fileUrl}
                                                alt={activeDesign.name}
                                                style={{
                                                    maxHeight: 'calc(100vh - 160px)',
                                                    maxWidth: 'calc(100vw - 440px)',
                                                }}
                                                className="rounded-lg object-contain block bg-zinc-950 border border-zinc-800 shadow-2xl"
                                                draggable={false}
                                            />
                                        )}

                                        {/* Balão flutuante para comentar no trecho selecionado */}
                                        {activeTextSelection && (
                                            <div
                                                className="absolute z-40 -translate-x-1/2 -translate-y-full pb-2 animate-in fade-in zoom-in-95 duration-150"
                                                style={{
                                                    left: `${activeTextSelection.point.x}%`,
                                                    top: `${activeTextSelection.point.y}%`,
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={handleStartCommentOnSelection}
                                                    className="flex items-center gap-1.5 rounded-full bg-[#5d55c7] hover:bg-[#6e66db] text-white px-3 py-1.5 text-xs font-semibold shadow-xl ring-2 ring-white/20 transition-all hover:scale-105"
                                                >
                                                    <MessageSquare size={13} />
                                                    Comentar este trecho
                                                </button>
                                            </div>
                                        )}

                                        {/* Camada SVG de anotações (desenhos livres, retângulos, setas) */}
                                        <svg
                                            className="absolute inset-0 h-full w-full pointer-events-none"
                                            viewBox="0 0 100 100"
                                            preserveAspectRatio="none"
                                        >
                                            <defs>
                                                <marker
                                                    id="arrowhead"
                                                    markerWidth="8"
                                                    markerHeight="8"
                                                    refX="6"
                                                    refY="4"
                                                    orient="auto"
                                                >
                                                    <polygon points="0 0, 8 4, 0 8" fill="#5d55c7" />
                                                </marker>
                                            </defs>

                                            {safeAnnotations
                                                .filter((ann) => Boolean(ann) && (!isPdf || getAnnotationPage(ann) === pdfPage))
                                                .map((ann, idx) => {
                                                    try {
                                                        const isHovered = Boolean(ann.id && hoveredCommentId && String(ann.id) === String(hoveredCommentId));
                                                        const color = isHovered ? '#fbbf24' : (ann.color || '#5d55c7');
                                                        const strokeW = (Number(ann.width) || 3) * (isHovered ? 0.25 : 0.15);

                                                        let rawPoints = (ann as any).points;
                                                        if (typeof rawPoints === 'string') {
                                                            try { rawPoints = JSON.parse(rawPoints); } catch { rawPoints = []; }
                                                        }
                                                        const points = Array.isArray(rawPoints) ? rawPoints : [];

                                                        if (ann.type === 'draw' && points.length > 1) {
                                                            const validPoints = points.filter((pt: any) => pt && typeof pt.x === 'number' && typeof pt.y === 'number');
                                                            if (validPoints.length > 1) {
                                                                const pathD = validPoints.reduce(
                                                                    (acc: string, pt: any, i: number) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
                                                                    ''
                                                                );
                                                                return (
                                                                    <path
                                                                        key={ann.id || idx}
                                                                        d={pathD}
                                                                        stroke={color}
                                                                        strokeWidth={strokeW}
                                                                        fill="none"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                );
                                                            }
                                                        }

                                                        const start = (ann as any).start;
                                                        const end = (ann as any).end;
                                                        if (ann.type === 'rectangle' && start && end && typeof start.x === 'number' && typeof end.x === 'number') {
                                                            const minX = Math.min(start.x, end.x);
                                                            const minY = Math.min(start.y, end.y);
                                                            const width = Math.abs(end.x - start.x);
                                                            const height = Math.abs(end.y - start.y);
                                                            return (
                                                                <rect
                                                                    key={ann.id || idx}
                                                                    x={minX}
                                                                    y={minY}
                                                                    width={width}
                                                                    height={height}
                                                                    stroke={color}
                                                                    strokeWidth={strokeW}
                                                                    fill={color}
                                                                    fillOpacity={isHovered ? '0.4' : '0.18'}
                                                                    rx="1"
                                                                />
                                                            );
                                                        }

                                                        if (ann.type === 'arrow' && start && end && typeof start.x === 'number' && typeof end.x === 'number') {
                                                            return (
                                                                <line
                                                                    key={ann.id || idx}
                                                                    x1={start.x}
                                                                    y1={start.y}
                                                                    x2={end.x}
                                                                    y2={end.y}
                                                                    stroke={color}
                                                                    strokeWidth={strokeW}
                                                                    markerEnd="url(#arrowhead)"
                                                                />
                                                            );
                                                        }

                                                        return null;
                                                    } catch {
                                                        return null;
                                                    }
                                                })}
                                        </svg>

                                        {/* Pinos / Marcadores dos Comentários pontuais */}
                                        {safeComments
                                            .filter((c) => Boolean(c) && c.point && typeof c.point.x === 'number' && typeof c.point.y === 'number' && (!isPdf || getCommentPage(c) === pdfPage))
                                            .map((c) => {
                                                const number = markerNumber(c.id);
                                                const isSelected = selectedCommentId === c.id;
                                                const isHovered = hoveredCommentId === c.id;
                                                const parsed = parseQuotedSnippet(c.text);

                                                return (
                                                    <div
                                                        key={c.id}
                                                        style={{ left: `${c.point!.x}%`, top: `${c.point!.y}%` }}
                                                        className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectPin(c.id)}
                                                            onMouseEnter={() => {
                                                                setHoveredCommentId(c.id);
                                                                const el = document.getElementById(`comment-card-${c.id}`);
                                                                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                                            }}
                                                            onMouseLeave={() => setHoveredCommentId(null)}
                                                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all shadow-lg ${
                                                                c.resolved
                                                                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50 opacity-80 hover:opacity-100'
                                                                    : isHovered || isSelected
                                                                    ? 'bg-amber-400 text-black ring-4 ring-amber-300 scale-125 shadow-amber-400/50 animate-pulse'
                                                                    : 'bg-[#5d55c7] text-white ring-2 ring-white hover:scale-110 hover:bg-[#6e66db]'
                                                            }`}
                                                            title={`${c.author}: "${parsed.cleanText}"`}
                                                        >
                                                            {number}
                                                        </button>
                                                        {isHovered && parsed.snippet && (
                                                            <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 z-40 whitespace-nowrap rounded-md bg-zinc-900 border border-amber-400/60 px-2.5 py-1 text-[11px] text-amber-200 shadow-xl backdrop-blur-sm pointer-events-none">
                                                                <span className="font-semibold text-amber-400">"{parsed.snippet.slice(0, 40)}{parsed.snippet.length > 40 ? '...' : ''}"</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : isCopy ? (
                                    <div
                                        className="w-[680px] max-w-[90vw] max-h-[78vh] overflow-y-auto rounded-xl bg-zinc-900 text-zinc-100 shadow-2xl border border-zinc-800 select-text leading-relaxed"
                                    >
                                      <div
                                        ref={copyContainerRef}
                                        onMouseUp={handleCopyMouseUp}
                                        className="relative min-h-[500px] p-8 sm:p-10"
                                      >
                                        <div className="border-b border-zinc-800 pb-4 mb-6 flex items-start justify-between gap-4">
                                            <div>
                                                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                                                    <FileText size={14} className="text-[#9db669]" />
                                                    Material Copy / Texto
                                                </span>
                                                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{activeDesign.name}</h2>
                                            </div>
                                            {activeDesign.textContent && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            const textToCopy = richTextToPlainText(activeDesign.textContent || '');
                                                            await navigator.clipboard.writeText(textToCopy);
                                                            setCopyCopied(true);
                                                            setTimeout(() => setCopyCopied(false), 2000);
                                                        } catch {}
                                                    }}
                                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-[#9db669] hover:text-[#d0f08e]"
                                                >
                                                    {copyCopied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                                    <span>{copyCopied ? 'Copiado!' : 'Copiar texto'}</span>
                                                </button>
                                            )}
                                        </div>

                                        <CopyTextWithHighlights
                                            content={activeDesign.textContent || ''}
                                            safeHtml={safeCopyHtml}
                                            isRichText={/<\/?[a-z][\s\S]*>/i.test(activeDesign.textContent || '')}
                                            comments={safeComments}
                                            selectedCommentId={selectedCommentId}
                                            hoveredCommentId={hoveredCommentId}
                                            onSelect={handleSelectPin}
                                            onMatchedCommentsChange={setHighlightedCopyCommentIds}
                                            onHover={(commentId) => {
                                                setHoveredCommentId(commentId);
                                                if (commentId) {
                                                    document.getElementById(`comment-card-${commentId}`)?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'nearest',
                                                    });
                                                }
                                            }}
                                        />

                                        {/* Balão flutuante para comentar no trecho da copy */}
                                        {activeTextSelection && (
                                            <div
                                                className="absolute z-40 -translate-x-1/2 -translate-y-full pb-2 animate-in fade-in zoom-in-95 duration-150"
                                                style={{
                                                    left: `${activeTextSelection.point.x}%`,
                                                    top: `${activeTextSelection.point.y}%`,
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={handleStartCommentOnSelection}
                                                    className="flex items-center gap-1.5 rounded-full bg-[#5d55c7] hover:bg-[#6e66db] text-white px-3 py-1.5 text-xs font-semibold shadow-xl ring-2 ring-white/20 transition-all hover:scale-105"
                                                >
                                                    <MessageSquare size={13} />
                                                    Comentar este trecho
                                                </button>
                                            </div>
                                        )}

                                        {/* Fallback para comentários pontuais sem um trecho textual associado */}
                                        {comments
                                            .filter((c) => (
                                                c.point &&
                                                typeof c.point.x === 'number' &&
                                                typeof c.point.y === 'number' &&
                                                !highlightedCopyCommentIds.includes(c.id)
                                            ))
                                            .map((c) => {
                                                const number = markerNumber(c.id);
                                                const isSelected = selectedCommentId === c.id;
                                                const isHovered = hoveredCommentId === c.id;
                                                const parsed = parseQuotedSnippet(c.text);

                                                return (
                                                    <div
                                                        key={c.id}
                                                        style={{ left: `${c.point!.x}%`, top: `${c.point!.y}%` }}
                                                        className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectPin(c.id)}
                                                            onMouseEnter={() => {
                                                                setHoveredCommentId(c.id);
                                                                const el = document.getElementById(`comment-card-${c.id}`);
                                                                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                                            }}
                                                            onMouseLeave={() => setHoveredCommentId(null)}
                                                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all shadow-lg ${
                                                                c.resolved
                                                                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50 opacity-80 hover:opacity-100'
                                                                    : isHovered || isSelected
                                                                    ? 'bg-amber-400 text-black ring-4 ring-amber-300 scale-125 shadow-amber-400/50 animate-pulse'
                                                                    : 'bg-[#5d55c7] text-white ring-2 ring-white hover:scale-110 hover:bg-[#6e66db]'
                                                            }`}
                                                            title={`${c.author}: "${parsed.cleanText}"`}
                                                        >
                                                            {number}
                                                        </button>
                                                        {isHovered && parsed.snippet && (
                                                            <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 z-40 whitespace-nowrap rounded-md bg-zinc-900 border border-amber-400/60 px-2.5 py-1 text-[11px] text-amber-200 shadow-xl backdrop-blur-sm pointer-events-none">
                                                                <span className="font-semibold text-amber-400">"{parsed.snippet.slice(0, 40)}{parsed.snippet.length > 40 ? '...' : ''}"</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                      </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400 max-w-md bg-zinc-900 rounded-xl border border-zinc-800">
                                        <FileText size={48} className="text-zinc-500 mb-3" />
                                        <h3 className="text-lg font-medium text-white">{activeDesign.name}</h3>
                                        <p className="mt-1 text-xs text-zinc-400">
                                            {activeDesign.textContent || 'Arquivo textual ou sem prévia interativa de imagem direta.'}
                                        </p>
                                        {fileUrl && (
                                            <button
                                                type="button"
                                                onClick={() => void downloadAllyoFile(fileUrl, activeDesign.name || 'anexo')}
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#9db669] px-4 py-2 text-xs font-semibold text-black hover:bg-[#b0cc77]"
                                            >
                                                <Download size={14} /> Baixar anexo
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rodapé explicativo do canvas */}
                        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-[#121a14] px-6 py-2.5 text-xs text-zinc-400">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <span className={isCopy
                                        ? 'h-2.5 w-5 rounded-sm border-b-2 border-amber-400 bg-amber-400/20'
                                        : 'h-2.5 w-2.5 rounded-full bg-[#5d55c7]'}
                                    />
                                    {isCopy ? 'Trechos destacados = ajustes na copy' : 'Pinos numéricos = comentários do cliente'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    Verde = ajustes resolvidos
                                </span>
                            </div>
                            <span>
                                {isCopy
                                    ? 'Passe o mouse ou clique no trecho para localizar o comentário'
                                    : 'Passe o mouse ou clique no marcador para localizar o comentário'}
                            </span>
                        </div>
                    </div>

                    {/* Sidebar direita: Lista de comentários e anotações */}
                    <aside className="flex w-96 flex-col border-l border-zinc-800 bg-[#131b15]">
                        
                        {/* Filtros da sidebar */}
                        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                Feedback ({comments.length})
                            </span>
                            <div className="flex rounded-lg bg-zinc-900/90 p-0.5 border border-zinc-800 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setFilter('all')}
                                    className={`rounded-md px-2.5 py-1 font-medium transition ${
                                        filter === 'all' ? 'bg-[#9db669] text-black font-semibold' : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    Todos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilter('open')}
                                    className={`rounded-md px-2.5 py-1 font-medium transition ${
                                        filter === 'open' ? 'bg-[#9db669] text-black font-semibold' : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    Abertos ({openComments.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilter('resolved')}
                                    className={`rounded-md px-2.5 py-1 font-medium transition ${
                                        filter === 'resolved' ? 'bg-[#9db669] text-black font-semibold' : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    Resolvidos ({resolvedComments.length})
                                </button>
                            </div>
                        </div>

                        {/* Lista de Comentários */}
                        <div ref={commentsListRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                            {isLoading && (
                                <p className="py-8 text-center text-xs text-zinc-500">
                                    Carregando anotações e comentários...
                                </p>
                            )}

                            {!isLoading && visibleComments.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
                                    <MessageSquare size={32} className="stroke-1 opacity-40 mb-2" />
                                    <p className="text-xs">Nenhum comentário nesta visualização.</p>
                                </div>
                            )}

                            {!isLoading &&
                                visibleComments.map((c) => {
                                    const number = markerNumber(c.id);
                                    const hasPin = Boolean(c.point);
                                    const isSelected = selectedCommentId === c.id;
                                    const isHovered = hoveredCommentId === c.id;
                                    const parsed = parseQuotedSnippet(c.text);

                                    return (
                                        <article
                                            key={c.id}
                                            id={`comment-card-${c.id}`}
                                            onClick={() => {
                                                if (isPdf) {
                                                    const targetPage = getCommentPage(c);
                                                    if (targetPage !== pdfPage) {
                                                        setPdfPage(targetPage);
                                                    }
                                                }
                                                setSelectedCommentId(c.id);
                                            }}
                                            onMouseEnter={() => setHoveredCommentId(c.id)}
                                            onMouseLeave={() => setHoveredCommentId(null)}
                                            className={`rounded-xl border p-3.5 transition-all text-xs cursor-pointer ${
                                                c.resolved
                                                    ? isHovered
                                                        ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-400'
                                                        : 'border-emerald-900/40 bg-emerald-950/20 text-zinc-300'
                                                    : isHovered || isSelected
                                                    ? 'border-amber-400 bg-zinc-800/90 shadow-lg ring-2 ring-amber-400/50 scale-[1.01]'
                                                    : 'border-zinc-800 bg-[#18231c] text-zinc-200 hover:border-zinc-700'
                                            }`}
                                        >
                                            <header className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    {hasPin && (
                                                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white transition-all ${
                                                            isHovered ? 'bg-amber-400 text-black ring-2 ring-amber-300 scale-110' : 'bg-[#5d55c7]'
                                                        }`}>
                                                            {number}
                                                        </span>
                                                    )}
                                                    <span className="font-semibold text-white">
                                                        {c.author}
                                                    </span>
                                                    {(() => {
                                                        const cPage = getCommentPage(c);
                                                        if (!hasPin && !isPdf) return null;
                                                        return (
                                                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                                                                {hasPin
                                                                    ? `Marcação ${number}${isPdf ? ` · Pág. ${cPage}` : ''}`
                                                                    : `Pág. ${cPage}`}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                                <span className="text-[10px] text-zinc-400 shrink-0">
                                                    {c.time}
                                                </span>
                                            </header>

                                            {/* Trecho selecionado destacado */}
                                            {parsed.snippet && (
                                                <div className="mb-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 text-[11px] text-amber-200 flex items-start gap-1.5">
                                                    <Type size={13} className="shrink-0 text-amber-400 mt-0.5" />
                                                    <div className="italic leading-snug">
                                                        <span className="font-semibold text-amber-400 not-italic">Trecho: </span>
                                                        "{parsed.snippet}"
                                                    </div>
                                                </div>
                                            )}

                                            <p className="text-[13px] leading-relaxed break-words text-zinc-100 mb-3">
                                                {parsed.cleanText}
                                            </p>

                                            <footer className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[11px]">
                                                <span className="text-zinc-500">
                                                    {isCopy && parsed.snippet
                                                        ? 'Trecho marcado no texto'
                                                        : hasPin ? 'Marcador no arquivo' : 'Comentário geral'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleResolved(c.id, c.resolved);
                                                    }}
                                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                                                        c.resolved
                                                            ? 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800'
                                                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                                    }`}
                                                >
                                                    <CheckCircle2 size={12} />
                                                    {c.resolved ? 'Resolvido' : 'Marcar resolvido'}
                                                </button>
                                            </footer>
                                        </article>
                                    );
                                })}
                        </div>

                        {/* Input para resposta do criativo */}
                        <form onSubmit={handleSendReply} className="border-t border-zinc-800 p-4 bg-[#101712]">
                            {/* Prévia do trecho selecionado ao responder */}
                            {selectedSnippet && (
                                <div className="mb-2.5 flex items-center justify-between gap-2 rounded-lg bg-amber-500/15 border border-amber-500/40 px-2.5 py-1.5 text-xs text-amber-200">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Type size={13} className="shrink-0 text-amber-400" />
                                        <span className="truncate">
                                            <strong className="text-amber-400">Trecho:</strong> "{selectedSnippet}"
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSnippet(null)}
                                        className="text-amber-400 hover:text-white shrink-0 p-0.5 rounded transition"
                                        title="Remover trecho"
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            )}

                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
                                <CornerDownRight size={12} />
                                Responder ao cliente sobre este arquivo
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="creative-reply-input"
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={selectedSnippet ? "Comente sobre o trecho selecionado..." : "Digite uma observação ou alinhamento..."}
                                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#9db669] focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!replyText.trim() || isSubmittingReply}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#9db669] text-black transition hover:bg-[#b0cc77] disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Enviar comentário"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </form>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export const AllyoReviewModal: React.FC<AllyoReviewModalProps> = (props) => {
    if (!props.isOpen || !props.design) return null;
    return (
        <ReviewModalErrorBoundary onClose={props.onClose}>
            <AllyoReviewModalInner {...props} />
        </ReviewModalErrorBoundary>
    );
};

export default AllyoReviewModal;
