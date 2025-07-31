"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middlewares/auth"); // Nuevo middleware
const user_controller_1 = require("../controllers/user.controller");
const tarjet_controller_1 = require("../controllers/tarjet.controller");
const door_controller_1 = require("../controllers/door.controller");
const router = (0, express_1.Router)();
// rutas públicas
router.post('/login', auth_controller_1.login);
router.post('/refresh-token', auth_controller_1.refreshToken);
router.post('/users', user_controller_1.createUser); // registro de nuevos usuarios
// rutas protegidas (requieren token válido)
router.post('/logout', auth_1.verifyToken, auth_controller_1.logout); // cerrar sesión
router.get('/all-users', auth_1.verifyToken, user_controller_1.getAllUsers);
router.get('/users/:id', user_controller_1.getUserById); // MOVIL
router.get('/access-events/user/:id', user_controller_1.getUserAccessLogs); // MOVIL
//usuarios
router.put('/:id/update', user_controller_1.updateUser); // Editar usuario (sin contraseña)
router.patch('/:id/disable', user_controller_1.disableUser); // Deshabilitar usuario
router.patch('/:id/enable', auth_1.isAdmin, user_controller_1.enableUser); // Habilitar usuario (opcional)
router.put('/:id/change-password', user_controller_1.changePassword); // Cambio de contraseña
router.post('/forgot-password', user_controller_1.forgotPasswordMovil); //MOVIL
router.post('/reset-password', user_controller_1.resetPassword); // Actualizar cardId del usuario 
//tarjetas 
router.post('/addCard', tarjet_controller_1.createCard); //crear tarjeta
router.get('/cards', auth_1.verifyToken, tarjet_controller_1.getAllCards); // Obtener todas las tarjetas
router.put('/cards/:id/disable', tarjet_controller_1.disableCard); // Deshabilitar tarjeta
router.put('/cards/:id/enable', tarjet_controller_1.enableCard); // Habilitar tarjeta
router.delete('/cards/:id/delete', tarjet_controller_1.deleteCard); // Eliminar tarjeta
router.get('/cards/available', tarjet_controller_1.getAvailableCards); // Obtener tarjetas disponibles para asignar
router.put('/cards/:id/assign', tarjet_controller_1.assignCardMovil); // Asignar tarjeta a un usuario //MOVIL
router.patch('/users/:id/card', user_controller_1.updateUserCardId); // Actualizar cardId del usuario
router.put('/cards/:id/unassign', tarjet_controller_1.unassignCard); // Desasignar tarjeta de un usuario
router.patch('/users/:id/release-card', tarjet_controller_1.releaseUserCard); // Liberar tarjeta de un usuario
// Obtener tarjeta por UID - MOVIL
router.get('/cards/by-uid/:uid', tarjet_controller_1.getCardByUid); // Obtener tarjeta por UID //MOVIL
// conteo de personas -MOVIL
router.get('/personCount/latest', door_controller_1.getLatestPersonCount); //MOVIL
router.get('/door/latest', door_controller_1.getLatestDoorState); // Obtener estado más reciente de la puerta //MOVIL
router.get('/access-events/recent', door_controller_1.getRecentAccessEvents); // Obtener últimos 10 accesos recientes //MOVIL
//puertas
router.get('/doors', door_controller_1.getAllDoors); //MOVIL
router.put('/doors/:id', door_controller_1.updateDoors); //MOVIL
exports.default = router;
