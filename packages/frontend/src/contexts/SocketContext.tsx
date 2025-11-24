'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketClient } from '@/lib/socket/client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    if (token) {
      const socketInstance = socketClient.connect(token);
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      return () => {
        socketClient.disconnect();
      };
    } else {
      socketClient.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

