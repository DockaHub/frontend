import React from 'react';
import { Smile, Reply, Send, Bookmark, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';

interface MessageActionsToolbarProps {
    onReact?: (emoji: string) => void;
    onReply?: () => void;
    onForward?: () => void;
    onSave?: () => void;
    onMore?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
    isAuthor?: boolean;
}

const MessageActionsToolbar: React.FC<MessageActionsToolbarProps> = ({
    onReact,
    onReply,
    onForward,
    onSave,
    onMore,
    onEdit,
    onDelete,
    className = "",
    isAuthor = false
}) => {
    const [isMoreMenuOpen, setIsMoreMenuOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMoreMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`flex items-center gap-0.5 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-sm p-0.5 z-30 ${className}`}>
            {/* Quick Reactions */}
            <button 
                onClick={() => onReact?.('✅')} 
                className="p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded text-lg leading-none transition-colors"
                title="Concluído"
            >
                ✅
            </button>
            <button 
                onClick={() => onReact?.('👀')} 
                className="p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded text-lg leading-none transition-colors"
                title="Olhando"
            >
                👀
            </button>
            <button 
                onClick={() => onReact?.('🙌')} 
                className="p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded text-lg leading-none transition-colors"
                title="Mãos para cima"
            >
                🙌
            </button>

            <div className="w-px h-4 bg-docka-200 dark:bg-zinc-700 mx-0.5" />

            {/* Standard Actions */}
            <button 
                onClick={onReact ? () => onReact('') : undefined} 
                className="p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-100 transition-colors"
                title="Adicionar reação"
            >
                <Smile size={18} />
            </button>
            
            <button 
                onClick={onReply} 
                className="p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-100 transition-colors"
                title="Responder em thread"
            >
                <Reply size={18} />
            </button>

            <button 
                onClick={onSave} 
                className="p-1.5 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded text-docka-500 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-100 transition-colors"
                title="Salvar"
            >
                <Bookmark size={18} />
            </button>

            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} 
                    className={`p-1.5 rounded transition-colors ${isMoreMenuOpen ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 hover:text-docka-900 dark:hover:text-zinc-100'}`}
                    title="Mais ações"
                >
                    <MoreHorizontal size={18} />
                </button>

                {isMoreMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                        {isAuthor && (
                            <>
                                <button 
                                    onClick={() => { onEdit?.(); setIsMoreMenuOpen(false); }}
                                    className="w-full text-left px-3 py-1.5 text-sm text-docka-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white flex items-center gap-2"
                                >
                                    <Edit2 size={14} /> Editar mensagem
                                </button>
                                <button 
                                    onClick={() => { onDelete?.(); setIsMoreMenuOpen(false); }}
                                    className="w-full text-left px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Excluir mensagem
                                </button>
                                <div className="h-px bg-docka-100 dark:bg-zinc-800 my-1" />
                            </>
                        )}
                        <button className="w-full text-left px-3 py-1.5 text-sm text-docka-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white flex items-center gap-2">
                             Copiar link
                        </button>
                        <button className="w-full text-left px-3 py-1.5 text-sm text-docka-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white flex items-center gap-2">
                             Marcar como não lida
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageActionsToolbar;
