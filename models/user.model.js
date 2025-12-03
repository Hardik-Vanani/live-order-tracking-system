const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, },
        password: { type: String, required: true, },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Hash password before save
userSchema.pre('save', async function () {
    try {
        if (this.isModified('password') || this.isNew)
            this.password = await bcrypt.hash(this.password, 10);

    } catch (error) {
        console.error(`PRE SAVE ERROR: ${error}`);
        throw error;
    }
});


module.exports = mongoose.model("user", userSchema, "user");
