require('dotenv').config();
const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-16762.c8.us-east-1-3.ec2.cloud.redislabs.com',
        port: 16762
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

async function connectRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('Redis connected...');
        }
    } catch (err) {
        console.error('Redis connection error:', err.message);
    }
}

async function testRedis() {
    try {
        await connectRedis();

        await redisClient.set("test", "Testing for Live Order Tracking System");
        const result = await redisClient.get("test");
        console.log("Test get:", result);
    } catch (err) {
        console.error("Redis test error:", err.message);
    }
}

testRedis();
module.exports = { redisClient, connectRedis };
