import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import { tokenManager } from "./tokenManager";

export const SOCKET_URL = (
  Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000"
).replace("/api/v1", "");

let socket: Socket | null = null;

/**
 * Returns the current socket instance if it exists.
 */
export const getSocket = (): Socket | null => {
  return socket;
};

export const connectSocket = async (): Promise<Socket> => {
  // If socket exists and is connected, just return it
  if (socket && socket.connected) return socket;

  await tokenManager.load();
  const token = tokenManager.getAccessToken();

  if (!token) throw new Error("Cannot connect socket: no access token found.");

  // Initialize socket
  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    auth: { token },
    // If you used the 'payments' namespace in NestJS,
    // you would add it to the URL or here.
  });

  // Event Listeners
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("⚡ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("❌ Socket connection error:", err.message);
  });

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
    console.log("🔌 Socket instance cleared.");
  }
};
