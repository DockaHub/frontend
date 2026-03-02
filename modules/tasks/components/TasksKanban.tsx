
import React, { useState, useEffect } from 'react';
import { Task } from '../../../types';
import { Plus, MoreHorizontal, Calendar, Flag, Trash2, Edit2, Palette, X, Check } from 'lucide-react';
import OrgTag from '../../../components/common/OrgTag';

interface TasksKanbanProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    onMoveTask: (taskId: string, newStatus: Task['status']) => void;
}

// Extended type to support dynamic columns beyond the strict Task['status']
type ColumnType = {
    id: string;
    label: string;
    color: string;
};

const TasksKanban: React.FC<TasksKanbanProps> = ({ tasks, onTaskClick, onMoveTask }) => {
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

    // Dynamic Columns State - IDs must match backend Task.status enum
    const [columns, setColumns] = useState<ColumnType[]>([
        { id: 'BACKLOG', label: 'Backlog', color: 'bg-gray-200' },
        { id: 'TODO', label: 'A Fazer', color: 'bg-blue-200' },
        { id: 'IN_PROGRESS', label: 'Em Progresso', color: 'bg-amber-200' },
        { id: 'DONE', label: 'Concluído', color: 'bg-emerald-200' },
    ]);

    // Menu & Edit States
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggingTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDragOver = (e: React.DragEvent, colId: string) => {
        e.preventDefault();
        if (dragOverColumnId !== colId) {
            setDragOverColumnId(colId);
        }
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            // Cast to any because dynamic columns might have IDs not in the strict Task['status'] type
            onMoveTask(taskId, status as any);
        }
        setDraggingTaskId(null);
        setDragOverColumnId(null);
    };

    // --- Column Management ---

    const handleAddColumn = () => {
        const newId = `col-${Date.now()}`;
        setColumns([...columns, { id: newId, label: 'Nova Coluna', color: 'bg-docka-200' }]);
        // Auto start editing
        setEditingColumnId(newId);
        setEditTitle('Nova Coluna');
    };

    const handleDeleteColumn = (id: string) => {
        setColumns(columns.filter(c => c.id !== id));
        setActiveMenuId(null);
    };

    const startEditing = (col: ColumnType) => {
        setEditingColumnId(col.id);
        setEditTitle(col.label);
        setActiveMenuId(null);
    };

    const saveColumnTitle = () => {
        if (editingColumnId && editTitle.trim()) {
            setColumns(columns.map(c => c.id === editingColumnId ? { ...c, label: editTitle } : c));
        }
        setEditingColumnId(null);
    };

    const changeColumnColor = (id: string, colorClass: string) => {
        setColumns(columns.map(c => c.id === id ? { ...c, color: colorClass } : c));
        setActiveMenuId(null); // Optional: keep open to pick more?
    };

    const colorOptions = [
        'bg-gray-200', 'bg-blue-200', 'bg-amber-200', 'bg-emerald-200',
        'bg-red-200', 'bg-purple-200', 'bg-pink-200', 'bg-indigo-200'
    ];

    return (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            <div className="flex h-full gap-6 min-w-max">
                {columns.map(col => {
                    // Filter tasks loosely based on ID match
                    const colTasks = tasks.filter(t => t.status === col.id);
                    const isOver = dragOverColumnId === col.id;
                    const isMenuOpen = activeMenuId === col.id;
                    const isEditing = editingColumnId === col.id;

                    return (
                        <div
                            key={col.id}
                            className={`w-[320px] flex flex-col h-full rounded-xl border transition-colors relative ${isOver ? 'bg-docka-100 dark:bg-zinc-800 border-docka-300 dark:border-zinc-600' : 'bg-docka-50/50 dark:bg-zinc-900/30 border-docka-200/50 dark:border-zinc-800'}`}
                            onDragOver={(e) => handleDragOver(e, col.id)}
                            onDrop={(e) => handleDrop(e, col.id)}
                            onDragLeave={() => setDragOverColumnId(null)}
                        >
                            {/* Header */}
                            <div className="p-3 flex items-center justify-between sticky top-0 z-10 rounded-t-xl group/header">
                                <div className="flex items-center gap-2 flex-1">
                                    <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-zinc-800 shadow-sm ${col.color.replace('bg-', 'bg-').replace('200', '500')}`} />

                                    {isEditing ? (
                                        <div className="flex items-center gap-1 flex-1">
                                            <input
                                                autoFocus
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveColumnTitle()}
                                                className="w-full text-xs font-bold text-docka-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-docka-300 dark:border-zinc-700 rounded px-1.5 py-0.5 outline-none"
                                            />
                                            <button onClick={saveColumnTitle} className="p-0.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"><Check size={14} /></button>
                                            <button onClick={() => setEditingColumnId(null)} className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-xs font-bold text-docka-700 dark:text-zinc-300 uppercase tracking-wider truncate cursor-pointer" onDoubleClick={() => startEditing(col)}>
                                                {col.label}
                                            </h3>
                                            <span className="text-xs text-docka-400 dark:text-zinc-500 font-medium bg-white dark:bg-zinc-800 px-1.5 rounded-md border border-docka-100 dark:border-zinc-700">
                                                {colTasks.length}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
                                    <button className="p-1 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 rounded transition-colors shadow-sm" title="Adicionar Tarefa">
                                        <Plus size={14} />
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : col.id); }}
                                            className={`p-1 rounded transition-colors shadow-sm ${isMenuOpen ? 'bg-docka-200 dark:bg-zinc-800 text-docka-900 dark:text-zinc-100' : 'text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800'}`}
                                        >
                                            <MoreHorizontal size={14} />
                                        </button>

                                        {/* Context Menu */}
                                        {isMenuOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 origin-top-right p-1">
                                                <button
                                                    onClick={() => startEditing(col)}
                                                    className="w-full text-left px-3 py-2 text-sm text-docka-700 dark:text-zinc-300 hover:bg-docka-50 dark:hover:bg-zinc-700/50 rounded-md flex items-center gap-2"
                                                >
                                                    <Edit2 size={14} /> Renomear
                                                </button>

                                                <div className="px-3 py-2">
                                                    <div className="text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase mb-2 flex items-center gap-2"><Palette size={12} /> Cor</div>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {colorOptions.map(c => (
                                                            <button
                                                                key={c}
                                                                onClick={() => changeColumnColor(col.id, c)}
                                                                className={`w-6 h-6 rounded-full ${c.replace('200', '400')} hover:scale-110 transition-transform ${col.color === c ? 'ring-2 ring-docka-400 dark:ring-zinc-500 ring-offset-1 dark:ring-offset-zinc-800' : ''}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="h-px bg-docka-100 dark:bg-zinc-700 my-1" />

                                                <button
                                                    onClick={() => handleDeleteColumn(col.id)}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} /> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 custom-scrollbar">
                                {colTasks.map(task => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onClick={() => onTaskClick(task)}
                                        className={`bg-white dark:bg-zinc-900 p-3 rounded-lg border border-docka-200 dark:border-zinc-700 shadow-sm hover:shadow-md hover:border-docka-300 dark:hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing group select-none ${draggingTaskId === task.id ? 'opacity-50' : 'opacity-100'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <OrgTag orgId={task.organizationId} size="sm" showName={false} />
                                            {task.priority === 'HIGH' && <Flag size={12} className="text-red-500 fill-current" />}
                                        </div>

                                        <h4 className="text-sm font-medium text-docka-900 dark:text-zinc-100 mb-2 leading-snug">{task.title}</h4>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex gap-1">
                                                {task.tags?.map(tag => (
                                                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-docka-50 dark:bg-zinc-800 border border-docka-100 dark:border-zinc-700 text-docka-500 dark:text-zinc-400 font-medium">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center text-[10px] text-docka-400 dark:text-zinc-500 font-medium">
                                                <Calendar size={10} className="mr-1" />
                                                {task.dueDate}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-docka-400 dark:text-zinc-500 hover:text-docka-600 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 border border-dashed border-transparent hover:border-docka-200 dark:hover:border-zinc-700 rounded-lg transition-all">
                                    <Plus size={12} /> Adicionar
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Add New Column Button */}
                <button
                    onClick={handleAddColumn}
                    className="min-w-[50px] w-[50px] h-full bg-docka-50 dark:bg-zinc-900/30 hover:bg-docka-100 dark:hover:bg-zinc-800/50 border border-dashed border-docka-300 dark:border-zinc-700 hover:border-docka-400 dark:hover:border-zinc-500 rounded-xl flex items-center justify-center text-docka-400 dark:text-zinc-600 hover:text-docka-600 dark:hover:text-zinc-400 transition-all group"
                    title="Criar nova coluna"
                >
                    <Plus size={24} className="group-hover:scale-110 transition-transform" />
                </button>

            </div>
        </div>
    );
};

export default TasksKanban;
