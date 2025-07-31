"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Access Token (15 min)
const generateAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'cinnami_secret', { expiresIn: '15d' });
};
exports.generateAccessToken = generateAccessToken;
// Refresh Token (7 días)
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.REFRESH_SECRET || 'refresh_cinnami_secret', { expiresIn: '7d' });
};
exports.generateRefreshToken = generateRefreshToken;
