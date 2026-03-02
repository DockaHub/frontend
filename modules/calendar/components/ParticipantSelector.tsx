import React, { useState, useEffect } from 'react';
import { Users, X } from 'lucide-react';

interface Participant {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface ParticipantSelectorProps {
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    organizationId: string;
}

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
    selectedIds,
    onChange,
    organizationId
}) => {
    const [members, setMembers] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                // Fetch organization members
                const response = await fetch(`/api/organizations/${organizationId}/members`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                setMembers(data);
            } catch (error) {
                console.error('Failed to fetch members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [organizationId]);

    const toggleParticipant = (userId: string) => {
        if (selectedIds.includes(userId)) {
            onChange(selectedIds.filter(id => id !== userId));
        } else {
            onChange([...selectedIds, userId]);
        }
    };

    const selectedMembers = members.filter(m => selectedIds.includes(m.id));
    const availableMembers = members.filter(m => !selectedIds.includes(m.id));

    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase">
                Participantes
            </label>

            {/* Selected Participants */}
            {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedMembers.map(member => (
                        <div
                            key={member.id}
                            className="flex items-center gap-2 bg-docka-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg group"
                        >
                            {member.avatar ? (
                                <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-5 h-5 rounded-full"
                                />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-docka-300 dark:bg-zinc-600 flex items-center justify-center text-xs font-bold text-docka-700 dark:text-zinc-200">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-sm font-medium text-docka-900 dark:text-zinc-100">
                                {member.name}
                            </span>
                            <button
                                onClick={() => toggleParticipant(member.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-docka-500 hover:text-docka-900 dark:text-zinc-500 dark:hover:text-zinc-200"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Dropdown Selector */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm text-left flex items-center gap-2 hover:border-docka-400 dark:hover:border-zinc-500 transition-colors"
                >
                    <Users size={16} className="text-docka-400 dark:text-zinc-500" />
                    <span className="text-docka-600 dark:text-zinc-400">
                        {selectedIds.length > 0
                            ? `${selectedIds.length} selecionado${selectedIds.length > 1 ? 's' : ''}`
                            : 'Adicionar participantes'}
                    </span>
                </button>

                {showDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {loading ? (
                            <div className="p-4 text-center text-sm text-docka-500 dark:text-zinc-400">
                                Carregando...
                            </div>
                        ) : availableMembers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-docka-500 dark:text-zinc-400">
                                {selectedIds.length > 0 ? 'Todos os membros foram adicionados' : 'Nenhum membro disponível'}
                            </div>
                        ) : (
                            availableMembers.map(member => (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => {
                                        toggleParticipant(member.id);
                                    }}
                                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-docka-50 dark:hover:bg-zinc-700 transition-colors text-left"
                                >
                                    {member.avatar ? (
                                        <img
                                            src={member.avatar}
                                            alt={member.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-docka-300 dark:bg-zinc-600 flex items-center justify-center text-sm font-bold text-docka-700 dark:text-zinc-200">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">
                                            {member.name}
                                        </div>
                                        <div className="text-xs text-docka-500 dark:text-zinc-400">
                                            {member.email}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Click outside to close */}
            {showDropdown && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </div>
    );
};

export default ParticipantSelector;
