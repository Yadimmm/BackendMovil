import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include userId and user
declare global {
    namespace Express {
        interface User {
            _id: string;
            role: string;
            [key: string]: any;
        }
        interface Request {
            userId?: string;
            user?: User;
        }
    }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Acceso no autorizado' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: string };
        req.userId = decoded.userId; // Añade el ID al request
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token inválido o expirado, Se le recomienda volver a iniciar sesión' });
    }
};


export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acceso no autorizado" });
    }
    next();
};

export const isSelfOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (req.user._id.toString() !== req.params.id && req.user.role !== 'admin')) {
        return res.status(403).json({ message: "Acceso no autorizado" });
    }
    next();
};