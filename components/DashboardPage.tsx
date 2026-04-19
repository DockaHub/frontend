import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardPageProps {
    title: string;
    icon?: LucideIcon;
    actions?: React.ReactNode;
    children: React.ReactNode;
    padding?: string;
    showIconContainer?: boolean;
    headerBg?: string;
}

/**
 * Standard Page Component according to Design System 3.0 (Enterprise Minimalist)
 * Features a fixed 64px header and a full-height scrollable content area.
 */
const DashboardPage: React.FC<DashboardPageProps> = ({ 
    title, 
    icon: Icon, 
    actions, 
    children, 
    padding = "p-6",
    showIconContainer = true,
    headerBg = "bg-white dark:bg-zinc-950"
}) => {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300 overflow-hidden">
            {/* View Header (Standard 64px) */}
            <header className={`h-16 border-b border-docka-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 ${headerBg} z-20`}>
                <div className="flex items-center gap-3">
                    {Icon && (
                        showIconContainer ? (
                            <div className="p-1.5 bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg shadow-sm shrink-0">
                                <Icon size={18} />
                            </div>
                        ) : (
                            <Icon size={20} className="text-docka-900 dark:text-zinc-100" />
                        )
                    )}
                    <h1 className="text-xl font-bold text-docka-900 dark:text-zinc-100 tracking-tight truncate max-w-[200px] sm:max-w-md">
                        {title}
                    </h1>
                </div>
                
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </header>

            {/* Content Area (Scrollable) */}
            <main className={`flex-1 overflow-y-auto custom-scrollbar ${padding}`}>
                {children}
            </main>
        </div>
    );
};

export default DashboardPage;
