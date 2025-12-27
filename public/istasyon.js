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

const API_URL = 'http://localhost:3000/api';

let yillikMudahaleChart, ortalamaAlanChart, mudahaleTipiChart;

document.addEventListener('DOMContentLoaded', function() {
    loadIller();
    document.getElementById('ilSecim').addEventListener('change', loadData);
});

async function loadIller() {
    try {
        const response = await fetch(`${API_URL}/istasyon/iller`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const iller = await response.json();
        
        console.log('✅ İller yüklendi:', iller);
        
        if (!Array.isArray(iller)) {
            console.error('❌ İller array değil:', iller);
            alert('İller yüklenirken hata oluştu! Console\'u kontrol edin.');
            return;
        }
        
        const select = document.getElementById('ilSecim');
        iller.forEach(il => {
            const option = document.createElement('option');
            option.value = il.il_id;
            option.textContent = il.il_ad;
            select.appendChild(option);
        });
        
        console.log(`✅ ${iller.length} il yüklendi`);
    } catch (error) {
        console.error('❌ İller hatası:', error);
        alert('İller yüklenemedi! Sunucu çalışıyor mu?');
    }
}

async function loadData() {
    const il_id = document.getElementById('ilSecim').value;
    
    if (!il_id) {
        alert('Lütfen bir il seçin!');
        return;
    }
    
    await Promise.all([
        loadYillikMudahale(il_id),
        loadOrtalamaAlanKaybi(il_id),
        loadMudahaleTipiDagilim(il_id)
    ]);
}

// 1. Yıllık Müdahale Sayısı (Grouped Bar Chart)
async function loadYillikMudahale(il_id) {
    try {
        const response = await fetch(`${API_URL}/istasyon/yillik-mudahale?il_id=${il_id}`);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            console.warn('Yıllık müdahale verisi yok');
            return;
        }
        
        const ctx = document.getElementById('yillikMudahaleChart').getContext('2d');
        
        if (yillikMudahaleChart) yillikMudahaleChart.destroy();
        
        // İstasyonları ve yılları grupla
        const istasyonlar = [...new Set(data.map(d => d.istasyon_adi))];
        const yillar = [...new Set(data.map(d => d.yil))].filter(y => y).sort();
        
        const renkler = ['#e74c3c', '#3498db', '#f39c12', '#27ae60', '#9b59b6'];
        
        const datasets = yillar.map((yil, index) => ({
            label: yil.toString(),
            data: istasyonlar.map(istasyon => {
                const item = data.find(d => d.istasyon_adi === istasyon && d.yil === yil);
                return item ? item.mudahale_sayisi : 0;
            }),
            backgroundColor: renkler[index % renkler.length]
        }));
        
        yillikMudahaleChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: istasyonlar,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Yıllara göre müdahale sayıları'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Müdahale Sayısı'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'İstasyonlar'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Yıllık müdahale hatası:', error);
    }
}

// 2. Ortalama Alan Kaybı (Bar Chart)
async function loadOrtalamaAlanKaybi(il_id) {
    try {
        const response = await fetch(`${API_URL}/istasyon/ortalama-alan-kaybi?il_id=${il_id}`);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            console.warn('Ortalama alan kaybı verisi yok');
            return;
        }
        
        const ctx = document.getElementById('ortalamaAlanChart').getContext('2d');
        
        if (ortalamaAlanChart) ortalamaAlanChart.destroy();
        
        ortalamaAlanChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.istasyon_adi),
                datasets: [{
                    label: 'Ortalama Alan Kaybı (ha)',
                    data: data.map(d => d.ortalama_alan_kaybi),
                    backgroundColor: '#e67e22'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const index = context.dataIndex;
                                return `Toplam Müdahale: ${data[index].mudahale_sayisi}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ortalama Alan Kaybı (ha)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'İstasyonlar'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Ortalama alan kaybı hatası:', error);
    }
}

// 3. Müdahale Tipi Dağılımı (Stacked Bar Chart)
async function loadMudahaleTipiDagilim(il_id) {
    try {
        const response = await fetch(`${API_URL}/istasyon/mudahale-tipi-dagilim?il_id=${il_id}`);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            console.warn('Müdahale tipi dağılımı verisi yok');
            return;
        }
        
        const ctx = document.getElementById('mudahaleTipiChart').getContext('2d');
        
        if (mudahaleTipiChart) mudahaleTipiChart.destroy();
        
        mudahaleTipiChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.istasyon_adi),
                datasets: [
                    {
                        label: 'Asıl Müdahale',
                        data: data.map(d => d.asil_mudahale),
                        backgroundColor: '#ec4899' // Pembe
                    },
                    {
                        label: 'Destek Müdahale',
                        data: data.map(d => d.destek_mudahale),
                        backgroundColor: '#fbbf24' // Sarı
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Asıl Müdahale: İlk Müdahale, Su İkmal, Arazöz | Destek: Hava Destek, Arazöz Destek'
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: true,
                            text: 'İstasyonlar'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Müdahale Sayısı'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Müdahale tipi dağılımı hatası:', error);
    }
}