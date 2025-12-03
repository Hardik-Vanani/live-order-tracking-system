require("dotenv").config();
const { io } = require("socket.io-client");

// localhost:5000
const SOCKET_URL = `http://localhost:${process.env.PORT || 5000}`;

const socket = io(SOCKET_URL);

socket.on("connect", () => {
    console.log("Connected to Socket.IO server as client:", socket.id);
});

socket.on("orderUpdated", (data) => {
    console.log("Order update received via Socket.IO:");
    console.log(JSON.stringify(data, null, 2));
});

socket.on("disconnect", () => {
    console.log("Socket disconnected...");
});

socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
});
