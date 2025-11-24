/**
 * Socket.io Client
 * 
 * WebSocket client for real-time communication
 */

import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4444';

class SocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketClient = new SocketClient();

