import React, { useState } from 'react';
import SearchAssistant from './SearchAssistant';
import { Newspaper, LayoutDashboard, PlusCircle, Search } from 'lucide-react';

// Placeholders for future components
const ClientRegistration = () => <div className="p-8 text-center text-gray-500">Cadastro de Cliente (Em breve)</div>;
const ProcessDashboard = () => <div className="p-8 text-center text-gray-500">Dashboard de Processos (Em breve)</div>;

type SubView = 'dashboard' | 'search' | 'registration';

const AsteryskoLayout: React.FC = () => {
    const [view, setView] = useState<SubView>('search');

    const handleSearchNext = () => {
        setView('registration');
    };

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'search', label: 'Marcas', icon: Search },
        { id: 'registration', label: 'Novo Processo', icon: PlusCircle },
    ];

    return (
        <div className="flex h-full w-full bg-gray-50 dark:bg-zinc-950 overflow-hidden">
            {/* Sidebar (Second Column) */}
            <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-20">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Newspaper className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                Asterysko
                            </h1>
                            <p className="text-xs text-gray-500">Gestão INPI</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as SubView)}
                            className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === item.id
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 ${view === item.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto relative">
                <div className="max-w-7xl mx-auto w-full h-full">
                    {view === 'search' && <SearchAssistant onNext={handleSearchNext} />}
                    {view === 'registration' && <ClientRegistration />}
                    {view === 'dashboard' && <ProcessDashboard />}
                </div>
            </main>
        </div>
    );
};

export default AsteryskoLayout;
