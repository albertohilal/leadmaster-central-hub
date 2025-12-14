const express = require('express');
const router = express.Router();
const listenerController = require('../controllers/listenerController');
const { authenticate } = require('../../auth/middleware/authMiddleware');

// Todas las rutas de listener requieren autenticación
router.use(authenticate);

// Endpoint de prueba para mensajes entrantes reales
router.post('/test-message', listenerController.testMessage);

// Habilitar/deshabilitar IA para un lead
router.post('/ia/enable', listenerController.enableIA);
router.post('/ia/disable', listenerController.disableIA);

// Rutas para el listener
router.get('/status', listenerController.getStatus);
router.post('/mode', listenerController.setMode);
router.get('/logs', listenerController.getLogs);

module.exports = router;
