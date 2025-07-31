"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCardByUid = exports.releaseUserCard = exports.unassignCard = exports.assignCardMovil = exports.deleteCard = exports.enableCard = exports.disableCard = exports.updateCardUID = exports.getCardById = exports.getAvailableCards = exports.getAllCards = exports.createCard = void 0;
const Card_1 = require("../models/Card"); // Ajusta la ruta según tu estructura
const mongoose_1 = require("mongoose");
const User_1 = require("../models/User");
//Crear nueva tarjeta (solo UID)
const createCard = async (req, res) => {
    try {
        const { uid } = req.body;
        // Validar que se envió el UID
        if (!uid) {
            return res.status(400).json({
                message: 'El UID de la tarjeta es requerido'
            });
        }
        // Verificar que no exista una tarjeta con ese UID
        const existingCard = await Card_1.Card.findOne({ uid: uid.toUpperCase() });
        if (existingCard) {
            return res.status(409).json({
                message: 'Ya existe una tarjeta con ese UID'
            });
        }
        // Crear la nueva tarjeta
        const newCard = new Card_1.Card({
            uid: uid.toUpperCase(),
            state: true,
            issueDate: new Date(),
            disabledAt: undefined,
            assignedTo: undefined
        });
        const savedCard = await newCard.save();
        return res.status(201).json({
            message: 'Tarjeta creada exitosamente',
            card: savedCard
        });
    }
    catch (error) {
        console.error('Error ocurrido en createCard:', error);
        return res.status(500).json({
            message: 'Error al crear tarjeta',
            error
        });
    }
};
exports.createCard = createCard;
// Obtener todas las tarjetas
const getAllCards = async (req, res) => {
    try {
        const cards = await Card_1.Card.find()
            .populate('assignedTo', 'username email firstName lastName')
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Tarjetas obtenidas exitosamente',
            cards
        });
    }
    catch (error) {
        console.error('Error ocurrido en getAllCards:', error);
        res.status(500).json({ message: 'Error al obtener las tarjetas' });
    }
};
exports.getAllCards = getAllCards;
///api/cards/available - Obtener tarjetas disponibles para asignar
const getAvailableCards = async (req, res) => {
    try {
        const availableCards = await Card_1.Card.find({
            state: true,
            assignedTo: null
        }).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Tarjetas disponibles obtenidas exitosamente',
            cards: availableCards,
            total: availableCards.length
        });
    }
    catch (error) {
        console.error('Error ocurrido en getAvailableCards:', error);
        res.status(500).json({ message: 'Error al obtener tarjetas disponibles' });
    }
};
exports.getAvailableCards = getAvailableCards;
// GET /api/cards/:id - Obtener tarjeta específica - WEB
const getCardById = async (req, res) => {
    try {
        const { id } = req.params;
        // Validar ObjectId
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'ID de tarjeta inválido'
            });
        }
        const card = await Card_1.Card.findById(id)
            .populate('assignedTo', 'username email firstName lastName');
        if (!card) {
            return res.status(404).json({
                message: 'Tarjeta no encontrada'
            });
        }
        res.status(200).json({
            message: 'Tarjeta obtenida exitosamente',
            card
        });
    }
    catch (error) {
        console.error('Error ocurrido en getCardById:', error);
        res.status(500).json({ message: 'Error al obtener la tarjeta' });
    }
};
exports.getCardById = getCardById;
// PUT /api/cards/:id - Editar UID de tarjeta -WEB
const updateCardUID = async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.body;
        // Validar ObjectId
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'ID de tarjeta inválido'
            });
        }
        // Validar que se envió el nuevo UID
        if (!uid) {
            return res.status(400).json({
                message: 'El nuevo UID es requerido'
            });
        }
        // Verificar que no exista otra tarjeta con ese UID
        const existingCard = await Card_1.Card.findOne({
            uid: uid.toUpperCase(),
            _id: { $ne: id }
        });
        if (existingCard) {
            return res.status(409).json({
                message: 'Ya existe otra tarjeta con ese UID'
            });
        }
        // Actualizar la tarjeta
        const updatedCard = await Card_1.Card.findByIdAndUpdate(id, { uid: uid.toUpperCase() }, { new: true, runValidators: true }).populate('assignedTo', 'username email firstName lastName');
        if (!updatedCard) {
            return res.status(404).json({
                message: 'Tarjeta no encontrada'
            });
        }
        res.status(200).json({
            message: 'UID de tarjeta actualizado exitosamente',
            card: updatedCard
        });
    }
    catch (error) {
        console.error('Error ocurrido en updateCardUID:', error);
        res.status(500).json({ message: 'Error al actualizar UID de tarjeta', error });
    }
};
exports.updateCardUID = updateCardUID;
//Deshabilitar tarjeta
const disableCard = async (req, res) => {
    try {
        const { id } = req.params;
        // Validar ObjectId
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'ID de tarjeta inválido'
            });
        }
        const card = await Card_1.Card.findById(id);
        if (!card) {
            return res.status(404).json({
                message: 'Tarjeta no encontrada'
            });
        }
        // Cambiar el estado directamente
        card.state = false;
        card.disabledAt = new Date();
        const updatedCard = await card.save();
        res.status(200).json({
            message: 'Tarjeta deshabilitada exitosamente',
            card: updatedCard
        });
    }
    catch (error) {
        console.error('Error ocurrido en disableCard:', error);
        res.status(500).json({ message: 'Error al deshabilitar tarjeta', error });
    }
};
exports.disableCard = disableCard;
// Rehabilitar tarjeta
const enableCard = async (req, res) => {
    try {
        const { id } = req.params;
        // Validar ObjectId
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'ID de tarjeta inválido'
            });
        }
        const card = await Card_1.Card.findById(id);
        if (!card) {
            return res.status(404).json({
                message: 'Tarjeta no encontrada'
            });
        }
        // Rehabilitar tarjeta
        card.state = true;
        card.disabledAt = undefined;
        const updatedCard = await card.save();
        res.status(200).json({
            message: 'Tarjeta rehabilitada exitosamente',
            card: updatedCard
        });
    }
    catch (error) {
        console.error('Error ocurrido en enableCard:', error);
        res.status(500).json({ message: 'Error al rehabilitar tarjeta', error });
    }
};
exports.enableCard = enableCard;
//ELIMINA TARJETAS
const deleteCard = async (req, resp) => {
    try {
        const { id } = req.params;
        // Validar ObjectId
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({
                message: 'ID de tarjeta inválido'
            });
        }
        const card = await Card_1.Card.findByIdAndDelete(id);
        if (!card) {
            return resp.status(404).json({
                message: 'Tarjeta no encontrada'
            });
        }
        resp.status(200).json({
            message: 'Tarjeta eliminada exitosamente',
            card
        });
    }
    catch (error) {
        console.error('Error ocurrido en deleteCard:', error);
        resp.status(500).json({ message: 'Error al eliminar tarjeta', error });
    }
};
exports.deleteCard = deleteCard;
// Asignar tarjeta a usuario MOVIL
const assignCardMovil = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        // Validar ObjectIds
        if (!mongoose_1.Types.ObjectId.isValid(id) || !mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'ID de tarjeta o usuario inválido'
            });
        }
        const card = await Card_1.Card.findById(id);
        if (!card) {
            return res.status(404).json({
                message: 'Tarjeta no encontrada'
            });
        }
        // Verificar que la tarjeta esté disponible
        if (!(card.state === true && card.assignedTo == null)) {
            return res.status(400).json({
                message: 'La tarjeta no está disponible para asignación'
            });
        }
        // Asignar tarjeta
        card.assignedTo = new mongoose_1.Types.ObjectId(userId);
        const updatedCard = await card.save();
        res.status(200).json({
            message: 'Tarjeta asignada exitosamente',
            card: updatedCard
        });
    }
    catch (error) {
        console.error('Error ocurrido en assignCard:', error);
        res.status(500).json({ message: 'Error al asignar tarjeta', error });
    }
};
exports.assignCardMovil = assignCardMovil;
// Asignar tarjeta a usuario WEB
//Desasignar tarjeta
const unassignCard = async (req, res) => {
    try {
        const { id } = req.params;
        // Validar ObjectId
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'ID de tarjeta inválido'
            });
        }
        const card = await Card_1.Card.findById(id);
        if (!card) {
            return res.status(404).json({
                message: 'Tarjeta no encontrada'
            });
        }
        // Desasignar tarjeta
        card.assignedTo = null; // <-- Mejor usar null
        const updatedCard = await card.save();
        res.status(200).json({
            message: 'Tarjeta desasignada exitosamente',
            card: updatedCard
        });
    }
    catch (error) {
        console.error('Error ocurrido en unassignCard:', error);
        res.status(500).json({ message: 'Error al desasignar tarjeta', error });
    }
};
exports.unassignCard = unassignCard;
// Desasignar tarjeta desde el usuario
const releaseUserCard = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'Usuario no encontrado' });
        if (user.cardId) {
            // Libera la tarjeta en la colección de tarjetas
            const card = await Card_1.Card.findOne({ uid: user.cardId });
            if (card) {
                card.assignedTo = null;
                await card.save();
            }
            // Libera la tarjeta en el usuario (sin validación de Mongoose)
            await User_1.User.updateOne({ _id: userId }, { $set: { cardId: null } });
        }
        res.status(200).json({ message: 'Tarjeta liberada correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al liberar tarjeta', error });
    }
};
exports.releaseUserCard = releaseUserCard;
// Obtener tarjeta por UID - MÓVIL ÚNICA
const getCardByUid = async (req, res) => {
    try {
        const { uid } = req.params;
        const card = await Card_1.Card.findOne({ uid }).populate('assignedTo', 'username');
        if (!card) {
            return res.status(404).json({
                message: 'Tarjeta no encontrada'
            });
        }
        res.status(200).json({
            message: 'Tarjeta encontrada',
            card: card
        });
    }
    catch (error) {
        console.error('Error al obtener tarjeta por UID:', error);
        res.status(500).json({ message: 'Error al obtener tarjeta', error });
    }
};
exports.getCardByUid = getCardByUid;
