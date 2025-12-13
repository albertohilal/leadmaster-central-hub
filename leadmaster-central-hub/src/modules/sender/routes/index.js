// Rutas principales migradas desde whatsapp-massive-sender-V2
const express = require('express');
const router = express.Router();

// Ejemplo de importación de controlador
// const campaniasController = require('../controllers/campaniasController');
// router.get('/campanias', campaniasController.listarCampanias);

// TODO: Migrar e importar todas las rutas y controladores reales

router.get('/status', (req, res) => {
  res.json({ status: 'sender module ok' });
});

// Nueva ruta modular para campañas
router.use('/campaigns', require('./campaigns'));

// Rutas legacy
router.use('/auth', require('./auth'));
router.use('/campanias', require('./campanias'));
router.use('/envios', require('./envios'));
router.use('/usuarios', require('./usuarios'));
router.use('/sesiones', require('./sesiones'));
router.use('/lugares', require('./lugares'));
router.use('/rubros', require('./rubros'));

module.exports = router;
