import React, { useState } from 'react';
import { ShieldAlert, Ticket } from 'lucide-react';
import EventsView from './EventsView';
import FauvesEventsAdminView from './FauvesEventsAdminView';
import { FauvesPageHeader } from './FauvesUI';

interface FauvesEventsHubProps {
    initialEventId?: string;
}

const FauvesEventsHub: React.FC<FauvesEventsHubProps> = ({ initialEventId }) => {
    const [activeTab, setActiveTab] = useState<'events' | 'moderation'>('events');

    return (
        <div className="h-full min-h-0 overflow-y-auto bg-white dark:bg-zinc-950">
            <FauvesPageHeader title="Eventos" description="Gestão, vendas, curadoria e segurança dos eventos Fauves." />
            <nav className="sticky top-[76px] z-10 flex items-center overflow-x-auto border-b border-[#e5e5e5] bg-white/95 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-6" aria-label="Áreas de eventos">
                <button
                    type="button"
                    onClick={() => setActiveTab('events')}
                    className={`inline-flex min-h-[52px] shrink-0 items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
                        activeTab === 'events'
                            ? 'border-[#2a2ad7] bg-indigo-50/60 text-[#2a2ad7] dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-300'
                            : 'border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                    }`}
                >
                    <Ticket size={14} />
                    Gestão & Curadoria
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('moderation')}
                    className={`inline-flex min-h-[52px] shrink-0 items-center gap-2 border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
                        activeTab === 'moderation'
                            ? 'border-[#2a2ad7] bg-indigo-50/60 text-[#2a2ad7] dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-300'
                            : 'border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                    }`}
                >
                    <ShieldAlert size={14} />
                    Moderação & Auditoria
                </button>
            </nav>

            <main>
                {activeTab === 'events' ? (
                    <EventsView initialEventId={initialEventId} />
                ) : (
                    <FauvesEventsAdminView hideHeader />
                )}
            </main>
        </div>
    );
};

export default FauvesEventsHub;
