const express = require('express');
const router = express.Router();
const enviosController = require('../controllers/enviosController');

router.get('/status', enviosController.status);
// Aquí se agregarán las rutas reales de envíos

module.exports = router;
