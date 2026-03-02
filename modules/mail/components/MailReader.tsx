
import React, { useEffect, useState } from 'react';
import { Star, MoreHorizontal, Reply, CornerUpRight, Sparkles, X, Printer, Download, Hexagon, ChevronLeft, Archive, Trash2, MailOpen, Mail } from 'lucide-react';
import { Email } from '../../../types';
import { summarizeEmail } from '../../../services/geminiService';
import Modal from '../../../components/common/Modal';

interface MailReaderProps {
    email: Email | undefined;
    onClose: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onReply: () => void;
    onForward: () => void;
    onToggleRead: () => void;
}

const MailReader: React.FC<MailReaderProps> = ({ email, onClose, onArchive, onDelete, onReply, onForward, onToggleRead }) => {
    const [summary, setSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

    useEffect(() => {
        setSummary('');
        setIsMenuOpen(false);
        if (email) {
            setLoadingSummary(true);
            const timer = setTimeout(async () => {
                const result = await summarizeEmail(email.body.replace(/<[^>]*>?/gm, ''));
                setSummary(result);
                setLoadingSummary(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [email]);

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = () => setIsMenuOpen(false);
        if (isMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMenuOpen]);

    if (!email) {
        return (
            <div className="flex-1 hidden lg:flex flex-col items-center justify-center bg-docka-50/30 dark:bg-zinc-900/30">
                <div className="flex flex-col items-center max-w-sm text-center p-8">
                    <div className="w-20 h-20 bg-docka-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner text-docka-300 dark:text-zinc-600">
                        <Hexagon size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-docka-900 dark:text-zinc-100 mb-2">Selecione um item para ler</h3>
                    <p className="text-docka-500 dark:text-zinc-500 text-sm leading-relaxed">
                        Clique em um e-mail da lista para visualizá-lo aqui. Use <kbd className="font-mono bg-docka-100 dark:bg-zinc-800 px-1 rounded text-xs">Cmd</kbd> + <kbd className="font-mono bg-docka-100 dark:bg-zinc-800 px-1 rounded text-xs">K</kbd> para buscar rapidamente.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900 relative animate-in fade-in duration-300">
            {/* Actions Toolbar */}
            <div className="h-16 border-b border-docka-100 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center space-x-2">
                    <button onClick={onClose} className="lg:hidden p-2 -ml-2 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md text-docka-600 dark:text-zinc-400 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="hidden lg:flex items-center bg-docka-100/50 dark:bg-zinc-800/50 p-1 rounded-lg border border-docka-200/50 dark:border-zinc-700/50">
                        <button
                            onClick={onReply}
                            className="px-3 py-1.5 text-xs font-medium text-docka-600 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700 rounded-md shadow-sm transition-all flex items-center gap-2"
                        >
                            <Reply size={14} /> Responder
                        </button>
                        <div className="w-px h-4 bg-docka-300/30 dark:bg-zinc-700 mx-1" />
                        <button
                            onClick={onForward}
                            className="px-3 py-1.5 text-xs font-medium text-docka-600 dark:text-zinc-400 hover:text-docka-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700 rounded-md hover:shadow-sm transition-all flex items-center gap-2"
                        >
                            <CornerUpRight size={14} /> Encaminhar
                        </button>
                    </div>
                </div>
                <div className="flex items-center space-x-1 text-docka-500 dark:text-zinc-500">
                    <button
                        onClick={() => setShowArchiveConfirm(true)}
                        className="p-2 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md hover:text-docka-900 dark:hover:text-zinc-200 transition-colors"
                        title="Arquivar"
                    >
                        <Archive size={18} />
                    </button>

                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                            className={`p-2 rounded-md transition-colors ${isMenuOpen ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : 'hover:bg-docka-100 dark:hover:bg-zinc-800 hover:text-docka-900 dark:hover:text-zinc-100'}`}
                            title="Mais opções"
                        >
                            <MoreHorizontal size={18} />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 p-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleRead(); setIsMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 rounded-md flex items-center gap-2"
                                >
                                    {email.read ? <Mail size={14} /> : <MailOpen size={14} />}
                                    {email.read ? 'Marcar como não lida' : 'Marcar como lida'}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); window.print(); setIsMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 rounded-md flex items-center gap-2"
                                >
                                    <Printer size={14} /> Imprimir
                                </button>
                                <div className="h-px bg-docka-100 dark:bg-zinc-700 my-1" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(); setIsMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Excluir
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-[800px] mx-auto p-6 md:p-10">

                    {/* Email Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-6 gap-4">
                            <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 leading-tight tracking-tight">{email.subject}</h1>
                            <button className="mt-1 text-docka-300 dark:text-zinc-600 hover:text-amber-400 transition-colors shrink-0">
                                <Star size={22} fill={email.starred ? "#fbbf24" : "none"} className={email.starred ? "text-amber-400" : ""} />
                            </button>
                        </div>

                        <div className="flex items-start justify-between pb-8 border-b border-docka-100 dark:border-zinc-800">
                            <div className="flex items-center space-x-4">
                                <img src={email.from.avatar || "https://ui-avatars.com/api/?name=" + email.from.name} className="w-11 h-11 rounded-full object-cover border border-docka-200 dark:border-zinc-700 shadow-sm" alt="Avatar" />
                                <div>
                                    <div className="font-semibold text-docka-900 dark:text-zinc-100 text-[15px]">{email.from.name}</div>
                                    <div className="text-docka-500 dark:text-zinc-500 text-sm">{email.from.email}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-docka-600 dark:text-zinc-400">{email.timestamp}</div>
                                <div className="text-xs text-docka-400 dark:text-zinc-600 mt-0.5">via docka.io</div>
                            </div>
                        </div>

                        {/* AI Summary Card */}
                        <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/20 dark:to-zinc-900 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex items-start gap-4 shadow-sm">
                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg border border-indigo-100 dark:border-indigo-800 shadow-sm text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Sparkles size={16} />
                            </div>
                            <div className="flex-1 pt-0.5">
                                <h4 className="text-[10px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-1.5 opacity-70">Docka Intelligence</h4>
                                <p className="text-sm text-docka-800 dark:text-zinc-300 leading-relaxed font-medium">
                                    {loadingSummary ? (
                                        <span className="flex items-center gap-1.5 opacity-50">
                                            <span className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce delay-75" />
                                            <span className="w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce delay-150" />
                                        </span>
                                    ) : (
                                        summary || "Análise completa."
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Email Body */}
                    <div className="prose prose-slate dark:prose-invert prose-lg max-w-none text-docka-800 dark:text-zinc-300 selection:bg-indigo-100 selection:text-indigo-900">
                        <div className="font-sans text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: email.body }} />
                    </div>

                    {/* Attachments - TODO: Implement real attachments */}
                    {/* 
                    {email.hasAttachments && (
                        <div className="mt-12 pt-6 border-t border-docka-100 dark:border-zinc-800">
                            <h5 className="text-[11px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Anexos</h5>
                            <div className="text-sm text-docka-500 dark:text-zinc-400 italic">
                                Visualização de anexos em breve.
                            </div>
                        </div>
                    )}
                    */}

                    {/* Reply Area */}
                    <div
                        onClick={onReply}
                        className="mt-12 mb-20 flex gap-4 opacity-70 hover:opacity-100 transition-opacity cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full border border-docka-200 dark:border-zinc-700 bg-docka-100 dark:bg-zinc-800 flex items-center justify-center text-docka-400 dark:text-zinc-500">
                            <Reply size={20} />
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute top-0 left-0 w-full h-full border border-docka-300 dark:border-zinc-700 group-hover:border-docka-400 dark:group-hover:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 shadow-sm flex flex-col transition-all">
                                <div className="p-4 text-docka-400 dark:text-zinc-500 text-sm flex items-center gap-2">
                                    Clique aqui para responder...
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Archive Confirmation Modal */}
            <Modal
                isOpen={showArchiveConfirm}
                onClose={() => setShowArchiveConfirm(false)}
                title="Arquivar conversa?"
                size="sm"
                footer={
                    <>
                        <button onClick={() => setShowArchiveConfirm(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Cancelar</button>
                        <button
                            onClick={() => { onArchive(); setShowArchiveConfirm(false); }}
                            className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm"
                        >
                            Arquivar
                        </button>
                    </>
                }
            >
                <p className="text-sm text-docka-600 dark:text-zinc-400">
                    Esta conversa será movida para a pasta "Arquivados" e sairá da sua caixa de entrada principal.
                </p>
            </Modal>
        </div>
    );
};

export default MailReader;
