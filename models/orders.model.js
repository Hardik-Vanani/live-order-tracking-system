const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        items: [
            {
                name: { type: String, required: true, trim: true },
                qty: { type: Number, required: true, min: 1 },
                rate: { type: Number, required: true, min: 0 },
            },
        ],
        status: { type: String, enum: ["created", "dispatched", "delivered"], default: "created" },
        totalAmount: { type: Number, required: true, min: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("orders", orderSchema, "orders");