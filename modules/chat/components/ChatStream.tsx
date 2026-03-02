
import React, { useRef, useEffect, useState } from 'react';
import { Hash, Users, Phone, Video, MoreHorizontal, Paperclip, Smile, Send, Plus, Search, BellOff, Info, FileText, Code, Zap } from 'lucide-react';
import { ChatChannel, ChatMessage } from '../../../types';
import { useCall } from '../../../context/CallContext';
import { useAuth } from '../../../context/AuthContext';

interface ChatStreamProps {
    channel: ChatChannel;
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
}

const ChatStream: React.FC<ChatStreamProps> = ({ channel, messages, onSendMessage }) => {
    const endRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState('');

    // Header States
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);

    // Input States
    const [isInputMenuOpen, setIsInputMenuOpen] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setIsHeaderMenuOpen(false);
            setIsInputMenuOpen(false);
            setIsEmojiPickerOpen(false);
        };
        // Simple delay to allow button clicks to propagate
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    }

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            onSendMessage(`[Arquivo enviado: ${fileName}]`);
        }
    }

    const insertEmoji = (emoji: string) => {
        setInput(prev => prev + emoji);
    }

    // Call Context
    const { callUser } = useCall();
    const { user } = useAuth(); // We need current user to find the "other" person in DM

    const handleCall = (type: 'audio' | 'video') => {
        // Logic to find the user to call
        let targetUserId = '';
        let targetUserName = channel.name;

        if (channel.type === 'dm' && channel.memberIds && user) {
            targetUserId = channel.memberIds.find(id => id !== user.id) || '';
        }

        if (!targetUserId) {
            console.error("Could not determine user to call");
            return;
        }

        // For now, we treat audio/video same in signal, but UI could differentiate
        callUser(targetUserId, targetUserName);
    }

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 h-full relative transition-colors duration-300">

            {/* Call Overlay Simulation */}
            {isCallActive && (
                <div className="absolute top-16 left-0 right-0 z-20 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-3 flex items-center justify-between animate-in slide-in-from-top-2 border-b border-docka-800 dark:border-zinc-200">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="font-medium text-sm">Chamando {channel.name}...</span>
                    </div>
                    <button onClick={() => setIsCallActive(false)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
                        Cancelar
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="h-16 border-b border-docka-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm z-10 sticky top-0">
                <div className="flex items-center">
                    {channel.type === 'dm' ? (
                        <div className="flex items-center">
                            <img src={channel.userAvatar} className="w-8 h-8 rounded-lg mr-3 border border-docka-100 dark:border-zinc-800" alt="" />
                            <span className="font-bold text-docka-900 dark:text-zinc-100">{channel.name}</span>
                            {channel.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full ml-2 border border-white dark:border-zinc-950" title="Online" />}
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center">
                                <Hash size={18} className="text-docka-400 dark:text-zinc-500 mr-1" />
                                <span className="font-bold text-docka-900 dark:text-zinc-100">{channel.name}</span>
                            </div>
                            <div className="text-xs text-docka-500 dark:text-zinc-500 mt-0.5 flex items-center">
                                <span className="mr-2">Tópico: Atualizações gerais</span>
                                <span className="w-1 h-1 bg-docka-300 dark:bg-zinc-600 rounded-full mx-2" />
                                <Users size={12} className="mr-1" /> 24 membros
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2 text-docka-400 dark:text-zinc-500">
                    <button onClick={() => handleCall('audio')} className="p-2 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md hover:text-docka-900 dark:hover:text-zinc-200 transition-colors" title="Iniciar chamada de voz"><Phone size={18} /></button>
                    <button onClick={() => handleCall('video')} className="p-2 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md hover:text-docka-900 dark:hover:text-zinc-200 transition-colors" title="Iniciar chamada de vídeo"><Video size={20} /></button>

                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsHeaderMenuOpen(!isHeaderMenuOpen); }}
                            className={`p-2 rounded-md transition-colors ${isHeaderMenuOpen ? 'bg-docka-100 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : 'hover:bg-docka-100 dark:hover:bg-zinc-800 hover:text-docka-900 dark:hover:text-zinc-100'}`}
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        {isHeaderMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 origin-top-right py-1">
                                <button className="w-full text-left px-4 py-2.5 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 flex items-center gap-2">
                                    <Info size={16} /> Ver detalhes do canal
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 flex items-center gap-2">
                                    <Search size={16} /> Buscar nesta conversa
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 flex items-center gap-2">
                                    <BellOff size={16} /> Silenciar notificações
                                </button>
                                <div className="h-px bg-docka-100 dark:bg-zinc-700 my-1" />
                                <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                    Sair do canal
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" onClick={() => { setIsInputMenuOpen(false); setIsEmojiPickerOpen(false); }}>
                {/* Welcome Placeholder */}
                <div className="mt-8 mb-12">
                    <div className="w-16 h-16 bg-docka-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                        {channel.type === 'dm' ? <img src={channel.userAvatar} className="w-full h-full rounded-2xl border border-docka-200 dark:border-zinc-700" /> : <Hash size={32} className="text-docka-400 dark:text-zinc-500" />}
                    </div>
                    <h1 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">
                        {channel.type === 'dm' ? channel.name : `Bem-vindo ao #${channel.name}!`}
                    </h1>
                    <p className="text-docka-500 dark:text-zinc-500 mt-2">
                        Este é o começo da sua conversa. {channel.type === 'public' && "Este canal é público para a organização."}
                    </p>
                </div>

                {messages.map((msg, idx) => {
                    const prev = messages[idx - 1];
                    const isSequence = prev && prev.senderId === msg.senderId;
                    return (
                        <div key={msg.id} className={`group flex ${isSequence ? 'mt-1' : 'mt-6'}`}>
                            {!isSequence ? (
                                <img src={msg.senderAvatar} className="w-10 h-10 rounded-lg mr-4 mt-1 border border-docka-100 dark:border-zinc-800" alt="" />
                            ) : (
                                <div className="w-10 mr-4 text-xs text-docka-300 dark:text-zinc-600 text-right opacity-0 group-hover:opacity-100 pt-1 select-none">
                                    {msg.timestamp.split(' ')[0]}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                {!isSequence && (
                                    <div className="flex items-baseline mb-1">
                                        <span className="font-bold text-docka-900 dark:text-zinc-100 mr-2 text-sm">{msg.senderName}</span>
                                        <span className="text-xs text-docka-400 dark:text-zinc-500">{msg.timestamp}</span>
                                    </div>
                                )}
                                <div className="text-docka-800 dark:text-zinc-300 text-[15px] leading-relaxed">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 px-6 pb-6 pt-2 relative">
                <div className="bg-white dark:bg-zinc-900 border border-docka-300 dark:border-zinc-700 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-zinc-700 focus-within:border-indigo-400 dark:focus-within:border-zinc-500 transition-all relative z-20">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Mensagem para ${channel.type === 'dm' ? channel.name : '#' + channel.name}...`}
                        className="w-full bg-transparent p-3 max-h-32 outline-none text-sm text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600 rounded-t-xl"
                        autoFocus
                    />
                    <div className="flex items-center justify-between p-2 bg-docka-50/50 dark:bg-zinc-800/50 rounded-b-xl border-t border-docka-100 dark:border-zinc-800">
                        <div className="flex space-x-1 relative">
                            {/* Plus Menu */}
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsInputMenuOpen(!isInputMenuOpen); setIsEmojiPickerOpen(false); }}
                                    className={`p-1.5 rounded transition-colors ${isInputMenuOpen ? 'bg-docka-200 dark:bg-zinc-700 text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500 hover:bg-docka-200 dark:hover:bg-zinc-700'}`}
                                >
                                    <Plus size={16} />
                                </button>
                                {isInputMenuOpen && (
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95">
                                        <button className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 flex items-center gap-2 rounded-t-lg" onClick={handleAttachClick}>
                                            <FileText size={14} /> Upload do computador
                                        </button>
                                        <button className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 flex items-center gap-2">
                                            <Code size={14} /> Criar snippet de código
                                        </button>
                                        <button className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 flex items-center gap-2 rounded-b-lg">
                                            <Zap size={14} /> Atalho de comando
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Emoji Picker */}
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsEmojiPickerOpen(!isEmojiPickerOpen); setIsInputMenuOpen(false); }}
                                    className={`p-1.5 rounded transition-colors ${isEmojiPickerOpen ? 'bg-docka-200 dark:bg-zinc-700 text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500 hover:bg-docka-200 dark:hover:bg-zinc-700'}`}
                                >
                                    <Smile size={16} />
                                </button>
                                {isEmojiPickerOpen && (
                                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 w-64 grid grid-cols-6 gap-1">
                                        {['👍', '👎', '😀', '😂', '🎉', '🚀', '👀', '🔥', '❤️', '✅', '🤔', '🙌', '💯', '💩', '👋', '🙏', '😎', '😭'].map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => { insertEmoji(emoji); setIsEmojiPickerOpen(false); }}
                                                className="text-xl p-1 hover:bg-docka-100 dark:hover:bg-zinc-700 rounded"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Attachment */}
                            <button
                                onClick={handleAttachClick}
                                className="p-1.5 text-docka-400 dark:text-zinc-500 hover:bg-docka-200 dark:hover:bg-zinc-700 rounded transition-colors"
                                title="Anexar arquivo"
                            >
                                <Paperclip size={16} />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className={`p-1.5 rounded transition-colors ${input.trim() ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm' : 'bg-docka-200 dark:bg-zinc-700 text-docka-400 dark:text-zinc-500'}`}
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
                <div className="text-center text-[10px] text-docka-400 dark:text-zinc-600 mt-2">
                    <strong>Dica:</strong> Pressione <strong>Enter</strong> para enviar.
                </div>
            </div>
        </div>
    );
};

export default ChatStream;
