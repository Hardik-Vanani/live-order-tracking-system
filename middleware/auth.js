const jwt = require("jsonwebtoken");
const DB = require("../models");

const auth = async (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(401).json({ message: "Token is required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user to request
        req.user = await DB.user.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(401).json({ message: "User not found." });
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Token is not valid." });
    }
};

module.exports = auth;
