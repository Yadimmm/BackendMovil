"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSelfOrAdmin = exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Acceso no autorizado' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.userId = decoded.userId; // Añade el ID al request
        next();
    }
    catch (error) {
        res.status(403).json({ message: 'Token inválido o expirado, Se le recomienda volver a iniciar sesión' });
    }
};
exports.verifyToken = verifyToken;
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acceso no autorizado" });
    }
    next();
};
exports.isAdmin = isAdmin;
const isSelfOrAdmin = (req, res, next) => {
    if (!req.user || (req.user._id.toString() !== req.params.id && req.user.role !== 'admin')) {
        return res.status(403).json({ message: "Acceso no autorizado" });
    }
    next();
};
exports.isSelfOrAdmin = isSelfOrAdmin;
