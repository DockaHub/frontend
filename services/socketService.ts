
import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    connect() {
        if (this.socket) return;

        const token = localStorage.getItem('token'); // Assuming token is stored here
        if (!token) return;

        // Use VITE_API_URL or fallback to localhost:3002
        // If VITE_API_URL includes '/api', remove it for the socket connection
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
        const socketUrl = apiUrl.replace(/\/api$/, '');

        this.socket = io(socketUrl, {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to socket server');
        });

        this.socket.on('disconnect', (reason) => {
            console.log(`❌ Disconnected from socket server. Reason: ${reason}`);
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        // Re-attach listeners if any were added before connection
        this.listeners.forEach((callbacks, event) => {
            callbacks.forEach(cb => this.socket?.on(event, cb as any));
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinChannel(channelId: string) {
        this.socket?.emit('join_channel', channelId);
    }

    leaveChannel(channelId: string) {
        this.socket?.emit('leave_channel', channelId);
    }

    emit(event: string, ...args: any[]) {
        this.socket?.emit(event, ...args);
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);

        if (this.socket) {
            this.socket.on(event, callback as any);
        }
    }

    off(event: string, callback?: Function) {
        if (!callback) {
            this.listeners.delete(event);
            this.socket?.off(event);
            return;
        }

        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
            if (callbacks.length === 0) {
                this.listeners.delete(event);
            }
        }
        this.socket?.off(event, callback as any);
    }

    getSocketId() {
        return this.socket?.id;
    }

    isConnected() {
        return this.socket?.connected || false;
    }
    getServerUrl() {
        return this.socket?.io.uri || 'Unknown';
    }
}

export const socketService = new SocketService();
