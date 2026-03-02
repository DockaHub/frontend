
import React from 'react';
import MeetHome from './MeetHome';
import MeetRoom from './components/MeetRoom';
import { useMeet } from '../../context/MeetContext';
import { useToast } from '../../context/ToastContext';

interface MeetLayoutProps {
  onViewCalendar?: () => void;
}

const MeetLayout: React.FC<MeetLayoutProps> = ({ onViewCalendar }) => {
  const { isMeetingActive, joinRoom } = useMeet();
  const { addToast } = useToast();

  const handleStartInstantMeeting = () => {
    // Generate a random ID
    const randomId = `${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}`;
    joinRoom(randomId);
    addToast({
      type: 'success',
      title: 'Reunião Iniciada',
      message: `Você entrou na sala: ${randomId}`
    });
  };

  const handleJoinMeeting = (id: string) => {
    if (!id) return;
    joinRoom(id);
  }

  const handleViewFullCalendar = () => {
    if (onViewCalendar) {
      onViewCalendar();
    }
  };

  if (isMeetingActive) {
    return <MeetRoom />;
  }

  return (
    <div className="flex h-full w-full bg-white dark:bg-zinc-950 overflow-hidden flex-col transition-colors duration-300">
      <MeetHome
        onStartInstantMeeting={handleStartInstantMeeting}
        onJoinMeeting={handleJoinMeeting}
        onViewFullCalendar={handleViewFullCalendar}
      />
    </div>
  );
};

export default MeetLayout;
