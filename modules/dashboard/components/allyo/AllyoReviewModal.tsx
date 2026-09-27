import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    CheckCircle2,
    Clock,
    MessageSquare,
    Send,
    Eye,
    Download,
    CornerDownRight,
    AlertCircle,
    Layers,
    FileText
} from 'lucide-react';
import allyoService, { AllyoDesignAsset, AllyoReviewComment, AllyoReviewAnnotation } from '../../../../services/allyoService';

interface AllyoReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    design: AllyoDesignAsset | null;
    taskName?: string;
    onCommentResolved?: (commentId: number, resolved: boolean) => void;
}

export const AllyoReviewModal: React.FC<AllyoReviewModalProps> = ({
    isOpen,
    onClose,
    design,
    taskName,
    onCommentResolved,
}) => {
    const [zoom, setZoom] = useState(100);
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
    const [comments, setComments] = useState<AllyoReviewComment[]>([]);
    const [annotations, setAnnotations] = useState<AllyoReviewAnnotation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const commentsListRef = useRef<HTMLDivElement>(null);

    // Carrega dados frescos de revisão via API ao abrir o modal
    useEffect(() => {
        if (!isOpen || !design?.id) return;

        setComments(design.comments || []);
        setAnnotations(design.annotations || []);
        setIsLoading(true);

        allyoService.getDesignReview(design.id)
            .then((fresh) => {
                if (fresh) {
                    if (fresh.comments) setComments(fresh.comments);
                    if (fresh.annotations) setAnnotations(fresh.annotations);
                }
            })
            .catch((err) => {
                console.warn('[AllyoReviewModal] Erro ao buscar revisão atualizada:', err);
            })
            .finally(() => setIsLoading(false));
    }, [isOpen, design?.id]);

    if (!isOpen || !design) return null;

    const openComments = comments.filter((c) => !c.resolved);
    const resolvedComments = comments.filter((c) => c.resolved);
    const visibleComments = filter === 'open' ? openComments : filter === 'resolved' ? resolvedComments : comments;

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

    // Enviar resposta / novo comentário
    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = replyText.trim();
        if (!text || isSubmittingReply) return;

        setIsSubmittingReply(true);
        try {
            const res = await allyoService.addDesignComment(design.id, {
                text,
                version: Number(design.version?.replace(/\D/g, '')) || 1,
            });

            const newComment: AllyoReviewComment = {
                id: res?.id || Date.now(),
                author: 'Você (Criativo)',
                text,
                time: 'Agora',
                resolved: false,
                version: Number(design.version?.replace(/\D/g, '')) || 1,
            };

            setComments((prev) => [...prev, newComment]);
            setReplyText('');
            setSelectedCommentId(newComment.id);
        } catch (err) {
            console.warn('[AllyoReviewModal] Erro ao enviar comentário:', err);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleSelectPin = (commentId: number) => {
        setSelectedCommentId(commentId);
        // Scroll comment into view
        const element = document.getElementById(`comment-card-${commentId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    const fileUrl = design.fileUrl || design.thumbnailUrl;
    const isImage = !design.contentType || design.contentType.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(design.name);

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
                                <h2 className="truncate text-base font-semibold text-white" title={design.name}>
                                    {design.name}
                                </h2>
                                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                                    {design.version || 'v1'}
                                </span>
                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    design.approved
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                                }`}>
                                    {design.approved ? 'Aprovado pelo cliente' : 'Em revisão com anotações'}
                                </span>
                            </div>
                            <p className="truncate text-xs text-zinc-400">
                                {taskName || 'Revisão da entrega'} • {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'} e {annotations.length} {annotations.length === 1 ? 'marcação' : 'marcações'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {fileUrl && (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700"
                                title="Abrir imagem original"
                            >
                                <Download size={13} />
                                Original
                            </a>
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
                        
                        {/* Barra de ferramentas de Zoom */}
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#162019]/90 p-1.5 shadow-lg backdrop-blur-md">
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
                        <div className="flex-1 overflow-auto p-6 sm:p-12 flex items-center justify-center">
                            <div
                                className="relative transition-transform duration-100 ease-out origin-center shadow-2xl rounded-lg"
                                style={{ transform: `scale(${zoom / 100})` }}
                            >
                                {isImage && fileUrl ? (
                                    <div className="relative select-none">
                                        <img
                                            src={fileUrl}
                                            alt={design.name}
                                            className="max-h-[75vh] max-w-[80vw] rounded-lg object-contain block bg-zinc-950 border border-zinc-800"
                                            draggable={false}
                                        />

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

                                            {annotations.map((ann, idx) => {
                                                const color = ann.color || '#5d55c7';
                                                const strokeW = (ann.width || 3) * 0.15;

                                                if (ann.type === 'draw' && ann.points && ann.points.length > 1) {
                                                    const pathD = ann.points.reduce(
                                                        (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
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

                                                if (ann.type === 'rectangle' && ann.start && ann.end) {
                                                    const minX = Math.min(ann.start.x, ann.end.x);
                                                    const minY = Math.min(ann.start.y, ann.end.y);
                                                    const width = Math.abs(ann.end.x - ann.start.x);
                                                    const height = Math.abs(ann.end.y - ann.start.y);
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
                                                            fillOpacity="0.18"
                                                            rx="1"
                                                        />
                                                    );
                                                }

                                                if (ann.type === 'arrow' && ann.start && ann.end) {
                                                    return (
                                                        <line
                                                            key={ann.id || idx}
                                                            x1={ann.start.x}
                                                            y1={ann.start.y}
                                                            x2={ann.end.x}
                                                            y2={ann.end.y}
                                                            stroke={color}
                                                            strokeWidth={strokeW}
                                                            markerEnd="url(#arrowhead)"
                                                        />
                                                    );
                                                }

                                                return null;
                                            })}
                                        </svg>

                                        {/* Pinos / Marcadores dos Comentários pontuais */}
                                        {comments
                                            .filter((c) => c.point && typeof c.point.x === 'number' && typeof c.point.y === 'number')
                                            .map((c, index) => {
                                                const isSelected = selectedCommentId === c.id;
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => handleSelectPin(c.id)}
                                                        style={{ left: `${c.point!.x}%`, top: `${c.point!.y}%` }}
                                                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all shadow-lg ${
                                                            c.resolved
                                                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50 opacity-80 hover:opacity-100'
                                                                : isSelected
                                                                ? 'bg-amber-400 text-black ring-4 ring-amber-300 scale-125'
                                                                : 'bg-[#5d55c7] text-white ring-2 ring-white hover:scale-110 hover:bg-[#6e66db]'
                                                        }`}
                                                        title={`${c.author}: "${c.text}"`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-400 max-w-md bg-zinc-900 rounded-xl border border-zinc-800">
                                        <FileText size={48} className="text-zinc-500 mb-3" />
                                        <h3 className="text-lg font-medium text-white">{design.name}</h3>
                                        <p className="mt-1 text-xs text-zinc-400">
                                            {design.textContent || 'Arquivo textual ou sem prévia interativa de imagem direta.'}
                                        </p>
                                        {fileUrl && (
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#9db669] px-4 py-2 text-xs font-semibold text-black hover:bg-[#b0cc77]"
                                            >
                                                <Eye size={14} /> Abrir anexo
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rodapé explicativo do canvas */}
                        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-[#121a14] px-6 py-2.5 text-xs text-zinc-400">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#5d55c7]" />
                                    Pinos numéricos = comentários do cliente
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    Verde = ajustes resolvidos
                                </span>
                            </div>
                            <span>Clique em qualquer número no arquivo para localizar o comentário</span>
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
                                    const pinIndex = comments.findIndex((item) => item.id === c.id);
                                    const hasPin = Boolean(c.point);
                                    const isSelected = selectedCommentId === c.id;

                                    return (
                                        <article
                                            key={c.id}
                                            id={`comment-card-${c.id}`}
                                            onClick={() => setSelectedCommentId(c.id)}
                                            className={`rounded-xl border p-3.5 transition-all text-xs ${
                                                c.resolved
                                                    ? 'border-emerald-900/40 bg-emerald-950/20 text-zinc-300'
                                                    : isSelected
                                                    ? 'border-amber-400/80 bg-zinc-800/80 shadow-md ring-1 ring-amber-400/40'
                                                    : 'border-zinc-800 bg-[#18231c] text-zinc-200 hover:border-zinc-700'
                                            }`}
                                        >
                                            <header className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    {hasPin && (
                                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5d55c7] text-[10px] font-bold text-white">
                                                            {pinIndex + 1}
                                                        </span>
                                                    )}
                                                    <span className="font-semibold text-white">
                                                        {c.author}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-zinc-400 shrink-0">
                                                    {c.time}
                                                </span>
                                            </header>

                                            <p className="text-[13px] leading-relaxed break-words text-zinc-100 mb-3">
                                                {c.text}
                                            </p>

                                            <footer className="flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[11px]">
                                                <span className="text-zinc-500">
                                                    {hasPin ? 'Marcador no arquivo' : 'Comentário geral'}
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
                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 flex items-center gap-1">
                                <CornerDownRight size={12} />
                                Responder ao cliente sobre este arquivo
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Digite uma observação ou alinhamento..."
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

export default AllyoReviewModal;
