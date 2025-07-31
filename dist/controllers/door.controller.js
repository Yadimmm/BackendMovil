"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDoors = exports.getAllDoors = exports.getRecentAccessEvents = exports.getLatestDoorState = exports.getLatestPersonCount2 = exports.getLatestPersonCount = void 0;
const PersonCount_1 = require("../models/PersonCount");
const Door_1 = require("../models/Door");
const AccessEvent_1 = require("../models/AccessEvent");
const getLatestPersonCount = async (req, res) => {
    try {
        // 1. Obtener los últimos registros de ENTRADAS y SALIDAS
        const [latestEntry, latestExit] = await Promise.all([
            PersonCount_1.PersonCount.findOne({ direction: "entry" }).sort({ timestamp: -1 }),
            PersonCount_1.PersonCount.findOne({ direction: "exit" }).sort({ timestamp: -1 })
        ]);
        // 2. Aplicar la lógica específica que me indicas
        const totalEntries = latestEntry?.counterValue || 0; // Último valor de "entry"
        const currentInside = latestExit?.counterValue || 0; // Último valor de "exit" = personas dentro
        const totalExits = totalEntries - currentInside; // Salidas totales calculadas
        // 3. Conteo de eventos hoy (opcional, para estadísticas diarias)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todaysEvents = await PersonCount_1.PersonCount.aggregate([
            {
                $match: {
                    timestamp: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: "$direction",
                    count: { $sum: 1 } // Cuenta eventos, no valores
                }
            }
        ]);
        // Procesar eventos diarios
        let entriesToday = 0;
        let exitsToday = 0;
        todaysEvents.forEach(stat => {
            if (stat._id === "entry")
                entriesToday = stat.count;
            if (stat._id === "exit")
                exitsToday = stat.count;
        });
        // 4. Respuesta final
        res.json({
            success: true,
            data: {
                totalEntries, // Ejemplo: 3 (último "entry")
                currentInside, // Ejemplo: 2 (último "exit")
                totalExits, // Ejemplo: 1 (3-2)
                dailyStats: {
                    entriesToday, // Conteo de eventos "entry" hoy
                    exitsToday // Conteo de eventos "exit" hoy
                },
                lastUpdate: {
                    entries: latestEntry?.timestamp,
                    exits: latestExit?.timestamp
                }
            },
            message: 'Datos calculados correctamente'
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar los contadores'
        });
    }
};
exports.getLatestPersonCount = getLatestPersonCount;
// Obtener el último conteo de personas ingresadas
const getLatestPersonCount2 = async (req, res) => {
    try {
        const doc = await PersonCount_1.PersonCount.findOne().sort({ timestamp: -1 });
        res.json({ count: doc ? doc.counterValue : 0 });
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener el conteo", error });
    }
};
exports.getLatestPersonCount2 = getLatestPersonCount2;
// Obtener el estado más reciente de la puerta
const getLatestDoorState = async (req, res) => {
    try {
        // Solo usamos una puerta, por eso el último registro por timestamp
        const latest = await Door_1.Door.findOne().sort({ timestamp: -1 });
        res.json({
            state: latest?.state ?? "desconocido",
            name: latest?.name ?? latest?.nombre ?? "Sin puerta"
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener el estado de la puerta", error });
    }
};
exports.getLatestDoorState = getLatestDoorState;
// Devuelve los últimos 10 accesos recientes
const getRecentAccessEvents = async (req, res) => {
    try {
        // Trae los últimos 10 registros, ordenados del más nuevo al más antiguo
        const events = await AccessEvent_1.AccessEvent.find().sort({ timestamp: -1 }).limit(10);
        res.json({ events });
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener accesos recientes", error });
    }
};
exports.getRecentAccessEvents = getRecentAccessEvents;
// Obtener todas las puertas
const getAllDoors = async (req, res) => {
    try {
        let doors;
        // Si se pasa ?recent=true, filtrar por los últimos 2 días
        if (req.query.recent === 'true') {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            doors = await Door_1.Door.find({ updatedAt: { $gte: twoDaysAgo } });
        }
        else {
            doors = await Door_1.Door.find();
        }
        res.json({ doors });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener las puertas', error });
    }
};
exports.getAllDoors = getAllDoors;
const updateDoors = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        // Validaciones
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la puerta es requerido'
            });
        }
        if (name.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la puerta no puede exceder los 50 caracteres'
            });
        }
        // Buscar y actualizar la puerta
        const updatedDoor = await Door_1.Door.findByIdAndUpdate(id, {
            name: name.trim(),
            timestamp: new Date() // Actualizar timestamp
        }, {
            new: true, // Devolver el documento actualizado
            runValidators: true // Ejecutar validaciones del esquema
        });
        if (!updatedDoor) {
            return res.status(404).json({
                success: false,
                message: 'Puerta no encontrada'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Nombre de puerta actualizado correctamente',
            door: {
                _id: updatedDoor._id,
                doorId: updatedDoor.doorId,
                name: updatedDoor.name,
                state: updatedDoor.state,
                timestamp: updatedDoor.timestamp
            }
        });
    }
    catch (error) {
        console.error('Error updating door name:', error);
        // Manejar errores de validación de MongoDB
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        // Manejar errores de ObjectId inválido
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'ID de puerta inválido'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
exports.updateDoors = updateDoors;
