const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/giris', authController.girisYap);
router.post('/cikis', authController.cikisYap);
router.post('/ekle', authController.kullaniciEkle);
router.delete('/sil/:id', authController.kullaniciSil);


module.exports = router;