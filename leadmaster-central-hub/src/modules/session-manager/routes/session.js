const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');


router.get('/status', sessionController.status);
router.post('/login', sessionController.login);
router.post('/logout', sessionController.logout);
router.get('/state', sessionController.state);
router.get('/qr', sessionController.qr);

module.exports = router;
