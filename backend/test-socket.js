const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: {
    token: process.env.TEST_SOCKET_JWT || "",
  },
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // Join a room
  socket.emit("joinRoom", "ROOM_ID");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});
