import React, { createContext, useState, useRef, useEffect, ReactNode, useContext } from 'react';
import { socketService } from '../services/socketService';
import SimplePeer, { Instance as PeerInstance } from 'simple-peer';
import { useAuth } from './AuthContext';

// Add global Buffer for simple-peer if needed (though vite config handles some)
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
    (window as any).process = { env: {} };
}

interface CallContextType {
    call: {
        isReceivingCall: boolean;
        from: string;
        name: string;
        signal: any;
    };
    callAccepted: boolean;
    callEnded: boolean;
    myVideo: React.RefObject<HTMLVideoElement | null>;
    userVideo: React.RefObject<HTMLVideoElement | null>;
    stream: MediaStream | undefined;
    name: string;
    setName: (name: string) => void;
    callUser: (id: string, name: string) => void;
    leaveCall: () => void;
    answerCall: () => void;
    isCallActive: boolean;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [stream, setStream] = useState<MediaStream>();
    const [name, setName] = useState('');
    const [call, setCall] = useState({ isReceivingCall: false, from: '', name: '', signal: null });
    const [isCallActive, setIsCallActive] = useState(false);

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<PeerInstance>();

    // Initial Stream Setup (only when needed request) - actually better to req only on call
    // But for now let's request when context mounts to ensure permissions or on 1st call intent

    useEffect(() => {
        const setupSocketListeners = () => {
            socketService.on('callUser', (data: any) => {
                console.log("Incoming call from", data.name);
                setCall({ isReceivingCall: true, from: data.from, name: data.name, signal: data.signal });
                setIsCallActive(true); // Open Modal
            });
        };

        setupSocketListeners();

        // Listener for Call Accepted is specific to the caller instance, but we can have global one too?
        // Actually better to attach inside callUser logic or use effect?
        // If we use single ref, we need to be careful.

        return () => {
            socketService.off('callUser');
        };
    }, []);

    const enableStream = async () => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
            return currentStream;
        } catch (err) {
            console.error("Failed to get stream", err);
            return null;
        }
    };

    const answerCall = async () => {
        setCallAccepted(true);
        const currentStream = await enableStream();
        if (!currentStream) return;

        const peer = new SimplePeer({ initiator: false, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
            socketService.emit('answerCall', { signal: data, to: call.from });
        });

        peer.on('stream', (currentRemoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentRemoteStream;
            }
        });

        peer.signal(call.signal);
        connectionRef.current = peer;
    };

    const callUser = async (id: string, nameToCall: string) => {
        setIsCallActive(true); // Open overlay
        const currentStream = await enableStream();
        if (!currentStream) {
            setIsCallActive(false);
            return;
        }

        const peer = new SimplePeer({ initiator: true, trickle: false, stream: currentStream });

        peer.on('signal', (data) => {
            socketService.emit('callUser', {
                userToCall: id,
                signalData: data,
                from: user?.id,
                name: user?.name
            });
        });

        peer.on('stream', (currentRemoteStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentRemoteStream;
            }
        });

        socketService.on('callAccepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        socketService.on('callEnded', () => {
            leaveCall();
        });

        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }

        // Stop all tracks
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(undefined);
        }

        // Reset State
        setCallAccepted(false);
        setIsCallActive(false);
        setCall({ isReceivingCall: false, from: '', name: '', signal: null });

        // Notify other user
        if (callAccepted && !callEnded) {
            const target = call.from; // If we answered
            // If we initiated, we don't store target ID in state easily without extra field
            // For now simplified
            socketService.emit('endCall', { to: call.from });
        }

        window.location.reload(); // Simplest clean up for now to avoid peer duplicate issues
    };

    return (
        <CallContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name,
            setName,
            callEnded,
            callUser,
            leaveCall,
            answerCall,
            isCallActive
        }}>
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error("useCall must be used within CallProvider");
    return context;
};
