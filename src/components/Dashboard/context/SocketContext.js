// src/contexts/SocketContext.js
import React, { createContext, useEffect, useState, useContext, useRef } from "react";
import io from "socket.io-client";
import { message } from "antd";
import { AuthContext } from "../../Auth/AuthContext";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (token) {
      console.log("Token is available, connecting to web socket server...");

      const newSocket = io("http://localhost:5050", {
        reconnectionAttempts: 3,
        timeout: 3000,
        query: { token },
      });

      setConnecting(true);

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setConnecting(false);
        setError(null);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setError("Socket disconnected");
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        messageApi.error("Socket connection error: " + err.message);
        setError("Socket connection error");
      });

      newSocket.on("error", (err) => {
        console.error("Socket error:", err);
        setError("Socket error");
      });

      socketRef.current = newSocket;

      // Clean up function
      return () => {
        if (socketRef.current) {
          console.log("Cleaning up socket connection...");
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    } else if (!token && socketRef.current) {
      console.log("Token not available, disconnecting socket...");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [token, messageApi]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, error, connecting }}>
      {contextHolder}
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };