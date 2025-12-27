const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/giris', authController.girisYap);
router.post('/cikis', authController.cikisYap);

module.exports = router;