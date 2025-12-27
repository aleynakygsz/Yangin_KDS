const db = require('../db/db');

// İlleri getir
exports.getIller = async (req, res) => {
  try {
    console.log('📍 İller endpoint çağrıldı (İstasyon)');
    const [rows] = await db.query('SELECT il_id, il_ad FROM iller ORDER BY il_ad');
    console.log(`✅ ${rows.length} il bulundu`);
    res.json(rows);
  } catch (error) {
    console.error('❌ İller getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

// 1. İstasyona Göre Yıllık Müdahale Sayısı (Grouped Bar)
exports.getYillikMudahale = async (req, res) => {
  try {
    const { il_id } = req.query;
    console.log('📍 Yıllık müdahale çağrıldı:', { il_id });
    
    if (!il_id) {
      return res.status(400).json({ error: 'il_id parametresi gerekli' });
    }
    
    const [rows] = await db.query(
      `SELECT 
        ie.istasyon_adi,
        YEAR(y.baslangic_tarihi) as yil,
        COUNT(DISTINCT yi.yangin_id) as mudahale_sayisi
       FROM istasyon_envanter ie
       LEFT JOIN yangin_istasyon yi ON ie.istasyon_id = yi.istasyon_id
       LEFT JOIN yanginlar y ON yi.yangin_id = y.yangin_id
       WHERE ie.il_id = ?
       GROUP BY ie.istasyon_id, ie.istasyon_adi, YEAR(y.baslangic_tarihi)
       ORDER BY ie.istasyon_adi, yil`,
      [il_id]
    );
    
    console.log(`✅ ${rows.length} kayıt döndürüldü`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Yıllık müdahale hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

// 2. İstasyon Başına Ortalama Alan Kaybı (Bar Chart)
exports.getOrtalamaAlanKaybi = async (req, res) => {
  try {
    const { il_id } = req.query;
    console.log('📍 Ortalama alan kaybı çağrıldı:', { il_id });
    
    if (!il_id) {
      return res.status(400).json({ error: 'il_id parametresi gerekli' });
    }
    
    const [rows] = await db.query(
      `SELECT 
        ie.istasyon_adi,
        COUNT(DISTINCT yi.yangin_id) as mudahale_sayisi,
        SUM(y.kaybedilen_alan) as toplam_alan,
        CASE 
          WHEN COUNT(DISTINCT yi.yangin_id) > 0 
          THEN ROUND(SUM(y.kaybedilen_alan) / COUNT(DISTINCT yi.yangin_id), 2)
          ELSE 0 
        END as ortalama_alan_kaybi
       FROM istasyon_envanter ie
       LEFT JOIN yangin_istasyon yi ON ie.istasyon_id = yi.istasyon_id
       LEFT JOIN yanginlar y ON yi.yangin_id = y.yangin_id
       WHERE ie.il_id = ?
       GROUP BY ie.istasyon_id, ie.istasyon_adi
       HAVING mudahale_sayisi > 0
       ORDER BY ortalama_alan_kaybi DESC`,
      [il_id]
    );
    
    console.log(`✅ ${rows.length} istasyon döndürüldü`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Ortalama alan kaybı hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Müdahale Tipine Göre Dağılım (Stacked Bar)
exports.getMudahaleTipiDagilim = async (req, res) => {
  try {
    const { il_id } = req.query;
    console.log('📍 Müdahale tipi dağılımı çağrıldı:', { il_id });
    
    if (!il_id) {
      return res.status(400).json({ error: 'il_id parametresi gerekli' });
    }
    
    const [rows] = await db.query(
      `SELECT 
        ie.istasyon_adi,
        SUM(CASE 
          WHEN yi.gorev_tipi IN ('İlk Müdahale', 'Su İkmal', 'Arazöz') 
          THEN 1 ELSE 0 
        END) as asil_mudahale,
        SUM(CASE 
          WHEN yi.gorev_tipi IN ('Hava Destek', 'Arazöz Destek') 
          THEN 1 ELSE 0 
        END) as destek_mudahale
       FROM istasyon_envanter ie
       LEFT JOIN yangin_istasyon yi ON ie.istasyon_id = yi.istasyon_id
       WHERE ie.il_id = ?
       GROUP BY ie.istasyon_id, ie.istasyon_adi
       HAVING (asil_mudahale + destek_mudahale) > 0
       ORDER BY (asil_mudahale + destek_mudahale) DESC`,
      [il_id]
    );
    
    console.log(`✅ ${rows.length} istasyon döndürüldü`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Müdahale tipi dağılımı hatası:', error);
    res.status(500).json({ error: error.message });
  }
};