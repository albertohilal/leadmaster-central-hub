const express = require('express');
const router = express.Router();
const campaignsController = require('../controllers/campaignsController');

router.get('/', campaignsController.list);

module.exports = router;
