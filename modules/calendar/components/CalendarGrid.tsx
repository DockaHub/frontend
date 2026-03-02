
import React, { useEffect, useState, useRef } from 'react';
import { CalendarEvent } from '../../../types';
import { Briefcase, Video, User } from 'lucide-react';

interface CalendarGridProps {
    currentDate: Date;
    events: CalendarEvent[];
    onTimeSlotClick: (date: Date, hour: number, minute: number) => void;
    onEventClick: (event: CalendarEvent) => void;
    onEventDrag?: (eventId: string, newStart: Date, newEnd: Date) => void;
}


const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, events, onTimeSlotClick, onEventClick, onEventDrag }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTimePercent, setCurrentTimePercent] = useState(0);
    const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
    const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
    const [dragOverY, setDragOverY] = useState<number>(0);

    // Generate week dates
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Mon start
    startOfWeek.setDate(diff);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Update current time indicator line
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            setCurrentTimePercent((minutes / 1440) * 100);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000); // every minute

        // Scroll to 9 AM initially
        if (containerRef.current) {
            containerRef.current.scrollTop = 540; // 9 * 60px roughly
        }

        return () => clearInterval(interval);
    }, []);

    const getEventStyle = (event: CalendarEvent) => {
        const startMin = event.start.getHours() * 60 + event.start.getMinutes();
        const endMin = event.end.getHours() * 60 + event.end.getMinutes();
        const durationMin = endMin - startMin;

        const top = (startMin / 1440) * 100;
        const height = (durationMin / 1440) * 100;

        return {
            top: `${top}%`,
            height: `${height}%`,
        };
    };

    // Get theme colors and icon for event type
    const getEventTheme = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'work':
                return {
                    bgLight: 'bg-blue-100',
                    bgDark: 'dark:bg-blue-900/30',
                    borderLight: 'border-blue-300',
                    borderDark: 'dark:border-blue-700',
                    textLight: 'text-blue-900',
                    textDark: 'dark:text-blue-200',
                    icon: Briefcase,
                    iconColor: 'text-blue-600 dark:text-blue-400'
                };
            case 'meeting':
                return {
                    bgLight: 'bg-purple-100',
                    bgDark: 'dark:bg-purple-900/30',
                    borderLight: 'border-purple-300',
                    borderDark: 'dark:border-purple-700',
                    textLight: 'text-purple-900',
                    textDark: 'dark:text-purple-200',
                    icon: Video,
                    iconColor: 'text-purple-600 dark:text-purple-400'
                };
            case 'personal':
                return {
                    bgLight: 'bg-emerald-100',
                    bgDark: 'dark:bg-emerald-900/30',
                    borderLight: 'border-emerald-300',
                    borderDark: 'dark:border-emerald-700',
                    textLight: 'text-emerald-900',
                    textDark: 'dark:text-emerald-200',
                    icon: User,
                    iconColor: 'text-emerald-600 dark:text-emerald-400'
                };
            default:
                return {
                    bgLight: 'bg-gray-100',
                    bgDark: 'dark:bg-gray-900/30',
                    borderLight: 'border-gray-300',
                    borderDark: 'dark:border-gray-700',
                    textLight: 'text-gray-900',
                    textDark: 'dark:text-gray-200',
                    icon: Briefcase,
                    iconColor: 'text-gray-600 dark:text-gray-400'
                };
        }
    };

    const handleGridClick = (e: React.MouseEvent<HTMLDivElement>, date: Date) => {
        // Calculate time based on click Y position
        // Using nativeEvent.offsetY gives position relative to the target element (the day column)
        // Since 1440px height = 24 hours = 1440 mins, 1px = 1 min.
        const offsetY = e.nativeEvent.offsetY;
        const totalMinutes = Math.floor(offsetY);
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;

        // Round to nearest 30 mins for cleaner UX
        const roundedMinute = minute < 30 ? 0 : 30;

        onTimeSlotClick(date, hour, roundedMinute);
    };

    // Drag handlers
    const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
        e.stopPropagation();
        setDraggedEvent(event);
        e.dataTransfer.effectAllowed = 'move';
        // Make the drag image slightly transparent
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
        setDraggedEvent(null);
        setDragOverDate(null);
    };

    const handleDragOver = (e: React.DragEvent, date: Date) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverDate(date);
        setDragOverY(e.nativeEvent.offsetY);
    };

    const handleDrop = (e: React.DragEvent, date: Date) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedEvent || !onEventDrag) return;

        const offsetY = e.nativeEvent.offsetY;
        const totalMinutes = Math.floor(offsetY);
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        const roundedMinute = minute < 30 ? 0 : 30;

        // Calculate event duration
        const duration = draggedEvent.end.getTime() - draggedEvent.start.getTime();

        // Create new start date
        const newStart = new Date(date);
        newStart.setHours(hour, roundedMinute, 0, 0);

        // Create new end date
        const newEnd = new Date(newStart.getTime() + duration);

        // Call the callback
        onEventDrag(draggedEvent.id, newStart, newEnd);

        setDraggedEvent(null);
        setDragOverDate(null);
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth();
    }

    const isToday = (d: Date) => isSameDay(d, new Date());

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 relative overflow-hidden transition-colors">
            {/* Days Header */}
            <div className="flex border-b border-docka-200 dark:border-zinc-800 shrink-0 ml-14 pr-2">
                {weekDates.map((date, i) => (
                    <div key={i} className="flex-1 py-3 text-center border-r border-docka-100 dark:border-zinc-800/50 last:border-r-0">
                        <div className={`text-xs font-medium uppercase mb-1 ${isToday(date) ? 'text-docka-900 dark:text-zinc-100' : 'text-docka-500 dark:text-zinc-500'}`}>
                            {date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                        </div>
                        <div className={`text-xl font-normal w-8 h-8 flex items-center justify-center mx-auto rounded-full ${isToday(date) ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md' : 'text-docka-900 dark:text-zinc-100'}`}>
                            {date.getDate()}
                        </div>
                    </div>
                ))}
            </div>

            {/* Time Grid */}
            <div ref={containerRef} className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="flex relative h-[1440px]"> {/* 1px per minute = 1440px height for 24h */}

                    {/* Time Labels Column */}
                    <div className="w-14 shrink-0 bg-white dark:bg-zinc-950 border-r border-docka-100 dark:border-zinc-800 select-none sticky left-0 z-20">
                        {hours.map(h => (
                            <div key={h} className="h-[60px] text-right pr-2 relative">
                                <span className="text-xs text-docka-400 dark:text-zinc-500 absolute -top-2 right-2 bg-white dark:bg-zinc-950">
                                    {h === 0 ? '' : `${h}:00`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {weekDates.map((date, colIndex) => (
                        <div
                            key={colIndex}
                            className={`flex-1 border-r border-docka-100 dark:border-zinc-800 relative last:border-r-0 group cursor-pointer transition-colors ${draggedEvent && dragOverDate && isSameDay(dragOverDate, date)
                                ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                                : 'hover:bg-docka-50/30 dark:hover:bg-zinc-900/30'
                                }`}
                            onClick={(e) => handleGridClick(e, date)}
                            onDragOver={(e) => handleDragOver(e, date)}
                            onDrop={(e) => handleDrop(e, date)}
                        >
                            {/* Grid lines */}
                            {hours.map(h => (
                                <div key={h} className="h-[60px] border-b border-docka-50 dark:border-zinc-800/50 pointer-events-none" />
                            ))}

                            {/* Current Time Line (Only on Today) */}
                            {isToday(date) && (
                                <div
                                    className="absolute left-0 right-0 h-px bg-red-500 z-20 pointer-events-none flex items-center"
                                    style={{ top: `${currentTimePercent}%` }}
                                >
                                    <div className="w-2 h-2 bg-red-500 rounded-full -ml-1" />
                                </div>
                            )}

                            {/* Drop indicator */}
                            {draggedEvent && dragOverDate && isSameDay(dragOverDate, date) && (
                                <div
                                    className="absolute left-1 right-2 border-2 border-dashed border-indigo-400 dark:border-indigo-500 bg-indigo-100/20 dark:bg-indigo-900/20 rounded-md z-30 pointer-events-none"
                                    style={{
                                        top: `${(Math.floor(dragOverY / 60) * 60 / 1440) * 100}%`,
                                        height: `${((draggedEvent.end.getTime() - draggedEvent.start.getTime()) / (1000 * 60 * 60 * 24)) * 100}%`
                                    }}
                                />
                            )}

                            {/* Events for this day */}
                            {events.filter(e => isSameDay(e.start, date)).map(event => {
                                const theme = getEventTheme(event.type);
                                const EventIcon = theme.icon;

                                return (
                                    <div
                                        key={event.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, event)}
                                        onDragEnd={handleDragEnd}
                                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                        className={`absolute left-1 right-2 rounded-lg border-l-4 p-2 text-xs cursor-move hover:brightness-95 hover:shadow-md transition-all shadow-sm z-10 overflow-hidden ${draggedEvent?.id === event.id ? 'opacity-50' : ''
                                            } ${theme.bgLight} ${theme.bgDark} ${theme.borderLight} ${theme.borderDark} ${theme.textLight} ${theme.textDark}`}
                                        style={getEventStyle(event)}
                                    >
                                        <div className="flex items-start gap-1.5 mb-1">
                                            <EventIcon size={14} className={`mt-0.5 shrink-0 ${theme.iconColor}`} />
                                            <div className="font-semibold truncate flex-1">{event.title}</div>
                                        </div>
                                        <div className="text-[10px] opacity-80 truncate ml-5">
                                            {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {event.location && <div className="mt-0.5 text-[10px] opacity-75 truncate ml-5">{event.location}</div>}

                                        {/* Participants Avatars */}
                                        {(event.createdBy || (event.participants && event.participants.length > 0)) && (
                                            <div className="flex items-center gap-0.5 mt-1.5 ml-5">
                                                {/* Creator Avatar */}
                                                {event.createdBy && (
                                                    <div
                                                        className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden -ml-1 first:ml-0"
                                                        title={event.createdBy.name}
                                                    >
                                                        {event.createdBy.avatar ? (
                                                            <img
                                                                src={event.createdBy.avatar}
                                                                alt={event.createdBy.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className={`w-full h-full flex items-center justify-center text-[8px] font-bold ${theme.bgLight} ${theme.bgDark} ${theme.textLight} ${theme.textDark}`}>
                                                                {event.createdBy.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Participant Avatars (max 3) */}
                                                {event.participants?.slice(0, 3).map((participant, idx) => (
                                                    <div
                                                        key={participant.id}
                                                        className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden -ml-1"
                                                        title={participant.user.name}
                                                    >
                                                        {participant.user.name ? (
                                                            <div className={`w-full h-full flex items-center justify-center text-[8px] font-bold ${theme.bgLight} ${theme.bgDark} ${theme.textLight} ${theme.textDark}`}>
                                                                {participant.user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                ))}

                                                {/* Overflow counter */}
                                                {event.participants && event.participants.length > 3 && (
                                                    <div className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center -ml-1">
                                                        <span className="text-[8px] font-bold text-gray-700 dark:text-gray-300">
                                                            +{event.participants.length - 3}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarGrid;
