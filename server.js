require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDb = require("./config/db.config");
const { connectRedis } = require("./config/redis.config");
const createApp = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDb();
    await connectRedis();

    const httpServer = http.createServer();
    
    const io = new Server(httpServer, { cors: { origin: "*", }, });
    global.io = io;

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    // Create Express app and attach to HTTP server
    const app = createApp();

    // Use express as the handler for HTTP requests
    httpServer.on("request", app);

    httpServer.listen(PORT, () => {
        console.log(`Server listening on port http://127.0.0.1:${PORT}`);
    });
};

startServer().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});
