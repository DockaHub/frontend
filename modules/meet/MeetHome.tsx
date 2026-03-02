
import React, { useState, useEffect } from 'react';
import { Video, Calendar, Keyboard, Copy, Lock } from 'lucide-react';
import { calendarService } from '../../services/calendarService';

interface MeetHomeProps {
    onStartInstantMeeting: () => void;
    onJoinMeeting: (id: string) => void;
    onViewFullCalendar: () => void;
}

const MeetHome: React.FC<MeetHomeProps> = ({ onStartInstantMeeting, onJoinMeeting, onViewFullCalendar }) => {
    const [meetingCode, setMeetingCode] = useState('');
    const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const events = await calendarService.getEvents();
                const now = new Date();
                const meetings = events
                    .filter((e: any) => e.type === 'meeting' && e.meetId)
                    .map((e: any) => {
                        let status: 'past' | 'now' | 'future';
                        if (now > e.end) {
                            status = 'past';
                        } else if (now >= e.start && now <= e.end) {
                            status = 'now';
                        } else {
                            status = 'future';
                        }

                        return {
                            id: e.id,
                            meetId: e.meetId,
                            title: e.title,
                            time: `${e.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${e.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
                            status,
                            createdBy: e.createdBy,
                            participants: e.participants || [],
                        };
                    })
                    .filter((m: any) => m.status !== 'past') // Hide past meetings
                    .slice(0, 3);
                setUpcomingMeetings(meetings);
            } catch (error) {
                console.error('Failed to fetch meetings:', error);
            }
        };
        fetchMeetings();
    }, []);

    const handleCopyMeetId = (meetId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(meetId);
        // Could add a toast notification here
    };

    return (
        <div className="h-full w-full bg-white dark:bg-zinc-950 flex flex-col md:flex-row animate-in fade-in transition-colors duration-300">

            {/* Left Side: Actions */}
            <div className="flex-1 p-8 md:p-16 flex flex-col justify-center max-w-2xl">
                <h1 className="text-4xl font-bold text-docka-900 dark:text-zinc-100 mb-2">Chamadas de vídeo premium.</h1>
                <h1 className="text-4xl font-bold text-docka-400 dark:text-zinc-500 mb-6">Agora disponível para todos.</h1>
                <p className="text-lg text-docka-600 dark:text-zinc-400 mb-10 leading-relaxed max-w-md">
                    Nós redesenhamos o serviço de reuniões para ser seguro, interno e totalmente integrado ao seu Docka Workspace.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
                    <button
                        onClick={onStartInstantMeeting}
                        className="bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-5 py-3.5 rounded-lg text-sm font-bold hover:bg-docka-800 dark:hover:bg-white/90 transition-all shadow-lg shadow-docka-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <Video size={18} /> Nova Reunião
                    </button>

                    <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                        <div className="relative group w-full sm:w-auto">
                            <Keyboard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-docka-400 dark:text-zinc-500 group-focus-within:text-docka-800 dark:group-focus-within:text-zinc-300" size={20} />
                            <input
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value)}
                                placeholder="Digite um código..."
                                className="pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-docka-300 dark:border-zinc-700 rounded-lg text-base outline-none focus:ring-2 focus:ring-docka-200 dark:focus:ring-zinc-700 focus:border-docka-900 dark:focus:border-zinc-500 transition-all w-full sm:w-64 font-medium text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                            />
                        </div>
                        <button
                            onClick={() => onJoinMeeting(meetingCode)}
                            disabled={meetingCode.length === 0}
                            className="text-docka-600 dark:text-zinc-400 font-bold hover:bg-docka-50 dark:hover:bg-zinc-800 px-4 py-3.5 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors w-full sm:w-auto"
                        >
                            Entrar
                        </button>
                    </div>
                </div>

                <div className="border-t border-docka-100 dark:border-zinc-800 pt-8 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-docka-100 dark:bg-zinc-800 p-1.5 rounded-md text-docka-600 dark:text-zinc-400"><Lock size={14} /></span>
                        <span className="text-sm font-bold text-docka-700 dark:text-zinc-300">Interno & Seguro</span>
                    </div>
                    <p className="text-sm text-docka-500 dark:text-zinc-500 max-w-md">
                        Suas reuniões são criptografadas e roteadas internamente. Apenas membros da organização <strong>Docka HQ</strong> podem entrar automaticamente.
                    </p>
                </div>
            </div>

            {/* Right Side: Agenda / Visual */}
            <div className="flex-1 bg-docka-50 dark:bg-zinc-900 border-l border-docka-200 dark:border-zinc-800 p-8 flex flex-col items-center justify-center transition-colors">

                {/* Date Header */}
                <div className="w-full max-w-md mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100">Hoje</h2>
                        <p className="text-docka-500 dark:text-zinc-400 font-medium">Quinta-feira, 24 de Fevereiro</p>
                    </div>
                    <div className="w-10 h-10 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-xl flex items-center justify-center shadow-sm">
                        <Calendar size={20} className="text-docka-600 dark:text-zinc-400" />
                    </div>
                </div>

                {/* Meeting Cards */}
                <div className="w-full max-w-md space-y-4">
                    {upcomingMeetings.map((meeting) => (
                        <div
                            key={meeting.id}
                            onClick={() => onJoinMeeting(meeting.meetId!)}
                            className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-docka-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-docka-900 dark:text-zinc-100 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{meeting.title}</h3>
                                {meeting.status === 'now' && (
                                    <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">Agora</span>
                                )}
                            </div>
                            <div className="text-sm text-docka-500 dark:text-zinc-400 font-medium mb-4">
                                {meeting.time}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex -space-x-2">
                                    {/* Creator Avatar */}
                                    {meeting.createdBy && (
                                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center" title={meeting.createdBy.name}>
                                            {meeting.createdBy.avatar ? (
                                                <img src={meeting.createdBy.avatar} alt={meeting.createdBy.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{meeting.createdBy.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                    )}
                                    {/* Participant Avatars (max 2) */}
                                    {meeting.participants.slice(0, 2).map((participant: any) => (
                                        <div key={participant.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center" title={participant.user.name}>
                                            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">{participant.user.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                    ))}
                                    {/* Overflow counter */}
                                    {meeting.participants.length > 2 && (
                                        <div className="w-8 h-8 rounded-full bg-docka-100 dark:bg-zinc-700 border-2 border-white dark:border-zinc-800 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-docka-500 dark:text-zinc-300">+{meeting.participants.length - 2}</span>
                                        </div>
                                    )}
                                </div>
                                {meeting.status === 'now' ? (
                                    <button onClick={(e) => { e.stopPropagation(); onJoinMeeting(meeting.meetId!); }} className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors">
                                        Entrar
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => handleCopyMeetId(meeting.meetId!, e)}
                                        className="text-docka-400 dark:text-zinc-500 hover:text-docka-900 dark:hover:text-zinc-200 p-1.5 hover:bg-docka-50 dark:hover:bg-zinc-700 rounded transition-colors"
                                        title="Copiar código da reunião"
                                    >
                                        <Copy size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Empty State visual filler */}
                    <div className="border-2 border-dashed border-docka-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-sm text-docka-400 dark:text-zinc-500 font-medium">Sem mais reuniões hoje.</p>
                        <button
                            onClick={onViewFullCalendar}
                            className="text-indigo-600 dark:text-indigo-400 text-xs font-bold mt-2 hover:underline transition-colors"
                        >
                            Ver agenda completa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetHome;
