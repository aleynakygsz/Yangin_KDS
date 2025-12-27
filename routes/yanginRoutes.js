const express = require('express');
const router = express.Router();
const yanginController = require('../controllers/yanginController');

console.log("✅ YANGIN ROUTES DOSYASI OKUNDU (iller rotası dahil)");

// Mevcut Rotalar
router.get('/yillik-ozet', yanginController.getYillikOzet);
router.get('/yillik-trend', yanginController.getYillikTrend);
router.get('/neden-dagilimi', yanginController.getYanginNedenleri);
router.get('/en-cok-yanan-iller', yanginController.getEnCokYananIller);
router.get('/alan-trendi', yanginController.getAlanTrendi);
router.get('/harita-risk', yanginController.getIlRiskHarita);

module.exports = router;