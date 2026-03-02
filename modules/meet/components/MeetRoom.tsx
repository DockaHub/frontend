import React, { useEffect, useRef, useState } from 'react';
import { useMeet } from '../../../context/MeetContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Copy, Monitor, MonitorOff, Settings } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { socketService } from '../../../services/socketService';

// Helper component to render a peer's video
const PeerVideo: React.FC<{ peer: any }> = ({ peer }) => {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        peer.peer.on("stream", (stream: MediaStream) => {
            if (ref.current) {
                ref.current.srcObject = stream;
            }
        });
    }, [peer]);

    return (
        <div className="relative bg-zinc-800 rounded-xl overflow-hidden aspect-video shadow-lg">
            <video
                playsInline
                autoPlay
                ref={ref}
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                {peer.userName || 'Participante'}
            </div>
        </div>
    );
};

const MeetRoom: React.FC = () => {
    const {
        stream,
        peers,
        leaveRoom,
        roomId,
        toggleAudio,
        toggleVideo,
        isAudioEnabled,
        isVideoEnabled,
        toggleScreenShare,
        isScreenSharing,
        socketStatus,
        availableDevices,
        selectedDevices,
        switchCamera,
        switchMicrophone
    } = useMeet();

    const myVideo = useRef<HTMLVideoElement>(null);
    const { addToast } = useToast();
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        if (myVideo.current && stream) {
            myVideo.current.srcObject = stream;
        }
    }, [stream]);

    const copyLink = () => {
        if (roomId) {
            navigator.clipboard.writeText(roomId);
            addToast({
                type: 'success',
                title: 'ID Copiado!',
                message: 'O ID da reunião foi copiado para a área de transferência.',
                duration: 2000
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white relative">
            {/* Header */}
            <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Reunião: {roomId}</span>
                    <button onClick={copyLink} className="p-2 hover:bg-zinc-800 rounded-full transition-colors" title="Copiar ID">
                        <Copy size={16} className="text-zinc-400" />
                    </button>
                </div>
                <div className="flex flex-col items-end">
                    <div className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-mono text-zinc-400 mb-1">
                        {peers.length + 1} online
                    </div>
                    {/* DEBUG SOCKET INFO */}
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] text-zinc-500 font-mono">
                            {socketStatus?.connected ? '🟢' : '🔴'} {socketStatus?.id || 'No ID'}
                        </div>
                        <div className="text-[9px] text-zinc-600 font-mono">
                            {socketStatus?.serverUrl}
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 p-6 overflow-hidden relative">
                {/* 1-on-1 Layout: Focused view with small PiP */}
                {peers.length === 1 && !isScreenSharing && (
                    <div className="h-full flex items-center justify-center relative">
                        {/* Remote peer - Large */}
                        <div className="w-full h-full max-w-screen-xl mx-auto">
                            <PeerVideo peer={peers[0]} />
                        </div>

                        {/* My video - PiP bottom-right */}
                        <div className="absolute bottom-4 right-4 w-64 aspect-video shadow-2xl ring-2 ring-indigo-500/50 rounded-xl overflow-hidden">
                            <video
                                playsInline
                                muted
                                ref={myVideo}
                                autoPlay
                                className="w-full h-full object-cover transform scale-x-[-1] bg-zinc-800"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                                Você {isAudioEnabled ? '' : '(Muted)'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Screen Share Layout: Large screen + PiP videos */}
                {isScreenSharing && (
                    <div className="h-full flex items-center justify-center relative">
                        {/* Screen share - Full screen */}
                        <div className="w-full h-full max-w-screen-xl mx-auto bg-zinc-800 rounded-xl overflow-hidden">
                            <video
                                playsInline
                                muted
                                ref={myVideo}
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Videos grid - Bottom overlay */}
                        <div className="absolute bottom-4 right-4 flex gap-2 max-w-xl">
                            {/* My camera - small PiP */}
                            {stream && (
                                <div className="w-32 aspect-video shadow-xl ring-2 ring-indigo-500/50 rounded-lg overflow-hidden bg-zinc-800">
                                    <video
                                        playsInline
                                        muted
                                        autoPlay
                                        className="w-full h-full object-cover transform scale-x-[-1]"
                                        ref={(ref) => {
                                            if (ref && stream) {
                                                // Clone camera stream separately
                                                navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                                                    .then(camStream => {
                                                        ref.srcObject = camStream;
                                                    })
                                                    .catch(err => console.error('Failed to get camera for PiP:', err));
                                            }
                                        }}
                                    />
                                    <div className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white">
                                        Você
                                    </div>
                                </div>
                            )}

                            {/* Other participants */}
                            {peers.slice(0, 3).map((peer) => (
                                <div key={peer.peerId} className="w-32 aspect-video shadow-xl rounded-lg overflow-hidden">
                                    <PeerVideo peer={peer} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Group Layout: Responsive grid (2+ people, no screen share) */}
                {peers.length > 1 && !isScreenSharing && (
                    <div className={`h-full grid gap-4 p-4 ${peers.length + 1 === 2 ? 'grid-cols-1 md:grid-cols-2' :
                        peers.length + 1 === 3 ? 'grid-cols-1 md:grid-cols-3' :
                            peers.length + 1 === 4 ? 'grid-cols-2 md:grid-cols-2' :
                                peers.length + 1 <= 6 ? 'grid-cols-2 md:grid-cols-3' :
                                    'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                        }`}>
                        {/* My Video */}
                        <div className="relative bg-zinc-800 rounded-xl overflow-hidden aspect-video shadow-lg ring-2 ring-indigo-500/50">
                            <video
                                playsInline
                                muted
                                ref={myVideo}
                                autoPlay
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                                Você {isAudioEnabled ? '' : '(Muted)'}
                            </div>
                        </div>

                        {/* Remote Peers */}
                        {peers.map((peer) => (
                            <PeerVideo key={peer.peerId} peer={peer} />
                        ))}
                    </div>
                )}

                {/* Empty room: Just me */}
                {peers.length === 0 && !isScreenSharing && (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-full max-w-2xl aspect-video">
                            <div className="relative bg-zinc-800 rounded-xl overflow-hidden aspect-video shadow-lg ring-2 ring-indigo-500/50 h-full">
                                <video
                                    playsInline
                                    muted
                                    ref={myVideo}
                                    autoPlay
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                                    Você {isAudioEnabled ? '' : '(Muted)'}
                                </div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <p className="text-zinc-400 text-sm">Aguardando outros participantes...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="h-20 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center gap-4">
                <button
                    onClick={toggleAudio}
                    className={`p-4 rounded-full transition-all ${isAudioEnabled ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                    {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                </button>

                <button
                    onClick={leaveRoom}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white px-8 flex items-center gap-2 transition-all font-semibold shadow-lg hover:shadow-red-900/20"
                >
                    <PhoneOff size={24} />
                    <span className="hidden sm:inline">Sair</span>
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all ${isVideoEnabled ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                >
                    {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                </button>

                <button
                    onClick={toggleScreenShare}
                    className={`p-4 rounded-full transition-all ${isScreenSharing ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                    title="Compartilhar Tela"
                >
                    {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
                </button>

                {/* Settings Button with Popup */}
                <div className="relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-4 rounded-full transition-all ${showSettings ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                        title="Configurações"
                    >
                        <Settings size={24} />
                    </button>

                    {/* Settings Popup */}
                    {showSettings && (
                        <div className="absolute bottom-full mb-2 right-0 bg-zinc-800 rounded-lg shadow-2xl p-4 min-w-[300px] border border-zinc-700">
                            <h3 className="text-sm font-semibold mb-3">Configurações de Dispositivos</h3>

                            {/* Camera Selection */}
                            <div className="mb-3">
                                <label className="text-xs text-zinc-400 block mb-1">Câmera</label>
                                <select
                                    value={selectedDevices.cameraId || ''}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            switchCamera(e.target.value);
                                        }
                                    }}
                                    className="w-full bg-zinc-900 text-white px-3 py-2 rounded text-sm border border-zinc-700 focus:border-indigo-500 focus:outline-none"
                                >
                                    {availableDevices.cameras.map((device) => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Microphone Selection */}
                            <div>
                                <label className="text-xs text-zinc-400 block mb-1">Microfone</label>
                                <select
                                    value={selectedDevices.microphoneId || ''}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            switchMicrophone(e.target.value);
                                        }
                                    }}
                                    className="w-full bg-zinc-900 text-white px-3 py-2 rounded text-sm border border-zinc-700 focus:border-indigo-500 focus:outline-none"
                                >
                                    {availableDevices.microphones.map((device) => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeetRoom;
