
import React, { useState, useEffect, useMemo } from 'react';
import { Organization, ChatChannel, ChatMessage } from '../../types';
import { MOCK_CONTACTS } from '../../constants';
import ChatSidebar from './components/ChatSidebar';
import ChatStream from './components/ChatStream';
import Modal from '../../components/common/Modal';
import { chatService } from '../../services/chatService';
import { socketService } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';
import { organizationService } from '../../services/organizationService';

interface ChatLayoutProps {
    currentOrg: Organization;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ currentOrg }) => {
    const { user: currentUser } = useAuth();
    const [selectedChannelId, setSelectedChannelId] = useState<string>('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [channels, setChannels] = useState<ChatChannel[]>([]);
    const [orgMembers, setOrgMembers] = useState<any[]>([]);

    // Modal States
    const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
    const [isNewDMOpen, setIsNewDMOpen] = useState(false);

    // Form States
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const [newChannelPrivate, setNewChannelPrivate] = useState(false);
    const [dmSearch, setDmSearch] = useState('');

    // 1. Initialize Socket, Fetch Channels and Members
    useEffect(() => {
        socketService.connect();

        if (currentOrg?.id) {
            loadChannels();
            loadMembers();
        }

        return () => {
            socketService.disconnect();
        };
    }, [currentOrg?.id]);

    const isOwner = currentOrg.memberRole ? currentOrg.memberRole === 'OWNER' : true;

    const loadChannels = async () => {
        try {
            const fetchedChannels = await chatService.getChannels(currentOrg.id);
            setChannels(fetchedChannels);
            if (fetchedChannels.length > 0 && !selectedChannelId) {
                setSelectedChannelId(fetchedChannels[0].id);
            }
        } catch (error) {
            console.error("Failed to load channels", error);
        }
    };

    const loadMembers = async () => {
        try {
            const members = await organizationService.getMembers(currentOrg.id);
            setOrgMembers(members || []);
        } catch (error) {
            console.error("Failed to load organization members", error);
        }
    };

    // Compute Display Channels (Real + Virtual DMs)
    const displayChannels = useMemo(() => {
        if (!currentUser) return channels;

        // 1. Process Real Channels (add name/avatar for DMs)
        const processedReal = channels.map(c => {
            if (c.type === 'dm') {
                const otherMemberId = c.memberIds?.find(id => id !== currentUser.id);
                // Check orgMembers to find details
                const otherMember = orgMembers.find(m => m.user.id === otherMemberId);

                // If we found the user, use their details. Otherwise fallback to existing data
                if (otherMember) {
                    return {
                        ...c,
                        name: otherMember.user.name,
                        userAvatar: otherMember.user.avatar,
                        isOnline: otherMember.user.status === 'ONLINE'
                    };
                }
            }
            return c;
        });

        // 2. Identify Users who already have a DM
        const existingDMUserIds = new Set(
            channels
                .filter(c => c.type === 'dm')
                .flatMap(c => c.memberIds || [])
        );

        // Add current user to set to avoid listing self
        existingDMUserIds.add(currentUser.id);

        // 3. Create Virtual DMs for other members
        const virtualDMs: ChatChannel[] = orgMembers
            .filter(m => !existingDMUserIds.has(m.user.id))
            .map(m => ({
                id: `virtual-${m.user.id}`,
                name: m.user.name,
                type: 'dm',
                userAvatar: m.user.avatar,
                isOnline: m.user.status === 'ONLINE',
                memberIds: [currentUser.id, m.user.id],
                isPlaceholder: true
            }));

        return [...processedReal, ...virtualDMs];
    }, [channels, orgMembers, currentUser]);

    // 2. Fetch Messages and Join Room when Channel Select
    useEffect(() => {
        if (!selectedChannelId || selectedChannelId.startsWith('virtual-')) return;

        const loadMessages = async () => {
            try {
                const msgs = await chatService.getMessages(selectedChannelId);
                setMessages(msgs);
            } catch (error) {
                console.error("Failed to load messages", error);
            }
        };

        loadMessages();
        socketService.joinChannel(selectedChannelId);

        return () => {
            socketService.leaveChannel(selectedChannelId);
        };
    }, [selectedChannelId]);

    // 3. Listen for new messages and status updates
    useEffect(() => {
        const handleReceiveMessage = (newMessage: any) => {
            // Map backend message to frontend format
            const mappedMsg: ChatMessage = {
                id: newMessage.id,
                senderId: newMessage.senderId,
                senderName: newMessage.sender.name,
                senderAvatar: newMessage.sender.avatar,
                content: newMessage.content,
                timestamp: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            // Only append if it belongs to current channel
            if (newMessage.channelId === selectedChannelId) {
                setMessages(prev => [...prev, mappedMsg]);
            }
        };

        const handleStatusChange = (data: { userId: string, status: string }) => {
            setOrgMembers(prev => prev.map(member =>
                member.user.id === data.userId
                    ? { ...member, user: { ...member.user, status: data.status } }
                    : member
            ));
        };

        socketService.on('receive_message', handleReceiveMessage);
        socketService.on('user_status_change', handleStatusChange);

        return () => {
            socketService.off('receive_message', handleReceiveMessage);
            socketService.off('user_status_change', handleStatusChange);
        };
    }, [selectedChannelId]);

    const currentChannel = displayChannels.find(c => c.id === selectedChannelId) || displayChannels[0];

    const handleSendMessage = async (content: string) => {
        if (!selectedChannelId || selectedChannelId.startsWith('virtual-')) return;
        try {
            await chatService.sendMessage(selectedChannelId, content);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const handleCreateChannel = async () => {
        if (!newChannelName.trim()) return;

        try {
            const newChannel = await chatService.createChannel(currentOrg.id, {
                name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
                type: newChannelPrivate ? 'private' : 'public'
            });

            setChannels(prev => [...prev, newChannel]);
            setSelectedChannelId(newChannel.id);

            setIsCreateChannelOpen(false);
            setNewChannelName('');
            setNewChannelDesc('');
            setNewChannelPrivate(false);
        } catch (error: any) {
            console.error("Failed to create channel", error);
            alert(error.response?.data?.error || "Erro ao criar canal. Verifique se você tem permissão.");
        }
    };

    const handleStartDM = async (user: any) => {
        try {
            const newDM = await chatService.createChannel(currentOrg.id, {
                name: 'dm',
                type: 'dm',
                members: [user.id]
            });

            // Check if already in list
            if (!channels.find(c => c.id === newDM.id)) {
                setChannels(prev => [...prev, newDM]);
            }
            setSelectedChannelId(newDM.id);
            setIsNewDMOpen(false);
            setDmSearch('');
        } catch (error) {
            console.error("Failed to start DM", error);
        }
    };

    // Intercept Selection
    const handleChannelSelect = async (channelId: string) => {
        if (channelId.startsWith('virtual-')) {
            const userId = channelId.replace('virtual-', '');
            const member = orgMembers.find(m => m.user.id === userId);
            if (member) {
                await handleStartDM(member.user);
            }
        } else {
            setSelectedChannelId(channelId);
        }
    };

    // ... (Keep existing UI rendering logic for Modals etc.)
    const filteredContacts = MOCK_CONTACTS.filter(c =>
        c.name.toLowerCase().includes(dmSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(dmSearch.toLowerCase())
    );

    return (
        <div className="flex h-full w-full bg-white dark:bg-zinc-950 overflow-hidden transition-colors duration-300">
            <ChatSidebar
                channels={displayChannels}
                selectedChannelId={selectedChannelId}
                onSelectChannel={handleChannelSelect}
                currentOrg={currentOrg}
                onAddChannel={isOwner ? () => setIsCreateChannelOpen(true) : undefined}
                onNewDM={() => setIsNewDMOpen(true)}
            />
            {currentChannel ? (
                <ChatStream
                    channel={currentChannel}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center text-docka-400">
                    Selecione ou crie um canal
                </div>
            )}

            {/* CREATE CHANNEL MODAL */}
            <Modal
                isOpen={isCreateChannelOpen}
                onClose={() => setIsCreateChannelOpen(false)}
                title="Criar um canal"
                footer={
                    <>
                        <button onClick={() => setIsCreateChannelOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                        <button
                            onClick={handleCreateChannel}
                            disabled={!newChannelName}
                            className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                        >
                            Criar
                        </button>
                    </>
                }
            >
                {/* ... Keep Modal Content Same ... */}
                <div className="space-y-6">
                    <p className="text-sm text-docka-500 dark:text-zinc-400">
                        Os canais são onde as conversas acontecem sobre um tópico específico. Use um nome fácil de encontrar.
                    </p>

                    <div>
                        <label className="block text-sm font-bold text-docka-900 dark:text-zinc-100 mb-2">Nome</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500 font-bold">#</span>
                            <input
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                                placeholder="ex: plano-orcamento"
                                className="w-full pl-7 pr-12 py-2.5 bg-white dark:bg-zinc-800 border border-docka-300 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-4 focus:ring-docka-100 dark:focus:ring-zinc-700 focus:border-docka-400 dark:focus:border-zinc-500 transition-all placeholder:text-docka-300 dark:placeholder:text-zinc-600 font-medium text-docka-900 dark:text-zinc-100"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-docka-400 dark:text-zinc-500 font-medium">
                                {80 - newChannelName.length}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-docka-900 dark:text-zinc-100 mb-2">Descrição <span className="text-docka-400 dark:text-zinc-500 font-normal">(Opcional)</span></label>
                        <input
                            value={newChannelDesc}
                            onChange={(e) => setNewChannelDesc(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 border border-docka-300 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 transition-all placeholder:text-docka-300 dark:placeholder:text-zinc-600 text-docka-900 dark:text-zinc-100"
                            placeholder="Sobre o que é este canal?"
                        />
                        <p className="text-xs text-docka-500 dark:text-zinc-500 mt-1">O que é este canal?</p>
                    </div>

                    <div className="pt-4 border-t border-docka-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                                <span className="font-bold text-docka-900 dark:text-zinc-100 text-sm">Tornar privado</span>
                                <span className="text-xs text-docka-500 dark:text-zinc-400">Quando um canal é privado, ele só pode ser visualizado ou acessado por convite.</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={newChannelPrivate} onChange={(e) => setNewChannelPrivate(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-docka-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-docka-100 dark:peer-focus:ring-zinc-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-zinc-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-docka-900 dark:peer-checked:bg-zinc-100"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* NEW DM MODAL */}
            <Modal
                isOpen={isNewDMOpen}
                onClose={() => setIsNewDMOpen(false)}
                title="Nova Mensagem"
                size="lg"
            >
                {/* ... Keep DM Modal Content Same ... */}
                <div className="h-[400px] flex flex-col -mt-2">
                    <div className="border-b border-docka-200 dark:border-zinc-800 pb-2 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-docka-500 dark:text-zinc-400">Para:</span>
                            <input
                                autoFocus
                                value={dmSearch}
                                onChange={(e) => setDmSearch(e.target.value)}
                                className="flex-1 outline-none text-sm text-docka-900 dark:text-zinc-100 placeholder:text-docka-300 dark:placeholder:text-zinc-600 bg-transparent"
                                placeholder="#a-canal, @alguém ou alguém@exemplo.com"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredContacts.length > 0 ? (
                            <div className="space-y-1">
                                {filteredContacts.map(contact => (
                                    <button
                                        key={contact.id}
                                        onClick={() => handleStartDM(contact)}
                                        className="w-full flex items-center gap-3 p-2 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-lg transition-colors text-left group"
                                    >
                                        <img src={contact.avatar} className="w-8 h-8 rounded-md border border-docka-200 dark:border-zinc-700" alt="" />
                                        <div>
                                            <div className="text-sm font-bold text-docka-900 dark:text-zinc-100 group-hover:text-docka-700 dark:group-hover:text-white">{contact.name}</div>
                                            <div className="text-xs text-docka-500 dark:text-zinc-500">{contact.email}</div>
                                        </div>
                                        <div className={`ml-auto w-2 h-2 rounded-full ${contact.status === 'online' ? 'bg-green-500' : 'bg-docka-300 dark:bg-zinc-600'}`} />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center mt-12">
                                <p className="text-docka-400 dark:text-zinc-600 text-sm">Ninguém encontrado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ChatLayout;
