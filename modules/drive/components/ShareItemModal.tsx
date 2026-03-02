import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, User, Users } from 'lucide-react';
import { DriveItem } from '../../../types';
import { driveService } from '../../../services/driveService';
import { useAuth } from '../../../context/AuthContext';

interface ShareItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: DriveItem | null;
}

interface ShareUser {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    permission: string;
}

export function ShareItemModal({ isOpen, onClose, item }: ShareItemModalProps) {
    const { user } = useAuth();
    const token = localStorage.getItem('token');
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('VIEW');
    const [loading, setLoading] = useState(false);
    const [shares, setShares] = useState<ShareUser[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && item && token) {
            loadShares();
        } else {
            setShares([]);
            setEmail('');
            setError('');
        }
    }, [isOpen, item, token]);

    const loadShares = async () => {
        if (!item || !token) return;
        try {
            // Recarrega o item para garantir que temos os shares atualizados
            const updatedItem = await driveService.getItem(item.id, token);
            // Mapeia os shares para o formato de exibição
            // O backend retorna shares dentro do item se for dono
            if (updatedItem.shares) {
                const formattedShares = updatedItem.shares.map((s: any) => ({
                    id: s.user.id,
                    email: s.user.email,
                    name: s.user.name,
                    avatar: s.user.avatar,
                    permission: s.permission
                }));
                setShares(formattedShares);
            }
        } catch (err) {
            console.error('Erro ao carregar compartilhamentos:', err);
        }
    };

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item || !token) return;

        setLoading(true);
        setError('');

        try {
            await driveService.shareItem(item.id, email, permission as 'VIEW' | 'EDIT', token);
            setEmail('');
            await loadShares(); // Recarrega a lista
        } catch (err: any) {
            setError(err.message || 'Erro ao compartilhar item');
        } finally {
            setLoading(false);
        }
    };

    const handleUnshare = async (targetUserId: string) => {
        if (!item || !token) return;
        if (!confirm('Tem certeza que deseja remover o acesso deste usuário?')) return;

        try {
            await driveService.unshareItem(item.id, targetUserId, token);
            await loadShares();
        } catch (err: any) {
            setError(err.message || 'Erro ao remover compartilhamento');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#1C1C1E] rounded-2xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Users size={20} className="text-blue-400" />
                        Compartilhar "{item?.name}"
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Formulário de Adicionar */}
                    <form onSubmit={handleShare} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Adicionar pessoas</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Endereço de email"
                                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                                    required
                                />
                                <select
                                    value={permission}
                                    onChange={(e) => setPermission(e.target.value)}
                                    className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value="VIEW">Leitor</option>
                                    <option value="EDIT">Editor</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Compartilhar
                                </>
                            )}
                        </button>
                    </form>

                    {/* Lista de Pessoas com Acesso */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-400">Pessoas com acesso</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {/* Dono (Eu) */}
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                        {user?.name?.[0] || 'Eu'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-white font-medium">Você (Proprietário)</span>
                                        <span className="text-xs text-gray-500">{user?.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Outros usuários */}
                            {shares.map((share) => (
                                <div key={share.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                            {share.name?.[0] || share.email[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-white font-medium">{share.name || share.email}</span>
                                            <span className="text-xs text-gray-500">{share.permission === 'EDIT' ? 'Editor' : 'Leitor'}</span>
                                        </div>
                                    </div>
                                    {/* Apenas mostramos o botão de remover se EU for o dono do item (que já foi verificado na abertura pois shares só vem se eu for dono, ou se formos implementar logica de editor remover editor) */}
                                    <button
                                        onClick={() => handleUnshare(share.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remover acesso"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
