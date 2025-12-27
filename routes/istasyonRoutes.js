const express = require('express');
const router = express.Router();
const istasyonController = require('../controllers/istasyonController');

router.get('/iller', istasyonController.getIller);
router.get('/yillik-mudahale', istasyonController.getYillikMudahale);
router.get('/ortalama-alan-kaybi', istasyonController.getOrtalamaAlanKaybi);
router.get('/mudahale-tipi-dagilim', istasyonController.getMudahaleTipiDagilim);
router.get('/iller', istasyonController.getIller);
module.exports = router;