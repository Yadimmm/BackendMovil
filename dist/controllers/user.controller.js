"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAccessLogs = exports.getUserById = exports.resetPassword = exports.forgotPasswordMovil = exports.updateUserCardId = exports.enableUser = exports.disableUser = exports.changePassword = exports.updateUser = exports.getAllUsers = exports.createUser = void 0;
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Card_1 = require("../models/Card");
const crypto_1 = __importDefault(require("crypto"));
const sendEmail_1 = require("../utils/sendEmail");
const AccessEvent_1 = require("../models/AccessEvent");
const mongoose_1 = __importDefault(require("mongoose"));
// CREAR UN NUEVO USUARIO
const createUser = async (req, res) => {
    try {
        const { username, password, email, role, firstName, lastName, cardId, } = req.body;
        // Verificar si ya existe el usuario
        const existingUser = await User_1.User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "El nombre de usuario ya existe" });
        }
        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        const newUser = new User_1.User({
            username,
            password: hashedPassword,
            email,
            role,
            firstName,
            lastName,
            cardId, // tarjeta
            doorOpenReminderMinutes: false, // valor por defecto
            createdAt: new Date(), // asignar la fecha actual
            lastLogin: null, // aún no ha iniciado sesión
            status: true
        });
        const savedUser = await newUser.save();
        return res.status(201).json({ user: savedUser });
    }
    catch (error) {
        console.error("Error ocurrido en createUser: ", error);
        return res.status(500).json({ message: "Error al crear usuario", error });
    }
};
exports.createUser = createUser;
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.User.find().select('-password'); // opcional ocultar contraseña
        res.status(200).json({ users });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
};
exports.getAllUsers = getAllUsers;
// EDITAR USUARIO (sin cambiar contraseña)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role, firstName, lastName, cardId } = req.body;
        // Buscar el usuario existente
        const user = await User_1.User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        // Verificar si el nuevo username ya existe
        if (username && username !== user.username) {
            const existingUser = await User_1.User.findOne({ username });
            if (existingUser) {
                return res.status(409).json({ message: "El nombre de usuario ya está en uso" });
            }
        }
        // Actualizar solo los campos permitidos
        const updatedUser = await User_1.User.findByIdAndUpdate(id, {
            username: username || user.username,
            email: email || user.email,
            role: role || user.role,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            cardId: cardId || user.cardId
        }, { new: true, runValidators: true }).select('-password');
        return res.status(200).json({
            message: "Usuario actualizado correctamente",
            user: updatedUser
        });
    }
    catch (error) {
        console.error("Error en updateUser: ", error);
        return res.status(500).json({
            message: "Error al actualizar usuario",
            error: error.message
        });
    }
};
exports.updateUser = updateUser;
// CAMBIO DE CONTRASEÑA (SOLO PARA EL PROPIO USUARIO)
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        // Buscar el usuario
        const user = await User_1.User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        // Encriptar nueva contraseña
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        // Actualizar la contraseña
        await User_1.User.findByIdAndUpdate(id, { $set: { password: hashedPassword } });
        return res.status(200).json({ message: "Contraseña actualizada correctamente" });
    }
    catch (error) {
        console.error("Error en changePassword:", error);
        return res.status(500).json({
            message: "Error al cambiar la contraseña",
            error: error.message
        });
    }
};
exports.changePassword = changePassword;
// DESHABILITAR USUARIO (cambiar status a false)
const disableUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Verificar si el usuario existe
        const user = await User_1.User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        // Si el usuario tiene tarjeta, libera la tarjeta y elimina el campo cardId
        if (user.cardId) {
            // Libera la tarjeta en la colección de tarjetas
            const card = await Card_1.Card.findOne({ uid: user.cardId }); // Ajusta el import si es necesario //CAMBIO WEB
            if (card) {
                card.assignedTo = undefined;
                await card.save();
            }
            // Elimina el campo cardId del usuario usando $unset
            await User_1.User.updateOne({ _id: id }, { $unset: { cardId: "" } });
        }
        // Cambiar el status a false
        const disabledUser = await User_1.User.findByIdAndUpdate(id, { status: false }, { new: true }).select('-password');
        return res.status(200).json({
            message: "Usuario deshabilitado correctamente",
            user: disabledUser
        });
    }
    catch (error) {
        console.error("Error en disableUser: ", error);
        return res.status(500).json({
            message: "Error al deshabilitar usuario",
            error: error.message
        });
    }
};
exports.disableUser = disableUser;
// HABILITAR USUARIO (cambiar status a true)
const enableUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const enabledUser = await User_1.User.findByIdAndUpdate(id, { status: true }, { new: true }).select('-password');
        return res.status(200).json({
            message: "Usuario habilitado correctamente",
            user: enabledUser
        });
    }
    catch (error) {
        console.error("Error en enableUser: ", error);
        return res.status(500).json({
            message: "Error al habilitar usuario",
            error: error.message
        });
    }
};
exports.enableUser = enableUser;
// ACTUALIZAR CARD ID DEL USUARIO
// Esta función actualiza el cardId de un usuario específico
const updateUserCardId = async (req, res) => {
    try {
        const { id } = req.params;
        const { cardId } = req.body; // Recibimos cardId (que contendrá el UID)
        // Validación básica
        if (cardId && typeof cardId !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'El ID de tarjeta debe ser una cadena de texto'
            });
        }
        const updatedUser = await User_1.User.findByIdAndUpdate(id, { cardId }, // Actualizamos cardId con el UID string
        { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Tarjeta actualizada exitosamente',
            user: updatedUser
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la tarjeta del usuario'
        });
    }
};
exports.updateUserCardId = updateUserCardId;
// 1. Solicitar recuperación (envía correo) -MOVIL UNICA
const forgotPasswordMovil = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user)
            return res.status(404).json({ message: "El email no existe en el sistema, por favor intente con otro" });
        // Generar token seguro
        const token = crypto_1.default.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        await user.save();
        // Frontend: usar /reset-password?token=xxx (no /reset-password/:token)
        const resetLink = `cinnamiapp://reset-password?token=${token}`;
        await (0, sendEmail_1.sendResetEmail)(user.email, resetLink);
        return res.json({ message: "Se envió un correo con el enlace para restablecer la contraseña." });
    }
    catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ message: "Error al procesar la solicitud." });
    }
};
exports.forgotPasswordMovil = forgotPasswordMovil;
// 2. Restablecer la contraseña
const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        console.log("Token recibido:", token);
        const user = await User_1.User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        console.log("Usuario encontrado:", user);
        if (!user)
            return res.status(400).json({ message: "Token inválido o expirado" });
        // Cambiar contraseña (hash)
        user.password = await bcrypt_1.default.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.json({ message: "Contraseña restablecida exitosamente" });
    }
    catch (error) {
        console.error("Error en resetPassword:", error);
        res.status(500).json({ message: "Error al restablecer la contraseña." });
    }
};
exports.resetPassword = resetPassword;
//Móvil Traer usuario por ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        // Buscar el usuario por ID
        const user = await User_1.User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        console.error("Error en getUserById:", error);
        res.status(500).json({ message: "Error al obtener el usuario." });
    }
};
exports.getUserById = getUserById;
// Busca los eventos de acceso de ese usuario, ordenados por fecha descendente
const getUserAccessLogs = async (req, res) => {
    try {
        const { id } = req.params;
        // Buscar los eventos de acceso del usuario
        const accessLogs = await AccessEvent_1.AccessEvent.find({ userId: new mongoose_1.default.Types.ObjectId(id) })
            .sort({ timestamp: -1 })
            .populate('doorId', 'name')
            .exec();
        return res.status(200).json({ accessLogs });
    }
    catch (error) {
        console.error("Error en getUserAccessLogs:", error);
        res.status(500).json({ message: "Error al obtener los eventos de acceso." });
    }
};
exports.getUserAccessLogs = getUserAccessLogs;
