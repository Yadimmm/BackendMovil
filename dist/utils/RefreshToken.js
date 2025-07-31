"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RefreshTokenSchema = new mongoose_1.default.Schema({
    token: { type: String, required: true, unique: true },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});
exports.RefreshToken = mongoose_1.default.model('RefreshToken', RefreshTokenSchema);
