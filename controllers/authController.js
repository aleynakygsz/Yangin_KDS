const db = require('../db/db');

// Giriş yap
exports.girisYap = async (req, res) => {
  try {
    const { email, sifre } = req.body;
    
    console.log('📍 Giriş denemesi:', email);
    
    if (!email || !sifre) {
      return res.status(400).json({ 
        success: false, 
        message: 'E-posta ve şifre gereklidir!' 
      });
    }
    
    // Kullanıcıyı bul
    const [kullanicilar] = await db.query(
      'SELECT * FROM kullanicilar WHERE email = ? AND sifre = ?',
      [email, sifre]
    );
    
    if (kullanicilar.length === 0) {
      console.log('❌ Geçersiz giriş:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'E-posta veya şifre hatalı!' 
      });
    }
    
    const kullanici = kullanicilar[0];
    
    console.log('✅ Başarılı giriş:', kullanici.ad);
    
    // Şifreyi response'dan çıkar
    delete kullanici.sifre;
    
    res.json({
      success: true,
      message: 'Giriş başarılı!',
      kullanici: {
        id: kullanici.kullanici_id,
        ad: kullanici.ad,
        email: kullanici.email,
        rol: kullanici.rol
      }
    });
    
  } catch (error) {
    console.error('❌ Giriş hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası!',
      error: error.message 
    });
  }
};

// Çıkış yap
exports.cikisYap = (req, res) => {
  res.json({ 
    success: true, 
    message: 'Çıkış başarılı!' 
  });
};