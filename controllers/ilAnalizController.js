const db = require('../db/db');

// İlleri getir
exports.getIller = async (req, res) => {
  try {
    console.log('📍 İller endpoint çağrıldı');
    const [rows] = await db.query('SELECT il_id, il_ad FROM iller ORDER BY il_ad');
    console.log(`✅ ${rows.length} il bulundu`);
    res.json(rows);
  } catch (error) {
    console.error('❌ İller getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

// Yıllara göre yangın sayısı (Karşılaştırmalı Line)
exports.getYillaraGoreYangin = async (req, res) => {
  try {
    const { il_id_1, il_id_2 } = req.query;
    console.log('📍 Yıllara göre yangın çağrıldı:', { il_id_1, il_id_2 });
    
    if (!il_id_1) {
      return res.status(400).json({ error: 'il_id_1 parametresi gerekli' });
    }
    
    // İl 1
    const [il1Data] = await db.query(
      `SELECT YEAR(baslangic_tarihi) as yil, COUNT(*) as yangin_sayisi
       FROM yanginlar
       WHERE yangin_il_id = ?
       GROUP BY YEAR(baslangic_tarihi)
       ORDER BY yil`,
      [il_id_1]
    );
    
    let result = { il_1: il1Data };
    
    // İl 2
    if (il_id_2 && il_id_2 !== 'none') {
      const [il2Data] = await db.query(
        `SELECT YEAR(baslangic_tarihi) as yil, COUNT(*) as yangin_sayisi
         FROM yanginlar
         WHERE yangin_il_id = ?
         GROUP BY YEAR(baslangic_tarihi)
         ORDER BY yil`,
        [il_id_2]
      );
      result.il_2 = il2Data;
    }
    
    console.log('✅ Yıllara göre yangın döndürüldü');
    res.json(result);
  } catch (error) {
    console.error('❌ Yıllara göre yangın hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

// Yıllara göre kaybedilen alan (Karşılaştırmalı Line)
exports.getYillaraGoreAlan = async (req, res) => {
  try {
    const { il_id_1, il_id_2 } = req.query;
    console.log('📍 Yıllara göre alan çağrıldı:', { il_id_1, il_id_2 });
    
    if (!il_id_1) {
      return res.status(400).json({ error: 'il_id_1 parametresi gerekli' });
    }
    
    // İl 1
    const [il1Data] = await db.query(
      `SELECT YEAR(baslangic_tarihi) as yil, SUM(kaybedilen_alan) as kaybedilen_alan
       FROM yanginlar
       WHERE yangin_il_id = ?
       GROUP BY YEAR(baslangic_tarihi)
       ORDER BY yil`,
      [il_id_1]
    );
    
    let result = { il_1: il1Data };
    
    // İl 2
    if (il_id_2 && il_id_2 !== 'none') {
      const [il2Data] = await db.query(
        `SELECT YEAR(baslangic_tarihi) as yil, SUM(kaybedilen_alan) as kaybedilen_alan
         FROM yanginlar
         WHERE yangin_il_id = ?
         GROUP BY YEAR(baslangic_tarihi)
         ORDER BY yil`,
        [il_id_2]
      );
      result.il_2 = il2Data;
    }
    
    console.log('✅ Yıllara göre alan döndürüldü');
    res.json(result);
  } catch (error) {
    console.error('❌ Yıllara göre alan hatası:', error);
    res.status(500).json({ error: error.message });
  }
};
