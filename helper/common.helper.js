const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



module.exports = {

    hashPassword: async (password) => {
        const hash = await bcrypt.hash(password, 10);
        return hash;
    },

    generateToken: async ({ data }) => {
        const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '365d' });
        return token;
    },

    comparePassword: async (pass, hashedPassword) => {
        const isPasswordMatch = await bcrypt.compare(pass, hashedPassword);
        return isPasswordMatch;
    }
};