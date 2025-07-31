"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = void 0;
const generateToken_1 = require("../utils/generateToken");
const User_1 = require("../models/User");
const RefreshToken_1 = require("../utils/RefreshToken"); // Nuevo modelo para refresh tokens
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dayjs_1 = __importDefault(require("dayjs"));
// LOGIN 
const login = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        // 1. Buscar usuario
        const user = await User_1.User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        }).select('+password'); // Asegurar que incluya el campo password
        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }
        // 2. VERIFICAR SI EL USUARIO ESTÁ HABILITADO
        if (user.status === false) {
            return res.status(403).json({
                message: "Tu cuenta ha sido deshabilitada. Contacta al administrador para más información.",
                code: "ACCOUNT_DISABLED"
            });
        }
        // 2. Verificar contraseña
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" }); // Mismo mensaje por seguridad
        }
        // 3. Generar tokens
        const accessToken = (0, generateToken_1.generateAccessToken)(user._id.toString());
        const refreshToken = (0, generateToken_1.generateRefreshToken)(user._id.toString());
        // 4. Guardar refresh token en DB (nuevo)
        await RefreshToken_1.RefreshToken.create({
            token: refreshToken,
            userId: user._id,
            expiresAt: (0, dayjs_1.default)().add(7, 'days').toDate()
        });
        // 5. Actualizar último login
        user.lastLogin = new Date();
        await user.save();
        return res.json({
            message: 'Login exitoso',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                firstName: user.firstName,
                lastName: user.lastName,
                cardId: user.cardId
            }
        });
    }
    catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error interno en el servidor" });
    }
};
exports.login = login;
// REFRESH TOKEN 
const refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ message: 'Token de actualización requerido' });
    }
    try {
        // 1. Verificar token en DB
        const storedToken = await RefreshToken_1.RefreshToken.findOne({ token });
        if (!storedToken || (0, dayjs_1.default)(storedToken.expiresAt).isBefore((0, dayjs_1.default)())) {
            return res.status(403).json({ message: 'Refresh token inválido o expirado' });
        }
        // 2. Verificar firma JWT
        const decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_SECRET || 'refresh_secret');
        // 3. Generar nuevos tokens
        const newAccessToken = (0, generateToken_1.generateAccessToken)(decoded.userId);
        const newRefreshToken = (0, generateToken_1.generateRefreshToken)(decoded.userId);
        // 4. Actualizar refresh token en DB
        await RefreshToken_1.RefreshToken.findByIdAndUpdate(storedToken._id, {
            token: newRefreshToken,
            expiresAt: (0, dayjs_1.default)().add(7, 'days').toDate()
        });
        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (err) {
        return res.status(403).json({ message: 'Refresh token inválido' });
    }
};
exports.refreshToken = refreshToken;
// LOGOUT
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        // Eliminar refresh token de la DB
        await RefreshToken_1.RefreshToken.deleteOne({ token: refreshToken });
        res.json({ message: 'Sesión cerrada correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
};
exports.logout = logout;
