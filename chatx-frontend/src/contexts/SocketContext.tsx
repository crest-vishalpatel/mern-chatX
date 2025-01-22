import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

const URL =
  import.meta.env.NODE_ENV === "production"
    ? undefined
    : "http://localhost:8000";

// Define context type
interface SocketContextType {
  socket: Socket | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useRef<Socket | null>(null);

  // Function to connect socket when the user logs in
  const connectSocket = () => {
    // if (!socket) {
    socket.current = io("http://localhost:8000", {
      withCredentials: true,
    });
  };

  // Function to disconnect socket when user logs out
  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      console.log("Disconnected from socket server");
    }
  };

  useEffect(() => {
    return () => {
      disconnectSocket(); // Clean up on unmount
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
