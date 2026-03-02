
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, MessageSquare, Users, MoreHorizontal, Hand, ShieldCheck } from 'lucide-react';
import { CURRENT_USER } from '../../../constants';

interface ActiveCallProps {
  meetingId: string;
  onLeave: () => void;
}

const ActiveCall: React.FC<ActiveCallProps> = ({ meetingId, onLeave }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const participants = [
    { id: '1', name: CURRENT_USER.name, avatar: CURRENT_USER.avatar, isMe: true },
    { id: '2', name: 'Sarah Engenheira', avatar: 'https://picsum.photos/id/32/200/200', isMe: false, speaking: true },
    { id: '3', name: 'Mike Vendas', avatar: 'https://picsum.photos/id/11/200/200', isMe: false },
    { id: '4', name: 'Tom DevOps', avatar: 'https://picsum.photos/id/12/200/200', isMe: false },
  ];

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col text-white relative animate-in fade-in duration-500">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-3">
                <div className="bg-zinc-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-700/50 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-xs font-medium tracking-wide">Docka Secure Call</span>
                    <div className="w-px h-3 bg-zinc-600 mx-1" />
                    <span className="text-xs text-zinc-400 font-mono">{meetingId}</span>
                </div>
            </div>
            <div className="bg-zinc-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-700/50">
                <span className="text-xs font-medium font-mono">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 grid grid-cols-2 gap-4 auto-rows-fr">
            {participants.map((p) => (
                <div key={p.id} className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 group">
                    {/* Placeholder Avatar / Video Stream Simulation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                            src={p.avatar} 
                            className={`w-24 h-24 rounded-full object-cover border-4 ${p.speaking ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]' : 'border-zinc-700'} transition-all duration-300`} 
                            alt={p.name} 
                        />
                    </div>
                    
                    {/* Audio Wave Simulation */}
                    {p.speaking && (
                        <div className="absolute top-4 right-4 flex gap-0.5 items-end h-4">
                            <div className="w-1 bg-indigo-500 animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
                            <div className="w-1 bg-indigo-500 animate-[pulse_0.8s_ease-in-out_infinite] h-4" />
                            <div className="w-1 bg-indigo-500 animate-[pulse_0.5s_ease-in-out_infinite] h-3" />
                        </div>
                    )}

                    {/* Name Tag */}
                    <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
                        {p.isMe && isMuted && <MicOff size={12} className="text-red-400" />}
                        <span className="text-sm font-medium">{p.name} {p.isMe && '(Você)'}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Control Bar */}
        <div className="h-20 shrink-0 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center gap-4 px-6 relative">
            
            {/* Left Controls */}
            <div className="absolute left-6 flex items-center gap-2">
                <button className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300">
                    <Users size={20} />
                </button>
                <button className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 relative">
                    <MessageSquare size={20} />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-800" />
                </button>
            </div>

            {/* Center Main Controls */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <button 
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                >
                    {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>
                <button className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-white" title="Compartilhar Tela">
                    <Monitor size={22} />
                </button>
                <button className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-white" title="Levantar Mão">
                    <Hand size={22} />
                </button>
                <button className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-white">
                    <MoreHorizontal size={22} />
                </button>
                <div className="w-4" /> {/* Spacer */}
                <button 
                    onClick={onLeave}
                    className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
                >
                    <PhoneOff size={20} fill="currentColor" />
                    <span className="text-sm">Sair</span>
                </button>
            </div>
        </div>
    </div>
  );
};

export default ActiveCall;
