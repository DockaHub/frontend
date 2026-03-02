
import React from 'react';
import { Task } from '../../../types';
import OrgTag from '../../../components/common/OrgTag';
import { CheckCircle2, Circle } from 'lucide-react';

interface TasksListProps {
    tasks: Task[];
    onToggleStatus: (taskId: string) => void;
    onTaskClick?: (task: Task) => void;
}

const TasksList: React.FC<TasksListProps> = ({ tasks, onToggleStatus, onTaskClick }) => {
    if (tasks.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-docka-400 dark:text-zinc-600">
                <div className="w-16 h-16 bg-docka-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-docka-300 dark:text-zinc-700" />
                </div>
                <p>Nenhuma tarefa encontrada.</p>
            </div>
        );
    }

    // Grouping Logic (Simplified for All/Today views)
    const isDone = (status: string) => status === 'done';

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-1">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="group flex items-center p-3 bg-white dark:bg-zinc-900 border border-transparent border-b-docka-100 dark:border-b-zinc-800 hover:bg-docka-50 dark:hover:bg-zinc-800/80 rounded-lg hover:border-docka-200 dark:hover:border-zinc-700 transition-all cursor-pointer"
                        onClick={() => onTaskClick ? onTaskClick(task) : onToggleStatus(task.id)}
                    >
                        {/* Checkbox (Clicking here only toggles status, doesn't open modal) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleStatus(task.id); }}
                            className={`mr-4 shrink-0 transition-colors ${isDone(task.status) ? 'text-emerald-500' : 'text-docka-300 dark:text-zinc-600 group-hover:text-docka-500 dark:group-hover:text-zinc-400'}`}
                        >
                            {isDone(task.status) ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>

                        {/* Title & Org */}
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                            <span className={`text-sm font-medium truncate ${isDone(task.status) ? 'text-docka-400 dark:text-zinc-500 line-through' : 'text-docka-900 dark:text-zinc-100'}`}>
                                {task.title}
                            </span>
                            <OrgTag orgId={task.orgId} size="sm" />
                            {task.tags?.map(tag => (
                                <span key={tag} className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-docka-100 dark:bg-zinc-800 text-[10px] text-docka-500 dark:text-zinc-400 font-medium border border-docka-200 dark:border-zinc-700">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Date & Priority */}
                        <div className="flex items-center gap-4 text-xs shrink-0 pl-4">
                            <span className={`${task.dueDate === 'Hoje' ? 'text-amber-600 dark:text-amber-500 font-bold' :
                                    task.dueDate === 'Amanhã' ? 'text-docka-600 dark:text-zinc-400' : 'text-docka-400 dark:text-zinc-600'
                                }`}>
                                {task.dueDate}
                            </span>

                            {task.priority === 'high' && !isDone(task.status) && (
                                <span className="w-2 h-2 rounded-full bg-red-500" title="Alta Prioridade" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TasksList;
