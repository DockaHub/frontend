
import React, { useState, useEffect } from 'react';
import { Organization, CalendarViewType } from '../../types';
import { calendarService, CalendarEvent } from '../../services/calendarService';
import CalendarSidebar from './components/CalendarSidebar';
import CalendarHeader from './components/CalendarHeader';
import CalendarGrid from './components/CalendarGrid';
import ParticipantSelector from './components/ParticipantSelector';
import PlaceholderView from '../../components/PlaceholderView';
import Modal from '../../components/common/Modal';
import { Calendar, Trash2 } from 'lucide-react';

interface CalendarLayoutProps {
    currentOrg: Organization;
    hasAccess?: boolean; // Toggle to demonstrate "Request Access" state
}

const CalendarLayout: React.FC<CalendarLayoutProps> = ({ currentOrg, hasAccess = true }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarViewType>('week');
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [newEventData, setNewEventData] = useState<{
        title: string;
        date: string; // YYYY-MM-DD
        startTime: string; // HH:mm
        endTime: string; // HH:mm
        type: CalendarEvent['type'];
        participants: string[]; // User IDs
    }>({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        type: 'work',
        participants: []
    });

    // PERMISSION GATE
    const canAccess = hasAccess && (currentOrg.features?.calendar !== false);

    if (!canAccess) {
        return (
            <PlaceholderView
                title={`${currentOrg.name} Calendar`}
                icon={Calendar}
                description={`Access to Calendar is restricted for the ${currentOrg.name} workspace. Please request a license upgrade or contact your administrator.`}
            />
        );
    }

    const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
        const newDate = new Date(currentDate);
        if (direction === 'today') {
            setCurrentDate(new Date());
            return;
        }

        const offset = direction === 'next' ? 7 : -7;
        newDate.setDate(newDate.getDate() + offset);
        setCurrentDate(newDate);
    };

    const handleTimeSlotClick = (date: Date, hour: number, minute: number) => {
        setSelectedEventId(null); // Clear selected event
        const dateStr = date.toISOString().split('T')[0];
        const startStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Default duration: 1 hour
        const endHour = hour + 1;
        const endStr = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        setNewEventData({
            title: '',
            date: dateStr,
            startTime: startStr,
            endTime: endStr,
            type: 'work',
            participants: []
        });
        setIsEventModalOpen(true);
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEventId(event.id);
        setNewEventData({
            title: event.title,
            date: event.start.toISOString().split('T')[0],
            startTime: event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: event.type,
            participants: [] // Will populate from event.participants
        });
        setIsEventModalOpen(true);
    };

    // Fetch events from API
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const data = await calendarService.getEvents();
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const handleSaveEvent = async () => {
        if (!newEventData.title) return;

        const startDateTime = new Date(`${newEventData.date}T${newEventData.startTime}`);
        const endDateTime = new Date(`${newEventData.date}T${newEventData.endTime}`);

        // Basic Color Logic
        const color = newEventData.type === 'meeting' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' :
            newEventData.type === 'personal' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' :
                'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';

        try {
            if (selectedEventId) {
                // Update existing event
                const updated = await calendarService.updateEvent(selectedEventId, {
                    title: newEventData.title,
                    start: startDateTime,
                    end: endDateTime,
                    type: newEventData.type,
                });
                setEvents(prev => prev.map(ev => ev.id === selectedEventId ? updated : ev));
            } else {
                // Create new event
                const created = await calendarService.createEvent({
                    title: newEventData.title,
                    start: startDateTime,
                    end: endDateTime,
                    type: newEventData.type,
                    participantIds: newEventData.participants,
                });
                setEvents([...events, created]);
            }

            setIsEventModalOpen(false);
            setSelectedEventId(null);
        } catch (error) {
            console.error('Failed to save event:', error);
            alert('Failed to save event. Please try again.');
        }
    };

    const handleDeleteEvent = async () => {
        if (selectedEventId) {
            try {
                await calendarService.deleteEvent(selectedEventId);
                setEvents(prev => prev.filter(ev => ev.id !== selectedEventId));
                setIsEventModalOpen(false);
                setSelectedEventId(null);
            } catch (error) {
                console.error('Failed to delete event:', error);
                alert('Failed to delete event. Please try again.');
            }
        }
    };

    const handleEventDrag = async (eventId: string, newStart: Date, newEnd: Date) => {
        try {
            // Update backend
            await calendarService.updateEvent(eventId, {
                start: newStart,
                end: newEnd
            });

            // Update local state
            setEvents(prev => prev.map(ev =>
                ev.id === eventId
                    ? { ...ev, start: newStart, end: newEnd }
                    : ev
            ));
        } catch (error) {
            console.error('Failed to update event:', error);
            alert('Failed to move event. Please try again.');
        }
    };

    const filteredEvents = events.filter(ev =>
        ev.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full w-full bg-white dark:bg-zinc-950 overflow-hidden flex-col transition-colors duration-300">
            <CalendarHeader
                currentDate={currentDate}
                view={view}
                onViewChange={setView}
                onNavigate={handleNavigate}
                onSearch={setSearchQuery}
            />
            <div className="flex flex-1 overflow-hidden">
                <CalendarSidebar />
                <CalendarGrid
                    currentDate={currentDate}
                    events={filteredEvents}
                    onTimeSlotClick={handleTimeSlotClick}
                    onEventClick={handleEventClick}
                    onEventDrag={handleEventDrag}
                />
            </div>

            {/* EVENT MODAL (Create / Edit) */}
            <Modal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                title={selectedEventId ? "Editar Compromisso" : "Novo Compromisso"}
                footer={
                    <div className="flex justify-between w-full">
                        <div>
                            {selectedEventId && (
                                <button
                                    onClick={handleDeleteEvent}
                                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 size={16} /> Excluir
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 text-sm font-medium text-docka-600 dark:text-zinc-400 hover:bg-docka-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">Cancelar</button>
                            <button
                                onClick={handleSaveEvent}
                                disabled={!newEventData.title}
                                className="px-6 py-2 text-sm font-bold text-white bg-docka-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-docka-800 dark:hover:bg-white/90 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Título</label>
                        <input
                            autoFocus
                            value={newEventData.title}
                            onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-docka-100 dark:focus:ring-zinc-600 focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100 placeholder:text-docka-400 dark:placeholder:text-zinc-600"
                            placeholder="Adicionar título"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Data</label>
                            <input
                                type="date"
                                value={newEventData.date}
                                onChange={(e) => setNewEventData({ ...newEventData, date: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Início</label>
                            <input
                                type="time"
                                value={newEventData.startTime}
                                onChange={(e) => setNewEventData({ ...newEventData, startTime: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-1">Fim</label>
                            <input
                                type="time"
                                value={newEventData.endTime}
                                onChange={(e) => setNewEventData({ ...newEventData, endTime: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-docka-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-docka-400 dark:focus:border-zinc-500 text-docka-900 dark:text-zinc-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-docka-700 dark:text-zinc-400 uppercase mb-2">Tipo de Evento</label>
                        <div className="flex gap-2">
                            {(['work', 'meeting', 'personal'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setNewEventData({ ...newEventData, type })}
                                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${newEventData.type === type
                                        ? 'bg-docka-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-docka-900 dark:border-zinc-100'
                                        : 'bg-white dark:bg-zinc-800 border-docka-200 dark:border-zinc-700 text-docka-600 dark:text-zinc-400 hover:bg-docka-50 dark:hover:bg-zinc-700'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Participant Selector */}
                    <ParticipantSelector
                        selectedIds={newEventData.participants}
                        onChange={(ids) => setNewEventData({ ...newEventData, participants: ids })}
                        organizationId={currentOrg.id}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default CalendarLayout;
