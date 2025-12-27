require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static dosyalar
app.use(express.static('public'));

// Routes
const yanginRoutes = require('./routes/yanginRoutes');
const ilAnalizRoutes = require('./routes/ilAnalizRoutes');
const istasyonRoutes = require('./routes/istasyonRoutes');
const authRoutes = require('./routes/authRoutes');

// API rotaları
app.use('/api/yangin', yanginRoutes);
app.use('/api/il-analiz', ilAnalizRoutes);
app.use('/api/istasyon', istasyonRoutes);
app.use('/api/auth', authRoutes);

// Sayfa rotaları
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'yangin.html'));
});

app.get('/yangin-analiz', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'yangin.html'));
});

app.get('/il-analiz', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'il_analiz.html'));
});

app.get('/istasyon-analiz', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'istasyon.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// 404 hatası
app.use((req, res) => {
  res.status(404).json({ error: 'Sayfa bulunamadı' });
});

// Hata yakalama
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err.stack);
  res.status(500).json({ error: 'Sunucu hatası', message: err.message });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});

module.exports = app;