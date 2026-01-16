const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTFkZGUxNWE5MTY1YWM3ZjZjMWE5MmMiLCJlbWFpbCI6ImJhcmthdEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc2Nzk2OTI5MCwiZXhwIjoxNzY3OTcwMTkwfQ.zbKWzqrJFYPaGuk68UZ3n1cEwcPzwsOBZ6Bp5TbpdmA",
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
