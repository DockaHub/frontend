
import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import TasksSidebar from './components/TasksSidebar';
import TasksList from './components/TasksList';
import TasksKanban from './components/TasksKanban';
import TaskDetailModal from './components/TaskDetailModal';
import { Search, Plus, SlidersHorizontal, LayoutGrid, List, Loader2 } from 'lucide-react';

const TasksLayout: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal States
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

    // Load tasks on mount
    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            console.log('🔄 TasksLayout - Starting to load tasks...');
            setLoading(true);
            setError(null);
            console.log('📡 TasksLayout - Calling taskService.getMyTasks()...');
            const data = await taskService.getMyTasks();
            console.log('✅ TasksLayout - Tasks loaded successfully:', data);
            console.log(`   Total tasks: ${data.length}`);

            // Debug: mostrar status de cada tarefa
            if (data.length > 0) {
                console.log('📊 Task Status Distribution:');
                data.forEach((task, idx) => {
                    console.log(`   ${idx + 1}. "${task.title}" - Status: ${task.status}`);
                });
            }

            setTasks(data);
        } catch (err: any) {
            console.error('❌ TasksLayout - Failed to load tasks:', err);
            console.error('   Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(err.message || 'Falha ao carregar tarefas');
        } finally {
            setLoading(false);
            console.log('🏁 TasksLayout - Load completed');
        }
    };

    // Handlers
    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsTaskDetailOpen(true);
    };

    const handleUpdateTask = async (updatedTask: Task) => {
        try {
            console.log('💾 TasksLayout - Updating task:', updatedTask.id);
            console.log('   Payload:', updatedTask);
            const updated = await taskService.updateTask(updatedTask.id, updatedTask);
            console.log('✅ TasksLayout - Task updated successfully:', updated);
            setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        } catch (err: any) {
            console.error('❌ TasksLayout - Failed to update task:', err);
            console.error('   Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                errorData: err.response?.data?.error
            });
            throw err; // Re-throw to let modal handle it
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await taskService.deleteTask(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
            setIsTaskDetailOpen(false);
        } catch (err: any) {
            console.error('Failed to delete task:', err);
            alert('Falha ao deletar tarefa');
        }
    };

    const handleCreateTask = () => {
        // Create a temporary placeholder task for the modal
        const newTask: Task = {
            id: `temp-${Date.now()}`,
            title: 'Nova Tarefa',
            description: '',
            organizationId: '', // User will select
            status: 'TODO',
            priority: 'MEDIUM',
            dueDate: undefined,
            creatorId: '',
            assigneeId: '',
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setSelectedTask(newTask);
        setIsTaskDetailOpen(true);
    }

    // Quick toggle in list view
    const handleListToggleStatus = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
        try {
            const updated = await taskService.updateTask(taskId, { status: newStatus });
            setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        } catch (err) {
            console.error('Failed to toggle task status:', err);
        }
    };

    // Drag and Drop Handler
    const handleMoveTask = async (taskId: string, newStatus: Task['status']) => {
        try {
            const updated = await taskService.updateTask(taskId, { status: newStatus });
            setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        } catch (err) {
            console.error('Failed to move task:', err);
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (activeFilter === 'done') return t.status === 'DONE';
        if (activeFilter === 'today') return t.dueDate === 'Hoje' && t.status !== 'DONE';
        if (activeFilter === 'upcoming') return t.status !== 'DONE' && t.dueDate !== 'Hoje';
        return true;
    });

    return (
        <div className="flex h-full w-full bg-white dark:bg-zinc-950 overflow-hidden flex-col transition-colors duration-300">
            {/* Header */}
            <div className="h-16 border-b border-docka-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-zinc-950 z-20">
                <h2 className="text-xl font-bold text-docka-900 dark:text-zinc-100">Tarefas Globais</h2>

                <div className="flex items-center gap-4">
                    <div className="relative group w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500 group-focus-within:text-docka-800 dark:group-focus-within:text-zinc-300 transition-colors" size={15} />
                        <input
                            type="text"
                            placeholder="Buscar tarefas..."
                            className="w-full pl-9 pr-4 py-1.5 bg-docka-50 dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:border-docka-300 dark:focus:border-zinc-600 focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-700 rounded-md text-sm outline-none transition-all placeholder:text-docka-400 dark:placeholder:text-zinc-600 font-medium text-docka-900 dark:text-zinc-100"
                        />
                    </div>

                    <div className="h-6 w-px bg-docka-200 dark:bg-zinc-800 mx-1 hidden md:block" />

                    {/* View Toggles */}
                    <div className="flex bg-docka-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-docka-200/50 dark:border-zinc-700/50">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                            title="Lista"
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-zinc-700 shadow-sm text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500 hover:text-docka-700 dark:hover:text-zinc-300'}`}
                            title="Kanban"
                        >
                            <LayoutGrid size={16} />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-docka-200 dark:bg-zinc-800 mx-1 hidden md:block" />

                    <button
                        onClick={handleCreateTask}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Nova Tarefa
                    </button>
                </div>
            </div>

            {/* Content with Loading/Error States */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 text-docka-400 dark:text-zinc-500 animate-spin mx-auto mb-3" />
                        <p className="text-sm text-docka-500 dark:text-zinc-400 font-medium">Carregando tarefas...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
                        <button
                            onClick={loadTasks}
                            className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-docka-800 dark:hover:bg-white/90 transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 overflow-hidden">
                    <TasksSidebar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

                    {viewMode === 'kanban' ? (
                        <TasksKanban
                            tasks={filteredTasks}
                            onTaskClick={handleTaskClick}
                            onMoveTask={handleMoveTask}
                        />
                    ) : (
                        <TasksList tasks={filteredTasks} onToggleStatus={handleListToggleStatus} onTaskClick={handleTaskClick} />
                    )}
                </div>
            )}

            {/* Task Detail Modal */}
            <TaskDetailModal
                task={selectedTask}
                isOpen={isTaskDetailOpen}
                onClose={() => setIsTaskDetailOpen(false)}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
};

export default TasksLayout;
