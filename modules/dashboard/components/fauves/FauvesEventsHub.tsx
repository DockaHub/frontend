import React, { useState } from 'react';
import { ShieldAlert, Ticket } from 'lucide-react';
import EventsView from './EventsView';
import FauvesEventsAdminView from './FauvesEventsAdminView';

interface FauvesEventsHubProps {
    initialEventId?: string;
}

const FauvesEventsHub: React.FC<FauvesEventsHubProps> = ({ initialEventId }) => {
    const [activeTab, setActiveTab] = useState<'events' | 'moderation'>('events');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <button
                    type="button"
                    onClick={() => setActiveTab('events')}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'events'
                            ? 'bg-[#2a2ad7] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                >
                    <Ticket size={14} />
                    Gestão & Curadoria
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('moderation')}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeTab === 'moderation'
                            ? 'bg-[#2a2ad7] text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                >
                    <ShieldAlert size={14} />
                    Moderação & Auditoria
                </button>
            </div>

            {activeTab === 'events' ? (
                <EventsView initialEventId={initialEventId} />
            ) : (
                <FauvesEventsAdminView />
            )}
        </div>
    );
};

export default FauvesEventsHub;
