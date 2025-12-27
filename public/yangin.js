// Oturum kontrolü
if (!sessionStorage.getItem('kullanici')) {
    window.location.href = '/login.html';
}

// Çıkış fonksiyonu
function cikisYap() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        sessionStorage.removeItem('kullanici');
        window.location.href = '/login.html';
    }
}

const API_URL = 'http://localhost:3000/api/yangin';

/* GLOBAL*/
let turkiyeGeoJSON = null;
let map = null;
let geojsonLayer = null;
let chartInstances = {};

/* GEOJSON YÜKLE*/
fetch('/data/turkiye.json')
  .then(res => res.json())
  .then(json => {
    turkiyeGeoJSON = json;
    loadMap();
  })
  .catch(err => console.error('❌ GeoJSON yüklenemedi:', err));

/* DOM READY */
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  document.getElementById('yilSecim').addEventListener('change', () => {
    loadData();
    loadMap();
  });
});

/* =========================
   ANA DATA
========================= */
async function loadData() {
  const yil = document.getElementById('yilSecim').value;

  await Promise.all([
    loadKPIs(yil),
    loadTrendChart(),
    loadNedenChart(yil),
    loadTopIllerChart(yil),
    loadAlanChart()
  ]);
}

/* =========================
   KPI
========================= */
async function loadKPIs(yil) {
  const res = await fetch(`${API_URL}/yillik-ozet?yil=${yil}`);
  const data = await res.json();

  document.getElementById('toplamYangin').innerText = data.toplam_yangin;
  document.getElementById('kaybedilenAlan').innerText =
    Number(data.kaybedilen_alan || 0).toLocaleString();
  document.getElementById('enRiskliIl').innerText = data.en_riskli_il || '-';
}

/* =========================
   GRAFİKLER
========================= */
async function loadTrendChart() {
  const res = await fetch(`${API_URL}/yillik-trend`);
  const data = await res.json();

  createChart(
    'yanginTrendChart',
    'line',
    data.map(d => d.yil),
    data.map(d => d.yangin_sayisi),
    'Yangın Sayısı',
    '#e74c3c'
  );
}

async function loadNedenChart(yil) {
  const res = await fetch(`${API_URL}/neden-dagilimi?yil=${yil}`);
  const data = await res.json();

  const ctx = document.getElementById('nedenChart').getContext('2d');
  if (chartInstances.neden) chartInstances.neden.destroy();

  chartInstances.neden = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(d => d.neden || 'Belirsiz'),
      datasets: [{
        data: data.map(d => d.sayi),
        backgroundColor: [
          '#eb1982',
          '#3498db',
          '#f1c40f',
          '#9b59b6',
          '#2ecc71',
          '#95a5a6'
        ]
      }]
    },
    options: { responsive: true }
  });
}

async function loadTopIllerChart(yil) {
  const res = await fetch(`${API_URL}/en-cok-yanan-iller?yil=${yil}`);
  const data = await res.json();

  const ctx = document.getElementById('topIllerChart').getContext('2d');
  if (chartInstances.topIller) chartInstances.topIller.destroy();

  chartInstances.topIller = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.il_ad),
      datasets: [{
        label: 'Yangın Sayısı',
        data: data.map(d => d.yangin_sayisi),
        backgroundColor: '#fd7e14'
      }]
    },
    options: { responsive: true }
  });
}

async function loadAlanChart() {
  const res = await fetch(`${API_URL}/alan-trendi`);
  const data = await res.json();

  createChart(
    'alanTrendChart',
    'line',
    data.map(d => d.yil),
    data.map(d => d.alan),
    'Alan (ha)',
    '#28a745'
  );
}

/* =========================
   CHART HELPER
========================= */
function createChart(id, type, labels, data, label, color) {
  const ctx = document.getElementById(id).getContext('2d');
  if (chartInstances[id]) chartInstances[id].destroy();

  chartInstances[id] = new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: color,
        tension: 0.4,
        fill: false
      }]
    },
    options: { responsive: true }
  });
}

/* =========================
   SADECE TÜRKİYE HARİTASI
========================= */
async function loadMap() {
  if (!turkiyeGeoJSON) {
    console.warn('⚠️ GeoJSON henüz yüklenmedi');
    return;
  }

  const yil = document.getElementById('yilSecim').value;
  
  try {
    const res = await fetch(`${API_URL}/harita-risk?yil=${yil}`);
    const ilVerileri = await res.json();
    
    console.log('✅ Harita API yanıtı:', ilVerileri);
    console.log('✅ Array mi?', Array.isArray(ilVerileri));

    // Eğer obje döndüyse, hata mesajı göster
    if (!Array.isArray(ilVerileri)) {
      console.error('❌ API array döndürmedi:', ilVerileri);
      alert('Harita verisi yüklenemedi! Console kontrol edin.');
      return;
    }

    if (!map) {
      map = L.map('turkiyeMap', {
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: false
      }).setView([39, 35], 6);
    }

    if (geojsonLayer) geojsonLayer.remove();

    geojsonLayer = L.geoJSON(turkiyeGeoJSON, {
      style: feature => {
        const ilAdi = feature.properties.name;
        const ilData = ilVerileri.find(
          il => normalizeIlAdi(il.il_ad) === normalizeIlAdi(ilAdi)
        );

        return {
          fillColor: ilData ? getOrmanRenk(ilData.orman_varligi) : '#e0e0e0',
          weight: 1.5,
          color: '#ffffff',
          fillOpacity: 0.8
        };
      },
      onEachFeature: (feature, layer) => {
        const ilAdi = feature.properties.name;
        const ilData = ilVerileri.find(
          il => normalizeIlAdi(il.il_ad) === normalizeIlAdi(ilAdi)
        );

        if (ilData) {
          // Her yıl orman varlığı göster
          let tooltipHTML = `<strong>${ilData.il_ad}</strong><br>🌲 Orman: ${Number(ilData.orman_varligi || 0).toLocaleString()} ha`;
          
          // Sadece 2024 için risk puanı göster
          if (yil === '2024' && ilData.max_risk_puani) {
            tooltipHTML += `<br>⚠️ Max Risk: ${Number(ilData.max_risk_puani).toFixed(2)}`;
            tooltipHTML += `<br>🔥 Yangın: ${ilData.yangin_var ? 'VAR ✅' : 'YOK ❌'}`;
          }
          
          layer.bindTooltip(tooltipHTML, { 
            sticky: true,
            className: 'harita-tooltip'
          });
        }

        // Hover efekti
        layer.on({
          mouseover: function(e) {
            const layer = e.target;
            layer.setStyle({
              weight: 3,
              color: '#667eea',
              fillOpacity: 1
            });
          },
          mouseout: function(e) {
            geojsonLayer.resetStyle(e.target);
          }
        });
      }
    }).addTo(map);

    // Harita sınırlarını Türkiye'ye ayarla
    map.fitBounds(geojsonLayer.getBounds());
    
  } catch (err) {
    console.error('❌ Harita yükleme hatası:', err);
  }
}

// Orman varlığına göre renk (Açıktan koyuya yeşil)
function getOrmanRenk(ormanVarligi) {
  if (!ormanVarligi || ormanVarligi === 0) return '#f5f5f5';
  
  // En büyük orman varlığına göre normalize et
  const maxOrman = 1000000; // Yaklaşık en büyük değer
  const normalized = Math.min(ormanVarligi / maxOrman, 1);
  
  // Açık yeşilden koyu yeşile geçiş
  if (normalized > 0.7) return '#00441b'; // Çok koyu yeşil
  if (normalized > 0.5) return '#1b7837'; // Koyu yeşil
  if (normalized > 0.3) return '#5aae61'; // Orta yeşil
  if (normalized > 0.1) return '#a6dba0'; // Açık yeşil
  return '#d9f0d3'; // Çok açık yeşil
}

/* =========================
   YARDIMCI FONKSİYONLAR
========================= */

// İl adı normalize et (Türkçe karakterler için)
function normalizeIlAdi(str) {
  if (!str) return '';
  
  return str.toString() // String'e çevirmeyi garantiye alalım
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i') // Büyük İ'yi de ekledim
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '') // Boşlukları sil
    .trim();
}