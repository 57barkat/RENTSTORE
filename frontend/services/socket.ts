import { io, Socket } from "socket.io-client";
import { tokenManager } from "./tokenManager";

export const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL.replace(
  "/api/v1",
  "",
);

let socket: Socket | null = null;
let connectPromise: Promise<Socket> | null = null;

const attachSocketListeners = (socketInstance: Socket) => {
  socketInstance.off("connect");
  socketInstance.off("disconnect");
  socketInstance.off("connect_error");

  socketInstance.on("connect", () => {
    console.log("Socket connected:", socketInstance.id);
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socketInstance.on("connect_error", (err) => {
    console.log("Socket connection error:", err.message);
  });
};

/**
 * Returns the current socket instance if it exists.
 */
export const getSocket = (): Socket | null => {
  return socket;
};

export const connectSocket = async (): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  if (connectPromise) {
    return connectPromise;
  }

  await tokenManager.load();
  const token = tokenManager.getAccessToken();

  if (!token) throw new Error("Cannot connect socket: no access token found.");

  const socketInstance =
    socket ??
    io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      auth: { token },
    });

  socketInstance.auth = { token };
  attachSocketListeners(socketInstance);
  socket = socketInstance;

  if (socketInstance.connected) {
    return socketInstance;
  }

  connectPromise = new Promise<Socket>((resolve, reject) => {
    const handleConnect = () => {
      cleanup();
      connectPromise = null;
      resolve(socketInstance);
    };

    const handleError = (err: Error) => {
      cleanup();
      connectPromise = null;
      reject(err);
    };

    const cleanup = () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("connect_error", handleError);
    };

    socketInstance.once("connect", handleConnect);
    socketInstance.once("connect_error", handleError);

    if (!socketInstance.active) {
      socketInstance.connect();
    }
  });

  return connectPromise;
};

export const disconnectSocket = () => {
  connectPromise = null;

  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
    console.log("Socket instance cleared.");
  }
};
