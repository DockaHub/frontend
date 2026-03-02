import React, { createContext, useState, useRef, useEffect, ReactNode, useContext } from 'react';
import { socketService } from '../services/socketService';
import SimplePeer, { Instance as PeerInstance } from 'simple-peer';
import { useAuth } from './AuthContext';

// Manual polyfills removed in favor of vite-plugin-node-polyfills

interface PeerData {
    peerId: string;
    peer: PeerInstance;
    userName?: string;
}

interface MeetContextType {
    stream: MediaStream | undefined;
    peers: PeerData[];
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
    isMeetingActive: boolean;
    toggleAudio: () => void;
    toggleVideo: () => void;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    roomId: string | null;
    toggleScreenShare: () => void;
    isScreenSharing: boolean;
    socketStatus: { connected: boolean, id?: string, serverUrl?: string };
    availableDevices: { cameras: MediaDeviceInfo[], microphones: MediaDeviceInfo[] };
    selectedDevices: { cameraId: string | null, microphoneId: string | null };
    switchCamera: (deviceId: string) => Promise<void>;
    switchMicrophone: (deviceId: string) => Promise<void>;
}

const MeetContext = createContext<MeetContextType | undefined>(undefined);

export const MeetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [peers, setPeers] = useState<PeerData[]>([]);
    const [stream, setStream] = useState<MediaStream>();
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isMeetingActive, setIsMeetingActive] = useState(false);

    // Media Controls
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Device Selection
    const [availableDevices, setAvailableDevices] = useState<{ cameras: MediaDeviceInfo[], microphones: MediaDeviceInfo[] }>({ cameras: [], microphones: [] });
    const [selectedDevices, setSelectedDevices] = useState<{ cameraId: string | null, microphoneId: string | null }>({ cameraId: null, microphoneId: null });


    const peersRef = useRef<PeerData[]>([]);
    const userRef = useRef(user);

    // Update ref when user changes
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const createPeer = (userToSignal: string, callerId: string, stream: MediaStream) => {
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socketService.emit('signal-peer', {
                to: userToSignal,
                from: callerId,
                signal
            });
        });

        return peer;
    }

    const addPeer = (incomingSignal: any, callerId: string, stream: MediaStream) => {
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socketService.emit('signal-peer', {
                to: callerId,
                from: socketService.getSocketId(), // My Socket ID
                signal
            });
        });

        peer.signal(incomingSignal);

        return peer;
    }

    const joinRoom = async (roomID: string) => {
        setIsMeetingActive(true);
        setRoomId(roomID);

        try {
            const constraints: MediaStreamConstraints = {
                video: selectedDevices.cameraId ? { deviceId: { exact: selectedDevices.cameraId } } : true,
                audio: selectedDevices.microphoneId ? { deviceId: { exact: selectedDevices.microphoneId } } : true
            };
            const currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(currentStream);

            // Update selected devices from actual stream
            const videoTrack = currentStream.getVideoTracks()[0];
            const audioTrack = currentStream.getAudioTracks()[0];
            if (videoTrack) {
                setSelectedDevices(prev => ({ ...prev, cameraId: videoTrack.getSettings().deviceId || null }));
            }
            if (audioTrack) {
                setSelectedDevices(prev => ({ ...prev, microphoneId: audioTrack.getSettings().deviceId || null }));
            }

            // Join via Socket
            // We use user.id as socket ID in our backend logic for 1-on-1, 
            // but for Mesh we need to signal specific socket IDs usually, 
            // OR we rely on our user-ID based rooms. 
            // In our `socket.ts`, we did `socket.join(socket.user.id)`. 
            // So `to: userId` works for signaling!

            socketService.emit('join-room', roomID, userRef.current?.id);
            console.log(`[Meet] Emitted join-room: ${roomID} for user: ${userRef.current?.id}`);

            socketService.on('user-connected', ({ userId, socketId, name }: { userId: string, socketId: string, name?: string }) => {
                console.log(`[Meet] user-connected event received for: ${userId} (Socket: ${socketId}, Name: ${name})`);

                // Prevent connecting to self (if same user in multiple tabs)
                if (socketId === socketService.getSocketId()) return;

                // Connect to new user using their Socket ID
                const peer = createPeer(socketId, socketService.getSocketId() || '', currentStream);

                peersRef.current.push({
                    peerId: socketId,
                    peer,
                    userName: name // Store name
                });
                setPeers(prev => [...prev, { peerId: socketId, peer, userName: name }]);
            });

            socketService.on('signal-peer', (data: { signal: any, from: string, sender?: { name: string } }) => {
                console.log(`[Meet] signal-peer event received from: ${data.from}`);
                const item = peersRef.current.find(p => p.peerId === data.from);
                if (item) {
                    item.peer.signal(data.signal);
                } else {
                    // Incoming connection (someone else initiated)
                    // data.from is the caller's Socket ID
                    const peer = addPeer(data.signal, data.from, currentStream);
                    peersRef.current.push({
                        peerId: data.from,
                        peer,
                        userName: data.sender?.name // Store sender name
                    });
                    setPeers(prev => [...prev, { peerId: data.from, peer, userName: data.sender?.name }]);
                }
            });

            socketService.on('user-disconnected', (socketId: string) => {
                console.log(`[Meet] User/Socket disconnected: ${socketId}`);
                const peerObj = peersRef.current.find(p => p.peerId === socketId);
                if (peerObj) {
                    peerObj.peer.destroy();
                }
                const peers = peersRef.current.filter(p => p.peerId !== socketId);
                peersRef.current = peers;
                setPeers(peers);
            });

            // Handle Reconnection
            socketService.on('connect', () => {
                console.log("[Meet] Socket reconnected, re-joining room...");
                if (roomID && userRef.current?.id) {
                    socketService.emit('join-room', roomID, userRef.current?.id);
                }
            });

        } catch (error) {
            console.error("Error accessing media devices:", error);
            setIsMeetingActive(false);
        }
    };

    const leaveRoom = () => {
        // Destroy all peers
        peersRef.current.forEach(p => p.peer.destroy());
        peersRef.current = [];
        setPeers([]);

        // Stop stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(undefined);
        }

        setIsMeetingActive(false);
        setRoomId(null);

        // Clean up listeners
        socketService.off('user-connected');
        socketService.off('signal-peer');
        socketService.off('user-disconnected');

        // Reload is often safest for clearing WebRTC state
        // window.location.reload(); 
        // Or just let UI handle it.
    };

    const toggleAudio = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !isAudioEnabled);
            setIsAudioEnabled(!isAudioEnabled);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !isVideoEnabled);
            setIsVideoEnabled(!isVideoEnabled);
        }
    };


    const switchStream = (oldStream: MediaStream, newStream: MediaStream) => {
        peersRef.current.forEach(peerData => {
            // Replace video track
            const oldVideoTrack = oldStream.getVideoTracks()[0];
            const newVideoTrack = newStream.getVideoTracks()[0];

            if (oldVideoTrack && newVideoTrack) {
                peerData.peer.replaceTrack(oldVideoTrack, newVideoTrack, oldStream);
            }
        });
    }

    const toggleScreenShare = async () => {
        if (isScreenSharing && screenStream) {
            // Stop sharing
            screenStream.getTracks().forEach(track => track.stop());
            setScreenStream(null);
            setIsScreenSharing(false);

            // Revert to webcam
            if (stream) {
                navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((camStream) => {
                    switchStream(stream, camStream);
                    setStream(camStream);
                });
            }

        } else {
            // Start sharing
            try {
                const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setScreenStream(displayStream);
                setIsScreenSharing(true);

                if (stream) {
                    switchStream(stream, displayStream);
                    setStream(displayStream);
                }

                // Handle system stop
                displayStream.getVideoTracks()[0].onended = () => {
                    setIsScreenSharing(false);
                    setScreenStream(null);
                    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((camStream) => {
                        if (stream) switchStream(displayStream, camStream);
                        setStream(camStream);
                    });
                };
            } catch (err) {
                console.error("Error sharing screen:", err);
            }
        }
    };

    // Device Management
    const enumerateDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(d => d.kind === 'videoinput');
            const microphones = devices.filter(d => d.kind === 'audioinput');
            setAvailableDevices({ cameras, microphones });
        } catch (err) {
            console.error('Failed to enumerate devices:', err);
        }
    };

    const switchCamera = async (deviceId: string) => {
        if (!stream) return;

        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId } },
                audio: stream.getAudioTracks().length > 0 ? {
                    deviceId: stream.getAudioTracks()[0].getSettings().deviceId
                } : true
            });

            const oldVideoTrack = stream.getVideoTracks()[0];
            const newVideoTrack = newStream.getVideoTracks()[0];

            // Replace track in all peer connections
            peersRef.current.forEach(peerData => {
                if (oldVideoTrack && newVideoTrack) {
                    peerData.peer.replaceTrack(oldVideoTrack, newVideoTrack, stream);
                }
            });

            // Update local stream
            if (oldVideoTrack) oldVideoTrack.stop();
            stream.removeTrack(oldVideoTrack);
            stream.addTrack(newVideoTrack);

            setSelectedDevices(prev => ({ ...prev, cameraId: deviceId }));
            setStream(stream);
        } catch (err) {
            console.error('Failed to switch camera:', err);
        }
    };

    const switchMicrophone = async (deviceId: string) => {
        if (!stream) return;

        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: stream.getVideoTracks().length > 0 ? {
                    deviceId: stream.getVideoTracks()[0].getSettings().deviceId
                } : false,
                audio: { deviceId: { exact: deviceId } }
            });

            const oldAudioTrack = stream.getAudioTracks()[0];
            const newAudioTrack = newStream.getAudioTracks()[0];

            // Replace track in all peer connections
            peersRef.current.forEach(peerData => {
                if (oldAudioTrack && newAudioTrack) {
                    peerData.peer.replaceTrack(oldAudioTrack, newAudioTrack, stream);
                }
            });

            // Update local stream
            if (oldAudioTrack) oldAudioTrack.stop();
            stream.removeTrack(oldAudioTrack);
            stream.addTrack(newAudioTrack);

            // Preserve audio enabled state
            newAudioTrack.enabled = isAudioEnabled;

            setSelectedDevices(prev => ({ ...prev, microphoneId: deviceId }));
            setStream(stream);
        } catch (err) {
            console.error('Failed to switch microphone:', err);
        }
    };

    // Enumerate devices on mount
    useEffect(() => {
        enumerateDevices();

        // Listen for device changes
        navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
        };
    }, []);


    // Debug Socket Status
    const [socketStatus, setSocketStatus] = useState<{ connected: boolean, id?: string, serverUrl?: string }>({ connected: false });

    // Update debug status periodically
    useEffect(() => {
        const checkStatus = () => {
            const connected = socketService.isConnected();
            setSocketStatus({
                connected,
                id: socketService.getSocketId(),
                serverUrl: socketService.getServerUrl()
            });

            // Fail-safe: Try to connect if not connected and userRef.currentInterval(checkStatus, 2000);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <MeetContext.Provider value={{
            stream,
            peers,
            joinRoom,
            leaveRoom,
            isMeetingActive,
            toggleAudio,
            toggleVideo,
            isAudioEnabled,
            isVideoEnabled,
            roomId,
            toggleScreenShare,
            isScreenSharing,
            socketStatus,
            availableDevices,
            selectedDevices,
            switchCamera,
            switchMicrophone
        }}>
            {children}
        </MeetContext.Provider>
    );
};

export const useMeet = () => {
    const context = useContext(MeetContext);
    if (!context) throw new Error("useMeet must be used within MeetProvider");
    return context;
};
