import { Request, Response } from "express";
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { User } from "../models/User";
import { RefreshToken } from "../utils/RefreshToken"; // Nuevo modelo para refresh tokens
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dayjs from "dayjs";
import { Types } from 'mongoose';
import { Card } from "../models/Card";
import crypto from 'crypto';
import { sendResetEmail } from "../utils/sendEmail"; 
import { AccessEvent } from "../models/AccessEvent";
import mongoose from "mongoose";


// CREAR UN NUEVO USUARIO
export const createUser = async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
            email,
            role,
            firstName,
            lastName,
            cardId,
        } = req.body;

        // Verificar si ya existe el usuario
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "El nombre de usuario ya existe" });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            role,
            firstName,
            lastName,
            cardId, // tarjeta
            doorOpenReminderMinutes: false, // valor por defecto
            createdAt: new Date(),      // asignar la fecha actual
            lastLogin: null,         // aún no ha iniciado sesión
            status: true
        });

        const savedUser = await newUser.save();

        return res.status(201).json({ user: savedUser });

    } catch (error) {
        console.error("Error ocurrido en createUser: ", error);
        return res.status(500).json({ message: "Error al crear usuario", error });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password'); // opcional ocultar contraseña
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};


// EDITAR USUARIO (sin cambiar contraseña)
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            username,
            email,
            role,
            firstName,
            lastName,
            cardId
        } = req.body;

        // Buscar el usuario existente
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar si el nuevo username ya existe
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(409).json({ message: "El nombre de usuario ya está en uso" });
            }
        }

        // Actualizar solo los campos permitidos
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { 
                username: username || user.username,
                email: email || user.email,
                role: role || user.role,
                firstName: firstName || user.firstName,
                lastName: lastName || user.lastName,
                cardId: cardId || user.cardId
            },
            { new: true, runValidators: true }
        ).select('-password');

        return res.status(200).json({ 
            message: "Usuario actualizado correctamente",
            user: updatedUser 
        });

    } catch (error) {
        console.error("Error en updateUser: ", error);
        return res.status(500).json({ 
            message: "Error al actualizar usuario", 
            error: error.message 
        });
    }
};




// CAMBIO DE CONTRASEÑA (SOLO PARA EL PROPIO USUARIO)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Buscar el usuario
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    await User.findByIdAndUpdate(id, { $set: { password: hashedPassword } });

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error("Error en changePassword:", error);
    return res.status(500).json({
      message: "Error al cambiar la contraseña",
      error: error.message
    });
  }
};



// DESHABILITAR USUARIO (cambiar status a false)
export const disableUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Verificar si el usuario existe
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Si el usuario tiene tarjeta, libera la tarjeta y elimina el campo cardId
        if (user.cardId) {
            // Libera la tarjeta en la colección de tarjetas
            const card = await Card.findOne({ uid: user.cardId }); // Ajusta el import si es necesario //CAMBIO WEB
            
            if (card) {
                card.assignedTo = undefined;
                await card.save();
            }
            // Elimina el campo cardId del usuario usando $unset
            await User.updateOne({ _id: id }, { $unset: { cardId: "" } });
        }

        // Cambiar el status a false
        const disabledUser = await User.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        ).select('-password');

        return res.status(200).json({ 
            message: "Usuario deshabilitado correctamente",
            user: disabledUser 
        });

    } catch (error) {
        console.error("Error en disableUser: ", error);
        return res.status(500).json({ 
            message: "Error al deshabilitar usuario", 
            error: error.message 
        });
    }
};



// HABILITAR USUARIO (cambiar status a true)
export const enableUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const enabledUser = await User.findByIdAndUpdate(
            id,
            { status: true },
            { new: true }
        ).select('-password');

        return res.status(200).json({ 
            message: "Usuario habilitado correctamente",
            user: enabledUser 
        });

    } catch (error) {
        console.error("Error en enableUser: ", error);
        return res.status(500).json({ 
            message: "Error al habilitar usuario", 
            error: error.message 
        });
    }
};



// ACTUALIZAR CARD ID DEL USUARIO
// Esta función actualiza el cardId de un usuario específico
export const updateUserCardId = async (req: Request, res: Response) => {
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

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { cardId }, // Actualizamos cardId con el UID string
      { new: true }
    ).select('-password');

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

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la tarjeta del usuario'
    });
  }
};

// 1. Solicitar recuperación (envía correo) -MOVIL UNICA
export const forgotPasswordMovil = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "El email no existe en el sistema, por favor intente con otro" });

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await user.save();

    // Frontend: usar /reset-password?token=xxx (no /reset-password/:token)
    const resetLink = `cinnamiapp://reset-password?token=${token}`;
    await sendResetEmail(user.email, resetLink);

    return res.json({ message: "Se envió un correo con el enlace para restablecer la contraseña." });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
};

// 2. Restablecer la contraseña
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    console.log("Token recibido:", token);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    console.log("Usuario encontrado:", user);

    if (!user) return res.status(400).json({ message: "Token inválido o expirado" });

    // Cambiar contraseña (hash)
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Contraseña restablecida exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ message: "Error al restablecer la contraseña." });
  }
};


//Móvil Traer usuario por ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar el usuario por ID
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ user });

  } catch (error) {
    console.error("Error en getUserById:", error);
    res.status(500).json({ message: "Error al obtener el usuario." });
  }
};

// Busca los eventos de acceso de ese usuario, ordenados por fecha descendente
export const getUserAccessLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar los eventos de acceso del usuario
    const accessLogs = await AccessEvent.find({ userId: new mongoose.Types.ObjectId(id) })
      .sort({ timestamp: -1 })
      .populate('doorId', 'name')
      .exec();

    return res.status(200).json({ accessLogs });

  } catch (error) {
    console.error("Error en getUserAccessLogs:", error);
    res.status(500).json({ message: "Error al obtener los eventos de acceso." });
  }
};