const express = require("express");
const router = express.Router();
const DB = require("../models");
const { hashPassword, generateToken, comparePassword } = require("../helper/common.helper");

// Register a new user
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ message: "Name, Email and password are required." });
    }

    try {
        const existingUser = await DB.user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists." });
        }

        const newUser = await DB.user.create({ name, email, password });
        const token = await generateToken({ data: { id: newUser._id } });
        res.status(201).json({ message: "User registered successfully", user: newUser, token });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Login user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await DB.user.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }
        const token = await generateToken({ data: { id: user._id } });
        res.status(200).json({ message: "User logged in successfully", user: { id: user._id, name: user.name, email: user.email }, token });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;