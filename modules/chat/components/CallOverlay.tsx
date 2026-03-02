import React from 'react';
import { useCall } from '../../../context/CallContext';
import { Phone, Video, Mic, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';


const CallOverlay: React.FC = () => {
    const {
        name,
        callAccepted,
        myVideo,
        userVideo,
        callEnded,
        stream,
        call,
        answerCall,
        leaveCall,
        isCallActive
    } = useCall();

    const [isMinimized, setIsMinimized] = React.useState(false);


    if (!isCallActive && !call.isReceivingCall) return null;

    // Helper to determine root classes
    const rootClasses = isMinimized
        ? "fixed bottom-4 right-4 z-50 w-80 h-48 shadow-2xl rounded-xl overflow-hidden border border-zinc-700 flex flex-col bg-zinc-900 transition-all duration-300 ease-in-out"
        : "fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300 ease-in-out";

    return (
        <div className={rootClasses}>

            {/* INCOMING CALL MODAL (Always centered/blocking if not minimized - actually, incoming calls should probably block unless ignored) */}
            {/* Strategy: If receiving call, we don't minimize yet. Only active calls minimize. */}
            {!callAccepted && call.isReceivingCall && (
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce-in max-w-sm w-full mx-4">
                    {/* ... same incoming call content ... */}
                    <div className="w-24 h-24 bg-docka-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Phone size={40} className="text-docka-600 dark:text-zinc-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-docka-900 dark:text-zinc-100 mb-2">{call.name || 'Alguém'}</h2>
                    <p className="text-docka-500 dark:text-zinc-400 mb-8">está ligando para você...</p>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={leaveCall}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
                        >
                            <PhoneOff size={20} />
                            Recusar
                        </button>
                        <button
                            onClick={answerCall}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all"
                        >
                            <Phone size={20} />
                            Atender
                        </button>
                    </div>
                </div>
            )}

            {/* ACTIVE CALL VIEW */}
            {isCallActive && (callAccepted || !call.isReceivingCall) && (
                <div className="relative w-full h-full flex flex-col group">
                    {/* Header Controls (Minimize/Maximize) */}
                    <div className="absolute top-2 right-2 z-20 flex gap-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                            title={isMinimized ? "Expandir" : "Minimizar"}
                        >
                            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={20} />}
                        </button>
                    </div>

                    {/* REMOTE VIDEO */}
                    <div className="flex-1 relative bg-zinc-900 overflow-hidden flex items-center justify-center">
                        {callAccepted && !callEnded ? (
                            <video
                                playsInline
                                ref={userVideo}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-500">
                                <div className={`${isMinimized ? 'w-16 h-16' : 'w-32 h-32'} bg-zinc-800 rounded-full flex items-center justify-center mb-4 animate-pulse transition-all`}>
                                    <span className={`${isMinimized ? 'text-xl' : 'text-4xl'} font-bold text-zinc-600`}>{name?.charAt(0) || '?'}</span>
                                </div>
                                <p className={isMinimized ? 'text-sm' : 'text-xl'}>Chamando...</p>
                            </div>
                        )}

                        {/* LOCAL VIDEO (PIP) - Hidden in mini mode if desired, or small */}
                        {stream && !isMinimized && (
                            <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-700">
                                <video
                                    playsInline
                                    muted
                                    ref={myVideo}
                                    autoPlay
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            </div>
                        )}
                        {/* LOCAL VIDEO (PIP) - Tiny version for mini mode */}
                        {stream && isMinimized && (
                            <div className="absolute bottom-4 right-2 w-20 h-14 bg-black rounded-lg overflow-hidden shadow-lg border border-zinc-700 z-10">
                                <video
                                    playsInline
                                    muted
                                    ref={myVideo}
                                    autoPlay
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            </div>
                        )}
                    </div>

                    {/* CONTROLS BAR - Conditional sizing */}
                    <div className={`${isMinimized ? 'absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' : 'h-24 bg-zinc-900 border-t border-zinc-800'} flex items-center justify-center gap-${isMinimized ? '4' : '6'} transition-all`}>
                        <button className={`${isMinimized ? 'p-2' : 'p-4'} rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors`}>
                            <Mic size={isMinimized ? 16 : 24} />
                        </button>

                        <button
                            onClick={leaveCall}
                            className={`${isMinimized ? 'p-2' : 'p-4'} rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg ${!isMinimized && 'scale-110'}`}
                        >
                            <PhoneOff size={isMinimized ? 20 : 28} />
                        </button>

                        <button className={`${isMinimized ? 'p-2' : 'p-4'} rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors`}>
                            <Video size={isMinimized ? 16 : 24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallOverlay;
