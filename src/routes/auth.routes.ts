import { Router } from "express";
import { 
  login, 
  refreshToken, 
  logout,
    
} from "../controllers/auth.controller";
import { verifyToken, isAdmin, isSelfOrAdmin } from "../middlewares/auth"; // Nuevo middleware

import { updateUser, disableUser, enableUser, changePassword, updateUserCardId, forgotPasswordMovil, resetPassword,  createUser, getAllUsers, getUserById, getUserAccessLogs } from "../controllers/user.controller";
import { assignCard, createCard, deleteCard, disableCard, enableCard, getAllCards, getAvailableCards, unassignCard, releaseUserCard, getCardByUid, assignCardMovil } from "../controllers/tarjet.controller";
import { getLatestPersonCount, persons, getLatestDoorState, getRecentAccessEvents, getAllDoors, updateDoors } from "../controllers/door.controller";

const router = Router();

// rutas públicas
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/users', createUser); // registro de nuevos usuarios

// rutas protegidas (requieren token válido)
router.post('/logout', verifyToken, logout); // cerrar sesión
router.get('/all-users', verifyToken, getAllUsers);
router.get('/users/:id', getUserById); // MOVIL
router.get('/access-events/user/:id', getUserAccessLogs); // MOVIL

//usuarios

router.put('/:id/update', updateUser); // Editar usuario (sin contraseña)
router.patch('/:id/disable', disableUser); // Deshabilitar usuario
router.patch('/:id/enable', isAdmin, enableUser);  // Habilitar usuario (opcional)
router.put('/:id/change-password', changePassword);   // Cambio de contraseña
router.post('/forgot-password', forgotPasswordMovil);  //MOVIL
router.post('/reset-password', resetPassword); // Actualizar cardId del usuario 

//tarjetas 

router.post('/addCard', createCard); //crear tarjeta
router.get('/cards', verifyToken, getAllCards); // Obtener todas las tarjetas
router.put('/cards/:id/disable', disableCard); // Deshabilitar tarjeta
router.put('/cards/:id/enable', enableCard); // Habilitar tarjeta
router.delete('/cards/:id/delete', deleteCard); // Eliminar tarjeta
router.get('/cards/available', getAvailableCards); // Obtener tarjetas disponibles para asignar
router.put('/cards/:id/assign', assignCardMovil); // Asignar tarjeta a un usuario //MOVIL
router.patch('/users/:id/card', updateUserCardId); // Actualizar cardId del usuario
router.put('/cards/:id/unassign', unassignCard); // Desasignar tarjeta de un usuario
router.patch('/users/:id/release-card', releaseUserCard); // Liberar tarjeta de un usuario


// Obtener tarjeta por UID - MOVIL
router.get('/cards/by-uid/:uid', getCardByUid); // Obtener tarjeta por UID //MOVIL

// conteo de personas -MOVIL

router.get('/personCount/latest', getLatestPersonCount); //MOVIL
router.get('/door/latest', getLatestDoorState); // Obtener estado más reciente de la puerta //MOVIL
router.get('/access-events/recent', getRecentAccessEvents); // Obtener últimos 10 accesos recientes //MOVIL

//puertas
router.get('/doors', getAllDoors); //MOVIL
router.put('/doors/:id', updateDoors); //MOVIL


export default router;