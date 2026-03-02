
import React from 'react';
import { Contact, ContactStatus } from '../../../types';
import { Mail, MessageSquare, MoreHorizontal, MapPin } from 'lucide-react';
import OrgTag from '../../../components/common/OrgTag';

interface PeopleGridProps {
    contacts: Contact[];
    viewMode: 'grid' | 'list';
    onContactClick: (contact: Contact) => void;
}

const StatusIndicator = ({ status }: { status: ContactStatus }) => {
    const colors = {
        online: 'bg-green-500',
        offline: 'bg-docka-400 dark:bg-zinc-600',
        busy: 'bg-red-500',
        away: 'bg-amber-500'
    };
    return <div className={`w-2.5 h-2.5 rounded-full border border-white dark:border-zinc-900 ring-1 ring-white dark:ring-zinc-900 ${colors[status]}`} title={status} />;
};

const PeopleGrid: React.FC<PeopleGridProps> = ({ contacts, viewMode, onContactClick }) => {
    if (contacts.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-docka-400 dark:text-zinc-600">
                Nenhum contato encontrado.
            </div>
        )
    }

    if (viewMode === 'list') {
        return (
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <table className="w-full text-sm text-left border-separate border-spacing-y-1">
                    <thead className="text-docka-500 dark:text-zinc-500 font-medium text-xs uppercase sticky top-0 bg-white dark:bg-zinc-950 z-10">
                        <tr>
                            <th className="px-4 py-3 border-b border-docka-200 dark:border-zinc-800">Nome</th>
                            <th className="px-4 py-3 border-b border-docka-200 dark:border-zinc-800">Organização</th>
                            <th className="px-4 py-3 border-b border-docka-200 dark:border-zinc-800">Cargo</th>
                            <th className="px-4 py-3 border-b border-docka-200 dark:border-zinc-800">Departamento</th>
                            <th className="px-4 py-3 border-b border-docka-200 dark:border-zinc-800">Localização</th>
                            <th className="px-4 py-3 border-b border-docka-200 dark:border-zinc-800 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map(contact => (
                            <tr
                                key={contact.id}
                                onClick={() => onContactClick(contact)}
                                className="group hover:bg-docka-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer rounded-lg"
                            >
                                <td className="px-4 py-3 flex items-center font-medium text-docka-900 dark:text-zinc-100 rounded-l-lg border-y border-l border-transparent group-hover:border-docka-200 dark:group-hover:border-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-900">
                                    <div className="relative mr-3">
                                        <img src={contact.avatar} className="w-8 h-8 rounded-full bg-docka-200 dark:bg-zinc-700" alt="" />
                                        <div className="absolute -bottom-0.5 -right-0.5"><StatusIndicator status={contact.status} /></div>
                                    </div>
                                    <div>
                                        <div>{contact.name}</div>
                                        <div className="text-xs text-docka-400 dark:text-zinc-500 font-normal">{contact.email}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 border-y border-transparent group-hover:border-docka-200 dark:group-hover:border-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-900">
                                    <OrgTag orgId={contact.organizationId} />
                                </td>
                                <td className="px-4 py-3 text-docka-600 dark:text-zinc-400 border-y border-transparent group-hover:border-docka-200 dark:group-hover:border-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-900">{contact.role}</td>
                                <td className="px-4 py-3 text-docka-600 dark:text-zinc-400 border-y border-transparent group-hover:border-docka-200 dark:group-hover:border-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-900">
                                    <span className="px-2 py-0.5 bg-docka-100 dark:bg-zinc-800 rounded text-xs font-medium text-docka-700 dark:text-zinc-300">{contact.department}</span>
                                </td>
                                <td className="px-4 py-3 text-docka-500 dark:text-zinc-500 border-y border-transparent group-hover:border-docka-200 dark:group-hover:border-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-900">{contact.location}</td>
                                <td className="px-4 py-3 text-right rounded-r-lg border-y border-r border-transparent group-hover:border-docka-200 dark:group-hover:border-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-900">
                                    <button className="p-1 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-md text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-all">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // Grid View
    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {contacts.map(contact => (
                    <div
                        key={contact.id}
                        onClick={() => onContactClick(contact)}
                        className="bg-white dark:bg-zinc-900 border border-docka-200 dark:border-zinc-800 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col items-center text-center relative"
                    >
                        {/* Organization Tag (Top Left) */}
                        <div className="absolute top-4 left-4">
                            <OrgTag orgId={contact.organizationId} size="sm" showName={false} />
                        </div>

                        {/* Status (Top Right) */}
                        <div className="absolute top-4 right-4">
                            <StatusIndicator status={contact.status} />
                        </div>

                        <img src={contact.avatar} className="w-20 h-20 rounded-full mb-4 border-2 border-white dark:border-zinc-800 shadow-sm" alt="" />
                        <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-lg">{contact.name}</h3>
                        <div className="flex flex-col items-center mt-1">
                            <p className="text-sm text-docka-500 dark:text-zinc-400 mb-1 font-medium">{contact.role}</p>
                            <OrgTag orgId={contact.organizationId} size="sm" />
                        </div>

                        <span className="mt-3 px-2 py-0.5 bg-docka-50 dark:bg-zinc-800 rounded text-[10px] font-bold text-docka-400 dark:text-zinc-500 uppercase tracking-wide mb-4">{contact.department}</span>

                        <div className="w-full pt-4 border-t border-docka-100 dark:border-zinc-800 flex justify-center gap-4">
                            <button className="p-2 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-full transition-colors" title="Email">
                                <Mail size={18} />
                            </button>
                            <button className="p-2 text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 hover:bg-docka-50 dark:hover:bg-zinc-800 rounded-full transition-colors" title="Chat">
                                <MessageSquare size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PeopleGrid;
