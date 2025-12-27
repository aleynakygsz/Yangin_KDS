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

let yanginSayisiChart, kaybedilenAlanChart;

document.addEventListener('DOMContentLoaded', function() {
    loadIller();
    document.getElementById('il1Secim').addEventListener('change', loadData);
    document.getElementById('il2Secim').addEventListener('change', loadData);
});

async function loadIller() {
    try {
        const response = await fetch(`${API_URL}/il-analiz/iller`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const iller = await response.json();
        
        console.log('✅ İller yüklendi:', iller);
        
        // Eğer array değilse, hata ver
        if (!Array.isArray(iller)) {
            console.error('❌ İller array değil:', iller);
            alert('İller yüklenirken hata oluştu! Console\'u kontrol edin.');
            return;
        }
        
        const il1Select = document.getElementById('il1Secim');
        const il2Select = document.getElementById('il2Secim');
        
        iller.forEach(il => {
            const opt1 = document.createElement('option');
            opt1.value = il.il_id;
            opt1.textContent = il.il_ad;
            il1Select.appendChild(opt1);
            
            const opt2 = document.createElement('option');
            opt2.value = il.il_id;
            opt2.textContent = il.il_ad;
            il2Select.appendChild(opt2);
        });
        
        console.log(`✅ ${iller.length} il yüklendi`);
    } catch (error) {
        console.error('❌ İller yükleme hatası:', error);
        alert('İller yüklenemedi! Sunucu çalışıyor mu?');
    }
}

// il_analiz.js dosyasındaki loadData fonksiyonunu bununla değiştirin:

async function loadData() {
    const il_id_1 = document.getElementById('il1Secim').value;
    const il_id_2 = document.getElementById('il2Secim').value;
    
    console.log('Seçilen değerler:', { il_id_1, il_id_2 });
    
    // Eğer 1. İl seçili değilse işlem yapma
    if (!il_id_1) {
        console.warn('İl 1 seçilmedi, grafikler temizleniyor...');
        // İsterseniz burada grafik destroy işlemleri yapabilirsiniz
        return;
    }

    // EKSİK OLAN KISIM BURASIYDI: Fonksiyonları çağırıyoruz
    console.log("Grafik verileri çekiliyor...");
    
    // 1. Yangın Sayısı Grafiğini Yükle
    await loadYanginSayisi(il_id_1, il_id_2);

    // 2. Kaybedilen Alan Grafiğini Yükle
    await loadKaybedilenAlan(il_id_1, il_id_2);
}

// Yangın Sayısı (Karşılaştırmalı Line)
async function loadYanginSayisi(il_id_1, il_id_2) {
    try {
        const url = `${API_URL}/il-analiz/yillara-gore-yangin?il_id_1=${il_id_1}&il_id_2=${il_id_2}`;
        console.log('Yangın Sayısı URL:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Yangın Sayısı Data:', data);
        
        const ctx = document.getElementById('yanginSayisiChart').getContext('2d');
        
        if (yanginSayisiChart) yanginSayisiChart.destroy();
        
        const datasets = [{
            label: 'İl 1',
            data: data.il_1.map(d => d.yangin_sayisi),
            borderColor: '#f83030ff',
            backgroundColor: 'rgba(174, 39, 39, 0.4)',
            tension: 0.4,
            fill: true
        }];
        
        // İl 2 varsa ekle
        if (data.il_2 && data.il_2.length > 0) {
            datasets.push({
                label: 'İl 2',
                data: data.il_2.map(d => d.yangin_sayisi),
                borderColor: '#23e05cff',
                backgroundColor: 'rgba(23, 150, 86, 0.4)',
                tension: 0.4,
                fill: true
            });
        }
        
        yanginSayisiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.il_1.map(d => d.yil),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch (error) {
        console.error('Yangın sayısı hatası:', error);
    }
}

// Kaybedilen Alan (Karşılaştırmalı Line)
async function loadKaybedilenAlan(il_id_1, il_id_2) {
    try {
        const url = `${API_URL}/il-analiz/yillara-gore-alan?il_id_1=${il_id_1}&il_id_2=${il_id_2}`;
        console.log('Kaybedilen Alan URL:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Kaybedilen Alan Data:', data);
        
        const ctx = document.getElementById('kaybedilenAlanChart').getContext('2d');
        
        if (kaybedilenAlanChart) kaybedilenAlanChart.destroy();
        
        const datasets = [{
            label: 'İl 1 (ha)',
            data: data.il_1.map(d => d.kaybedilen_alan),
            borderColor: '#f83030ff',
            backgroundColor: 'rgba(174, 39, 39, 0.4)',
            tension: 0.4,
            fill: true
        }];
        
        // İl 2 varsa ekle
        if (data.il_2 && data.il_2.length > 0) {
            datasets.push({
                label: 'İl 2 (ha)',
                data: data.il_2.map(d => d.kaybedilen_alan),
                borderColor: '#23e05cff',
                backgroundColor: 'rgba(23, 150, 86, 0.4)',
                tension: 0.4,
                fill: true
            });
        }
        
        kaybedilenAlanChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.il_1.map(d => d.yil),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    } catch (error) {
        console.error('Kaybedilen alan hatası:', error);
    }
}

