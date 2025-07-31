"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
// Esquema de Mongoose
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "docente"],
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    cardId: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    status: {
        type: Boolean,
        default: true
    },
    doorOpenReminderMinutes: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
});
// exporta el modelo
exports.User = (0, mongoose_1.model)("User", userSchema);
