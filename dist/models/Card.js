"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const mongoose_1 = require("mongoose");
const CardSchema = new mongoose_1.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true // Para consistencia en el formato
    },
    state: {
        type: Boolean,
        default: true, // Por defecto activa
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    disabledAt: {
        type: Date,
        default: undefined // Solo se llena cuando se desactiva
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User', // Referencia al modelo User
        default: undefined // null = tarjeta disponible para asignar
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    collection: 'cards', // Nombre específico de la colección
    toJSON: {
        transform: function (doc, ret) {
            if (ret.disabledAt === undefined)
                ret.disabledAt = null;
            if (ret.assignedTo === undefined)
                ret.assignedTo = null;
            return ret;
        }
    }
});
// Índices para optimizar consultas
CardSchema.index({ assignedTo: 1 });
CardSchema.index({ state: 1 });
// Método virtual para verificar si está disponible
CardSchema.virtual('isAvailable').get(function () {
    return this.state === true && this.assignedTo === null;
});
// Método para asignar tarjeta a usuario
CardSchema.methods.assignToUser = function (userId) {
    this.assignedTo = userId;
    return this.save();
};
// Método para desasignar tarjeta
CardSchema.methods.unassign = function () {
    this.assignedTo = null;
    return this.save();
};
// Método para desactivar tarjeta
CardSchema.methods.disable = function () {
    this.state = false;
    this.disabledAt = new Date();
    return this.save();
};
exports.Card = (0, mongoose_1.model)('Card', CardSchema);
