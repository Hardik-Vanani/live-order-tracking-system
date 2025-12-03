const express = require("express");
const DB = require("../models");
const auth = require("../middleware/auth");
const { redisClient } = require("../config/redis.config");
const router = express.Router();

const ordersListKey = (page, limit, userId) => `orders:user:${userId}:page:${page}:limit:${limit}`;

router.post("/", auth, async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items must be a non-empty array" });
        }

        const calculatedTotal = items.reduce((sum, item) => sum + item.rate * item.qty, 0);

        const order = await DB.orders.create({ userId: req.user._id, items, totalAmount: calculatedTotal, status: "created", });

        
        const pattern = `orders:user:${req.user._id}:*`;
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) await redisClient.del(keys);
        } catch (e) {
            console.error("Error invalidating cache after create", e.message);
        }

        res.status(201).json({ message: "Order Created Successfully", order });
    } catch (err) {
        console.error("Create order error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/", auth, async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page, 10) || 1;
        limit = parseInt(limit, 10) || 10;

        const cacheKey = ordersListKey(page, limit, req.user._id);

        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                console.log('🧠 Cache Hit for key: ', cacheKey);
                return res.json({ message: "Orders fetched successfully.", ...JSON.parse(cached), });
            }
        } catch (e) {
            console.error("Redis error for get orders: ", e.message);
        }

        const skip = (page - 1) * limit;

        const [orders, totalOrders] = await Promise.all([
            DB.orders.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            DB.orders.countDocuments({ userId: req.user._id }),
        ]);

        const responsePayload = { message: "Orders fetched successfully.", page, limit, total: totalOrders, totalPages: Math.ceil(totalOrders / limit), orders, };

        try {
            await redisClient.set(cacheKey, JSON.stringify(responsePayload), { EX: 60, });
        } catch (e) {
            console.error("Redis write error for orders list", e.message);
        }

        return res.json(responsePayload);
    } catch (err) {
        console.error("Get orders error:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.put("/:id/status", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["dispatched", "delivered"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const order = await DB.orders.findOne({ _id: id, userId: req.user._id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;
        await order.save();

        const pattern = `orders:user:${req.user._id}:*`;
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) await redisClient.del(keys);
        } catch (e) {
            console.error("Redis cache invalidation error:", e.message);
        }

        const payload = {
            orderId: order._id.toString(),
            newStatus: order.status,
            updatedAt: order.updatedAt.toISOString(),
        };

        global.io.emit("orderUpdated", payload);

        res.json({ message: "Order status updated", order });
    } catch (err) {
        console.error("Update order status error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;