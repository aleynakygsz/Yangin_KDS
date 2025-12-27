const db = require('../db/db');

// 1. KPI Kartları İçin Yıllık Özet
exports.getYillikOzet = async (req, res) => {
  try {
    const { yil } = req.query;
    
    // Toplam Yangın
    const [toplamYangin] = await db.query(
      'SELECT COUNT(*) as toplam FROM yanginlar WHERE YEAR(baslangic_tarihi) = ?',
      [yil]
    );

    // Kaybedilen Alan
    const [kaybedilenAlan] = await db.query(
      'SELECT SUM(kaybedilen_alan) as toplam FROM yanginlar WHERE YEAR(baslangic_tarihi) = ?',
      [yil]
    );

    // En Riskli İl (O yıl en çok yangın çıkan il)
    const [enRiskliIl] = await db.query(
      `SELECT i.il_ad 
       FROM yanginlar y
       JOIN iller i ON y.yangin_il_id = i.il_id
       WHERE YEAR(y.baslangic_tarihi) = ?
       GROUP BY i.il_ad
       ORDER BY COUNT(*) DESC
       LIMIT 1`,
      [yil]
    );

    res.json({
        toplam_yangin: toplamYangin[0]?.toplam || 0,
        kaybedilen_alan: kaybedilenAlan[0]?.toplam || 0,
        en_riskli_il: enRiskliIl.length > 0 ? enRiskliIl[0].il_ad : '-'
    });

  } catch (error) {
    console.error("Yıllık Özet Hatası:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Yıllara Göre Yangın Eğilimi (Çizgi Grafik - Sol Üst)
exports.getYillikTrend = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT YEAR(baslangic_tarihi) as yil, COUNT(*) as yangin_sayisi
       FROM yanginlar
       WHERE baslangic_tarihi IS NOT NULL
       GROUP BY YEAR(baslangic_tarihi)
       ORDER BY yil ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Yıllık Trend Hatası:", error);
    res.status(500).json({ error: error.message });
  }
};

// 3. Yangın Neden Dağılımı (Pasta Grafik)
exports.getYanginNedenleri = async (req, res) => {
  try {
    const { yil } = req.query;

    const [rows] = await db.query(
      `SELECT 
        yn.neden_tipi AS neden,
        COUNT(y.yangin_id) AS sayi
       FROM yanginlar y
       JOIN yangin_nedenleri yn ON y.neden_id = yn.neden_id
       WHERE YEAR(y.baslangic_tarihi) = ?
       GROUP BY yn.neden_tipi`,
      [yil]
    );

    res.json(rows);
  } catch (error) {
    console.error("Yangın Nedenleri Hatası:", error);
    res.status(500).json({ error: error.message });
  }
};

// 4. En Çok Yangın Çıkan 4 İl (Bar Grafik - Sol Alt)
exports.getEnCokYananIller = async (req, res) => {
  try {
    const { yil } = req.query;
    const [rows] = await db.query(
      `SELECT i.il_ad, COUNT(*) as yangin_sayisi
       FROM yanginlar y
       JOIN iller i ON y.yangin_il_id = i.il_id
       WHERE YEAR(y.baslangic_tarihi) = ?
       GROUP BY i.il_ad
       ORDER BY yangin_sayisi DESC
       LIMIT 4`,
      [yil]
    );
    res.json(rows);
  } catch (error) {
    console.error("En Çok Yanan İller Hatası:", error);
    res.status(500).json({ error: error.message });
  }
};

// 5. Yıllara Göre Kaybedilen Alan (Çizgi Grafik - Sağ Alt)
exports.getAlanTrendi = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT YEAR(baslangic_tarihi) as yil, SUM(kaybedilen_alan) as alan
       FROM yanginlar
       WHERE baslangic_tarihi IS NOT NULL
       GROUP BY YEAR(baslangic_tarihi)
       ORDER BY yil ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Alan Trendi Hatası:", error);
    res.status(500).json({ error: error.message });
  }
};

// 6. Harita – İl bazlı orman & risk
exports.getIlRiskHarita = async (req, res) => {
  try {
    const { yil } = req.query;
    console.log('📍 Harita endpoint çağrıldı, yıl:', yil);

    if (yil === '2024') {
      const [rows] = await db.query(`
        SELECT 
          i.il_id,
          i.il_ad,
          i.orman_varligi,
          MAX(ra.risk_puani) AS max_risk_puani,
          (SELECT DATE(tarih) 
           FROM risk_analizleri 
           WHERE il_id = i.il_id AND risk_puani = MAX(ra.risk_puani) 
           LIMIT 1) as risk_tarihi,
          (SELECT COUNT(*) 
           FROM yanginlar y 
           WHERE y.yangin_il_id = i.il_id 
             AND DATE(y.baslangic_tarihi) = (
               SELECT DATE(tarih) 
               FROM risk_analizleri 
               WHERE il_id = i.il_id AND risk_puani = MAX(ra.risk_puani) 
               LIMIT 1
             )
          ) > 0 AS yangin_var
        FROM iller i
        LEFT JOIN risk_analizleri ra ON i.il_id = ra.il_id AND YEAR(ra.tarih) = 2024
        GROUP BY i.il_id, i.il_ad, i.orman_varligi
      `);
      
      console.log(`✅ 2024 harita verisi: ${rows.length} il`);
      return res.json(rows);
    } else {
      const [rows] = await db.query(`
        SELECT 
          i.il_id,
          i.il_ad,
          i.orman_varligi,
          NULL AS max_risk_puani,
          NULL AS risk_tarihi,
          0 AS yangin_var
        FROM iller i
      `);
      
      console.log(`✅ ${yil} harita verisi: ${rows.length} il`);
      return res.json(rows);
    }
    
  } catch (err) {
    console.error("❌ Harita sorgusu hatası:", err);
    res.status(500).json({ 
      error: 'Harita verisi yüklenirken hata oluştu',
      message: err.message
    });
  }
};