const express = require('express');
const router = express.Router();
const ilAnalizController = require('../controllers/ilAnalizController');

router.get('/iller', ilAnalizController.getIller);
router.get('/yillara-gore-yangin', ilAnalizController.getYillaraGoreYangin);
router.get('/yillara-gore-alan', ilAnalizController.getYillaraGoreAlan);

module.exports = router;