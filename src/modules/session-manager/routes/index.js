const express = require('express');
const router = express.Router();

// Montar subrutas del session-manager
router.use('/', require('./session'));

module.exports = router;
