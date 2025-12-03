const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const setupOrderRoutes = require("./routes/order.routes");

const createApp = () => {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.get("/", (req, res) => {
        res.send("Live Order Tracking System APIs is running...");
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/orders", setupOrderRoutes);

    // 404 fallback
    app.use((req, res) => {
        res.status(404).json({ message: "Route not found" });
    });

    return app;
};

module.exports = createApp;
