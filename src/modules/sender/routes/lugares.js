const express = require('express');
const router = express.Router();
const lugaresController = require('../controllers/lugaresController');

router.get('/status', lugaresController.status);
// Aquí se agregarán las rutas reales de lugares

module.exports = router;
