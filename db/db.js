require('dotenv').config();
const mysql = require('mysql2');

// Veritabanı bağlantı havuzu
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kds_proje',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Promise tabanlı kullanım
const promisePool = pool.promise();

// Bağlantı testi
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Veritabanı bağlantı hatası:', err.message);
  } else {
    console.log('✅ Veritabanı bağlantısı başarılı!');
    
    // Test sorgusu
    connection.query('SELECT COUNT(*) as count FROM iller', (error, results) => {
      if (error) {
        console.error('❌ Test sorgusu hatası:', error.message);
      } else {
        console.log(`✅ Veritabanında ${results[0].count} il bulundu`);
      }
    });
    
    connection.release();
  }
});

module.exports = promisePool;