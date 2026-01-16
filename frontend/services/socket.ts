import { io, Socket } from "socket.io-client";
import { tokenManager } from "@/auth/tokenManager";
import Constants from "expo-constants";

export const SOCKET_URL = (
  Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000"
).replace("/api/v1", "");

let socket: Socket | null = null;

export const connectSocket = async (): Promise<Socket> => {
  if (socket && socket.connected) return socket;

  await tokenManager.load();
  const token = tokenManager.getAccessToken();

  if (!token) throw new Error("Cannot connect socket: no access token found.");

  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    auth: { token },
  });

  socket.on("connect", () => console.log("✅ Socket connected:", socket?.id));
  socket.on("disconnect", (reason) =>
    console.log("⚡ Socket disconnected:", reason)
  );
  socket.on("connect_error", (err) =>
    console.log("❌ Socket connection error:", err.message)
  );

  socket.connect();
  return socket;
};
