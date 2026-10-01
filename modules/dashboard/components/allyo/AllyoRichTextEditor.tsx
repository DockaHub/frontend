import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Quote,
    Code,
    Link2,
    Unlink,
    Minus,
    RemoveFormatting,
    Undo2,
    Redo2,
    Highlighter,
    Maximize2,
    Minimize2,
    Code2,
    Eye,
} from 'lucide-react';

interface AllyoRichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
    minHeight?: string;
}

export const AllyoRichTextEditor: React.FC<AllyoRichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Escreva ou cole o conteúdo do documento, artigo ou tradução aqui...',
    disabled = false,
    minHeight = '360px',
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showHtmlSource, setShowHtmlSource] = useState(false);
    const [currentFormat, setCurrentFormat] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        unorderedList: false,
        orderedList: false,
        alignLeft: false,
        alignCenter: false,
        alignRight: false,
        alignJustify: false,
        blockType: 'p',
    });

    // Atualiza o estado da barra de ferramentas conforme a seleção atual
    const updateActiveFormat = useCallback(() => {
        if (!editorRef.current || disabled) return;
        try {
            const isBold = document.queryCommandState('bold');
            const isItalic = document.queryCommandState('italic');
            const isUnderline = document.queryCommandState('underline');
            const isStrike = document.queryCommandState('strikeThrough');
            const isUl = document.queryCommandState('insertUnorderedList');
            const isOl = document.queryCommandState('insertOrderedList');
            const isLeft = document.queryCommandState('justifyLeft');
            const isCenter = document.queryCommandState('justifyCenter');
            const isRight = document.queryCommandState('justifyRight');
            const isJustify = document.queryCommandState('justifyFull');

            // Detecta tipo de bloco do nó selecionado
            let block = 'p';
            const sel = window.getSelection();
            if (sel && sel.anchorNode) {
                let el: HTMLElement | null =
                    sel.anchorNode.nodeType === Node.ELEMENT_NODE
                        ? (sel.anchorNode as HTMLElement)
                        : sel.anchorNode.parentElement;
                while (el && el !== editorRef.current) {
                    const tag = el.tagName.toLowerCase();
                    if (['h1', 'h2', 'h3', 'blockquote', 'pre', 'p'].includes(tag)) {
                        block = tag;
                        break;
                    }
                    el = el.parentElement;
                }
            }

            setCurrentFormat({
                bold: isBold,
                italic: isItalic,
                underline: isUnderline,
                strikeThrough: isStrike,
                unorderedList: isUl,
                orderedList: isOl,
                alignLeft: isLeft,
                alignCenter: isCenter,
                alignRight: isRight,
                alignJustify: isJustify,
                blockType: block,
            });
        } catch {
            // queryCommandState pode falhar em alguns contextos
        }
    }, [disabled]);

    // Sincroniza o valor inicial apenas quando o conteúdo difere substancialmente
    useEffect(() => {
        if (!editorRef.current) return;
        const currentHtml = editorRef.current.innerHTML;
        const normalizedProp = value || '';
        // Evita re-render / cursor jumping se o HTML já for o mesmo
        if (currentHtml !== normalizedProp && document.activeElement !== editorRef.current) {
            editorRef.current.innerHTML = normalizedProp;
        }
    }, [value]);

    useEffect(() => {
        const handleSelectionChange = () => {
            if (editorRef.current && editorRef.current.contains(document.activeElement)) {
                updateActiveFormat();
            }
        };
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, [updateActiveFormat]);

    const exec = (command: string, arg?: string) => {
        if (disabled) return;
        if (editorRef.current) {
            editorRef.current.focus();
        }
        document.execCommand(command, false, arg);
        updateActiveFormat();
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (!editorRef.current) return;
        onChange(editorRef.current.innerHTML);
        updateActiveFormat();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Atalhos de teclado comuns
        if (e.metaKey || e.ctrlKey) {
            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                exec('bold');
            } else if (e.key === 'i' || e.key === 'I') {
                e.preventDefault();
                exec('italic');
            } else if (e.key === 'u' || e.key === 'U') {
                e.preventDefault();
                exec('underline');
            }
        }
    };

    const handleBlockChange = (tag: string) => {
        if (tag === 'p') {
            exec('formatBlock', '<p>');
        } else if (['h1', 'h2', 'h3'].includes(tag)) {
            exec('formatBlock', `<${tag}>`);
        } else if (tag === 'blockquote') {
            exec('formatBlock', '<blockquote>');
        } else if (tag === 'pre') {
            exec('formatBlock', '<pre>');
        }
    };

    const handleInsertLink = () => {
        const currentUrl = prompt('Digite a URL do link (ex: https://exemplo.com):');
        if (currentUrl) {
            const validUrl = currentUrl.startsWith('http://') || currentUrl.startsWith('https://')
                ? currentUrl
                : `https://${currentUrl}`;
            exec('createLink', validUrl);
        }
    };

    const handleHighlight = () => {
        exec('hiliteColor', '#fef08a'); // Amarelo suave
    };

    const isEmpty = !value || value === '<p></p>' || value === '<br>' || value.trim() === '';

    return (
        <div
            className={`flex flex-col rounded-[12px] border transition-all ${
                isFullscreen
                    ? 'fixed inset-0 z-50 rounded-none bg-white p-6 dark:bg-zinc-950'
                    : 'border-[#dedede] bg-white dark:border-zinc-800 dark:bg-zinc-900/50'
            }`}
        >
            {/* Barra de Ferramentas Completa */}
            <div className="flex flex-wrap items-center gap-1 border-b border-[#e5e5e5] bg-[#fafbf8] p-2 dark:border-zinc-800 dark:bg-zinc-900">
                {/* Histórico: Desfazer / Refazer */}
                <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#e0e0e0] dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={() => exec('undo')}
                        disabled={disabled}
                        title="Desfazer (Ctrl+Z)"
                        className="rounded p-1.5 text-[#555] hover:bg-[#eaeaea] hover:text-black disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        <Undo2 size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('redo')}
                        disabled={disabled}
                        title="Refazer (Ctrl+Y)"
                        className="rounded p-1.5 text-[#555] hover:bg-[#eaeaea] hover:text-black disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        <Redo2 size={15} />
                    </button>
                </div>

                {/* Seletor de Estilo de Bloco */}
                <div className="flex items-center gap-0.5 px-1.5 border-r border-[#e0e0e0] dark:border-zinc-700">
                    <select
                        value={currentFormat.blockType}
                        onChange={(e) => handleBlockChange(e.target.value)}
                        disabled={disabled}
                        className="h-7 rounded border border-[#dedede] bg-white px-2 text-xs font-medium text-[#444] outline-none hover:border-[#9db669] focus:border-[#9db669] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                        <option value="p">Parágrafo</option>
                        <option value="h1">Título 1 (H1)</option>
                        <option value="h2">Título 2 (H2)</option>
                        <option value="h3">Título 3 (H3)</option>
                        <option value="blockquote">Citação</option>
                        <option value="pre">Código pré-formatado</option>
                    </select>
                </div>

                {/* Formatação Inline: Negrito, Itálico, Sublinhado, Tachado, Marca-texto */}
                <div className="flex items-center gap-0.5 px-1.5 border-r border-[#e0e0e0] dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={() => exec('bold')}
                        disabled={disabled}
                        title="Negrito (Ctrl+B)"
                        className={`rounded p-1.5 transition ${
                            currentFormat.bold
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        <Bold size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('italic')}
                        disabled={disabled}
                        title="Itálico (Ctrl+I)"
                        className={`rounded p-1.5 transition ${
                            currentFormat.italic
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        <Italic size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('underline')}
                        disabled={disabled}
                        title="Sublinhado (Ctrl+U)"
                        className={`rounded p-1.5 transition ${
                            currentFormat.underline
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        <Underline size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('strikeThrough')}
                        disabled={disabled}
                        title="Tachado"
                        className={`rounded p-1.5 transition ${
                            currentFormat.strikeThrough
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        <Strikethrough size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={handleHighlight}
                        disabled={disabled}
                        title="Marca-texto / Destaque"
                        className="rounded p-1.5 text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        <Highlighter size={15} />
                    </button>
                </div>

                {/* Listas: Marcadores e Numerada */}
                <div className="flex items-center gap-0.5 px-1.5 border-r border-[#e0e0e0] dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={() => exec('insertUnorderedList')}
                        disabled={disabled}
                        title="Lista com marcadores"
                        className={`rounded p-1.5 transition ${
                            currentFormat.unorderedList
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        <List size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('insertOrderedList')}
                        disabled={disabled}
                        title="Lista numerada"
                        className={`rounded p-1.5 transition ${
                            currentFormat.orderedList
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        <ListOrdered size={15} />
                    </button>
                </div>

                {/* Alinhamento: Esquerda, Centro, Direita, Justificado */}
                <div className="flex items-center gap-0.5 px-1.5 border-r border-[#e0e0e0] dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={() => exec('justifyLeft')}
                        disabled={disabled}
                        title="Alinhar à esquerda"
                        className={`rounded p-1.5 transition ${
                            currentFormat.alignLeft
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        <AlignLeft size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyCenter')}
                        disabled={disabled}
                        title="Centralizar"
                        className={`rounded p-1.5 transition ${
                            currentFormat.alignCenter
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        <AlignCenter size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyRight')}
                        disabled={disabled}
                        title="Alinhar à direita"
                        className={`rounded p-1.5 transition ${
                            currentFormat.alignRight
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        <AlignRight size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyFull')}
                        disabled={disabled}
                        title="Justificar"
                        className={`rounded p-1.5 transition ${
                            currentFormat.alignJustify
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        <AlignJustify size={15} />
                    </button>
                </div>

                {/* Inserções: Link, Citação, Divisor */}
                <div className="flex items-center gap-0.5 px-1.5 border-r border-[#e0e0e0] dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={handleInsertLink}
                        disabled={disabled}
                        title="Inserir Link"
                        className="rounded p-1.5 text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        <Link2 size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('unlink')}
                        disabled={disabled}
                        title="Remover Link"
                        className="rounded p-1.5 text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        <Unlink size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleBlockChange('blockquote')}
                        disabled={disabled}
                        title="Bloco de Citação"
                        className="rounded p-1.5 text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        <Quote size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('insertHorizontalRule')}
                        disabled={disabled}
                        title="Linha Divisória"
                        className="rounded p-1.5 text-[#555] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        <Minus size={15} />
                    </button>
                </div>

                {/* Ações / Visualização */}
                <div className="flex items-center gap-0.5 pl-1.5 ml-auto">
                    <button
                        type="button"
                        onClick={() => exec('removeFormat')}
                        disabled={disabled}
                        title="Limpar formatação"
                        className="rounded p-1.5 text-[#777] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        <RemoveFormatting size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowHtmlSource(!showHtmlSource)}
                        title={showHtmlSource ? 'Voltar para modo visual' : 'Ver código HTML'}
                        className={`rounded p-1.5 transition ${
                            showHtmlSource
                                ? 'bg-[#131f15] text-white dark:bg-[#d0f08e] dark:text-[#131f15]'
                                : 'text-[#777] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                        }`}
                    >
                        {showHtmlSource ? <Eye size={15} /> : <Code2 size={15} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        title={isFullscreen ? 'Sair da tela cheia' : 'Modo tela cheia (foco na escrita)'}
                        className="rounded p-1.5 text-[#777] hover:bg-[#eaeaea] hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    >
                        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>
                </div>
            </div>

            {/* Área de Edição */}
            <div className="relative flex-1 p-4 sm:p-6 overflow-y-auto">
                {showHtmlSource ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        rows={16}
                        className="w-full resize-none font-mono text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 bg-transparent outline-none"
                    />
                ) : (
                    <>
                        <div
                            ref={editorRef}
                            contentEditable={!disabled}
                            onInput={handleInput}
                            onKeyDown={handleKeyDown}
                            onBlur={updateActiveFormat}
                            onMouseUp={updateActiveFormat}
                            onKeyUp={updateActiveFormat}
                            style={{ minHeight }}
                            className="rich-text-editor-content outline-none text-[15px] leading-relaxed text-zinc-900 dark:text-zinc-100 select-text selection:bg-[#9db669]/30
                            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-black dark:[&_h1]:text-white
                            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-black dark:[&_h2]:text-white
                            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-black dark:[&_h3]:text-white
                            [&_p]:my-2
                            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
                            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
                            [&_li]:my-0.5
                            [&_blockquote]:border-l-4 [&_blockquote]:border-[#9db669] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-[#555] dark:[&_blockquote]:text-zinc-400
                            [&_pre]:bg-[#f4f5f1] dark:[&_pre]:bg-zinc-800 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-xs [&_pre]:my-3 [&_pre]:overflow-x-auto
                            [&_hr]:my-4 [&_hr]:border-[#e5e5e5] dark:[&_hr]:border-zinc-800
                            [&_a]:text-[#739044] dark:[&_a]:text-[#a6c464] [&_a]:underline [&_a]:font-medium"
                        />
                        {isEmpty && (
                            <div className="pointer-events-none absolute left-6 top-6 text-sm text-[#aaa] dark:text-zinc-500">
                                {placeholder}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AllyoRichTextEditor;
