
import React, { useState, useEffect } from 'react';
import { Task, Organization } from '../../../types';
import Modal from '../../../components/common/Modal';
import { useAuth } from '../../../context/AuthContext';
import {
    Calendar, AlignLeft, Tag, ArrowRight, Trash2, Clock, Users, Building2, X, ChevronDown
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { organizationService } from '../../../services/organizationService';

interface TaskDetailModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (updatedTask: Task) => void;
    onDelete: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, onUpdate, onDelete }) => {
    const [editedTask, setEditedTask] = useState<Task | null>(null);
    const [newTag, setNewTag] = useState('');
    const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(false);

    const { user } = useAuth();
    const { addToast } = useToast();

    // Load user organizations
    useEffect(() => {
        const loadOrganizations = async () => {
            if (!isOpen || !user) return;

            try {
                setLoadingOrgs(true);
                const orgs = await organizationService.getMyOrganizations();
                setUserOrganizations(orgs);
                console.log('✅ Loaded organizations:', orgs);
            } catch (error) {
                console.error('Failed to load organizations:', error);
            } finally {
                setLoadingOrgs(false);
            }
        };

        loadOrganizations();
    }, [isOpen, user]);

    useEffect(() => {
        if (task) {
            console.log('📋 Task Modal - Received task data:', {
                id: task.id,
                title: task.title,
                organizationId: task.organizationId,
                organization: task.organization,
                creatorId: task.creatorId,
                creator: task.creator,
                assigneeId: task.assigneeId,
                assignee: task.assignee,
                tags: task.tags,
                dueDate: task.dueDate
            });
        }
        setEditedTask(task);
    }, [task]);

    if (!editedTask) return null;

    const handleStatusChange = (newStatus: Task['status']) => {
        const updated = { ...editedTask, status: newStatus };
        setEditedTask(updated);
        onUpdate(updated);
    };

    const handlePriorityChange = (newPriority: Task['priority']) => {
        const updated = { ...editedTask, priority: newPriority };
        setEditedTask(updated);
        onUpdate(updated);
    };

    const handleSave = () => {
        onUpdate(editedTask);
        addToast({
            type: 'success',
            title: 'Tarefa Atualizada',
            message: `Alterações em "${editedTask.title}" foram salvas.`
        });
        onClose();
    };

    const handleDelete = () => {
        onDelete(editedTask.id);
        addToast({
            type: 'info',
            title: 'Tarefa Excluída',
            duration: 2000
        });
        onClose();
    }

    const handleAddTag = () => {
        if (!newTag.trim()) return;

        const tags = editedTask.tags || [];
        if (!tags.includes(newTag.trim())) {
            const updated = { ...editedTask, tags: [...tags, newTag.trim()] };
            setEditedTask(updated);
        }
        setNewTag('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const tags = editedTask.tags || [];
        const updated = { ...editedTask, tags: tags.filter(t => t !== tagToRemove) };
        setEditedTask(updated);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    // Helper to get user initials
    const getUserInitials = (name?: string) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Helper to get avatar color
    const getAvatarColor = (id?: string) => {
        if (!id) return 'bg-docka-400 dark:bg-zinc-600';
        const colors = [
            'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500',
            'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
        ];
        const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    const renderUserAvatar = (user?: { id: string; name: string; email: string; avatar?: string }, size: 'sm' | 'md' = 'md') => {
        if (!user) return null;

        const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';

        if (user.avatar) {
            return (
                <img
                    src={user.avatar}
                    alt={user.name}
                    className={`${sizeClasses} rounded-full object-cover`}
                />
            );
        }

        return (
            <div className={`${sizeClasses} rounded-full ${getAvatarColor(user.id)} flex items-center justify-center text-white font-bold`}>
                {getUserInitials(user.name)}
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="" // Custom header inside
            size="lg"
        >
            <div className="flex flex-col md:flex-row gap-6 -mt-2">
                {/* Main Content (Left) */}
                <div className="flex-1 space-y-6">
                    {/* Header Area */}
                    <div>
                        <div className="flex items-center flex-wrap gap-2 mb-3 text-xs text-docka-500 dark:text-zinc-500">
                            {/* Organization Badge - Always show if organizationId exists */}
                            {editedTask.organizationId && (
                                <>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-900/50 rounded-md">
                                        <Building2 size={12} className="text-indigo-600 dark:text-indigo-400" />
                                        <span className="font-medium text-indigo-700 dark:text-indigo-300">
                                            {editedTask.organization?.name || editedTask.organizationId}
                                        </span>
                                    </div>
                                    <span>/</span>
                                </>
                            )}
                            <span className="uppercase tracking-wider font-medium">{editedTask.id}</span>
                        </div>
                        <input
                            className="text-2xl font-bold text-docka-900 dark:text-zinc-100 w-full bg-transparent outline-none focus:bg-docka-50 dark:focus:bg-zinc-800 rounded px-1 -ml-1 transition-colors"
                            value={editedTask.title}
                            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                            placeholder="Título da tarefa"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-docka-700 dark:text-zinc-300">
                            <AlignLeft size={16} /> Descrição
                        </div>
                        <textarea
                            className="w-full min-h-[100px] p-3 text-sm text-docka-900 dark:text-zinc-100 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 focus:border-docka-300 dark:focus:border-zinc-600 resize-y leading-relaxed placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                            placeholder="Adicione uma descrição mais detalhada..."
                            value={editedTask.description || ''}
                            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                        />
                    </div>

                    {/* People Section */}
                    {(editedTask.creator || editedTask.assignee) && (
                        <div className="space-y-3 pt-4 border-t border-docka-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-sm font-bold text-docka-700 dark:text-zinc-300 mb-2">
                                <Users size={16} /> Pessoas
                            </div>

                            {/* Creator */}
                            {editedTask.creator && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-docka-600 dark:text-zinc-400">Criador</span>
                                    <div className="flex items-center gap-2">
                                        {renderUserAvatar(editedTask.creator, 'sm')}
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">{editedTask.creator.name}</div>
                                            <div className="text-xs text-docka-500 dark:text-zinc-500">{editedTask.creator.email}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Assignee */}
                            {editedTask.assignee && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-docka-600 dark:text-zinc-400">Responsável</span>
                                    <div className="flex items-center gap-2">
                                        {renderUserAvatar(editedTask.assignee, 'sm')}
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-docka-900 dark:text-zinc-100">{editedTask.assignee.name}</div>
                                            <div className="text-xs text-docka-500 dark:text-zinc-500">{editedTask.assignee.email}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Activity / Comments Placeholder */}
                    <div className="pt-6 border-t border-docka-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-sm font-bold text-docka-700 dark:text-zinc-300 mb-4">
                            <Clock size={16} /> Atividade
                        </div>
                        <div className="flex gap-3">
                            {user && renderUserAvatar(user as any)}
                            <div className="flex-1">
                                <input
                                    className="w-full px-3 py-2 text-sm text-docka-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md outline-none focus:border-docka-400 dark:focus:border-zinc-500 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                                    placeholder="Deixe um comentário..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div className="w-full md:w-64 space-y-6 md:border-l md:border-docka-100 dark:md:border-zinc-800 pl-0 md:pl-6">

                    {/* Status Selector */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase tracking-wider">Status</label>
                        <div className="relative">
                            <select
                                value={editedTask.status}
                                onChange={(e) => handleStatusChange(e.target.value as any)}
                                className="w-full appearance-none bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-900 dark:text-zinc-100 text-sm rounded-md px-3 py-2 pr-8 outline-none focus:border-docka-400 dark:focus:border-zinc-500 font-medium cursor-pointer"
                            >
                                <option value="BACKLOG">Backlog</option>
                                <option value="TODO">A Fazer</option>
                                <option value="IN_PROGRESS">Em Progresso</option>
                                <option value="DONE">Concluído</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-docka-400 dark:text-zinc-500">
                                <ArrowRight size={14} className="rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Priority Selector */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase tracking-wider">Prioridade</label>
                        <div className="flex gap-2">
                            {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => handlePriorityChange(p)}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all ${editedTask.priority === p
                                        ? p === 'HIGH' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400'
                                            : p === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400'
                                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400'
                                        : 'bg-white dark:bg-zinc-800 border-docka-200 dark:border-zinc-700 text-docka-500 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700'
                                        }`}
                                >
                                    {p === 'HIGH' ? 'Alta' : p === 'MEDIUM' ? 'Média' : 'Baixa'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Organization Selector */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 size={12} /> Organização
                        </label>
                        <div className="relative">
                            <select
                                value={editedTask.organizationId || ''}
                                onChange={(e) => {
                                    const newOrgId = e.target.value;
                                    const selectedOrg = userOrganizations.find(org => org.id === newOrgId);
                                    setEditedTask({
                                        ...editedTask,
                                        organizationId: newOrgId,
                                        organization: selectedOrg ? { id: selectedOrg.id, name: selectedOrg.name } : undefined
                                    });
                                }}
                                disabled={loadingOrgs}
                                className="w-full appearance-none bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-900 dark:text-zinc-100 text-sm rounded-md px-3 py-2 pr-8 outline-none focus:border-docka-400 dark:focus:border-zinc-500 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Selecione uma organização</option>
                                {userOrganizations
                                    .filter(org => !org.name.includes("'s Workspace"))
                                    .map(org => (
                                        <option key={org.id} value={org.id}>
                                            {org.name}
                                        </option>
                                    ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-docka-400 dark:text-zinc-500">
                                {loadingOrgs ? (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <ChevronDown size={14} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Due Date Picker */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={12} /> Data de Entrega
                        </label>
                        <input
                            type="date"
                            value={editedTask.dueDate || ''}
                            onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                            className="w-full appearance-none bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 text-docka-900 dark:text-zinc-100 text-sm rounded-md px-3 py-2 outline-none focus:border-docka-400 dark:focus:border-zinc-500 font-medium cursor-pointer"
                        />
                    </div>

                    {/* Tags Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-docka-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Tag size={12} /> Tags
                        </label>

                        {/* Tag List */}
                        {editedTask.tags && editedTask.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {editedTask.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 text-xs bg-docka-100 dark:bg-zinc-800 px-2 py-1 rounded text-docka-700 dark:text-zinc-300 border border-docka-200 dark:border-zinc-700"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-red-600 dark:hover:text-red-400"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* New Tag Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Adicionar tag..."
                                className="flex-1 px-3 py-1.5 text-sm text-docka-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-md outline-none focus:border-docka-400 dark:focus:border-zinc-500 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                            />
                            <button
                                onClick={handleAddTag}
                                className="px-3 py-1.5 text-xs font-medium bg-docka-100 dark:bg-zinc-700 text-docka-700 dark:text-zinc-300 hover:bg-docka-200 dark:hover:bg-zinc-600 rounded-md transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="space-y-2 pt-4 border-t border-docka-100 dark:border-zinc-800">
                        <div className="flex justify-between text-xs">
                            <span className="text-docka-500 dark:text-zinc-500">Criado em:</span>
                            <span className="text-docka-700 dark:text-zinc-300 font-medium">
                                {editedTask.createdAt ? new Date(editedTask.createdAt).toLocaleDateString('pt-BR') : '-'}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-docka-500 dark:text-zinc-500">Atualizado em:</span>
                            <span className="text-docka-700 dark:text-zinc-300 font-medium">
                                {editedTask.updatedAt ? new Date(editedTask.updatedAt).toLocaleDateString('pt-BR') : '-'}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-6 mt-auto">
                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            <Trash2 size={14} /> Excluir Tarefa
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-6 mt-6 border-t border-docka-100 dark:border-zinc-800 gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg">Fechar</button>
                <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white/90 rounded-lg shadow-sm">Salvar Alterações</button>
            </div>
        </Modal>
    );
};

export default TaskDetailModal;
